import Image from "next/image"

export function BrandLogo({
  className = "",
  width = 180,
  height = 54,
  priority = false,
}: {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/images/macbros-logo-header.png"
        alt="MacBros Detailing"
        width={width}
        height={height}
        priority={priority}
        className="block h-auto max-h-full w-auto select-none"
      />
    </span>
  )
}
