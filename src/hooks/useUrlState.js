import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo, useRef } from "react";

/**
 * URL 쿼리 파라미터와 동기화되는 상태 관리 훅
 * 새로고침해도 필터/페이지네이션 값이 유지됨
 *
 * @param {string} key - 쿼리 파라미터 키
 * @param {any} defaultValue - 기본값
 * @param {Object} options - { parse, serialize } 변환 함수
 * @returns {[value, setValue]} - useState와 동일한 인터페이스
 *
 * @example
 * const [page, setPage] = useUrlState("page", 1, { parse: Number });
 * const [filter, setFilter] = useUrlState("status", undefined);
 */
export function useUrlState(key, defaultValue, options = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // parse/serialize 함수를 ref로 안정화
  const parseRef = useRef(options.parse || ((v) => v));
  const serializeRef = useRef(options.serialize || ((v) => String(v)));
  parseRef.current = options.parse || ((v) => v);
  serializeRef.current = options.serialize || ((v) => String(v));

  // 배열 안정화를 위한 캐시 (UNINITIALIZED로 초기 상태 구분)
  const UNINITIALIZED = useRef(Symbol("uninitialized"));
  const cacheRef = useRef({ param: UNINITIALIZED.current, value: null });

  // URL에서 값 읽기
  const value = useMemo(() => {
    const param = searchParams.get(key);

    // 배열인 경우 동일한 param이면 캐시된 값 반환 (초기 상태 제외)
    if (
      Array.isArray(defaultValue) &&
      cacheRef.current.param !== UNINITIALIZED.current &&
      param === cacheRef.current.param
    ) {
      return cacheRef.current.value;
    }

    let result;
    if (param === null || param === "") {
      result = defaultValue;
    } else {
      result = parseRef.current(param);
    }

    // 배열인 경우 캐시 업데이트
    if (Array.isArray(defaultValue)) {
      cacheRef.current = { param, value: result };
    }

    return result;
  }, [searchParams, key, defaultValue]);

  // URL에 값 쓰기
  const setValue = useCallback(
    (newValue) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          // undefined/null이면 URL에서 삭제
          if (newValue === undefined || newValue === null) {
            next.delete(key);
            return next;
          }

          // 기본값이면 URL에서 삭제
          const isDefault = Array.isArray(defaultValue)
            ? JSON.stringify(newValue) === JSON.stringify(defaultValue)
            : newValue === defaultValue;

          if (isDefault) {
            next.delete(key);
            return next;
          }

          // 값 직렬화 후 설정
          const serialized = serializeRef.current(newValue);
          if (
            serialized === "" ||
            serialized === "undefined" ||
            serialized === "null"
          ) {
            next.delete(key);
          } else {
            next.set(key, serialized);
          }
          return next;
        },
        { replace: true }
      );
    },
    [key, defaultValue, setSearchParams]
  );

  return [value, setValue];
}

/**
 * 여러 URL 파라미터를 한번에 업데이트하는 훅
 * 연속된 setSearchParams 호출 시 발생하는 batching 문제 해결
 *
 * @returns {{ updateParams, resetParams }}
 *
 * @example
 * const { updateParams, resetParams } = useUrlParams();
 * // 한번에 여러 파라미터 업데이트 (필터 변경 + 페이지 리셋)
 * updateParams({ summarized: "true", page: null });
 */
export function useUrlParams() {
  const [, setSearchParams] = useSearchParams();

  // 여러 파라미터를 한번에 업데이트
  const updateParams = useCallback(
    (updates, options = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === null || value === "") {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          return next;
        },
        { replace: options.replace !== false }
      );
    },
    [setSearchParams]
  );

  // 모든 파라미터 초기화
  const resetParams = useCallback(
    (keysToReset) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (keysToReset) {
            keysToReset.forEach((key) => next.delete(key));
          } else {
            return new URLSearchParams();
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return { updateParams, resetParams };
}

/**
 * Boolean 값 파싱 헬퍼
 */
export const parseBool = (v) => {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
};
