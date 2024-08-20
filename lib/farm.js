/**
 * assumption : 
 * the farm already built
 * the farm already tilled
 * for now lets support crop-based farm
 */
const inventorylib = require("./inventory.js");

/**
 * harvest crop
 * check if its crop and matured  
 * @param {int} x 
 * @param {int} y 
 * @param {int} z 
 * @returns 
 */
function harvest(x,y,z){
    // if its not harvestable
    if(!isValidHarvestable(x,y,z)){
        return false;
    }

    // look at & break it
    Player.getPlayer().lookAt(x+0.5,y+0.2,z+0.5);
    Player.getInteractionManager().breakBlock(x,y,z);
    return true;
}

function isValidHarvestable(x,y,z){
    // get block data
    blockData = World.getBlock(x,y,z);

    // debug
    Chat.log("block data");
    Chat.log(blockData);
    Chat.log("block id");
    Chat.log(blockData.getId());
    Chat.log("block data universal");
    Chat.log(blockData.getBlockStateHelper().getUniversal());
    
    // stop if its empty
    if(blockData.getId() == "minecraft:air"){
        Chat.log("empty block");
        return false;
    }
    // stop if not a crop
    if(!blockCrops.includes(blockData.getId())){
        Chat.log("not a crop");
        return false;
    }

    age = blockData.getBlockStateHelper().getUniversal().getAge();
    maxAge = blockData.getBlockStateHelper().getUniversal().getMaxAge();
    //debug
    Chat.log("max age");
    Chat.log(blockData.getBlockStateHelper().getUniversal().getMaxAge());
    Chat.log("current age");
    Chat.log(blockData.getBlockStateHelper().getUniversal().getAge());

    // stop if crop not ready
    if(age<maxAge){
        Chat.log("crop not mature")
        return false;
    }

    // after all check done, its harvestable
    return true;
}

/**
 * plant seed crop
 * @param {*} x 
 * @param {*} y 
 * @param {*} z 
 * @param {minecraft item id} seed 
 * @returns 
 */
function plant(x,y,z,seed){
    // try equip seed
    isEquipped = inventorylib.equipItemToHotbar(seed);
    // if not equipped
    if(!isEquipped){
        Chat.log("can't equip seed");
        return;
    }
    Player.getInteractionManager().interactBlock(x,y,z,"up",false);
}

// list of crop blocks
blockCrops = [
    "minecraft:wheat",
    "minecraft:carrots",
    "minecraft:beetroots",
    "minecraft:potatoes",
    "minecraft:nether_wart"
]

// crop that correspond to seed
cropToSeed = {
    "minecraft:wheat":"minecraft:wheat_seeds",
    "minecraft:carrots":"minecraft:carrot",
    "minecraft:beetroots":"minecraft:beetroot_seeds",
    "minecraft:potatoes":"minecraft:potato",
    "minecraft:nether_wart":"minecraft:nether_wart"
}

// list of seed
seeds = [
    "minecraft:wheat_seeds",
    "minecraft:carrot",
    "minecraft:beetroot_seeds",
    "minecraft:potato",
    "minecraft:nether_wart"
]

// list of loot without seed
loots = [
    "minecraft:wheat",
    "minecraft:beetroot",
    "minecraft:poisonous_potato",
]

/**
 * harvest and plant
 * the same crop
 * @param {*} x 
 * @param {*} y 
 * @param {*} z 
 */
function harvestAndPlant(x,y,z){
    blockId = World.getBlock(x,y,z).getId();
    isHarvested = harvest(x,y,z);
    if (isHarvested){
        plant(x,y,z,
            cropToSeed[blockId]
        );
    }
}

function dumpResultToContainer(pos){
    x = pos.x;
    y = pos.y;
    z = pos.z;

    inventorylib.openContainer(x,y,z);
    Client.waitTick(20);
    // put all into container, except 1 slots
    inventorylib.putAll(seeds,1);
    // put all into container
    inventorylib.putAll(loots);

    inventorylib.closeContainer();
}

function isDumpResultSuccess(){
    return (inventorylib.isItemSlotLessThanOrEqualTo(seeds,stackThreshold=1) 
    && inventorylib.isItemSlotLessThanOrEqualTo(loots,stackThreshold=0));
}

module.exports = {
    harvestAndPlant,
    blockCrops,
    isValidHarvestable,
    dumpResultToContainer,
    isDumpResultSuccess
}