const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const discord = require("discord.js");
const { readData } = require("../../databaseFeatures/dbReadData");
const { addData } = require("../../databaseFeatures/dbAddUser")
const mongoose = require("mongoose");
const { updateData } = require("../../databaseFeatures/dbUpdateUser");

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

        await interaction.deferReply({
            ephemeral: true
        });

        const invited_user = interaction.options.get("invite_member").user;

        

        let adminUser = (await readData(mongoClient, {"userID" : interaction.user.id}));

        if(adminUser.length === 0){

            await interaction.editReply({
                content: "You are not an admin in any particular team!",
                ephemeral: true
            });

            return;

        }

        adminUser = adminUser[0];
        const isAdminUser = adminUser ? adminUser.isAdmin : null;
            
        let isInvited = false;
        adminUser.inviteUserArr.forEach(element => {
            if(element === invited_user.id) {
                
                isInvited = true;
            }
        })

        if(isInvited){
            await interaction.editReply({
                content: "You cannot invite this user more than once!",
                ephemeral: true
            })
            return;
        }

        //  checks if the interacted user is an admin in any particular team
        if(!isAdminUser){

            interaction.editReply({
                content: "Since you're not an admin in any particular team, you're not authorized to execute this function.",
                ephemeral: true
            });
            return;
        }

        //  checking if the selected user is valid for invitation
        if (invited_user.bot || invited_user.id === interaction.user.id) {

            interaction.editReply({
                content: "You have to select a member who is not a bot nor you.",
                ephemeral: true
            });
            return;
        }
        


        //  checking if the invited user has already a team
        if ((await readData(mongoClient, {"userID" : invited_user.id})).length !== 0) {

            if((await readData(mongoClient, {"userID" : invited_user.id}))[0].teamName !== null){

                interaction.editReply({
                    content: "This invited user is already in a team!",
                    ephemeral: true
                });
                return;

            }
            
        }




        //  checking if the capacity of the team is full
        const teamName = (await readData(mongoClient, {"userID" : interaction.user.id}))[0].teamName;

        if ((await readData(mongoClient, {"teamName" : teamName})).length === 3) {

            interaction.editReply({
                content: "Your team has full capacity to invite another member!",
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Team Invitation To You")
            .setDescription(`(${interaction.member} ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}) from the Algo Teams invites you to his/her team. If you're interested you can accept this offer!`)
            .setThumbnail(process.env.INVITE_THUMBNAIL)
            .setColor("Random");

        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId(`acceptButton.${adminUser.teamCustomID}.${invited_user.id}`)
                .setLabel("Accept")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(new ButtonBuilder()
                .setCustomId(`rejectButton.${adminUser.teamCustomID}.${invited_user.id}`)
                .setLabel("Reject")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary)
            );
        
        
        const inviteArr = adminUser.inviteUserArr;
        inviteArr.push(invited_user.id)
        await updateData(mongoClient, {"userID": adminUser.userID},{
            "inviteUserArr": inviteArr
        })

        invited_user.send({
            embeds: [embed],
            components: [row]
        }).then(() => {
            interaction.editReply({
                content: "Your invitation has been sent succesfully",
                ephemeral: true
            })
        }).catch((err) => {
            console.log("Error occured while sending team invitation: " + err);
            interaction.editReply({
                content: "Error occured while sending team invitation",
                ephemeral: true
            })
        });




    }

}