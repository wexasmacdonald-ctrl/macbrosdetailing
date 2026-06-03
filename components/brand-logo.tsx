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
        src="/images/macbros-logo.png"
        alt="MacBros Detailing"
        width={width}
        height={height}
        priority={priority}
        className="block h-auto w-auto select-none"
        style={{ maxHeight: height }}
      />
    </span>
  )
}
