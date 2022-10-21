const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client , ChannelType} = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { updateData } = require("../databaseFeatures/dbUpdateUser.js");
const {embedBuilder} = require("../features/embedTeamBuilder.js");
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

        await interaction.deferReply({
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
        const acceptedUserDB = (await readData(mongoClient, { "userID": acceptedUser.id }));

        //  check if accepted user is already in a team
        if (acceptedUserDB.length !== 0) {

            if (acceptedUserDB[0].teamName !== null) {

                await interaction.editReply({
                    content: "This particular user is already in a team!",
                    ephemeral: true
                });

                await interaction.message.delete();

                return;
            }

        }

        let adminUser = (await readData(mongoClient, { "userID": interaction.user.id }));

        //  checking if the adminUser is available
        if(adminUser.length === 0){
            await interaction.editReply({
                content: "You do not seem to be an admin anymore. Therefore, you cannot continue this process!",
                ephemeral: true
            });

            await interaction.message.delete();

            return;
        }

        adminUser = adminUser[0];

        //  checking if the adminUser is still an admin in any particular team
        if(adminUser.isAdmin === true){

            await interaction.editReply({
                content: "You do not seem to be an admin anymore. Therefore, you cannot continue this process!",
                ephemeral: true
            });

            await interaction.message.delete();

            return;
        }

        const teamName = adminUser.teamName;
        
        //  checking if the capacity of the team is full
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

        //  removing this current team's ID from applied user's "appliedTeams" array
        if(acceptedUserDB[0].appliedTeams.includes(adminUser.teamCustomID)){

            let arr = acceptedUserDB[0].appliedTeams;
            let index = arr.indexOf(adminUser.teamCustomID);
            arr.splice(index,1);
            await updateData(mongoClient, {"userID": acceptedUserDB.userID}, {"appliedTeams": arr});

        }
        

        //  constructing the database and embed messages
        if ((await readData(mongoClient, { "userID": acceptedUserID }).length !== 0)) {

            let members;

            await updateData(mongoClient, { "userID": acceptedUserID }, {

                "teamName": teamName,
                "teamColor": teamColor,
                "teamDescription": teamDescription,
                "teamLogo": teamLogo,
                "teamEmbedID": teamEmbedID,
                "appliedTeams": [],
                "teamCustomID": teamCustomID,
                "inviteUserArr": []

            })
                .then(async () => {

                    members = await readData(mongoClient, { "teamName": teamName });
                    
                });

            const embedMsg = await embedBuilder(client, teamName, teamColor, teamDescription, teamLogo, members);

            //  adding member to the private team channel

            const teamChannelID = adminUser.teamChannelID;
            const teamChannel = await client.guilds.cache.get(process.env.GUILD_ID).channels.fetch(teamChannelID);
            teamChannel.permissionOverwrites.create(acceptedUser.id , {ViewChannel: true});

            await updateData(mongoClient, {"userID": acceptedUserID} , {"teamChannelID": teamChannelID});

        //  deciding whether Apply button
        if(members.length < 3){

            const embedID = adminUser.teamEmbedID;
            const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedID);
            await embed.edit({
                embeds: [embedMsg]
            });

            await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

            await interaction.message.delete();

            const embedAccept = new EmbedBuilder()
                .setTitle("You're Accepted To The Team!")
                .setDescription(`You are now an official member of '${teamName}'!`)
                .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
                .setColor("Random");

            acceptedUser.send({
                embeds: [embedAccept] 
            });

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

            const embedAccept = new EmbedBuilder()
                .setTitle("You're Accepted To The Team!")
                .setDescription(`You are now an official member of '${teamName}'!`)
                .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
                .setColor("Random");

            acceptedUser.send({
                embeds: [embedAccept] 
            });

            //  replying to the interaction
            await interaction.editReply({
                content: "You've added this team member successfully!",
                ephemeral: true
            });

        }

        }


    }

};