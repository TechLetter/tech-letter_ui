import { useRef, useState } from "react";

/**
 * SVG 라인차트 공통 호버 — 포인터 X를 가장 가까운 데이터 인덱스로 스냅한다.
 * 차트의 viewBox 좌표계(width/padding/plotWidth)와 렌더된 실제 픽셀 크기가
 * 다르므로, getBoundingClientRect로 비율을 구해 viewBox 좌표로 변환한다.
 */
export function useChartHover({ width, padding, plotWidth, pointCount }) {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const onPointerMove = (event) => {
    if (!svgRef.current || pointCount === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const fractionX = (event.clientX - rect.left) / rect.width;
    const viewBoxX = fractionX * width;
    const raw = ((viewBoxX - padding.left) / plotWidth) * (pointCount - 1);
    setHoverIndex(Math.min(pointCount - 1, Math.max(0, Math.round(raw))));
  };

  const onPointerLeave = () => setHoverIndex(null);

  return { svgRef, hoverIndex, onPointerMove, onPointerLeave };
}
