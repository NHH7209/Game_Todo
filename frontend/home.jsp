<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <title>DailyXP - 오늘을 퀘스트처럼</title>
    <link rel="stylesheet" href="index.css" />
</head>
<body>
<main class="page-shell">

    <!-- 상단 헤더 -->
    <header class="landing-header">
        <div class="landing-logo clickable" onclick="location.href='home.jsp'">
            <div class="logo-dot"></div>
            <span>DailyXP</span>
            <span class="landing-logo-pill">BETA</span>
        </div>

        <div>
            <button class="text-link" onclick="location.href='login.jsp'">
                로그인 / 회원가입 →
            </button>
        </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <section class="landing-main">

        <!-- 히어로 영역 -->
        <section class="landing-hero">
            <!-- 왼쪽: 텍스트 -->
            <div class="landing-hero-left">
                <div class="landing-badge">오늘의 할 일을, 게임처럼</div>

                <h1>
                    <span class="accent-text">DailyXP</span>와 함께<br />
                    지루한 할 일을 <span>퀘스트</span>로 바꿔보세요.
                </h1>

                <p class="landing-desc">
                    DailyXP는 하루의 할 일을 퀘스트로 만들어<br />
                    경험치와 골드를 쌓아가는 나만의 작은 RPG 대시보드입니다.<br />
                    루틴을 만들고, 보상을 설정하고, 게임하듯이 하루를 클리어해 보세요.
                </p>

                <ul class="landing-list">
                    <li>• 해야 할 일을 퀘스트로 등록하고, 완료 시 XP와 골드 획득</li>
                    <li>• 상점에서 아이템과 뱃지를 구매해 프로필 꾸미기</li>
                    <li>• 통계 페이지에서 출석과 퀘스트 완료 패턴 확인</li>
                </ul>

                <div class="landing-cta">
                    <button class="btn-primary" onclick="location.href='login.jsp'">
                        지금 시작하기
                    </button>
                    <button class="btn-outline" onclick="location.href='login.jsp'">
                        데모 계정으로 둘러보기
                    </button>
                </div>

                <p class="landing-caption">
                    * 베타 서비스입니다. 피드백은 언제든 환영해요.
                </p>
            </div>

            <!-- 오른쪽: 대시보드 미리보기 카드 -->
            <div class="landing-hero-right">
                <article class="hero-preview-card">
                    <div class="hero-preview-label">오늘의 퀘스트 예시</div>

                    <div class="hero-preview-quest">
                        <div>
                            <div class="hero-preview-title">아침 스트레칭 10분</div>
                            <div class="hero-preview-reward">+10 XP · +5 G</div>
                        </div>
                        <span class="hero-preview-badge">진행 중</span>
                    </div>

                    <div class="hero-preview-quest">
                        <div>
                            <div class="hero-preview-title">오늘 할 일 정리하기</div>
                            <div class="hero-preview-reward">+15 XP · +5 G</div>
                        </div>
                        <span class="hero-preview-badge ghost">대기 중</span>
                    </div>

                    <p class="hero-preview-footer">
                        퀘스트를 완료할수록 캐릭터 레벨이 오르고,<br />
                        더 많은 보상과 아이템을 잠금 해제할 수 있어요.
                    </p>
                </article>
            </div>
        </section>

        <!-- 사용법 / 소개 섹션 -->
        <section class="landing-howto">
            <h2>DailyXP, 이렇게 사용해요</h2>

            <div class="howto-grid">
                <article class="howto-card">
                    <h3>1. 오늘의 퀘스트 만들기</h3>
                    <p>
                        해야 할 일을 퀘스트로 등록하고 중요도에 맞춰 보상(XP/골드)을 설정해요.
                        반복되는 루틴은 템플릿처럼 저장해두고 매일 불러올 수 있어요.
                    </p>
                </article>

                <article class="howto-card">
                    <h3>2. 대시보드에서 진행 상황 확인</h3>
                    <p>
                        오늘의 퀘스트, 내 캐릭터 레벨, 누적 경험치와 출석 현황을
                        한 화면에서 깔끔하게 정리해서 보여줘요.
                    </p>
                </article>

                <article class="howto-card">
                    <h3>3. 상점과 프로필 꾸미기</h3>
                    <p>
                        모은 골드로 상점에서 아이템과 뱃지를 구매하고,
                        프로필과 캐릭터를 점점 더 성장시키며 동기부여를 얻어보세요.
                    </p>
                </article>
            </div>
        </section>

    </section>
</main>
</body>
</html>
