const { State, Transition, StateMachine } = require("./statemachine.js");

const BaritoneAPI = Java.type('baritone.api.BaritoneAPI');
const GoalBlock = Java.type('baritone.api.pathing.goals.GoalBlock');
const GoalNear = Java.type('baritone.api.pathing.goals.GoalNear');
const BlockPos = Java.type("net.minecraft.class_2338");

// Get the Baritone main instance
const baritone = BaritoneAPI.getProvider().getPrimaryBaritone();

/**
 * Move to a specified block and wait for the movement to complete and retry .
 * @param {number} x - The x-coordinate of the block.
 * @param {number} y - The y-coordinate of the block.
 * @param {number} z - The z-coordinate of the block.
 * @returns {Promise<void>}
 */
async function moveToPersistentAsync(x, y, z) {
    // Set the goal to the specified block
    const goal = new GoalBlock(x, y, z);
    baritone.getCustomGoalProcess().setGoalAndPath(goal);

    // Chat.log("Moving to block...");

    while (true) {
        await Client.waitTick(10); // Wait for 1 second (20 ticks)

        if (!baritone.getPathingBehavior().isPathing()) {
            const pos = baritone.getPlayerContext().playerFeet();
            if (goal.isInGoal(pos)) {
                // Chat.log("Reached the goal");
                break;
            } else {
                Chat.log("Pathing stopped but not at goal, retrying...");
                baritone.getCustomGoalProcess().setGoalAndPath(goal);
            }
        } else {
            // Chat.log("Still moving...");
        }
    }
}

async function moveToAsync(x,y,z){
    [intX, intY, intZ] = roundPos(x,y,z);
    // Chat.log(`${intX} ${intY} ${intZ}`)
    const goal = new GoalBlock(intX, intY, intZ);
    baritone.getCustomGoalProcess().setGoalAndPath(goal);

    // busy wait
    while(true){
        Client.waitTick(10);
        // Chat.log("player not yet arrived");
        if(!isBaritoneActive()){
            break;
        }
    }
}

/**
 * Calculate the Euclidean distance between two points in 3D space.
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} z1 - The z-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @param {number} z2 - The z-coordinate of the second point.
 * @returns {number} - The distance between the two points.
 */
function getDistance(x1, y1, z1, x2, y2, z2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const deltaZ = z2 - z1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
}

function isPlayerNear(x,y,z,threshold){
    playerPos = Player.getPlayer().getPos();
    distance = getDistance(x,y,z, playerPos.x,playerPos.y,playerPos.z);
    Chat.log(`player distance ${distance}`);
    baritoneInfo();
    return distance<threshold;
}

function isBaritoneActive(){
    isActive = baritone.getCustomGoalProcess().isActive()
    // Chat.log("baritone isActive ? ")
    // Chat.log(isActive)
    return isActive;
}

function roundPos(x,y,z){
    return [Math.floor(x), Math.floor(y), Math.floor(z)];
}

/**
 * Move to a block near the specified coordinates and wait for the movement to complete and retry.
 * @param {number} x - The x-coordinate of the target area.
 * @param {number} y - The y-coordinate of the target area.
 * @param {number} z - The z-coordinate of the target area.
 * @param {number} distance - The distance within which to stop from the target.
 * @returns {Promise<void>}
 */

async function moveNearAsync(x,y,z,distance=1){
    let pos = new BlockPos(x, y, z); 
    const goal = new GoalNear(pos,distance);
    baritone.getCustomGoalProcess().setGoalAndPath(goal);

    // busy wait
    while(true){
        Client.waitTick(10);
        Chat.log("player not yet arrived");
        if(!isBaritoneActive()){
            break;
        }
    }
}

// wait for movetoasync to finished
async function moveTo(x, y, z){
    await moveToAsync(x, y, z);
}

// wait for movenearasync to finished
async function moveNear(x, y, z, distance=1) {
    await moveNearAsync(x, y, z, distance);
}

module.exports = {moveTo, moveNear};