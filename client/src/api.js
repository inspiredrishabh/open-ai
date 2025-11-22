import axios from "axios";

// Use environment variable or fallback to production URL
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD
    ? "https://flood-risk-server.onrender.com" // Replace with your actual server URL
    : "http://localhost:5000");

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
    const resp = await axios.post(`${API_BASE}/api/analyze`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return resp.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
