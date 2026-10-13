import type { UnitSystem } from '../types/weather';

export function formatTemperature(celsius: number, unitSystem: UnitSystem): string {
  const temperature = unitSystem === 'imperial' ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(temperature)}°${unitSystem === 'imperial' ? 'F' : 'C'}`;
}

export function formatWindSpeed(metersPerSecond: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${(metersPerSecond * 2.23694).toFixed(1)} mph`;
  }

  return `${metersPerSecond.toFixed(1)} m/s`;
}

export function formatVisibility(meters: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${(meters / 1609.344).toFixed(1)} mi`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}
