import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function sign(u){return jwt.sign({id:String(u._id),email:u.email},process.env.JWT_SECRET,{expiresIn:"7d"})}
function safe(u){return {id:u._id,name:u.name,email:u.email}}

export async function register(req,res){
 try{
  const {name,email,password}=req.body;
  if(!name||!email||!password) return res.status(400).json({message:"Name, email and password are required"});
  if(password.length<6) return res.status(400).json({message:"Password must be at least 6 characters"});
  if(await User.findOne({email})) return res.status(409).json({message:"Email already registered"});
  const u=await User.create({name,email,passwordHash:await bcrypt.hash(password,12)});
  return res.status(201).json({token:sign(u),user:safe(u)});
 }catch(e){return res.status(500).json({message:"Registration failed"})}
}
export async function login(req,res){
 try{
  const {email,password}=req.body;
  const u=await User.findOne({email});
  if(!u||!(await bcrypt.compare(password,u.passwordHash))) return res.status(401).json({message:"Invalid email or password"});
  return res.json({token:sign(u),user:safe(u)});
 }catch{return res.status(500).json({message:"Login failed"})}
}
