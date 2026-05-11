// IDs de Google Sheets (publicadas como "Cualquier persona con el enlace puede ver")
const SHEET_IDS = {
  personal: '1YuRU0diyNsvmYHkvieIuJDMPbXkQtPAaxzDsUxNlmW0',
  epp: '1B5WTCdAJ30DW715LhIXwAsXE7hNMJCrpN243o018KgY'
};

const SCRIPT_URL = "TU_NUEVA_URL_AQUI";

let datos_inv = [];
let datos_per = [];
let datos_vales = [];
let datos_logs = [];
let datos_usuarios = [];
let usuario_actual = null;
let rol_actual = null;
let idioma = 'es';

function cargarDatos() {
    datos_usuarios = JSON.parse(localStorage.getItem('tc_usuarios')) || [];
    datos_inv = JSON.parse(localStorage.getItem('tc_inv')) || [];
    datos_per = JSON.parse(localStorage.getItem('tc_per')) || [];
    datos_vales = JSON.parse(localStorage.getItem('tc_vales')) || [];
    datos_logs = JSON.parse(localStorage.getItem('tc_logs')) || [];
}

const i18n = {
    es: {
        menu: ["TABLERO", "STOCK EPP", "PERSONAL", "VALES", "ADMIN", "IMPORTAR", "REPORTES"],
        menuItems: { tablero: "Tablero", stock: "Stock EPP", personal: "Personal", vales: "Vales", admin: "Admin", importar: "Importar", reportes: "Reportes" },
        roles: ["Almacén", "RH", "Seguridad", "Admin"],
        login: "Iniciar Sesión",
        logout: "Cerrar Sesión",
        user: "Usuario",
        password: "Contraseña",
        jefe: "Jefe Chino",
        btn: "Guardar",
        search: "Buscar...",
        stock: "Existencias",
        lowStock: "Stock bajo",
        code: "Código",
        description: "Descripción",
        category: "Categoría",
        unit: "Unidad",
        actions: "Acciones",
        name: "Nombre",
        department: "Departamento",
        position: "Puesto",
        employeeId: "Matrícula",
        tallas: "Tallas",
        camisola: "Camisola",
        calzado: "Calzado",
        voucher: "Vale",
        date: "Fecha",
        quantity: "Cantidad",
        issue: "Entregar",
        sync: "Sincronizar",
        export: "Exportar",
        newUser: "Nuevo Usuario",
        adminUsers: "Gestión de Usuarios",
        activityLog: "Registro de Actividad",
        add: "Agregar",
        edit: "Editar",
        delete: "Eliminar",
        actions_header: "Acciones",
        lowStockAlert: "Artículos con stock bajo",
        loginTitle: "Inventario EPP - Time Ceramics",
        selectTeam: "Selecciona tu equipo"
    },
    en: {
        menu: ["DASHBOARD", "PPE STOCK", "STAFF", "VOUCHERS", "ADMIN"],
        menuItems: { tablero: "Dashboard", stock: "PPE Stock", personal: "Staff", vales: "Vouchers", admin: "Admin" },
        roles: ["Warehouse", "HR", "Security", "Admin"],
        login: "Login",
        logout: "Logout",
        user: "Username",
        password: "Password",
        jefe: "Chinese Boss",
        btn: "Save",
        search: "Search...",
        stock: "In Stock",
        lowStock: "Low Stock",
        code: "Code",
        description: "Description",
        category: "Category",
        unit: "Unit",
        actions: "Actions",
        name: "Name",
        department: "Department",
        position: "Position",
        employeeId: "ID",
        tallas: "Sizes",
        preview: "Worker Preview",
        reportEPP: "EPP Report",
        camisola: "Coverall",
        calzado: "Shoes",
        voucher: "Voucher",
        date: "Date",
        quantity: "Quantity",
        issue: "Issue",
        sync: "Sync",
        export: "Export",
        newUser: "New User",
        adminUsers: "User Management",
        activityLog: "Activity Log",
        add: "Add",
        edit: "Edit",
        delete: "Delete",
        actions_header: "Actions",
        lowStockAlert: "Low stock items",
        loginTitle: "PPE Inventory - Time Ceramics",
        selectTeam: "Select your team"
    },
    zh: {
        menu: ["仪表板", "库存", "员工", "凭证", "管理"],
        menuItems: { tablero: "仪表板", stock: "库存", personal: "员工", vales: "凭证", admin: "管理" },
        roles: ["仓库", "人事", "安保", "管理员"],
        login: "登录",
        logout: "退出",
        user: "用户名",
        password: "密码",
        jefe: "中国主管",
        btn: "保存",
        search: "搜索...",
        stock: "库存数量",
        lowStock: "低库存",
        code: "代码",
        description: "描述",
        category: "类别",
        unit: "单位",
        actions: "操作",
        name: "姓名",
        department: "部门",
        position: "职位",
        employeeId: "工号",
        tallas: "尺寸",
        camisola: "工作服",
        calzado: "鞋子",
        voucher: "凭证",
        date: "日期",
        quantity: "数量",
        issue: "发放",
        sync: "同步",
        export: "导出",
        newUser: "新用户",
        adminUsers: "用户管理",
        activityLog: "活动记录",
        add: "添加",
        edit: "编辑",
        delete: "删除",
        actions_header: "操作",
        lowStockAlert: "库存不足物品",
        loginTitle: "EPP库存 - Time Ceramics",
        selectTeam: "选择您的团队"
    }
};

const roles = {
    almacen: { tablero: true, stock: true, personal: true, vales: true, admin: false, importar: true, reportes: true },
    rh: { tablero: true, stock: true, personal: true, vales: true, admin: false, importar: true, reportes: true },
    seguridad: { tablero: true, stock: false, personal: true, vales: true, admin: false, importar: false, reportes: true },
    admin: { tablero: true, stock: true, personal: true, vales: true, admin: true, importar: true, reportes: true }
};

// INICIALIZAR APP
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    initUsuarios();
    const savedTheme = localStorage.getItem('tc_theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
});

function initUsuarios() {
    const stored = localStorage.getItem('tc_usuarios');
    if (!stored || JSON.parse(stored).length === 0) {
        datos_usuarios = [
            { id: 1, usuario: 'admin', password: 'admin123', rol: 'admin', nombre: 'Administrador' },
            { id: 2, usuario: 'almacen', password: 'alm123', rol: 'almacen', nombre: 'Jefe Almacén' },
            { id: 3, usuario: 'rh', password: 'rh123', rol: 'rh', nombre: 'Jefe RH' },
            { id: 4, usuario: 'seguridad', password: 'seg123', rol: 'seguridad', nombre: 'Jefe Seguridad' }
        ];
        localStorage.setItem('tc_usuarios', JSON.stringify(datos_usuarios));
    } else {
        datos_usuarios = JSON.parse(stored);
    }
}

