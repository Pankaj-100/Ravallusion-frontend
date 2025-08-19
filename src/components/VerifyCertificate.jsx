"use client";

import { useVerifyCertificateQuery } from "@/store/Api/course";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { SimpleLoader } from "./common/LoadingSpinner";
import { AlertCircle } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import useSmallScreen from "@/hooks/detectScreen";

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const VerifyCertificate = () => {
  const isMobile = useSmallScreen();
  const path = usePathname();
  const pathArray = path.split("/");
  const id = pathArray[pathArray.length - 1];

  const { data, isLoading } = useVerifyCertificateQuery(id);
  const pdfUrl = data?.data?.certificate;

  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [hasError, setHasError] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setHasError(false);
  }

  function onDocumentLoadError() {
    setHasError(true);
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center p-6">
      {isLoading ? (
        <SimpleLoader />
      ) : (
        <>
          {pdfUrl && !hasError ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex flex-col items-center bg-gray-100 rounded-lg p-4 shadow-lg"
            >
              <Page
                pageNumber={pageNumber}
                scale={isMobile ? 0.3 : 0.6}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-md w-78">
              <AlertCircle size={54} />
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">
                  Oops! Certificate Not Found
                </h2>
                <p className="text-base">
                  We couldn&apos;t load the certificate PDF. <br />
                  Please check the QR code or try again later.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerifyCertificate;
