
const discord = require("discord.js");
const {addData} = require("../../databaseFeatures/dbAddUser.js")
const dotenv = require("dotenv");
dotenv.config()
// this program executes after user joins the server


module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     */
    async event(client, mongoClient) {

        client.on("guildMemberAdd",async (member) => {
            const welcomer = new discord.WebhookClient({
                id: process.env.WEBHOOK_CHAT ,
                token: process.env.WEBHOOK_TOKEN
            })
            
            await addData(mongoClient, {
                "userID": member.user.id,
                "XP": 0,
                "userName": member.user.username,
                "Level": 1
            })
            const welcome = new discord.EmbedBuilder()
                .setTitle('Welcome to our server!')
                .setColor('Aqua')
                .setImage(member.displayAvatarURL())
                .setDescription(`${member.user.username} joined the server!`)
            welcomer.send({embeds: [welcome]});
        });

    },

}