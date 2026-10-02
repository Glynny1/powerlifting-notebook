import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a19",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -3,
          }}
        >
          PL
        </div>
        <div
          style={{
            width: 98,
            height: 10,
            background: "#e66767",
            borderRadius: 5,
          }}
        />
      </div>
    ),
    size
  );
}
