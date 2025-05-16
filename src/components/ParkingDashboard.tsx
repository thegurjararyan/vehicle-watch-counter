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
import { motion, AnimatePresence } from "framer-motion";

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

  const animationRunRef = useRef(false);
  const [activeVehicleType, setActiveVehicleType] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [capacityStatus, setCapacityStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [realTimeData, setRealTimeData] = useState<Array<{time: string, cars: number, bikes: number, buses: number, trucks: number}>>([]);
  const [simulationTime, setSimulationTime] = useState(new Date());

  useEffect(() => {
    const total = Object.values(vehicleData.capacity).reduce((sum, val) => sum + val, 0);
    const occupied = Object.entries(vehicleData.detected).reduce((sum, [key, val]) => {
      return sum + Math.min(val, vehicleData.capacity[key as keyof typeof vehicleData.capacity]);
    }, 0);
    
    setTotalSpaces(total);
    setTotalOccupied(occupied);
    
    if (occupied > total * 0.9) {
      setCapacityStatus('critical');
    } else if (occupied > total * 0.7) {
      setCapacityStatus('warning');
    } else {
      setCapacityStatus('normal');
    }
    
    if (isProcessed && !animationRunRef.current) {
      animationRunRef.current = true;
      setAnimatedCounts(vehicleData.detected);
      
      if (occupied > total * 0.8) {
        setShowAlert(true);
        toast.warning("Parking capacity is reaching its limit!");
      }
    }
  }, [vehicleData, isProcessed]);

  useEffect(() => {
    if (!isProcessed) return;
    
    const timer = setInterval(() => {
      setSimulationTime(prev => {
        const newTime = new Date(prev);
        newTime.setMinutes(newTime.getMinutes() + 5);
        return newTime;
      });
      
      if (isLiveMode) {
        addRealTimeDataPoint();
      }
    }, isLiveMode ? 2000 : 10000);
    
    return () => clearInterval(timer);
  }, [isProcessed, isLiveMode]);
  
  useEffect(() => {
    if (isProcessed && realTimeData.length === 0) {
      const initialData = [];
      const now = new Date();
      
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

  const handleVehicleHover = (type: string | null) => {
    setActiveVehicleType(type);
  };
  
  const addRealTimeDataPoint = () => {
    setRealTimeData(prev => {
      const lastPoint = prev[prev.length - 1];
      
      const newPoint = {
        time: simulationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cars: Math.max(0, lastPoint.cars + Math.floor(Math.random() * 7) - 3),
        bikes: Math.max(0, lastPoint.bikes + Math.floor(Math.random() * 5) - 2),
        buses: Math.max(0, lastPoint.buses + Math.floor(Math.random() * 2) - 1),
        trucks: Math.max(0, lastPoint.trucks + Math.floor(Math.random() * 3) - 1)
      };
      
      setAnimatedCounts({
        car: newPoint.cars,
        bike: newPoint.bikes,
        bus: newPoint.buses,
        truck: newPoint.trucks
      });
      
      return [...prev.slice(-7), newPoint];
    });
  };

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Parking Dashboard
        </motion.h2>
        {isLiveMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800">
              Live Mode • {simulationTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Badge>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {showAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-500/50"
          >
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Parking capacity is reaching its limit! ({totalOccupied}/{totalSpaces} spaces occupied)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Parking Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Capacity</span>
                  <span className="font-medium">{totalSpaces} spaces</span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalOccupied / totalSpaces) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full rounded-full ${
                      capacityStatus === 'critical' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : capacityStatus === 'warning'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Occupied</span>
                  <span className="font-medium">{totalOccupied} spaces</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Vehicle Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vehicle Counts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Car className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Cars</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-bold mt-3 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"
                >
                  {animatedCounts.car}
                </motion.p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Bike className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Bikes</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-bold mt-3 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent"
                >
                  {animatedCounts.bike}
                </motion.p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Bus className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Buses</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-bold mt-3 bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent"
                >
                  {animatedCounts.bus}
                </motion.p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Truck className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Trucks</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-bold mt-3 bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent"
                >
                  {animatedCounts.truck}
                </motion.p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {videoFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoPlayer videoFile={videoFile} isLiveMode={isLiveMode} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ParkingDashboard;
