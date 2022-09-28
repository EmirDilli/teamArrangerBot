const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const mongoose = require("mongoose");

require("dotenv").config();


module.exports = {
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */


    async applyTeam(interaction, mongoClient, client) {
        // team apply button is pressed


        const userID = interaction.customId.split(".")[1];

        const user = await client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(userID);

        //  checks if the user has sent the application to itself
        if (interaction.user.id === userID) {

            interaction.reply({
                content: "You cannot send application to yourself, you know that, right?",
                ephemeral: true
            });

            return;
        }

        //  check if the interacted user is already in a team
        if ((await readData(mongoClient, { "userID": interaction.user.id })).length !== 0) {

            interaction.reply({
                content: "You already seem to be in another team! If you still want to apply to this team, you should leave your current team first.",
                ephemeral: true
            });

            return;
        }

        //  checks if the admin of the applied team is not in the server anymore
        if (!user) {
            interaction.reply({
                content: "This user cannot be found from the Algo Teams server! Therefore, your request cannot be made!",
                ephemeral: true
            });

            return;
        }

        const modal = new discord.ModalBuilder()
            .setCustomId("userInfoModal")
            .setTitle('User Info')
            .setComponents(
                new ActionRowBuilder()
                    .setComponents(
                        new discord.TextInputBuilder()
                            .setCustomId('infoMessage')
                            .setLabel('User Info')
                            .setStyle(discord.TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setMinLength(10)
                            .setMaxLength(500)
                    )
            )
        await interaction.showModal(modal);
        const modalSubmitInteraction = await interaction.awaitModalSubmit({ filter: () => { console.log('modal submit'); return true }, time: 1000 * 60 * 60 * 24 });
        

        const textInput = (modalSubmitInteraction.fields.getTextInputValue('infoMessage')) ? modalSubmitInteraction.fields.getTextInputValue('infoMessage') : "";

        //  code enters here if all the conditions are satisfied
        const embed = new EmbedBuilder()
            .setTitle("Joining Request To Your Team")
            .setDescription(`${interaction.member} from the Algo Teams wants to join to your team! If you're interested, you can interact with ${interaction.member} and accept the request.`)
            .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
            .setColor("Random")
            .addFields({ name: '\u200b', value: '\u200b' })
            .addFields({
                name: "User Info",
                value: textInput
            });

        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId(`applyAccept.${interaction.user.id}`)
                .setLabel("Accept")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(new ButtonBuilder()
                .setCustomId(`applyReject.${interaction.user.id}`)
                .setLabel("Reject")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary)
            );

        user.send({
            embeds: [embed],
            components: [row]
        })
        .then(() => {

            modalSubmitInteraction.reply({
                content: "Your application has been sent to the team's admin succesfully!",
                ephemeral: true
            });

        }).catch((err) => {
            console.log("Error occured while sending the application the admin: " + err);
        });
    
    }
}



