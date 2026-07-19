// A grey tabby cat sitting on a crate, seen from the side so the head,
// both front legs, the folded back leg, and the curled tail all read as a
// real sitting cat rather than a flat frontal blob. Lives as a foreground
// prop near the gnome (not in the background ground plane). Scaled down
// to 40% of its original size — half scale below sm, matching the crate.
export function CatOnBox() {
  const furMain = "linear-gradient(160deg, #cfc7b6 0%, #a89c86 55%, #7d715c 100%)";
  const furDark = "linear-gradient(160deg, #a89c86 0%, #7d715c 55%, #5c5346 100%)";
  const cream = "linear-gradient(160deg, #f5efe0 0%, #e8ddc4 100%)";

  return (
    <div className="flex origin-bottom-left scale-[1.2] flex-col items-end sm:scale-[2.4]">
      {/* crate the cat sits on */}
      <div
        className="relative h-[24px] w-[30px]"
        style={{
          background: "linear-gradient(180deg, #a9855a 0%, #7a5c3a 100%)",
          boxShadow: "0 3px 5px rgba(0,0,0,0.45)",
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#5c4326]" />
        <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-[#5c4326]" />
      </div>

      {/* cat, sitting side-on (facing left) on top of the crate */}
      <div className="absolute bottom-[21px] left-1/2 -translate-x-1/2" style={{ width: 34, height: 38 }}>
        {/* tail, curled from the rear haunch around toward the front paws —
            two overlapping tapered segments fake the curve a single clipped
            div can't bend on its own */}
        <div
          className="absolute bottom-[9px] right-[1px] h-[17px] w-[7px] origin-top-right rotate-[35deg]"
          style={{
            clipPath: "polygon(25% 0%, 100% 10%, 90% 80%, 55% 100%, 15% 85%, 0% 35%)",
            background: furDark,
          }}
        />
        <div
          className="absolute bottom-[2px] right-[10px] h-[10px] w-[6px] origin-top-right -rotate-[55deg]"
          style={{
            clipPath: "polygon(30% 0%, 100% 15%, 85% 85%, 40% 100%, 0% 55%)",
            background: furDark,
          }}
        />

        {/* folded back leg — a rounded haunch bulge plus a small paw
            peeking out just ahead of it, so a 4th leg reads clearly
            alongside the two front legs */}
        <div
          className="absolute bottom-0 right-[5px] h-[15px] w-[13px]"
          style={{ clipPath: "circle(52% at 50% 38%)", background: furDark }}
        />
        <div
          className="absolute bottom-0 right-[9px] h-[5px] w-[7px]"
          style={{ clipPath: "circle(50% at 50% 25%)", background: furMain }}
        />

        {/* body/back, the main rounded mass the head and legs attach to */}
        <div
          className="absolute bottom-[3px] right-[1px] h-[25px] w-[19px]"
          style={{ clipPath: "circle(50% at 42% 55%)", background: furMain }}
        />

        {/* chest — lighter fur patch in front of the body */}
        <div
          className="absolute bottom-[9px] left-[4px] h-[15px] w-[12px]"
          style={{ clipPath: "circle(50% at 50% 65%)", background: cream }}
        />

        {/* front legs, standing side by side — the back one slightly
            darker/shorter to read as further away */}
        <div
          className="absolute bottom-0 left-[3px] h-[13px] w-[5px]"
          style={{
            clipPath: "polygon(15% 0%, 85% 0%, 100% 82%, 78% 100%, 22% 100%, 0% 82%)",
            background: furDark,
          }}
        />
        {/* front paw — idles most of the time, occasionally lifts to
            lick, via the cat-lick keyframe */}
        <div
          className="absolute bottom-0 left-[8px] h-[15px] w-[5px] origin-bottom"
          style={{
            clipPath: "polygon(15% 0%, 85% 0%, 100% 82%, 78% 100%, 22% 100%, 0% 82%)",
            background: cream,
            animation: "cat-lick 9s ease-in-out infinite",
          }}
        />

        {/* head, at the front (left) tip, facing away from the tail */}
        <div className="absolute left-0 top-0 h-[15px] w-[15px]">
          <div
            className="absolute inset-0"
            style={{ clipPath: "circle(50% at 50% 50%)", background: furMain }}
          />
          {/* ears, with pink inner-ear insets */}
          <div
            className="absolute -top-[5px] left-[1px] h-[7px] w-[7px] -rotate-[12deg]"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: furDark }}
          >
            <div
              className="absolute inset-[26%]"
              style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "#e8a9b8" }}
            />
          </div>
          <div
            className="absolute -top-[5px] right-[1px] h-[7px] w-[7px] rotate-[12deg]"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: furDark }}
          >
            <div
              className="absolute inset-[26%]"
              style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "#e8a9b8" }}
            />
          </div>
          {/* muzzle, a lighter bump at the front-facing tip */}
          <div
            className="absolute -left-[3px] top-[7px] h-[7px] w-[7px]"
            style={{ clipPath: "circle(50% at 50% 50%)", background: cream }}
          />
          {/* eye — almond-shaped with a vertical pupil slit, angled toward
              the front */}
          <div
            className="absolute left-[1px] top-[5px] h-[5px] w-[6px] -rotate-[8deg]"
            style={{ clipPath: "ellipse(50% 42% at 50% 50%)", background: "#8fae4a" }}
          >
            <div className="absolute left-1/2 top-1/2 h-[3.5px] w-[1px] -translate-x-1/2 -translate-y-1/2 bg-black/85" />
          </div>
          {/* nose */}
          <div className="absolute -left-[2px] top-[10px] h-[2px] w-[2px] rotate-45 bg-[#c97a8a]" />
          {/* whiskers */}
          <div className="absolute -left-[6px] top-[9px] h-px w-[6px] -rotate-[6deg] bg-white/70" />
          <div className="absolute -left-[6px] top-[11px] h-px w-[6px] rotate-[8deg] bg-white/70" />
        </div>
      </div>
    </div>
  );
}
