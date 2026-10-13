# Weather App - Full Stack Home Assignment

## Getting Started

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/smoFF1/weather-app.git
   cd weather-app
   ```

2. Install all dependencies:

   ```bash
   npm install
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

### Step 1 - Project setup

- Created separate `client` and `server` applications.
- Added React, TypeScript and Vite to the client.
- Added Node.js, Express and TypeScript to the server.
- Configured npm workspaces and root scripts for running both applications.

### Step 2 - Backend API

- Added a location search endpoint using the OpenWeather geocoding API.
- Added an endpoint for current weather conditions.
- Added an endpoint for the five-day forecast.
- Added a health endpoint for checking that the API is running.
- Added query parameter validation and a central error handler.

### Step 3 - Forecast and timezone handling

- Used the timezone offset returned by OpenWeather for the selected location.
- Grouped forecast readings by the target location's local date instead of the browser's date.
- Kept the first partial day because it is still part of the current local day.
- Limited the result to five local calendar days.
- Calculated the daily minimum and maximum from the readings belonging to each local day.

### Step 4 - Frontend weather display

- Added the current weather section.
- Added the five-day forecast.
- Added hourly details for the selected day.
- Added weather icons and weather descriptions to the hourly forecast.
- Kept the UI simple and used basic text, buttons and lists instead of adding a chart library.

### Step 5 - Location search

- Added city search with a debounce to avoid sending a request on every keystroke.
- Added keyboard navigation using ArrowUp, ArrowDown, Enter and Escape.
- Added browser geolocation on the first load.
- Added Tel Aviv as a fallback when geolocation is unavailable or permission is denied.
- Added request cancellation so an older weather request cannot replace the result of a newer location selection.

### Step 6 - Units and shareable state

- Used metric units from the backend.
- Added Celsius/Fahrenheit switching on the client.
- Converted temperature, wind speed and visibility locally without another network request.
- Stored the selected coordinates and unit system in the URL.
- Verified that reloading or sharing the URL restores the same location and unit system.

### Step 7 - Manual testing

- Tested the application startup with `npm run dev`.
- Tested the health endpoint.
- Tested invalid search requests.
- Tested invalid coordinates.
- Tested a city with no results.
- Tested browser geolocation fallback.
- Tested keyboard navigation in the city search.
- Tested unit switching without another network request.
- Tested shared URLs after reloading the page.
- Tested selecting locations quickly one after another.

## Known Decisions

- Weather values are requested from OpenWeather in metric units.
- Temperature values are displayed as rounded whole numbers.
- Wind speed and visibility are displayed with one decimal place.
- The application intentionally avoids external chart libraries to keep the implementation simple.
- The client uses the server API instead of calling OpenWeather directly, so the API key remains on the server.

### Alternatives considered

- Considered displaying the hourly forecast as a chart, but kept a simple list. The assignment requires showing weather changes over time, and a simple list achieves this without the overhead of integrating and designing a third-party chart library.
- Considered adding reverse geocoding for the browser's current location, but kept the implementation focused on the required weather flow to avoid introducing another external API dependency.
- Considered calling OpenWeather directly from the client, but kept the integration in the Express server to keep the API key private and centralize validation and error handling.

### What I would do next with more time

- **Automated testing:** Add unit and integration tests, especially for API validation, error handling and unit conversions.
- **Deployment:** Configure and deploy the client and server to a cloud provider as described in the assignment bonus.
- Improve the hourly forecast layout with a more visual presentation.ען
- Improve accessibility attributes for the city search results.
- Add Docker configuration to make local and production environments more consistent.
- Improve production deployment with a reverse proxy and HTTPS.

## Project Structure

- `client/src/App.tsx` - main application state and weather loading.
- `client/src/components/` - reusable UI components.
- `client/src/utils/units.ts` - unit conversions and formatting.
- `client/src/types/` - frontend data types.
- `server/src/index.ts` - Express application and API routes.
- `server/src/services/weather.service.ts` - OpenWeather API integration and forecast processing.
