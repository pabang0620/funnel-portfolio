/**
 * Mock API 클라이언트 (포트폴리오용)
 * 실제 백엔드 호출 대신 목 데이터 반환
 */

// 목 사용자 데이터 (CS 상담사 14명 + 관리자 1명)
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@company.com',
    name: '관리자',
    team: '운영팀',
    status: 'approved',
    admin: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    email: 'hunt001@company.com',
    name: '김상담',
    team: '상담팀A',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 3,
    email: 'hunt002@company.com',
    name: '이상담',
    team: '상담팀A',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 4,
    email: 'hunt003@company.com',
    name: '박상담',
    team: '상담팀A',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 5,
    email: 'hunt004@company.com',
    name: '최상담',
    team: '상담팀A',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 6,
    email: 'hunt005@company.com',
    name: '정상담',
    team: '상담팀A',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 7,
    email: 'hunt006@company.com',
    name: '강상담',
    team: '상담팀B',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 8,
    email: 'hunt007@company.com',
    name: '조상담',
    team: '상담팀B',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 9,
    email: 'hunt008@company.com',
    name: '윤상담',
    team: '상담팀B',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 10,
    email: 'hunt009@company.com',
    name: '장상담',
    team: '상담팀B',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 11,
    email: 'hunt010@company.com',
    name: '임상담',
    team: '상담팀B',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 12,
    email: 'hunt011@company.com',
    name: '한상담',
    team: '상담팀C',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 13,
    email: 'hunt012@company.com',
    name: '오상담',
    team: '상담팀C',
    status: 'approved',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 14,
    email: 'hunt013@company.com',
    name: '서상담',
    team: '상담팀C',
    status: 'pending',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 15,
    email: 'hunt014@company.com',
    name: '권상담',
    team: '상담팀C',
    status: 'pending',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  }
]

