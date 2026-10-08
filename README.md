# Teacher Studio · 나의 교육 워크스페이스

중학교 교사의 미술 수업, 교육연구 업무, 학급과 동아리 활동을 연결하는 개인용 웹앱 포털입니다.

## 로컬 실행

Node.js 20.19 이상(22 LTS 권장)을 설치한 뒤 프로젝트 폴더에서 실행하세요.

```bash
npm install
npm run dev
```

터미널에 표시되는 주소(기본 http://localhost:5173)를 엽니다.

```bash
npm run build
npm run preview
```

`build`는 TypeScript 검사와 Vite 프로덕션 빌드를 실행합니다. 결과는 `dist/`에 생성됩니다.

## 주요 기능

- 날짜와 환영 메시지, 전체 앱·즐겨찾기·컬렉션 수, 카테고리 바로가기
- 18개 실제 웹앱 기본 등록, Family CFO는 기본 숨김
- 통합 검색(Ctrl/Cmd + K), 즐겨찾기, 실제 실행 기반 최근 기록
- 카드·목록 보기, 접을 수 있는 사이드바와 하위 메뉴
- 포털 내부 iframe 실행, 내부 전체 화면, 홈 복귀, 안전한 새 탭 실행
- 반응형 PC·태블릿·모바일 화면과 라이트·다크 모드
- 웹앱·메뉴 CRUD, 카테고리 이동, 메뉴 위·아래 순서 변경
- JSON 내보내기·검증 후 가져오기·초기 데이터 복원
- URL 검증, 데이터 저장 실패와 빈 상태 안내

## 웹앱 등록과 관리

1. 홈의 **웹앱 추가** 또는 **설정 및 관리자 → 웹앱 추가**를 누릅니다.
2. 이름, 실제 URL, 설명, 메인·서브 카테고리, 아이콘, 색상, 기본 실행 방식과 공개 범위를 입력합니다.
3. 즐겨찾기와 홈·탐색 표시 여부를 설정하고 저장합니다.
4. 관리 목록에서 연필로 수정하고 삭제 버튼으로 포털 등록만 삭제합니다. 원본 사이트에는 영향을 주지 않습니다.
5. 카테고리 이동은 웹앱 수정의 메인·서브 카테고리를 바꾸면 됩니다.
6. **메뉴 관리**에서 메인 메뉴와 하위 메뉴를 추가·수정하고 화살표로 순서를 바꿉니다. 웹앱이나 하위 메뉴가 연결된 메뉴는 먼저 이동·정리해야 삭제할 수 있습니다.
7. **데이터 관리**에서 JSON을 백업합니다. 가져오기와 초기 복원은 현재 설정을 교체하므로 확인 대화상자가 표시됩니다.

Family CFO를 표시하려면 관리자 목록의 `숨김`을 눌러 `표시`로 바꾸세요. 숨김은 보안 기능이 아닙니다.

## 저장과 실행 주의점

앱은 `teacher-studio:v1`, 테마는 `teacher-studio:theme` localStorage 키를 사용합니다. 첫 실행에만 기본 데이터를 저장하고 이후에는 기존 데이터를 유지합니다. 데이터 구조가 잘못되면 기존 원본을 덮어쓰지 않고 저장을 멈춥니다. 관리자에서 검증된 백업을 가져오거나 명시적으로 초기 복원을 선택하세요.

localStorage는 브라우저와 사이트 주소별로 분리됩니다. 다른 기기, 브라우저, 배포 주소에서는 자동 동기화되지 않습니다. 브라우저 데이터 삭제 시 사라질 수 있으니 JSON을 백업하세요. 비공개 업무 기록은 공유 PC에서 저장하지 마세요.

iframe은 외부 사이트의 보안 헤더와 브라우저 정책에 따라 차단될 수 있습니다. onLoad 이벤트가 발생해도 정상 로딩을 증명하지 못하므로 자동 감지했다고 표시하지 않습니다. 빈 화면, 로그인 실패, 저장 문제는 **새 창으로 열기**로 해결하세요. 관리자가 기본 실행 방식을 새 창으로 바꿀 수 있습니다. 원본 사이트의 코드·로그인·저장소를 수정하지 않습니다. 외부 사이트의 기능과 접근 가능 여부는 보장하지 않습니다.

새 탭은 `noopener,noreferrer`로 엽니다. iframe에는 원본 웹앱의 저장·로그인 기능을 방해하지 않도록 제한적인 sandbox를 적용하지 않았습니다. 등록한 외부 사이트만 실행하세요. 등록 URL은 인증 정보가 없는 HTTP/HTTPS로 제한합니다. React의 기본 이스케이프를 사용하며 JSON의 HTML 문자열을 실행하지 않습니다.

## 공개 범위와 향후 Supabase

`private`, `teachers`, `students`, `public`은 현재 **분류용 메타데이터**입니다. 현재 포털에는 인증, 실제 공유 화면, 접근 제어가 없습니다. 숨김과 공개 범위로 보안이 보장되지 않습니다. 정적 배포 코드의 기본 앱 주소는 누구나 소스를 통해 확인할 수 있습니다. 공개 배포에 비공개 URL, 토큰, 학생 개인정보, 상담 기록 등 민감한 정보를 넣지 마세요. 제공된 기본 데이터는 사용자가 제공한 URL과 일반 설명뿐이며 외부 웹앱의 업무 데이터를 가져오지 않습니다.

향후 연결점:

- `src/types.ts`: 독립적인 Category, WebApp, Audience, StudioData 모델
- `src/lib/storage.ts`: `StudioRepository`의 로컬 구현. 원격 연동은 비동기 Repository와 로딩·오류 상태를 추가해 전환합니다.
- `src/components/AppCard.tsx`: 이용 대상과 무관한 재사용 카드
- `src/components/AppEditor.tsx`: 관리 폼
- `src/components/Admin.tsx`: 관리자 페이지
- `src/App.tsx`: 레이아웃, 대시보드, 라우팅
- `src/components/Runner.tsx`: iframe 실행 화면과 전체 화면 제어
- `src/components/WorkspaceUI.tsx`: 재사용 섹션 제목, 빈 상태, 대시보드 아트워크
- `src/data/seed.ts`: 18개 앱과 독립적인 메뉴 초기 데이터

Supabase 연결 시 categories, web_apps, user_favorites, recent_usage, profiles 테이블을 분리하고 owner_id(UUID), 생성·수정 시각을 서버에서 관리하세요. 기존 문자열 ID는 마이그레이션 시 UUID로 매핑합니다. Supabase Auth로 세션을 확인한 뒤 RLS에서 private은 소유자, teachers/students는 검증된 역할만 허용하고 public은 허용된 필드만 공개해야 합니다. 사용자 입력 role을 그대로 신뢰하지 마세요. 관리자 권한도 RLS와 서버에서 검증해야 합니다. service_role 키는 프런트엔드와 GitHub에 넣지 않습니다. 학생용/교사용 화면은 동일한 카드·디자인 시스템을 이용하되 서버에서 접근 허용된 앱만 조회하는 별도 라우트로 확장하세요.

## GitHub 업로드

GitHub에서 빈 저장소를 만든 후 프로젝트 폴더에서:

```bash
git init
git add .
git commit -m "Build Teacher Studio workspace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/teacher-studio.git
git push -u origin main
```

이미 Git이 초기화되어 있으면 `git init`은 생략하고, origin이 있다면 `git remote set-url origin ...`을 사용합니다. node_modules, dist와 .env 파일은 .gitignore에 포함됩니다. 백업 JSON은 개인 파일이므로 저장소에 추가하지 마세요.

## Vercel 무료 배포

1. Vercel에 로그인하고 **Add New → Project**에서 GitHub 저장소를 가져옵니다.
2. Framework Preset은 **Vite**, Build Command는 `npm run build`, Output Directory는 `dist`로 설정합니다.
3. 프로젝트 폴더가 저장소 하위에 있다면 Root Directory를 해당 폴더로 설정합니다.
4. Deploy를 누릅니다. `vercel.json`은 React Router 경로의 새로고침을 index.html로 연결합니다.
5. 이후 GitHub main 브랜치에 push하면 재배포됩니다. 개인 프로젝트에는 Vercel Hobby의 최신 이용 조건을 확인하세요.

이 배포는 정적 웹사이트를 공개합니다. 로그인이나 실제 관리자 보호는 생기지 않습니다. 다른 방문자의 localStorage는 별개이지만 배포 소스의 기본 데이터는 공개되므로, 민감한 기본 데이터를 제거하거나 인증·RLS를 먼저 구현하세요.

## GitHub Pages 배포

저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 선택하세요. 소스 전체를 main 브랜치에 업로드하면 포함된 pages.yml이 자동 빌드·배포합니다. Actions의 Deploy Teacher Studio 작업이 성공하면 https://hongji33.github.io/teacher-studio/ 에 접속합니다. 하위 경로 자산은 build:github로 처리하고 HashRouter를 사용해 새로고침 시 404를 방지합니다.
