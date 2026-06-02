import { ImageResponse } from "next/og"
import { BUSINESS_NAME } from "@/lib/site"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #050506 0%, #111114 50%, #1a1a1f 100%)",
          color: "#f4f4f5",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c8102e",
          }}
        >
          <div style={{ width: 56, height: 2, background: "#c8102e" }} />
          Mobile Detailing
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              fontStyle: "italic",
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            {BUSINESS_NAME}
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#f87171",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Mobile Detailing That Comes To You
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#d4d4d8",
          }}
        >
          <div>Ottawa & Surrounding Area</div>
          <div style={{ color: "#c8102e", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Quote Requests Online
          </div>
        </div>
      </div>
    ),
    size,
  )
}
