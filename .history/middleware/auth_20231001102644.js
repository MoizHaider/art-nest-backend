const jwt = require("jsonwebtoken")
const auth = (req, res, next)=>{
    const authHeader = req.get("Authorization")
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = jwt.verify()
}