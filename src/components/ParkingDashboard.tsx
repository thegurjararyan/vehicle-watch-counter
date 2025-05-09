
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Bike, Bus, Truck, Activity } from "lucide-react";
import { VehicleData } from "@/types/types";
import VideoPlayer from "./VideoPlayer";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ParkingDashboardProps {
  vehicleData: VehicleData;
  isProcessed: boolean;
  videoFile: File | null;
}

const ParkingDashboard = ({ vehicleData, isProcessed, videoFile }: ParkingDashboardProps) => {
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [totalOccupied, setTotalOccupied] = useState(0);
  const [animatedCounts, setAnimatedCounts] = useState({
    car: 0,
    bike: 0,
    bus: 0,
    truck: 0,
  });

  // References to track if animations have run
  const animationRunRef = useRef(false);

  useEffect(() => {
    // Calculate totals
    const total = Object.values(vehicleData.capacity).reduce((sum, val) => sum + val, 0);
    const occupied = Object.entries(vehicleData.detected).reduce((sum, [key, val]) => {
      return sum + Math.min(val, vehicleData.capacity[key as keyof typeof vehicleData.capacity]);
    }, 0);
    
    setTotalSpaces(total);
    setTotalOccupied(occupied);
    
    // Animate counts on first successful processing
    if (isProcessed && !animationRunRef.current) {
      animationRunRef.current = true;
      
      const animationDuration = 1500; // ms
      const steps = 20;
      const interval = animationDuration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setAnimatedCounts({
          car: Math.round(vehicleData.detected.car * progress),
          bike: Math.round(vehicleData.detected.bike * progress),
          bus: Math.round(vehicleData.detected.bus * progress),
          truck: Math.round(vehicleData.detected.truck * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [vehicleData, isProcessed]);

  // Prepare chart data
  const chartData = [
    {
      name: "Occupied",
      value: totalOccupied,
      color: "#3b82f6"
    },
    {
      name: "Available",
      value: Math.max(0, totalSpaces - totalOccupied),
      color: "#e2e8f0"
    }
  ];

  // Vehicle type chart data
  const vehicleTypeData = [
    {
      name: "Cars",
      value: vehicleData.detected.car,
      color: "#ef4444"
    },
    {
      name: "Bikes",
      value: vehicleData.detected.bike,
      color: "#22c55e"
    },
    {
      name: "Buses",
      value: vehicleData.detected.bus,
      color: "#eab308"
    },
    {
      name: "Trucks",
      value: vehicleData.detected.truck,
      color: "#8b5cf6"
    }
  ];

  // Tooltips for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Parking Dashboard</h2>
      
      {!isProcessed ? (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Upload a video using the "Upload Video" tab to analyze parking data and see results here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Video Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer videoFile={videoFile} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Parking Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-[180px] w-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-2xl font-bold">
                        {totalOccupied} / {totalSpaces}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Parking Spaces
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Total Parked</span>
                        <span className="font-medium">{totalOccupied}</span>
                      </div>
                      <Progress
                        value={(totalOccupied / totalSpaces) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Available</span>
                        <span className="font-medium">{Math.max(0, totalSpaces - totalOccupied)}</span>
                      </div>
                      <Progress
                        value={((totalSpaces - totalOccupied) / totalSpaces) * 100}
                        className="h-2 bg-gray-200"
                      />
                    </div>
                    <div className="pt-2">
                      <div className="text-sm font-medium mb-1">Real-time Status</div>
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          totalOccupied >= totalSpaces 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {totalOccupied >= totalSpaces ? 'FULL' : 'SPACES AVAILABLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Vehicle Summary</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Card className="parking-stat bg-white dark:bg-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                        <Car className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Cars</div>
                        <div className="text-2xl font-bold">{animatedCounts.car}</div>
                        <div className="text-sm mt-1">
                          <span className={`${
                            vehicleData.detected.car > vehicleData.capacity.car
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {Math.min(vehicleData.detected.car, vehicleData.capacity.car)} / {vehicleData.capacity.car} spaces
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="parking-stat bg-white dark:bg-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                        <Bike className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Bikes</div>
                        <div className="text-2xl font-bold">{animatedCounts.bike}</div>
                        <div className="text-sm mt-1">
                          <span className={`${
                            vehicleData.detected.bike > vehicleData.capacity.bike
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {Math.min(vehicleData.detected.bike, vehicleData.capacity.bike)} / {vehicleData.capacity.bike} spaces
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="parking-stat bg-white dark:bg-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                        <Bus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Buses</div>
                        <div className="text-2xl font-bold">{animatedCounts.bus}</div>
                        <div className="text-sm mt-1">
                          <span className={`${
                            vehicleData.detected.bus > vehicleData.capacity.bus
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {Math.min(vehicleData.detected.bus, vehicleData.capacity.bus)} / {vehicleData.capacity.bus} spaces
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="parking-stat bg-white dark:bg-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                        <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Trucks</div>
                        <div className="text-2xl font-bold">{animatedCounts.truck}</div>
                        <div className="text-sm mt-1">
                          <span className={`${
                            vehicleData.detected.truck > vehicleData.capacity.truck
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {Math.min(vehicleData.detected.truck, vehicleData.capacity.truck)} / {vehicleData.capacity.truck} spaces
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Vehicle Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={vehicleTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {vehicleTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Capacity Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-1 text-red-500" />
                            <span className="text-sm">Cars</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.min(vehicleData.detected.car, vehicleData.capacity.car)} / {vehicleData.capacity.car}
                          </span>
                        </div>
                        <Progress
                          value={(Math.min(vehicleData.detected.car, vehicleData.capacity.car) / vehicleData.capacity.car) * 100}
                          className="h-2"
                          indicatorColor="bg-parking-car"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Bike className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-sm">Bikes</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.min(vehicleData.detected.bike, vehicleData.capacity.bike)} / {vehicleData.capacity.bike}
                          </span>
                        </div>
                        <Progress
                          value={(Math.min(vehicleData.detected.bike, vehicleData.capacity.bike) / vehicleData.capacity.bike) * 100}
                          className="h-2"
                          indicatorColor="bg-parking-bike"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Bus className="h-4 w-4 mr-1 text-yellow-500" />
                            <span className="text-sm">Buses</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.min(vehicleData.detected.bus, vehicleData.capacity.bus)} / {vehicleData.capacity.bus}
                          </span>
                        </div>
                        <Progress
                          value={(Math.min(vehicleData.detected.bus, vehicleData.capacity.bus) / vehicleData.capacity.bus) * 100}
                          className="h-2"
                          indicatorColor="bg-parking-bus"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-1 text-purple-500" />
                            <span className="text-sm">Trucks</span>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.min(vehicleData.detected.truck, vehicleData.capacity.truck)} / {vehicleData.capacity.truck}
                          </span>
                        </div>
                        <Progress
                          value={(Math.min(vehicleData.detected.truck, vehicleData.capacity.truck) / vehicleData.capacity.truck) * 100}
                          className="h-2"
                          indicatorColor="bg-parking-truck"
                        />
                      </div>
                      
                      <div className="mt-4 pt-2 border-t">
                        <div className="text-sm font-medium mb-2">Excess Vehicles (No Parking)</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(vehicleData.detected).map(([type, count], index) => {
                            const capacity = vehicleData.capacity[type as keyof typeof vehicleData.capacity];
                            const excess = Math.max(0, count - capacity);
                            
                            if (excess === 0) return null;
                            
                            const colors = {
                              car: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                              bike: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                              bus: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                              truck: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
                            };
                            
                            return (
                              <span 
                                key={index} 
                                className={`px-2 py-1 text-xs rounded-full ${colors[type as keyof typeof colors]}`}
                              >
                                {excess} {type}s
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ParkingDashboard;