// 목 스크립트 데이터 (10개 제품 x 14명 상담사, 최근 10개월 분산)
const MOCK_SCRIPTS = [
  {
    id: 'script-001',
    file_name: 'hunt001_01030000000_20250901000000.mp3',
    s3_key: 'udit_001/hunt001/2025-09-01/hunt001_01030000000_20250901000000.mp3',
    user_id: 'hunt001',
    consultant_name: '김상담',
    phone_number: '01030000000',
    brand_name: 'Udit',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2025-09-01',
    consultation_date: '2025-09-01',
    match_status: 'matched_single',
    transcript: null,
    size: 1048576
  },
  {
    id: 'script-002',
    file_name: 'hunt002_01030137731_20250908010400.mp3',
    s3_key: 'glowup_002/hunt002/2025-09-08/hunt002_01030137731_20250908010400.mp3',
    user_id: 'hunt002',
    consultant_name: '이상담',
    phone_number: '01030137731',
    brand_name: 'GlowUp',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2025-09-08',
    consultation_date: '2025-09-08',
    match_status: 'matched_by_date',
    transcript: {
      text: '네, 상품 관련해서 문의드리고 싶습니다. 결제가 두 번 된 것 같아서 확인 부탁드립니다.',
      language: 'ko',
      duration: 91.3,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '교환 절차가 어떻게 되는지 알고 싶어요.' }
      ]
    },
    size: 2789376
  },
  {
    id: 'script-003',
    file_name: 'hunt003_01030275462_20250915020800.mp3',
    s3_key: 'fitzone_003/hunt003/2025-09-15/hunt003_01030275462_20250915020800.mp3',
    user_id: 'hunt003',
    consultant_name: '박상담',
    phone_number: '01030275462',
    brand_name: 'FitZone',
    category_1: '교환/반품',
    category_2: '파손접수',
    category_3: null,
    calling_date: '2025-09-15',
    consultation_date: '2025-09-15',
    match_status: 'unmatched',
    transcript: null,
    size: 4530176
  },
  {
    id: 'script-004',
    file_name: 'hunt004_01030413193_20250922031200.mp3',
    s3_key: 'beautylab_004/hunt004/2025-09-22/hunt004_01030413193_20250922031200.mp3',
    user_id: 'hunt004',
    consultant_name: '최상담',
    phone_number: '01030413193',
    brand_name: 'BeautyLab',
    category_1: '배송문의',
    category_2: '주소변경',
    category_3: null,
    calling_date: '2025-09-22',
    consultation_date: '2025-09-22',
    match_status: 'matched_single',
    transcript: {
      text: '교환 절차가 어떻게 되는지 알고 싶어요. 이벤트 쿠폰이 적용이 안 됩니다.',
      language: 'ko',
      duration: 113.9,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '회원 탈퇴는 어떻게 진행하나요.' }
      ]
    },
    size: 2174976
  },
  {
    id: 'script-005',
    file_name: 'hunt005_01030550924_20250929041600.mp3',
    s3_key: 'homecafe_005/hunt005/2025-09-29/hunt005_01030550924_20250929041600.mp3',
    user_id: 'hunt005',
    consultant_name: '정상담',
    phone_number: '01030550924',
    brand_name: 'HomeCafe',
    category_1: '결제문의',
    category_2: '환불요청',
    category_3: null,
    calling_date: '2025-09-29',
    consultation_date: '2025-09-29',
    match_status: 'matched_by_date',
    transcript: null,
    size: 3915776
  },
  {
    id: 'script-006',
    file_name: 'hunt006_01030688655_20251006052000.mp3',
    s3_key: 'petcare_006/hunt006/2025-10-06/hunt006_01030688655_20251006052000.mp3',
    user_id: 'hunt006',
    consultant_name: '강상담',
    phone_number: '01030688655',
    brand_name: 'PetCare',
    category_1: '회원정보',
    category_2: '비밀번호재설정',
    category_3: null,
    calling_date: '2025-10-06',
    consultation_date: '2025-10-06',
    match_status: 'unmatched',
    transcript: null,
    size: 1560576
  },
  {
    id: 'script-007',
    file_name: 'hunt007_01030826386_20251013062400.mp3',
    s3_key: 'kidsworld_007/hunt007/2025-10-13/hunt007_01030826386_20251013062400.mp3',
    user_id: 'hunt007',
    consultant_name: '조상담',
    phone_number: '01030826386',
    brand_name: 'KidsWorld',
    category_1: '이벤트문의',
    category_2: '기간연장',
    category_3: null,
    calling_date: '2025-10-13',
    consultation_date: '2025-10-13',
    match_status: 'matched_single',
    transcript: {
      text: '이벤트 쿠폰이 적용이 안 됩니다. 네, 상품 관련해서 문의드리고 싶습니다.',
      language: 'ko',
      duration: 147.8,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '안녕하세요, 고객센터입니다. 무엇을 도와드릴까요?' }
      ]
    },
    size: 3301376
  },
  {
    id: 'script-008',
    file_name: 'hunt008_01030964117_20251020072800.mp3',
    s3_key: 'travelease_008/hunt008/2025-10-20/hunt008_01030964117_20251020072800.mp3',
    user_id: 'hunt008',
    consultant_name: '윤상담',
    phone_number: '01030964117',
    brand_name: 'TravelEase',
    category_1: '기타문의',
    category_2: '입점문의',
    category_3: null,
    calling_date: '2025-10-20',
    consultation_date: '2025-10-20',
    match_status: 'matched_by_date',
    transcript: null,
    size: 5042176
  },
  {
    id: 'script-009',
    file_name: 'hunt009_01031101848_20251027083200.mp3',
    s3_key: 'techgear_009/hunt009/2025-10-27/hunt009_01031101848_20251027083200.mp3',
    user_id: 'hunt009',
    consultant_name: '장상담',
    phone_number: '01031101848',
    brand_name: 'TechGear',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2025-10-27',
    consultation_date: '2025-10-27',
    match_status: 'unmatched',
    transcript: {
      text: '안녕하세요, 고객센터입니다. 무엇을 도와드릴까요? 교환 절차가 어떻게 되는지 알고 싶어요.',
      language: 'ko',
      duration: 170.4,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '배송이 아직 안 와서 문의드립니다.' }
      ]
    },
    size: 2686976
  },
  {
    id: 'script-010',
    file_name: 'hunt010_01031239579_20251103093600.mp3',
    s3_key: 'greenlife_010/hunt010/2025-11-03/hunt010_01031239579_20251103093600.mp3',
    user_id: 'hunt010',
    consultant_name: '임상담',
    phone_number: '01031239579',
    brand_name: 'GreenLife',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2025-11-03',
    consultation_date: '2025-11-03',
    match_status: 'matched_single',
    transcript: null,
    size: 4427776
  },
  {
    id: 'script-011',
    file_name: 'hunt011_01031377310_20251110104000.mp3',
    s3_key: 'udit_001/hunt011/2025-11-10/hunt011_01031377310_20251110104000.mp3',
    user_id: 'hunt011',
    consultant_name: '한상담',
    phone_number: '01031377310',
    brand_name: 'Udit',
    category_1: '교환/반품',
    category_2: '파손접수',
    category_3: null,
    calling_date: '2025-11-10',
    consultation_date: '2025-11-10',
    match_status: 'matched_by_date',
    transcript: null,
    size: 2072576
  },
  {
    id: 'script-012',
    file_name: 'hunt012_01031515041_20251117114400.mp3',
    s3_key: 'glowup_002/hunt012/2025-11-17/hunt012_01031515041_20251117114400.mp3',
    user_id: 'hunt012',
    consultant_name: '오상담',
    phone_number: '01031515041',
    brand_name: 'GlowUp',
    category_1: '배송문의',
    category_2: '주소변경',
    category_3: null,
    calling_date: '2025-11-17',
    consultation_date: '2025-11-17',
    match_status: 'unmatched',
    transcript: {
      text: '교환 절차가 어떻게 되는지 알고 싶어요. 이벤트 쿠폰이 적용이 안 됩니다.',
      language: 'ko',
      duration: 204.3,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '회원 탈퇴는 어떻게 진행하나요.' }
      ]
    },
    size: 3813376
  },
  {
    id: 'script-013',
    file_name: 'hunt013_01031652772_20251124124800.mp3',
    s3_key: 'fitzone_003/hunt013/2025-11-24/hunt013_01031652772_20251124124800.mp3',
    user_id: 'hunt013',
    consultant_name: '서상담',
    phone_number: '01031652772',
    brand_name: 'FitZone',
    category_1: '결제문의',
    category_2: '환불요청',
    category_3: null,
    calling_date: '2025-11-24',
    consultation_date: '2025-11-24',
    match_status: 'matched_single',
    transcript: null,
    size: 1458176
  },
  {
    id: 'script-014',
    file_name: 'hunt014_01031790503_20251201135200.mp3',
    s3_key: 'beautylab_004/hunt014/2025-12-01/hunt014_01031790503_20251201135200.mp3',
    user_id: 'hunt014',
    consultant_name: '권상담',
    phone_number: '01031790503',
    brand_name: 'BeautyLab',
    category_1: '회원정보',
    category_2: '비밀번호재설정',
    category_3: null,
    calling_date: '2025-12-01',
    consultation_date: '2025-12-01',
    match_status: 'matched_by_date',
    transcript: {
      text: '회원 탈퇴는 어떻게 진행하나요. 안녕하세요, 고객센터입니다. 무엇을 도와드릴까요?',
      language: 'ko',
      duration: 91.3,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '사이즈 교환 가능한지 문의드립니다.' }
      ]
    },
    size: 3198976
  },
  {
    id: 'script-015',
    file_name: 'hunt001_01031928234_20251208145600.mp3',
    s3_key: 'homecafe_005/hunt001/2025-12-08/hunt001_01031928234_20251208145600.mp3',
    user_id: 'hunt001',
    consultant_name: '김상담',
    phone_number: '01031928234',
    brand_name: 'HomeCafe',
    category_1: '이벤트문의',
    category_2: '기간연장',
    category_3: null,
    calling_date: '2025-12-08',
    consultation_date: '2025-12-08',
    match_status: 'unmatched',
    transcript: null,
    size: 4939776
  },
  {
    id: 'script-016',
    file_name: 'hunt002_01032065965_20251215160000.mp3',
    s3_key: 'petcare_006/hunt002/2025-12-15/hunt002_01032065965_20251215160000.mp3',
    user_id: 'hunt002',
    consultant_name: '이상담',
    phone_number: '01032065965',
    brand_name: 'PetCare',
    category_1: '기타문의',
    category_2: '입점문의',
    category_3: null,
    calling_date: '2025-12-15',
    consultation_date: '2025-12-15',
    match_status: 'matched_single',
    transcript: null,
    size: 2584576
  },
  {
    id: 'script-017',
    file_name: 'hunt003_01032203696_20251222170400.mp3',
    s3_key: 'kidsworld_007/hunt003/2025-12-22/hunt003_01032203696_20251222170400.mp3',
    user_id: 'hunt003',
    consultant_name: '박상담',
    phone_number: '01032203696',
    brand_name: 'KidsWorld',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2025-12-22',
    consultation_date: '2025-12-22',
    match_status: 'matched_by_date',
    transcript: {
      text: '안녕하세요, 고객센터입니다. 무엇을 도와드릴까요? 교환 절차가 어떻게 되는지 알고 싶어요.',
      language: 'ko',
      duration: 125.2,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '배송이 아직 안 와서 문의드립니다.' }
      ]
    },
    size: 4325376
  },
  {
    id: 'script-018',
    file_name: 'hunt004_01032341427_20251229180800.mp3',
    s3_key: 'travelease_008/hunt004/2025-12-29/hunt004_01032341427_20251229180800.mp3',
    user_id: 'hunt004',
    consultant_name: '최상담',
    phone_number: '01032341427',
    brand_name: 'TravelEase',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2025-12-29',
    consultation_date: '2025-12-29',
    match_status: 'unmatched',
    transcript: null,
    size: 1970176
  },
  {
    id: 'script-019',
    file_name: 'hunt005_01032479158_20260105191200.mp3',
    s3_key: 'techgear_009/hunt005/2026-01-05/hunt005_01032479158_20260105191200.mp3',
    user_id: 'hunt005',
    consultant_name: '정상담',
    phone_number: '01032479158',
    brand_name: 'TechGear',
    category_1: '교환/반품',
    category_2: '파손접수',
    category_3: null,
    calling_date: '2026-01-05',
    consultation_date: '2026-01-05',
    match_status: 'matched_single',
    transcript: {
      text: '배송이 아직 안 와서 문의드립니다. 회원 탈퇴는 어떻게 진행하나요.',
      language: 'ko',
      duration: 147.8,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '결제가 두 번 된 것 같아서 확인 부탁드립니다.' }
      ]
    },
    size: 3710976
  },
  {
    id: 'script-020',
    file_name: 'hunt006_01032616889_20260112201600.mp3',
    s3_key: 'greenlife_010/hunt006/2026-01-12/hunt006_01032616889_20260112201600.mp3',
    user_id: 'hunt006',
    consultant_name: '강상담',
    phone_number: '01032616889',
    brand_name: 'GreenLife',
    category_1: '배송문의',
    category_2: '주소변경',
    category_3: null,
    calling_date: '2026-01-12',
    consultation_date: '2026-01-12',
    match_status: 'matched_by_date',
    transcript: null,
    size: 1355776
  },
  {
    id: 'script-021',
    file_name: 'hunt007_01032754620_20260119212000.mp3',
    s3_key: 'udit_001/hunt007/2026-01-19/hunt007_01032754620_20260119212000.mp3',
    user_id: 'hunt007',
    consultant_name: '조상담',
    phone_number: '01032754620',
    brand_name: 'Udit',
    category_1: '결제문의',
    category_2: '환불요청',
    category_3: null,
    calling_date: '2026-01-19',
    consultation_date: '2026-01-19',
    match_status: 'unmatched',
    transcript: null,
    size: 3096576
  },
  {
    id: 'script-022',
    file_name: 'hunt008_01032892351_20260126222400.mp3',
    s3_key: 'glowup_002/hunt008/2026-01-26/hunt008_01032892351_20260126222400.mp3',
    user_id: 'hunt008',
    consultant_name: '윤상담',
    phone_number: '01032892351',
    brand_name: 'GlowUp',
    category_1: '회원정보',
    category_2: '비밀번호재설정',
    category_3: null,
    calling_date: '2026-01-26',
    consultation_date: '2026-01-26',
    match_status: 'matched_single',
    transcript: {
      text: '회원 탈퇴는 어떻게 진행하나요. 안녕하세요, 고객센터입니다. 무엇을 도와드릴까요?',
      language: 'ko',
      duration: 181.7,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '사이즈 교환 가능한지 문의드립니다.' }
      ]
    },
    size: 4837376
  },
  {
    id: 'script-023',
    file_name: 'hunt009_01033030082_20260202232800.mp3',
    s3_key: 'fitzone_003/hunt009/2026-02-02/hunt009_01033030082_20260202232800.mp3',
    user_id: 'hunt009',
    consultant_name: '장상담',
    phone_number: '01033030082',
    brand_name: 'FitZone',
    category_1: '이벤트문의',
    category_2: '기간연장',
    category_3: null,
    calling_date: '2026-02-02',
    consultation_date: '2026-02-02',
    match_status: 'matched_by_date',
    transcript: null,
    size: 2482176
  },
  {
    id: 'script-024',
    file_name: 'hunt010_01033167813_20260210003200.mp3',
    s3_key: 'beautylab_004/hunt010/2026-02-10/hunt010_01033167813_20260210003200.mp3',
    user_id: 'hunt010',
    consultant_name: '임상담',
    phone_number: '01033167813',
    brand_name: 'BeautyLab',
    category_1: '기타문의',
    category_2: '입점문의',
    category_3: null,
    calling_date: '2026-02-10',
    consultation_date: '2026-02-10',
    match_status: 'unmatched',
    transcript: {
      text: '사이즈 교환 가능한지 문의드립니다. 배송이 아직 안 와서 문의드립니다.',
      language: 'ko',
      duration: 204.3,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '네, 상품 관련해서 문의드리고 싶습니다.' }
      ]
    },
    size: 4222976
  },
  {
    id: 'script-025',
    file_name: 'hunt011_01033305544_20260217013600.mp3',
    s3_key: 'homecafe_005/hunt011/2026-02-17/hunt011_01033305544_20260217013600.mp3',
    user_id: 'hunt011',
    consultant_name: '한상담',
    phone_number: '01033305544',
    brand_name: 'HomeCafe',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2026-02-17',
    consultation_date: '2026-02-17',
    match_status: 'matched_single',
    transcript: null,
    size: 1867776
  },
  {
    id: 'script-026',
    file_name: 'hunt012_01033443275_20260224024000.mp3',
    s3_key: 'petcare_006/hunt012/2026-02-24/hunt012_01033443275_20260224024000.mp3',
    user_id: 'hunt012',
    consultant_name: '오상담',
    phone_number: '01033443275',
    brand_name: 'PetCare',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2026-02-24',
    consultation_date: '2026-02-24',
    match_status: 'matched_by_date',
    transcript: null,
    size: 3608576
  },
  {
    id: 'script-027',
    file_name: 'hunt013_01033581006_20260303034400.mp3',
    s3_key: 'kidsworld_007/hunt013/2026-03-03/hunt013_01033581006_20260303034400.mp3',
    user_id: 'hunt013',
    consultant_name: '서상담',
    phone_number: '01033581006',
    brand_name: 'KidsWorld',
    category_1: '교환/반품',
    category_2: '파손접수',
    category_3: null,
    calling_date: '2026-03-03',
    consultation_date: '2026-03-03',
    match_status: 'unmatched',
    transcript: {
      text: '배송이 아직 안 와서 문의드립니다. 회원 탈퇴는 어떻게 진행하나요.',
      language: 'ko',
      duration: 102.6,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '결제가 두 번 된 것 같아서 확인 부탁드립니다.' }
      ]
    },
    size: 1253376
  },
  {
    id: 'script-028',
    file_name: 'hunt014_01033718737_20260310044800.mp3',
    s3_key: 'travelease_008/hunt014/2026-03-10/hunt014_01033718737_20260310044800.mp3',
    user_id: 'hunt014',
    consultant_name: '권상담',
    phone_number: '01033718737',
    brand_name: 'TravelEase',
    category_1: '배송문의',
    category_2: '주소변경',
    category_3: null,
    calling_date: '2026-03-10',
    consultation_date: '2026-03-10',
    match_status: 'matched_single',
    transcript: null,
    size: 2994176
  },
  {
    id: 'script-029',
    file_name: 'hunt001_01033856468_20260317055200.mp3',
    s3_key: 'techgear_009/hunt001/2026-03-17/hunt001_01033856468_20260317055200.mp3',
    user_id: 'hunt001',
    consultant_name: '김상담',
    phone_number: '01033856468',
    brand_name: 'TechGear',
    category_1: '결제문의',
    category_2: '환불요청',
    category_3: null,
    calling_date: '2026-03-17',
    consultation_date: '2026-03-17',
    match_status: 'matched_by_date',
    transcript: {
      text: '결제가 두 번 된 것 같아서 확인 부탁드립니다. 사이즈 교환 가능한지 문의드립니다.',
      language: 'ko',
      duration: 125.2,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '이벤트 쿠폰이 적용이 안 됩니다.' }
      ]
    },
    size: 4734976
  },
  {
    id: 'script-030',
    file_name: 'hunt002_01033994199_20260324065600.mp3',
    s3_key: 'greenlife_010/hunt002/2026-03-24/hunt002_01033994199_20260324065600.mp3',
    user_id: 'hunt002',
    consultant_name: '이상담',
    phone_number: '01033994199',
    brand_name: 'GreenLife',
    category_1: '회원정보',
    category_2: '비밀번호재설정',
    category_3: null,
    calling_date: '2026-03-24',
    consultation_date: '2026-03-24',
    match_status: 'unmatched',
    transcript: null,
    size: 2379776
  },
  {
    id: 'script-031',
    file_name: 'hunt003_01034131930_20260331080000.mp3',
    s3_key: 'udit_001/hunt003/2026-03-31/hunt003_01034131930_20260331080000.mp3',
    user_id: 'hunt003',
    consultant_name: '박상담',
    phone_number: '01034131930',
    brand_name: 'Udit',
    category_1: '이벤트문의',
    category_2: '기간연장',
    category_3: null,
    calling_date: '2026-03-31',
    consultation_date: '2026-03-31',
    match_status: 'matched_single',
    transcript: null,
    size: 4120576
  },
  {
    id: 'script-032',
    file_name: 'hunt004_01034269661_20260407090400.mp3',
    s3_key: 'glowup_002/hunt004/2026-04-07/hunt004_01034269661_20260407090400.mp3',
    user_id: 'hunt004',
    consultant_name: '최상담',
    phone_number: '01034269661',
    brand_name: 'GlowUp',
    category_1: '기타문의',
    category_2: '입점문의',
    category_3: null,
    calling_date: '2026-04-07',
    consultation_date: '2026-04-07',
    match_status: 'matched_by_date',
    transcript: {
      text: '사이즈 교환 가능한지 문의드립니다. 배송이 아직 안 와서 문의드립니다.',
      language: 'ko',
      duration: 159.1,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '네, 상품 관련해서 문의드리고 싶습니다.' }
      ]
    },
    size: 1765376
  },
  {
    id: 'script-033',
    file_name: 'hunt005_01034407392_20260414100800.mp3',
    s3_key: 'fitzone_003/hunt005/2026-04-14/hunt005_01034407392_20260414100800.mp3',
    user_id: 'hunt005',
    consultant_name: '정상담',
    phone_number: '01034407392',
    brand_name: 'FitZone',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2026-04-14',
    consultation_date: '2026-04-14',
    match_status: 'unmatched',
    transcript: null,
    size: 3506176
  },
  {
    id: 'script-034',
    file_name: 'hunt006_01034545123_20260421111200.mp3',
    s3_key: 'beautylab_004/hunt006/2026-04-21/hunt006_01034545123_20260421111200.mp3',
    user_id: 'hunt006',
    consultant_name: '강상담',
    phone_number: '01034545123',
    brand_name: 'BeautyLab',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2026-04-21',
    consultation_date: '2026-04-21',
    match_status: 'matched_single',
    transcript: {
      text: '네, 상품 관련해서 문의드리고 싶습니다. 결제가 두 번 된 것 같아서 확인 부탁드립니다.',
      language: 'ko',
      duration: 181.7,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '교환 절차가 어떻게 되는지 알고 싶어요.' }
      ]
    },
    size: 1150976
  },
  {
    id: 'script-035',
    file_name: 'hunt007_01034682854_20260428121600.mp3',
    s3_key: 'homecafe_005/hunt007/2026-04-28/hunt007_01034682854_20260428121600.mp3',
    user_id: 'hunt007',
    consultant_name: '조상담',
    phone_number: '01034682854',
    brand_name: 'HomeCafe',
    category_1: '교환/반품',
    category_2: '파손접수',
    category_3: null,
    calling_date: '2026-04-28',
    consultation_date: '2026-04-28',
    match_status: 'matched_by_date',
    transcript: null,
    size: 2891776
  },
  {
    id: 'script-036',
    file_name: 'hunt008_01034820585_20260505132000.mp3',
    s3_key: 'petcare_006/hunt008/2026-05-05/hunt008_01034820585_20260505132000.mp3',
    user_id: 'hunt008',
    consultant_name: '윤상담',
    phone_number: '01034820585',
    brand_name: 'PetCare',
    category_1: '배송문의',
    category_2: '주소변경',
    category_3: null,
    calling_date: '2026-05-05',
    consultation_date: '2026-05-05',
    match_status: 'unmatched',
    transcript: null,
    size: 4632576
  },
  {
    id: 'script-037',
    file_name: 'hunt009_01034958316_20260512142400.mp3',
    s3_key: 'kidsworld_007/hunt009/2026-05-12/hunt009_01034958316_20260512142400.mp3',
    user_id: 'hunt009',
    consultant_name: '장상담',
    phone_number: '01034958316',
    brand_name: 'KidsWorld',
    category_1: '결제문의',
    category_2: '환불요청',
    category_3: null,
    calling_date: '2026-05-12',
    consultation_date: '2026-05-12',
    match_status: 'matched_single',
    transcript: {
      text: '결제가 두 번 된 것 같아서 확인 부탁드립니다. 사이즈 교환 가능한지 문의드립니다.',
      language: 'ko',
      duration: 80,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '이벤트 쿠폰이 적용이 안 됩니다.' }
      ]
    },
    size: 2277376
  },
  {
    id: 'script-038',
    file_name: 'hunt010_01035096047_20260519152800.mp3',
    s3_key: 'travelease_008/hunt010/2026-05-19/hunt010_01035096047_20260519152800.mp3',
    user_id: 'hunt010',
    consultant_name: '임상담',
    phone_number: '01035096047',
    brand_name: 'TravelEase',
    category_1: '회원정보',
    category_2: '비밀번호재설정',
    category_3: null,
    calling_date: '2026-05-19',
    consultation_date: '2026-05-19',
    match_status: 'matched_by_date',
    transcript: null,
    size: 4018176
  },
  {
    id: 'script-039',
    file_name: 'hunt011_01035233778_20260526163200.mp3',
    s3_key: 'techgear_009/hunt011/2026-05-26/hunt011_01035233778_20260526163200.mp3',
    user_id: 'hunt011',
    consultant_name: '한상담',
    phone_number: '01035233778',
    brand_name: 'TechGear',
    category_1: '이벤트문의',
    category_2: '기간연장',
    category_3: null,
    calling_date: '2026-05-26',
    consultation_date: '2026-05-26',
    match_status: 'unmatched',
    transcript: {
      text: '이벤트 쿠폰이 적용이 안 됩니다. 네, 상품 관련해서 문의드리고 싶습니다.',
      language: 'ko',
      duration: 102.6,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '안녕하세요, 고객센터입니다. 무엇을 도와드릴까요?' }
      ]
    },
    size: 1662976
  },
  {
    id: 'script-040',
    file_name: 'hunt012_01035371509_20260602173600.mp3',
    s3_key: 'greenlife_010/hunt012/2026-06-02/hunt012_01035371509_20260602173600.mp3',
    user_id: 'hunt012',
    consultant_name: '오상담',
    phone_number: '01035371509',
    brand_name: 'GreenLife',
    category_1: '기타문의',
    category_2: '입점문의',
    category_3: null,
    calling_date: '2026-06-02',
    consultation_date: '2026-06-02',
    match_status: 'matched_single',
    transcript: null,
    size: 3403776
  },
  {
    id: 'script-041',
    file_name: 'hunt013_01035509240_20260609184000.mp3',
    s3_key: 'udit_001/hunt013/2026-06-09/hunt013_01035509240_20260609184000.mp3',
    user_id: 'hunt013',
    consultant_name: '서상담',
    phone_number: '01035509240',
    brand_name: 'Udit',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2026-06-09',
    consultation_date: '2026-06-09',
    match_status: 'matched_by_date',
    transcript: null,
    size: 1048576
  },
  {
    id: 'script-042',
    file_name: 'hunt014_01035646971_20260616194400.mp3',
    s3_key: 'glowup_002/hunt014/2026-06-16/hunt014_01035646971_20260616194400.mp3',
    user_id: 'hunt014',
    consultant_name: '권상담',
    phone_number: '01035646971',
    brand_name: 'GlowUp',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2026-06-16',
    consultation_date: '2026-06-16',
    match_status: 'unmatched',
    transcript: {
      text: '네, 상품 관련해서 문의드리고 싶습니다. 결제가 두 번 된 것 같아서 확인 부탁드립니다.',
      language: 'ko',
      duration: 136.5,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '교환 절차가 어떻게 되는지 알고 싶어요.' }
      ]
    },
    size: 2789376
  },
  {
    id: 'script-043',
    file_name: 'hunt001_01035784702_20260623204800.mp3',
    s3_key: 'fitzone_003/hunt001/2026-06-23/hunt001_01035784702_20260623204800.mp3',
    user_id: 'hunt001',
    consultant_name: '김상담',
    phone_number: '01035784702',
    brand_name: 'FitZone',
    category_1: '교환/반품',
    category_2: '파손접수',
    category_3: null,
    calling_date: '2026-06-23',
    consultation_date: '2026-06-23',
    match_status: 'matched_single',
    transcript: null,
    size: 4530176
  },
  {
    id: 'script-044',
    file_name: 'hunt002_01035922433_20260630215200.mp3',
    s3_key: 'beautylab_004/hunt002/2026-06-30/hunt002_01035922433_20260630215200.mp3',
    user_id: 'hunt002',
    consultant_name: '이상담',
    phone_number: '01035922433',
    brand_name: 'BeautyLab',
    category_1: '배송문의',
    category_2: '주소변경',
    category_3: null,
    calling_date: '2026-06-30',
    consultation_date: '2026-06-30',
    match_status: 'matched_by_date',
    transcript: {
      text: '교환 절차가 어떻게 되는지 알고 싶어요. 이벤트 쿠폰이 적용이 안 됩니다.',
      language: 'ko',
      duration: 159.1,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8, end: 14.5, text: '회원 탈퇴는 어떻게 진행하나요.' }
      ]
    },
    size: 2174976
  },
  {
    id: 'script-045',
    file_name: 'hunt003_01036060164_20260707225600.mp3',
    s3_key: 'homecafe_005/hunt003/2026-07-07/hunt003_01036060164_20260707225600.mp3',
    user_id: 'hunt003',
    consultant_name: '박상담',
    phone_number: '01036060164',
    brand_name: 'HomeCafe',
    category_1: '결제문의',
    category_2: '환불요청',
    category_3: null,
    calling_date: '2026-07-07',
    consultation_date: '2026-07-07',
    match_status: 'unmatched',
    transcript: null,
    size: 3915776
  },
  {
    id: 'script-046',
    file_name: 'hunt004_01036197895_20260715000000.mp3',
    s3_key: 'petcare_006/hunt004/2026-07-15/hunt004_01036197895_20260715000000.mp3',
    user_id: 'hunt004',
    consultant_name: '최상담',
    phone_number: '01036197895',
    brand_name: 'PetCare',
    category_1: '회원정보',
    category_2: '비밀번호재설정',
    category_3: null,
    calling_date: '2026-07-15',
    consultation_date: '2026-07-15',
    match_status: 'matched_single',
    transcript: null,
    size: 1560576
  }
]

