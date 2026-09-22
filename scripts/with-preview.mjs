import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number(process.env.PREVIEW_PORT ?? 4322);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error(`Invalid PREVIEW_PORT: ${process.env.PREVIEW_PORT ?? ''}`);
const baseURL = `http://${host}:${port}`;
const astroCli = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env });
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

const preview = spawn(process.execPath, [astroCli, 'preview', '--host', host, '--port', String(port), '--strictPort'], { stdio: 'inherit' });
try {
  await waitForPreview();
  const env = { ...process.env, SITE_URL: baseURL };
  await run(process.execPath, ['scripts/e2e.mjs'], env);
  await run(process.execPath, ['scripts/lighthouse.mjs'], env);
} finally {
  if (preview.exitCode === null && preview.signalCode === null) {
    const exited = new Promise(resolve => preview.once('exit', resolve));
    preview.kill('SIGTERM');
    await exited;
  }
  await run(process.execPath, [astroCli, 'preview', 'stop']);
}
