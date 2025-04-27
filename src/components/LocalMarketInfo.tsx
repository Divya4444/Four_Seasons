import React from 'react';

interface LocalMarketInfoProps {
  marketName: string;
  day: string;
  time: string;
  description: string;
  seasonalProduce: string[];
}

export default function LocalMarketInfo({
  marketName,
  day,
  time,
  description,
  seasonalProduce
}: LocalMarketInfoProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {marketName} Market
          </h2>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-4">📅 {day}</span>
            <span>⏰ {time}</span>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {description}
          </p>
          <div className="bg-white/50 p-4 rounded-xl border border-green-100">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              🌱 Seasonal Produce
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {seasonalProduce.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center text-gray-700"
                >
                  <span className="mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white/50 p-4 rounded-xl border border-green-100 w-full md:w-64">
          <p className="text-sm text-gray-600 leading-relaxed">
            Supporting local farmers helps sustain our community and reduces carbon footprint from transportation. 🌍
          </p>
        </div>
      </div>
    </div>
  );
} 