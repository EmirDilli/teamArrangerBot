const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client, ModalSubmitInteraction } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { addData } = require("../databaseFeatures/dbAddUser.js");
const { updateData } = require("../databaseFeatures/dbUpdateUser");
const mongoose = require("mongoose");

require("dotenv").config();

module.exports = {
    /**
     * 
     * @param {ModalSubmitInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */


    async applyTeamModal(interaction, mongoClient, client) {
        // team apply button is pressed

        let modalSubmitInteraction;
        const receiverID = interaction.customId.split(".")[1];
        const receiver = client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(receiverID);
        const applierID = interaction.user.id;

        const applierDB = await readData(mongoClient, { "userID": applierID});
        const receiverDB =  await readData(mongoClient, {"userID": receiverID})
       
       
        

            
        //if not add the data to the database
        if (applierDB.length === 0) {
            await addData(mongoClient, {
                "userID": interaction.user.id,
                "userName": interaction.member.nickname ? interaction.member.nickname : interaction.user.username,
                "teamName": null,
                "isAdmin": false,
                "teamColor": null,
                "teamLogo": null,
                "teamDescription": null,
                "teamEmbedID": null,
                "appliedTeams": [
                    receiverDB[0].teamName
                ]
            })
        }

        //if it is in the database
        else if (applierDB.length !== 0) {

            //variable to check if the variable is in the database appliedTeam array
            const appliedTeam = applierDB[0].appliedTeams.find(element => element === receiverDB[0].teamName)
            
            
            //if it is not in the database
            if (!appliedTeam) {
                let appliedTeamsArr = applierDB[0].appliedTeams
                appliedTeamsArr.push(receiverDB[0].teamName)
                console.log('updateData')
                //update the teamName array
                await updateData(mongoClient, 
                    {
                    "userID": interaction.user.id
                    },
                    {
                        "appliedTeams": appliedTeamsArr
                    })
            }

            //if it is in the database appliedTeam array
            else if (appliedTeam) {
                interaction.reply({
                    content: "You cannot apply more than once!",
                    ephemeral: true
                })
                return;
            }


        }


       
        const textInput = (interaction.fields.getTextInputValue('infoMessage')) ? interaction.fields.getTextInputValue('infoMessage') : "";
        
        

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

        receiver.send({
            embeds: [embed],
            components: [row]
        }).catch((err) => {
            console.log("Error occured while sending the application the admin: " + err);
        });

        interaction.reply({
            content: "Your application has been sent to the team's admin succesfully!",
            ephemeral: true
        });

    }
}