const discord = require("discord.js");
const { SlashCommandBuilder , CommandInteraction, Client , EmbedBuilder} = require("discord.js");
const { values } = require("../../constants/colors");


module.exports = {
    command: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Insturctions for the users and admins"),

        /**
         * @param {CommandInteraction} interaction
         */
        async help(interaction){
            await interaction.deferReply({
                ephemeral: true
            });
            
            const embedAdmin = new EmbedBuilder()
                .setTitle("Admin Commands")
                .setDescription("These admin commands are only accessible to ADMINS of each team available!!")
                .addFields({
                    name: "Customize Team",
                    value: "Team admin can easily customize the team according to its own taste! You can customize your Team Name, Team Color, Team Description, Team Logo individually.\n\n⚠️ WARNING: If you want to change your logo, you should enter the image link of your logo. You can get that link by right clicking your image you find in your browser, and pressing Copy image address!"
                })
                .addFields({
                    name: "Invite member",
                    value: "Team admin can invite other members in the Algo Teams server to the team by entering the specific user!\n\n⚠️ WARNING: Team admin can add ONLY ONE member to the team, in each call of this command! If you want to invite several members, call that command again to invite the other member!"
                })
                .addFields({
                    name: "Kick Member",
                    value: "Team admin can kick one of the team members, if necessary!"
                })
                .addFields({
                    name: "Delete Team",
                    value: "Team admin can delete the whole team, with only one single command!!"
                })
                .setColor("Random");

        await interaction.editReply({
            embeds: [embedAdmin]
        });

          /*   const embedUser = new EmbedBuilder()
                .setTitle("User Command") */

        }

}