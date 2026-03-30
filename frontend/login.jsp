<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>DailyXP - 로그인 / 회원가입</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="index.css" />
  </head>
  <body data-page="auth">
    <div id="app">
      <section class="page page-auth">
        <div class="page-shell auth-shell">
          <header class="landing-header">
            <div class="landing-logo clickable" id="auth-logo">
              <span class="logo-dot"></span>
              DailyXP
            </div>
            <div class="landing-header-right">
              <a href="home.jsp" class="text-link"> 메인으로 돌아가기 </a>
            </div>
          </header>

          <main class="auth-main">
            <!-- ① 기본 로그인/회원가입 뷰 -->
            <div id="auth-view-main" class="auth-card">
              <div class="auth-tabs">
                <button id="tab-login" class="auth-tab active">로그인</button>
                <button id="tab-signup" class="auth-tab">회원가입</button>
              </div>

              <!-- 로그인 폼 -->
              <form id="form-login" class="auth-form">
                <h2>다시 오셨군요, 모험가님!</h2>
                <p class="auth-sub">
                  DailyXP에 로그인하여 오늘의 퀘스트를 이어서 진행하세요.
                </p>

                <label class="field">
                  <span>아이디 (username)</span>
                  <input
                    type="text"
                    id="si-username"
                    required
                    placeholder="아이디를 입력하세요"
                  />
                </label>

                <label class="field">
                  <span>비밀번호</span>
                  <input
                    type="password"
                    id="si-password"
                    required
                    placeholder="●●●●●●●●"
                  />
                </label>

                <div class="field-inline">
                  <label class="checkbox">
                    <input type="checkbox" />
                    자동 로그인
                  </label>
                  <!-- 여기서 아이디/비밀번호 찾기 화면으로 이동 -->
                  <button
                    type="button"
                    class="text-link-sm"
                    id="btn-open-find-account"
                  >
                    아이디 / 비밀번호 찾기
                  </button>
                </div>

                <button type="submit" class="btn-primary full">로그인</button>

                <div class="auth-divider">
                  <span>또는</span>
                </div>

                <button
                  type="button"
                  class="btn-outline full"
                  id="btn-social-google"
                >
                  Google로 계정으로 계속하기
                </button>

                <p class="auth-switch">
                  아직 계정이 없나요?
                  <button
                    type="button"
                    class="text-link-sm"
                    id="go-signup-link"
                  >
                    회원가입 하기
                  </button>
                </p>

                <p id="login-error" class="auth-sub" style="color: #f97373"></p>
              </form>

              <!-- 회원가입 폼 -->
              <form id="form-signup" class="auth-form hidden">
                <h2>회원가입</h2>
                <p class="auth-sub">
                  기본 정보를 입력하고 모험을 시작해보세요.
                </p>

                <!-- 아이디(필수) -->
                <div class="field">
                  <span>아이디<span class="required-mark">*</span></span>
                  <input
                    id="su-username"
                    type="text"
                    placeholder="아이디를 입력하세요"
                  />
                </div>

                <!-- 이메일(필수) -->
                <div class="field">
                  <span>이메일<span class="required-mark">*</span></span>
                  <input
                    id="su-email"
                    type="email"
                    placeholder="example@email.com"
                  />
                </div>

                <!-- 비밀번호(필수) -->
                <div class="field">
                  <span>비밀번호<span class="required-mark">*</span></span>
                  <input
                    id="su-password-1"
                    type="password"
                    placeholder="비밀번호"
                  />
                </div>

                <!-- 비밀번호 확인(필수) -->
                <div class="field">
                  <span>비밀번호 확인<span class="required-mark">*</span></span>
                  <input
                    id="su-password-2"
                    type="password"
                    placeholder="비밀번호 확인"
                  />
                </div>

                <!-- 전화번호(선택) -->
                <div class="field">
                  <span>전화번호(선택)</span>
                  <input id="su-phone" type="tel" placeholder="010-0000-0000" />
                </div>

                <!-- 주소(선택) -->
                <div class="field">
                  <span>주소(선택)</span>
                  <input
                    id="su-address"
                    type="text"
                    placeholder="주소를 입력해 주세요"
                  />
                </div>

                <p id="signup-error" class="auth-error"></p>

                <button type="submit" class="btn-primary full">회원가입</button>
              </form>
            </div>

            <!-- ② 아이디 / 비밀번호 찾기 뷰 (별도 카드) -->
            <div id="auth-view-find" class="auth-card hidden">
              <div class="auth-tabs auth-extra-tabs">
                <button
                  id="tab-find-id"
                  class="auth-tab auth-extra-tab active"
                  type="button"
                >
                  아이디 찾기
                </button>
                <button
                  id="tab-reset-password"
                  class="auth-tab auth-extra-tab"
                  type="button"
                >
                  비밀번호 재설정
                </button>
              </div>

              <!-- 아이디 찾기 -->
              <form id="form-find-id" class="auth-form auth-form-sub">
                <p class="auth-sub">가입 시 사용한 이메일을 입력해주세요.</p>
                <div class="field">
                  <span>가입 이메일</span>
                  <input
                    id="fi-email"
                    type="email"
                    placeholder="가입 시 사용한 이메일 주소"
                  />
                </div>
                <button type="submit" class="btn-primary full">
                  아이디 찾기
                </button>
                <p id="find-id-result" class="auth-msg"></p>
              </form>

              <!-- 비밀번호 재설정 -->
              <form
                id="form-reset-password"
                class="auth-form auth-form-sub hidden"
              >
                <p class="auth-sub">아이디와 가입 이메일을 입력해주세요.</p>
                <div class="field">
                  <span>아이디</span>
                  <input
                    id="rp-username"
                    type="text"
                    placeholder="로그인 아이디"
                  />
                </div>
                <div class="field">
                  <span>가입 이메일</span>
                  <input
                    id="rp-email"
                    type="email"
                    placeholder="가입 시 사용한 이메일"
                  />
                </div>
                <button type="submit" class="btn-primary full">
                  비밀번호 재설정 링크 보내기
                </button>
                <p id="reset-password-result" class="auth-msg"></p>
              </form>

              <p class="auth-switch">
                <button
                  type="button"
                  class="text-link-sm"
                  id="btn-back-to-login"
                >
                  로그인 화면으로 돌아가기
                </button>
              </p>
            </div>
          </main>
        </div>
      </section>
    </div>

    <script src="app.js"></script>
  </body>
</html>
