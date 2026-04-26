/**
 * Tailwind CSS 클래스 병합 유틸리티
 * clsx와 tailwind-merge를 조합하여 충돌하는 Tailwind 클래스를 올바르게 병합
 * shadcn/ui 컴포넌트 시스템에서 조건부 스타일링을 위해 사용
 */
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스를 병합하는 함수
 * @param  {...any} inputs - 병합할 클래스명들 (문자열, 객체, 배열 등)
 * @returns {string} - 충돌 해결된 최종 클래스명 문자열
 * 
 * 사용 예시:
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * cn('px-4', 'px-6') // 'px-6'만 남음 (tailwind-merge가 충돌 해결)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
