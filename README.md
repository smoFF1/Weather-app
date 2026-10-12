# Weather App - Full Stack Home Assignment

## Getting Started

1. Clone the repository.
2. Install all dependencies:
   ```bash
   npm run install:all
   ```
3. Copy the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   _(On Windows Command Prompt, use `copy .env.example .env`)_
4. Open the `.env` file and add your key: `OPENWEATHER_API_KEY=your_key_here`
5. Run `npm run dev` to start both applications concurrently.

The client runs at `http://localhost:5173` and the API runs at `http://localhost:3001`.

## API Reference

### Endpoints

- `GET /api/location?q={city}` returns matching geocoded locations. Missing or invalid queries return `400`; no matches return `404`.
- `GET /api/weather/current?lat={lat}&lon={lon}` returns current conditions and air quality. Coordinates must be within the valid latitude and longitude ranges.
- `GET /api/weather/forecast?lat={lat}&lon={lon}` returns up to five local calendar days with three-hour readings.
- `GET /api/health` returns the API health status.

Errors use the following shape:

```json
{
  "error": {
    "message": "Description of the error",
    "status": 400
  }
}
```

Validation errors return `400`, missing locations return `404`, OpenWeather failures return `502`, and unexpected server errors return `500`.

## Backend Design Decisions

- The API requests metric units. The client performs unit conversion without another network request.
- Forecast day boundaries use the target location's UTC offset from OpenWeather, not the server or user's timezone.
- The first reading for each local day supplies its representative condition and icon.
- The current partial day is retained, while a trailing sixth partial day is removed to keep five forecast days.
- Daily minimum and maximum temperatures include every three-hour reading assigned to that local date.

## Development Log

### Project Scaffolding

- Created a monorepo with separate `/client` and `/server` applications.
- Added Vite, React, TypeScript, SWC, Express, and shared root scripts.

### Backend API

- Added geocoding, current weather, forecast, and health endpoints.
- Added centralized validation and error handling.
- Added timezone-aware forecast grouping and concurrent current-weather/AQI requests.
