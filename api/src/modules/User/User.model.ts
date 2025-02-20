import { Document } from "mongodb";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./User.types";

// Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password correctly
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    console.log("🔄 Hashing password before saving:", user.password);
    user.password = await bcrypt.hash(user.password, 10);
    console.log("✅ Hashed Password Saved:", user.password);
    return next();
  } catch (err: any) {
    console.error("❌ Error hashing password:", err);
    return next(err);
  }
});

// Instance methods
userSchema.methods = {
  async comparePassword(password: string) {
    console.log("🔍 Incoming Password:", password);
    console.log("🔑 Stored Hashed Password:", this.password);

    try {
      const isMatch = await bcrypt.compare(password, this.password);
      console.log("✅ Password Match:", isMatch);
      return isMatch;
    } catch (err) {
      console.error("❌ Password comparison error:", err);
      throw new Error("Password comparison failed");
    }
  },

  generateToken() {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET ?? "", {
      expiresIn: "2h", // More readable expiration
    });

    console.log("🔑 Generated JWT Token:", token);
    return token;
  },
};

// Ensure password is not sent in responses
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
  },
});

const UserModel = mongoose.model<User>("User", userSchema);

export default UserModel;
