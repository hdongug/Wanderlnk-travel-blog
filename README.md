# WanderInk - 여행 블로그

포트폴리오용 웹 사이트
전 세계의 여행 이야기, 가이드 및 사진을 공유하는 여행 블로그 플랫폼입니다.

## 주요 기능

### 사용자 기능
- **히어로 섹션**: 주요 목적지 이야기가 포함된 매력적인 홈페이지
- **게시물 그리드**: 목적지와 여행 유형으로 필터링 가능한 게시물 목록
- **게시물 상세**: 사진 갤러리와 Leaflet 지도가 통합된 상세 페이지
- **인터랙티브 세계 지도**: 방문한 장소를 시각화하는 Leaflet 기반 지도
- **뉴스레터 구독**: 여행 소식을 받아볼 수 있는 구독 기능
- **사용자 프로필**: 개인 정보 관리

### 관리자 기능
- **게시물 관리**: 생성, 수정, 삭제
- **갤러리 관리**: 게시물별 사진 갤러리 관리
- **위치 자동 검색**: 목적지 입력 시 위도/경도 자동 검색
- **이미지 업로드**: S3 스토리지 통합
- **카테고리 관리**: 목적지와 여행 유형 관리
- **사용자 관리**: 사용자 및 권한 관리
- **뉴스레터 구독자 관리**: 구독자 목록 조회

## 기술 스택

### 프론트엔드
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Tailwind CSS 4**: 스타일링
- **Wouter**: 경량 라우팅
- **tRPC**: 타입 안전한 API 통신
- **Leaflet**: 지도 시각화
- **shadcn/ui**: UI 컴포넌트

### 백엔드
- **Node.js**: 런타임
- **Express 4**: 웹 프레임워크
- **tRPC 11**: API 레이어
- **Drizzle ORM**: 데이터베이스 ORM
- **MySQL/TiDB**: 데이터베이스
- **Manus OAuth**: 인증

### 개발 도구
- **Vite**: 빌드 도구
- **Vitest**: 테스트 프레임워크
- **ESBuild**: 번들러

## 설치 및 실행

### 필수 요구사항
- Node.js 22.x
- pnpm 10.x
- MySQL 또는 TiDB 데이터베이스

### 설치

```bash
# 의존성 설치
pnpm install
```

### 환경 변수 설정

`.env.example`을 복사해 `.env`를 만든 뒤, 필요한 값을 채워주세요.

```bash
cp .env.example .env
```

또는 직접 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# 데이터베이스
DATABASE_URL=mysql://user:password@host:port/database

# 인증
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your-app-id

# 소유자 정보
OWNER_OPEN_ID=your-open-id
OWNER_NAME=your-name

# Manus 내장 API
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im

# 애플리케이션
VITE_APP_TITLE=WanderInk
VITE_APP_LOGO=/logo.png
```

### 데이터베이스 마이그레이션

```bash
# 데이터베이스 스키마 생성
pnpm db:push
```

### 개발 서버 실행

```bash
# 개발 모드로 실행
pnpm dev

# 포트/호스트를 고정해서 실행(접속 문제 디버깅용)
pnpm dev:local
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드

```bash
# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 테스트

```bash
# 모든 테스트 실행
pnpm test

# TypeScript 타입 체크
pnpm check
```

## 프로젝트 구조

```
wanderink/
├── client/                 # 프론트엔드
│   ├── public/            # 정적 파일
│   └── src/
│       ├── components/    # React 컴포넌트
│       ├── pages/         # 페이지 컴포넌트
│       ├── contexts/      # React 컨텍스트
│       ├── hooks/         # 커스텀 훅
│       └── lib/           # 유틸리티
├── server/                # 백엔드
│   ├── _core/            # 프레임워크 코어
│   ├── db.ts             # 데이터베이스 헬퍼
│   ├── routers.ts        # tRPC 라우터
│   └── storage.ts        # S3 스토리지
├── drizzle/              # 데이터베이스 스키마
│   └── schema.ts         # 테이블 정의
├── shared/               # 공유 타입 및 상수
└── package.json          # 의존성 및 스크립트
```

## 주요 페이지

- `/` - 홈페이지 (히어로 섹션 + 주요 게시물)
- `/posts` - 게시물 목록 (필터링 가능)
- `/posts/:slug` - 게시물 상세
- `/world-map` - 인터랙티브 세계 지도
- `/profile` - 사용자 프로필
- `/admin` - 관리자 대시보드 (관리자 전용)
- `/admin/posts/create` - 게시물 작성 (관리자 전용)
- `/admin/posts/:id/edit` - 게시물 수정 (관리자 전용)
- `/admin/posts/:id/gallery` - 갤러리 관리 (관리자 전용)

## 데이터베이스 스키마

### users
사용자 정보 및 인증

### posts
여행 게시물

### postImages
게시물 사진 갤러리

### categories
목적지 카테고리

### travelTypes
여행 유형

### visitedPlaces
방문한 장소 (세계 지도용)

### newsletterSubscriptions
뉴스레터 구독자

## 특징

### 위치 자동 검색
- OpenStreetMap Nominatim API를 사용한 지오코딩
- 도시명 입력 시 시청 위치 우선 검색
- 한국 주요 도시 17개 지원

### 지도 통합
- Leaflet 오픈소스 지도 라이브러리
- API 키 불필요
- 커스텀 마커 및 팝업
- 반응형 디자인

### 이미지 관리
- S3 스토리지 통합
- 자동 이미지 업로드
- URL 기반 참조

### 인증 및 권한
- Manus OAuth 통합
- 역할 기반 접근 제어 (admin/user)
- 보호된 관리자 라우트

## 라이선스

MIT

## 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.


## 접속 문제 해결

`ERR_CONNECTION_REFUSED`가 보이면 대부분 서버가 실행되지 않았거나 포트가 바뀐 경우입니다.

1. 프로젝트 루트에서 개발 서버가 실행 중인지 확인하세요.

```bash
pnpm dev
```

2. 터미널에 표시된 실제 주소로 접속하세요. 예: `Server running on http://localhost:3001/`
3. 3000 포트를 꼭 쓰고 싶으면 아래처럼 고정 실행하세요.

```bash
pnpm dev:local
```

4. 이미 다른 프로세스가 3000 포트를 사용 중이면 종료 후 다시 실행하세요.

```bash
# macOS/Linux
lsof -i :3000
```
