// .gen(Blockly XML) → 사람이 읽는 의사코드 변환기
//
// AI 채점 정확도·비용을 위해, 무작위 블록 ID와 XML 노이즈를 걷어내고
// 로직만 담은 의사코드로 변환한다. 순수 결정적 파싱(AI 미사용).
//
// 지원 블록: 코디니 codex에서 확인된 타입들. 미지원 블록은 [블록:type] 으로 표기해
// 정보 손실을 감춘다(채점 AI가 "알 수 없는 블록 사용"으로 인지 가능).

type XmlNode = {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text?: string;
};

// --- 아주 작은 XML 파서 (Blockly 서브셋 전용) ---
function parseXml(xml: string): XmlNode | null {
  let i = 0;
  const n = xml.length;

  function skipWs() {
    while (i < n && /\s/.test(xml[i])) i++;
  }
  function parseNode(): XmlNode | null {
    skipWs();
    if (xml[i] !== "<") return null;
    i++; // <
    if (xml[i] === "/") return null; // closing handled by caller
    let tag = "";
    while (i < n && /[^\s/>]/.test(xml[i])) tag += xml[i++];
    const attrs: Record<string, string> = {};
    // attributes
    while (i < n) {
      skipWs();
      if (xml[i] === ">" || xml[i] === "/") break;
      let name = "";
      while (i < n && /[^\s=]/.test(xml[i])) name += xml[i++];
      skipWs();
      if (xml[i] === "=") {
        i++;
        skipWs();
        const q = xml[i++];
        let val = "";
        while (i < n && xml[i] !== q) val += xml[i++];
        i++; // closing quote
        attrs[name] = decode(val);
      } else {
        attrs[name] = "";
      }
    }
    const node: XmlNode = { tag, attrs, children: [] };
    if (xml[i] === "/") {
      i += 2; // />
      return node;
    }
    i++; // >
    // children / text
    let text = "";
    while (i < n) {
      if (xml[i] === "<") {
        if (xml[i + 1] === "/") {
          // closing tag
          while (i < n && xml[i] !== ">") i++;
          i++;
          break;
        }
        const child = parseNode();
        if (child) node.children.push(child);
      } else {
        text += xml[i++];
      }
    }
    const t = decode(text).trim();
    if (t) node.text = t;
    return node;
  }
  return parseNode();
}

