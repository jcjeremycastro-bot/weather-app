const weatherDescription = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
}

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

const wmoCodeToPath = wmoCode => {
  return (
    iconPath[wmoCodeToIndex.findIndex(codes => codes.includes(wmoCode))] + 'd'
  )
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

    const normalizedData = {
      name: geocodingData.results[0].name,
      sys: {
        country: geocodingData.results[0].country_code,
        sunrise: weatherData.daily.sunrise[0], // Unix timestamp
        sunset: weatherData.daily.sunset[0], // Unix timestamp
      },
      weather: [
        {
          description: weatherDescriptionFR[weatherData.hourly.weather_code[0]], // in French
          icon: wmoCodeToPath(weatherData.hourly.weather_code[0]), // icon path based on WMO code
        },
      ],
      main: {
        temp: weatherData.hourly.temperature_2m[0], // in °C
        feels_like: weatherData.hourly.apparent_temperature[0], // in °C
        humidity: weatherData.hourly.relative_humidity_2m[0], // in %
      },
      wind: {
        speed: weatherData.hourly.wind_speed_10m[0], // in km/h
        deg: weatherData.hourly.wind_direction_10m[0], // in degrees
      },
      visibility: weatherData.hourly.visibility[0], // in meters
      dt: weatherData.hourly.time[0], // Unix timestamp
      timezone: weatherData.utc_offset_seconds, // UTC offset in seconds
    }

    res.status(200).json(normalizedData)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
