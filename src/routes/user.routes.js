import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/get-user").get(verifyJWT, getCurrentUser)
router.route("/update-user").post(verifyJWT, updateAccountDetails)
router.route("/update-avatar").post(verifyJWT, upload.fields([{ name: 'avatar', maxCount: 1 }]), updateUserAvatar)
router.route("/update-coverImage").post(verifyJWT, upload.fields({ name: 'coverImage', maxCount: 1 }), updateUserCoverImage)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

export default router;
