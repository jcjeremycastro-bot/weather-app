import { useState, useEffect } from 'react'

import { MainCard } from '../components/MainCard'
import { MetricsBox } from '../components/MetricsBox'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorScreen } from '../components/ErrorScreen'

import styles from '../styles/Home.module.css'

export const App = () => {
  const [weatherData, setWeatherData] = useState()

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('api/data')
      const data = await res.json()
      setWeatherData({ ...data })
    }
    fetchData()

    // Refresh every hour
    const interval = setInterval(fetchData, 3600000)

    return () => clearInterval(interval)
  }, [])

  return weatherData && !weatherData.message ? (
    <div className={styles.wrapper}>
      <MainCard
        city={weatherData.name}
        description={weatherData.weather.description}
        iconName={weatherData.weather.icon}
        temperature={weatherData.temperature}
        apparent_temperature={weatherData.apparent_temperature}
      />
      <MetricsBox weatherData={weatherData} />
    </div>
  ) : weatherData && weatherData.message ? (
    <ErrorScreen errorMessage="City not found, try again!"></ErrorScreen>
  ) : (
    <LoadingScreen loadingMessage="Loading data..." />
  )
}

export default App
