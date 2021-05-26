const express=require('express');
const path=require('path');
const body=require('body-parser');
const passport=require('passport');
const jwt=require('jsonwebtoken');
const authCheck=require('./view/middle');
const alert=require('alert');
require('dotenv').config();
require('./pass/passport')(passport);
const app=express();
app.use(body.json());
app.use(body.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'view')));
app.set('views',path.join(__dirname,'view'));
app.set('view engine','ejs')
const mongoose=require('mongoose');
const db=require('./models/P');
const lg=require('./models/log');
const data=require('./models/db');
const bcrypt=require("bcryptjs");
const c=require('cors');
require("dotenv").config();
app.use(c());
app.use(passport.initialize());
app.use(passport.session());
const session=require("express-session");
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

app.use('/get',express.static('get'))
//const upload=multer({storage:storage});

app.post('/post',(req,res,next)=>{
    const p=new db({
        name:req.body.name,
        price:req.body.price,
        product:req.body.product,
    })
    p.save();
    res.redirect('/main.html')
    

})
app.get('/',(req,res)=>{
    res.redirect('/login.html')
})


app.post('/signup',(req,res)=>{
    const {name,password}=req.body;
    if(!name || !password){
        res.redirect('/sign.html');
        
    }
    lg.findOne({name:name})
    .then(userdata=>{
        if(userdata){
            return res.status(422).json({error:"user already exists."});
        }
        bcrypt.hash(password,10)
        .then(hashpassword=>{
            const user={
                name:name,
                password:hashpassword,
                products:[],
                quantity:0,
            }
            lg(user).save()
            .then(data=>{
                res.redirect('/login.html')
            })
            .catch(err=>console.log(err));
        })
    })
    .catch(err=>console.log(err));
})
app.get("/loot",async(req,res)=>{
    sess=req.session;
    //console.log(sess.name);
    try{
        var p=await db.find()
         res.render('abc',{p,sess})
    }
    catch(err){
        res.send('err')
    }
    
})
app.get("/back",async(req,res)=>{
    sess=req.session;
    //console.log(sess.name);
    try{
        var p=await db.find()
         res.render('abc',{p})
    }
    catch(err){
        res.send('err')
    }
    
})



app.post('/signin',(req,res)=>{
    sess=req.session;
    const {name,password}=req.body;
    if(!name|| !password){
        return res.status(422).json({error:"fill all fields.."});
    }
    lg.findOne({name:name})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Invalid Credentials.."});
        }
        bcrypt.compare(password,user.password)
        .then(ismatch=>{
            if(ismatch){
                //res.json({message:"successfully signed In"});
                const {_id,name}=user;
                const token=jwt.sign({_id:user._id},"vijay123");
               // sess.token=token;
                // res.json({token,user:{_id,name}});
              // window.localStorage.setItem('user',name);
              sess.name=name;
              sess._id=_id;
              res.redirect("/loot");
            }
            else{
                res.redirect("/login.html");
               // return res.status(422).json({error:"Invalid Credentials"});
            }
        })
        .catch(err=>console.log(err));
    })
    .catch(err=>console.log(err));
})


app.get('/findingallfiles',async(req,res)=>{
    try{
        var p=await db.find()
        
         res.render('abc',{p})
         //res.send(p)
    }
    catch(err){
        res.send('err')
    }
})

app.get('/go',async(req,res)=>{
    var p;
    try{
    p= await lg.findOne({"name":req.session.name});
    }
    catch(err){
        res.send('err')
    }
    var sum=0;
    console.log(p);
    p.products.forEach(element => {
        //if(element.name== req.params.name)
        var s=Number(element.price);
        var ss=Number(element.quantity)
        sum=sum+ss*s;
    });
     p=p.products;
    res.render('pqr',{p,sum})
})
app.get('/proceed',async(req,res)=>{
    var p;
    try{
    p= await lg.findOne({"name":req.session.name});
    }
    catch(err){
        res.send('err')
    }
    var sum=0;
    console.log(p);
    p.products.forEach(element => {
        //if(element.name== req.params.name)
        var s=Number(element.price);
        var ss=Number(element.quantity)
        sum=sum+ss*s;
    });
     p=p.products;
    res.render('xyz',{p,sum})
    
})
app.get('/del/:name',async(req,res)=>{console.log("del",req.params.name);
    //lg.updateMany({"name": req.session.name}, {$pull: {"products":{"name":req.params.name}}});

    lg.updateOne({"name":req.session.name},{"$pull":{"products":{"name":req.params.name}}},{safe:true},(err,result)=>{
        if(err)
        console.log("while deleting",err);
        else{
           console.log("DELETED");
            res.redirect('/addtocart');
        }
    });
    
})
app.get('/checkout',async(req,res)=>{
    //lg.updateMany({"name": req.session.name}, {$pull: {"products":{"name":req.params.name}}});

    lg.update({"name":req.session.name},{ $set :{ products:[]}},{safe:true},(err,result)=>{
        if(err)
        console.log("while deleting",err);
        else{
           console.log("DELETED");
            res.redirect('/loot');
        }
    });
    
})


