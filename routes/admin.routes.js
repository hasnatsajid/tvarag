import express from 'express';
import passport from 'passport';
import multer from 'multer';
import fs from 'fs';
import { catchAsync } from '../utils/catchAsync';
import { verifyRole } from '../middlewares/admin';
import {
  ingestFile,
  ingestURL,
  getUsers,
  removeUser,
  removeUsers,
  updateRole,
  removePineconeAll,
  createWorkflow,
  getWorkflow,
  deleteWorkflow,
  updateWorkflow,
  getDocuments,
} from '../controllers/admin.controller';
import { delRecordWithMetadata } from '../utils/pinecone-helper';
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      const path = 'uploads/';
      fs.mkdirSync(path, { recursive: true });
      callback(null, path);
    },
    filename: function (req, file, callback) {
      callback(null, Date.now() + '-' + file.originalname);
    },
  }),
}).single('file');

router.get(
  '/getUsers',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/getUsers called ---------');
    res.status(200).json(await getUsers(req, res));
  })
);

router.post(
  '/removeUser',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/removeUser called ---------');
    res.status(200).json(await removeUser(req, res));
  })
);

router.post(
  '/removeUsers',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/removeUsers called ---------');
    res.status(200).json(await removeUsers(req, res));
  })
);

router.post(
  '/updateRole',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/updateRole called ---------');
    res.status(200).json(await updateRole(req, res));
  })
);

router.post(
  '/ingestFile',
  passport.authenticate('jwt', { session: false }),
  upload,
  catchAsync(async (req, res) => {
    console.log('/api/admin/ingestFile called ---------');
    res.status(200).json(await ingestFile(req));
  })
);

router.post(
  '/ingestURL',
  passport.authenticate('jwt', { session: false }),
  catchAsync(async (req, res) => {
    console.log('/api/admin/ingestURL called ---------');
    res.status(200).json(await ingestURL(req, res));
  })
);

router.get(
  '/getDocuments',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/getDocuments called ---------');
    res.status(200).json(await getDocuments(req, res));
  })
);

router.post(
  '/removePineconeAll',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/removePineconeAll called ---------');
    res.status(200).json(await removePineconeAll(req, res));
  })
);

router.post(
  '/delRecord',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/delRecord called ---------');
    res.status(200).json(await delRecordWithMetadata(req, res));
  })
);

router.post(
  '/createWorkflow',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/createWorkflow called ---------');
    res.status(200).json(await createWorkflow(req, res));
  })
);

router.post(
  '/updateWorkflow',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/updateWorkflow called ---------');
    res.status(200).json(await updateWorkflow(req, res));
  })
);

router.get(
  '/getWorkflow',
  passport.authenticate('jwt', { session: false }),
  // verifyRole([0]),
  catchAsync(async (req, res) => {
    console.log('/api/admin/getWorkflow called ---------');
    res.status(200).json(await getWorkflow(req, res));
  })
);

router.post(
  '/deleteWorkflow',
  passport.authenticate('jwt', { session: false }),
  verifyRole(0),
  catchAsync(async (req, res) => {
    console.log('/api/admin/deleteWorkflow called ---------');
    res.status(200).json(await deleteWorkflow(req, res));
  })
);

export default router;
