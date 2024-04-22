import { insertQuery, setSolutions, getQueriesAll, delChat } from '../services/query.service';

export const insertQueries = async (req) => {
  return insertQuery(req.body, req.user._id);
};

export const setSolution = async (req) => {
  return setSolutions(req.body, req.user._id);
};

export const getAllQueries = async (req) => {
  return getQueriesAll(req.body, req.user._id);
};

export const deleteChat = async (req) => {
  return delChat(req.body, req.user._id);
};
