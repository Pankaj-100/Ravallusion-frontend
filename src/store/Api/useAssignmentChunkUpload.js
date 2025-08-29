import { useState } from "react";
import { toast } from "react-toastify";
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
export function useAssignmentChunkUpload() {
  const chunkSize = 50 * 1024 * 1024; // 50MB
  const [progress, setProgress] = useState(0);

  const startUpload = async (file) => {
    try {
      // 1. Start upload session
      const initRes = await fetch(`/api/v1/video/stream/start-upload`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, fileType: "submitted_assignments" }),
      });
      if (!initRes.ok) throw new Error("Failed to start upload");
      const { fileName, UploadId } = await initRes.json();

      // 2. Upload chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedBytes = 0;
      const uploadedParts = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("uploadId", UploadId);
        formData.append("partNumber", String(partNumber));
        formData.append("fileName", fileName);
        formData.append("fileType", "submitted_assignments");

        const chunkRes = await fetch(`/api/v1/video/stream/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!chunkRes.ok) throw new Error(`Chunk ${partNumber} upload failed`);
        const { ETag } = await chunkRes.json();
        uploadedParts.push({ ETag, PartNumber: partNumber });

        uploadedBytes += chunk.size;
        setProgress(Number(((uploadedBytes / file.size) * 100).toFixed(2)));
      }

      // 3. Complete upload
      const completeRes = await fetch(`/api/v1/video/stream/complete-upload`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: UploadId,
          fileName,
          parts: uploadedParts,
          fileType: "submitted_assignments",
        }),
      });
      if (!completeRes.ok) throw new Error("Failed to complete upload");
      const completeData = await completeRes.json();

      // Return file URL or fileName (adapt as per your backend response)
      return { fileUrl: completeData.url || fileName, fileName };
    } catch (error) {
      toast.error(error.message || "File upload failed");
      setProgress(0);
      return null;
    }
  };

  return { startUpload, progress, setProgress };
}