import "dotenv/config";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import {cars, luxuryCars} from "../../../frontend/src/data.js";

await mongoose.connect(process.env.MONGODB_URI||"mongodb://127.0.0.1:27017/carwise");
await Car.deleteMany({});
const byId=new Map([...cars,...luxuryCars].map(c=>[c.id,c]));
const catalogue=[...byId.values()].map(c=>({
 slug:c.id,brand:c.brand,name:c.name,price:c.price,body:c.body,fuel:c.fuel,trans:c.trans,seats:c.seats,
 mileage:c.mileage,range:c.range||"",power:c.power,score:c.score,safety:c.safety,wikiTitle:c.wikiTitle,
 description:c.description,features:c.features,luxury:Boolean(c.luxury)
}));
await Car.insertMany(catalogue);
console.log(`Seeded ${catalogue.length} CARWISE cars`);
await mongoose.disconnect();
