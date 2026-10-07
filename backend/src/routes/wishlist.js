import {Router} from "express";
import User from "../models/User.js";
import {auth} from "../middleware/auth.js";
const r=Router();
r.get("/",auth,async(req,res)=>{const u=await User.findById(req.user.id).populate("wishlist");res.json(u.wishlist||[])});
r.post("/:carId",auth,async(req,res)=>{
 const u=await User.findById(req.user.id); const id=req.params.carId;
 const exists=u.wishlist.some(x=>String(x)===id);
 u.wishlist=exists?u.wishlist.filter(x=>String(x)!==id):[...u.wishlist,id];
 await u.save();res.json({saved:!exists});
});
export default r;
