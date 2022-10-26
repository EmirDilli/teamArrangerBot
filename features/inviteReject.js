const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { deleteData } = require("../databaseFeatures/dbDeleteUser")
const { updateData } = require("../databaseFeatures/dbUpdateUser.js");
const mongoose = require("mongoose");
require("dotenv").config();


module.exports = {
    /** 
    * @param {ButtonInteraction} interaction 
    * @param {mongoose.Model} mongoClient 
    * @param {Client} client 
    */
    async invitationReject(interaction, mongoClient, client){ 

        await interaction.deferReply({
            ephemeral: true
        });

        //  getting the accepted user
        const teamID = interaction.customId.split(".")[1];
        const team = readData(mongoClient, { "teamCustomID": teamID });
        const acceptedUserID = interaction.customId.split(".")[2];

        let admin;
        await team.then(datas => datas.find(data => {
            if (data.isAdmin === true) admin = data;
        }))
        
        
        if(admin){
            admin.inviteUserArr.forEach(async element => {
                if(element === acceptedUserID){
                    let arr = admin.inviteUserArr
                    let index = arr.indexOf(element);
                    arr.splice(index,1)
                    await updateData(mongoClient, {"userID": admin.userID}, {"inviteUserArr": arr})
                }
            });   
        } 

        if((await readData(mongoClient, {"teamCustomID": teamID})).length === 0){
            
            await interaction.editReply({
                content: "The team you want to reject does not exist anymore!",
                ephemeral: true
            });
            
            await interaction.message.delete();
            return;
        }

        await interaction.editReply({
            content:"You rejection has been executed succesfully!",
            ephemeral: true
        })


        await interaction.message.delete();

        const adminUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(admin.userID);
        const rejectedmember = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle("Your Invitation Has Been Rejected!")
            .setDescription(`${rejectedmember} rejected your team invitation!`)
            .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
            .setColor("Random");
        
        adminUser.send({
            embeds: [embed]
        })
    }

}
