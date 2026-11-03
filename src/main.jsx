import {
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { fetchWeather, searchCity } from "./services/weatherApi";
import Detail from "./components/Detail";
import Icon from "./components/Icon";
import Metric from "./components/Metric";

const DEFAULT_CITY = {
  name: "Jakarta",
  country: "Indonesia",
  latitude: -6.2,
  longitude: 106.816666,
};
const copy = {
  en: {
    forecast: "Forecast",
    conditions: "Details",
    about: "About",
    live: "Live weather",
    eyebrow: "YOUR EVERYDAY WEATHER COMPANION",
    title: (
      <>
        Weather,
        <br />
        <em>beautifully</em> simple.
      </>
    ),
    subtitle:
      "A clearer way to understand the sky above you, with reliable forecasts and useful details.",
    search: "Search for a city...",
    searchButton: "Search",
    daylight: "DAYLIGHT",
    sunrise: "Sunrise",
    sunset: "Sunset",
    daylightNote: "Longer days ahead",
    looking: "THE WEEK AHEAD",
    sevenDay: "7-day forecast",
    rightNow: "CURRENT CONDITIONS",
    more: "Weather details",
    aboutLabel: "ABOUT CLIMORA",
    aboutTitle: (
      <>
        A simpler way to <em>read the weather.</em>
      </>
    ),
    aboutText:
      "Climora is a weather app designed to present atmospheric conditions in a clear, concise, and accessible format. Using data from Open-Meteo for the selected location, it brings together current conditions, a seven-day forecast, temperature, humidity, wind speed, and sunrise and sunset times. Climora helps you plan your day with a dependable view of the weather, while recognizing that forecasts can change as atmospheric conditions evolve.",
    copyright: "© 2026 @azizanonerm",
    made: "Weather data by Open-Meteo · Designed for better decisions.",
    feelsLike: "Feels like",
    outside: "It’s a good day to be outside.",
    wind: "Wind",
    humidity: "Humidity",
    visibility: "Visibility",
  },
  id: {
    forecast: "Prakiraan",
    conditions: "Detail",
    about: "Tentang",
    live: "Cuaca terkini",
    eyebrow: "PENDAMPING CUACA HARIAN ANDA",
    title: (
      <>
        Cuaca,
        <br />
        <em>lebih</em> mudah dipahami.
      </>
    ),
    subtitle:
      "Cara yang lebih jelas untuk memahami kondisi langit, dengan prakiraan yang andal dan informasi yang relevan.",
    search: "Cari nama kota...",
    searchButton: "Cari",
    daylight: "SIANG HARI",
    sunrise: "Matahari terbit",
    sunset: "Matahari terbenam",
    daylightNote: "Hari-hari yang lebih panjang",
    looking: "PRAKIRAAN MINGGU INI",
    sevenDay: "Prakiraan 7 hari",
    rightNow: "KONDISI SAAT INI",
    more: "Detail cuaca",
    aboutLabel: "TENTANG CLIMORA",
    aboutTitle: (
      <>
        Cara yang lebih sederhana untuk <em>memahami cuaca.</em>
      </>
    ),
    aboutText:
      "Climora adalah aplikasi cuaca yang menyajikan kondisi atmosfer secara jelas, ringkas, dan mudah dipahami. Dengan menggunakan data Open-Meteo berdasarkan lokasi yang dipilih, Climora merangkum kondisi saat ini, prakiraan tujuh hari, suhu, kelembapan, kecepatan angin, serta waktu matahari terbit dan terbenam. Climora membantu Anda merencanakan aktivitas dengan gambaran cuaca yang dapat diandalkan, meskipun prakiraan dapat berubah seiring dinamika atmosfer.",
    copyright: "© 2026 @azizanonerm",
    made: "Data cuaca dari Open-Meteo · Dirancang untuk keputusan yang lebih baik.",
    feelsLike: "Terasa seperti",
    outside: "Cuaca yang baik untuk beraktivitas di luar.",
    wind: "Angin",
    humidity: "Kelembapan",
    visibility: "Jarak pandang",
  },
};

const weatherMeta = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Heavy showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Storm + hail", "⛈️"],
  99: ["Storm + hail", "⛈️"],
};

