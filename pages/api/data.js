export default async function handler(req, res) {
  const { cityInput } = req.body

  const normalizedData = {
    name: 'City Name',
    sys: {
      country: 'Country Code',
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
