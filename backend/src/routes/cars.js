import {Router} from "express";
import Car from "../models/Car.js";
const r=Router();
r.get("/",async(req,res)=>{
 try{
  const {search,brand,fuel,body,maxPrice}=req.query; const q={};
  if(search) q.$or=[{name:new RegExp(search,"i")},{brand:new RegExp(search,"i")}];
  if(brand) q.brand=brand;if(fuel) q.fuel=fuel;if(body) q.body=body;if(maxPrice) q.price={$lte:Number(maxPrice)};
  res.json(await Car.find(q).limit(200));
 }catch{res.status(500).json({message:"Unable to load cars"})}
});
r.get("/:slug",async(req,res)=>{const c=await Car.findOne({slug:req.params.slug}); if(!c)return res.status(404).json({message:"Car not found"});res.json(c)});
export default r;
