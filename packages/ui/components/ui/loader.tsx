import { PulseLoader } from "react-spinners";

export const Loader = () => {
  return (
    <section className="h-full w-full flex justify-center items-center">
      <PulseLoader color="#e11d48" size={20} />
    </section>
  );
};
