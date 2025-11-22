import React, { useState, useCallback } from "react";
import MapView from "./MapView";
import { analyze, aiAnalyze } from "../api";

export default function AnalysisInterface() {
  const [lat, setLat] = useState("12.9716");
  const [lon, setLon] = useState("77.5946");
  
  // Handle map clicks to update coordinates
  const handleMapClick = useCallback((newLat, newLon) => {
    setLat(newLat.toFixed(6));
    setLon(newLon.toFixed(6));
  }, []);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulate, setSimulate] = useState(1);
  const [useNASA, setUseNASA] = useState("true");
  const [date, setDate] = useState("");

  const handleAnalyze = useCallback(async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!lat || !lon) {
      alert('Please provide valid coordinates');
      return;
    }
    
    if (useNASA === "false" && !file) {
      alert('Please upload an image or use NASA data');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setAnalysis(null);
    
    try {
      const data = await analyze({
        latitude: lat,
        longitude: lon,
        file,
        simulateRainfall: simulate,
        useNASA,
        date,
      });
      setResult(data);

      const aiResult = await aiAnalyze({
        weatherData: data.weatherData,
        imageBase64: data.imageBase64,
        imageMime: data.imageMime,
      });

      setAnalysis(aiResult);
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err.response?.data?.error || err.message || 'An unexpected error occurred';
      alert(`Analysis failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, file, simulate, useNASA, date]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left sidebar for analysis parameters */}
        <div className="w-full lg:w-96 bg-white dark:bg-neutral-800 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Analysis Parameters</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Configure location and data sources
          </p>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">
                Location Coordinates
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:border-neutral-500 dark:focus:border-neutral-400 focus:outline-none"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:border-neutral-500 dark:focus:border-neutral-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">
                Data Source
              </label>
              <select
                value={useNASA}
                onChange={(e) => setUseNASA(e.target.value)}
                className="w-full p-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:border-neutral-500 dark:focus:border-neutral-400 focus:outline-none"
              >
                <option value="true">NASA Satellite Data</option>
                <option value="false">Upload Custom Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">
                Date (Optional)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:border-neutral-500 dark:focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">
                Rainfall Intensity{" "}
                <span className="text-neutral-600 dark:text-neutral-400">{simulate}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={simulate}
                onChange={(e) => setSimulate(e.target.value)}
                className="w-full accent-neutral-900 dark:accent-neutral-400"
              />
              <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                <span>Light (0.5x)</span>
                <span>Severe (2.0x)</span>
              </div>
            </div>

            {useNASA === "false" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="w-full p-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-600 file:text-neutral-900 dark:file:text-white hover:file:bg-neutral-200 dark:hover:file:bg-neutral-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !lat || !lon}
              className="w-full bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-neutral-900 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>
          </form>

          {analysis && (
            <div className="mt-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Analysis Results</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    analysis.floodProbability > 70 
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
                      : analysis.floodProbability > 40 
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {analysis.floodProbability > 70 ? 'High Risk' : analysis.floodProbability > 40 ? 'Medium Risk' : 'Low Risk'}
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Flood Probability</span>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      {analysis.floodProbability}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Data Source</span>
                    <div className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                      {result?.usedImage ? "🛰️ NASA Satellite" : "📁 Custom Upload"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Risk Assessment</span>
                  <div className="text-sm text-neutral-900 dark:text-white mt-2 leading-relaxed">{analysis.reason}</div>
                </div>
                
                <div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Evacuation Advice</span>
                  <div className="text-sm text-neutral-900 dark:text-white mt-2 leading-relaxed bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                    {analysis.evacuationAdvice}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!analysis && !loading && (
            <div className="mt-8 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-neutral-900 dark:text-white">Ready for Analysis</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Configure parameters and run analysis to see disaster risk assessment
              </p>
            </div>
          )}
          
          {loading && (
            <div className="mt-8 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-neutral-900 dark:text-white">Analyzing...</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Processing satellite data and generating risk assessment
              </p>
            </div>
          )}
        </div>

        {/* Right content area with map and coordinates */}
        <div className="flex-1 flex flex-col">
          {/* Map container */}
          <div className="flex-1 relative">
            <MapView 
              lat={Number(lat)} 
              lon={Number(lon)} 
              analysis={analysis} 
              onMapClick={handleMapClick}
            />
          </div>
          
          {/* Coordinates panel at bottom */}
          <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">Current Location:</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Lat: <span className="font-mono">{Number(lat).toFixed(4)}</span></span>
                  <span>Lon: <span className="font-mono">{Number(lon).toFixed(4)}</span></span>
                </div>
              </div>
              
              {analysis && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      analysis.floodProbability > 70 
                        ? 'bg-red-500' 
                        : analysis.floodProbability > 40 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Risk: <span className="font-semibold text-neutral-900 dark:text-white">{analysis.floodProbability}%</span>
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {result?.usedImage ? "NASA Data" : "Uploaded Data"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
