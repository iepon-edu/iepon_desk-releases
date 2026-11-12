#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expected = {
  schemaVersion: 1,
  standard: "iepon-edu/collaboration",
  version: "2026-10-05.1",
  repository: "iepon-edu/iepon_desk-releases",
  entrypoint: "AGENTS.md",
  source: "https://github.com/iepon-edu/.github/blob/main/AGENTS.md",
};
const workflowPath = ".github/workflows/iepon-collaboration.yml";
const verifierPath = "scripts/verify-iepon-collaboration.mjs";
const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  ".cursor/rules/iepon-org.mdc",
  ".github/copilot-instructions.md",
  ".github/iepon-collaboration.json",
  workflowPath,
  verifierPath,
];
const safetyAnchors = [
  "교사가 한 번 쓴 것이 관찰·IEP·시간표로 끊김 없이 흐르게 한다. 같은 것을 두 번 쓰게 하지 않는다.",
  "`main` 또는 기본 브랜치 직접 push 금지.",
  "작성자와 독립 검수자를 분리한다.",
  "사람 승인 전 병합하지 않는다.",
  "작성 에이전트는 자기 변경을 병합하지 않는다.",
  "canonical DDL·RLS·실데이터 쓰기는 별도 사람 승인 전 실행하지 않는다.",
  "`service_role`은 서버·관리 스크립트 전용이며 `NEXT_PUBLIC_`로 노출하지 않는다.",
  "우회하지 말고 멈춰 보고한다.",
  "목표는 현재 구현이나 완료를 뜻하지 않는다.",
];
const errors = [];
const files = new Map();

function check(condition, message) {
  if (!condition) errors.push(message);
}

function includes(text, needle, label) {
  check(text.includes(needle), `${label}: 필수 내용 누락 — ${needle}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const relative of requiredFiles) {
  const target = path.join(root, relative);
  if (!existsSync(target) || !lstatSync(target).isFile() || lstatSync(target).isSymbolicLink()) {
    errors.push(`필수 일반 파일 누락: ${relative}`);
    files.set(relative, "");
    continue;
  }
  files.set(relative, readFileSync(target, "utf8"));
}

try {
  const declaration = JSON.parse(files.get(".github/iepon-collaboration.json"));
  for (const [key, value] of Object.entries(expected)) {
    check(declaration?.[key] === value, `adapter ${key} 불일치`);
  }
} catch {
  errors.push("adapter manifest JSON 문법 오류");
}

const agents = files.get("AGENTS.md");
check(
  agents.split(/\r?\n/, 1)[0] === `<!-- iepon-collaboration-standard: ${expected.version} -->`,
  "AGENTS.md 첫 줄 marker 불일치",
);
includes(agents, expected.source, "AGENTS.md 중앙 source");
for (const anchor of safetyAnchors) includes(agents, anchor, "AGENTS.md 안전 의미 anchor");
const linePrefix = "- 상태:";
const allowedStatuses = ["확정", "협의", "후속", "현행", "목표"];
check(
  new RegExp(`^${linePrefix}\\s*\\*\\*(${allowedStatuses.join("|")})\\*\\*\\s+—\\s+\\S.+$`, "mu").test(agents),
  "AGENTS.md 명시적 상태 줄 누락",
);
for (const [headings, markers] of [
  [["저장소 목적", "정본 관계", "이 저장소의 자리"], ["목적", "관계"]],
  [["작업 시작", "작업 시작 순서"], ["브랜치", "SHA"]],
  [["검증", "이 저장소의 검증"], ["검증"]],
  [["중단 조건", "정지 조건"], ["BLOCK"]],
]) {
  check(
    new RegExp(`^#{1,6}\\s+(?:\\d+\\.\\s+)?(?:${headings.join("|")})\\s*$`, "mu").test(agents),
    `AGENTS.md 필수 주제 누락: ${headings.join(" / ")}`,
  );
  for (const marker of markers) includes(agents, marker, "AGENTS.md 주제 내용");
}

