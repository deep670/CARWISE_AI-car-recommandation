import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import cars from "./routes/cars.js";
import wishlist from "./routes/wishlist.js";
import ai from "./routes/ai.js";

const app=express();
app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173"}));
app.use(express.json({limit:"1mb"}));
app.get("/api/health",(_,res)=>res.json({ok:true,name:"CARWISE API"}));
app.use("/api/auth",auth); app.use("/api/cars",cars); app.use("/api/wishlist",wishlist); app.use("/api/ai",ai);
app.use((_,res)=>res.status(404).json({message:"Route not found"}));

const port=Number(process.env.PORT||5000);
mongoose.connect(process.env.MONGODB_URI||"mongodb://127.0.0.1:27017/carwise")
 .then(()=>app.listen(port,()=>console.log(`CARWISE API running on ${port}`)))
 .catch(err=>{console.error("MongoDB connection failed:",err.message);process.exit(1)});
