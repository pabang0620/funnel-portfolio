import React from "react";
import RankingList from "../components/RankingList";

function Home() {
  return (
    <div className="homeContainer">
      <div className="mainBanner">
        <div className="bannerText">
          <h3>당신의 안전한 운행을 위한 최고의 기록 도구</h3>
          <h2>
            손쉽게, 더 효율적으로
            <br />
            기록하자
          </h2>
        </div>
      </div>
      <div className="contentsInner">
        <div className="rankingList">
          <RankingList
            title={"연비"}
            rankType={"jobType"}
            options={["전체", "LPG", "전기", "휘발유", "기타"]}
          />
          <RankingList
            title={"운행시간"}
            rankType={"carType"}
            options={["전체직종", "택시", "배달", "기타"]}
          />
          <RankingList
            title={"총 운송수입금"}
            rankType={"fuelType"}
            options={[]}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
