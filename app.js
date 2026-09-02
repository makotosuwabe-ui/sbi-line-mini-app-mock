if (new URLSearchParams(location.search).has("reset")) {
  localStorage.removeItem("splus-view");
  localStorage.removeItem("splus-login");
  localStorage.removeItem("splus-application-step");
  localStorage.removeItem("splus-applicant");
}

const state = {
  view: localStorage.getItem("splus-view") || "home",
  loggedIn: localStorage.getItem("splus-login") === "true",
  applicationStep: Number(localStorage.getItem("splus-application-step") || 0),
  applicant: JSON.parse(localStorage.getItem("splus-applicant") || JSON.stringify(APP_CONFIG.application.defaultApplicant)),
  borrowAmount: 100000,
  paymentAmount: APP_CONFIG.customer.nextPayment,
  simulation: { amount: 500000, months: 36, rate: 12.8 }
};

const app = document.querySelector("#app");

const yen = (value) => `${Number(value).toLocaleString("ja-JP")}円`;
const pct = () => Math.min(100, Math.round((APP_CONFIG.customer.borrowed / APP_CONFIG.customer.contractLimit) * 100));

function save() {
  localStorage.setItem("splus-view", state.view);
  localStorage.setItem("splus-login", String(state.loggedIn));
  localStorage.setItem("splus-application-step", String(state.applicationStep));
  localStorage.setItem("splus-applicant", JSON.stringify(state.applicant));
}

function logo() {
  return `
    <div class="logo-lockup" role="img" aria-label="SBI新生銀行カードローン">
      <svg class="logo-emblem" viewBox="0 0 62 38" aria-hidden="true">
        <rect width="62" height="38" rx="5" fill="#143f6b"></rect>
        <path d="M10 11h20v5H17.5a2.6 2.6 0 0 0 0 5.2h6.2a7.9 7.9 0 0 1 0 15.8H10v-5h13.7a2.6 2.6 0 0 0 0-5.2h-6.2a7.9 7.9 0 0 1 0-15.8Z" fill="#fff"></path>
        <path d="M35 11h7.5c5 0 8 2.2 8 6 0 2.2-1.1 3.8-3.2 4.6 2.6.8 4 2.7 4 5.4 0 4.4-3.3 7-8.8 7H35V11Zm6 5v4h2c1.5 0 2.4-.7 2.4-2s-.9-2-2.4-2h-2Zm0 9v4h2.6c1.6 0 2.6-.8 2.6-2s-1-2-2.6-2H41Z" fill="#fff"></path>
        <circle cx="55" cy="8" r="4.5" fill="#00a56a"></circle>
      </svg>
      <span>SBI新生銀行</span>
    </div>`;
}

function illustration() {
  return `
    <svg class="hero-illust" viewBox="0 0 230 188" aria-hidden="true">
      <path d="M38 139c9-44 49-82 97-82 46 0 78 31 78 69 0 36-33 55-90 55-55 0-93-10-85-42Z" fill="#e5f8f0"></path>
      <rect x="89" y="20" width="86" height="142" rx="20" fill="#143f6b"></rect>
      <rect x="100" y="36" width="64" height="102" rx="12" fill="#fff"></rect>
      <rect x="110" y="50" width="44" height="10" rx="5" fill="#d6edf7"></rect>
      <rect x="110" y="72" width="48" height="34" rx="10" fill="#ecfff7"></rect>
      <path d="M121 89h23M132.5 77.5v23" stroke="#00a56a" stroke-width="7" stroke-linecap="round"></path>
      <circle cx="132" cy="150" r="5" fill="#fff"></circle>
      <rect x="24" y="92" width="72" height="50" rx="16" fill="#ffd56b"></rect>
      <path d="M37 112h44M37 126h25" stroke="#143f6b" stroke-width="7" stroke-linecap="round"></path>
      <circle cx="189" cy="85" r="24" fill="#ff8a70"></circle>
      <path d="M178 86h22M189 75v22" stroke="#fff" stroke-width="7" stroke-linecap="round"></path>
      <path d="M41 52c17-19 45-26 72-17" fill="none" stroke="#00a56a" stroke-width="9" stroke-linecap="round"></path>
    </svg>`;
}

