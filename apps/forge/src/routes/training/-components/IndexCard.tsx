import ImageGradient from "@/components/training/ImageGradient.tsx";
import { Link } from "@tanstack/react-router";

interface IndexCardProps {
  to?: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  onClick?: () => void;
  gradientColor: string;
}

const IndexCard: React.FC<IndexCardProps> = ({
  to,
  imageSrc,
  imageAlt,
  title,
  description,
  onClick,
  gradientColor,
}) => {
  const CardContent = () => (
    <div className="group relative w-[200rem] h-96 max-w-lg cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <ImageGradient imageSrc={imageSrc} imageAlt={imageAlt} gradientColor={gradientColor} />
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-14">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );

  return to ? (
    <Link to={to}>
      <CardContent />
    </Link>
  ) : (
    <div onClick={onClick} onKeyDown={onClick} role="button" tabIndex={0}>
      <CardContent />
    </div>
  );
};

export default IndexCard;
