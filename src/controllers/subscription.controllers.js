import mongoose, { isValidObjectId } from "mongoose";
import {User} from "../models/user.model.js" ;
import {Subscription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js" ;
import e from "express";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    // Check if the user is already subscribed
    const subscribedChannel = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    });

    if (subscribedChannel) {
        const deleteSubscribed = await Subscription.findOneAndDelete({
            subscriber: req.user._id,
            channel: channelId
        });

        if (!deleteSubscribed) {
            throw new ApiError(400, "Can't unsubscribe, something went wrong");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {}, 
                "Channel unsubscribed successfully")
        );
    } else {

        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: req.user?._id
        });

        if (!newSubscription) {
            throw new ApiError(400, "Unable to subscribe to the channel");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, 
                newSubscription, 
                "Channel subscribed successfully")
        );
    }
})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if(!isValidObjectId(subscriberId)){
        new ApiError(400 , "Invalid id")
    }

    try {
        const subscriber = await Subscription.aggregate([
            {
                $match : {
                    channel :new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "subscriber",
                    foreignField : "_id",
                    as : "subscribers"
                }
            },
            {
                $project : {
                    _id : 1,
                    // subscribers : 1
                }
            }
        ])
    
        if(!subscriber){
            throw new ApiError(404 , "No subscriber found")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200 , 
                subscriber , 
                "Subscriber list"
            )
        )
    } catch (error) {
        throw new ApiError(500 , "Internal server error" , error)
    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400 , "Invalid id")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "subscribedChannels"
            }
        },
        {
            $project : {
                _id : 1,
            }
        }
    ])

    if(!subscribedChannels){
        throw new ApiError(404 , "No subscribed channels found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , 
            subscribedChannels,
            "Subscribed channels"
        )
    )


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}