for (const relative of ["CLAUDE.md", ".cursor/rules/iepon-org.mdc", ".github/copilot-instructions.md"]) {
  const loader = files.get(relative);
  for (const marker of ["AGENTS.md", "처음부터 끝까지", "정본", "BLOCK"]) includes(loader, marker, relative);
}
includes(files.get(".cursor/rules/iepon-org.mdc"), "alwaysApply: true", "Cursor 자동 로딩");
includes(files.get("README.md"), `<!-- iepon-collaboration-entrypoint: ${expected.version} -->`, "README.md");
includes(files.get("README.md"), "[AGENTS.md](./AGENTS.md)", "README.md 진입 링크");

for (const [relative, text] of files) {
  if (!/\.(?:md|mdc)$/.test(relative)) continue;
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:\/\/|mailto:|#)/.test(target)) continue;
    try {
      const local = decodeURIComponent(target.split("#", 1)[0]);
      check(existsSync(path.resolve(root, path.dirname(relative), local)), `${relative}: 로컬 링크 누락 — ${target}`);
    } catch {
      errors.push(`${relative}: 로컬 링크 해석 실패`);
    }
  }
}

const workflow = files.get(workflowPath);
for (const anchor of [
  `# iepon-collaboration-standard: ${expected.version}`,
  "permissions:\n  contents: read",
  "persist-credentials: false",
  "timeout-minutes: 5",
  `run: node ${verifierPath}`,
]) includes(workflow, anchor, "workflow");

// PR·push 각각의 paths를 검사한다. 한쪽에 중복해도 누락을 숨길 수 없다.
for (const event of ["pull_request", "push"]) {
  const block = workflow.match(new RegExp(`^  ${event}:\\n([\\s\\S]*?)(?=^  [^ \\n]|^\\S|(?![\\s\\S]))`, "mu"))?.[1] ?? "";
  check(block.length > 0, `workflow ${event} 이벤트 누락`);
  const paths = block.match(/^    paths:\n((?:      - "[^"\n]+"\n)+)/mu)?.[1] ?? "";
  for (const relative of requiredFiles) includes(paths, `      - "${relative}"`, `workflow ${event} paths`);
  if (event === "push") {
    const branches = block.match(/^    branches:\n((?:      - "[^"\n]+"\n)+)/mu)?.[1] ?? "";
    check(branches === '      - "main"\n', "workflow push 대상은 main 하나여야 함");
  }
}
const checkout = [...workflow.matchAll(/^\s*uses:\s*(actions\/checkout@[^\s#]+).*$/gmu)].map((match) => match[1]);
check(
  checkout.length === 1 && checkout[0] === "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
  "workflow checkout SHA 불일치",
);
for (const [pattern, label] of [
  [/^\s*pull_request_target\s*:/mu, "pull_request_target"],
  [/\bpermissions\s*:\s*write-all\b/iu, "permissions: write-all"],
  [/\b[a-z][a-z-]*\s*:\s*write\b/iu, "write 권한"],
]) check(!pattern.test(workflow), `workflow 금지 설정: ${label}`);

// 선언 값뿐 아니라 이 검증기에 필요한 고정 계약도 중앙 검증기가 교차 검사한다.
const verifier = files.get(verifierPath);
for (const anchor of [expected.version, expected.repository, "schemaVersion", expected.source, linePrefix, ...allowedStatuses, ...safetyAnchors]) {
  includes(verifier, anchor, "local verifier 계약");
}
check(new RegExp(`run: node ${escapeRegExp(verifierPath)}(?:\\n|$)`, "u").test(workflow), "workflow 검증기 실행 누락");

if (errors.length > 0) {
  console.error(`협업 어댑터 검증 FAIL (${errors.length}건)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`협업 어댑터 검증 PASS (${expected.version}; 필수 파일 ${requiredFiles.length}개; 안전 anchor ${safetyAnchors.length}개)`);
