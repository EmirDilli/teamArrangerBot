const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { updateData } = require("../databaseFeatures/dbUpdateUser.js");
const mongoose = require("mongoose");

require("dotenv").config();

module.exports = {

    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */

    async applicationReject(interaction, mongoClient, client){

        await interaction.deferReply({
            ephemeral: true
        });

        const appliedUserID = interaction.customId.split(".")[1];
        let appliedUser = (await readData(mongoClient, {"userID":appliedUserID}));
        let adminUser = (await readData(mongoClient, {"userID":interaction.user.id}));

        //  if user is not on the database
        if(appliedUser.length === 0){

            interaction.editReply({
                content: "The user who has applied to your team is not suitable to be accepted nor rejected.",
                ephemeral: true
            });
            return;

        }

        // since appliedUser is present, this present user is implemented to this variable
        appliedUser = appliedUser[0];

        //  if user has already a team
        if(appliedUser.teamCustomID !== null){

            interaction.editReply({
                content: "The user who has applied to your team has already a team now. Therefore, you cannot accept nor reject this user.",
                ephemeral: true
            });

            return;

        }

        //  if admin is not present in database
        if(adminUser.length === 0){

            interaction.editReply({
                content: "You do not seem to be available in database. You may have left your previous team. If it is not the case, report this issue!",
                ephemeral: true
            });
            return;

        }

        adminUser = adminUser[0];

        //  if admin is seen as ADMIN in any particular team
        if(adminUser.isAdmin === false){

            interaction.editReply({
                content: "You do not seem to be an Admin in any particular team! Therefore, you're not authorized to accept nor reject a user!",
                ephemeral: true
            });
            return;

        }

        const appliedTeams = appliedUser.appliedTeams;

        //  removing this current team's ID from applied user's "appliedTeams" array
        if(appliedTeams.includes(adminUser.teamCustomID)){

            appliedTeams.splice(appliedTeams.indexOf(adminUser.teamCustomID),1);

            await updateData(mongoClient, {"userID": appliedUserID} , {"appliedTeams": appliedTeams});


        }

        const appliedUserMember = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(appliedUserID)
            .then(async (member) => {

                await interaction.message.delete();

                const embed = new EmbedBuilder()
                    .setTitle("Your Application Has Been Rejected!")
                    .setDescription(`Admin of ${adminUser.teamName} has rejected your team application! You can search for other teams.`)
                    .setThumbnail(process.env.KICK_THUMBNAIL)
                    .setColor("Random");

                member.send({
                    embeds: [embed]
                }).then(() => {

                    interaction.editReply({
                        content: "Your rejection has been succesfully executed!",
                        ephemeral: true
                    });

                });

            });
    }

}