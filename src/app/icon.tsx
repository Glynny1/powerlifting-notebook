import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 96,
          gap: 28,
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -8,
          }}
        >
          PL
        </div>
        <div
          style={{
            width: 280,
            height: 28,
            background: "#e66767",
            borderRadius: 14,
          }}
        />
      </div>
    ),
    size
  );
}
