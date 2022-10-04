const { SlashCommandBuilder, CommandInteraction, Client , ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const discord = require("discord.js");
const mongoose = require("mongoose");
const { readData } = require("../../databaseFeatures/dbReadData.js");
const { deleteData } = require("../../databaseFeatures/dbDeleteUser.js");
const { updateData } = require("../../databaseFeatures/dbUpdateUser.js");
const { embedBuilder } = require("../../features/embedTeamBuilder.js");
const { deleteTeam } = require("./deleteTeam.js");
const embedTeamBuilder = require("../../features/embedTeamBuilder.js");

require("dotenv").config();

module.exports = {
    command: new SlashCommandBuilder()
        .setName("leave_team")
        .setDescription("As the member of a team, you've the right to leave your current team!"),

    /**
     * 
     * @param {CommandInteraction} interaction
     * @param {mongoose.Model} mongoClient
     * @param {Client} client
     */

    async leaveTeam(interaction, mongoClient, client) {

        let leavingMember = (await readData(mongoClient, { "userID": interaction.user.id }));
        leavingMember = leavingMember.length !== 0 ? leavingMember[0] : null;
        const isAdminUser = leavingMember ? leavingMember.isAdmin : null;
        let admin = (await readData(mongoClient, { "teamName": leavingMember.teamName, "isAdmin": true }))[0];
        
        let row;

        //  checks if the interacted user is in ay particular team
        if (isAdminUser === null) {

            await interaction.editReply({
                content: "You're not in any particular team to leave!",
                ephemeral: true
            });

            return;
        }

        const allMembers = await readData(mongoClient, { "teamName": leavingMember.teamName });

        //  if the current team has only one member, bot calls the deleteTeam function
        if (allMembers.length === 1) {
            await deleteTeam(interaction, mongoClient, client);
            return;
        }

        interaction.deferReply({
            ephemeral: true
        });

        let members;

        //  leaving member is an ADMIN
        if (isAdminUser) {

            const adminClient = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(leavingMember.userID);
            await deleteData(mongoClient, { "userID": leavingMember.userID });

            members = await readData(mongoClient, { "teamName": leavingMember.teamName, "isAdmin": false });

            //  making one member the team's admin randomly
            const newAdmin = members[0];
            newAdmin.isAdmin = true;
            admin = newAdmin;
            await updateData(mongoClient, { "userID": newAdmin.userID }, { "isAdmin": true });
            const newAdminMember = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(newAdmin.userID);

            const adminAnnouncement = new EmbedBuilder()
                .setTitle("You're now the Admin of your team!")
                .setDescription(`You're the new Admin of your team by default! Enjoy!`)
                .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
                .setColor("Random");

            //  new teamApply customID attacher
            row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`teamApply.${newAdmin.userID}`)
                    .setLabel("Apply")
                    .setStyle(ButtonStyle.Success)
            );

            //  customizing roles
            adminClient.roles.remove(process.env.ADMIN_ROLE_ID);
            newAdminMember.roles.remove(process.env.MEMBER_ROLE_ID);
            newAdminMember.roles.add(process.env.ADMIN_ROLE_ID);
            newAdminMember.send({
                embeds: [adminAnnouncement]
            });

        }

        //  leaving member is NOT an ADMIN
        else {

            const leavingMemberClient = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(leavingMember.userID);
            await deleteData(mongoClient, { "userID": leavingMember.userID });

            //  customizing roles
            await leavingMemberClient.roles.remove(process.env.MEMBER_ROLE_ID);

            row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`teamApply.${admin.userID}`)
                        .setLabel("Apply")
                        .setStyle(ButtonStyle.Success)
                );

            members = await readData(mongoClient, { "teamName": leavingMember.teamName });

        }

        //editing embedMsg
        const embedMsg = await embedBuilder(client, leavingMember.teamName, leavingMember.teamColor, leavingMember.teamDescription, leavingMember.teamLogo, members);
        const tempMsg = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(leavingMember.teamEmbedID);


        if (members.length === 3) {
            tempMsg.edit({
                embeds: [embedMsg],
                components: []
            })
        }
        else {

            tempMsg.edit({
                embeds: [embedMsg],
                components: [row]
            })
        }

        const embed = new EmbedBuilder()
            .setTitle("A Member Has Left Your Team")
            .setDescription(`${leavingMember.userName} has left your team!`)
            .setThumbnail(process.env.LEAVE_THUMBNAIL)
            .setColor("Random");

        members.forEach(async member => {

            const guildMember = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(member.userID);
            await guildMember.send({
                embeds: [embed]
            });

        });

        await interaction.editReply({
            content: "You've succesfully left your team!",
            ephemeral: true
        });

        

        

    }

}