import { degToCompass, unixToLocalTime } from '../services/converters'
import { MetricsCard } from './MetricsCard'
import styles from './MetricsBox.module.css'

export const MetricsBox = ({ weatherData }) => {
  return (
    <div className={styles.wrapper}>
      <MetricsCard
        title={'Humidité'}
        iconSrc={'/icons/humidity.png'}
        metric={weatherData.main.humidity}
        unit={'%'}
      />
      <MetricsCard
        title={'Vitesse du vent'}
        iconSrc={'/icons/wind.png'}
        metric={weatherData.wind.speed}
        unit={'k/h'}
      />
      <MetricsCard
        title={'Direction du vent'}
        iconSrc={'/icons/compass.png'}
        metric={degToCompass(weatherData.wind.deg)}
      />
      <MetricsCard
        title={'Visibilité'}
        iconSrc={'/icons/binocular.png'}
        metric={(weatherData.visibility / 1000).toFixed(1)}
        unit={'km'}
      />
      <MetricsCard
        title={'Lever du soleil'}
        iconSrc={'/icons/sunrise.png'}
        metric={unixToLocalTime(weatherData.sys.sunrise, weatherData.timezone)}
      />
      <MetricsCard
        title={'Coucher du soleil'}
        iconSrc={'/icons/sunset.png'}
        metric={unixToLocalTime(weatherData.sys.sunset, weatherData.timezone)}
      />
    </div>
  )
}
