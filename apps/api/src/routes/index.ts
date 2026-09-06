import { Router } from 'express';
import adminRouter from './admin.js';
import authRouter from './auth.js';
import leadsRouter from './leads.js';
import meRouter from './me.js';
import notificationsRouter from './notifications.js';
import supportRouter from './support.js';
import trackRouter from './track.js';

const api = Router();

api.use('/leads', leadsRouter);
api.use('/auth', authRouter);
api.use('/me', meRouter);
api.use('/support', supportRouter);
api.use('/notifications', notificationsRouter);
api.use('/track', trackRouter);
api.use('/admin', adminRouter);

export default api;
