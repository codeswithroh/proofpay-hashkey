import { readFile, writeFile } from "node:fs/promises";
import kleur from "kleur";

export interface GlobalOptions {
  json?: boolean;
  color?: boolean;
}

export function configureColor(options: GlobalOptions): void {
  kleur.enabled = options.color !== false && process.stdout.isTTY === true;
}

export function stringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, item) => (typeof item === "bigint" ? item.toString() : item),
    2
  );
}

export function printJson(value: unknown): void {
  console.log(stringify(value));
}

export function symbol(kind: "ok" | "warn" | "fail" | "info"): string {
  if (kind === "ok") return kleur.green("OK");
  if (kind === "warn") return kleur.yellow("WARN");
  if (kind === "fail") return kleur.red("FAIL");
  return kleur.cyan("INFO");
}

export function printKV(rows: Array<[string, string | number | bigint | boolean | null | undefined]>): void {
  const width = Math.max(...rows.map(([key]) => key.length));
  for (const [key, value] of rows) {
    console.log(`${kleur.dim(key.padEnd(width))}  ${value ?? ""}`);
  }
}

export function printDecision(value: {
  ok: boolean;
  outcomeClass: string;
  missingCapabilities: string[];
  reasons: string[];
}): void {
  const status = value.ok
    ? `${kleur.green("ACCEPT")} ${kleur.dim("payment can ship")}`
    : `${kleur.red("REJECT")} ${kleur.dim("payment cannot ship")}`;
  console.log(status);
  printKV([
    ["outcome", value.outcomeClass],
    ["missing", value.missingCapabilities.length ? value.missingCapabilities.join(", ") : "none"]
  ]);
  if (value.reasons.length > 0) {
    console.log("");
    for (const reason of value.reasons) {
      console.log(`${kleur.red("x")} ${reason}`);
    }
  }
}

export async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${stringify(value)}\n`);
}

export function encodeBase64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

