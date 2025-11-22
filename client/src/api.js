import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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
  const resp = await axios.post(`${API_BASE}/api/analyze`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return resp.data;
}
