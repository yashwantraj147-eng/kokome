import { createServer } from 'vite';
import { spawn } from 'child_process';
import electronPath from 'electron';

async function start() {
  const server = await createServer({
    configFile: './vite.config.ts',
    server: { port: 5173, strictPort: true }
  });
  
  await server.listen();
  const address = server.httpServer.address();
  const port = typeof address === 'object' && address ? address.port : 5173;
  console.log(`[Kokome] Vite dev server ready at http://localhost:${port}`);

  const electronProcess = spawn(electronPath, ['.'], {
    stdio: 'inherit',
    env: { ...process.env, VITE_DEV_SERVER_URL: `http://localhost:${port}` }
  });

  electronProcess.on('close', () => {
    server.close();
    process.exit();
  });
}

start().catch((err) => {
  console.error('[Kokome] Failed to start dev server:', err);
  process.exit(1);
});
