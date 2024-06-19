import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a playlist
const createPlaylist = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    try {
        const newPlaylist = new Playlist({
            name,
            description,
            owner: userId
        });

        await newPlaylist.save();

        res.status(201).json(new ApiResponse(201, { newPlaylist }, "Playlist created successfully"));
    } catch (error) {
        next(error);
    }
});

// Get user playlists
const getUserPlaylists = asyncHandler(async (req, res, next) => {
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    try {
        const playlists = await Playlist.find({ owner: userId });

        res.status(200).json(new ApiResponse(200, { playlists }, "User playlists fetched successfully"));
    } catch (error) {
        next(error);
    }
});

// Get playlist by id
const getPlaylistById = asyncHandler(async (req, res, next) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        return next(new ApiError(400, "Invalid playlist id"));
    }

    try {
        const playlist = await Playlist.findById(playlistId).populate('videos');

        if (!playlist) {
            return next(new ApiError(404, "Playlist not found"));
        }

        res.status(200).json(new ApiResponse(200, { playlist }, "Playlist fetched successfully"));
    } catch (error) {
        next(error);
    }
});

// Add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return next(new ApiError(400, "Invalid playlist or video id"));
    }

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return next(new ApiError(404, "Playlist not found"));
        }

        if (playlist.videos.includes(videoId)) {
            return next(new ApiError(400, "Video already in playlist"));
        }

        playlist.videos.push(videoId);
        await playlist.save();

        res.status(200).json(new ApiResponse(200, { playlist }, "Video added to playlist successfully"));
    } catch (error) {
        next(error);
    }
});

// Remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return next(new ApiError(400, "Invalid playlist or video id"));
    }

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return next(new ApiError(404, "Playlist not found"));
        }

        playlist.videos.pull(videoId);
        await playlist.save();

        res.status(200).json(new ApiResponse(200, { playlist }, "Video removed from playlist successfully"));
    } catch (error) {
        next(error);
    }
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res, next) => {
    const { playlistId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!isValidObjectId(playlistId)) {
        return next(new ApiError(400, "Invalid playlist id"));
    }

    try {
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

        if (!playlist) {
            return next(new ApiError(404, "Playlist not found or you are not the owner"));
        }

        await Playlist.deleteOne({ _id: playlistId });

        res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
    } catch (error) {
        next(error);
    }
});

// Update a playlist
const updatePlaylist = asyncHandler(async (req, res, next) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and userId is available in req.user

    if (!isValidObjectId(playlistId)) {
        return next(new ApiError(400, "Invalid playlist id"));
    }

    try {
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

        if (!playlist) {
            return next(new ApiError(404, "Playlist not found or you are not the owner"));
        }

        playlist.name = name || playlist.name;
        playlist.description = description || playlist.description;

        await playlist.save();

        res.status(200).json(new ApiResponse(200, { playlist }, "Playlist updated successfully"));
    } catch (error) {
        next(error);
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
