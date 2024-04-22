import express from 'express';
import passport from 'passport';
import { catchAsync } from '../utils/catchAsync';
import { insertQueries, setSolution, getAllQueries, deleteChat } from '../controllers/chat.controller';
import { getResponses } from '../utils/pinecone-helper';
const router = express.Router();

router.post(
  '/getResponse',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    console.log('/api/chat/insertQueries called -------');
    res.status(200).json(await getResponses(req));
  })
);

router.post(
  '/insertQueries',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    console.log('/api/chat/insertQueries called -------');
    res.status(200).json(await insertQueries(req));
  })
);

router.post(
  '/setSolution',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    console.log('/api/chat/setSolution called -------');
    res.status(200).json(await setSolution(req));
  })
);

router.get(
  '/getAllQueries',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    console.log('/api/chat/getAllQueries called -------');
    res.status(200).json(await getAllQueries(req));
  })
);

router.post(
  '/deleteChat',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    console.log('/api/chat/deleteChat called -------');
    res.status(200).json(await deleteChat(req));
  })
);
export default router;
