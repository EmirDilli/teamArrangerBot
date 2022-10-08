const discord = require("discord.js");
const {readData} = require("../../databaseFeatures/dbReadData.js");
const {deleteData} = require("../../databaseFeatures/dbDeleteUser.js");
const {leaveTeamMember} = require("../../commands/chat_input_command/leaveTeam.js");

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     */

    async event(client, mongoClient) {

        client.on("guildMemberRemove", async (member) => {

            let memberDatabase = await readData(mongoClient, {"userID": member.id});

            //  checking if the leaving member is on the team
            if(memberDatabase.length !== 0){

                memberDatabase = memberDatabase[0];

                //  checks if the user is in any particular team
                if(memberDatabase.teamCustomID === null){
                    await deleteData(mongoClient, {"userID": member.id});
                }
                
                else{
                    await leaveTeamMember(member, mongoClient, client);
                }

            }

        });

},


}