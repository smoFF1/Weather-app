import type { LocationData, ProcessedCurrentWeather, UnitSystem } from '../types/weather';
import { formatTemperature, formatVisibility, formatWindSpeed } from '../utils/units';

interface CurrentWeatherProps {
  weather: ProcessedCurrentWeather;
  selectedLocation: LocationData;
  unitSystem: UnitSystem;
}

function CurrentWeather({ weather, selectedLocation, unitSystem }: CurrentWeatherProps) {
  const condition = weather.currentConditions.weatherCondition;

  return (
    <section className="weather-section" aria-labelledby="current-weather-title">
      <h2 id="current-weather-title">
        Current Weather for {weather.location.city}, {weather.location.country}
      </h2>
      {selectedLocation.state && <p>Region: {selectedLocation.state}</p>}
      <p>Temperature: {formatTemperature(weather.currentConditions.temp, unitSystem)}</p>
      <p>Feels Like: {formatTemperature(weather.currentConditions.feels_like, unitSystem)}</p>
      <p>Weather Condition: {condition.main} - {condition.description}</p>
      <p>Local Time: {weather.localTimes.currentDateTime}</p>
      <p>Sunrise: {weather.localTimes.sunrise}</p>
      <p>Sunset: {weather.localTimes.sunset}</p>
      <p>Wind Speed: {formatWindSpeed(weather.environment.windSpeed, unitSystem)}</p>
      <p>Wind Direction: {weather.environment.windDirectionText}</p>
      <p>Humidity: {weather.environment.humidity}%</p>
      <p>Pressure: {weather.environment.pressure} hPa</p>
      <p>Visibility: {formatVisibility(weather.environment.visibility, unitSystem)}</p>
      <p>Air Quality Index: {weather.environment.airQualityIndex}</p>
    </section>
  );
}

export default CurrentWeather;
