import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  
try {
    const {userId} = req.auth(); // if not worked, then use- req.auth;

     if (!userId) {
      return res.json({ success: false, message: "Not Authorized." });
    }
    
    const user = await clerkClient.users.getUser(userId);

    if(user.privateMetadata.role !== 'admin'){
        return res.json({success: false, message: 'Not Authorized.'});
    }

    next();
    
} catch (error) {
     console.error(error.message);
     return res.json({success: false, message: 'Not Authorized.'});

}

}