export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
}

export interface ProcessedCurrentWeather {
  location: {
    city: string;
    country: string;
  };
  currentConditions: {
    temp: number;
    feels_like: number;
    weatherCondition: WeatherCondition;
  };
  localTimes: {
    currentDateTime: string;
    sunrise: string;
    sunset: string;
  };
  environment: {
    windSpeed: number;
    windDirectionText: string;
    humidity: number;
    pressure: number;
    visibility: number;
    airQualityIndex: number;
  };
}

export interface HourlyData {
  dateTime: string;
  temp: number;
  icon: string;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  weatherCondition: WeatherCondition;
  hourlyData: HourlyData[];
}

export type UnitSystem = 'metric' | 'imperial';
