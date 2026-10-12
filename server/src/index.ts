import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { getCityCoordinates, getWeatherData,getFiveDayForecast } from './services/weather.service.js';
import { AppError } from './errors.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error('Missing OPENWEATHER_API_KEY in the environment or root .env file');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Weather API is running');
});
app.get('/api/location', async (req: Request, res: Response, next: NextFunction) => {
    try {
       const city = req.query.q;
        if (typeof city !== 'string' || !city.trim()) {
            throw new AppError("Missing or invalid required query parameter 'q'", 400);
        }

        const coordinates = await getCityCoordinates(city);
        
        if (!coordinates) {
            throw new AppError(`Coordinates not found for city: ${city}`, 404);
        }

        res.json(coordinates);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/weather/current',async (req:Request,res:Response,next:NextFunction)=>{
    try
    {
        const { lat, lon } = parseCoordinates(req);
        const weather = await getWeatherData(lat, lon);

        if (!weather) {
            throw new AppError(`Coordinates not found for lat: ${lat} lon: ${lon}`, 404);
        }
        return res.json(weather);
    }
    catch (error) {
        next(error);
    }
});

app.get('/api/weather/forecast', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lat, lon } = parseCoordinates(req);
        const weather = await getFiveDayForecast(lat, lon);

        if (!weather) {
            throw new AppError(`Coordinates not found for lat: ${lat} lon: ${lon}`, 404);
        }
        return res.json(weather);
    } catch (error) {
        next(error);
    }
});

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'The API is working' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[Global Error Handler] Error: ${err.message}`);

    const statusCode = err instanceof AppError ? err.status : 500;
    const message = err instanceof AppError ? err.message : 'Internal Server Error';

    res.status(statusCode).json({
        error: { message, status: statusCode }
    });
});

function parseCoordinates(req: Request): { lat: number; lon: number } {
    const { lat: latParam, lon: lonParam } = req.query;

    if (typeof latParam !== 'string' || typeof lonParam !== 'string' ||
        !latParam.trim() || !lonParam.trim()) {
            throw new AppError("Missing required query parameters 'lat' and 'lon'.", 400);
    }

    const lat = Number(latParam);
    const lon = Number(lonParam);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 ||
        !Number.isFinite(lon) || lon < -180 || lon > 180) {
        throw new AppError('Invalid coordinates. Lat must be -90 to 90, lon -180 to 180.', 400);
    }
    return { lat, lon };
}

app.listen(PORT, () => { console.log(`The server is running on port ${PORT}`); });
