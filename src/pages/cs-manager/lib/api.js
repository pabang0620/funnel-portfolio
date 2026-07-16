/**
 * Mock API 클라이언트 (포트폴리오용)
 * 실제 백엔드 호출 대신 목 데이터 반환
 */

// 목 사용자 데이터
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
    team: '상담팀B',
    status: 'pending',
    admin: false,
    created_at: '2026-01-01T00:00:00Z'
  }
]

// 목 스크립트 데이터
const MOCK_SCRIPTS = [
  {
    id: 'script-001',
    file_name: 'hunt001_01034370233_20250201121524.mp3',
    s3_key: 'udit_001/hunt001/2026-01-01/hunt001_01034370233_20250201121524.mp3',
    user_id: 'hunt001',
    consultant_name: '김상담',
    phone_number: '01034370233',
    brand_name: 'Udit',
    category_1: '상품문의',
    category_2: '가격문의',
    category_3: null,
    calling_date: '2026-01-01',
    consultation_date: '2026-01-01',
    match_status: 'matched_single',
    transcript: null,
    size: 2048000
  },
  {
    id: 'script-002',
    file_name: 'hunt001_01045678901_20250202093045.mp3',
    s3_key: 'udit_001/hunt001/2026-01-01/hunt001_01045678901_20250202093045.mp3',
    user_id: 'hunt001',
    consultant_name: '김상담',
    phone_number: '01045678901',
    brand_name: 'Udit',
    category_1: '불만접수',
    category_2: '배송지연',
    category_3: null,
    calling_date: '2026-01-01',
    consultation_date: '2026-01-01',
    match_status: 'matched_by_date',
    transcript: {
      text: '안녕하세요, Udit 고객센터입니다. 무엇을 도와드릴까요?',
      language: 'ko',
      duration: 125.4,
      segments: [
        { id: 1, start: 0, end: 3.2, text: '안녕하세요, Udit 고객센터입니다.' },
        { id: 2, start: 3.5, end: 6.1, text: '무엇을 도와드릴까요?' },
        { id: 3, start: 8.0, end: 14.5, text: '배송이 아직 안 와서 문의드립니다.' }
      ]
    },
    size: 3145728
  },
  {
    id: 'script-003',
    file_name: 'hunt002_01056789012_20250203141230.mp3',
    s3_key: 'udit_001/hunt002/2026-01-01/hunt002_01056789012_20250203141230.mp3',
    user_id: 'hunt002',
    consultant_name: '이상담',
    phone_number: '01056789012',
    brand_name: 'Udit',
    category_1: '상품문의',
    category_2: '사이즈문의',
    category_3: null,
    calling_date: '2026-01-01',
    consultation_date: '2026-01-01',
    match_status: 'matched_single',
    transcript: null,
    size: 1572864
  },
  {
    id: 'script-004',
    file_name: 'hunt002_01067890123_20250204100000.mp3',
    s3_key: 'udit_001/hunt002/2026-01-01/hunt002_01067890123_20250204100000.mp3',
    user_id: 'hunt002',
    consultant_name: '이상담',
    phone_number: '01067890123',
    brand_name: 'Udit',
    category_1: '교환/반품',
    category_2: '색상불량',
    category_3: null,
    calling_date: '2026-01-01',
    consultation_date: '2026-01-01',
    match_status: 'unmatched',
    transcript: null,
    size: 4194304
  }
]

// 목 제품 데이터
const MOCK_PRODUCTS = [
  {
    product_id: 'udit_001',
    name: 'Udit'
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
