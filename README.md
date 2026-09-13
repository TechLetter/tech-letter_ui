# Tech Letter UI (React)

## Set Up Guide

### Environment Variables

create `.env` file in the project root directory.

```sh
VITE_API_BASE_URL=http(s)://<api-server>:<port>
```

### Node.js

```sh
node --version # Node.js 22 LTS 권장 (최소 20.19)
```

```sh
npm run dev # development mode
npm run build # production mode build
```

## 배포

`main` 브랜치에 push하면 self-hosted runner가 아래 명령으로 배포한다. 컨테이너를 내렸다가 다시 올리므로 다운타임이 발생한다.

```sh
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

`VITE_API_BASE_URL`은 `Dockerfile`의 build ARG로 프론트 번들에 포함된다. 런타임 환경 변수로는 바뀌지 않으며 값을 변경하면 다시 빌드해야 한다. `nginx.conf`는 SPA fallback만 제공하고 `/api` 프록시는 Traefik이 담당한다.

백엔드 리포의 Playwright E2E가 의존하는 셀렉터 계약은 `data-testid="post-card"`와 `data-testid="bookmark-toggle"`이다.
