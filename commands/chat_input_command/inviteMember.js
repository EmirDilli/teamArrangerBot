const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const discord = require("discord.js");
const { readData } = require("../../databaseFeatures/dbReadData");
const mongoose = require("mongoose");

require("dotenv").config();

module.exports = {
    command: new SlashCommandBuilder()
        .setName("invite_member")
        .setDescription("As the admin, you can invite other members in Algo Teams server to your team!")
        .addUserOption((option) => option
            .setName("invite_member")
            .setDescription("choose the member to invite")
            .setRequired(true)
        ),

    /**
     * 
     * @param {CommandInteraction} interaction
     * @param {mongoose.Model} mongoClient
     */

    async inviteMember(interaction, mongoClient) {

        const invited_user = interaction.options.get("invite_member").user;

        const adminUser = (await readData(mongoClient, {"userID" : interaction.user.id}))[0];
        const isAdminUser = adminUser ? adminUser.isAdmin : null;

        //  checks if the interacted user is an admin in any particular team
        if(!isAdminUser){

            interaction.reply({
                content: "Since you're not an admin in any particular team, you're not authorized to execute this function.",
                ephemeral: true
            });
            return;
        }

        //  checking if the selected user is valid for invitation
        if (invited_user.bot || invited_user.id === interaction.user.id) {

            interaction.reply({
                content: "You have to select a member who is not a bot nor you.",
                ephemeral: true
            });
            return;
        }

        //  checking if the invited user has already a team
        if ((await readData(mongoClient, {"userID" : invited_user.id})).length !== 0) {

            interaction.reply({
                content: "This invited user is already in a team!",
                ephemeral: true
            });
            return;
        }

        //  checking if the capacity of the team is full
        const teamName = (await readData(mongoClient, {"userID" : interaction.user.id}))[0].teamName;

        if ((await readData(mongoClient, {"teamName" : teamName})).length === 3) {

            interaction.reply({
                content: "Your team has full capacity to invite another member!",
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Team Invitation To You")
            .setDescription(`${interaction.user} from the Algo Teams invites you to his/her team. If you're interested you can accept this offer!`)
            .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
            .setColor("Random");

        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId("acceptButton")
                .setLabel("Accept")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(new ButtonBuilder()
                .setCustomId("rejectButton")
                .setLabel("Reject")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary)
            );

        invited_user.send({
            embeds: [embed],
            components: [row]
        }).then(() => {
            interaction.reply({
                content: "Your invitation has been sent succesfully",
                ephemeral: true
            })
        }).catch((err) => {
            console.log("Error occured while sending team invitation: " + err);
            interaction.reply({
                content: "Error occured while sending team invitation",
                ephemeral: true
            })
        });




    }

}