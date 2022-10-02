const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , Client} = require("discord.js");
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
     * @param {discord.ModalSubmitInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */
    async kickMember(interaction, mongoClient, client){
        const kicked_memberId = interaction.customId.split(".")[1]
        const kicked_member = client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(kicked_memberId);
        const adminUser = (await readData(mongoClient, {"userID" : interaction.user.id}))[0];
        

        //  deleting the kicked user from database

        await deleteData(mongoClient, {"userID" : kicked_memberId});

        const textInput = (interaction.fields.getTextInputValue('reasonKick')) ? interaction.fields.getTextInputValue('reasonKick') : "";

        const embed = new EmbedBuilder()
            .setTitle("You've been Kicked From Your Team!")
            .setDescription(`You've been kicked from your team, you can find for other teams if you would like to!`)
            .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
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
            

            interaction.reply({
                content: "Your kicking process has been done successfully!",
                ephemeral: true
            })



        }).catch((err) => {
            console.log("Error occured while kicking the member: " + err);
            interaction.reply({
                content: "Error occured while kicking the member",
                ephemeral: true
            })
        });

    }
    
}