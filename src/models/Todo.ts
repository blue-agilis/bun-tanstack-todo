import mongoose, { Schema } from "mongoose";

const TodoSchema = new Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export const Todo = mongoose.model("Todo", TodoSchema);
