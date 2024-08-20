smlib = require("./lib/statemachine.js");

globaldatalib = require("./lib/globaldata.js");

farmlib = require("./lib/farm.js");

pathfindlib = require("./lib/pathfind.js");

const name = "farmbot2js"; // the name of the script
const enabled = GlobalVars.toggleBoolean(name);

if(enabled){
    // init here
    blockCrops = farmlib.blockCrops;
    farmPosVariableName = "farmposvarname";
    containerPosVariableName = "containerfarmposvarname";
    pos1 = {x:-22,y:65,z:-34};
    pos2 = {x:-67,y:64,z:-46};
    containerPos = [
        {x:-16,y:65,z:-37},
        {x:-16,y:64,z:-37},
        {x:-14,y:65,z:-37},
        {x:-14,y:64,z:-37},
        {x:-14,y:65,z:-38},
        {x:-14,y:64,z:-38},
        {x:-14,y:65,z:-40},
        {x:-14,y:64,z:-40},
        {x:-15,y:65,z:-41},
        {x:-16,y:65,z:-41},
        {x:-16,y:64,z:-41}
    ];
    //// state
    // all come from idlestate, and all end in idlestate
    idleState = new smlib.IdleState(name);
    // farming
    iteratePosState = new smlib.IteratePosState(name, pos1, pos2, farmPosVariableName);  
    pathMoveToState = new smlib.PathMoveToState(name+" farm move to crop",farmPosVariableName);
    harvestAndPlantState = new smlib.HarvestAndPlantState(name,farmPosVariableName);
    // dumping to container
    iterateContainerState = new smlib.IteratePosListState(name+" container",containerPos,containerPosVariableName);
    moveNearContainerState = new smlib.PathMoveNearState(name+" move near container", containerPosVariableName);
    dumpFarmLootState = new smlib.DumpFarmLootState(name,containerPosVariableName);

    //// transition
    // higher priority first
    // dumping loot more priority than farming
    inventoryFullTransition = new smlib.PlayerInventoryFullTransition(idleState,iterateContainerState);
    // if not full, then go to farming 
    idleToFarmingTransition = new smlib.PassTransition(idleState, iteratePosState);
    //// sub transition
    // farming
    posMatchingIdTransition = new smlib.PosMatchingIdTransition(iteratePosState,pathMoveToState,farmPosVariableName,blockCrops);
    iteratePosLoopTransition = new smlib.PassTransition(iteratePosState,iteratePosState);
    moveStateToFarmingTransition = new smlib.PassTransition(pathMoveToState,harvestAndPlantState);
    farmingToIdleTransition = new smlib.PassTransition(harvestAndPlantState, idleState);
    // container dump
    iterateContainerToMoveNearTransition = new smlib.PassTransition(iterateContainerState,moveNearContainerState);
    moveNearToDumpingTransition = new smlib.PassTransition(moveNearContainerState,dumpFarmLootState);
    // if dump finished then go back to idle, if not then continou
    dumpToIdleTransition = new smlib.DumpFarmFinishedTransition(dumpFarmLootState,idleState);
    dumpToIterateContainerTransition = new smlib.PassTransition(dumpFarmLootState,iterateContainerState);

    // statemachine
    stateMachine = new smlib.StateMachine();
    // statemachine add state
    stateMachine.addState(idleState);
    stateMachine.addState(iteratePosState);
    stateMachine.addState(pathMoveToState);
    stateMachine.addState(harvestAndPlantState);
    stateMachine.addState(iterateContainerState);
    stateMachine.addState(moveNearContainerState);
    stateMachine.addState(dumpFarmLootState);
    // transition add state, order matters, dictate priority
    stateMachine.addTransition(inventoryFullTransition);
    stateMachine.addTransition(idleToFarmingTransition);
    stateMachine.addTransition(posMatchingIdTransition);
    stateMachine.addTransition(iteratePosLoopTransition);
    stateMachine.addTransition(moveStateToFarmingTransition);
    stateMachine.addTransition(farmingToIdleTransition);
    stateMachine.addTransition(iterateContainerToMoveNearTransition);
    stateMachine.addTransition(moveNearToDumpingTransition);
    stateMachine.addTransition(dumpToIdleTransition);
    stateMachine.addTransition(dumpToIterateContainerTransition);
    // set initial state
    stateMachine.setState(idleState.name);

    Chat.log("init state machine done");
}

while(GlobalVars.getBoolean(name)){
    // do stuff here endlessly
    Chat.log("beginning statemachine update");
    Chat.log(farmPosVariableName);
    stateMachine.update();
    Chat.log("end statemachine update");
    // debug
    // Client.waitTick(25);
}

// the end