import mongoose from 'mongoose';

const { Schema } = mongoose;

const FitFriendChatSchema = new Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'message is required'],
    },
    sender: {
      type: String,
      required: [true, 'sender is required'],
      enum: ['student', 'fitfriend'],
    },
    grade: {
      type: String,
      default: 'KG',
    },
    recommendedActivityId: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
    collection: 'fitfriend_chats',
  }
);

FitFriendChatSchema.index({ studentId: 1, timestamp: -1 });

export const FitFriendChatModel = mongoose.model('FitFriendChat', FitFriendChatSchema);
export default FitFriendChatModel;
