const interaction = Player.getInteractionManager();
const player = Player.getPlayer();

/**
 * swap current active hotbar, to an item stack
 * in another word, equip an item from inventory
 * do nothing if already equipped
 * @param {string} itemId - minecraft item id 
 * @returns {boolean} 
 */
function equipItemToHotbar(itemId) {
    inventory = Player.openInventory();
    inventoryMap = inventory.getMap();
    activeHotbarSlotRelativeId = inventory.getSelectedHotbarSlotIndex()
    activeHotbarSlotId = inventoryMap.hotbar[activeHotbarSlotRelativeId]

    // true if already equipped
    if(inventory.getSlot(activeHotbarSlotId)==itemId){
        Chat.log(itemId+" already held");
        return(true);
    } 
    
    itemSlot = inventory.findItem(itemId);
    // false if not found
    if(itemSlot.length <1){
        Chat.log("item not found in inventory");
        return(false);
    }
    
    Chat.log("swap item from slot "+itemSlot[0]);
    inventory.swapHotbar(itemSlot[0],activeHotbarSlotRelativeId);
    Client.waitTick(10);
    return(true);
}

/**
 * get slotId of free/empty slot of inventory
 * get first occurence
 * search in typical inventory of player, which is main inventory and hotbar
 */
function getPlayerInventoryFirstFreeSlot() {
    inventory = Player.openInventory();
    inventoryMap = inventory.getMap();
    // Chat.log(inventoryMap);
    freeSlotsId = []
    // checking main inventory, 27 slots
    if (inventoryMap.containsKey('main')){
        for (let i = 0; i < inventoryMap.main.length; i++) {
            const slotId = inventoryMap.main[i];
            // Chat.log(slotId);
            item = inventory.getSlot(slotId)
            if(item.isEmpty()){
                return(slotId);
            }
        }
    }
    // checking hotbar inventory, 9 slots
    if (inventoryMap.containsKey('hotbar')){
        for (let i = 0; i < inventoryMap.hotbar.length; i++) {
            const slotId = inventoryMap.hotbar[i];
            // Chat.log(slotId);
            item = inventory.getSlot(slotId)
            if(item.isEmpty()){
                return(slotId);
            }
        }
    }
    // default -1 if no empty slot
    return(-1);
}

/**
 * get information of is the player's inventory full?
 * search in typical player's inventory: main inventory and hotbar
 * @returns {boolean}
 */
function isInventoryFull() {
    return(getPlayerInventoryFirstFreeSlot() == -1)
}

function openContainer(x,y,z,face="up"){
    player.lookAt(x+0.5,y+0.2,z+0.5);
    Player.getInteractionManager().interactBlock(x,y,z,face,false);
    Client.waitTick(10);    
}

function closeContainer(){
    Player.openInventory().close();
    Client.waitTick(10);
}

function isPlayerInventoryEmptyFilter(itemFilterId){
    inventory = Player.openInventory();
    inventoryMap = inventory.getMap();
    for (let i = 0; i < inventoryMap.main.length; i++) {
        const slotId = inventoryMap.main[i];
        itemId = inventory.getSlot(slotId).getItemId()
        if(itemFilterId.includes(itemId)){
            return false;
        }
    }
    for (let i = 0; i < inventoryMap.hotbar.length; i++) {
        const slotId = inventoryMap.hotbar[i];
        itemId = inventory.getSlot(slotId).getItemId()
        if(itemFilterId.includes(itemId)){
            return false;
        }
    }
    return true;
    
}

/**
 * move all matching item
 * from all inventory to opened container
 * @param {list of item id} matchItemIds 
 */
function moveAllItemMatching(matchItemIds){
    // get inventory data  
    inventory = Player.openInventory();
    inventoryMap = inventory.getMap();
    // Chat.log(inventoryMap); 

    if(inventoryMap.containsKey('container')){
        for (let i = 0; i < inventoryMap.main.length; i++) {
            const slotId = inventoryMap.main[i];
            itemId = inventory.getSlot(slotId).getItemId()
            // Chat.log(itemId);
            if(matchItemIds.includes(itemId)){
                inventory.quick(slotId);
                Client.waitTick(10);
            }
            
        }
        for (let i = 0; i < inventoryMap.hotbar.length; i++) {
            const slotId = inventoryMap.hotbar[i];
            itemId = inventory.getSlot(slotId).getItemId()
            // Chat.log(itemId);
            if(matchItemIds.includes(itemId)){
                inventory.quick(slotId);
                Client.waitTick(10);
            }
            
        }
    }
    
    Client.waitTick(20);
}

/**
 * 
 * @param {list of item id} matchItemIds 
 * @param {list of container's coord xyz} containerList 
 */
function moveAllItemMatchingToMultiple(matchItemIds, containerList){
    for (let i = 0; i < containerList.length; i++) {
        // if inventory already empty/no item to be dumped
        if(isPlayerInventoryEmptyFilter(matchItemIds)){
            break;
        }
        
        x = containerList[i].x;
        y = containerList[i].y;
        z = containerList[i].z;
    
        // open inventory
        openContainer(x,y,z);
        
        // move selected item
        moveAllItemMatching(matchItemIds);
    
        // close inventory
        closeContainer();
    }

}

module.exports = {
    equipItemToHotbar, 
    isInventoryFull, 
    openContainer, 
    closeContainer, 
    isPlayerInventoryEmptyFilter, 
    moveAllItemMatching, 
    moveAllItemMatchingToMultiple
};