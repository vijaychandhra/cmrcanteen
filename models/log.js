const mongoose=require('mongoose');
const schema=mongoose.Schema({
    name:String,
    password:String,
    products:[
{
    name:String,
    price:Number,
    product:String,
    quantity:Number
}
    ]
})
module.exports=mongoose.model('logindb',schema);