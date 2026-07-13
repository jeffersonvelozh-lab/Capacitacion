import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../index';

test('GET /health returns ok', async () => {
    const app = createApp();
    const server = app.listen(0);
    const address = await new Promise<{ port: number }>((resolve, reject) => {
        server.once('listening', () => {
            const addr = server.address();
            if (typeof addr === 'object' && addr) {
                resolve({ port: addr.port });
            } else {
                reject(new Error('No se pudo obtener el puerto del servidor'));
            }
        });
    server.once('error', reject);
    });

    try {
        const response = await fetch(`http://127.0.0.1:${address.port}/health`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { status: 'ok' });
    } finally {
        await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    }
});
