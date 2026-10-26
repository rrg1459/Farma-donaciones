import Image from "next/image";
import pillsLogo from "../../public/pills.png";

interface PillsLogoProps {
  size?: number;
  priority?: boolean;
  alt?: string;
  className?: string;
}

export default function PillsLogo({
  size = 60,
  priority = false,
  alt = "FarmaDonaciones Ararat",
  className = "",
}: PillsLogoProps) {
  return (
    <Image
      src={pillsLogo}
      alt={alt}
      width={pillsLogo.width}
      height={pillsLogo.height}
      priority={priority}
      placeholder="blur"
      style={{ width: `${size}px`, height: "auto" }}
      className={`object-contain flex-shrink-0 ${className}`.trim()}
      sizes={`${size}px`}
    />
  );
}
