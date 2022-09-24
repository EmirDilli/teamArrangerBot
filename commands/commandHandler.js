const fs = require("fs")
const discord = require("discord.js");


const arrCommands = [];



module.exports = {

    handler() {
        //all events
        const allCommands = fs.readdirSync("./commands").filter(file => !file.endsWith(".js"))

        allCommands.forEach((commandFiles) => {
            
            //getting type of the event
            let commands = fs.readdirSync(`./commands/${commandFiles}`)

            //iterating over javascript event files

            commands.forEach(async command => {
                
                //executing the event
                arrCommands.push(await require(`./${commandFiles}/${command}`).command)
                
            })
            
        })
        
        return arrCommands;
    }

}