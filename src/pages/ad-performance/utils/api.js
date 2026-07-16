/**
 * API 호출 유틸리티 함수
 * 토큰 만료 시 자동으로 로그인 페이지로 리다이렉트
 */

import { getToken, removeToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * 인증이 필요한 API 호출을 수행합니다
 * 토큰이 만료되면 자동으로 로그인 페이지로 리다이렉트합니다
 *
 * @param {string} endpoint - API 엔드포인트 (예: '/api/users')
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Response>} fetch 응답
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();

  // 헤더 설정
  // FormData를 사용할 때는 Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 토큰 만료 및 인증 실패 체크
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));

      const message = data.message ? data.message.toLowerCase() : '';

      // 토큰 만료, 인증 거부, 토큰 없음 등의 메시지 체크
      if (
        message.includes('token has expired') ||
        message.includes('access denied') ||
        message.includes('no token provided')
      ) {
        // 토큰 제거
        removeToken();

        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';

        // 에러를 throw하여 후속 처리 방지
        throw new Error('Authentication failed. Redirecting to login...');
      }
    }

    return response;
  } catch (error) {
    // 네트워크 에러나 기타 에러
    throw error;
  }
};

/**
 * GET 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 추가 fetch 옵션
 * @returns {Promise<any>} JSON 응답 데이터
 */
export const apiGet = async (endpoint, options = {}) => {
  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed with status ${response.status}`);
  }

  return await response.json();
};

/**
 * POST 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 바디 데이터
 * @param {Object} options - 추가 fetch 옵션
 * @returns {Promise<any>} JSON 응답 데이터
 */
export const apiPost = async (endpoint, data, options = {}) => {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed with status ${response.status}`);
  }

  return await response.json();
};

/**
 * PUT 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 바디 데이터
 * @param {Object} options - 추가 fetch 옵션
 * @returns {Promise<any>} JSON 응답 데이터
 */
export const apiPut = async (endpoint, data, options = {}) => {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`PUT ${endpoint} failed with status ${response.status}`);
  }

  return await response.json();
};

/**
 * DELETE 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 추가 fetch 옵션
 * @returns {Promise<any>} JSON 응답 데이터
 */
export const apiDelete = async (endpoint, options = {}) => {
  const response = await fetchWithAuth(endpoint, {
    method: 'DELETE',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`DELETE ${endpoint} failed with status ${response.status}`);
  }

  return await response.json();
};
