import { useState, useEffect } from "react";
import sunnyDay from "./assets/sunnyday.png";
import overlayImg from "./assets/corgi-sunny.png";

const WMO_CODES = {
  0: { label: "Clear Sky", icon: "☀️" },
  1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy Drizzle", icon: "🌧️" },
  61: { label: "Light Rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "🌧️" },
  71: { label: "Light Snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy Snow", icon: "❄️" },
  80: { label: "Rain Showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

const CITIES = {
  Manila: { lat: 14.6042, lon: 120.9822 }
};

function WindDir(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function WeatherApp() {
  const [city, setCity] = useState("Manila");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C");

  const toF = (c) => Math.round(c * 9/5 + 32);
  const temp = (c) => unit === "C" ? `${Math.round(c)}°C` : `${toF(c)}°F`;

  async function fetchWeather(selectedCity) {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = CITIES[selectedCity];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weathercode,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const wmo = weather ? (WMO_CODES[weather.current.weathercode] || { label: "Unknown", icon: "🌡️" }) : null;

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
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20,
        }}>
          {Object.keys(CITIES).map(c => (
            <div style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 13, fontFamily: "'Press Start 2P', 'DM Sans', sans-serif", fontWeight: 500,
              background: city === c ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.12)",
              color: city === c ? "#302b63" : "rgba(255,255,255,0.8)",
              transition: "all 0.2s",
            }}>{c}</div>
          ))}
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
            {/* Current weather */}
            <div style={{
              position: "relative", 
              minHeight: "40vh",
              backgroundImage: `url(${sunnyDay})`,
              backgroundSize: "cover",        // fill the element
              backgroundRepeat: "no-repeat",  // don't tile
              backdropFilter: "blur(20px)",
              borderRadius: 24, padding: "28px 28px 24px",
              border: "1px solid rgba(255,255,255,0.15)", marginBottom: 12,
            }}>

              {/* Card div — add overflow hidden */}
              <div style={{
                overflow: "hidden",   // clips the image at the card boundary
                // ...rest of your card styles
              }}>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "30vh",
                }}>
                  <div>
                    <div style={{ color: "#000000", fontSize: 14, marginBottom: 4 }}>{city}</div>
                    <div style={{ color: "#000000", fontSize: 68, fontWeight: 300, lineHeight: 1, marginBottom: 4 }}>
                      {temp(weather.current.temperature_2m)}
                    </div>
                
               
                  </div>

                  <img src={overlayImg}
                    alt="overlay"
                    style={{
                      width: 320,        
                      height: 325,
                      objectFit: "contain",
                    }}
                  />
                    <div style={{ position: "relative",}}>           
                      <div style={{ color: "#ffffff", fontSize: 20, fontWeight: 500 }}>
                        {wmo.label}
                      </div>

                      <div style={{ color: "#ffffff", fontSize: 15}}>
                        Feels like {temp(weather.current.apparent_temperature)}
                      </div>

                    </div>
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

            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", marginTop: 12 }}>
              Data: Open-Meteo · No API key required
            </div>
          </>
        )}
      </div>
    </div>
  );
}
