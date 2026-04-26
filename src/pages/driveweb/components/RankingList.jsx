import { useState, useEffect } from "react";
import {
  postRankTopUsers,
  postRankTopNetIncome,
  postRankTopFuelEfficiency,
} from "../utils/api";

const RankingList = ({ title, options, rankType }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        let response;
        switch (rankType) {
          case "jobType":
            response = await postRankTopUsers({ jobtype: selectedOption });
            break;
          case "carType":
            response = await postRankTopNetIncome({ carType: selectedOption });
            break;
          case "fuelType":
            response = await postRankTopFuelEfficiency({ fuelType: selectedOption });
            break;
          default:
            throw new Error("알 수 없는 API 타입입니다.");
        }
        setProfiles(response);
      } catch (error) {
        console.error("데이터 요청 중 오류 발생:", error);
      }
    };

    fetchProfiles();
  }, [selectedOption, rankType]);

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="ranking">
      <div>
        <h3>{title}</h3>
        <select value={selectedOption} onChange={handleSelectChange}>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <ul className="profileWrap">
        {profiles.map((profile, index) => (
          <li key={index} className="profile">
            <p>{index + 1}</p>
            <div className="profilePicture"></div>
            <p className="profileName">{profile.nickname}</p>
            {rankType === "jobType" && <p className="profileValue">{profile.totalDrivingTime}분</p>}
            {rankType === "carType" && <p className="profileValue">{profile.netIncome} 원</p>}
            {rankType === "fuelType" && <p className="profileValue">{profile.fuelEfficiency} km/L</p>}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default RankingList;
