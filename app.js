const STORAGE_KEY = "credenflow_demo_v1";

// 1. DATOS INICIALES FICTICIOS (Base de datos simulada)
const DEFAULT_DATA = {
  students: [
    {
      control: "22660101",
      name: "Ana Sofía Mendoza Cruz",
      career: "Ing. en Sistemas Computacionales",
      semester: "5.º Semestre"
    },
    {
      control: "22660145",
      name: "Carlos Eduardo Ramírez Torres",
      career: "Ing. Industrial",
      semester: "3.º Semestre"
    },
    {
      control: "23660089",
      name: "Valeria Hernández López",
      career: "Ing. en Gestión Empresarial",
      semester: "1.º Semestre"
    }
  ],
  requests: [
    {
      folio: "CF-2026-001",
      studentControl: "22660101",
      type: "Reposición",
      status: "Lista para recoger",
      paymentRef: "REF-884120 (Pago simulado confirmado)",
      photoData: "",
      notice: "Tu credencial ya fue impresa. Pasa a ventanilla de Servicios Escolares con tu folio.",
      createdAt: "2026-11-12",
      deliveredAt: null
    },
    {
      folio: "CF-2026-002",
      studentControl: "22660145",
      type: "Reposición",
      status: "En revisión",
      paymentRef: "REF-991045 (Pendiente de validación simulada)",
      photoData: "",
      notice: "Solicitud recibida. Servicios Escolares está validando tu fotografía y referencia.",
      createdAt: "2026-11-14",
      deliveredAt: null
    }
  ]
};

// Cargar datos desde localStorage o usar los de defecto
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  return JSON.parse(saved);
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let appState = loadState();
let selectedStudentControl = appState.students[0].control;

