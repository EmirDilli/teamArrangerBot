const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require("dotenv").config();

//gives the connection path
const path = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_NAME}.j1ok1i1.mongodb.net/?retryWrites=true&w=majority`;

module.exports = async () => {

    //connecting Mongo database to the application

    await mongoose.connect((path))
        .then(() => {
            console.log("Connected MongoDB");
        })
        .catch((err) => {
            console.log("Error occured while connecting to MongoDB: " + err);
        })

        const collection_structure = new mongoose.Schema({
            userID: {
                type: String,
                required: true
            },
            userName: {
                type: String,
                required: true
            },
            XP: {
                type: Number,
                required: true
            },
            Level: {
                type: Number,
                required: true
            }
        });

        return mongoose.model("users" , collection_structure);
};