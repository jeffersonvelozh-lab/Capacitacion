import express from 'express';
import "dotenv/config";
import routes from './Infrastructure/Http/routes';
import { errorHandler } from './Infrastructure/Http/errorHandler';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('X-Content-Type-Options', 'nosniff');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(routes);
  app.use(errorHandler);
  return app;
}

export function startServer(port: number = Number(process.env.PORT ?? 3000)) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Servidor TS corriendo en http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

