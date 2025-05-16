import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUploader from "@/components/VideoUploader";
import ParkingDashboard from "@/components/ParkingDashboard";
import CapacitySettings from "@/components/CapacitySettings";
import { VehicleData, initialVehicleData } from "@/types/types";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [vehicleData, setVehicleData] = useState<VehicleData>(initialVehicleData);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  useEffect(() => {
    if (isProcessed) {
      setActiveTab("dashboard");
    }
  }, [isProcessed]);
  
  const handleUploadVideo = (file: File) => {
    setVideoFile(file);
    setIsProcessing(true);
    
    const toastId = toast.loading("Processing video...", {
      duration: 5000,
    });
    
    const processingTime = Math.random() * 1000 + 1500;
    
    setTimeout(() => {
      simulateDetection();
      setIsProcessing(false);
      setIsProcessed(true);
      toast.success("Video processing complete!", {
        id: toastId,
        duration: 3000,
      });
    }, processingTime);
  };

  const simulateDetection = () => {
    const detected = isLiveMode ? 
      {
        car: Math.floor(Math.random() * 40) + 20,
        bike: Math.floor(Math.random() * 25) + 15,
        bus: Math.floor(Math.random() * 6) + 2,
        truck: Math.floor(Math.random() * 10) + 3,
      } : 
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
      setIsProcessed(false);
      
      setTimeout(() => {
        setIsProcessing(true);
        
        const liveStartupTime = Math.random() * 1000 + 1500;
        
        setTimeout(() => {
          simulateDetection();
          setIsProcessing(false);
          setIsProcessed(true);
          toast.success("Live feed connected and processing!", {
            duration: 3000,
          });
        }, liveStartupTime);
      }, 500);
    } else {
      setIsProcessing(false);
      setIsProcessed(false);
      setVideoFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Parking Management System
            </motion.h1>
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-4 py-2 rounded-full backdrop-blur-sm ${
                  isLiveMode ? 
                  "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400" : 
                  "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isLiveMode ? "bg-red-500 animate-pulse" : "bg-blue-500"}`} />
                  <span className="text-sm font-medium">
                    {isLiveMode ? "Live Mode" : "Video Analysis"}
                  </span>
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50">
              <TabsTrigger 
                value="dashboard"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-full"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-full"
              >
                Upload Video
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-full"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <ParkingDashboard 
                    vehicleData={vehicleData} 
                    isProcessed={isProcessed}
                    videoFile={videoFile}
                    isLiveMode={isLiveMode}
                  />
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="upload">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <VideoUploader 
                    onUpload={handleUploadVideo} 
                    isProcessing={isProcessing}
                    onToggleLiveMode={handleToggleLiveMode}
                    isLiveMode={isLiveMode}
                  />
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CapacitySettings 
                    capacity={vehicleData.capacity}
                    onChange={handleCapacityChange}
                  />
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
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
