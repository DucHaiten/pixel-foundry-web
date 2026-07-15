import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  author: "Bạn" | "PIXEL FOUNDRY";
  time: string;
  avatar: string;
  body: string;
  kind?: "normal" | "brief";
};

type StyleBrief = {
  genre: string;
  world: string;
  platform: string;
  camera: string;
  scale: string;
  detail: string;
  lighting: string;
  palette: string;
  materials: string;
  wear: string;
  shape: string;
  realism: string;
  avoid: string;
  tags: string[];
  colors: string[];
};

type Project = {
  id: string;
  name: string;
  meta: string;
  progress: number;
  ready: boolean;
  generated: boolean;
  generatedSrc?: string;
  generatedName?: string;
  generatedMeta?: string;
  brief: StyleBrief;
  messages: Message[];
};

type RequestAnalysis = {
  brief: StyleBrief;
  progress: number;
  ready: boolean;
  concreteAsset: boolean;
  styleReady: boolean;
  technicalReady: boolean;
  generationIntent: boolean;
  threeViews: boolean;
  maleCharacter: boolean;
  has116: boolean;
  wristComputer: boolean;
  poseReady: boolean;
  canvas: string;
  summary: string;
};

const ashfallBrief: StyleBrief = {
  genre: "Sinh tồn hậu tận thế",
  world: "Thành phố đổ nát, khan hiếm",
  platform: "Mobile cổ điển",
  camera: "Top-down 3/4",
  scale: "Nhân vật nhỏ / dễ đọc",
  detail: "Vừa phải",
  lighting: "Rim light cứng",
  palette: "Olive trầm, soot, bone",
  materials: "Vải thô, kim loại xước",
  wear: "Bạc màu, rách, bám bụi",
  shape: "Gọn, chắc, silhouette rõ",
  realism: "Cách điệu thực dụng",
  avoid: "Không blur, AA, chữ, watermark",
  tags: ["Top-down 3/4", "32×48 px", "Olive trầm", "Rim light cứng"],
  colors: ["#171a16", "#263021", "#46503b", "#6e7655", "#9b885c", "#756044", "#aaa28a", "#e7e0cc"],
};

const starterBrief: StyleBrief = {
  genre: "Đang khám phá",
  world: "Chưa xác lập",
  platform: "Chưa xác lập",
  camera: "Chưa xác lập",
  scale: "Chưa xác lập",
  detail: "Chưa xác lập",
  lighting: "Chưa xác lập",
  palette: "Chưa xác lập",
  materials: "Chưa xác lập",
  wear: "Chưa xác lập",
  shape: "Chưa xác lập",
  realism: "Chưa xác lập",
  avoid: "Blur, watermark, chữ ngoài yêu cầu",
  tags: ["Đang nghe ý tưởng", "Chưa khóa camera", "Chưa khóa palette", "Chưa khóa tỷ lệ"],
  colors: ["#171a16", "#293127", "#565f44", "#7e8765", "#9b8f6d", "#c5baa0", "#d8cfb9", "#e7e0cc"],
};

const initialProjects: Project[] = [
  {
    id: "ashfall",
    name: "Ashfall Protocol",
    meta: "Đang hoạt động",
    progress: 82,
    ready: false,
    generated: false,
    brief: ashfallBrief,
    messages: [
      {
        id: "a1",
        author: "Bạn",
        time: "10:21",
        avatar: "SR",
        body: "Tạo sprite top-down 3/4 cho một người sống sót trong bối cảnh hậu tận thế. Mặc áo khoác kaki rách, balo cũ, cầm súng ngắn.",
      },
      {
        id: "a2",
        author: "PIXEL FOUNDRY",
        time: "10:22",
        avatar: "PF",
        body: "Mình hiểu hướng chính. Bạn muốn kích thước và nhịp hình ảnh thế nào? Có yêu cầu cụ thể về palette hoặc ánh sáng không?",
      },
      {
        id: "a3",
        author: "Bạn",
        time: "10:23",
        avatar: "SR",
        body: "Top-down 3/4, 32×48 px. Bảng màu olive trầm, viền sáng cứng. Phong cách hậu tận thế cho game mobile cổ điển.",
      },
      {
        id: "a4",
        author: "PIXEL FOUNDRY",
        time: "10:24",
        avatar: "PF",
        body: "Đã gom thành Style Brief. Trước khi tạo: đây là sprite tĩnh hay sprite sheet? Nếu là sheet, mình cần số hướng và animation chính.",
      },
    ],
  },
  {
    id: "ruin",
    name: "Ruin March",
    meta: "Bản nháp",
    progress: 34,
    ready: false,
    generated: false,
    brief: { ...starterBrief, genre: "Tactical fantasy", world: "Biên thành đang khám phá" },
    messages: [{ id: "r1", author: "PIXEL FOUNDRY", time: "09:12", avatar: "PF", body: "Mình đang nghe. Hãy kể về nơi người chơi sẽ đặt chân tới đầu tiên — cảm giác quan trọng hơn thông số lúc này." }],
  },
  {
    id: "dustline",
    name: "Dustline Rebirth",
    meta: "Bản nháp",
    progress: 21,
    ready: false,
    generated: false,
    brief: { ...starterBrief, genre: "Sci-fi hoang mạc" },
    messages: [{ id: "d1", author: "PIXEL FOUNDRY", time: "08:47", avatar: "PF", body: "Bạn đang hình dung Dustline là một thế giới nóng, khô và công nghiệp — hay bí ẩn, lạnh và xa lạ hơn?" }],
  },
  {
    id: "echo",
    name: "Echo Wastes",
    meta: "Đã lưu trữ",
    progress: 67,
    ready: false,
    generated: false,
    brief: { ...starterBrief, genre: "Hậu tận thế", world: "Vùng đất nhiễm xạ" },
    messages: [{ id: "e1", author: "PIXEL FOUNDRY", time: "14:06", avatar: "PF", body: "Dự án này đã lưu trữ. Style Brief vẫn ở đây để bạn sao chép sang một chat mới khi muốn tiếp tục." }],
  },
];

