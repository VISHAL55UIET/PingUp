import React from "react";
import {
  MapPin,
  MessageCircle,
  Plus,
  UserPlus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";

const UserCard = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isSelf = currentUser?._id === user._id;
  const isFollowing = currentUser?.following?.includes(user._id);
  const isConnected = currentUser?.connections?.includes(user._id);

  const handleFollow = async () => {
    if (isSelf || isFollowing) return;

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to follow user"
      );
    }
  };

  const handleConnectionRequest = async () => {
    if (isSelf) return;

    if (isConnected) {
      return navigate(`/messages/${user._id}`);
    }

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Connection failed"
      );
    }
  };

  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md bg-white">
      {/* User Info */}
      <div className="text-center">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="rounded-full w-16 h-16 shadow-md mx-auto object-cover"
        />

        <p className="font-medium mt-2">{user.full_name}</p>

        {user.username && (
          <p className="text-gray-500 font-light">@{user.username}</p>
        )}

        {user.bio && (
          <p className="text-gray-600 mt-2 text-sm px-4 line-clamp-3">
            {user.bio}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        {user.location && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
            <MapPin className="w-4 h-4" />
            {user.location}
          </div>
        )}

        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <span>{user.followers?.length || 0}</span> Followers
        </div>
      </div>

      {/* Actions */}
      <div className="flex mt-4 gap-2">
        <button
          onClick={handleFollow}
          disabled={isSelf || isFollowing}
          className={`w-full py-2 rounded-md flex justify-center items-center gap-2 transition
            ${
              isFollowing
                ? "bg-slate-200 text-slate-600 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white active:scale-95"
            }`}
        >
          <UserPlus className="w-4 h-4" />
          {isFollowing ? "Following" : "Follow"}
        </button>

        <button
          onClick={handleConnectionRequest}
          disabled={isSelf}
          className="flex items-center justify-center w-16 border text-slate-500 rounded-md active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          {isConnected ? (
            <MessageCircle className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
