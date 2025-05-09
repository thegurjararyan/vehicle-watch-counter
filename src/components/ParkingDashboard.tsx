import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CustomProgress } from "@/components/ui/custom-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Bike, Bus, Truck, Activity, AlertCircle, Gauge, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { VehicleData } from "@/types/types";
import VideoPlayer from "./VideoPlayer";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from "recharts";
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
  const [capacityStatus, setCapacityStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [realTimeData, setRealTimeData] = useState<Array<{time: string, cars: number, bikes: number, buses: number, trucks: number}>>([]);
  
  // Time-based simulation
  const [simulationTime, setSimulationTime] = useState(new Date());

  useEffect(() => {
    // Calculate totals
    const total = Object.values(vehicleData.capacity).reduce((sum, val) => sum + val, 0);
    const occupied = Object.entries(vehicleData.detected).reduce((sum, [key, val]) => {
      return sum + Math.min(val, vehicleData.capacity[key as keyof typeof vehicleData.capacity]);
    }, 0);
    
    setTotalSpaces(total);
    setTotalOccupied(occupied);
    
    // Set capacity status
    if (occupied > total * 0.9) {
      setCapacityStatus('critical');
    } else if (occupied > total * 0.7) {
      setCapacityStatus('warning');
    } else {
      setCapacityStatus('normal');
    }
    
    // Animate counts on first successful processing
    if (isProcessed && !animationRunRef.current) {
      animationRunRef.current = true;
      
      const animationDuration = 1800; // ms
      const steps = 25;
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

  // Real-time data simulation for live mode
  useEffect(() => {
    if (!isProcessed) return;
    
    const timer = setInterval(() => {
      setSimulationTime(prev => {
        const newTime = new Date(prev);
        newTime.setMinutes(newTime.getMinutes() + 5);
        return newTime;
      });
      
      if (isLiveMode) {
        // In live mode, add data points more frequently
        addRealTimeDataPoint();
      }
    }, isLiveMode ? 2000 : 10000);
    
    return () => clearInterval(timer);
  }, [isProcessed, isLiveMode]);
  
  // Initial data setup
  useEffect(() => {
    if (isProcessed && realTimeData.length === 0) {
      // Set up initial data points
      const initialData = [];
      const now = new Date();
      
      // Generate some historical data
      for (let i = 6; i >= 0; i--) {
        const timePoint = new Date(now);
        timePoint.setMinutes(timePoint.getMinutes() - (i * 30));
        
        initialData.push({
          time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cars: Math.max(0, animatedCounts.car - Math.floor(Math.random() * i * 3)),
          bikes: Math.max(0, animatedCounts.bike - Math.floor(Math.random() * i * 2)),
          buses: Math.max(0, animatedCounts.bus - Math.floor(Math.random() * i)),
          trucks: Math.max(0, animatedCounts.truck - Math.floor(Math.random() * i))
        });
      }
      
      // Add current point
      initialData.push({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cars: animatedCounts.car,
        bikes: animatedCounts.bike,
        buses: animatedCounts.bus,
        trucks: animatedCounts.truck
      });
      
      setRealTimeData(initialData);
    }
  }, [isProcessed, animatedCounts, realTimeData]);

  // Handle hover effect for vehicle types
  const handleVehicleHover = (type: string | null) => {
    setActiveVehicleType(type);
  };
  
  // Add a new data point to real-time tracking
  const addRealTimeDataPoint = () => {
    setRealTimeData(prev => {
      // Create fluctuations for realism
      const lastPoint = prev[prev.length - 1];
      
      const newPoint = {
        time: simulationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cars: Math.max(0, lastPoint.cars + Math.floor(Math.random() * 7) - 3),
        bikes: Math.max(0, lastPoint.bikes + Math.floor(Math.random() * 5) - 2),
        buses: Math.max(0, lastPoint.buses + Math.floor(Math.random() * 2) - 1),
        trucks: Math.max(0, lastPoint.trucks + Math.floor(Math.random() * 3) - 1)
      };
      
      // Update animation counts for live feel
      setAnimatedCounts({
        car: newPoint.cars,
        bike: newPoint.bikes,
        bus: newPoint.buses,
        truck: newPoint.trucks
      });
      
      // Keep only the last 8 points for cleaner charts
      return [...prev.slice(-7), newPoint];
    });
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

  // Tooltips for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-2 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Parking Dashboard</h2>
        {isLiveMode && (
          <Badge variant="outline" className="animate-pulse bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-800/30">
            Live Mode • {simulationTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Badge>
        )}
      </div>
      
      {showAlert && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md animate-fade-in mb-4 dark:bg-amber-900/20 dark:border-amber-500">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Parking capacity is reaching its limit! ({totalOccupied}/{totalSpaces} spaces occupied)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!isProcessed ? (
        <div className="text-center py-16 glass-card rounded-xl">
          <Activity className="mx-auto h-16 w-16 text-blue-400 mb-6 animate-pulse" />
          <h3 className="text-2xl font-medium mb-3 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-slate-300 dark:to-slate-500">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Upload a video using the "Upload Video" tab to analyze parking data and see results here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card animate-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Video Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer videoFile={videoFile} isLiveMode={isLiveMode} />
              </CardContent>
            </Card>
            
            <Card className="glass-card animate-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Parking Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-[180px] w-[180px] transform transition-all hover:scale-105 animate-float">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                            animationBegin={0}
                            animationDuration={1800}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2 glass-card p-3 rounded-xl transform transition-all bg-blue-50/80 dark:bg-blue-900/20">
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
                        <span className={`px-3 py-2 text-sm rounded-lg transition-colors duration-500 ${
                          capacityStatus === 'critical' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                            : capacityStatus === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        } flex items-center space-x-1.5`}>
                          {capacityStatus === 'critical' ? (
                            <XCircle className="h-4 w-4" />
                          ) : capacityStatus === 'warning' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <span>
                            {capacityStatus === 'critical' ? 'CRITICAL' : 
                             capacityStatus === 'warning' ? 'HIGH OCCUPANCY' : 'SPACES AVAILABLE'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="glass-card mb-4 p-1 w-full grid grid-cols-3 rounded-xl">
              <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500">Vehicle Summary</TabsTrigger>
              <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500">Parking Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Card 
                  className={`parking-stat glass-card ${activeVehicleType === 'car' ? 'ring-2 ring-red-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('car')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 p-3 rounded-lg">
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
                  className={`parking-stat glass-card ${activeVehicleType === 'bike' ? 'ring-2 ring-green-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('bike')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 p-3 rounded-lg">
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
                  className={`parking-stat glass-card ${activeVehicleType === 'bus' ? 'ring-2 ring-yellow-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('bus')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 p-3 rounded-lg">
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
                  className={`parking-stat glass-card ${activeVehicleType === 'truck' ? 'ring-2 ring-purple-400 transform scale-105' : ''}`}
                  onMouseEnter={() => handleVehicleHover('truck')}
                  onMouseLeave={() => handleVehicleHover(null)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 p-3 rounded-lg">
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
                <Card className="glass-card animate-card">
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
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1800}
                          >
                            {vehicleTypeData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                stroke="none"
                                className="hover:opacity-80 transition-opacity"
                              />
                            ))}
                          </Pie>
                          <Legend formatter={(value) => <span className="text-sm font-medium">{value}</span>} />
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card animate-card">
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
                          indicatorClassName="bg-gradient-to-r from-red-600 to-red-500"
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
                          indicatorClassName="bg-gradient-to-r from-green-600 to-green-500"
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
                          indicatorClassName="bg-gradient-to-r from-yellow-600 to-yellow-500"
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
                          indicatorClassName="bg-gradient-to-r from-purple-600 to-purple-500"
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
                              car: "bg-gradient-to-r from-red-100 to-red-50 text-red-800 dark:from-red-900/20 dark:to-red-900/10 dark:text-red-400",
                              bike: "bg-gradient-to-r from-green-100 to-green-50 text-green-800 dark:from-green-900/20 dark:to-green-900/10 dark:text-green-400",
                              bus: "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-900/10 dark:text-yellow-400",
                              truck: "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 dark:from-purple-900/20 dark:to-purple-900/10 dark:text-purple-400",
                            };
                            
                            return (
                              <span 
                                key={index} 
                                className={`px-2 py-1 text-xs rounded-full ${colors[type as keyof typeof colors]} animate-pulse shadow-sm`}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <Card className="glass-card animate-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Parking Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={realTimeData}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area type="monotone" dataKey="cars" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="bikes" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="buses" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="trucks" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Real-time parking usage patterns
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card animate-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Gauge className="h-4 w-4 mr-2" />
                      Occupancy Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={realTimeData}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="cars" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="bikes" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="buses" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="trucks" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Current occupancy rate: 
                        <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">
                          {Math.round((totalOccupied / totalSpaces) * 100)}%
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${capacityStatus === 'critical' 
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30' 
                            : capacityStatus === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'
                            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30'
                          }
                        `}
                      >
                        {capacityStatus === 'critical' 
                          ? 'Critical' 
                          : capacityStatus === 'warning' 
                          ? 'High' 
                          : 'Normal'}
                      </Badge>
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
