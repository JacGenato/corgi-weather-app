import { useState, useEffect, useRef } from "react";
import sunnyDay from "./assets/sunnyday.png";
import cloudyDay from "./assets/cloudyDay.png";
import fogDay from "./assets/sunnyday.png";
import rainyDay from "./assets/rainyDay.png";
import snowDay from "./assets/snowyDay.png";
import stormDay from "./assets/thunderstorm.png";
import corgiSunny from "./assets/corgi-sunny.gif";
import corgiSleepy from "./assets/corgi-sleepy.gif";
import corgiRainy from "./assets/corgi-rainy.gif";
import corgiWinter from "./assets/corgi-winter.gif";

const WMO_CODES = {
  0:  { label: "Clear Sky",                      icon: "☀️",  bg: sunnyDay,  corgi: corgiSunny  },
  1:  { label: "Mainly Clear",                   icon: "🌤️", bg: sunnyDay,  corgi: corgiSunny  },
  2:  { label: "Partly Cloudy",                  icon: "⛅",  bg: cloudyDay, corgi: corgiSleepy },
  3:  { label: "Overcast",                       icon: "☁️",  bg: cloudyDay, corgi: corgiSleepy },
  45: { label: "Foggy",                          icon: "🌫️", bg: fogDay,    corgi: corgiSleepy },
  48: { label: "Icy Fog",                        icon: "🌫️", bg: fogDay,    corgi: corgiWinter },
  51: { label: "Light Drizzle",                  icon: "🌦️", bg: rainyDay,  corgi: corgiRainy  },
  53: { label: "Drizzle",                        icon: "🌦️", bg: rainyDay,  corgi: corgiRainy  },
  55: { label: "Heavy Drizzle",                  icon: "🌧️", bg: rainyDay,  corgi: corgiRainy  },
  56: { label: "Light Freezing Drizzle",         icon: "🌧️", bg: snowDay,   corgi: corgiWinter },
  57: { label: "Heavy Freezing Drizzle",         icon: "🌧️", bg: snowDay,   corgi: corgiWinter },
  61: { label: "Light Rain",                     icon: "🌧️", bg: rainyDay,  corgi: corgiRainy  },
  63: { label: "Rain",                           icon: "🌧️", bg: rainyDay,  corgi: corgiRainy  },
  65: { label: "Heavy Rain",                     icon: "🌧️", bg: rainyDay,  corgi: corgiRainy  },
  66: { label: "Light Freezing Rain",            icon: "🌨️", bg: snowDay,   corgi: corgiWinter },
  67: { label: "Heavy Freezing Rain",            icon: "🌨️", bg: snowDay,   corgi: corgiWinter },
  71: { label: "Light Snow",                     icon: "🌨️", bg: snowDay,   corgi: corgiWinter },
  73: { label: "Snow",                           icon: "❄️",  bg: snowDay,   corgi: corgiWinter },
  75: { label: "Heavy Snow",                     icon: "❄️",  bg: snowDay,   corgi: corgiWinter },
  77: { label: "Snow Grains",                    icon: "🌨️", bg: snowDay,   corgi: corgiWinter },
  80: { label: "Light Rain Showers",             icon: "🌦️", bg: rainyDay,  corgi: corgiRainy  },
  81: { label: "Moderate Rain Showers",          icon: "🌦️", bg: rainyDay,  corgi: corgiRainy  },
  82: { label: "Violent Rain Showers",           icon: "🌧️", bg: rainyDay,  corgi: corgiRainy  },
  85: { label: "Light Snow Showers",             icon: "🌨️", bg: snowDay,   corgi: corgiWinter },
  86: { label: "Heavy Snow Showers",             icon: "❄️",  bg: snowDay,   corgi: corgiWinter },
  95: { label: "Thunderstorm",                   icon: "⛈️",  bg: stormDay,  corgi: corgiRainy  },
  96: { label: "Thunderstorm with Light Hail",   icon: "⛈️",  bg: stormDay,  corgi: corgiRainy  },
  99: { label: "Thunderstorm with Heavy Hail",   icon: "⛈️",  bg: stormDay,  corgi: corgiRainy  },
};

const CITIES = {
  Manila: { lat: 14.6042, lon: 120.9822 },
  "Quezon City": { lat: 14.6488, lon: 121.0509 },
  "Tokyo": { lat: 35.6895, lon: 139.6917 }
};

function WindDir(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}


