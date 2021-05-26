const mongoose=require('mongoose');
const schema=mongoose.Schema({
    name:String,
    price:String,
    product:String,
})
module.exports=mongoose.model('vijaydb',schema);