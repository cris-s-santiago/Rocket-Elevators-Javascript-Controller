var elevatorID = 1;
var callButtonID = 1;
var floorRequestButtonID = 1;
var actualCapacity = 0;
var sensorDoor = false;






//======================== - Column - ========================//
class Column {
    constructor(_ID, _status, _amountOfFloors, _amountOfElevators){
        this.ID = _ID;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.amountOfElevators = _amountOfElevators;
        this.elevatorsList = [];
        this.callButtonsList = [];

        this.createElevator(_amountOfElevators);
        this.createCallButtons(_amountOfFloors);
    }

    
    //Elevators creation
    createElevator(_amountOfElevators) {
        for(let i = 1; i <= _amountOfElevators; i++){
         const elevator = new Elevator (elevatorID, "idle", this.amountOfFloors, 1);
         this.elevatorsList.push(elevator);
         elevatorID ++;
        }
    }


    createCallButtons(_amountOfFloors){
        for(let buttonFloor = 1; buttonFloor <= _amountOfFloors; buttonFloor++){
            if(buttonFloor < _amountOfFloors){
                const callButton = new CallButton (callButtonID, "OFF", buttonFloor, "Up");
                this.callButtonsList.push(callButton);
                callButtonID ++;
            }
            if(buttonFloor > 1){
                const callButton = new CallButton (callButtonID, "OFF", buttonFloor, "Down");
                this.callButtonsList.push(callButton);
                callButtonID ++; 
            }
        }
    }


    requestElevator(_floor, _direction){
        const elevator = this.findBestElevator(_floor, _direction);
        console.log("Chosen elevator: "+ elevator.ID);
        elevator.floorRequestList.push(_floor);
        elevator.sortFloorList();
        elevator.capacityCalculate();
        elevator.movElev(_floor, _direction);

        return elevator;
    }


