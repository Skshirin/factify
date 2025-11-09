import { motion } from "framer-motion";
import { Brain, Database, Shield } from "lucide-react";

export function ProcessSteps() {
  const steps = [
    {
      icon: Database,
      title: "DATA INGESTION",
      description:
        "Advanced crawlers scan thousands of sources, cross-referencing facts and extracting linguistic patterns in real-time.",
      features: [
        "Source credibility analysis",
        "Content fingerprinting",
        "Real-time fact checking",
      ],
    },
    {
      icon: Brain,
      title: "NEURAL ANALYSIS",
      description:
        "Multi-layered AI models analyze sentiment, structure, and semantic patterns to identify misinformation markers.",
      features: [
        "Language pattern recognition",
        "Bias detection algorithms",
        "Context understanding",
      ],
    },
    {
      icon: Shield,
      title: "VERIFICATION",
      description:
        "Final verification layer validates findings against our truth database and provides confidence scoring.",
      features: [
        "Cross-source validation",
        "Confidence scoring",
        "Report generation",
      ],
    },
  ];

  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4"
            style={{ fontFamily: "Orbitron, monospace" }}
          >
            DETECTION PROTOCOL
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our three-stage verification system processes information through
            advanced AI layers to ensure maximum accuracy in truth detection.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 right-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent transform translate-x-full" />
                )}

                <div className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-8 h-full backdrop-blur-sm hover:border-cyan-400/60 transition-all duration-300 relative overflow-hidden group">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {/* Step number */}
                    <div className="flex items-center mb-6">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-bold mr-4"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent" />
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-cyan-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors duration-300">
                        <Icon className="w-8 h-8 text-cyan-400" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3
                        className="text-xl font-bold text-cyan-400 uppercase tracking-wider"
                        style={{ fontFamily: "Orbitron, monospace" }}
                      >
                        {step.title}
                      </h3>

                      <p className="text-gray-300 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center text-sm text-gray-400"
                          >
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scanner line animation */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      initial={{ x: "-100%" }}
                      whileInView={{ x: "100%" }}
                      transition={{
                        duration: 2,
                        delay: index * 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Performance metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-gray-900/30 border border-cyan-400/20 rounded-xl p-8"
        >
          <h3
            className="text-2xl font-bold text-center text-cyan-400 mb-8 uppercase tracking-wider"
            style={{ fontFamily: "Orbitron, monospace" }}
          >
            System Performance
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { metric: "2.3s", label: "Average Processing Time" },
              { metric: "99.7%", label: "Detection Accuracy" },
              { metric: "24/7", label: "Monitoring Uptime" },
              { metric: "50K+", label: "Articles Analyzed" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  {item.metric}
                </div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
