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
    <svg class="logo-mark" viewBox="0 0 48 48" role="img" aria-label="SBI新生銀行">
      <rect width="48" height="48" rx="8" fill="#12324a"></rect>
      <path d="M12 15h24v6H20a3 3 0 0 0 0 6h8a9 9 0 0 1 0 18H12v-6h16a3 3 0 0 0 0-6h-8a9 9 0 0 1 0-18Z" fill="#fff"></path>
      <circle cx="37" cy="11" r="5" fill="#00a56a"></circle>
    </svg>`;
}

function illustration() {
  return `
    <svg class="hero-illust" viewBox="0 0 210 180" aria-hidden="true">
      <rect x="76" y="24" width="94" height="132" rx="18" fill="#12324a"></rect>
      <rect x="86" y="38" width="74" height="98" rx="10" fill="#f7fbfd"></rect>
      <rect x="98" y="52" width="50" height="10" rx="5" fill="#dfeef3"></rect>
      <rect x="98" y="72" width="38" height="10" rx="5" fill="#00a56a"></rect>
      <rect x="98" y="94" width="50" height="26" rx="8" fill="#fff0d5"></rect>
      <circle cx="112" cy="146" r="5" fill="#fff"></circle>
      <circle cx="55" cy="106" r="32" fill="#ff8066"></circle>
      <path d="M36 106h38M55 87v38" stroke="#fff" stroke-width="8" stroke-linecap="round"></path>
      <path d="M38 34c20-18 52-17 72 0" fill="none" stroke="#00a56a" stroke-width="8" stroke-linecap="round"></path>
      <circle cx="177" cy="74" r="14" fill="#ffd166"></circle>
    </svg>`;
}

function header(title = APP_CONFIG.brand.serviceName, showBack = false) {
  return `
    <header class="topbar">
      <div class="brand-row">
        <div class="brand">
          ${showBack ? `<button class="icon-btn" data-action="back" aria-label="戻る">‹</button>` : logo()}
          <div><strong>${title}</strong><span>${APP_CONFIG.brand.productName}</span></div>
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
        <span class="pill">LINEからスムーズに手続き</span>
        <h1>急な出費に、迷わず申込へ。</h1>
        <p>診断、申込、審査状況、会員メニューまでスマートフォンで完結しやすい形にまとめました。</p>
        <div class="button-row">
          <button class="primary" data-view="apply">今すぐ申込</button>
          <button class="secondary" data-view="diagnosis">お借入れ診断</button>
        </div>
        ${illustration()}
      </div>
      <div class="summary-band">
        <div class="metric light"><span>借入利率</span><strong>${APP_CONFIG.product.rate}</strong></div>
        <div class="metric"><span>契約額</span><strong>${APP_CONFIG.product.limit}</strong></div>
      </div>
      <div class="section-title"><h2>既存のお客様</h2></div>
      <div class="panel">
        <p class="notice">返済期日と金額、借入状況をすぐ確認できます。</p>
        <div class="button-row" style="margin-top:12px">
          <button class="secondary" data-view="member">会員ログイン</button>
          <button class="ghost" data-view="status">審査状況のご確認</button>
        </div>
      </div>
      ${quickGrid()}
    </section>${nav()}`;
}

function quickGrid() {
  return `<div class="section-title"><h2>メニュー</h2></div><div class="grid">${APP_CONFIG.quickItems.map((item) => `<button class="tile" data-menu="${item}"><b>${item}</b><span>タップして確認</span></button>`).join("")}</div>`;
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
    <div class="panel">
      <strong>${c.name} 様</strong>
      <p style="color:var(--muted); margin:6px 0 0">会員番号 ${c.memberId}</p>
    </div>
    <div class="section-title"><h2>次回のご返済</h2></div>
    <div class="summary-band">
      <div class="metric"><span>返済期日</span><strong>${c.nextDueDate}</strong></div>
      <div class="metric light"><span>返済額</span><strong>${yen(c.nextPayment)}</strong></div>
    </div>
    <div class="section-title"><h2>借入状況</h2></div>
    <div class="panel">
      <div class="summary-band">
        <div><span>ご利用残高</span><h2>${yen(c.borrowed)}</h2></div>
        <div><span>ご利用可能額</span><h2>${yen(c.available)}</h2></div>
      </div>
      <div class="meter"><i style="width:${pct()}%"></i></div>
      <p style="color:var(--muted); font-size:12px">借入限度額 ${yen(c.contractLimit)} / 適用利率 ${c.rate}</p>
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
