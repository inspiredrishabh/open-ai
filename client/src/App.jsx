import React, { useState } from "react";
import MapView from "./components/MapView";
import { analyze } from "./api";

export default function App() {
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

      // Client-side AI call via Puter.js
      if (!window.puter?.ai) throw new Error("Puter.js not loaded");
      const prompt = `
You are an emergency response assistant. Based on the following weather payload and optional satellite image, return ONLY valid JSON with:
{
  "floodProbability": number,
  "reason": string,
  "safeZones": [ { "lat": number, "lon": number, "label": string } ],
  "evacuationAdvice": string
}
Weather payload: ${JSON.stringify(data.weatherData)}
Satellite image: ${
        data.imageDataUrl
          ? data.imageDataUrl.substring(0, 2000) + "..."
          : "none"
      }
`;
      const aiResp = await window.puter.ai.chat(prompt, {
        model: "claude-sonnet-4-5",
      });
      const raw = aiResp?.message?.content?.[0]?.text || "";
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (e2) {
            parsed = { raw };
          }
        } else {
          parsed = { raw };
        }
      }
      setAnalysis(parsed);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/3 p-4 bg-slate-50">
        <h1 className="text-xl font-semibold mb-4">Flood Risk MVP</h1>
        <form onSubmit={handleAnalyze} className="space-y-3">
          <label className="block">
            Latitude
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </label>
          <label className="block">
            Longitude
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </label>

          <label className="block">
            Use NASA satellite imagery:
            <select
              value={useNASA}
              onChange={(e) => setUseNASA(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="true">Yes (NASA)</option>
              <option value="false">No, upload my image</option>
            </select>
          </label>

          <label className="block">
            Date (optional, YYYY-MM-DD) — for NASA image
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="2024-10-01"
            />
          </label>

          <label className="block">
            Satellite / Drone Image (if NASA disabled)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </label>

          <label className="block">
            Simulate Rainfall (0.5 to 2) — slide {">"}1.5 to force demo disaster
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={simulate}
              onChange={(e) => setSimulate(e.target.value)}
            />
            <div>{simulate}x</div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {analysis && (
          <div className="mt-4 p-3 bg-white border rounded">
            <div>
              <strong>Flood Chance:</strong>{" "}
              {analysis?.floodProbability ?? "N/A"}%
            </div>
            <div className="mt-2">
              <strong>Reason:</strong> {analysis?.reason}
            </div>
            <div className="mt-2">
              <strong>Evacuation Advice:</strong> {analysis?.evacuationAdvice}
            </div>
            <div className="mt-2">
              <strong>Used NASA image:</strong>{" "}
              {result?.usedImage ? "Yes" : "No (fallback/upload)"}
            </div>
          </div>
        )}
      </div>

      <div className="w-2/3">
        <MapView lat={Number(lat)} lon={Number(lon)} analysis={analysis} />
      </div>
    </div>
  );
}
