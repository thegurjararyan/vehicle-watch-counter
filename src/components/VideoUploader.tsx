
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileVideo, Check } from "lucide-react";

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const VideoUploader = ({ onUpload, isProcessing }: VideoUploaderProps) => {
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
      uploadProgress += 10;
      setProgress(uploadProgress);
      
      if (uploadProgress >= 100) {
        clearInterval(interval);
        toast.success("Video uploaded successfully!");
        onUpload(file);
      }
    }, 200);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Video</h2>
      
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
              className="mt-2"
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
    </div>
  );
};

export default VideoUploader;
