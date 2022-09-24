const discord = require("discord.js");
const {MongoClient} = require("mongodb")
const {EmbedBuilder , ActionRowBuilder , ButtonBuilder , ButtonStyle} = discord;
const {script} = require("../../commands/chat_input_command/inviteMember");


// Client interactionCreate event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     * @param {MongoClient} mongoClient
     */

    async event(client, mongoClient){
        
    // collects every slash command script into an object

        client.on("interactionCreate", async (interaction) => {

            if(interaction.isCommand()){
                script(interaction);
            }

            //  button interactions
            if(interaction.isButton()){

                // team apply button is pressed
                if(interaction.customId === "teamApply"){

                    const embed = new EmbedBuilder()
                        .setTitle("Joining Request To Your Team")
                        .setDescription("${username} from the Algo Teams wants to join to your team! If you're interested, you can interact with ${username} and accept the request.")
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

                    interaction.user.send({
                        embeds: [embed],
                        components: [row]
                    })

                }
            }

        });

    },

    
}