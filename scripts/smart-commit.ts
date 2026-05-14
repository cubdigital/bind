/**
 * scripts/smart-commit.ts
 *
 * Commits each currently staged file individually, generating a conventional
 * commit message per file via the Cursor SDK (`Agent.prompt`).
 *
 * Prerequisites:
 *   - `CURSOR_API_KEY` in the environment, or
 *   - `api_key` under `[providers.cursor]` in ~/.nylon/config.toml
 *
 * Usage (from repo root):
 *   pnpm smart-commit
 *
 * Override model:
 *   CURSOR_MODEL=gpt-5.5-high pnpm smart-commit
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { Agent } from "@cursor/sdk";

const repoRoot = execFileSync(
  "git",
  ["rev-parse", "--show-toplevel"],
  { encoding: "utf8" },
).trim();

function gitStdout(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    cwd: repoRoot,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function gitInherit(args: string[]): void {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0 && result.status !== null) {
    process.exit(result.status);
  }
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
}

/** Parse ~/.nylon/config.toml for [providers.cursor] api_key / default_model */
function readNylonCursor(): { apiKey?: string; model?: string } {
  const cfg = join(homedir(), ".nylon", "config.toml");
  if (!existsSync(cfg)) return {};
  try {
    const text = readFileSync(cfg, "utf8");
    const m = text.match(/\[providers\.cursor\]\s*\r?\n([\s\S]*?)(?=\r?\n\[|\s*\z)/);
    if (!m) return {};
    const block = m[1] ?? "";
    const apiKey =
      block.match(/^\s*api_key\s*=\s*["']([^"']+)["']\s*$/im)?.[1] ??
      block.match(/^\s*api_key\s*=\s*([^\s#]+)\s*$/im)?.[1];
    const model =
      block.match(/^\s*default_model\s*=\s*["']([^"']+)["']\s*$/im)?.[1];
    return { apiKey: apiKey?.trim(), model: model?.trim() };
  } catch {
    return {};
  }
}

function resolveCredentials(): { apiKey: string; model: string } {
  const fromEnv = process.env.CURSOR_API_KEY?.trim();
  const fromNylon = readNylonCursor();
  const apiKey = fromEnv || fromNylon.apiKey || "";
  if (!apiKey) {
    console.error(
      "Set CURSOR_API_KEY or add api_key under [providers.cursor] in ~/.nylon/config.toml",
    );
    process.exit(1);
  }
  const model =
    process.env.CURSOR_MODEL?.trim() ||
    fromNylon.model ||
    "composer-2";
  return { apiKey, model };
}

function normaliseSubject(raw: string, file: string): string {
  const first = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  let msg = first ?? `chore: update ${file}`;
  msg = msg.replace(/^["'`]|["'`]$/g, "");
  return msg;
}

async function main(): Promise<void> {
  const { apiKey, model } = resolveCredentials();

  const stagedOutput = gitStdout(["diff", "--name-only", "--cached"]).trim();
  if (!stagedOutput) {
    console.log("Nothing staged.");
    process.exit(0);
  }

  const files = stagedOutput.split(/\r?\n/).filter(Boolean);
  console.log(`\n${files.length} staged file(s) — committing one by one:\n`);

  gitInherit(["restore", "--staged", "."]);

  const agentCwd = mkdtempSync(join(tmpdir(), "smart-commit-bind-"));

  try {
    for (const file of files) {
      gitInherit(["add", "--", file]);

      const diff = gitStdout(["diff", "--cached", "--", file]);

      let message: string;
      if (!diff.trim()) {
        message = `chore: update ${file}`;
      } else {
        const result = await Agent.prompt(
          [
            "Generate a conventional commit message for the git diff below.",
            "",
            "Rules:",
            "- Return ONE line only — no explanation, no quotes, no full stop at the end",
            "- Format: type(scope): description",
            "- Types: feat, fix, refactor, chore, docs, test, style, perf",
            "- Keep it under 72 characters",
            "- Be specific about what changed, not just which file name",
            "",
            "Diff:",
            diff,
          ].join("\n"),
          {
            apiKey,
            model: { id: model },
            local: { cwd: agentCwd },
          },
        );

        const raw =
          typeof result.result === "string" ? result.result.trim() : "";
        message = normaliseSubject(raw, file);
      }

      gitInherit(["commit", "-m", message]);
      console.log(`\n   [${file}] ${message}\n`);
    }
  } finally {
    try {
      rmSync(agentCwd, { recursive: true, force: true });
    } catch {
      /* best-effort */
    }
  }

  console.log("Done. All staged files committed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
