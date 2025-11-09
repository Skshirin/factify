import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const handleGetStarted = async () => {
    if (isAuthenticated) {
      onGetStarted(); // ✅ let parent decide where to go
    } else {
      await loginWithRedirect(); // ✅ just go to login page
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating Binary */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-400 opacity-30 font-mono text-sm"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
            }}
            animate={{
              y: -100,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{ left: `${Math.random() * 100}%` }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <h1
              className="text-6xl md:text-8xl font-black tracking-wider mb-4"
              style={{
                fontFamily: "Lexend Deca, sans-serif",
                color: "#00f0ff",
                textShadow:
                  "0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)",
              }}
            >
              FACTIFY
            </h1>

            {/* Scanning line effect */}
            <motion.div
              className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.6), transparent)",
                filter: "blur(1px)",
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8"
        >
          <p
            className="text-xl md:text-2xl text-cyan-300 mb-4"
            style={{ fontFamily: "Lexend Deca, sans-serif" }}
          >
            AI-POWERED TRUTH DETECTION SYSTEM
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Advanced neural networks analyze content patterns, source
            credibility, and linguistic markers to identify misinformation with
            99.7% accuracy in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <motion.button
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 bg-cyan-400 text-black rounded-xl font-bold text-xl hover:bg-cyan-300 transition-all duration-300 relative overflow-hidden group glow-cyan-strong"
            style={{ fontFamily: "Lexend Deca, sans-serif" }}
          >
            <span className="relative z-10">GET STARTED</span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: "99.7%", label: "ACCURACY" },
            { value: "< 2s", label: "SCAN TIME" },
            { value: "50K+", label: "ARTICLES PROCESSED" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2"
                style={{ fontFamily: "Lexend Deca, sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
