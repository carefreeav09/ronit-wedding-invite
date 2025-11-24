import {useState, useEffect, useRef} from "react";
import "./WeddingAnimation.css";

const TOTAL_FRAMES = 135; // 00000 to 00134
const PAUSE_FRAME = 50; // Frame to pause at initially

// Format frame number with leading zeros
const formatFrameNumber = (num) => {
  return String(num).padStart(5, "0");
};

// Get image source for current frame
const getImageSrc = (frameNum) => {
  return `/render/ronit_Wedding_${formatFrameNumber(frameNum)}.png`;
};

// Get user name from URL query parameter
const getUserName = () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  // Remove quotes if present
  return name ? name.replace(/^"|"$/g, "") : "";
};

function WeddingAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasPaused, setHasPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userName] = useState(() => getUserName());
  const [audioStarted, setAudioStarted] = useState(false);
  const animationRef = useRef(null);
  const preloadedImages = useRef(new Set());
  const audioRef = useRef(null);

  // Initialize audio (but don't play until user interaction)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Set volume to 50%
    }
  }, []);

  // Function to start audio playback (called on user interaction)
  const startAudio = () => {
    if (audioRef.current && !audioStarted) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play error:", error);
      });
      setAudioStarted(true);
    }
  };

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Preload images ahead of current frame
  useEffect(() => {
    const preloadCount = 5; // Preload 5 frames ahead
    for (let i = 1; i <= preloadCount; i++) {
      const frameToPreload = currentFrame + i;
      if (
        frameToPreload < TOTAL_FRAMES &&
        !preloadedImages.current.has(frameToPreload)
      ) {
        const img = new Image();
        img.src = getImageSrc(frameToPreload);
        preloadedImages.current.add(frameToPreload);
      }
    }
  }, [currentFrame]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || isComplete) return;

    const fps = 30; // Adjust frame rate as needed
    const interval = 1000 / fps;

    animationRef.current = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        const nextFrame = prevFrame + 1;

        // Check if we should pause at the initial pause frame
        if (!hasPaused && nextFrame >= PAUSE_FRAME) {
          setIsPlaying(false);
          setHasPaused(true);
          return PAUSE_FRAME;
        }

        // Check if we've reached the end
        if (nextFrame >= TOTAL_FRAMES) {
          setIsPlaying(false);
          setIsComplete(true);
          return TOTAL_FRAMES - 1;
        }

        return nextFrame;
      });
    }, interval);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, hasPaused, isComplete]);

  // Handle click to resume
  const handleClick = () => {
    // Start audio on first user interaction
    startAudio();

    if (hasPaused && !isComplete) {
      setIsPlaying(true);
    }
  };

  // Handle restart
  const handleRestart = (e) => {
    e.stopPropagation(); // Prevent triggering the main click handler
    // Start audio if not already started
    startAudio();
    // Clear animation interval
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    // Reset all state
    setCurrentFrame(0);
    setIsPlaying(true);
    setHasPaused(false);
    setIsComplete(false);
    preloadedImages.current.clear();
    // Restart audio
    if (audioRef.current && audioStarted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log("Audio play error:", error);
      });
    }
  };

  // Handle mute toggle
  const handleMuteToggle = (e) => {
    e.stopPropagation(); // Prevent triggering the main click handler
    // Start audio on first user interaction
    startAudio();
    setIsMuted(!isMuted);
  };

  return (
    <div className="wedding-animation-container" onClick={handleClick}>
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="wedding-frame-wrapper">
        <img
          src={getImageSrc(currentFrame)}
          alt={`Wedding animation frame ${currentFrame}`}
          className="wedding-frame"
          draggable={false}
        />
        {userName && (
          <div className="invitation-text">{userName}, you are invited.</div>
        )}
      </div>

      {hasPaused && !isComplete && (
        <div className="click-hint">Click to continue</div>
      )}

      <div className="controls">
        <button
          className="control-button mute-button"
          onClick={handleMuteToggle}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        <button
          className="control-button restart-button"
          onClick={handleRestart}
          aria-label="Restart"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WeddingAnimation;
