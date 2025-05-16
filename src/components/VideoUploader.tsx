import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileVideo, Check, Camera, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

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
      toast.info("Switching to live camera feed mode");
    } else {
      toast.info("Switching to video file upload mode");
    }
    
    setProgress(0);
    setSelectedFile(null);
    onToggleLiveMode(checked);
  };

  return (
    <div className="p-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
      >
        Upload Video
      </motion.h2>
      
      <div className="flex items-center space-x-4 mb-8">
        <Switch 
          id="live-mode" 
          checked={isLiveMode} 
          onCheckedChange={handleLiveModeToggle}
          className="data-[state=checked]:bg-blue-600"
        />
        <Label htmlFor="live-mode" className="flex items-center cursor-pointer">
          <Camera className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium">Live Camera Feed</span>
          {isLiveMode && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-2 text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full"
            >
              Active
            </motion.span>
          )}
        </Label>
      </div>
      
      {isLiveMode ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 text-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex justify-center"
            >
              <div className="relative">
                <Camera className="h-20 w-20 text-blue-500" />
                {isProcessing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Loader2 className="h-20 w-20 text-blue-500/50" />
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <div>
              <p className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Live Camera Feed Mode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Video is being processed in real-time from your camera feed
              </p>
            </div>
            
            <div className="w-full mt-6">
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isProcessing ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-gray-600 dark:text-gray-300">{isProcessing ? "Processing" : "Ready"}</span>
                <span className="text-gray-500">
                  {isProcessing ? "Live feed active" : "Waiting to start"}
                </span>
              </div>
            </div>
            
            <Button 
              variant={isProcessing ? "destructive" : "default"}
              className={`${
                isProcessing 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              } text-white shadow-lg hover:shadow-xl transition-all duration-200`}
              onClick={() => {
                if (isProcessing) {
                  toast.info("Stopping live feed processing");
                  onToggleLiveMode(false);
                } else {
                  toast.success("Starting live feed processing");
                  onUpload(new File([""], "live-feed.mp4", { type: "video/mp4" }));
                }
              }}
            >
              {isProcessing ? "Stop Processing" : "Start Processing"}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
            dragActive 
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-gray-700"
          }`}
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
          
          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex justify-center"
                >
                  <FileVideo className="h-20 w-20 text-blue-500" />
                </motion.div>
                <div>
                  <p className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Drag & drop your video here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Or click to browse files
                  </p>
                </div>
                <Button 
                  onClick={handleButtonClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Video
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="selected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center"
                >
                  {progress < 100 ? (
                    <div className="relative">
                      <FileVideo className="h-20 w-20 text-blue-500" />
                      {isProcessing && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0"
                        >
                          <Loader2 className="h-20 w-20 text-blue-500/50" />
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                    >
                      <Check className="h-10 w-10 text-white" />
                    </motion.div>
                  )}
                </motion.div>
                <div>
                  <p className="text-xl font-medium break-all bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="w-full">
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-gray-600 dark:text-gray-300">{progress}%</span>
                    {progress === 100 && <span className="text-gray-500">Complete</span>}
                  </div>
                </div>
                
                {progress === 100 && !isProcessing && (
                  <Button 
                    onClick={handleButtonClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Upload Another Video
                  </Button>
                )}
                
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-500"
                  >
                    Processing video...
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default VideoUploader;
