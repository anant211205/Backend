import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const {userId} = req.user?._id ;

    const totalVideos = await Video.countDocuments(
        {
            user: userId
        }
    )

    const totalViewsRes = await Video.aggregate([
        {
            $match : {
                user : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group : {
                _id : null,
                totalViews : {
                    $sum : "$views"
                }
            }
        }
    ])

    const totalViews = totalViewsRes.length > 0 ? totalViewsRes[0].totalViews : 0 ;

    const totalLikes = await Like.countDocuments(
        {
            likedBy : userId
        }
    )

    const totalSubscribers = await Subscription
        .countDocuments(
            {
                channel : userId
            }
        )

    return res  
        .status(200)
        .json(
            new ApiResponse(200, 
                {
                    totalVideos,
                    totalViews,
                    totalLikes,
                    totalSubscribers
                },
                "Channel stats fetched successfully"
            )
        )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {userId} = req.user?._id 

    const videos = await Video.find({userId})

    if(!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, 
                videos ,
                "Videos found successfully"
            )
        )

})

export {
    getChannelStats, 
    getChannelVideos
}