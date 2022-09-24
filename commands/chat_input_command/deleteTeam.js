const { SlashCommandBuilder } = require("discord.js");
const discord = require("discord.js");

module.exports = {
    command: new SlashCommandBuilder()
        .setName("delete_team")
        .setDescription("As the admin, you can delete your own team!")
    
}