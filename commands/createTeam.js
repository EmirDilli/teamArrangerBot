const { SlashCommandBuilder } = require("discord.js");
const discord = require("discord.js");
const colors = require("../constants/colors")

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
        .addStringOption(option => 
            option
                .setName("team_color")
                .setDescription("your team color")
                .setRequired(true)
                .setChoices(
                {
                    name: 'Aqua',
                    value: 'Aqua'
                },
                {
                    name: 'Green',
                    value: 'Green'
                },
                {
                    name: 'Orange',
                    value: 'Orange'
                },
                {
                    name: 'Purple',
                    value: 'Purple'
                },
                {
                    name: 'Gold',
                    value: 'Gold'
                },
                {
                    name: 'Blurple',
                    value: 'Blurple'
                },
                {
                    name: 'Random',
                    value: 'Random'
                },
            )
            
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