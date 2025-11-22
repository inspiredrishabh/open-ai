import React from "react";

export default function Features() {
  const features = [
    {
      icon: "🛰️",
      title: "Satellite Imagery",
      description:
        "Real-time NASA satellite data integration for accurate terrain and weather analysis across the globe.",
    },
    {
      icon: "🤖",
      title: "AI Predictions",
      description:
        "Claude AI analyzes multiple data points to provide accurate disaster probability and risk assessments.",
    },
    {
      icon: "🗺️",
      title: "Interactive Maps",
      description:
        "Visual risk zones on interactive maps. Click anywhere to analyze any location instantly.",
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cutting-edge technology designed to protect communities from natural
            disasters
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-2xl">
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
