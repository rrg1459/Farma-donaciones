import Image from "next/image";
import farmaLogo from "../../public/farmadonaciones-short.png";

interface FarmaLogoProps {
  size?: number;
  priority?: boolean;
  alt?: string;
  className?: string;
}

export default function FarmaLogo({
  size = 60,
  priority = false,
  alt = "FarmaDonaciones Ararat",
  className = "",
}: FarmaLogoProps) {
  return (
    <Image
      src={farmaLogo}
      alt={alt}
      width={farmaLogo.width}
      height={farmaLogo.height}
      priority={priority}
      placeholder="blur"
      style={{ width: `${size}px`, height: "auto" }}
      className={`py-12 object-contain flex-shrink-0 ${className}`.trim()}
      sizes={`${size}px`}
    />
  );
}
