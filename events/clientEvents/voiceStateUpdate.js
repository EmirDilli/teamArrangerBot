
const discord = require("discord.js");
const {addXP} = require("../../features/changeXP")
const {readData} = require("../../databaseFeatures/dbReadData")




let voiceStates = {};
// Client being ready event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     */
    async event(client, mongoClient){
        //all users
        readData(mongoClient, {}).then(datas => {
            datas.forEach(data => {
                voiceStates[data.userID] = new Date();
            })
        });

        

        client.on("voiceStateUpdate", async (oldState, newState) => {
            try {
                let newUserChannel = newState.channel;
                let oldUserChannel = oldState.channel
                let {id} = oldState;
    
                if(oldUserChannel === null && newUserChannel !== null){
                    //the time user joins the voice channel
                    voiceStates[id] = new Date();
                }
                else if(oldUserChannel !== null && newUserChannel === null){
                    //the time user leaves the voice channel
                    let leaveTime = new Date();
                    let joinTime = voiceStates[id];
    
                    //time difference
                    let timeDifference = leaveTime.getTime() - joinTime.getTime();
                    
                    addXP(mongoClient, id, Math.round(timeDifference/1000));
                }
            }
            catch(err){
                console.log('To activate code user must leave and connect a voice channel')
            }
           
        })
    },

    
}