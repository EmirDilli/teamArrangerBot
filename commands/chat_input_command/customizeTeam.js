const { SlashCommandBuilder , CommandInteraction , Client} = require("discord.js");
const discord = require("discord.js");
const colors = require("../../constants/colors");
const mongoose = require("mongoose");
const {readData} = require("../../databaseFeatures/dbReadData.js");
const {updateData} = require("../../databaseFeatures/dbUpdateUser.js");

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

        //  checking if interacted user is an admin in any particular team
        const adminUser = await readData(mongoClient,{"userID" : interaction.user.id});
        
        if(adminUser.length === 0){

            interaction.reply({
                content: "You don't seem to be in any team. You should be a team's admin in order to customize the team.",
                ephemeral: true
            });
            return;

        }

        if(adminUser[0].isAdmin === false){

            interaction.reply({
                content: "You have to be the admin of your team in order to customize the team.",
                ephemeral: true
            });
            return;
        }

        //  getting customized data if they are individually present
        const newTeamName = interaction.options.get("customize_team_name") ? interaction.options.get("customize_team_name") : null;
        const newTeamDescription = interaction.options.get("customize_team_description") ? interaction.options.get("customize_team_description") : null;
        const newTeamColor = interaction.options.get("customize_team_color") ? interaction.options.get("customize_team_color") : null;
        const newTeamLogo = interaction.options.get("customize_team_logo") ? interaction.options.get("customize_team_logo") : null;

        //  checking and customizing the given datas individually

        if(newTeamName){

        }

    }

}