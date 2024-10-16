// Importing classes from other files
import inquirer from "inquirer";
import Truck from "./Truck.js";
import Car from "./Car.js";
import Motorbike from "./Motorbike.js";
import Wheel from "./Wheel.js";

// Define the Cli class
class Cli {
  vehicles: (Car | Truck | Motorbike)[];
  selectedVehicleVin: string | undefined;
  exit: boolean = false;

  // Constructor to accept vehicles
  constructor(vehicles: (Car | Truck | Motorbike)[]) {
    this.vehicles = vehicles;
    this.selectedVehicleVin = undefined;
  }

  // Static method to generate a VIN
  static generateVin(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Method to choose a vehicle from existing vehicles
  chooseVehicle(): void {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'selectedVehicleVin',
          message: 'Select a vehicle to perform an action on',
          choices: this.vehicles.map((vehicle) => ({
            name: `${vehicle.vin} -- ${vehicle.make} ${vehicle.model}`,
            value: vehicle.vin,
          })),
        },
      ])
      .then((answers) => {
        this.selectedVehicleVin = answers.selectedVehicleVin;
        this.performActions();
      });
  }

  // Method to create a vehicle
  createVehicle(): void {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'vehicleType',
          message: 'Select a vehicle type',
          choices: ['Car', 'Truck', 'Motorbike'],
        },
      ])
      .then((answers) => {
        switch (answers.vehicleType) {
          case 'Car':
            this.createCar();
            break;
          case 'Truck':
            this.createTruck();
            break;
          case 'Motorbike':
            this.createMotorbike();
            break;
        }
      });
  }

  // Method to create a car
  createCar(): void {
    inquirer
      .prompt(this.getCommonVehiclePrompts())
      .then((answers) => {
        const car = new Car(
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          []
        );
        this.vehicles.push(car);
        this.selectedVehicleVin = car.vin;
        this.performActions();
      });
  }

  // Method to create a truck
  createTruck(): void {
    inquirer
      .prompt([...this.getCommonVehiclePrompts(), {
        type: 'input',
        name: 'towingCapacity',
        message: 'Enter Towing Capacity',
      }])
      .then((answers) => {
        const truck = new Truck(
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          [],
          parseInt(answers.towingCapacity)
        );
        this.vehicles.push(truck);
        this.selectedVehicleVin = truck.vin;
        this.performActions();
      });
  }

  // Method to create a motorbike
  createMotorbike(): void {
    inquirer
      .prompt([
        ...this.getCommonVehiclePrompts(),
        {
          type: 'input',
          name: 'frontWheelDiameter',
          message: 'Enter Front Wheel Diameter',
        },
        {
          type: 'input',
          name: 'frontWheelBrand',
          message: 'Enter Front Wheel Brand',
        },
        {
          type: 'input',
          name: 'rearWheelDiameter',
          message: 'Enter Rear Wheel Diameter',
        },
        {
          type: 'input',
          name: 'rearWheelBrand',
          message: 'Enter Rear Wheel Brand',
        },
      ])
      .then((answers) => {
        const motorbike = new Motorbike(
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          [
            new Wheel(parseInt(answers.frontWheelDiameter), answers.frontWheelBrand),
            new Wheel(parseInt(answers.rearWheelDiameter), answers.rearWheelBrand),
          ]
        );
        this.vehicles.push(motorbike);
        this.selectedVehicleVin = motorbike.vin;
        this.performActions();
      });
  }

  // Common prompts for vehicle creation
  getCommonVehiclePrompts() {
    return [
      { type: 'input', name: 'color', message: 'Enter Color' },
      { type: 'input', name: 'make', message: 'Enter Make' },
      { type: 'input', name: 'model', message: 'Enter Model' },
      { type: 'input', name: 'year', message: 'Enter Year' },
      { type: 'input', name: 'currentSpeed', message: 'Enter Current Speed' },
      { type: 'input', name: 'weight', message: 'Enter Weight' },
      { type: 'input', name: 'topSpeed', message: 'Enter Top Speed' },
    ];
  }

  // Method to find a vehicle to tow
  async findVehicleToTow(_truck: Truck): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'vehicleToTow',
        message: 'Select a vehicle to tow',
        choices: this.vehicles.map((vehicle) => ({
          name: `${vehicle.vin} -- ${vehicle.make} ${vehicle.model}`,
          value: vehicle,
        })),
      },
    ]);

    if (answers.vehicleToTow instanceof Truck) {
      console.log('A truck cannot tow itself');
      this.performActions();
    } else {
      const truck = this.vehicles.find(vehicle => vehicle.vin === this.selectedVehicleVin) as Truck;
      if (truck) {
        truck.tow(answers.vehicleToTow);
      }
      this.performActions();
    }
  }

  // Method to perform actions on a vehicle
  performActions(): void {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Select an action',
          choices: [
            'Print details',
            'Start vehicle',
            'Accelerate 5 MPH',
            'Decelerate 5 MPH',
            'Stop vehicle',
            'Turn right',
            'Turn left',
            'Reverse',
            'Tow a vehicle',
            'Perform a wheelie',
            'Select or create another vehicle',
            'Exit',
          ],
        },
      ])
      .then(async (answers) => {
        const selectedVehicle = this.vehicles.find(vehicle => vehicle.vin === this.selectedVehicleVin);
        
        if (selectedVehicle) {
          switch (answers.action) {
            case 'Print details':
              selectedVehicle.printDetails();
              break;
            case 'Start vehicle':
              selectedVehicle.start();
                this.performActions();
              break;
            case 'Accelerate 5 MPH':
              selectedVehicle.accelerate(5);
              this.performActions();
              break;
            case 'Decelerate 5 MPH':
              selectedVehicle.decelerate(5);
              this.performActions();
              break;
            case 'Stop vehicle':
              selectedVehicle.stop();
              this.performActions();
              break;
            case 'Turn right':
              selectedVehicle.turn('right');
              this.performActions();
              break;
            case 'Turn left':
              selectedVehicle.turn('left');
              this.performActions();
              break;
            case 'Reverse':
              selectedVehicle.reverse();
              this.performActions();
              break;
            case 'Tow a vehicle':
              if (selectedVehicle instanceof Truck) {
                await this.findVehicleToTow(selectedVehicle);
                return;
              } else {
                console.log('Selected vehicle is not a truck and cannot tow.');
                this.performActions();
              }
              break;
            case 'Perform a wheelie':
              if (selectedVehicle instanceof Motorbike) {
                selectedVehicle.wheelie();
              } else {
                console.log('Selected vehicle is not a motorbike and cannot perform a wheelie.');
                this.performActions();
              }
              break;
            case 'Select or create another vehicle':
              this.startCli();
              return;
            case 'Exit':
              this.exit = true;
              break;
          }
        }
      });
  }

  // Method to start the CLI
  startCli(): void {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'CreateOrSelect',
          message: 'Would you like to create a new vehicle or perform an action on an existing vehicle?',
          choices: ['Create a new vehicle', 'Select an existing vehicle'],
        },
      ])
      .then((answers) => {
        if (answers.CreateOrSelect === 'Create a new vehicle') {
          this.createVehicle();
        } else {
          this.chooseVehicle();
        }
        
        if (this.exit) {
          return;
        }
      });
  }
}

// Export the Cli class

export default Cli;