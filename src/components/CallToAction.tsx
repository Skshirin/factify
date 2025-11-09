import { motion } from "framer-motion";
import { ArrowRight, Zap, Globe, Users } from "lucide-react";

export function CallToAction() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-6xl font-bold text-cyan-400 mb-6"
            style={{
              fontFamily: "Orbitron, monospace",
              textShadow: "0 0 20px rgba(0, 240, 255, 0.3)",
            }}
          >
            JOIN THE FIGHT
          </h2>
          <h3
            className="text-2xl md:text-3xl text-cyan-300 mb-6"
            style={{ fontFamily: "Orbitron, monospace" }}
          >
            AGAINST MISINFORMATION
          </h3>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            Deploy cutting-edge AI technology to protect your organization and
            users from the spread of false information. Get real-time
            verification, comprehensive analytics, and enterprise-grade
            security.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              icon: Zap,
              title: "INSTANT RESULTS",
              description:
                "Quickly verify news articles, images, videos, or links with our multi-model detection system. No technical expertise required.",
            },
            {
              icon: Globe,
              title: "GLOBAL COVERAGE",
              description: "Fact-check across worldwide sources in real time",
            },
            {
              icon: Users,
              title: "TEAM COLLABORATION",
              description:
                "Share results, add notes, and validate claims together with built-in collaboration tools",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-6 text-center hover:border-cyan-400/60 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h4
                  className="text-lg font-bold text-cyan-400 mb-3 uppercase"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center"></div>
        </motion.div>
      </div>
    </div>
  );
}
