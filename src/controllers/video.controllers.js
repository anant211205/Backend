import mongoose, { isValidObjectId } from "mongoose";
import {Video} from "../models/video.model.js" ;
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description){
        throw new ApiError("Title and description both are required !")
    }
    
    const videolocalpath = req.files?.videoFile[0]?.path;
    const thumbnaillocalpath = req.files?.thumbnail[0]?.path;
    
    // console.log(videolocalpath);

    if(!videolocalpath){
        throw new ApiError(404,"Video is required!!!")
    }
    if(!thumbnaillocalpath){
        throw new ApiError(404,"Thumbnail is required!!!")
    }
    
    const video = await uploadOnCloudinary(videolocalpath);
    const thumbnail = await uploadOnCloudinary(thumbnaillocalpath);

    if(!thumbnail?.url){
        throw new ApiError(500,"Something wrong happens while uplaoding the thumbnail")
    }

    // console.log(thumbnail.url);
    // console.log(video.url);

    if(!video?.url){
        throw new ApiError(500,"Something wrong happens while uplaoding the video")
    }
    
    const newVideo = await Video.create({
        videoFile:video?.url,
        thumbnail:thumbnail?.url,
        title,
        description,
        duration:video?.duration,
        isPublished:true,
        owner:req.user?._id
    })


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newVideo,
            "Video Published Successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId){
        throw new ApiError(400 , "Invalid videoId")
    }

    const video = await Video.findById(videoId) 

    if(!video || (!video?.isPublished && !String(video.owner) !== String(req.user?._id))){
        throw new ApiError(400 , "Video not found !!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video ,
            "your video fetched Successfully"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail

    const { videoId } = req.params
    const {title , description , thumbnail} = req.body
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid video id")
    }

    if(!title && !description && !thumbnail){
        throw new ApiError(400 , "At least one entry must be provided to update")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title, 
                description ,
                thumbnail : thumbnail?.url,
            }
        },
        {
            new : true
        }
    )

    if(!video){
        throw new ApiError(400 , "something went wrong during updation")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            video,
            "your video details updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid Id")
    }

    const video = await Video.findByIdAndDelete(
        {
            _id : videoId
        }
    )

    if(!video){
        throw new ApiError(400 , "Something went wrong while deleting the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video deleted successfully"
        )
    )
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404 , "video not found")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId ,
        {
            $set: {
                isPublished : !video.isPublished 
            }
        },
        {
            new : true 
        }
    )

    if(!updatedVideo){
        throw new ApiError(400 , "Problem in unpublishing video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            updatedVideo,
            "video unpublished successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}