const jwt = require("jsonwebtoken")
const auth = (req, res, next)=>{
    const authHeader = req.get("Authorization")
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, "somesecretstring")
    }
    catch(err){
        req.isAuth = false;
        throw new Error("jwt Token verification failed try again")
    }
    if(!decodedToken){
        req.isAuth = 
    }
}