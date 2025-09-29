import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";



// API function to get User Bookings 
export const getUserBookings = async(req, res) => {
   try {
    // const user = req.auth().userId;  // it was replaced by below
    const { userId } = req.auth();  // Clerk gives userId from auth()

    const bookings = await Booking.find({user:  userId }).populate({
        path: "show",
        populate: {path: "movie"}
    }).sort({createdAt: -1})
    res.json({success: true, bookings});

   } catch (error) {
     console.error(error.message);
     res.json({
        success: false,
        message: error.message
    });
    
   }
};



// API function to update Favorite Movie in Clerk User Metadata
export const updateFavorite = async(req, res) => {
  try {
    const {movieId} = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    if(!user.privateMetadata.favorites){
        user.privateMetadata.favorites = [];
    }

     if(!user.privateMetadata.favorites.includes(movieId)){
        user.privateMetadata.favorites.push(movieId);
    }else{
       user.privateMetadata.favorites =  user.privateMetadata.favorites.filter
       (item => item !== movieId);
    }

    await clerkClient.users.updateUserMetadata(userId, {privateMetadata: 
    user.privateMetadata })
    
    res.json({
      success: true,
      message: "Favorite Movies Updated."
    });

  } catch (error) {
    console.error(error.message);
    res.json({
        success: false,
        message: error.message
    });
    
  }
};



// API function to get all favorite movies
export const getFavorites = async(req, res) => {
  try {
   {/* const user = await clerkClient.users.getUser(req.auth().userId)
    const favorites = user.privateMetadata.favorites; */}   // these were replaced by below-

     const userId = req.auth().userId; // for clarity same style as
    const user = await clerkClient.users.getUser(userId); // for clarity same style as

    const favorites = user.privateMetadata.favorites || []; // Defaulted favorites to an empty array (|| []) in case it’s not set yet.  

    // Getting movies from the database
   const movies = await Movie.find({_id: {$in: favorites}});

   res.json({success: true, movies})

  } catch (error) {
     console.error(error.message);
    res.json({
        success: false,
        message: error.message
    });
  }
};