var elevatorID = 1;
var callButtonID = 1;
var floorRequestButtonID = 1;






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
        console.log(elevator);
        elevator.floorRequestList.push(_floor);
        // elevator.sortFloorList();
        // elevator.movElev(_floor, _direction);
    }


    findBestElevator(_floor, _direction){
        let bestElevator = {};
        let bestScore = 5;
        let referanceGap = 10000000;
        let bestElevatorInfo = {};

        this.elevatorsList.forEach(elevator => {
            if(_floor == elevator.currentFloor & elevator.status == "stopped" & _direction == elevator.direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(1, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else if(_floor > elevator.currentFloor &  elevator.direction == _direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(2, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else if(_floor < elevator.currentFloor &  elevator.direction == _direction){
                bestElevatorInfo = this.checkIfElevatorISBetter(2, elevator, bestScore, referanceGap, bestElevator, _floor);
            }else if(elevator.status == "idle"){
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


    // findBestElevator(_floor, _direction){
    //     const bestElevator = null;
    //     const elevatorAvailableList = [];

    //     this.elevatorsList.forEach(item => {
    //         if(item.status == "idle"){
    //             elevatorAvailableList.push(item);
    //         }
    //     });

    //     const firstPairElement = {};
    //     const secondPairElement = {};
    //     for(let i = 0; i < elevatorAvailableList.length; i++){
    //         if(elevatorAvailableList.length > 1){
    //             if(bestElevator != null){
    //                 firstPairElement = bestElevator;
    //                 console.log(firstPairElement);
    //             }else{
    //                 firstPairElement = elevatorAvailableList[0];
    //                 console.log(firstPairElement);
    //             }
    //             secondPairElement = elevatorAvailableList[1];
    //             console.log(secondPairElement);
    //         }
    //     }
    // }
}

//======================== - Elevator - ========================//
class Elevator {
    constructor(_ID, _status, _amountOfFloors, _currentFloor){
        this.ID = _ID;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.direction = null;
        this.currentFloor = _currentFloor;
        //this.door = new Doors (this.ID, this.status);
        this.floorRequestButtonsList = [];
        this.floorRequestList = [];
        this

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
        // this.sortFloorList();
        // let destination = this.floorRequestList[0];
        // let directionDestination = null;
        // if(this.currentFloor < destination){
        //     directionDestination = "Up"
        // }
        // this.movElev(_floor);
    }


    // movElev()
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

var column1 = new Column (1, "stop", 10, 2);
//column1.elevatorsList[0].status = "stoped";
column1.requestElevator(3, "Up");