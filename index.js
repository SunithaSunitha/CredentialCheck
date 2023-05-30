const express = require('express');
const app = express();
const User = require('./models/user');
const  mongoose  = require('mongoose');
const bcrypt= require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/authDemo')
    .then(()=>{
        console.log('Mongo connection open')
    })
    .catch(err=>{
    console.log("oh no Mongo connection error!")
    console.log(err)
})


app.set('view engine','ejs');
app.set('views','views');

app.use(express.urlencoded({extended: true}));
app.use(session({secret:'notagoodsecret'}))

const requireLogin = (req,res,next)=>{
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next();
}

app.get('/',(req,res)=>{
    res.send('This is my home page')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register', async(req,res)=>{
    const {password, username} = req.body;
    
    const user = new User({
        username,
        password
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',async(req,res)=>{
    const {username, password} = req.body;
    
    // const user= await User.findOne({username})
    // const validPassword= await bcrypt.compare(password, user.password)
    const foundUser= await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        //res.send("Yay welcome!")
        res.redirect('/secret');
    }
    else{
        //res.send("Try Again")
        res.redirect('/login')
    }
})

app.post('/logout',(req,res)=>{
    req.session.user_id = null;
    //INstead of setting one property to null we can destroy everything
    //req.session.destroy();
    res.redirect('/login');
})

app.get('/secret',requireLogin, (req,res)=>{
    // if(!req.session.user_id){
    //     return res.redirect('/login')
    // }
    //res.send('This is secret! you can not see me unless you logged in')
    res.render('secret')
})

app.get('/topsecret',requireLogin,(req,res)=>{
    res.send("Top secret!")
})

app.listen(3000,()=>{
    console.log('Serving your app!')
})