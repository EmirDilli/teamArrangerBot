
const discord = require("discord.js");

const dotenv = require("dotenv");
const { IntentsBitField } = discord;
const eventHandler = require("./events/eventHandler.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const commands = require('./commands/commandHandler').handler();
const databaseConnect = require("./databaseFeatures/dbConnect.js");
const { mongo } = require("mongoose");


dotenv.config();
let mongoClient;
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

/*
    BİREYSEL ÇALIŞIRKEN FARKLI BOTLAR ÜSTÜNDEN ÇALIŞMAK MANTIKLI OLABİLİR.
    .env dosyasındaki TOKEN yerine kendi botunun tokenını gir reisim
*/

// implementing the bot with its intents
const client = new discord.Client({
    intents: [
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageTyping

    ]
});


// main function
async function main() {

    try {
        console.log('/ Command activations');

        // connects the database to the application
        await databaseConnect().then((client) => {
            mongoClient = client;
        });

        // handles all the event files before running
        eventHandler.handler(client, mongoClient);

        //activates the bot
        await client.login(TOKEN);

        //Path for / commands, method type: PUT
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands
        });
        

    } catch (err) {
        console.log(err);
    }
}

main();