// 목 제품 데이터 (10개 브랜드)
const MOCK_PRODUCTS = [
  {
    product_id: 'udit_001',
    name: 'Udit'
  },
  {
    product_id: 'glowup_002',
    name: 'GlowUp'
  },
  {
    product_id: 'fitzone_003',
    name: 'FitZone'
  },
  {
    product_id: 'beautylab_004',
    name: 'BeautyLab'
  },
  {
    product_id: 'homecafe_005',
    name: 'HomeCafe'
  },
  {
    product_id: 'petcare_006',
    name: 'PetCare'
  },
  {
    product_id: 'kidsworld_007',
    name: 'KidsWorld'
  },
  {
    product_id: 'travelease_008',
    name: 'TravelEase'
  },
  {
    product_id: 'techgear_009',
    name: 'TechGear'
  },
  {
    product_id: 'greenlife_010',
    name: 'GreenLife'
  }
]

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 로그인
 */
export async function login(email, password) {
  await delay(500)
  const user = MOCK_USERS.find(u => u.email === email)
  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
  }
  // 포트폴리오 데모: 비밀번호는 'demo1234'로 고정
  if (password !== 'demo1234' && password !== 'admin123') {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
  }
  return {
    access_token: 'mock-jwt-token-' + Date.now(),
    token_type: 'bearer',
    user
  }
}

