"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, FileText, AlertCircle, Loader2 } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    const formData = new FormData();
    formData.append("file", targetFile);

    try {
      const response = await fetch("/api/resumes/parse", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to analyze resume.");
      }

      onSuccess(result.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
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
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Upload failed</p>
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
              </div>
            </div>
          )}

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

              {file && (
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
