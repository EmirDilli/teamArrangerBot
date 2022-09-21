const { SlashCommandBuilder , CommandInteraction , EmbedBuilder} = require('discord.js');
const { MongoClient } = require("mongodb");
const dbSort = require("../databaseFeatures/dbSort.js");

module.exports = {
    command: new SlashCommandBuilder()
        .setName('showxp')
        .setDescription('users xp'),

    /**
     * 
     * @param {MongoClient} mongoClient 
     * @param {CommandInteraction} interaction 
     */

    async showXP(mongoClient, interaction){

        console.log("Entered");
        // wantedUser: the user that has made the interaction
        const wantedUser = interaction.user;

        // sorted list of all users according to their XP levels
        const arr = await dbSort(mongoClient);
        
        // object of wantedUser's information
        let resultedUser;

        // ranking of the wantedUser
        let ranking = 0;
        
        // stores the previous user
        let prevUser;
        let pass = false;

        for(const user of arr){

        if(!pass){

            // first user
            if(ranking === 0){

                ranking += 1;
                prevUser = user;

                if(wantedUser.id === user["userID"]){
                    resultedUser = user;
                    pass = true;
                }
            }

            // other users
            else{

                // checking if previous user and current user have different XP amount
                if(prevUser["XP"] > user["XP"]){

                    ranking += 1;
                    prevUser = user;

                    if(wantedUser.id === user["userID"]){
                        resultedUser = user;
                        pass = true;
                    }
                }

                // in this case, ranking stays the same since both users have the same XP amount
                else{

                    prevUser = user;

                    if(wantedUser.id === user["userID"]){
                        resultedUser = user;
                        pass = true;
                    }
                }
            }
        }
        }

            const submitEmbed = new EmbedBuilder()
                .setAuthor({iconURL: wantedUser.displayAvatarURL() , name: wantedUser.username})
                .addFields(
                    {name: "XP", value: (resultedUser["XP"] + "") , inline: true},
                    {name: "Level", value: (resultedUser["Level"] + "") , inline: true},
                    {name: "Ranking", value: (ranking + "") , inline: true},
                )
                .setColor("Aqua");

            await interaction.reply({
                embeds: [submitEmbed]
            });

        }
}


