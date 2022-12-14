const { SlashCommandBuilder , CommandInteraction, Client , EmbedBuilder} = require("discord.js");
const discord = require("discord.js");
const mongoose = require("mongoose");
const {readData} = require("../../databaseFeatures/dbReadData.js");
const {deleteData} = require("../../databaseFeatures/dbDeleteUser.js");

require("dotenv").config();

module.exports = {
    command: new SlashCommandBuilder()
        .setName("delete_team")
        .setDescription("As the admin, you can delete your own team!"),

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client
     */

    async deleteTeam(interaction, mongoClient, client){

        await interaction.deferReply({
            ephemeral: true
        });

        const adminUser = (await readData(mongoClient, {"userID" : interaction.user.id}))[0];
        const isAdminUser = adminUser ? adminUser.isAdmin : null;

        //  checks if the interacted user is an admin in any particular team
        if(!isAdminUser){

            await interaction.editReply({
                content: "Since you're not an admin in any particular team, you're not authorized to execute this function.",
                ephemeral: true
            });

            return;
        }

        //  deleting embed message of the team
        const embedMessageID = adminUser.teamEmbedID;

        //  fetches the embed message and catching error if there is available
        let embedMsg;
        
        await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedMessageID)
            .then((msg) => {embedMsg = msg;})
            .catch((err) => {

                interaction.editReply({
                    content: "Error occured while deleting your team! Please try again later.",
                    ephemeral: true
                });

                return;
            });

        await interaction.member.roles.remove(process.env.ADMIN_ROLE_ID);
        
        await embedMsg.delete();

        //  deleting the team channel
        const teamChannelID = adminUser.teamChannelID;
        const teamChannel = await client.guilds.cache.get(process.env.GUILD_ID).channels.fetch(teamChannelID);

        teamChannel.delete();

        //  finds all the team members and sends them an information message from dm

        const embed = new EmbedBuilder()
            .setTitle(`${adminUser.teamName} Has Been Deleted!`)
            .setDescription(`${interaction.member} has deleted the ${adminUser.teamName} team. Therefore, you're not a part of this team anymore. You can look for other teams on the server.`)
            .setThumbnail(process.env.DELETE_THUMBNAIL)
            .setColor("Random");

        const allTeamMembers = (await readData(mongoClient, {"teamName" : adminUser.teamName}));

        allTeamMembers.forEach(async (user) => {
            
            //  finding other team members rather than admin
            if(user.userID !== adminUser.userID){
                const teamMember = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(user.userID);
                if(teamMember){
                    await deleteData(mongoClient, {"userID" : user.userID});
                    await teamMember.roles.remove(process.env.MEMBER_ROLE_ID);

                    teamMember.send({
                        embeds: [embed]
                    });
                }
            }

        });

        //  delete the admin from the database itself
        await deleteData(mongoClient, {"userID" : interaction.user.id});

        await interaction.editReply({
            content: `${adminUser.teamName} has been succesfully deleted!`,
            ephemeral: true
        });

    },

    /**
     * 
     * @param {discord.GuildMember} member 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client
     */

     async deleteTeamMember(member, mongoClient, client){

        const adminUser = (await readData(mongoClient, {"userID" : member.id}))[0];
        const isAdminUser = adminUser ? adminUser.isAdmin : null;

        //  checks if the interacted user is an admin in any particular team
        if(!isAdminUser){

            return;
        }

        //  deleting embed message of the team
        const embedMessageID = adminUser.teamEmbedID;

        //  fetches the embed message and catching error if there is available
        let embedMsg;
        
        await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedMessageID)
            .then((msg) => {embedMsg = msg;})
            .catch((err) => {

                return;
            });
        
        await embedMsg.delete();

        //  deleting the team channel
        const teamChannelID = adminUser.teamChannelID;
        const teamChannel = await client.guilds.cache.get(process.env.GUILD_ID).channels.fetch(teamChannelID);

        teamChannel.delete();

        //  finds all the team members and sends them an information message from dm

        const embed = new EmbedBuilder()
            .setTitle(`${adminUser.teamName} Has Been Deleted!`)
            .setDescription(`${member} has deleted the ${adminUser.teamName} team. Therefore, you're not a part of this team anymore. You can look for other teams on the server.`)
            .setThumbnail(process.env.DELETE_THUMBNAIL)
            .setColor("Random");

        const allTeamMembers = (await readData(mongoClient, {"teamName" : adminUser.teamName}));

        allTeamMembers.forEach(async (user) => {
            
            //  finding other team members rather than admin

            if(user.userID !== adminUser.userID){
                const teamMember = await client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(user.userID);
                if(teamMember){
                    await deleteData(mongoClient, {"userID" : user.userID});
                    await teamMember.roles.remove(process.env.MEMBER_ROLE_ID);

                    teamMember.send({
                        embeds: [embed]
                    });
                }
            }

        });

        //  delete the admin from the database itself
        await deleteData(mongoClient, {"userID" : member.id});

    }
    
}