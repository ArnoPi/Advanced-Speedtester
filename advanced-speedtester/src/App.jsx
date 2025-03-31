import React, { useState, useRef, useEffect } from "react";
import { CircularProgress, Button  } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import NetworkPingIcon from "@mui/icons-material/NetworkPing";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/system";


const GradientButton = styled(Button)({
  background: "linear-gradient(90deg, #5b37ff 0%, #3b82f6 100%)",
  color: "white",
  padding: "12px 32px",
  borderRadius: "24px",
  fontSize: "18px",
  fontWeight: "600",
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(91, 55, 255, 0.3)",
  "&:hover": {
    background: "linear-gradient(90deg, #4a2be8 0%, #2563eb 100%)",
  },
});

const TestCard = styled("div")({
  background: "rgba(31, 41, 55, 0.7)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  transition: "all 0.3s ease",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
});

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  const testSpeed = async () => {
    setIsTesting(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);

    // Ping test
    setActiveTest("ping");
    try {
      const pingStart = performance.now();
      await fetch("https://httpbin.org/get", { cache: "no-store" });
      const pingEnd = performance.now();
      setPing(Math.round(pingEnd - pingStart));
    } catch (error) {
      setPing("Error");
    }

    // Download test
    setActiveTest("download");
    const downloadEndpoints = [
      "https://eu.httpbin.org/stream-bytes/104857600",
      "https://speed.hetzner.de/100MB.bin",
      "https://proof.ovh.net/files/100Mb.dat"
    ];
  
    for (const endpoint of downloadEndpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) continue;
        
        const reader = response.body.getReader();
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
        
        const endTime = performance.now();
        const speedMbps = ((100 * 8) / ((endTime - startTime) / 1000)).toFixed(2);
        setDownloadSpeed(speedMbps);
        break;
      } catch (error) {
        console.error("Download test failed for ${endpoint}:, error");
        if (endpoint === downloadEndpoints[downloadEndpoints.length - 1]) {
          setDownloadSpeed("Error");
        }
      }
      setActiveTest(null);
    }

    // Upload test
      setActiveTest("upload");
    
      try {
        const fileSize = 5 * 1024 * 1024;
        const uploadData = new Uint8Array(fileSize);
        let totalTime = 0;
        const testRuns = 3;
    
        for (let i = 0; i < testRuns; i++) {
          const startTime = performance.now();
    
          await fetch("https://httpbin.org/post", {
            method: "POST",
            body: uploadData,
            headers: { "Content-Type": "application/octet-stream" },
          });
    
          const endTime = performance.now();
          totalTime += endTime - startTime;
        }
    
        const avgTime = totalTime / testRuns;
        const speedMbps = ((fileSize * 8) / (avgTime / 1000) / 1e6).toFixed(2);
    
        setUploadSpeed(speedMbps);
      } catch (error) {
        setUploadSpeed("Error");
      }
    
      setActiveTest(null);
      setIsTesting(false);
  };    

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Internet Speed Test
        </h1>
        
        <p className="text-gray-400 text-lg mb-8">
          Check your internet speed with our advanced tool
        </p>

        <GradientButton
          onClick={testSpeed}
          disabled={isTesting}
          startIcon={<SpeedIcon />}
          className="text-lg py-3 px-6"
        >
          {isTesting ? "Testing..." : "Start Test"}
        </GradientButton>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          <TestCard isActive={activeTest === "ping"}>
            <NetworkPingIcon className="text-purple-400 text-5xl" />
            <h3 className="text-gray-200 text-xl mt-4">Ping</h3>
            {ping !== null ? (
              <div className="text-purple-400 text-3xl font-bold">{ping} <span className="text-gray-400 text-base">ms</span></div>
            ) : (
              <CircularProgress className="text-purple-400" size={50} />
            )}
          </TestCard>

          <TestCard isActive={activeTest === "download"}>
            <CloudDownloadIcon className="text-blue-400 text-5xl" />
            <h3 className="text-gray-200 text-xl mt-4">Download</h3>
            {downloadSpeed !== null ? (
              <div className="text-blue-400 text-3xl font-bold">{downloadSpeed} <span className="text-gray-400 text-base">Mbps</span></div>
            ) : (
              <CircularProgress className="text-blue-400" size={50} />
            )}
          </TestCard>

          <TestCard isActive={activeTest === "upload"}>
            <CloudUploadIcon className="text-green-400 text-5xl" />
            <h3 className="text-gray-200 text-xl mt-4">Upload</h3>
            {uploadSpeed !== null ? (
              <div className="text-green-400 text-3xl font-bold">{uploadSpeed} <span className="text-gray-400 text-base">Mbps</span></div>
            ) : (
              <CircularProgress className="text-green-400" size={50} />
            )}
          </TestCard>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;
