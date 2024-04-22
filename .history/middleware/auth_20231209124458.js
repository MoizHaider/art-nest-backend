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
        decodedToken = jwt.verify(token, ``)
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