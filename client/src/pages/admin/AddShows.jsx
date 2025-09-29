import React, { useEffect, useState } from "react";

//import { dummyShowsData } from "../../assets/assets";

import Loading from "../../components/Loading";

import Title from "../../components/admin/Title";

import { CheckIcon, StarIcon } from "lucide-react";

// import { kConverter } from "../../lib/kConverter";

import { DeleteIcon } from "lucide-react";

import { useAppContext } from "../../context/AppContext";

import toast from "react-hot-toast";

const AddShows = () => {

const {axios, getToken, user} = useAppContext();

const currency = import.meta.env.VITE_CURRENCY

const [nowPlayingMovies, setNowPlayingMovies] = useState([]);

const [selectedMovie, setSelectedMovie] = useState(null);

const [dateTimeSelection, setDateTimeSelection] = useState({});

const [dateTimeInput, setDateTimeInput] = useState("");

const [showPrice, setShowPrice] = useState("");

const [addingShow, setAddingShow] = useState(false);

const fetchNowPlayingMovies = async() => {

try {

const {data} = await axios.get('/api/show/now-playing', {

  headers: {Authorization: `Bearer ${await getToken()}`}, });



  console.log("Now Playing Response:", data);  //  check what you get



  

  if(data.success){

    setNowPlayingMovies(data.movies || []); //  ensure it's always an arrayy

  } else {

  setNowPlayingMovies([]); // prevent undefined

}

} catch (error) {

console.error('Error fetching movies:', error);

setNowPlayingMovies([]); // prevent loading forever

}

}

{/*

// OMDb search API does not return imdbRating, so fetch details per movie

if(data.success && data.movies){

// OMDb search API does not return imdbRating, so fetch details per movie

    const moviesWithRatings = await Promise.all(

      data.movies.map(async (movie) => {

        try {

          const details = await axios.get(

            `${import.meta.env.VITE_BASE_URL}/api/show/details/${movie.imdbID}`, //  new details route

            {

              headers: {Authorization: `Bearer ${await getToken()}`}

            }

          );

          return {...movie, imdbRating: details.data.movie.imdbRating}; //  add imdbRating from details API

        } catch (err) {

          console.error("Error fetching movie details:", err);

          return {...movie, imdbRating: "N/A"}; // fallback

        }

      })

    );



    setNowPlayingMovies(moviesWithRatings); //  set enriched movies

  } else {

    setNowPlayingMovies([]); 

  }



} catch (error) {

  console.error('Error fetching movies:', error);

  setNowPlayingMovies([]); 

}

} */}

const handleDateTimeAdd = () => {

if (!dateTimeInput) return;

const [date, time] = dateTimeInput.split("T");

if (!date || !time) return;



setDateTimeSelection((prev) => {

    const times = prev[date] || [];

    if (!times.includes(time)) {

        return { ...prev, [date]: [...times, time] };

    }

    return prev;

});

};

const handleRemoveTime = (date, time) => {

setDateTimeSelection((prev) => {

const filteredTimes = prev[date].filter((t) => t !== time);

if (filteredTimes.length === 0) {

  const { [date]: _, ...rest } = prev;

  return rest;

}

return { ...prev, [date]: filteredTimes,



 };

});

};

const handleSubmit = async  () => {

try {

setAddingShow(true);



if(!selectedMovie || Object.keys(dateTimeSelection).length === 0 || 

!showPrice) {

  return toast('Missing required fields.');

}



const showsInput = Object.entries(dateTimeSelection).map(([date, time])=> 

  ({date, time}) 

 );



const payload = {

  movieId: selectedMovie,

  showsInput,

  showPrice: Number(showPrice)

}



const { data } = await axios.post('/api/show/add', payload, { headers: 

  {Authorization: `Bearer ${await getToken()}` }

});



if(data.success) {

  toast.success(data.message);

  setSelectedMovie(null)

  setDateTimeSelection({})

  setShowPrice("")

} else {

  toast.error(data.message);

}

} catch (error) {

console.error("Submission error:", error);

toast.error('An error occured, please try again.');

}

setAddingShow(false);

}

useEffect(()=> {

if(user){

fetchNowPlayingMovies();

}

},[user]);

return nowPlayingMovies.length > 0  ? (

    <>

  <Title text1="Add" text2="Shows" />

  <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

  <div className="overflow-x-auto pb-4">

    <div className="group flex flex-wrap gap-4 mt-4 w-max">

      {nowPlayingMovies.map((movie) => (

        <div key={movie.imdbID}  // changed from  key={movie.id} to  key={movie.imdbID} as OMDB doesn't give id, and have to change everywhere you've used movie.id to movie.imdbID

         className={`relative max-w-40 cursor-pointer 

         group-hover:not-hover:opacity-40 hover:-translate-y-1 transition

         duration-300 `} onClick={()=>setSelectedMovie(movie.imdbID)} > {/* changed from  {movie.id} to  {movie.imdbID} as OMDB doesn't give id */}

         <div className="relative rounded-lg overflow-hidden">

            <img src={movie.Poster} alt={movie.Title} className="w-full 

            object-cover brightness-90 " />  { /* changed from movie.poster_path to movie.Poster as OMDB uses Poster , not poster_path and added from alt="" to - alt={movie.Title}  */}

            <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">

              <p className="flex items-center gap-1 text-gray-400">

              <StarIcon className="w-4 h-4 text-primary fill-primary" />

              {movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "N/A"} {/* changed from movie.vote_average?.toFixed(1) to movie.imdbRating ?? as OMDB doesn't provide vote_average, so default 0.0   */}

              </p>                     

              <p className="text-gray-300">{movie.Year}</p> {/* changed from {kConverter(movie.vote_count)} to {movie.Year} as OMDB doesn't provide vote_count , show year instead */}

              </div>

          </div>

          {selectedMovie === movie.imdbID && ( 

          // changed from movie.id to movie.imdbID as OMDB doesn't give id

            <div className="absolute top-2 right-2 flex items-center

            justify-center bg-primary h-6 w-6 rounded ">

             <CheckIcon className="w-4 h-4 text-white"

             strokeWidth={2.5}/>

            </div>

          )}



        <p className="font-medium truncate">{movie.Title}</p> {/* changed from {movie.title} to {movie.Title} as OMDB uses Title instead of title */}

        <p className="text-gray-400 text-sm">{movie.Year}</p> {/* changed from {movie.release_date} to {movie.Year} as OMDB uses Year instead of release_date */}

        </div>

      ))}

    </div>

  </div>



  {/* show price input */}

    <div className="mt-8">

    <label className="block text-sm font-medium mb-2">Show Price</label>

     <div className="inline-flex items-center gap-2 border border-gray-600 

     px-3 py-2 rounded-md">

     <p className="text-gray-400 text-sm">{currency}</p>

      <input

       min={0}

       type="number"

       value={showPrice}

       onChange={(e) => setShowPrice(e.target.value)}

       placeholder="Enter show price"

       className="outline-none"

       />

      </div>

    </div>



    { /* date and time selection */ }

    <div className="mt-6">

     <label className="block text-sm font-medium mb-2">Select Date and Time</label>

     <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">

     <input

     type="datetime-local"

     value={dateTimeInput}

     onChange={(e) => setDateTimeInput(e.target.value)}

     className="outline-none rounded-md"

     />

     <button

     onClick={handleDateTimeAdd}

     className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"

      >

     Add Time

     </button>

      </div>

    </div>



   {/* display selected times */}

   {Object.keys(dateTimeSelection).length > 0 && (

   <div className="mt-6">

   <h2 className="mb-2">Selected Date-Time</h2>

   <ul className="space-y-3">

   {Object.entries(dateTimeSelection).map(([date, times]) => (

    <li key={date}>

      <div className="font-medium">{date}</div>

      <div className="flex flex-wrap gap-2 mt-1 text-sm">

        {times.map((time) => (

          <div

            key={time}

            className="border border-primary px-2 py-1 flex items-center rounded"

            >

            <span>{time}</span>

            <DeleteIcon

              onClick={() => handleRemoveTime(date, time)}

              width={15}

              className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"

            />

          </div>

          ))}

        </div>

      </li>

     ))}

   </ul>

  </div>

 )}



 <button onClick={handleSubmit} disabled={addingShow} className="bg-primary text-white px-8 py-2 mt-6 rounded

 hover:bg-primary/90 transition-all cursor-pointer ">

 Add Show</button>



    </>

) : <Loading />

}

export default AddShows;  

