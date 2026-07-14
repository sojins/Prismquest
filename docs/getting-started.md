# Getting Started

Prism Quest를 로컬에서 실행하고 기본 흐름을 확인하는 방법입니다.

## 1. 저장소 받기

```bash
git clone https://github.com/sojins/Prismquest.git
cd Prismquest
```

최신 변경을 받으려면:

```bash
git pull origin main
```

아직 병합되지 않은 PR 브랜치를 시험하려면:

```bash
git fetch origin
git checkout <branch-name>
```

## 2. 필요한 도구

- Node.js 20 이상
- npm
- PHP 8 이상
- SQLite 지원이 포함된 PHP

버전 확인:

```bash
node -v
npm -v
php -v
```

### macOS에서 PHP 설치

Homebrew가 있다면:

```bash
brew install php
```

설치 후:

```bash
php -v
```

## 3. 백엔드 실행

프로젝트 루트에서:

```bash
php -S 127.0.0.1:8081 -t backend
```

API 확인:

```text
http://127.0.0.1:8081/api/state.php
```

정상이라면 날짜, 포인트, 미션, 원장이 포함된 JSON이 표시됩니다.

SQLite 데이터베이스와 기본 미션은 첫 API 요청 때 자동으로 생성됩니다.

## 4. 프론트엔드 실행

새 터미널에서:

```bash
cd frontend
npm install
npm run dev
```

접속 주소:

- 아이 화면: `http://localhost:8080/`
- 부모 화면: `http://localhost:8080/parent`

테스트용 부모 PIN은 `1234`입니다.

## 5. 기본 흐름 테스트

1. 아이 화면에서 미션을 선택합니다.
2. `부모님께 승인 요청`을 누릅니다.
3. 부모 화면으로 이동합니다.
4. PIN `1234`를 입력합니다.
5. 요청을 승인합니다.
6. 아이 화면을 새로고침합니다.
7. 포인트와 승인 상태가 반영됐는지 확인합니다.

## 6. 자주 발생하는 문제

### Vite proxy에서 ECONNREFUSED

오류 예시:

```text
[vite] http proxy error: /api/state.php
Error: connect ECONNREFUSED 127.0.0.1:8081
```

원인은 PHP 서버가 실행 중이 아니거나, `localhost`의 IPv6 주소에만 바인딩된 경우가 많습니다.

PHP 서버를 종료한 뒤 다음처럼 다시 실행합니다.

```bash
php -S 127.0.0.1:8081 -t backend
```

그리고 다음 주소가 직접 열리는지 확인합니다.

```text
http://127.0.0.1:8081/api/state.php
```

### 포트가 이미 사용 중임

8081 포트를 확인합니다.

```bash
lsof -i :8081
```

필요하면 해당 프로세스를 종료하거나 다른 포트를 사용하고, `frontend/vite.config.js`의 프록시 대상도 함께 변경합니다.

### PHP SQLite 오류

PHP에 SQLite 확장이 포함됐는지 확인합니다.

```bash
php -m | grep -i sqlite
```

`pdo_sqlite`와 `sqlite3`가 보이면 정상입니다.

### 데이터 초기화

개발 중 데이터를 처음부터 다시 만들려면 PHP 서버를 종료한 뒤 SQLite 파일을 삭제합니다.

```bash
rm -f backend/data/prism_quest.sqlite
```

다음 API 요청 때 데이터베이스가 다시 생성됩니다.

## 7. 프로덕션 빌드

```bash
cd frontend
npm run build
```

결과물은 `frontend/dist`에 생성됩니다.

비누넷에는 정적 프론트 결과물과 PHP 백엔드를 함께 배치합니다. 배포 전에는 기본 PIN을 반드시 변경해야 합니다.

## 8. 다음 테스트 항목

- 승인 요청 중복 방지
- 같은 요청 재승인 방지
- 거절 시 포인트 미적립
- 모바일 화면 확인
- 보상 사용 요청 및 차감
- 푸딩이·찡찡이 프로필 표시와 갱신
