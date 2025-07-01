import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "tweet content is required");
  }
  await Tweet.create({
    content,
    owner: req.user?._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, [], "tweet posted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const result = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "tweetPostedBy",
      },
    },
    {
      $unwind: "$tweetPostedBy",
    },
    {
      $project: {
        content: 1,
        tweetPostedBy: {
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId || !content) {
    throw new ApiError(400, "Tweet ID and content are required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID format");
  }

  const existingTweet = await Tweet.findById(tweetId).select("-owner");
  if (!existingTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (existingTweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  existingTweet.content = content;
  await existingTweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, existingTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID format");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }
  await tweet.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, [], "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
