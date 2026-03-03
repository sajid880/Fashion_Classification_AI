import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export function ImageUpload({ onUploadComplete, resetTrigger }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const CLOUDINARY_URL = import.meta.env.VITE_PUBLIC_CLOUDINARY_URL;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env
    .VITE_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 🔄 Reset from parent component
  useEffect(() => {
    setSelectedFile(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // clears input
    }
  }, [resetTrigger]);

  // 📌 File validation + preview
  const handleFileSelect = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) handleFileSelect(files[0]);
  };

  // ☁️ Upload to Cloudinary
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_URL, formData);

      if (response.status !== 200) throw new Error("Upload failed");

      const url = response.data.secure_url;
      toast.success("Image uploaded successfully!");

      // 🔥 Pass URL back to App.jsx
      if (onUploadComplete) onUploadComplete(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Clothing Image
        </h2>
        <p className="text-gray-600">
          Upload an image of clothing to get AI-powered classification
        </p>
      </div>

      {/* Dropzone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : selectedFile
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] && handleFileSelect(e.target.files[0])
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="space-y-4">
            {/* 🖼 Preview */}
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-xl mx-auto shadow-md"
              />
            )}

            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Drop your image here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Upload button */}
      {selectedFile && (
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              "Upload & Classify"
            )}
          </button>
        </div>
      )}
    </div>
  );
}