export default function Header({ onProfileClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">🌿</div>
          <div className="logo-text">
            Outdoor<span>Pulse</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={onProfileClick}
            title="Edit Profile"
          >
            👤
          </button>
        </div>
      </div>
    </header>
  );
}
