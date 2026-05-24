const PIX_KEY = "211348b6-48a3-4a77-bcea-af0d4aa0ac1c";
const MERCHANT_NAME = "VERTICE";
const MERCHANT_CITY = "BRASIL";
const ADMIN_PASSWORD = "Vertice2026";

const plans = [
  {
    id: "auditoria",
    name: "Auditoria Expressa",
    tag: "Entrada",
    icon: "search_insights",
    desc: "Análise rápida para identificar gargalos, oportunidades e próximos passos.",
    price: 49.9,
    period: "sessão avulsa",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85",
    features: ["Diagnóstico inicial", "Recomendações práticas", "Resumo de prioridades"]
  },
  {
    id: "direcao",
    name: "Plano Direção",
    tag: "Popular",
    icon: "trending_up",
    desc: "Estratégia objetiva para melhorar posicionamento, oferta e aquisição de clientes.",
    price: 97,
    period: "consultoria estratégica",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85",
    features: ["Mapa de crescimento", "Ajuste de oferta", "Checklist de execução"]
  },
  {
    id: "sessao",
    name: "Sessão Estratégica",
    tag: "Individual",
    icon: "psychology",
    desc: "Encontro individual para organizar ideias, metas e decisões comerciais.",
    price: 149.9,
    period: "sessão 1:1",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85",
    features: ["Sessão de 1 hora", "Material de apoio", "Plano de próximos passos"]
  },
  {
    id: "acompanhamento",
    name: "Acompanhamento 15 Dias",
    tag: "Execução",
    icon: "calendar_month",
    desc: "Duas reuniões e acompanhamento curto para tirar o plano do papel com direção.",
    price: 297,
    period: "15 dias",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85",
    features: ["2 encontros", "Suporte de alinhamento", "Revisão de execução"]
  },
  {
    id: "imersao",
    name: "Imersão de Crescimento",
    tag: "Avançado",
    icon: "rocket_launch",
    desc: "Imersão para estruturar estratégia, proposta de valor e plano de evolução.",
    price: 497,
    period: "imersão guiada",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85",
    features: ["Imersão de 3 horas", "Plano personalizado", "Prioridades por impacto"]
  },
  {
    id: "executivo",
    name: "Retainer Executivo",
    tag: "Mensal",
    icon: "workspace_premium",
    desc: "Acompanhamento contínuo para negócios que precisam de apoio estratégico recorrente.",
    price: 997,
    period: "mensal",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85",
    features: ["Consultoria recorrente", "Reuniões de decisão", "Acompanhamento de métricas"]
  }
];

let selectedPlan = null;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function createMaterialIcon(name) {
  return `<span class="material-symbols-rounded" aria-hidden="true">${name}</span>`;
}

