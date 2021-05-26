var jwt=require("jsonwebtoken");
require("dotenv").config();
var userModel=require("../models/log");

module.exports=(req,res,next)=>{
    const {authorization}=req.headers;
    if(!authorization){
        return res.status(401).json({error:"you must logged in"});
    }
    const token=authorization.replace("Bearer ","");
    jwt.verify(token,"vijay123",(err,payload)=>{
        if(err){
            return res.status(401).json({error:"you must logged in"});
        }
        const {_id}=payload;
        userModel.findById(_id)
        .then(user=>{
            req.user=user;
            next();
        })
        
    })
}