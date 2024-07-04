import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, 
        toggleCommentLike, 
        toggleTweetLike, 
        toggleVideoLike 
} from "../controllers/like.controllers.js";



const likeRoute = Router() ;
likeRoute.use(verifyJWT);

likeRoute.route("/toggle/v/:videoId").post(toggleVideoLike)
likeRoute.route("/toggle/c/:commentId").post(toggleCommentLike)
likeRoute.route("/toggle/t/:tweetId").post(toggleTweetLike)
likeRoute.route("/videos").get(getLikedVideos)

export default likeRoute
