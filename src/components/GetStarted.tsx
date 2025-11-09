import { motion } from "framer-motion";
import { FileText, Link, Image, Video, ArrowRight } from "lucide-react";

interface GetStartedProps {
  onSelectMode: (mode: string) => void;
}

export function GetStarted({ onSelectMode }: GetStartedProps) {
  const scanModes = [
    {
      id: "text",
      icon: FileText,
      title: "TEXT ANALYSIS",
      description:
        "Paste news articles, social media posts, or any text content for instant AI verification and truth scoring.",
      features: [
        "Language pattern detection",
        "Sentiment analysis",
        "Source credibility check",
      ],
    },
    {
      id: "url",
      icon: Link,
      title: "URL SCAN",
      description:
        "Enter any news article URL for comprehensive analysis including content, source reputation, and cross-referencing.",
      features: [
        "Automatic content extraction",
        "Domain reputation check",
        "Fact cross-verification",
      ],
    },
    {
      id: "image",
      icon: Image,
      title: "IMAGE SCAN",
      description:
        "Upload images, memes, or screenshots to detect manipulated content, deepfakes, and visual misinformation.",
      features: [
        "Deepfake detection",
        "Image manipulation analysis",
        "Reverse image search",
      ],
    },
    {
      id: "video",
      icon: Video,
      title: "VIDEO SCAN",
      description:
        "Analyze video content for deepfakes, audio manipulation, and visual inconsistencies using advanced AI models.",
      features: [
        "Deepfake video detection",
        "Audio authenticity check",
        "Frame-by-frame analysis",
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1
            className="text-5xl md:text-7xl font-black text-cyan-400 mb-6 text-glow-cyan"
            style={{ fontFamily: "Lexend Deca, sans-serif" }}
          >
            CHOOSE YOUR SCAN MODE
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Select the type of content you want to analyze. Our AI system is
            optimized for different content formats to provide the most accurate
            truth detection.
          </p>
        </motion.div>

        {/* Scan Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {scanModes.map((mode, index) => {
            const Icon = mode.icon;

            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => onSelectMode(mode.id)}
              >
                <div className="relative bg-gray-900/50 border border-cyan-400/30 rounded-2xl p-8 h-full backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/60 hover:bg-gray-900/70 overflow-hidden">
                  {/* Background grid pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                      }}
                    />
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-all duration-300 group-hover:glow-cyan">
                        <Icon className="w-10 h-10 text-cyan-400" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3
                        className="text-2xl font-bold text-cyan-400 uppercase tracking-wider group-hover:text-glow-cyan transition-all duration-300"
                        style={{ fontFamily: "Lexend Deca, sans-serif" }}
                      >
                        {mode.title}
                      </h3>

                      <p className="text-gray-300 leading-relaxed">
                        {mode.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2">
                        {mode.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center text-sm text-gray-400"
                          >
                            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Action button */}
                      <div className="pt-4">
                        <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                          <span
                            className="mr-2 font-medium"
                            style={{ fontFamily: "Lexend Deca, sans-serif" }}
                          >
                            START SCAN
                          </span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>

                    {/* Scanner line animation */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-900/30 border border-cyan-400/20 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-gray-400 mb-4">
              <span className="text-cyan-400 font-medium">
                Advanced AI Models:
              </span>{" "}
              Our system uses multiple specialized neural networks trained on
              millions of verified data points.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-cyan-400 font-bold">99.7%</div>
                <div className="text-gray-500">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-bold">&lt; 3s</div>
                <div className="text-gray-500">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-bold">50+</div>
                <div className="text-gray-500">Languages</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
