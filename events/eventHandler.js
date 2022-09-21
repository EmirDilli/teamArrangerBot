const fs = require("fs")
const discord = require("discord.js");
const { MongoCleint } = require("mongodb")

module.exports = {


    /**
     * 
     * @param {discord.Client} client 
     * @param {MongoCleint} mongoClient
     */

    async handler(client, mongoClient) {
        //all events
        const allEvents = fs.readdirSync("./events").filter(file => !file.endsWith(".js"))

        allEvents.forEach((eventFiles) => {
            //getting type of the event
            let events = fs.readdirSync(`./events/${eventFiles}`)

            //iterating over javascript event files

            events.forEach(async event => {
                //executing the event
                await require(`./${eventFiles}/${event}`).event(client, mongoClient);
            })

        })


    }
}
