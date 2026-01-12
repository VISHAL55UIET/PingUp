import express from "express";
import {
    acceptConnectionRequest,
  discoverUsers,
  followUser,
  getUserConnections,
  getUserData,
  sendConnectionRequest,
  unfollowUser,
  updateUserData,
} from "../controllers/userController.js";
import { upload } from "../configs/multer.js";
import { requireAuth } from "@clerk/express";

const userRouter = express.Router();

userRouter.get("/data", requireAuth(), getUserData);

userRouter.post(
  "/update",
  requireAuth(),
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUserData
);

userRouter.post("/discover", requireAuth(), discoverUsers);
userRouter.post("/follow", requireAuth(), followUser);
userRouter.post("/unfollow", requireAuth(), unfollowUser);
userRouter.post("/connect",requireAuth(),sendConnectionRequest);
userRouter.post("/accept",requireAuth(),acceptConnectionRequest);
userRouter.get("/connections",requireAuth(),getUserConnections);

export default userRouter;
