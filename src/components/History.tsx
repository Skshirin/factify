import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  FileText,
  Link,
  Image,
  Video,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
} from "lucide-react";

export function History() {
  const scanHistory = [
    {
      id: 1,
      type: "text",
      title: "Breaking: New Climate Change Study",
      date: "2024-08-19",
      time: "14:30",
      result: "verified",
      confidence: 96,
      preview:
        "Scientists from MIT released a comprehensive study on climate patterns...",
    },
    {
      id: 2,
      type: "url",
      title: "Tech Company Announces Revolutionary AI",
      date: "2024-08-19",
      time: "12:15",
      result: "misinformation",
      confidence: 87,
      preview: "https://technews.com/revolutionary-ai-breakthrough",
    },
    {
      id: 3,
      type: "image",
      title: "Viral Social Media Image",
      date: "2024-08-18",
      time: "09:45",
      result: "verified",
      confidence: 94,
      preview:
        "Image analysis of viral social media post about natural disaster",
    },
    {
      id: 4,
      type: "video",
      title: "Political Speech Analysis",
      date: "2024-08-18",
      time: "16:20",
      result: "misinformation",
      confidence: 91,
      preview: "Deepfake detection on political video content",
    },
    {
      id: 5,
      type: "text",
      title: "Health Claims Investigation",
      date: "2024-08-17",
      time: "11:30",
      result: "verified",
      confidence: 98,
      preview:
        "Medical claims about new treatment verified against scientific sources...",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return FileText;
      case "url":
        return Link;
      case "image":
        return Image;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "text-blue-400";
      case "url":
        return "text-green-400";
      case "image":
        return "text-purple-400";
      case "video":
        return "text-pink-400";
      default:
        return "text-cyan-400";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <HistoryIcon className="w-8 h-8 text-cyan-400 mr-3" />
            <h1
              className="text-3xl font-bold text-cyan-400"
              style={{ fontFamily: "Lexend Deca, sans-serif" }}
            >
              SCAN HISTORY
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-colors duration-300">
              <Download className="w-4 h-4 mr-2 inline" />
              Export All
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {scanHistory.length}
            </div>
            <div className="text-gray-400 text-sm">Total Scans</div>
          </div>
          <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {scanHistory.filter((s) => s.result === "verified").length}
            </div>
            <div className="text-gray-400 text-sm">Verified</div>
          </div>
          <div className="bg-gray-900/50 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {scanHistory.filter((s) => s.result === "misinformation").length}
            </div>
            <div className="text-gray-400 text-sm">Flagged</div>
          </div>
          <div className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {Math.round(
                scanHistory.reduce((acc, s) => acc + s.confidence, 0) /
                  scanHistory.length
              )}
              %
            </div>
            <div className="text-gray-400 text-sm">Avg Confidence</div>
          </div>
        </motion.div>

        {/* History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {scanHistory.map((scan, index) => {
            const TypeIcon = getTypeIcon(scan.type);

            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-6 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  {/* Type Icon */}
                  <div
                    className={`p-3 rounded-lg bg-gray-800/50 ${getTypeColor(
                      scan.type
                    )}`}
                  >
                    <TypeIcon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-200 group-hover:text-cyan-400 transition-colors duration-300">
                          {scan.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {scan.date} at {scan.time}
                        </div>
                      </div>

                      {/* Result Badge */}
                      <div
                        className={`
                        flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${
                          scan.result === "verified"
                            ? "bg-green-900/30 text-green-400 border border-green-500/30"
                            : "bg-red-900/30 text-red-400 border border-red-500/30"
                        }
                      `}
                      >
                        {scan.result === "verified" ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 mr-1" />
                        )}
                        {scan.result.toUpperCase()}
                      </div>
                    </div>

                    {/* Preview */}
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {scan.preview}
                    </p>

                    {/* Confidence Bar */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500 font-medium">
                        Confidence:
                      </span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            scan.result === "verified"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${scan.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {scan.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <button className="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-300">
            Load More History
          </button>
        </motion.div>
      </div>
    </div>
  );
}
