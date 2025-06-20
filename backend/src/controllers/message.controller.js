
//we fetching every single user but not our self because we dont want to see ourself in contact list

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/soket.js";


//getUsersForSidebar
export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filterdUsers = await User.find({ _id: {$ne: loggedInUserId}}).select("-password")  
    //This upper line retrieves a list of users from the MongoDB User collection excluding the currently logged-in user, and hides their password field in the response.
    //it is use for sidebar or for context list
    
        res.status(200).json(filterdUsers)
    } catch(error) {
         console.error("error get UsersForSidebar", error.message);
         res.status(500).json({ error: "Internal Server"})
    }
}


//getMessage
export const getMessage = async(req,res) => {
    try{
      const { id: userToChatId} = req.params; //userToChatId, which is the ID of the user you are chatting with.
      const myId = req.user._id; //authentication middleware already set req.user, and this gets your own user ID
      

      const message = await Message.find({  //This part fetches all messages between the logged-in user and the user they are chatting with.
        $or: [
            { senderId: myId, receiverId: userToChatId}, //Messages where you sent the message and the other user received it.
            { senderId: userToChatId, receiverId: myId}, //Messages where the other user sent the message and you received it.            
        ],
      });
      res.status(200).json(message);
    }  
    
    catch(error){
        console.log("Error in getMessages contoller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



//sendMessage
export const sendMessage = async (req,res) => {
    try {
         const { text, image} = req.body;
         const {id: receiverId } = req.params //this id of the persson we are sending message to  //extract the id from the URL parameter (eg. /api/message/:id) and renames it to receiverId
         const senderId = req.user._id; //Gets the logged-in user’s ID from req.user

         let imageUrl;

         if(image){
            //upload image on cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;  //stote upload image url in imageUrl
         }
         
         const newMessage = new Message({ //creating a new message object
            senderId,
            receiverId,
            text,
            image: imageUrl,
         });
         
         await newMessage.save();
         
         //todo: realtime functionality soket.io
         const receiverSocketId = getReceiverSocketId(receiverId);
         if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
         } 

         res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage contoller: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }
};