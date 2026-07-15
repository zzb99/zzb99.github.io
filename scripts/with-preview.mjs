import { spawn } from 'node:child_process';

const host = '127.0.0.1';
const port = Number(process.env.PREVIEW_PORT ?? 4322);
const baseURL = `http://${host}:${port}`;
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`)));
  });
}

async function waitForPreview() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Astro preview did not become ready at ${baseURL}.`);
}

const preview = spawn(pnpm, ['exec', 'astro', 'preview', '--host', host, '--port', String(port), '--strictPort'], { stdio: 'inherit', shell: process.platform === 'win32' });
try {
  await waitForPreview();
  const env = { ...process.env, SITE_URL: baseURL };
  await run(pnpm, ['test:e2e'], env);
  await run(pnpm, ['audit:lighthouse'], env);
} finally {
  if (!preview.killed) preview.kill('SIGTERM');
  await new Promise(resolve => preview.once('exit', resolve));
}
