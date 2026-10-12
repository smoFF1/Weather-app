import { AppError } from '../errors.js';

export interface LocationData {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

interface WeatherCondition {
    main: string;
    description: string;
    icon: string;
}

interface CurrentWeatherResponse {
    weather: WeatherCondition[];
    main: {
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
    };
    visibility: number;
    wind: {
        speed: number;
        deg: number;
    };
    sys: {
        country: string;
        sunrise: number;
        sunset: number;
    };
    timezone: number;
    name: string;
    dt: number;
}

interface AirPollutionResponse {
    list: Array<{ main: { aqi: number } }>;
}

interface ForecastApiResponse {
    list: Array<{
        dt: number;
        main: { temp: number };
        weather: WeatherCondition[];
    }>;
    city: { timezone: number };
}

export interface ProcessedCurrentWeather {
    location: { city: string; country: string };
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

export async function getCityCoordinates(city: string): Promise<LocationData[] | null> {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`;
    const data = await fetchJson<unknown>(url);

    if (!isLocationList(data)) {
        throw new AppError('Incomplete location data received from OpenWeather API', 502);
    }

    return data.length > 0 ? data : null;
}

export async function getWeatherData(lat: number, lon: number): Promise<ProcessedCurrentWeather> {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
    const [weatherData, pollutionData] = await Promise.all([
        fetchJson<unknown>(weatherUrl),
        fetchJson<unknown>(pollutionUrl)
    ]);

    if (!isCurrentWeatherResponse(weatherData) || !isAirPollutionResponse(pollutionData)) {
        throw new AppError('Incomplete weather data received from OpenWeather API', 502);
    }

    return {
        location: {
            city: weatherData.name,
            country: weatherData.sys.country
        },
        currentConditions: {
            temp: Math.round(weatherData.main.temp),
            feels_like: Math.round(weatherData.main.feels_like),
            weatherCondition: weatherData.weather[0]
        },
        localTimes: {
            currentDateTime: getLocalTimeString(weatherData.dt, weatherData.timezone),
            sunrise: getLocalTimeString(weatherData.sys.sunrise, weatherData.timezone),
            sunset: getLocalTimeString(weatherData.sys.sunset, weatherData.timezone)
        },
        environment: {
            windSpeed: weatherData.wind.speed,
            windDirectionText: getWindDirection(weatherData.wind.deg),
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            visibility: weatherData.visibility,
            airQualityIndex: pollutionData.list[0]?.main.aqi ?? 0
        }
    };
}

export async function getFiveDayForecast(lat: number, lon: number): Promise<DailyForecast[] | null> {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const data = await fetchJson<unknown>(url);

    if (!isForecastApiResponse(data) || data.list.length === 0) {
        return null;
    }

    const days = new Map<string, DailyForecast>();
    for (const item of data.list) {
        const dateTime = getLocalTimeString(item.dt, data.city.timezone);
        const date = dateTime.split(' ')[0];
        const condition = item.weather[0];
        const temperature = Math.round(item.main.temp);

        if (!date || !condition) {
            continue;
        }

        const hourlyData = { dateTime, temp: temperature, icon: condition.icon };
        const existingDay = days.get(date);
        if (existingDay) {
            existingDay.minTemp = Math.min(existingDay.minTemp, temperature);
            existingDay.maxTemp = Math.max(existingDay.maxTemp, temperature);
            existingDay.hourlyData.push(hourlyData);
        } else {
            days.set(date, {
                date,
                minTemp: temperature,
                maxTemp: temperature,
                weatherCondition: condition,
                hourlyData: [hourlyData]
            });
        }
    }

    // Keep the current partial day and discard the trailing sixth day.
    return Array.from(days.values()).slice(0, 5);
}

async function fetchJson<T>(url: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(url);
    } catch {
        throw new AppError('OpenWeather API is unavailable', 502);
    }

    if (!response.ok) {
        throw new AppError(`OpenWeather API returned ${response.status} ${response.statusText}`, 502);
    }

    try {
        return await response.json() as T;
    } catch {
        throw new AppError('OpenWeather API returned invalid JSON', 502);
    }
}

function isLocationList(value: unknown): value is LocationData[] {
    return Array.isArray(value) && value.every(item =>
        isRecord(item) &&
        typeof item.name === 'string' &&
        isFiniteNumber(item.lat) &&
        isFiniteNumber(item.lon) &&
        typeof item.country === 'string' &&
        (item.state === undefined || typeof item.state === 'string')
    );
}

function isCurrentWeatherResponse(value: unknown): value is CurrentWeatherResponse {
    if (!isRecord(value) || !Array.isArray(value.weather) ||
        !isWeatherCondition(value.weather[0]) ||
        !isRecord(value.main) || !isRecord(value.wind) || !isRecord(value.sys)) {
        return false;
    }

    return typeof value.name === 'string' &&
        isFiniteNumber(value.dt) &&
        isFiniteNumber(value.timezone) &&
        isFiniteNumber(value.main.temp) &&
        isFiniteNumber(value.main.feels_like) &&
        isFiniteNumber(value.main.pressure) &&
        isFiniteNumber(value.main.humidity) &&
        isFiniteNumber(value.visibility) &&
        isFiniteNumber(value.wind.speed) &&
        isFiniteNumber(value.wind.deg) &&
        typeof value.sys.country === 'string' &&
        isFiniteNumber(value.sys.sunrise) &&
        isFiniteNumber(value.sys.sunset);
}

function isAirPollutionResponse(value: unknown): value is AirPollutionResponse {
    return isRecord(value) && Array.isArray(value.list) &&
        (value.list.length === 0 || value.list.every(item =>
            isRecord(item) && isRecord(item.main) && isFiniteNumber(item.main.aqi)
        ));
}

function isForecastApiResponse(value: unknown): value is ForecastApiResponse {
    return isRecord(value) &&
        isRecord(value.city) &&
        isFiniteNumber(value.city.timezone) &&
        Array.isArray(value.list) &&
        value.list.every(item =>
            isRecord(item) &&
            isFiniteNumber(item.dt) &&
            isRecord(item.main) &&
            isFiniteNumber(item.main.temp) &&
            Array.isArray(item.weather) &&
            isWeatherCondition(item.weather[0])
        );
}

function isWeatherCondition(value: unknown): value is WeatherCondition {
    return isRecord(value) &&
        typeof value.main === 'string' &&
        typeof value.description === 'string' &&
        typeof value.icon === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

// Apply the API offset before using UTC getters to avoid the server's timezone.
function getLocalTimeString(unixTimestampSeconds: number, timezoneOffsetSeconds: number): string {
    const date = new Date((unixTimestampSeconds + timezoneOffsetSeconds) * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
