const { SlashCommandBuilder } = require("discord.js");
const discord = require("discord.js");

module.exports = {
    command: new SlashCommandBuilder()
        .setName("invite_member")
        .setDescription("As the admin, you can invite other members in Algo Teams server to your team!")
        .addUserOption((option) => option
            .setName("invite_member")
            .setDescription("choose the member to invite")
            .setRequired(true)
        )
    
}