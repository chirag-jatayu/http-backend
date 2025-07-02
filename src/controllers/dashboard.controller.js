import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const totalVideos = await Video.aggregate([
    {
      $match: { owner: req.user._id },
    },
  ]);

  const totalChannelViews = totalVideos.reduce(
    (acc, video) => acc + video.views,
    0
  );

  const totalLikesArray = await Promise.all(
    totalVideos.map((video) => Like.countDocuments({ video: video._id }))
  );
  const totalChannelLikes = totalLikesArray.reduce(
    (sum, count) => sum + count,
    0
  );

  const totalChannelSubscribers = await Subscription.countDocuments({
    channel: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalChannelVideos: totalVideos.length,
        totalChannelViews,
        totalChannelSubscribers,
        totalChannelLikes,
      },
      "Dashboard data fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }
  const videos = await Video.aggregate([
    {
      $match: { owner: req.user?._id },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
