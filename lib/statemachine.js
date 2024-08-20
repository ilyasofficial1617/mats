farmlib = require("./farm.js");

pathfindlib = require("./pathfind.js");

globaldatalib = require("./globaldata.js");

inventorylib = require("./inventory.js")

class State {
    constructor(name) {
        this.name = name;
        this.active = false;
    }

    onEnter() {
        Chat.log(`Entering state: ${this.name}`);
    }

    onExit() {
        Chat.log(`Exiting state: ${this.name}`);
    }
}

class Transition {
    constructor(parent, child) {
        this.parent = parent;
        this.child = child;
    }

    shouldTransition() {
        let should = this.condition();
        Chat.log(`checking ${this.parent.name} to ${this.child.name} : ${should}`)
        return should;
    }
}

class StateMachine {
    constructor() {
        this.states = [];
        this.transitions = [];
        this.currentState = null;
    }

    addState(state) {
        this.states.push(state);
    }

    addTransition(transition) {
        this.transitions.push(transition);
    }

    setState(stateName) {
        const state = this.states.find(s => s.name === stateName);
        if (state) {
            if (this.currentState) {
                this.currentState.onExit();
            }
            this.currentState = state;
            this.currentState.onEnter();
        }
    }

    update() {
        if (!this.currentState) return;
        for (const transition of this.transitions) {
            if (transition.parent === this.currentState && transition.shouldTransition()) {
                this.setState(transition.child.name);
                break;
            }
        }
    }
}

// implemented state

class IdleState extends State {
    constructor(title){
        let stateName = String(title)+" idle";
        super(stateName);
    }
}

class IteratePosState extends State {
    constructor(title, pos1, pos2, posVariableName){
        let stateName = String(title)+" iterate pos";
        super(stateName);
        [this.startPos, this.endPos] = this.rearrangeStartEndPos(pos1, pos2);
        // this.info();
        // init current pos
        this.currentPos = { ...this.startPos };
        // save var name for global var saving
        this.globalVariableName = posVariableName
    }

    onEnter(){
        super.onEnter();
        let nextPos = this.getNext();
        globaldatalib.setGlobal(this.globalVariableName, nextPos);
    }

    onExit(){
        super.onExit();
        this.info();
    }

    info(){
        Chat.log("");
        Chat.log(`pos info : ${this.name}`);
        Chat.log("start pos ");
        Chat.log(this.startPos);
        Chat.log("end pos ");
        Chat.log(this.endPos);
        Chat.log("current pos ");
        Chat.log(this.currentPos);
    }

    rearrangeStartEndPos(pos1, pos2){
        let xStart = Math.min(pos1.x,pos2.x);
        let yStart = Math.min(pos1.y,pos2.y);
        let zStart = Math.min(pos1.z,pos2.z);
        let xEnd = Math.max(pos1.x,pos2.x);
        let yEnd = Math.max(pos1.y,pos2.y);
        let zEnd = Math.max(pos1.z,pos2.z);
        return [{x:xStart,y:yStart,z:zStart},{x:xEnd,y:yEnd,z:zEnd}]
    }

    getNext() {
        return this.getNextXReverse();
    }

    getNextXReverse() {
        // init 
        if(this.directionX==null || this.directionZ==null){
            this.directionX = 1;
            this.directionZ = 1;
            this.directionY = 1;
        }

        let applyX = true;
        let applyZ = false;
        let applyY = false;

        // if applyx
        // if pos+directionx > end border
        // if pos+directionx < start border
        if (applyX && (
            this.currentPos.x + this.directionX > this.endPos.x ||
            this.currentPos.x + this.directionX < this.startPos.x
        )){
            applyX = false;
            applyZ = true;
            applyY = false;
            // directionX reverse
            this.directionX *= -1;
        }

        // if applyz
        // if pos+directionz > end border
        // if pos+directionz < start border
        if (applyZ && (
            this.currentPos.z + this.directionZ > this.endPos.z ||
            this.currentPos.z + this.directionZ < this.startPos.z
        )){
            applyX = false;
            applyZ = false;
            applyY = true;
            // directionZ reverse
            this.directionZ *= -1;
        }
        
        // if applyY
        // if pos+directiony > end border
        // if pos+directiony < start border
        if (applyY && (
            this.currentPos.y + this.directionY > this.endPos.y ||
            this.currentPos.y + this.directionY < this.startPos.y
        )){
            applyX = true;
            applyZ = false;
            applyY = false;
            // directionY reverse
            this.directionY *= -1;
        }

        // applying the move
        if (applyX) this.currentPos.x+= this.directionX;
        if (applyZ) this.currentPos.z+= this.directionZ;
        if (applyY) this.currentPos.y+= this.directionY;

        return { ...this.currentPos };
    }

