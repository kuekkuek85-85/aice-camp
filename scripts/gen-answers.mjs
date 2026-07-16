// 2일차 예시답안 .gen 생성기
//
// 교사가 codex에서 저장한 실제 .gen(문제1 답안)을 템플릿으로 사용해
// 나머지 문제(2~7)의 답안 파일을 생성한다.
//
// 사용법: node scripts/gen-answers.mjs <템플릿.gen> <출력폴더>
//
// 확인된 형식(_version 3, _fourcc "aimk"):
//  - 함수/수학/변수/논리/반복 블록은 표준 Blockly 타입
//  - 말하기 = misc_chat(MSG), 묻고 답 기다리기 = misc_prompt(TITLE)
//  - 시작 이벤트 = eventloop_object_start_click
//  ⚠️ TTS·호출어 블록 타입은 템플릿에 없어 미션④⑤는 misc_chat/시작이벤트로 대체 —
//     codex에서 불러온 뒤 해당 블록만 교체 필요.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [, , templatePath, outDir] = process.argv;
if (!templatePath || !outDir) {
  console.error("사용법: node scripts/gen-answers.mjs <템플릿.gen> <출력폴더>");
  process.exit(1);
}

const template = JSON.parse(readFileSync(templatePath, "utf8"));
mkdirSync(outDir, { recursive: true });

// ---------- 유틸 ----------
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const uid = (n = 20) =>
  Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 블록 문자열 맨 끝의 </block> 앞에 <next>를 끼워 아래로 연결한다 (중첩 블록 안전)
const withNext = (blockXml, nextXml) => blockXml.replace(/<\/block>$/, `<next>${nextXml}</next></block>`);
const chain = (...blocks) => blocks.reduceRight((acc, b) => (acc ? withNext(b, acc) : b), "");

const num = (v) => `<shadow type="math_number" id="${uid()}"><field name="NUM">${v}</field></shadow>`;
const numBlock = (v) => `<block type="math_number" id="${uid()}"><field name="NUM">${v}</field></block>`;
const getVar = (v) => `<block type="variables_get" id="${uid()}"><field name="VAR" id="${v.id}">${esc(v.name)}</field></block>`;
const setVar = (v, valueXml) =>
  `<block type="variables_set" id="${uid()}"><field name="VAR" id="${v.id}">${esc(v.name)}</field><value name="VALUE">${valueXml}</value></block>`;
const chat = (msgBlockXml) =>
  `<block type="misc_chat" id="${uid()}"><value name="MSG"><shadow type="text" id="${uid()}"><field name="TEXT"></field></shadow>${msgBlockXml}</value></block>`;
const chatText = (text) =>
  `<block type="misc_chat" id="${uid()}"><value name="MSG"><shadow type="text" id="${uid()}"><field name="TEXT">${esc(text)}</field></shadow></value></block>`;
const prompt = (title) =>
  `<block type="misc_prompt" id="${uid()}"><value name="TITLE"><shadow type="text" id="${uid()}"><field name="TEXT">${esc(title)}</field></shadow></value></block>`;
const arith = (op, aXml, bXml) =>
  `<block type="math_arithmetic" id="${uid()}"><field name="OP">${op}</field><value name="A">${num(0)}${aXml}</value><value name="B">${num(0)}${bXml}</value></block>`;
const modulo = (dividendXml, divisorXml) =>
  `<block type="math_modulo" id="${uid()}"><value name="DIVIDEND">${num(64)}${dividendXml}</value><value name="DIVISOR">${num(10)}${divisorXml}</value></block>`;
const compare = (op, aXml, bXml) =>
  `<block type="logic_compare" id="${uid()}"><field name="OP">${op}</field><value name="A">${aXml}</value><value name="B">${bXml}</value></block>`;
const boolBlock = (v) => `<block type="logic_boolean" id="${uid()}"><field name="BOOL">${v}</field></block>`;
// 코디니의 for 반복 블록 (교사 검증 파일에서 확인): controls_custom_for — FROM/TO만 있고 BY 없음
// from/to: 숫자를 주면 shadow 값으로, 문자열(XML)을 주면 기본 shadow + 블록으로 넣는다
const forVal = (v) => (typeof v === "number" ? num(v) : `${num(1)}${v}`);
const forLoop = (v, from, to, doXml) =>
  `<block type="controls_custom_for" id="${uid()}"><field name="VAR" id="${v.id}">${esc(v.name)}</field><value name="FROM">${forVal(from)}</value><value name="TO">${forVal(to)}</value><statement name="DO">${doXml}</statement></block>`;
