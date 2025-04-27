import React from 'react';

export interface AdventureRecommendation {
  title: string;
  description: string;
  activities: string[];
  estimatedDuration: string;
  carbonFootprint: string;
  ecoFriendlyTips?: string[];
  sources?: string[];
  localTips?: string[];
}

interface AdventureRecommendationsProps {
  recommendations: AdventureRecommendation[];
  isLoading: boolean;
  error: string | null;
}

export default function AdventureRecommendations({ 
  recommendations, 
  isLoading, 
  error 
}: AdventureRecommendationsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg shadow-md">
        ⚠️ {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mt-16 mb-6">✨ Your Adventure Recommendations ✨</h2>
      <div className="flex flex-col gap-6">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{recommendation.title}</h3>
                {recommendation.ecoFriendlyTips && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    🌱 Eco-Friendly
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{recommendation.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">🎯 Activities</h4>
                  <ul className="space-y-2">
                    {recommendation.activities.map((activity, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">⏱️ Duration</h4>
                    <p className="text-gray-700">{recommendation.estimatedDuration}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">🌍 Carbon Footprint</h4>
                    <p className="text-gray-700">{recommendation.carbonFootprint}</p>
                  </div>
                </div>

                {recommendation.ecoFriendlyTips && recommendation.ecoFriendlyTips.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">🌿 Eco-Friendly Tips</h4>
                    <ul className="space-y-2">
                      {recommendation.ecoFriendlyTips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-green-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.sources && recommendation.sources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">📚 Sources</h4>
                    <div className="space-y-2">
                      {recommendation.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                        >
                          🔗 {source}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {recommendation.localTips && recommendation.localTips.length > 0 && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">💬 Local Tips from Reddit</h4>
                    <ul className="space-y-2">
                      {recommendation.localTips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-blue-700 italic">"{tip}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 