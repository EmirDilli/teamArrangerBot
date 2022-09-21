const discord = require("discord.js")
const mongoose = require("mongoose");
require("dotenv").config();

/**
 * 
 * @param {mongoose.Model} mongoClient 
 */

module.exports = async (mongoClient) => {

    const arr = await mongoClient.find({}).sort('-XP');
    return arr;

};