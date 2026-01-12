import UserModel from "../models/User.js";
import fs from "fs";
import imageKit from "../configs/imageKit.js";
import Connection from "../models/Connections.js";
// ❌ REMOVED TYPO IMPORT: import { use } from "react";

export const getUserData = async (req, res) => {
  console.log("🔥 HIT getUserData");
  try {
    const { userId } = req.auth(); // ❌ removed await
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await
    let { username, bio, location, full_name } = req.body;

    const tempuser = await UserModel.findById(userId);

    if (!username) username = tempuser.username;

    if (tempuser.username !== username) {
      const user = await UserModel.findOne({ username });
      if (user) {
        username = tempuser.username;
      }
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    const profile = req.files?.profile && req.files.profile[0];
    const cover = req.files?.cover && req.files.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imageKit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      const url = imageKit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });

      updatedData.profile_picture = url; // ❌ fixed casing
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imageKit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      const url = imageKit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });

      updatedData.cover_photo = url;
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    );

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await
    const { input } = req.body;

    const allUsers = await UserModel.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter(
      (user) => user._id.toString() !== userId
    );

    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await
    const { id } = req.body;

    const user = await UserModel.findById(userId);

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    user.following.push(id);
    await user.save();

    const toUser = await UserModel.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    res.json({ success: true, message: "User followed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await
    const { id } = req.body;

    const user = await UserModel.findById(userId);
    user.following = user.following.filter(
      (u) => u.toString() !== id
    );
    await user.save();

    const toUser = await UserModel.findById(id);
    toUser.followers = toUser.followers.filter(
      (u) => u.toString() !== userId
    );
    await toUser.save();

    res.json({
      success: true,
      message: "User no longer following this user",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await
    const { id } = req.body;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionsRequest = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours },
    });

    if (connectionsRequest.length >= 20) {
      return res.json({
        success: false,
        message:
          "You have reached the limit of connection requests in the last 24 hours",
      });
    }

    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id }, // ❌ fixed typo
        { from_user_id: id, to_user_id: userId }, // ❌ fixed typo
      ],
    });

    if (!connection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      return res.json({
        success: true,
        message: "Connection request sent successfully",
      });
    } else if (connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }

    return res.json({
      success: false,
      message: "Connection request pending",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await

    const user = await UserModel.findById(userId).populate(
      "connections followers following" // ❌ fixed string
    );

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = (
      await Connection.find({
        to_user_id: userId,
        status: "pending",
      }).populate("from_user_id")
    ).map((connection) => connection.from_user_id);

    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth(); // ❌ removed await
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({
        success: false,
        message: "No connection request found",
      });
    }

    const user = await UserModel.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await UserModel.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({
      success: true,
      message: "Connection request accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
