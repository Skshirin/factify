import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  Image,
  Upload,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Camera,
} from "lucide-react";

interface ImageScanProps {
  onBack: () => void;
}

export function ImageScan({ onBack }: ImageScanProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setFileObj(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleScan = async () => {
    if (!fileObj) return;

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("image", fileObj);

      const response = await fetch("http://127.0.0.1:5000/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const fake = data.fake_percentage || 0;
      const real = data.real_percentage || 0;

      setResult({
        verdict: fake > real ? "MISINFORMATION" : "VERIFIED",
        confidence: Math.round(fake > real ? fake : real),
        isFake: fake > real,
        analysis: {
          sourceCredibility: fake > real ? "Low" : "High",
          languagePatterns:
            fake > real ? "Emotional/Sensational" : "Factual/Neutral",
          factualClaims: fake > real ? "Unverified" : "Cross-referenced",
          biasScore: fake > real ? "High" : "Low",
        },
        hateSpeech: data.hate_speech || null,
      });
    } catch (err) {
      console.error("Error analyzing image:", err);
      alert("Something went wrong while analyzing. Check backend connection.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setUploadedImage(null);
    setFileObj(null);
    setIsScanning(false);
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
            <Image className="w-8 h-8 text-cyan-400 mr-3" />
            <h1
              className="text-3xl font-bold text-cyan-400"
              style={{ fontFamily: "Lexend Deca, sans-serif" }}
            >
              IMAGE VERIFICATION
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
              <Camera className="w-6 h-6 text-cyan-400 mr-3" />
              <span
                className="text-cyan-400 uppercase tracking-wider font-medium"
                style={{ fontFamily: "Lexend Deca, sans-serif" }}
              >
                Visual Authenticity Scanner
              </span>
            </div>

            {/* Upload or Results */}
            {!result ? (
              <div className="space-y-6">
                {/* Upload Area */}
                {!uploadedImage ? (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                      ${
                        dragActive
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-cyan-400/30 hover:border-cyan-400/50"
                      }
                    `}
                  >
                    <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Upload Image for Analysis
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Drag and drop an image here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-6 py-3 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors duration-300 cursor-pointer font-medium"
                    >
                      Select Image
                    </label>
                    <div className="text-sm text-gray-500 mt-4">
                      Supports: JPG, PNG, GIF, WebP (Max 10MB)
                    </div>
                  </div>
                ) : (
                  /* Image Preview */
                  <div className="space-y-4">
                    <div className="border border-cyan-400/30 rounded-xl p-4 glow-cyan">
                      <img
                        src={uploadedImage}
                        alt="Uploaded for analysis"
                        className="w-full h-64 object-contain rounded-lg bg-gray-800"
                      />
                    </div>

                    {/* Analysis Info */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <div className="text-cyan-400 font-bold mb-1">
                          Deepfake Detection
                        </div>
                        <div className="text-gray-400">
                          AI-Generated Content
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <div className="text-cyan-400 font-bold mb-1">
                          Pixel Analysis
                        </div>
                        <div className="text-gray-400">
                          Compression Patterns
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <div className="text-cyan-400 font-bold mb-1">
                          Metadata Check
                        </div>
                        <div className="text-gray-400">
                          EXIF Data Verification
                        </div>
                      </div>
                    </div>

                    {/* Scan Button */}
                    <div className="text-center">
                      <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className={`
                          px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden
                          ${
                            isScanning
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-cyan-400 text-black hover:bg-cyan-300 cursor-pointer glow-cyan"
                          }
                        `}
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
                            ANALYZING IMAGE...
                          </div>
                        ) : (
                          "VERIFY AUTHENTICITY"
                        )}
                      </button>
                    </div>
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
                {/* Image Preview */}
                <div className="border border-cyan-400/30 rounded-xl p-4">
                  <img
                    src={uploadedImage!}
                    alt="Analyzed image"
                    className="w-full h-48 object-contain rounded-lg bg-gray-800"
                  />
                </div>

                {/* Main Result */}
                <div
                  className={`
                  p-6 rounded-xl border-2 text-center
                  ${
                    result.isManipulated
                      ? "bg-red-900/20 border-red-500"
                      : "bg-green-900/20 border-green-500"
                  }
                `}
                >
                  <div className="flex items-center justify-center mb-4">
                    {result.isManipulated ? (
                      <AlertTriangle className="w-12 h-12 text-red-400 mr-4" />
                    ) : (
                      <CheckCircle className="w-12 h-12 text-green-400 mr-4" />
                    )}
                    <div>
                      <h3
                        className={`text-2xl font-bold uppercase ${
                          result.isManipulated
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                        style={{ fontFamily: "Lexend Deca, sans-serif" }}
                      >
                        {result.verdict}
                      </h3>
                      <p className="text-sm opacity-80">
                        Confidence: {result.confidence}%
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
                          result.isManipulated ? "bg-red-500" : "bg-green-500"
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

                {/* Hate Speech Analysis */}
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
