import { useState } from "react";
import PropTypes from "prop-types";

const API = import.meta.env.VITE_API_BASE_URL || "";
const TONES = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
];

function toneOf(name = "") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

// 아이콘을 한꺼번에 바꿨을 때 올린다. 브라우저에 캐시된 옛 아이콘(Medium 로고)을 버리게 한다.
const ICON_EPOCH = 2;

function blogIconUrl(blogId, version) {
  return `${API}/api/v1/blogs/${blogId}/icon?v=${version || ICON_EPOCH}`;
}

/**
 * 블로그 아이콘. 수집된 아이콘이 없으면(빈 응답) 이름 첫 글자 배지로 대신한다.
 * `version`을 바꾸면 캐시를 건너뛰고 다시 받는다(어드민에서 교체 직후).
 */
export default function BlogIcon({ blogId, name, size = 20, version }) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size };
  if (!blogId || failed) {
    return (
      <span
        aria-hidden="true"
        style={{ ...box, fontSize: Math.round(size * 0.55) }}
        className={`inline-flex shrink-0 items-center justify-center rounded-md font-semibold ${toneOf(name)}`}
      >
        {(name || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={blogIconUrl(blogId, version)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={box}
      className="shrink-0 rounded-md bg-white object-contain dark:bg-slate-800"
    />
  );
}

BlogIcon.propTypes = {
  blogId: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  version: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
