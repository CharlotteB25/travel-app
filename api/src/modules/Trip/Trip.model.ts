// modules/Trip/Trip.model.ts
import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: String },
    time: { type: String },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const ExpenseSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, min: 0 },
    currency: {
      type: String,
      default: "EUR",
      uppercase: true,
      enum: ["EUR", "USD", "GBP", "AUD", "CAD"],
    },
    category: {
      type: String,
      trim: true,
      enum: ["transport", "stay", "food", "activity", "misc", ""],
      default: "",
    },
    paidBy: { type: String, trim: true },
  },
  { _id: false }
);

const TripSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // "City, Country"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    currency: {
      type: String,
      default: "EUR",
      uppercase: true,
      enum: ["EUR", "USD", "GBP", "AUD", "CAD"],
    },
    participants: { type: [String], default: [] },
    notes: { type: String, default: "" }, // <-- not required
    activities: { type: [ActivitySchema], default: [] },
    expenses: { type: [ExpenseSchema], default: [] },
  },
  { timestamps: true }
);

// simple logical check
TripSchema.pre("save", function (next) {
  // @ts-ignore
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});
// Trip.model.ts
console.log("Trip schema fields:", Object.keys(TripSchema.paths));

export default mongoose.model("Trip", TripSchema);
