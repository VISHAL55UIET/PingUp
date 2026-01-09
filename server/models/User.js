import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: String,
  email: String,
  full_name: String,
  username: String,
  profile_picture: String,
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
           