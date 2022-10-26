const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { addData } = require("../databaseFeatures/dbAddUser");
const { updateData } = require("../databaseFeatures/dbUpdateUser")
const {embedBuilder} = require("./embedTeamBuilder.js");
const mongoose = require("mongoose");
require("dotenv").config();


module.exports = {

    /** 
    * @param {ButtonInteraction} interaction 
    * @param {mongoose.Model} mongoClient 
    * @param {Client} client 
    */

    async invitationAccept(interaction, mongoClient, client) {

        await interaction.deferReply({
            ephemeral: true
        });

        //  getting the accepted user
        const teamID = interaction.customId.split(".")[1];

        let admin, team;

        await readData(mongoClient, { "teamCustomID": teamID }).then(datas => {
            
            team = datas;
            datas.find(data => {
                if (data.isAdmin === true) admin = data;
        })
    
    });

        const acceptedUserID = interaction.customId.split(".")[2];

        const acceptedUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(acceptedUserID)
            .catch(async err => {

                await interaction.editReply({
                    content: "Error occured while processing the invitation accept!",
                    ephemeral: true
                });
                
                await interaction.message.delete();
                return;

            });

        
        if(admin){
            admin.inviteUserArr.forEach(async element => {
                if(element === acceptedUserID){
                    let arr = admin.inviteUserArr
                    let index = arr.indexOf(element);
                    arr.splice(index,1)
                    await updateData(mongoClient, {"userID": admin.userID}, {"inviteUserArr": arr})
                }
            });
        }
        //  check if the specific team is present at that moment
        if((await readData(mongoClient, {"teamCustomID": teamID})).length === 0){

            await interaction.editReply({
                content: "The team you want to join does not exist anymore!",
                ephemeral: true
            })
            
            await interaction.message.delete();
            return;
        }

        //  check if accepted user is already in a team
        if ((await readData(mongoClient, { "userID": acceptedUserID })).length !== 0) {

            if ((await readData(mongoClient, { "userID": acceptedUserID }))[0].teamName !== null) {

                interaction.editReply({
                    content: "You are already in a team, u know that right?",
                    ephemeral: true
                });

                return;
            }

        }

        //  checking if the capacity of the team is full
        if (team.length === 3) {

            await interaction.editReply({
                content: "This team unfortunately, has full capacity!",
                ephemeral: true
            });

            return;
        }

        const adminUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(admin.userID);

        let teamName = admin.teamName;
        let teamColor = admin.teamColor;
        let teamDescription = admin.teamDescription;
        let teamLogo = admin.teamLogo;
        let teamEmbedID = admin.teamEmbedID;
        let teamCustomID = admin.teamCustomID;
        
        //  constructing the database and embed messages
        if ((await readData(mongoClient, { "userID": acceptedUserID })).length !== 0) {
            console.log((await readData(mongoClient, { "userID": acceptedUserID })));

            let members = await readData(mongoClient, { "teamName": teamName });
            members.push({"isAdmin": false , "userID": acceptedUserID});

            await updateData(mongoClient, { "userID": acceptedUserID }, {

                "teamName": teamName,
                "teamColor": teamColor,
                "teamDescription": teamDescription,
                "teamLogo": teamLogo,
                "teamEmbedID": teamEmbedID,
                "appliedTeams": [],
                "teamCustomID": teamCustomID,
                "inviteUserArr": []

            });

            const embedMsg = await embedBuilder(client, teamName, teamColor, teamDescription, teamLogo, members);

            //  deciding whether Apply button
            if (members.length < 3) {

                const embedID = admin.teamEmbedID;
                const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedID);
                await embed.edit({
                    embeds: [embedMsg]
                });

                await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

                await interaction.editReply({
                    content: "You have succesfully attended to the team!",
                    ephemeral: true
                });


            }
            else {

                const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(teamEmbedID);
                await embed.edit({
                    embeds: [embedMsg],
                    components: []
                });

                await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

                await interaction.editReply({
                    content: "You have succesfully attended to the team!",
                    ephemeral: true
                });

            }
            
        }

        else{
            
            let members = await readData(mongoClient, { "teamName": teamName });
            members.push({"isAdmin": false , "userID": acceptedUserID});

            await addData(mongoClient, {
                "userID": interaction.user.id,
                "userName": interaction.member ? interaction.member.nickname : interaction.user.username,
                "teamName": teamName,
                "isAdmin": false,
                "teamColor": teamColor,
                "teamLogo": teamLogo,
                "teamDescription": teamDescription,
                "teamEmbedID": teamEmbedID,
                "appliedTeams": [],
                "teamCustomID": teamCustomID,
                "teamChannelID": null,
                "inviteUserArr": []
            })

            const embedMsg = await embedBuilder(client, teamName, teamColor, teamDescription, teamLogo, members);

            //  deciding whether Apply button
            if (members.length < 3) {

                const embedID = admin.teamEmbedID;
                const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedID);
                await embed.edit({
                    embeds: [embedMsg]
                });

                await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

                await interaction.editReply({
                    content: "You have succesfully attended to the team!",
                    ephemeral: true
                });

            }
            else {

                const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(teamEmbedID);
                await embed.edit({
                    embeds: [embedMsg],
                    components: []
                });

                await acceptedUser.roles.add(process.env.MEMBER_ROLE_ID);

                await interaction.editReply({
                    content: "You have succesfully attended to the team!",
                    ephemeral: true
                });

            }
        }

        //  adding member to the private team channel

    

        const teamChannelID = admin.teamChannelID;
        const teamChannel = await client.guilds.cache.get(process.env.GUILD_ID).channels.fetch(teamChannelID);
        await teamChannel.permissionOverwrites.create(acceptedUser.id , {ViewChannel: true});

        await updateData(mongoClient, {"userID": acceptedUserID} , {"teamChannelID": teamChannelID});

        //  sending notification to the admin user
        const joinedMember = (await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(acceptedUserID));

        await interaction.message.delete();

        const embed = new EmbedBuilder()
            .setTitle("A Member Has Joined Your Team!")
            .setDescription(`${joinedMember} joined your team!`)
            .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
            .setColor("Random");

        adminUser.send({
            embeds: [embed]
        });

    }
}