app.post('/addtomenu',async(req,res)=>{
    try{
    const p=new db({
        name:req.body.name,
        price:req.body.price,
        product:req.body.product
    })
    p.save();
    res.redirect('/main.html')
   }
   catch(err){
       res.send("err")
   }

})
app.post('/addtocart',async(req,res)=>{

    var item=req.session.name;
    lg.findOne({name:item})
    .then(obj=>{
        if(obj){
            console.log(obj.name);
            console.log(obj.products);
            var f=0,stock;
            for(var i=0;i<obj.products.length;i++){
                if(obj.products[i].name==req.body.name){
                    f=1;
                    stock=obj.products[i].quantity;
                    break;
                }
            }
            if(f==1){
                stock=Number(stock)+Number(req.body.quantity);
                lg.updateOne({"name":obj.name,"products.name":req.body.name},{"$set":{"products.$.quantity":stock}},{safe:true},(err,result)=>{
                    if(err)console.log(err);
                    else
                    console.log("hii"+result);
                })
            }
            else{
            const r=db.findOne({name:req.body.name})
            console.log("rrrr"+r)
            const q=new data({
            name:req.body.name,
            price:req.body.price,
            product:req.body.product,
            quantity:req.body.quantity
        })
            
            lg.updateOne({"name":obj.name},{"$addToSet":{"products":q}},{safe:true},(err,result)=>
            {
                if(err)
                console.log("Not pushed into existing itemname..",err);
                else
                console.log("pushed into existing itemname",result);
            })
      }
        }})
        const p= await db.find()
         const sess=req.session;
        res.render('abc',{p,sess})    

    })
    app.post('/removefromcart',async(req,res)=>{
        var item=req.session.name;
        lg.findOne({name:item})
        .then(obj=>{
            if(obj){
                console.log(obj.name);
                console.log(obj.products);
                var f=0,stock;
                for(var i=0;i<obj.products.length;i++){
                    if(obj.products[i].name==req.body.name){
                        f=1;
                        stock=obj.products[i].quantity;
                        break;
                    }
                }
                if(f==1){
                    stock=Number(stock)-Number(req.body.quantity);
                    lg.updateOne({"name":obj.name,"products.name":req.body.name},{"$set":{"products.$.quantity":stock}},{safe:true},(err,result)=>{
                        if(err)console.log(err);
                        else
                        console.log("hii"+result);
                    })
                }
                else{
                const r=db.findOne({name:req.body.name})
                console.log("rrrr"+r)
                const q=new data({
                name:req.body.name,
                price:req.body.price,
                product:req.body.product,
                quantity:req.body.quantity
            })
                
                lg.updateOne({"name":obj.name},{"$addToSet":{"products":q}},{safe:true},(err,result)=>
                {
                    if(err)
                    console.log("Not pushed into existing itemname..",err);
                    else
                    console.log("pushed into existing itemname",result);
                })
          }
            }})
            res.redirect('/go');    
    
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
         await db.deleteOne({name:req.body.name})
         res.redirect('/main.html')
     }
     catch(err){
         res.send('err')
     }
 })

 app.get('/deleteall',async(req,res)=>{
     await db.deleteMany({});
     res.redirect('/main.html')
 })
mongoose.connect("mongodb+srv://vijay:vijay@cluster0-6i2ii.mongodb.net/test?retryWrites=true&w=majority",
{ useNewUrlParser: true,useUnifiedTopology:true },()=>console.log("connected to db"));
const q=process.env.PORT||3000;
app.listen(q,()=>{
    console.log(`listening to port ${q}`);
})