function renderPlans() {
  const container = qs("#plansContainer");
  if (!container) return;

  container.innerHTML = plans.map((plan) => {
    const selected = selectedPlan?.id === plan.id;
    const features = plan.features.map((feature) => `
      <li>${createMaterialIcon("check_circle")}<span>${feature}</span></li>
    `).join("");

    return `
      <article class="plan-card reveal ${selected ? "selected" : ""}" data-plan-id="${plan.id}" tabindex="0" role="button" aria-label="Selecionar plano ${plan.name}">
        <div class="plan-media">
          <img src="${plan.image}" alt="Imagem profissional representando ${plan.name}" loading="lazy" />
        </div>
        <div class="plan-content">
          <div class="plan-topline">
            <span class="plan-tag">${createMaterialIcon(plan.icon)} ${plan.tag}</span>
          </div>
          <h3 class="plan-name">${plan.name}</h3>
          <p class="plan-desc">${plan.desc}</p>
          <ul class="plan-features">${features}</ul>
          <div class="plan-footer">
            <div class="plan-price">
              <strong>${currency.format(plan.price)}</strong>
              <span>${plan.period}</span>
            </div>
            <button class="btn plan-btn" type="button">${selected ? "Selecionado" : "Selecionar"}</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  qsa(".plan-card", container).forEach((card) => {
    const select = () => selectPlan(card.dataset.planId);
    card.addEventListener("click", select);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });

  observeRevealItems();
}

function selectPlan(planId) {
  selectedPlan = plans.find((plan) => plan.id === planId);
  renderPlans();
  renderPixPanel();

  qs("#pagamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function emv(id, value) {
  const cleanValue = String(value ?? "");
  return `${id}${String(cleanValue.length).padStart(2, "0")}${cleanValue}`;
}

function crc16CCITT(payload) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function generatePixPayload({ key, merchantName, merchantCity, amount, txid }) {
  const merchantAccount = emv("00", "BR.GOV.BCB.PIX") + emv("01", key);
  const additionalData = emv("05", txid.slice(0, 25));

  const payloadWithoutCRC =
    emv("00", "01") +
    emv("26", merchantAccount) +
    emv("52", "0000") +
    emv("53", "986") +
    emv("54", Number(amount).toFixed(2)) +
    emv("58", "BR") +
    emv("59", merchantName.slice(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "")) +
    emv("60", merchantCity.slice(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "")) +
    emv("62", additionalData) +
    "6304";

  return payloadWithoutCRC + crc16CCITT(payloadWithoutCRC);
}

function renderPixPanel() {
  const pixPanel = qs("#pixPanel");
  const emptyPayment = qs("#emptyPayment");
  const qrContainer = qs("#qrcodeContainer");
  const selectedPlanText = qs("#selectedPlanText");
  const statusMessage = qs("#statusMessage");

  if (!pixPanel || !emptyPayment || !selectedPlan || !qrContainer) return;

  pixPanel.hidden = false;
  emptyPayment.hidden = true;
  pixPanel.classList.add("visible");

  const txid = `VTX${Date.now().toString().slice(-10)}`;
  const pixCode = generatePixPayload({
    key: PIX_KEY,
    merchantName: MERCHANT_NAME,
    merchantCity: MERCHANT_CITY,
    amount: selectedPlan.price,
    txid
  });

  selectedPlanText.textContent = `${selectedPlan.name} selecionado. Valor: ${currency.format(selectedPlan.price)}.`;
  statusMessage.textContent = "Aguardando confirmação do pagamento.";
  statusMessage.className = "status-msg";

  qrContainer.innerHTML = '<div class="qr-box" id="qrBox" aria-label="QR Code Pix"></div>';

  if (window.QRCode) {
    new QRCode(qs("#qrBox"), {
      text: pixCode,
      width: 188,
      height: 188,
      colorDark: "#07111f",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    qs("#qrBox").textContent = "Não foi possível carregar o QR Code. Copie a chave Pix para finalizar.";
  }

  pixPanel.dataset.pixCode = pixCode;
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setStatus(message, type = "") {
  const status = qs("#statusMessage");
  if (!status) return;
  status.textContent = message;
  status.className = `status-msg ${type}`.trim();
}

function saveOrder(email, plan) {
  const orders = JSON.parse(localStorage.getItem("vertice_pedidos") || "[]");
  orders.push({
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    email,
    plano: plan.name,
    valor: plan.price,
    data: new Date().toISOString(),
    status: "Aguardando validação do pagamento"
  });

  localStorage.setItem("vertice_pedidos", JSON.stringify(orders));
}

function bindPaymentActions() {
  qs("#copyKeyBtn")?.addEventListener("click", async () => {
    try {
      await copyToClipboard(PIX_KEY);
      setStatus("Chave Pix copiada. Abra o app do banco para concluir o pagamento.", "success");
    } catch {
      setStatus("Não foi possível copiar automaticamente. Selecione e copie a chave manualmente.", "error");
    }
  });

  qs("#confirmarPagamentoBtn")?.addEventListener("click", () => {
    const emailInput = qs("#clienteEmail");
    const email = emailInput?.value.trim() || "";

    if (!selectedPlan) {
      setStatus("Selecione um plano antes de registrar o pedido.", "error");
      qs("#planos")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("Informe um e-mail válido para receber a confirmação.", "error");
      emailInput?.focus();
      return;
    }

    saveOrder(email, selectedPlan);
    emailInput.value = "";
    setStatus("Pedido registrado. Após a conferência do Pix, a confirmação será enviada por e-mail.", "success");
  });
}

function bindMenu() {
  const toggle = qs("#menuToggle");
  const nav = qs("#siteNav");

  toggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  qsa("a", nav).forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function bindAdminAccess() {
  qs("#adminLink")?.addEventListener("click", () => {
    const password = window.prompt("Digite a senha do painel administrativo:");
    if (password === ADMIN_PASSWORD) {
      window.location.href = "vertice-admin.html";
      return;
    }

    window.alert("Senha incorreta.");
  });
}

let revealObserver;

function observeRevealItems() {
  const items = qsa(".reveal:not(.visible)");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }

  items.forEach((item) => revealObserver.observe(item));
}

function setActiveNavigation() {
  const sections = ["planos", "metodo", "avaliacoes", "pagamento"];
  const links = qsa(".site-nav a");

  const update = () => {
    const current = sections.findLast((id) => {
      const section = document.getElementById(id);
      return section && section.getBoundingClientRect().top <= 140;
    });

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  renderPlans();
  bindPaymentActions();
  bindMenu();
  bindAdminAccess();
  observeRevealItems();
  setActiveNavigation();
});
