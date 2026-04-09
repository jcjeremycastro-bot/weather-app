const weatherDescriptionFR = {
  0: 'Ciel dégagé',
  1: 'Plutôt dégagé',
  2: 'Partiellement nuageux',
  3: 'Ciel couvert',
  45: 'Brouillard',
  48: 'Brouillard givrant avec dépôt',
  51: 'Bruine légère',
  53: 'Bruine modérée',
  55: 'Bruine dense',
  56: 'Bruine légère verglaçante',
  57: 'Bruine dense verglaçante',
  61: 'Pluie légère',
  63: 'Pluie modérée',
  65: 'Pluie forte',
  66: 'Pluie légère verglaçante',
  67: 'Pluie forte verglaçante',
  71: 'Chute de neige légère',
  73: 'Chute de neige modérée',
  75: 'Chute de neige forte',
  77: 'Grêlons',
  80: 'Averses de pluie légères',
  81: 'Averses de pluie modérées',
  82: 'Averses de pluie violentes',
  85: 'Averses de neige légères',
  86: 'Averses de neige fortes',
  95: 'Orage',
  96: 'Orage avec grêle légère',
  99: 'Orage avec grêle forte',
}
const iconPath = ['01', '02', '03', '04', '09', '11', '13', '50']
const wmoCodeToIndex = [
  [0], // clear sky
  [1], // few clouds -> mainly clear
  [2], // scattered clouds -> partly cloudy
  [3], // broken clouds -> overcast
  [51, 53, 55, 61, 63, 65, 80, 81, 82], // rain
  [95, 96, 99], // thunderstorm
  [56, 57, 66, 67, 71, 73, 75, 77, 85, 86], // snow
  [45, 48], // mist
]

const isDaytime = (currentTime, sunrise, sunset) => {
  return currentTime >= sunrise && currentTime < sunset
}

const wmoCodeToPath = (wmoCode, isDaytime = true) => {
  const index = wmoCodeToIndex.findIndex(codes => codes.includes(wmoCode))
  if (index < 2 && !isDaytime)
    return iconPath[index] + 'n' // For clear sky and few clouds, use daytime or nighttime icons
  else return iconPath[index] + 'd'
}

export default async function handler(req, res) {
  const { cityInput } = req.body

  try {
    const getCityGeocoding = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}&count=1&language=fr&format=json&countryCode=FR`,
    )
    const geocodingData = await getCityGeocoding.json()

    if (!geocodingData.results || geocodingData.results.length === 0) {
      return res.status(404).json({ message: 'City not found' })
    }

    const getWeatherData = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geocodingData.results[0].latitude}&longitude=${geocodingData.results[0].longitude}&daily=sunrise,sunset&hourly=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,visibility&timezone=${geocodingData.results[0].timezone}&forecast_days=1&forecast_hours=1&timeformat=unixtime`,
    )
    const weatherData = await getWeatherData.json()

    if (!weatherData) {
      return res.status(500).json({ message: 'Failed to fetch weather data' })
    }

    const icon = wmoCodeToPath(
      weatherData.hourly.weather_code[0],
      isDaytime(
        weatherData.hourly.time[0],
        weatherData.daily.sunrise[0],
        weatherData.daily.sunset[0],
      ),
    )

    const normalizedData = {
      name: geocodingData.results[0].name,
      timezone: weatherData.utc_offset_seconds, // UTC offset in seconds
      temperature: weatherData.hourly.temperature_2m[0], // in °C
      apparent_temperature: weatherData.hourly.apparent_temperature[0], // in °C
      sunrise: weatherData.daily.sunrise[0], // Unix timestamp
      sunset: weatherData.daily.sunset[0], // Unix timestamp
      humidity: weatherData.hourly.relative_humidity_2m[0], // in %
      visibility: weatherData.hourly.visibility[0], // in meters
      weather: {
        description: weatherDescriptionFR[weatherData.hourly.weather_code[0]], // in French
        icon, // icon path based on WMO code
      },

      wind: {
        speed: weatherData.hourly.wind_speed_10m[0], // in km/h
        deg: weatherData.hourly.wind_direction_10m[0], // in degrees
      },
    }

    res.status(200).json(normalizedData)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
