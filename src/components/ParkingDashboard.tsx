import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CustomProgress } from "@/components/ui/custom-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Bike, Bus, Truck, Activity, AlertCircle } from "lucide-react";
import { VehicleData } from "@/types/types";
import VideoPlayer from "./VideoPlayer";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ParkingDashboardProps {
  vehicleData: VehicleData;
  isProcessed: boolean;
  videoFile: File | null;
  isLiveMode: boolean;
}

const ParkingDashboard = ({ vehicleData, isProcessed, videoFile, isLiveMode = false }: ParkingDashboardProps) => {
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

  // New state for enhanced interactivity
  const [activeVehicleType, setActiveVehicleType] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

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
          // Show alert if parking is getting full
          if (occupied > total * 0.8) {
            setShowAlert(true);
            toast.warning("Parking capacity is reaching its limit!", {
              duration: 5000,
            });
          }
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [vehicleData, isProcessed]);

  // Handle hover effect for vehicle types
  const handleVehicleHover = (type: string | null) => {
    setActiveVehicleType(type);
  };

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

  // Historical trend data (simulated)
  const trendData = [
    { time: '09:00', cars: 10, bikes: 5, buses: 1, trucks: 2 },
    { time: '10:00', cars: 15, bikes: 8, buses: 2, trucks: 3 },
    { time: '11:00', cars: 20, bikes: 12, buses: 2, trucks: 4 },
    { time: '12:00', cars: 25, bikes: 15, buses: 3, trucks: 5 },
    { time: '13:00', cars: 22, bikes: 17, buses: 3, trucks: 4 },
    { time: '14:00', cars: vehicleData.detected.car, bikes: vehicleData.detected.bike, buses: vehicleData.detected.bus, trucks: vehicleData.detected.truck },
  ];

  // Tooltips for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Parking Dashboard</h2>
        {isLiveMode && (
          <Badge variant="outline" className="animate-pulse bg-red-50 text-red-500 border-red-200">
            Live Mode
          </Badge>
        )}
      </div>
      
      {showAlert && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md animate-fade-in mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Parking capacity is reaching its limit! ({totalOccupied}/{totalSpaces} spaces occupied)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!isProcessed ? (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Upload a video using the "Upload Video" tab to analyze parking data and see results here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="transform transition-all hover:shadow-lg border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Video Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer videoFile={videoFile} isLiveMode={isLiveMode} />
              </CardContent>
            </Card>
            
            <Card className="transform transition-all hover:shadow-lg border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Parking Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-[180px] w-[180px] transform transition-all hover:scale-105">
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
                            animationBegin={0}
                            animationDuration={1500}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg transform transition-all">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {totalOccupied} / {totalSpaces}
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-300">
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
                        <span className={`px-3 py-2 text-sm rounded-full transition-colors duration-300 ${
                          totalOccupied >= totalSpaces 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Vehicle Summary</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="trends">Parking Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Card 
                  className={`parking-stat bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-lg ${activeVehicleType === 'car' ? 'ring-2 ring-red-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('car')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
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
                
                <Card 
                  className={`parking-stat bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-lg ${activeVehicleType === 'bike' ? 'ring-2 ring-green-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('bike')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
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
                
                <Card 
                  className={`parking-stat bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-lg ${activeVehicleType === 'bus' ? 'ring-2 ring-yellow-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('bus')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
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
                
                <Card 
                  className={`parking-stat bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-lg ${activeVehicleType === 'truck' ? 'ring-2 ring-purple-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('truck')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
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
                <Card className="transform transition-all hover:shadow-lg">
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
                            animationBegin={0}
                            animationDuration={1500}
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
                
                <Card className="transform transition-all hover:shadow-lg">
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
                        <CustomProgress
                          value={(Math.min(vehicleData.detected.car, vehicleData.capacity.car) / vehicleData.capacity.car) * 100}
                          className="h-2"
                          indicatorClassName="bg-parking-car"
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
                        <CustomProgress
                          value={(Math.min(vehicleData.detected.bike, vehicleData.capacity.bike) / vehicleData.capacity.bike) * 100}
                          className="h-2"
                          indicatorClassName="bg-parking-bike"
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
                        <CustomProgress
                          value={(Math.min(vehicleData.detected.bus, vehicleData.capacity.bus) / vehicleData.capacity.bus) * 100}
                          className="h-2"
                          indicatorClassName="bg-parking-bus"
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
                        <CustomProgress
                          value={(Math.min(vehicleData.detected.truck, vehicleData.capacity.truck) / vehicleData.capacity.truck) * 100}
                          className="h-2"
                          indicatorClassName="bg-parking-truck"
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
                                className={`px-2 py-1 text-xs rounded-full ${colors[type as keyof typeof colors]} animate-pulse`}
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

            <TabsContent value="trends">
              <Card className="mt-4 transform transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Hourly Parking Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cars" stackId="a" fill="#ef4444" animationDuration={1500} />
                        <Bar dataKey="bikes" stackId="a" fill="#22c55e" animationDuration={1500} />
                        <Bar dataKey="buses" stackId="a" fill="#eab308" animationDuration={1500} />
                        <Bar dataKey="trucks" stackId="a" fill="#8b5cf6" animationDuration={1500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Parking usage patterns throughout the day
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ParkingDashboard;
