

const blankBlockFilter = JavaWrapper.methodToJava((block)=>{
    return true;
});

const cropBlockFilter = JavaWrapper.methodToJava((block)=>{
    blockMinecraftName = block.getId()
    for (let i = 0; i < cropMinecraftNames.length; i++) {
        const name = cropMinecraftNames[i];
        if(name==blockMinecraftName){
            return true;
        }
    }
    return false;
});

const blankStateFilter = JavaWrapper.methodToJava((state)=>{
    return true;
});

// const matureCrops = World.getWorldScanner(cropBlockFilter, cropAgeFilter)
//                         .scanCubeAreaInclusive(-20, 65, -35, -30, 63, -46);

module.exports = {
    blankBlockFilter,
    cropBlockFilter,
    blankStateFilter
}