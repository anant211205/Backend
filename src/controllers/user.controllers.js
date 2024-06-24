import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
 

const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        user.refereshToken = refereshToken
        await user.save({ validateBeforeSave : false })

        return {accessToken , refereshToken}

    } catch (error) {
        throw new ApiError(500 , "Something went wrong ehile generating tokens")
    }
}


const registerUser = asyncHandler(async (req , res) => {
    //get user detail from frontend
    //validation - not empty
    //check if user already exist : username , email
    //check  for images , check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response 

    const {fullname , email , username,  password} = req.body
    console.log("email :" , email) ;

    //validation
    if(
        [fullname , email , username , password].some((field) => (
            field?.trim() === ""
        ))
    ){
        throw new ApiError(400 , "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409 , "User with email or username existed")
    }


    //checking for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path ;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    

    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log(coverImageLocalPath)
    // console.log("req files" ,req.files)

    //check for avatar
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required")
    }

    
    //uploading this to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log(avatar)

    //final check for avatar
    if(!avatar){
        throw new ApiError(400 , "Avatar file is required")
    }

    //create user entry in db
    const user = await User.create({
        fullname, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "" ,
        email ,
        password ,
        username : username.toLowerCase()
    })

    // console.log(user);
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )

})

//login logic

    //email and username collection req.body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token 
    //send cookie
    //response successfully login

    const loginUser = asyncHandler(async (req , res) => {

        const {email , username , password} = req.body 
        
        // checking if you want user to login with un or email
        if(!username && !email){
            throw new ApiError(400 , "username or email is required")
        }

        //find user in database
        const user = await User.findOne({
            $or :[{username} , {email}] 
        })

        //check for user
        if(!user){
            throw new ApiError(404 , "User does not exit") 
        }

        //check password 
        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(401 , "Invalid user credentials")
        }

        //generated accesstoken and refresh tokens
        const {accessToken , refereshToken} = await 
        generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

        

        //send cookies
        const options = {
            httpOnly : true ,
            secure : true ,
        }

        return res
        .status(200)
        .cookie("accessToken" , accessToken ,options)
        .cookie("refreshToken" , refereshToken , options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser,accessToken,
                    refereshToken
                },
                "User logged in successfully"
            )
        )




})


// logout logic
const logoutUser = asyncHandler(async(req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refereshToken: undefined
            }
        },
        {
            new : true
        }
    )


    const options = {
        httpOnly: true ,
        secure : true 
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User Logged out successfully"))

})


const refereshAccessToken = asyncHandler(async (req , res) => {
    const incomingRefreshToken = req.cookies
    .refereshToken || req.body.refereshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401 , "Invalid refresh Token")
        }
    
    
        if(incomingRefreshToken != user?.refereshToken){
            throw new ApiError(401 , "refresh token is expired or not")
        }
    
        const options = {
            httpOnly : true ,
            secure : true 
        }
    
        const {accessToken , newRefereshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken , options )
        .cookie("refreshToken" , newRefereshToken , options)
        .json(
            new ApiResponse(
                200 ,
                {
                    accessToken,
                    refereshToken : newRefereshToken ,
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || 
            "Invalid refresh token"
        )
    }

})


const changeCurrentPassword = asyncHandler(async (req , res) => {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invalid old Password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(new ApiResponse(200 , {} , "Password changed successfullt"))

})

const getCurrentUser = asyncHandler(async (req , res) => {
    return res
    .status(200)
    .json(200 , req.user , "Current user fetched successfully")
})


const updateAccountDetail = asyncHandler(async (req , res) => {
    const {fullname , email} = req.body

    if(!fullname || !email){
        throw new ApiError(400 , "All fields are required")
    }


    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname ,
                email : email 
            }
        },
        {new: true}
    )
    .select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated successfully"))

})


const updateUserAvatar = asyncHandler(async (req , res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400 , "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new  : true
        }
    )
    .select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200 , user, "avatar image updated successfully" )
    )

})


const updateUserCoverImage = asyncHandler(async (req , res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400 , "cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400 , "Error while uploading on cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new  : true
        }
    )
    .select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200 , user, "Cover image updated successfully" )
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword ,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage
}