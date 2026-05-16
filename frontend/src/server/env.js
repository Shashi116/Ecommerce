import fs from 'fs';
import path from 'path';

let loaded = false;

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function loadServerEnv() {
  if (loaded) {
    return;
  }

  loaded = true;

  const fallbackFiles = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '..', 'backend', '.env')
  ];

  for (const file of fallbackFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separator = trimmed.indexOf('=');
      if (separator === -1) {
        continue;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = parseEnvValue(trimmed.slice(separator + 1));

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadServerEnv();