/**
 * 스크립트 목록 조회
 */
export async function fetchScripts(filters = {}) {
  await delay()
  let data = [...MOCK_SCRIPTS]

  if (filters.s3_id) {
    data = data.filter(s => s.s3_key.startsWith(filters.s3_id.replace('-', '_')))
  }
  if (filters.user_id) {
    data = data.filter(s => s.user_id === filters.user_id)
  }
  if (filters.file_name) {
    data = data.filter(s => s.file_name.includes(filters.file_name))
  }
  if (filters.date_from) {
    data = data.filter(s => s.calling_date >= filters.date_from)
  }
  if (filters.date_to) {
    data = data.filter(s => s.calling_date <= filters.date_to)
  }

  return { success: true, data, count: data.length }
}

/**
 * Presigned URL 생성 (목 - 오디오 플레이어 샘플 URL)
 */
export async function getPresignedUrl(s3_key) {
  await delay(200)
  // 데모용 샘플 MP3
  return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
}

/**
 * 제품 목록 조회
 */
export async function fetchProducts() {
  await delay()
  return MOCK_PRODUCTS.map(p => ({ id: p.product_id, name: p.name }))
}

/**
 * 스크립트 기반 사용자 목록
 */
export async function fetchUsers() {
  await delay()
  const userMap = new Map()
  MOCK_SCRIPTS.forEach(script => {
    if (script.user_id && !userMap.has(script.user_id)) {
      userMap.set(script.user_id, {
        id: script.user_id,
        name: script.consultant_name,
        phone: script.phone_number
      })
    }
  })
  return Array.from(userMap.values())
}

