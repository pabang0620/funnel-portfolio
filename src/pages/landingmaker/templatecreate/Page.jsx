import { useState, useEffect, useMemo } from "react";
import PortfolioWidget from '@/components/landingmaker/PortfolioWidget'
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faListCheck,
  faPalette,
  faFileLines,
  faBuilding,
  faAlignLeft,
  faMousePointer,
  faFile,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faList,
  faSpinner,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import TemplatePreview from "@/components/landingmaker/TemplatePreview";
import LandingPreview from "@/components/landingmaker/LandingPreview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/landingmaker/ui/alert-dialog";
import {
  getTagSettings,
  createLanding,
  updateLanding,
  getLanding,
  uploadAsset,
  getDomainList,
  getRecentLandingsByDomain,
} from "./api";
import { bulkUpdateByDomain, getLandingsByDomain, bulkUpdateButtonsByDomain } from "../dashboard/api";
import Header from "@/components/landingmaker/Header";

export default function TemplateCreate({ mode = "create" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { adNumber, domainUrl } = useParams();
  const isBulkEdit = mode === "bulk-edit";

  const [currentStep, setCurrentStep] = useState(location.state?.step || 1);
  const [loading, setLoading] = useState(false);
  const [showBasicSettings, setShowBasicSettings] = useState(true);
  const [showStyleSettings, setShowStyleSettings] = useState(true);
  const [showPrevAlert, setShowPrevAlert] = useState(false);
  const [showBulkSaveAlert, setShowBulkSaveAlert] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("templateFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    domain: "example1.com",
    bigcConnection: "연동 안 함",
    template: 11,
    images: {},
    imageAlts: {},
    formStyle: "light",
    privacyPolicyName: "랜딩메이커",
    privacyPolicy: `■ 개인정보처리방침
관련 법령에 의거한 개인정보취급방침을 정하여 이용자 권익 보호에 최선을 다하고 있습니다.
수집한 정보는 상담 외의 용도로 활용하지 않습니다.

1. 개인정보 수집 및 이용 목적
개인정보 수집주체: 랜딩메이커
개인정보 수집항목: 이름, 연락처, 상담내용
개인정보 수집 및 이용목적: 서비스 상담 및 안내
개인정보 보유 및 이용기간: 수집일로부터 6개월(고객 등의 철회시 지체없이 파기)

2. 개인정보 취급 위탁
개인정보 취급 위탁을 받는 자: 제휴사
개인정보 취급 위탁 항목: 이름, 연락처, 상담 내용
개인정보 취급 위탁 목적: 상담 및 서비스 제공, 홈페이지 운영 및 관리, 이벤트 등 광고성 정보 전달

3. 자동으로 수집되는 개인정보 항목
서비스 이용 과정에서 다음과 같은 정보가 자동으로 생성·수집될 수 있습니다.
• 접속 로그, 쿠키, 접속 IP, 기기 정보, 브라우저 정보, 방문일시
• 광고 식별자(Google 광고 ID, Facebook Pixel 등), 이용자 행동 데이터(페이지 이동, 버튼 클릭 등)
※ 해당 정보는 서비스 개선, 오류 분석, 맞춤형 광고 제공, 보안 점검 목적으로 활용됩니다.

4. 쿠키(Cookie)의 사용 및 거부
회사는 이용자 맞춤 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다.
• 쿠키란 웹사이트 서버가 사용자의 브라우저에 전송하는 소량의 정보로, 이용자 식별 및 방문 기록 분석에 활용됩니다.
• 이용자는 웹브라우저의 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용에 제한이 있을 수 있습니다.

5. 외부 서비스(제3자) 제공 및 연동 안내
회사는 서비스 품질 향상 및 광고 효율 분석을 위해 다음 외부 서비스와 연동할 수 있습니다.
• Google Analytics, Google Tag Manager, Google Ads Conversion Tracking
• Meta Pixel(Facebook/Instagram), Naver Analytics, Kakao Pixel 등

이 과정에서 비식별 정보(쿠키, IP, 브라우저 정보 등)가 해당 사업자에게 전송될 수 있으며,
이는 익명화되어 광고 성과 측정 및 서비스 개선에만 사용됩니다.

6. 개인정보의 보호 및 관리
회사는 개인정보의 분실, 도난, 누출, 위조 또는 훼손을 방지하기 위해
SSL 암호화 통신, 접근권한 최소화, 정기적 보안 점검 등 기술적·관리적 보호조치를 시행하고 있습니다.

7. 이용자의 권리 및 행사 방법
이용자는 언제든지 자신의 개인정보 열람, 수정, 삭제, 처리정지를 요청할 수 있습니다.
요청 시 신속히 처리하며, 법령에 따라 일정 정보는 보관될 수 있습니다.`,
    privacyPolicyClassName: "light",
    serviceInfoClassName: null,
    buttonPosition: null,
    buttonImage: "",
    keepBtnLocate: null,
    keepBtnImage: "",
    benefitPeriodType: null,
    footerClassName: "",
    footerDetail: `유의사항
서비스 내용 및 혜택은 상황에 따라 변경될 수 있습니다.
자세한 내용은 고객센터로 문의해 주세요.`,
    surveyList: [], // 새로운 설문 목록
    // 설문 전역 설정
    surveySettings: {
      numberColor: "#3498db",
      numberFormat: "", // 빈 값이면 1, 2, 3만 표시
      answerColor: "#2c3e50",
    },
  });

  const [domains, setDomains] = useState(['example1.com', 'example2.com', 'example3.com', 'demo-site.kr']);
  const bigcOptions = ["연동 안 함", "성남", "대구", "부산"];

  // domains 상태 변경 모니터링
  useEffect(() => {
    // console.log("🏷️ domains 상태 변경됨:", domains);
  }, [domains]);

  // 도메인별 버튼/푸터 이미지 목록
  const [postBtnImages, setPostBtnImages] = useState([]);
  const [footerImages, setFooterImages] = useState([]);
  const [domainLandings, setDomainLandings] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  // 2단계 이상: 버튼 세트 (keepBtn + postBtn)
  const [buttonSets, setButtonSets] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null); // 선택된 색상
  const [selectedSet, setSelectedSet] = useState(null);
  // 각 페이지별 이미지 개수 관리 (기본값 1개)
  const [imageCountPerPage, setImageCountPerPage] = useState({});
  
  // 버튼 일괄수정 모달 상태
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [buttonModalTab, setButtonModalTab] = useState('stage1'); // 'stage1' | 'stage23'
  const [buttonModalSettings, setButtonModalSettings] = useState({
    stage1: {
      postBtnLocate: null, // null(일반형) | 'fixed'(띄움형)
      postBtnUrl: '',
    },
    stage23: {
      keepBtnLocate: null, // null(일반형) | 'fixed'(띄움형)
      postBtnLocate: null, // null(일반형) | 'fixed'(띄움형)
      selectedButtonSet: null,
    }
  });

  // 버튼 일괄수정 임시 저장 상태 (일괄 저장 시 적용될 설정)
  const [pendingButtonSettings, setPendingButtonSettings] = useState(null);

  // 2단계 이상 템플릿용 하드코딩된 버튼 세트
  const STATIC_BUTTON_SETS = [
    // Blue - 2 sets
    {
      key: "blue-1",
      color: "blue",
      num: "1",
      label: "Blue-1",
      keepBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/keepBtn1.png",
      postBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/postBtn1.png",
    },
    {
      key: "blue-2",
      color: "blue",
      num: "2",
      label: "Blue-2",
      keepBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/keepBtn2.png",
      postBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/postBtn2.png",
    },
    // Green - 1 set
    {
      key: "green-1",
      color: "green",
      num: "1",
      label: "Green-1",
      keepBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/green/keepBtn1.png",
      postBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/green/postBtn1.png",
    },
    // Orange - 2 sets
    {
      key: "orange-1",
      color: "orange",
      num: "1",
      label: "Orange-1",
      keepBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/keepBtn1.png",
      postBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/postBtn1.png",
    },
    {
      key: "orange-2",
      color: "orange",
      num: "2",
      label: "Orange-2",
      keepBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/keepBtn2.png",
      postBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/postBtn2.png",
    },
    // Pink - 1 set
    {
      key: "pink-1",
      color: "pink",
      num: "1",
      label: "Pink-1",
      keepBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/pink/keepBtn1.png",
      postBtn:
        "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/pink/postBtn1.png",
    },
  ];

  // 즐겨찾기 토글
  const toggleFavorite = (templateId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId];
      localStorage.setItem("templateFavorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // 최신 랜딩 정보 불러오기
  const [recentLandings, setRecentLandings] = useState({});
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLanding, setSelectedLanding] = useState("");

  // Authentication check - redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.warn("No authentication token found. Redirecting to login...");
      navigate("/portfolio/landingmaker/login", { replace: true });
    }
  }, [navigate]);

  // formData 실시간 출력 (privacyPolicy 제외)
  useEffect(() => {
    const { privacyPolicy, ...formDataWithoutPrivacy } = formData;
    // console.log("=== 현재 formData ===");
    // console.log(
      // JSON.stringify(
        // {
          // ...formDataWithoutPrivacy,
          // privacyPolicy: `[${privacyPolicy?.length || 0}자 - 콘솔에서 생략됨]`,
        // },
        // null,
        // 2
      // )
    // );
  }, [formData]);

  // 도메인 목록 로드
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // console.log("🔍 도메인 목록 조회 시작...");

        // 먼저 getDomainList 시도
        // console.log("1️⃣ getDomainList() 시도...");
        const domainResponse = await getDomainList();
        // console.log("📋 getDomainList 응답:", domainResponse);

        if (domainResponse.success && domainResponse.data) {
          // console.log(
            // "✅ getDomainList로 도메인 목록 설정:",
            // domainResponse.data
          // );
          // 백엔드가 [{domainUrl, accountName}, ...] 형태로 반환하므로 domainUrl만 추출
          const domainList = domainResponse.data.map((d) => d.domainUrl);
          setDomains(domainList);
          return;
        }

        // getDomainList가 실패하면 getTagSettings 시도 (기존 방식)
        // console.log("2️⃣ getTagSettings() 시도...");
        const tagResponse = await getTagSettings();
        // console.log("📋 getTagSettings 응답:", tagResponse);

        if (tagResponse.success) {
          // 태그 설정에서 도메인 목록 추출
          const domainList = tagResponse.data
            ? Object.keys(tagResponse.data)
            : [];
          // console.log("✅ getTagSettings로 도메인 목록 설정:", domainList);
          setDomains(domainList);
        } else {
          // console.error("❌ 모든 도메인 목록 조회 방법 실패");
          // 임시로 하드코딩된 도메인 사용
          // console.log("🔧 임시 도메인 목록 사용");
          setDomains([
            "dentevent",
            "dentaleventhub",
            "dentvents",
            "eventclinic",
          ]);
        }
      } catch (error) {
        // console.error("💥 도메인 목록 조회 오류:", error);
        // 에러 발생 시에도 임시 도메인 사용
        // console.log("🔧 에러 발생, 임시 도메인 목록 사용");
        setDomains(["dentevent", "dentaleventhub", "dentvents", "eventclinic"]);
      }
    };
    fetchDomains();
  }, []);

  // 도메인별 최신 랜딩 정보 로드
  useEffect(() => {
    const fetchRecentLandings = async () => {
      try {
        const response = await getRecentLandingsByDomain();
        if (response.success) {
          setRecentLandings(response.data);
          // console.log("도메인별 최신 랜딩 정보:", response.data);
        }
      } catch (error) {
        // console.error("최신 랜딩 정보 조회 오류:", error);
      }
    };
    fetchRecentLandings();
  }, []);

  // bulk-edit 모드일 때 도메인 랜딩 목록 로드
  useEffect(() => {
    if (isBulkEdit && domainUrl) {
      // console.log(
        // "🔍 bulk-edit 모드: 도메인 랜딩 목록 로드 시작...",
        // domainUrl
      // );
      fetchDomainLandings(decodeURIComponent(domainUrl));
    }
  }, [isBulkEdit, domainUrl]);

  // bulk-edit 모드일 때 domainUrl을 formData.domain에 설정
  useEffect(() => {
    if (isBulkEdit && domainUrl) {
      const decodedDomain = decodeURIComponent(domainUrl);
      // console.log(
        // "🔍 bulk-edit 모드: formData.domain 설정...",
        // decodedDomain
      // );
      setFormData(prev => ({
        ...prev,
        domain: decodedDomain
      }));
    }
  }, [isBulkEdit, domainUrl]);

  // 템플릿/도메인 선택 시 버튼/푸터 이미지 로드
  useEffect(() => {
    const pageCount = getPageCount();
    // console.log(
      // "🔍 useEffect 시작 - pageCount:",
      // pageCount,
      // "domain:",
      // formData.domain,
      // "template:",
      // formData.template
    // );

    // 1단계: 도메인 필수, 2단계 이상: 템플릿만 있으면 됨
    if (pageCount === 1 && !formData.domain) {
      // console.log("❌ 1단계인데 도메인 없음 - early return");
      setPostBtnImages([]);
      setFooterImages([]);
      setButtonSets([]);
      setSelectedColor(null);
      setSelectedSet(null);
      return;
    }

    // bulk-edit 모드가 아닐 때만 template 필수 체크
    if (!formData.template && !isBulkEdit) {
      // console.log("❌ 템플릿 없음 - early return");
      setPostBtnImages([]);
      setFooterImages([]);
      setButtonSets([]);
      setSelectedColor(null);
      setSelectedSet(null);
      return;
    }

    // console.log("✅ 조건 통과 - fetchAssets 실행 예정");

    // 템플릿 변경 시 선택 초기화
    setSelectedColor(null);
    setSelectedSet(null);

    const fetchAssets = async () => {
      try {
        setLoadingAssets(true);

        // 2단계 이상: 하드코딩된 버튼 세트 사용 (API 호출 없음)
        // console.log("🔍 fetchAssets - 템플릿 단계 확인:");
        // console.log("  - 선택된 템플릿:", formData.template);
        // console.log("  - pageCount:", pageCount);
        // console.log("  - STATIC_BUTTON_SETS 길이:", STATIC_BUTTON_SETS.length);

        if (pageCount > 1) {
          // console.log("✅ 2단계 이상 템플릿 - STATIC_BUTTON_SETS 설정");
          setButtonSets(STATIC_BUTTON_SETS);
          setPostBtnImages([]); // 1단계 전용

          // 푸터는 도메인이 있을 때만 로드
          if (formData.domain) {
            const footerRes = await uploadAsset(formData.domain, "footer");
            if (footerRes && footerRes.success) {
              setFooterImages(footerRes.data.files || []);
            }
          } else {
            setFooterImages([]);
          }
        } else {
          // 1단계: 도메인별 버튼 이미지만 로드
          // console.log(
            // "🔵 1단계 템플릿 - postBtn 로드 시작, 도메인:",
            // formData.domain
          // );
          const postBtnRes = await uploadAsset(formData.domain, "postBtn");
          // console.log("🔵 postBtnRes 결과:", postBtnRes);

          // 푸터는 도메인이 있을 때만 로드
          let footerRes = null;
          if (formData.domain) {
            footerRes = await uploadAsset(formData.domain, "footer");
          }

          if (postBtnRes.success) {
            // console.log(
              // "✅ postBtnRes 성공 - 파일 설정:",
              // postBtnRes.data.files
            // );
            setPostBtnImages(postBtnRes.data.files || []);
          } else {
            // console.log("❌ postBtnRes 실패:", postBtnRes);
            setPostBtnImages([]);
          }

          if (footerRes && footerRes.success) {
            setFooterImages(footerRes.data.files || []);
          }

          // console.log("🔵 1단계 템플릿 - buttonSets 빈 배열 설정");
          setButtonSets([]); // 1단계는 버튼 세트 사용 안 함
        }
      } catch (error) {
        // console.error("에셋 파일 로드 오류:", error);
        setPostBtnImages([]);
        setFooterImages([]);
        setButtonSets([]);
        setSelectedColor(null);
        setSelectedSet(null);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [formData.domain, formData.template]);

  // adNumber가 있으면 기존 데이터 로드
  useEffect(() => {
    if (adNumber) {
      const fetchLandingData = async () => {
        try {
          setLoading(true);
          const response = await getLanding(adNumber);
          if (response.success) {
            const data = response.data;
            // console.log("랜딩 데이터:", data);
            // console.log("받은 step 값:", data.step, "타입:", typeof data.step);

            // adNumber가 있는 경우(수정 모드)는 템플릿 선택 건너뛰고 2단계부터 시작
            // console.log("수정 모드: 템플릿 선택 건너뛰고 2단계(설정)부터 시작");
            setCurrentStep(2);

            // DB 데이터를 formData에 매핑
            // templateKey에서 단계 추출 (11 → 1, 21 → 2, 22 → 2, 23 → 2)
            const templateStage = data.templateKey
              ? Math.floor(data.templateKey / 10)
              : 1;

            const images = {};
            // imgUrl 인덱스를 페이지-칸 번호로 변환하여 배치
            // imgUrl1 → "1-1", imgUrl2 → "1-2", imgUrl3 → "2-1", ...
            [
              data.imgUrl1,
              data.imgUrl2,
              data.imgUrl3,
              data.imgUrl4,
              data.imgUrl5,
              data.imgUrl6,
            ].forEach((url, index) => {
              if (url) {
                // imgUrl 인덱스(1,2,3,4,5,6)를 페이지-칸 번호로 변환
                const imgUrlIndex = index + 1;
                const page = Math.ceil(imgUrlIndex / 2); // 1→1, 2→1, 3→2, 4→2, 5→3, 6→3
                const slot = ((imgUrlIndex - 1) % 2) + 1; // 1→1, 2→2, 3→1, 4→2, 5→1, 6→2
                const key = `${page}-${slot}`; // "1-1", "1-2", "2-1", "2-2", "3-1", "3-2"

                images[key] = url;
                // console.log(`✓ 이미지 매핑: imgUrl${imgUrlIndex} → ${key}`);
              }
            });

            // console.log("✅ 이미지 키 변환 완료:");
            // console.log(
              // "  - templateKey:",
              // data.templateKey,
              // "→ stage:",
              // templateStage
            // );
            // console.log("  - images 키:", Object.keys(images));
            // console.log("  - images 데이터:", images);

            // 각 페이지별 최대 이미지 번호 계산 (imageCountPerPage 설정)
            const imageCountByPage = {};
            Object.keys(images).forEach((key) => {
              const [pageNum, imageNum] = key.split("-").map(Number);
              if (
                !imageCountByPage[pageNum] ||
                imageCountByPage[pageNum] < imageNum
              ) {
                imageCountByPage[pageNum] = imageNum;
              }
            });

            // console.log("✅ 페이지별 최대 이미지 슬롯:", imageCountByPage);
            setImageCountPerPage(imageCountByPage);

            // surveyTopic과 surveyAnswer를 surveyList와 surveySettings로 변환
            const surveyList = [];
            const surveySettings = {
              numberColor: data.surveyTopic?.numberColor || "#3498db",
              numberFormat: data.surveyTopic?.numberFormat || "",
              answerColor: data.surveyAnswer?.answerColor || "#2c3e50",
            };

            if (data.surveyTopic && data.surveyAnswer) {
              const topics = data.surveyTopic.topic || [];
              const answers = data.surveyAnswer.answers || [];

              topics.forEach((topic, idx) => {
                surveyList.push({
                  questionText: topic.text || "",
                  surveyDisplayType: topic.type || "button",
                  optionCount: answers[idx]?.length || 4,
                  pageNum: topic.pageNum || 1, // 기본값: 페이지 1
                  options: (answers[idx] || []).map((text) => ({ text })),
                });
              });
            }

            // console.log("✅ 수정 모드: formData 업데이트 시작");
            // console.log("  - template:", data.templateKey);
            // console.log("  - domain:", data.domain);
            // console.log("  - formStyle:", data.formStyleClassName);
            // console.log("  - privacyPolicyClassName:", data.privacyPolicyClassName);
            // console.log("  - surveyList 개수:", surveyList.length);
            // console.log("  - images 개수:", Object.keys(images).length);

            // endpoint 값으로 bigcConnection 복원
            let bigcConnection = "연동 안 함";
            if (data.endpoint) {
              const last7 = data.endpoint.slice(-7);
              if (last7 === "bM340A5") {
                bigcConnection = "성남";
              } else if (last7 === "CHSjfle") {
                bigcConnection = "대구";
              } else if (last7 === "lTu0DF7") {
                bigcConnection = "부산";
              }
            }
            // console.log("  - endpoint:", data.endpoint);
            // console.log("  - 복원된 bigcConnection:", bigcConnection);

            const baseFormData = {
              ...formData,
              domain: data.domain || "",
              bigcConnection,
              template: data.templateKey || "", // DB에서 받은 templateKey 사용
              images,
              formStyle: data.formStyleClassName || "",
              privacyPolicyName: data.privacyPolicyName || "본원",
              privacyPolicy: data.privacyPolicy || formData.privacyPolicy,
              privacyPolicyClassName: data.privacyPolicyClassName || "light",
              serviceInfoClassName: data.serviceInfoClassName || null,
              buttonPosition: data.postBtnLocate || null,
              buttonImage: data.postBtnUrl || "",
              keepBtnLocate: data.keepBtnLocate || null,
              keepBtnImage: data.keepBtnUrl || "",
              benefitPeriodType: data.benefitDate || null,
              footerClassName: data.footerClassName || "",
              footerDetail: data.footerDetail || "",
              surveyList,
              surveySettings,
            };

            // 수정 모드: 템플릿에 맞는 기본 폼 구조 보장
            const enhancedFormData = ensureTemplateFormStructure(
              baseFormData,
              data.templateKey
            );
            // console.log("🔍 최종 formData 설정:", enhancedFormData);
            setFormData(enhancedFormData);

            // ALT 텍스트 로드 - imgALT 인덱스를 페이지-칸 번호로 변환
            const imageAlts = {};
            const imgUrls = [
              data.imgUrl1,
              data.imgUrl2,
              data.imgUrl3,
              data.imgUrl4,
              data.imgUrl5,
              data.imgUrl6,
            ];
            const imgALTs = [
              data.imgALT1,
              data.imgALT2,
              data.imgALT3,
              data.imgALT4,
              data.imgALT5,
              data.imgALT6,
            ];

            imgUrls.forEach((url, index) => {
              if (url) {
                // imgALT 인덱스(1,2,3,4,5,6)를 페이지-칸 번호로 변환
                const imgAltIndex = index + 1;
                const page = Math.ceil(imgAltIndex / 2);
                const slot = ((imgAltIndex - 1) % 2) + 1;
                const key = `${page}-${slot}`;

                imageAlts[key] = imgALTs[index] || "";
                // console.log(
                  // `✓ ALT 매핑: imgALT${imgAltIndex} → ${key} = "${imgALTs[index]}"`
                // );
              }
            });
            setFormData((prev) => ({ ...prev, imageAlts }));
          }
        } catch (error) {
          // console.error("랜딩 데이터 조회 오류:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLandingData();
    }
  }, [adNumber]);

  // 수정 모드: keepBtnImage가 로드된 후 버튼 색상/세트 선택 복원 (별도 useEffect)
  useEffect(() => {
    if (adNumber && formData.keepBtnImage) {
      // console.log(
        // "🔄 keepBtnImage 변경 감지, 버튼 선택 복원 시도:",
        // formData.keepBtnImage
      // );

      // URL에서 색상과 번호 추출
      const urlMatch = formData.keepBtnImage.match(
        /\/button\/([^\/]+)\/keepBtn(\d+)\.png/
      );

      if (urlMatch) {
        const [, color, num] = urlMatch;
        // console.log("🔍 추출된 색상과 번호:", { color, num });

        // STATIC_BUTTON_SETS에서 매칭되는 세트 찾기
        const matchingSet = STATIC_BUTTON_SETS.find(
          (set) => set.color === color && set.num === num
        );

        if (matchingSet) {
          // console.log("✅ 버튼 선택 복원 실행:", {
            // color,
            // num,
            // set: matchingSet.key,
            // currentSelectedColor: selectedColor,
            // currentSelectedSet: selectedSet?.key,
          // });
          setSelectedColor(color);
          setSelectedSet(matchingSet);
        } else {
          // console.warn("⚠️ 매칭 실패:", {
            // color,
            // num,
            // availableSets: STATIC_BUTTON_SETS.length,
          // });
        }
      } else {
        // console.warn("⚠️ URL 패턴 불일치:", formData.keepBtnImage);
      }
    }
  }, [adNumber, formData.keepBtnImage]);

  const templates1Stage = [
    { id: 11, name: "기본형", desc: "이미지, 폼" },
    { id: 12, name: "설문형", desc: "이미지, 설문, 폼" },
    { id: 13, name: "설문2개형", desc: "이미지, 설문, 설문, 폼" },
  ];

  const templates2Stage = [
    {
      id: 21,
      name: "설문 → 폼",
      desc: "[페이지1] 이미지, 설문\n[페이지2] 이미지, 폼",
    },
    {
      id: 22,
      name: "이미지 → 설문+폼",
      desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문, 폼",
    },
    {
      id: 23,
      name: "이미지 → 폼",
      desc: "[페이지1] 이미지\n[페이지2] 이미지, 폼",
    },
    {
      id: 24,
      name: "설문2개 → 폼",
      desc: "[페이지1] 이미지, 설문, 설문\n[페이지2] 이미지, 폼",
    },
    {
      id: 25,
      name: "이미지 → 설문2개+폼",
      desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문, 설문, 폼",
    },
  ];

  const templates3Stage = [
    {
      id: 31,
      name: "이미지 → 설문 → 폼",
      desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문\n[페이지3] 이미지, 폼",
    },
    {
      id: 32,
      name: "설문 → 설문 → 폼",
      desc: "[페이지1] 이미지, 설문\n[페이지2] 이미지, 설문\n[페이지3] 이미지, 폼",
    },
    {
      id: 33,
      name: "이미지 → 설문2개 → 폼",
      desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문, 설문\n[페이지3] 이미지, 폼",
    },
  ];

  const formStyles = [
    {
      id: "gray",
      name: "Gray",
      features: ["회색 배경", "깔끔한 테두리"],
    },
    {
      id: "light",
      name: "Light",
      features: ["밝은 회색 배경", "부드러운 느낌"],
    },
    {
      id: "white",
      name: "White",
      features: ["흰색 배경", "그림자 효과"],
    },
    {
      id: "beige",
      name: "Beige",
      features: ["베이지 배경", "따뜻한 느낌"],
    },
    {
      id: "blue",
      name: "Blue",
      features: ["파란색 배경", "시원한 느낌"],
    },
    {
      id: "modern",
      name: "Modern",
      features: ["둥근 모서리", "그림자 효과"],
    },
    {
      id: "none",
      name: "None",
      features: ["배경 없음", "깔끔한 스타일"],
    },
    {
      id: "outline",
      name: "Outline",
      features: ["테두리 강조", "모던한 느낌"],
    },
    {
      id: "outline-square",
      name: "Square",
      features: ["각진 테두리", "깔끔한 느낌"],
    },
    {
      id: "outline-gray",
      name: "Gray Box",
      features: ["회색 배경", "테두리 강조"],
    },
  ];

  // 전체 footer 스타일 목록 (상수)
  // 기본 푸터 스타일 (단순한 디자인)
  const basicFooterStyles = [
    {
      id: "",
      name: "없음",
      features: ["푸터 표시 안함"],
      isLegacy: false,
    },
    {
      id: "footer-dark",
      name: "Dark",
      features: ["어두운 배경", "흰색 텍스트"],
      isLegacy: false,
    },
    {
      id: "footer-light",
      name: "Light",
      features: ["밝은 회색 배경", "테두리 포함"],
      isLegacy: false,
    },
    {
      id: "footer-blue",
      name: "Blue",
      features: ["파란색 배경", "흰색 텍스트"],
      isLegacy: false,
    },
    {
      id: "footer-minimal",
      name: "Minimal",
      features: ["투명 배경", "상단 라인만"],
      isLegacy: false,
    },
    {
      id: "footer-gray-border",
      name: "Gray",
      features: ["회색 테두리", "둥근 모서리"],
      isLegacy: false,
    },
    {
      id: "footer-navy",
      name: "Navy",
      features: ["네이비 배경", "둥근 모서리"],
      isLegacy: false,
    },
  ];

  // 레거시 푸터 스타일 (복잡한 구조 - 타원형, 박스 in 박스, 구분선 등)
  const legacyFooterStyles = [
    {
      id: "footer-obsidian",
      name: "Obsidian",
      features: ["유의사항(타원형)", "어두운 배경", "중앙정렬"],
      isLegacy: true,
      isSpecial: false,
      domain: "eventclinic",
    },
    {
      id: "footer-capsule",
      name: "Capsule",
      features: ["박스 인 박스", "중앙정렬"],
      isLegacy: true,
      isSpecial: true,
      domain: "dentvents",
    },
    {
      id: "footer-chrome",
      name: "Chrome",
      features: ["회사명+구분선", "밝은 회색", "중앙정렬"],
      isLegacy: true,
      isSpecial: false,
      domain: "dentevent",
    },
    {
      id: "footer-concrete",
      name: "Concrete",
      features: ["중간 회색", "전체 너비", "중앙정렬"],
      isLegacy: true,
      isSpecial: false,
      domain: "dentaleventhub",
    },
    {
      id: "footer-pearl-left",
      name: "Pearl",
      features: ["유의사항 제목", "중간 회색", "왼쪽정렬"],
      isLegacy: true,
      isSpecial: false,
      domain: "eventiro",
    },
  ];

  // 모든 푸터 스타일 (섹션별로 그룹화)
  const footerStyleSections = [
    { title: "기본 푸터", styles: basicFooterStyles },
    { title: "레거시 푸터 (특수 디자인)", styles: legacyFooterStyles },
  ];

  const serviceInfoStyles = [
    {
      id: "",
      name: "없음",
      features: ["미표시"],
    },
    {
      id: "service-dark",
      name: "Dark",
      features: ["어두운 배경", "흰색 텍스트"],
    },
    {
      id: "service-light",
      name: "Light",
      features: ["밝은 회색 배경", "테두리 포함"],
    },
    {
      id: "service-white",
      name: "White",
      features: ["흰색 배경", "그림자 효과"],
    },
    {
      id: "service-beige",
      name: "Beige",
      features: ["베이지 배경", "따뜻한 느낌"],
    },
    {
      id: "service-blue",
      name: "Blue",
      features: ["파란색 배경", "그라데이션"],
    },
  ];

  const surveyColors = [
    { label: "보라색", value: "#9b59b6" },
    { label: "남색", value: "#3498db" },
    { label: "초록색", value: "#27ae60" },
    { label: "주황색", value: "#ff8c42" },
    { label: "검정색", value: "#2c3e50" },
    { label: "핑크색", value: "#e91e63" },
  ];

  const consentStyles = [
    { id: "dark", name: "Dark", features: ["검정 배경", "흰색 텍스트"] },
    {
      id: "light",
      name: "Light",
      features: ["밝은 회색 배경", "자연스러운 색상"],
    },
    { id: "white", name: "White", features: ["흰 배경", "그림자 효과"] },
    { id: "beige", name: "Beige", features: ["베이지 배경", "따뜻한 느낌"] },
    { id: "blue", name: "Blue", features: ["하늘색 배경", "시원한 느낌"] },
  ];

  const privacyStyles = [
    {
      id: "style1",
      name: "강조형",
      subtitle: "스타일 1 - 전체 표시",
      features: ["회색 배경", "두꺼운 테두리", "큰 여백", "가장 눈에 잘 띔"],
    },
    {
      id: "style2",
      name: "표준형",
      subtitle: "스타일 2 - 간략 표시",
      features: ["흰 배경", "파란 테두리", "파란색 제목", "중간 강조"],
    },
    {
      id: "style3",
      name: "미니멀형",
      subtitle: "스타일 3 - 최소 표시",
      features: ["밝은 회색 배경", "테두리 없음", "작은 여백", "최소한 표시"],
    },
  ];

  const partnerNoticeStyles = [
    {
      id: null,
      name: "숨김",
      subtitle: "표시 안 함",
      features: ["제휴사 안내 미표시"],
    },
    {
      id: "style1",
      name: "강조형",
      subtitle: "스타일 1 - 전체 안내",
      features: ["노란 배경", "두꺼운 테두리", "큰 여백", "강조 표시"],
    },
    {
      id: "style2",
      name: "표준형",
      subtitle: "스타일 2 - 간략 안내",
      features: ["연한 노란 배경", "가는 테두리", "중간 여백"],
    },
    {
      id: "style3",
      name: "미니멀형",
      subtitle: "스타일 3 - 최소 안내",
      features: ["매우 연한 배경", "테두리 없음", "작은 여백"],
    },
  ];

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep === 2 && adNumber) {
      // 수정 모드에서 2단계에서 이전 버튼: 랜딩 목록으로
      navigate("/portfolio/landingmaker");
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 버튼 세트 선택 핸들러 (2단계 이상)
  const handleSetSelect = (set) => {
    setSelectedSet(set);
    setFormData({
      ...formData,
      keepBtnImage: set.keepBtn,
      buttonImage: set.postBtn,
    });
  };

  // STEP 3로 진행 가능한지 확인
  const canProceedToStep3 = () => {
    return (
      formData.domain &&
      formData.template &&
      Object.keys(formData.images).length > 0
    );
  };

  // 선택한 랜딩 데이터로 formData 자동 채우기
  const loadLandingData = (landingData) => {
    // console.log("랜딩 데이터 로드:", landingData);

    // surveyTopic과 surveyAnswer를 surveyList와 surveySettings로 변환
    const surveyList = [];
    const surveySettings = {
      numberColor: landingData.surveyTopic?.numberColor || "#3498db",
      numberFormat: landingData.surveyTopic?.numberFormat || "",
      answerColor: landingData.surveyAnswer?.answerColor || "#2c3e50",
    };

    if (landingData.surveyTopic?.topic && landingData.surveyAnswer?.answers) {
      landingData.surveyTopic.topic.forEach((topic, idx) => {
        const answers = landingData.surveyAnswer.answers[idx] || [];
        surveyList.push({
          questionText: topic.text,
          surveyDisplayType: topic.type || "button",
          optionCount: answers.length,
          pageNum: topic.pageNum || 1, // 기본값: 페이지 1
          options: answers.map((text) => ({ text })),
        });
      });
    }

    setFormData((prevData) => ({
      ...prevData,
      domain: landingData.domain || "",
      template: landingData.templateKey || "",
      formStyle: landingData.formStyleClassName || "",
      privacyPolicyName: landingData.privacyPolicyName || "본원",
      privacyPolicy: landingData.privacyPolicy || prevData.privacyPolicy,
      privacyPolicyClassName: landingData.privacyPolicyClassName || "light",
      serviceInfoClassName: landingData.serviceInfoClassName || null,
      buttonPosition: landingData.postBtnLocate || null,
      buttonImage: landingData.postBtnUrl || "",
      keepBtnLocate: landingData.keepBtnLocate || null,
      keepBtnImage: landingData.keepBtnUrl || "",
      benefitPeriodType: landingData.benefitDate || null,
      footerClassName: landingData.footerClassName || "",
      footerDetail: landingData.footerDetail || "",
      surveyList,
      surveySettings,
    }));

    // console.log("✅ 랜딩 데이터 로드 완료");
  };

  // formData를 FormData(multipart)로 변환
  const convertFormDataToAPI = () => {
    const apiFormData = new FormData();

    // surveyList에서 surveyTopic과 surveyAnswer JSON 생성
    let surveyTopic = null;
    let surveyAnswer = null;

    if (formData.surveyList && formData.surveyList.length > 0) {
      // 유효한 설문만 필터링 (질문과 답변이 모두 있는 것만)
      const validSurveys = formData.surveyList.filter(
        (survey) =>
          survey.questionText && survey.options.some((opt) => opt.text)
      );

      if (validSurveys.length > 0) {
        // surveyTopic 생성 - surveySettings 값 사용
        surveyTopic = {
          numberColor: formData.surveySettings?.numberColor || "#3498db",
          numberFormat: formData.surveySettings?.numberFormat || "",
          topic: validSurveys.map((survey, idx) => ({
            no: `Q${idx + 1}`,
            type: survey.surveyDisplayType || "button",
            text: survey.questionText,
            pageNum: survey.pageNum || 1,
          })),
        };

        // surveyAnswer 생성 - surveySettings 값 사용
        surveyAnswer = {
          answerColor: formData.surveySettings?.answerColor || "#2c3e50",
          answers: validSurveys.map((survey) =>
            survey.options.map((opt) => opt.text)
          ),
        };
      }
    }

    // 일반 필드 추가
    apiFormData.append("domain", formData.domain || "");
    if (formData.template) apiFormData.append("templateKey", formData.template);
    if (surveyTopic)
      apiFormData.append("surveyTopic", JSON.stringify(surveyTopic));
    if (surveyAnswer)
      apiFormData.append("surveyAnswer", JSON.stringify(surveyAnswer));
    if (formData.formStyle)
      apiFormData.append("formStyleClassName", formData.formStyle);
    if (formData.privacyPolicyClassName)
      apiFormData.append("privacyPolicyClassName", formData.privacyPolicyClassName);
    if (formData.privacyPolicyName)
      apiFormData.append("privacyPolicyName", formData.privacyPolicyName);
    if (formData.privacyPolicy)
      apiFormData.append("privacyPolicy", formData.privacyPolicy);
    // 제휴사 안내 스타일 ("없음" 선택 시 빈 문자열이 전송되고 백엔드에서 NULL로 변환됨)
    apiFormData.append("serviceInfoClassName", formData.serviceInfoClassName || "");
    if (formData.benefitPeriodType) {
      apiFormData.append("benefitDate", formData.benefitPeriodType);
    }
    // 신청 버튼 위치 (일반형=null→빈문자열, 띄움형=fixed)
    apiFormData.append("postBtnLocate", formData.buttonPosition || "");
    if (formData.buttonImage)
      apiFormData.append("postBtnUrl", formData.buttonImage);
    // 다음 버튼 위치 (일반형=null→빈문자열, 띄움형=fixed)
    apiFormData.append("keepBtnLocate", formData.keepBtnLocate || "");
    if (formData.keepBtnImage)
      apiFormData.append("keepBtnUrl", formData.keepBtnImage);
    if (formData.footerClassName)
      apiFormData.append("footerClassName", formData.footerClassName);
    if (formData.footerDetail)
      apiFormData.append("footerDetail", formData.footerDetail);
    apiFormData.append("landingStatus", "true");

    // endpoint 필드 추가 (bigcConnection 값에 따라 매핑)
    let endpoint = null;
    if (formData.bigcConnection === "성남") {
      endpoint = "https://api.smile-health-clinic.com/view/NweC7E27b7/bM340A5";
    } else if (formData.bigcConnection === "대구") {
      endpoint = "https://api.smile-health-clinic.com/view/oiw60a2901/CHSjfle";
    } else if (formData.bigcConnection === "부산") {
      endpoint = "https://api.smile-health-clinic.com/view/WepFnSSDF2/lTu0DF7";
    }
    if (endpoint) {
      apiFormData.append("endpoint", endpoint);
    }

    // 로그인한 사용자 ID 가져오기
    // console.log("=== userId 가져오기 ===");
    const userStr = localStorage.getItem("user");
    // console.log("localStorage에서 가져온 user 문자열:", userStr);

    const user = JSON.parse(userStr || "{}");
    // console.log("파싱된 user 객체:", user);

    const userId = user.userId || null;
    // console.log("추출한 userId:", userId, "(타입:", typeof userId + ")");

    if (userId) {
      apiFormData.append("userId", userId);
      // console.log("✅ FormData에 userId 추가 완료:", userId);
    } else {
      // console.warn("⚠️ userId가 없습니다! 로그인 상태를 확인하세요.");
    }

    // 시간은 백엔드에서 생성 (서버가 KST 시간대이므로 자동으로 한국 시간 생성)

    // imageKey를 실제 DB 인덱스로 변환하는 함수
    // "1-1" → 1, "1-2" → 2, "2-1" → 3, "2-2" → 4, "3-1" → 5, "3-2" → 6
    const getImageIndex = (key) => {
      const [page, slot] = key.split("-").map(Number);
      return (page - 1) * 2 + slot;
    };

    // 이미지 파일 및 ALT 텍스트 추가 (각 칸의 위치에 맞게 정확한 인덱스로 전송)
    const imageKeys = Object.keys(formData.images).sort();
    // console.log("=== 이미지 파일 추가 ===");
    // console.log("formData.images:", formData.images);
    // console.log("formData.imageAlts:", formData.imageAlts);
    // console.log("imageKeys:", imageKeys);

    // ALT 텍스트를 모든 칸(1~6)에 대해 명시적으로 추가
    // 각 칸의 위치에 맞게 정확히 매핑 (예: 1-2 → imgALT2)
    for (let i = 1; i <= 6; i++) {
      const page = Math.ceil(i / 2); // 1→1, 2→1, 3→2, 4→2, 5→3, 6→3
      const slot = ((i - 1) % 2) + 1; // 1→1, 2→2, 3→1, 4→2, 5→1, 6→2
      const key = `${page}-${slot}`;
      const altText = formData.imageAlts?.[key] || "";
      apiFormData.append(`imgALT${i}`, altText);
      // console.log(`✓ ALT 텍스트 추가: ${key} → imgALT${i} = "${altText}"`);
    }

    imageKeys.forEach((key) => {
      const file = formData.images[key];
      // console.log(`이미지 ${key}:`, file);
      // console.log(
        // `파일 타입:`,
        // file instanceof File,
        // "File 객체인가:",
        // typeof file
      // );

      // File 객체인 경우만 전송 (URL 문자열은 제외)
      if (file && file instanceof File) {
        // 이미지 키(예: "1-1")와 파일을 함께 전송
        apiFormData.append(`images`, file);
        apiFormData.append(`imageKeys`, key); // 각 이미지의 키 정보도 함께 전송
        // console.log(`✓ FormData에 추가됨: ${key}, 파일명: ${file.name}`);
      } else if (file && typeof file === "string") {
        // console.log(`⚠️ 건너뜀 (기존 URL): ${key} = ${file}`);
      }
    });

    return apiFormData;
  };

  const handleSubmit = async () => {
    try {
      const apiFormData = convertFormDataToAPI();
      // console.log("=== 전송할 FormData ===");
      for (let pair of apiFormData.entries()) {
        if (pair[0] === "images") {
          // console.log(pair[0], ":", pair[1].name);
        } else {
          // console.log(pair[0], ":", pair[1]);
        }
      }

      if (adNumber) {
        // 수정
        apiFormData.append("adNumber", adNumber);
        const response = await updateLanding(adNumber, apiFormData);
        if (response.success) {
          alert("랜딩 페이지가 수정되었습니다.");
          navigate("/portfolio/landingmaker/publish/complete", { state: { adNumber: adNumber } });
        } else {
          alert(response.msg || "수정에 실패했습니다.");
        }
      } else {
        // 생성 - 백엔드에서 최신 adNumber를 가져와서 자동 증가
        const response = await createLanding(apiFormData);
        if (response.success) {
          const createdAdNumber = response.data?.adNumber || "알 수 없음";
          // console.log("생성된 랜딩 번호:", createdAdNumber);
          navigate("/portfolio/landingmaker/publish/complete", {
            state: { adNumber: createdAdNumber },
          });
        } else {
          alert(response.msg || "생성에 실패했습니다.");
        }
      }
    } catch (error) {
      // console.error("랜딩 페이지 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // templateKey에서 템플릿 단계 추출
  const getTemplateStage = (templateKey) => {
    if (!templateKey) return null;
    return Math.floor(templateKey / 10);
  };

  // 템플릿 단계 표시 텍스트
  const getTemplateStageText = (templateKey) => {
    const stage = getTemplateStage(templateKey);
    if (!stage) return null;
    return `${stage}단계`;
  };

  // 도메인 랜딩을 템플릿 단계별로 필터링 (안전한 버전)
  const getStageFilteredLandings = (stage) => {
    // domainLandings가 배열이 아니거나 비어있으면 빈 배열 반환
    if (!Array.isArray(domainLandings) || domainLandings.length === 0) {
      return [];
    }
    
    return domainLandings.filter(landing => {
      if (!landing || !landing.templateKey) return false;
      const landingStage = getTemplateStage(landing.templateKey);
      
      if (stage === 'stage1') {
        return landingStage === 1;
      } else if (stage === 'stage23') {
        return landingStage === 2 || landingStage === 3;
      }
      return false;
    });
  };

  // 각 단계별 템플릿 개수 확인 헬퍼 함수
  const getStageCount = (stage) => {
    return getStageFilteredLandings(stage)?.length || 0;
  };

  // 해당 단계에 템플릿이 있는지 확인
  const hasStageTemplates = (stage) => {
    return getStageCount(stage) > 0;
  };

  // 버튼 일괄수정 모달 열기 (유효한 탭으로 자동 설정)
  const openButtonModal = () => {
    // 1단계에 템플릿이 있으면 stage1을, 없으면 stage23으로 설정
    if (hasStageTemplates('stage1')) {
      setButtonModalTab('stage1');
    } else if (hasStageTemplates('stage23')) {
      setButtonModalTab('stage23');
    } else {
      // 둘 다 없으면 기본값인 stage1로 설정 (비활성화 메시지 표시됨)
      setButtonModalTab('stage1');
    }
    setShowButtonModal(true);
  };

  // 랜딩 객체에서 templateKey 찾기 (다양한 필드명 지원)
  const getTemplateKeyFromLanding = (landing) => {
    return (
      landing.templateKey ||
      landing.template ||
      landing.templateId ||
      landing.template_key ||
      landing.template_id ||
      null
    );
  };

  // 도메인의 랜딩 페이지 목록 가져오기 (백엔드 직접 조회)
  const fetchDomainLandings = async (domain) => {
    try {
      setLoadingAssets(true);
      // console.log("🔍 도메인별 랜딩 목록 직접 조회 시작:", domain);

      // 백엔드에서 도메인별 직접 조회
      const response = await getLandingsByDomain(domain);
      // console.log("📋 도메인별 랜딩 응답:", response);

      if (response.success && response.data) {
        setDomainLandings(response.data);
        // console.log("✅ 도메인별 랜딩 목록:", response.data);
        // console.log(`📊 총 ${response.data.length}개 랜딩 페이지 발견`);

        // templateKey 디버깅 - 모든 필드 확인
        response.data.forEach((landing, index) => {
          // console.log(`🔍 랜딩 ${index + 1} 전체 데이터:`, landing);
          // console.log(`📋 템플릿 관련 필드들:`, {
            // templateKey: landing.templateKey,
            // template: landing.template,
            // templateId: landing.templateId,
            // template_key: landing.template_key,
            // template_id: landing.template_id,
          // });
        });
      } else {
        // console.error("❌ 도메인별 랜딩 목록 가져오기 실패:", response.msg);
        setDomainLandings([]);
      }
    } catch (error) {
      // console.error("💥 도메인별 랜딩 목록 가져오기 오류:", error);
      setDomainLandings([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  // 도메인별 일괄 저장 (확인 다이얼로그 표시)
  const handleBulkSave = () => {
    if (!domainUrl) {
      alert("도메인 정보를 찾을 수 없습니다.");
      return;
    }
    setShowBulkSaveAlert(true);
  };

  // 일괄 저장 확인 후 실제 저장 실행
  const confirmBulkSave = async () => {
    try {
      setLoading(true);
      setShowBulkSaveAlert(false);

      // 6개 필드만 전송 (폼 스타일, 개인정보 동의 스타일, 개인정보수집주체, 개인정보처리방침, 푸터 스타일, 푸터 내용)
      const updates = {
        formStyleClassName: formData.formStyle,
        privacyPolicyClassName: formData.privacyPolicyClassName,
        privacyPolicyName: formData.privacyPolicyName,
        privacyPolicy: formData.privacyPolicy,
        footerClassName: formData.footerClassName,
        footerDetail: formData.footerDetail,
      };

      // console.log("=== 일괄 수정 요청 ===");
      // console.log("domainUrl:", domainUrl);
      // console.log("updates:", updates);

      // 로그인한 사용자 ID 가져오기
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr || "{}");
      const userId = user.userId || null;
      // console.log("일괄수정용 userId:", userId, "(타입:", typeof userId + ")");

      const response = await bulkUpdateByDomain(
        decodeURIComponent(domainUrl),
        updates,
        userId
      );

      if (response.success) {
        let successMessage = `${response.data.updatedCount}개 랜딩 페이지가 일괄 수정되었습니다.`;

        // 대기 중인 버튼 설정이 있으면 함께 적용
        if (pendingButtonSettings) {
          const buttonUpdateSuccess = await handleButtonBulkUpdate(
            pendingButtonSettings.stage,
            pendingButtonSettings.buttonSettings
          );

          if (buttonUpdateSuccess) {
            successMessage += ` 버튼 설정도 함께 적용되었습니다.`;
            setPendingButtonSettings(null); // 적용 완료 후 초기화
          }
        }

        alert(successMessage);
        navigate("/portfolio/landingmaker");
      } else {
        alert(response.msg || "일괄 수정에 실패했습니다.");
      }
    } catch (error) {
      // console.error("일괄 수정 오류:", error);
      alert("일괄 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 버튼 일괄수정 모달에서 설정 저장 (즉시 적용하지 않음)
  const handleButtonModalApply = () => {
    const currentTab = buttonModalTab;
    const settings = buttonModalSettings[currentTab];

    // 유효성 검사
    if (currentTab === 'stage1') {
      if (!settings.postBtnUrl) {
        alert("신청 버튼 이미지를 선택해주세요.");
        return;
      }
      if (settings.postBtnLocate === undefined) {
        alert("버튼 위치를 선택해주세요.");
        return;
      }
    } else if (currentTab === 'stage23') {
      if (!settings.selectedButtonSet) {
        alert("버튼 세트를 선택해주세요.");
        return;
      }
      if (settings.keepBtnLocate === undefined) {
        alert("다음 버튼 위치를 선택해주세요.");
        return;
      }
      if (settings.postBtnLocate === undefined) {
        alert("신청 버튼 위치를 선택해주세요.");
        return;
      }
    }

    // 설정을 임시 저장
    let stage, buttonSettings;
    
    if (currentTab === 'stage1') {
      stage = '1';
      buttonSettings = {
        postBtnUrl: settings.postBtnUrl,
        postBtnLocate: settings.postBtnLocate,
      };
    } else {
      stage = '23';
      buttonSettings = {
        keepBtnUrl: settings.selectedButtonSet.keepBtn,
        keepBtnLocate: settings.keepBtnLocate,
        postBtnUrl: settings.selectedButtonSet.postBtn,
        postBtnLocate: settings.postBtnLocate,
      };
    }

    setPendingButtonSettings({ stage, buttonSettings });
    setShowButtonModal(false);
    
    // 모달 설정 초기화
    setButtonModalSettings({
      stage1: {
        postBtnLocate: null,
        postBtnUrl: '',
      },
      stage23: {
        keepBtnLocate: null,
        postBtnLocate: null,
        selectedButtonSet: null,
      }
    });
  };

  // 실제 버튼 일괄수정 적용 (일괄 저장 시 호출)
  const handleButtonBulkUpdate = async (stage, buttonSettings) => {
    try {
      // console.log("=== 버튼 일괄 수정 요청 ===");
      // console.log("domainUrl:", domainUrl);
      // console.log("stage:", stage);
      // console.log("buttonSettings:", buttonSettings);

      // 로그인한 사용자 ID 가져오기
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr || "{}");
      const userId = user.userId || null;
      // console.log("버튼 일괄수정용 userId:", userId, "(타입:", typeof userId + ")");

      const response = await bulkUpdateButtonsByDomain(
        decodeURIComponent(domainUrl),
        stage,
        buttonSettings,
        userId
      );

      if (response.success) {
        // console.log(`✓ ${response.data.updatedCount}개 랜딩 페이지의 버튼이 일괄 수정되었습니다.`);
        return true;
      } else {
        alert(response.msg || "버튼 일괄 수정에 실패했습니다.");
        return false;
      }
    } catch (error) {
      // console.error("버튼 일괄 수정 오류:", error);
      alert("버튼 일괄 수정 중 오류가 발생했습니다.");
      return false;
    }
  };

  const getPageCount = () => {
    if (!formData.template) return 0;
    return Math.floor(formData.template / 10);
  };

  // 설문 페이지 확인
  const getSurveyPages = () => {
    const template = formData.template;
    if (!template) return [];

    // 템플릿별 설문 페이지 매핑
    const surveyMapping = {
      12: [1], // 페이지 1에 설문 1개
      13: [1], // 페이지 1에 설문 2개
      21: [1], // 페이지 1에 설문
      22: [2], // 페이지 2에 설문
      24: [1], // 페이지 1에 설문 2개
      25: [2], // 페이지 2에 설문 2개
      31: [2], // 페이지 2에 설문
      32: [1, 2], // 페이지 1, 2에 설문
      33: [2], // 페이지 2에 설문 2개
    };

    return surveyMapping[template] || [];
  };

  const hasSurvey = () => {
    return getSurveyPages().length > 0;
  };

  // 현재 선택된 템플릿에 설문이 있는지 확인
  const templateHasSurvey = () => {
    const template = formData.template;
    // 설문이 있는 템플릿: 12, 13, 21, 22, 24, 25, 31, 32, 33
    const surveySupportedTemplates = [12, 13, 21, 22, 24, 25, 31, 32, 33];
    return surveySupportedTemplates.includes(template);
  };

  // 수정 모드에서 템플릿에 맞는 기본 폼 구조 보장
  const ensureTemplateFormStructure = (baseFormData, templateId) => {
    // 템플릿별 필요한 설문 개수와 페이지 번호 매핑 (handleTemplateSelect와 동일)
    const surveyConfigMap = {
      12: [{ pageNum: 1 }], // 페이지1에 설문 1개
      13: [{ pageNum: 1 }, { pageNum: 1 }], // 페이지1에 설문 2개
      21: [{ pageNum: 1 }], // 페이지1에 설문 1개
      22: [{ pageNum: 2 }], // 페이지2에 설문 1개
      24: [{ pageNum: 1 }, { pageNum: 1 }], // 페이지1에 설문 2개
      25: [{ pageNum: 2 }, { pageNum: 2 }], // 페이지2에 설문 2개
      31: [{ pageNum: 2 }], // 페이지2에 설문 1개
      32: [{ pageNum: 1 }, { pageNum: 2 }], // 페이지1,2에 설문
      33: [{ pageNum: 2 }, { pageNum: 2 }], // 페이지2에 설문 2개
    };

    const surveyConfigs = surveyConfigMap[templateId] || [];

    // 기존 설문이 있으면 그대로 사용, 없으면 템플릿에 맞는 기본 구조 생성
    let enhancedSurveyList = baseFormData.surveyList || [];

    // 템플릿이 요구하는 설문 개수보다 적으면 부족한 만큼 추가
    if (enhancedSurveyList.length < surveyConfigs.length) {
      const missingCount = surveyConfigs.length - enhancedSurveyList.length;
      const additionalSurveys = surveyConfigs
        .slice(-missingCount)
        .map((config) => ({
          questionText: "",
          surveyDisplayType: "button",
          optionCount: 4,
          pageNum: config.pageNum,
          options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        }));
      enhancedSurveyList = [...enhancedSurveyList, ...additionalSurveys];
    }

    // console.log(`🔧 수정 모드: 템플릿 ${templateId}에 맞는 폼 구조 보장`);
    // console.log(`  - 요구되는 설문 개수: ${surveyConfigs.length}`);
    // console.log(`  - 기존 설문 개수: ${baseFormData.surveyList?.length || 0}`);
    // console.log(`  - 최종 설문 개수: ${enhancedSurveyList.length}`);

    return {
      ...baseFormData,
      surveyList: enhancedSurveyList,
    };
  };

  // 템플릿 선택 시 설문 자동 생성
  const handleTemplateSelect = (templateId) => {
    // 템플릿별 필요한 설문 개수와 페이지 번호 매핑
    const surveyConfigMap = {
      12: [{ pageNum: 1 }], // 페이지1에 설문 1개
      13: [{ pageNum: 1 }, { pageNum: 1 }], // 페이지1에 설문 2개
      21: [{ pageNum: 1 }], // 페이지1에 설문 1개
      22: [{ pageNum: 2 }], // 페이지2에 설문 1개
      24: [{ pageNum: 1 }, { pageNum: 1 }], // 페이지1에 설문 2개
      25: [{ pageNum: 2 }, { pageNum: 2 }], // 페이지2에 설문 2개
      31: [{ pageNum: 2 }], // 페이지2에 설문 1개
      32: [{ pageNum: 1 }, { pageNum: 2 }], // 페이지1,2에 설문
      33: [{ pageNum: 2 }, { pageNum: 2 }], // 페이지2에 설문 2개
    };

    const surveyConfigs = surveyConfigMap[templateId] || [];

    // 템플릿에 맞는 설문 생성
    const newSurveyList = surveyConfigs.map((config) => ({
      questionText: "",
      surveyDisplayType: "button",
      optionCount: 4,
      pageNum: config.pageNum,
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    }));

    setFormData({
      ...formData,
      template: templateId,
      surveyList: newSurveyList,
    });
  };

  // STEP 2 - 왼쪽 패널: 기본 설정
  const renderBasicSettingsContent = () => (
    <>
      <div className="space-y-4">
        {/* 최신 랜딩 불러오기 */}
        {!adNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium mb-2 text-sm text-blue-900">
              🔄 최신 랜딩 불러오기
            </h4>
            <div className="space-y-2">
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  setSelectedLanding("");
                }}
                className="w-full px-3 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">도메인 선택</option>
                {Object.keys(recentLandings).map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>

              {selectedDomain && recentLandings[selectedDomain]?.length > 0 && (
                <select
                  value={selectedLanding}
                  onChange={(e) => {
                    setSelectedLanding(e.target.value);
                    const landing = recentLandings[selectedDomain].find(
                      (l) => l.adNumber === e.target.value
                    );
                    if (landing) {
                      loadLandingData(landing);
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">랜딩 선택</option>
                  {recentLandings[selectedDomain].map((landing) => (
                    <option key={landing.adNumber} value={landing.adNumber}>
                      {landing.adNumber} (
                      {new Date(landing.createAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 이전에 만든 랜딩 설정을 불러와서 새로운 랜딩을 빠르게 만들 수
              있습니다.
            </p>
          </div>
        )}

        {/* 도메인 선택 */}
        <div>
          <h4 className="font-medium mb-2 text-sm">도메인</h4>
          <div className="space-y-2">
            {domains.map((domain) => {
              return (
                <label
                  key={domain}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="domain"
                    value={domain}
                    checked={formData.domain === domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                  />
                  <span className="text-sm">{domain}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 도메인별로 구글 태그, 전환 추적 코드 자동 설정됨
          </p>
        </div>

        {/* 외부 시스템 연동 */}
        <div>
          <h4 className="font-medium mb-2 text-sm">외부 시스템 연동</h4>
          <div className="space-y-2">
            {bigcOptions.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="bigc"
                  value={option}
                  checked={formData.bigcConnection === option}
                  onChange={(e) =>
                    setFormData({ ...formData, bigcConnection: e.target.value })
                  }
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 연동하면 신청 정보가 자동으로 외부 시스템으로 전송됨.
          </p>
        </div>
      </div>
    </>
  );

  // 향상된 폼 스타일 섹션 (분류 및 설명 포함)
  const renderEnhancedFormStyleSection = () => (
    <div>
      <h4 className="font-medium mb-3 text-sm">폼 디자인</h4>

      {/* 배경 스타일 */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2 font-medium">
          배경 스타일 (전체 감싸는 형태)
        </div>
        <div className="grid grid-cols-3 gap-2">
          {formStyles
            .filter((style) =>
              ["gray", "light", "white", "beige", "blue", "modern"].includes(
                style.id
              )
            )
            .map((style) => (
              <button
                key={style.id}
                onClick={() =>
                  setFormData({ ...formData, formStyle: style.id })
                }
                className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                  formData.formStyle === style.id
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {style.features.map((feature, index) => (
                      <div key={index}>{feature}</div>
                    ))}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* 필드 스타일 */}
      <div>
        <div className="text-xs text-gray-500 mb-2 font-medium">
          필드 스타일 (개별 입력창 중심)
        </div>
        <div className="grid grid-cols-3 gap-2">
          {formStyles
            .filter((style) =>
              ["none", "outline", "outline-square", "outline-gray"].includes(
                style.id
              )
            )
            .map((style) => (
              <button
                key={style.id}
                onClick={() =>
                  setFormData({ ...formData, formStyle: style.id })
                }
                className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                  formData.formStyle === style.id
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {style.features.map((feature, index) => (
                      <div key={index}>{feature}</div>
                    ))}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );

  // 개인정보 섹션 (bulk-edit 모드에서도 사용)
  const renderPrivacySection = () => (
    <>
      {/* 개인정보 수집 주체 */}
      <div>
        <h4 className="font-medium mb-3 text-sm">개인정보 수집 주체</h4>
        <input
          type="text"
          value={formData.privacyPolicyName}
          onChange={(e) => {
            const newOwner = e.target.value;
            // privacyPolicy 내의 "개인정보 수집주체: XXX" 부분을 자동 업데이트
            const updatedPolicy = formData.privacyPolicy.replace(
              /개인정보 수집주체:\s*.*/,
              `개인정보 수집주체: ${newOwner}`
            );
            setFormData({
              ...formData,
              privacyPolicyName: newOwner,
              privacyPolicy: updatedPolicy,
            });
          }}
          placeholder="예: 본원, 주식회사 OOO"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          랜딩 페이지 하단에 표시되는 개인정보 수집 주체를 입력하세요
          (개인정보처리방침 내용에 자동 반영됩니다)
        </p>
      </div>

      {/* 개인정보처리방침 내용 */}
      <div>
        <h4 className="font-medium mb-3 text-sm">개인정보처리방침 내용</h4>
        <textarea
          value={formData.privacyPolicy}
          onChange={(e) =>
            setFormData({ ...formData, privacyPolicy: e.target.value })
          }
          placeholder="개인정보처리방침 전체 내용을 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs h-64 resize-vertical"
        />
        <p className="text-xs text-gray-500 mt-1">
          랜딩 페이지에 표시될 개인정보처리방침 전체 내용입니다
        </p>
      </div>
    </>
  );

  // 향상된 개인정보 동의 스타일 섹션 (설명 포함)
  const renderEnhancedConsentStyleSection = () => (
    <div>
      <h4 className="font-medium mb-3 text-sm">개인정보 동의 스타일</h4>
      <div className="grid grid-cols-3 gap-2">
        {consentStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => setFormData({ ...formData, privacyPolicyClassName: style.id })}
            className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
              formData.privacyPolicyClassName === style.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            <div className="text-center">
              <div className="font-medium">{style.name}</div>
              <div className="text-xs opacity-75 mt-1">
                {style.features.map((feature, index) => (
                  <div key={index}>{feature}</div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 향상된 푸터 섹션 (정렬 버튼 및 설명 포함)
  const renderEnhancedFooterSection = () => (
    <div className="mb-8">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faAlignLeft} className="text-gray-600" />
        푸터 설정
      </h3>

      {/* 푸터 스타일 선택 - 섹션별 구분 */}
      <div className="mb-3">
        <h4 className="font-medium mb-3 text-sm">푸터 스타일</h4>
        {footerStyleSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            {/* 섹션 제목 */}
            <div className="text-xs text-gray-500 mb-2 font-medium">
              {section.title}
            </div>
            {/* 섹션 내 스타일 버튼들 */}
            <div className="grid grid-cols-3 gap-2">
              {section.styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    setFormData({ ...formData, footerClassName: style.id })
                  }
                  className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                    (style.id === "" && formData.footerClassName === "") ||
                    (style.id !== "" &&
                      formData.footerClassName.startsWith(style.id))
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">{style.name}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {style.features.map((feature, index) => (
                        <div key={index}>{feature}</div>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 정렬 - 기본 푸터일 때만 표시 */}
      {formData.footerClassName && (() => {
        const baseClassName = formData.footerClassName.replace(/-left|-right$/, '');
        return basicFooterStyles.some(style => style.id === baseClassName);
      })() && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-600">
            푸터 정렬
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                const baseClassName = formData.footerClassName.replace(
                  /-left|-right$/,
                  ""
                );
                setFormData({
                  ...formData,
                  footerClassName: baseClassName + "-left",
                });
              }}
              className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                formData.footerClassName.endsWith("-left")
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              왼쪽
            </button>
            <button
              onClick={() => {
                const baseClassName = formData.footerClassName.replace(
                  /-left|-right$/,
                  ""
                );
                setFormData({ ...formData, footerClassName: baseClassName });
              }}
              className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                !formData.footerClassName.endsWith("-left") &&
                !formData.footerClassName.endsWith("-right")
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              중앙
            </button>
            <button
              onClick={() => {
                const baseClassName = formData.footerClassName.replace(
                  /-left|-right$/,
                  ""
                );
                setFormData({
                  ...formData,
                  footerClassName: baseClassName + "-right",
                });
              }}
              className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                formData.footerClassName.endsWith("-right")
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              오른쪽
            </button>
          </div>
        </div>
      )}

      {/* 푸터 상세 내용 - 푸터 스타일이 "없음"이 아닐 때만 표시 */}
      {formData.footerClassName && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-600">
            푸터 내용
          </label>
          <textarea
            value={formData.footerDetail || ""}
            onChange={(e) =>
              setFormData({ ...formData, footerDetail: e.target.value })
            }
            placeholder="푸터에 표시될 내용을 입력하세요"
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical"
            rows="6"
          />
          <p className="text-xs text-gray-500 mt-1">
            푸터에 표시할 텍스트나 HTML 내용을 입력하세요
          </p>
        </div>
      )}
    </div>
  );

  // STEP 2 - 오른쪽 패널: 이미지 & 스타일 설정
  const renderImagesAndStylesContent = () => (
    <>
      {/* 이미지 업로드 */}
      <div className="mb-8">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faImage} className="text-gray-600" />
          이미지 업로드
        </h3>
        <div className="space-y-4">
          {[...Array(getPageCount())].map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="border-2 border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faFile} className="text-gray-600" />
                페이지 {pageIndex + 1}
              </h4>
              <div className="space-y-3">
                {(() => {
                  // 해당 페이지의 실제 이미지 개수 계산
                  const pageNum = pageIndex + 1;
                  const pageImageKeys = Object.keys(formData.images || {})
                    .filter((key) => key.startsWith(`${pageNum}-`))
                    .map((key) => parseInt(key.split("-")[1]))
                    .sort((a, b) => a - b);

                  // imageCountPerPage와 실제 등록된 이미지 중 큰 값을 사용
                  const currentImageMax =
                    pageImageKeys.length > 0 ? Math.max(...pageImageKeys) : 0;
                  const maxImageNum = Math.max(
                    currentImageMax,
                    imageCountPerPage[pageNum] || 1
                  );

                  // console.log(`📋 페이지 ${pageNum} 이미지 슬롯 계산:`);
                  // console.log("  - pageImageKeys:", pageImageKeys);
                  // console.log(
                    // "  - imageCountPerPage[" + pageNum + "]:",
                    // imageCountPerPage[pageNum]
                  // );
                  // console.log("  - maxImageNum:", maxImageNum);

                  return Array.from(
                    { length: maxImageNum },
                    (_, i) => i + 1
                  ).map((imageNum) => {
                    const imageKey = `${pageNum}-${imageNum}`;
                    const imageData = formData.images[imageKey];
                    const hasImage = !!imageData;

                    // File 객체인지 URL 문자열인지 확인
                    const isFile = imageData instanceof File;
                    const imageUrl = isFile
                      ? URL.createObjectURL(imageData)
                      : imageData; // URL 문자열

                    // 파일 처리 함수
                    const handleFileUpload = (file) => {
                      if (file) {
                        // 2MB 제한 체크
                        const maxSize = 2 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert("파일 크기는 2MB를 초과할 수 없습니다.");
                          return;
                        }

                        // 파일 타입 검증
                        const allowedTypes = [
                          "image/jpeg",
                          "image/jpg",
                          "image/png",
                          "image/gif",
                          "image/webp",
                          "video/mp4",
                          "video/webm",
                          "video/ogg",
                        ];
                        if (!allowedTypes.includes(file.type)) {
                          alert(
                            "지원하지 않는 파일 형식입니다.\n지원 형식: JPEG, PNG, GIF, WebP, MP4, WebM, OGG"
                          );
                          return;
                        }

                        const newImages = { ...formData.images };
                        newImages[imageKey] = file;
                        setFormData({ ...formData, images: newImages });
                      }
                    };

                    return (
                      <div
                        key={imageNum}
                        className="space-y-2 p-2 border-2 border-dashed border-transparent rounded transition-colors"
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add(
                            "border-blue-400",
                            "bg-blue-50"
                          );
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove(
                            "border-blue-400",
                            "bg-blue-50"
                          );
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove(
                            "border-blue-400",
                            "bg-blue-50"
                          );

                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            handleFileUpload(files[0]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* 이미지 번호 */}
                          <div className="text-sm font-medium text-gray-700 w-16">
                            이미지 {imageNum}
                          </div>

                          {/* 상태 표시 */}
                          <div className="flex-1 text-xs text-gray-500">
                            {hasImage ? (
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <FontAwesomeIcon icon={faCheck} />
                                등록됨
                              </span>
                            ) : (
                              <span className="text-gray-400">최대 2MB</span>
                            )}
                          </div>

                          {/* 파일 선택 */}
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              handleFileUpload(file);
                              e.target.value = "";
                            }}
                            className="hidden"
                            id={`image-${pageIndex}-${imageNum}`}
                          />

                          {/* 변경/선택 버튼 */}
                          <label
                            htmlFor={`image-${pageIndex}-${imageNum}`}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {hasImage ? "변경" : "선택"}
                          </label>

                          {/* 삭제 버튼 */}
                          {hasImage && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = { ...formData.images };
                                const newAlts = { ...formData.imageAlts };
                                delete newImages[imageKey];
                                delete newAlts[imageKey];
                                setFormData({
                                  ...formData,
                                  images: newImages,
                                  imageAlts: newAlts,
                                });
                              }}
                              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-red-600 hover:bg-gray-50 transition-colors"
                            >
                              삭제
                            </button>
                          )}
                        </div>

                        {/* ALT 텍스트 입력 필드 또는 비디오 반복 설정 */}
                        {(() => {
                          const currentImageData = formData.images?.[imageKey];
                          const isVideo = currentImageData instanceof File 
                            ? currentImageData.type.startsWith('video/')
                            : (typeof currentImageData === 'string' && currentImageData.match(/\.(mp4|webm|ogg)$/i));
                          
                          if (isVideo) {
                            return (
                              <div>
                                <label className="flex items-center text-xs">
                                  <input
                                    type="checkbox"
                                    checked={formData.imageAlts?.[imageKey] === "false"}
                                    onChange={(e) => {
                                      const newAlts = { ...formData.imageAlts };
                                      newAlts[imageKey] = e.target.checked ? "false" : "";
                                      setFormData({ ...formData, imageAlts: newAlts });
                                    }}
                                    className="mr-2"
                                  />
                                  한번만 재생
                                </label>
                              </div>
                            );
                          } else {
                            return (
                              <textarea
                                rows={3}
                                value={formData.imageAlts?.[imageKey] || ""}
                                onChange={(e) => {
                                  const newAlts = { ...formData.imageAlts };
                                  newAlts[imageKey] = e.target.value;
                                  setFormData({ ...formData, imageAlts: newAlts });
                                }}
                                placeholder={`이미지 ${imageNum} ALT 텍스트`}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                              />
                            );
                          }
                        })()}
                      </div>
                    );
                  });
                })()}

                {/* 이미지 추가 버튼 - 이미지 1이 업로드되었을 때만 표시 */}
                {(() => {
                  const pageNum = pageIndex + 1;
                  const hasFirstImage = !!formData.images[`${pageNum}-1`];

                  // 현재 페이지의 실제 이미지 개수 계산
                  const pageImageKeys = Object.keys(
                    formData.images || {}
                  ).filter((key) => key.startsWith(`${pageNum}-`));
                  const currentCount =
                    pageImageKeys.length > 0
                      ? Math.max(
                          ...pageImageKeys.map((key) =>
                            parseInt(key.split("-")[1])
                          )
                        )
                      : imageCountPerPage[pageNum] || 1;

                  return (
                    hasFirstImage &&
                    currentCount < 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          // console.log("🖱️ 이미지 추가 버튼 클릭");
                          // console.log("  - pageNum:", pageNum);
                          // console.log("  - currentCount:", currentCount);
                          // console.log(
                            // "  - 이전 imageCountPerPage:",
                            // imageCountPerPage
                          // );

                          setImageCountPerPage((prev) => {
                            const newState = {
                              ...prev,
                              [pageNum]: currentCount + 1,
                            };
                            // console.log(
                              // "  - 새로운 imageCountPerPage:",
                              // newState
                            // );
                            return newState;
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-dashed border-gray-400 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-500 transition-colors"
                      >
                        + 이미지 추가
                      </button>
                    )
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 설문조사 설정 - 템플릿에 설문이 있을 때만 표시 */}
      {templateHasSurvey() && (
        <>
          <div className="border-t pt-6"></div>
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faListCheck} className="text-gray-600" />
                설문조사 설정
              </h3>
            </div>

            {/* 설문 전역 설정 */}
            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-sm text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faPalette} className="text-gray-600" />
                설문 디자인 설정
                <span className="text-xs font-normal text-gray-600">
                  (전체 적용)
                </span>
              </h4>

              <div className="space-y-5">
                {/* 질문 스타일 */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">
                    질문 스타일
                  </h5>
                  <div className="space-y-4">
                    {/* 번호 형식 - 선택 */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-600">
                        번호 형식
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              surveySettings: {
                                ...formData.surveySettings,
                                numberFormat: "Q",
                              },
                            })
                          }
                          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border-2 transition-all whitespace-nowrap ${
                            formData.surveySettings.numberFormat === "Q"
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Q (Q1, Q2, Q3...)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              surveySettings: {
                                ...formData.surveySettings,
                                numberFormat: "",
                              },
                            })
                          }
                          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border-2 transition-all whitespace-nowrap ${
                            formData.surveySettings.numberFormat === ""
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          1 (1, 2, 3...)
                        </button>
                      </div>
                    </div>

                    {/* 번호 색상 */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-600">
                        번호 색상
                      </label>
                      <div className="flex gap-1.5">
                        {surveyColors.map((color) => {
                          const bgColorMap = {
                            "#9b59b6": "bg-purple-600",
                            "#3498db": "bg-blue-500",
                            "#27ae60": "bg-green-600",
                            "#ff8c42": "bg-orange-500",
                            "#2c3e50": "bg-gray-900",
                            "#e91e63": "bg-pink-600",
                          };
                          return (
                            <button
                              type="button"
                              key={color.value}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  surveySettings: {
                                    ...formData.surveySettings,
                                    numberColor: color.value,
                                  },
                                })
                              }
                              className={`w-7 h-7 rounded border-2 transition-all ${
                                bgColorMap[color.value]
                              } ${
                                formData.surveySettings.numberColor ===
                                color.value
                                  ? "border-blue-600 ring-2 ring-blue-200 scale-110"
                                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
                              }`}
                              title={color.label}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t"></div>
                  </div>
                </div>

                {/* 답변 선택 스타일 (버튼형) */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">
                    답변 선택 스타일
                  </h5>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-600">
                      선택된 답변 테두리 색상
                    </label>
                    <div className="flex gap-2">
                      {surveyColors.map((color) => {
                        const bgColorMap = {
                          "#9b59b6": "bg-purple-600",
                          "#3498db": "bg-blue-500",
                          "#27ae60": "bg-green-600",
                          "#ff8c42": "bg-orange-500",
                          "#2c3e50": "bg-gray-900",
                          "#e91e63": "bg-pink-600",
                        };
                        return (
                          <button
                            type="button"
                            key={color.value}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                surveySettings: {
                                  ...formData.surveySettings,
                                  answerColor: color.value,
                                },
                              })
                            }
                            className={`w-7 h-7 rounded border-2 transition-all ${
                              bgColorMap[color.value]
                            } ${
                              formData.surveySettings.answerColor ===
                              color.value
                                ? "border-purple-600 ring-2 ring-purple-200 scale-110"
                                : "border-gray-300 hover:border-gray-400 hover:scale-105"
                            }`}
                            title={color.label}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t my-6"></div>

            {/* 페이지별 설문 섹션 */}
            <div className="space-y-4">
              {[...Array(getPageCount())].map((_, pageIndex) => {
                const pageNum = pageIndex + 1;
                // 해당 페이지의 설문만 필터링
                const pageSurveys = (formData.surveyList || []).filter(
                  (survey) => survey.pageNum === pageNum
                );

                // 템플릿이 이 페이지에 설문을 지원하는지 확인
                const templateSurveyPages = getSurveyPages();
                const pageSupportsSurvey =
                  templateSurveyPages.includes(pageNum);

                // 수정 모드에서는 템플릿이 지원하면 표시, 일반 모드에서는 설문이 있어야 표시
                if (!pageSupportsSurvey) return null;
                if (!adNumber && pageSurveys.length === 0) return null;

                return (
                  <div
                    key={pageNum}
                    className="border-2 border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faFile}
                        className="text-gray-600"
                      />
                      페이지 {pageNum}
                    </h4>

                    <div className="space-y-4">
                      {/* 수정 모드에서 설문이 없으면 빈 설문 추가 버튼 표시 */}
                      {adNumber && pageSurveys.length === 0 && (
                        <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-sm text-gray-500 mb-2">
                            이 페이지에 설문이 없습니다
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const newSurvey = {
                                questionText: "",
                                surveyDisplayType: "button",
                                optionCount: 4,
                                pageNum: pageNum,
                                options: [
                                  { text: "" },
                                  { text: "" },
                                  { text: "" },
                                  { text: "" },
                                ],
                              };
                              setFormData({
                                ...formData,
                                surveyList: [
                                  ...(formData.surveyList || []),
                                  newSurvey,
                                ],
                              });
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            설문 추가
                          </button>
                        </div>
                      )}

                      {pageSurveys.map((survey, localIndex) => {
                        // 전체 surveyList에서의 실제 인덱스 찾기
                        const surveyIndex = formData.surveyList.findIndex(
                          (s) => s === survey
                        );

                        return (
                          <div
                            key={surveyIndex}
                            className="border border-gray-300 rounded-lg p-3 bg-white"
                          >
                            <div className="mb-3">
                              <h5 className="font-medium text-xs text-gray-700">
                                설문 {localIndex + 1}
                              </h5>
                            </div>

                            {/* 질문 입력 */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                질문 입력
                              </label>
                              <input
                                type="text"
                                value={survey.questionText || ""}
                                onChange={(e) => {
                                  const newSurveys = [...formData.surveyList];
                                  newSurveys[surveyIndex].questionText =
                                    e.target.value;
                                  setFormData({
                                    ...formData,
                                    surveyList: newSurveys,
                                  });
                                }}
                                placeholder="예: 원하시는 옵션을 선택해주세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                              />
                            </div>

                            {/* 설문조사 타입 선택 */}
                            <div className="mb-3">
                              <h5 className="text-xs font-medium mb-1.5 text-gray-700">
                                설문조사 타입
                              </h5>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSurveys = [...formData.surveyList];
                                    newSurveys[surveyIndex].surveyDisplayType =
                                      "button";
                                    newSurveys[surveyIndex].optionCount = 4;
                                    newSurveys[surveyIndex].options = [
                                      { text: "" },
                                      { text: "" },
                                      { text: "" },
                                      { text: "" },
                                    ];
                                    setFormData({
                                      ...formData,
                                      surveyList: newSurveys,
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-md border-2 text-xs font-medium transition-all ${
                                    survey.surveyDisplayType === "button"
                                      ? "border-blue-600 bg-blue-50 text-blue-700"
                                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                  }`}
                                >
                                  버튼형
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSurveys = [...formData.surveyList];
                                    newSurveys[surveyIndex].surveyDisplayType =
                                      "radio";
                                    newSurveys[surveyIndex].optionCount = 3;
                                    newSurveys[surveyIndex].options = [
                                      { text: "" },
                                      { text: "" },
                                      { text: "" },
                                    ];
                                    setFormData({
                                      ...formData,
                                      surveyList: newSurveys,
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-md border-2 text-xs font-medium transition-all ${
                                    survey.surveyDisplayType === "radio"
                                      ? "border-blue-600 bg-blue-50 text-blue-700"
                                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                  }`}
                                >
                                  라디오형
                                </button>
                              </div>
                            </div>

                            {/* Radio 타입일 때만 선택지 개수 선택 */}
                            {survey.surveyDisplayType === "radio" && (
                              <div className="mb-3">
                                <h5 className="text-xs font-medium mb-1.5 text-gray-700">
                                  선택지 개수
                                </h5>
                                <div className="flex gap-2">
                                  {[3, 4].map((count) => (
                                    <button
                                      type="button"
                                      key={count}
                                      onClick={() => {
                                        const newSurveys = [
                                          ...formData.surveyList,
                                        ];
                                        const currentOptions =
                                          newSurveys[surveyIndex].options || [];
                                        const newOptions = Array(count)
                                          .fill(null)
                                          .map((_, idx) => ({
                                            text:
                                              currentOptions[idx]?.text || "",
                                          }));
                                        newSurveys[surveyIndex].optionCount =
                                          count;
                                        newSurveys[surveyIndex].options =
                                          newOptions;
                                        setFormData({
                                          ...formData,
                                          surveyList: newSurveys,
                                        });
                                      }}
                                      className={`px-3 py-1.5 rounded-md border-2 text-xs font-medium transition-all ${
                                        survey.optionCount === count
                                          ? "border-blue-600 bg-blue-50 text-blue-700"
                                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                      }`}
                                    >
                                      {count}개
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 선택지 입력 */}
                            <div className="mb-3">
                              <h5 className="text-xs font-medium mb-1.5 text-gray-700">
                                선택지 입력
                              </h5>
                              <div className="space-y-2">
                                {survey.options?.map((option, idx) => (
                                  <div key={idx}>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      선택지 {idx + 1}
                                    </label>
                                    <input
                                      type="text"
                                      value={option.text || ""}
                                      onChange={(e) => {
                                        const newSurveys = [
                                          ...formData.surveyList,
                                        ];
                                        newSurveys[surveyIndex].options[idx] = {
                                          text: e.target.value,
                                        };
                                        setFormData({
                                          ...formData,
                                          surveyList: newSurveys,
                                        });
                                      }}
                                      placeholder={`예: ${
                                        idx === 0
                                          ? "1~2개"
                                          : idx === 1
                                          ? "3~4개"
                                          : idx === 2
                                          ? "5개 이상"
                                          : "기타"
                                      }`}
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                  </div>
                                )) || []}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="border-t pt-6"></div>

      {/* 폼 스타일 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faPalette} className="text-gray-600" />폼
          스타일
        </h3>

        {/* 폼 디자인 */}
        {renderEnhancedFormStyleSection()}

        {/* 개인정보 섹션 */}
        {renderPrivacySection()}

        {/* 개인정보 동의 스타일 */}
        {renderEnhancedConsentStyleSection()}

        {/* 제휴사 안내 문구 스타일 */}
        <div>
          <h4 className="font-medium mb-3 text-sm">제휴사 안내 문구</h4>
          <div className="grid grid-cols-3 gap-2">
            {serviceInfoStyles.map((style) => (
              <button
                key={style.id}
                onClick={() =>
                  setFormData({ ...formData, serviceInfoClassName: style.id })
                }
                className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                  formData.serviceInfoClassName === style.id
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {style.features.map((feature, index) => (
                      <div key={index}>{feature}</div>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 혜택 기간 설정 */}
        <div>
          <h4 className="font-medium mb-3 text-sm">혜택 기간</h4>

          {/* 기간 타입 선택 */}
          <div className="mb-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setFormData({ ...formData, benefitPeriodType: null })
                }
                className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                  formData.benefitPeriodType === null
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                사용 안 함
              </button>
              <button
                onClick={() =>
                  setFormData({ ...formData, benefitPeriodType: "week" })
                }
                className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                  formData.benefitPeriodType === "week"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                이번주
              </button>
              <button
                onClick={() =>
                  setFormData({ ...formData, benefitPeriodType: "month" })
                }
                className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                  formData.benefitPeriodType === "month"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                이번달
              </button>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* 버튼 설정 */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faMousePointer} className="text-gray-600" />
            버튼 설정
          </h3>
          <div className="space-y-4">
            {/* 2단계 이상: 버튼 세트 선택 */}
            {getPageCount() > 1 ? (
              <>
                {/* 색상 선택 - 무조건 표시 */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">버튼 색상 선택</h4>
                  {loadingAssets ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      이미지 로딩 중...
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-3 gap-2"
                      style={{ maxWidth: "600px" }}
                    >
                      {(() => {
                        // 색상 설정 맵
                        const colorMap = {
                          blue: {
                            bg: "bg-blue-500",
                            border: "border-blue-600",
                            ring: "ring-blue-200",
                            name: "Blue",
                          },
                          green: {
                            bg: "bg-green-500",
                            border: "border-green-600",
                            ring: "ring-green-200",
                            name: "Green",
                          },
                          orange: {
                            bg: "bg-orange-500",
                            border: "border-orange-600",
                            ring: "ring-orange-200",
                            name: "Orange",
                          },
                          pink: {
                            bg: "bg-pink-500",
                            border: "border-pink-600",
                            ring: "ring-pink-200",
                            name: "Pink",
                          },
                          red: {
                            bg: "bg-red-500",
                            border: "border-red-600",
                            ring: "ring-red-200",
                            name: "Red",
                          },
                        };

                        // 모든 색상을 정적으로 표시 (동적으로 추출하지 않음)
                        const allColors = ["blue", "green", "orange", "pink"];

                        return allColors.map((color) => {
                          const hasColor = buttonSets.some(
                            (set) => set.color === color
                          );
                          const config = colorMap[color];

                          // console.log(`🎨 색상 ${color}:`, {
                            // hasColor,
                            // buttonSetsLength: buttonSets.length,
                            // matchingSets: buttonSets.filter(
                              // (set) => set.color === color
                            // ).length,
                          // });

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setSelectedColor(color);
                                setSelectedSet(null);
                              }}
                              disabled={!hasColor}
                              className={`px-3 py-1.5 rounded-md border-2 text-xs font-medium transition-all ${
                                selectedColor === color
                                  ? "border-blue-600 bg-blue-50 text-blue-700"
                                  : hasColor
                                  ? `border-gray-300 bg-white text-gray-700 hover:border-gray-400`
                                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {config.name}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* 선택한 색상의 버튼 세트 */}
                {selectedColor && (
                  <div>
                    <h4 className="font-medium mb-3 text-sm">
                      버튼 세트 선택 (다음 + 신청)
                    </h4>
                    <div
                      className="grid grid-cols-3 gap-3"
                      style={{ maxWidth: "600px" }}
                    >
                      {buttonSets
                        .filter((set) => set.color === selectedColor)
                        .map((set) => (
                          <div
                            key={set.key}
                            onClick={() => handleSetSelect(set)}
                            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                              selectedSet?.key === set.key
                                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                                : "border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {/* 다음 버튼 미리보기 */}
                            <div className="p-2 border-b bg-gray-50">
                              <div className="text-xs text-gray-500 mb-1">
                                다음
                              </div>
                              <img
                                src={set.keepBtn}
                                alt={`${set.label} 다음 버튼`}
                                className="w-full h-16 object-contain bg-white rounded"
                              />
                            </div>
                            {/* 신청 버튼 미리보기 */}
                            <div className="p-2 bg-gray-50">
                              <div className="text-xs text-gray-500 mb-1">
                                신청
                              </div>
                              <img
                                src={set.postBtn}
                                alt={`${set.label} 신청 버튼`}
                                className="w-full h-16 object-contain bg-white rounded"
                              />
                            </div>
                            {/* 라벨 */}
                            <div className="p-2 text-xs text-center font-medium text-gray-700 bg-gray-100">
                              번호 {set.num}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 버튼 위치 선택 */}
                <div>
                  <h4 className="font-medium mb-3 text-sm">버튼 위치</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 다음 버튼 위치 */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        다음 버튼
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, keepBtnLocate: null })
                          }
                          className={`flex-1 px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                            formData.keepBtnLocate === null
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          일반형
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, keepBtnLocate: "fixed" })
                          }
                          className={`flex-1 px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                            formData.keepBtnLocate === "fixed"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          띄움형
                        </button>
                      </div>
                    </div>

                    {/* 신청 버튼 위치 */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        신청 버튼
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, buttonPosition: null })
                          }
                          className={`flex-1 px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                            formData.buttonPosition === null
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          일반형
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              buttonPosition: "fixed",
                            })
                          }
                          className={`flex-1 px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                            formData.buttonPosition === "fixed"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          띄움형
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* 1단계: 신청 버튼만 선택 */
              <>
                <div>
                  <h4 className="font-medium mb-3 text-sm">신청 버튼 이미지</h4>
                  {loadingAssets ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      이미지 로딩 중...
                    </div>
                  ) : !formData.domain ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      먼저 도메인을 선택해주세요
                    </div>
                  ) : postBtnImages.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      선택된 도메인에 버튼 이미지가 없습니다
                      {console.log(
                        "🔍 1단계 렌더링 - postBtnImages 길이:",
                        postBtnImages.length,
                        "postBtnImages:",
                        postBtnImages
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {postBtnImages.map((imageUrl, index) => (
                        <div
                          key={imageUrl}
                          onClick={() =>
                            setFormData({ ...formData, buttonImage: imageUrl })
                          }
                          className={`border-2 rounded-md overflow-hidden cursor-pointer transition-all ${
                            formData.buttonImage === imageUrl
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`신청 버튼 ${index + 1}`}
                            className="w-full h-20 object-contain bg-white"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="hidden w-full h-20 bg-gray-100 items-center justify-center text-xs text-gray-400">
                            이미지 로드 실패
                          </div>
                          <div className="p-2 text-xs text-center text-gray-600 truncate bg-gray-50">
                            신청 버튼 {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 1단계: 신청 버튼 위치 */}
            {getPageCount() === 1 && (
              <div>
                <h4 className="font-medium mb-3 text-sm">신청 버튼 위치</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, buttonPosition: null })
                    }
                    className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                      formData.buttonPosition === null
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    일반형
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, buttonPosition: "fixed" })
                    }
                    className={`px-2 py-2 rounded-md border-2 text-xs font-medium transition-all ${
                      formData.buttonPosition === "fixed"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    띄움형
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* 푸터 설정 */}
        {renderEnhancedFooterSection()}
      </div>
    </>
  );

  // Helper 함수: 코드값을 사용자 친화적 라벨로 변환
  const getTemplateName = (templateId) => {
    const allTemplates = [
      ...templates1Stage,
      ...templates2Stage,
      ...templates3Stage,
    ];
    const template = allTemplates.find((t) => t.id === parseInt(templateId));
    return template ? template.name : templateId;
  };

  const getFormStyleName = (styleId) => {
    const style = formStyles.find((s) => s.id === styleId);
    return style ? style.name : styleId;
  };

  const getPrivacyStyleName = (styleId) => {
    const style = privacyStyles.find((s) => s.id === styleId);
    return style ? style.name : styleId;
  };

  const getServiceInfoName = (className) => {
    const mapping = {
      "": "없음",
      "service-dark": "Dark",
      "service-light": "Light",
      "service-white": "White",
      "service-beige": "Beige",
      "service-blue": "Blue",
    };
    return mapping[className] || mapping[""] || "없음";
  };

  const getButtonPositionName = (position) => {
    return position === "fixed" ? "띄움형" : "일반형";
  };

  const getBenefitPeriodName = (type) => {
    const mapping = {
      week: "이번주",
      month: "이번달",
    };
    return mapping[type] || "사용 안 함";
  };

  const getButtonColorName = (color) => {
    const mapping = {
      blue: "Blue",
      green: "Green",
      orange: "Orange",
      pink: "Pink",
      red: "Red",
    };
    return mapping[color] || color || "미선택";
  };

  const getFooterClassName = (className) => {
    if (!className) return "없음";

    // 정렬 정보 추출
    let alignment = "중앙";
    if (className.endsWith("-left")) alignment = "왼쪽";
    else if (className.endsWith("-right")) alignment = "오른쪽";

    // 기본 스타일 추출
    const baseClassName = className.replace(/-left|-right$/, "");
    const styleMapping = {
      "footer-dark": "Dark",
      "footer-light": "Light",
      "footer-blue": "Blue",
      "footer-minimal": "Minimal",
      "footer-gray-border": "Gray",
      "footer-navy": "Navy",
      "footer-obsidian": "Obsidian",
      "footer-capsule": "Capsule ⭐",
      "footer-chrome": "Chrome",
      "footer-concrete": "Concrete",
      "footer-pearl": "Pearl",
      "footer-graphite": "Graphite",
    };

    const style = styleMapping[baseClassName] || "미입력";
    return `${style} (${alignment})`;
  };

  const getConsentStyleName = (styleId) => {
    const style = consentStyles.find((s) => s.id === styleId);
    return style ? style.name : styleId;
  };

  // STEP 3 컨텐츠 렌더링 (최종 확인)
  const renderStep3Content = () => (
    <>
      <h2 className="text-xl font-bold mb-6">최종 확인</h2>
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">도메인:</div>
          <div>{formData.domain}</div>

          <div className="font-medium">외부 시스템 연동:</div>
          <div>{formData.bigcConnection || "없음"}</div>

          <div className="font-medium">템플릿:</div>
          <div>{getTemplateName(formData.template)}</div>

          <div className="font-medium">설문 조사:</div>
          <div>
            {formData.surveyList && formData.surveyList.length > 0
              ? `${formData.surveyList.length}개 설문`
              : "없음"}
          </div>

          <div className="font-medium">이미지:</div>
          <div>{Object.keys(formData.images).length}개</div>

          <div className="font-medium">이미지 ALT 텍스트:</div>
          <div>
            {
              Object.values(formData.imageAlts || {}).filter((alt) => alt)
                .length
            }
            개 설정됨
          </div>

          <div className="font-medium">폼 스타일:</div>
          <div>{getFormStyleName(formData.formStyle)}</div>

          <div className="font-medium">개인정보 수집 주체:</div>
          <div>{formData.privacyPolicyName}</div>

          <div className="font-medium">개인정보 동의 스타일:</div>
          <div>{getPrivacyStyleName(formData.privacyPolicyClassName)}</div>

          <div className="font-medium">제휴사 안내:</div>
          <div>{getServiceInfoName(formData.serviceInfoClassName)}</div>

          <div className="font-medium">다음 버튼 위치:</div>
          <div>{getButtonPositionName(formData.keepBtnLocate)}</div>

          <div className="font-medium">다음 버튼 이미지:</div>
          <div>
            {formData.keepBtnImage ? (
              <img
                src={formData.keepBtnImage}
                alt="다음 버튼 미리보기"
                className="h-12 object-contain bg-white border rounded"
              />
            ) : (
              "미설정"
            )}
          </div>

          <div className="font-medium">신청하기 버튼 위치:</div>
          <div>{getButtonPositionName(formData.buttonPosition)}</div>

          <div className="font-medium">신청하기 버튼 이미지:</div>
          <div>
            {formData.buttonImage ? (
              <img
                src={formData.buttonImage}
                alt="신청하기 버튼 미리보기"
                className="h-12 object-contain bg-white border rounded"
              />
            ) : (
              "미선택"
            )}
          </div>

          <div className="font-medium">혜택 기간 타입:</div>
          <div>{getBenefitPeriodName(formData.benefitPeriodType)}</div>

          <div className="font-medium">푸터 스타일:</div>
          <div>{getFooterClassName(formData.footerClassName)}</div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowPrevAlert(true)}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          이전
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          ✅ 발행
        </button>
      </div>
    </>
  );

  // Bulk-edit 모드 렌더링 (3단 레이아웃 - /create/template Step 2와 동일)
  if (isBulkEdit) {
    return (
      <div className="min-h-screen bg-white">
        {/* 3단 분할 레이아웃 - 전체 화면 */}
        <div className="flex h-screen">
          {/* 왼쪽: 기본 설정 패널 (토글 가능) */}
          <div
            className={`transition-all duration-300 ${
              showBasicSettings ? "w-[320px]" : "w-12"
            }`}
          >
            {!showBasicSettings ? (
              <button
                onClick={() => setShowBasicSettings(true)}
                className="bg-gray-500 text-white p-3 hover:bg-gray-600 h-full flex items-center justify-center"
                title="기본 설정 열기"
              >
                <span className="text-xl">→</span>
              </button>
            ) : (
              <div className="bg-white border-r shadow-lg h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-bold">도메인 정보</h3>
                  <button
                    onClick={() => setShowBasicSettings(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                    title="설정 닫기"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {/* 도메인 정보 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                      선택된 도메인
                    </h4>
                    <p className="text-gray-700 font-medium text-sm">
                      {domainUrl
                        ? decodeURIComponent(domainUrl)
                        : formData.domain}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      ⚠️ 이 도메인의 모든 랜딩 페이지에 적용됩니다
                    </p>
                  </div>

                  {/* 랜딩 페이지 목록 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon
                        icon={faList}
                        className="text-gray-600 text-sm"
                      />
                      <h4 className="font-semibold text-gray-900 text-sm">
                        대상 랜딩 페이지
                      </h4>
                      {loadingAssets && (
                        <div className="animate-spin text-blue-500">
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {loadingAssets ? (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        랜딩 페이지 목록을 불러오는 중...
                      </div>
                    ) : domainLandings.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {domainLandings.map((landing, index) => (
                          <div
                            key={landing.adNumber || index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 truncate">
                                  {landing.adNumber || `랜딩-${index + 1}`}
                                </span>
                                {(() => {
                                  const templateKey =
                                    getTemplateKeyFromLanding(landing);
                                  return templateKey ? (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                      {getTemplateStageText(templateKey)}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                      템플릿 없음
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {landing.privacyOwner &&
                                  `주체: ${landing.privacyOwner}`}
                                <br />
                                {landing.createdAt &&
                                  `생성일: ${landing.createdAt.split(" ")[0]}`}
                                <br />
                                {landing.updatedAt &&
                                  `수정일: ${landing.updatedAt.split(" ")[0]}`}
                              </div>
                            </div>
                            <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              수정 대상
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        이 도메인에 랜딩 페이지가 없습니다
                      </div>
                    )}

                    {domainLandings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            총 {domainLandings.length}개 랜딩 페이지
                          </span>
                          <span className="text-blue-600 font-medium">
                            일괄 수정 예정
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* 하단 버튼 */}
                <div className="border-t p-4 bg-white">
                  <button
                    onClick={() => navigate("/portfolio/landingmaker")}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    이전
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 중앙: 미리보기 */}
          <div className="flex-1 bg-gray-50 p-6 overflow-hidden">
            {isBulkEdit && (
              <LandingPreview
                formData={{
                  ...formData,
                  // 일괄수정 모드에서는 이미지만 제거
                  images: {},
                  buttonImage: null,
                  keepBtnImage: null,
                }}
                currentStep={2}
                onPrevStep={() => {}}
                onNextStep={() => {}}
                canProceed={true}
                isBulkEdit={true}
                imageCountPerPage={imageCountPerPage}
              />
            )}
          </div>

          {/* 오른쪽: 이미지 & 스타일 설정 패널 (토글 가능) */}
          <div
            className={`transition-all duration-300 ${
              showStyleSettings ? "w-[400px]" : "w-12"
            }`}
          >
            {!showStyleSettings ? (
              <button
                onClick={() => setShowStyleSettings(true)}
                className="bg-gray-500 text-white p-3 hover:bg-gray-600 h-full flex items-center justify-center"
                title="스타일 설정 열기"
              >
                <span className="text-xl">←</span>
              </button>
            ) : (
              <div className="bg-white border-l shadow-lg h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-bold">스타일 & 내용</h3>
                  <button
                    onClick={() => setShowStyleSettings(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                    title="설정 닫기"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* 폼 스타일 */}
                  {renderEnhancedFormStyleSection()}

                  <div className="border-t pt-6"></div>

                  {/* 개인정보 수집 주체 */}
                  {renderPrivacySection()}

                  <div className="border-t pt-6"></div>

                  {/* 개인정보 동의 스타일 */}
                  {renderEnhancedConsentStyleSection()}

                  <div className="border-t pt-6"></div>

                  {/* 푸터 설정 */}
                  {renderEnhancedFooterSection()}
                </div>
                {/* 하단 버튼 */}
                <div className="border-t p-4 bg-white space-y-2">
                  {/* 버튼 일괄수정 버튼 */}
                  <button
                    onClick={openButtonModal}
                    disabled={!domainUrl}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    <span>버튼 일괄수정</span>
                  </button>
                  
                  {/* 일괄 저장 버튼 */}
                  <button
                    onClick={handleBulkSave}
                    disabled={loading}
                    className={`w-full px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      pendingButtonSettings ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>저장 중...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>일괄 저장{pendingButtonSettings ? ' (버튼 변경 대기 중)' : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 버튼 일괄수정 모달 - 일괄수정 모드에서만 표시 */}
        {showButtonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">버튼 일괄수정</h2>
                <button
                  onClick={() => setShowButtonModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    도메인: <span className="font-medium">{domainUrl ? decodeURIComponent(domainUrl) : ''}</span>
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ 템플릿 단계별로 버튼 구조가 다르므로 각각 설정해주세요
                  </p>
                </div>

                {/* 탭 구성 */}
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex space-x-8">
                    <button 
                      onClick={() => setButtonModalTab('stage1')}
                      disabled={!hasStageTemplates('stage1')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        buttonModalTab === 'stage1' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      } ${
                        !hasStageTemplates('stage1') 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      1단계 템플릿 ({getStageCount('stage1')}개)
                    </button>
                    <button 
                      onClick={() => setButtonModalTab('stage23')}
                      disabled={!hasStageTemplates('stage23')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        buttonModalTab === 'stage23' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      } ${
                        !hasStageTemplates('stage23') 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      2,3단계 템플릿 ({getStageCount('stage23')}개)
                    </button>
                  </div>
                </div>

                {/* 탭 내용 */}
                {buttonModalTab === 'stage1' ? (
                  // 1단계 템플릿 탭
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">1단계 템플릿 버튼 설정</h3>
                      <p className="text-sm text-gray-600 mb-4">신청 버튼만 설정됩니다</p>
                    </div>

                    {!hasStageTemplates('stage1') ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">설정할 수 있는 1단계 템플릿이 없습니다</div>
                        <div className="text-sm">다른 단계를 선택하거나 1단계 템플릿을 먼저 생성해주세요.</div>
                      </div>
                    ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 좌측: 버튼 설정 */}
                      <div>
                        <div className="space-y-4">
                          {/* 버튼 위치 설정 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              버튼 위치
                            </label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage1: { ...prev.stage1, postBtnLocate: null }
                                }))}
                                className={`px-4 py-2 border rounded-md text-sm ${
                                  buttonModalSettings.stage1.postBtnLocate === null
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                일반형
                              </button>
                              <button 
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage1: { ...prev.stage1, postBtnLocate: 'fixed' }
                                }))}
                                className={`px-4 py-2 border rounded-md text-sm ${
                                  buttonModalSettings.stage1.postBtnLocate === 'fixed'
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                띄움형
                              </button>
                            </div>
                          </div>

                          {/* 버튼 이미지 선택 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              신청 버튼 이미지
                            </label>
                            {postBtnImages.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {postBtnImages.map((imageUrl, index) => (
                                  <button
                                    key={imageUrl}
                                    onClick={() => setButtonModalSettings(prev => ({
                                      ...prev,
                                      stage1: { ...prev.stage1, postBtnUrl: imageUrl }
                                    }))}
                                    className={`border-2 rounded-md overflow-hidden hover:border-blue-400 ${
                                      buttonModalSettings.stage1.postBtnUrl === imageUrl
                                        ? 'border-blue-600 ring-2 ring-blue-200'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`버튼 ${index + 1}`}
                                      className="w-full h-12 object-contain bg-white"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                {loadingAssets ? '버튼 이미지 로딩 중...' : '이 도메인에 버튼 이미지가 없습니다'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 우측: 대상 랜딩 목록 */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          수정 대상 (1단계 템플릿)
                        </h4>
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-64 overflow-y-auto">
                          {(getStageFilteredLandings('stage1')?.length || 0) > 0 ? (
                            <div className="space-y-2">
                              {(getStageFilteredLandings('stage1') || []).map((landing) => (
                                <div key={landing.adNumber} className="bg-white p-2 rounded border text-xs">
                                  <div className="font-medium">{landing.adNumber}</div>
                                  <div className="text-gray-500">{getTemplateStageText(landing.templateKey)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              1단계 템플릿 랜딩이 없습니다
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                ) : (
                  // 2,3단계 템플릿 탭
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">2,3단계 템플릿 버튼 설정</h3>
                      <p className="text-sm text-gray-600 mb-4">다음 버튼 + 신청 버튼 세트를 설정됩니다</p>
                    </div>

                    {!hasStageTemplates('stage23') ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">설정할 수 있는 2,3단계 템플릿이 없습니다</div>
                        <div className="text-sm">다른 단계를 선택하거나 2,3단계 템플릿을 먼저 생성해주세요.</div>
                      </div>
                    ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 좌측: 버튼 설정 */}
                      <div>
                        <div className="space-y-4">
                          {/* 버튼 세트 선택 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              버튼 세트
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {STATIC_BUTTON_SETS.map((set) => (
                                <button
                                  key={set.key}
                                  onClick={() => setButtonModalSettings(prev => ({
                                    ...prev,
                                    stage23: { ...prev.stage23, selectedButtonSet: set }
                                  }))}
                                  className={`border-2 rounded-lg overflow-hidden p-2 hover:border-blue-400 ${
                                    buttonModalSettings.stage23.selectedButtonSet?.key === set.key
                                      ? 'border-blue-600 ring-2 ring-blue-200'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  <div className="space-y-1">
                                    <img src={set.keepBtn} alt="다음" className="w-full h-8 object-contain" />
                                    <img src={set.postBtn} alt="신청" className="w-full h-8 object-contain" />
                                    <div className="text-xs text-center">{set.label}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 다음 버튼 위치 설정 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              다음 버튼 위치
                            </label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage23: { ...prev.stage23, keepBtnLocate: null }
                                }))}
                                className={`px-4 py-2 border rounded-md text-sm ${
                                  buttonModalSettings.stage23.keepBtnLocate === null
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                일반형
                              </button>
                              <button 
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage23: { ...prev.stage23, keepBtnLocate: 'fixed' }
                                }))}
                                className={`px-4 py-2 border rounded-md text-sm ${
                                  buttonModalSettings.stage23.keepBtnLocate === 'fixed'
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                띄움형
                              </button>
                            </div>
                          </div>

                          {/* 신청 버튼 위치 설정 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              신청 버튼 위치
                            </label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage23: { ...prev.stage23, postBtnLocate: null }
                                }))}
                                className={`px-4 py-2 border rounded-md text-sm ${
                                  buttonModalSettings.stage23.postBtnLocate === null
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                일반형
                              </button>
                              <button 
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage23: { ...prev.stage23, postBtnLocate: 'fixed' }
                                }))}
                                className={`px-4 py-2 border rounded-md text-sm ${
                                  buttonModalSettings.stage23.postBtnLocate === 'fixed'
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                띄움형
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 우측: 대상 랜딩 목록 */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          수정 대상 (2,3단계 템플릿)
                        </h4>
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-64 overflow-y-auto">
                          {(getStageFilteredLandings('stage23')?.length || 0) > 0 ? (
                            <div className="space-y-2">
                              {(getStageFilteredLandings('stage23') || []).map((landing) => (
                                <div key={landing.adNumber} className="bg-white p-2 rounded border text-xs">
                                  <div className="font-medium">{landing.adNumber}</div>
                                  <div className="text-gray-500">{getTemplateStageText(landing.templateKey)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              2,3단계 템플릿 랜딩이 없습니다
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowButtonModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleButtonModalApply}
                  disabled={!hasStageTemplates(buttonModalTab)}
                  className={`px-4 py-2 text-white rounded-md ${
                    hasStageTemplates(buttonModalTab)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}

      {/* 일괄 저장 확인 다이얼로그 */}
      <AlertDialog open={showBulkSaveAlert} onOpenChange={setShowBulkSaveAlert}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>일괄 저장 확인</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="text-base font-semibold text-gray-900">
                  총 {domainLandings.length}개의 랜딩 페이지가 수정됩니다.
                </div>

                <div>
                  <div className="font-semibold mb-2 text-gray-700">수정될 항목:</div>
                  <ul className="list-disc list-inside text-sm space-y-1.5 text-gray-600">
                    <li>
                      <span className="font-medium">폼 스타일:</span>{" "}
                      {formStyles.find(s => s.id === formData.formStyle)?.name || formData.formStyle}
                    </li>
                    <li>
                      <span className="font-medium">개인정보 동의 스타일:</span>{" "}
                      {consentStyles.find(s => s.id === formData.privacyPolicyClassName)?.name || formData.privacyPolicyClassName}
                    </li>
                    <li>
                      <span className="font-medium">개인정보수집주체:</span> {formData.privacyPolicyName}
                    </li>
                    <li>
                      <span className="font-medium">개인정보처리방침:</span> 전체 내용 업데이트
                    </li>
                    <li>
                      <span className="font-medium">푸터 스타일:</span>{" "}
                      {(() => {
                        const allFooterStyles = [...footerStyleSections[0].styles, ...footerStyleSections[1].styles];
                        const baseClassName = formData.footerClassName.replace(/-left|-right$/, '');
                        const footerStyle = allFooterStyles.find(s => s.id === baseClassName);
                        return footerStyle?.name || formData.footerClassName || "없음";
                      })()}
                    </li>
                    <li>
                      <span className="font-medium">푸터 내용:</span> 전체 내용 업데이트
                    </li>
                    {pendingButtonSettings && (
                      <li className="text-orange-600 font-semibold">
                        버튼 설정 ({pendingButtonSettings.stage === '1' ? '1단계' : '2,3단계'} 템플릿)
                      </li>
                    )}
                  </ul>
                </div>

                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  ⚠️ 이 작업은 되돌릴 수 없습니다. 정말 저장하시겠습니까?
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkSave} className="bg-purple-600 hover:bg-purple-700">
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {currentStep >= 2 ? (
        <>
          {/* 2단계 이상: 3단 분할 레이아웃 - 전체 화면 */}
          <div className="flex h-screen">
            {/* 왼쪽: 기본 설정 패널 (토글 가능) */}
            <div
              className={`transition-all duration-300 ${
                showBasicSettings ? "w-[300px]" : "w-12"
              }`}
            >
              {!showBasicSettings ? (
                <button
                  onClick={() => setShowBasicSettings(true)}
                  className="bg-gray-500 text-white p-3 hover:bg-gray-600 h-full flex items-center justify-center"
                  title="기본 설정 열기"
                >
                  <span className="text-xl">→</span>
                </button>
              ) : (
                <div className="bg-white border-r shadow-lg h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold">기본 설정</h3>
                    <button
                      onClick={() => setShowBasicSettings(false)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                      title="설정 닫기"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 2 && renderBasicSettingsContent()}
                    {currentStep === 3 && (
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">도메인:</div>
                          <div>{formData.domain}</div>
                          <div className="font-medium">외부 시스템 연동:</div>
                          <div>{formData.bigcConnection}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 이전 버튼 - 패널 하단 고정 */}
                  {currentStep === 2 && (
                    <div className="border-t p-4 bg-white">
                      <button
                        onClick={() => setShowPrevAlert(true)}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FontAwesomeIcon
                          icon={faChevronLeft}
                          className="text-xs"
                        />
                        이전
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 중앙: 미리보기 */}
            <div className="flex-1 bg-gray-50 p-6 overflow-hidden">
              <LandingPreview
                formData={isBulkEdit ? {
                  ...formData,
                  // 일괄수정 모드에서는 이미지 제거
                  images: {},
                  buttonImage: null,
                  keepBtnImage: null,
                } : formData}
                currentStep={isBulkEdit ? 2 : currentStep}
                onPrevStep={isBulkEdit ? () => {} : prevStep}
                onNextStep={isBulkEdit ? () => {} : nextStep}
                canProceed={isBulkEdit ? true : (
                  !formData.domain ||
                  !formData.template ||
                  Object.keys(formData.images).length === 0
                )}
                imageCountPerPage={imageCountPerPage}
                onImageChange={isBulkEdit ? undefined : (imageKey, file) => {
                  const newImages = { ...formData.images };
                  newImages[imageKey] = file;
                  setFormData({ ...formData, images: newImages });
                }}
                isBulkEdit={isBulkEdit}
              />
            </div>

            {/* 오른쪽: 이미지 & 스타일 설정 패널 (토글 가능) */}
            <div
              className={`transition-all duration-300 ${
                showStyleSettings ? "w-[400px]" : "w-12"
              }`}
            >
              {!showStyleSettings ? (
                <button
                  onClick={() => setShowStyleSettings(true)}
                  className="bg-gray-500 text-white p-3 hover:bg-gray-600 h-full flex items-center justify-center"
                  title="스타일 설정 열기"
                >
                  <span className="text-xl">←</span>
                </button>
              ) : (
                <div className="bg-white border-l shadow-lg h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold">이미지 & 스타일</h3>
                    <button
                      onClick={() => setShowStyleSettings(false)}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                      title="설정 닫기"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 2 && renderImagesAndStylesContent()}
                    {currentStep === 3 && renderStep3Content()}
                  </div>
                  {/* 다음 버튼 - sticky로 하단 고정 */}
                  {currentStep === 2 && (
                    <div className="sticky bottom-0 border-t p-4 bg-white">
                      <button
                        onClick={nextStep}
                        disabled={!canProceedToStep3()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-1"
                      >
                        다음
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="text-xs"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen bg-white">
          <Header />

          {/* STEP 1: 템플릿 선택 */}
          <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-gray-800" />
                <h2 className="text-xl font-semibold text-gray-900">
                  랜딩제작
                </h2>
              </div>
              <div className="text-sm text-gray-600">
                신규 템플릿 추가는 개발팀에 문의해주세요.
              </div>
            </div>

            <div className="w-full h-px bg-gray-200 mb-8"></div>

            {currentStep === 1 && (
              <>
                {/* 1단계 템플릿 */}
                <div className="mb-12">
                  <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-1">
                    <span className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs">
                      1
                    </span>
                    단계 템플릿
                  </h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {templates1Stage.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        onDoubleClick={() => {
                          handleTemplateSelect(template.id);
                          nextStep();
                        }}
                        className={`border-2 rounded-lg cursor-pointer transition-all h-full flex flex-col overflow-hidden relative ${
                          formData.template === template.id
                            ? "border-purple-600"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                          title={
                            favorites.includes(template.id)
                              ? "즐겨찾기 해제"
                              : "즐겨찾기 추가"
                          }
                        >
                          <span
                            className={`text-lg ${
                              favorites.includes(template.id)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            {favorites.includes(template.id) ? "★" : "☆"}
                          </span>
                        </button>
                        <div className="bg-gray-100 p-4">
                          <TemplatePreview templateId={template.id} />
                        </div>
                        <div className="border-t border-gray-200"></div>
                        <div className="bg-white p-4 flex-1">
                          <h4 className="font-bold mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {template.desc}
                          </p>
                          {formData.template === template.id && (
                            <div className="mt-3 text-purple-600 text-sm font-medium">
                              ✓ 선택됨
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2단계 템플릿 */}
                <div className="mb-12">
                  <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-1">
                    <span className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs">
                      2
                    </span>
                    단계 템플릿
                  </h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {templates2Stage.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        onDoubleClick={() => {
                          handleTemplateSelect(template.id);
                          nextStep();
                        }}
                        className={`border-2 rounded-lg cursor-pointer transition-all h-full flex flex-col overflow-hidden relative ${
                          formData.template === template.id
                            ? "border-purple-600"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                          title={
                            favorites.includes(template.id)
                              ? "즐겨찾기 해제"
                              : "즐겨찾기 추가"
                          }
                        >
                          <span
                            className={`text-lg ${
                              favorites.includes(template.id)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            {favorites.includes(template.id) ? "★" : "☆"}
                          </span>
                        </button>
                        <div className="bg-gray-100 p-4">
                          <TemplatePreview templateId={template.id} />
                        </div>
                        <div className="border-t border-gray-200"></div>
                        <div className="bg-white p-4 flex-1">
                          <h4 className="font-bold mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {template.desc}
                          </p>
                          {formData.template === template.id && (
                            <div className="mt-3 text-purple-600 text-sm font-medium">
                              ✓ 선택됨
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3단계 템플릿 */}
                <div className="mb-12">
                  <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-1">
                    <span className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs">
                      3
                    </span>
                    단계 템플릿
                  </h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {templates3Stage.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        onDoubleClick={() => {
                          handleTemplateSelect(template.id);
                          nextStep();
                        }}
                        className={`border-2 rounded-lg cursor-pointer transition-all h-full flex flex-col overflow-hidden relative ${
                          formData.template === template.id
                            ? "border-purple-600"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                          title={
                            favorites.includes(template.id)
                              ? "즐겨찾기 해제"
                              : "즐겨찾기 추가"
                          }
                        >
                          <span
                            className={`text-lg ${
                              favorites.includes(template.id)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            {favorites.includes(template.id) ? "★" : "☆"}
                          </span>
                        </button>
                        <div className="bg-gray-100 p-4">
                          <TemplatePreview templateId={template.id} />
                        </div>
                        <div className="border-t border-gray-200"></div>
                        <div className="bg-white p-4 flex-1">
                          <h4 className="font-bold mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {template.desc}
                          </p>
                          {formData.template === template.id && (
                            <div className="mt-3 text-purple-600 text-sm font-medium">
                              ✓ 선택됨
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 버튼 일괄수정 모달 */}
      {showButtonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">버튼 일괄수정</h2>
              <button
                onClick={() => setShowButtonModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  도메인: <span className="font-medium">{domainUrl ? decodeURIComponent(domainUrl) : ''}</span>
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ 템플릿 단계별로 버튼 구조가 다르므로 각각 설정해주세요
                </p>
              </div>

              {/* 탭 구성 */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  <button 
                    onClick={() => setButtonModalTab('stage1')}
                    disabled={!hasStageTemplates('stage1')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      buttonModalTab === 'stage1' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } ${
                      !hasStageTemplates('stage1') 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    1단계 템플릿 ({getStageCount('stage1')}개)
                  </button>
                  <button 
                    onClick={() => setButtonModalTab('stage23')}
                    disabled={!hasStageTemplates('stage23')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      buttonModalTab === 'stage23' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } ${
                      !hasStageTemplates('stage23') 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    2,3단계 템플릿 ({getStageCount('stage23')}개)
                  </button>
                </div>
              </div>

              {/* 탭 내용 */}
              {buttonModalTab === 'stage1' ? (
                // 1단계 템플릿 탭
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">1단계 템플릿 버튼 설정</h3>
                    <p className="text-sm text-gray-600 mb-4">신청 버튼만 설정됩니다</p>
                  </div>

                  {!hasStageTemplates('stage1') ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg mb-2">설정할 수 있는 1단계 템플릿이 없습니다</div>
                      <div className="text-sm">다른 단계를 선택하거나 1단계 템플릿을 먼저 생성해주세요.</div>
                    </div>
                  ) : (

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 좌측: 버튼 설정 */}
                    <div>
                      <div className="space-y-4">
                        {/* 버튼 위치 설정 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            버튼 위치
                          </label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setButtonModalSettings(prev => ({
                                ...prev,
                                stage1: { ...prev.stage1, postBtnLocate: null }
                              }))}
                              className={`px-4 py-2 border rounded-md text-sm ${
                                buttonModalSettings.stage1.postBtnLocate === null
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              일반형
                            </button>
                            <button 
                              onClick={() => setButtonModalSettings(prev => ({
                                ...prev,
                                stage1: { ...prev.stage1, postBtnLocate: 'fixed' }
                              }))}
                              className={`px-4 py-2 border rounded-md text-sm ${
                                buttonModalSettings.stage1.postBtnLocate === 'fixed'
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              띄움형
                            </button>
                          </div>
                        </div>

                        {/* 버튼 이미지 선택 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            신청 버튼 이미지
                          </label>
                          {postBtnImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {postBtnImages.map((imageUrl, index) => (
                                <button
                                  key={imageUrl}
                                  onClick={() => setButtonModalSettings(prev => ({
                                    ...prev,
                                    stage1: { ...prev.stage1, postBtnUrl: imageUrl }
                                  }))}
                                  className={`border-2 rounded-md overflow-hidden hover:border-blue-400 ${
                                    buttonModalSettings.stage1.postBtnUrl === imageUrl
                                      ? 'border-blue-600 ring-2 ring-blue-200'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`버튼 ${index + 1}`}
                                    className="w-full h-12 object-contain bg-white"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              {loadingAssets ? '버튼 이미지 로딩 중...' : '이 도메인에 버튼 이미지가 없습니다'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 우측: 대상 랜딩 목록 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        수정 대상 (1단계 템플릿)
                      </h4>
                      <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-64 overflow-y-auto">
                        {(getStageFilteredLandings('stage1')?.length || 0) > 0 ? (
                          <div className="space-y-2">
                            {(getStageFilteredLandings('stage1') || []).map((landing) => (
                              <div key={landing.adNumber} className="bg-white p-2 rounded border text-xs">
                                <div className="font-medium">{landing.adNumber}</div>
                                <div className="text-gray-500">{getTemplateStageText(landing.templateKey)}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            1단계 템플릿 랜딩이 없습니다
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                // 2,3단계 템플릿 탭
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">2,3단계 템플릿 버튼 설정</h3>
                    <p className="text-sm text-gray-600 mb-4">다음 버튼 + 신청 버튼 세트를 설정됩니다</p>
                  </div>

                  {!hasStageTemplates('stage23') ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg mb-2">설정할 수 있는 2,3단계 템플릿이 없습니다</div>
                      <div className="text-sm">다른 단계를 선택하거나 2,3단계 템플릿을 먼저 생성해주세요.</div>
                    </div>
                  ) : (

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 좌측: 버튼 설정 */}
                    <div>
                      <div className="space-y-4">
                        {/* 버튼 세트 선택 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            버튼 세트
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {STATIC_BUTTON_SETS.map((set) => (
                              <button
                                key={set.key}
                                onClick={() => setButtonModalSettings(prev => ({
                                  ...prev,
                                  stage23: { ...prev.stage23, selectedButtonSet: set }
                                }))}
                                className={`border-2 rounded-lg overflow-hidden p-2 hover:border-blue-400 ${
                                  buttonModalSettings.stage23.selectedButtonSet?.key === set.key
                                    ? 'border-blue-600 ring-2 ring-blue-200'
                                    : 'border-gray-300'
                                }`}
                              >
                                <div className="space-y-1">
                                  <img src={set.keepBtn} alt="다음" className="w-full h-8 object-contain" />
                                  <img src={set.postBtn} alt="신청" className="w-full h-8 object-contain" />
                                  <div className="text-xs text-center">{set.label}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 버튼 위치 설정 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            다음 버튼 위치
                          </label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setButtonModalSettings(prev => ({
                                ...prev,
                                stage23: { ...prev.stage23, keepBtnLocate: null }
                              }))}
                              className={`px-4 py-2 border rounded-md text-sm ${
                                buttonModalSettings.stage23.keepBtnLocate === null
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              일반형
                            </button>
                            <button 
                              onClick={() => setButtonModalSettings(prev => ({
                                ...prev,
                                stage23: { ...prev.stage23, keepBtnLocate: 'fixed' }
                              }))}
                              className={`px-4 py-2 border rounded-md text-sm ${
                                buttonModalSettings.stage23.keepBtnLocate === 'fixed'
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              띄움형
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 우측: 대상 랜딩 목록 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        수정 대상 (2,3단계 템플릿)
                      </h4>
                      <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-64 overflow-y-auto">
                        {(getStageFilteredLandings('stage23')?.length || 0) > 0 ? (
                          <div className="space-y-2">
                            {(getStageFilteredLandings('stage23') || []).map((landing) => (
                              <div key={landing.adNumber} className="bg-white p-2 rounded border text-xs">
                                <div className="font-medium">{landing.adNumber}</div>
                                <div className="text-gray-500">{getTemplateStageText(landing.templateKey)}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            2,3단계 템플릿 랜딩이 없습니다
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowButtonModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleButtonModalApply}
                disabled={!hasStageTemplates(buttonModalTab)}
                className={`px-4 py-2 text-white rounded-md ${
                  hasStageTemplates(buttonModalTab)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이전 버튼 확인 다이얼로그 */}
      <AlertDialog open={showPrevAlert} onOpenChange={setShowPrevAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이전 단계로 이동</AlertDialogTitle>
            <AlertDialogDescription>
              현재 입력한 내용이 저장되지 않습니다. 이전 단계로 이동하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={prevStep}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PortfolioWidget />
    </div>
  );
}
