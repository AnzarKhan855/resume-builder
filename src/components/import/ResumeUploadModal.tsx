"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, UploadCloud, FileText, AlertCircle, Sparkles, RefreshCw, PenTool } from "lucide-react";
import { ResumeData } from "@/src/types/resume";

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (parsedData: ResumeData) => void;
}

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: ResumeUploadModalProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannedPdf, setIsScannedPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setError(null);
    setIsScannedPdf(false);

    const validExtensions = [".pdf", ".docx", ".doc"];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    setFile(selectedFile);
    uploadAndParse(selectedFile);
  };

  const uploadAndParse = async (targetFile: File) => {
    setIsUploading(true);
    setError(null);
    setIsScannedPdf(false);

    const formData = new FormData();
    formData.append("file", targetFile);

    try {
      const response = await fetch("/api/resumes/parse", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.isScanned || result.error === "PDF_SCANNED") {
          setIsScannedPdf(true);
          setError(
            result.message ||
              "This PDF appears to be an image scan or flattened graphical file without selectable text."
          );
          return;
        }

        let userMsg = result.message;
        if (result.error === "PDF_PASSWORD_PROTECTED") {
          userMsg = "This PDF is password-protected. Please remove the password and try again.";
        } else if (result.error === "PDF_CORRUPTED") {
          userMsg = "This PDF appears to be corrupted. Try opening and re-saving it before uploading.";
        } else if (result.error === "PDF_NO_TEXT") {
          userMsg = "No selectable text could be extracted from this PDF. Please upload a text-based resume.";
        } else if (result.error === "PDF_PARSE_FAILED") {
          userMsg = "We couldn't process this PDF. Please try another PDF or DOCX file.";
        } else if (result.error === "EMPTY_FILE") {
          userMsg = "The uploaded file is empty. Please upload a valid resume.";
        } else if (result.error === "FILE_TOO_LARGE") {
          userMsg = "File exceeds 5MB size limit. Please upload a smaller file.";
        } else if (result.error === "UNSUPPORTED_FILE_TYPE") {
          userMsg = "Unsupported file format. Please upload a PDF or DOCX file.";
        }

        throw new Error(userMsg || "Failed to analyze resume.");
      }

      onSuccess(result.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setError(null);
    setIsScannedPdf(false);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBuildFromScratch = () => {
    onClose();
    router.push("/editor/new");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> 2026 Production Parser
            </div>
            <h2 className="text-xl font-bold text-slate-900">Import Existing Resume</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload your PDF or DOCX resume to auto-fill your fields
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && isScannedPdf ? (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Image or Scanned PDF Detected</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">{error}</p>
                  <p className="text-xs text-amber-800 mt-2 font-medium">
                    Recommendation: Upload a text-selectable PDF/Word document, or create a clean ATS-friendly resume from scratch.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={resetUpload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 transition shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try Another File
                    </button>
                    <button
                      type="button"
                      onClick={handleBuildFromScratch}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition shadow-2xs"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Build From Scratch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Upload failed</p>
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
                <button
                  type="button"
                  onClick={resetUpload}
                  className="mt-2 text-xs font-semibold text-red-700 underline hover:no-underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry with another file
                </button>
              </div>
            </div>
          ) : null}

          {isUploading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin flex items-center justify-center" />
                <FileText className="w-7 h-7 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Analyzing your resume...
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Extracting contact details, career experience, education, and technical skills...
              </p>
            </div>
          ) : (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-base font-semibold text-slate-800 mb-1">
                  Drag & drop your resume here
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  or click to browse from your computer
                </p>
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  PDF or DOCX • Max size 5MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {file && !isScannedPdf && !error && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
                <span>✓ ATS-friendly extraction</span>
                <span>✓ Safe & private processing</span>
                <span>✓ 100% editable before saving</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
