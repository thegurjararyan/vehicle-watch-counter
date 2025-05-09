
export interface VehicleData {
  capacity: {
    car: number;
    bike: number;
    bus: number;
    truck: number;
  };
  detected: {
    car: number;
    bike: number;
    bus: number;
    truck: number;
  };
}

export const initialVehicleData: VehicleData = {
  capacity: {
    car: 50,
    bike: 30,
    bus: 5,
    truck: 10
  },
  detected: {
    car: 0,
    bike: 0,
    bus: 0,
    truck: 0
  }
};
