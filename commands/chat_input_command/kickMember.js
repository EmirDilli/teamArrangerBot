const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , Client, ModalSubmitInteraction} = require("discord.js");
const discord = require("discord.js");
const { readData } = require("../../databaseFeatures/dbReadData.js");
const {deleteData} = require("../../databaseFeatures/dbDeleteUser.js");
const mongoose = require("mongoose");
const { embedBuilder } = require("../../features/embedTeamBuilder");
const { values } = require("../../constants/colors.js");
require("dotenv").config();


module.exports = {
    command: new SlashCommandBuilder()
        .setName("kick_member")
        .setDescription("As the admin, you can kick one of your team members!")
        .addUserOption((option) => option
            .setName("kick_member")
            .setDescription("choose the member to kick")
            .setRequired(true)
        ),


    /**
     * 
     * @param {ModalSubmitInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */
    async kickMember(interaction, mongoClient, client){

        interaction.deferReply({
            ephemeral: true
        });

        const kicked_memberId = interaction.customId.split(".")[1]
        const kicked_member = client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(kicked_memberId);
        const adminUser = (await readData(mongoClient, {"userID" : interaction.user.id}))[0];
        

        //  deleting the kicked user from database

        await deleteData(mongoClient, {"userID" : kicked_memberId});

        const textInput = (interaction.fields.getTextInputValue('reasonKick')) ? interaction.fields.getTextInputValue('reasonKick') : "";

        const embed = new EmbedBuilder()
            .setTitle("You've been Kicked From Your Team!")
            .setDescription(`You've been kicked from your team, you can find for other teams if you would like to!`)
            .setThumbnail(process.env.KICK_THUMBNAIL)
            .setColor("Random")
            .addFields({
                name: "Reason To Kick",
                value: textInput
            })

        kicked_member.send({
            embeds: [embed]
        }).then(async () => {
            await kicked_member.roles.remove(process.env.MEMBER_ROLE_ID)
            const members = await readData(mongoClient, {teamName: adminUser.teamName});
            const msgEmbed = await embedBuilder(client, adminUser.teamName, adminUser.teamColor, adminUser.teamDescription, adminUser.teamLogo, members);
            const tempMsg = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(adminUser.teamEmbedID);
            
            if(members.length === 3){
                tempMsg.edit({
                    embeds: [msgEmbed],
                    components: []
                })
            }
            else{
                
                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`teamApply.${adminUser.userID}`)
                        .setLabel("Apply")
                        .setStyle(ButtonStyle.Success)
                );
                tempMsg.edit({
                    embeds: [msgEmbed],
                    components: [row]
                })
            }

            //  kicking member from the private team channel
            const teamChannelID = (await readData(mongoClient, {"userID": adminUser.userID})).teamChannelID;
            const teamChannel = await client.guilds.cache.get(process.env.GUILD_ID).channels.fetch(teamChannelID);

            teamChannel.permissionOverwrites.edit(kicked_member.id , {ViewChannel: false});
            

            await interaction.editReply({
                content: "Your kicking process has been done successfully!",
                ephemeral: true
            })

        }).catch(async (err) => {
            console.log("Error occured while kicking the member: " + err);
            await interaction.editReply({
                content: "Error occured while kicking the member",
                ephemeral: true
            });
        });

    }
    
}