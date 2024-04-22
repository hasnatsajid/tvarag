import mongoose from 'mongoose';
import { paginate, toJSON } from './plugins';

const { Schema } = mongoose;

const promptSchema = new Schema({
  prompt: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// add plugin that converts mongoose to json
promptSchema.plugin(toJSON);
promptSchema.plugin(paginate);

export default mongoose.model('Prompt', promptSchema);
