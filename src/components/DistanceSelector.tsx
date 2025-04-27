import React from 'react';

type TransportMode = 'walking' | 'biking' | 'driving';
type Distance = 'short' | 'medium' | 'long';

interface DistanceSelectorProps {
  selectedMode: TransportMode | null;
  selectedDistance: Distance | null;
  onModeSelect: (mode: TransportMode) => void;
  onDistanceSelect: (distance: Distance) => void;
}

const transportModes: { id: TransportMode; label: string; icon: string }[] = [
  { id: 'walking', label: 'Walking', icon: '🚶' },
  { id: 'biking', label: 'Biking', icon: '🚲' },
  { id: 'driving', label: 'Driving', icon: '🚗' },
];

const distances: { id: Distance; label: string; description: string }[] = [
  { id: 'short', label: 'Short', description: 'Under 2 miles' },
  { id: 'medium', label: 'Medium', description: '2-5 miles' },
  { id: 'long', label: 'Long', description: '5+ miles' },
];

const DistanceSelector = ({
  selectedMode,
  selectedDistance,
  onModeSelect,
  onDistanceSelect,
}: DistanceSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">How would you like to travel?</h2>
        <div className="grid grid-cols-3 gap-4">
          {transportModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2
                ${
                  selectedMode === mode.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
            >
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">How far would you like to go?</h2>
        <div className="grid grid-cols-3 gap-4">
          {distances.map((distance) => (
            <button
              key={distance.id}
              onClick={() => onDistanceSelect(distance.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2
                ${
                  selectedDistance === distance.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
            >
              <span className="font-medium">{distance.label}</span>
              <span className="text-sm text-gray-600">{distance.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistanceSelector; 