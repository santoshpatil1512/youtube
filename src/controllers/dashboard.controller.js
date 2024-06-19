import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes, etc.
const getChannelStats = asyncHandler(async (req, res, next) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        return next(new ApiError(400, "Invalid channel id"));
    }

    try {
        // Total videos
        const totalVideos = await Video.countDocuments({ owner: channelId });

        // Total subscribers
        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

        // Total likes across all videos
        const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).distinct('_id') } });

        // Total views across all videos
        const totalViewsResult = await Video.aggregate([
            { $match: { owner:channelId} },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;


        res.status(200).json(new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalLikes,
            totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0
        }, "Channel stats fetched successfully"));
    } catch (error) {
        next(error);
    }
});

// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res, next) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        return next(new ApiError(400, "Invalid channel id"));
    }

    try {
        const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(200, { videos }, "Channel videos fetched successfully"));
    } catch (error) {
        next(error);
    }
});

export {
    getChannelStats,
    getChannelVideos
};
