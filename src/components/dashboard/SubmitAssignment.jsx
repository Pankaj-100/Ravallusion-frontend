'use client';
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAssignmentSubmitMutation, useGetAlreadyAssignmentSubmittedQuery } from "@/store/Api/course";
import { LoaderCircle } from "lucide-react";
import { useAssignmentChunkUpload } from "@/store/Api/useAssignmentChunkUpload";
import { CrossIcon, RoundCross, RoundCrossFill, RoundPause, UploadIcon } from '@/lib/svg_icons';

const SubmitAssignment = ({ setIsAssignmentOpen, videoId }) => {
  const [files, setFiles] = useState();
  const [filesUrl, setFilesUrl] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const fileInputRef = useRef(null);
  const [submitAssignment, { isLoading }] = useAssignmentSubmitMutation();
  const { data } = useGetAlreadyAssignmentSubmittedQuery(videoId);
  const alreadyAssignmentSubmitted = data?.data?.hasAlreadySubmitted;

  // Custom chunked upload hook
  const { startUpload, progress, setProgress } = useAssignmentChunkUpload();

  // Sync progress from hook to local state for display
  useEffect(() => {
    setUploadProgress(progress);
  }, [progress]);

  const selectedFile = async (event) => {
    let file;
    if (event.target && event.target.files) {
      file = event.target.files[0];
    } else if (event.dataTransfer && event.dataTransfer.files) {
      file = event.dataTransfer.files[0];
    }
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const result = await startUpload(file);

    if (result) {
      setFilesUrl(result.fileUrl);
      setFiles({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        url: result.fileUrl,
      });
    }
    setIsUploading(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    selectedFile(event);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const removeFile = () => {
    setFiles(null);
    setFilesUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitAssignment = async () => {
    if (!filesUrl) {
      toast.error("No files uploaded!");
      return;
    }
    if (alreadyAssignmentSubmitted) {
      toast.error("You have already submitted assignment for this video!");
      setIsAssignmentOpen(false);
      return;
    }
    try {
      const res = await submitAssignment({
        videoId,
        submittedFileUrl: filesUrl
      }).unwrap();
      if (res.success) {
        toast.success(res.message);
        setIsAssignmentOpen(false);
      }
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  return (
    <div className="p-6 bg-[#181F2B] w-full rounded-2xl ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg">Assignment submission</h1>
          <p className="text-xs text-gray-400">Add your documents here, and you can upload up to 5 files max</p>
        </div>
        <div onClick={() => setIsAssignmentOpen(false)} className='cursor-pointer'>
          <CrossIcon />
        </div>
      </div>

      <div className=" my-4 bg-[var(--Surface)] p-4 items-center flex justify-center border border-dashed border-[var(--neon-purple)] flex-col"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadIcon />
        <h1 className="text-lg mt-3">Drag your file(s) to start uploading</h1>
        <div className="flex items-center my-2 w-4/5">
          <div className="flex-1 relative h-4">
            <div className="absolute top-1/2 left-0 right-0 border-t border-transparent">
              <div className="h-px bg-gradient-to-l from-white via-gray-400 to-black"></div>
            </div>
          </div>
          <span className="mx-4 text-gray-300">OR</span>
          <div className="flex-1 relative h-4">
            <div className="absolute top-1/2 left-0 right-0 border-t border-transparent">
              <div className="h-px bg-gradient-to-r from-white via-gray-400 to-black"></div>
            </div>
          </div>
        </div>
        <Button variant={"neonOutline"} onClick={triggerFileInput}>
          Browse files
        </Button>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={selectedFile}
        />
      </div>
      <p className="text-sm">Only support .rar files</p>
      <h1 className="text-md font-semibold my-4">Uploaded Files</h1>
      {files ? (
        <FileToUpload
          filename={files.name}
          size={files.size}
          onRemove={() => removeFile()}
        />
      ) : (
        !isUploading &&
        <p className="text-sm text-gray-400">No files uploaded yet.</p>
      )}
      {isUploading && (
        <UploadingSimulation uploadProgress={uploadProgress} timeRemaining={timeRemaining} onRemove={removeFile} />
      )}
      <div className="flex items-center gap-x-4 justify-end mt-4">
        <Button variant="outline" className="hover:bg-gray-700 hover:text-white py-5" onClick={() => setIsAssignmentOpen(false)}>Cancel</Button>
        <Button className="bg-[var(--neon-purple)] hover:bg-blue-500 py-5" onClick={handleSubmitAssignment}>
          {isLoading ? <LoaderCircle className='animate-spin !h-7 !w-7' /> : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

const FileToUpload = ({ filename, size, onRemove }) => (
  <div className="p-4 flex items-center justify-between rounded-xl border border-gray-400 mb-2">
    <div className="flex items-center gap-x-2">
      <Image src={'/zip img.png'} alt="zip img" width={36} height={36} />
      <div>
        <p className="text-sm font-semibold">{filename}</p>
        <p className="text-[10px] text-gray-300">{size} MB</p>
      </div>
    </div>
    <button onClick={onRemove} className="text-red-500 hover:text-red-700">
      <RoundCross />
    </button>
  </div>
);

const UploadingSimulation = ({ uploadProgress, timeRemaining, onRemove }) => (
  <div className='p-4 flex items-center justify-between rounded-xl border border-gray-400'>
    <div className='w-[80%]'>
      <div>
        <p className='text-sm font-semibold'>Uploading...</p>
        <p className='text-[10px] text-gray-300'>{Number(uploadProgress.toFixed(0))}% 
          {/* • {timeRemaining}s remaining */}
           </p>
      </div>
      <div className="mt-3 w-full h-2 rounded-full bg-[#0D1117] relative overflow-hidden">
        <div
          style={{ width: `${uploadProgress}%` }}
          className={`h-full bg-[#2C68F6] rounded-full shadow-md transition-all duration-500`}></div>
      </div>
    </div>
    <div className='flex items-center gap-x-1 '>
      {/* <RoundPause /> */}
      <RoundCrossFill />
    </div>
  </div>
);

export default SubmitAssignment;