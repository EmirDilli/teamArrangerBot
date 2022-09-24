const { SlashCommandBuilder } = require("discord.js");
const discord = require("discord.js");
const colors = require("../../constants/colors")

module.exports = {
    command: new SlashCommandBuilder()
        .setName("create_team")
        .setDescription("This command allows you to create your own team and you will be the leader of the team!!")
        .addStringOption(option =>
            option
                .setName("team_name")
                .setDescription("your team name")
                .setRequired(true)
        )
        .addStringOption(option => {
            option
                .setName("customize_team_color")
                .setDescription("Customize your team's color")
                .setRequired(true);

            colors.forEach(color => {
                option.addChoices(color);
            });

            return option;

        }
        )
        .addAttachmentOption(option =>
            option
                .setName("logo")
                .setDescription("choose your logo from your local machine")
        )
        .addStringOption(option =>
            option
                .setName("logo_url")
                .setDescription("Type your logo's url")
        )


}