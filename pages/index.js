import { useState, useEffect } from 'react'

import { MainCard } from '../components/MainCard'
import { Search } from '../components/Search'
import { MetricsBox } from '../components/MetricsBox'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorScreen } from '../components/ErrorScreen'

import styles from '../styles/Home.module.css'

export const App = () => {
  const [cityInput, setCityInput] = useState('Rennes')
  const [triggerFetch, setTriggerFetch] = useState(true)
  const [weatherData, setWeatherData] = useState()

  useEffect(() => {
    const getData = async () => {
      const res = await fetch('api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityInput }),
      })
      const data = await res.json()
      setWeatherData({ ...data })
      setCityInput('')
    }
    getData()
  }, [triggerFetch])

  return weatherData && !weatherData.message ? (
    <div className={styles.wrapper}>
      <MainCard
        city={weatherData.name}
        description={weatherData.weather[0].description}
        iconName={weatherData.weather[0].icon}
        weatherData={weatherData}
      />
      <MetricsBox weatherData={weatherData} />
    </div>
  ) : weatherData && weatherData.message ? (
    <ErrorScreen errorMessage="City not found, try again!">
      <Search
        onFocus={e => (e.target.value = '')}
        onChange={e => setCityInput(e.target.value)}
        onKeyDown={e => e.keyCode === 13 && setTriggerFetch(!triggerFetch)}
      />
    </ErrorScreen>
  ) : (
    <LoadingScreen loadingMessage="Loading data..." />
  )
}

export default App
