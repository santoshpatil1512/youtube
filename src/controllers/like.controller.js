import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!isValidObjectId(videoId)) {
        return next(new ApiError(400, "Invalid video id"));
    }

    try {
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

        if (existingLike) {
            await existingLike.deleteOne();
            res.status(200).json(new ApiResponse(200, null, "Like removed from video"));
        } else {
            const newLike = new Like({ video: videoId, likedBy: userId });
            await newLike.save();
            res.status(201).json(new ApiResponse(201, { newLike }, "Like added to video"));
        }
    } catch (error) {
        next(error);
    }
});

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!isValidObjectId(commentId)) {
        return next(new ApiError(400, "Invalid comment id"));
    }

    try {
        const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

        if (existingLike) {
            await existingLike.deleteOne();
            res.status(200).json(new ApiResponse(200, null, "Like removed from comment"));
        } else {
            const newLike = new Like({ comment: commentId, likedBy: userId });
            await newLike.save();
            res.status(201).json(new ApiResponse(201, { newLike }, "Like added to comment"));
        }
    } catch (error) {
        next(error);
    }
});

// Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!isValidObjectId(tweetId)) {
        return next(new ApiError(400, "Invalid tweet id"));
    }

    try {
        const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

        if (existingLike) {
            await existingLike.deleteOne();
            res.status(200).json(new ApiResponse(200, null, "Like removed from tweet"));
        } else {
            const newLike = new Like({ tweet: tweetId, likedBy: userId });
            await newLike.save();
            res.status(201).json(new ApiResponse(201, { newLike }, "Like added to tweet"));
        }
    } catch (error) {
        next(error);
    }
});

// Get all liked videos
const getLikedVideos = asyncHandler(async (req, res, next) => {
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    try {
        const likes = await Like.find({ likedBy: userId, video: { $exists: true } }).populate('video');
        const likedVideos = likes.map(like => like.video);

        res.status(200).json(new ApiResponse(200, { likedVideos }, "Liked videos fetched successfully"));
    } catch (error) {
        next(error);
    }
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
