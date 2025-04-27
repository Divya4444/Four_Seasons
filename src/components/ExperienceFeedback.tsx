import React, { useState } from 'react';

interface ExperienceFeedbackProps {
  location: string;
  activity: string;
  onFeedbackSubmit: (feedback: Feedback) => void;
}

interface Feedback {
  images: File[];
  description: string;
  weather: string;
  crowdLevel: 'low' | 'medium' | 'high';
  tips: string;
  timestamp: string;
}

export const ExperienceFeedback: React.FC<ExperienceFeedbackProps> = ({
  location,
  activity,
  onFeedbackSubmit
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [weather, setWeather] = useState('');
  const [crowdLevel, setCrowdLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [tips, setTips] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback: Feedback = {
      images,
      description,
      weather,
      crowdLevel,
      tips,
      timestamp: new Date().toISOString()
    };
    onFeedbackSubmit(feedback);
    // Reset form
    setImages([]);
    setDescription('');
    setWeather('');
    setCrowdLevel('medium');
    setTips('');
  };

  return (
    <div className="feedback-form">
      <h3>Share Your Experience</h3>
      <p>Help others by sharing your experience at {location} - {activity}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Upload Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="preview-image"
                />
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Describe Your Experience</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it like? Any special moments?"
            required
          />
        </div>

        <div className="form-group">
          <label>Weather Conditions</label>
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="e.g., Sunny, Cloudy, Rainy"
            required
          />
        </div>

        <div className="form-group">
          <label>Crowd Level</label>
          <select
            value={crowdLevel}
            onChange={(e) => setCrowdLevel(e.target.value as 'low' | 'medium' | 'high')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tips for Other Visitors</label>
          <textarea
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="Any advice for future visitors?"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Share Experience
        </button>
      </form>
    </div>
  );
}; 