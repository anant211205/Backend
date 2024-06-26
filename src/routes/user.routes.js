import {Router} from "express"
import { loginUser, 
        logoutUser, 
        registerUser, 
        refereshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser, 
        updateAccountDetail, 
        updateUserAvatar, 
        updateUserCoverImage, 
        getUserChannelProfile, 
        getWatchHistory  } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const userRouter = Router()

userRouter.route("/register").post(

    //this is middle ware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage" ,
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)


//secured routes
//HERE VERIFY JWT IS MIDDLEWARE 
userRouter.route("/logout").post(verifyJWT , logoutUser)
userRouter.route("/refresh-token").post(refereshAccessToken)
userRouter.route("/change-password").post(verifyJWT , changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT , getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT , updateAccountDetail)
userRouter.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)
userRouter.route("/coverImage").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage)
userRouter.route("/c/:username").get(verifyJWT , getUserChannelProfile)
userRouter.route("/history").get(verifyJWT , getWatchHistory)

export default userRouter
