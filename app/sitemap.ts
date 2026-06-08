import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

const routes = [
  "",
  "/about",
  "/contact",
  "/privacy-policy",
  "/quote",
  "/services",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/quote" || route === "/services" ? 0.9 : 0.7,
  }))
}
