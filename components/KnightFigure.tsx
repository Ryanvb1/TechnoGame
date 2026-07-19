// The knight's armor/sword artwork, split out from Knight.tsx so the fight
// screen can render the same figure without the throne-room click/dialogue
// behavior wrapped around it.
export function KnightFigure() {
  return (
    <div className="relative flex flex-col items-center">
      {/* cape — sized to end right at the torso's own bottom edge (it
          used to run 9px past it) so there's no leftover strip of cape
          visible below the torso, in the gaps between/beside the legs,
          which read as a stray red triangle at the waist */}
      <div
        className="absolute top-[54px] h-[145px] w-[108px]"
        style={{
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          background: "linear-gradient(180deg, #7a1220 0%, #4a0b14 100%)",
          opacity: 0.9,
        }}
      />

      {/* helmet */}
      <div
        className="relative h-[65px] w-[57px]"
        style={{
          clipPath:
            "polygon(20% 0%, 80% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)",
          background:
            "linear-gradient(160deg, #b7c0ca 0%, #9aa3ad 35%, #5b636c 100%)",
        }}
      >
        <div className="absolute left-1/2 top-[45%] h-[11px] w-9 -translate-x-1/2 bg-black/70" />
        <div className="absolute left-1/2 top-1/3 h-[15px] w-[8px] -translate-x-1/2 bg-[#3a3f45]" />
        <div className="absolute left-[6px] top-[6px] h-[6px] w-[18px] bg-white/30" />
      </div>
      {/* plume: a normal flow element (not absolutely positioned) so its
          tip is counted as part of the figure's own height and hit area,
          instead of poking out above it */}
      <div
        className="h-[29px] w-[15px]"
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "#6b1520" }}
      />

      {/* shoulders/torso with a shield emblem and rivets. The sword sits
          in a plain (unclipped) wrapper matching the torso's footprint,
          not directly on the button, so minWidth's centering margin
          actually contains its reach instead of the sword floating a
          fixed distance past the button's own edge regardless of width */}
      <div className="relative -mt-[9px] h-[116px] w-[116px]">
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              "polygon(15% 0%, 85% 0%, 100% 20%, 88% 100%, 12% 100%, 0% 20%)",
            background:
              "linear-gradient(160deg, #a3acb6 0%, #8a929c 35%, #4b525a 100%)",
          }}
        >
          <div
            className="absolute left-1/2 top-[30%] h-[44px] w-[44px] -translate-x-1/2 border border-yellow-600/60"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background: "linear-gradient(180deg, #caa243 0%, #7d5c1f 100%)",
            }}
          />
          <div className="absolute left-[16%] top-[14%] h-[8px] w-[8px] bg-black/40" />
          <div className="absolute right-[16%] top-[14%] h-[8px] w-[8px] bg-black/40" />
          <div className="absolute left-[16%] bottom-[10%] h-[8px] w-[8px] bg-black/40" />
          <div className="absolute right-[16%] bottom-[10%] h-[8px] w-[8px] bg-black/40" />
        </div>

        {/* arms — attached directly to the torso's own sides (overlapping
            it slightly at the shoulder) instead of positioned relative
            to a much-wider wrapper, which used to leave them floating
            ~43px away from the torso on each side */}
        <div className="absolute -left-[10px] top-[6px] h-[72px] w-[29px] bg-gradient-to-b from-[#a3acb6] to-[#4b525a]" />
        <div className="absolute -right-[10px] top-[6px] h-[72px] w-[29px] bg-gradient-to-b from-[#a3acb6] to-[#4b525a]" />

        {/* sword, gripped just past the right hand — tapered to a point
            for a sharper blade edge, sized and positioned to sit right
            beside the repositioned arm instead of floating far out */}
        <div
          className="absolute -right-[30px] top-[40px] h-[150px] w-[13px]"
          style={{
            clipPath: "polygon(50% 0%, 100% 9%, 100% 100%, 0% 100%, 0% 9%)",
            background: "linear-gradient(90deg, #8b9299 0%, #e4e9ee 45%, #ffffff 55%, #8b9299 100%)",
          }}
        />
        <div className="absolute -right-[37px] top-[32px] h-[11px] w-[27px] bg-[#caa243]" />
      </div>

      {/* legs */}
      <div className="-mt-[9px] flex gap-[11px]">
        <div className="h-[87px] w-[44px] bg-gradient-to-b from-[#8d959e] to-[#454b52]" />
        <div className="h-[87px] w-[44px] bg-gradient-to-b from-[#8d959e] to-[#454b52]" />
      </div>
      {/* feet */}
      <div className="-mt-[6px] flex gap-[11px]">
        <div className="h-[18px] w-[51px] bg-[#2c2f33]" />
        <div className="h-[18px] w-[51px] bg-[#2c2f33]" />
      </div>
    </div>
  );
}
