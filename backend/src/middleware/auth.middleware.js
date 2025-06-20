import jwt from "jsonwebtoken"
import  User from "../models/user.model.js";
import { json } from "express";

//user is aut
export const protectRoute = async (req,res,next) => {
    try{
         const token = req.cookies.jwt;

         if(!token){
             return res.status(401).json({ message: "Unauthorized - No token provided" });
         }

         const decoded = jwt.verify(token, process.env.JWT_SECRET) //if token is valid then it decodes the token and store the result 

         if(!decoded){ //if decoded variable is falsy then it sends unauthorized response
            return res.status(401).json({ message: "Unauthorized - Invalid Token"})
         }
         
         const user = await User.findById(decoded.userId).select("-password")

         if(!user){
            return res.status(404).json({ message: "User not found"});
         }
         
         //if user exist then send user to the database 
         req.user = user;
         next();
    } catch(error) {
      console.log("error in protectRoute middleware: ", error.message);
      res.status(500).json({ message: "Internal Server error" });  
    }
}