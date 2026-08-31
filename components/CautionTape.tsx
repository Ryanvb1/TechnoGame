export function CautionTape({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="Caution tape"
      className={`pointer-events-none flex h-6 items-center justify-around overflow-hidden border-y border-[#f6c400] text-[0.48rem] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_10px_rgba(246,196,0,0.35)] ${className}`}
      style={{
        background:
          "repeating-linear-gradient(135deg, #f6c400 0 16px, #151515 16px 30px)",
      }}
    >
      <span className="bg-[#f6c400] px-1.5">Caution</span>
      <span className="bg-[#f6c400] px-1.5">Caution</span>
    </div>
  );
}
