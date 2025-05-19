import React, { useState } from "react";
import UploadWidget from "./UploadWidget";
import HeatmapViewer from "./HeatmapViewer";
import { getJobStatus } from "../api";

export default function Dashboard({ token, onLogout }) {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [violationData, setViolationData] = useState(null);
  const [defFile, setDefFile] = useState(null);
  const [fixUrl, setFixUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Poll job status
  React.useEffect(() => {
    if (!jobId) return;
    setStatus("QUEUED");
    setErrorMsg("");
    const interval = setInterval(async () => {
      try {
        const { data } = await getJobStatus(jobId);
        setStatus(data.status);
        if (data.status === "DONE") {
          clearInterval(interval);
          setFixUrl(data.fix_url);
          // Fetch violation data
          fetch(data.violations_url)
            .then(res => res.json())
            .then(json => setViolationData(json));
        } else if (data.status === "ERROR") {
          clearInterval(interval);
          setErrorMsg(data.error_msg || "Job failed");
        }
      } catch (err) {
        setErrorMsg("Failed to fetch job status");
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="w-full max-w-3xl bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Logged in</span>
        <button onClick={onLogout} className="text-sm text-red-500">Logout</button>
      </div>
      <UploadWidget
        onUploadStart={() => {
          setJobId(null);
          setStatus(null);
          setViolationData(null);
          setFixUrl(null);
          setErrorMsg("");
        }}
        onUploadComplete={({ job_id, defFile }) => {
          setJobId(job_id);
          setDefFile(defFile);
        }}
      />
      {jobId && (
        <div className="my-4">
          <div>Status: <span className="font-mono">{status}</span></div>
          {status === "DONE" && violationData && defFile && (
            <HeatmapViewer defFile={defFile} violations={violationData} />
          )}
          {fixUrl && (
            <a
              href={fixUrl}
              className="block mt-4 bg-green-500 text-white text-center py-2 rounded"
              download
            >
              Download ECO Script
            </a>
          )}
          {errorMsg && <div className="text-red-500">{errorMsg}</div>}
        </div>
      )}
    </div>
  );
}