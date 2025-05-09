
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUploader from "@/components/VideoUploader";
import ParkingDashboard from "@/components/ParkingDashboard";
import CapacitySettings from "@/components/CapacitySettings";
import { VehicleData, initialVehicleData } from "@/types/types";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [vehicleData, setVehicleData] = useState<VehicleData>(initialVehicleData);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  useEffect(() => {
    // Auto-switch to dashboard when processing completes
    if (isProcessed) {
      setActiveTab("dashboard");
    }
  }, [isProcessed]);
  
  const handleUploadVideo = (file: File) => {
    setVideoFile(file);
    // In a real application, we would start processing the video here
    // For demo purposes, we'll simulate processing with a timeout
    setIsProcessing(true);
    
    const toastId = toast.loading("Processing video...", {
      duration: 5000,
    });
    
    setTimeout(() => {
      simulateDetection();
      setIsProcessing(false);
      setIsProcessed(true);
      toast.success("Video processing complete!", {
        id: toastId,
        duration: 3000,
      });
    }, 2000);
  };

  const simulateDetection = () => {
    // Simulate detection results with more realistic data
    const detected = isLiveMode ? 
      // More dynamic results for live mode
      {
        car: Math.floor(Math.random() * 40) + 20,
        bike: Math.floor(Math.random() * 25) + 15,
        bus: Math.floor(Math.random() * 6) + 2,
        truck: Math.floor(Math.random() * 10) + 3,
      } : 
      // Standard results for video upload
      {
        car: Math.floor(Math.random() * 30) + 10,
        bike: Math.floor(Math.random() * 20) + 5,
        bus: Math.floor(Math.random() * 5) + 1,
        truck: Math.floor(Math.random() * 8) + 2,
      };
    
    setVehicleData({
      ...vehicleData,
      detected
    });
  };

  const handleCapacityChange = (type: string, value: number) => {
    setVehicleData({
      ...vehicleData,
      capacity: {
        ...vehicleData.capacity,
        [type]: value
      }
    });
    
    toast.info(`${type.charAt(0).toUpperCase() + type.slice(1)} capacity updated to ${value}`);
  };
  
  const handleToggleLiveMode = (isLive: boolean) => {
    setIsLiveMode(isLive);
    
    if (isLive) {
      // When switching to live mode, reset processing states
      setIsProcessed(false);
      
      // Auto start processing for live mode
      setTimeout(() => {
        setIsProcessing(true);
        
        // Simulate processing completion
        setTimeout(() => {
          simulateDetection();
          setIsProcessing(false);
          setIsProcessed(true);
          toast.success("Live feed connected and processing!", {
            duration: 3000,
          });
        }, 2000);
      }, 500);
    } else {
      // Reset states when switching back from live mode
      setIsProcessing(false);
      setIsProcessed(false);
      setVideoFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Parking Management System
            </h1>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {isLiveMode ? "Live Mode" : "Video Analysis Mode"}
              </span>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Vehicle Detection & Counting
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto border border-blue-100 dark:border-blue-900/50 p-1 rounded-lg">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8">
            <Card className="p-6 border-blue-100 dark:border-blue-800/30 shadow-md">
              <ParkingDashboard 
                vehicleData={vehicleData} 
                isProcessed={isProcessed}
                videoFile={videoFile}
                isLiveMode={isLiveMode}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="upload">
            <Card className="p-6 border-blue-100 dark:border-blue-800/30 shadow-md">
              <VideoUploader 
                onUpload={handleUploadVideo} 
                isProcessing={isProcessing}
                onToggleLiveMode={handleToggleLiveMode}
                isLiveMode={isLiveMode}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="p-6 border-blue-100 dark:border-blue-800/30 shadow-md">
              <CapacitySettings 
                capacity={vehicleData.capacity}
                onChange={handleCapacityChange}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t bg-white dark:bg-slate-900">
        <div className="container py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Vehicle Detection & Parking Status App © 2025
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
