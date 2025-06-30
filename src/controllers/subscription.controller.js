import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required");
  }

  // Check if subscription exists
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe
    await Subscription.deleteOne({
      _id: existingSubscription._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed from the channel"));
  } else {
    // Subscribe
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, null, "Subscribed to the channel"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate channelId
  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Valid channel ID is required");
  }

  // Find subscriptions for the channel and populate subscriber details
  const subscribers = await Subscription.find({
    channel: new mongoose.Types.ObjectId(channelId),
  }).populate("subscriber", "fullName username avatar");

  // Count
  const subscriberCount = subscribers.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channelId,
        subscriberCount,
        subscribers, // This is an array of user objects (who subscribed)
      },
      "Subscribers list fetched successfully"
    )
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "subscriber id is required");
  }
  const subscribedTo = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(subscriberId),
  }).populate("channel", "fullName username avatar");
  const subscribedToCount = subscribedTo.length;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscriberId,
        subscribedToCount,
        subscribedTo, // This is an array of user objects (who subscribed)
      },
      "Channels list fetched successfully"
    )
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
