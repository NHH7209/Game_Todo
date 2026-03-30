// ===================== 공통 설정 =====================

// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://loyal-serval-distinctly.ngrok-free.app";

// 닉네임 로딩/저장
function getNickname() {
  try {
    const saved = localStorage.getItem("dxpNickname");
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {}
  return "모험가님";
}

function setNickname(name) {
  try {
    if (name && name.trim()) {
      localStorage.setItem("dxpNickname", name.trim());
    }
  } catch (e) {}
}

function getAuthToken() {
  try {
    return localStorage.getItem("dxpToken");
  } catch (e) {
    return null;
  }
}

// ===================== TOAST 알림 공통 =====================

let toastRoot = null;

function ensureToastRoot() {
  if (toastRoot) return;
  toastRoot = document.createElement("div");
  toastRoot.className = "toast-container";
  document.body.appendChild(toastRoot);
}

function showToast(message, type = "info") {
  ensureToastRoot();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastRoot.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3200);
}

/**
 * 로그인/회원가입 공통 POST 요청
 */
async function sendRequest(endpoint, bodyData) {
  try {
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyData),
    });

    const text = await res.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch (e) {}

    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("Fetch Error:", error);
    return {
      ok: false,
      status: -1,
      data: {
        message: "네트워크 요청 실패 (CORS 설정 또는 서버 상태를 확인하세요)",
      },
    };
  }
}

// ===================== AUTH PAGE (login.jsp) =====================

