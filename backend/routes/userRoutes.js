import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router=express.Router();

router.get("/",protect,async (req,res)=>{
    try{
        const users=await User.find({_id:{$ne : req.user._id}}).select("-password");
        res.json(users)
    }catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;