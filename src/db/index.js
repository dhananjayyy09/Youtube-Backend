import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`\nConnected to the database successfully !! DB HOST: ${connection.connection.host}\n`);
    } catch(error){
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
}

export default connectDB;