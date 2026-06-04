import type { MetadataRoute } from "next"
import { BUSINESS_NAME, SITE_DESCRIPTION } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS_NAME,
    short_name: "MacBros",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#151518",
    theme_color: "#151518",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
