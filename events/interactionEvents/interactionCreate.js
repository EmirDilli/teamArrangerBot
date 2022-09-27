const discord = require("discord.js");
const { MongoClient } = require("mongodb")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discord;
const { inviteMember } = require("../../commands/chat_input_command/inviteMember.js");
const { createTeam } = require("../../commands/chat_input_command/createTeam.js");
const { deleteTeam } = require("../../commands/chat_input_command/deleteTeam.js");
const { kickMember } = require("../../commands/chat_input_command/kickMember.js");
const { customize_team } = require("../../commands/chat_input_command/customizeTeam.js");
const { readData } = require("../../databaseFeatures/dbReadData.js");
const { applyTeam } = require("../../features/teamApply");
const { addData } = require("../../databaseFeatures/dbAddUser.js");
const { updateData } = require("../../databaseFeatures/dbUpdateUser.js");


require("dotenv").config();

// Client interactionCreate event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     * @param {MongoClient} mongoClient
     */

    async event(client, mongoClient) {

        // collects every slash command script into an object
        client.on("interactionCreate", async (interaction) => {

            if (interaction.isCommand()) {

                if (interaction.commandName === "invite_member") {
                    inviteMember(interaction, mongoClient);
                }
                if (interaction.commandName === "create_team") {
                    createTeam(interaction, mongoClient, client);
                }
                if (interaction.commandName === "delete_team") {
                    deleteTeam(interaction, mongoClient, client);
                }
                if (interaction.commandName === "kick_member") {
                    kickMember(interaction, mongoClient, client);
                }
                if (interaction.commandName === "customize_team") {
                    customize_team(interaction, mongoClient, client);
                }

            }

            //  button interactions
            if (interaction.isButton()) {
                

                if (interaction.customId.startsWith("teamApply")) {

                    //variable to check whether the data is in the database
                    const applier = await readData(mongoClient, { "userID": interaction.member.user.id });
                    
                    //if not add the data to the database
                    if(applier.length === 0){
                        await addData(mongoClient, {
                            "userID": interaction.user.id,
                            "userName": interaction.member.nickname ? interaction.member.nickname : interaction.user.username,
                            "teamName": null,
                            "isAdmin": false,
                            "teamColor": null,
                            "teamLogo": null,
                            "teamDescription": null,
                            "teamEmbedID": null,
                            "appliedTeams": [
                                (await readData(mongoClient, {
                                    "userID": interaction.customId.split(".")[1]
                                }))[0].teamName
                            ]
                        })
                        console.log((await readData(mongoClient, {
                            "userID": interaction.customId.split(".")[1]
                        }))[0].teamName)

                        //apply team button
                        await applyTeam(interaction, mongoClient, client);
                    }

                    //if it is in the database
                    else if(applier.length !== 0){
                        
                        //variable to check if the variable is in the database appliedTeam array
                        const appliedTeam = (await readData(mongoClient, {"userID": interaction.user.id}))[0].appliedTeams.find(async element => element === (await readData(mongoClient, {
                            "userID": interaction.customId.split(".")[1]
                        }))[0].teamName)
                        
                        //if it is not in the database
                        if(!appliedTeam){

                            //update the teamName array
                            await updateData(mongoClient, {
                                "userID":interaction.user.id
                            },
                            {
                                "appliedTeams": await readData(mongoClient, {
                                    "userID":interaction.user.id
                                })[0].appliedTeams.push(await readData(mongoClient, {
                                    "userID": interaction.customId.split(".")[1]
                                })[0].teamName)
                            })

                            //apply team button
                            await applyTeam(interaction, mongoClient, client);
                        }
                        
                        //if it is in the database appliedTeam array
                        else if(appliedTeam){
                            interaction.reply({
                                content: "You cannot apply more than once!",
                                ephemeral: true
                            })
                        }

                  
                   }

                }

            }

        });

    },


}