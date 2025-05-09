import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileVideo, Check, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  onToggleLiveMode: (isLive: boolean) => void;
  isLiveMode: boolean;
}

const VideoUploader = ({ onUpload, isProcessing, onToggleLiveMode, isLiveMode }: VideoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Don't handle file drops when in live mode
    if (isLiveMode) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (files: FileList) => {
    const file = files[0];
    // Check if it's a video file
    if (!file.type.includes("video/")) {
      toast.error("Please upload a video file");
      return;
    }
    
    setSelectedFile(file);
    simulateUpload(file);
  };

  const simulateUpload = (file: File) => {
    let uploadProgress = 0;
    const interval = setInterval(() => {
      uploadProgress += 5;
      setProgress(uploadProgress);
      
      if (uploadProgress >= 100) {
        clearInterval(interval);
        toast.success("Video uploaded successfully!");
        onUpload(file);
      }
    }, 100);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleLiveModeToggle = (checked: boolean) => {
    if (checked) {
      toast.info("Switching to live camera feed mode", {
        duration: 3000,
      });
    } else {
      toast.info("Switching to video file upload mode", {
        duration: 3000,
      });
    }
    
    // Reset progress when switching modes
    setProgress(0);
    setSelectedFile(null);
    
    onToggleLiveMode(checked);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Video</h2>
      
      <div className="flex items-center space-x-2 mb-6">
        <Switch 
          id="live-mode" 
          checked={isLiveMode} 
          onCheckedChange={handleLiveModeToggle}
        />
        <Label htmlFor="live-mode" className="flex items-center cursor-pointer">
          <Camera className={`h-4 w-4 mr-2 ${isLiveMode ? 'text-red-500' : 'text-gray-400'}`} />
          Live Camera Feed
          {isLiveMode && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
              Active
            </span>
          )}
        </Label>
      </div>
      
      {isLiveMode ? (
        <div className="border-2 rounded-lg p-8 text-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Camera className={`h-16 w-16 ${isProcessing ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
            </div>
            <div>
              <p className="text-lg font-medium">
                Live Camera Feed Mode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Video is being processed in real-time from your camera feed
              </p>
            </div>
            
            <div className="w-full mt-4">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${isProcessing ? 100 : 0}%`, opacity: isProcessing ? 1 : 0.5 }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{isProcessing ? "Processing" : "Ready"}</span>
                <span className={isProcessing ? "text-blue-500" : "text-gray-400"}>
                  {isProcessing ? "Live feed active" : "Waiting to start"}
                </span>
              </div>
            </div>
            
            <Button 
              variant={isProcessing ? "destructive" : "default"}
              className="mt-2 transition-all duration-300"
              onClick={() => {
                if (isProcessing) {
                  toast.info("Stopping live feed processing");
                  onToggleLiveMode(false);
                } else {
                  toast.success("Starting live feed processing");
                  // We keep live mode on but trigger processing
                  onUpload(new File([""], "live-feed.mp4", { type: "video/mp4" }));
                }
              }}
            >
              {isProcessing ? "Stop Processing" : "Start Processing"}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300"
          } transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
          
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <FileVideo className="h-16 w-16 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Drag & drop your video here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Or click to browse files
                </p>
              </div>
              <Button 
                onClick={handleButtonClick}
                variant="outline"
                className="mt-2 border-blue-200 hover:bg-blue-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Video
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {progress < 100 ? (
                  <FileVideo className="h-16 w-16 text-blue-500" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-medium break-all">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="w-full">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>{progress}%</span>
                  {progress === 100 && <span className="text-green-500">Complete</span>}
                </div>
              </div>
              
              {progress === 100 && !isProcessing && (
                <Button 
                  onClick={handleButtonClick}
                  variant="outline"
                  className="mt-2"
                >
                  Upload Another Video
                </Button>
              )}
              
              {isProcessing && (
                <div className="text-sm text-blue-600 dark:text-blue-400 animate-pulse-opacity">
                  Processing video... Please wait
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Quick Tips:</h3>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>For best results, use videos with a clear view of the entrance</li>
          <li>Vehicle detection works best with good lighting conditions</li>
          <li>{isLiveMode ? "Live mode processes data in real-time" : "Upload higher resolution videos for better detection accuracy"}</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUploader;
