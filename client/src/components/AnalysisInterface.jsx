import React, { useState } from "react";
import MapView from "./MapView";
import { analyze, aiAnalyze } from "../api";

export default function AnalysisInterface({ onBack }) {
  const [lat, setLat] = useState("12.9716");
  const [lon, setLon] = useState("77.5946");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulate, setSimulate] = useState(1);
  const [useNASA, setUseNASA] = useState("true");
  const [date, setDate] = useState("");

  async function handleAnalyze(e) {
    e.preventDefault();
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
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        <div className="w-96 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Analysis Parameters</h2>
          <p className="text-gray-400 mb-6">
            Configure location and data sources
          </p>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Location Coordinates
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Data Source
              </label>
              <select
                value={useNASA}
                onChange={(e) => setUseNASA(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="true">NASA Satellite Data</option>
                <option value="false">Upload Custom Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date (Optional)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rainfall Intensity{" "}
                <span className="text-blue-400">{simulate}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={simulate}
                onChange={(e) => setSimulate(e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Light (0.5x)</span>
                <span>Severe (2.0x)</span>
              </div>
            </div>

            {useNASA === "false" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>
          </form>

          {analysis && (
            <div className="mt-8 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Analysis Results</h3>
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  📊
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Flood Probability:</span>
                  <div className="font-semibold text-lg">
                    {analysis.floodProbability}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Risk Assessment:</span>
                  <div>{analysis.reason}</div>
                </div>
                <div>
                  <span className="text-gray-400">Evacuation Advice:</span>
                  <div className="text-sm">{analysis.evacuationAdvice}</div>
                </div>
                <div>
                  <span className="text-gray-400">Data Source:</span>
                  <div>
                    {result?.usedImage ? "NASA Satellite" : "Fallback/Upload"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!analysis && !loading && (
            <div className="mt-8 p-6 bg-gray-700 rounded-lg text-center">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="font-semibold mb-2">No Analysis Yet</h3>
              <p className="text-gray-400 text-sm">
                Run an analysis to see results
              </p>
            </div>
          )}
        </div>

        <div className="flex-1">
          <MapView lat={Number(lat)} lon={Number(lon)} analysis={analysis} />
        </div>
      </div>
    </div>
  );
}
