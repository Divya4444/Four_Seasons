import React from 'react';

type Interest = 'outdoors' | 'food' | 'events' | 'relaxation';

interface InterestSelectorProps {
  selectedInterests: Interest[];
  onInterestToggle: (interest: Interest) => void;
}

const interests: { id: Interest; label: string; icon: string }[] = [
  { id: 'outdoors', label: 'Outdoors', icon: '🌲' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'events', label: 'Events', icon: '🎪' },
  { id: 'relaxation', label: 'Relaxation', icon: '🧘' },
];

const InterestSelector = ({ selectedInterests, onInterestToggle }: InterestSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">What interests you?</h2>
      <div className="grid grid-cols-2 gap-4">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => onInterestToggle(interest.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2
              ${
                selectedInterests.includes(interest.id)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
          >
            <span className="text-2xl">{interest.icon}</span>
            <span className="font-medium">{interest.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InterestSelector; 