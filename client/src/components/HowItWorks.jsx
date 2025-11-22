import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Choose Location",
      description:
        "Use your current GPS location or click anywhere on the interactive map to analyze any area.",
    },
    {
      number: "2",
      title: "AI Analysis",
      description:
        "Our AI processes satellite imagery, weather data, and terrain information in real-time.",
    },
    {
      number: "3",
      title: "Get Results",
      description:
        "Receive disaster probability, risk level, and personalized evacuation recommendations instantly.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Three simple steps to protect your community from disasters
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
