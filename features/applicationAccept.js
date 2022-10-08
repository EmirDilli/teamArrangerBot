const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client , ChannelType} = require("discord.js");
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

    async applicationAccept(interaction, mongoClient, client) {

        interaction.deferReply({
            ephemeral: true
        });

        //  getting the accepted user
        const acceptedUserID = interaction.customId.split(".")[1];
        const acceptedUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(acceptedUserID)
            .catch(err => {

                interaction.editReply({
                    content: "Error occured while processing the invitation accept!",
                    ephemeral: true
                });
                return;

            });

        //  check if accepted user is already in a team
        if ((await readData(mongoClient, { "userID": acceptedUser.id })).length !== 0) {

            if ((await readData(mongoClient, { "userID": acceptedUser.id }))[0].teamName !== null) {

                interaction.editReply({
                    content: "This invited user is already in a team!",
                    ephemeral: true
                });

                return;
            }

        }

        //  checking if the capacity of the team is full
        const adminUser = (await readData(mongoClient, { "userID": interaction.user.id }))[0];
        const teamName = adminUser.teamName;

        if ((await readData(mongoClient, { "teamName": teamName })).length === 3) {

            interaction.editReply({
                content: "Your team has full capacity to invite another member!",
                ephemeral: true
            });

            return;
        }

        let teamColor = adminUser.teamColor;
        let teamDescription = adminUser.teamDescription;
        let teamLogo = adminUser.teamLogo;
        let teamEmbedID = adminUser.teamEmbedID;
        let teamCustomID = adminUser.teamCustomID;

        //  constructing the database and embed messages
        if ((await readData(mongoClient, { "userID": acceptedUserID }).length !== 0)) {

            const embedMsg = new EmbedBuilder()
                .setAuthor({ "name": teamName })
                .setColor(teamColor)
                .setDescription(teamDescription)
                .setThumbnail(teamLogo)
                .addFields({
                    "name": "Admin",
                    "value": `${await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(adminUser.userID)}`,
                    "inline": true
                });

            let members;

            await updateData(mongoClient, { "userID": acceptedUserID }, {

                "teamName": teamName,
                "teamColor": teamColor,
                "teamDescription": teamDescription,
                "teamLogo": teamLogo,
                "teamEmbedID": teamEmbedID,
                "appliedTeams": [],
                "teamCustomID": teamCustomID

            })
                .then(async () => {

                    members = await readData(mongoClient, { "teamName": teamName });
                    members.forEach(async member => {

                        if (!member.isAdmin) {

                            embedMsg.addFields({
                                "name": "Member",
                                "value": `${(await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(member.userID))}`,
                                "inline": true
                            });

                        }
                    });

                    
                });

        //  deciding whether Apply button
        if(members.length < 3){

            const embedID = adminUser.teamEmbedID;
            const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedID);
            await embed.edit({
                embeds: [embedMsg]
            });

            await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

            await interaction.editReply({
                content: "You've added this team member successfully!",
                ephemeral: true
            });


        }
        else{

            const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(teamEmbedID);
            await embed.edit({
                embeds: [embedMsg],
                components: []
            });

            await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

            await interaction.message.delete();

            //  adding member to the private team channel
            const teamChannelID = (await readData(mongoClient, {"userID": acceptedUser.id})).teamChannelID;
            const teamChannel = await client.guilds.cache.get(process.env.GUILD_ID).channels.fetch(teamChannelID);

            teamChannel.permissionOverwrites.create(acceptedUser.id , {ViewChannel: true});

            //  replying to the interaction
            interaction.editReply({
                content: "You've added this team member successfully!",
                ephemeral: true
            });

        }

        }


    }

};