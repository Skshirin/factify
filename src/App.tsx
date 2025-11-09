import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { ProcessSteps } from "./components/ProcessSteps";
import { CallToAction } from "./components/CallToAction";
import { GetStarted } from "./components/GetStarted";
import { TextScan } from "./components/TextScan";
import { URLScan } from "./components/URLScan";
import { ImageScan } from "./components/ImageScan";
import { VideoScan } from "./components/VideoScan";
import { History } from "./components/History";
import { Profile } from "./components/Profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentScanMode, setCurrentScanMode] = useState<string | null>(null);

  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setCurrentScanMode(null);
  };

  const handleGetStarted = () => {
    setCurrentPage("get-started");
  };

  const handleSelectScanMode = (mode: string) => {
    setCurrentScanMode(mode);
  };

  const handleBackToGetStarted = () => {
    setCurrentScanMode(null);
  };

  const renderCurrentView = () => {
    if (currentScanMode) {
      switch (currentScanMode) {
        case "text":
          return <TextScan onBack={handleBackToGetStarted} />;
        case "url":
          return <URLScan onBack={handleBackToGetStarted} />;
        case "image":
          return <ImageScan onBack={handleBackToGetStarted} />;
        case "video":
          return <VideoScan onBack={handleBackToGetStarted} />;
        default:
          return <GetStarted onSelectMode={handleSelectScanMode} />;
      }
    }

    switch (currentPage) {
      case "home":
        return (
          <>
            <Hero onGetStarted={handleGetStarted} />

            <ProcessSteps />
            <CallToAction />
          </>
        );
      case "get-started":
        return <GetStarted onSelectMode={handleSelectScanMode} />;
      case "history":
        return <History />;
      case "profile":
        return <Profile />;
      default:
        return (
          <>
            <Hero onGetStarted={handleGetStarted} />
            <ProcessSteps />
            <CallToAction />
          </>
        );
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-white font-primary bg-[var(--cyberpunk-background)]"
      style={{
        backgroundColor: "var(--cyberpunk-background)",
        fontFamily: "var(--font-primary)",
      }}
    >
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-600/5 pointer-events-none" />

      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigation}
        userName={isAuthenticated ? user?.name : undefined}
        onLogout={
          isAuthenticated
            ? () =>
                logout({ logoutParams: { returnTo: window.location.origin } })
            : undefined
        }
        onLogin={!isAuthenticated ? () => loginWithRedirect() : undefined}
      />

      {/* Auth buttons
      <div className="absolute top-4 right-4 z-50">
        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg shadow text-sm"
          >
            Log In
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <img
              src={user?.picture}
              alt="profile"
              className="w-8 h-8 rounded-full border border-cyan-400"
            />
            <span>{user?.name}</span>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg shadow text-sm"
            >
              Log Out
            </button>
          </div>
        )}
      </div> */}

      {/* Main content */}
      <div className="relative z-10">{renderCurrentView()}</div>

      {/* Footer - only show on home page */}
      {currentPage === "home" && !currentScanMode && (
        <footer className="relative z-10 border-t border-cyan-400/20 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                  FACTIFY
                </h3>
                <p className="text-gray-400 mb-4 max-w-md">
                  Advanced AI-powered truth detection system protecting the
                  world from misinformation, one scan at a time.
                </p>
                <div className="flex space-x-4">
                  {["T", "L", "G"].map((icon) => (
                    <div
                      key={icon}
                      className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center text-cyan-400 cursor-pointer hover:bg-cyan-400/30 transition-colors"
                    >
                      <span className="text-sm font-bold">{icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-cyan-400 font-bold mb-4 uppercase tracking-wider">
                  Product
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    Features
                  </li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    API Docs
                  </li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    Pricing
                  </li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    Enterprise
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-cyan-400 font-bold mb-4 uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    About
                  </li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    Blog
                  </li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    Careers
                  </li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">
                    Contact
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-cyan-400/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2024 Factify. All rights reserved. Protecting truth through
                technology.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                {["Privacy", "Terms", "Security"].map((item) => (
                  <span
                    key={item}
                    className="text-gray-500 text-sm hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
