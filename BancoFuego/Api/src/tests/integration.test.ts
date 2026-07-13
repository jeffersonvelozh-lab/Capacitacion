import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../index';

test('GET /health returns ok and GET /cuentas/1 returns data', async () => {
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
        const health = await fetch(`http://127.0.0.1:${address.port}/health`);
        const cuenta = await fetch(`http://127.0.0.1:${address.port}/cuentas/1`);

        assert.equal(health.status, 200);
        assert.deepEqual(await health.json(), { status: 'ok' });
        assert.equal(cuenta.status, 200);
        const body = await cuenta.json();
        assert.equal(body.ok, true);
        assert.equal(body.data.id, 1);
    } finally {
        await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    }
});
