import { useCallback, useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import type {
  DailyForecast,
  LocationData,
  ProcessedCurrentWeather,
  UnitSystem,
} from './types/weather';
import './App.css';

const DEFAULT_LOCATION: LocationData = {
  name: 'Tel Aviv',
  lat: 32.0853,
  lon: 34.7818,
  country: 'IL',
};

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const error = body.error;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  return fallback;
}

async function fetchWeather(
  location: LocationData,
  signal: AbortSignal,
): Promise<[ProcessedCurrentWeather, DailyForecast[]]> {
  const currentRequest = fetch(`/api/weather/current?lat=${location.lat}&lon=${location.lon}`, { signal });
  const forecastRequest = fetch(`/api/weather/forecast?lat=${location.lat}&lon=${location.lon}`, { signal });
  const [currentResponse, forecastResponse] = await Promise.all([currentRequest, forecastRequest]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    const failedResponse = !currentResponse.ok ? currentResponse : forecastResponse;
    let body: unknown;
    try {
      body = await failedResponse.json();
    } catch {
      body = null;
    }
    throw new Error(getErrorMessage(body, 'Error fetching weather data'));
  }

  return [
    (await currentResponse.json()) as ProcessedCurrentWeather,
    (await forecastResponse.json()) as DailyForecast[],
  ];
}

function readUrlState(): { location: LocationData | null; unitSystem: UnitSystem } {
  const params = new URLSearchParams(window.location.search);
  const latParam = params.get('lat');
  const lonParam = params.get('lon');
  const unitSystem = params.get('unit') === 'imperial' ? 'imperial' : 'metric';

  if (latParam === null || lonParam === null || !latParam.trim() || !lonParam.trim()) {
    return { location: null, unitSystem };
  }

  const lat = Number(latParam);
  const lon = Number(lonParam);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return { location: null, unitSystem };
  }

  return {
    location: { name: 'Shared location', lat, lon, country: '' },
    unitSystem,
  };
}

function updateUrl(location: LocationData, unitSystem: UnitSystem): void {
  const params = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    unit: unitSystem,
  });
  window.history.replaceState(null, '', `?${params.toString()}`);
}

function App() {
  const [initialUrlState] = useState(readUrlState);
  const [currentWeather, setCurrentWeather] = useState<ProcessedCurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialUrlState.unitSystem);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialUrlState.location);
  const unitSystemRef = useRef(unitSystem);
  const weatherRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    unitSystemRef.current = unitSystem;
  }, [unitSystem]);

  const loadLocation = useCallback(async (location: LocationData) => {
    weatherRequestRef.current?.abort();
    const abortController = new AbortController();
    weatherRequestRef.current = abortController;

    setSelectedLocation(location);
    setIsLoading(true);
    setError('');
    setSelectedDay(null);

    try {
      const [weather, forecastData] = await fetchWeather(location, abortController.signal);
      setCurrentWeather(weather);
      setForecast(forecastData);
      setSelectedDay(forecastData[0] ?? null);
      updateUrl(location, unitSystemRef.current);
    } catch (loadError) {
      if (loadError instanceof Error && loadError.name === 'AbortError') return;
      setCurrentWeather(null);
      setForecast([]);
      setSelectedDay(null);
      setError(loadError instanceof Error ? loadError.message : 'Error fetching weather data');
    } finally {
      if (weatherRequestRef.current === abortController) {
        weatherRequestRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (initialUrlState.location) {
      timeoutId = window.setTimeout(() => void loadLocation(initialUrlState.location!), 0);
    } else if (!navigator.geolocation) {
      timeoutId = window.setTimeout(() => void loadLocation(DEFAULT_LOCATION), 0);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          void loadLocation({
            name: 'Current location',
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            country: '',
          });
        },
        () => {
          void loadLocation(DEFAULT_LOCATION);
        },
      );
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [initialUrlState.location, loadLocation]);

  const handleUnitChange = (nextUnitSystem: UnitSystem) => {
    setUnitSystem(nextUnitSystem);
    if (selectedLocation) {
      updateUrl(selectedLocation, nextUnitSystem);
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Weather App</p>
          <h1>Weather App</h1>
        </div>
        <UnitToggle unitSystem={unitSystem} onChange={handleUnitChange} />
      </header>

      <SearchBar onLocationSelect={loadLocation} />

      {isLoading && <p className="status-message">Loading...</p>}
      {error && <p className="status-message status-message--error">{error}</p>}

      {currentWeather && selectedLocation && (
        <>
          <CurrentWeather
            weather={currentWeather}
            selectedLocation={selectedLocation}
            unitSystem={unitSystem}
          />
          {forecast.length > 0 && (
            <Forecast
              forecast={forecast}
              selectedDay={selectedDay}
              unitSystem={unitSystem}
              onDaySelect={setSelectedDay}
            />
          )}
        </>
      )}
    </main>
  );
}

export default App;
