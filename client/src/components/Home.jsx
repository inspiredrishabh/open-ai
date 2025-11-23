import React from "react";
import { Link } from "react-router-dom";

export default function Home() {

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">SafeGuard AI</span>
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollToSection('about')} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">About</button>
              
              <Link 
                to="/analyze"
                className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Start Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full mb-8">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">AI Disaster Analysis & Evacuation</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6">
              Saving Lives Through
              <br />
              <span className="text-neutral-600 dark:text-neutral-400">AI Analysis & Smart Evacuation</span>
            </h1>
            
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Advanced AI analyzes disaster risks using satellite data, weather patterns, and climate conditions. 
              Then plan optimal evacuation routes with multiple agents and find nearby safety facilities.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link 
                to="/analyze"
                className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-medium px-8 py-4 rounded-lg transition-all duration-200 text-lg"
              >
                Analyze & Plan Routes
              </Link>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="border-2 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-900 dark:text-white font-medium px-8 py-4 rounded-lg transition-all duration-200 text-lg"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">99%</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Prediction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">24/7</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Real-Time Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">&lt;2min</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Analysis Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              AI-powered disaster analysis combined with intelligent evacuation planning for complete emergency preparedness
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">AI Risk Analysis</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Claude AI analyzes satellite data, weather patterns, and climate conditions to predict disaster risks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Multiple Data Sources</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                NASA satellite imagery, weather APIs, earthquake data, and air quality monitoring for comprehensive analysis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Interactive Maps</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Visual risk zones on interactive maps. Click anywhere to analyze any location instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Evacuation Agents</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Deploy multiple evacuation agents with smart pathfinding to plan optimal routes avoiding emergency blocks.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Route Details</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Get detailed route information including distance, duration, and status for each evacuation path.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Safety Points</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Locate nearby hospitals, police stations, fire departments, and emergency shelters along routes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Three simple steps to protect your community from disasters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-neutral-900 text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Choose Location</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Use your current GPS location or click anywhere on the interactive map to analyze any area.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-neutral-900 text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">AI Analysis</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Our AI processes satellite imagery, weather data, and terrain information in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-neutral-900 text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Get Results</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Receive disaster probability, risk level, and personalized evacuation recommendations instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 dark:bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Protect Your Community?
          </h2>
          <p className="text-xl text-neutral-300 dark:text-neutral-400 mb-10">
            Start analyzing disaster risks in your area today. It's fast, free, and could save lives.
          </p>
          <Link 
            to="/analyze"
            className="inline-block bg-white dark:bg-neutral-100 hover:bg-neutral-100 dark:hover:bg-white text-neutral-900 font-medium px-10 py-4 rounded-lg transition-all duration-200 text-lg"
          >
            Start Free Analysis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white dark:text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">SafeGuard AI</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                AI-powered disaster prediction to save lives and protect communities.
              </p>
            </div>

            

            

            
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              © 2025 SafeGuard AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}