function PixelMark() {
  return <span className="pixel-mark" aria-hidden="true"><span /></span>;
}

function now() {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
}

function foldText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function userConversation(messages: Message[]) {
  return foldText(messages.filter((message) => message.author === "Bạn").map((message) => message.body).join("\n"));
}

function analyzeConversation(messages: Message[], currentBrief: StyleBrief, mode: "sheet" | "single"): RequestAnalysis {
  const text = userConversation(messages);
  const miniDayz = /mini\s*dayz/.test(text);
  const falloutDirection = /\bfallout\b|\bvault\s*116\b|pip\s*boy/.test(text);
  const skyrimDirection = /\bskyrim\b|fantasy bac au/.test(text);
  const diabloDirection = /\bdiablo\b|dark\s*fantasy|gothic ta di/.test(text);
  const genericFantasyDirection = !skyrimDirection && !diabloDirection && /\bfantasy\b|trung co phep thuat/.test(text);
  const explicitCanvas = text.match(/(\d{2,3})\s*[x×]\s*(\d{2,3})/);
  const canvas = explicitCanvas ? `${explicitCanvas[1]}×${explicitCanvas[2]} px / hướng` : miniDayz ? "32×48 px / hướng" : "Chưa khóa";
  const character = /nhan vat|character|nguoi song sot|main\s*character/.test(text);
  const item = /\bitem\b|vat pham|vu khi|sung|kiem|khien/.test(text);
  const prop = /\bprop\b|cong trinh|moi truong|environment|tile|icon|\bui\b/.test(text);
  const concreteAsset = character || item || prop;
  const maleCharacter = character && /nhan vat[^\n]{0,40}\bnam\b|nhan vat chinh nam|male/.test(text);
  const has116 = /\b116\b/.test(text);
  const wristComputer = /pip\s*boy|may tinh deo tay|thiet bi[^\n]{0,30}co tay/.test(text);
  const threeViews = /(ba|3)\s*huong/.test(text) || (/mat truoc|front/.test(text) && /mat sau|back/.test(text) && /mat ngang|side|profile/.test(text));
  const animationSpecified = /\bidle\b|\bwalk\b|di bo|chay|tan cong|attack|\d+\s*frame/.test(text);
  const poseReady = /dang dung thang|dung thang|hai tay[^\n]{0,35}dang|a-pose|t-pose/.test(text);
  const existingStyle = currentBrief.genre !== "Đang khám phá" && currentBrief.camera !== "Chưa xác lập";
  const styleReady = miniDayz || existingStyle || (/pixel\s*art|game\s*pixel/.test(text) && /top[ -]?down|3\/4|goc nhin/.test(text));
  const technicalReady = mode === "single"
    ? (poseReady || miniDayz) && canvas !== "Chưa khóa"
    : (threeViews || animationSpecified) && canvas !== "Chưa khóa";
  const generationIntent = concreteAsset && /(tao|lam|generate|tien hanh|bat dau|xuat asset|cho (toi )?nhan vat|cho [^\n]{0,45} di\b)/.test(text);

  let brief = currentBrief;
  if (falloutDirection) {
    brief = {
      ...brief,
      genre: "Sinh tồn hậu tận thế retro-futurist",
      world: "Vault khép kín và vùng hoang địa; công nghiệp cũ, bụi bặm, phóng xạ, công nghệ suy tàn",
      materials: "Vải kỹ thuật bạc màu, cao su cũ, kim loại xước",
      wear: "Thiếu thốn, bám bụi, sờn mép, sửa chữa chắp vá",
      shape: "Công nghiệp tròn-vuông, silhouette nhỏ nhưng rõ",
      realism: "Cách điệu thực dụng, dễ đọc trong gameplay",
      avoid: "Không sao chép logo, UI, nhân vật hoặc thiết bị nguyên bản; không blur, AA, watermark",
    };
  } else if (skyrimDirection) {
    brief = {
      ...brief,
      genre: "Fantasy Bắc Âu u tối",
      world: "Trung cổ lạnh giá, cổ xưa, ma thuật tiết chế và thực dụng",
      materials: "Đá thô, gỗ sẫm, sắt rèn, da và lông thú",
      wear: "Mòn cạnh, ám khói, sửa chữa thủ công",
      shape: "Nặng, chắc, rune hình học nguyên bản, silhouette dễ đọc",
      realism: "Cách điệu bán hiện thực",
      avoid: "Không sao chép nhân vật, biểu tượng, bản đồ, UI hoặc asset cụ thể; không blur, AA, watermark",
    };
  } else if (diabloDirection) {
    brief = {
      ...brief,
      genre: "Dark fantasy gothic",
      world: "Tà dị, tôn giáo suy tàn, kiến trúc nhọn và tương phản mạnh",
      materials: "Sắt đen, đá ẩm, xương, da cháy và vải mục",
      wear: "Nứt, cháy sém, rỉ máu, ăn mòn",
      shape: "Gai nhọn, vòm gothic, khối nặng và bất an",
      realism: "Cách điệu đen tối, ưu tiên silhouette",
      avoid: "Không sao chép nhân vật, biểu tượng, UI hoặc asset cụ thể; không blur, AA, watermark",
    };
  } else if (genericFantasyDirection) {
    brief = {
      ...brief,
      genre: "Fantasy trung cổ phép thuật",
      world: "Thế giới trung cổ dễ đọc, phép thuật nhất quán và phiêu lưu",
      materials: "Đá, gỗ, sắt rèn, da và tinh thể phép thuật",
      wear: "Mòn tự nhiên, sửa chữa thủ công",
      shape: "Silhouette rõ, hình khối thân thiện với gameplay",
      realism: "Cách điệu vừa phải",
    };
  }
  if (miniDayz) {
    brief = {
      ...brief,
      platform: "Mobile cổ điển",
      camera: "Top-down 3/4 hơi nghiêng",
      scale: "Nhân vật nhỏ, hình khối gọn",
      detail: "Vừa phải, ưu tiên silhouette",
      lighting: "Tương phản vừa, cụm sáng gọn",
      palette: falloutDirection ? "Trầm, xanh vault cũ, vàng xỉn, soot" : "Trầm, earth tone, điểm nhấn tiết chế",
      tags: ["Top-down 3/4", canvas.replace(" / hướng", ""), "Mobile cổ điển", "Palette trầm"],
    };
  }

  const progress = Math.min(98,
    18 +
    (falloutDirection || skyrimDirection || diabloDirection || genericFantasyDirection ? 18 : 0) +
    (styleReady ? 27 : 0) +
    (concreteAsset ? 20 : 0) +
    (technicalReady ? 12 : 0) +
    (generationIntent ? 5 : 0),
  );
  const ready = styleReady && concreteAsset && technicalReady && generationIntent;
  const assetParts = [
    maleCharacter ? "nhân vật chính nam" : character ? "nhân vật" : item ? "vật phẩm" : prop ? "asset môi trường/UI" : "asset chưa xác định",
    threeViews ? "ba hướng: trước, sau, ngang" : mode === "single" ? "sprite đơn" : "sprite sheet",
    poseReady ? "đứng thẳng, hai tay hơi dang" : "tư thế chưa khóa",
    has116 ? "số 116 ở lưng" : "",
    wristComputer ? "máy tính đeo cổ tay trái kiểu retro-futurist, thiết kế nguyên bản" : "",
    canvas,
  ].filter(Boolean);

  return {
    brief,
    progress,
    ready,
    concreteAsset,
    styleReady,
    technicalReady,
    generationIntent,
    threeViews,
    maleCharacter,
    has116,
    wristComputer,
    poseReady,
    canvas,
    summary: assetParts.join("; "),
  };
}

