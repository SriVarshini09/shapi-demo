// Writes the two attestation predicates for a SHAPI fix PR (see .github/workflows/shapi-attest.yml).
// Input: <dir> holding pr.json (gh pr view) and vitest.json (vitest's JSON reporter). Output: test-result.json, api-fix.json.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const pr = JSON.parse(readFileSync(path.join(dir, "pr.json"), "utf8"));
const vitestFile = path.join(dir, "vitest.json");
const vitest = existsSync(vitestFile) ? JSON.parse(readFileSync(vitestFile, "utf8")) : { testResults: [] };
const tests = vitest.testResults.flatMap((file) =>
  (file.assertionResults ?? []).map((t) => ({ file: path.relative(process.cwd(), file.name).replaceAll("\\", "/"), name: t.fullName, status: t.status })),
);
const named = (status) => tests.filter((t) => t.status === status).map((t) => `${t.file} > ${t.name}`);
const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const runUrl = process.env.RUN_URL;

// https://github.com/in-toto/attestation/blob/main/spec/predicates/test-result.md
const testResult = {
  result: named("failed").length || !tests.length ? "FAILED" : "PASSED",
  configuration: [{ name: "package.json", digest: { sha256: sha256("package.json") } }],
  url: runUrl,
  passedTests: named("passed"),
  warnedTests: named("skipped").concat(named("pending")),
  failedTests: named("failed"),
};

// SHAPI's own predicate: what the fix is for, what it changed, and the contract tests that prove it.
const advisory = pr.headRefName.replace(/^shapi\//, "");
const changed = pr.files.map((f) => f.path);
const contract = tests.filter((t) => t.file.startsWith("test/shapi/"));
const apiFix = {
  advisory: { id: advisory, url: `https://shapi.dev/advisories/${advisory}`, osv: `https://shapi.dev/osv/${advisory}.json` },
  pullRequest: { number: pr.number, url: pr.url, head: pr.headRefOid },
  changedFiles: changed.map((f) => (existsSync(f) ? { path: f, sha256: sha256(f) } : { path: f, deleted: true })),
  contractTests: contract.map((t) => ({ file: t.file, name: t.name, status: t.status })),
  result: contract.length && contract.every((t) => t.status === "passed") ? "PASSED" : "FAILED",
  verifiedBy: runUrl,
};

writeFileSync(path.join(dir, "test-result.json"), `${JSON.stringify(testResult, null, 2)}\n`);
writeFileSync(path.join(dir, "api-fix.json"), `${JSON.stringify(apiFix, null, 2)}\n`);
console.log(`test-result ${testResult.result}: ${testResult.passedTests.length} passed, ${testResult.failedTests.length} failed; api-fix ${apiFix.result} for ${advisory}`);
