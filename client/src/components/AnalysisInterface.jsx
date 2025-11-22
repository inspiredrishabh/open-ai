import React, { useState, useCallback } from "react";
import MapView from "./MapView";
import { analyze, aiAnalyze } from "../api";

export default function AnalysisInterface() {
  const [lat, setLat] = useState("12.9716");
  const [lon, setLon] = useState("77.5946");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulate, setSimulate] = useState(1);
  const [useNASA, setUseNASA] = useState("true");
  const [date, setDate] = useState("");
  
  // Handle map clicks to update coordinates
  const handleMapClick = useCallback((newLat, newLon) => {
    setLat(newLat.toFixed(6));
    setLon(newLon.toFixed(6));
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude.toFixed(6));
        setLon(longitude.toFixed(6));
        setLoading(false);
        // Optionally auto-analyze the current location
        // handleAnalyze will be called automatically when coordinates change
      },
      (error) => {
        setLoading(false);
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

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
      console.log("Analysis data received:", data);

      const aiResult = await aiAnalyze({
        weatherData: data.weatherData,
        earthquakeData: data.earthquakeData,
        aqiData: data.aqiData,
        airQualityData: data.airQualityData,
        elevationData: data.elevationData,
        marineData: data.marineData,
        climateData: data.climateData,
        radiationData: data.radiationData,
        imageBase64: data.imageBase64,
        imageMime: data.imageMime,
      });

      console.log("AI analysis result:", aiResult);
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white">
      <div className="flex flex-col">
        {/* Map container - fixed height at top */}
        <div className="h-[65vh] p-6 bg-neutral-50 dark:bg-neutral-900">
          <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden relative">
            <div className="relative z-0 h-full w-full">
              <MapView 
                lat={Number(lat)} 
                lon={Number(lon)} 
                analysis={analysis} 
                onMapClick={handleMapClick}
              />
            </div>
            
            {/* Current Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 flex items-center gap-2 shadow-lg"
              title="Get Current Location"
              style={{zIndex: 1000}}
            >
              <svg 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {loading ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                )}
              </svg>
              <span className="hidden sm:inline">
                {loading ? 'Getting Location...' : 'Current Location'}
              </span>
            </button>
          
          {/* Compact coordinates panel - left side */}
          <div className="absolute bottom-4 left-4 z-[999] bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 shadow-lg max-w-xs" style={{zIndex: 999}}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium text-neutral-900 dark:text-white">Current Location:</span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 pl-5">
                <div>Lat: <span className="font-mono">{Number(lat).toFixed(4)}</span></div>
                <div>Lon: <span className="font-mono">{Number(lon).toFixed(4)}</span></div>
              </div>
              
              {analysis && (
                <div className="flex flex-col gap-1 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      analysis.floodProbability > 70 
                        ? 'bg-red-500' 
                        : analysis.floodProbability > 40 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}></div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Risk: <span className="font-semibold text-neutral-900 dark:text-white">{analysis.floodProbability}%</span>
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 pl-4">
                    {result?.usedImage ? "NASA Data" : "Uploaded Data"}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Analysis parameters section - vertical below map */}
        <div className="min-h-[35vh] bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Parameters form - full width */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Analysis Parameters</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Configure location and data sources
                </p>

                <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
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
                    <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
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
                  </div>
                </form>
              </div>

            {/* Results section - full width below parameters */}
            <div>
              {analysis && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">Disaster Risk Analysis</h3>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Data Source: {result?.usedImage ? "🛰️ NASA Satellite" : "📁 Uploaded Image"}
                      </div>
                    </div>
                  </div>

                  {/* Disaster Risk Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Flood Risk Card */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      <div className={`p-4 ${
                        analysis.floodProbability > 70 ? 'bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700' :
                        analysis.floodProbability > 40 ? 'bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700' :
                        'bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-neutral-900 dark:text-white">Flood Risk</h4>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                              analysis.floodProbability > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                              analysis.floodProbability > 40 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                            }`}>
                              {analysis.floodProbability > 70 ? 'High Risk' : analysis.floodProbability > 40 ? 'Medium Risk' : 'Low Risk'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                          {analysis.floodProbability}%
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {analysis.floodReason || analysis.reason}
                        </p>
                      </div>
                    </div>

                    {/* Earthquake Risk Card */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      <div className={`p-4 ${
                        (analysis.earthquakeProbability || 0) > 70 ? 'bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700' :
                        (analysis.earthquakeProbability || 0) > 40 ? 'bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700' :
                        'bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-neutral-900 dark:text-white">Earthquake Risk</h4>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                              (analysis.earthquakeProbability || 0) > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                              (analysis.earthquakeProbability || 0) > 40 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                            }`}>
                              {(analysis.earthquakeProbability || 0) > 70 ? 'High Risk' : (analysis.earthquakeProbability || 0) > 40 ? 'Medium Risk' : 'Low Risk'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                          {analysis.earthquakeProbability || 0}%
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {analysis.earthquakeReason || 'Low seismic activity detected in the region.'}
                        </p>
                        


                        {(analysis.nearestEarthquake || result?.earthquakeData?.nearestEarthquake || (result?.earthquakeData?.features && result.earthquakeData.features.length > 0)) && (
                          <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-l-4 border-orange-400">
                            <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Latest Earthquake Detected:</div>
                            {(() => {
                              const eq = analysis.nearestEarthquake || result?.earthquakeData?.nearestEarthquake || 
                                         (result?.earthquakeData?.features?.[0] && {
                                           magnitude: result.earthquakeData.features[0].properties?.mag,
                                           place: result.earthquakeData.features[0].properties?.place,
                                           time: result.earthquakeData.features[0].properties?.time,
                                           depth: result.earthquakeData.features[0].geometry?.coordinates?.[2],
                                           distance: 'Unknown',
                                           intensity: result.earthquakeData.features[0].properties?.cdi || 'N/A',
                                           felt: result.earthquakeData.features[0].properties?.felt || 0
                                         });
                              if (!eq) return null;
                              return (
                                <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                  <div className="flex justify-between">
                                    <span>Magnitude:</span>
                                    <span className="font-medium text-orange-600 dark:text-orange-400">{eq.magnitude}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Distance:</span>
                                    <span className="font-medium">{eq.distance}km away</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Depth:</span>
                                    <span className="font-medium">{eq.depth}km</span>
                                  </div>
                                  {eq.intensity && eq.intensity !== 'N/A' && (
                                    <div className="flex justify-between">
                                      <span>Intensity:</span>
                                      <span className="font-medium">{eq.intensity}</span>
                                    </div>
                                  )}
                                  {eq.felt > 0 && (
                                    <div className="flex justify-between">
                                      <span>Felt Reports:</span>
                                      <span className="font-medium">{eq.felt}</span>
                                    </div>
                                  )}
                                  <div className="pt-1 border-t border-neutral-200 dark:border-neutral-600">
                                    <div className="font-medium text-neutral-700 dark:text-neutral-300">{eq.place}</div>
                                    <div className="text-neutral-500 dark:text-neutral-500">
                                      {new Date(eq.time).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cyclone Risk Card */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      <div className={`p-4 ${
                        (analysis.cycloneProbability || 0) > 70 ? 'bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700' :
                        (analysis.cycloneProbability || 0) > 40 ? 'bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700' :
                        'bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-neutral-900 dark:text-white">Cyclone Risk</h4>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                              (analysis.cycloneProbability || 0) > 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                              (analysis.cycloneProbability || 0) > 40 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                            }`}>
                              {(analysis.cycloneProbability || 0) > 70 ? 'High Risk' : (analysis.cycloneProbability || 0) > 40 ? 'Medium Risk' : 'Low Risk'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                          {analysis.cycloneProbability || 0}%
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {analysis.cycloneReason || 'No significant cyclonic activity expected in the region.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Environmental Data */}
                  {result && (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">Environmental Conditions</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Temperature */}
                        {result?.weatherData?.current?.temperature_2m !== undefined ? (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Temperature</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current.temperature_2m)}°C
                            </div>
                          </div>
                        ) : result?.weatherData?.current_weather?.temperature !== undefined ? (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Temperature</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current_weather.temperature)}°C
                            </div>
                          </div>
                        ) : null}
                        {(result?.weatherData?.current?.relative_humidity_2m !== undefined || result?.weatherData?.current_weather?.relative_humidity !== undefined) && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Humidity</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current?.relative_humidity_2m || result.weatherData.current_weather?.relative_humidity || 0)}%
                            </div>
                          </div>
                        )}
                        {(result?.weatherData?.current?.pressure_msl !== undefined || result?.weatherData?.current_weather?.pressure !== undefined) && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Pressure</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current?.pressure_msl || result.weatherData.current_weather?.pressure || 1013)} hPa
                            </div>
                          </div>
                        )}
                        {(result?.weatherData?.current?.wind_speed_10m !== undefined || result?.weatherData?.current_weather?.windspeed !== undefined) && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Wind Speed</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current?.wind_speed_10m || result.weatherData.current_weather?.windspeed || 0)} km/h
                            </div>
                          </div>
                        )}
                        {result?.aqiData?.list?.[0]?.main?.aqi && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Air Quality</div>
                            <div className={`text-lg font-bold ${
                              result.aqiData.list[0].main.aqi <= 2 ? 'text-green-600 dark:text-green-400' :
                              result.aqiData.list[0].main.aqi <= 3 ? 'text-orange-600 dark:text-orange-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][result.aqiData.list[0].main.aqi - 1] || 'Unknown'}
                            </div>
                          </div>
                        )}
                        {result?.aqiData?.list?.[0]?.components?.pm2_5 && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">PM2.5</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.aqiData.list[0].components.pm2_5)} μg/m³
                            </div>
                          </div>
                        )}
                        {result?.weatherData?.current?.apparent_temperature !== undefined && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Feels Like</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current.apparent_temperature)}°C
                            </div>
                          </div>
                        )}
                        {result?.aqiData?.list?.[0]?.components?.co && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">CO Level</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.aqiData.list[0].components.co)} μg/m³
                            </div>
                          </div>
                        )}
                        {result?.weatherData?.current?.wind_direction_10m !== undefined && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Wind Direction</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current.wind_direction_10m)}°
                            </div>
                          </div>
                        )}
                        {result?.aqiData?.list?.[0]?.components?.no2 && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">NO₂ Level</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.aqiData.list[0].components.no2)} μg/m³
                            </div>
                          </div>
                        )}
                        {result?.weatherData?.current?.wind_gusts_10m !== undefined && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Wind Gusts</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current.wind_gusts_10m)} km/h
                            </div>
                          </div>
                        )}
                        {result?.aqiData?.list?.[0]?.components?.o3 && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Ozone (O₃)</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.aqiData.list[0].components.o3)} μg/m³
                            </div>
                          </div>
                        )}
                        
                        {/* Air Quality from Open-Meteo */}
                        {result?.airQualityData?.current?.european_aqi && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">EU Air Quality Index</div>
                            <div className={`text-lg font-bold ${
                              result.airQualityData.current.european_aqi <= 20 ? 'text-green-600 dark:text-green-400' :
                              result.airQualityData.current.european_aqi <= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                              result.airQualityData.current.european_aqi <= 60 ? 'text-orange-600 dark:text-orange-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {Math.round(result.airQualityData.current.european_aqi)}
                            </div>
                          </div>
                        )}

                        {/* Elevation */}
                        {result?.elevationData?.elevation && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Elevation</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.elevationData.elevation[0])} m
                            </div>
                          </div>
                        )}

                        {/* UV Index */}
                        {result?.weatherData?.current?.uv_index !== undefined && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">UV Index</div>
                            <div className={`text-lg font-bold ${
                              result.weatherData.current.uv_index <= 2 ? 'text-green-600 dark:text-green-400' :
                              result.weatherData.current.uv_index <= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                              result.weatherData.current.uv_index <= 7 ? 'text-orange-600 dark:text-orange-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {Math.round(result.weatherData.current.uv_index)}
                            </div>
                          </div>
                        )}

                        {/* Cloud Cover */}
                        {result?.weatherData?.current?.cloud_cover !== undefined && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Cloud Cover</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current.cloud_cover)}%
                            </div>
                          </div>
                        )}

                        {/* Visibility */}
                        {result?.weatherData?.current?.visibility !== undefined && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Visibility</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.current.visibility / 1000)} km
                            </div>
                          </div>
                        )}

                        {/* Solar Radiation */}
                        {result?.radiationData?.current?.shortwave_radiation && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Solar Radiation</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.radiationData.current.shortwave_radiation)} W/m²
                            </div>
                          </div>
                        )}

                        {/* Marine Data - Wave Height */}
                        {result?.marineData?.current?.wave_height && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Wave Height</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {result.marineData.current.wave_height.toFixed(1)} m
                            </div>
                          </div>
                        )}

                        {/* Soil Temperature */}
                        {result?.weatherData?.hourly?.soil_temperature_0cm && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Soil Temperature</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.weatherData.hourly.soil_temperature_0cm[0])}°C
                            </div>
                          </div>
                        )}

                        {/* Soil Moisture */}
                        {result?.weatherData?.hourly?.soil_moisture_0_1cm && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Soil Moisture</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {result.weatherData.hourly.soil_moisture_0_1cm[0].toFixed(1)} m³/m³
                            </div>
                          </div>
                        )}

                        {/* Air Quality PM10 */}
                        {result?.airQualityData?.current?.pm10 && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">PM10</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.airQualityData.current.pm10)} μg/m³
                            </div>
                          </div>
                        )}

                        {/* Air Quality PM2.5 from Open-Meteo */}
                        {result?.airQualityData?.current?.pm2_5 && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">PM2.5</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.airQualityData.current.pm2_5)} μg/m³
                            </div>
                          </div>
                        )}

                        {/* Aerosol Optical Depth */}
                        {result?.airQualityData?.current?.aerosol_optical_depth && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Aerosol Optical Depth</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {result.airQualityData.current.aerosol_optical_depth.toFixed(3)}
                            </div>
                          </div>
                        )}

                        {/* Direct Solar Radiation */}
                        {result?.radiationData?.current?.direct_radiation && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Direct Solar Radiation</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.radiationData.current.direct_radiation)} W/m²
                            </div>
                          </div>
                        )}

                        {/* Diffuse Radiation */}
                        {result?.radiationData?.current?.diffuse_radiation && (
                          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Diffuse Radiation</div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {Math.round(result.radiationData.current.diffuse_radiation)} W/m²
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Evacuation Advice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Emergency Evacuation Advice</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {analysis.evacuationAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!analysis && !loading && (
                <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
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
                <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
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
          </div>
        </div>
      </div>
    </div>
  );
}