const { MongoClient } = require("mongodb");
const {readData} = require("../databaseFeatures/dbReadData")
const {updateData} = require("../databaseFeatures/dbUpdateUser")
const {levelControl} = require("./levelControl")
/**
 * @param {MongoClient} mongoClient
 */


module.exports = {

    async addXP(mongoClient, userID, amount){
        //xp of the user
        let xp;
        
        //new xp of the user
        let newXp;
        
        //finding the xp of the relates user
        await readData(mongoClient, {
            "userID": userID
        }).then(datas => {
            xp = datas[0].XP;
        });

        newXp = (xp + amount);

        //fixing and rounding the xp to 1 decimal place
        let fixXp = newXp.toFixed(1) * 1;
        
        //updating the xp of the user
        await updateData(mongoClient, {
            "userID": userID
        },
        {
            "XP": fixXp
        })
        
        //level control after changing of the xp
        await levelControl(mongoClient, userID)
    }
}