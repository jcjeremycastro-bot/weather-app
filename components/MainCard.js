import Image from 'next/image'
import styles from './MainCard.module.css'

export const MainCard = ({
  city,
  description,
  iconName,
  temperature,
  apparent_temperature,
}) => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.location}>{city}</h1>
      <p className={styles.description}>{description}</p>
      <Image
        width="300px"
        height="300px"
        src={`/icons/${iconName}.svg`}
        alt="weatherIcon"
      />
      <h1 className={styles.temperature}>{Math.round(temperature)}°C</h1>
      <p>Ressenti {Math.round(apparent_temperature)}°C</p>
    </div>
  )
}
