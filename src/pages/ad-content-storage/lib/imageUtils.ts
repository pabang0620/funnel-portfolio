/**
 * HEIC 이미지를 JPEG로 변환합니다.
 * HEIC가 아닌 경우 원본 URL을 그대로 반환합니다.
 * 포트폴리오 환경에서는 heic2any 없이 원본 URL을 반환합니다.
 */
export async function convertHeicIfNeeded(url: string | null): Promise<string> {
  if (!url) return ''

  const urlLower = url.toLowerCase()
  const isHeic = urlLower.includes('.heic') || urlLower.includes('.heif')

  if (!isHeic) {
    return url
  }

  // 포트폴리오 환경: 변환 없이 원본 URL 반환
  return url
}