function initAuthPage() {
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const formLogin = document.getElementById("form-login");
  const formSignup = document.getElementById("form-signup");
  if (!tabLogin || !tabSignup || !formLogin || !formSignup) return;

  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");

  function clearErrors() {
    if (loginError) loginError.textContent = "";
    if (signupError) signupError.textContent = "";
  }

  function showAuthTab(type) {
    clearErrors();
    if (type === "login") {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      formLogin.classList.remove("hidden");
      formSignup.classList.add("hidden");
    } else {
      tabLogin.classList.remove("active");
      tabSignup.classList.add("active");
      formLogin.classList.add("hidden");
      formSignup.classList.remove("hidden");
    }
  }

  tabLogin.addEventListener("click", () => showAuthTab("login"));
  tabSignup.addEventListener("click", () => showAuthTab("signup"));

  const goSignupLink = document.getElementById("go-signup-link");
  const goLoginLink = document.getElementById("go-login-link");
  if (goSignupLink)
    goSignupLink.addEventListener("click", () => showAuthTab("signup"));
  if (goLoginLink)
    goLoginLink.addEventListener("click", () => showAuthTab("login"));

  const authLogo = document.getElementById("auth-logo");
  if (authLogo) {
    authLogo.addEventListener("click", () => {
      window.location.href = "home.jsp";
    });
  }

  const socialBtn = document.getElementById("btn-social-google");
  if (socialBtn) {
    socialBtn.addEventListener("click", () => {
      window.location.href = `${BASE_URL}/user/google`;
    });
  }

// ===== 소셜 로그인 콜백 처리 =====
(async function handleSocialRedirect() {
  const params = new URLSearchParams(window.location.search);
  const social = params.get("social");
  const token = params.get("token");

  // 소셜 로그인으로 들어온 게 아니면 그냥 종료
  if (!social || !token) return;

  // 1) 토큰 저장
  try {
    localStorage.setItem("dxpToken", token);
  } catch (e) {
    console.warn("소셜 토큰 저장 실패:", e);
  }

  // 2) 서버에서 내 정보 한 번 조회해서 닉네임 동기화
  try {
    const res = await fetch(`${BASE_URL}/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });

    const raw = await res.text();
    let data = raw;
    try {
      data = JSON.parse(raw);
    } catch (e) {}

    if (res.ok && data && typeof data === "object") {
      const nick =
        data.nickname ||
        data.name ||
        data.username ||        // 여기서 google_10117... 같은 값이 옴
        "모험가님";

      setNickname(nick);
    } else {
      // 혹시 실패하면 기본값
      setNickname("모험가님");
    }
  } catch (e) {
    console.error("소셜 로그인 후 닉네임 동기화 실패:", e);
    setNickname("모험가님");
  }

  try {
  localStorage.setItem("dxpLoginType", "social");
  } catch (e) {}

  // 3) URL 쿼리 정리
  const newUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, "", newUrl);

  // 4) 대시보드로 이동
  window.location.href = "dashboard.jsp";
})();

  // 로그인
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById("si-username").value.trim();
    const password = document.getElementById("si-password").value.trim();

    if (!username || !password) {
      if (loginError)
        loginError.textContent = "아이디와 비밀번호를 입력해 주세요.";
      return;
    }

    const submitBtn = formLogin.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "로그인 요청 중...";
    }

    const result = await sendRequest("/user/signin", { username, password });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "로그인";
    }

    if (result.ok) {
      const data = result.data;
      let token = null;

      if (typeof data === "string") token = data;
      else if (data && typeof data === "object") token = data.access_token;

      if (token) localStorage.setItem("dxpToken", token);

      try {
        localStorage.setItem("dxpLoginType", "local");
      } catch (e) {}

      setNickname(username);
      window.location.href = "dashboard.jsp";
    } else {
      if (loginError) {
        const msg =
          (result.data && result.data.message) ||
          "로그인에 실패했습니다. 아이디/비밀번호를 확인해 주세요.";
        loginError.textContent = msg;
      } else {
        alert("로그인 실패");
      }
    }
  });

  // 회원가입
  formSignup.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById("su-username").value.trim();
    const email = document.getElementById("su-email").value.trim();
    const password_1 = document.getElementById("su-password-1").value.trim();
    const password_2 = document.getElementById("su-password-2").value.trim();
    const phone = document.getElementById("su-phone").value.trim();
    const address = document.getElementById("su-address").value.trim();

    if (!username || !email || !password_1 || !password_2) {
      if (signupError)
        signupError.textContent = "별표 표시된 필수 항목을 모두 입력해 주세요.";
      return;
    }
    if (password_1 !== password_2) {
      if (signupError)
        signupError.textContent =
          "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
      return;
    }

    const submitBtn = formSignup.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "회원가입 요청 중...";
    }

    const payload = { username, email, password_1, password_2 };
    if (phone) payload.phone = phone;
    if (address) payload.address = address;

    const result = await sendRequest("/user/signup", payload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "회원가입";
    }

    if (result.ok) {
      // 기존 토큰 제거 후 새 계정 자동 로그인
      try {
        localStorage.removeItem("dxpToken");
      } catch (e) {}

      let loginToken = null;
      try {
        const loginResult = await sendRequest("/user/signin", {
          username,
          password: password_1,
        });

        if (loginResult.ok) {
          const loginData = loginResult.data;
          if (typeof loginData === "string") loginToken = loginData;
          else if (loginData && typeof loginData === "object")
            loginToken = loginData.access_token;
        }
      } catch (e) {
        console.warn("자동 로그인 중 오류:", e);
      }

      if (loginToken) {
        try {
          localStorage.setItem("dxpToken", loginToken);
          localStorage.setItem("dxpLoginType", "local");
        } catch (e) {}
      }

      setNickname(username);
      window.location.href = "dashboard.jsp";
    } else {
      if (signupError) {
        const msg =
          (result.data && result.data.message) ||
          "회원가입에 실패했습니다. 입력값을 확인해 주세요.";
        signupError.textContent = msg;
      } else {
        alert("회원가입 실패");
      }
    }
  });

  // 아이디/비번 찾기 뷰 전환
  const authViewMain = document.getElementById("auth-view-main");
  const authViewFind = document.getElementById("auth-view-find");
  const openFindBtn = document.getElementById("btn-open-find-account");
  const backToLoginBtn = document.getElementById("btn-back-to-login");

  const tabFindId = document.getElementById("tab-find-id");
  const tabResetPwd = document.getElementById("tab-reset-password");
  const formFindId = document.getElementById("form-find-id");
  const formResetPwd = document.getElementById("form-reset-password");

  const fiEmailInput = document.getElementById("fi-email");
  const fiResultEl = document.getElementById("find-id-result");

  const rpUsernameInput = document.getElementById("rp-username");
  const rpEmailInput = document.getElementById("rp-email");
  const rpResultEl = document.getElementById("reset-password-result");

  function switchFindTab(type) {
    if (!tabFindId || !tabResetPwd || !formFindId || !formResetPwd) return;

    if (type === "find-id") {
      tabFindId.classList.add("active");
      tabResetPwd.classList.remove("active");
      formFindId.classList.remove("hidden");
      formResetPwd.classList.add("hidden");
    } else {
      tabFindId.classList.remove("active");
      tabResetPwd.classList.add("active");
      formFindId.classList.add("hidden");
      formResetPwd.classList.remove("hidden");
    }

    if (fiResultEl) fiResultEl.textContent = "";
    if (rpResultEl) rpResultEl.textContent = "";
  }

  if (tabFindId)
    tabFindId.addEventListener("click", () => switchFindTab("find-id"));
  if (tabResetPwd)
    tabResetPwd.addEventListener("click", () => switchFindTab("reset"));

  if (openFindBtn && authViewMain && authViewFind) {
    openFindBtn.addEventListener("click", () => {
      authViewMain.classList.add("hidden");
      authViewFind.classList.remove("hidden");
      switchFindTab("find-id");
    });
  }

  if (backToLoginBtn && authViewMain && authViewFind) {
    backToLoginBtn.addEventListener("click", () => {
      authViewFind.classList.add("hidden");
      authViewMain.classList.remove("hidden");
    });
  }

  // 아이디 찾기
  if (formFindId) {
    formFindId.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (fiResultEl) fiResultEl.textContent = "";

      const email = fiEmailInput.value.trim();
      if (!email) {
        if (fiResultEl) fiResultEl.textContent = "이메일을 입력해 주세요.";
        return;
      }

      const submitBtn = formFindId.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "메일 전송 중...";
      }

      const result = await sendRequest("/user/find-id", { email });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "아이디 찾기";
      }

      if (result.ok) {
        const msg =
          (result.data && result.data.message) ||
          "가입하신 이메일로 아이디 정보를 전송했습니다.";
        if (fiResultEl) fiResultEl.textContent = msg;
        // 토스트 알림 (아래에서 추가할 showToast 사용)
        showToast("아이디 찾기 메일을 전송했습니다.", "success");
      } else {
        const msg =
          (result.data && result.data.message) || "아이디 찾기에 실패했습니다.";
        if (fiResultEl) fiResultEl.textContent = msg;
        showToast(msg, "error");
      }
    });
  }

  // 비밀번호 재설정
  if (formResetPwd) {
    formResetPwd.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (rpResultEl) rpResultEl.textContent = "";

      const username = rpUsernameInput.value.trim();
      const email = rpEmailInput.value.trim();

      if (!username || !email) {
        if (rpResultEl)
          rpResultEl.textContent = "아이디와 이메일을 모두 입력해 주세요.";
        return;
      }

      const submitBtn = formResetPwd.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "요청 중...";
      }

      const result = await sendRequest("/user/reset-password", {
        username,
        email,
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "비밀번호 재설정 링크 보내기";
      }

      if (result.ok) {
        const msg =
          (result.data && result.data.message) ||
          "비밀번호 재설정 메일을 발송했습니다.";
        if (rpResultEl) rpResultEl.textContent = msg;
        showToast("비밀번호 재설정 메일을 전송했습니다.", "success");
      } else {
        const msg =
          (result.data && result.data.message) ||
          "비밀번호 재설정 요청에 실패했습니다.";
        if (rpResultEl) rpResultEl.textContent = msg;
        showToast(msg, "error");
      }
    });
  }
}

// ===================== DASHBOARD PAGE (dashboard.jsp) =====================

function initDashboardPage() {
  // 헤더/사이드바
  const dashboardTitle = document.getElementById("dashboard-title");
  const dashboardSubtitle = document.getElementById("dashboard-subtitle");
  const characterNameEl = document.getElementById("character-name");
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const views = {
    dashboard: document.getElementById("view-dashboard"),
    quests: document.getElementById("view-quests"),
    achievements: document.getElementById("view-achievements"),
    skills: document.getElementById("view-skills"),
    shop: document.getElementById("view-shop"),
    stats: document.getElementById("view-stats"),
    settings: document.getElementById("view-settings"),
    profile: document.getElementById("view-profile"),
  };

  if (!dashboardTitle || !dashboardSubtitle || !characterNameEl) return;

  // ===== 통계 상태 =====
  const statsSummaryEl = document.getElementById("stats-summary");
  const statsRawEl = document.getElementById("stats-raw");

  const statState = {
    attendance: { totalDays: 0, streak: 0 },
    quest: {
      total: 0,
      completed: 0,
      rate: 0,
      todayCompleted: 0
    },
  };

  function renderStatsSummary() {
    if (!statsSummaryEl) return;
    const { totalDays, streak } = statState.attendance;
    const { total, completed, rate, todayCompleted } =
      statState.quest;

    statsSummaryEl.innerHTML = `
      <div class="stat-card">
        <h3 class="section-label">출석 통계</h3>
        <p>총 출석일: <strong>${totalDays}</strong>일</p>
        <p>현재 연속 출석: <strong>${streak}</strong>일</p>
      </div>

      <div class="stat-card">
        <h3 class="section-label">퀘스트 통계</h3>
        <p>전체 퀘스트: <strong>${total}</strong>개</p>
        <p>누적 완료: <strong>${completed}</strong>개</p>
        <p>완료율: <strong>${rate}</strong>%</p>
        <p>오늘 완료: <strong>${todayCompleted}</strong>개</p>
      </div>
    `;
  }

  function parseDateOnly(value) {
    if (!value) return null;

    if (typeof value === "string" && value.length === 10) {
      const [y, m, d] = value.split("-");
      const date = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
      if (!Number.isNaN(date.getTime())) return date;
    }

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // ===== 출석 통계 =====
  async function fetchAttendanceStats() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 출석 통계를 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/record/attendance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      if (!res.ok) {
        console.error("출석 통계 로드 실패:", data);
        return;
      }

      // ✅ 1) 백엔드에서 합계/스트릭을 바로 내려주는 케이스
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const totalDays =
          data.totalDays ??
          data.total ??
          data.attendanceDays ??
          data.totalAttendance ??
          0;
        const streak =
          data.streak ?? data.currentStreak ?? data.continuousDays ?? 0;

        statState.attendance.totalDays = Number(totalDays) || 0;
        statState.attendance.streak = Number(streak) || 0;

        if (statsRawEl) {
          statsRawEl.textContent = JSON.stringify(
            { attendance: data },
            null,
            2
          );
        }

        renderStatsSummary();
        return;
      }

      // ✅ 2) 이전처럼 "출석 기록 배열"만 내려주는 케이스 (호환용)
      if (!Array.isArray(data) && data && typeof data === "object") {
        const candidate = Object.values(data).find((v) => Array.isArray(v));
        if (Array.isArray(candidate)) data = candidate;
      }

      if (!Array.isArray(data)) {
        console.warn(
          "출석 통계 응답 형식이 배열도, 요약 객체도 아닙니다:",
          data
        );
        return;
      }

      const dateMap = new Map();
      data.forEach((r) => {
        const date =
          parseDateOnly(r.date) ||
          parseDateOnly(r.timestamp) ||
          parseDateOnly(r.createdAt) ||
          parseDateOnly(r);
        if (!date) return;
        const key = formatDateKeyFromDate(date);
        if (!dateMap.has(key)) dateMap.set(key, date);
      });

      const uniqueDates = Array.from(dateMap.values());
      const totalDays = uniqueDates.length;

      let streak = 0;
      if (uniqueDates.length > 0) {
        uniqueDates.sort((a, b) => a - b);

        // 마지막 날부터 거꾸로 내려가면서 연속 일수 계산
        streak = 1;
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const current = uniqueDates[i];
          const next = uniqueDates[i + 1];
          const diff =
            (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);

          if (diff === 1) streak += 1;
          else break;
        }
      }

      statState.attendance.totalDays = totalDays;
      statState.attendance.streak = streak;

      if (statsRawEl) {
        statsRawEl.textContent = JSON.stringify({ attendance: data }, null, 2);
      }

      renderStatsSummary();
    } catch (err) {
      console.error("출석 통계 불러오는 중 오류:", err);
    }
  }

  // ===== 퀘스트 통계 =====
  async function fetchQuestStats() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 퀘스트 통계를 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/record/quest`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      if (!res.ok) {
        console.error("퀘스트 통계 로드 실패:", data);
        return;
      }

      if (!Array.isArray(data) && data && typeof data === "object") {
        const arrCandidate = Object.values(data).find((v) => Array.isArray(v));
        if (Array.isArray(arrCandidate)) data = arrCandidate;
      }

      let total = 0;
      let completed = 0;
      let todayCompleted = 0;
      let todayRate = 0;

      if (Array.isArray(data)) {
        total = data.length;
        completed = data.filter((r) => {
          return (
            r.isCompleted === true ||
            r.completed === true ||
            r.status === "COMPLETED"
          );
        }).length;
        todayCompleted = completed;
        todayRate = total > 0 ? Math.round((todayCompleted / total) * 100) : 0;
      } else if (data && typeof data === "object") {
        const base = data.summary ?? data;

        completed =
          base.completedQuests ??
          base.completed ??
          base.completedCount ??
          base.totalCompleted ??
          0;

        total =
          base.totalQuests ??
          base.total ??
          base.assigned ??
          base.totalCount ??
          completed;

        const todayBase = base.today ?? base.daily ?? base;
        todayCompleted =
          todayBase.completedToday ??
          todayBase.todayCompleted ??
          todayBase.todayDone ??
          completed;

        todayRate = total > 0 ? Math.round((todayCompleted / total) * 100) : 0;
      }

      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      statState.quest.total = total;
      statState.quest.completed = completed;
      statState.quest.rate = rate;
      statState.quest.todayCompleted = todayCompleted;
      statState.quest.todayRate = todayRate;

      if (statsRawEl) {
        const prev =
          (statsRawEl.textContent && JSON.parse(statsRawEl.textContent)) || {};
        statsRawEl.textContent = JSON.stringify(
          { ...prev, quest: data },
          null,
          2
        );
      }

      renderStatsSummary();
    } catch (err) {
      console.error("퀘스트 통계 불러오는 중 오류:", err);
    }
  }

  // ===== 상단 인사 문구 =====
  function updateGreeting(activeView) {
    const nick = getNickname();
    let title = "";
    let sub = "";

    switch (activeView) {
      case "quests":
        title = "퀘스트 관리";
        sub = "오늘·이번 주 퀘스트를 한 곳에서 관리해보세요.";
        break;
      case "achievements":
        title = "업적";
        sub = "완료한 퀘스트와 경험치를 기반으로 업적을 달성해보세요.";
        break;
      case "skills":
        title = "스킬";
        sub = "획득한 자격증과 능력을 스킬처럼 모아볼 수 있어요.";
        break;
      case "shop":
        title = "상점";
        sub = "골드로 다양한 꾸미기 아이템을 구매할 수 있습니다.";
        break;
      case "stats":
        title = "통계";
        sub = "퀘스트 완료 패턴을 확인하고 루틴을 더 단단하게 만들어보세요.";
        break;
      case "settings":
        title = "설정";
        sub = "알림, 테마, 언어 등 환경을 내 스타일로 바꿔보세요.";
        break;
      case "profile":
        title = "프로필";
        sub = "나의 캐릭터와 계정 정보를 관리하는 공간입니다.";
        break;
      case "dashboard":
      default:
        title = `안녕하세요, ${nick}.`;
        sub = "오늘의 퀘스트를 완수하고, 한 단계 더 레벨업해 보세요.";
        break;
    }

    dashboardTitle.textContent = title;
    dashboardSubtitle.textContent = sub;
    characterNameEl.textContent = nick === "모험가님" ? "용감한 모험가" : nick;
  }

  sidebarItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewName = btn.dataset.view;

      sidebarItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      Object.entries(views).forEach(([key, node]) => {
        if (!node) return;
        if (key === viewName) node.classList.remove("hidden");
        else node.classList.add("hidden");
      });

      updateGreeting(viewName);

      if (viewName === "quests") ensureManageQuestsLoaded();
      if (viewName === "skills" && skillsCache.length === 0) fetchMySkills();
      if (viewName === "shop") ensureShopLoaded();
      if (viewName === "profile") {
        fetchProfile();
        fetchInventory();
        if (!achievementsCache.length) fetchAchievements(); // 프로필용 업적 데이터
        if (!skillsCache.length) fetchMySkills();           // 킬도 로딩
      }
      if (viewName === "settings") loadSettings();
      if (viewName === "achievements") fetchAchievements();
    });
  });

  // ===== 경험치 / 골드 / 젬 =====
  let xp = 0;
  let gold = 0;
  let gem = 0;

  function renderStats() {
    document.querySelectorAll(".stat-xp").forEach((el) => {
      el.textContent = `${xp} XP`;
    });
    document.querySelectorAll(".stat-gold").forEach((el) => {
      el.textContent = `${gold} G`;
    });
    document.querySelectorAll(".stat-gem").forEach((el) => {
      el.textContent = `${gem} ◇`;
    });
  }

  async function fetchUserProfile() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 프로필을 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/user/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      if (!res.ok) {
        console.warn("프로필 로드 실패:", data);
        return;
      }

      xp = data.exp ?? xp;
      gold = data.gold ?? gold;
      gem = data.gem ?? gem;

      renderStats();
    } catch (err) {
      console.error("프로필 데이터를 불러오는 중 오류:", err);
    }
  }

  // ===== 업적 =====
  const achievementListEl = document.getElementById("achievement-list");
  let achievementsCache = [];
  let lastCompletedAchievementIds = new Set();

  function renderAchievementList() {
    if (!achievementListEl) return;

    achievementListEl.innerHTML = "";

    if (!achievementsCache || achievementsCache.length === 0) {
      achievementListEl.innerHTML =
        `<p class="empty-text">아직 등록된 업적이 없습니다.</p>`;
      return;
    }

    achievementsCache.forEach((ach) => {
      const li = document.createElement("article");
      li.className = "achievement-card";

      const imageUrl = (() => {
        const img =
          ach.badgeImage ||
          ach.badge_image ||
          ach.image ||
          ach.icon ||
          "";
        if (!img) return "";
        if (img.startsWith("http")) return img;
        return `${BASE_URL}${img.startsWith("/") ? img : `/${img}`}`;
      })();

      const statusLabel = !ach.completed
        ? "미달성"
        : ach.isEquipped
        ? "뱃지 장착 중"
        : "업적 완료";

      const statusClass = !ach.completed
        ? ""
        : ach.isEquipped
        ? "completed equipped"
        : "completed";

      const buttonHtml = "";

      li.innerHTML = `
        <div class="achievement-main">
          <div class="achievement-thumb">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${ach.name}" class="achievement-image" />`
                : `<div class="achievement-placeholder">?</div>`
            }
          </div>
          <div class="achievement-text">
            <h4 class="achievement-title">${ach.name || "이름 없는 업적"}</h4>
            <p class="achievement-desc">${ach.description || ""}</p>
          </div>
        </div>
        <div class="achievement-right">
          <span class="achievement-status ${statusClass}">
            ${statusLabel}
          </span>
          ${buttonHtml}
        </div>
      `;

      achievementListEl.appendChild(li);
    });
  }


  // ===================== 업적 =====================
  async function fetchAchievements() {
    if (!achievementListEl) return;

    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 업적을 불러올 수 없습니다.");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      };

      const [allRes, myRes] = await Promise.all([
        fetch(`${BASE_URL}/achievement`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
        fetch(`${BASE_URL}/achievement/my`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
      ]);

      let allRaw = await allRes.text();
      let myRaw = await myRes.text();
      let allData = allRaw;
      let myData = myRaw;

      try {
        allData = JSON.parse(allRaw);
      } catch (e) {}
      try {
        myData = JSON.parse(myRaw);
      } catch (e) {}

      if (!Array.isArray(allData)) allData = [];
      if (!Array.isArray(myData)) myData = [];

            // myData = userAchievement 배열이라고 가정
      // 1) 달성 여부
      const completedSet = new Set();
      // 2) 장착 여부 + userAchievementId 저장
      const equippedMap = new Map();

      myData.forEach((ua) => {
        const ach = ua.achievement || ua;

        const achievementId =
          ua.achievementId ??
          ua.achievement_id ??
          ach.id ??
          ua.id;

        if (achievementId == null) return;

        // 이 업적은 내 계정에서 달성됨
        completedSet.add(achievementId);

        const isEquipped =
          ua.isEquipped ??
          ua.is_equipped ??
          ua.equipped ??
          false;

        equippedMap.set(achievementId, {
          isEquipped: !!isEquipped,
          userAchievementId: ua.id ?? ua.userAchievementId ?? null,
        });
      });

      // 전체 업적 + completed, isEquipped, userAchievementId 합치기
      achievementsCache = allData.map((a) => {
        const ach = a.achievement || a;
        const achievementId =
          ach.id ??
          a.id ??
          a.achievementId ??
          a.achievement_id;

        const meta = equippedMap.get(achievementId) || {};
        const completed = completedSet.has(achievementId);
        const isEquipped =
          meta.isEquipped ??
          ach.isEquipped ??
          ach.is_equipped ??
          false;

        return {
          ...ach,
          id: achievementId,
          completed,
          isEquipped,
          userAchievementId: meta.userAchievementId ?? null,
        };
      });

      renderAchievementList();       // 업적 탭 리스트
      renderProfileAchievements();   // 프로필 탭용 업적 리스트도 같이 갱신

    } catch (err) {
      console.error("업적 정보를 불러오는 중 오류:", err);
    }
  }

  // ===== 스킬 =====
  const skillsListEl = document.getElementById("skills-list");
  let skillsCache = [];

  function renderSkillList() {
    if (!skillsListEl) return;

    if (!skillsCache.length) {
      skillsListEl.innerHTML =
        '<p class="empty-text">아직 획득한 스킬이 없어요.</p>';
      return;
    }

    skillsListEl.innerHTML = "";

    skillsCache.forEach((skill) => {
      const name =
        skill.name || skill.title || `스킬 #${skill.id ?? skill._id}`;
      const desc = skill.description || "";
      const icon = skill.icon || "🎖️";

      const card = document.createElement("article");
      card.className = "achievement-card skill-card";
      // ✅ 하이라이트 대상 찾기 위해 data-skill-id 달아두기
      if (skill.id != null) {
        card.dataset.skillId = String(skill.id);
      }

      card.innerHTML = `
      <div class="skill-main">
        <div class="skill-icon">${icon}</div>
        <div>
          <div class="achievement-main-title">${name}</div>
          <p class="achievement-desc">${desc}</p>
        </div>
      </div>
      <span class="skill-tag">보유</span>
    `;

      skillsListEl.appendChild(card);
    });
  }

  async function fetchMySkills() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 스킬 목록을 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/skill/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      // ------------------------------
      // ⭐ 백엔드 응답 형태 호환 처리
      //    백엔드에서 skill 배열을 어떤 이름으로 보내든 자동 처리
      // ------------------------------
      let list = [];

      if (Array.isArray(data)) {
        // 케이스 ① 응답이 배열
        list = data;
      } else if (data && typeof data === "object") {
        // 케이스 ② 응답이 객체 형태 → 내부에서 Array를 찾아서 추출
        list =
          data.skills ||                 // { skills: [...] }
          data.list ||                   // { list: [...] }
          Object.values(data).find((v) => Array.isArray(v)) || // 객체 내부 배열
          [];
      }

      // 스킬 캐시 적용
      skillsCache = list.map((item) => {
        const s = item.skill ?? item;
        return {
          id: s.id,
          name: s.name,
          description: s.description,
          icon: s.icon || "🎖️",
        };
      });

      renderSkillList();            // 스킬 탭
      renderProfileSkillsSummary(); // 프로필 상단 "보유 스킬"도 같이 업데이트

    } catch (err) {
      console.error("스킬 목록 불러오는 중 오류:", err);
      skillsListEl.innerHTML =
        '<p class="empty-text">스킬 목록을 불러오지 못했습니다.</p>';
    }
  }


  // ===================== 상점 & 인벤토리 =====================

  const shopListEl = document.getElementById("shop-list");
  const shopEmptyEl = document.getElementById("shop-empty");
  const shopLoadingEl = document.getElementById("shop-loading");

  const inventoryListEl = document.getElementById("inventory-list");
  const inventoryEmptyEl = document.getElementById("inventory-empty");
  const inventoryLoadingEl = document.getElementById("inventory-loading");

  let shopItems = [];
  let inventoryItems = [];
  let shopLoaded = false;

  function renderShopList() {
    if (!shopListEl) return;

    shopListEl.innerHTML = "";

    if (!shopItems.length) {
      if (shopEmptyEl) shopEmptyEl.classList.remove("hidden");
      return;
    }
    if (shopEmptyEl) shopEmptyEl.classList.add("hidden");

    shopItems.forEach((item) => {
      const card = document.createElement("article");
      card.className = "shop-item-card";

      const name =
        item.name || item.title || `아이템 #${item.id ?? item._id ?? "?"}`;
      const desc = item.description || item.desc || "";
      const price = item.price ?? item.cost ?? item.gold ?? 0;
      const rarity = item.rarity || item.grade || "common";

      // 🔹 서버에서 내려주는 이미지 경로 처리
      const imageRaw = item.image || item.icon || item.thumbnail || "";
      let imageUrl = "";
      if (imageRaw) {
        if (imageRaw.startsWith("http")) {
          // 이미 완전한 URL이면 그대로 사용
          imageUrl = imageRaw;
        } else {
          // "/images/a.png" 같은 상대 경로일 경우 BASE_URL 붙이기
          imageUrl =
            `${BASE_URL}` +
            (imageRaw.startsWith("/") ? imageRaw : `/${imageRaw}`);
        }
      }

      card.innerHTML = `
      <div class="shop-item-main">
        <div class="shop-item-left">
          <div class="shop-item-thumb">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${name}" class="shop-item-image" />`
                : `<div class="shop-item-placeholder">?</div>`
            }
          </div>
          <div class="shop-item-text">
            <div class="shop-item-title-row">
              <h3 class="shop-item-name">${name}</h3>
              <span class="shop-item-badge shop-item-badge-${rarity}">
                ${rarity.toUpperCase()}
              </span>
            </div>
            <p class="shop-item-desc">${desc}</p>
          </div>
        </div>
        <div class="shop-item-right">
          <p class="shop-item-price">${price} G</p>
          <button
            class="btn-primary btn-sm shop-buy-btn"
            type="button"
            data-id="${item.id}"
            data-price="${price}"
          >
            구매
          </button>
        </div>
      </div>
    `;

      shopListEl.appendChild(card);
    });
  }

  function renderInventoryList() {
    if (!inventoryListEl) return;

    inventoryListEl.innerHTML = "";

    if (!inventoryItems.length) {
      if (inventoryEmptyEl) inventoryEmptyEl.classList.remove("hidden");
      return;
    }
    if (inventoryEmptyEl) inventoryEmptyEl.classList.add("hidden");

    inventoryItems.forEach((inv) => {
      const item = inv.item || inv.shopItem || inv;
      const name =
        item.name || item.title || `아이템 #${item.id ?? inv.id ?? "?"}`;
      const desc = item.description || item.desc || "";
      const quantity = inv.quantity ?? inv.count ?? 1;
      const imageRaw = item.image || item.icon || item.thumbnail || "";
      let imageUrl = "";
      if (imageRaw) {
        if (imageRaw.startsWith("http")) {
          imageUrl = imageRaw;
        } else {
          imageUrl =
            `${BASE_URL}` +
            (imageRaw.startsWith("/") ? imageRaw : `/${imageRaw}`);
        }
      }

      const li = document.createElement("article");
      li.className = "inventory-item-card";
      li.innerHTML = `
      <div class="inventory-item-main">
        <div class="inventory-item-left">
          <div class="inventory-item-thumb">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${name}" class="inventory-item-image" />`
                : `<div class="inventory-item-placeholder">?</div>`
            }
          </div>
          <div class="inventory-item-text">
            <p class="inventory-item-name">${name}</p>
            <p class="inventory-item-desc">${desc}</p>
          </div>
        </div>
        <div class="inventory-item-meta">
          <span class="inventory-item-qty">x${quantity}</span>
        </div>
      </div>
    `;
      inventoryListEl.appendChild(li);
    });
  }

  async function fetchShopItems() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 상점 데이터를 불러올 수 없습니다.");
      return;
    }

    try {
      if (shopLoadingEl) shopLoadingEl.classList.remove("hidden");

      const res = await fetch(`${BASE_URL}/shop`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      if (!res.ok) {
        console.error("상점 목록 로드 실패:", data);
        shopItems = [];
        renderShopList();
        return;
      }

      if (Array.isArray(data)) {
        shopItems = data;
      } else if (data && typeof data === "object") {
        const arr =
          data.items ||
          data.list ||
          Object.values(data).find((v) => Array.isArray(v)) ||
          [];
        shopItems = arr;
      } else {
        shopItems = [];
      }

      renderShopList();
    } catch (err) {
      console.error("상점 목록 불러오는 중 오류:", err);
    } finally {
      if (shopLoadingEl) shopLoadingEl.classList.add("hidden");
    }
  }

  async function fetchInventory() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 인벤토리를 불러올 수 없습니다.");
      return;
    }

    try {
      if (inventoryLoadingEl) inventoryLoadingEl.classList.remove("hidden");

      const res = await fetch(`${BASE_URL}/shop/my-inventory`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      if (!res.ok) {
        console.error("인벤토리 로드 실패:", data);
        inventoryItems = [];
        renderInventoryList();
        renderProfileInventory();

        // 🔹 장착 슬롯(캐릭터/펫)도 전부 비우기
        updateEquippedFromInventory();
        renderProfileEquipSlotsFromInventory();
        return;
      }

      if (Array.isArray(data)) {
        inventoryItems = data;
      } else if (data && Array.isArray(data.items)) {
        inventoryItems = data.items;
      } else {
        inventoryItems = [];
      }

      renderInventoryList();
      renderProfileInventory();

      // 🔹 인벤토리에 있는 isEquipped + equipSlot 기준으로 캐릭터/펫 찾기
      updateEquippedFromInventory();
      renderProfileEquipSlotsFromInventory();
    } catch (err) {
      console.error("인벤토리 불러오는 중 오류:", err);
    } finally {
      if (inventoryLoadingEl) inventoryLoadingEl.classList.add("hidden");
    }
  }

  async function ensureShopLoaded() {
    if (shopLoaded) return;
    await Promise.all([fetchShopItems(), fetchInventory()]);
    shopLoaded = true;
  }

  // 상점 구매
  if (shopListEl) {
    shopListEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".shop-buy-btn");
      if (!btn) return;

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const itemId = btn.dataset.id;
      const price = parseInt(btn.dataset.price || "0", 10);

      const ok = confirm(
        `이 아이템을 ${price} 골드에 구매하시겠어요?\n(골드가 충분하지 않으면 서버에서 거절될 수 있습니다.)`
      );
      if (!ok) return;

      btn.disabled = true;
      btn.textContent = "구매 중...";

      try {
        const res = await fetch(`${BASE_URL}/shop/${itemId}/buy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({}),
        });

        const raw = await res.text();
        let data = raw;
        try {
          data = JSON.parse(raw);
        } catch (e) {}

        if (!res.ok) {
          const msg =
            (data && data.message) ||
            "구매에 실패했습니다. 잔액을 확인해 주세요.";
          showToast(msg, "error"); // ✅ 실패 알림
          return;
        }

        await Promise.all([fetchUserProfile(), fetchInventory()]);
        showToast(
          "아이템을 구매했습니다! 인벤토리가 업데이트되었어요.",
          "success"
        );
      } catch (err) {
        console.error("아이템 구매 중 오류:", err);
        showToast("구매 처리 중 오류가 발생했습니다.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "구매";
      }
    });
  }

  // ===================== 프로필 =====================

  const profileNicknameEl = document.getElementById("profile-nickname");
  const profileLevelEl = document.getElementById("profile-level");
  const profileXpEl = document.getElementById("profile-xp");
  const profileGoldEl = document.getElementById("profile-gold");
  const profileGemEl = document.getElementById("profile-gem");
  const profileCharacterEl = document.getElementById("profile-character");
  const profileBadgeEl = document.getElementById("profile-badge");
  const profileFrameEl = document.getElementById("profile-frame");
  const profileMainCharImg = document.getElementById("character-avatar-img");
  const profileMainCharEmpty = document.getElementById("character-avatar-empty");
    // 프로필 > 보유 스킬 / 업적 리스트
  const profileSkillsTextEl = document.getElementById("profile-skills-text");
  const profileAchievementListEl = document.getElementById("profile-achievement-list");



  // 🔹 캐릭터 슬롯 DOM
  const profileEquipCharSlotEl = document.getElementById("profile-equip-char");
  const profileEquipCharPlaceholderEl = document.getElementById(
    "profile-equip-char-placeholder"
  );
  const profileEquipCharContentEl = document.getElementById(
    "profile-equip-char-content"
  );
  const profileEquipCharNameEl = document.getElementById(
    "profile-equip-char-name"
  );
  const profileEquipCharDescEl = document.getElementById(
    "profile-equip-char-desc"
  );
  const btnProfileUnequipChar = document.getElementById(
    "btn-profile-unequip-char"
  );

  // 🔹 펫 슬롯 DOM
  const profileEquipPetSlotEl = document.getElementById("profile-equip-pet");
  const profileEquipPetPlaceholderEl = document.getElementById(
    "profile-equip-pet-placeholder"
  );
  const profileEquipPetContentEl = document.getElementById(
    "profile-equip-pet-content"
  );
  const profileEquipPetNameEl = document.getElementById(
    "profile-equip-pet-name"
  );
  const profileEquipPetDescEl = document.getElementById(
    "profile-equip-pet-desc"
  );
  const btnProfileUnequipPet = document.getElementById(
    "btn-profile-unequip-pet"
  );

  // 프로필 탭 인벤토리 (캐릭터 / 펫 분리)
  const profileInventoryListCharEl = document.getElementById(
    "profile-inventory-list-char"
  );
  const profileInventoryListPetEl = document.getElementById(
    "profile-inventory-list-pet"
  );
  const profileInventoryEmptyEl = document.getElementById(
    "profile-inventory-empty"
  );

  let profileData = null;
  // 슬롯별 현재 장착 상태
  let equippedCharacter = null;
  let equippedPet = null;

  // 나의 캐릭터 아바타 이미지를 업데이트
  function updateMainCharacterAvatar() {
    if (!profileMainCharImg && !profileMainCharEmpty) return;

    // 1) 장착된 캐릭터 찾기 (인벤토리 기준)
    let imageRaw = "";
    let name = "";

    if (equippedCharacter) {
      const item =
        equippedCharacter.item ||
        equippedCharacter.shopItem ||
        equippedCharacter;

      imageRaw =
        item.image || item.icon || item.thumbnail || item.imageUrl || "";
      name = item.name || "";
    } else if (profileData && profileData.character) {
      // 2) 프로필 기본 캐릭터가 있다면 사용
      const c = profileData.character;
      imageRaw = c.image || c.icon || c.thumbnail || c.imageUrl || "";
      name = c.name || "";
    }

    // 캐릭터가 아예 없을 때 → 이미지 숨기고 문구만 보여주기
    if (!imageRaw) {
      if (profileMainCharImg) {
        profileMainCharImg.classList.add("hidden");
      }
      if (profileMainCharEmpty) {
        profileMainCharEmpty.classList.remove("hidden");
      }
      return;
    }

    // 캐릭터 이미지가 있을 때 → 이미지 보이고 문구 숨기기
    const fullUrl = imageRaw.startsWith("http")
      ? imageRaw
      : `${BASE_URL}${
          imageRaw.startsWith("/") ? imageRaw : "/" + imageRaw
        }`;

    if (profileMainCharImg) {
      profileMainCharImg.src = fullUrl;
      profileMainCharImg.alt = name || "장착된 캐릭터";
      profileMainCharImg.classList.remove("hidden");
    }
    if (profileMainCharEmpty) {
      profileMainCharEmpty.classList.add("hidden");
    }

    // 이름/레벨도 있으면 같이 업데이트 (선택)
    if (name && document.getElementById("character-name")) {
      document.getElementById("character-name").textContent = name;
    }
  }

    function calcLevelFromXp(xpVal) {
      const xpNum = Number(xpVal) || 0;
      return Math.floor(xpNum / 100) + 1;
    }

      // 프로필 상단 "내 정보" 영역 렌더링
  function renderProfile() {
    const nick = getNickname();
    if (profileNicknameEl) profileNicknameEl.textContent = nick;

    // 1) /profile 응답 값 우선, 없으면 /user/me에서 관리하는 전역 값 사용
    const xpFromProfile =
      profileData &&
      (profileData.exp ??
        profileData.xp ??
        profileData.experience ??
        null);
    const goldFromProfile =
      profileData &&
      (profileData.gold ??
        profileData.coins ??
        profileData.money ??
        null);
    const gemFromProfile =
      profileData &&
      (profileData.gem ??
        profileData.gems ??
        profileData.diamond ??
        profileData.jewel ??
        null);

    // 실제로 사용할 값 (숫자로 정리)
    xp = Number(xpFromProfile ?? xp ?? 0) || 0;
    gold = Number(goldFromProfile ?? gold ?? 0) || 0;
    gem = Number(gemFromProfile ?? gem ?? 0) || 0;

    const level = calcLevelFromXp(xp);

    if (profileLevelEl) profileLevelEl.textContent = `Lv. ${level}`;
    if (profileXpEl) profileXpEl.textContent = `${xp} XP`;
    if (profileGoldEl) profileGoldEl.textContent = `${gold} G`;
    if (profileGemEl) profileGemEl.textContent = `${gem} ◇`;

    // 헤더/다른 곳에 있는 공통 재화 표시도 같이 맞춰주기
    renderStats();

    // 캐릭터 아바타도 최신 상태로
    updateMainCharacterAvatar();
  }


    // 프로필 상단에 "보유 스킬" 텍스트로 표시
    function renderProfileSkillsSummary() {
      if (!profileSkillsTextEl) return;

      if (!skillsCache || skillsCache.length === 0) {
        profileSkillsTextEl.textContent = "보유 스킬이 없습니다.";
        return;
      }

      const names = skillsCache
        .map((s) => s.name || s.title)
        .filter(Boolean);

      if (!names.length) {
        profileSkillsTextEl.textContent = "보유 스킬이 없습니다.";
        return;
      }

      profileSkillsTextEl.textContent = names.join(", ");
    }

  // 프로필 > 달성한 업적(뱃지) 목록 + 장착/해제 버튼
  function renderProfileAchievements() {
    if (!profileAchievementListEl) return;

    profileAchievementListEl.innerHTML = "";

    if (!achievementsCache || achievementsCache.length === 0) {
      profileAchievementListEl.innerHTML =
        '<p class="empty-text">달성한 업적이 없습니다.</p>';
      return;
    }

    // 달성한 것만 모아서 표시
    const myList = achievementsCache.filter((a) => a.completed);
    if (!myList.length) {
      profileAchievementListEl.innerHTML =
        '<p class="empty-text">달성한 업적이 없습니다.</p>';
      return;
    }

    myList.forEach((ach) => {
      const imageUrl = (() => {
        const img =
          ach.badgeImage ||
          ach.badge_image ||
          ach.image ||
          ach.icon ||
          "";
        if (!img) return "";
        if (img.startsWith("http")) return img;
        return `${BASE_URL}${img.startsWith("/") ? img : `/${img}`}`;
      })();

      const card = document.createElement("article");
      card.className = "achievement-card profile-achievement-card";

      card.innerHTML = `
        <div class="achievement-main">
          <div class="achievement-thumb">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${ach.name}" class="achievement-image" />`
                : `<div class="achievement-placeholder">?</div>`
            }
          </div>
          <div class="achievement-text">
            <h4 class="achievement-title">${ach.name || "이름 없는 업적"}</h4>
            <p class="achievement-desc">${ach.description || ""}</p>
          </div>
        </div>
        <div class="achievement-right">
          <span class="achievement-status ${
            ach.isEquipped ? "completed equipped" : "completed"
          }">
            ${ach.isEquipped ? "뱃지 장착 중" : "업적 완료"}
          </span>
          <button
            type="button"
            class="btn-secondary btn-xs profile-achievement-equip-btn"
            data-user-achievement-id="${ach.userAchievementId ?? ""}"
            data-achievement-id="${ach.id}"
            data-equipped="${ach.isEquipped ? "true" : "false"}"
          >
            ${ach.isEquipped ? "해제" : "뱃지 장착"}
          </button>
        </div>
      `;

      profileAchievementListEl.appendChild(card);
    });
  }

  // 프로필 업적에서 장착/해제 클릭 처리
  if (profileAchievementListEl) {
    profileAchievementListEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".profile-achievement-equip-btn");
      if (!btn) return;

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      // 백엔드가 userAchievement id를 받는다고 가정
      const userAchievementId = btn.dataset.userAchievementId;
      const achievementId = btn.dataset.achievementId;
      const idToSend = userAchievementId || achievementId;

      if (!idToSend) {
        alert("업적 정보를 찾을 수 없습니다.");
        return;
      }

      const currentlyEquipped = btn.dataset.equipped === "true";

      const endpoint = currentlyEquipped
        ? `${BASE_URL}/profile/achievement/${idToSend}/unequip`
        : `${BASE_URL}/profile/achievement/${idToSend}/equip`;

      (async () => {
        try {
          btn.disabled = true;
          btn.textContent = currentlyEquipped ? "해제 중..." : "장착 중...";

          const res = await fetch(endpoint, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          });

          const raw = await res.text();
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch (e) {}

          if (!res.ok) {
            console.error("업적 장착/해제 실패:", data);
            alert((data && data.message) || "업적 장착/해제에 실패했습니다.");
            return;
          }

          // 서버 기준으로 다시 동기화
          await fetchAchievements(); // achievementsCache 갱신
          await fetchProfile();      // 프로필 상단 정보 갱신
        } catch (err) {
          console.error("업적 장착/해제 중 오류:", err);
          alert("업적 장착/해제 중 오류가 발생했습니다.");
        } finally {
          btn.disabled = false;
        }
      })();
    });
  }


  /**
   * inventoryItems 배열에서 equipSlot 기준으로
   *   - equippedCharacter
   *   - equippedPet
   * 를 찾아서 세팅
   */
  function updateEquippedFromInventory() {
    equippedCharacter = null;
    equippedPet = null;

    if (!Array.isArray(inventoryItems)) return;

    inventoryItems.forEach((inv) => {
      if (!inv.isEquipped) return;

      const item = inv.item || inv.shopItem || inv;
      const slotRaw = (inv.equipSlot || item.equipSlot || "")
        .toString()
        .toUpperCase();

      if (
        (slotRaw === "CHAR" || slotRaw === "CHARACTER") &&
        !equippedCharacter
      ) {
        equippedCharacter = inv;
      } else if (slotRaw === "PET" && !equippedPet) {
        equippedPet = inv;
      }
    });
  }

  /**
   * equippedCharacter / equippedPet 값을 이용해
   * 프로필 화면의 캐릭터 / 펫 슬롯 UI 갱신
   */
  function renderProfileEquipSlotsFromInventory() {
    // ---- 캐릭터 슬롯 ----
    if (profileEquipCharSlotEl) {
      if (equippedCharacter) {
        const item =
          equippedCharacter.item ||
          equippedCharacter.shopItem ||
          equippedCharacter;

        profileEquipCharSlotEl.classList.remove("empty");
        profileEquipCharPlaceholderEl?.classList.add("hidden");
        profileEquipCharContentEl?.classList.remove("hidden");

        if (profileEquipCharNameEl)
          profileEquipCharNameEl.textContent = item.name || "장착된 캐릭터";
        if (profileEquipCharDescEl)
          profileEquipCharDescEl.textContent =
            item.description || item.desc || "";

        // 해제할 때 쓰려고 inventoryId 저장
        profileEquipCharSlotEl.dataset.inventoryId = equippedCharacter.id;

        if (btnProfileUnequipChar)
          btnProfileUnequipChar.classList.remove("hidden");
      } else {
        profileEquipCharSlotEl.classList.add("empty");
        profileEquipCharPlaceholderEl?.classList.remove("hidden");
        profileEquipCharContentEl?.classList.add("hidden");
        profileEquipCharSlotEl.dataset.inventoryId = "";
        if (btnProfileUnequipChar)
          btnProfileUnequipChar.classList.add("hidden");
      }
    }

    // ---- 펫 슬롯 ----
    if (profileEquipPetSlotEl) {
      if (equippedPet) {
        const item = equippedPet.item || equippedPet.shopItem || equippedPet;

        profileEquipPetSlotEl.classList.remove("empty");
        profileEquipPetPlaceholderEl?.classList.add("hidden");
        profileEquipPetContentEl?.classList.remove("hidden");

        if (profileEquipPetNameEl)
          profileEquipPetNameEl.textContent = item.name || "장착된 펫";
        if (profileEquipPetDescEl)
          profileEquipPetDescEl.textContent =
            item.description || item.desc || "";

        profileEquipPetSlotEl.dataset.inventoryId = equippedPet.id;

        if (btnProfileUnequipPet)
          btnProfileUnequipPet.classList.remove("hidden");
      } else {
        profileEquipPetSlotEl.classList.add("empty");
        profileEquipPetPlaceholderEl?.classList.remove("hidden");
        profileEquipPetContentEl?.classList.add("hidden");
        profileEquipPetSlotEl.dataset.inventoryId = "";
        if (btnProfileUnequipPet) btnProfileUnequipPet.classList.add("hidden");
      }
    }
    updateMainCharacterAvatar();
  }

  // 프로필 탭 인벤토리
  // 프로필 탭 인벤토리
  function renderProfileInventory() {
    // 둘 다 없으면 렌더링할 곳이 없음
    if (!profileInventoryListCharEl && !profileInventoryListPetEl) return;

    if (profileInventoryListCharEl) profileInventoryListCharEl.innerHTML = "";
    if (profileInventoryListPetEl) profileInventoryListPetEl.innerHTML = "";

    if (!inventoryItems || inventoryItems.length === 0) {
      if (profileInventoryEmptyEl)
        profileInventoryEmptyEl.classList.remove("hidden");
      return;
    }
    if (profileInventoryEmptyEl)
      profileInventoryEmptyEl.classList.add("hidden");

    inventoryItems.forEach((inv) => {
      const inventoryId = inv.id;
      const item = inv.item || inv.shopItem || inv;

      const name = item.name || item.title || `아이템 #${inventoryId}`;
      const desc = item.description || item.desc || "";

      // 슬롯 타입 확인 (CHAR/CHARACTER/PET)
      const slotRaw = (inv.equipSlot || item.equipSlot || "")
        .toString()
        .toUpperCase();

      // 캐릭터/펫에 따라 목표 리스트 선택
      let targetList = profileInventoryListCharEl;
      if (slotRaw === "PET") targetList = profileInventoryListPetEl;
      // (슬롯 정보가 없으면 기본적으로 캐릭터 쪽에 넣어줌)

      if (!targetList) return;

      // 이미지 처리 (상점/전체 인벤토리와 동일 로직)
      const imageRaw = item.image || item.icon || item.thumbnail || "";
      let imageUrl = "";
      if (imageRaw) {
        if (imageRaw.startsWith("http")) {
          imageUrl = imageRaw;
        } else {
          imageUrl =
            `${BASE_URL}` +
            (imageRaw.startsWith("/") ? imageRaw : `/${imageRaw}`);
        }
      }

      const li = document.createElement("article");
      li.className = "inventory-item-card profile-inventory-card";
      li.innerHTML = `
      <div class="inventory-item-main">
        <div class="inventory-item-left">
          <div class="inventory-item-thumb">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${name}" class="inventory-item-image" />`
                : `<div class="inventory-item-placeholder">?</div>`
            }
          </div>
          <div class="inventory-item-text">
            <p class="inventory-item-name">${name}</p>
            <p class="inventory-item-desc">${desc}</p>
          </div>
        </div>
        <div class="inventory-item-meta">
          <button
            type="button"
            class="btn-secondary btn-sm profile-equip-btn"
            data-id="${inventoryId}"
          >
            장착
          </button>
        </div>
      </div>
    `;
      targetList.appendChild(li);
    });
  }

  async function fetchProfile() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 프로필을 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("JSON 파싱 실패:", raw);
        data = raw;
      }

      if (!res.ok) {
        console.warn("프로필 로드 실패:", data);
        return;
      }

      // 프로필 기본 데이터 저장
      profileData = data;

      // 메인 프로필 UI 업데이트
      if (typeof renderProfile === "function") {
        renderProfile();
      }

      // 캐릭터(나의 캐릭터) 영역 업데이트
      if (typeof updateMainCharacterAvatar === "function") {
        updateMainCharacterAvatar();
      }

    } catch (err) {
      console.error("프로필 정보를 불러오는 중 오류:", err);
    }
  }



  // 인벤토리에서 장착 (캐릭터 / 펫 리스트 공통)
  function handleProfileInventoryClick(e) {
    const btn = e.target.closest(".profile-equip-btn");
    if (!btn) return;

    const token = getAuthToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const inventoryId = Number(btn.dataset.id);
    const targetInv = inventoryItems.find((inv) => inv.id === inventoryId);
    if (!targetInv) {
      alert("선택한 인벤토리 아이템을 찾을 수 없습니다.");
      return;
    }

    const item = targetInv.item || targetInv.shopItem || targetInv;
    const slotRaw = (targetInv.equipSlot || item.equipSlot || "")
      .toString()
      .toUpperCase();

    (async () => {
      try {
        btn.disabled = true;
        btn.textContent = "장착 중...";

        const res = await fetch(
          `${BASE_URL}/profile/item/${inventoryId}/equip`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const raw = await res.text();
        let data = raw;
        try {
          data = JSON.parse(raw);
        } catch (_) {}

        if (!res.ok) {
          const msg = (data && data.message) || "장착에 실패했습니다.";
          alert(msg);
          return;
        }

        // 로컬 상태 동기화
        inventoryItems = inventoryItems.map((inv) => {
          const i = inv.item || inv.shopItem || inv;
          const s = (inv.equipSlot || i.equipSlot || "")
            .toString()
            .toUpperCase();

          if (inv.id === inventoryId) {
            return { ...inv, isEquipped: true };
          }

          if (
            (slotRaw === "CHAR" || slotRaw === "CHARACTER") &&
            (s === "CHAR" || s === "CHARACTER")
          ) {
            return { ...inv, isEquipped: false };
          }
          if (slotRaw === "PET" && s === "PET") {
            return { ...inv, isEquipped: false };
          }

          return inv;
        });

        updateEquippedFromInventory();
        renderProfileEquipSlotsFromInventory();
        renderProfileInventory();

        await fetchUserProfile();
      } catch (err) {
        console.error("장착 처리 중 오류:", err);
        alert("장착 처리 중 오류가 발생했습니다.");
      } finally {
        btn.disabled = false;
        btn.textContent = "장착";
      }
    })();
  }

  // 두 리스트 모두에 리스너 연결
  [profileInventoryListCharEl, profileInventoryListPetEl].forEach((root) => {
    if (!root) return;
    root.addEventListener("click", handleProfileInventoryClick);
  });

  // 캐릭터 해제
  if (btnProfileUnequipChar && profileEquipCharSlotEl) {
    btnProfileUnequipChar.addEventListener("click", async () => {
      const inventoryId = profileEquipCharSlotEl.dataset.inventoryId;
      if (!inventoryId) {
        alert("장착 중인 캐릭터를 찾을 수 없습니다.");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      btnProfileUnequipChar.disabled = true;

      try {
        const res = await fetch(
          `${BASE_URL}/profile/item/${inventoryId}/unequip`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const raw = await res.text();
        let data = raw;
        try {
          data = JSON.parse(raw);
        } catch (e) {}

        if (!res.ok) {
          console.error("캐릭터 장착 해제 실패:", data);
          alert((data && data.message) || "캐릭터 장착 해제에 실패했습니다.");
          return;
        }

        // 서버 기준으로 다시 동기화
        await fetchInventory();
      } catch (err) {
        console.error("캐릭터 장착 해제 중 오류:", err);
        alert("캐릭터 장착 해제 중 오류가 발생했습니다.");
      } finally {
        btnProfileUnequipChar.disabled = false;
      }
    });
  }

  // 펫 해제
  if (btnProfileUnequipPet && profileEquipPetSlotEl) {
    btnProfileUnequipPet.addEventListener("click", async () => {
      const inventoryId = profileEquipPetSlotEl.dataset.inventoryId;
      if (!inventoryId) {
        alert("장착 중인 펫을 찾을 수 없습니다.");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      btnProfileUnequipPet.disabled = true;

      try {
        const res = await fetch(
          `${BASE_URL}/profile/item/${inventoryId}/unequip`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const raw = await res.text();
        let data = raw;
        try {
          data = JSON.parse(raw);
        } catch (e) {}

        if (!res.ok) {
          console.error("펫 장착 해제 실패:", data);
          alert((data && data.message) || "펫 장착 해제에 실패했습니다.");
          return;
        }

        await fetchInventory();
      } catch (err) {
        console.error("펫 장착 해제 중 오류:", err);
        alert("펫 장착 해제 중 오류가 발생했습니다.");
      } finally {
        btnProfileUnequipPet.disabled = false;
      }
    });
  }

  // ===================== 퀘스트 완료 처리 =====================

  function bindCompleteButton(btn) {
    btn.addEventListener("click", async () => {
      if (btn.dataset.completed === "true") return;

      const token = getAuthToken();
      if (!token) {
        alert("로그인 정보가 없어 퀘스트를 완료 처리할 수 없습니다.");
        return;
      }

      const questId =
        btn.dataset.id ||
        (btn.closest(".quest-card") && btn.closest(".quest-card").dataset.id);
      if (!questId) return;

      // ✅ 퀘스트 완료 "이전" 상태 백업
      // 1) 스킬
      const prevSkillIds = new Set(
        (skillsCache || []).map((s) => String(s.id ?? s.skillId ?? s._id ?? ""))
      );

      btn.disabled = true;

      try {
        // --- 퀘스트 완료 요청 ---
        const res = await fetch(`${BASE_URL}/quest/${questId}/complete`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({}),
        });

        const raw = await res.text();
        let data = raw;
        try {
          data = JSON.parse(raw);
        } catch (e) {}

        if (!res.ok) {
          console.error("퀘스트 완료 처리 실패:", data);
          const msg =
            (data && data.message) || "퀘스트 완료 처리에 실패했습니다.";
          alert(msg);
          btn.disabled = false;
          return;
        }

        // --- 로컬 퀘스트 상태 업데이트 ---
        questsCache = questsCache.map((q) =>
          String(q.id) === String(questId)
            ? { ...q, ...data, isCompleted: true }
            : q
        );

        // 🎯 퀘스트 보상 토스트
        const completedQuest = questsCache.find(
          (q) => String(q.id) === String(questId)
        );
        const rewardXp = completedQuest?.rewardExp ?? 0;
        const rewardGold = completedQuest?.rewardGold ?? 0;
        const toastMsgQuest =
          rewardXp || rewardGold
            ? `퀘스트를 완료했습니다! +${rewardXp} XP, +${rewardGold} G`
            : "퀘스트를 완료했습니다!";
        showToast(toastMsgQuest, "success");

        // 버튼 UI 갱신
        btn.dataset.completed = "true";
        btn.textContent = "완료됨";
        btn.classList.add("btn-completed");
        btn.disabled = true;

        renderDashboardQuests();
        renderManageQuests();

        // 🎯 경험치/통계/업적/스킬 새로고침
        await Promise.all([
          fetchUserProfile(),
          fetchQuestStats(),
          fetchAchievements(), // ⭐ 여기서 achievementsCache 갱신됨
          fetchMySkills(),
        ]);

        // ============= 새 스킬 감지 & 토스트/하이라이트 =============
        const newSkills =
          (skillsCache || []).filter((s) => {
            const sid = String(s.id ?? s.skillId ?? s._id ?? "");
            return sid && !prevSkillIds.has(sid);
          }) || [];

        if (newSkills.length > 0) {
          const names = newSkills
            .map((s) => s.name || s.title)
            .filter(Boolean)
            .join(", ");

          const toastMsgSkill =
            newSkills.length === 1
              ? `새로운 스킬을 획득했습니다! (${names})`
              : `새로운 스킬 ${newSkills.length}개를 획득했습니다! (${names})`;

          showToast(toastMsgSkill, "success");

          if (skillsListEl) {
            newSkills.forEach((s) => {
              const sid = String(s.id ?? s.skillId ?? s._id ?? "");
              const card = skillsListEl.querySelector(
                `[data-skill-id="${sid}"]`
              );
              if (card) {
                card.classList.add("skill-card-new");
                setTimeout(() => card.classList.remove("skill-card-new"), 1500);
              }
            });
          }
        }
      } catch (err) {
        console.error("퀘스트 완료 처리 중 오류:", err);
        alert("퀘스트 완료 처리 중 오류가 발생했습니다.");
        btn.disabled = false;
      }
    });
  }

  renderStats();
  document.querySelectorAll(".quest-complete-btn").forEach((btn) => {
    bindCompleteButton(btn);
  });

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("dxpToken");     // 기존 토큰 삭제
        localStorage.removeItem("dxpNickname");  // 🔥 닉네임도 같이 삭제 (중요!)
        localStorage.removeItem("dxpLoginType");
      } catch (e) {
        console.warn("로그아웃 중 로컬스토리지 삭제 오류:", e);
      }

      window.location.href = "home.jsp";
    });
  }


  // ===================== 오늘의 퀘스트 (대시보드) =====================

  const dashboardQuestList = document.querySelector(
    "#view-dashboard .quests-list"
  );
  const repeatOnlyToggle = document.getElementById("filter-repeat-only");

  let questsCache = [];
  let manageLoaded = false;

  function applyRepeatFilter() {
    if (!dashboardQuestList) return;
    const showHardOnly = repeatOnlyToggle && repeatOnlyToggle.checked;
    const cards = dashboardQuestList.querySelectorAll(".quest-card");

    cards.forEach((card) => {
      const diff = (card.dataset.difficulty || "NORMAL").toUpperCase();
      const isHard = diff === "HARD";

      if (showHardOnly && !isHard) card.classList.add("hidden");
      else card.classList.remove("hidden");
    });
  }

  if (repeatOnlyToggle) {
    repeatOnlyToggle.addEventListener("change", applyRepeatFilter);
  }

  function buildDashboardCard(quest) {
    const rewardXp = quest.rewardExp ?? 0;
    const rewardGold = quest.rewardGold ?? 0;
    const difficulty = (quest.difficulty || "NORMAL").toUpperCase();

    let difficultyLabel = "보통";
    let difficultyClass = "normal";

    if (difficulty === "EASY") {
      difficultyLabel = "쉬움";
      difficultyClass = "easy";
    } else if (difficulty === "HARD") {
      difficultyLabel = "어려움";
      difficultyClass = "hard";
    }

    const completed =
      quest.isCompleted === true ||
      quest.completed === true ||
      quest.status === "COMPLETED";

    const article = document.createElement("article");
    article.className = "quest-card";
    article.dataset.id = quest.id;
    article.dataset.difficulty = difficulty;

    article.innerHTML = `
    <div class="quest-main">
      <div>
        <div class="quest-title-row">
          <h3>${quest.title}</h3>
          <span class="quest-tag quest-tag-${difficultyClass}">
            ${difficultyLabel}
          </span>
        </div>
        <p class="quest-reward">
          <span>+${rewardXp} XP</span>
          <span>+${rewardGold} 골드</span>
        </p>
      </div>
      <button
        class="btn-success quest-complete-btn ${
          completed ? "btn-completed" : ""
        }"
        data-id="${quest.id}"
        data-xp="${rewardXp}"
        data-gold="${rewardGold}"
        data-completed="${completed ? "true" : "false"}"
        type="button"
        ${completed ? "disabled" : ""}
      >
        ${completed ? "완료됨" : "완료"}
      </button>
    </div>
  `;

    const btn = article.querySelector(".quest-complete-btn");
    if (btn) bindCompleteButton(btn);
    return article;
  }

  function renderDashboardQuests() {
    if (!dashboardQuestList) return;
    dashboardQuestList.innerHTML = "";

    const sorted = [...questsCache].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    sorted.forEach((q) => {
      const card = buildDashboardCard(q);
      dashboardQuestList.appendChild(card);
    });

    applyRepeatFilter();
  }

  // ===================== 퀘스트 관리 패널 =====================

  const managePanel = document.querySelector(
    "#view-quests .quests-manage-panel"
  );
  const manageList = managePanel
    ? managePanel.querySelector(".quests-list.manage")
    : null;
  const manageEmpty = managePanel
    ? managePanel.querySelector(".quest-manage-empty")
    : null;
  const manageCountEl = managePanel
    ? managePanel.querySelector(".quest-manage-count")
    : null;

  const manageDifficultyFilter = managePanel
    ? managePanel.querySelector("#quest-filter-difficulty")
    : null;

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderManageQuests() {
    if (!manageList) return;
    manageList.innerHTML = "";

    if (!Array.isArray(questsCache) || questsCache.length === 0) {
      if (manageEmpty) manageEmpty.classList.remove("hidden");
      if (manageCountEl) manageCountEl.textContent = "0개";
      return;
    }

    if (manageEmpty) manageEmpty.classList.add("hidden");
    if (manageCountEl) manageCountEl.textContent = `${questsCache.length}개`;

    const sorted = [...questsCache].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    sorted.forEach((quest) => {
      const difficulty = (quest.difficulty || "NORMAL").toUpperCase();
      const article = document.createElement("article");
      article.className = "quest-card quest-card-manage";
      article.dataset.id = quest.id;
      article.dataset.difficulty = difficulty;

      article.innerHTML = `
        <div class="qm-col qm-col-left">
          <div class="qm-title">
            ${quest.title}
          </div>
        </div>
        <div class="qm-col qm-col-middle">
          <p class="quest-desc-small">
            ${quest.description || ""}
          </p>
        </div>
        <div class="qm-col qm-col-right">
          <div class="qm-date-block">
            <p class="qm-date-value">${formatDate(quest.createdAt)}</p>
          </div>
          <div class="quest-manage-actions">
            <button class="btn-ghost btn-xs qm-edit-btn" type="button">
              수정
            </button>
            <button class="btn-danger btn-xs qm-delete-btn" type="button">
              삭제
            </button>
          </div>
        </div>
      `;

      manageList.appendChild(article);
    });
    applyManageDifficultyFilter();
  }

  function applyManageDifficultyFilter() {
    if (!manageList || !manageDifficultyFilter) return;

    const selected = manageDifficultyFilter.value;
    const cards = manageList.querySelectorAll(".quest-card-manage");

    cards.forEach((card) => {
      const diff = (card.dataset.difficulty || "NORMAL").toUpperCase();

      if (selected === "ALL" || !selected) card.classList.remove("hidden");
      else if (diff === selected) card.classList.remove("hidden");
      else card.classList.add("hidden");
    });
  }

  if (manageDifficultyFilter) {
    manageDifficultyFilter.addEventListener(
      "change",
      applyManageDifficultyFilter
    );
  }

  // ===================== 캘린더 =====================

  const calMonthLabel = document.querySelector(".calendar-month");
  const calGrid = document.querySelector(".calendar-grid");
  const calNavBtns = document.querySelectorAll(".cal-nav-btn");
  const calDayTitleEl = document.getElementById("calendar-day-title");
  const calDayListEl = document.getElementById("calendar-day-quests");

  let calendarCurrent = new Date();
  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];

  function formatDateKeyFromDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getQuestDateKey(quest) {
    if (!quest.createdAt) return null;
    const d = new Date(quest.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return formatDateKeyFromDate(d);
  }

  function buildQuestsByDate() {
    const map = {};
    questsCache.forEach((q) => {
      const key = getQuestDateKey(q);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(q);
    });
    return map;
  }

  function handleCalendarDayClick(dateKey) {
    if (!calDayListEl || !calDayTitleEl) return;

    const questsByDate = buildQuestsByDate();
    const list = questsByDate[dateKey] || [];

    const [y, m, d] = dateKey.split("-");
    calDayTitleEl.textContent = `${y}년 ${Number(m)}월 ${Number(d)}일 퀘스트`;

    calDayListEl.innerHTML = "";

    if (list.length === 0) {
      const li = document.createElement("li");
      li.className = "cdq-empty";
      li.textContent = "이 날에는 등록된 퀘스트가 없습니다.";
      calDayListEl.appendChild(li);
      return;
    }

    list.forEach((q) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="cdq-title">${q.title}</span>
        <span class="cdq-desc">${q.description || ""}</span>
      `;
      calDayListEl.appendChild(li);
    });
  }

  function renderCalendar() {
    if (!calGrid || !calMonthLabel) return;

    const year = calendarCurrent.getFullYear();
    const month = calendarCurrent.getMonth();

    calMonthLabel.textContent = `${year}년 ${month + 1}월`;

    const questsByDate = buildQuestsByDate();

    calGrid.innerHTML = "";

    weekdayNames.forEach((name) => {
      const w = document.createElement("div");
      w.className = "cal-weekday";
      w.textContent = name;
      calGrid.appendChild(w);
    });

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement("div");
      empty.className = "cal-day empty";
      calGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateKey = formatDateKeyFromDate(cellDate);

      const cell = document.createElement("div");
      cell.className = "cal-day";
      cell.dataset.date = dateKey;
      cell.textContent = day;

      const dayQuests = questsByDate[dateKey] || [];
      if (dayQuests.length > 0) {
        cell.classList.add("has-quest");
        const dot = document.createElement("div");
        dot.className = "cal-day-dot";
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => handleCalendarDayClick(dateKey));
      calGrid.appendChild(cell);
    }
  }

  if (calNavBtns && calNavBtns.length >= 2) {
    const prevBtn = calNavBtns[0];
    const nextBtn = calNavBtns[1];

    prevBtn.addEventListener("click", () => {
      calendarCurrent.setMonth(calendarCurrent.getMonth() - 1);
      renderCalendar();
      if (calDayTitleEl && calDayListEl) {
        calDayTitleEl.textContent =
          "날짜를 클릭하면 그 날의 퀘스트가 여기에 표시됩니다.";
        calDayListEl.innerHTML = "";
      }
    });

    nextBtn.addEventListener("click", () => {
      calendarCurrent.setMonth(calendarCurrent.getMonth() + 1);
      renderCalendar();
      if (calDayTitleEl && calDayListEl) {
        calDayTitleEl.textContent =
          "날짜를 클릭하면 그 날의 퀘스트가 여기에 표시됩니다.";
        calDayListEl.innerHTML = "";
      }
    });
  }

  renderCalendar();

  // ===================== 서버에서 퀘스트 가져오기 =====================

  async function fetchUserQuests() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 퀘스트를 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/quest`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      if (!res.ok || !Array.isArray(data)) {
        console.warn("퀘스트 목록 로드 실패:", data);
        return;
      }

      questsCache = data;
      renderDashboardQuests();
      renderManageQuests();
      renderCalendar();
      manageLoaded = true;
    } catch (err) {
      console.error("퀘스트 목록 불러오는 중 오류:", err);
    }
  }

  function ensureManageQuestsLoaded() {
    if (!manageLoaded) {
      fetchUserQuests();
    }
  }

  // ===================== 퀘스트 생성/수정 모달 =====================

  const openQuestModalBtn = document.getElementById("btn-open-quest-modal");
  const modalBackdrop = document.getElementById("quest-modal-backdrop");
  const modalCancelBtn = document.getElementById("quest-modal-cancel");
  const modalSaveBtn = document.getElementById("quest-modal-save");
  const titleInput = document.getElementById("quest-title-input");
  const descInput = document.getElementById("quest-desc-input");
  const modalTitleEl = document.getElementById("quest-modal-title");

  let modalMode = "create";
  let editingQuestId = null;

  function openQuestModal(mode = "create", quest = null) {
    if (!modalBackdrop) return;
    modalMode = mode;
    editingQuestId = quest ? quest.id : null;

    modalBackdrop.classList.remove("hidden");

    if (modalTitleEl) {
      modalTitleEl.textContent =
        mode === "edit" ? "퀘스트 수정하기" : "새 퀘스트 만들기";
    }

    if (titleInput) titleInput.value = quest?.title || "";
    if (descInput) descInput.value = quest?.description || "";

    if (titleInput) titleInput.focus();
  }

  function closeQuestModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add("hidden");
  }

  if (openQuestModalBtn) {
    openQuestModalBtn.addEventListener("click", () =>
      openQuestModal("create", null)
    );
  }
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener("click", closeQuestModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeQuestModal();
      }
    });
  }

  // ======================= 퀘스트 생성 / 수정 ===========================
  if (modalSaveBtn) {
    modalSaveBtn.addEventListener("click", async () => {
      const title = titleInput.value.trim();
      const description = descInput.value.trim();

      if (!title || !description) {
        alert("제목과 내용을 모두 입력해 주세요.");
        return;
      }

      // AI 자동 난이도 / 보상 계산은 백엔드에서 처리됨
      const body = { title, description };

      let url = `${BASE_URL}/quest`;
      let method = "POST";

      // 수정 모드일 경우
      if (editingQuestId) {
        url = `${BASE_URL}/quest/${editingQuestId}`;
        method = "PATCH";
      }

      modalSaveBtn.disabled = true;
      modalSaveBtn.textContent = editingQuestId ? "수정 중..." : "생성 중...";

      try {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(body),
        });

        const text = await res.text();
        let data = text;
        try {
          data = JSON.parse(text);
        } catch (e) {}

        if (!res.ok) {
          console.error("퀘스트 생성/수정 실패:", data);
          alert(data?.message || "퀘스트 생성/수정에 실패했습니다.");
          return;
        }

        // ---------------------- 생성 -------------------------
        if (!editingQuestId) {
          const newQuest = { ...data };
          questsCache.push(newQuest);

          renderDashboardQuests();
          renderManageQuests();
          renderCalendar();

          // 🎉 토스트 알림 (새 퀘스트 생성됨)
          const xpGain = newQuest.rewardExp ?? newQuest.rewardXP ?? 0;
          const goldGain = newQuest.rewardGold ?? newQuest.goldReward ?? 0;

          const msg =
            xpGain || goldGain
              ? `새 퀘스트가 생성되었습니다. (+${xpGain} XP, +${goldGain} G)`
              : "새 퀘스트가 생성되었습니다.";

          showToast(msg, "success");
        }

        // ---------------------- 수정 -------------------------
        else {
          questsCache = questsCache.map((q) =>
            String(q.id) === String(editingQuestId) ? { ...q, ...data } : q
          );

          renderDashboardQuests();
          renderManageQuests();
          renderCalendar();

          // 🎉 토스트 알림 (퀘스트 수정됨)
          showToast("퀘스트가 수정되었습니다.", "success");

          editingQuestId = null;
        }
      } catch (err) {
        console.error("퀘스트 생성/수정 중 오류:", err);
        alert("처리 중 오류가 발생했습니다.");
      } finally {
        modalSaveBtn.disabled = false;
        modalSaveBtn.textContent = editingQuestId ? "수정" : "저장";
        closeQuestModal();
      }
    });
  }

  if (manageList) {
    manageList.addEventListener("click", async (e) => {
      const deleteBtn = e.target.closest(".qm-delete-btn");
      const editBtn = e.target.closest(".qm-edit-btn");

      const card = e.target.closest(".quest-card-manage");
      if (!card) return;
      const questId = card.dataset.id;
      if (!questId) return;

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (deleteBtn) {
        const ok = confirm("이 퀘스트를 삭제하시겠습니까?");
        if (!ok) return;

        try {
          const res = await fetch(`${BASE_URL}/quest/${questId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          });

          if (!res.ok) {
            console.error("퀘스트 삭제 실패:", await res.text());
            alert("퀘스트 삭제에 실패했습니다.");
            return;
          }

          questsCache = questsCache.filter(
            (q) => String(q.id) !== String(questId)
          );
          renderDashboardQuests();
          renderManageQuests();
          renderCalendar();
        } catch (err) {
          console.error("퀘스트 삭제 중 오류:", err);
          alert("퀘스트 삭제 중 문제가 발생했습니다.");
        }
      }

      if (editBtn) {
        const quest = questsCache.find((q) => String(q.id) === String(questId));
        if (!quest) return;

        openQuestModal("edit", quest);
      }
    });
  }

  // ===================== 설정 =====================
  const settingsForm = document.getElementById("settings-form");
  const settingPhoneInput = document.getElementById("setting-phone");
  const settingAddressInput = document.getElementById("setting-address");
  const settingsSaveMsg = document.getElementById("settings-save-msg");

  // 계정 정보 표시용 엘리먼트
  const settingUsernameView = document.getElementById("setting-username");
  const settingEmailView = document.getElementById("setting-email");
  const settingPhoneView = document.getElementById("setting-phone-view");
  const settingAddressView = document.getElementById("setting-address-view");

  const pwdForm = document.getElementById("settings-password-form");
  const pwdCurrentInput = document.getElementById("setting-current-password");
  const pwdNew1Input = document.getElementById("setting-new-password-1");
  const pwdNew2Input = document.getElementById("setting-new-password-2");
  const pwdMsgEl = document.getElementById("settings-password-msg");

  // ✅ 로그인 타입에 따라 비밀번호 변경 표시/숨김
  let loginType = "local";
  try {
    loginType = localStorage.getItem("dxpLoginType") || "local";
  } catch (e) {}

  // 소셜 로그인인 경우 비밀번호 변경 폼 숨기기
  if (loginType === "social" && pwdForm) {
    pwdForm.classList.add("hidden");
  }


  // --- 설정 정보 불러오기 (/setting GET) ---
  async function loadSettings() {
    const token = getAuthToken();
    if (!token) {
      console.warn("토큰이 없어 설정을 불러올 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/setting`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      const text = await res.text();
      let data = text;
      try {
        data = JSON.parse(text);
      } catch (e) {}

      if (!res.ok || !data || typeof data !== "object") {
        console.warn("설정 로드 실패:", data);
        return;
      }

      // 백엔드 getMyInfo: { id, username, email, phone, address }
      const username = data.username || "-";
      const email = data.email || "-";
      const phoneVal = data.phone ?? "";
      const addrVal = data.address ?? "";

      if (settingUsernameView) settingUsernameView.textContent = username;
      if (settingEmailView) settingEmailView.textContent = email;

      if (settingPhoneView) settingPhoneView.textContent = phoneVal || "-";
      if (settingAddressView) settingAddressView.textContent = addrVal || "-";

      if (settingPhoneInput) settingPhoneInput.value = phoneVal || "";
      if (settingAddressInput) settingAddressInput.value = addrVal || "";
    } catch (err) {
      console.error("설정을 불러오는 중 오류:", err);
    }
  }

  // --- 연락처 / 주소 저장 (/setting PATCH) ---
  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (settingsSaveMsg) settingsSaveMsg.textContent = "";

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const phone = (settingPhoneInput?.value || "").trim();
      const address = (settingAddressInput?.value || "").trim();

      try {
        const res = await fetch(`${BASE_URL}/setting`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ phone, address }),
        });

        const text = await res.text();
        let data = text;
        try {
          data = JSON.parse(text);
        } catch (e) {}

        if (!res.ok) {
          const msg =
            (data && data.message) ||
            "설정 저장에 실패했습니다. 다시 시도해 주세요.";
          if (settingsSaveMsg) settingsSaveMsg.textContent = msg;
          showToast(msg, "error");
          return;
        }

        // 화면 상단 계정 정보도 즉시 반영
        if (settingPhoneView) settingPhoneView.textContent = phone || "-";
        if (settingAddressView) settingAddressView.textContent = address || "-";

        const okMsg =
          (data && data.message) || "연락처 / 주소 설정이 저장되었습니다.";
        if (settingsSaveMsg) settingsSaveMsg.textContent = okMsg;
        showToast(okMsg, "success");
      } catch (err) {
        console.error("설정 저장 중 오류:", err);
        const msg = "설정 저장 중 오류가 발생했습니다.";
        if (settingsSaveMsg) settingsSaveMsg.textContent = msg;
        showToast(msg, "error");
      }
    });
  }

  // --- 비밀번호 변경 (/setting/change-password POST) ---
  if (pwdForm) {
    pwdForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (pwdMsgEl) pwdMsgEl.textContent = "";

      const token = getAuthToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const current = (pwdCurrentInput?.value || "").trim();
      const new1 = (pwdNew1Input?.value || "").trim();
      const new2 = (pwdNew2Input?.value || "").trim();

      if (!current || !new1 || !new2) {
        const msg = "현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.";
        if (pwdMsgEl) pwdMsgEl.textContent = msg;
        showToast(msg, "error");
        return;
      }

      if (new1 !== new2) {
        const msg = "새 비밀번호가 서로 일치하지 않습니다.";
        if (pwdMsgEl) pwdMsgEl.textContent = msg;
        showToast(msg, "error");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/setting/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            currentPassword: current,
            newPassword_1: new1,
            newPassword_2: new2,
          }),
        });

        const text = await res.text();
        let data = text;
        try {
          data = JSON.parse(text);
        } catch (e) {}

        if (!res.ok) {
          const msg =
            (data && data.message) ||
            "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.";
          if (pwdMsgEl) pwdMsgEl.textContent = msg;
          showToast(msg, "error");
          return;
        }

        const okMsg =
          (data && data.message) || "비밀번호가 성공적으로 변경되었습니다.";
        if (pwdMsgEl) pwdMsgEl.textContent = okMsg;
        showToast(okMsg, "success");

        // 입력값 초기화
        if (pwdCurrentInput) pwdCurrentInput.value = "";
        if (pwdNew1Input) pwdNew1Input.value = "";
        if (pwdNew2Input) pwdNew2Input.value = "";
      } catch (err) {
        console.error("비밀번호 변경 중 오류:", err);
        const msg = "비밀번호 변경 중 오류가 발생했습니다.";
        if (pwdMsgEl) pwdMsgEl.textContent = msg;
        showToast(msg, "error");
      }
    });
  }

  // 초기 진입
  updateGreeting("dashboard");
  fetchUserProfile();
  fetchUserQuests();
  fetchAchievements();
  fetchAttendanceStats();
  fetchQuestStats();

  // 장착된 캐릭터/펫 & 프로필 정보도 같이 불러오기
  fetchInventory(); // 인벤토리 + 장착 정보 → equippedCharacter 세팅 + 아바타 업데이트
  fetchProfile(); // /profile 응답 값으로 profileData 채우고 renderProfile() 호출
}

// ===================== ENTRY =====================

document.addEventListener("DOMContentLoaded", () => {
  if (
    document.getElementById("form-login") ||
    document.getElementById("form-signup")
  ) {
    initAuthPage();
  }

  if (document.getElementById("dashboard-title")) {
    initDashboardPage();
  }
});
