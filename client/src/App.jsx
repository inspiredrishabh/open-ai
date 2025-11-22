import React, { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import AnalysisInterface from "./components/AnalysisInterface";
import Footer from "./components/Footer";

export default function App() {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onStartAnalysis={() => setShowAnalysis(true)} />

      {!showAnalysis ? (
        <>
          <Hero onStartAnalysis={() => setShowAnalysis(true)} />
          <HowItWorks />
          <Features />
          <Footer />
        </>
      ) : (
        <AnalysisInterface onBack={() => setShowAnalysis(false)} />
      )}
    </div>
  );
}
