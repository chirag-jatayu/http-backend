import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
const router = Router();
router.use(verifyJWT); // Apply JWT verification middleware to all routes

router.route("/").get(getAllVideos);
router.route("/publish-video").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),

  publishAVideo
);
router.route("/:videoId").get(getVideoById);
router.route("/delete-video/:videoId").delete(deleteVideo);
router.route("/update-video").patch(upload.single("thumbnail"), updateVideo);
router.route("/toggle-publish/:videoId").patch(togglePublishStatus);
export default router;
