import { GoogleGenerativeAI } from '@google/generative-ai';
import { Recommendation } from '../App';


export async function getAdventureRecommendations(userId: string, location: string): Promise<Recommendation[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please check your .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const imageModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = `Generate exactly 3 unique adventure recommendations for ${location}. 
  For each recommendation, provide a JSON object with these exact properties:
  {
    "title": "string",
    "description": "string",
    "activities": ["string"],
    "estimatedDuration": "string (e.g., '2-3 hours', 'Full day', 'Half day')",
    "carbonFootprint": "string",
    "ecoFriendlyTips": ["string"],
    "estimatedCost": "string",
    "imagePrompt": "string (e.g., 'Beautiful scene of [location] during [season], highlighting [key features]')",
    "waypoints": [
      {
        "name": "string (e.g., 'Central Park')",
        "type": "attraction" | "restaurant",
        "description": "string (e.g., 'Beautiful urban park with seasonal flowers')",
        "estimatedDuration": "string (e.g., '1 hour', '30 minutes')",
        "seasonal": boolean,
        "seasonalDetails": "string (e.g., 'Best in spring for cherry blossoms')",
        "seasonalImagePrompt": "string (e.g., 'Central Park in spring with cherry blossoms, peaceful scene, soft lighting')"
      }
    ],
    "localPartners": ["string"],
    "automationOptions": {
      "autoBooking": boolean,
      "groupCoordination": boolean
    },
    "greenBusinesses": [
      {
        "name": "string (e.g., 'Green Valley Farmers Market')",
        "type": "farmers-market" | "bike-rental" | "eco-tour" | "sustainable-shop",
        "certification": "string (e.g., 'Certified Organic')",
        "discount": "string (e.g., '10% off for bringing reusable bags')",
        "description": "string (e.g., 'Local organic produce market')",
        "location": "string (e.g., '123 Green St, ${location}')"
      }
    ]
  }

  For waypoints, include:
  1. At least 3-5 key attractions or points of interest
  2. 1-2 restaurants or food stops
  3. Seasonal highlights and timing
  4. Estimated time at each location
  5. Brief descriptions of each stop
  6. A detailed image prompt for each seasonal waypoint

  For each recommendation, include:
  1. A compelling title and description
  2. A detailed image prompt that captures the essence of the adventure
  3. Seasonal highlights and activities
  4. Environmental impact and eco-friendly tips

  Return ONLY a valid JSON array of recommendations, with no additional text or markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    // Clean the response to handle markdown code blocks and ensure valid JSON
    let cleanedText = text
      .replace(/```json\s*/g, '')  
      .replace(/```\s*$/g, '')    
      .replace(/```\s*$/g, '')    
      .replace(/^\s*\[/, '[')      
      .replace(/\]\s*$/, ']')      
      .replace(/\n/g, ' ')         
      .replace(/\s+/g, ' ')        
      .trim();

    // Try to find the JSON array in the response
    const jsonMatch = cleanedText.match(/\[.*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    console.log('Cleaned response:', cleanedText); 
    
    let recommendations: Recommendation[];
    try {
      recommendations = JSON.parse(cleanedText) as Recommendation[];
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Problematic text:', cleanedText);
      throw new Error('Failed to parse recommendations JSON. Please try again.');
    }
    
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error('Invalid recommendations format received');
    }
    
    // Generate images for recommendations and their waypoints
    for (const recommendation of recommendations) {
      // Generate main recommendation image
      if (recommendation.imagePrompt) {
        try {
          const imagePrompt = `Generate a beautiful, realistic image of: ${recommendation.imagePrompt}. The image should be high quality and show the location during the current season. Focus on the natural beauty and seasonal elements.`;
          console.log('Generating image with prompt:', imagePrompt);
          
          const imageResult = await imageModel.generateContent({
            contents: [{
              role: "user",
              parts: [{
                text: imagePrompt
              }]
            }]
          });
          
          const imageResponse = await imageResult.response;
          console.log('Image response:', imageResponse);
          
          if (imageResponse.candidates && imageResponse.candidates.length > 0) {
            const imageData = imageResponse.candidates[0].content.parts[0].text;
            if (imageData) {
              recommendation.image = `data:image/jpeg;base64,${imageData}`;
              console.log('Successfully generated image for recommendation:', recommendation.title);
            } else {
              console.warn('No image data in response for recommendation:', recommendation.title);
              recommendation.image = undefined;
            }
          } else {
            console.warn('No image candidates found for recommendation:', recommendation.title);
            recommendation.image = undefined;
          }
        } catch (error) {
          console.error('Error generating image for recommendation:', recommendation.title, error);
          recommendation.image = undefined;
        }
      }

      // Generate images for seasonal waypoints
      for (const waypoint of recommendation.waypoints) {
        if (waypoint.seasonal && waypoint.seasonalImagePrompt) {
          try {
            const imagePrompt = `Generate a beautiful, realistic image of: ${waypoint.seasonalImagePrompt}. The image should be high quality and show the location during its peak season. Focus on the seasonal elements and natural beauty.`;
            console.log('Generating image for waypoint:', waypoint.name, 'with prompt:', imagePrompt);
            
            const imageResult = await imageModel.generateContent({
              contents: [{
                role: "user",
                parts: [{
                  text: imagePrompt
                }]
              }]
            });
            
            const imageResponse = await imageResult.response;
            console.log('Waypoint image response:', imageResponse);
            
            if (imageResponse.candidates && imageResponse.candidates.length > 0) {
              const imageData = imageResponse.candidates[0].content.parts[0].text;
              if (imageData) {
                waypoint.seasonalImage = `data:image/jpeg;base64,${imageData}`;
                console.log('Successfully generated image for waypoint:', waypoint.name);
              } else {
                console.warn('No image data in response for waypoint:', waypoint.name);
                waypoint.seasonalImage = undefined;
              }
            } else {
              console.warn('No image candidates found for waypoint:', waypoint.name);
              waypoint.seasonalImage = undefined;
            }
          } catch (error) {
            console.error('Error generating image for waypoint:', waypoint.name, error);
            waypoint.seasonalImage = undefined;
          }
        }
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}
 