const digitGlyphs: Record<string, string[]> = {
  "1": ["010", "110", "010", "010", "111"],
  "6": ["011", "100", "111", "101", "111"],
};

function drawDigits(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, color: string) {
  let cursor = x;
  ctx.fillStyle = color;
  for (const digit of value) {
    const glyph = digitGlyphs[digit];
    if (!glyph) continue;
    glyph.forEach((row, rowIndex) => [...row].forEach((pixel, columnIndex) => {
      if (pixel === "1") ctx.fillRect(cursor + columnIndex, y + rowIndex, 1, 1);
    }));
    cursor += 4;
  }
}

function drawCharacterFrame(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, view: "front" | "back" | "side", details: RequestAnalysis) {
  const px = (color: string, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(offsetX + x, offsetY + y, width, height);
  };
  const outline = "#171a18";
  const hair = "#302923";
  const skin = "#b98560";
  const suit = "#27445a";
  const suitLight = "#385f78";
  const yellow = "#c7a63d";
  const boot = "#292a26";
  const screen = "#59c4b4";

  if (view === "side") {
    px(outline, 12, 4, 10, 11); px(hair, 13, 5, 8, 3); px(skin, 14, 8, 8, 6); px(skin, 21, 10, 2, 2);
    px(outline, 11, 14, 11, 17); px(suit, 12, 15, 9, 15); px(suitLight, 18, 16, 3, 12); px(yellow, 12, 15, 2, 14);
    px(outline, 8, 16, 4, 16); px(suit, 9, 17, 3, 13); px(skin, 9, 30, 3, 3);
    if (details.wristComputer) { px(outline, 7, 22, 5, 7); px("#40544d", 8, 23, 4, 5); px(screen, 8, 24, 2, 2); }
    px(outline, 12, 30, 10, 15); px(suit, 13, 31, 4, 12); px(suitLight, 18, 31, 3, 12); px(boot, 12, 43, 6, 3); px(boot, 18, 43, 6, 3);
    return;
  }

  px(outline, 10, 4, 12, 11); px(hair, 11, 5, 10, view === "back" ? 5 : 3); px(skin, 11, 8, 10, 6);
  if (view === "front") { px("#27221f", 13, 10, 1, 1); px("#27221f", 18, 10, 1, 1); }
  px(outline, 9, 14, 14, 17); px(suit, 10, 15, 12, 15); px(suitLight, 15, 15, 2, 14); px(yellow, 10, 15, 2, 14); px(yellow, 20, 15, 2, 14);
  px(outline, 6, 15, 4, 17); px(suit, 7, 16, 3, 14); px(skin, 7, 30, 3, 3);
  px(outline, 22, 15, 4, 17); px(suit, 22, 16, 3, 14); px(skin, 22, 30, 3, 3);
  if (details.wristComputer && view === "front") { px(outline, 21, 22, 6, 7); px("#40544d", 21, 23, 5, 5); px(screen, 23, 24, 2, 2); }
  if (details.wristComputer && view === "back") { px(outline, 5, 22, 6, 7); px("#40544d", 6, 23, 5, 5); px(screen, 7, 24, 2, 2); }
  if (view === "back" && details.has116) drawDigits(ctx, "116", offsetX + 10, offsetY + 19, "#dfc65a");
  px(outline, 10, 30, 12, 16); px(suit, 11, 31, 4, 13); px(suit, 17, 31, 4, 13); px(boot, 10, 43, 6, 3); px(boot, 17, 43, 6, 3);
}