function decode(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// --- 헬퍼: 특정 자식 찾기 ---
const kids = (node: XmlNode, tag: string) => node.children.filter((c) => c.tag === tag);
const kidByName = (node: XmlNode, tag: string, name: string) =>
  node.children.find((c) => c.tag === tag && c.attrs.name === name);
const fieldVal = (node: XmlNode, name: string) => kidByName(node, "field", name)?.text ?? "";

// value/statement 슬롯 안의 "실제 블록"(shadow가 아닌 block 우선) 하나
function slotBlock(node: XmlNode, slotName: string): XmlNode | undefined {
  const slot = kidByName(node, "value", slotName) ?? kidByName(node, "statement", slotName);
  if (!slot) return undefined;
  return slot.children.find((c) => c.tag === "block") ?? slot.children.find((c) => c.tag === "shadow");
}

const OP: Record<string, string> = {
  ADD: "+", MINUS: "−", MULTIPLY: "×", DIVIDE: "÷", POWER: "^",
  EQ: "=", NEQ: "≠", LT: "<", LTE: "≤", GT: ">", GTE: "≥",
  AND: "그리고", OR: "또는",
};

// 데이터셋 ID → 이름 (genToPseudo 시작 시 채워진다). 의사코드에 사람이 읽는 이름을 쓰기 위함.
let datasetNames: Record<string, string> = {};

// 값(식) 블록 → 문자열
function expr(node: XmlNode | undefined): string {
  if (!node) return "___";
  switch (node.tag === "shadow" || node.tag === "block" ? node.attrs.type : node.tag) {
    case "math_number":
      return fieldVal(node, "NUM") || "0";
    case "text":
      return `"${fieldVal(node, "TEXT")}"`;
    case "logic_boolean":
      return fieldVal(node, "BOOL") === "TRUE" ? "참" : "거짓";
    case "logic_null":
      return "없음";
    case "variables_get":
      return fieldVal(node, "VAR");
    case "stt":
      return `음성으로 듣기(${fieldVal(node, "LANG") || "ko-KR"})`;
    case "dataset_search": {
      const id = fieldVal(node, "_USERDATASET_");
      const name = datasetNames[id];
      return `데이터셋${name ? `"${name}"` : ""}에서 ${expr(slotBlock(node, "QUERY"))} 찾기`;
    }
    case "math_string_to_number":
      return `숫자로(${expr(slotBlock(node, "VALUE"))})`;
    case "translate": {
      const src = fieldVal(node, "SRC_LANG");
      const dest = fieldVal(node, "DEST_LANG");
      return `번역(${src}→${dest}: ${expr(slotBlock(node, "TEXT"))})`;
    }
    case "math_arithmetic":
      return `(${expr(slotBlock(node, "A"))} ${OP[fieldVal(node, "OP")] ?? "?"} ${expr(slotBlock(node, "B"))})`;
    case "math_modulo":
      return `(${expr(slotBlock(node, "DIVIDEND"))}를 ${expr(slotBlock(node, "DIVISOR"))}로 나눈 나머지)`;
    case "logic_compare":
      return `(${expr(slotBlock(node, "A"))} ${OP[fieldVal(node, "OP")] ?? "?"} ${expr(slotBlock(node, "B"))})`;
    case "logic_operation":
      return `(${expr(slotBlock(node, "A"))} ${OP[fieldVal(node, "OP")] ?? "?"} ${expr(slotBlock(node, "B"))})`;
    case "text_join": {
      const parts: string[] = [];
      for (let k = 0; k < 20; k++) {
        const b = slotBlock(node, `ADD${k}`);
        if (!b && !kidByName(node, "value", `ADD${k}`)) continue;
        parts.push(expr(b));
      }
      return parts.join(" + ");
    }
    case "text_custom_concat":
      return `${expr(slotBlock(node, "TEXT1"))} + ${expr(slotBlock(node, "TEXT2"))}`;
    case "misc_prompt":
      return `묻고답기다리기("${fieldVal(slotBlock(node, "TITLE") ?? node, "TEXT")}")`;
    case "procedures_callreturn": {
      const mut = kids(node, "mutation")[0];
      const args = collectCallArgs(node);
      return `${mut?.attrs.name ?? "함수"}(${args.join(", ")})`;
    }
    default:
      return `[식:${node.attrs.type ?? node.tag}]`;
  }
}

function collectCallArgs(node: XmlNode): string[] {
  const args: string[] = [];
  for (let k = 0; k < 10; k++) {
    const slot = kidByName(node, "value", `ARG${k}`);
    if (!slot) break;
    args.push(expr(slotBlock(node, `ARG${k}`)));
  }
  return args;
}

// 문(statement) 스택 → 줄 배열 (indent 단계)
function statements(first: XmlNode | undefined, indent: number): string[] {
  const out: string[] = [];
  let cur: XmlNode | undefined = first;
  const pad = "  ".repeat(indent);
  while (cur) {
    const type = cur.attrs.type;
    switch (type) {
      case "misc_chat":
        out.push(`${pad}말하기(${expr(slotBlock(cur, "MSG"))})`);
        break;
      case "tts_play_text":
        out.push(`${pad}음성으로 말하기(${expr(slotBlock(cur, "TEXT"))})`);
        break;
      case "variables_set":
        out.push(`${pad}${fieldVal(cur, "VAR")} = ${expr(slotBlock(cur, "VALUE"))}`);
        break;
      case "controls_custom_for":
      case "controls_for": {
        const v = fieldVal(cur, "VAR");
        out.push(`${pad}반복: ${v} = ${expr(slotBlock(cur, "FROM"))} 부터 ${expr(slotBlock(cur, "TO"))} 까지`);
        out.push(...statements(slotBlock(cur, "DO"), indent + 1));
        break;
      }
      case "controls_repeat_ext":
        out.push(`${pad}반복: ${expr(slotBlock(cur, "TIMES"))}번`);
        out.push(...statements(slotBlock(cur, "DO"), indent + 1));
        break;
      case "controls_custom_while_infinity":
        out.push(`${pad}계속 반복:`);
        out.push(...statements(slotBlock(cur, "DO"), indent + 1));
        break;
      case "controls_whileUntil":
        out.push(`${pad}반복(조건): ${expr(slotBlock(cur, "BOOL"))}`);
        out.push(...statements(slotBlock(cur, "DO"), indent + 1));
        break;
      case "controls_if": {
        const hasElse = kids(cur, "mutation")[0]?.attrs.else === "1";
        out.push(`${pad}만약 ${expr(slotBlock(cur, "IF0"))} 이면:`);
        out.push(...statements(slotBlock(cur, "DO0"), indent + 1));
        if (hasElse) {
          out.push(`${pad}아니면:`);
          out.push(...statements(slotBlock(cur, "ELSE"), indent + 1));
        }
        break;
      }
      case "procedures_callnoreturn": {
        const mut = kids(cur, "mutation")[0];
        out.push(`${pad}${mut?.attrs.name ?? "함수"}(${collectCallArgs(cur).join(", ")}) 호출`);
        break;
      }
      case "kws_loop":
        out.push(`${pad}호출어 "${fieldVal(cur, "KEYWORD")}" 인식되면:`);
        out.push(...statements(slotBlock(cur, "DO0"), indent + 1));
        break;
      case "eventloop_object_start_click":
        out.push(`${pad}[시작하기 클릭했을 때]`);
        break;
      default:
        out.push(`${pad}[블록:${type}]`);
    }
    // 다음(next)
    const nextWrap = kids(cur, "next")[0];
    cur = nextWrap?.children.find((c) => c.tag === "block");
  }
  return out;
}

/** .gen JSON 문자열 → 의사코드 (실패 시 예외) */
export function genToPseudo(genJsonText: string): string {
  const data = JSON.parse(genJsonText);
  // 데이터셋 ID→이름 매핑 준비 (dataset_search 블록을 사람이 읽는 이름으로 표기)
  datasetNames = {};
  for (const ds of data.userDatasets ?? []) {
    if (ds?.datasetId) datasetNames[ds.datasetId] = ds.datasetName ?? ds.datasetId;
  }
  const scenes: { blockXml?: string }[] = data.scenes ?? [];
  const out: string[] = [];

  for (const scene of scenes) {
    if (!scene.blockXml) continue;
    const root = parseXml(scene.blockXml);
    if (!root) continue;

    // 최상위 block들: 함수 정의(procedures_def*)와 실행 스택(eventloop_* 등)으로 분리
    const topBlocks = root.children.filter((c) => c.tag === "block");
    const defs = topBlocks.filter((b) => b.attrs.type?.startsWith("procedures_def"));
    const mains = topBlocks.filter((b) => !b.attrs.type?.startsWith("procedures_def"));

    for (const def of defs) {
      const name = fieldVal(def, "NAME");
      const mut = kids(def, "mutation")[0];
      const args = mut ? kids(mut, "arg").map((a) => a.attrs.name) : [];
      const isReturn = def.attrs.type === "procedures_defreturn";
      out.push(`함수 ${name}(${args.join(", ")})${isReturn ? " [값을 반환]" : ""}:`);
      out.push(...statements(slotBlock(def, "STACK"), 1));
      if (isReturn) out.push(`  반환 ${expr(slotBlock(def, "RETURN"))}`);
      out.push("");
    }

    for (const main of mains) {
      out.push(...statements(main, 0));
    }
  }

  return out.join("\n").trim() || "(빈 프로젝트)";
}
