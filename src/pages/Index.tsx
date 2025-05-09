
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUploader from "@/components/VideoUploader";
import ParkingDashboard from "@/components/ParkingDashboard";
import CapacitySettings from "@/components/CapacitySettings";
import { VehicleData, initialVehicleData } from "@/types/types";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [vehicleData, setVehicleData] = useState<VehicleData>(initialVehicleData);
  
  const handleUploadVideo = (file: File) => {
    setVideoFile(file);
    // In a real application, we would start processing the video here
    // For demo purposes, we'll simulate processing with a timeout
    setIsProcessing(true);
    setTimeout(() => {
      simulateDetection();
      setIsProcessing(false);
      setIsProcessed(true);
    }, 2000);
  };

  const simulateDetection = () => {
    // Simulate detection results
    const detected = {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Parking Management System
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Vehicle Detection & Counting
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8">
            <Card className="p-6">
              <ParkingDashboard 
                vehicleData={vehicleData} 
                isProcessed={isProcessed}
                videoFile={videoFile}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="upload">
            <Card className="p-6">
              <VideoUploader 
                onUpload={handleUploadVideo} 
                isProcessing={isProcessing}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="p-6">
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
