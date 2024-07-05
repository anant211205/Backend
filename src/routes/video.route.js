import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const videoRoute = Router() ;
videoRoute.use(verifyJWT);

videoRoute
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name : "videoFile" ,
                maxCount : 1
            },
            {
                name : "thumbnail",
                maxCount : 1,
            },
        ]),
        publishAVideo
    );

videoRoute
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail") , updateVideo) ;

videoRoute.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default videoRoute