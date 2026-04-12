// Mock 데이터

export const initialTeams = ["전체", "온라인", "퍼포먼스"];

export const initialTeamDetails = {
  전체: ["전체"],
  온라인: ["온라인 1팀", "온라인 2팀"],
  퍼포먼스: ["퍼포먼스 1팀", "퍼포먼스 2팀", "퍼포먼스 3팀", "GFA"],
};

export const initialProducts = [
  { id: 1, name: "알파덴탈" },
  { id: 2, name: "제타메드" },
  { id: 3, name: "베타케어" },
  { id: 4, name: "감마헬스" },
];

export const initialMedia = [
  { id: 1, name: "구글" },
  { id: 2, name: "쿠팡" },
  { id: 3, name: "메타" },
  { id: 4, name: "네이버" },
];

// Mock 운영 데이터 (제품-매체-팀 조합)
export const initialOperationData = {
  "알파덴탈-구글-온라인 1팀": { status: "운영중", value: "150만" },
  "알파덴탈-구글-퍼포먼스 1팀": { status: "운영중", value: "200만" },
  "알파덴탈-메타-온라인 1팀": { status: "운영중", value: "100만" },
  "알파덴탈-쿠팡-퍼포먼스 2팀": { status: "중단됨", value: "75만" },
  "알파덴탈-네이버-온라인 2팀": { status: "운영중", value: "130만" },
  "제타메드-구글-퍼포먼스 1팀": { status: "운영중", value: "95만" },
  "제타메드-쿠팡-퍼포먼스 2팀": { status: "운영중", value: "80만" },
  "제타메드-메타-온라인 1팀": { status: "중단됨", value: "60만" },
  "제타메드-네이버-퍼포먼스 3팀": { status: "운영중", value: "85만" },
  "베타케어-구글-퍼포먼스 1팀": { status: "운영중", value: "180만" },
  "베타케어-구글-퍼포먼스 2팀": { status: "운영중", value: "160만" },
  "베타케어-메타-온라인 2팀": { status: "운영중", value: "140만" },
  "베타케어-쿠팡-퍼포먼스 3팀": { status: "중단됨", value: "70만" },
  "베타케어-네이버-퍼포먼스 3팀": { status: "운영중", value: "90만" },
  "감마헬스-구글-온라인 1팀": { status: "운영중", value: "125만" },
  "감마헬스-메타-온라인 2팀": { status: "운영중", value: "110만" },
  "감마헬스-쿠팡-퍼포먼스 1팀": { status: "중단됨", value: "65만" },
  "감마헬스-네이버-퍼포먼스 2팀": { status: "운영중", value: "105만" },
};
