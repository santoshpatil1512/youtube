import mongoose   from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInatance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB Connected !! DB_HOST: ${connectionInatance.connection.host}`);
    } catch (error) {
        console.log(`\nMONGODB connection error`, error);
        process.exit(1)
    }
}

export default connectDB