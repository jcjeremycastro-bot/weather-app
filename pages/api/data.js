export default async function handler(req, res) {
  const { cityInput } = req.body

  const getCityGeocoding = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}&count=1&language=fr&format=json&countryCode=FR`,
  )
  const geocodingData = await getCityGeocoding.json()

  if (!geocodingData.results || geocodingData.results.length === 0) {
    return res.status(404).json({ message: 'City not found' })
  }

  const normalizedData = {
    name: geocodingData.results[0].name,
    sys: {
      country: geocodingData.results[0].country_code,
      sunrise: 1640995200, // Unix timestamp
      sunset: 1641027600, // Unix timestamp
    },
    weather: [
      {
        description: 'Weather description',
        icon: '01d',
      },
    ],
    main: {
      temp: 20.5,
      feels_like: 22.1,
      humidity: 65,
    },
    wind: {
      speed: 3.5,
      deg: 180,
    },
    visibility: 10000, // in meters
    dt: 1641012345, // Unix timestamp
    timezone: 3600, // UTC offset in seconds
  }

  res.status(200).json(normalizedData)
}
