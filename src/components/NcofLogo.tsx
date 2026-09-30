import Image from 'next/image'

export default function NcofLogo({
  size = 40,
  priority = false,
  className = '',
}: {
  size?: number
  priority?: boolean
  className?: string
}) {
  return (
    <Image
      src="/ncof-logo.svg"
      alt="NCOF"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  )
}