    // simple pattern, iterate through x, then z, then y
    getNextSimple(){
        // init
        if (this.currentPos==null){
            // first time reduce x to start at 0 when calling get next
            this.currentPos.x = this.currentPos.x-1;
        }
        // Iterate the x coordinate
        if (this.currentPos.x < this.endPos.x) {
            this.currentPos.x++;
        } else if (this.currentPos.z < this.endPos.z) {
            // If x has reached its max, reset x and increment y
            this.currentPos.x = this.startPos.x;
            this.currentPos.z++;
        } else if (this.currentPos.y < this.endPos.y) {
            // If y has reached its max, reset x and y, and increment z
            this.currentPos.x = this.startPos.x;
            this.currentPos.z = this.startPos.z;
            this.currentPos.y++;
        } else {
            // If all have reached their max, reset to the start
            this.currentPos = { ...this.startPos };
        }

        return { ...this.currentPos };
    }
}

class IteratePosListState extends State {
    constructor(title,containerPosList,posVariableName){
        let stateName = String(title)+" iterate pos";
        super(stateName);
        this.idx = -1;
        this.containerPosList = containerPosList;
        // save var name for global var saving
        this.globalVariableName = posVariableName
    }

    onEnter(){
        super.onEnter();
        let currentPos = this.getNext();
        globaldatalib.setGlobal(this.globalVariableName, currentPos);
    }

    getNext(){
        // increment
        this.idx+=1;
        // if more than valid id, then go to 0 again
        if(this.containerPosList.length == this.idx) this.idx = 0;
        return {  ...this.containerPosList[this.idx] }
    }
}

class PathMoveToState extends State{
    constructor(title,posGlobalVariableName){
        let stateName = String(title)+" move to ";
        super(stateName);
        this.posGlobalVariableName = posGlobalVariableName
    }

    onEnter(){
        super.onEnter();
        let pos = globaldatalib.getGlobal(this.posGlobalVariableName);
        pathfindlib.moveTo(pos.x, pos.y, pos.z);
    }

    info(){
        Chat.log("");
        Chat.log(`path move to state : ${this.name}`);
        pos = globaldatalib.getGlobal(posGlobalVariableName);
        Chat.log("moving to ");
        Chat.log(pos);
    }
}

class PathMoveNearState extends State{
    constructor(title,posGlobalVariableName,distance=3){
        let stateName = String(title)+" move near ";
        super(stateName);
        this.posGlobalVariableName = posGlobalVariableName;
        this.distance = distance;
    }

    onEnter(){
        super.onEnter();
        let pos = globaldatalib.getGlobal(this.posGlobalVariableName);
        pathfindlib.moveNear(pos.x, pos.y, pos.z, this.distance);
    }

    info(){
        Chat.log("");
        Chat.log(`path move near state : ${this.name}`);
        pos = globaldatalib.getGlobal(posGlobalVariableName);
        Chat.log("moving near ");
        Chat.log(pos);
    }
}

class HarvestAndPlantState extends State{
    constructor(title,posGlobalVariableName){
        let stateName = String(title)+" harvest and plant ";
        super(stateName);
        this.posGlobalVariableName = posGlobalVariableName
    }

    onEnter(){
        super.onEnter()
        let pos = globaldatalib.getGlobal(this.posGlobalVariableName);
        farmlib.harvestAndPlant(pos.x, pos.y, pos.z);
    }
}

class DumpFarmLootState extends State{
    constructor(title,posGlobalVariableName){
        let stateName = String(title)+" dump farm loot";
        super(stateName);
        this.posGlobalVariableName = posGlobalVariableName;
    }

    onEnter(){
        let pos = globaldatalib.getGlobal(this.posGlobalVariableName);
        farmlib.dumpResultToContainer(pos);
    }
}



// implemented transition


class PassTransition extends Transition{
    constructor(parent, child, condition = () => true){
        super(parent, child);
        this.condition = condition;
    }
}

class PosMatchingIdTransition extends Transition {
    constructor(parent, child, posVariableName, blockIds){
        super(parent,child);
        this.blockIds = blockIds;
        this.posGlobalVariableName = posVariableName;
    }
    
    condition(){
        // get pos
        let pos = globaldatalib.getGlobal(this.posGlobalVariableName)
        // no position
        if(pos==null) return false;
        // if harvestable
        let isHarvestable = farmlib.isValidHarvestable(pos.x, pos.y, pos.z);
        return isHarvestable;
    }
}

class PlayerInventoryFullTransition extends Transition {
    constructor(parent,child){
        super(parent,child);
    }

    condition(){
        return(inventorylib.isFull(1));
    }
}

class DumpFarmFinishedTransition extends Transition {
    constructor(parent,child){
        super(parent,child);
    }

    condition(){
        return(farmlib.isDumpResultSuccess());
    }
}


module.exports = {
    State,
    Transition,
    StateMachine,

    IdleState,
    IteratePosState,
    PathMoveToState,
    PathMoveNearState,
    HarvestAndPlantState,
    IteratePosListState,
    DumpFarmLootState,

    PassTransition,
    PosMatchingIdTransition,
    PlayerInventoryFullTransition,
    DumpFarmFinishedTransition
}