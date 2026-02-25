import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },

    payload: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      enum: ["RECEIVED", "PROCESSED", "FAILED"],
      default: "RECEIVED",
    },

    errorMessage: {
      type: String,
    },
  },
  { timestamps: true },
);

webhookLogSchema.index({ provider: 1, createdAt: -1 });

export default mongoose.model("WebhookLog", webhookLogSchema);
