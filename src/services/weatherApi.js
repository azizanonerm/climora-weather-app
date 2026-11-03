const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1";

export async function fetchWeather(city) {
  const params = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: "auto",
    forecast_days: 7,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
  });
  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  if (!response.ok) throw new Error("Weather data is temporarily unavailable.");
  return response.json();
}

export async function searchCity(query) {
  const params = new URLSearchParams({
    name: query,
    count: 5,
    language: "en",
    format: "json",
  });
  const response = await fetch(`${GEOCODING_BASE}/search?${params}`);
  if (!response.ok) throw new Error("Could not search for that city.");
  const data = await response.json();
  return (data.results || []).map((item) => ({
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}
