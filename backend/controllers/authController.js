import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser=async (req,res)=>{
    try{
        const {name,email,password,avatar}=req.body;

        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({message:"User already exists"});
        }

        const user =await User.create({name,email,password,avatar});
        if(user){
            res.status(201).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                avatar:user.avatar,
                token:generateToken(user._id),
                role:user.role,
            });
        }else{
            res.status(400).json({message:"invalid user data"});
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
};



export const loginUser=async (req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(user && (await user.matchPassword(password))){
            res.json({
                _id:user._id,
                name:user.name,
                email:user.email,
                avatar:user.avatar,
                token:generateToken(user._id),
                role:user.role,
            });
        }else{
            res.status(400).json({message:"invalid user data"});
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
};



export const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};