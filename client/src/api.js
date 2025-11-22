import axios from "axios";

// Use environment variable or fallback to production URL
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD
    ? "https://open-ai-buildathon-sever.onrender.com"
    : "http://localhost:5000");

console.log("API Base URL:", API_BASE);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export async function analyze({
  latitude,
  longitude,
  file,
  simulateRainfall = 1,
  useNASA = "true",
  date = "",
}) {
  const fd = new FormData();
  fd.append("latitude", latitude);
  fd.append("longitude", longitude);
  fd.append("simulateRainfall", simulateRainfall);
  fd.append("useNASA", useNASA);
  if (date) fd.append("date", date);
  if (file) fd.append("satelliteImage", file);

  try {
    console.log("Making API request to:", `${API_BASE}/api/analyze`);
    const resp = await apiClient.post("/api/analyze", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return resp.data;
  } catch (error) {
    console.error("API Error:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);

    if (
      error.code === "NETWORK_ERR" ||
      error.message.includes("Network Error")
    ) {
      throw new Error(
        `Network error: Unable to connect to server at ${API_BASE}`
      );
    }

    throw error;
  }
}

export async function aiAnalyze({ weatherData, earthquakeData, aqiData, airQualityData, elevationData, marineData, climateData, radiationData, imageBase64, imageMime }) {
  try {
    console.log("Making AI analysis request to:", `${API_BASE}/api/ai-analyze`);
    const resp = await apiClient.post("/api/ai-analyze", {
      weatherData,
      earthquakeData,
      aqiData,
      airQualityData,
      elevationData,
      marineData,
      climateData,
      radiationData,
      imageBase64,
      imageMime,
    });
    return resp.data;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
