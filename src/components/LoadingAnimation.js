import Lottie from "react-lottie-player";
import animationData from "../assets/loading.json";

const LoadingAnimation = ({ size = 200, maxHeight = 80 }) => {
  return (
    <Lottie
      loop
      play
      animationData={animationData}
      style={{
        width: size,
        height: 'auto', // Maintain aspect ratio
        maxHeight: maxHeight, // Limit the height to avoid excessive space
        objectFit: 'contain', // Ensure animation fits within the box
      }}
    />
  );
};

export default LoadingAnimation;