import { useState } from "react";
import SingleGuide from "./SingleGuide";
import { GuideText } from "./GuideText";

const CroftGuide = () => {
  const [currentGuide, setCurrentGuide] = useState(GuideText);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl p-4 overflow-hidden">
      <div className="text-base font-bold mb-3">CROFT 가이드</div>
      <div className="flex-1 flex flex-col gap-2 overflow-auto">
        {currentGuide.slice(0, 4).map((item) => (
          <SingleGuide
            key={item.id}
            id={item.id}
            text={item.text}
            currentGuide={currentGuide}
            setCurrentGuide={setCurrentGuide}
          />
        ))}
      </div>
      <div className="text-[#124946] text-xs text-right pt-2 cursor-pointer hover:underline">
        전체 보기
      </div>
    </div>
  );
};

export default CroftGuide;
