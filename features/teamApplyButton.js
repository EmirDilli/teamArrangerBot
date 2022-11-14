const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { addData } = require("../databaseFeatures/dbAddUser.js");
const { updateData } = require("../databaseFeatures/dbUpdateUser");
const mongoose = require("mongoose");

require("dotenv").config();

module.exports = {
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */


    async applyTeamButton(interaction, mongoClient, client) {

        // team apply button is pressed
        const receiverID = interaction.customId.split(".")[1];
        const receiverDB =  await readData(mongoClient, {"userID": receiverID})
        
        const receiver = client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(receiverID);
        const applierID = interaction.user.id;

        const applierDB = await readData(mongoClient, { "userID": applierID} );
        
        //  checks if the user has sent the application to itself
        if (applierID === receiverID) {

            interaction.reply({
                content: "You cannot send application to yourself, you know that, right?",
                ephemeral: true
            });

            return;
        }

        //  check if the interacted user is already in a team
        if (applierDB.length != 0 && applierDB[0].teamName != null) {

            interaction.reply({
                content: "You already seem to be in a team!",
                ephemeral: true
            });

            return;
        }
        
        //if it is in the database
        if (applierDB.length !== 0) {

            //variable to check if the variable is in the database appliedTeam array
            const appliedTeam = applierDB[0].appliedTeams.find(element => element === receiverDB[0].teamCustomID)
            
            console.log(appliedTeam);
            

            //if it is in the database appliedTeam array
            if (appliedTeam) {

                interaction.reply({
                    content: "You cannot apply more than once to the same team! Wait for the respond from admin!",
                    ephemeral: true,
                });
                return;
            }


        }

        
        //  checks if the admin of the applied team is not in the server anymore
        if (!receiver) {

            interaction.reply({
                content: "This user cannot be found from the Algo Teams server! Therefore, your request cannot be made!",
                ephemeral: true
            });

            return;
        }


        


        const modal = new discord.ModalBuilder()
            .setCustomId(`userInfo.${receiverID}`)
            .setTitle('User Info')
            .setComponents(
                new ActionRowBuilder()
                    .setComponents(
                        new discord.TextInputBuilder()
                            .setCustomId('infoMessage')
                            .setLabel('User Info')
                            .setStyle(discord.TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setMinLength(10)
                            .setMaxLength(500)
                    )
            )
        
        await interaction.showModal(modal)
            .catch(err => {

                const embed = new EmbedBuilder()
                    .setTitle("Timeout Error on Interaction")
                    .setDescription("Your button interaction is failed due to timeout. (it may be about internet connection issue)")
                    .setColor("Random");

                interaction.user.send({
                    embeds: [embed]
                });

            });
        

    }
}



