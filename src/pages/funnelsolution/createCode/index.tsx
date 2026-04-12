import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import TitleBox from '../shared/TitleBox'
import CustomDropdown from './components/CustomDropdown'
import EditableDropdown from './components/EditableDropdown/EditableDropdown'
import AdTitlePreview from './components/AdTitlePreview/AdTitlePreview'
import {
  getCreateCodeOptions,
  getRecentCodes,
  createCode,
} from '@/data/funnelsolution/mockService'
import type { CreatedCode } from '@/data/funnelsolution/mockService'

interface Options {
  region: { value: number; label: string }[]
  content_type: { value: number; label: string }[]
  marketer: { value: number; label: string }[]
  creator: { value: number; label: string }[]
  domain: { value: number; label: string }[]
}

const CreateCodePage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [hospitals, setHospitals] = useState<{ value: number; label: string; code: string }[]>([])
  const [events, setEvents] = useState<{ value: number; label: string }[]>([])
  const [companies, setCompanies] = useState<{ value: number; label: string }[]>([])
  const [options, setOptions] = useState<Options>({
    region: [], content_type: [], marketer: [], creator: [], domain: [],
  })
  const [adTitle, setAdTitle] = useState('')
  const [eventResetKey, setEventResetKey] = useState(0)
  const [lastGenerated, setLastGenerated] = useState<CreatedCode | null>(null)
  const [recentCodes, setRecentCodes] = useState<CreatedCode[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  const initialFormData = useMemo(() => ({
    ad_title: '',
    ad_number: '',
    hospital_name_id: '' as number | string,
    event_name_id: [] as number[],
    advertising_company_id: '' as number | string,
    url_code: '',
    region: '' as number | string,
    content_type: '' as number | string,
    marketer: '' as number | string,
    creator: '' as number | string,
    domain: '' as number | string,
    notes: '',
    source_link: '',
  }), [])

  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    const data = getCreateCodeOptions()
    setHospitals(data.hospitals)
    setEvents(data.events)
    setCompanies(data.advertisingCompanies)
    setOptions({
      region: data.regions,
      content_type: data.contentTypes,
      marketer: data.usersWithInitial,
      creator: data.usersWithInitial,
      domain: data.domains,
    })
    setRecentCodes(getRecentCodes(5))
  }, [])

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleDropdownChange = useCallback((name: string, value: number | string | number[]) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleOptionsChange = useCallback((type: string, updated: { value: number; label: string }[]) => {
    setOptions(prev => ({ ...prev, [type]: updated }))
  }, [])

  const generateRandomCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }, [])

  const handleSubmit = useCallback(() => {
    if (!adTitle) { alert('광고제목은 필수 항목입니다.'); return }
    const required = [
      { key: 'hospital_name_id', label: '병원명' },
      { key: 'advertising_company_id', label: '매체' },
      { key: 'ad_number', label: '랜딩번호' },
      { key: 'event_name_id', label: '이벤트명' },
      { key: 'marketer', label: '마케터' },
      { key: 'domain', label: '도메인' },
    ]
    for (const { key, label } of required) {
      const val = formData[key as keyof typeof formData]
      const isEmpty = Array.isArray(val) ? val.length === 0 : !val
      if (isEmpty) { alert(`${label}은(는) 필수 항목입니다.`); return }
    }

    setIsLoading(true)
    setErrorMessage('')
    try {
      const urlCode = generateRandomCode()
      const result = createCode({
        ...formData,
        ad_title: adTitle,
        url_code: urlCode,
        hospital_name_id: formData.hospital_name_id,
        event_name_id: formData.event_name_id as number[],
        advertising_company_id: formData.advertising_company_id,
      })
      setLastGenerated(result)
      setRecentCodes(getRecentCodes(5))
      setFormData(initialFormData)
      setAdTitle('')
      setEventResetKey(k => k + 1)
    } catch {
      setErrorMessage('코드 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [formData, adTitle, generateRandomCode, initialFormData])

  const selectedMediaLabel = useMemo(() => {
    const found = companies.find(c => String(c.value) === String(formData.advertising_company_id))
    return found ? found.label : ''
  }, [companies, formData.advertising_company_id])

  const selectedCreatorLabel = useMemo(() => {
    const found = options.creator.find(c => String(c.value) === String(formData.creator))
    if (!found) return ''
    const match = found.label.match(/\(([^)]+)\)$/)
    return match ? match[1] : found.label
  }, [options.creator, formData.creator])

  const selectedRegionLabel = useMemo(() => {
    const found = options.region.find(r => String(r.value) === String(formData.region))
    return found ? found.label : ''
  }, [options.region, formData.region])

  const [hoveredRecent, setHoveredRecent] = useState<number | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLoadRecent = useCallback((item: CreatedCode) => {
    setFormData({
      ad_title: item.ad_title,
      ad_number: item.ad_number,
      hospital_name_id: item.hospital_name_id,
      event_name_id: item.event_name_id,
      advertising_company_id: item.advertising_company_id,
      url_code: '',
      region: item.region,
      content_type: item.content_type,
      marketer: item.marketer,
      creator: item.creator,
      domain: item.domain,
      notes: item.notes,
      source_link: item.source_link,
    })
    setEventResetKey(k => k + 1)
  }, [])

  return (
    <div style={{ padding: '24px', background: '#fff', minHeight: '100vh' }}>
      <TitleBox mainmenu="코드 생성" />

      {/* Form card */}
      <div style={{
        background: '#f9fafb', borderRadius: '12px', padding: '24px',
        marginBottom: '24px', border: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {/* 병원명 */}
          <div>
            <label style={labelStyle}>병원명 <span style={{ color: '#ef4444' }}>*</span></label>
            <CustomDropdown
              key={`hospital-${formData.hospital_name_id || '__empty__'}`}
              options={hospitals}
              selectedValue={formData.hospital_name_id}
              onChange={v => handleDropdownChange('hospital_name_id', v)}
              placeholder="병원 선택"
              search
            />
          </div>
          {/* 매체 */}
          <div>
            <label style={labelStyle}>매체 <span style={{ color: '#ef4444' }}>*</span></label>
            <CustomDropdown
              key={`company-${formData.advertising_company_id || '__empty__'}`}
              options={companies}
              selectedValue={formData.advertising_company_id}
              onChange={v => handleDropdownChange('advertising_company_id', v)}
              placeholder="매체 선택"
              search
            />
          </div>
          {/* 랜딩번호 */}
          <div>
            <label style={labelStyle}>랜딩번호 <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              name="ad_number"
              value={formData.ad_number}
              onChange={handleFormChange}
              placeholder="랜딩번호"
              style={inputStyle}
            />
          </div>
          {/* 이벤트명 */}
          <div>
            <label style={labelStyle}>이벤트명 <span style={{ color: '#ef4444' }}>*</span></label>
            <CustomDropdown
              key={`event-${eventResetKey}`}
              options={events}
              selectedValue={formData.event_name_id}
              onChange={v => handleDropdownChange('event_name_id', v)}
              placeholder="이벤트 선택"
              search
              optionChecked
            />
          </div>
          {/* 마케터 */}
          <div>
            <label style={labelStyle}>마케터 <span style={{ color: '#ef4444' }}>*</span></label>
            <CustomDropdown
              options={options.marketer}
              selectedValue={formData.marketer}
              onChange={v => handleDropdownChange('marketer', v)}
              placeholder="마케터 선택"
            />
          </div>
          {/* 도메인 */}
          <div>
            <label style={labelStyle}>도메인 <span style={{ color: '#ef4444' }}>*</span></label>
            <EditableDropdown
              options={options.domain}
              selectedValue={formData.domain}
              onChange={v => handleDropdownChange('domain', v)}
              placeholder="도메인 선택"
              onOptionsChange={updated => handleOptionsChange('domain', updated as { value: number; label: string }[])}
            />
          </div>
          {/* 지역 */}
          <div>
            <label style={labelStyle}>지역</label>
            <EditableDropdown
              options={options.region}
              selectedValue={formData.region}
              onChange={v => handleDropdownChange('region', v)}
              placeholder="지역 선택"
              onOptionsChange={updated => handleOptionsChange('region', updated as { value: number; label: string }[])}
            />
          </div>
          {/* 콘텐츠타입 */}
          <div>
            <label style={labelStyle}>콘텐츠타입</label>
            <EditableDropdown
              options={options.content_type}
              selectedValue={formData.content_type}
              onChange={v => handleDropdownChange('content_type', v)}
              placeholder="콘텐츠타입 선택"
              onOptionsChange={updated => handleOptionsChange('content_type', updated as { value: number; label: string }[])}
            />
          </div>
          {/* 특이사항 */}
          <div>
            <label style={labelStyle}>특이사항</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="특이사항"
              style={inputStyle}
            />
          </div>
          {/* 제작자 */}
          <div>
            <label style={labelStyle}>제작자</label>
            <CustomDropdown
              options={options.creator}
              selectedValue={formData.creator}
              onChange={v => handleDropdownChange('creator', v)}
              placeholder="제작자 선택"
            />
          </div>
          {/* 시안소스링크 */}
          <div>
            <label style={labelStyle}>시안소스링크</label>
            <input
              type="text"
              name="source_link"
              value={formData.source_link}
              onChange={handleFormChange}
              placeholder="시안소스링크"
              style={inputStyle}
            />
          </div>
        </div>

        <AdTitlePreview
          adNumber={formData.ad_number}
          mediaName={selectedMediaLabel}
          notes={formData.notes}
          creatorName={selectedCreatorLabel}
          regionName={selectedRegionLabel}
          onTitleChange={setAdTitle}
        />

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: '12px 40px', borderRadius: '8px', border: 'none',
              background: isLoading ? '#9ca3af' : '#3b82f6', color: '#fff',
              cursor: isLoading ? 'default' : 'pointer', fontSize: '15px', fontWeight: 600,
            }}
          >
            {isLoading ? '처리 중...' : '코드 생성하기'}
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div style={{
          padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '16px',
        }}>
          {errorMessage}
        </div>
      )}

      {/* Generated result */}
      {lastGenerated && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
          padding: '20px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#15803d' }}>코드 생성 완료</span>
            <span style={{
              background: '#22c55e', color: '#fff', borderRadius: '50%',
              width: '20px', height: '20px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px',
            }}>✓</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ResultRow label="광고제목" value={lastGenerated.ad_title} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>랜딩주소</span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', flex: 1, color: '#111827' }}>
                {lastGenerated.landing_url}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(lastGenerated.landing_url)}
                style={copyBtnStyle}
              >
                복사
              </button>
            </div>
            {lastGenerated.source_link && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>시안주소</span>
                <a
                  href={lastGenerated.source_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12px', color: '#3b82f6', flex: 1 }}
                >
                  {lastGenerated.source_link}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent codes */}
      {recentCodes.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>최근 생성 코드</span>
            <span style={{
              background: '#e5e7eb', borderRadius: '12px', padding: '2px 8px',
              fontSize: '12px', color: '#6b7280',
            }}>
              {recentCodes.length}개
            </span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px',
          }}>
            {recentCodes.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleLoadRecent(item)}
                onMouseEnter={() => {
                  hoverTimer.current = setTimeout(() => setHoveredRecent(idx), 200)
                }}
                onMouseLeave={() => {
                  if (hoverTimer.current) clearTimeout(hoverTimer.current)
                  setHoveredRecent(null)
                }}
                style={{
                  background: hoveredRecent === idx ? '#f0f9ff' : '#fff',
                  border: '1px solid #e5e7eb', borderRadius: '10px',
                  padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  {item.ad_title || '-'}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {item.landing_url}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(item.created_at).toLocaleString('ko-KR')}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.landing_url)}
                      style={copyBtnStyle}
                    >
                      복사
                    </button>
                    <button
                      onClick={() => handleLoadRecent(item)}
                      style={{ ...copyBtnStyle, background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' }}
                    >
                      불러오기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ResultRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#111827', flex: 1 }}>{value || '-'}</span>
  </div>
)

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  color: '#374151', marginBottom: '6px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px',
  border: '1px solid #d1d5db', fontSize: '13px', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}
const copyBtnStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: '4px', border: '1px solid #d1d5db',
  background: '#fff', color: '#374151', cursor: 'pointer', fontSize: '11px',
}

export default CreateCodePage
