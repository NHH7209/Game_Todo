<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>DailyXP - 대시보드</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="index.css" />
  </head>
  <body data-page="dashboard">
    <div id="app">
      <section class="page page-dashboard">
        <div class="dashboard-shell">
          <!-- 사이드바 -->
          <aside class="sidebar">
            <div class="sidebar-top">
              <div class="sidebar-logo">
                <span class="logo-dot"></span>
                <span>DailyXP</span>
              </div>

              <nav class="sidebar-nav">
                <button
                  class="sidebar-item active"
                  data-view="dashboard"
                  type="button"
                >
                  대시보드
                </button>
                <button class="sidebar-item" data-view="quests" type="button">
                  퀘스트
                </button>
                <button
                  class="sidebar-item"
                  data-view="achievements"
                  type="button"
                >
                  업적
                </button>
                <button class="sidebar-item" data-view="skills" type="button">
                  스킬
                </button>
                <button class="sidebar-item" data-view="shop" type="button">
                  상점
                </button>
                <button class="sidebar-item" data-view="stats" type="button">
                  통계
                </button>
                <button class="sidebar-item" data-view="settings" type="button">
                  설정
                </button>
                <button class="sidebar-item" data-view="profile" type="button">
                  프로필
                </button>
              </nav>
            </div>

            <div class="sidebar-bottom">
              <button id="btn-logout" class="sidebar-logout" type="button">
                로그아웃
              </button>
            </div>
          </aside>

          <!-- 메인 -->
          <main class="dashboard-main">
            <!-- 상단 헤더 -->
            <header class="dashboard-header">
              <div>
                <h1 id="dashboard-title">안녕하세요, 모험가님.</h1>
                <p id="dashboard-subtitle">...</p>
              </div>

              <!-- 오른쪽 상단 재화 -->
              <div class="dashboard-header-right">
                <div class="top-currencies">
                  <span class="currency-chip stat-gold">0 G</span>
                  <span class="currency-chip stat-gem">0 ◇</span>
                </div>
              </div>
            </header>

            <!-- 뷰: 대시보드 -->
            <div id="view-dashboard" class="dashboard-view">
              <div class="dashboard-grid">
                <!-- 오늘의 퀘스트 -->
                <section class="panel quests-panel">
                  <header class="panel-header">
                    <h2>오늘의 퀘스트</h2>
                  </header>

                  <div class="quest-filter-row">
                    <label class="repeat-filter">
                      <input type="checkbox" id="filter-repeat-only" />
                      어려움 퀘스트만 보기
                    </label>
                  </div>

                  <div class="quests-list"></div>
                </section>

                <!-- 오른쪽 패널 -->
                <section class="panel side-panel">
                  <div class="panel-block">
                    <header class="panel-header tight">
                      <h2>퀘스트 생성</h2>
                    </header>
                    <p class="panel-desc">
                      목표를 알려주시면 퀘스트를 만들어주는 기능을 붙일 수
                      있습니다.
                    </p>
                    <button
                      class="btn-primary full"
                      type="button"
                      id="btn-open-quest-modal"
                    >
                      퀘스트 생성하기
                    </button>
                  </div>

                  <div class="character-card">
                    <div class="character-avatar-wrapper">
                      <div class="character-avatar-frame">
                        <!-- 캐릭터 이미지: 기본은 숨김 -->
                        <img
                          src=""
                          alt="나의 캐릭터"
                          class="character-avatar-img hidden"
                          id="character-avatar-img"
                        />
                      </div>
                    </div>

                    <!-- 캐릭터가 없을 때 보여줄 문구 -->
                    <p
                      id="character-avatar-empty"
                      class="character-avatar-empty-text"
                    >
                      아직 장착한 캐릭터가 없어요. 상점에서 캐릭터를 장착해 보세요.
                    </p>

                    <!-- 캐릭터 이름/레벨은 JS에서 채움 -->
                    <p class="character-name" id="character-name"></p>
                    <p class="character-level" id="character-level-text"></p>

                    <div class="character-stats">
                      <div>
                        <p class="stat-label">경험치</p>
                        <p class="stat-value" id="character-stat-xp">0 XP</p>
                      </div>
                      <div>
                        <p class="stat-label">골드</p>
                        <p class="stat-value" id="character-stat-gold">0 G</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <!-- 뷰: 퀘스트 관리 -->
            <div id="view-quests" class="dashboard-view hidden">
              <div class="quest-manage-grid">
                <section class="panel quests-manage-panel">
                  <header class="panel-header">
                    <h2>퀘스트 관리</h2>
                    <p class="panel-desc">
                      오늘·이번 주 퀘스트를 한 곳에서 관리해보세요. <br />
                      카드 목록에서 수정하거나 삭제할 수 있어요.
                    </p>
                  </header>

                  <div class="quest-manage-toolbar">
                    <label class="quest-filter-label">
                      타입
                      <select
                        id="quest-filter-difficulty"
                        class="qm-filter-select"
                      >
                        <option value="ALL">전체</option>
                        <option value="EASY">쉬움</option>
                        <option value="NORMAL">보통</option>
                        <option value="HARD">어려움</option>
                      </select>
                    </label>
                    <span class="quest-manage-count" id="quest-manage-count"
                      >0개의 퀘스트</span
                    >
                  </div>

                  <div id="quest-manage-list" class="quests-list manage"></div>
                  <p id="quest-manage-empty" class="quest-manage-empty">
                    아직 생성된 퀘스트가 없습니다. <br />
                    대시보드 &gt; 퀘스트 생성하기 버튼으로 새로운 퀘스트를
                    만들어보세요.
                  </p>
                </section>

                <!-- 퀘스트 캘린더 -->
                <div class="quests-calendar-panel panel">
                  <div class="panel-header">
                    <h2>퀘스트 캘린더</h2>
                    <p class="panel-desc small">
                      퀘스트를 수행한 날짜를 한 눈에 확인해보세요.
                    </p>
                  </div>

                  <div class="calendar-header">
                    <span class="calendar-month">2025년 1월</span>
                    <div>
                      <button class="cal-nav-btn" type="button">&lt;</button>
                      <button class="cal-nav-btn" type="button">&gt;</button>
                    </div>
                  </div>

                  <div class="calendar-grid"></div>

                  <div class="calendar-day-detail">
                    <p id="calendar-day-title" class="calendar-day-title">
                      날짜를 클릭하면 그 날의 퀘스트가 여기에 표시됩니다.
                    </p>
                    <ul
                      id="calendar-day-quests"
                      class="calendar-day-quests"
                    ></ul>
                  </div>

                  <div class="calendar-legend">
                    <span class="legend-dot"></span>
                    <span>퀘스트가 있는 날</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 뷰: 업적 -->
            <section id="view-achievements" class="dashboard-view hidden">
              <div class="dashboard-grid">
                <article class="panel">
                  <header class="panel-header">
                    <h2>업적</h2>
                    <p class="panel-desc">
                      완료한 퀘스트와 경험치를 기반으로 달성한 업적을 확인할 수
                      있어요.
                    </p>
                  </header>

                  <div id="achievement-list" class="achievement-list">
                    <p class="empty-text">업적 정보를 불러오는 중입니다...</p>
                  </div>
                </article>
              </div>
            </section>

            <!-- 뷰: 스킬 -->
            <section id="view-skills" class="dashboard-view hidden">
              <div class="dashboard-grid">
                <article class="panel">
                  <header class="panel-header">
                    <h2>내 스킬</h2>
                    <p class="panel-desc">
                      자격증, 능력, 특기를 스킬처럼 모아서 한눈에 볼 수 있어요.
                    </p>
                  </header>

                  <div id="skills-list" class="skills-list"></div>
                </article>

                <aside class="side-panel">
                  <div class="panel-block">
                    <h3>TIP</h3>
                    <p class="panel-help">
                      특정 퀘스트를 완료하면 새로운 스킬이 해금될 수 있어요.
                    </p>
                  </div>
                </aside>
              </div>
            </section>

            <!-- 뷰: 상점 -->
            <section id="view-shop" class="dashboard-view hidden">
              <div class="dashboard-grid">
                <!-- 상점 목록 -->
                <article class="panel">
                  <header class="panel-header">
                    <h2>상점</h2>
                    <p class="panel-desc">
                      골드로 다양한 꾸미기 아이템을 구매해 보세요.
                    </p>
                  </header>

                  <!-- 로딩 메시지 -->
                  <p id="shop-loading" class="quest-manage-empty hidden">
                    상점 정보를 불러오는 중입니다...
                  </p>

                  <!-- 비어 있을 때 메시지 -->
                  <p id="shop-empty" class="quest-manage-empty hidden">
                    판매 중인 아이템이 없습니다.
                  </p>

                  <!-- JS에서 사용하는 상점 리스트 컨테이너 -->
                  <div id="shop-list" class="shop-item-list"></div>
                </article>

                <!-- 내 인벤토리 -->
                <aside class="side-panel">
                  <div class="panel-block">
                    <h3>내 인벤토리</h3>

                    <!-- 로딩 메시지 -->
                    <p id="inventory-loading" class="quest-manage-empty hidden">
                      인벤토리를 불러오는 중입니다...
                    </p>

                    <!-- 비어 있을 때 메시지 -->
                    <p id="inventory-empty" class="quest-manage-empty hidden">
                      보유 중인 아이템이 없습니다.
                    </p>

                    <!-- JS에서 사용하는 인벤토리 리스트 컨테이너 -->
                    <div id="inventory-list" class="shop-inventory-list"></div>
                  </div>
                </aside>
              </div>
            </section>

            <!-- 뷰: 통계 -->
            <section id="view-stats" class="dashboard-view hidden">
              <div class="dashboard-grid">
                <article class="panel">
                  <header class="panel-header">
                    <h2>퀘스트 통계</h2>
                    <p class="panel-desc">
                      출석 및 퀘스트 기록을 바탕으로 루틴 패턴을 확인할 수
                      있어요.
                    </p>
                  </header>

                  <div id="stats-summary" class="stats-summary"></div>
                </article>
              </div>
            </section>

            <!-- 뷰: 설정 -->
            <section id="view-settings" class="view hidden">
              <!-- 계정 정보 -->
              <div class="settings-card">
                <h3 class="section-label">계정 정보</h3>
                <dl class="settings-info-list">
                  <div class="settings-info-row">
                    <dt>아이디</dt>
                    <dd id="setting-username">-</dd>
                  </div>
                  <div class="settings-info-row">
                    <dt>이메일</dt>
                    <dd id="setting-email">-</dd>
                  </div>
                  <div class="settings-info-row">
                    <dt>전화번호</dt>
                    <dd id="setting-phone-view">-</dd>
                  </div>
                  <div class="settings-info-row">
                    <dt>주소</dt>
                    <dd id="setting-address-view">-</dd>
                  </div>
                </dl>
              </div>

              <!-- 연락처 / 주소 수정 -->
              <div class="settings-card">
                <h3 class="section-label">연락처 · 주소 설정</h3>
                <p class="settings-help">
                  전화번호와 주소를 수정한 뒤 &lt;저장하기&gt;를 눌러 주세요.
                </p>

                <form id="settings-form">
                  <div class="form-row">
                    <label for="setting-phone">전화번호</label>
                    <input
                      type="text"
                      id="setting-phone"
                      name="phone"
                      placeholder="예: 010-1234-5678"
                    />
                  </div>
                  <div class="form-row">
                    <label for="setting-address">주소</label>
                    <input
                      type="text"
                      id="setting-address"
                      name="address"
                      placeholder="주소를 입력해 주세요"
                    />
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn-secondary">저장하기</button>
                    <span id="settings-save-msg" class="settings-msg"></span>
                  </div>
                </form>
              </div>

              <!-- 비밀번호 변경 -->
              <div class="settings-card">
                <h3 class="section-label">비밀번호 변경</h3>
                <form id="settings-password-form">
                  <div class="form-row">
                    <label for="setting-current-password">현재 비밀번호</label>
                    <input
                      type="password"
                      id="setting-current-password"
                      autocomplete="current-password"
                    />
                  </div>
                  <div class="form-row">
                    <label for="setting-new-password-1">새 비밀번호</label>
                    <input
                      type="password"
                      id="setting-new-password-1"
                      autocomplete="new-password"
                    />
                  </div>
                  <div class="form-row">
                    <label for="setting-new-password-2">새 비밀번호 확인</label>
                    <input
                      type="password"
                      id="setting-new-password-2"
                      autocomplete="new-password"
                    />
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn-secondary">
                      비밀번호 변경
                    </button>
                    <span
                      id="settings-password-msg"
                      class="settings-msg"
                    ></span>
                  </div>
                </form>
              </div>
            </section>

            <!-- 프로필 탭 -->
            <section id="view-profile" class="panel dashboard-view hidden">
              <header class="panel-header">
                <div>
                  <h2>프로필</h2>
                  <p class="panel-desc">
                    나의 캐릭터, 업적, 인벤토리를 한 번에 확인할 수 있는
                    공간입니다.
                  </p>
                </div>
              </header>

              <div class="profile-panel-grid">
                <!-- LEFT : 내 정보 카드 -------------------------------------------->
                <div class="panel-block">
                  <h3 class="profile-title">내 정보</h3>

                  <div class="profile-nickname" id="profile-nickname">
                    tester
                  </div>
                  <div class="profile-level-text" id="profile-level">Lv. 1</div>

                  <!-- 경험치 / 골드 / 젬 -->
                  <div class="profile-stats-row">
                    <div class="profile-stat-chip">
                      <span class="stat-label">경험치</span>
                      <span id="profile-xp">0 XP</span>
                    </div>
                    <div class="profile-stat-chip">
                      <span class="stat-label">골드</span>
                      <span id="profile-gold">0 G</span>
                    </div>
                    <div class="profile-stat-chip">
                      <span class="stat-label">젬</span>
                      <span id="profile-gem">0 ◇</span>
                    </div>
                  </div>

                  <!-- 캐릭터 / 배지 / 프레임 대신 : 업적 · 스킬 요약 -->
                  <div class="profile-extra">

                    <!-- 프로필 > 업적(뱃지) 인벤토리 -->
                    <div id="profile-achievement-list" class="profile-achievement-list">
                      <!-- JS에서 카드들이 여기로 들어옴 -->
                    </div>
                    <!-- 프로필 > 보유 스킬 -->
                    <p id="profile-skills-text" class="profile-skills-text">
                      보유 스킬이 없습니다.
                    </p>
                  </div>
                </div>

                <!-- RIGHT : 장착 슬롯 + 인벤토리 ------------------------------->
                <div class="profile-right">
                  <!-- 장착 슬롯 -->
                  <section class="profile-equip-section">
                    <h3 class="profile-title">장착 슬롯</h3>
                    <div class="profile-equip-grid">
                      <!-- 캐릭터 슬롯 -->
                      <article
                        id="profile-equip-char"
                        class="profile-equip-card empty"
                      >
                        <div class="equip-label">캐릭터</div>

                        <div id="profile-equip-char-placeholder">
                          <p class="equip-empty-text">
                            장착된 캐릭터가 없어요.
                          </p>
                        </div>

                        <div id="profile-equip-char-content" class="hidden">
                          <div class="equip-name" id="profile-equip-char-name">
                            장착된 캐릭터 이름
                          </div>
                          <p class="equip-desc" id="profile-equip-char-desc">
                            캐릭터 설명이 이곳에 표시됩니다.
                          </p>
                          <button
                            type="button"
                            id="btn-profile-unequip-char"
                            class="btn-ghost btn-xs equip-unequip-btn hidden"
                          >
                            장착 해제
                          </button>
                        </div>
                      </article>

                      <!-- 펫 슬롯 -->
                      <article
                        id="profile-equip-pet"
                        class="profile-equip-card empty"
                      >
                        <div class="equip-label">펫</div>

                        <div id="profile-equip-pet-placeholder">
                          <p class="equip-empty-text">장착된 펫이 없어요.</p>
                        </div>

                        <div id="profile-equip-pet-content" class="hidden">
                          <div class="equip-name" id="profile-equip-pet-name">
                            장착된 펫 이름
                          </div>
                          <p class="equip-desc" id="profile-equip-pet-desc">
                            펫 설명이 이곳에 표시됩니다.
                          </p>
                          <button
                            type="button"
                            id="btn-profile-unequip-pet"
                            class="btn-ghost btn-xs equip-unequip-btn hidden"
                          >
                            장착 해제
                          </button>
                        </div>
                      </article>
                    </div>
                  </section>

                  <!-- 인벤토리 : 캐릭터 / 펫 분리 -->
                  <section class="profile-inventory-section">
                    <div class="profile-inventory-header">
                      <h3 class="profile-title">내 인벤토리</h3>
                      <p class="profile-inventory-desc">
                        보유 중인 캐릭터와 펫을 선택해서 장착할 수 있어요.
                      </p>
                    </div>

                    <div class="profile-inventory-split">
                      <!-- 캐릭터 인벤토리 -->
                      <div class="profile-inventory-col">
                        <div class="profile-inventory-col-header">
                          캐릭터 인벤토리
                        </div>
                        <div
                          id="profile-inventory-list-char"
                          class="profile-inventory-list"
                        ></div>
                      </div>

                      <!-- 펫 인벤토리 -->
                      <div class="profile-inventory-col">
                        <div class="profile-inventory-col-header">
                          펫 인벤토리
                        </div>
                        <div
                          id="profile-inventory-list-pet"
                          class="profile-inventory-list"
                        ></div>
                      </div>
                    </div>

                    <p
                      id="profile-inventory-empty"
                      class="empty-text hidden"
                      style="margin-top: 8px"
                    >
                      아직 보유한 캐릭터/펫이 없어요. 상점에서 아이템을
                      구매해보세요.
                    </p>
                  </section>
                </div>
              </div>
            </section>
          </main>
        </div>
      </section>
    </div>

    <!-- 퀘스트 생성 모달 -->
    <div class="modal-backdrop hidden" id="quest-modal-backdrop">
      <div class="modal">
        <h3 class="modal-title">퀘스트 생성하기</h3>

        <div class="field">
          <span>퀘스트 제목</span>
          <input
            type="text"
            id="quest-title-input"
            placeholder="예: 아침 스트레칭 10분"
          />
        </div>

        <div class="field">
          <span>퀘스트 내용</span>
          <textarea
            id="quest-desc-input"
            rows="3"
            placeholder="어떤 퀘스트인지 적어주세요."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button
            class="btn-ghost btn-sm"
            type="button"
            id="quest-modal-cancel"
          >
            취소
          </button>
          <button
            class="btn-primary btn-sm"
            type="button"
            id="quest-modal-save"
          >
            완료
          </button>
        </div>
      </div>
    </div>

    <script src="app.js"></script>
  </body>
</html>
