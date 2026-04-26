import React from 'react';
import { useNavigate } from 'react-router-dom';

const GreenHouseSide = ({ isOpen, currentUrl }) => {
  const navigate = useNavigate();
  const clickGreenHouse = [
    {
      id: 1,
      text: '온실환경 종합',
      route: '/portfolio/croft/dash/environment/total',
      route2: '/portfolio/croft/dash/environment/total/temp',
    },
    {
      id: 2,
      text: 'RTR',
      route: '/portfolio/croft/dash/environment/RTR',
      route2: '/portfolio/croft/dash/environment/RTR',
    },
    {
      id: 3,
      text: 'DLI',
      route: '/portfolio/croft/dash/environment/DLI',
      route2: '/portfolio/croft/dash/environment/DLI',
    },
    {
      id: 4,
      text: 'VPD',
      route: '/portfolio/croft/dash/environment/VPD',
      route2: '/portfolio/croft/dash/environment/VPD',
    },
    {
      id: 5,
      text: 'Photo Period',
      route: '/portfolio/croft/dash/environment/PP',
      route2: '/portfolio/croft/dash/environment/PP',
    },
  ];
  return (
    <div
      className={`w-[150px] h-full bg-[#444540] flex flex-col  gap-[17px] ease-in-out duration-300 cursor-pointer box-border ${
        isOpen ? 'max-w-[150px] pt-[157px] pl-[23px]' : 'max-w-[0px]'
      } `}
    >
      {clickGreenHouse.map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(item.route2)}
          className={`${
            currentUrl.includes(item.route) ? 'text-white' : 'text-base500'
          } ${isOpen ? '' : 'hidden'}`}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default GreenHouseSide;
