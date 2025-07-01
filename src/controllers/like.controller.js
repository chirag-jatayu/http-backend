import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });
  if (existingLike) {
    // Unsubscribe
    await Like.deleteOne({
      _id: existingLike._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Liked removed from this video"));
  } else {
    const likedVideo = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: req.user?._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, likedVideo, "You liked this video"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });
  if (existingLike) {
    // Unsubscribe
    await Like.deleteOne({
      _id: existingLike._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Liked removed from this comment"));
  } else {
    const likedComment = await Like.create({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: req.user?._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, likedComment, "You liked this comment"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }
  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });
  if (existingLike) {
    // Unsubscribe
    await Like.deleteOne({
      _id: existingLike._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Liked removed from this tweet"));
  } else {
    const likedTweet = await Like.create({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: req.user?._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, likedTweet, "You liked this tweet"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // Ensure user is logged in
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // Fetch likes where video is not null and likedBy is the logged-in user
  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $ne: null },
  }).populate({
    path: "video",
    select: "title thumbnail views owner", // Only required fields
    populate: {
      path: "owner", // Populate owner of the video if needed
      select: "username avatar",
    },
  });

  const videos = likedVideos.map((like) => like.video);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
