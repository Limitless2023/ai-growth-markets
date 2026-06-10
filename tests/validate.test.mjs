// ============================================================
// 校验器测试：对 fixtures/valid 应通过，对 fixtures/invalid 应报错
// 零依赖：node --test tests/
// ============================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ---------- 以子进程方式运行校验器，捕获退出码与输出 ----------
const run = (dataDir) => {
  try {
    const out = execFileSync("node", [path.join(root, "scripts/validate.mjs")], {
      env: { ...process.env, DATA_DIR: dataDir },
      encoding: "utf8",
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: String(e.stdout ?? "") + String(e.stderr ?? "") };
  }
};

test("valid fixtures 通过且输出 The Number", () => {
  const r = run(path.join(root, "tests/fixtures/valid"));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /The Number = 500/);
});

test("invalid fixtures 全部规则被命中", () => {
  const r = run(path.join(root, "tests/fixtures/invalid"));
  assert.equal(r.code, 1);
  for (const rule of ["R1", "R2", "R3", "R4", "R5"]) {
    assert.match(r.out, new RegExp(`\\[${rule}\\]`), `规则 ${rule} 未被命中`);
  }
});
