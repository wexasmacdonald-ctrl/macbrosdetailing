import { readFile } from "node:fs/promises"
import { join } from "node:path"

export async function GET() {
  const iconPath = join(process.cwd(), "public", "favicon.ico")
  const icon = await readFile(iconPath)

  return new Response(icon, {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
