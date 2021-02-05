
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

    
    //Through this method we create the elevators
    createElevator(_amountOfElevators) {
        var elevatorID = 1;
        for(let i = 1; i <= _amountOfElevators; i++){
         const elevator = new Elevator (elevatorID, "idle", this.amountOfFloors, 1);
         this.elevatorsList.push(elevator);
         elevatorID ++;
        }
    }

    //Through this method we create the buttons, Up and Down 
    createCallButtons(_amountOfFloors){
        var callButtonID = 1;
        for(let buttonFloor = 1; buttonFloor <= _amountOfFloors; buttonFloor++){
            if(buttonFloor < _amountOfFloors){ //Ensures that on the last floor you don't have an up button.
                const callButton = new CallButton (callButtonID, "OFF", buttonFloor, "up");
                this.callButtonsList.push(callButton);
                callButtonID ++;
            }
            if(buttonFloor > 1){ //Ensures that on the first floor you don't have a down button.
                const callButton = new CallButton (callButtonID, "OFF", buttonFloor, "down");
                this.callButtonsList.push(callButton);
                callButtonID ++; 
            }
        }
    }

    //Through this method, we will handle the request for an elevator
    requestElevator(_floor, _direction){        
        const elevator = this.findBestElevator(_floor, _direction);
        //console.log("\nChosen elevator: " + elevator.ID + "\n");
        elevator.floorRequestList.push(_floor);
        elevator.sortFloorList();
        elevator.capacityCalculate();
        elevator.movElev(_floor, _direction);

        return elevator;
    }

    //Through this method we will score the best elevator, taking into account proximity, direction and its status
    findBestElevator(_floor, _direction){
        let bestElevatorInfo = {
            bestElevator: null,
            bestScore: 5,
            referanceGap: 10000000
        };

        this.elevatorsList.forEach(elevator => {
            //The elevator is at my floor and going in the direction I want
            if(_floor == elevator.currentFloor & elevator.status == "stopped" & _direction == elevator.direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(1, elevator, bestElevatorInfo, _floor);
            }
             //The elevator is lower than me, is coming up and I want to go up
            else if(_floor > elevator.currentFloor  & elevator.direction == "up" &  elevator.direction == _direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(2, elevator, bestElevatorInfo, _floor);
            }
             //The elevator is higher than me, is coming down and I want to go down
            else if(_floor < elevator.currentFloor & elevator.direction == "down" &  elevator.direction == _direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(2, elevator, bestElevatorInfo, _floor);
            }
             //The elevator is idle
            else if(elevator.status == "idle"){
                bestElevatorInfo = this.checkIfElevatorISBetter(3, elevator, bestElevatorInfo, _floor);
            }
             //The elevator is not available, but still could take the call nothing else better is found
            else{
                bestElevatorInfo = this.checkIfElevatorISBetter(4, elevator, bestElevatorInfo, _floor);
            }
        });
        return bestElevatorInfo.bestElevator;
    }

    //Through this method we will analyze the scores of the method above and select the best one
    checkIfElevatorISBetter(scoreToCheck, newElevator, bestElevatorInfo, floor){
        if(scoreToCheck < bestElevatorInfo.bestScore){
            bestElevatorInfo.bestScore = scoreToCheck;
            bestElevatorInfo.bestElevator = newElevator;
            bestElevatorInfo.referanceGap = Math.abs(newElevator.currentFloor - floor); 
        }else if(bestElevatorInfo.bestScore == scoreToCheck){
            let gap = Math.abs(newElevator.currentFloor - floor);
            if(bestElevatorInfo.referanceGap > gap){
                bestElevatorInfo.bestScore = scoreToCheck;
                bestElevatorInfo.bestElevator = newElevator;
                bestElevatorInfo.referanceGap = gap;
            }
        }
        return bestElevatorInfo;
    };
}

//======================== - Elevator - ========================//
class Elevator {
    constructor(_ID, _status, _amountOfFloors, _currentFloor){
        this.ID = _ID;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.direction = null;
        this.currentFloor = _currentFloor;
        this.door = new Door (this.ID, null);
        this.floorRequestButtonsList = [];
        this.floorRequestList = [];
        this.capacityStatus = null;
        this.maxCapacity = 1500;
        this.displayCapacity = null;
        this.createFloorRequestButton(_amountOfFloors);
    }    

    //Through this method we create the internal buttons of the elevators
    createFloorRequestButton(_amountOfFloors){
        var floorRequestButtonID = 1;
        for(let buttonFloor = 1; buttonFloor <= _amountOfFloors; buttonFloor++){
            const floorRequestButton = new FloorRequestButton(floorRequestButtonID, "OFF", buttonFloor);
            this.floorRequestButtonsList.push(floorRequestButton);
            floorRequestButtonID ++;
        }
    }

    //Through this method, we will handle the request for a floor
    requestFloor(_floor){
        this.floorRequestList.push(_floor);
        this.sortFloorList();

        let destination = this.floorRequestList[0];
        let _direction = null;
        if(this.currentFloor < destination){
            _direction = "up"
        }else if(this.currentFloor > destination){
            _direction = "down"
        }        
        this.capacityCalculate();        
        this.movElev(_floor, _direction);
    }    