/**
 * 전체 사용자 목록 (users 테이블)
 */
export async function fetchAllUsers() {
  await delay()
  return MOCK_USERS
}

/**
 * 제품별 파일 목록
 */
export async function fetchFilesByProduct(productId) {
  await delay()
  const data = MOCK_SCRIPTS.filter(s => s.s3_key.includes(productId.replace('-', '_')))
  return data.map(script => ({
    id: script.id,
    name: script.file_name,
    s3_key: script.s3_key,
    size: script.size || 0,
    uploadDate: script.calling_date,
    consultant: script.consultant_name,
    brand: script.brand_name,
    categories: {
      category1: script.category_1,
      category2: script.category_2,
      category3: script.category_3
    },
    phoneNumber: script.phone_number,
    consultationDate: script.consultation_date,
    matchStatus: script.match_status,
    transcript: script.transcript || null,
    thumbnail_url: `https://picsum.photos/seed/${script.id}/400/400`
  }))
}

/**
 * 사용자 추가
 */
export async function addUser(user) {
  await delay(400)
  const newUser = {
    id: MOCK_USERS.length + 1,
    ...user,
    created_at: new Date().toISOString()
  }
  MOCK_USERS.push(newUser)
  return { success: true, data: newUser }
}

/**
 * 사용자 수정
 */
