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

  // 이전 값을 저장하여 불필요한 리렌더 방지
  const prevValueRef = useRef();
  const prevParamRef = useRef();

  // URL에서 값 읽기
  const value = useMemo(() => {
    const param = searchParams.get(key);

    // 파라미터가 변경되지 않았으면 이전 값 반환 (배열 안정화)
    if (param === prevParamRef.current && prevValueRef.current !== undefined) {
      return prevValueRef.current;
    }
    prevParamRef.current = param;

    if (param === null || param === "") {
      prevValueRef.current = defaultValue;
      return defaultValue;
    }

    const parsed = parseRef.current(param);
    prevValueRef.current = parsed;
    return parsed;
  }, [searchParams, key, defaultValue]);

  // URL에 값 쓰기
  const setValue = useCallback(
    (newValue) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const serialized = serializeRef.current(newValue);

          // 기본값이거나 빈 값이면 삭제
          const isDefault = Array.isArray(defaultValue)
            ? JSON.stringify(newValue) === JSON.stringify(defaultValue)
            : newValue === defaultValue;

          if (isDefault || newValue === undefined || serialized === "") {
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
 * 여러 URL 상태를 한번에 관리하는 훅
 *
 * @param {Object} schema - { key: { default, parse?, serialize? } }
 * @returns {[values, setters, resetAll]}
 *
 * @example
 * const [values, setters, reset] = useUrlStates({
 *   page: { default: 1, parse: Number },
 *   filter: { default: "" },
 * });
 */
export function useUrlStates(schema) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const result = {};
    for (const [key, config] of Object.entries(schema)) {
      const param = searchParams.get(key);
      const parse = config.parse || ((v) => v);
      result[key] =
        param === null || param === "" ? config.default : parse(param);
    }
    return result;
  }, [searchParams, schema]);

  const setters = useMemo(() => {
    const result = {};
    for (const [key, config] of Object.entries(schema)) {
      const serialize = config.serialize || ((v) => String(v));
      result[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] = (
        newValue
      ) => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (
              newValue === config.default ||
              newValue === undefined ||
              newValue === ""
            ) {
              next.delete(key);
            } else {
              next.set(key, serialize(newValue));
            }
            return next;
          },
          { replace: true }
        );
      };
    }
    return result;
  }, [schema, setSearchParams]);

  const resetAll = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return [values, setters, resetAll];
}

/**
 * Boolean 값 파싱 헬퍼
 */
export const parseBool = (v) => {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
};
