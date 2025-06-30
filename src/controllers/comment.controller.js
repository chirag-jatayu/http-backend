import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "videoId is required")
  }
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    customLabels: {
      totalDocs: "totalItems",
      docs: "comments",
      limit: "perPage",
      page: "currentPage",
    },
  };

  const aggregationPipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: 'owner',
        foreignField: '_id',
        as: "commentPostedBy"
      }
    },
    {
      $unwind: "$commentPostedBy", // <- This flattens the array to an object
    },
    {
      $project: {
        content: 1,
        video: 1,
        createdAt: 1,
        commentPostedBy: {
          _id: 1,
          fullName: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
  ]
  const result = await Comment.aggregatePaginate(
    Comment.aggregate(aggregationPipeline),
    options
  );
  console.log(result)

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));

});

const postComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  // take comment content and video id from front as json data
  // if content and video id is present then throw error
  // after that create new comment to add comment entry with the available data (owner is logged in user)

  const { content } = req.body
  const { videoId } = req.params

  if (!content || !videoId) {
    throw new ApiError(400, "comment content and videoId is required")
  }

  await Comment.create({
    content: content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: req.user?._id
  })

  return res.status(201).json(
    new ApiResponse(201, [], "comment posted successfully")
  )
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  // get the commentId from front as json data
  // if commentId not found throw error
  // find particualr comment based on commentId from Db
  // if not fount throw error
  // update the content for that comment id  
  // save the updated content 
  // send response with updated data , owner (from log in)

  const { commentId } = req.params
  const { content } = req.body
  if (!commentId) {
    throw new ApiError(400, "comment is required")
  }
  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    $set: {
      content: content
    }
  }, {
    new: true,

  })
  return res.status(200).json(new ApiResponse(200, updatedComment, 'comment updated successfully'))
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params
  if (!commentId) {
    throw new ApiError(400, "comment is required")
  }

  await Comment.findByIdAndDelete(commentId)
  return res.status(200).json(new ApiResponse(200, null, "comment deleted successfully"))
});

export { getVideoComments, postComment, updateComment, deleteComment };
