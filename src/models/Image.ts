import { ImagesI } from "@/types/common";
import { Schema, model } from "mongoose";

const imageSchema = new Schema<ImagesI>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    sortIndex: { type: Number, default: 0 },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export default model<ImagesI>("Image", imageSchema);