    findBestElevator(_floor, _direction){
        let bestElevator = {};
        let bestScore = 5;
        let referanceGap = 10000000;
        let bestElevatorInfo = {};

        this.elevatorsList.forEach(elevator => {
            if(_floor == elevator.currentFloor & elevator.status == "stopped" & _direction == elevator.direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(1, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else if(_floor > elevator.currentFloor &  elevator.direction == _direction & elevator.direction == "Up"){
                bestElevatorInfo = this.checkIfElevatorISBetter(2, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else if(_floor < elevator.currentFloor &  elevator.direction == _direction & elevator.direction == "Down"){
                bestElevatorInfo = this.checkIfElevatorISBetter(2, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else if(elevator.status == "idle" | elevator.status == "stopped"){
                bestElevatorInfo = this.checkIfElevatorISBetter(3, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else{
                bestElevatorInfo = this.checkIfElevatorISBetter(4, elevator, bestScore, referanceGap, bestElevator, _floor);
            }
            bestElevator = bestElevatorInfo.bestElevator;
            bestScore = bestElevatorInfo.bestScore;
            referanceGap = bestElevatorInfo.referanceGap;
        });
        return bestElevator;
    }


    checkIfElevatorISBetter(scoreToCheck, newElevator, bestScore, referanceGap, bestElevator, floor){
        let bestElevatorInfo = {};

        if(scoreToCheck < bestScore){
            bestScore = scoreToCheck;
            bestElevator = newElevator;
            referanceGap = Math.abs(newElevator.currentFloor - floor); 
        }else if(bestScore == scoreToCheck){
            let gap = Math.abs(newElevator.currentFloor - floor);
            if(referanceGap > gap){
                bestElevator = newElevator;
                referanceGap = gap;
            }
        }
        return bestElevatorInfo = {
            bestElevator: bestElevator, 
            bestScore: bestScore, 
            referanceGap: referanceGap
        };
    }
}


//======================== - Elevator - ========================//
class Elevator {
    constructor(_ID, _status, _amountOfFloors, _currentFloor){
        this.ID = _ID;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.direction = null;
        this.currentFloor = _currentFloor;
        this.door = new Door (this.ID, this.status);
        this.floorRequestButtonsList = [];
        this.floorRequestList = [];
        this.capacityStatus = null;
        this.maxCapacity = 1500;
        this.displayCapacity = null;

        this.createFloorRequestButton(_amountOfFloors);
    }    

    
    createFloorRequestButton(_amountOfFloors){
        for(let buttonFloor = 1; buttonFloor <= _amountOfFloors; buttonFloor++){
            const floorRequestButton = new FloorRequestButton(floorRequestButtonID, "OFF", buttonFloor);
            this.floorRequestButtonsList.push(floorRequestButton);
            floorRequestButtonID ++;
        }
    }


    requestFloor(_floor){
        this.floorRequestList.push(_floor);
        this.sortFloorList();

        let destination = this.floorRequestList[0];
        let _direction = null;
        if(this.currentFloor < destination){
            _direction = "Up"
        }else if(this.currentFloor > destination){
            _direction = "Down"
        }

        this.capacityCalculate();
        this.movElev(_floor, _direction);
    }


    movElev(_floor, _direction){
        while(this.capacityStatus != "operating"){
            this.capacityCalculate();
        }
        while(this.floorRequestList.length != 0){
            this.operateDoors("closed");
            if(this.door.status == "closed"){
                this.status = "moving";
                if(this.currentFloor > _floor){
                    this.direction = "Down";
                }else{
                    this.direction = "Up";
                }
                while(this.currentFloor != _floor){
                    if(this.direction == "Up"){
                        console.log("Elevator current floor: " + this.currentFloor)
                        this.currentFloor ++;
                    }else if(this.direction == "Down"){
                        console.log("Elevator current floor: " + this.currentFloor)
                        this.currentFloor --;
                    }
                }
                console.log("Elevator current floor: " + this.currentFloor + "\n")
                this.status = "stopped";
                this.operateDoors("opened");
            }
            this.floorRequestList.shift();
        }
    }


    sortFloorList(){
        if (this.direction == "Up"){
            this.floorRequestList.sort((a,b) => a - b);
        }else{
            this.floorRequestList.sort((a,b) => b -a);
        }
    }


    capacityCalculate(){
        if(actualCapacity <= this.maxCapacity){
            this.capacityStatus = "operating"
            this.displayCapacity = actualCapacity;
        }else{
            this.capacityStatus = "overloaded"
            this.displayCapacity = "Exceeded weight, authorized weight is" + this.maxCapacity + "lbs";
        }
    }


    operateDoors(_command){
        if(sensorDoor == false){
            this.door.status = _command;
        }
    }
}

//======================== - CallButton - ========================//
class CallButton {
    constructor(_ID, _status, _floor, _direction){
        this.ID = _ID;
        this.status = _status;
        this.floor = _floor;
        this.direction = _direction;
    }
}

//======================== - FloorRequestButton - ========================//
class FloorRequestButton {
    constructor(_ID, _status, _floor){
        this.ID = _ID;
        this.status = _status;
        this.floor = _floor;
    }
}

//======================== - Door - ========================//
class Door{
    constructor(_ID, _status){
        this.ID = _ID;
        this.status = _status
    }
}

//=========== scenario1 ===============\\

var column1 = {};

function createTest(){
    console.dir('Column creation:',);
    column1 = new Column (1, "running", 10, 2);

    console.log("New column: ID = " + column1.ID + "  ||  " 
                + "Status: " + column1.status + "  ||  "
                + "Number of Floors: " + column1.amountOfFloors + "  ||  " 
                + "Number of Elevators: " + column1.amountOfElevators + "\n");

    console.dir('Elevators created:',);

    console.log("\nTotal elevators= " + column1.elevatorsList.length,);

    console.log("ID = " + column1.elevatorsList[0].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[0].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[0].currentFloor + "  ||  " 
                + "Direction: " + column1.elevatorsList[0].direction + 
                "\nID = " + column1.elevatorsList[1].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[1].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[1].currentFloor + "  ||  " 
                + "Direction: " + column1.elevatorsList[1].direction + "\n");
}

//=========== scenario1 ===============\\

function scenario1(){
    createTest();
    console.dir('Scenario 1: ')
    console.log('Elevator A is Idle at floor 2 \nElevator B is Idle at floor 6.\n');

    column1.elevatorsList[0].currentFloor = 2;
    column1.elevatorsList[0].status = "idle";

    column1.elevatorsList[1].currentFloor = 6;
    column1.elevatorsList[1].status = "idle";

    console.log("ID = " + column1.elevatorsList[0].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[0].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[0].currentFloor + "\n" 
                + "ID = " + column1.elevatorsList[1].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[1].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[1].currentFloor + "\n");


    console.dir("Request Elevator from floor: 3 and direction: Up")

    let elevatorSelected = column1.requestElevator(3, "Up");

    console.dir("Request Floor: 7");
    elevatorSelected.requestFloor(7);
}



//=========== scenario2 ===============\\


function scenario2(){
    createTest();
    console.dir('Scenario 2: ')
    console.log('Elevator A is Idle at floor 10 \nElevator B is idle at floor 3.\n');

    column1.elevatorsList[0].currentFloor = 10;
    column1.elevatorsList[0].status = "idle";

    column1.elevatorsList[1].currentFloor = 3;
    column1.elevatorsList[1].status = "idle";

    console.log("ID = " + column1.elevatorsList[0].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[0].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[0].currentFloor + "\n" 
                + "ID = " + column1.elevatorsList[1].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[1].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[1].currentFloor + "\n");


    console.dir("Request Elevator from floor: 1 and direction: Up");
    let Person1 = column1.requestElevator(1, "Up");
    console.dir("Request Floor: 6");
    Person1.requestFloor(6);

    console.dir("2 minutes later, request Elevator from floor: 3 and direction: Up");
    let Person2 = column1.requestElevator(3, "Up");
    console.dir("Request Floor: 5");
    Person2.requestFloor(5);

    console.dir("Finally, request Elevator from floor: 9 and direction: Down");
    let Person3 = column1.requestElevator(9, "Down");
    console.dir("Request Floor: 2");
    Person3.requestFloor(2);
}

//=========== scenario3 ===============\\


function scenario3(){
    createTest();
    console.dir('Scenario 3: ')
    console.log("Elevator A is Idle at floor 10" + "\n" 
                + "Elevator B is Moving from floor 3 to floor 6." + "\n");

    column1.elevatorsList[0].currentFloor = 10;
    column1.elevatorsList[0].status = "idle";

    column1.elevatorsList[1].currentFloor = 3;
    column1.elevatorsList[1].status = "moving";

    console.log("ID = " + column1.elevatorsList[0].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[0].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[0].currentFloor + "\n" 
                + "ID = " + column1.elevatorsList[1].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[1].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[1].currentFloor + "\n");


    console.dir("Request Elevator from floor: 3 and direction: Down");
    let Person1 = column1.requestElevator(3, "Down");
    console.dir("Request Floor: 2");
    Person1.requestFloor(2);

    column1.elevatorsList[1].currentFloor = 6;
    column1.elevatorsList[1].status = "stopped";
    column1.elevatorsList[1].direction = "Up";

    console.log("ID = " + column1.elevatorsList[1].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[1].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[1].currentFloor + "\n");

    console.dir("5 minutes later, request Elevator from floor: 10 and direction: Down");
    let Person2 = column1.requestElevator(10, "Down");
    console.dir("Request Floor: 3");
    Person2.requestFloor(3);
}
scenario1();
scenario2();
scenario3();