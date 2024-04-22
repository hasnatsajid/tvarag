import express from 'express';

const router = express.Router();

import authRouter from './auth.routes';
import adminRouter from './admin.routes';
import profileRouter from './profile.routes';
import chatRouter from './chat.routes';

const defaultRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/admin',
    route: adminRouter,
  },
  {
    path: '/profile',
    route: profileRouter,
  },
  {
    path: '/chat',
    route: chatRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
