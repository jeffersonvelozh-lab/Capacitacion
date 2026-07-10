import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT: number = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola desde tu backend en Node.js con TypeScript!');
});

app.listen(PORT, () => {
  console.log(`Servidor TS corriendo en http://localhost:${PORT}`);
});