    //Through this sequence we can move the elevator
    movElev(_floor, _direction){       
        //Check elevator capacity, as long as it is not safe, it will not move
        while(this.capacityStatus != "operating"){
            this.capacityCalculate();      
        }       
        //Check if the door is closed to move the elevator
        while(this.floorRequestList.length != 0){
            this.operateDoors("closed");
            if(this.door.status == "closed"){ // Check if the door dont' have any obstruction
                //console.log("Status door:" + this.door.status + "\n");
                this.status = "moving"; //Changes the status of the elevator when it starts to move
                if(this.currentFloor > _floor){  //Defines the direction from the request floor, and its position
                    this.direction = "down";
                }else{
                    this.direction = "up";
                }
                while(this.currentFloor != _floor){
                    if(this.direction == "up"){
                        //console.log("Elevator current floor: " + this.currentFloor + "   ||     Status: " + this.status);
                        this.currentFloor ++;
                    }else if(this.direction == "down"){
                        //console.log("Elevator current floor: " + this.currentFloor + "   ||     Status: " + this.status);
                        this.currentFloor --;
                    }
                }
                this.status = "stopped"; //Changes the status of the elevator when it reaches the correct floor
                //console.log("Elevator current floor: " + this.currentFloor + "   ||     Status: " + this.status +  "\n");
                this.operateDoors("opened");
                //console.log("Status door:" + this.door.status + "\n");
            }
            this.floorRequestList.shift();
        }
        this.status = "idle"; //Changes the status of the elevator when it finishes its list of floors to go
    }

    //Through this sequence we can sort the list in ascending or descending order, according to the direction the elevator is going
    sortFloorList(){
        if (this.direction == "up"){
            this.floorRequestList = this.floorRequestList.sort((a,b) => a - b);
        }else{
            this.floorRequestList = this.floorRequestList.sort((a,b) => b -a);
        }
    }

    //Through this sequence we check if we are not overweight in the elevator
    capacityCalculate(){
        var actualCapacity = 0; // External data
        if(actualCapacity <= this.maxCapacity){
            this.capacityStatus = "operating";
            this.displayCapacity = "Capacity display: Safe";
        }else{
            this.capacityStatus = "overloaded";
            this.displayCapacity = "Exceeded weight, authorized weight is " + this.maxCapacity + "lbs";
        }
    }

    //Through this sequence we can verify that there is no obstruction in the door
    operateDoors(_command){
        var sensorDoor = false; // External data
        if(sensorDoor == false){
            this.door.status = _command;
        }else{
            //console.log("Blocked door")
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

//=========== initiation ===============\\

var column1 = {};
function createTest(){
    console.dir('Column creation:',);
    column1 = new Column (1, "running", 10, 2);

    console.log("New column: ID = " + column1.ID + "  ||  " 
                + "Status: " + column1.status + "  ||  "
                + "Number of Floors: " + column1.amountOfFloors + "  ||  " 
                + "Number of Elevators: " + column1.amountOfElevators + "\n");

    console.dir('Elevators created:',);

    console.log("Total elevators= " + column1.elevatorsList.length,);

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
    console.log('Elevator A is idle at floor 2' + '\n' 
                + 'Elevator B is idle at floor 6.' +'\n');

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


    console.dir("Request Elevator from floor: 3 and direction: up");
    let person1 = column1.requestElevator(3, "up");
    console.dir("Request Floor: 7");
    person1.requestFloor(7);
}

//=========== scenario2 ===============\\

function scenario2(){
    createTest();
    console.dir('Scenario 2: ')
    console.log('Elevator A is idle at floor 10' + '\n' 
                + 'Elevator B is idle at floor 3.' + '\n');

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


    console.dir("Request Elevator from floor: 1 and direction: up");
    let person1 = column1.requestElevator(1, "up");
    console.dir("Request Floor: 6");
    person1.requestFloor(6);

    console.dir("2 minutes later, request Elevator from floor: 3 and direction: up");
    let person2 = column1.requestElevator(3, "up");
    console.dir("Request Floor: 5");
    person2.requestFloor(5);

    console.dir("Finally, request Elevator from floor: 9 and direction: down");
    let person3 = column1.requestElevator(9, "down");
    console.dir("Request Floor: 2");
    person3.requestFloor(2);
}

//=========== scenario3 ===============\\

function scenario3(){
    createTest();
    console.dir('Scenario 3: ')
    console.log("Elevator A is idle at floor 10" + "\n" 
                + "Elevator B is moving from floor 3 to floor 6." + "\n");

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


    console.dir("Request Elevator from floor: 3 and direction: down");
    let person1 = column1.requestElevator(3, "down");
    console.dir("Request Floor: 2");
    person1.requestFloor(2);

    column1.elevatorsList[1].currentFloor = 6;
    column1.elevatorsList[1].status = "idle";
    column1.elevatorsList[1].direction = "up";

    console.log("ID = " + column1.elevatorsList[1].ID + "  ||  " 
                + "Status: " + column1.elevatorsList[1].status + "  ||  " 
                + "Current Floor: " + column1.elevatorsList[1].currentFloor + "\n");

    console.dir("5 minutes later, request Elevator from floor: 10 and direction: down");
    let person2 = column1.requestElevator(10, "down");
    console.dir("Request Floor: 3");
    person2.requestFloor(3);
}

// scenario1();
// scenario2();
// scenario3();

module.exports = {Column, Elevator, CallButton, FloorRequestButton, Door}