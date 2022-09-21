const { SlashCommandBuilder , CommandInteraction , EmbedBuilder} = require('discord.js');
const { MongoClient } = require("mongodb");
const dbSort = require("../databaseFeatures/dbSort.js");

module.exports = {
    command: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('xp leaderboard'),

    /**
     * 
     * @param {MongoClient} mongoClient 
     * @param {CommandInteraction} interaction 
     */

    async leaderboard(mongoClient, interaction){

        const arr = await dbSort(mongoClient);

        // these list will be printed on embed leaderboard message
        let rankingList = "";
        let scoreList = "";

        let ranking = 0;
        let prevUser;

        arr.forEach((user) => {

            // first user
            if(ranking === 0){

                ranking += 1;
                prevUser = user;

                rankingList += `${ranking}- ${user["userName"]}\n`;
                scoreList += `${user["XP"]}\n`;

            }
            // other users
            else{

                if(prevUser["XP"] === user["XP"]){

                    prevUser = user;

                    rankingList += `${ranking}- ${user["userName"]}\n`;
                    scoreList += `${user["XP"]}\n`;
                }
                else{

                    ranking += 1;
                    prevUser = user;

                    rankingList += `${ranking}- ${user["userName"]}\n`;
                    scoreList += `${user["XP"]}\n`;
                }

            }

        });

        const leaderBoardEmbed = new EmbedBuilder()
            .setAuthor({name: "Leaderboard"})
            .setDescription(`The leaderboard of ${interaction.guild.name}`)
            .addFields(
                {name: "Ranking", value: rankingList, inline: true},
                {name: '\u200b', value: '\u200b', inline: true},
                {name: "XP" , value: scoreList, inline: true}
            )
            .setColor("Random");

        await interaction.reply({
            embeds: [leaderBoardEmbed]
        });

    }
}

