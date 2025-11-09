import { motion } from "framer-motion";

import { Home, History, User, LogOut } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userName?: string;
  onLogout?: () => void;
  onLogin?: () => void;
}

export function Navigation(props: NavigationProps) {
  const { currentPage, onNavigate, userName, onLogout, onLogin } = props; // ✅ fix here
  const navItems = userName
    ? [
        { id: "home", icon: Home, label: "Home" },
        { id: "history", icon: History, label: "History" },
        { id: "profile", icon: User, label: "Profile" },
      ]
    : [{ id: "home", icon: Home, label: "Home" }];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-cyan-400/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <h1
              className="text-2xl font-black tracking-wider text-cyan-400 text-glow-cyan"
              style={{ fontFamily: "Lexend Deca, sans-serif" }}
            >
              FACTIFY
            </h1>
          </motion.div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-6"
            >
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate(item.id)}
                    className={`
                    relative p-3 rounded-lg transition-all duration-300 group
                    ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-400 glow-cyan"
                        : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10"
                    }
                  `}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Icon className="w-5 h-5" />

                    {/* Hover label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-cyan-400 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {item.label}
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Scanner line effect for active item */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-lg"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* ✅ CHANGED: Right section shows username + logout if logged in, login button if not */}
            {userName && onLogout ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center space-x-3"
              >
                <span className="text-sm font-semibold text-gray-200">
                  {userName}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="relative p-3 rounded-lg transition-all duration-300 text-gray-400 hover:text-red-400 hover:bg-red-400/10 group"
                >
                  <LogOut className="w-5 h-5" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-red-400 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Logout
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              onLogin && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogin}
                  className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 font-semibold hover:bg-cyan-400/30 transition"
                >
                  Login
                </motion.button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Animated bottom border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </nav>
  );
}
