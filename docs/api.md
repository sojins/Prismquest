# Prism Quest API

개발 서버 예시:

```bash
php -S 0.0.0.0:8081 -t backend
```

## 상태 조회

```bash
curl http://localhost:8081/api/state.php
```

## 미션 완료 요청

```bash
curl -X POST http://localhost:8081/api/request-mission.php \
  -H 'Content-Type: application/json' \
  -d '{"mission_ids":[1,3]}'
```

같은 날짜에 `pending` 또는 `approved` 상태인 미션은 중복 요청되지 않는다.

## 승인 대기 조회

```bash
curl http://localhost:8081/api/pending.php
```

## 승인 또는 거절

```bash
curl -X POST http://localhost:8081/api/decide-mission.php \
  -H 'Content-Type: application/json' \
  -d '{"request_id":1,"decision":"approved","pin":"1234"}'
```

`decision`은 `approved` 또는 `rejected`이다. 승인된 요청만 포인트 원장에 추가되며 같은 요청은 두 번 적립되지 않는다.

> 테스트 기본 PIN은 `1234`다. 배포 전 `backend/config.php`를 환경별 설정으로 분리해야 한다.
