import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, query = {}, sortBy = 'createdAt', sortType = 'asc', userId } = req.query;

    // Validate userId and add it to the query if valid
    if (userId && isValidObjectId(userId)) {
        query.userId = mongoose.Types.ObjectId(userId);
    }

    // Build the aggregation pipeline
    const pipeline = [
        { $match: query },
        { $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 } }
    ];

    // Options for pagination
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            docs: 'videos',
            totalDocs: 'totalVideos',
            limit: 'perPage',
            page: 'currentPage',
            nextPage: 'nextPage',
            prevPage: 'prevPage',
            totalPages: 'totalPages',
            pagingCounter: 'pagingCounter',
            meta: 'paginator'
        }
    };

    // Perform the aggregation and pagination
    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    if (!videos) {
        return next(new ApiError(400, "No videos found"));
    }

    res.status(200).json(new ApiResponse(200, { videos: videos.videos }, "Videos are fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if([title,description].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
    const videoLocalPath = req.files?.videoFile[0].path
    const thumbnailLocalPath = req.files?.thumbnail[0].path
    if(!videoLocalPath &&  !thumbnailLocalPath){
        throw new ApiError(400,"All fields are required")
    }
    const video = await uploadOnCloudinary(videoLocalPath)
    if(!video){
        throw new ApiError(500,"There was an error uploading video")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)  
    if(!thumbnail){1            
        throw new ApiError(500,"There was an error uploading thumbnail")
    }

    const videoFile = await Video.create({
        videoFile:video.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:video.duration,
        owner:req.user._id
    })

    res
    .status(201)
    .json(new ApiResponse(201,{video:videoFile},"Video is published successfully"))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    res
    .status(200)
    .json(new ApiResponse(200,{video},"Video is fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        return next(new ApiError(400, "Invalid video id"));
    }

    // Find the video by ID
    const video = await Video.findById(videoId);
    if (!video) {
        return next(new ApiError(404, "Video not found"));
    }

    // Validate thumbnail
    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        return next(new ApiError(400, "Thumbnail is required"));
    }

    // Validate title and description
    const { title, description } = req.body;
    if (!title || !description || title.trim() === "" || description.trim() === "") {
        return next(new ApiError(400, "All fields are required i.e. title and description"));
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        return next(new ApiError(500, "There was an error uploading the thumbnail"));
    }

    // Update the video details
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, { video: updatedVideo }, "Video details are updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    await Video.findByIdAndDelete(videoId)
    
    res
    .status(200)
    .json(new ApiResponse(200,{},"Video is deleted successfully"))  
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    const publishedflag = video.isPublished
    await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                isPublished:!publishedflag
            }
        },
        {new:true}
    )

    publishedflag? false:true
    res
    .status(200)
    .json(new ApiResponse(200,{publishedflag},"Video publish status is toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}