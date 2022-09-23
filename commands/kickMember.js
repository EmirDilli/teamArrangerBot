const { SlashCommandBuilder } = require("discord.js");
const discord = require("discord.js");

module.exports = {
    command: new SlashCommandBuilder()
        .setName("kick_member")
        .setDescription("As the admin, you can kick one of your team members!")
        .addUserOption((option) => option
            .setName("kick_member")
            .setDescription("choose the member to kick")
            .setRequired(true)
        )
    
}