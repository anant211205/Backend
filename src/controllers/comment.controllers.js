import mongoose, { isValidObjectId } from "mongoose";
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
    const {commentId} = req.params ;
    const {content} = req.body ;

    if(!commentId){
        throw new ApiError(400 , "Invalid comment Id")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(404 , "content required")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404 , "comment not found")
    }

    if (String(comment.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId ,
        {
            $set: {
                content: content
            }
        },
        {
            new : true 
        }
    )

    if(!updatedComment){
        throw new ApiError(400 , "error while updating comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "comment updated successfully"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Invaliid comment id")
    }

    const comment = await Comment.findById(
        commentId 
    )

    if(!comment) {
        throw new ApiError("comment not found")
    }
    
    const videoId = comment.video

    const video = await Video.findById(videoId)

    if(!video){
        await Comment.deleteMany(
            {
                video : videoId
            }
        )

        throw new ApiError(400 , "no such video found all comments associated are deleted")
    }

    if(String(comment.owner) !== String(req.user?._id) && String(video.owner) !== String(req.user?._id)){
        throw new ApiError(403 , "You sre not authorised to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            {} ,
            "comment deleted successfully"
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}