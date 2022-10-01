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

        let modalSubmitInteraction;
        const receiverID = interaction.customId.split(".")[1];
        const receiver = client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(receiverID);
        const applierID = interaction.user.id;

        const applierDB = await readData(mongoClient, { "userID": applierID});
        const receiverDB =  await readData(mongoClient, {"userID": receiverID})
       
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
                content: "You already seem to be in another team! If you still want to apply to this team, you should leave your current team first.",
                ephemeral: true
            });

            return;
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

        await interaction.showModal(modal);
        

    }
}



