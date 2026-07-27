// Small "coming soon" loot icons for the vending machine's inert slots —
// previously all thirteen shared one plain dim diamond, which read as one
// item repeated rather than a machine full of distinct (if inaccessible)
// stock. Same self-contained, size-prop convention as RainbowShellIcon/
// DefaultShellIcon; PLACEHOLDER_ICONS below is what VendingMachine
// actually indexes into.

function PowerCellIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-x-[20%] top-0 h-[14%]"
        style={{ background: "#4b525a" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 top-[14%]"
        style={{
          background: "linear-gradient(180deg, #b7c0ca 0%, #6b737c 100%)",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute inset-x-[22%] top-[18%] h-[30%]"
          style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }}
        />
      </div>
    </div>
  );
}

function KeycardIcon({ size = 24 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size * 0.66,
        background: "linear-gradient(160deg, #3a4048 0%, #1c2026 100%)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
      }}
    >
      <div className="absolute left-[10%] top-[18%] h-[26%] w-[26%]" style={{ background: "var(--neon-dim)", boxShadow: "0 0 4px var(--neon-dim)" }} />
      <div className="absolute inset-x-[10%] bottom-[18%] h-[10%]" style={{ background: "rgba(255,255,255,0.25)" }} />
    </div>
  );
}

function GemIcon({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        clipPath: "polygon(50% 0%, 82% 30%, 100% 34%, 62% 100%, 38% 100%, 0% 34%, 18% 30%)",
        background: "linear-gradient(155deg, #b98cff 0%, #7c5cff 55%, #4a2fb8 100%)",
        boxShadow: "0 0 6px rgba(124,92,255,0.7)",
      }}
    />
  );
}

function VialIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size * 0.6, height: size }}>
      <div className="absolute inset-x-[30%] top-0 h-[16%]" style={{ background: "#8a929c" }} />
      <div
        className="absolute inset-x-0 bottom-0 top-[16%]"
        style={{
          clipPath: "polygon(20% 0%, 80% 0%, 100% 78%, 50% 100%, 0% 78%)",
          background: "rgba(230,235,240,0.25)",
          boxShadow: "inset 0 0 4px rgba(255,255,255,0.3)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: "linear-gradient(180deg, #6bffb0 0%, #2fd88a 100%)", boxShadow: "0 0 6px #39ff8f" }}
        />
      </div>
    </div>
  );
}

function ChipIcon({ size = 24 }: { size?: number }) {
  const pins = [18, 42, 66];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {pins.map((p) => (
        <div key={`t${p}`} className="absolute top-0 h-[10%] w-[8%]" style={{ left: `${p}%`, background: "#8a929c" }} />
      ))}
      {pins.map((p) => (
        <div key={`b${p}`} className="absolute bottom-0 h-[10%] w-[8%]" style={{ left: `${p}%`, background: "#8a929c" }} />
      ))}
      <div
        className="absolute inset-y-[10%] inset-x-[10%]"
        style={{ background: "linear-gradient(160deg, #2a2e32 0%, #131316 100%)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <div className="absolute inset-[30%]" style={{ border: "1px solid var(--neon-dim)", opacity: 0.8 }} />
      </div>
    </div>
  );
}

function CoinIcon({ size = 24 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        clipPath: "circle(50% at 50% 50%)",
        background: "radial-gradient(circle at 35% 30%, #ffe9a8 0%, #e6c229 45%, #9a7a12 100%)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
      }}
    >
      <div className="absolute inset-[16%]" style={{ clipPath: "circle(50% at 50% 50%)", border: "1px solid rgba(154,122,18,0.6)" }} />
    </div>
  );
}

function MedalIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute left-[30%] top-0 h-[38%] w-[14%]"
        style={{ background: "#ff3b3b", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 70%, 0% 100%)" }}
      />
      <div
        className="absolute right-[30%] top-0 h-[38%] w-[14%]"
        style={{ background: "#39ff8f", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 70%, 0% 100%)" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[62%] w-[62%] -translate-x-1/2"
        style={{
          clipPath: "polygon(50% 0%, 90% 35%, 76% 100%, 24% 100%, 10% 35%)",
          background: "radial-gradient(circle at 35% 30%, #ffe9a8 0%, #e6c229 55%, #9a7a12 100%)",
          boxShadow: "0 0 5px rgba(230,194,41,0.7)",
        }}
      />
    </div>
  );
}

function CompassIcon({ size = 24 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        clipPath: "circle(50% at 50% 50%)",
        background: "linear-gradient(160deg, #b7c0ca 0%, #6b737c 100%)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
      }}
    >
      <div className="absolute inset-[12%]" style={{ clipPath: "circle(50% at 50% 50%)", background: "#131316" }} />
      <div
        className="absolute left-1/2 top-1/2 h-[70%] w-[16%] -translate-x-1/2 -translate-y-1/2 rotate-[28deg]"
        style={{ clipPath: "polygon(50% 0%, 100% 55%, 50% 42%, 0% 55%)", background: "#ff3b3b" }}
      />
    </div>
  );
}

function GogglesIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size * 0.6 }}>
      <div className="absolute inset-x-[26%] top-[30%] h-[12%]" style={{ background: "#2a2e32" }} />
      {["left-0", "right-0"].map((side) => (
        <div
          key={side}
          className={`absolute top-0 h-full w-[42%] ${side}`}
          style={{
            clipPath: "circle(50% at 50% 50%)",
            background: "linear-gradient(160deg, #4b525a 0%, #1c2026 100%)",
            boxShadow: "0 0 5px rgba(0,0,0,0.5)",
          }}
        >
          <div className="absolute inset-[16%]" style={{ clipPath: "circle(50% at 50% 50%)", background: "linear-gradient(160deg, #8fd8ff, #1a3a4a)", opacity: 0.85 }} />
        </div>
      ))}
    </div>
  );
}

function RocketIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size * 0.56, height: size }}>
      <div
        className="absolute inset-x-0 top-0 h-[78%]"
        style={{ clipPath: "polygon(50% 0%, 100% 55%, 100% 100%, 0% 100%, 0% 55%)", background: "linear-gradient(180deg, #e6eaee 0%, #7a828c 100%)" }}
      />
      <div className="absolute left-1/2 top-[28%] h-[22%] w-[44%] -translate-x-1/2" style={{ clipPath: "circle(50% at 50% 50%)", background: "#1a3a4a" }} />
      <div className="absolute -left-[24%] bottom-0 h-[30%] w-[30%]" style={{ clipPath: "polygon(100% 0%, 100% 100%, 0% 100%)", background: "#ff3b3b" }} />
      <div className="absolute -right-[24%] bottom-0 h-[30%] w-[30%]" style={{ clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)", background: "#ff3b3b" }} />
      <div
        className="absolute inset-x-0 bottom-0 h-[16%] translate-y-[60%] opacity-80"
        style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)", background: "linear-gradient(180deg, #ffcf6b, #ff3b3b)" }}
      />
    </div>
  );
}

function WrenchIcon({ size = 24 }: { size?: number }) {
  return (
    <div
      className="relative rotate-[-40deg]"
      style={{ width: size, height: size * 0.32 }}
    >
      <div className="absolute inset-y-0 left-[24%] right-0" style={{ background: "linear-gradient(180deg, #b7c0ca, #6b737c)" }} />
      <div
        className="absolute left-0 top-1/2 h-[220%] w-[36%] -translate-y-1/2"
        style={{ clipPath: "polygon(0% 0%, 100% 30%, 100% 70%, 0% 100%, 30% 50%)", background: "linear-gradient(180deg, #b7c0ca, #6b737c)" }}
      />
    </div>
  );
}

function HeadsetIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-x-[16%] top-0 h-[50%]"
        style={{ border: "3px solid #8a929c", borderBottom: "none", clipPath: "polygon(0% 100%, 0% 30%, 30% 0%, 70% 0%, 100% 30%, 100% 100%, 82% 100%, 82% 40%, 18% 40%, 18% 100%)" }}
      />
      <div className="absolute bottom-0 left-0 h-[38%] w-[22%]" style={{ background: "#39ff8f", boxShadow: "0 0 5px #39ff8f" }} />
      <div className="absolute bottom-0 right-0 h-[38%] w-[22%]" style={{ background: "#4b525a" }} />
    </div>
  );
}

function HourglassIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size * 0.7, height: size }}>
      <div className="absolute inset-x-0 top-0 h-[8%]" style={{ background: "#8a929c" }} />
      <div className="absolute inset-x-0 bottom-0 h-[8%]" style={{ background: "#8a929c" }} />
      <div
        className="absolute inset-x-0 top-[8%] h-[42%]"
        style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)", background: "rgba(230,235,240,0.22)" }}
      >
        <div className="absolute inset-x-[20%] top-0 h-[45%]" style={{ background: "#ffcf6b", clipPath: "polygon(0% 0%, 100% 0%, 70% 100%, 30% 100%)" }} />
      </div>
      <div
        className="absolute inset-x-0 bottom-[8%] h-[42%]"
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "rgba(230,235,240,0.22)" }}
      >
        <div className="absolute inset-x-[36%] bottom-0 h-[30%]" style={{ background: "#ffcf6b", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
      </div>
    </div>
  );
}

export const PLACEHOLDER_ICONS: React.ComponentType<{ size?: number }>[] = [
  PowerCellIcon,
  KeycardIcon,
  GemIcon,
  VialIcon,
  ChipIcon,
  CoinIcon,
  MedalIcon,
  CompassIcon,
  GogglesIcon,
  RocketIcon,
  WrenchIcon,
  HeadsetIcon,
  HourglassIcon,
];