function icon(name) {
  const paths = {
    apply: `<path d="M10 4h10a2 2 0 0 1 2 2v16H4V6a2 2 0 0 1 2-2h4Z"/><path d="M9 9h6M9 13h6M12 17h8"/>`,
    diagnosis: `<circle cx="11" cy="11" r="6"/><path d="m16 16 5 5"/><path d="M11 8v6M8 11h6"/>`,
    status: `<path d="M4 5h16v14H4z"/><path d="m7 12 3 3 7-7"/>`,
    login: `<path d="M10 17H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/><path d="m14 8 4 4-4 4M18 12H9"/>`,
    atm: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M8 15h3M14 15h2"/>`,
    borrow: `<path d="M12 3v18M7 8l5-5 5 5"/><path d="M5 21h14"/>`,
    repay: `<path d="M12 21V3M7 16l5 5 5-5"/><path d="M5 3h14"/>`,
    support: `<path d="M5 18a7 7 0 1 1 14 0"/><path d="M5 18v2h4v-5H5v3Zm14 0v2h-4v-5h4v3Z"/>`,
    document: `<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v6h5M10 13h6M10 17h6"/>`,
    rate: `<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>`,
    calendar: `<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 15h4v3H8z"/>`,
    sim: `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0"/>`
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.document}</svg>`;
}

function menuIcon(item) {
  if (item.includes("申込")) return "apply";
  if (item.includes("診断")) return "diagnosis";
  if (item.includes("審査")) return "status";
  if (item.includes("ログイン") || item.includes("契約中")) return "login";
  if (item.includes("ATM")) return "atm";
  if (item.includes("借入")) return "borrow";
  if (item.includes("返済期日") || item.includes("返済額")) return "calendar";
  if (item.includes("返済シミュレーション")) return "sim";
  if (item.includes("返済")) return "repay";
  if (item.includes("金利")) return "rate";
  if (item.includes("お問い合わせ")) return "support";
  return "document";
}

function header(title = APP_CONFIG.brand.serviceName, showBack = false) {
  return `
    <header class="topbar">
      <div class="brand-row">
        <div class="brand">
          ${showBack ? `<button class="icon-btn" data-action="back" aria-label="戻る">‹</button>` : logo()}
          <div><strong>${title}</strong><span>${showBack ? APP_CONFIG.brand.bankName : "カードローン Sプラス"}</span></div>
        </div>
        <button class="icon-btn" data-view="contact" aria-label="お問い合わせ">?</button>
      </div>
    </header>`;
}

function nav() {
  const items = [
    ["home", "⌂", "ホーム"],
    ["apply", "＋", "申込"],
    ["member", "¥", "会員"],
    ["menu", "☰", "メニュー"]
  ];
  return `<nav class="bottom-nav">${items.map(([view, icon, label]) => `<button class="${state.view === view ? "active" : ""}" data-view="${view}"><b>${icon}</b>${label}</button>`).join("")}</nav>`;
}

function home() {
  return `${header()}
    <section class="screen">
      <div class="hero">
        <span class="pill">最短ルートで手続き</span>
        <h1>急な出費、スマホで準備。</h1>
        <p>申込も、返済日の確認も、必要な操作だけをすぐ見つけられます。</p>
        ${illustration()}
      </div>
      <div class="action-stack">
        <button class="big-action apply-action" data-view="apply">${icon("apply")}<span><b>今すぐ申込</b><small>新規のお客様はこちら</small></span></button>
        <div class="mini-actions">
          <button data-view="diagnosis">${icon("diagnosis")}<b>借入診断</b></button>
          <button data-view="status">${icon("status")}<b>審査状況</b></button>
        </div>
      </div>
      <div class="visual-status" data-view="member">
        <div>
          <span>会員のお客様</span>
          <strong>${APP_CONFIG.customer.nextDueDate}</strong>
          <small>次回返済 ${yen(APP_CONFIG.customer.nextPayment)}</small>
        </div>
        ${icon("calendar")}
      </div>
      <div class="benefit-strip">
        <span>ネット完結</span><span>ATM対応</span><span>${APP_CONFIG.product.rate}</span>
      </div>
      ${quickGrid(true)}
    </section>${nav()}`;
}

function quickGrid(compact = false) {
  const items = compact ? APP_CONFIG.quickItems.filter((item) => !["今すぐ申込", "お借入れ診断", "審査状況のご確認"].includes(item)) : APP_CONFIG.quickItems;
  return `<div class="section-title"><h2>${compact ? "よく使うメニュー" : "メニュー"}</h2></div><div class="grid icon-grid">${items.map((item) => `<button class="tile" data-menu="${item}">${icon(menuIcon(item))}<b>${item}</b></button>`).join("")}</div>`;
}

function apply() {
  const s = state.applicationStep;
  const steps = APP_CONFIG.application.steps;
  let body = "";
  if (s === 0) {
    body = `<form class="form" data-form="apply">
      ${field("name", "お名前", state.applicant.name)}
      ${field("kana", "フリガナ", state.applicant.kana)}
      ${field("phone", "携帯電話番号", state.applicant.phone)}
      ${field("income", "年収（万円）", state.applicant.income, "number")}
      ${field("desiredAmount", "希望額（万円）", state.applicant.desiredAmount, "number")}
      ${field("purpose", "ご利用目的", state.applicant.purpose)}
      <button class="primary">入力内容を確認</button>
    </form>`;
  } else if (s === 1) {
    body = `<div class="panel"><ul class="list">${Object.entries(state.applicant).map(([k, v]) => `<li><span class="check">✓</span><span>${label(k)}: <b>${v}</b></span></li>`).join("")}</ul></div><button class="primary" data-action="next-step" style="margin-top:14px">本人確認へ進む</button>`;
  } else if (s === 2) {
    body = `<div class="notice">本人確認書類と、必要な場合は収入確認書類を提出します。</div><ul class="list" style="margin-top:12px">${APP_CONFIG.product.documents.map((x) => `<li><span class="check">✓</span><span>${x}</span></li>`).join("")}</ul><button class="primary" data-action="next-step" style="margin-top:14px">書類を提出する</button>`;
  } else if (s === 3) {
    body = `<div class="panel"><h2>審査状況</h2><p class="notice">申込を受け付けました。審査状況はこの画面から確認できます。</p></div><button class="primary" data-action="next-step" style="margin-top:14px">契約手続きへ進む</button>`;
  } else {
    body = complete("新規申込を受け付けました", "審査状況はLINE内の「審査状況のご確認」から確認できます。", "ホームへ", "home");
  }
  return `${header("今すぐ申込", true)}<section class="screen"><div class="stepper">${steps.map((_, i) => `<i class="${i <= s ? "active" : ""}"></i>`).join("")}</div>${body}</section>${nav()}`;
}

function field(key, text, value, type = "text") {
  return `<div class="field"><label for="${key}">${text}</label><input id="${key}" name="${key}" type="${type}" value="${value}"></div>`;
}

function label(key) {
  return ({ name: "お名前", kana: "フリガナ", phone: "携帯電話番号", income: "年収（万円）", desiredAmount: "希望額（万円）", purpose: "ご利用目的" })[key] || key;
}

function member() {
  state.loggedIn = true;
  save();
  const c = APP_CONFIG.customer;
  return `${header("会員ホーム", true)}<section class="screen">
    <div class="member-hero">
      <div>
        <span>こんにちは</span>
        <h1>${c.name} 様</h1>
        <small>会員番号 ${c.memberId}</small>
      </div>
      ${icon("login")}
    </div>
    <div class="due-card">
      ${icon("calendar")}
      <span>次回のご返済</span>
      <strong>${c.nextDueDate}</strong>
      <b>${yen(c.nextPayment)}</b>
    </div>
    <div class="section-title"><h2>借入状況</h2></div>
    <div class="balance-card">
      <div class="summary-band">
        <div><span>借入中</span><h2>${yen(c.borrowed)}</h2></div>
        <div><span>借入できる額</span><h2>${yen(c.available)}</h2></div>
      </div>
      <div class="meter"><i style="width:${pct()}%"></i></div>
      <p style="color:var(--muted); font-size:12px">限度額 ${yen(c.contractLimit)} / ${c.rate}</p>
    </div>
    <div class="button-row" style="margin-top:14px">
      <button class="primary" data-view="borrow">新たな借り入れ</button>
      <button class="secondary" data-view="repay">返済する</button>
    </div>
    <button class="ghost" data-view="simulation" style="width:100%; margin-top:10px">ご返済シミュレーション</button>
  </section>${nav()}`;
}

function diagnosis() {
  return `${header("お借入れ診断", true)}<section class="screen">
    <div class="notice">年齢、年収、他社借入を入力すると、申込前の目安を確認できます。</div>
    <form class="form" data-form="diagnosis" style="margin-top:14px">
      ${field("age", "年齢", "35", "number")}
      ${field("income", "年収（万円）", "420", "number")}
      ${field("otherDebt", "他社借入（万円）", "30", "number")}
      <button class="primary">診断する</button>
    </form>
  </section>${nav()}`;
}

function status() {
  return `${header("審査状況のご確認", true)}<section class="screen">
    <div class="panel">
      <h2>審査中</h2>
      <p class="notice">受付番号 AP-20260902-014 の審査を進めています。</p>
      <ul class="list" style="margin-top:12px">
        <li><span class="check">✓</span><span>申込受付</span></li>
        <li><span class="check">✓</span><span>本人確認書類の確認</span></li>
        <li><span class="check">…</span><span>審査結果のご案内</span></li>
      </ul>
    </div>
  </section>${nav()}`;
}

function transaction(type) {
  const isBorrow = type === "borrow";
  return `${header(isBorrow ? "新たな借り入れ" : "返済する", true)}<section class="screen">
    <div class="notice">${isBorrow ? `ご利用可能額 ${yen(APP_CONFIG.customer.available)} の範囲で手続きできます。` : `次回返済額は ${yen(APP_CONFIG.customer.nextPayment)}、期日は ${APP_CONFIG.customer.nextDueDate} です。`}</div>
    <form class="form" data-form="${type}" style="margin-top:14px">
      ${field("amount", isBorrow ? "借入希望額（円）" : "返済額（円）", isBorrow ? state.borrowAmount : state.paymentAmount, "number")}
      <div class="field"><label>方法</label><select name="method"><option>${isBorrow ? "登録口座へ振込" : "登録口座から返済"}</option><option>提携ATM</option></select></div>
      <button class="primary">${isBorrow ? "借入内容を確認" : "返済内容を確認"}</button>
    </form>
  </section>${nav()}`;
}

function simulation() {
  const m = state.simulation;
  const monthly = Math.round((m.amount * (1 + m.rate / 100)) / m.months);
  return `${header("ご返済シミュレーション", true)}<section class="screen">
    <form class="form" data-form="simulation">
      ${field("amount", "借入額（円）", m.amount, "number")}
      ${field("months", "返済回数（月）", m.months, "number")}
      ${field("rate", "利率（年率%）", m.rate, "number")}
      <button class="primary">再計算する</button>
    </form>
    <div class="metric light" style="margin-top:14px"><span>毎月返済額の目安</span><strong>${yen(monthly)}</strong></div>
  </section>${nav()}`;
}

function menuPage(item = "商品概要説明書") {
  const page = APP_CONFIG.faq[item] || APP_CONFIG.faq["商品概要説明書"];
  return `${header(page.title, true)}<section class="screen">
    <div class="panel"><p>${page.body}</p></div>
    <ul class="list" style="margin-top:12px">${page.points.map((p) => `<li><span class="check">✓</span><span>${p}</span></li>`).join("")}</ul>
    ${item.includes("返済") ? `<button class="primary" data-view="simulation" style="margin-top:14px">ご返済シミュレーション</button>` : ""}
    ${item.includes("借入") ? `<button class="primary" data-view="borrow" style="margin-top:14px">新たな借り入れ</button>` : ""}
  </section>${nav()}`;
}

function menu() {
  return `${header("メニュー", true)}<section class="screen">${quickGrid()}</section>${nav()}`;
}

function contact() {
  return `${header("お問い合わせ", true)}<section class="screen">
    <div class="panel"><h2>ご相談内容を選択</h2><div class="segmented" style="margin-top:12px"><button class="active">申込前</button><button>契約中</button></div></div>
    <ul class="list" style="margin-top:12px"><li><span class="check">?</span><span>よくある質問を見る</span></li><li><span class="check">☎</span><span>電話で相談する</span></li><li><span class="check">✉</span><span>メッセージで相談する</span></li></ul>
  </section>${nav()}`;
}

function complete(title, text, button, view) {
  return `<div class="complete"><div class="big-check">✓</div><h2>${title}</h2><p class="notice">${text}</p><button class="primary" data-view="${view}" style="margin-top:16px">${button}</button></div>`;
}

function render() {
  save();
  const routes = { home, apply, member, diagnosis, status, borrow: () => transaction("borrow"), repay: () => transaction("repay"), simulation, menu, contact };
  app.innerHTML = (routes[state.view] || (() => menuPage(state.view)))();
  bind();
}

function bind() {
  app.querySelectorAll("[data-view]").forEach((el) => el.addEventListener("click", () => {
    state.view = el.dataset.view;
    render();
  }));
  app.querySelectorAll("[data-menu]").forEach((el) => el.addEventListener("click", () => {
    const item = el.dataset.menu;
    if (item === "今すぐ申込") state.view = "apply";
    else if (item === "お借入れ診断") state.view = "diagnosis";
    else if (item === "審査状況のご確認") state.view = "status";
    else if (item === "会員ログイン") state.view = "member";
    else if (item === "ご返済シミュレーション") state.view = "simulation";
    else state.view = item;
    render();
  }));
  const back = app.querySelector("[data-action='back']");
  if (back) back.addEventListener("click", () => { state.view = "home"; render(); });
  app.querySelectorAll("[data-action='next-step']").forEach((el) => el.addEventListener("click", () => { state.applicationStep += 1; render(); }));
  const applyForm = app.querySelector("[data-form='apply']");
  if (applyForm) applyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.applicant = Object.fromEntries(new FormData(applyForm).entries());
    state.applicationStep = 1;
    render();
  });
  const diagnosisForm = app.querySelector("[data-form='diagnosis']");
  if (diagnosisForm) diagnosisForm.addEventListener("submit", (event) => {
    event.preventDefault();
    app.querySelector(".screen").innerHTML = complete("申込の目安があります", "入力内容では、申込へ進める可能性があります。正式な結果は審査により決まります。", "今すぐ申込", "apply");
    bind();
  });
  app.querySelectorAll("[data-form='borrow'], [data-form='repay']").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isBorrow = form.dataset.form === "borrow";
    const amount = Number(new FormData(form).get("amount"));
    app.querySelector(".screen").innerHTML = complete(isBorrow ? "借入申込を受け付けました" : "返済を受け付けました", `${yen(amount)} の手続き内容を保存しました。`, "会員ホームへ", "member");
    bind();
  }));
  const simForm = app.querySelector("[data-form='simulation']");
  if (simForm) simForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(simForm).entries());
    state.simulation = { amount: Number(data.amount), months: Number(data.months), rate: Number(data.rate) };
    render();
  });
}

render();
