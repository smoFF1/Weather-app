import type { DailyForecast, UnitSystem } from '../types/weather';
import { formatTemperature } from '../utils/units';

interface ForecastProps {
  forecast: DailyForecast[];
  selectedDay: DailyForecast | null;
  unitSystem: UnitSystem;
  onDaySelect: (day: DailyForecast) => void;
}

function Forecast({ forecast, selectedDay, unitSystem, onDaySelect }: ForecastProps) {
  return (
    <section className="forecast-section" aria-labelledby="forecast-title">
      <h2 id="forecast-title">Five-day forecast</h2>
      <div>
        {forecast.map((day) => (
          <button
            className={selectedDay?.date === day.date ? 'forecast-day forecast-day--selected' : 'forecast-day'}
            key={day.date}
            type="button"
            onClick={() => onDaySelect(day)}
          >
            <strong>{day.date}</strong>{' '}
            <span>Min: {formatTemperature(day.minTemp, unitSystem)}</span>{' '}
            <span>Max: {formatTemperature(day.maxTemp, unitSystem)}</span>{' '}
            <span>Condition: {day.weatherCondition.description}</span>
          </button>
        ))}
      </div>

      {selectedDay && (
        <div className="hourly-section">
          <h3>Hourly details for {selectedDay.date}</h3>
          <div>
            {selectedDay.hourlyData.map((hour) => (
              <div className="hourly-item" key={hour.dateTime}>
                <img
                  src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                  alt={selectedDay.weatherCondition.description}
                  width="50"
                  height="50"
                />
                <span>{hour.dateTime}</span>
                <span>{formatTemperature(hour.temp, unitSystem)}</span>
                <span>{hour.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Forecast;