function createPixelAsset(project: Project, mode: "sheet" | "single") {
  const analysis = analyzeConversation(project.messages, project.brief, mode);
  const views: Array<"front" | "back" | "side"> = analysis.threeViews ? ["front", "back", "side"] : ["front"];
  const frameWidth = 32;
  const frameHeight = 48;
  const padding = 2;
  const gap = 2;
  const canvas = document.createElement("canvas");
  canvas.width = padding * 2 + views.length * frameWidth + (views.length - 1) * gap;
  canvas.height = padding * 2 + frameHeight;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  views.forEach((view, index) => drawCharacterFrame(ctx, padding + index * (frameWidth + gap), padding, view, analysis));
  const alphaVerified = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
  return {
    src: canvas.toDataURL("image/png"),
    name: analysis.has116 ? "vault-116-character-3view.png" : "pixel-character-sheet.png",
    meta: `${canvas.width}×${canvas.height} PX · ${views.length} FRAME · CELL 32×48 · ANCHOR 16,46 · PAD 2 PX`,
    alphaVerified,
  };
}

function briefText(project: Project) {
  const b = project.brief;
  return [
    `STYLE BRIEF — ${project.name}`,
    `Thể loại: ${b.genre}`,
    `Bầu không khí / thế giới: ${b.world}`,
    `Nền tảng: ${b.platform}`,
    `Camera: ${b.camera}`,
    `Tỷ lệ: ${b.scale}`,
    `Chi tiết: ${b.detail}`,
    `Ánh sáng: ${b.lighting}`,
    `Palette: ${b.palette}`,
    `Chất liệu: ${b.materials}`,
    `Hao mòn: ${b.wear}`,
    `Ngôn ngữ hình khối: ${b.shape}`,
    `Hiện thực hóa: ${b.realism}`,
    `Tránh: ${b.avoid}`,
    "",
    "Quy tắc xuất: transparent PNG thật sự, isolated asset, alpha channel, no background, no checkerboard, no fake transparency; cạnh pixel sắc nét; không blur; không anti-aliasing ngoài ý muốn; không watermark; không chữ nếu chưa yêu cầu.",
    "Lưu ý: brief này chỉ thuộc dự án/chat hiện tại. Hãy sao chép toàn bộ brief sang chat mới để tiếp tục nhất quán.",
  ].join("\n");
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeId, setActiveId] = useState("ashfall");
  const [composer, setComposer] = useState("");
  const [mode, setMode] = useState<"sheet" | "single">("sheet");
  const [replying, setReplying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<"workshop" | "assets" | "export">("workshop");
  const messageListRef = useRef<HTMLDivElement>(null);

  const project = useMemo(
    () => projects.find((item) => item.id === activeId) ?? projects[0],
    [projects, activeId],
  );
  const locked = lockedIds.includes(project.id);
  const assetCount = project.generated ? 2 : 1;

  const updateProject = (id: string, updater: (item: Project) => Project) => {
    setProjects((current) => current.map((item) => item.id === id ? updater(item) : item));
  };

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  };

  const selectProject = (id: string) => {
    setActiveId(id);
    setComposer("");
    setActiveNav("workshop");
  };

  const createProject = () => {
    const id = `project-${Date.now()}`;
    const newProject: Project = {
      id,
      name: "Dự án chưa đặt tên",
      meta: "Đang khám phá",
      progress: 14,
      ready: false,
      generated: false,
      brief: { ...starterBrief },
      messages: [{
        id: `${id}-hello`,
        author: "PIXEL FOUNDRY",
        time: now(),
        avatar: "PF",
        body: "Bắt đầu tự nhiên nhé. Game này khiến người chơi cảm thấy thế nào, và hình ảnh đầu tiên bạn đang nhìn thấy trong đầu là gì?",
      }],
    };
    setProjects((current) => [...current, newProject]);
    setActiveId(id);
    setComposer("");
    flash("Đã mở một dự án game riêng");
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = composer.trim();
    if (!text || replying) return;

    const targetId = project.id;
    const userMessage: Message = { id: `u-${Date.now()}`, author: "Bạn", time: now(), avatar: "SR", body: text };
    updateProject(targetId, (item) => ({ ...item, messages: [...item.messages, userMessage], meta: "Chưa lưu thay đổi" }));
    setComposer("");
    setReplying(true);

    window.setTimeout(() => {
      updateProject(targetId, (item) => {
        const messages = item.messages.some((message) => message.id === userMessage.id)
          ? item.messages
          : [...item.messages, userMessage];
        const fullText = userConversation(messages);
        const analysis = analyzeConversation(messages, item.brief, mode);
        const clashes = item.progress >= 70 && /kawaii|pastel|keo ngot|neon ruc|chibi vui|hoat hinh tuoi/.test(fullText);
        let response: string;

        if (clashes) {
          response = "Hướng màu tươi/kawaii đang xung đột với brief khắc nghiệt, xuống cấp và palette olive hiện tại. Bạn muốn giữ Field Kit hậu tận thế, hay chuyển toàn bộ dự án sang hướng mới? Mình sẽ chưa tạo asset cho tới khi bạn chọn.";
        } else if (analysis.ready) {
          response = [
            "Đủ rõ — mình đã cộng dồn toàn bộ mô tả trước đó và sẽ không hỏi lại các thông số bạn đã cung cấp.",
            `Style Brief chốt: ${analysis.brief.genre}; ${analysis.brief.camera}; ${analysis.brief.palette}; ${analysis.brief.detail}.`,
            `Asset: ${analysis.summary}.`,
            "Mặc định engine: mỗi hướng 32×48 px, padding 2 px, anchor chân (16,46), cạnh pixel sắc nét, không AA.",
            "Thiết bị cổ tay sẽ là thiết kế retro-futurist nguyên bản; không sao chép logo, UI hoặc mẫu thiết bị cụ thể từ thương hiệu.",
            "Yêu cầu tạo đã rõ nên nút TẠO ASSET đã mở.",
          ].join("\n\n");
        } else if (!analysis.styleReady) {
          response = "Mình đã giữ toàn bộ mô tả dự án và hướng thẩm mỹ. Điểm còn ảnh hưởng lớn tới tính nhất quán là góc nhìn game và tỷ lệ sprite; bạn có thể nêu một game tham chiếu hoặc mô tả camera tự nhiên.";
        } else if (!analysis.concreteAsset) {
          response = "Style Brief đã đủ rõ theo hướng pixel sinh tồn top-down hơi nghiêng. Asset đầu tiên bạn muốn tạo là nhân vật, item, prop, tile hay UI?";
        } else if (!analysis.technicalReady) {
          response = mode === "sheet"
            ? "Mình đã giữ mô tả nhân vật và Style Brief. Với sprite sheet, phần còn thiếu duy nhất là số hướng hoặc animation; kích thước sẽ tự dùng mặc định 32×48 px mỗi ô theo hướng Mini DayZ nếu bạn không đổi."
            : "Mình đã giữ mô tả nhân vật và Style Brief. Với sprite đơn, hãy cho mình tư thế hoặc hướng nhìn; kích thước sẽ tự dùng mặc định 32×48 px nếu bạn không đổi.";
        } else if (!analysis.generationIntent) {
          response = `Thông số đã đủ: ${analysis.summary}. Mình chưa tạo vì cuộc trò chuyện mới đang mô tả ý tưởng; khi muốn tiến hành, chỉ cần nói “tạo luôn”.`;
        } else {
          response = "Mình đã cộng dồn yêu cầu nhưng vẫn còn một điểm ảnh hưởng trực tiếp tới đầu ra. Hãy nêu phần bạn muốn mình tự chọn; mình sẽ không hỏi lại những gì đã rõ.";
        }

        const assistantMessage: Message = {
          id: `p-${Date.now()}`,
          author: "PIXEL FOUNDRY",
          time: now(),
          avatar: "PF",
          body: response,
          kind: analysis.ready && !clashes ? "brief" : "normal",
        };
        return {
          ...item,
          progress: clashes ? item.progress : analysis.progress,
          ready: analysis.ready && !clashes,
          brief: analysis.brief,
          messages: [...item.messages, assistantMessage],
        };
      });
      setReplying(false);
      window.setTimeout(() => messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: "smooth" }), 0);
    }, 650);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleGenerate = () => {
    if (!project.ready || generating) return;
    const targetId = project.id;
    const output = createPixelAsset(project, mode);
    setGenerating(true);
    window.setTimeout(() => {
      updateProject(targetId, (item) => ({
        ...item,
        progress: 100,
        ready: false,
        generated: true,
        generatedSrc: output.src,
        generatedName: output.name,
        generatedMeta: output.meta,
        meta: "Đã tạo asset",
        messages: [...item.messages, {
          id: `g-${Date.now()}`,
          author: "PIXEL FOUNDRY",
          time: now(),
          avatar: "PF",
          kind: "brief",
          body: `Đã tạo sprite sheet dùng được ngay: ${output.meta}. PNG được xuất trực tiếp từ canvas pixel, ${output.alphaVerified ? "góc nền có alpha = 0 đã được kiểm tra" : "cần kiểm tra lại kênh alpha"}; vẫn nên kiểm tra import bằng nearest-neighbor và tắt filtering trong engine.`,
        }],
      }));
      setGenerating(false);
      if (!lockedIds.includes(targetId)) setLockedIds((ids) => [...ids, targetId]);
      flash("Asset đã được đưa vào khay");
    }, 1500);
  };

  const downloadGeneratedAsset = () => {
    if (!project.generatedSrc) return;
    const anchor = document.createElement("a");
    anchor.href = project.generatedSrc;
    anchor.download = project.generatedName ?? "pixel-foundry-asset.png";
    anchor.click();
    flash("Đã tải PNG có kênh alpha");
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefText(project));
      setCopied(true);
      flash("Đã sao chép Style Brief");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      flash("Không thể truy cập clipboard — dùng nút Xuất brief");
    }
  };

  const downloadBrief = () => {
    const blob = new Blob([briefText(project)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.name.toLowerCase().replaceAll(" ", "-")}-style-brief.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash("Đã xuất Style Brief để dùng ở chat mới");
  };

  const toggleLock = () => {
    setLockedIds((ids) => ids.includes(project.id) ? ids.filter((id) => id !== project.id) : [...ids, project.id]);
    flash(locked ? "Đã mở khóa Style Brief" : "Đã khóa Style Brief trong dự án này");
  };

  const showAssets = () => {
    setActiveNav("assets");
    document.getElementById("asset-tray")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    flash(`${assetCount} asset đang có trong khay`);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><PixelMark /><span>PIXEL FOUNDRY</span></div>

        <nav className="main-nav" aria-label="Điều hướng chính">
          <button className={`nav-item ${activeNav === "workshop" ? "active" : ""}`} type="button" onClick={() => setActiveNav("workshop")}>XƯỞNG</button>
          <button className={`nav-item ${activeNav === "assets" ? "active" : ""}`} type="button" onClick={showAssets}>ASSET</button>
          <button className={`nav-item ${activeNav === "export" ? "active" : ""}`} type="button" onClick={() => { setActiveNav("export"); setExportOpen(true); }}>XUẤT</button>
        </nav>

        <button className="project-chip" type="button" aria-label="Dự án hiện tại" onClick={() => flash("Mỗi dự án giữ một Style Brief riêng")}>
          <span className="doc-icon">▤</span>
          <span><strong>{project.name}</strong><small><i /> {project.meta}</small></span>
        </button>

        <div className="version-block"><span>VERSION 0.9.8</span><small>FIELD KIT</small></div>
      </header>

      <section className="desk">
        <aside className="projects-panel panel-dark" aria-label="Danh sách dự án">
          <div className="tape-label">DỰ ÁN</div>
          <div className="project-list">
            {projects.map((item) => (
              <button type="button" key={item.id} className={`project-row ${item.id === project.id ? "active" : ""}`} onClick={() => selectProject(item.id)}>
                <span className="status-dot" />
                <span className="project-copy"><strong>{item.name}</strong><small>{item.meta}</small></span>
                <span className="more">•••</span>
              </button>
            ))}
          </div>

          <button className="new-project" type="button" onClick={createProject}><span>＋</span>DỰ ÁN MỚI</button>
          <div className="rail-note"><span>{String(projects.findIndex((item) => item.id === project.id) + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><span>MỖI CHAT = MỘT GAME</span></div>
        </aside>

        <section className="center-stage" aria-label="Không gian hội thoại">
          <div className="conversation paper-panel">
            <div className="panel-heading">
              <span className="tape-label dark">HỘI THOẠI</span>
              <span className="session-state"><i className={locked ? "locked" : ""} /> {locked ? "STYLE ĐÃ KHÓA" : "ĐANG HÌNH THÀNH STYLE"}</span>
            </div>

            <div className="message-list" ref={messageListRef} aria-live="polite">
              {project.messages.map((message) => (
                <article className={`message ${message.kind === "brief" ? "brief-message" : ""}`} key={message.id}>
                  <div className={`avatar ${message.author === "Bạn" ? "human" : "bot"}`}>{message.avatar}</div>
                  <div className="message-copy">
                    <div className="message-meta"><strong>{message.author}</strong><time>{message.time}</time></div>
                    <p>{message.body}</p>
                  </div>
                </article>
              ))}
              {replying && <div className="typing-row"><span /><span /><span /> ĐANG TỔNG HỢP BRIEF</div>}
            </div>

            <div className={`readiness-card ${project.ready ? "ready" : ""} ${generating ? "generating" : ""}`}>
              <div className="readiness-icon">⌁</div>
              <div>
                <strong>{generating ? "Đang tạo asset theo Style Brief" : project.ready ? "Yêu cầu đã rõ — sẵn sàng tạo" : project.generated ? "Asset đã tạo — chờ yêu cầu tiếp theo" : "Chưa tạo ảnh — đang làm rõ yêu cầu"}</strong>
                <span>{project.ready ? "Brief và ý định tạo đều đã được xác nhận." : project.progress >= 90 ? "Brief đủ rõ; cần yêu cầu tiến hành rõ ràng." : "App vẫn đang nghe và tổng hợp phong cách."}</span>
              </div>
              <div className="readiness-status"><i /> {project.progress}%</div>
              <button className="generate-button" type="button" aria-describedby="generate-hint" disabled={!project.ready || generating} onClick={handleGenerate}>
                <PixelMark />{generating ? "ĐANG TẠO…" : "TẠO ASSET"}
              </button>
            </div>
            <p className="generate-hint" id="generate-hint"><span>✓</span>{project.ready ? "Đã đối chiếu Style Brief và quy tắc transparent PNG." : "Chỉ mở khi thông số cốt lõi và ý định tạo ngay đều rõ ràng."}</p>
          </div>

          <section className="asset-tray panel-dark" id="asset-tray" aria-label="Khay asset">
            <div className="tray-title"><span className="tape-label">KHAY ASSET</span><span>{assetCount} / 8 SLOT</span></div>
            <div className="tray-content">
              <button className="asset-slot filled" type="button" aria-label="Style reference survivor 01" onClick={() => flash("Style reference · alpha đã xác minh")}>
                <img className="sprite-preview" src="./assets/survivor-fieldkit.png" alt="Survivor pixel-art mặc áo olive và đeo balo cũ" /><small>01</small>
              </button>
              <button className={`asset-slot ${project.generated ? "filled generated" : ""}`} type="button" aria-label={project.generated ? "Tải asset PNG đã tạo" : "Slot trống 2"} onClick={() => project.generated && downloadGeneratedAsset()}>
                {project.generated ? <img className="sprite-preview generated-sheet" src={project.generatedSrc ?? "./assets/survivor-fieldkit.png"} alt="Sprite sheet pixel art đã tạo" /> : <span>＋</span>}<small>02</small>
              </button>
              {[3, 4, 5, 6, 7, 8].map((slot) => <button className="asset-slot" type="button" key={slot} aria-label={`Slot trống ${slot}`} onClick={() => flash("Hãy mô tả asset mới trong hội thoại")}><span>＋</span><small>{String(slot).padStart(2, "0")}</small></button>)}
            </div>
            <div className="asset-meta">
              <strong>{project.generated ? (project.generatedName ?? "PIXEL_ASSET.PNG") : "STYLE_REFERENCE_01"}</strong>
              <span>{project.generatedMeta ?? "32×48 PX · PNG · ANCHOR 16,46 · PAD 2 PX"}</span>
              {project.generatedSrc && <button type="button" onClick={downloadGeneratedAsset}>TẢI PNG</button>}
            </div>
          </section>
        </section>

        <aside className="brief-panel panel-dark" aria-label="Style Brief">
          <div className="brief-topline">
            <span className="tape-label">STYLE BRIEF</span>
            <button className={`icon-button ${copied ? "copied" : ""}`} type="button" aria-label="Sao chép Style Brief" onClick={copyBrief}>{copied ? "✓" : "▤"}</button>
          </div>

          <div className="score-block"><strong>{project.progress}%</strong><span>NHẤT QUÁN</span><div className="progress"><i style={{ width: `${project.progress}%` }} /></div><small>{project.progress >= 90 ? "ĐỦ CHÍN — CHỜ Ý ĐỊNH TẠO" : project.progress >= 65 ? "TỐT — GẦN HOÀN TẤT" : "ĐANG KHÁM PHÁ THẾ GIỚI"}</small></div>

          <section className="brief-section">
            <h2><span>QUY CHUẨN CỐT LÕI</span><i /></h2>
            <div className="spec-chips">{project.brief.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <dl className="brief-grid">
              <dt>THỂ LOẠI</dt><dd>{project.brief.genre}</dd>
              <dt>THẾ GIỚI</dt><dd>{project.brief.world}</dd>
              <dt>CAMERA</dt><dd>{project.brief.camera}</dd>
              <dt>TỶ LỆ</dt><dd>{project.brief.scale}</dd>
              <dt>CHI TIẾT</dt><dd>{project.brief.detail}</dd>
              <dt>RENDER</dt><dd>Cạnh cứng / không AA</dd>
            </dl>
          </section>

          <section className="brief-section palette-section"><h2><span>PALETTE (8)</span><i /></h2><div className="swatches" aria-label="Bảng màu">{project.brief.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}</div></section>

          <section className="brief-section notes-section"><h2><span>GHI CHÚ NHẤT QUÁN</span><i /></h2><ul><li>{project.brief.materials}</li><li>{project.brief.wear}</li><li>{project.brief.shape}</li><li>{project.brief.avoid}</li></ul></section>

          <div className="alpha-rule"><span>ALPHA CHECK</span><strong>Transparent PNG thật · alpha đã xác minh cho mẫu</strong><small>Asset mới vẫn phải kiểm tra riêng trước khi xuất.</small></div>
          <button className={`lock-style ${locked ? "active" : ""}`} type="button" onClick={toggleLock}>{locked ? "▣  STYLE ĐÃ KHÓA" : "▢  KHÓA PHONG CÁCH"}<small>Chỉ trong dự án này</small></button>
        </aside>

        <form className="composer" onSubmit={handleSubmit}>
          <button className="composer-tool" type="button" onClick={() => flash("Có thể đính kèm reference trong bản tích hợp")}><span>⌕</span>ĐÍNH KÈM</button>
          <button className="composer-tool mode" type="button" onClick={() => setMode((value) => value === "sheet" ? "single" : "sheet")}><span>{mode === "sheet" ? "▦" : "◆"}</span>{mode === "sheet" ? "SPRITE SHEET" : "SPRITE ĐƠN"}</button>
          <label className="input-wrap">
            <span className="sr-only">Mô tả asset tiếp theo</span>
            <textarea value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={handleComposerKeyDown} placeholder="Mô tả asset tiếp theo hoặc trả lời câu hỏi làm rõ…" maxLength={600} />
            <small>SHIFT + ENTER ĐỂ XUỐNG DÒNG <b>{composer.length} / 600</b></small>
          </label>
          <button className="send-button" type="submit" aria-label="Gửi tin nhắn" disabled={!composer.trim() || replying}><span>➤</span>GỬI</button>
        </form>
      </section>

      {exportOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setExportOpen(false)}>
          <section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="dialog-topline"><span className="tape-label">ENGINE HANDOFF</span><button type="button" aria-label="Đóng" onClick={() => { setExportOpen(false); setActiveNav("workshop"); }}>×</button></div>
            <p className="eyebrow">DỰ ÁN / {project.name}</p>
            <h2 id="export-title">Gói bàn giao nhất quán</h2>
            <p>Brief có thể mang sang chat mới. Asset giữ quy tắc kỹ thuật cho Unity, Godot và GameMaker.</p>
            <div className="export-specs"><span><b>PNG RGBA</b>alpha thật</span><span><b>32×48 px</b>pixel perfect</span><span><b>16,46</b>anchor chân</span><span><b>2 px</b>padding</span></div>
            <div className="checklist"><span>✓ Nearest-neighbor</span><span>✓ Không mipmap</span><span>✓ Không filter</span><span>✓ Không watermark</span></div>
            <button className="download-brief" type="button" onClick={downloadBrief}>XUẤT STYLE BRIEF .TXT</button>
            <small className="dialog-note">App không ghi nhớ phong cách qua cửa sổ chat khác; hãy dán brief này vào dự án mới.</small>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
