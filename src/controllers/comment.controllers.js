import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params
    const { content } = req.body 

    if(!videoId){
        throw new ApiError(400 , "video id not found")
    }

    console.log(content)

    if(!content || content.trim() === ""){
        throw new ApiError(400 , "Content is required")
    }

    const video = await Video.findById(videoId)

    if(!video || (String(video.owner) !== String(req.user?._id) && !video.isPublished)){
        throw new ApiError(400 , "No such video found")
    }

    const comment = await Comment.create({
        content,
        video : videoId, 
        owner : req.user?._id
    })

    console.log(comment);

    if(!comment){
        throw new ApiError(400 , "error while commenting")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            comment ,
            "Comment published successfully"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}