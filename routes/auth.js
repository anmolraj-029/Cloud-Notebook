const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const User = require('../models/User');

const bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

const JWT_SECRET = "isagoodboy";

const fetchuser = require('../middleware/fetchuser');

// create a user using :POST "/api/auth/createuser". doesn't req auth
router.post('/createuser',
    [body('name', 'Enter a Valid Name').isLength({ min: 3 }),
    body('email', "Enter a valid emailid").isEmail(),
    body('password', 'Enter correct Password').isLength({ min: 5 }),
    ], async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let user = await User.findOne({ email: req.body.email });

            if (user) {
                return res.status(400).json({ error: "Sorry a user already exist with this email" });
            }
            const salt =  await bcrypt.genSalt(10);

            secpass = await bcrypt.hash( req.body.password,salt);
            user = await User.create({
                name: req.body.name,
                password: secpass,
                email: req.body.email,
            })

            const data = {
                user:{
                    id:user.id
                }
            }
            const authtoken = jwt.sign(data,JWT_SECRET);
            // console.log(jwtData);
            res.json({authtoken});
            // .then(user=>res.json(user)).
            // catch(e=>{console.log(e)
            // res.json({error:"Please enter a unique email",message:e.message})}); 
        } catch (e) {
            console.log(e.message);
            res.sendStatus(500).send("some error occured");
        }

    })


    router.post('/login',
    [
    body('email', "Enter a valid emailid").isEmail(),
    body('password', 'Enter correct Password').exists(),
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {email,password}=req.body;
        try{
            let user=await User.findOne({email});
            if(!user){
                return res.status(400).json({error:"input correct credentials"});
            }

            const passwordcompare = await bcrypt.compare(password,user.password);
            if(!passwordcompare){
                return res.status(400).json({error:"input correct credentials"});
            }

            const data = {
                user:{
                    id:user.id
                }
            }
            const authtoken = jwt.sign(data,JWT_SECRET);
            // console.log(jwtData);
            res.json(authtoken);

        }catch (e) {
            console.log(e.message);
            res.sendStatus(500).send("internal error occured");
        }
    })


    // route 3:get loggedin user details

    router.post('/getuser',fetchuser, async (req, res) => {
    try{
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);
    }catch(e){
        console.log(e.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router;
