import { IslandIcon, type IconName } from "./icons";

/*
  The footer's giant "Pasyar", built like the Happy Island mosaic letters:
  every letter is filled with hand-drawn island tiles (each with its own picture),
  separated by dark grout lines, with a woven salakot resting on the P.
  Static on purpose.
*/

const CELL = 46;
const GRID = 6; // 6x6 tiles per pattern repeat

const BG = ["#EA753C", "#2B8FD6", "#F6CB67", "#49C29F", "#BA091F", "#6DB33F", "#F6A54F", "#E0569B", "#0F7E6C"];
const FG: Record<string, string> = {
  "#EA753C": "#FFE7A3",
  "#2B8FD6": "#CFE9FF",
  "#F6CB67": "#BA091F",
  "#49C29F": "#FFF4D6",
  "#BA091F": "#F6CB67",
  "#6DB33F": "#FFF4D6",
  "#F6A54F": "#0F7E6C",
  "#E0569B": "#FFE7F1",
  "#0F7E6C": "#9FE7D2",
};
const ICONS: IconName[] = [
  "sun", "fish", "palm", "church", "wave", "flower",
  "crab", "surf", "rice", "heart", "boat", "mask",
  "waterfall", "coconut", "rooster", "abaca", "shell", "island",
  "broom", "mountain", "lighthouse", "cave", "cross", "river",
];
/** Extra shapes on some tiles, like the geometric pieces in the festival mosaic. */
const DECOR = ["corner", "none", "half", "none", "ring", "none", "stripes", "none", "dots"] as const;

function TileCell({ x, y, i }: { x: number; y: number; i: number }) {
  const bg = BG[(i * 5 + Math.floor(i / GRID)) % BG.length];
  const fg = FG[bg];
  const icon = ICONS[(i * 7) % ICONS.length];
  const d = DECOR[(i * 4 + 1) % DECOR.length];
  const s = CELL - 3; // leave 3px of grout
  return (
    <g transform={`translate(${x + 1.5} ${y + 1.5})`}>
      <rect width={s} height={s} rx={5} fill={bg} />
      {d === "corner" && <path d={`M0 ${s}A${s} ${s} 0 0 1 ${s} 0V${s}Z`} fill={fg} opacity={0.35} />}
      {d === "half" && <path d={`M2 ${s - 2}A${s / 2 - 2} ${s / 2 - 2} 0 0 1 ${s - 2} ${s - 2}Z`} fill={fg} opacity={0.3} />}
      {d === "ring" && <circle cx={s / 2} cy={s / 2} r={s / 2 - 4} fill="none" stroke={fg} strokeWidth={2} opacity={0.45} />}
      {d === "stripes" && <path d={`M0 6H${s}M0 ${s - 6}H${s}`} stroke={fg} strokeWidth={2} opacity={0.5} />}
      {d === "dots" && [6, s - 6].map((cx) => [6, s - 6].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} fill={fg} opacity={0.7} />))}
      <g transform={`translate(${s * 0.18} ${s * 0.18})`}>
        <IslandIcon name={icon} size={s * 0.64} color={fg} accent={bg === "#F6CB67" ? "#EA753C" : "#F6CB67"} />
      </g>
    </g>
  );
}

