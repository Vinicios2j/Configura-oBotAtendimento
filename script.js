const WHATSAPP_NUMBER = "5511910428607";

const trigger = document.getElementById("trigger");
const welcome = document.getElementById("welcome");
const optionsList = document.getElementById("optionsList");
const addOption = document.getElementById("addOption");
const optionCount = document.getElementById("optionCount");
const chat = document.getElementById("chat");
const finalizeBtn = document.getElementById("finalizeBtn");
const toast = document.getElementById("toast");

let optionId = 0;

const initialOptions = [
  {
    name: "Solicitar orçamento de relógios",
    response: "Ok! Vou entrar em contato com um de nossos atendentes. Para adiantar, me informe seu nome e o número da sua OS."
  },
  {
    name: "Verificar status do orçamento",
    response: "Claro! Para consultar seu orçamento, me informe o número da sua OS."
  }
];

function createOption(data = { name: "", response: "" }) {
  optionId++;

  const box = document.createElement("div");
  box.className = "option";
  box.dataset.id = optionId;

  box.innerHTML = `
    <div class="option-top">
      <span class="option-number">OPÇÃO ${optionId}</span>
      <button class="remove" type="button" title="Remover opção">×</button>
    </div>

    <label>Nome da opção</label>
    <input class="option-name" type="text" placeholder="Ex.: Solicitar orçamento" value="${escapeAttr(data.name)}">

    <label>Resposta da opção</label>
    <textarea class="option-response" rows="4" placeholder="Digite o que o bot responderá quando o cliente escolher esta opção...">${escapeHtml(data.response)}</textarea>
  `;

  box.querySelector(".remove").addEventListener("click", () => {
    if (optionsList.children.length <= 1) {
      showToast("O bot precisa ter pelo menos uma opção.");
      return;
    }
    box.remove();
    renumberOptions();
    updatePreview();
  });

  box.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", updatePreview);
  });

  optionsList.appendChild(box);
  renumberOptions();
  updatePreview();
}

function renumberOptions() {
  [...optionsList.children].forEach((box, index) => {
    box.querySelector(".option-number").textContent = `OPÇÃO ${index + 1}`;
  });

  const count = optionsList.children.length;
  optionCount.textContent = `${count} ${count === 1 ? "opção" : "opções"}`;
}

function getOptions() {
  return [...document.querySelectorAll(".option")].map((box, index) => ({
    number: index + 1,
    name: box.querySelector(".option-name").value.trim(),
    response: box.querySelector(".option-response").value.trim()
  }));
}

function updatePreview() {
  const triggerText = trigger.value.trim() || "OI";
  const welcomeText = welcome.value.trim() || "Olá! Como posso ajudar?";
  const options = getOptions();

  chat.innerHTML = "";

  addMessage(triggerText, "client");
  addMessage(welcomeText, "bot");

  options.forEach((option, index) => {
    const button = document.createElement("div");
    button.className = "choice";
    button.textContent = `${index + 1}. ${option.name || "Nova opção"}`;
    chat.appendChild(button);
  });
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `msg ${type}`;
  message.textContent = text;
  chat.appendChild(message);
}

function buildWhatsAppMessage() {
  const triggerText = trigger.value.trim();
  const welcomeText = welcome.value.trim();
  const options = getOptions();

  let message = `🤖 NOVA CONFIGURAÇÃO DE BOT\n\n`;
  message += `📌 Gatilho do cliente:\n${triggerText}\n\n`;
  message += `🤖 Mensagem inicial do BOT:\n${welcomeText}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔘 OPÇÕES DE ATENDIMENTO\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  options.forEach(option => {
    message += `🔹 Opção ${option.number}\n`;
    message += `Nome: ${option.name}\n`;
    message += `Resposta: ${option.response}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📲 Configuração enviada pelo site.`;

  return message;
}

function finalize() {
  const triggerText = trigger.value.trim();
  const welcomeText = welcome.value.trim();
  const options = getOptions();

  if (!triggerText) {
    showToast("Digite a mensagem do cliente.");
    trigger.focus();
    return;
  }

  if (!welcomeText) {
    showToast("Digite a mensagem inicial do bot.");
    welcome.focus();
    return;
  }

  for (const option of options) {
    if (!option.name || !option.response) {
      showToast(`Preencha o nome e a resposta da opção ${option.number}.`);
      return;
    }
  }

  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
  showToast("Abrindo o WhatsApp...");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

addOption.addEventListener("click", () => {
  createOption();
  const last = optionsList.lastElementChild;
  last.scrollIntoView({ behavior: "smooth", block: "center" });
  last.querySelector(".option-name").focus();
});

[trigger, welcome].forEach(el => el.addEventListener("input", updatePreview));
finalizeBtn.addEventListener("click", finalize);

initialOptions.forEach(createOption);
