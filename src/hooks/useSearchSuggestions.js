import { useEffect, useMemo, useRef, useState } from "react";
import filtersApi from "../api/filtersApi";
import searchApi from "../api/searchApi";

const MIN_CHARS = 2;
const LIMIT = 5;
const SUGGEST_DELAY_MS = 200;

const includes = (text, q) => text.toLowerCase().includes(q);

/**
 * 검색 제안 — 블로그·주제는 한 번 받아 둔 목록에서 바로 고르고, 글은 제안 API 를 잠깐 기다렸다 부른다.
 * 2자 미만이면 아무것도 제안하지 않는다.
 */
export function useSearchSuggestions(query) {
  const [catalog, setCatalog] = useState({ blogs: [], groups: [], categories: [] });
  const [posts, setPosts] = useState([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([filtersApi.getBlogs({}), filtersApi.getTopicGroups(), filtersApi.getCategories({})])
      .then(([blogs, groups, categories]) =>
        setCatalog({
          blogs: blogs?.data?.items || [],
          groups: groups?.data?.items || [],
          categories: categories?.data?.items || [],
        })
      )
      .catch(() => {
        loadedRef.current = false;
      });
  }, []);

  const q = query.trim().toLowerCase();
  const active = q.length >= MIN_CHARS;

  useEffect(() => {
    if (!active) {
      setPosts([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchApi
        .suggest({ q: query.trim(), signal: controller.signal })
        .then((res) => setPosts(res?.data?.items || []))
        .catch(() => {});
    }, SUGGEST_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, active]);

  return useMemo(() => {
    if (!active) return { blogs: [], topics: [], posts: [] };
    const blogs = catalog.blogs.filter((blog) => includes(blog.name, q)).slice(0, LIMIT);
    const groups = catalog.groups
      .filter((group) => includes(group.name, q))
      .map((group) => ({ kind: "group", id: group.id, name: group.name }));
    const categories = catalog.categories
      .filter((item) => includes(item.name, q))
      .map((item) => ({ kind: "category", name: item.name, count: item.count }));
    return { blogs, topics: [...groups, ...categories].slice(0, LIMIT), posts: posts.slice(0, LIMIT) };
  }, [active, q, catalog, posts]);
}