function guardarUsuarios() {
    localStorage.setItem('tc_usuarios', JSON.stringify(datos_usuarios));
}

function guardarLogs(usuario, accion, detalle) {
    datos_logs.push({
        id: Date.now(),
        usuario: usuario,
        accion: accion,
        detalle: detalle,
        fecha: new Date().toISOString()
    });
    localStorage.setItem('tc_logs', JSON.stringify(datos_logs));
}

function ejecutarLogin() {
    const user = document.getElementById('user-input').value.trim();
    const pass = document.getElementById('pass-input').value.trim();
    
    const usr = datos_usuarios.find(u => u.usuario === user && u.password === pass);
    if (usr) {
        usuario_actual = usr;
        rol_actual = usr.rol;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-shell').style.display = 'flex';
        document.getElementById('rol-display').textContent = i18n[idioma].roles[['almacen', 'rh', 'seguridad', 'admin'].indexOf(usr.rol)];
        cambiarIdioma('es');
        guardarLogs(usr.usuario, 'LOGIN', `Inicio sesión como ${usr.rol}`);
    } else { 
        alert("Usuario o contraseña incorrectos / 用户名或密码错误"); 
    }
}

function logout() {
    guardarLogs(usuario_actual.usuario, 'LOGOUT', 'Cierre sesión');
    usuario_actual = null;
    rol_actual = null;
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('user-input').value = '';
    document.getElementById('pass-input').value = '';
}

function cambiarIdioma(lang) {
    idioma = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('bg-white', 'shadow-sm'));
    document.getElementById('btn-' + lang).classList.add('bg-white', 'shadow-sm');
    
    const nav = document.getElementById('menu-links');
    const m = i18n[lang].menu;
    const icons = ['th-large', 'box', 'users', 'receipt', 'user-cog', 'file-import', 'chart-bar'];
    const tabs = ['tablero', 'stock', 'personal', 'vales', 'admin', 'importar', 'reportes'];
    const rolPermisos = roles[rol_actual] || {};
    
    nav.innerHTML = tabs.map((tab, i) => {
        if (!rolPermisos[tab] && tab !== 'tablero') return '';
        return `<button onclick="render('${tab}', this)" class="nav-link ${tab === 'tablero' ? 'active' : ''}">
            <i class="fas fa-${icons[i]} mr-3 w-5"></i> ${m[i]}
        </button>`;
    }).join('');
    
    render('tablero');
}

function cambiarTema(tema) {
    document.body.setAttribute('data-theme', tema);
    localStorage.setItem('tc_theme', tema);
}

async function sincronizar() {
  try {
    // Obtener datos de Google Sheets como CSV
    const csvPersonal = await obtenerDatosCSV(SHEET_IDS.personal);
    const csvEpp = await obtenerDatosCSV(SHEET_IDS.epp);

    // Procesar CSV a JSON
    datos_per = procesarCSV(csvPersonal, 'personal');
    datos_inv = procesarCSV(csvEpp, 'epp');

    // Guardar en localStorage
    localStorage.setItem('tc_inv', JSON.stringify(datos_inv));
    localStorage.setItem('tc_per', JSON.stringify(datos_per));

    guardarLogs(usuario_actual?.usuario || 'sistema', 'SYNC', 'Sincronización desde Google Sheets completada');
    render('tablero');
    alert("Sincronizado con Google Sheets / 已同步");
  } catch (e) {
    console.error('Error en sincronización:', e);
    alert("Error: " + e.message);
  }
}

