import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


//use() is used for middleware and configurations
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes
import userRouter from "./routes/user.routes.js"
import tweetRoute from "./routes/tweet.routes.js";
import likeRoute from "./routes/like.routes.js"
import videoRoute from "./routes/video.route.js"
import commentRoute from "./routes/comment.routes.js"

//routes declaration
app.use("/api/v1/users" , userRouter)
app.use("/api/v1/tweets" , tweetRoute)
app.use("/api/v1/likes" , likeRoute)
app.use("/api/v1/videos" , videoRoute)
app.use("/api/v1/comments" , commentRoute)


//https://localhost:8000/api/v1/users/register
export { app }
