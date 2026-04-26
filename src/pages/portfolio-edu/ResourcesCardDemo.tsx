import { FileText, User, Calendar } from 'lucide-react'

interface Sample {
  id: string
  title: string
  type: '공지' | '가이드' | '자료'
  author: string
  date: string
  hasImage: boolean
}

const SAMPLES: Sample[] = [
  { id: '1', title: '개인정보보호 및 보안 교육', type: '공지', author: '김민준', date: '2026-03-10', hasImage: true },
  { id: '2', title: '디지털 마케팅 트렌드 2026', type: '가이드', author: '이서연', date: '2026-03-15', hasImage: false },
  { id: '3', title: '신입사원 온보딩 체크리스트', type: '자료', author: '박지훈', date: '2026-04-01', hasImage: true },
  { id: '4', title: 'AI 기초 개념 정리 — 머신러닝과 딥러닝', type: '가이드', author: '정유진', date: '2026-02-20', hasImage: false },
  { id: '5', title: 'Portfolio Edu 교육자료실 사용 가이드', type: '공지', author: '최승호', date: '2026-04-05', hasImage: true },
  { id: '6', title: '2026년 상반기 회사 방침 안내', type: '공지', author: '한예림', date: '2026-01-08', hasImage: false },
]

const TYPE_COLOR = {
  '공지': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    accent: 'from-red-400 to-rose-500',
  },
  '가이드': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    accent: 'from-blue-400 to-indigo-500',
  },
  '자료': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    accent: 'from-emerald-400 to-teal-500',
  },
} as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

// ---------- Variant A: 매거진 스타일 ----------
function VariantACard({ item }: { item: Sample }) {
  const colors = TYPE_COLOR[item.type]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 cursor-pointer transition-all">
      {item.hasImage ? (
        <div className="w-full h-40 bg-gray-100 overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-br ${colors.accent} opacity-60`} />
        </div>
      ) : (
        <div className={`w-full h-40 bg-gradient-to-br ${colors.accent} flex items-center justify-center`}>
          <FileText className="w-12 h-12 text-white/70" />
        </div>
      )}
      <div className="p-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${colors.badge}`}>
          {item.type}
        </span>
        <p className="font-bold text-base text-gray-900 mb-3 line-clamp-2 leading-snug">{item.title}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-700">{item.author}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span>{formatDate(item.date)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------- Variant B: 가로형 리스트 카드 ----------
function VariantBCard({ item }: { item: Sample }) {
  const colors = TYPE_COLOR[item.type]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex items-stretch">
      {item.hasImage ? (
        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-br ${colors.accent} opacity-60`} />
        </div>
      ) : (
        <div className={`w-24 h-24 flex-shrink-0 bg-gradient-to-br ${colors.accent} flex items-center justify-center`}>
          <FileText className="w-8 h-8 text-white/70" />
        </div>
      )}
      <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center gap-1.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${colors.badge}`}>
          {item.type}
        </span>
        <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">{item.title}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-700">{item.author}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span>{formatDate(item.date)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------- Variant C: 타일 강조 카드 ----------
function VariantCCard({ item }: { item: Sample }) {
  const colors = TYPE_COLOR[item.type]
  const initials = item.author.slice(0, 1)
  return (
    <div className={`rounded-xl ${colors.bg} shadow-sm cursor-pointer hover:shadow-md transition-all p-5 flex flex-col min-h-[140px]`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
          {item.type}
        </span>
      </div>
      <p className={`font-bold text-lg leading-snug ${colors.text} flex-1 line-clamp-2`}>{item.title}</p>
      <div className="flex items-center gap-2.5 mt-4">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colors.accent} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{item.author}</span>
        <span className="text-xs text-gray-400 ml-auto">{formatDate(item.date)}</span>
      </div>
    </div>
  )
}

export default function ResourcesCardDemo() {
  return (
    <div className="px-8 py-8 min-h-full">
      <div className="max-w-5xl mx-auto space-y-14">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">교육자료실 카드 디자인 시안</h1>
          <p className="text-sm text-gray-500 mt-1">3가지 레이아웃 스타일 비교 — 동일한 샘플 데이터로 각 variant를 확인하세요.</p>
        </div>

        {/* Variant A */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant A — 매거진 스타일</h2>
            <p className="text-sm text-gray-500 mt-0.5">이미지/그라디언트 헤더가 있는 카드. 시각적 임팩트가 강하고 현대적인 느낌.</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {SAMPLES.map(item => (
              <VariantACard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Variant B */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant B — 가로형 리스트 카드</h2>
            <p className="text-sm text-gray-500 mt-0.5">왼쪽 썸네일 + 오른쪽 텍스트 구조. 많은 자료를 한눈에 파악하기 유리함.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {SAMPLES.map(item => (
              <VariantBCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Variant C */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant C — 타일 강조 카드</h2>
            <p className="text-sm text-gray-500 mt-0.5">종류별 배경색으로 카테고리가 즉시 구분됨. 텍스트 중심의 심플한 구성.</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {SAMPLES.map(item => (
              <VariantCCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