const ifBlock = (condXml, doXml) =>
  `<block type="controls_if" id="${uid()}"><value name="IF0">${condXml}</value><statement name="DO0">${doXml}</statement></block>`;
const ifElse = (condXml, doXml, elseXml) =>
  `<block type="controls_if" id="${uid()}"><mutation else="1"></mutation><value name="IF0">${condXml}</value><statement name="DO0">${doXml}</statement><statement name="ELSE">${elseXml}</statement></block>`;
const textJoin = (parts) =>
  `<block type="text_join" id="${uid()}"><mutation items="${parts.length}"></mutation>` +
  parts.map((p, i) => `<value name="ADD${i}">${p}</value>`).join("") +
  `</block>`;
const textBlock = (t) => `<block type="text" id="${uid()}"><field name="TEXT">${esc(t)}</field></block>`;
const startClick = (nextXml) =>
  `<block type="eventloop_object_start_click" id="${uid()}" x="0" y="0"><next>${nextXml}</next></block>`;

function defNoReturn(name, args, stackXml, y) {
  const mutation = args.map((a) => `<arg name="${esc(a.name)}" varid="${a.id}"></arg>`).join("");
  return `<block type="procedures_defnoreturn" id="${uid()}" x="0" y="${y}"><mutation>${mutation}</mutation><field name="NAME">${esc(name)}</field><comment pinned="false" h="80" w="160">이 함수를 설명하세요...</comment><statement name="STACK">${stackXml}</statement></block>`;
}
function defReturn(name, args, stackXml, returnXml, y) {
  const mutation = args.map((a) => `<arg name="${esc(a.name)}" varid="${a.id}"></arg>`).join("");
  const stack = stackXml ? `<statement name="STACK">${stackXml}</statement>` : "";
  return `<block type="procedures_defreturn" id="${uid()}" x="0" y="${y}"><mutation>${mutation}</mutation><field name="NAME">${esc(name)}</field><comment pinned="false" h="80" w="160">이 함수를 설명하세요...</comment>${stack}<value name="RETURN">${returnXml}</value></block>`;
}
function callNoReturn(name, args, argXmls) {
  const mutation = args.map((a) => `<arg name="${esc(a.name)}"></arg>`).join("");
  const values = argXmls.map((x, i) => `<value name="ARG${i}">${x}</value>`).join("");
  return `<block type="procedures_callnoreturn" id="${uid()}"><mutation name="${esc(name)}">${mutation}</mutation>${values}</block>`;
}
function callReturn(name, args, argXmls) {
  const mutation = args.map((a) => `<arg name="${esc(a.name)}"></arg>`).join("");
  const values = argXmls.map((x, i) => `<value name="ARG${i}">${x}</value>`).join("");
  return `<block type="procedures_callreturn" id="${uid()}"><mutation name="${esc(name)}">${mutation}</mutation>${values}</block>`;
}

function writeGen(fileName, projectName, variables, bodyXml) {
  const varsXml = variables.length
    ? `<variables>${variables.map((v) => `<variable id="${v.id}">${esc(v.name)}</variable>`).join("")}</variables>`
    : "";
  const blockXml = `<xml xmlns="https://developers.google.com/blockly/xml">${varsXml}${bodyXml}</xml>`;
  const scene = JSON.parse(JSON.stringify(template.scenes[0]));
  scene.sceneId = `scene_${uid(8).toLowerCase()}`;
  scene.blockXml = blockXml;
  const out = { ...template, projectName, createTimestamp: Date.now() / 1000, scenes: [scene] };
  writeFileSync(join(outDir, fileName), JSON.stringify(out, null, 4));
  console.log("생성:", fileName);
}

const V = (name) => ({ name, id: uid() });

// ---------- 문제 2: 제곱 구하기 (매개변수 + 반환값) ----------
{
  const x = V("x");
  const fn = "제곱 구하기";
  const main = startClick(chain(
    chat(callReturn(fn, [x], [numBlock(2)])),
    chat(callReturn(fn, [x], [numBlock(3)])),
    chat(callReturn(fn, [x], [prompt("수를 입력해주세요: ")]))
  ));
  const def = defReturn(fn, [x], "", arith("MULTIPLY", getVar(x), getVar(x)), 300);
  writeGen("problem-2.gen", "따라하기2 제곱 구하기 (답안)", [x], main + def);
}

