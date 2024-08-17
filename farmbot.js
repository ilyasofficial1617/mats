smlib = require("./lib/statemachine.js");

globaldatalib = require("./lib/globaldata.js");

farmlib = require("./lib/farm.js");

pathfindlib = require("./lib/pathfind.js");

const name = "farmbotjs"; // the name of the script
const enabled = GlobalVars.toggleBoolean(name);

if(enabled){
    // init here
    blockCrops = farmlib.blockCrops;
    farmPosVariableName = "farmposvarname";
    // state
    iteratePosState = new smlib.IteratePosState(name,-22, 66, -34, -67, 63, -46, farmPosVariableName);  
    pathMoveToState = new smlib.PathMoveToState(name,farmPosVariableName);
    harvestAndPlantState = new smlib.HarvestAndPlantState(name,farmPosVariableName);
    // transition
    posMatchingIdTransition = new smlib.PosMatchingIdTransition(iteratePosState,pathMoveToState,farmPosVariableName,blockCrops);
    iteratePosLoopTransition = new smlib.PassTransition(iteratePosState,iteratePosState);
    moveStateToFarmingTransition = new smlib.PassTransition(pathMoveToState,harvestAndPlantState);
    farmingToIteratePosTransition = new smlib.PassTransition(harvestAndPlantState, iteratePosState);
    // statemachine
    stateMachine = new smlib.StateMachine();
    // statemachine add state
    stateMachine.addState(iteratePosState);
    stateMachine.addState(pathMoveToState);
    stateMachine.addState(harvestAndPlantState);
    // transition add state, order matters
    stateMachine.addTransition(posMatchingIdTransition);
    stateMachine.addTransition(iteratePosLoopTransition);
    stateMachine.addTransition(moveStateToFarmingTransition);
    stateMachine.addTransition(farmingToIteratePosTransition);
    // set initial state
    stateMachine.setState(iteratePosState.name);

    Chat.log("init state machine done");
}

while(GlobalVars.getBoolean(name)){
    // do stuff here endlessly
    Chat.log("beginning statemachine update");
    Chat.log(farmPosVariableName);
    stateMachine.update();
    Chat.log("end statemachine update");
    // Client.waitTick(40);
}

// the end