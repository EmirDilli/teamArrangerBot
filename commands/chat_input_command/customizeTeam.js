const { SlashCommandBuilder , CommandInteraction , Client , EmbedBuilder} = require("discord.js");
const discord = require("discord.js");
const colors = require("../../constants/colors");
const mongoose = require("mongoose");
const {readData} = require("../../databaseFeatures/dbReadData.js");
const {updateData} = require("../../databaseFeatures/dbUpdateUser.js");
const {embedBuilder} = require("../../features/embedTeamBuilder");

require("dotenv").config();

module.exports = {
    command: new SlashCommandBuilder()
        .setName("customize_team")
        .setDescription("As the admin, you can invite other members in Algo Teams server to your team!")
        .addStringOption(option => option
            .setName("customize_team_name")
            .setDescription("Customize your team's name!")
        )
        .addStringOption(option => {
            option
                .setName("customize_team_color")
                .setDescription("Customize your team's color!");

            colors.forEach(color => {
                option.addChoices(color);
            });

            return option;

        })
        .addStringOption(option => 
            option
                .setName("customize_team_description")
                .setDescription("Customize your team's description!")
        )
        .addStringOption(option => option
            .setName("customize_team_logo")
            .setDescription("Customize your team's logo!")
        ),



    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */
    async customize_team(interaction, mongoClient, client){

        await interaction.deferReply({
            ephemeral: true
        });

        //  checking if interacted user is an admin in any particular team
        let adminUser = await readData(mongoClient,{"userID" : interaction.user.id});
        
        if(adminUser.length === 0){

            interaction.editReply({
                content: "You don't seem to be in any team. You should be a team's admin in order to customize the team.",
                ephemeral: true
            });
            return;

        }

        if(adminUser[0].isAdmin === false){

            interaction.editReply({
                content: "You have to be the admin of your team in order to customize the team.",
                ephemeral: true
            });
            return;
        }

        adminUser = adminUser[0];

        //  implementing the team's name to a variable!!!! important!
        let teamName = adminUser.teamName;
        let teamDescription = adminUser.teamDescription;
        let teamColor = adminUser.teamColor;
        let teamLogo = adminUser.teamLogo;

        //  getting customized data if they are individually present
        let newTeamName = interaction.options.get("customize_team_name") ? interaction.options.get("customize_team_name").value : null;
        let newTeamDescription = interaction.options.get("customize_team_description") ? interaction.options.get("customize_team_description").value : null;
        let newTeamColor = interaction.options.get("customize_team_color") ? interaction.options.get("customize_team_color").value : null;
        let newTeamLogo = interaction.options.get("customize_team_logo") ? interaction.options.get("customize_team_logo").value : null;

        //  checking and customizing the given datas individually

        //  checking the new team name
        if(newTeamName){
            
            //  checking if the new team name is unique
            if((await readData(mongoClient, {"teamName": newTeamName})).length !== 0){

                interaction.editReply({
                    content: "Unfortunately, your new team name is taken by another team! You should pick another name!",
                    ephemeral: true
                });
                return;
            }

            await updateData(mongoClient, {"teamName" : teamName} , {"teamName" : newTeamName});

            teamName = newTeamName;

        }

        if(newTeamColor){

            await updateData(mongoClient, {"teamName" : teamName} , {"teamColor" : newTeamColor});

            teamColor = newTeamColor;

        }

        if(newTeamLogo){

            await updateData(mongoClient, {"teamName" : teamName} , {"teamLogo" : newTeamLogo});

            teamLogo = newTeamLogo;

        }

        if(newTeamDescription){

            await updateData(mongoClient, {"teamName" : teamName} , {"teamDescription" : newTeamDescription});

            teamDescription = newTeamDescription;

        }

        //  adding embed message, the non-admin members of the team
        const members = await readData(mongoClient, {"teamName" : teamName});

        const embedMsg = await embedBuilder(client, teamName, teamColor, teamDescription, teamLogo, members);

        //  deciding whether Apply button
        if(members.length < 3){

            const embedID = adminUser.teamEmbedID;
            const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedID);
            await embed.edit({
                embeds: [embedMsg]
            });

            interaction.editReply({
                content: "You've customized your team successfully!",
                ephemeral: true
            });

        }
        else{

            const embedID = adminUser.teamEmbedID;
            const embed = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.CHANNEL_ID).messages.fetch(embedID);
            await embed.edit({
                embeds: [embedMsg],
                components: []
            });

            interaction.editReply({
                content: "You've customized your team successfully!",
                ephemeral: true
            });
        }

    }

}