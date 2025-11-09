import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  Video,
  Upload,
  Link,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Play,
} from "lucide-react";

interface VideoScanProps {
  onBack: () => void;
}

const steps = [
  "Uploading video / fetching URL",
  "Converting video to audio",
  "Transcribing audio",
  "Running detection",
  "Finished",
];

export function VideoScan({ onBack }: VideoScanProps) {
  const [scanMode, setScanMode] = useState<"upload" | "url">("upload");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0); // ✅ here
  const [result, setResult] = useState<any>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObj(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedVideo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!fileObj && !videoUrl.trim()) return;

    setIsScanning(true);
    setProgressStep(0);

    try {
      let response;

      // Step 0: Upload / fetch
      setProgressStep(0);
      if (scanMode === "upload" && fileObj) {
        const formData = new FormData();
        formData.append("video", fileObj);

        response = await fetch("http://127.0.0.1:5000/analyze-video", {
          method: "POST",
          body: formData,
        });
      } else if (scanMode === "url" && videoUrl.trim()) {
        response = await fetch("http://127.0.0.1:5000/analyze-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl }),
        });
      }
      setProgressStep(1);

      if (!response?.ok)
        throw new Error(`Backend error: ${response?.statusText}`);
      const data = await response?.json();
      setProgressStep(2);

      if (!data) throw new Error("No response from backend");

      const fake = data.fake_percentage || 0;
      const real = data.real_percentage || 0;

      setProgressStep(3);

      setResult({
        verdict: fake > real ? "MISINFORMATION" : "VERIFIED",
        confidence: Math.round(fake > real ? fake : real),
        isFake: fake > real,
        isDeepfake: fake > real,
        analysis: {
          transcription: data.text_snippet || "No transcript available",
          credibility: fake > real ? "Low" : "High",
          factualClaims: fake > real ? "Unverified" : "Cross-referenced",
          biasScore: fake > real ? "High" : "Low",
        },
        hateSpeech: data.hate_speech || null,
        metadata: data.metadata || {},
      });

      setProgressStep(4); // Finished
    } catch (err) {
      console.error("Error analyzing video:", err);
      alert("Something went wrong while analyzing video. Check backend logs.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setUploadedVideo(null);
    setVideoUrl("");
    setFileObj(null);
    setIsScanning(false);
    setProgressStep(0);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Video className="w-8 h-8 text-cyan-400 mr-3" />
            <h1
              className="text-3xl font-bold text-cyan-400"
              style={{ fontFamily: "Lexend Deca, sans-serif" }}
            >
              VIDEO SCAN
            </h1>
          </div>
        </motion.div>

        {/* Main Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/50 border border-cyan-400/30 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden"
        >
          {/* Scanning animation overlay */}
          {isScanning && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <Play className="w-6 h-6 text-cyan-400 mr-3" />
              <span
                className="text-cyan-400 uppercase tracking-wider font-medium"
                style={{ fontFamily: "Lexend Deca, sans-serif" }}
              >
                Advanced Detection System
              </span>
            </div>

            {!result ? (
              <div className="space-y-6">
                {/* Progress Steps */}
                {isScanning && (
                  <div className="mb-6">
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center mb-1">
                        <div
                          className={`w-4 h-4 rounded-full mr-2 ${
                            i <= progressStep ? "bg-cyan-400" : "bg-gray-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            i <= progressStep
                              ? "text-cyan-400"
                              : "text-gray-400"
                          }`}
                        >
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mode Selection */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setScanMode("upload")}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      scanMode === "upload"
                        ? "bg-cyan-400 text-black"
                        : "bg-gray-800 text-gray-400 hover:text-cyan-400"
                    }`}
                  >
                    Upload Video
                  </button>
                  <button
                    onClick={() => setScanMode("url")}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      scanMode === "url"
                        ? "bg-cyan-400 text-black"
                        : "bg-gray-800 text-gray-400 hover:text-cyan-400"
                    }`}
                  >
                    Video URL
                  </button>
                </div>

                {/* Upload / URL Interface */}
                {scanMode === "upload" ? (
                  !uploadedVideo ? (
                    <div className="border-2 border-dashed border-cyan-400/30 rounded-2xl p-12 text-center hover:border-cyan-400/50 transition-colors duration-300">
                      <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-cyan-400 mb-2">
                        Upload Video for Analysis
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Select a video file to analyze for fake content
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="inline-block px-6 py-3 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors duration-300 cursor-pointer font-medium"
                      >
                        Select Video
                      </label>
                      <div className="text-sm text-gray-500 mt-4">
                        Supports: MP4, AVI, MOV, WebM (Max 100MB)
                      </div>
                    </div>
                  ) : (
                    <div className="border border-cyan-400/30 rounded-xl p-4 glow-cyan">
                      <video
                        src={uploadedVideo}
                        controls
                        className="w-full h-64 rounded-lg bg-gray-800"
                      />
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <label className="block text-cyan-400 font-medium mb-2">
                      Enter Video URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or direct video URL"
                        className="w-full bg-black/50 border border-cyan-400/50 rounded-lg px-4 py-4 text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 text-lg"
                        style={{ fontFamily: "Lexend Deca, sans-serif" }}
                      />
                      <Link className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                )}

                {/* Scan Button */}
                {(uploadedVideo || videoUrl.trim()) && (
                  <div className="text-center">
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                        isScanning
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-cyan-400 text-black hover:bg-cyan-300 cursor-pointer glow-cyan"
                      }`}
                      style={{ fontFamily: "Lexend Deca, sans-serif" }}
                    >
                      {isScanning ? (
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mr-3"
                          />
                          {steps[progressStep]}...
                        </div>
                      ) : (
                        "DETECT DEEPFAKE"
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Results Display */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Video Metadata */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center text-cyan-400 mb-2">
                    <Video className="w-5 h-5 mr-2" />
                    <span className="font-medium">Video Metadata</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    {Object.entries(result.metadata).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-gray-500 capitalize">{key}</div>
                        <div className="text-gray-300">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verdict */}
                <div
                  className={`p-6 rounded-xl border-2 text-center ${
                    result.isFake
                      ? "bg-red-900/20 border-red-500"
                      : "bg-green-900/20 border-green-500"
                  }`}
                >
                  <div className="flex items-center justify-center mb-4">
                    {result.isFake ? (
                      <AlertTriangle className="w-12 h-12 text-red-400 mr-4" />
                    ) : (
                      <CheckCircle className="w-12 h-12 text-green-400 mr-4" />
                    )}
                    <div>
                      <h3
                        className={`text-2xl font-bold uppercase ${
                          result.isFake ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {result.verdict}
                      </h3>
                      <p className="text-sm opacity-80">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-full ${
                        result.isFake ? "bg-red-500" : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Deepfake Detection */}
                <div
                  className={`p-6 rounded-xl border-2 text-center ${
                    result.isDeepfake
                      ? "bg-red-900/20 border-red-500"
                      : "bg-green-900/20 border-green-500"
                  }`}
                >
                  <div className="flex items-center justify-center mb-4">
                    {result.isDeepfake ? (
                      <AlertTriangle className="w-12 h-12 text-red-400 mr-4" />
                    ) : (
                      <CheckCircle className="w-12 h-12 text-green-400 mr-4" />
                    )}
                    <div>
                      <h3
                        className={`text-2xl font-bold uppercase ${
                          result.isDeepfake ? "text-red-400" : "text-green-400"
                        }`}
                        style={{ fontFamily: "Lexend Deca, sans-serif" }}
                      >
                        {result.verdict}
                      </h3>
                      <p className="text-sm opacity-80">
                        Detection Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Trust Meter */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      <span className="font-medium">Authenticity Score</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          result.isDeepfake ? "bg-red-500" : "bg-green-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <div className="text-right mt-1 text-sm opacity-70">
                      {result.confidence}% Confidence
                    </div>
                  </div>
                </div>

                {/* Hate Speech */}
                {result.hateSpeech && (
                  <div className="p-6 rounded-xl border-2 bg-gray-800/50">
                    <h3 className="text-xl font-bold mb-4 text-cyan-400">
                      HATE SPEECH ANALYSIS
                    </h3>
                    {Object.entries(result.hateSpeech.scores).map(
                      ([label, score]) => {
                        const s = Number(score);
                        return (
                          <div key={label} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{label}</span>
                              <span>{Math.round(s * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                              <motion.div
                                className="h-full bg-cyan-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round(s * 100)}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* Detailed Analysis */}
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(result.analysis).map(([key, value]) => (
                    <div key={key} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-cyan-400 font-medium mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </div>
                      <div className="text-gray-300">{value as string}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetScan}
                    className="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-300"
                    style={{ fontFamily: "Lexend Deca, sans-serif" }}
                  >
                    NEW SCAN
                  </button>
                  <button
                    className="px-8 py-3 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-all duration-300"
                    style={{ fontFamily: "Lexend Deca, sans-serif" }}
                  >
                    SAVE REPORT
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
