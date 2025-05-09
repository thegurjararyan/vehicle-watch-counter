
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Bike, Bus, Truck, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CapacityProps {
  capacity: {
    car: number;
    bike: number;
    bus: number;
    truck: number;
  };
  onChange: (type: string, value: number) => void;
}

const CapacitySettings = ({ capacity, onChange }: CapacityProps) => {
  const [localCapacity, setLocalCapacity] = useState({ ...capacity });
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (type: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setLocalCapacity({
      ...localCapacity,
      [type]: numValue
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Check for invalid values
    if (Object.values(localCapacity).some(val => val < 0)) {
      toast.error("Capacity values cannot be negative");
      return;
    }
    
    // Update all capacity values
    Object.entries(localCapacity).forEach(([type, value]) => {
      onChange(type, value);
    });
    
    setHasChanges(false);
    toast.success("Parking capacity settings saved!");
  };

  const handleReset = () => {
    setLocalCapacity({ ...capacity });
    setHasChanges(false);
    toast.info("Settings reset to previous values");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Parking Capacity Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Configure the maximum number of each vehicle type your parking lot can accommodate.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Car className="h-5 w-5 text-red-500" />
              <Label htmlFor="car-capacity" className="text-base font-medium">
                Car Capacity
              </Label>
            </div>
            <Input
              id="car-capacity"
              type="number"
              min="0"
              value={localCapacity.car}
              onChange={(e) => handleInputChange('car', e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Maximum number of cars that can be parked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bike className="h-5 w-5 text-green-500" />
              <Label htmlFor="bike-capacity" className="text-base font-medium">
                Bike Capacity
              </Label>
            </div>
            <Input
              id="bike-capacity"
              type="number"
              min="0"
              value={localCapacity.bike}
              onChange={(e) => handleInputChange('bike', e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Maximum number of bikes that can be parked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bus className="h-5 w-5 text-yellow-500" />
              <Label htmlFor="bus-capacity" className="text-base font-medium">
                Bus Capacity
              </Label>
            </div>
            <Input
              id="bus-capacity"
              type="number"
              min="0"
              value={localCapacity.bus}
              onChange={(e) => handleInputChange('bus', e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Maximum number of buses that can be parked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Truck className="h-5 w-5 text-purple-500" />
              <Label htmlFor="truck-capacity" className="text-base font-medium">
                Truck Capacity
              </Label>
            </div>
            <Input
              id="truck-capacity"
              type="number"
              min="0"
              value={localCapacity.truck}
              onChange={(e) => handleInputChange('truck', e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Maximum number of trucks that can be parked
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default CapacitySettings;
