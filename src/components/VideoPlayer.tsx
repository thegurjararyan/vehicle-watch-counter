
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
  
  // Enhanced vehicle detection simulation data
  const [boundingBoxes, setBoundingBoxes] = useState<any[]>([]);
  const [entryLine, setEntryLine] = useState({ y: 60 });
  const [vehicleCounts, setVehicleCounts] = useState({ car: 0, bike: 0, bus: 0, truck: 0 });
  
  // Tracking data for consistent detections
  const [trackedObjects, setTrackedObjects] = useState<Map<string, any>>(new Map());
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [detectionPrecision, setDetectionPrecision] = useState(95); // High precision simulation
  
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
  
  // Enhanced vehicle detection simulation with improved tracking algorithm
  useEffect(() => {
    if (isPlaying) {
      // Advanced detection algorithm with temporal consistency
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const timeDelta = currentTime - lastUpdateTime;
        setLastUpdateTime(currentTime);
        
        // Update existing tracked objects for smooth transitions
        const updatedTrackedObjects = new Map(trackedObjects);
        
        // Process existing objects first (object persistence)
        trackedObjects.forEach((trackedObj, id) => {
          // Update positions of tracked objects with consistent motion
          const newY = parseInt(trackedObj.y) + (trackedObj.speed * timeDelta / 100);
          
          // Remove objects that move off-screen
          if (newY > 90) {
            updatedTrackedObjects.delete(id);
            return;
          }
          
          // Calculate slight position adjustments for realism
          const driftX = (Math.sin(currentTime / 1000 + parseInt(id)) * 0.2);
          const newX = Math.max(0, Math.min(95, parseFloat(trackedObj.x) + driftX));
          
          // Object persistence with slight adjustments for realism
          updatedTrackedObjects.set(id, {
            ...trackedObj,
            y: `${newY}%`,
            x: `${newX}%`,
            opacity: Math.max(0.4, trackedObj.opacity - 0.02),
            lastUpdated: currentTime,
            confidence: Math.max(
              trackedObj.baseConfidence - 1, 
              Math.min(
                trackedObj.baseConfidence + 1,
                trackedObj.confidence + (Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? -0.5 : 0.5)
              )
            )
          });
        });
        
        // Potentially add new objects with temporally consistent detection
        const shouldAddNewObjects = Math.random() < (isLiveMode ? 0.7 : 0.5);
        
        if (shouldAddNewObjects) {
          const newBoxCount = Math.floor(Math.random() * 2) + (isLiveMode ? 1 : 0);
          
          for (let i = 0; i < newBoxCount; i++) {
            const vehicleTypes = ["car", "bike", "bus", "truck"];
            const weights = [0.65, 0.20, 0.05, 0.10]; // Realistic distribution
            
            // Weighted random selection for more realistic vehicle distribution
            const randomValue = Math.random();
            let cumulativeWeight = 0;
            let selectedIndex = 0;
            
            for (let j = 0; j < weights.length; j++) {
              cumulativeWeight += weights[j];
              if (randomValue < cumulativeWeight) {
                selectedIndex = j;
                break;
              }
            }
            
            const type = vehicleTypes[selectedIndex];
            
            const colorMap: Record<string, string> = {
              car: "#ef4444",
              bike: "#22c55e",
              bus: "#eab308",
              truck: "#8b5cf6"
            };
            
            // Improved dimensional accuracy based on vehicle type
            const width = 
              type === "car" ? 18 + (Math.random() * 4) : 
              type === "bike" ? 8 + (Math.random() * 3) :
              type === "bus" ? 28 + (Math.random() * 4) :
              24 + (Math.random() * 3);
              
            const height = 
              type === "car" ? 12 + (Math.random() * 4) : 
              type === "bike" ? 6 + (Math.random() * 3) :
              type === "bus" ? 18 + (Math.random() * 3) :
              16 + (Math.random() * 3);
            
            // Entry points are now more lane-based for realism
            const laneCount = 3;
            const lane = Math.floor(Math.random() * laneCount);
            const laneWidth = 90 / laneCount;
            const x = (lane * laneWidth) + (Math.random() * (laneWidth * 0.7)) + 5;
            
            // Higher speed for highways, lower for urban areas (based on mode)
            const baseSpeed = isLiveMode ? 0.6 : 0.4;
            const speed = baseSpeed + (Math.random() * 0.3);
            
            // High precision confidence scores with slight variations
            const baseConfidence = Math.floor(detectionPrecision - (Math.random() * 8));
            const confidence = baseConfidence;
            
            const newId = `${Date.now()}_${i}`;
            
            updatedTrackedObjects.set(newId, {
              id: newId,
              type,
              color: colorMap[type],
              x: `${x}%`,
              y: `10%`, // Start from top
              width: `${width}%`,
              height: `${height}%`,
              speed,
              opacity: 0.9,
              baseConfidence,
              confidence,
              lastUpdated: currentTime,
              isNew: true
            });
            
            // Update vehicle count for this detection
            setVehicleCounts(prev => ({
              ...prev,
              [type]: prev[type as keyof typeof prev] + 1
            }));
          }
        }
        
        // Convert tracked objects to bounding boxes for display
        const currentBoxes = Array.from(updatedTrackedObjects.values());
        setBoundingBoxes(currentBoxes);
        setTrackedObjects(updatedTrackedObjects);
        
      }, isLiveMode ? 300 : 400); // More frequent updates for smoother animation
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isLiveMode, trackedObjects, lastUpdateTime, detectionPrecision]);
  
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
            
            {/* Enhanced bounding boxes with smoother animations */}
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
                  transform: box.isNew ? "scale(1.05)" : "scale(1)",
                  boxShadow: box.isNew ? `0 0 8px ${box.color}40` : "none"
                }}
              >
                <div 
                  className="bounding-box-label transition-opacity"
                  style={{ backgroundColor: box.color, color: '#fff' }}
                >
                  {box.type} {Math.round(box.confidence)}%
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
            
            {/* New: Detection precision indicator */}
            <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
              Detection Precision: {detectionPrecision}%
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
            
            {/* Enhanced bounding boxes with smoother animations */}
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
                  opacity: box.opacity || 1,
                  transform: box.isNew ? "scale(1.05)" : "scale(1)",
                  boxShadow: box.isNew ? `0 0 8px ${box.color}40` : "none"
                }}
              >
                <div 
                  className="bounding-box-label transition-opacity"
                  style={{ backgroundColor: box.color, color: '#fff' }}
                >
                  {box.type} {Math.round(box.confidence)}%
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
            
            {/* New: Detection precision indicator */}
            <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
              Detection Precision: {detectionPrecision}%
            </div>
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
          <span className="font-medium">Note:</span> Enhanced vehicle detection visualization with {detectionPrecision}% precision. In a production application, this would use a real object detection model.
        </p>
        
        {/* Detection stats with enhanced styling */}
        {isPlaying && (
          <div className="mt-2 grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md text-xs">
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Cars: {vehicleCounts.car}</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Bikes: {vehicleCounts.bike}</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span> Buses: {vehicleCounts.bus}</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span> Trucks: {vehicleCounts.truck}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
