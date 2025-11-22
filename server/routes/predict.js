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

    // 1. Get weather data
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
      latitude
    )}&longitude=${encodeURIComponent(
      longitude
    )}&hourly=precipitation,windspeed_10m&current_weather=true&timezone=auto`;
    const weatherResp = await axios.get(weatherURL);
    let weatherData = weatherResp.data || {};

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
      const { weatherData, imageBase64, imageMime } = req.body;

      // Build content for AI analysis
      let content = [
        {
          type: "text",
          text: `You are an emergency response assistant. Based on the following weather data and optional satellite image, return ONLY valid JSON with:
{
  "floodProbability": number (0-100),
  "reason": string (brief explanation),
  "safeZones": [ { "lat": number, "lon": number, "label": string } ],
  "evacuationAdvice": string (practical advice)
}

Weather Data: ${JSON.stringify(weatherData)}`,
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
