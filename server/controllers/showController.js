import axios from "axios"; 
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";


// API to get now playing movies from OMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    // Frontend will send ?q=batman or ?q=avengers
    const { q } = req.query;

    // If no query → show default "Avengers"
    const searchQuery = q || "Avengers";

    const { data } = await axios.get(
      `${process.env.OMDB_API_URL}?s=${searchQuery}&type=movie&apikey=${process.env.OMDB_API_KEY}`
    );

    if (data.Response === "False") {
      return res.json({ success: false, message: data.Error });
    }

    const movies = data.Search;
    res.json({ success: true, movies: movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details from OMDb API using imdbID
      const { data: movieApiData } = await axios.get(
        `${process.env.OMDB_API_URL}?i=${movieId}&apikey=${process.env.OMDB_API_KEY}`
      );

      // a fallback/ error handling
       if (!movieApiData || movieApiData.Response === "False") {
        return res.json({ success: false, message: "Movie not found in OMDb." });
      }

      const movieDetails = {
        _id: movieId,
        title: movieApiData.Title,
        overview: movieApiData.Plot,
        poster_path: movieApiData.Poster,
        backdrop_path: "", // OMDb doesn't provide this
        genres: movieApiData.Genre ? movieApiData.Genre.split(", ") : [],
        casts: movieApiData.Actors ? movieApiData.Actors.split(", ") : [],
        release_date: movieApiData.Released,
        original_language: movieApiData.Language,
        tagline: "", // OMDb doesn’t have tagline
        // vote_average: movieApiData.imdbRating, // this was changed
        vote_average: movieApiData.imdbRating
        ? parseFloat(movieApiData.imdbRating)
        : 0 ,
        runtime: movieApiData.Runtime ? parseInt(movieApiData.Runtime) : 0,
      };

      // Add movie to the database
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
     const showDate = show.date;

       // edited, handle both single time or array of times
      const times = Array.isArray(show.time) ?
       show.time : [show.time];

      times.forEach((time) => {
        if (time) {
          const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      }
    });
  });

    // edited, Validate and insert
    if (showsToCreate.length === 0) {
       return res.json({
        success: false,
        message: "No valid show dates or times provided.",
      });
    }
     await Show.insertMany(showsToCreate);

    res.json({ success: true, message: "Show Added Successfully." });
  } catch (error) {
    console.error("Add Show Error:", error);
    res.json({ success: false, message: error.message });
  }
};



// API to get all shows from the database
  export const getShows = async (req, res) => {  // this will be changed later as of some issue 
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() }
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueShows = [];
    const movieIds = new Set();

    shows.forEach((show) => {
      if (!movieIds.has(show.movie._id.toString())) {
        movieIds.add(show.movie._id.toString());
        uniqueShows.push(show);
      }
    });

    res.json({
      success: true,
      shows: uniqueShows
    });
  } catch (error) {
    console.error(error);
    res.json({success: false, message: error.message});
  }
}; 



// API to get a single show from the database
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() }
    });

    // Get movie details from DB (added earlier from OMDB)
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.json({ success: false, message: "Movie not found." });
    }

    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        price: show.showPrice
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};






