import {Router} from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js"
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

export default userRouter
