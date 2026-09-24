import { ReactNode } from "react";

/**
 * Small isometric 3D tile in the style of the "How it works" plates in the
 * design: a stacked pair of rounded plates tilted rotateX(58) rotateZ(-38),
 * with the icon counter-rotated so it faces the viewer on the top plate.
 */
export function IsoPlate({
  children,
  width = 120,
  height = 84,
  lift = 18,
}: {
  children?: ReactNode;
  width?: number;
  height?: number;
  lift?: number;
}) {
  return (
    <div
      style={{ height: height + 40, position: "relative", perspective: 700 }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width,
          height,
          transform: "translate(-50%,-50%) rotateX(58deg) rotateZ(-38deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* base plate (shadow) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: "#14171C",
            border: "1px solid #2E343D",
            boxShadow: "0 30px 40px -20px rgba(0,0,0,0.9)",
          }}
        />
        {/* mid plate */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: "#181C22",
            border: "1px solid #343B45",
            transform: `translateZ(${lift / 2}px)`,
          }}
        />
        {/* top plate carries the icon */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: "#1E232A",
            border: "1px solid #4A525E",
            transform: `translateZ(${lift}px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ transform: "rotateZ(38deg) rotateX(-58deg)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