export async function updateUser(userId, updates) {
  await delay(400)
  const idx = MOCK_USERS.findIndex(u => u.id === userId || u.email === userId)
  if (idx === -1) throw new Error('사용자를 찾을 수 없습니다')
  MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...updates }
  return { success: true, data: MOCK_USERS[idx] }
}

/**
 * 비밀번호 변경
 */
export async function changePassword(userId, newPassword) {
  await delay(400)
  return { success: true, msg: '비밀번호가 변경되었습니다' }
}

/**
 * 사용자 삭제
 */
export async function deleteUser(userId) {
  await delay(400)
  const idx = MOCK_USERS.findIndex(u => u.id === userId || u.email === userId)
  if (idx !== -1) MOCK_USERS.splice(idx, 1)
  return { success: true, msg: '사용자가 삭제되었습니다' }
}

/**
 * 파일 업로드 미리보기 (목)
 */
export async function previewUpload(formData) {
  await delay(800)
  // 목 미리보기 결과 반환
  return [
    {
      filename: 'hunt001_01034370233_20250301121524.mp3',
      phone: '01034370233',
      file_date: '20250301',
      brand_name: 'Udit',
      consultant_name: '김상담',
      calling_date: '2026-01-01',
      match_status: 'matched_single',
      s3_path: 'udit_001/hunt001/2026-01-01/hunt001_01034370233_20250301121524.mp3',
      s3_path_korean: 'Udit/김상담/2026-01-01/hunt001_01034370233_20250301121524.mp3',
      is_duplicate: false
    },
    {
      filename: 'hunt002_01045678901_20250301093045.mp3',
      phone: '01045678901',
      file_date: '20250301',
      brand_name: 'Udit',
      consultant_name: '이상담',
      calling_date: '2026-01-01',
      match_status: 'matched_by_date',
      s3_path: 'udit_001/hunt002/2026-01-01/hunt002_01045678901_20250301093045.mp3',
      s3_path_korean: 'Udit/이상담/2026-01-01/hunt002_01045678901_20250301093045.mp3',
      is_duplicate: false
    }
  ]
}

