// UwUImage.tsx

interface UwUImageProps {
    normalSrc?: string;
    uwuSrc: string;
    alt: string;
    className?: string;
}

const UwUImage: React.FC<UwUImageProps> = ({ normalSrc, uwuSrc, alt, className }) => {
    const isUwu = localStorage.getItem('uwu') === 'true';

    // If normalSrc is not provided and uwu mode is not enabled, do not render the image
    if (!normalSrc && !isUwu) {
        return null;
    }

    return (
        <img
            src={isUwu ? uwuSrc : normalSrc}
            alt={alt}
            className={`rounded-lg shadow-lg ${className}`}
        />
    );
};

export default UwUImage;
