import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface VideoPlayerProps {
  videoFile: File | null;
}

const VideoPlayer = ({ videoFile }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Vehicle detection simulation data
  const [boundingBoxes, setBoundingBoxes] = useState<any[]>([]);
  const [entryLine, setEntryLine] = useState({ y: 60 });
  
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoFile]);
  
  useEffect(() => {
    if (videoRef.current) {
      const handleTimeUpdate = () => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      };
      
      const handleDurationChange = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
        }
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      const video = videoRef.current;
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('durationchange', handleDurationChange);
      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('durationchange', handleDurationChange);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [videoRef]);
  
  // Simulate vehicle detection
  useEffect(() => {
    if (isPlaying) {
      // Simulate dynamic bounding boxes
      const interval = setInterval(() => {
        const newBoxes = [];
        const boxCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < boxCount; i++) {
          const vehicleTypes = ["car", "bike", "bus", "truck"];
          const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
          
          const colorMap: Record<string, string> = {
            car: "#ef4444",
            bike: "#22c55e",
            bus: "#eab308",
            truck: "#8b5cf6"
          };
          
          const x = Math.floor(Math.random() * 75) + 5;
          const y = Math.floor(Math.random() * 65) + 10;
          const width = 
            type === "car" ? 20 : 
            type === "bike" ? 10 :
            type === "bus" ? 30 :
            25;
          const height = 
            type === "car" ? 15 :
            type === "bike" ? 8 :
            type === "bus" ? 20 :
            18;
          
          newBoxes.push({
            id: Date.now() + i,
            type,
            color: colorMap[type],
            x: `${x}%`,
            y: `${y}%`,
            width: `${width}%`,
            height: `${height}%`
          });
        }
        
        setBoundingBoxes(prevBoxes => {
          // Keep a few old boxes for continuity
          const oldBoxesToKeep = prevBoxes.slice(0, 2);
          // Update positions to make them move
          const updatedOldBoxes = oldBoxesToKeep.map(box => {
            const newY = parseInt(box.y) + 3;
            // Remove boxes that move off-screen
            if (newY > 90) return null;
            return {
              ...box,
              y: `${newY}%`
            };
          }).filter(Boolean);
          
          return [...updatedOldBoxes, ...newBoxes].slice(0, 5);
        });
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying]);
  
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSkipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration);
  };
  
  const handleSkipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-4">
      <div className="video-container">
        {videoUrl ? (
          <>
            <video 
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Bounding boxes for vehicle detection */}
            {boundingBoxes.map((box) => (
              <div 
                key={box.id}
                className="bounding-box"
                style={{
                  borderColor: box.color,
                  top: box.y,
                  left: box.x,
                  width: box.width,
                  height: box.height
                }}
              >
                <div 
                  className="bounding-box-label"
                  style={{ backgroundColor: box.color, color: '#fff' }}
                >
                  {box.type}
                </div>
              </div>
            ))}
            
            {/* Entry line for counting vehicles */}
            <div 
              className="entry-line"
              style={{
                borderColor: '#3b82f6',
                borderWidth: '2px',
                top: `${entryLine.y}%`,
              }}
            />
          </>
        ) : (
          <div className="placeholder flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
            <div className="text-center">
              <p className="mb-2">No video selected</p>
              <p className="text-sm">Upload a video to see detection results</p>
            </div>
          </div>
        )}
      </div>
      
      {videoUrl && (
        <div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipBackward}
              disabled={!videoUrl}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
              disabled={!videoUrl}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipForward}
              disabled={!videoUrl}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
            <div 
              className="absolute h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        <p>
          <span className="font-medium">Note:</span> Vehicle detection visualization is simulated. In a production application, this would use a real object detection model.
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
