var jwt = require('jsonwebtoken');
const JWT_SECRET = "isagoodboy";
const fetchuser=(req,res,next)=>{
    const token= req.header('auth-token');
    if(!token){
        res.status(401).send({error:"please autheneticate using a valid token"});
    }
    try{
        const data= jwt.verify(token,JWT_SECRET);
        req.user = data.user;

    next();

    }catch(e){
        res.status(401).send({error:"invalid token"})
    }
    
}

module.exports=fetchuser;
