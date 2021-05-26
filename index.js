const express=require('express');
const path=require('path');
const body=require('body-parser');
const passport=require('passport');
require('./pass/passport')(passport);
const app=express();
app.use(body.json());
app.use(body.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
const mongoose=require('mongoose');
const db=require('./models/P');
const lg=require('./models/log')
app.use(passport.initialize());
app.use(passport.session());
const bcrypt=require("bcryptjs");
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
const arr=[];
app.get('/',(req,res)=>{
    // const d={
    //     name:"vamshi",
    //     password:"123",
    // }
    // bcrypt.genSalt(10,(err,salt)=>{
    //     bcrypt.hash(d.password,salt,(err,hash)=>{
    //         if(err)throw err;
    //         d.password=hash;
    //         lg(d).save().then((data)=>console.log(data)).catch((err)=>console.log(err));
    //     })
    // })

    res.redirect('/login.html')
})
app.post('/login', (req,res,next)=>{
  passport.authenticate('local', { 
      successRedirect: '/pp', 
      failureRedirect: '/login' })
    (req,res,next);
})
app.get("/pp",(req,res,next)=>{
    res.render("pp");
})
app.get("/login",(req,res,next)=>{
    res.render("login");
})

app.post('/post',async(req,res)=>{
    try{
    const p=new db({
        name:req.body.name,
        rollno:req.body.age
    })
    p.save();
    arr.push(p);
    res.redirect('/pp')
   }
   catch(err){
       res.send("err")
   }

})
app.post('/get',async(req,res)=>{
    try{
        const p=await db.find({name:req.body.name});
        res.send(p)
    }
    catch(err){
        res.send('err')
    }
})
 app.post('/delete',async(req,res)=>{
     try{
         console.log(req.body.name)
         await db.deleteOne({name:req.body.name})
         res.redirect('/')
     }
     catch(err){
         res.send('err')
     }
 })
 app.get('/deleteall',async(req,res)=>{
     await db.deleteMany({});
     res.redirect('/')
 })
mongoose.connect('mongodb+srv://vijay:vijay@cluster0-6i2ii.mongodb.net/test?retryWrites=true&w=majority',
{ useNewUrlParser: true,useUnifiedTopology:true },()=>console.log("connected to db"));
const q=process.env.PORT||3000;
app.listen(q,()=>{
    console.log(`listening to port ${q}`);
})