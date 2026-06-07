import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function resolveRoot(filePath) {
  return path.join(root, filePath);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(resolveRoot(filePath), "utf8"));
  } catch (error) {
    errors.push(`${filePath}: JSON inválido (${error.message})`);
    return null;
  }
}

function requireFile(filePath) {
  if (!existsSync(resolveRoot(filePath))) {
    errors.push(`${filePath}: arquivo ausente`);
  }
}

function checkJs(filePath) {
  requireFile(filePath);

  if (!existsSync(resolveRoot(filePath))) {
    return;
  }

  const result = spawnSync("node", ["--check", resolveRoot(filePath)], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    errors.push(`${filePath}: sintaxe JS inválida\n${result.stderr || result.stdout}`);
  }
}

function checkHtmlNoInline(filePath, html) {
  if (/<script(?![^>]+src=)/i.test(html)) {
    errors.push(`${filePath}: usa script inline`);
  }

  if (/\son[a-z]+\s*=/i.test(html)) {
    errors.push(`${filePath}: usa handler inline`);
  }
}

const manifest = await readJson("manifest.json");

if (manifest) {
  if (manifest.manifest_version !== 3) {
    errors.push("manifest.json: manifest_version deve ser 3");
  }

  for (const key of ["name", "version", "description", "icons", "action", "background"]) {
    if (!manifest[key]) {
      errors.push(`manifest.json: campo obrigatório ausente: ${key}`);
    }
  }

  for (const filePath of Object.values(manifest.icons || {})) {
    requireFile(filePath);
  }

  for (const filePath of Object.values(manifest.action?.default_icon || {})) {
    requireFile(filePath);
  }

  requireFile(manifest.action?.default_popup || "");
  requireFile(manifest.background?.service_worker || "");
  requireFile(manifest.options_ui?.page || "");

  for (const contentScript of manifest.content_scripts || []) {
    for (const filePath of contentScript.js || []) {
      requireFile(filePath);
    }
  }
}

await readJson("_locales/pt_BR/messages.json");
await readJson("_locales/en/messages.json");

for (const filePath of [
  "src/config.js",
  "src/background.js",
  "src/content.js",
  "ui/popup.js",
  "ui/options.js"
]) {
  checkJs(filePath);
}

for (const filePath of ["ui/popup.html", "ui/options.html"]) {
  requireFile(filePath);
  if (existsSync(resolveRoot(filePath))) {
    checkHtmlNoInline(filePath, await readFile(resolveRoot(filePath), "utf8"));
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Extensão validada com sucesso.");
