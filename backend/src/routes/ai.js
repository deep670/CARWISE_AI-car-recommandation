import {Router} from "express";
import OpenAI from "openai";
import Car from "../models/Car.js";
const r=Router();

r.post("/recommend",async(req,res)=>{
 const {budget=15,fuel="Any",body="SUV"}=req.body;
 let q={price:{$lte:Number(budget)}}; if(fuel!=="Any")q.fuel=fuel;if(body!=="Any")q.body=body;
 let items=await Car.find(q).sort({score:-1}).limit(6);
 if(!items.length)items=await Car.find({price:{$lte:Number(budget)}}).sort({score:-1}).limit(6);
 res.json({recommendations:items.map((c,i)=>({car:c,matchScore:Math.min(98,89+i%3+Math.round(c.score-8.2))}))});
});

r.post("/chat",async(req,res)=>{
 const msg=String(req.body.message||"");
 if(process.env.OPENAI_API_KEY){
  try{
   const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
   const out=await client.responses.create({model:"gpt-4.1-mini",input:`You are CARWISE AI, a practical car buying assistant. Use concise buyer-focused language. User: ${msg}`});
   return res.json({reply:out.output_text});
  }catch{}
 }
 res.json({reply:"CARWISE AI preview: tell me your budget, family size, daily driving, fuel preference and top priority. I can narrow the CARWISE catalogue and explain the trade-offs."});
});
export default r;