// 2. NAVEGACIÓN ENTRE VISTAS
function showView(viewName) {
  document.querySelectorAll(".view").forEach((sec) => sec.classList.remove("active"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add("active");

  if (viewName === "student") renderStudentPortal();
  if (viewName === "admin") renderAdminPanel();
}

document.querySelectorAll("[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

document.getElementById("go-home").addEventListener("click", () => showView("home"));

document.getElementById("reset-demo").addEventListener("click", () => {
  if (confirm("¿Deseas restaurar los datos ficticios iniciales de CredenFlow?")) {
    appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveState(appState);
    selectedStudentControl = appState.students[0].control;
    renderStudentSelect();
    renderStudentPortal();
    renderAdminPanel();
    alert("Datos de demostración restaurados.");
  }
});

// Etiqueta de color según estado
function getStatusBadge(status) {
  if (status === "Lista para recoger" || status === "Entregada") {
    return `<span class="badge badge-success">${status}</span>`;
  }
  if (status === "Rechazada") {
    return `<span class="badge badge-danger">${status}</span>`;
  }
  return `<span class="badge badge-warn">${status}</span>`;
}

// 3. PORTAL DEL ALUMNO
function renderStudentSelect() {
  const select = document.getElementById("student-select");
  select.innerHTML = appState.students
    .map(
      (s) =>
        `<option value="${s.control}" ${s.control === selectedStudentControl ? "selected" : ""}>
          ${s.control} - ${s.name}
        </option>`
    )
    .join("");
}

document.getElementById("student-select").addEventListener("change", (e) => {
  selectedStudentControl = e.target.value;
  renderStudentPortal();
});

function renderStudentPortal() {
  const container = document.getElementById("student-content");
  const student = appState.students.find((s) => s.control === selectedStudentControl);
  const myRequests = appState.requests.filter((r) => r.studentControl === student.control);
  const latestReq = myRequests[myRequests.length - 1];

  // Vista previa de credencial si está lista o entregada
  const canSeeCard =
    latestReq && (latestReq.status === "Lista para recoger" || latestReq.status === "Entregada");

  const cardPreviewHtml = canSeeCard
    ? `
      <div class="card" style="border-left: 5px solid var(--accent);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <h3 style="margin:0;">Vista previa de Credencial Estudiantil (Ejemplo)</h3>
          <span class="pill">Folio: ${latestReq.folio}</span>
        </div>
        <div style="margin-top:14px; padding:18px; border-radius:12px; background:linear-gradient(135deg,#1e3a8a,#0f172a); color:#fff; display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <img
            src="${latestReq.photoData || "https://via.placeholder.com/90x110/e2e8f0/1e3a8a?text=FOTO"}"
            alt="Foto alumno"
            style="width:86px; height:105px; object-fit:cover; border-radius:8px; border:2px solid #fff;"
          />
          <div>
            <div style="font-size:0.75rem; opacity:0.85;">TECNOLÓGICO NACIONAL DE MÉXICO · CAMPUS MATEHUALA</div>
            <div style="font-size:1.15rem; font-weight:700; margin:4px 0;">${student.name}</div>
            <div style="font-size:0.9rem;">No. Control: <strong>${student.control}</strong></div>
            <div style="font-size:0.85rem; opacity:0.9;">${student.career} · ${student.semester}</div>
            <div style="margin-top:8px; font-size:0.78rem; background:rgba(255,255,255,0.15); display:inline-block; padding:3px 8px; border-radius:6px;">
              Código de entrega simulado: QR-${latestReq.folio}
            </div>
          </div>
        </div>
      </div>
    `
    : "";

  const statusHtml = latestReq
    ? `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <span class="muted">Solicitud activa (${latestReq.type})</span>
            <h3 style="margin:2px 0;">Folio ${latestReq.folio}</h3>
          </div>
          ${getStatusBadge(latestReq.status)}
        </div>
        <p style="margin:12px 0 6px;"><strong>Referencia de pago:</strong> ${latestReq.paymentRef}</p>
        <p style="margin:0 0 12px;"><strong>Fecha de solicitud:</strong> ${latestReq.createdAt}</p>
        <div style="background:var(--surface-alt); padding:12px 14px; border-radius:8px;">
          <strong>Aviso del trámite:</strong> ${latestReq.notice}
        </div>
      </div>
    `
    : `
      <div class="card">
        <h3>Sin solicitudes registradas</h3>
        <p class="muted">Este alumno de prueba aún no tiene una solicitud. Puedes crear una abajo.</p>
      </div>
    `;

  container.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <h3 style="margin-top:0;">Datos del Alumno (Simulados)</h3>
        <p><strong>Nombre:</strong> ${student.name}</p>
        <p><strong>No. de Control:</strong> ${student.control}</p>
        <p><strong>Carrera:</strong> ${student.career}</p>
        <p style="margin-bottom:0;"><strong>Semestre:</strong> ${student.semester}</p>
      </div>
      ${statusHtml}
    </div>

    ${cardPreviewHtml}

    <div class="card">
      <h3 style="margin-top:0;">Nueva Solicitud de Credencial</h3>
      <p class="muted" style="margin-bottom:16px;">
        Completa el formulario para simular el envío de tu trámite desde el portal.
      </p>
      <form id="new-request-form" class="stack-lg" style="gap:14px;">
        <div class="grid-2">
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="req-type"><strong>Tipo de trámite</strong></label>
            <select id="req-type" required>
              <option value="Primera vez">Primera vez (Sin costo)</option>
              <option value="Reposición">Reposición por extravío/daño (Pago simulado)</option>
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="req-photo"><strong>Fotografía de prueba (opcional)</strong></label>
            <input type="file" id="req-photo" accept="image/*" />
          </div>
        </div>
        <div>
          <button type="submit" class="btn btn-primary">Enviar solicitud simulada</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("new-request-form").addEventListener("submit", handleNewRequest);
}

function handleNewRequest(event) {
  event.preventDefault();
  const type = document.getElementById("req-type").value;
  const photoInput = document.getElementById("req-photo");
  const file = photoInput.files[0];

  const createRequestWithPhoto = (photoBase64) => {
    const nextNumber = String(appState.requests.length + 1).padStart(3, "0");
    const folio = `CF-2026-${nextNumber}`;
    const paymentRef =
      type === "Primera vez"
        ? "No requiere pago (Nuevo ingreso)"
        : `REF-${Math.floor(100000 + Math.random() * 900000)} (Pago simulado)`;

    appState.requests.push({
      folio,
      studentControl: selectedStudentControl,
      type,
      status: "En revisión",
      paymentRef,
      photoData: photoBase64,
      notice: "Solicitud enviada correctamente. En espera de validación por Servicios Escolares.",
      createdAt: new Date().toISOString().slice(0, 10),
      deliveredAt: null
    });

    saveState(appState);
    renderStudentPortal();
    alert(`Solicitud ${folio} registrada con éxito.`);
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => createRequestWithPhoto(reader.result);
    reader.readAsDataURL(file);
  } else {
    createRequestWithPhoto("");
  }
}

// Placeholder temporal para el Panel Admin (lo construiremos en el Paso 4)
function renderAdminPanel() {
  const container = document.getElementById("admin-content");
  container.innerHTML = `
    <div class="card">
      <h3>Panel Administrativo en construcción</h3>
      <p class="muted">En el siguiente paso agregaremos las estadísticas, la lista de solicitudes y los botones de gestión.</p>
    </div>
  `;
}

// Inicialización al abrir la página
// 4. PANEL ADMINISTRATIVO (Servicios Escolares)
function renderAdminPanel() {
  const container = document.getElementById("admin-content");

  const totalCount = appState.requests.length;
  const reviewCount = appState.requests.filter((r) => r.status === "En revisión").length;
  const readyCount = appState.requests.filter((r) => r.status === "Lista para recoger").length;
  const deliveredCount = appState.requests.filter((r) => r.status === "Entregada").length;

  const rowsHtml = appState.requests
    .map((req, index) => {
      const student = appState.students.find((s) => s.control === req.studentControl) || {
        name: "Alumno de prueba",
        career: "Sin carrera"
      };

      const deliveredText = req.deliveredAt
        ? `<div class="muted" style="font-size:0.78rem; margin-top:4px;">Entregada: ${req.deliveredAt}</div>`
        : "";

      return `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 8px;">
            <strong>${req.folio}</strong><br />
            <span class="muted" style="font-size:0.8rem;">${req.type} · ${req.createdAt}</span>
          </td>
          <td style="padding:12px 8px;">
            <strong>${student.name}</strong><br />
            <span class="muted" style="font-size:0.8rem;">${student.control} · ${student.career}</span>
          </td>
          <td style="padding:12px 8px; font-size:0.85rem;">
            ${req.paymentRef}
          </td>
          <td style="padding:12px 8px;">
            ${getStatusBadge(req.status)}
            ${deliveredText}
          </td>
          <td style="padding:12px 8px;">
            <div style="display:flex; flex-direction:column; gap:6px; min-width:210px;">
              <select class="admin-status-select" data-index="${index}">
                <option value="En revisión" ${req.status === "En revisión" ? "selected" : ""}>En revisión</option>
                <option value="Aprobada / En impresión" ${req.status === "Aprobada / En impresión" ? "selected" : ""}>Aprobada / En impresión</option>
                <option value="Lista para recoger" ${req.status === "Lista para recoger" ? "selected" : ""}>Lista para recoger</option>
                <option value="Entregada" ${req.status === "Entregada" ? "selected" : ""}>Entregada</option>
                <option value="Rechazada" ${req.status === "Rechazada" ? "selected" : ""}>Rechazada</option>
              </select>
              <input
                type="text"
                class="admin-notice-input"
                data-index="${index}"
                value="${req.notice}"
                placeholder="Aviso para el alumno..."
              />
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary btn-save-req" data-index="${index}" style="padding:6px 10px; font-size:0.8rem;">
                  Guardar cambio
                </button>
                <button type="button" class="btn btn-accent btn-deliver-req" data-index="${index}" style="padding:6px 10px; font-size:0.8rem;">
                  Registrar entrega
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="grid-3" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
      <div class="card">
        <span class="muted">Total solicitudes</span>
        <h3 style="margin:6px 0 0; font-size:1.6rem;">${totalCount}</h3>
      </div>
      <div class="card">
        <span class="muted">En revisión</span>
        <h3 style="margin:6px 0 0; font-size:1.6rem; color:var(--warn-text);">${reviewCount}</h3>
      </div>
      <div class="card">
        <span class="muted">Listas para recoger</span>
        <h3 style="margin:6px 0 0; font-size:1.6rem; color:var(--accent);">${readyCount}</h3>
      </div>
      <div class="card">
        <span class="muted">Entregadas</span>
        <h3 style="margin:6px 0 0; font-size:1.6rem; color:var(--success-text);">${deliveredCount}</h3>
      </div>
    </div>

    <div class="card" style="overflow-x:auto;">
      <h3 style="margin-top:0;">Solicitudes Registradas (Simulación)</h3>
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid var(--border); color:var(--muted); font-size:0.85rem;">
            <th style="padding:10px 8px;">Folio / Trámite</th>
            <th style="padding:10px 8px;">Alumno</th>
            <th style="padding:10px 8px;">Pago simulado</th>
            <th style="padding:10px 8px;">Estado</th>
            <th style="padding:10px 8px;">Gestión rápida</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || `<tr><td colspan="5" style="padding:16px; text-align:center;">No hay solicitudes aún.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  // Guardar cambios de estado y aviso
  container.querySelectorAll(".btn-save-req").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const statusSel = container.querySelector(`.admin-status-select[data-index="${idx}"]`);
      const noticeInp = container.querySelector(`.admin-notice-input[data-index="${idx}"]`);

      appState.requests[idx].status = statusSel.value;
      appState.requests[idx].notice = noticeInp.value.trim() || "Estado actualizado por Servicios Escolares.";
      if (statusSel.value === "Entregada" && !appState.requests[idx].deliveredAt) {
        appState.requests[idx].deliveredAt = new Date().toISOString().slice(0, 10);
      }

      saveState(appState);
      renderAdminPanel();
      alert("Solicitud actualizada y guardada.");
    });
  });

  // Botón directo para marcar credencial lista y registrar entrega simulada
  container.querySelectorAll(".btn-deliver-req").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      appState.requests[idx].status = "Entregada";
      appState.requests[idx].deliveredAt = new Date().toISOString().slice(0, 10);
      appState.requests[idx].notice = "Entrega registrada en el sistema (simulación en ventanilla).";

      saveState(appState);
      renderAdminPanel();
      alert(`Entrega registrada para el folio ${appState.requests[idx].folio}.`);
    });
  });
}

// Inicialización al abrir la página
renderStudentSelect();