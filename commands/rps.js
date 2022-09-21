const { SlashCommandBuilder } = require('discord.js');
const { readData } = require("../databaseFeatures/dbReadData.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { updateData } = require("../databaseFeatures/dbUpdateUser.js");

module.exports = {
    command: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('rock paper scissors game')
        .addUserOption(option => {

            option
            return option
                .setName('challenge-user')
                .setDescription('choose a user to be challenged')
                .setRequired(true)
                
        })
        .addStringOption(option => {

            option
            return option
                .setName('rock-paper-scissors')
                .setDescription('choose an icon')
                .setRequired(true)
                .setChoices(
                    {
                        name: '🗿',
                        value: 'rock'
                    },
                    {
                        name: '📄',
                        value: 'paper'
                    },
                    {
                        name: '✂',
                        value: 'scissors'
                    }
                )
        })
        .addNumberOption(option => {
            option
            return option
                .setName('bid')
                .setDescription('xp to be gambled')
                .setRequired(true)
        }),

        async rpsGame(mongoClient, interaction) {

            // all information that are provided by slash command
    
            const user = interaction.options.getUser("challenge-user");
            const choice = interaction.options.getString("rock-paper-scissors");
            const bid = interaction.options.getNumber("bid");
    
            // check if the base conditions are satisfied like, is there enough XP?
    
            const inviterUserArray = await readData(mongoClient, { "userID": interaction.user.id });
    
            if (inviterUserArray.length !== 1) {
                console.log("There is a duplication issue in database. Check it out");
                return;
            }
            
            //user cannot choose itself
            if (interaction.user.id === user.id) {
                interaction.reply({
                    content: "Sorry, you cannot start a Rock Paper Scissors duel against yourself!",
                    ephemeral: true
                });
                return;
            }
            
            //user cannot choose a bot
            if (user.bot) {
                interaction.reply({
                    content: "Sorry, you cannot choose a bot to start a Rock Paper Scissors Duel!",
                    ephemeral: true
                });
                return;
            }
            
            const inviterXP = inviterUserArray[0]["XP"];
    
            //bid cannot be less than zero
            if (bid < 0) {
    
                interaction.reply({
                    content: "Bid cannot be less than zero",
                    ephemeral: true
                });
                return;
            }
    
            if (inviterXP < bid) {
    
                interaction.reply({
                    content: "You do not have enough XP to start a Rock Paper Scissors Duel!",
                    ephemeral: true
                });
                return;
            }
    
            // embedded message
    
            const embedMessage = new EmbedBuilder()
                .setTitle("Rock Paper Scissors Duel")
                .setColor("Aqua")
                .setDescription(`${interaction.user} has challenged ${user} by putting ${bid} XP for total ${2 * bid} XP's !!\n`)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: "Reminder", value: `Only ${user} can access the present buttons, and ${user} can only accept this challenge if ${user} has enough XP to join.` }
                );
    
    
            // all buttons including "decline" button which the challenged user can be willing to decline the duel
    
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("rock")
                        .setEmoji("🗿")
                        .setLabel("Rock")
                        .setStyle(ButtonStyle.Primary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("paper")
                        .setEmoji("📄")
                        .setLabel("Paper")
                        .setStyle(ButtonStyle.Primary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("scissors")
                        .setEmoji("✂")
                        .setLabel("Scissors")
                        .setStyle(ButtonStyle.Primary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("decline")
                        .setEmoji("⛔")
                        .setLabel("Decline")
                        .setStyle(ButtonStyle.Success)
                );
    
    
            await interaction.reply({
                embeds: [embedMessage],
                components: [actionRow]
            });
    
    
            // "msg" variable stores the current message
    
            const msg = await interaction.fetchReply();
    
            // "collector" variable handles the pressed button
    
            // checking if the challenged user has enough xp to attend the duel
            const accepterUserArray = await readData(mongoClient, { "userID": user.id });
            const accepterXP = accepterUserArray[0]["XP"];
    
            // this filter method checks if the user who pressed the button is the same user who has been challenged
            const filter = (button) => user === button.user && (accepterXP >= bid || button.customId === "decline");
    
            const collector = msg.createMessageComponentCollector({
                filter,
                componentType: ComponentType.Button,
                time: 1000 * 60 * (3)
            });
    
            // "collect" event on collector
    
    
            collector.on("collect", async (button) => {
    
                button.deferUpdate();
    
                // challenged user declining the offer
                if (button.customId === "decline") {
    
                    const declinedEmbed = new EmbedBuilder()
                        .setAuthor({ name: "⛔ Challenge Has Been Declined" })
                        .setDescription(`${user} has declined the Rock Paper Scissors Challenge!`);
    
                    await interaction.editReply({
                        embeds: [declinedEmbed],
                        components: []
                    });
    
                }
    
                // challenged user making a move
                else {
    
                    const accepterChoice = button.customId;
                    const inviterChoice = choice;
    
                    const rps = {
                        rock: "🗿",
                        paper: "📄",
                        scissors: "✂"
                    }
    
                    // inviter wins the duel
                    if ((inviterChoice === "paper" && accepterChoice === "rock") ||
                        (inviterChoice === "scissors" && accepterChoice === "paper") ||
                        (inviterChoice === "rock" && accepterChoice === "scissors")) {
    
                        const resultEmbed = new EmbedBuilder()
                            .setAuthor({ name: `🏆 ${interaction.user.username} has won the Rock Paper Scissors Duel! 🏆` })
                            .setColor("Random")
                            .setDescription(`(${interaction.user.username}) ${rps[inviterChoice]} || ${rps[accepterChoice]} (${user.username})`)
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: "Result", value: `${interaction.user} has won total of ${2 * bid} XP's! ` }
                            );
    
                        await updateData(mongoClient, { "userID": interaction.user }, { "XP": (inviterXP + bid) });
                        await updateData(mongoClient, { "userID": user }, { "XP": (accepterXP - bid) });
    
                        await interaction.editReply({
                            embeds: [resultEmbed],
                            components: []
                        });
    
                    }
    
                    // accepter wins the duel
                    else if ((accepterChoice === "paper" && inviterChoice === "rock") ||
                        (accepterChoice === "scissors" && inviterChoice === "paper") ||
                        (accepterChoice === "rock" && inviterChoice === "scissors")) {
    
                        const resultEmbed = new EmbedBuilder()
                            .setAuthor({ name: `🏆 ${user.username} has won the Rock Paper Scissors Duel! 🏆` })
                            .setColor("Random")
                            .setDescription(`(${interaction.user.username}) ${rps[inviterChoice]} || ${rps[accepterChoice]} (${user.username})`)
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: "Result", value: `${user} has won total of ${2 * bid} XP's! ` }
                            );
    
                        await updateData(mongoClient, { "userID": interaction.user }, { "XP": (inviterXP - bid) });
                        await updateData(mongoClient, { "userID": user }, { "XP": (accepterXP + bid) });
    
                        await interaction.editReply({
                            embeds: [resultEmbed],
                            components: []
                        });
    
                    }
    
                    // it is a draw
                    else {
    
                        const resultEmbed = new EmbedBuilder()
                            .setAuthor({ name: `🤜 It Is a Draw 🤛` })
                            .setColor("Random")
                            .setDescription(`(${interaction.user.username}) ${rps[inviterChoice]} || ${rps[accepterChoice]} (${user.username})`)
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: "Result", value: `Each user gets their XP's back!` }
                            );
    
                        await interaction.editReply({
                            embeds: [resultEmbed],
                            components: []
                        });
    
                    }
    
                }
    
            });
    
            // "ignore" event on collector
    
            collector.on("ignore", async (button) => {
    
                
    
                if (user !== button.user) {
    
                    await button.reply({
                        content: "Only the user who has been challenged to the duel, can press the buttons!",
                        ephemeral: true
                    });
    
                }
    
                else {
    
                    await button.reply({
                        content: "You do not have enough XP to attend this Rock Paper Scissors Duel!",
                        ephemeral: true
                    });
    
                }
    
            });
    
            // "end" event on collector
    
            collector.on("end", async () => {
    
                const submitEmbed = new EmbedBuilder()
                    .setAuthor({ name: "🕗 Ended Challenge" })
                    .setDescription(`This Rock Paper Scissors Challenge has been shut down!`);
    
                interaction.editReply({
                    embeds: [submitEmbed],
                    components: []
                });
    
            });
        }
}