export default function WeatherApp() {
  const [coords, setCoords] = useState({ lat: 14.5995, lon: 120.9842 }); // Manila default
  const [city, setCity] = useState("Manila");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C");
  const toF = (c) => Math.round(c * 9/5 + 32);
  const temp = (c) => unit === "C" ? `${Math.round(c)}°C` : `${toF(c)}°F`;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(val), 300);
  };

  const handleSelect = (result) => {
    setCity(result.name);
    setCoords({ lat: result.latitude, lon: result.longitude });
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

 async function searchCities (q) {
    if (q.length < 2) return setSuggestions([]);
    setIsSearching(true);
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
    );
    const data = await res.json();
    setSuggestions(data.results ?? []);
    setIsSearching(false);
  };

  async function fetchWeather() {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weathercode,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      console.log("Weather data:", data);
      setWeather(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather();
  }, [coords]);

  
  const handleCity = (c) => {
    setCity(c);
    fetchWeather(c);
  };

  function getWeatherInfo(code, temp) {
    const base = WMO_CODES[code];
    
    // Override bg/corgi for cold overcast
    if (temp < 0) {
      return { ...base, bg: snowDay, corgi: corgiWinter };
    }
    
    return base;
}

  const wmo = weather ? (getWeatherInfo(weather.current.weathercode, weather.current.apparent_temperature) || { label: "Unknown", icon: "🌡️" }) : null;

  const dayLabels = ["Today", "Tomorrow", "Wed", "Thu", "Fri"];
  const getDayLabel = (isoDate, i) => {
    if (i === 0) return "Today";
    if (i === 1) return "Tmrw";
    return new Date(isoDate).toLocaleDateString("en", { weekday: "short" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Press Start 2P', 'DM Sans', sans-serif",
      padding: "20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>
            Weather
          </h1>
          <button
            onClick={() => setUnit(u => u === "C" ? "F" : "C")}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", borderRadius: 20, padding: "4px 14px", cursor: "pointer",
              fontFamily: 'Press Start 2P', fontSize: 13,
            }}
          >
            °{unit === "C" ? "F" : "C"}
          </button>
        </div>

        {/* City selector */}
        <div style={{ position: "relative", marginBottom: 20,  }}>
          <input
            style={{
              width: "100%", padding: "10px 16px", borderRadius: 20, border: "none",
              fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              background: "rgba(255,255,255,0.12)", color: "#fff",
            }}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // delay so click fires first
            placeholder="Search city..."
          />

          {showDropdown && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "#1e1b4b", borderRadius: 12, marginTop: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)", zIndex: 100,
              overflow: "hidden",
            }}>
              {suggestions.map((s) => (
                <div
                  key={`${s.latitude}-${s.longitude}`}
                  onMouseDown={() => handleSelect(s)}  // mouseDown fires before onBlur
                  style={{ padding: "10px 16px", cursor: "pointer" }}
                >
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>{s.admin1}, {s.country}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main card */}
        {loading && (
          <div style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", padding: 60, fontSize: 15 }}>
            Loading…
          </div>
        )}

        {error && (
          <div style={{ color: "#ff8080", textAlign: "center", padding: 30, background: "rgba(255,0,0,0.1)", borderRadius: 16 }}>
            {error}
          </div>
        )}

        {!loading && weather && (
          <>
            <div style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",          
              border: "1px solid rgba(255,255,255,0.15)",
              marginBottom: 12,
              backgroundImage: `url(${wmo.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}>

              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "28px 28px 10px",
                minHeight: "clamp(220px, 40vw, 380px)",  // responsive height
              }}>

                {/* City + temp */}
                <div style={{ color: "#000", fontSize: 14, marginBottom: 4 }}>{city}</div>
                <div style={{ color: "#000", fontSize: "clamp(40px, 10vw, 68px)", fontWeight: 300, lineHeight: 1, marginTop: 20 }}>
                  {temp(weather.current.temperature_2m)}
                </div>

                {/* Overlay image — scales with container, not fixed px */}
                <img
                  src={`${wmo.corgi}`}
                  alt="overlay"
                  style={{
                    width: "clamp(220px, 165%, 440px)",
                    minHeight: 260,
                    height: "auto",                        // let aspect ratio breathe
                    objectFit: "contain",
                    display: "block",
                  }}
                />

                {/* Condition label */}
                <div style={{ color: "#fff", fontSize: "clamp(14px, 4vw, 18px)", fontWeight: 50, }}>
                  {wmo.label}
                </div>
                <div style={{ color: "#fff", fontSize: "clamp(12px, 3vw, 13px)" }}>
                  Feels like {temp(weather.current.apparent_temperature)}
                </div>

              </div>
            </div>

            {/* 5-day forecast */}
            <div style={{
              background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: "16px 20px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
                5-Day Forecast
              </div>
              {weather.daily.time.slice(0, 5).map((date, i) => {
                const dc = WMO_CODES[weather.daily.weathercode[i]] || { icon: "🌡️" };
                return (
                  <div key={date} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, width: 50 }}>
                      {getDayLabel(date, i)}
                    </div>
                    <div style={{ fontSize: 22 }}>{dc.icon}</div>
                    <div style={{ display: "flex", gap: 12, fontFamily: "'Press Start 2P', 'DM Mono', monospace", fontSize: 13 }}>
                      <span style={{ color: "#fff", fontWeight: 500 }}>{temp(weather.daily.temperature_2m_max[i])}</span>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{temp(weather.daily.temperature_2m_min[i])}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
