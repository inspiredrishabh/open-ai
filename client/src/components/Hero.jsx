import React from "react";

export default function Hero({ onStartAnalysis }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <span className="inline-flex items-center space-x-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI-Powered Disaster Prediction</span>
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-8">
          Saving Lives Through{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Natural Disaster Prediction
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          Advanced AI and satellite imagery to predict natural disasters before
          they happen. Get real-time risk assessments and evacuation guidance to
          protect what matters most.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={onStartAnalysis}
            className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Free Analysis
          </button>
          <div className="text-sm text-gray-500">
            Start analyzing disaster risks in your area today. It's fast, free,
            and could save lives.
          </div>
        </div>
      </div>
    </section>
  );
}
