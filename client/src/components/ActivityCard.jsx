import { useState, useRef } from 'react';

const categoryIcons = {
  hiking: '🥾',
  birding: '🐦',
  photography: '📸',
  gardening: '🌿',
  wellness: '🧘',
  running: '🏃',
  scenic: '🌅',
  family: '👨‍👩‍👧',
  default: '🌲',
};

export default function ActivityCard({ recommendation, audioAvailable, apiUrl }) {
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);

  const icon = categoryIcons[recommendation.category] || categoryIcons.default;
  const difficultyClass = `difficulty-${recommendation.difficulty}`;

  const handlePlayAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current?.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setAudioLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/audio/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation }),
      });

      if (!response.ok) throw new Error('Audio generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio error:', err);
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="activity-card">
      {/* Match score */}
      {recommendation.match_score && (
        <div className="match-score">
          {recommendation.match_score}% match
        </div>
      )}

      {/* Header */}
      <div className="activity-card-header">
        <div>
          <span className="activity-category">
            {icon} {recommendation.category}
          </span>
        </div>
        <span className={`difficulty-badge ${difficultyClass}`}>
          {recommendation.difficulty}
        </span>
      </div>

      {/* Name and headline */}
      <h3 className="activity-name">{recommendation.activity_name}</h3>
      <p className="activity-headline">{recommendation.headline}</p>

      {/* Description */}
      <p className="activity-description">{recommendation.description}</p>

      {/* Why now */}
      {recommendation.why_now && (
        <div className="activity-why-now">
          ⏰ {recommendation.why_now}
        </div>
      )}

      {/* Meta tags */}
      <div className="activity-meta">
        {recommendation.duration && (
          <span className="activity-tag">🕐 {recommendation.duration}</span>
        )}
        {recommendation.best_time_window && (
          <span className="activity-tag">📅 {recommendation.best_time_window}</span>
        )}
        {recommendation.what_to_wear && (
          <span className="activity-tag">👕 {recommendation.what_to_wear}</span>
        )}
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="fade-in">
          {/* What to bring */}
          {recommendation.what_to_bring?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="form-label" style={{ marginBottom: '0.5rem' }}>
                🎒 What to bring
              </div>
              <div className="activity-bring">
                {recommendation.what_to_bring.map((item, i) => (
                  <span key={i} className="activity-bring-item">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="activity-actions">
        <button
          className="btn btn-secondary"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▲ Less' : '▼ More Details'}
        </button>

        {audioAvailable && (
          <button
            className="btn btn-accent"
            onClick={handlePlayAudio}
            disabled={audioLoading}
          >
            {audioLoading ? '⏳ Generating...' : isPlaying ? '⏸ Pause' : '🔊 Listen'}
          </button>
        )}
      </div>
    </div>
  );
}
