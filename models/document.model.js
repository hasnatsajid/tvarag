import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins';
const { Schema } = mongoose;
const documentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },

  core: {
    type: Number,
    required: true,
  },
  sid: {
    type: Number,
    required: true,
  },
  uid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// add plugin that converts mongoose to json
documentSchema.plugin(toJSON);
documentSchema.plugin(paginate);

/**
 * @typedef Document
 */
const Document = mongoose.model('Document', documentSchema);

export default Document;