function Salakot({ x, y, w }: { x: number; y: number; w: number }) {
  const k = w / 64;
  return (
    <g transform={`translate(${x} ${y}) rotate(-14) scale(${k})`}>
      <ellipse cx="32" cy="31" rx="30" ry="4" fill="#000" opacity="0.25" />
      <path d="M2 27 Q32 -6 62 27 Q32 33 2 27Z" fill="#E9B96E" />
      <path d="M2 27 Q32 33 62 27 Q32 36 2 27Z" fill="#C98B3A" />
      {[10, 18, 26, 32, 38, 46, 54].map((px) => (
        <path key={px} d={`M32 3 L${px} 28`} stroke="#C98B3A" strokeWidth="1.1" opacity=".75" />
      ))}
      {[12, 18].map((py) => (
        <path key={py} d={`M${14 - (py - 12)} ${py + 4} Q32 ${py - 6} ${50 + (py - 12)} ${py + 4}`} stroke="#B0742E" strokeWidth="0.8" fill="none" opacity=".6" />
      ))}
      <path d="M9 21 Q32 12 55 21" stroke="#BA091F" strokeWidth="3" fill="none" />
      <path d="M12 23.5 Q32 15 52 23.5" stroke="#F6CB67" strokeWidth="1.2" fill="none" />
      <circle cx="32" cy="4" r="3" fill="#BA091F" />
      <path d="M30 4 l-3 -5 M34 4 l3 -5" stroke="#49C29F" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

export function FooterWordmark() {
  const P = CELL * GRID;
  const cells = Array.from({ length: GRID * GRID }, (_, i) => ({ x: (i % GRID) * CELL, y: Math.floor(i / GRID) * CELL, i }));
  return (
    <svg viewBox="0 -70 1000 400" className="block h-auto w-full" role="img" aria-label="Pasyar">
      <defs>
        <pattern id="pasyar-mosaic" width={P} height={P} patternUnits="userSpaceOnUse" x="6" y="-14">
          <rect width={P} height={P} fill="#0B2236" />
          {cells.map((c) => (
            <TileCell key={c.i} {...c} />
          ))}
        </pattern>
        <linearGradient id="pasyar-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* soft glow behind the letters */}
      <text x="24" y="250" textLength="948" lengthAdjust="spacingAndGlyphs" fontSize="300" fontWeight={700} fill="#2B8FD6" opacity="0.18" style={{ fontFamily: "var(--font-fredoka), var(--font-inter), sans-serif", filter: "blur(18px)" }}>
        Pasyar
      </text>
      {/* tile-filled letters with a white rim */}
      <text
        x="20"
        y="250"
        textLength="948"
        lengthAdjust="spacingAndGlyphs"
        fontSize="300"
        fontWeight={700}
        fill="url(#pasyar-mosaic)"
        stroke="#FFF7EC"
        strokeWidth="5"
        paintOrder="stroke"
        strokeLinejoin="round"
        style={{ fontFamily: "var(--font-fredoka), var(--font-inter), sans-serif" }}
      >
        Pasyar
      </text>
      {/* glossy top light, like glazed tiles */}
      <text x="24" y="250" textLength="948" lengthAdjust="spacingAndGlyphs" fontSize="300" fontWeight={700} fill="url(#pasyar-sheen)" style={{ fontFamily: "var(--font-fredoka), var(--font-inter), sans-serif" }}>
        Pasyar
      </text>

      <Salakot x={8} y={-8} w={170} />

      {/* small accents */}
      <g transform="translate(905 -40)">
        <circle r="26" fill="#F6CB67" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x="-2.5" y="-44" width="5" height="12" rx="2.5" fill="#F6A54F" transform={`rotate(${i * 36})`} />
        ))}
      </g>
      {[
        [560, -30, 5, "#49C29F"],
        [640, -52, 3.5, "#E0569B"],
        [780, -20, 4, "#2B8FD6"],
        [400, -48, 3, "#F6CB67"],
      ].map(([cx, cy, r, f]) => (
        <path
          key={`${cx}`}
          d={`M${cx} ${(cy as number) - (r as number) * 2.4}L${(cx as number) + (r as number) * 0.7} ${(cy as number) - (r as number) * 0.7}L${(cx as number) + (r as number) * 2.4} ${cy}L${(cx as number) + (r as number) * 0.7} ${(cy as number) + (r as number) * 0.7}L${cx} ${(cy as number) + (r as number) * 2.4}L${(cx as number) - (r as number) * 0.7} ${(cy as number) + (r as number) * 0.7}L${(cx as number) - (r as number) * 2.4} ${cy}L${(cx as number) - (r as number) * 0.7} ${(cy as number) - (r as number) * 0.7}Z`}
          fill={f as string}
        />
      ))}
    </svg>
  );
}
