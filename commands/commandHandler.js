const fs = require("fs")
const discord = require("discord.js");


const commands = [];
let commandCodes = {};


module.exports = {
    
    handler(){
        const allEvents = fs.readdirSync("./commands/").filter(file => file.endsWith(".js") && !file.startsWith("commandHandler.js"));

        allEvents.forEach(async (e) => {
            commands.push(require(`./${e}`).command)
        });
        return commands
    },
        
}