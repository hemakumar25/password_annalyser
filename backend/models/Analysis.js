import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    entropy: {
      type: Number,
      required: true,
    },
    crackTime: {
      type: String,
      required: true,
    },
    strength: {
      type: String,
      required: true,
    },
    suggestions: [String],
  },
  { timestamps: true }
);

const Analysis = mongoose.model('Analysis', analysisSchema);
export default Analysis;
