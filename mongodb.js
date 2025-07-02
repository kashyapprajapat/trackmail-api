const mongoose = require("mongoose")

const dbConnect = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Database Connected Sucessfully ✅");
    } catch (error) {
        console.error("Databse Connection Failed");
        process.exit(1);
    }
}

module.exports = dbConnect;