// ---------- 문제 3: 거듭제곱 (반복문 + 반환값) ----------
{
  const x = V("x"), y = V("y"), result = V("결과"), i = V("i");
  const fn = "거듭제곱 구하기";
  const stack = chain(
    setVar(result, numBlock(1)),
    forLoop(i, 1, getVar(y), setVar(result, arith("MULTIPLY", getVar(result), getVar(x))))
  );
  const def = defReturn(fn, [x, y], stack, getVar(result), 340);
  const main = startClick(chain(
    chat(callReturn(fn, [x, y], [numBlock(2), numBlock(10)])),
    chat(callReturn(fn, [x, y], [prompt("밑(x)을 입력해주세요: "), prompt("지수(y)를 입력해주세요: ")]))
  ));
  writeGen("problem-3.gen", "미션1 거듭제곱 구하기 (답안)", [x, y, result, i], main + def);
}

// ---------- 문제 4: 구구단 (반복문) ----------
{
  const dan = V("단"), i = V("i");
  const fn = "구구단";
  const line = textJoin([getVar(dan), textBlock(" × "), getVar(i), textBlock(" = "), arith("MULTIPLY", getVar(dan), getVar(i))]);
  const def = defNoReturn(fn, [dan], forLoop(i, 1, 9, chat(line)), 300);
  const main = startClick(callNoReturn(fn, [dan], [prompt("몇 단을 출력할까요?")]));
  writeGen("problem-4.gen", "미션2 구구단 구하기 (답안)", [dan, i], main + def);
}

// ---------- 문제 5: 단 제외 구구단 (이중 반복 + 조건 + 함수 재사용) ----------
{
  const dan = V("단"), i = V("i"), skip = V("제외할 단"), j = V("j");
  const gugudan = "구구단";
  const fnSkip = "단 제외 구구단";
  const gugudanDef = defNoReturn(
    gugudan, [dan],
    forLoop(i, 1, 9,
      chat(textJoin([getVar(dan), textBlock(" × "), getVar(i), textBlock(" = "), arith("MULTIPLY", getVar(dan), getVar(i))]))),
    300
  );
  const skipDef = defNoReturn(
    fnSkip, [skip],
    forLoop(j, 2, 9,
      ifBlock(compare("NEQ", getVar(j), getVar(skip)), callNoReturn(gugudan, [dan], [getVar(j)]))),
    620
  );
  const main = startClick(callNoReturn(fnSkip, [skip], [prompt("몇 단을 제외할까요?")]));
  writeGen("problem-5.gen", "미션3 단 제외 구구단 (답안)", [dan, i, skip, j], main + gugudanDef + skipDef);
}

// ---------- 문제 6: 3의 배수 판별 (나머지 연산) — ⚠️ TTS 블록은 말하기로 임시 대체 ----------
{
  const n = V("수");
  const fn = "삼의 배수 판별";
  const def = defNoReturn(
    fn, [n],
    ifElse(
      compare("EQ", modulo(getVar(n), numBlock(3)), numBlock(0)),
      chatText("3의 배수예요, 짝!"),
      chatText("3의 배수가 아니에요")
    ),
    300
  );
  const main = startClick(callNoReturn(fn, [n], [prompt("숫자를 입력해주세요: ")]));
  writeGen("problem-6.gen", "미션4 3의 배수 판별 (답안·TTS 블록 교체 필요)", [n], main + def);
}

// ---------- 문제 7: 소수 판별 (반복문 + 나머지 연산) — ⚠️ 지니야 호출어 블록은 시작 이벤트로 임시 대체 ----------
// 중학생 수준 알고리즘: 1부터 수까지 반복하며 나누어떨어지면 약수 개수 +1,
// 반복이 끝나고 약수 개수가 2면 소수 (1도 자연히 걸러짐 — 예외 처리 불필요)
{
  const n = V("수"), i = V("i"), count = V("약수 개수");
  const fn = "소수 판별";
  const loop = forLoop(i, 1, getVar(n),
    ifBlock(
      compare("EQ", modulo(getVar(n), getVar(i)), numBlock(0)),
      setVar(count, arith("ADD", getVar(count), numBlock(1)))
    ));
  const judge = ifElse(compare("EQ", getVar(count), numBlock(2)),
    chatText("소수가 맞아요!"), chatText("소수가 아니에요"));
  const body = chain(setVar(count, numBlock(0)), loop, judge);
  const def = defNoReturn(fn, [n], body, 340);
  const main = startClick(callNoReturn(fn, [n], [prompt("숫자를 입력해주세요: ")]));
  writeGen("problem-7.gen", "미션5 소수 판별 (답안·지니야 호출어 블록 교체 필요)", [n, i, count], main + def);
}

console.log("완료:", outDir);
