# DailyXP - 게임형 할일 관리 플래너

> 일상의 할 일을 퀘스트로 변환해 경험치와 보상을 획득하는 **Gamification 기반 Todo 웹 애플리케이션**

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [기획 배경](#기획-배경)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [데이터베이스 설계](#데이터베이스-설계)
- [API 명세](#api-명세)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)

---

## 프로젝트 소개

**DailyXP**는 할 일 관리에 RPG 게임의 핵심 메커니즘을 접목한 웹 서비스입니다.
퀘스트를 완료하면 경험치(EXP)와 골드를 획득하고, 레벨업·업적 달성·캐릭터 커스터마이징을 통해 목표를 꾸준히 달성하도록 동기를 부여합니다.

- **팀 구성**: 10조 팀 프로젝트
- **프로젝트 유형**: 풀스택 웹 애플리케이션

---

## 기획 배경

기존 Todo 앱은 단순 목록 관리에 그쳐 **지속적인 사용 동기가 낮다**는 한계가 있습니다.

| 문제 | 해결 방안 |
|------|-----------|
| 할 일을 완료해도 성취감이 없음 | EXP·Gold·레벨업 등 즉각적인 보상 시스템 도입 |
| 난이도·보상을 매번 직접 설정하는 번거로움 | **Google Gemini AI**가 퀘스트 내용을 분석해 자동 책정 |
| 장기적인 사용 유지가 어려움 | 출석 스트릭, 업적, 캐릭터 커스터마이징으로 지속적인 참여 유도 |

---

## 주요 기능

### 퀘스트 관리
- 퀘스트 생성 시 **AI(Gemini 2.5 Flash)**가 제목·설명을 분석해 난이도(Easy / Normal / Hard)와 보상(EXP, Gold)을 자동 책정
- 난이도별 보상 기준: Easy(10~30 EXP, 5~15 Gold) / Normal(30~70 EXP, 15~40 Gold) / Hard(70~150 EXP, 40~100 Gold)
- 퀘스트 완료 시 보상 자동 지급 및 관련 스킬/자격증 수여
- 생성, 조회, 수정, 삭제, 완료 처리

### 게임화(Gamification) 요소
- **레벨 & 경험치**: 퀘스트 완료로 EXP 누적 → 자동 레벨업
- **재화 시스템**: 골드(Gold)·보석(Gem) 획득 후 상점에서 사용
- **출석 스트릭**: 연속 로그인 일수 기록 및 통계 제공
- **업적/배지**: 조건 달성 시 배지 자동 부여, 프로필에 대표 배지 장착
- **스킬/자격증**: 퀘스트 완료 보상으로 수집, 프로필에 표시

### 상점 & 캐릭터 커스터마이징
- 골드로 캐릭터 스킨, 펫 등 아이템 구매
- 캐릭터(CHAR) · 펫(PET) 슬롯에 아이템 장착·해제
- 획득 배지를 프로필에 장착해 개성 표현

### 인증 시스템
- 로컬 회원가입 / 로그인 (JWT 기반 stateless 인증)
- **Google OAuth 2.0** 소셜 로그인
- 이메일을 통한 아이디 찾기 · 비밀번호 재설정 (Nodemailer)

### 통계 대시보드
- 전체·완료 퀘스트 수, 완료율, 오늘 완료 퀘스트 수
- 총 출석일, 연속 출석 스트릭, 출석 달력

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | JSP, Vanilla JavaScript, CSS3 |
| **Backend** | NestJS 11, TypeScript |
| **Database** | PostgreSQL, Prisma ORM 6 |
| **인증** | JWT (Passport), Google OAuth 2.0, bcrypt |
| **AI** | Google Generative AI (Gemini 2.5 Flash) |
| **이메일** | Nodemailer (Gmail SMTP) |
| **API 문서화** | Swagger / OpenAPI |
| **테스트** | Jest |
| **개발 환경** | ngrok |

---

## 시스템 아키텍처

```
[Browser / JSP]
      │  HTTP (Fetch API + JWT)
      ▼
[NestJS Backend]
  ├── user       - 인증 & 사용자 관리
  ├── quest      - 퀘스트 CRUD + AI 분석
  ├── achievement - 업적 시스템
  ├── shop       - 상점 & 인벤토리
  ├── profile    - 장착 아이템 관리
  ├── record     - 출석 & 퀘스트 통계
  ├── skill      - 스킬/자격증
  └── setting    - 계정 설정
      │
      ├── Prisma ORM
      │       └── PostgreSQL
      ├── Google Gemini API  (퀘스트 난이도·보상 자동 분석)
      ├── Google OAuth 2.0   (소셜 로그인)
      └── Nodemailer         (이메일 발송)
```

---

## 데이터베이스 설계

```
User
 ├── Quest[]          (1:N)
 ├── UserAchievement[] (N:M → Achievement)
 ├── UserInventory[]   (N:M → ShopItem)
 ├── UserSkill[]       (N:M → Skill)
 └── Attendance[]      (1:N, 하루 1회 유니크)

Quest
 └── rewardSkill → Skill (N:1)

Achievement ─── UserAchievement ─── User
ShopItem    ─── UserInventory   ─── User
Skill       ─── UserSkill       ─── User
```

**주요 모델**

| 모델 | 설명 |
|------|------|
| `User` | 사용자 정보, EXP·Gold·Gem 재화 |
| `Quest` | 할일/퀘스트, 난이도·보상 포함 |
| `Achievement` | 업적 마스터 데이터 |
| `ShopItem` | 상점 아이템, 장착 슬롯(CHAR/PET/NONE) |
| `Skill` | 자격증·기술 마스터 데이터 |
| `Attendance` | 출석 기록 (userId + date 유니크) |

---

## API 명세

> 전체 API 문서는 서버 실행 후 `/api` (Swagger UI)에서 확인할 수 있습니다.

### 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/user/signup` | 회원가입 |
| POST | `/user/signin` | 로그인 (JWT 발급) |
| GET | `/user/google` | Google OAuth 로그인 |
| GET | `/user/me` | 내 정보 조회 |
| POST | `/user/find-id` | 아이디 찾기 |
| POST | `/user/reset-password` | 비밀번호 재설정 |

### 퀘스트 (JWT 필수)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/quest` | 퀘스트 생성 (AI 자동 분석) |
| GET | `/quest` | 퀘스트 목록 |
| PATCH | `/quest/:id` | 퀘스트 수정 |
| PATCH | `/quest/:id/complete` | 퀘스트 완료 (보상 지급) |
| DELETE | `/quest/:id` | 퀘스트 삭제 |

### 상점 & 인벤토리 (JWT 필수)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/shop` | 상점 아이템 목록 |
| POST | `/shop/:id/buy` | 아이템 구매 (트랜잭션) |
| GET | `/shop/my-inventory` | 내 인벤토리 |

### 프로필 (JWT 필수)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/profile` | 프로필 조회 |
| PATCH | `/profile/item/:id/equip` | 아이템 장착 |
| PATCH | `/profile/item/:id/unequip` | 아이템 해제 |
| PATCH | `/profile/achievement/:id/equip` | 배지 장착 |

### 통계 (JWT 필수)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/record/attendance` | 출석 통계 (총일수, 스트릭) |
| GET | `/record/quest` | 퀘스트 통계 (완료율 등) |

---

## 프로젝트 구조

```
프로그램 소스파일/
├── frontend/
│   ├── home.jsp          # 랜딩 페이지
│   ├── login.jsp         # 로그인 / 회원가입
│   ├── dashboard.jsp     # 메인 대시보드
│   ├── app.js            # 전체 클라이언트 로직
│   ├── index.css         # 스타일시트 (다크 테마)
│   └── img/              # 캐릭터 이미지 (soldier, dragon, slime, knight, elf, puppy)
│
└── backend/
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   ├── user/          # 회원가입, 로그인, OAuth
    │   ├── quest/         # 퀘스트 CRUD + AI 분석
    │   ├── achievement/   # 업적 시스템
    │   ├── shop/          # 상점 & 인벤토리
    │   ├── profile/       # 장착 아이템 관리
    │   ├── record/        # 출석·퀘스트 통계
    │   ├── skill/         # 스킬/자격증
    │   ├── setting/       # 계정 설정
    │   └── prisma/        # Prisma 서비스
    └── prisma/
        ├── schema.prisma  # DB 스키마
        └── migrations/    # 마이그레이션 히스토리
```

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL
- Google Cloud 프로젝트 (OAuth 2.0, Gemini API)
- Gmail 계정 (Nodemailer용 앱 비밀번호)

### 환경 변수 설정

`backend/.env` 파일을 생성하고 아래 내용을 입력합니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/user/google/callback

GEMINI_API_KEY=your_gemini_api_key

MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:8080
```

### 백엔드 실행

```bash
cd backend
npm install
npx prisma migrate deploy
npm run start:dev
```

### 프론트엔드 실행

JSP 파일은 Apache Tomcat 등 서블릿 컨테이너에 배포하거나,
개발 환경에서는 ngrok으로 백엔드를 외부에 노출한 뒤 `app.js`의 `BASE_URL`을 수정하여 사용합니다.

```javascript
// frontend/app.js
const BASE_URL = 'http://localhost:3000'; // 또는 ngrok URL
```

### API 문서 확인

서버 실행 후 브라우저에서 접속:
```
http://localhost:3000/api
```
