import mongoose from 'mongoose';
import { paginate, toJSON } from './plugins';

const { Schema } = mongoose;

const workflowSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  prompt: { type: String },
  type: { type: Number },
  userId: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

// add plugin that converts mongoose to json
workflowSchema.plugin(toJSON);
workflowSchema.plugin(paginate);

export default mongoose.model('Workflow', workflowSchema);
