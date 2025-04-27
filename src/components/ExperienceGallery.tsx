import React from 'react';

interface Feedback {
  images: File[];
  description: string;
  weather: string;
  crowdLevel: 'low' | 'medium' | 'high';
  tips: string;
  timestamp: string;
}

interface ExperienceGalleryProps {
  location: string;
  activity: string;
  feedbacks: Feedback[];
}

export const ExperienceGallery: React.FC<ExperienceGalleryProps> = ({
  location,
  activity,
  feedbacks
}) => {
  return (
    <div className="experience-gallery">
      <h3>Visitor Experiences at {location}</h3>
      <p>See what others experienced at {activity}</p>

      <div className="feedback-grid">
        {feedbacks.map((feedback, index) => (
          <div key={index} className="feedback-card">
            <div className="image-gallery">
              {feedback.images.map((image, imgIndex) => (
                <img
                  key={imgIndex}
                  src={URL.createObjectURL(image)}
                  alt={`Experience ${index + 1} - Image ${imgIndex + 1}`}
                  className="gallery-image"
                />
              ))}
            </div>

            <div className="feedback-details">
              <p className="description">{feedback.description}</p>
              
              <div className="metadata">
                <span className="weather">
                  <strong>Weather:</strong> {feedback.weather}
                </span>
                <span className="crowd">
                  <strong>Crowd:</strong> {feedback.crowdLevel}
                </span>
                <span className="date">
                  {new Date(feedback.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="tips">
                <h4>Visitor Tips</h4>
                <p>{feedback.tips}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 