async function obtenerDatosCSV(spreadsheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&id=${spreadsheetId}&gid=0`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo acceder a la hoja. Verifica que esté PUBLICADA como "Cualquier persona con el enlace puede ver"');
  return await response.text();
}

function procesarCSV(csvText, tipo) {
  // Usar PapaParse para parseo robusto
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (parsed.errors.length > 0) {
    console.warn('Errores en CSV:', parsed.errors);
  }

  const headers = parsed.meta.fields || [];

  const data = parsed.data.map(row => {
    const mappedRow = {};
    
    headers.forEach(header => {
      const val = row[header] ? String(row[header]).trim() : '';
      const key = mapearColumna(header, tipo);
      if (key) {
        mappedRow[key] = val;
      }
    });

    return mappedRow;
  }).filter(row => {
    if (tipo === 'epp') return row.descripcion || row.codigo;
    if (tipo === 'personal') return row.nombre_completo;
    return true;
  });

  // Post-procesamiento para tipos correctos
  return data.map(row => {
    if (tipo === 'epp') {
      row.stock_actual = parseInt(row.stock_actual) || 0;
      row.categoria = row.categoria || '';
      row.unidad = row.unidad || 'PZA';
    }
    return row;
  });
}


async function probarConexion() {
  const resultados = [];
  
  try {
    const csvPersonal = await obtenerDatosCSV(SHEET_IDS.personal);
    const parsedPersonal = Papa.parse(csvPersonal, { header: true, skipEmptyLines: true });
    resultados.push(`✅ Personal: ${parsedPersonal.data.length} filas detectadas`);
    resultados.push(`   Encabezados: ${parsedPersonal.meta.fields.join(', ')}`);
  } catch (e) {
    resultados.push(`❌ Personal: ${e.message}`);
  }
  
  try {
    const csvEpp = await obtenerDatosCSV(SHEET_IDS.epp);
    const parsedEpp = Papa.parse(csvEpp, { header: true, skipEmptyLines: true });
    resultados.push(`✅ EPP: ${parsedEpp.data.length} filas detectadas`);
    resultados.push(`   Encabezados: ${parsedEpp.meta.fields.join(', ')}`);
  } catch (e) {
    resultados.push(`❌ EPP: ${e.message}`);
  }
  
  alert("Diagnóstico:\n\n" + resultados.join('\n'));
}

function mapearColumna(header, tipo) {
  const h = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (tipo === 'epp') {
    if (h.includes('codigo') || h.includes('cod') || h.includes('code') || h.includes('id') || h.includes('clave') || h.includes('ref') || h.includes('sku')) return 'codigo';
    if (h.includes('descripcion') || h.includes('descrip') || h.includes('desc') || h.includes('nombre') || h.includes('articulo') || h.includes('producto') || h.includes('item') || h.includes('material')) return 'descripcion';
    if (h.includes('categoria') || h.includes('categ') || h.includes('category') || h.includes('tipo') || h.includes('clase') || h.includes('familia')) return 'categoria';
    if (h.includes('stock') || h.includes('existencia') || h.includes('inventario') || h.includes('cantidad') || h.includes('quantity') || h.includes('onhand') || h.includes('disponible')) return 'stock_actual';
    if (h.includes('unidad') || h.includes('unit') || h.includes('u') || h.includes('medida') || h.includes('um')) return 'unidad';
  } else if (tipo === 'personal') {
    if (h.includes('matricula') || h.includes('matric') || h.includes('num') || h.includes('id') || h.includes('empleado') || h.includes('codigo') || h.includes('code') || h.includes('no.')) return 'num_empleado';
    if (h.includes('nombre') || h.includes('name') || h.includes('empleado') || h.includes('persona') || h.includes('trabajador') || h.includes('colaborador')) return 'nombre_completo';
    if (h.includes('departamento') || h.includes('depto') || h.includes('department') || h.includes('area') || h.includes('división') || h.includes('sector')) return 'departamento';
    if (h.includes('puesto') || h.includes('position') || h.includes('cargo') || h.includes('rol') || h.includes('puesto') || h.includes('función')) return 'puesto';
    if (h.includes('camisola') || h.includes('coverall') || h.includes('talla cam') || h.includes('talla1') || h.includes('size1') || h.includes('camisa') || h.includes('chaqueta')) return 'talla_camisola';
    if (h.includes('calzado') || h.includes('zapato') || h.includes('shoe') || h.includes('talla cal') || h.includes('talla2') || h.includes('size2') || h.includes('pie')) return 'talla_calzado';
  }

  return null;
}





function render(tab, btn) {
    const main = document.getElementById('content');
    const t = i18n[idioma];
    const rolPermisos = roles[rol_actual] || {};
    
    if (!rolPermisos[tab] && tab !== 'tablero') {
        main.innerHTML = `<div class="text-center py-10"><i class="fas fa-lock text-6xl text-slate-300 mb-4"></i><p class="text-slate-500 font-bold">No tienes permiso para esta sección</p></div>`;
        return;
    }
    
    if(btn) {
        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (tab === 'tablero') {
        const lowStock = datos_inv.filter(i => (parseInt(i.stock_actual) || 0) < 10);
        main.innerHTML = `
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-4xl font-black uppercase tracking-tighter text-slate-800">${t.menu[0]}</h1>
                <div class="flex gap-3">
                    <label for="import-file" class="btn-action cursor-pointer"><i class="fas fa-file-import"></i> Importar</label>
                    <input type="file" id="import-file" accept=".json" onchange="importarDatos(event)" class="hidden">
                    <button onclick="exportarDatos()" class="btn-action"><i class="fas fa-file-export"></i> ${t.export}</button>
                    <button onclick="sincronizar()" class="btn-action"><i class="fas fa-sync-alt"></i> ${t.sync}</button>
                    <button onclick="logout()" class="btn-action bg-red-500 hover:bg-red-600"><i class="fas fa-sign-out-alt"></i> ${t.logout}</button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="card-stat"><p class="text-[10px] font-bold text-slate-400">EPP</p><p class="text-4xl font-black">${datos_inv.length}</p></div>
                <div class="card-stat border-l-4 border-emerald-500"><p class="text-[10px] font-bold text-slate-400">${t.stock}</p><p class="text-4xl font-black">${datos_inv.reduce((a,b)=>a+(parseInt(b.stock_actual)||0),0)}</p></div>
                <div class="card-stat border-l-4 border-blue-500"><p class="text-[10px] font-bold text-slate-400">STAFF</p><p class="text-4xl font-black">${datos_per.length}</p></div>
                <div class="card-stat border-l-4 border-red-500"><p class="text-[10px] font-bold text-slate-400">${t.lowStock}</p><p class="text-4xl font-black text-red-500">${lowStock.length}</p></div>
            </div>
            ${lowStock.length > 0 ? `
            <div class="card-ui mb-8">
                <h3 class="font-black mb-4 text-red-600"><i class="fas fa-exclamation-triangle"></i> ${t.lowStockAlert}</h3>
                <div class="max-h-48 overflow-y-auto">${lowStock.map(i => `
                    <div class="flex justify-between py-2 border-b">
                        <span>${i.codigo || i.descripcion}</span>
                        <span class="stock-low">Stock: ${i.stock_actual || 0}</span>
                    </div>`).join('')}
                </div>
            </div>` : ''}
            <div class="card-ui">
                <h3 class="font-black mb-4"><i class="fas fa-history"></i> ${t.activityLog}</h3>
                <div class="max-h-64 overflow-y-auto">
                    <table class="table-ui">
                        <thead><tr><th>Usuario</th><th>Acción</th><th>Detalle</th><th>Fecha</th></tr></thead>
                        <tbody>${datos_logs.slice(-10).reverse().map(l => `
                            <tr>
                                <td>${l.usuario}</td>
                                <td>${l.accion}</td>
                                <td>${l.detalle}</td>
                                <td>${new Date(l.fecha).toLocaleString()}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    if (tab === 'stock') {
        main.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-black text-slate-800 uppercase">${t.menu[1]}</h1>
                    <input type="text" id="search-stock" onkeyup="filtrarStock()" placeholder="${t.search}" class="search-bar mt-3">
                </div>
                <button onclick="abrirModal('nuevoEPP')" class="btn-action"><i class="fas fa-plus"></i> ${t.add} EPP</button>
            </div>
            <div class="card-ui">
                <table class="table-ui" id="tabla-stock">
                    <thead><tr>
                        <th>${t.code}</th><th>${t.description}</th><th>${t.category}</th>
                        <th>${t.stock}</th><th>${t.unit}</th><th>${t.actions_header}</th>
                    </tr></thead>
                    <tbody>${datos_inv.map((item, idx) => `
                        <tr class="${(parseInt(item.stock_actual) || 0) < 10 ? 'bg-red-50' : ''}">
                            <td>${item.codigo || '---'}</td>
                            <td>${item.descripcion}</td>
                            <td>${item.categoria || 'General'}</td>
                            <td class="${(parseInt(item.stock_actual) || 0) < 10 ? 'stock-low' : ''}">${item.stock_actual || 0}</td>
                            <td>${item.unidad || 'PZA'}</td>
                            <td>
                                <button onclick="generarQR(${idx})" class="text-purple-500 mr-2" title="Generar QR"><i class="fas fa-qrcode"></i></button>
                                <button onclick="editarEPP(${idx})" class="text-blue-500 mr-2"><i class="fas fa-edit"></i></button>
                                <button onclick="eliminarEPP(${idx})" class="text-red-500"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    if (tab === 'personal') {
        main.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-black text-slate-800 uppercase">${t.menu[2]}</h1>
                    <input type="text" id="search-per" onkeyup="filtrarPersonal()" placeholder="${t.search}" class="search-bar mt-3">
                </div>
                <button onclick="abrirModal('nuevoTrabajador')" class="btn-action"><i class="fas fa-user-plus"></i> ${t.newUser}</button>
            </div>
            <div class="card-ui">
                <table class="table-ui" id="tabla-per">
                    <thead><tr>
                        <th>${t.employeeId}</th><th>${t.name}</th><th>${t.department}</th><th>${t.position}</th><th>${t.tallas}</th><th>${t.actions_header}</th>
                    </tr></thead>
<tbody>${datos_per.map((p, idx) => `
                         <tr>
                             <td>${p.num_empleado}</td>
                             <td>${p.nombre_completo}</td>
                             <td><span class="role-badge role-${p.departamento || 'almacen'}">${p.departamento || 'General'}</span></td>
                             <td>${p.puesto || '-'}</td>
                             <td>${p.talla_camisola || '-'} / ${p.talla_calzado || '-'}</td>
                             <td>
                                 <button onclick="previsualizarTrabajador(${idx})" class="text-emerald-500 mr-2" title="Vista previa"><i class="fas fa-eye"></i></button>
                                 <button onclick="reporteEPPTrabajador(${idx})" class="text-purple-500 mr-2" title="Reporte EPP"><i class="fas fa-file-alt"></i></button>
                                 <button onclick="editarTrabajador(${idx})" class="text-blue-500 mr-2"><i class="fas fa-edit"></i></button>
                                 <button onclick="eliminarTrabajador(${idx})" class="text-red-500"><i class="fas fa-trash"></i></button>
                             </td>
                         </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    if (tab === 'vales') {
        main.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-black text-slate-800 uppercase">${t.menu[3]}</h1>
                <button onclick="abrirModal('nuevoVale')" class="btn-action"><i class="fas fa-plus"></i> ${t.voucher}</button>
            </div>
            <div class="card-ui">
                <table class="table-ui">
                    <thead><tr>
                        <th>${t.voucher}</th><th>${t.date}</th><th>${t.description}</th>
                        <th>${t.name}</th><th>${t.quantity}</th><th>${t.actions_header}</th>
                    </tr></thead>
                    <tbody>${datos_vales.map((v, idx) => `
                        <tr>
                            <td>${v.id}</td>
                            <td>${v.fecha}</td>
                            <td>${v.articulo}</td>
                            <td>${v.trabajador}</td>
                            <td>${v.cantidad}</td>
                            <td><button onclick="eliminarVale(${idx})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    if (tab === 'admin') {
        main.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-black text-slate-800 uppercase">${t.menu[4]}</h1>
                <button onclick="abrirModal('nuevoUsuario')" class="btn-action"><i class="fas fa-user-plus"></i> ${t.newUser}</button>
            </div>
            
            <div class="card-ui mb-6">
                <h3 class="font-black mb-4 text-slate-800"><i class="fas fa-users-cog"></i> ${t.adminUsers}</h3>
                <table class="table-ui">
                    <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>${t.actions_header}</th></tr></thead>
                    <tbody>${datos_usuarios.map((u, idx) => `
                        <tr>
                            <td>${u.usuario}</td>
                            <td>${u.nombre}</td>
                            <td><span class="role-badge role-${u.rol}">${t.roles[['almacen', 'rh', 'seguridad', 'admin'].indexOf(u.rol)]}</span></td>
                            <td>
                                <button onclick="editarUsuario(${idx})" class="text-blue-500 mr-2"><i class="fas fa-edit"></i></button>
                                <button onclick="eliminarUsuario(${idx})" class="text-red-500"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>

            <div class="card-ui">
                <h3 class="font-black mb-4 text-slate-800"><i class="fas fa-history"></i> ${t.activityLog} (Completo)</h3>
                <div class="max-h-80 overflow-y-auto">
                    <table class="table-ui">
                        <thead><tr><th>Usuario</th><th>Acción</th><th>Detalle</th><th>Fecha</th></tr></thead>
                        <tbody>${datos_logs.slice().reverse().map(l => `
                            <tr>
                                <td>${l.usuario}</td>
                                <td>${l.accion}</td>
                                <td>${l.detalle}</td>
                                <td>${new Date(l.fecha).toLocaleString()}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    if (tab === 'importar') {
        main.innerHTML = `
            <h1 class="text-2xl font-black mb-6 uppercase">Hoja de Cálculo - Importar Datos</h1>
            
            <div class="card-ui mb-6">
                <h3 class="font-black mb-4 text-slate-800"><i class="fas fa-cloud-download-alt"></i> Google Sheets Sync</h3>
                <p class="text-sm text-slate-500 mb-4">Sincroniza con tus hojas de Google Sheets publicadas. Asegúrate que las hojas estén en "Cualquier persona con el enlace puede ver".</p>
                <div class="flex gap-3">
                    <button onclick="sincronizar()" class="btn-action"><i class="fas fa-sync-alt"></i> Sincronizar Datos</button>
                    <button onclick="probarConexion()" class="btn-action bg-blue-500 hover:bg-blue-600"><i class="fas fa-plug"></i> Probar Conexión</button>
                </div>
                <div id="conn-status" class="mt-3 text-xs font-bold"></div>
            </div>
            
            <div class="card-ui mb-6">
                <h3 class="font-black mb-4 text-slate-800"><i class="fas fa-users"></i> Personal (Desde Hoja de Cálculo en Línea)</h3>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-500">Última sincronización: <span id="personal-sync-time">Nunca</span></span>
                        <button onclick="sincronizarPersonal()" class="btn-action bg-blue-500 hover:bg-blue-600">
                            <i class="fas fa-sync-alt"></i> Sincronizar Personal desde Línea
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="table-ui" id="tabla-personal-edit">
                            <thead><tr>
                                <th>Matrícula</th><th>Nombre</th><th>Departamento</th><th>Puesto</th><th>Talla Cam</th><th>Talla Calz</th><th>Acciones</th>
                            </tr></thead>
                            <tbody>${datos_per.map((p, idx) => `
                                <tr>
                                    <td><input type="text" value="${p.num_empleado}" data-idx="${idx}" data-col="num_empleado" class="input-edit w-full"></td>
                                    <td><input type="text" value="${p.nombre_completo}" data-idx="${idx}" data-col="nombre_completo" class="input-edit w-full"></td>
                                    <td><input type="text" value="${p.departamento || ''}" data-idx="${idx}" data-col="departamento" class="input-edit w-full"></td>
                                    <td><input type="text" value="${p.puesto || ''}" data-idx="${idx}" data-col="puesto" class="input-edit w-full"></td>
                                    <td><input type="text" value="${p.talla_camisola || ''}" data-idx="${idx}" data-col="talla_camisola" class="input-edit w-full"></td>
                                    <td><input type="text" value="${p.talla_calzado || ''}" data-idx="${idx}" data-col="talla_calzado" class="input-edit w-full"></td>
                                    <td><button onclick="eliminarTrabajador(${idx})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                </tr>`).join('')}
                        </tbody>
                        </table>
                    </div>
                    <div class="flex justify-between items-center mt-4">
                        <div class="flex space-x-3">
                            <button onclick="agregarFilaPersonal()" class="btn-action"><i class="fas fa-plus"></i> Agregar Fila</button>
                            <button onclick="limpiarTodoPersonal()" class="btn-action bg-red-500 hover:bg-red-600"><i class="fas fa-trash-alt"></i> Borrar Todo</button>
                        </div>
                        <button onclick="guardarPersonalEditado()" class="btn-action"><i class="fas fa-save"></i> Guardar Cambios</button>
                    </div>
                </div>
            </div>

              <div class="card-ui">
                  <h3 class="font-black mb-4 text-slate-800"><i class="fas fa-box"></i> EPP (Desde Hoja de Cálculo en Línea)</h3>
                  <div class="space-y-4">
                      <div class="flex justify-between items-center">
                          <span class="text-sm text-slate-500">Última sincronización: <span id="epp-sync-time">Nunca</span></span>
                          <button onclick="sincronizarEPP()" class="btn-action bg-blue-500 hover:bg-blue-600">
                              <i class="fas fa-sync-alt"></i> Sincronizar EPP desde Línea
                          </button>
                      </div>
                      <div class="overflow-x-auto">
                          <table class="table-ui" id="tabla-epp-edit">
                              <thead><tr>
                                  <th>Código</th><th>Descripción</th><th>Categoría</th><th>Stock</th><th>Unidad</th><th>Acciones</th>
                              </tr></thead>
                              <tbody>${datos_inv.map((i, idx) => `
                                  <tr>
                                      <td><input type="text" value="${i.codigo || ''}" data-idx="${idx}" data-col="codigo" class="input-edit w-full"></td>
                                      <td><input type="text" value="${i.descripcion}" data-idx="${idx}" data-col="descripcion" class="input-edit w-full"></td>
                                      <td><input type="text" value="${i.categoria || ''}" data-idx="${idx}" data-col="categoria" class="input-edit w-full"></td>
                                      <td><input type="number" value="${i.stock_actual || 0}" data-idx="${idx}" data-col="stock_actual" class="input-edit w-full"></td>
                                      <td><input type="text" value="${i.unidad || 'PZA'}" data-idx="${idx}" data-col="unidad" class="input-edit w-full"></td>
                                      <td><button onclick="eliminarEPP(${idx})" class="text-red-500"><i class="fas fa-trash"></i></button></td>
                                  </tr>`).join('')}
                          </tbody>
                          </table>
                      </div>
                      <div class="flex justify-between items-center mt-4">
                          <div class="flex space-x-3">
                              <button onclick="agregarFilaEPP()" class="btn-action"><i class="fas fa-plus"></i> Agregar Fila</button>
                              <button onclick="limpiarTodoEPP()" class="btn-action bg-red-500 hover:bg-red-600"><i class="fas fa-trash-alt"></i> Borrar Todo</button>
                          </div>
                          <button onclick="guardarEPPEditado()" class="btn-action"><i class="fas fa-save"></i> Guardar Cambios</button>
                      </div>
                  </div>
              </div>
                <button onclick="agregarFilaEPP()" class="btn-action mt-4"><i class="fas fa-plus"></i> Agregar Fila</button>
                <button onclick="guardarEPPEditado()" class="btn-action mt-4"><i class="fas fa-save"></i> Guardar Cambios</button>
            </div>`;
    }

    if (tab === 'reportes') {
        const hoy = new Date().toISOString().split('T')[0];
        const logsHoy = datos_logs.filter(l => l.fecha.startsWith(hoy));
        const logsMes = datos_logs.filter(l => l.fecha.startsWith(hoy.substring(0, 7)));
        
        main.innerHTML = `
            <h1 class="text-2xl font-black mb-6 uppercase">Reportes</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="card-stat">
                    <p class="text-[10px] font-bold text-slate-400">EPP Total</p>
                    <p class="text-3xl font-black">${datos_inv.length}</p>
                    <p class="text-xs text-slate-400">Artículos registrados</p>
                </div>
                <div class="card-stat border-l-4 border-emerald-500">
                    <p class="text-[10px] font-bold text-slate-400">Stock Total</p>
                    <p class="text-3xl font-black">${datos_inv.reduce((a,b)=>a+(parseInt(b.stock_actual)||0),0)}</p>
                    <p class="text-xs text-slate-400">Unidades en inventario</p>
                </div>
                <div class="card-stat border-l-4 border-blue-500">
                    <p class="text-[10px] font-bold text-slate-400">Personal</p>
                    <p class="text-3xl font-black">${datos_per.length}</p>
                    <p class="text-xs text-slate-400">Trabajadores registrados</p>
                </div>
            </div>

            <div class="card-ui mb-6">
                <h3 class="font-black mb-4"><i class="fas fa-calendar-day"></i> Actividad de Hoy (${hoy})</h3>
                <table class="table-ui">
                    <thead><tr><th>Usuario</th><th>Acción</th><th>Detalle</th><th>Hora</th></tr></thead>
                    <tbody>${logsHoy.slice(-10).reverse().map(l => `
                        <tr>
                            <td>${l.usuario}</td>
                            <td>${l.accion}</td>
                            <td>${l.detalle}</td>
                            <td>${new Date(l.fecha).toLocaleTimeString()}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>

            <div class="card-ui mb-6">
                <h3 class="font-black mb-4"><i class="fas fa-calendar-alt"></i> Actividad del Mes (${hoy.substring(0, 7)})</h3>
                <table class="table-ui">
                    <thead><tr><th>Usuario</th><th>Acción</th><th>Detalle</th><th>Fecha</th></tr></thead>
                    <tbody>${logsMes.slice(-20).reverse().map(l => `
                        <tr>
                            <td>${l.usuario}</td>
                            <td>${l.accion}</td>
                            <td>${l.detalle}</td>
                            <td>${new Date(l.fecha).toLocaleDateString()}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>

            <div class="card-ui">
                <h3 class="font-black mb-4"><i class="fas fa-chart-bar"></i> Estadísticas Anuales</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <p class="text-2xl font-black text-emerald-600">${datos_logs.filter(l => l.accion.includes('LOGIN')).length}</p>
                        <p class="text-xs">Sesiones</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-black text-blue-600">${datos_logs.filter(l => l.accion.includes('ADD')).length}</p>
                        <p class="text-xs">Altas</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-black text-red-600">${datos_logs.filter(l => l.accion.includes('DELETE')).length}</p>
                        <p class="text-xs">Bajas</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-black text-purple-600">${datos_logs.filter(l => l.accion.includes('EDIT')).length}</p>
                        <p class="text-xs">Ediciones</p>
                    </div>
                </div>
            </div>`;
    }
}

function filtrarStock() {
    const term = document.getElementById('search-stock').value.toLowerCase();
    const rows = document.querySelectorAll('#tabla-stock tbody tr');
    rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none');
}

function filtrarPersonal() {
    const term = document.getElementById('search-per').value.toLowerCase();
    const rows = document.querySelectorAll('#tabla-per tbody tr');
    rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none');
}

function abrirModal(tipo) {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    
    if (tipo === 'nuevoEPP') {
        modal.innerHTML = `<h2 class="text-xl font-black mb-4">Nuevo EPP</h2>
            <form id="form-epp" class="space-y-3">
                <input type="text" id="epp-cod" placeholder="Código" class="input-ui">
                <input type="text" id="epp-desc" placeholder="Descripción" class="input-ui">
                <input type="text" id="epp-cat" placeholder="Categoría" class="input-ui">
                <input type="number" id="epp-stock" placeholder="Stock" class="input-ui">
                <input type="text" id="epp-und" placeholder="Unidad" class="input-ui">
                <button type="button" onclick="guardarEPP()" class="btn-action w-full">Guardar</button>
            </form>`;
    } else if (tipo === 'nuevoTrabajador') {
        modal.innerHTML = `<h2 class="text-xl font-black mb-4">Nuevo Trabajador</h2>
            <form id="form-trab" class="space-y-3">
                <input type="text" id="trab-id" placeholder="Matrícula" class="input-ui">
                <input type="text" id="trab-nom" placeholder="Nombre" class="input-ui">
                <input type="text" id="trab-depto" placeholder="Departamento" class="input-ui">
                <input type="text" id="trab-puesto" placeholder="Puesto" class="input-ui">
                <input type="text" id="trab-tc" placeholder="Talla Camisola" class="input-ui">
                <input type="text" id="trab-tz" placeholder="Talla Calzado" class="input-ui">
                <button type="button" onclick="guardarTrabajador()" class="btn-action w-full">Guardar</button>
            </form>`;
    } else if (tipo === 'nuevoUsuario') {
        modal.innerHTML = `<h2 class="text-xl font-black mb-4">Nuevo Usuario</h2>
            <form id="form-usuario" class="space-y-3">
                <input type="text" id="usr-usuario" placeholder="Usuario" class="input-ui">
                <input type="password" id="usr-pass" placeholder="Contraseña" class="input-ui">
                <input type="text" id="usr-nombre" placeholder="Nombre" class="input-ui">
                <select id="usr-rol" class="input-ui">
                    <option value="almacen">Almacén</option>
                    <option value="rh">RH</option>
                    <option value="seguridad">Seguridad</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="button" onclick="guardarUsuario()" class="btn-action w-full">Guardar</button>
            </form>`;
    } else if (tipo === 'nuevoVale') {
        const trabajadores = datos_per.map(p => `<option value="${p.nombre_completo}">${p.nombre_completo}</option>`).join('');
        const articulos = datos_inv.map(i => `<option value="${i.descripcion}">${i.descripcion}</option>`).join('');
        modal.innerHTML = `<h2 class="text-xl font-black mb-4">Nuevo Vale</h2>
            <form id="form-vale" class="space-y-3">
                <select id="vale-trab" class="input-ui"><option value="">Seleccionar trabajador</option>${trabajadores}</select>
                <select id="vale-art" class="input-ui"><option value="">Seleccionar artículo</option>${articulos}</select>
                <input type="number" id="vale-cant" placeholder="Cantidad" class="input-ui">
                <input type="date" id="vale-fecha" class="input-ui" value="${new Date().toISOString().split('T')[0]}">
                <button type="button" onclick="guardarVale()" class="btn-action w-full">Guardar</button>
            </form>`;
    } else if (tipo === 'generarQR') {
        const item = datos_inv[window.currentQRIndex] || datos_inv[0];
        if (item) {
            modal.innerHTML = `<h2 class="text-xl font-black mb-4">QR - ${item.descripcion}</h2>
                <div id="qrcode" class="flex justify-center mb-4"></div>
                <p class="text-center text-sm">${item.codigo}</p>`;
            setTimeout(() => {
                new QRCode(document.getElementById('qrcode'), {
                    text: JSON.stringify({codigo: item.codigo, descripcion: item.descripcion, stock: item.stock_actual}),
                    width: 200,
                    height: 200
                });
            }, 100);
        }
    }
}

function guardarEPP() {
    datos_inv.push({
        codigo: document.getElementById('epp-cod').value,
        descripcion: document.getElementById('epp-desc').value,
        categoria: document.getElementById('epp-cat').value,
        stock_actual: document.getElementById('epp-stock').value,
        unidad: document.getElementById('epp-und').value
    });
    localStorage.setItem('tc_inv', JSON.stringify(datos_inv));
    guardarLogs(usuario_actual?.usuario, 'ADD_EPP', `Agregó EPP: ${document.getElementById('epp-desc').value}`);
    cerrarModal();
    render('stock');
}

function guardarTrabajador() {
    datos_per.push({
        num_empleado: document.getElementById('trab-id').value,
        nombre_completo: document.getElementById('trab-nom').value,
        departamento: document.getElementById('trab-depto').value,
        puesto: document.getElementById('trab-puesto').value,
        talla_camisola: document.getElementById('trab-tc').value,
        talla_calzado: document.getElementById('trab-tz').value
    });
    localStorage.setItem('tc_per', JSON.stringify(datos_per));
    guardarLogs(usuario_actual?.usuario, 'ADD_WORKER', `Agregó trabajador: ${document.getElementById('trab-nom').value}`);
    cerrarModal();
    render('personal');
}

function guardarUsuario() {
    datos_usuarios.push({
        id: Date.now(),
        usuario: document.getElementById('usr-usuario').value,
        password: document.getElementById('usr-pass').value,
        nombre: document.getElementById('usr-nombre').value,
        rol: document.getElementById('usr-rol').value
    });
    guardarUsuarios();
    guardarLogs(usuario_actual?.usuario, 'ADD_USER', `Agregó usuario: ${document.getElementById('usr-usuario').value}`);
    cerrarModal();
    render('admin');
}

function guardarVale() {
    datos_vales.push({
        id: 'V-' + Date.now(),
        fecha: document.getElementById('vale-fecha').value,
        articulo: document.getElementById('vale-art').value,
        trabajador: document.getElementById('vale-trab').value,
        cantidad: document.getElementById('vale-cant').value
    });
    localStorage.setItem('tc_vales', JSON.stringify(datos_vales));
    guardarLogs(usuario_actual?.usuario, 'ADD_VALE', `Registró vale: ${document.getElementById('vale-art').value}`);
    cerrarModal();
    render('vales');
}

function generarQR(idx) {
    window.currentQRIndex = idx;
    abrirModal('generarQR');
}

function eliminarEPP(idx) {
    const item = datos_inv[idx];
    datos_inv.splice(idx, 1);
    localStorage.setItem('tc_inv', JSON.stringify(datos_inv));
    guardarLogs(usuario_actual?.usuario, 'DELETE_EPP', `Eliminó EPP: ${item.descripcion}`);
    render('stock');
}

function eliminarTrabajador(idx) {
    const trab = datos_per[idx];
    datos_per.splice(idx, 1);
    localStorage.setItem('tc_per', JSON.stringify(datos_per));
    guardarLogs(usuario_actual?.usuario, 'DELETE_WORKER', `Eliminó trabajador: ${trab.nombre_completo}`);
    render('personal');
}

function eliminarUsuario(idx) {
    const usr = datos_usuarios[idx];
    if (usr.rol !== 'admin' || datos_usuarios.filter(u => u.rol === 'admin').length > 1) {
        datos_usuarios.splice(idx, 1);
        guardarUsuarios();
        guardarLogs(usuario_actual?.usuario, 'DELETE_USER', `Eliminó usuario: ${usr.usuario}`);
        render('admin');
    } else {
        alert("No se puede eliminar el único admin");
    }
}

async function enviarRegistro() {
    const datos = {
        tipo: "registro_personal",
        num_empleado: document.getElementById('reg-id').value,
        nombre_completo: document.getElementById('reg-nom').value,
        jefe_chino: document.getElementById('reg-jefe').value,
        talla_camisola: document.getElementById('reg-tc').value,
        talla_calzado: document.getElementById('reg-tz').value
    };
    try {
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(datos) });
        guardarLogs(usuario_actual?.usuario, 'REGISTER', 'Registro externo enviado');
        alert("Guardado / 已保存");
        sincronizar();
    } catch (e) { alert("Error"); }
}

function exportarDatos() {
    const data = { 
        epp: datos_inv, 
        personal: datos_per, 
        vales: datos_vales,
        usuarios: datos_usuarios,
        logs: datos_logs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario_tc_completo.json';
    a.click();
}

function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.epp) { datos_inv = data.epp; localStorage.setItem('tc_inv', JSON.stringify(datos_inv)); }
            if (data.personal) { datos_per = data.personal; localStorage.setItem('tc_per', JSON.stringify(datos_per)); }
            if (data.vales) { datos_vales = data.vales; localStorage.setItem('tc_vales', JSON.stringify(datos_vales)); }
            if (data.usuarios) { datos_usuarios = data.usuarios; localStorage.setItem('tc_usuarios', JSON.stringify(datos_usuarios)); }
            if (data.logs) { datos_logs = data.logs; localStorage.setItem('tc_logs', JSON.stringify(datos_logs)); }
            guardarLogs(usuario_actual?.usuario, 'IMPORT', 'Datos importados desde archivo');
            alert('Datos importados correctamente');
            render('tablero');
        } catch (err) {
            alert('Error al leer el archivo: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function cerrarModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}

function pegarDatosTabular(tipo) {
    // Solicita al usuario que pegue los datos tabulares
    const texto = prompt("Pega tus datos tabulares aquí (delimitados por tabulaciones)\\nPrimera fila debe ser encabezados:\\nEjemplo:\\nCódigo\\tDescripción\\tStock\\nEPP-01\\tGuantes\\t100", "");
    if (!texto) return;
    
    const lineas = texto.trim().split('\\n');
    const encabezados = lineas[0].split('\\t');
    
    for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i].split('\\t');
        if (tipo === 'epp' && encabezados.includes('Código')) {
            const obj = {};
            encabezados.forEach((h, idx) => {
                if (h.toLowerCase().includes('código') || h.toLowerCase().includes('code')) obj.codigo = valores[idx] || '';
                if (h.toLowerCase().includes('descripción') || h.toLowerCase().includes('description')) obj.descripcion = valores[idx] || '';
                if (h.toLowerCase().includes('categoría') || h.toLowerCase().includes('category')) obj.categoria = valores[idx] || '';
                if (h.toLowerCase().includes('stock') || h.toLowerCase().includes('existencia')) obj.stock_actual = parseInt(valores[idx]) || 0;
                if (h.toLowerCase().includes('unidad') || h.toLowerCase().includes('unit')) obj.unidad = valores[idx] || 'PZA';
            });
            if (obj.descripcion) { datos_inv.push(obj); }
        } else if (tipo === 'personal' && encabezados.includes('Nombre') || encabezados.includes('Nombre')) {
            const obj = {};
            encabezados.forEach((h, idx) => {
                if (h.toLowerCase().includes('matrícula') || h.toLowerCase().includes('id')) obj.num_empleado = valores[idx] || '';
                if (h.toLowerCase().includes('nombre') || h.toLowerCase().includes('name')) obj.nombre_completo = valores[idx] || '';
                if (h.toLowerCase().includes('departamento') || h.toLowerCase().includes('department')) obj.departamento = valores[idx] || '';
                if (h.toLowerCase().includes('puesto') || h.toLowerCase().includes('position')) obj.puesto = valores[idx] || '';
                if (h.toLowerCase().includes('camisola') || h.toLowerCase().includes('coverall')) obj.talla_camisola = valores[idx] || '';
                if (h.toLowerCase().includes('calzado') || h.toLowerCase().includes('shoe')) obj.talla_calzado = valores[idx] || '';
            });
            if (obj.nombre_completo) { datos_per.push(obj); }
        }
    }
    
    if (tipo === 'epp') {
        localStorage.setItem('tc_inv', JSON.stringify(datos_inv));
        alert(`Se importaron ${lineas.length - 1} artículos EPP`);
        render('stock');
    } else {
        localStorage.setItem('tc_per', JSON.stringify(datos_per));
        alert(`Se importaron ${lineas.length - 1} trabajadores`);
        render('personal');
    }
}

function guardarPersonalEditado() {
    document.querySelectorAll('#tabla-personal-edit .input-edit').forEach(input => {
        const idx = parseInt(input.dataset.idx);
        const col = input.dataset.col;
        if (datos_per[idx]) datos_per[idx][col] = input.value;
    });
    localStorage.setItem('tc_per', JSON.stringify(datos_per));
    guardarLogs(usuario_actual?.usuario, 'EDIT_PERSONAL', 'Actualizó datos de personal desde hoja');
    alert('Personal guardado');
    render('importar');
}

function guardarEPPEditado() {
    document.querySelectorAll('#tabla-epp-edit .input-edit').forEach(input => {
        const idx = parseInt(input.dataset.idx);
        const col = input.dataset.col;
        if (datos_inv[idx]) datos_inv[idx][col] = input.value;
    });
    localStorage.setItem('tc_inv', JSON.stringify(datos_inv));
    guardarLogs(usuario_actual?.usuario, 'EDIT_EPP', 'Actualizó datos de EPP desde hoja');
    alert('EPP guardado');
    render('importar');
}

function agregarFilaPersonal() {
    datos_per.push({num_empleado:'', nombre_completo:'', departamento:'', puesto:'', talla_camisola:'', talla_calzado:''});
    render('importar');
}

function agregarFilaEPP() {
    datos_inv.push({codigo:'', descripcion:'', categoria:'', stock_actual:0, unidad:'PZA'});
    render('importar');
}

function limpiarTodoEPP() {
    if (confirm("¿Estás seguro de que deseas eliminar TODO el inventario EPP? Esta acción no se puede deshacer.")) {
        datos_inv = [];
        localStorage.setItem('tc_inv', JSON.stringify(datos_inv));
        guardarLogs(usuario_actual?.usuario, 'CLEAR_ALL_EPP', 'Eliminó todo el inventario EPP');
        alert('Inventario EPP completamente eliminado');
        render('importar');
    }
}

function limpiarTodoPersonal() {
    if (confirm("¿Estás seguro de que deseas eliminar TODOS los registros de personal? Esta acción no se puede deshacer.")) {
        datos_per = [];
        localStorage.setItem('tc_per', JSON.stringify(datos_per));
        guardarLogs(usuario_actual?.usuario, 'CLEAR_ALL_PERSONAL', 'Eliminó todos los registros de personal');
        alert('Registros de personal completamente eliminados');
        render('importar');
    }
}

function previsualizarTrabajador(idx) {
    const p = datos_per[idx];
    const valesWorker = datos_vales.filter(v => v.trabajador === p.nombre_completo);
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    
    modal.innerHTML = `
        <h2 class="text-xl font-black mb-4">Vista Previa - ${p.nombre_completo}</h2>
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-400">Matrícula</p>
                    <p class="font-bold text-lg">${p.num_empleado || '-'}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-400">Departamento</p>
                    <p class="font-bold text-lg">${p.departamento || '-'}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-400">Puesto</p>
                    <p class="font-bold text-lg">${p.puesto || '-'}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-400">Tallas</p>
                    <p class="font-bold text-lg">${p.talla_camisola || '-'} / ${p.talla_calzado || '-'}</p>
                </div>
            </div>
            <div class="border-t pt-4">
                <h3 class="font-bold text-slate-700 mb-2">Historial de Vales (${valesWorker.length})</h3>
                ${valesWorker.length > 0 ? `
                <div class="max-h-40 overflow-y-auto">
                    <table class="table-ui text-xs">
                        <thead><tr><th>Fecha</th><th>Artículo</th><th>Cant</th></tr></thead>
                        <tbody>${valesWorker.slice(-5).reverse().map(v => `
                            <tr>
                                <td>${v.fecha}</td>
                                <td>${v.articulo}</td>
                                <td>${v.cantidad}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<p class="text-slate-400 text-sm">Sin vales registrados</p>'}
            </div>
        </div>
        <button onclick="cerrarModal()" class="btn-action mt-4">Cerrar</button>
    `;
}

function reporteEPPTrabajador(idx) {
    const p = datos_per[idx];
    const valesWorker = datos_vales.filter(v => v.trabajador === p.nombre_completo);
    const eppEntregado = {};
    
    valesWorker.forEach(v => {
        const art = v.articulo;
        eppEntregado[art] = (eppEntregado[art] || 0) + parseInt(v.cantidad || 0);
    });
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    
    modal.innerHTML = `
        <h2 class="text-xl font-black mb-4">Reporte EPP - ${p.nombre_completo}</h2>
        <div class="space-y-4">
            <div class="bg-slate-50 p-4 rounded-xl">
                <p class="text-[10px] font-bold text-slate-400">TOTAL DE PIEZAS ENTREGADAS</p>
                <p class="font-black text-3xl text-emerald-600">${Object.values(eppEntregado).reduce((a,b) => a+b, 0)}</p>
            </div>
            <div class="border-t pt-4">
                <h3 class="font-bold text-slate-700 mb-2">Desglose por Artículo</h3>
                ${Object.keys(eppEntregado).length > 0 ? `
                <table class="table-ui text-sm">
                    <thead><tr><th>Artículo</th><th>Cantidad</th></tr></thead>
                    <tbody>${Object.entries(eppEntregado).map(([art, cant]) => `
                        <tr>
                            <td>${art}</td>
                            <td class="font-bold">${cant}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>` : '<p class="text-slate-400 text-sm">Sin entregas registradas</p>'}
            </div>
        </div>
        <button onclick="cerrarModal()" class="btn-action mt-4">Cerrar</button>
    `;
}

function resetDB() {
    localStorage.clear();
    location.reload();
}