/**
 * 파일 업로드 확인 (목)
 */
export async function confirmUpload(previewResults) {
  await delay(1000)
  return previewResults.map(r => ({
    ...r,
    status: 'success',
    message: 'S3 업로드 완료'
  }))
}

/**
 * 스크립트 삭제
 */
export async function deleteScript(scriptId) {
  await delay(400)
  return { success: true, msg: '파일이 삭제되었습니다' }
}

/**
 * 전체 파일 개수
 */
export async function getTotalCount() {
  await delay(200)
  return MOCK_SCRIPTS.length
}

/**
 * 스크립트 추출
 */
export async function extractTranscript(scriptId) {
  await delay(1500)
  const script = MOCK_SCRIPTS.find(s => s.id === scriptId)
  if (script && script.transcript) {
    return { already_extracted: true, transcript: script.transcript }
  }
  const mockTranscript = {
    text: '안녕하세요, 고객센터입니다. 무엇을 도와드릴까요? 네, 상품 관련해서 문의드리고 싶습니다.',
    language: 'ko',
    duration: 98.3,
    segments: [
      { id: 1, start: 0, end: 3.5, text: '안녕하세요, 고객센터입니다.' },
      { id: 2, start: 3.8, end: 7.2, text: '무엇을 도와드릴까요?' },
      { id: 3, start: 9.0, end: 16.5, text: '네, 상품 관련해서 문의드리고 싶습니다.' }
    ]
  }
  if (script) {
    script.transcript = mockTranscript
  }
  return { already_extracted: false, transcript: mockTranscript }
}

/**
 * 스크립트 조회
 */
export async function getTranscript(scriptId) {
  await delay(300)
  const script = MOCK_SCRIPTS.find(s => s.id === scriptId)
  return script?.transcript || null
}

/**
 * 스크립트 수정
 */
export async function updateTranscript(scriptId, transcript) {
  await delay(400)
  const script = MOCK_SCRIPTS.find(s => s.id === scriptId)
  if (script) script.transcript = transcript
  return { success: true, msg: '스크립트가 수정되었습니다' }
}

/**
 * 스크립트 삭제
 */
export async function deleteTranscript(scriptId) {
  await delay(400)
  const script = MOCK_SCRIPTS.find(s => s.id === scriptId)
  if (script) script.transcript = null
  return { success: true, msg: '스크립트가 삭제되었습니다' }
}

export default {
  login,
  fetchScripts,
  getPresignedUrl,
  fetchProducts,
  fetchUsers,
  fetchAllUsers,
  fetchFilesByProduct,
  addUser,
  updateUser,
  changePassword,
  deleteUser,
  previewUpload,
  confirmUpload,
  deleteScript,
  getTotalCount,
  extractTranscript,
  getTranscript,
  updateTranscript,
  deleteTranscript
}
