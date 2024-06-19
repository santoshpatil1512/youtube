import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return next(new ApiError(400, "Invalid video id"));
    }

    try {
        const aggregateQuery = Comment.aggregate([
            { $match: { video: new mongoose.Types.ObjectId(videoId) } },
            { $sort: { createdAt: -1 } }
        ]);

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            customLabels: {
                docs: "comments"
            }
        };

        const comments = await Comment.aggregatePaginate(aggregateQuery, options);

        res.status(200).json(new ApiResponse(200, { comments }, "Comments are fetched successfully"));
    } catch (error) {
        next(error);
    }
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return next(new ApiError(400, "Invalid video id"));
    }

    try {
        const newComment = new Comment({
            content,
            video: videoId,
            owner: userId
        });

        await newComment.save();

        res.status(201).json(new ApiResponse(201, { newComment }, "Comment added successfully"));
    } catch (error) {
        next(error);
    }
});

// Update a comment
const updateComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return next(new ApiError(400, "Invalid comment id"));
    }

    try {
        const comment = await Comment.findOne({ _id: commentId, owner: userId });

        if (!comment) {
            return next(new ApiError(404, "Comment not found or you are not the owner"));
        }

        comment.content = content;
        await comment.save();

        res.status(200).json(new ApiResponse(200, { comment }, "Comment updated successfully"));
    } catch (error) {
        next(error);
    }
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return next(new ApiError(400, "Invalid comment id"));
    }

    try {
        const comment = await Comment.findOne({ _id: commentId, owner: userId });

        if (!comment) {
            return next(new ApiError(404, "Comment not found or you are not the owner"));
        }

        await Comment.deleteOne({ _id: commentId });

        res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
    } catch (error) {
        next(error);
    }
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
};
