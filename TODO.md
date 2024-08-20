dump but leave 1stack of seeds
farm.dumpResultToContainer

transition if inventory almost full
inventory.isFull(stackThreshold=1)

transition if inventory < 1
inventory.isItemSlotLessThanOrEqualTo(cropnames)