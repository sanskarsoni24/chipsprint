import React from "react";

export default function CostMeter({ cpuMinutes, s3GB }) {
  return (
    <div className="bg-gray-100 p-2 rounded mb-2">
      <div className="text-xs">CPU minutes used: <b>{cpuMinutes}</b></div>
      <div className="text-xs">S3 storage used: <b>{s3GB} GB</b></div>
    </div>
  );
}