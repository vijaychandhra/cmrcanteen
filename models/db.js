const mongoose=require('mongoose');
const schema=mongoose.Schema({
    name:String,
    price:String,
    product:String,
    quantity:Number
})
module.exports=mongoose.model('aaaaaaa',schema);