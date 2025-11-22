// server/routes/predict.js
import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const router = express.Router();

// Initialize OpenAI client for NVIDIA API
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

router.post("/analyze", upload.single("satelliteImage"), async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      simulateRainfall = 1,
      useNASA = "true",
      date,
    } = req.body;
    if (!latitude || !longitude)
      return res.status(400).json({ error: "latitude and longitude required" });

    // 1. Get comprehensive weather and environmental data from multiple APIs
    let weatherData = {};
    let airQualityData = {};
    let elevationData = {};
    let marineData = {};
    let climateData = {};
    let radiationData = {};

    try {
      // Main weather forecast API
      const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover,visibility,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,soil_temperature_0cm,soil_moisture_0_1cm&current_weather=true&timezone=auto&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max&forecast_days=3`;
      const weatherResp = await axios.get(weatherURL);
      weatherData = weatherResp.data || {};
    } catch (err) {
      console.warn("Weather data fetch failed:", err.message);
    }

    try {
      // Air Quality API
      const airQualityURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,ammonia&hourly=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&forecast_days=1`;
      const airQualityResp = await axios.get(airQualityURL);
      airQualityData = airQualityResp.data || {};
    } catch (err) {
      console.warn("Air quality data fetch failed:", err.message);
    }

    try {
      // Elevation API
      const elevationURL = `https://api.open-meteo.com/v1/elevation?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}`;
      const elevationResp = await axios.get(elevationURL);
      elevationData = elevationResp.data || {};
    } catch (err) {
      console.warn("Elevation data fetch failed:", err.message);
    }

    try {
      // Marine API (if coordinates are near water)
      const marineURL = `https://marine-api.open-meteo.com/v1/marine?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&daily=wave_height_max,wave_direction_dominant,wave_period_max,wind_wave_height_max,swell_wave_height_max&forecast_days=1`;
      const marineResp = await axios.get(marineURL);
      marineData = marineResp.data || {};
    } catch (err) {
      console.warn("Marine data fetch failed (likely not coastal):", err.message);
    }

    try {
      // Climate API for historical context
      const climateURL = `https://climate-api.open-meteo.com/v1/climate?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,snowfall_sum,pressure_msl_mean,cloud_cover_mean,wind_speed_10m_mean,wind_speed_10m_max&start_date=2023-01-01&end_date=2023-12-31`;
      const climateResp = await axios.get(climateURL);
      climateData = climateResp.data || {};
    } catch (err) {
      console.warn("Climate data fetch failed:", err.message);
    }

    try {
      // Satellite Radiation API
      const radiationURL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&current=shortwave_radiation,direct_radiation,diffuse_radiation,direct_normal_irradiance,terrestrial_radiation&daily=shortwave_radiation_sum,et0_fao_evapotranspiration&forecast_days=1`;
      const radiationResp = await axios.get(radiationURL);
      radiationData = radiationResp.data || {};
    } catch (err) {
      console.warn("Radiation data fetch failed:", err.message);
    }

    // 1.1. Get comprehensive earthquake data from USGS
    let earthquakeData = null;
    try {
      const earthquakeURL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&maxradiuskm=1000&limit=20&orderby=time&minmagnitude=2.5`;
      const earthquakeResp = await axios.get(earthquakeURL);
      earthquakeData = earthquakeResp.data;
      
      // Process nearest earthquake with more details
      if (earthquakeData.features && earthquakeData.features.length > 0) {
        const nearest = earthquakeData.features[0];
        const coords = nearest.geometry.coordinates;
        const props = nearest.properties;
        
        // Calculate distance
        const distance = Math.sqrt(
          Math.pow((coords[1] - parseFloat(latitude)) * 111, 2) + 
          Math.pow((coords[0] - parseFloat(longitude)) * 111, 2)
        );
        
        earthquakeData.nearestEarthquake = {
          magnitude: props.mag,
          place: props.place,
          time: new Date(props.time).toISOString(),
          depth: coords[2],
          distance: Math.round(distance),
          intensity: props.cdi || 'N/A',
          felt: props.felt || 0,
          tsunami: props.tsunami || 0,
          significance: props.sig || 0,
          url: props.url
        };
      }
    } catch (err) {
      console.warn("Earthquake data fetch failed:", err.message);
      earthquakeData = { features: [], nearestEarthquake: null };
    }

    // 1.2. Get Air Quality Index (AQI) data
    let aqiData = null;
    try {
      const aqiURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${encodeURIComponent(
        latitude
      )}&lon=${encodeURIComponent(
        longitude
      )}&appid=${process.env.OPENWEATHER_API_KEY || 'demo'}`;
      
      if (process.env.OPENWEATHER_API_KEY) {
        const aqiResp = await axios.get(aqiURL);
        aqiData = aqiResp.data;
      } else {
        // Demo AQI data if no API key
        aqiData = {
          list: [{
            main: { aqi: 2 },
            components: {
              co: 233.7,
              no: 0.01,
              no2: 2.73,
              o3: 68.66,
              so2: 0.64,
              pm2_5: 0.5,
              pm10: 0.59,
              nh3: 0.12
            }
          }]
        };
      }
    } catch (err) {
      console.warn("AQI data fetch failed:", err.message);
      aqiData = null;
    }

    // 2. Demo override for simulation
    const simFactor = Number(simulateRainfall || 1);
    if (simFactor > 1.5) {
      if (!weatherData.current_weather) weatherData.current_weather = {};
      weatherData.current_weather.precipitation = 150.5;
      weatherData.current_weather.windspeed = 85.0;
      weatherData.simulation_note = `Forced disaster values due to simulateRainfall=${simFactor}`;
    } else if (simFactor !== 1) {
      weatherData.simulation_note = `Simulated precipitation scale: ${simFactor}`;
      if (
        weatherData.current_weather &&
        weatherData.current_weather.precipitation !== undefined
      ) {
        weatherData.current_weather.precipitation *= simFactor;
      }
    }

    // 3. Get image: uploaded -> NASA -> fallback
    let imageBase64 = null;
    let imageMime = null;
    if (req.file && req.file.buffer) {
      imageBase64 = req.file.buffer.toString("base64");
      imageMime = req.file.mimetype;
    } else if (useNASA === "true") {
      try {
        const nasaImg = await fetchBrowseImagery(
          Number(latitude),
          Number(longitude),
          date || null
        );
        imageBase64 = nasaImg.buffer.toString("base64");
        imageMime = nasaImg.contentType || "image/jpeg";
      } catch (e) {
        console.warn("Browse imagery fetch failed:", e.message);
        const fallbackPath = path.join(
          process.cwd(),
          "server",
          "assets",
          "default_satellite.jpg"
        );
        if (fs.existsSync(fallbackPath)) {
          const buf = fs.readFileSync(fallbackPath);
          imageBase64 = buf.toString("base64");
          imageMime = "image/jpeg";
        } else {
          imageBase64 = null;
        }
      }
    }

    return res.json({
      weatherData,
      earthquakeData,
      aqiData,
      airQualityData,
      elevationData,
      marineData,
      climateData,
      radiationData,
      usedImage: !!imageBase64,
      imageDataUrl:
        imageBase64 && imageMime
          ? `data:${imageMime};base64,${imageBase64.slice(0, 8000)}...`
          : null,
      imageBase64: imageBase64,
      imageMime: imageMime,
    });
  } catch (err) {
    console.error(
      "Error /api/analyze:",
      err?.response?.data || err.message || err
    );
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

// New AI analysis endpoint
router.post(
  "/ai-analyze",
  express.json({ limit: "50mb" }),
  async (req, res) => {
    try {
      const { weatherData, earthquakeData, aqiData, airQualityData, elevationData, marineData, climateData, radiationData, imageBase64, imageMime } = req.body;

      // Build content for AI analysis
      let content = [
        {
          type: "text",
          text: `You are an emergency response assistant. Based on comprehensive environmental data from multiple APIs including weather, earthquakes, air quality, elevation, marine conditions, climate data, and solar radiation, return ONLY valid JSON with:
{
  "floodProbability": number (0-100),
  "earthquakeProbability": number (0-100),
  "cycloneProbability": number (0-100),
  "floodReason": string (brief explanation considering elevation and marine data),
  "earthquakeReason": string (brief explanation including seismic activity and elevation),
  "cycloneReason": string (brief explanation considering marine conditions and radiation),
  "safeZones": [ { "lat": number, "lon": number, "label": string } ],
  "evacuationAdvice": string (comprehensive practical advice considering all environmental factors),
  "nearestEarthquake": { "magnitude": number, "distance": number, "time": string, "place": string, "depth": number, "intensity": string, "felt": number } or null,
  "environmentalSummary": string (brief summary of current environmental conditions)
}

Weather Data: ${JSON.stringify(weatherData)}
Earthquake Data: ${JSON.stringify(earthquakeData)}
Air Quality Data (OpenWeather): ${JSON.stringify(aqiData)}
Air Quality Data (Open-Meteo): ${JSON.stringify(airQualityData)}
Elevation Data: ${JSON.stringify(elevationData)}
Marine Data: ${JSON.stringify(marineData)}
Climate Data: ${JSON.stringify(climateData)}
Solar Radiation Data: ${JSON.stringify(radiationData)}`,
        },
      ];

      // Add image if available
      if (imageBase64 && imageMime) {
        content.push({
          type: "image_url",
          image_url: {
            url: `data:${imageMime};base64,${imageBase64}`,
          },
        });
      }

      const messages = [
        {
          role: "system",
          content:
            "You are a disaster response AI. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: content,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: "nvidia/nemotron-nano-12b-v2-vl",
        messages: messages,
        max_tokens: 4096,
        temperature: 0.7,
        stream: false,
      });

      const aiResponse = completion.choices[0]?.message?.content || "";

      // Parse JSON response
      let analysis;
      try {
        analysis = JSON.parse(aiResponse);
      } catch (parseError) {
        // Try to extract JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[0]);
          } catch (e) {
            analysis = {
              floodProbability: 50,
              reason: "Unable to parse AI response",
              safeZones: [],
              evacuationAdvice: "Follow local emergency guidelines",
              raw: aiResponse,
            };
          }
        } else {
          analysis = {
            floodProbability: 50,
            reason: "Unable to parse AI response",
            safeZones: [],
            evacuationAdvice: "Follow local emergency guidelines",
            raw: aiResponse,
          };
        }
      }

      return res.json(analysis);
    } catch (error) {
      console.error("AI Analysis error:", error);
      return res.status(500).json({
        error: "AI analysis failed",
        details: error.message,
      });
    }
  }
);

async function fetchBrowseImagery(lat, lon, date = null) {
  const PRODUCTS = [
    "S2MSI1C",
    "S2MSI2A",
    "VIIRS_SNPP_CorrectedReflectance",
    "MODIS_Terra_CorrectedReflectance_TrueColor",
    "MODIS_Aqua_CorrectedReflectance_TrueColor",
    "MOD09GA",
    "MOD09GQ",
    "LANDSAT_8_C1",
    "LANDSAT_OT_L1G",
  ];
  const EXPANSIONS = [0, 0.15, 0.3, 0.6];
  const base = "https://cmr.earthdata.nasa.gov/search/granules.json";

  const temporal = date
    ? `${date}T00:00:00Z,${date}T23:59:59Z`
    : (() => {
        const end = new Date();
        const start = new Date();
        start.setUTCDate(start.getUTCDate() - 7);
        const fmt = (d) => d.toISOString().split("T")[0];
        return `${fmt(start)}T00:00:00Z,${fmt(end)}T23:59:59Z`;
      })();

  for (const prod of PRODUCTS) {
    for (const exp of EXPANSIONS) {
      const bbox = [
        (lon - exp).toFixed(5),
        (lat - exp).toFixed(5),
        (lon + exp).toFixed(5),
        (lat + exp).toFixed(5),
      ].join(",");
      try {
        const resp = await axios.get(base, {
          params: {
            short_name: prod,
            bounding_box: bbox,
            temporal,
            page_size: 30,
          },
          headers: { "User-Agent": "disaster-poc/1.0" },
          timeout: 25000,
        });
        const granules = resp.data?.feed?.entry || [];
        for (const g of granules) {
          const links = g.links || [];
          let link =
            links.find(
              (l) =>
                (l.rel && l.rel.toLowerCase().includes("browse")) ||
                (l.type && l.type.startsWith("image/"))
            ) || links.find((l) => l.type && l.type.includes("image"));
          if (!link) continue;
          let href = link.href || link.url;
          if (!href) continue;
          if (href.startsWith("/"))
            href = "https://cmr.earthdata.nasa.gov" + href;
          try {
            const img = await axios.get(href, { responseType: "arraybuffer" });
            if (img.status === 200) {
              return {
                buffer: Buffer.from(img.data),
                contentType: img.headers["content-type"] || "image/jpeg",
              };
            }
          } catch {
            // continue
          }
        }
      } catch {
        // continue
      }
    }
  }
  throw new Error("No browse imagery found");
}

export default router;
