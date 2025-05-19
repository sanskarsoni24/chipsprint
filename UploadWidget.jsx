import React, { useRef, useState } from "react";
import { uploadZip } from "../api";

export default function UploadWidget({ onUploadStart, onUploadComplete }) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const handleDrop = async (e) => {
    e.preventDefault();
    setError("");
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    if (!file.name.endsWith(".zip")) {
      setError("Please upload a ZIP file.");
      return;
    }
    onUploadStart();
    setProgress(0);
    try {
      const reader = new window.FileReader();
      reader.onload = () => {
        // Try to find design.def for later parsing
        const JSZip = require("jszip");
        JSZip.loadAsync(file).then((zip) => {
          zip.file("design.def").async("blob").then((defBlob) => {
            onUploadComplete({ job_id: null, defFile: defBlob });
          });
        }).catch(() => {});
      };
      reader.readAsArrayBuffer(file);
      const { data } = await uploadZip(file, (e) => {
        setProgress(Math.round((e.loaded / e.total) * 100));
      });
      // Re-read def file for heatmap later
      const JSZip = require("jszip");
      JSZip.loadAsync(file).then((zip) => {
        zip.file("design.def").async("blob").then((defBlob) => {
          onUploadComplete({ job_id: data.job_id, defFile: defBlob });
        });
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    }
  };

  return (
    <div
      className="w-full border-2 border-dashed border-gray-300 rounded p-4 mb-4 text-center cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInput.current.click()}
    >
      <input
        ref={fileInput}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleChange}
      />
      <div>Drag & drop ZIP or click to select</div>
      {progress > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600">{progress}%</div>
        </div>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}