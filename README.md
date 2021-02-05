# Rocket-Elevators-Javascript-Controller
🚀Contains the Rocket Elevator files. New solution for the Residential sector. 📈

This code was developed for the new phase of Rocket Elevators, when expanding its business, the company needed a new program: a elevator controller in the residential sector.

📌 The program to develop is a controller set up in a 10 storey building served by 2 elevator
cages. This controller is capable of supporting two main events:

1. A person presses a call button to request an elevator, the controller selects an
available cage and it is routed to that person based on two parameters provided by
pressing the button:
- a. The floor where the person is
- b. the direction in which he wants to go (Up or Down)

❗ It should be noted that an elevator already in motion (or stopped but still
other requests to be completed) should be prioritized versus an "Idle" elevator.

2. A person enters an elevator, selects a floor of the control panel and it moves to the
floor requested. The parameter provided is the requested floor.

🎯 For this, we use the JavaScript language.
This program contains the following Classes:
- Column, Elevator, CallButton, FloorRequestButton, Door.
Each class has its own methods.

⚡In the Column Class, we will have the following methods:
- createElevator: Responsible for creating the elevator. 
- createCallButtons: Responsible for creating the buttons, Up or Down of the 10 floors. 
- requestElevator: Responsible for handling the demand for an elevator, made by one person, or more. 
- findBestElevator: Responsible for analyzing all column elevators and assigning points to the best elevator for that elevator request. 
- checkIfElevatorISBetter: Responsible for checking the points of the previous function and choosing the best among the column elevators.

⚡In the Elevator Class, we will have the following methods:
- createFloorRequestButton: Responsible for creating the elevator's internal buttons.
- requestFloor: Responsible for handling the demand for a floor, or more, when you are inside the elevator.
- movElev: Responsible for moving the elevator.
- sortFloorList: Responsible for organizing the list of floors or elevators requested.
- capacityCalculate: Responsible for checking the lift's capacity, if it is safe to perform a movement.
- operateDoors: Responsible for checking the obstruction of a door.