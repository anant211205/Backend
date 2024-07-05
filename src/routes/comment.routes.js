import { Router } from "express";
import { addComment, 
        deleteComment, 
        getVideoComments, 
        updateComment 
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRoute = Router() ;

commentRoute.use(verifyJWT) ;

commentRoute.route("/:videoId").get(getVideoComments).post(addComment);
commentRoute.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default commentRoute