import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/user/userSlice";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const ProfileModel = ({ setShowEdit }) => {
  const dispatch = useDispatch(); // ✅ correct
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);

  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      const {
        full_name,
        username,
        bio,
        location,
        profile_picture,
        cover_photo,
      } = editForm;

      userData.append("username", username);
      userData.append("bio", bio);
      userData.append("location", location);
      userData.append("full_name", full_name);
      profile_picture && userData.append("profile", profile_picture);
      cover_photo && userData.append("cover", cover_photo);

      const token = await getToken();

      dispatch(updateUser({ userData, token })); // ✅ FIXED

      setShowEdit(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[110] h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <form
            className="space-y-4"
            onSubmit={(e) =>
              toast.promise(handleSaveProfile(e), {
                loading: "Saving...",
              })
            }
          >
            {/* Profile Picture */}
            <div className="flex flex-col items-start gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>

              <input
                hidden
                type="file"
                accept="image/*"
                id="profile_picture"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    profile_picture: e.target.files[0],
                  })
                }
              />

              <div className="group/profile relative mt-2">
                <img
                  src={
                    editForm.profile_picture
                      ? URL.createObjectURL(editForm.profile_picture)
                      : user.profile_picture
                  }
                  alt=""
                  className="w-24 h-24 rounded-full object-cover cursor-pointer"
                />

                <div
                  onClick={() =>
                    document.getElementById("profile_picture").click()
                  }
                  className="absolute hidden group-hover/profile:flex inset-0 bg-black/20 rounded-full items-center justify-center cursor-pointer"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Cover Photo */}
            <div className="flex flex-col items-start gap-3 mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Cover Photo
              </label>

              <input
                hidden
                type="file"
                accept="image/*"
                id="cover_photo"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cover_photo: e.target.files[0],
                  })
                }
              />

              <div className="relative">
                <img
                  src={
                    editForm.cover_photo
                      ? URL.createObjectURL(editForm.cover_photo)
                      : user.cover_photo
                  }
                  alt=""
                  className="w-80 h-40 rounded-lg object-cover cursor-pointer"
                  onClick={() =>
                    document.getElementById("cover_photo").click()
                  }
                />

                <div
                  onClick={() =>
                    document.getElementById("cover_photo").click()
                  }
                  className="absolute hidden group-hover:flex inset-0 bg-black/20 rounded-lg items-center justify-center cursor-pointer"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border rounded-lg"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModel;
   