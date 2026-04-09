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
          description: 'Weather description',
          icon: '01d',
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
