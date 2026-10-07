const loadingMessages = [
  "Checking the weather outside... ☀️",
  "Scanning for the best activities... 🌿",
  "Asking Gemma for personalized picks... 🤖",
  "Almost there — your outdoor plan awaits... 🏞️",
];

export default function LoadingState() {
  const message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
