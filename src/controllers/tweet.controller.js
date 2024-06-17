import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    if(!isValidObjectId(req.user._id)){
        throw new ApiError(400,"Invalid user id")
    }
    
    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(404,"User not found")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id

    })

    res
    .status(200)
    .json(new ApiResponse(200,{tweet},"Tweet is created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const tweets = await Tweet.find({owner:userId})
    res
    .status(200)
    .json(new ApiResponse(200,{tweets},"Tweets are fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"Tweet id is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    const {content} = req.body

    await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    res
    .status(200)
    .json( new ApiResponse(200,{},"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"Tweet id is required")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    await Tweet.findByIdAndDelete(tweetId)
    res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}