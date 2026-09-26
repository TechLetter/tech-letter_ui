/**
 * 주제 — 부모 칩(전체 + 5개) 아래 고른 부모의 자식만 목록으로. '전체' 면 개수순으로 전부.
 * 자식 개수는 `categoryFilters`(출처 필터가 반영된 값)에서 읽는다. 목록은 카드 안에서 스크롤한다.
 */
export default function TopicPicker({
  topicGroups = [],
  categoryFilters = [],
  activeGroup = "",
  selectedCategory = "",
  onSelectGroup,
  onSelectCategory,
  dense = true,
}) {
  const chipH = dense ? "h-[30px] text-[13px]" : "h-10 text-sm";
  const rowH = dense ? "h-9 text-[13px]" : "h-11 text-sm";
  const countOf = new Map(categoryFilters.map((item) => [item.name, item.count]));
  const group = topicGroups.find((item) => item.id === activeGroup) || null;
  // 부모를 고르면 자식 전부(0개는 흐리게, 맨 뒤). 전체면 개수가 있는 주제 전부.
  const children = group
    ? [...group.topics].sort((a, b) => (countOf.get(b) || 0) - (countOf.get(a) || 0))
    : categoryFilters.map((item) => item.name);

  const chipClass = (on) =>
    `flex ${chipH} items-center rounded-full border px-3 whitespace-nowrap ${
      on
        ? "border-accent bg-accent-soft font-semibold text-accent-ink"
        : "border-line bg-surface font-medium text-ink-2 hover:bg-canvas"
    }`;

  return (
    <>
      <div className={`flex shrink-0 flex-wrap ${dense ? "gap-1.5" : "gap-2"}`}>
        <button type="button" aria-pressed={!activeGroup} onClick={() => onSelectGroup("")} className={chipClass(!activeGroup)}>
          전체
        </button>
        {topicGroups.map((item) => {
          const on = item.id === activeGroup;
          return (
            <button key={item.id} type="button" aria-pressed={on} onClick={() => onSelectGroup(on ? "" : item.id)} className={chipClass(on)}>
              {item.name}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
        {children.map((name) => {
          const on = name === selectedCategory;
          const count = countOf.get(name) || 0;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => onSelectCategory(on ? "" : name)}
              className={`flex ${rowH} w-full shrink-0 items-center gap-2 rounded-lg pr-2 pl-2.5 text-left ${
                on
                  ? "bg-accent-soft font-semibold text-accent-ink"
                  : count
                    ? "font-medium text-ink-2 hover:bg-canvas"
                    : "font-medium text-ink-3 hover:bg-canvas"
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <span className={`font-mono text-[11px] ${on ? "" : "text-ink-3"}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
