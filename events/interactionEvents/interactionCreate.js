const discord = require("discord.js");
const { MongoClient } = require("mongodb")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discord;
const { inviteMember } = require("../../commands/chat_input_command/inviteMember.js");
const { createTeam } = require("../../commands/chat_input_command/createTeam.js");
const { deleteTeam } = require("../../commands/chat_input_command/deleteTeam.js");
const { kickMember } = require("../../commands/chat_input_command/kickMember.js");
const { readData } = require("../../databaseFeatures/dbReadData.js");

require("dotenv").config();

// Client interactionCreate event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     * @param {MongoClient} mongoClient
     */

    async event(client, mongoClient) {

        // collects every slash command script into an object
        client.on("interactionCreate", async (interaction) => {

            if (interaction.isCommand()) {

                if (interaction.commandName === "invite_member") {
                    inviteMember(interaction, mongoClient);
                }
                if (interaction.commandName === "create_team") {
                    createTeam(interaction, mongoClient, client);
                }
                if (interaction.commandName === "delete_team") {
                    deleteTeam(interaction, mongoClient, client);
                }
                if (interaction.commandName === "kick_member") {
                    kickMember(interaction, mongoClient, client);
                }

            }

            //  button interactions
            if (interaction.isButton()) {


                
                // team apply button is pressed
                if (interaction.customId.startsWith("teamApply")) {

                    const userID = interaction.customId.split(".")[1];

                    const user = await client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(userID);

                    //  checks if the user has sent the application to itself
                    if(interaction.user.id === userID){

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
                const modalSubmitInteraction = await interaction.awaitModalSubmit({filter: () => {console.log('modal submit'); return true}, time: 10000}).catch(console.error)
                
                
                const textInput = (modalSubmitInteraction.fields.getTextInputValue('infoMessage'))? modalSubmitInteraction.fields.getTextInputValue('infoMessage') : "";

                    //  code enters here if all the conditions are satisfied
                    const embed = new EmbedBuilder()
                        .setTitle("Joining Request To Your Team")
                        .setDescription(`${interaction.member} from the Algo Teams wants to join to your team! If you're interested, you can interact with ${interaction.member} and accept the request.`)
                        .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
                        .setColor("Random");

                    const row = new ActionRowBuilder()
                        .addComponents(new ButtonBuilder()
                            .setCustomId(`acceptApply.${interaction.user.id}`)
                            .setLabel("Accept")
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Primary)
                        )
                        .addComponents(new ButtonBuilder()
                            .setCustomId(`rejectApply.${interaction.user.id}`)
                            .setLabel("Reject")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Secondary)
                        );

                    user.send({
                        embeds: [embed],
                        components: [row]
                    })
                        .then(() => {

                            interaction.reply({
                                content: "Your application has been sent to the team's admin succesfully!",
                                ephemeral: true
                            })

                        })
                        .catch((err) => {
                            console.log("Error occured while sending the application the admin: " + err);
                        });

                }
            }

        });

    },


}