import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "name and description of playlist are required");
  }

  await Playlist.create({
    name,
    description,
    owner: req.user?.id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, [], "playlist is successfully created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(
      400,
      "userId is required to fetch the corresponding user playlist"
    );
  }
  const userPlaylist = await Playlist.find({ owner: userId })
    .populate({
      path: "videos",
      populate: {
        path: "owner",
        select: "fullName username avatar",
      },
    })
    .populate({
      path: "owner", // ✅ this will populate the playlist's owner
      select: "fullName username avatar",
    });

  if (!userPlaylist.length) {
    throw new ApiError(400, "playlist not found for the given user");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "user playlist fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  const playlist = await Playlist.findById(playlistId).populate({
    path: "videos",
    populate: {
      path: "owner",
      select: "fullName username avatar",
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched succesfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "playlistId and videoId is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }
  playlist.videos.push(new mongoose.Types.ObjectId(videoId));
  await playlist.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, [], "video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "playlistId and videoId are required");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Correct comparison using .equals()
  const matchedVideoIndex = playlist.videos.findIndex((video) =>
    video.equals(videoId)
  );

  if (matchedVideoIndex === -1) {
    throw new ApiError(404, "Video not found in playlist");
  }

  // Remove the video from array
  playlist.videos.splice(matchedVideoIndex, 1);

  await playlist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist.videos,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  await Playlist.findByIdAndDelete(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, [], "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  if (!name || !description) {
    throw new ApiError(400, "name and description of playlist are required");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  ).populate({
    path: "videos",
    populate: {
      path: "owner",
      select: "fullName username avatar",
    },
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
