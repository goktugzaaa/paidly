import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0c1a3a",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          color: "white",
          position: "relative",
        }}
      >
        F
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 9,
            height: 9,
            background: "#22d3ee",
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          }}
        />
      </div>
    ),
    size
  );
}
