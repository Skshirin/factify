import { motion } from "framer-motion";
import {
  User,
  Settings,
  Shield,
  Bell,
  Download,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export function Profile() {
  const userStats = [
    {
      label: "Total Scans",
      value: "1,247",
      change: "+12%",
      period: "this month",
    },
    {
      label: "Accuracy Rate",
      value: "98.3%",
      change: "+0.5%",
      period: "this month",
    },
    { label: "Time Saved", value: "142h", change: "+8h", period: "this month" },
    {
      label: "Reports Generated",
      value: "89",
      change: "+15",
      period: "this month",
    },
  ];

  const menuItems = [
    {
      icon: Settings,
      label: "Account Settings",
      description: "Manage your account preferences",
    },
    {
      icon: Shield,
      label: "Security & Privacy",
      description: "Two-factor authentication, data settings",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Email and push notification preferences",
    },
    {
      icon: Download,
      label: "Export Data",
      description: "Download your scan history and reports",
    },
  ];

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
          <User className="w-8 h-8 text-cyan-400 mr-3" />
          <h1
            className="text-3xl font-bold text-cyan-400"
            style={{ fontFamily: "Lexend Deca, sans-serif" }}
          >
            USER PROFILE
          </h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-900/50 border border-cyan-400/30 rounded-2xl p-8 mb-8 backdrop-blur-sm"
        >
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-black" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2
                className="text-2xl font-bold text-cyan-400 mb-2"
                style={{ fontFamily: "Lexend Deca, sans-serif" }}
              >
                Alex Rodriguez
              </h2>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  alex.rodriguez@email.com
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since March 2024
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Professional Plan
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-right">
              <div className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30 mb-2">
                ACTIVE
              </div>
              <div className="text-sm text-gray-500">
                Last scan: 2 hours ago
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {userStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-4 text-center hover:border-cyan-400/50 transition-colors duration-300"
            >
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm mb-2">{stat.label}</div>
              <div className="text-xs text-green-400">
                {stat.change} {stat.period}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h3
            className="text-xl font-bold text-cyan-400 mb-4"
            style={{ fontFamily: "Lexend Deca, sans-serif" }}
          >
            ACCOUNT MANAGEMENT
          </h3>

          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-900/50 border border-cyan-400/30 rounded-xl p-6 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-200 group-hover:text-cyan-400 transition-colors duration-300">
                        {item.label}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Subscription Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4
                className="text-lg font-bold text-cyan-400 mb-2"
                style={{ fontFamily: "Lexend Deca, sans-serif" }}
              >
                PROFESSIONAL PLAN
              </h4>
              <p className="text-gray-400">
                10,000 scans per month • Priority support • Advanced analytics
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Renews on September 15, 2024
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400 mb-1">$299</div>
              <div className="text-gray-400 text-sm">per month</div>
              <button className="mt-2 px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors duration-300 text-sm font-medium">
                Manage Plan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
