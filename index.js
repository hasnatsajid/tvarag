import mongoose from 'mongoose';
import app from './app';
import logger from './config/logger';
import Workflow from './models/workflow.model';

const options = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true };
mongoose.connect(process.env.MONGODB_URL, options).then(async () => {
  logger.info('Connected to MongoDB');
  const work_flow = await Workflow.find();
  if (work_flow.length === 0) {
    const initialData = [
      {
        name: 'Competitor Analysis',
        description: 'This is a step for competitor analysis',
        prompt: 'Please tell me Competitor Analysis',
        type: 0,
      },
      {
        name: 'Scope of Work Generation',
        description: 'This is a step for Scope of Work Generation',
        prompt: 'I want to know about the scope of work generation',
        type: 0,
      },
      {
        name: 'Trend Report',
        description: 'This is a step for Trend Report',
        prompt: 'Could you tell me about trend report',
        type: 0,
      },
    ];
    await Workflow.insertMany(initialData);
    console.log('Initial WorkFlow data inserted successfully');
  }
});

let server = app;
server.listen(process.env.PORT, () => {
  logger.info(`Listening to port ${process.env.PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
