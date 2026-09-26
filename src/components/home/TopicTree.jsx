import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

/**
 * 주제 트리 — 전체 + 부모 5개. 부모를 누르면 선택되면서 자식이 펼쳐지고 다른 부모는 접힌다.
 * 자식 개수는 `categoryFilters`(출처 필터가 반영된 값)에서 읽는다.
 */
export default function TopicTree({
  topicGroups = [],
  categoryFilters = [],
  activeGroup = "",
  selectedCategory = "",
  onSelectGroup,
  onSelectCategory,
  dense = true,
}) {
  const rowH = dense ? "h-10" : "h-11";
  const childH = dense ? "h-9" : "h-11";
  const text = dense ? "text-sm" : "text-[15px]";
  const childText = dense ? "text-[13px]" : "text-sm";
  const countOf = new Map(categoryFilters.map((item) => [item.name, item.count]));

  const parentClass = (on) =>
    `flex ${rowH} w-full items-center gap-2 rounded-lg pr-2 pl-2.5 text-left ${text} ${
      on ? "bg-accent-soft font-semibold text-accent-ink" : "font-medium text-ink hover:bg-canvas"
    }`;

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        aria-pressed={!activeGroup}
        onClick={() => onSelectGroup("")}
        className={parentClass(!activeGroup)}
      >
        전체
      </button>
      {topicGroups.map((group) => {
        const expanded = group.id === activeGroup;
        const parentOn = expanded && !selectedCategory;
        // 개수순, 0개는 맨 뒤에 흐리게.
        const children = expanded
          ? [...group.topics].sort((a, b) => (countOf.get(b) || 0) - (countOf.get(a) || 0))
          : [];
        const Chevron = expanded ? RiArrowDownSLine : RiArrowRightSLine;
        return (
          <div key={group.id} className="flex flex-col gap-0.5">
            <button
              type="button"
              aria-expanded={expanded}
              aria-pressed={parentOn}
              onClick={() => onSelectGroup(group.id)}
              className={parentClass(parentOn)}
            >
              <span className="flex-1">{group.name}</span>
              <Chevron className="h-4 w-4 shrink-0 text-ink-3" />
            </button>
            {expanded && (
              <div className="ml-4 flex flex-col gap-0.5 border-l border-line pl-1">
                {children.map((name) => {
                  const on = name === selectedCategory;
                  const count = countOf.get(name) || 0;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onSelectCategory(on ? "" : name)}
                      className={`flex ${childH} w-full items-center gap-2 rounded-lg pr-2 pl-3 text-left ${childText} ${
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
            )}
          </div>
        );
      })}
    </div>
  );
}
