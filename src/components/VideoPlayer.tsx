import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Video, Camera, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

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
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onClick={togglePlayPause}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isLiveMode ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <Camera className="h-20 w-20 text-blue-500" />
                {isPlaying && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Loader2 className="h-20 w-20 text-blue-500/50" />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <Video className="h-20 w-20 text-blue-500" />
            )}
          </div>
        )}
        
        <AnimatePresence>
          {boundingBoxes.map((box) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: box.opacity, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute border-2"
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
                borderColor: box.color,
                boxShadow: `0 0 8px ${box.color}40`
              }}
            >
              <div 
                className="absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded-md"
                style={{ 
                  backgroundColor: box.color,
                  color: '#fff'
                }}
              >
                {box.type} {Math.round(box.confidence)}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkipBackward}
                  disabled={isLiveMode}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkipForward}
                  disabled={isLiveMode}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 mx-4">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentTime / duration) * 100}%` }}
                      transition={{ duration: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-white font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="mt-4 space-y-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            <span className="font-medium">Note:</span> Enhanced vehicle detection visualization with {detectionPrecision}% precision. In a production application, this would use a real object detection model.
          </p>
        </motion.div>
        
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cars: {vehicleCounts.car}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bikes: {vehicleCounts.bike}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Buses: {vehicleCounts.bus}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trucks: {vehicleCounts.truck}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
