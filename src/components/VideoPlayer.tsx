import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Video, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VideoPlayerProps {
  videoFile: File | null;
  isLiveMode?: boolean;
}

const VideoPlayer = ({ videoFile, isLiveMode = false }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Vehicle detection simulation data
  const [boundingBoxes, setBoundingBoxes] = useState<any[]>([]);
  const [entryLine, setEntryLine] = useState({ y: 60 });
  const [vehicleCounts, setVehicleCounts] = useState({ car: 0, bike: 0, bus: 0, truck: 0 });
  
  useEffect(() => {
    if (videoFile && !isLiveMode) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    
    // Reset player state when switching modes
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Auto-start in live mode
    if (isLiveMode) {
      setTimeout(() => setIsPlaying(true), 500);
    }
  }, [videoFile, isLiveMode]);
  
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
        if (!isLiveMode) {
          setIsPlaying(false);
        } else {
          // In live mode, loop the video
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        }
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
  }, [videoRef, isLiveMode]);
  
  // Enhanced vehicle detection simulation
  useEffect(() => {
    if (isPlaying) {
      // Simulate dynamic bounding boxes
      const interval = setInterval(() => {
        const newBoxes = [];
        const boxCount = Math.floor(Math.random() * 4) + (isLiveMode ? 2 : 1);
        
        for (let i = 0; i < boxCount; i++) {
          const vehicleTypes = ["car", "bike", "bus", "truck"];
          const randomIndex = Math.floor(Math.random() * vehicleTypes.length);
          const type = vehicleTypes[randomIndex];
          
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
          
          // Create a more dynamic effect
          const opacity = Math.random() * 0.3 + 0.7;
          const confidence = Math.floor(Math.random() * 20 + 80);
          
          newBoxes.push({
            id: Date.now() + i,
            type,
            color: colorMap[type],
            x: `${x}%`,
            y: `${y}%`,
            width: `${width}%`,
            height: `${height}%`,
            opacity,
            confidence
          });
          
          // Update vehicle count for this detection
          setVehicleCounts(prev => ({
            ...prev,
            [type]: prev[type as keyof typeof prev] + 1
          }));
        }
        
        setBoundingBoxes(prevBoxes => {
          // Keep a few old boxes for continuity
          const oldBoxesToKeep = prevBoxes.slice(0, isLiveMode ? 4 : 2);
          // Update positions to make them move
          const updatedOldBoxes = oldBoxesToKeep.map(box => {
            const newY = parseInt(box.y) + (isLiveMode ? 4 : 3);
            // Remove boxes that move off-screen
            if (newY > 90) return null;
            return {
              ...box,
              y: `${newY}%`,
              opacity: box.opacity - 0.05 // Fade out as they move
            };
          }).filter(Boolean);
          
          return [...updatedOldBoxes, ...newBoxes].slice(0, isLiveMode ? 7 : 5);
        });
      }, isLiveMode ? 500 : 800);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isLiveMode]);
  
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
    if (!videoRef.current || isLiveMode) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration);
  };
  
  const handleSkipBackward = () => {
    if (!videoRef.current || isLiveMode) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-4">
      <div 
        className="video-container overflow-hidden rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {isLiveMode && !videoUrl ? (
          // Live feed simulation
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-700 relative">
            <video 
              ref={videoRef}
              className="w-full h-full opacity-80"
              autoPlay
              muted
              loop
            >
              <source src="/placeholder-video.mp4" type="video/mp4" />
            </video>
            
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
              LIVE
            </div>
            
            {/* Bounding boxes for vehicle detection */}
            {boundingBoxes.map((box) => (
              <div 
                key={box.id}
                className="bounding-box transition-all duration-300"
                style={{
                  borderColor: box.color,
                  top: box.y,
                  left: box.x,
                  width: box.width,
                  height: box.height,
                  opacity: box.opacity,
                }}
              >
                <div 
                  className="bounding-box-label transition-opacity"
                  style={{ backgroundColor: box.color, color: '#fff' }}
                >
                  {box.type} {box.confidence}%
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

            <div className="absolute bottom-4 left-4 text-white text-xs bg-black bg-opacity-50 p-1 rounded">
              Camera Feed • {new Date().toLocaleTimeString()}
            </div>
          </div>
        ) : videoUrl ? (
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
                  height: box.height,
                  opacity: box.opacity || 1
                }}
              >
                <div 
                  className="bounding-box-label"
                  style={{ backgroundColor: box.color, color: '#fff' }}
                >
                  {box.type} {box.confidence ? `${box.confidence}%` : ''}
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
              <p className="text-sm">Upload a video or enable Live Feed to see detection results</p>
            </div>
          </div>
        )}
      </div>
      
      <div className={`transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {(videoUrl || isLiveMode) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSkipBackward}
                  disabled={isLiveMode || !videoUrl}
                  className={isLiveMode ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="hover:bg-blue-50"
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
                  disabled={isLiveMode || !videoUrl}
                  className={isLiveMode ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {isLiveMode ? (
                  <Camera className="h-4 w-4 text-red-500 animate-pulse" />
                ) : (
                  <Video className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm text-gray-500">
                  {isLiveMode ? "Live Feed" : "Video File"}
                </span>
              </div>
            </div>
            
            {!isLiveMode && (
              <>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 cursor-pointer"
                  onClick={(e) => {
                    if (!videoRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    videoRef.current.currentTime = percent * videoRef.current.duration;
                  }}
                >
                  <div 
                    className="absolute h-full bg-blue-500 rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        <p>
          <span className="font-medium">Note:</span> Vehicle detection visualization is simulated. In a production application, this would use a real object detection model.
        </p>
        
        {/* Detection stats */}
        {isPlaying && (
          <div className="mt-2 grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md text-xs">
            <div>Cars: {vehicleCounts.car}</div>
            <div>Bikes: {vehicleCounts.bike}</div>
            <div>Buses: {vehicleCounts.bus}</div>
            <div>Trucks: {vehicleCounts.truck}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
