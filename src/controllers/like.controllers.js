import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req , res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const alreadyLiked = await Like.findOneAndUpdate({
        $set:{
            video : videoId ,
            likedBy : req.user?._id
        },
    })

    if(alreadyLiked){
        const remove = await Like.findByIdAndDelete(
            alreadyLiked._id
        )

        if(!remove){
            throw new ApiError(500 , "Problem in removing like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 ,
                {},
                "Like removed successfully"
            )
        )

    }

    const addLike = Like.create({
        video : videoId ,
        likedBy : req.user?._id
    })

    if(!addLike){
        throw new ApiError(500 , "Problem in adding a like on video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            addLike ,
            "Like added to the video"
        )
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Invalid comment id")
    }

    const alreadyLiked = await Like.findOneAndUpdate({
        $set:{
            comment : commentId ,
            likedBy : req.user?._id
        },
    })

    if(alreadyLiked){
        const remove = await Like.findByIdAndDelete(
            alreadyLiked._id
        )

        if(!remove){
            throw new ApiError(500 , "Problem in removing like from comment")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 ,
                {},
                "Like removed successfully from comment"
            )
        )

    }

    const addLike = Like.create({
        comment : commentId ,
        likedBy : req.user?._id
    })

    if(!addLike){
        throw new ApiError(500 , "Problem in adding a like on comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            addLike ,
            "Like added to the comment"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400 , "Invalid tweet id")
    }

    const alreadyLiked = await Like.findOneAndUpdate({
        $set:{
            tweet : tweetId ,
            likedBy : req.user?._id
        },
    })

    if(alreadyLiked){
        const remove = await Like.findByIdAndDelete(
            alreadyLiked._id
        )

        if(!remove){
            throw new ApiError(500 , "Problem in removing like from tweet")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 ,
                {},
                "Like removed successfully"
            )
        )

    }

    const addLike = Like.create({
        tweet : tweetId ,
        likedBy : req.user?._id
    })

    if(!addLike){
        throw new ApiError(500 , "Problem in adding a like on tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            addLike ,
            "Like added to the tweet"
        )
    )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.find({
        likedBy : req.user?._id ,
    });

    if (likedVideos.length === 0) {
        throw new ApiError(400, "No liked videos for this user");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            likedVideos,
            "All liked videos"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}