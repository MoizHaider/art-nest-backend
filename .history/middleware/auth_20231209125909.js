const jwt = require("jsonwebtoken")
require('dotenv').config({ path: '.env.local' })
const auth = (req, res, next)=>{
    const authHeader = req.get("Authorization")
    const secretKey = process.env.SECRET_KEY;
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]
    
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, `${secretKey}`)
    }
    catch(err){
        req.isAuth = false;
        throw new Error("jwt Token verification failed try again")
    }
    if(!decodedToken){
        req.isAuth = false;
        return next()
    }
    req.userId = decodedToken._id;
    req.isAuth = true
    next();
}
module.exports = auth