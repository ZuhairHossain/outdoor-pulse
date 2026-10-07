import { useState } from 'react';

const INTERESTS = [
  { id: 'hiking', label: '🥾 Hiking', value: 'hiking' },
  { id: 'birding', label: '🐦 Birding', value: 'birding' },
  { id: 'photography', label: '📸 Photography', value: 'photography' },
  { id: 'gardening', label: '🌿 Gardening', value: 'gardening' },
  { id: 'wellness', label: '🧘 Wellness', value: 'wellness' },
  { id: 'running', label: '🏃 Running & Fitness', value: 'running' },
  { id: 'scenic', label: '🌅 Scenic & Seasonal', value: 'scenic' },
  { id: 'family', label: '👨‍👩‍👧 Family Activities', value: 'family' },
  { id: 'nature', label: '🌲 Nature', value: 'nature' },
  { id: 'relaxing', label: '😌 Relaxing', value: 'relaxing' },
];

export default function ProfileSetup({ initialProfile, onSave, onCancel }) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [interests, setInterests] = useState(initialProfile?.interests || []);
  const [fitnessLevel, setFitnessLevel] = useState(initialProfile?.fitness_level || 'moderate');
  const [availableTime, setAvailableTime] = useState(initialProfile?.available_time || 60);

  const toggleInterest = (value) => {
    setInterests(prev =>
      prev.includes(value)
        ? prev.filter(i => i !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: name || 'Explorer',
      interests,
      fitness_level: fitnessLevel,
      available_time: parseInt(availableTime) || 60,
    });
  };

  return (
    <div className="onboarding slide-up">
      <h2>🌿 Set Up Your Profile</h2>
      <p>Tell us about yourself so we can recommend the perfect outdoor activities.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
          />
        </div>

        <div className="form-group">
          <label className="form-label">What do you enjoy outdoors?</label>
          <div className="interest-chips">
            {INTERESTS.map(interest => (
              <button
                key={interest.id}
                type="button"
                className={`interest-chip ${interests.includes(interest.value) ? 'active' : ''}`}
                onClick={() => toggleInterest(interest.value)}
              >
                {interest.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Fitness Level</label>
          <select
            className="form-input"
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
          >
            <option value="beginner">🌱 Beginner — I'm just starting out</option>
            <option value="moderate">🌿 Moderate — I'm somewhat active</option>
            <option value="active">🌳 Active — I exercise regularly</option>
            <option value="athletic">🏔️ Athletic — I'm very fit</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Available Time</label>
          <select
            className="form-input"
            value={availableTime}
            onChange={(e) => setAvailableTime(e.target.value)}
          >
            <option value="15">15 minutes — Quick break</option>
            <option value="30">30 minutes — Half hour</option>
            <option value="60">1 hour — Solid session</option>
            <option value="120">2 hours — Extended outing</option>
            <option value="240">Half day — Adventure time!</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          {onCancel && (
            <button type="button" className="btn btn-secondary btn-lg" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-accent btn-lg">
            🌿 {initialProfile ? 'Update Profile' : 'Get Started'}
          </button>
        </div>
      </form>
    </div>
  );
}
