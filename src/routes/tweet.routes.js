import { Router } from "express";
import { createTweet, 
        deleteTweet, 
        getUserTweets, 
        updateTweet 
} from "../controllers/tweet.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRoute = Router() ;

tweetRoute.use(verifyJWT);

tweetRoute.route("/").post(createTweet);
tweetRoute.route("/user/:userId").get(getUserTweets) ;
tweetRoute.route("/:tweetId").patch(updateTweet).delete(deleteTweet)

export default tweetRoute;