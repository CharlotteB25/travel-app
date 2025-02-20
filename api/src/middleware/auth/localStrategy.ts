import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import UserModel from "../../modules/User/User.model";

const localOptions = {
  usernameField: "email",
};

// Local strategy for email & password authentication
const localStrategy = new LocalStrategy(
  localOptions,
  async (
    email: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ) => {
    try {
      console.log("🔍 Checking login for:", email);

      const user = await UserModel.findOne({ email });

      if (!user) {
        console.log("❌ User not found");
        return done(null, false, { message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        console.log("❌ Password does not match");
        return done(null, false, { message: "Invalid credentials" });
      }

      console.log("✅ Login successful for:", user.email);
      return done(null, user);
    } catch (error) {
      console.error("🔥 Error in localStrategy:", error);
      return done(error);
    }
  }
);

export default localStrategy;
