const discord = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder , ActivityType} = discord;
const { readData } = require("../../databaseFeatures/dbReadData")
const { addData } = require("../../databaseFeatures/dbAddUser")
const { deleteData } = require("../../databaseFeatures/dbDeleteUser")



// Client being ready event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     */
    async event(client, mongoClient) {

        client.on("ready", async () => {

            console.log(`The ${client.user.username} has logged in`);
            client.user.setActivity({
                name: "by Tevfik Emre Sungur & Emir Şahin Dilli",
                type: ActivityType.Watching
            });

            /* const embed = new EmbedBuilder()
                .setAuthor({ name: "Team Name" })
                .setColor("Random")
                .setDescription("Team Description")
                .addFields({
                    name: "Admin",
                    value: "Admin's Username",
                    inline: true
                },
                    {
                        name: "Member",
                        value: "Member's Username",
                        inline: true
                    })

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("teamApply")
                        .setLabel("Apply")
                        .setStyle(ButtonStyle.Success)
                );

            client.channels.cache.get("1022518275491500163").send({
                embeds: [embed],
                components: [row]
            }); */
    });

},


}