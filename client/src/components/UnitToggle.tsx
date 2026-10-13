import type { UnitSystem } from '../types/weather';

interface UnitToggleProps {
  unitSystem: UnitSystem;
  onChange: (unitSystem: UnitSystem) => void;
}

function UnitToggle({ unitSystem, onChange }: UnitToggleProps) {
  return (
    <button
      className="unit-toggle"
      type="button"
      onClick={() => onChange(unitSystem === 'metric' ? 'imperial' : 'metric')}
      aria-label="Change temperature units"
    >
      {unitSystem === 'metric' ? 'Switch to °F' : 'Switch to °C'}
    </button>
  );
}

export default UnitToggle;