const idConditionLabels = {
  0: "Cerah",
  1: "Cerah berawan",
  2: "Berawan sebagian",
  3: "Mendung",
  45: "Berkabut",
  48: "Kabut tebal",
  51: "Gerimis ringan",
  53: "Gerimis",
  55: "Gerimis lebat",
  61: "Hujan ringan",
  63: "Hujan",
  65: "Hujan lebat",
  71: "Salju ringan",
  73: "Salju",
  75: "Salju lebat",
  80: "Hujan lokal",
  81: "Hujan lokal",
  82: "Hujan lokal lebat",
  95: "Badai petir",
  96: "Badai dan hujan es",
  99: "Badai dan hujan es",
};
const getMeta = (code, language = "en") => {
  const meta = weatherMeta[code] || ["Unknown conditions", "🌡️"];
  return [
    language === "id"
      ? idConditionLabels[code] || "Kondisi tidak diketahui"
      : meta[0],
    meta[1],
  ];
};
const formatTime = (value, options = {}, language = "en") =>
  new Intl.DateTimeFormat(
    language === "id" ? "id-ID" : "en-US",
    options,
  ).format(new Date(value));
const formatTemp = (value) => `${Math.round(value)}°`;

function App() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchPanelRef = useRef(null);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("climora-theme") === "dark",
  );
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const loadWeather = useCallback(async (selectedCity) => {
    setLoading(true);
    setError("");
    try {
      setWeather(await fetchWeather(selectedCity));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(city);
  }, [city, loadWeather]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("climora-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!searchPanelRef.current?.contains(event.target)) {
        setSuggestions([]);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setSuggestions([]);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSuggestions([]);
    try {
      setSuggestions(await searchCity(query.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const selectCity = (selected) => {
    setCity(selected);
    setQuery("");
    setSuggestions([]);
  };
  const currentMeta = weather
    ? getMeta(weather.current.weather_code, language)
    : ["Loading", "☀️"];
  const daily = useMemo(
    () =>
      weather?.daily.time.map((date, i) => ({
        date,
        code: weather.daily.weather_code[i],
        max: weather.daily.temperature_2m_max[i],
        min: weather.daily.temperature_2m_min[i],
        rain: weather.daily.precipitation_probability_max[i],
      })) || [],
    [weather],
  );
  const text = copy[language];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Climora home">
          <span className="brand-mark">✦</span>
          <span>climora</span>
        </a>
        <nav>
          <a className="active" href="#forecast">
            {text.forecast}
          </a>
          <a href="#details">{text.conditions}</a>
          <a href="#about">{text.about}</a>
        </nav>
        <div className="topbar-actions">
          <div className="live-pill">
            <span className="live-dot" /> {text.live}
          </div>
          <div className="language-picker" aria-label="Select language">
            <span className="language-label">Language</span>
            <button
              className={
                language === "en"
                  ? "language-option selected"
                  : "language-option"
              }
              onClick={() => setLanguage("en")}
              type="button"
            >
              English
            </button>
            <span className="language-divider">/</span>
            <button
              className={
                language === "id"
                  ? "language-option selected"
                  : "language-option"
              }
              onClick={() => setLanguage("id")}
              type="button"
            >
              Bahasa Indonesia
            </button>
          </div>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p className="hero-subtitle">{text.subtitle}</p>
          </div>
          <div ref={searchPanelRef}>
            <form className="search-wrap" onSubmit={handleSearch} role="search">
              <Icon name="search" />
              <input
                aria-label="Search city"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (!event.target.value.trim()) setSuggestions([]);
                }}
                placeholder={text.search}
              />
              <button type="submit" disabled={searching}>
                {searching
                  ? language === "en"
                    ? "Searching..."
                    : "Mencari..."
                  : text.searchButton}
              </button>
            </form>
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((item) => (
                  <button
                    key={`${item.name}-${item.latitude}`}
                    onClick={() => selectCity(item)}
                  >
                    <Icon name="pin" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {item.admin1 ? `${item.admin1}, ` : ""}
                        {item.country}
                      </small>
                    </span>
                    <Icon name="arrow" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="error-banner" role="alert">
            {error} <button onClick={() => loadWeather(city)}>Try again</button>
          </div>
        )}
        <section className="weather-grid" aria-live="polite">
          <article className="current-card card">
            <div className="card-heading">
              <span className="location">
                <Icon name="pin" /> {city.name}, {city.country}
              </span>
              <span className="date">
                {weather
                  ? formatTime(
                      weather.current.time,
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      },
                      language,
                    )
                  : "Loading..."}
              </span>
            </div>
            {loading ? (
              <div className="skeleton current-skeleton" />
            ) : (
              <>
                <div className="current-main">
                  <div>
                    <span className="weather-emoji large">
                      {currentMeta[1]}
                    </span>
                    <div className="temperature">
                      {formatTemp(weather.current.temperature_2m)}
                    </div>
                    <p>
                      {text.feelsLike}{" "}
                      {formatTemp(weather.current.apparent_temperature)}
                    </p>
                  </div>
                  <div className="condition">
                    <h2>{currentMeta[0]}</h2>
                    <p>{text.outside}</p>
                  </div>
                </div>
                <div className="metric-row">
                  <Metric
                    icon="wind"
                    label={text.wind}
                    value={`${Math.round(weather.current.wind_speed_10m)} km/h`}
                  />
                  <Metric
                    icon="drop"
                    label={text.humidity}
                    value={`${weather.current.relative_humidity_2m}%`}
                  />
                  <Metric icon="eye" label={text.visibility} value="10 km" />
                </div>
              </>
            )}
          </article>

          <aside className="sun-card card">
            <div className="card-heading">
              <span>{text.daylight}</span>
              <span className="sun-icon">☼</span>
            </div>
            <div className="sun-arc">
              <span className="arc-dot" />
            </div>
            <div className="sun-times">
              <div>
                <small>{text.sunrise}</small>
                <strong>
                  {weather
                    ? formatTime(
                        weather.daily.sunrise[0],
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                        language,
                      )
                    : "--:--"}
                </strong>
              </div>
              <div className="sunset">
                <small>{text.sunset}</small>
                <strong>
                  {weather
                    ? formatTime(
                        weather.daily.sunset[0],
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                        language,
                      )
                    : "--:--"}
                </strong>
              </div>
            </div>
            <p className="daylight-note">
              {text.daylightNote} <span>↗</span>
            </p>
          </aside>
        </section>

        <section className="forecast-section" id="forecast">
          <div className="section-title">
            <div>
              <p className="eyebrow">{text.looking}</p>
              <h2>{text.sevenDay}</h2>
            </div>
            <span className="timezone">
              {language === "en" ? "Timezone" : "Zona waktu"}:{" "}
              {weather?.timezone_abbreviation || "Local"}
            </span>
          </div>
          <div className="forecast-list">
            {daily.map((item, index) => {
              const meta = getMeta(item.code, language);
              return (
                <div
                  className={`forecast-row ${index === 0 ? "today" : ""}`}
                  key={item.date}
                >
                  <div className="day-name">
                    <strong>
                      {index === 0
                        ? language === "en"
                          ? "Today"
                          : "Hari ini"
                        : formatTime(item.date, { weekday: "short" }, language)}
                    </strong>
                    <small>
                      {formatTime(
                        item.date,
                        {
                          month: "short",
                          day: "numeric",
                        },
                        language,
                      )}
                    </small>
                  </div>
                  <span className="weather-emoji">{meta[1]}</span>
                  <div className="day-condition">
                    {meta[0]}
                    {item.rain > 0 && (
                      <small>
                        {" "}
                        · {item.rain}% {language === "en" ? "rain" : "hujan"}
                      </small>
                    )}
                  </div>
                  <div className="bar">
                    <span style={{ width: `${Math.max(12, item.rain)}%` }} />
                  </div>
                  <div className="temps">
                    <strong>{formatTemp(item.max)}</strong>
                    <span>{formatTemp(item.min)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="details-section" id="details">
          <div className="section-title">
            <div>
              <p className="eyebrow">{text.rightNow}</p>
              <h2>{text.more}</h2>
            </div>
          </div>
          <div className="details-grid">
            <Detail
              icon="drop"
              label={language === "en" ? "Precipitation" : "Curah hujan"}
              value={`${weather?.current.precipitation || 0} mm`}
              hint={
                language === "en"
                  ? "in the last hour"
                  : "dalam satu jam terakhir"
              }
            />
            <Detail
              icon="wind"
              label={language === "en" ? "Wind speed" : "Kecepatan angin"}
              value={`${Math.round(weather?.current.wind_speed_10m || 0)} km/h`}
              hint={
                language === "en" ? "steady breeze" : "hembusan angin stabil"
              }
            />
            <Detail
              icon="eye"
              label={language === "en" ? "UV index" : "Indeks UV"}
              value={language === "en" ? "Moderate" : "Sedang"}
              hint={
                language === "en" ? "wear sunscreen" : "gunakan tabir surya"
              }
            />
          </div>
        </section>
        <section className="about-section" id="about">
          <div className="about-label">
            <p className="eyebrow">{text.aboutLabel}</p>
            <span>✦</span>
          </div>
          <div className="about-content">
            <h2>{text.aboutTitle}</h2>
            <p>{text.aboutText}</p>
          </div>
        </section>
      </main>
      <footer>
        <span className="copyright-line">
          {text.copyright}
          <a
            className="github-link"
            href="https://github.com/azizanonerm"
            target="_blank"
            rel="noreferrer"
            aria-label="Open azizanonerm GitHub profile"
            title="GitHub — @azizanonerm"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </span>
        <span>{text.made}</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
