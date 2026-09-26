import { useRef, useState } from "react";
import BlogIcon from "../../../components/common/BlogIcon";
import { ApiError } from "../../../api/apiError";
import { handleAdminError, refreshBlogIcon, uploadBlogIcon } from "../../../api/adminApi";
import { showToast } from "../../../provider/toastModalBridge";

const SIZE = 64;

/** 고른 이미지를 정사각 64px webp로 바꾼다. 서버에 이미지 라이브러리를 두지 않으려고 브라우저에서 한다. */
async function toIconWebp(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("이미지를 열 수 없습니다."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const scale = Math.min(SIZE / image.width, SIZE / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    canvas.getContext("2d").drawImage(image, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
    if (!blob || blob.type !== "image/webp")
      throw new Error("이 브라우저는 webp 변환을 지원하지 않습니다.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function BlogIconEditor({ blog, onChanged }) {
  const input = useRef(null);
  const [version, setVersion] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  const bump = () => {
    const next = Date.now();
    setVersion(next);
    onChanged?.(blog.id, next);
  };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      await uploadBlogIcon(blog.id, await toIconWebp(file));
      bump();
    } catch (error) {
      showToast(error instanceof ApiError ? handleAdminError(error) : error.message, "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const refresh = async () => {
    setBusy(true);
    try {
      await refreshBlogIcon(blog.id);
      // 요약 워커가 받아 온다. 보통 몇 초면 끝난다.
      setTimeout(bump, 6000);
    } catch (error) {
      showToast(handleAdminError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const button =
    "h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700";

  return (
    <div className="flex items-center gap-3">
      <BlogIcon key={version} blogId={blog.id} name={blog.name} size={40} version={version} />
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          이미지 선택
        </button>
        <button type="button" className={button} disabled={busy} onClick={refresh}>
          사이트에서 다시 받기
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        aria-label="아이콘 이미지"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </div>
  );
}
