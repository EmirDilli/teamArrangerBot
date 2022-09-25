const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, Client , ActionRowBuilder , ButtonBuilder , ButtonStyle} = require("discord.js");
const discord = require("discord.js");
const colors = require("../../constants/colors")
const { readData } = require("../../databaseFeatures/dbReadData.js");
const mongoose = require("mongoose");
const {addData} = require("../../databaseFeatures/dbAddUser.js");

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
                .setName("team_color")
                .setDescription("Select your team's color.")
                .setRequired(false);

            colors.forEach(color => {
                option.addChoices(color);
            });

            return option;

        })
        .addStringOption(option =>
            option
                .setName("team_description")
                .setDescription("Select your team's description.")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("logo_url")
                .setDescription("Type your logo's url")
        ),

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mongoose.Model} mongoClient
     * @param {Client} client
     */

    async script(interaction, mongoClient, client) {

        // checking if the interacted user is already in a team
        if ((await readData(mongoClient, { "userID": interaction.user.id })).length !== 0) {

            interaction.reply({
                content: "You are already in a team. If you want to create a new team, you should leave your current team.",
                ephemeral: true
            });

            return;
        }

        const teamName = interaction.options.get("team_name").value;

        //  checking if the given team name is already available
        if ((await readData(mongoClient, { "teamName": teamName })).length !== 0) {

            interaction.reply({
                content: "This team name has already been taken, you should pick another team name!",
                ephemeral: true
            });

            return;
        }

        const teamColor = interaction.options.get("team_color") ? interaction.options.get("team_color").value : null;
        const teamLogo = interaction.options.get("logo_url") ? interaction.options.get("logo_url").value : null;
        const teamDescription = interaction.options.get("team_description") ? interaction.options.get("team_description").value : null;

        //  constructing embed message of the created team
        const embed = new EmbedBuilder()
            .setAuthor({ "name": teamName })
            .addFields({
                name: "Admin",
                value: `${interaction.member}`,
                inline: true
            });

        if (teamColor) embed.setColor(teamColor);

        // have to check if the url is valid
        if (teamLogo){
            try {
                embed.setThumbnail(teamLogo);
            } catch (error) {
                teamLogo = null;
            }
        } 
        if (teamDescription) embed.setDescription(teamDescription);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`teamApply.${interaction.user.id}`)
                    .setLabel("Apply")
                    .setStyle(ButtonStyle.Success)
            );

        const msg = await client.channels.cache.get("1022518275491500163").send({
            embeds: [embed],
            components: [row]
        });

        //  adding the user data into database
        const dbUser = {
            "userID": interaction.user.id,
            "userName": interaction.member.nickname ? interaction.member.nickname : interaction.user.username,
            "teamName": teamName,
            "isAdmin": true,
            "teamColor": (teamColor),
            "teamLogo": (teamLogo),
            "teamDescription": (teamDescription),
            "teamEmbedID": (msg.id)
        }

        await addData(mongoClient,dbUser);

        interaction.reply({
            content: "Your team has been succesfully created!",
            ephemeral: true
        });

    }

}