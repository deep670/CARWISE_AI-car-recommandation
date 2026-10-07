import mongoose from "mongoose";
const carSchema=new mongoose.Schema({
 slug:{type:String,unique:true,index:true},brand:{type:String,index:true},name:{type:String,index:true},
 price:Number,body:String,fuel:String,trans:String,seats:Number,mileage:String,range:String,power:String,
 score:Number,safety:String,wikiTitle:String,description:String,features:[String],luxury:Boolean
},{timestamps:true});
export default mongoose.model("Car",carSchema);
