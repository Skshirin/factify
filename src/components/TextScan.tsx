import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Scan,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface TextScanProps {
  onBack: () => void;
}

export function TextScan({ onBack }: TextScanProps) {
  const [text, setText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!text.trim()) return;

    setIsScanning(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }), // ⬅️ fix: backend expects `text`, not `content`
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
      console.error("Error analyzing text:", err);
      alert("Something went wrong while analyzing. Check backend connection.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setText("");
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
            <FileText className="w-8 h-8 text-cyan-400 mr-3" />
            <h1
              className="text-3xl font-bold text-cyan-400"
              style={{ fontFamily: "Lexend Deca, sans-serif" }}
            >
              TEXT ANALYSIS
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
              <Scan className="w-6 h-6 text-cyan-400 mr-3" />
              <span
                className="text-cyan-400 uppercase tracking-wider font-medium"
                style={{ fontFamily: "Lexend Deca, sans-serif" }}
              >
                Neural Text Analysis Chamber
              </span>
            </div>

            {!result ? (
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-cyan-400/30 rounded-xl p-8 hover:border-cyan-400/50 transition-colors duration-300">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your news article, social media post, or any text content here for analysis..."
                    className="w-full h-64 bg-transparent text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-lg leading-relaxed"
                    style={{ fontFamily: "Lexend Deca, sans-serif" }}
                  />
                </div>

                {/* Scan Button */}
                <div className="text-center">
                  <button
                    onClick={handleScan}
                    disabled={!text.trim() || isScanning}
                    className={`
                      px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden
                      ${
                        isScanning || !text.trim()
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
                        ANALYZING CONTENT...
                      </div>
                    ) : (
                      "INITIATE DEEP SCAN"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Results Display */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Main Result */}
                <div
                  className={`
                  p-6 rounded-xl border-2 text-center
                  ${
                    result.isFake
                      ? "bg-red-900/20 border-red-500"
                      : "bg-green-900/20 border-green-500"
                  }
                `}
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
                      <span className="font-medium">Trust Score</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          result.isFake ? "bg-red-500" : "bg-green-500"
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
                  <div
                    className={`
      p-6 rounded-xl border-2 text-center
      ${
        result.hateSpeech.label === "Neither"
          ? "bg-blue-900/20 border-blue-500"
          : result.hateSpeech.label === "Offensive Language"
          ? "bg-yellow-900/20 border-yellow-500"
          : "bg-red-900/20 border-red-500"
      }
    `}
                  >
                    <h3
                      className={`text-2xl font-bold uppercase mb-4 ${
                        result.hateSpeech.label === "Neither"
                          ? "text-blue-400"
                          : result.hateSpeech.label === "Offensive Language"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                      style={{ fontFamily: "Lexend Deca, sans-serif" }}
                    >
                      HATE SPEECH ANALYSIS
                    </h3>

                    {/* Show scores for each category */}
                    <div className="space-y-4">
                      {Object.entries(result.hateSpeech.scores).map(
                        ([label, score]) => {
                          const s = Number(score);
                          return (
                            <div key={label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{label}</span>
                                <span>{Math.round(s * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className={`h-full ${
                                    label === "Hate Speech"
                                      ? "bg-red-500"
                                      : label === "Offensive Language"
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.round(s * 100)}%`,
                                  }}
                                  transition={{ duration: 1, delay: 0.3 }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
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
