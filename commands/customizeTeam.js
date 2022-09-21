const { SlashCommandBuilder } = require("discord.js");
const discord = require("discord.js");
const colors = require("../constants/colors");

module.exports = {
    command: new SlashCommandBuilder()
        .setName("customize_team")
        .setDescription("As the admin, you can invite other members in Algo Teams server to your team!")
        .addStringOption(option => option
            .setName("customize_team_name")
            .setDescription("Customize your team's name")
        )
        .addStringOption(option => {
            option
                .setName("customize_team_color")
                .setDescription("Customize your team's color");

            colors.forEach(color => {
                option.addChoices(color);
            });

            return option;

        })
        .addAttachmentOption(option => option
            .setName("customize_team_logo")
            .setDescription("Customize your team's logo!")
        )


}