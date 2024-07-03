import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if(!content || content.length === ""){
        throw new ApiError(400 , "content is required to publish tweet")
    }

    const user = req.user?._id

    const tweet = await Tweet.create({
        content ,
        owner : user
    })
    
    // console.log("content" , content)
    
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            tweet ,
            "Tweet published successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params 

    if(!isValidObjectId(userId)){
        throw new ApiError(404 , "User not found !!")
    }

    const userTweet = await Tweet.find({
        owner : userId
    });

    // console.log(userTweet);
    // console.log(userId);
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            userTweet ,
            "here are user tweets"
        )
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params ;
    const {content} = req.body;

    if(!content || content.length === ""){
        throw new ApiError(401 , "error !!! first add tweet")
    }

    const updateRecentTweet = await Tweet.findByIdAndUpdate(
        tweetId ,
        {
            $set : {
                content
            }
        },
        {
            new : true
        }
    )


    if(!updateRecentTweet){
        throw new ApiError(400 , "not able to update your tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            updateRecentTweet ,
            "tweet updated successfully !"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params
    
    if(!tweetId){
        throw new ApiError(400 , "No such tweet id exists")
    }

    await Tweet.deleteOne(
        {
            _id : tweetId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            {} ,
            "tweet deleted successfully !! "
        )
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}