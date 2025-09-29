import  express from 'express';
import { addShow, getNowPlayingMovies, getShow, getShows } from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';


const showRouter = express.Router();

showRouter.get('/now-playing',protectAdmin, getNowPlayingMovies); // protectAdmin should be excluded as everyone could search movie
showRouter.post('/add',protectAdmin, addShow); // this will be used as the below one is for testing
//showRouter.post('/add', addShow); // we've removed middleware for testing from above this one is for testing 

showRouter.get('/all', getShows);
showRouter.get('/:movieId', getShow);


export default showRouter;