import mongoose from 'mongoose';
import { paginate, toJSON } from './plugins';

const { Schema } = mongoose;

const querySchema = new Schema({
  chats: [],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// add plugin that converts mongoose to json
querySchema.plugin(toJSON);
querySchema.plugin(paginate);

export default mongoose.model('Query', querySchema);
