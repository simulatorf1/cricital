console.log('🔴 tabs.js CARGA INICIADA');
// ========================
// SISTEMA DE PESTAÑAS COMPLETO
// ========================
console.log('📑 Sistema de pestañas cargado');

class TabManager {
    constructor() {
            console.log('🔴 [DEBUG] Constructor TabManager');
            this.currentTab = 'principal';
            this.tabContents = {};
            this.init();  // ← ¿ESTÁ ESTA LÍNEA?
    }
    
    init() {
        console.log('🔧 Inicializando sistema de pestañas...');
        this.setup();  // ← Ejecutar directamente
    }
    setup() {
        console.log('🔴 [DEBUG] setup() INICIADO');
    
        // Configurar botones de pestañas
        console.log('🔴 [DEBUG] Configurando botones de pestañas...');
        this.setupTabButtons();
    
        // Cargar contenido de pestañas
        console.log('🔴 [DEBUG] Cargando contenidos...');
        this.loadTabContents();
    
        // Mostrar pestaña principal
        console.log('🔴 [DEBUG] Mostrando pestaña principal...');
        this.switchTab('principal');
    
        console.log('🔴 [DEBUG] setup() COMPLETADO');
        console.log('✅ Sistema de pestañas listo');
    }

    
    setupTabButtons() {
        console.log('🔴 [DEBUG] setupTabButtons() INICIADO');
        const tabButtons = document.querySelectorAll('[data-tab]');
        console.log('🔴 [DEBUG] Encontrados', tabButtons.length, 'botones');
    
        tabButtons.forEach(button => {
            console.log('🔴 [DEBUG] Botón:', button.dataset.tab);
            button.addEventListener('click', (e) => {
                console.log('🔴 [DEBUG] Click en pestaña:', e.currentTarget.dataset.tab);
                e.preventDefault();
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        console.log('🔴 [DEBUG] setupTabButtons() COMPLETADO');
    }
    
    switchTab(tabId) {
        console.log(`🔄 Cambiando a pestaña: ${tabId}`);
        
        // Actualizar botones activos
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Mostrar contenido de la pestaña seleccionada
        const tabContent = document.getElementById(`tab-${tabId}`);
        if (tabContent) {
            // ======================================================
            // ¡¡PESTAÑA TALLER - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'taller') {
                // 1. SOLO marcar como activa
                tabContent.classList.add('active');
                this.currentTab = tabId;
                
                // 2. LIMPIAR contenido anterior (opcional pero recomendado)
                tabContent.innerHTML = '<div class="cargando-taller"><i class="fas fa-spinner fa-spin"></i> Cargando taller...</div>';
                
                // 3. Cargar el taller MINIMALISTA directamente
                setTimeout(async () => {
                    try {
                        if (window.f1Manager && window.f1Manager.cargarTabTaller) {
                            console.log('🔧 Ejecutando cargarTabTaller()...');
                            await window.f1Manager.cargarTabTaller();
                            console.log('✅ Taller cargado exitosamente');
                        } else {
                            console.error('❌ f1Manager.cargarTabTaller no disponible');
                            tabContent.innerHTML = `
                                <div class="error-message">
                                    <h3>❌ Error cargando el taller</h3>
                                    <p>El sistema de fabricación no está disponible</p>
                                    <button onclick="location.reload()">Reintentar</button>
                                </div>
                            `;
                        }
                    } catch (error) {
                        console.error('❌ Error cargando taller:', error);
                        tabContent.innerHTML = `
                            <div class="error-message">
                                <h3>❌ Error cargando el taller</h3>
                                <p>${error.message || 'Error desconocido'}</p>
                                <button onclick="location.reload()">Reintentar</button>
                            </div>
                        `;
                    }
                }, 300);
                
                // SALIR del método - no hacer nada más para el taller
                return;
            }
            
            // ======================================================
            // Para TODAS LAS OTRAS pestañas (principal, almacen, etc.)
            // ======================================================
            // 1. Primero cargar el contenido y eventos
            this.loadTabContent(tabId);
            // 2. Luego marcar como activa
            tabContent.classList.add('active');
            this.currentTab = tabId;
            
            // ======================================================
            // ¡¡PESTAÑA PRINCIPAL - CARGAR CONTENIDO!!
            // ======================================================
            if (tabId === 'principal') {
                console.log('🎯 Recargando contenido principal...');
                
                // Esperar 300ms para que el DOM esté listo
                setTimeout(async () => {
                    try {
                        // 1. Cargar piezas montadas
                        if (window.f1Manager && window.f1Manager.cargarPiezasMontadas) {
                            console.log('🔧 Ejecutando cargarPiezasMontadas()...');
                            await window.f1Manager.cargarPiezasMontadas();
                        }
                        
                        // 2. Cargar estrategas
                        if (window.f1Manager && window.f1Manager.updatePilotosUI) {
                            window.f1Manager.updatePilotosUI();
                        }
                        
                        // 3. Cargar producción
                        if (window.f1Manager && window.f1Manager.updateProductionMonitor) {
                            window.f1Manager.updateProductionMonitor();
                        }
                        
                        // 4. Cargar countdown
                        if (window.f1Manager && window.f1Manager.updateCountdown) {
                            window.f1Manager.updateCountdown();
                        }
                        
                        console.log('✅ Contenido principal recargado exitosamente');
                    } catch (error) {
                        console.error('❌ Error recargando principal:', error);
                    }
                }, 300);
            }
            
            // ======================================================
            // ¡¡PESTAÑA ALMACÉN - VERIFICAR ACTUALIZACIÓN!!
            // ======================================================
            if (tabId === 'almacen' && window.almacenNecesitaActualizar) {
                setTimeout(() => {
                    if (window.almacenNecesitaActualizar) {
                        console.log('📦 Almacén necesita actualización, cargando...');
                        this.loadAlmacenPiezas();
                        window.almacenNecesitaActualizar = false;
                        
                        // Ocultar alerta si existe
                        const alerta = document.getElementById('alerta-almacen');
                        if (alerta) {
                            alerta.style.display = 'none';
                        }
                    }
                }, 300);
            }
        }
    }
    
    loadTabContents() {
        // Precargar contenido de todas las pestañas
        const tabs = ['principal', 'taller', 'almacen', 'mercado', 'presupuesto', 'clasificacion'];
        
        tabs.forEach(tab => {
            this.tabContents[tab] = this.generateTabContent(tab);
        });
    }
    
    generateTabContent(tabId) {
        switch(tabId) {
            case 'principal':
                return this.getPrincipalContent();
            case 'taller':
                return this.getTallerContent();
            case 'almacen':
                return this.getAlmacenContent();
            case 'mercado':
                return this.getMercadoContent();
            case 'presupuesto':
                return this.getPresupuestoContent();
            case 'clasificacion':
                return this.getClasificacionContent();
            default:
                return `<h2>Pestaña ${tabId}</h2><p>Contenido en desarrollo...</p>`;
        }
    }
    
    loadTabContent(tabId) {
        console.log(`🔴 [DEBUG] loadTabContent() para pestaña: ${tabId}`);
        const tabContent = document.getElementById(`tab-${tabId}`);
        if (!tabContent) {
            console.error(`❌ No se encontró el contenedor tab-${tabId}`);
            return;
        }
        
        // 1. Poner contenido HTML
        tabContent.innerHTML = this.tabContents[tabId];
        
        // 2. Configurar eventos específicos de la pestaña
        console.log(`🔴 [DEBUG] Llamando a setupTabEvents(${tabId})`);
        this.setupTabEvents(tabId);
        
        // 3. Marcar como activo (esto lo hace switchTab, pero por si acaso)
        tabContent.classList.add('active');
        this.currentTab = tabId;
    }
    
    setupTabEvents(tabId) {
        switch(tabId) {
            case 'taller':
                this.setupTallerEvents();
                break;
            case 'almacen':
                this.setupAlmacenEvents();
                break;
            case 'mercado':
                this.setupMercadoEvents();
                break;
        }
    }
    
    // ===== CONTENIDO DE PESTAÑAS =====
    
    getPrincipalContent() {
        // El contenido principal ya está en el HTML
        return document.getElementById('tab-principal')?.innerHTML || '';
    }
    
    getTallerContent() {
        return `
            <div class="taller-container">
                <div class="taller-header">
                    <h2><i class="fas fa-tools"></i> Taller de Diseño</h2>
                    <p class="taller-description">
                        Diseña y fabrica piezas para mejorar tu coche. Cada pieza tarda 4 horas en fabricarse.
                    </p>
                </div>
                
                <div class="taller-stats">
                    <div class="stat-card-taller">
                        <i class="fas fa-clock"></i>
                        <div>
                            <span class="stat-label">TIEMPO DE FABRICACIÓN</span>
                            <span class="stat-value">4 horas</span>
                        </div>
                    </div>
                    <div class="stat-card-taller">
                        <i class="fas fa-coins"></i>
                        <div>
                            <span class="stat-label">COSTE POR PIEZA</span>
                            <span class="stat-value">€10,000</span>
                        </div>
                    </div>
                    <div class="stat-card-taller">
                        <i class="fas fa-puzzle-piece"></i>
                        <div>
                            <span class="stat-label">PIEZAS POR NIVEL</span>
                            <span class="stat-value">20</span>
                        </div>
                    </div>
                </div>
                
                <div class="taller-areas-grid" id="taller-areas">
                    <!-- Las áreas se cargarán dinámicamente -->
                </div>
                
                <div class="taller-history">
                    <h3><i class="fas fa-history"></i> Historial de Fabricación</h3>
                    <div class="history-list" id="history-list">
                        <div class="empty-history">
                            <i class="fas fa-industry"></i>
                            <p>No hay historial de fabricación</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getAlmacenContent() {
        return `
            <div class="almacen-container-completo">
                <div class="almacen-header">
                    <h2><i class="fas fa-warehouse"></i> Almacén de Piezas</h2>
                    <div class="almacen-info">
                        <p>Equipa piezas para sumar puntos a tu coche o véndelas en el mercado</p>
                    </div>
                </div>
                
                <div class="almacen-grid" id="almacen-grid">
                    <!-- Las piezas se cargarán aquí -->
                </div>
            </div>
        `;
    }
    
    getMercadoContent() {
        return `
            <div class="mercado-container">
                <div class="mercado-header">
                    <h2><i class="fas fa-shopping-cart"></i> Mercado de Piezas</h2>
                    <div class="mercado-actions">
                        <button class="btn-primary" id="btn-vender-pieza">
                            <i class="fas fa-tag"></i> Vender Pieza
                        </button>
                        <button class="btn-secondary" id="btn-refresh-mercado">
                            <i class="fas fa-sync-alt"></i> Actualizar
                        </button>
                    </div>
                </div>
                
                <div class="mercado-filters">
                    <div class="filter-group">
                        <label for="filter-area">Área:</label>
                        <select id="filter-area" class="filter-select">
                            <option value="all">Todas las áreas</option>
                            ${window.CAR_AREAS?.map(area => 
                                `<option value="${area.id}">${area.name}</option>`
                            ).join('') || ''}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-nivel">Nivel:</label>
                        <select id="filter-nivel" class="filter-select">
                            <option value="all">Todos los niveles</option>
                            ${Array.from({length: 10}, (_, i) => 
                                `<option value="${i + 1}">Nivel ${i + 1}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-precio">Ordenar por precio:</label>
                        <select id="filter-precio" class="filter-select">
                            <option value="asc">Menor a mayor</option>
                            <option value="desc">Mayor a menor</option>
                        </select>
                    </div>
                </div>
                
                <div class="mercado-grid" id="mercado-grid">
                    <div class="empty-mercado">
                        <i class="fas fa-store-slash"></i>
                        <p>No hay piezas en el mercado</p>
                        <p class="empty-subtitle">Sé el primero en vender una pieza</p>
                    </div>
                </div>
                
                <div class="mercado-info">
                    <h3><i class="fas fa-info-circle"></i> Información del Mercado</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-percentage"></i>
                            <div>
                                <span class="info-label">Comisión de venta</span>
                                <span class="info-value">20% sobre el precio de costo</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-shield-alt"></i>
                            <div>
                                <span class="info-label">Protección anti-espía</span>
                                <span class="info-value">€50,000 por transacción</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-exchange-alt"></i>
                            <div>
                                <span class="info-label">Política de devolución</span>
                                <span class="info-value">No hay devoluciones</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getPresupuestoContent() {
        return `
            <div class="presupuesto-container">
                <div class="presupuesto-header">
                    <h2><i class="fas fa-chart-pie"></i> Presupuesto y Finanzas</h2>
                    <div class="period-selector">
                        <select id="periodo-presupuesto" class="period-select">
                            <option value="mensual">Mensual</option>
                            <option value="anual" selected>Anual</option>
                            <option value="total">Total</option>
                        </select>
                    </div>
                </div>
                
                <div class="presupuesto-resumen">
                    <div class="resumen-card ingresos">
                        <h3><i class="fas fa-arrow-down"></i> INGRESOS</h3>
                        <div class="resumen-content" id="ingresos-detalle">
                            <div class="ingreso-item">
                                <span>Apuestas</span>
                                <span class="ingreso-valor">€0</span>
                            </div>
                            <div class="ingreso-item">
                                <span>Evolución coche</span>
                                <span class="ingreso-valor">€0</span>
                            </div>
                            <div class="ingreso-item">
                                <span>Publicidad</span>
                                <span class="ingreso-valor">€0</span>
                            </div>
                            <div class="ingreso-item">
                                <span>Ventas mercado</span>
                                <span class="ingreso-valor">€0</span>
                            </div>
                        </div>
                        <div class="resumen-total">
                            <span>Total ingresos:</span>
                            <strong id="total-ingresos">€0</strong>
                        </div>
                    </div>
                    
                    <div class="resumen-card gastos">
                        <h3><i class="fas fa-arrow-up"></i> GASTOS</h3>
                        <div class="resumen-content" id="gastos-detalle">
                            <div class="gasto-item">
                                <span>Salarios pilotos</span>
                                <span class="gasto-valor">€0</span>
                            </div>
                            <div class="gasto-item">
                                <span>Fabricación</span>
                                <span class="gasto-valor">€0</span>
                            </div>
                            <div class="gasto-item">
                                <span>Mantenimiento</span>
                                <span class="gasto-valor">€0</span>
                            </div>
                            <div class="gasto-item">
                                <span>Seguridad</span>
                                <span class="gasto-valor">€0</span>
                            </div>
                        </div>
                        <div class="resumen-total">
                            <span>Total gastos:</span>
                            <strong id="total-gastos">€0</strong>
                        </div>
                    </div>
                    
                    <div class="resumen-card balance">
                        <h3><i class="fas fa-scale-balanced"></i> BALANCE</h3>
                        <div class="balance-content">
                            <div class="balance-item">
                                <span>Saldo inicial:</span>
                                <span id="saldo-inicial">€5,000,000</span>
                            </div>
                            <div class="balance-item">
                                <span>Ingresos - Gastos:</span>
                                <span id="diferencia">€0</span>
                            </div>
                            <div class="balance-item total">
                                <span>Saldo actual:</span>
                                <strong id="saldo-final">€5,000,000</strong>
                            </div>
                        </div>
                        <div class="balance-status" id="balance-status">
                            <i class="fas fa-check-circle"></i>
                            <span>Presupuesto saludable</span>
                        </div>
                    </div>
                </div>
                
                <div class="presupuesto-grafico">
                    <h3><i class="fas fa-chart-line"></i> Evolución Financiera</h3>
                    <div class="grafico-container">
                        <canvas id="grafico-finanzas"></canvas>
                    </div>
                </div>
            </div>
        `;
    }
    
    getClasificacionContent() {
        return `
            <div class="clasificacion-container">
                <div class="clasificacion-header">
                    <h2><i class="fas fa-medal"></i> Clasificación Global</h2>
                    <div class="clasificacion-filters">
                        <button class="filter-btn active" data-filter="global">Global</button>
                        <button class="filter-btn" data-filter="friends">Amigos</button>
                        <button class="filter-btn" data-filter="regional">Regional</button>
                    </div>
                </div>
                
                <div class="clasificacion-info">
                    <div class="info-card">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <span class="info-label">Tu posición</span>
                            <span class="info-value" id="mi-posicion">#-</span>
                        </div>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-users"></i>
                        <div>
                            <span class="info-label">Total jugadores</span>
                            <span class="info-value" id="total-jugadores">0</span>
                        </div>
                    </div>
                    <div class="info-card">
                        <i class="fas fa-flag-checkered"></i>
                        <div>
                            <span class="info-label">Puntos para Top 10</span>
                            <span class="info-value" id="puntos-top10">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="clasificacion-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th>Escudería</th>
                                <th>Puntos</th>
                                <th>Dinero</th>
                                <th>Nivel Ing.</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-clasificacion">
                            <tr class="loading-row">
                                <td colspan="6">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <span>Cargando clasificación...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="clasificacion-pagination">
                    <button class="btn-pagination prev" disabled>
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <span class="pagination-info">Página <span id="current-page">1</span> de <span id="total-pages">1</span></span>
                    <button class="btn-pagination next">
                        Siguiente <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="clasificacion-logros">
                    <h3><i class="fas fa-award"></i> Tus Logros</h3>
                    <div class="logros-grid" id="logros-grid">
                        <div class="logro-item locked">
                            <i class="fas fa-lock"></i>
                            <span>Primera fabricación</span>
                        </div>
                        <div class="logro-item locked">
                            <i class="fas fa-lock"></i>
                            <span>Primer piloto</span>
                        </div>
                        <div class="logro-item locked">
                            <i class="fas fa-lock"></i>
                            <span>Top 100 global</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===== EVENTOS DE PESTAÑAS =====
    
    setupTallerEvents() {
        console.log('🔧 Configurando eventos del taller...');
        
        // Cargar áreas del taller
        this.loadTallerAreas();
        
        // Botón de historial
        document.getElementById('history-list')?.addEventListener('click', () => {
            this.loadFabricacionHistory();
        });
    }
    
    setupAlmacenEvents() {
        console.log('🔧 Configurando eventos del almacén...');
        
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                this.filterAlmacen(filter);
            });
        });
        
        // Botón equipar todas
        document.getElementById('btn-equipar-todas')?.addEventListener('click', () => {
            this.equiparTodasPiezas();
        });
        
        // Botón vender todas
        document.getElementById('btn-vender-todas')?.addEventListener('click', () => {
            this.venderTodasPiezas();
        });
        
        // Cargar piezas del almacén
        this.loadAlmacenPiezas();
    }
    
    setupMercadoEvents() {
        console.log('🔧 Configurando eventos del mercado...');
        
        // Botón vender pieza
        document.getElementById('btn-vender-pieza')?.addEventListener('click', () => {
            this.showVenderPiezaModal();
        });
        
        // Botón actualizar
        document.getElementById('btn-refresh-mercado')?.addEventListener('click', () => {
            this.loadMercadoPiezas();
        });
        
        // Filtros
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                this.filterMercado();
            });
        });
        
        // Cargar piezas del mercado
        this.loadMercadoPiezas();
    }
    
    // ===== FUNCIONES DE PESTAÑAS =====
    
    async loadTallerAreas() {
        const container = document.getElementById('taller-areas');
        if (!container) return;
        
        if (!window.CAR_AREAS) {
            container.innerHTML = '<p>Error cargando áreas</p>';
            return;
        }
        
        container.innerHTML = window.CAR_AREAS.map(area => `
            <div class="area-taller-card" data-area="${area.id}">
                <div class="area-header">
                    <div class="area-icon" style="color: ${area.color}">
                        <i class="${area.icon}"></i>
                    </div>
                    <h3>${area.name}</h3>
                </div>
                
                <div class="area-info">
                    <div class="area-stat">
                        <span class="stat-label">Nivel actual</span>
                        <span class="stat-value" id="nivel-${area.id}">0</span>
                    </div>
                    <div class="area-stat">
                        <span class="stat-label">Progreso</span>
                        <span class="stat-value" id="progreso-${area.id}">0/20</span>
                    </div>
                    <div class="area-stat">
                        <span class="stat-label">Costo</span>
                        <span class="stat-value">€10,000</span>
                    </div>
                </div>
                
                <button class="btn-taller-fabricar" data-area="${area.id}">
                    <i class="fas fa-hammer"></i> Fabricar Pieza
                </button>
                
                <div class="area-progress">
                    <div class="progress-bar" id="progress-${area.id}">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Configurar eventos de los botones
        document.querySelectorAll('.btn-taller-fabricar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const areaId = e.target.closest('.btn-taller-fabricar').dataset.area;
                if (window.f1Manager) {
                    window.f1Manager.iniciarFabricacion(areaId);
                }
            });
        });
    }
    
    async loadAlmacenPiezas() {
        const container = document.getElementById('almacen-grid');
        if (!container || !window.f1Manager?.escuderia?.id) return;
    
        try {
            // CAMBIO 1: Tabla correcta
            const { data: todasLasPiezas, error } = await supabase
                .from('almacen_piezas')  // ← TABLA REAL
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .order('fabricada_en', { ascending: false });
    
            if (error) throw error;
    
            if (!todasLasPiezas || todasLasPiezas.length === 0) {
                container.innerHTML = `
                    <div class="almacen-vacio">
                        <i class="fas fa-box-open fa-3x"></i>
                        <h3>No hay piezas fabricadas</h3>
                        <p>Ve al taller para fabricar tu primera pieza</p>
                    </div>
                `;
                return;
            }
    
            let html = '<div class="almacen-tabla">';
            
            // Lista SIMPLE sin agrupar
            todasLasPiezas.forEach((pieza, index) => {
                const areaInfo = window.CAR_AREAS.find(a => 
                    a.id === pieza.area || a.name === pieza.area
                    );
                const filaClase = index % 2 === 0 ? 'fila-par' : 'fila-impar';
                const equipada = pieza.equipada === true;  // CAMBIO 2: usa campo equipada
                
                html += `
                    <div class="pieza-fila ${filaClase} ${equipada ? 'equipada' : ''}">
                        <div class="celda celda-icono" style="color: ${areaInfo?.color || '#666'}">
                            <i class="${areaInfo?.icon || 'fas fa-cog'}"></i>
                        </div>
                        <div class="celda celda-area">${areaInfo?.name || pieza.area}</div>
                        <div class="celda celda-nivel">Nivel ${pieza.nivel || 1}</div>
                        <div class="celda celda-puntos">
                            <span class="badge-puntos">${pieza.puntos_base || 10} pts</span>
                        </div>
                        <div class="celda celda-estado">
                            <span class="estado-badge ${equipada ? 'equipada' : 'disponible'}">
                                ${equipada ? '✓ EQUIPADA' : 'DISPONIBLE'}
                            </span>
                        </div>
                        <div class="celda celda-fecha">
                            ${pieza.fabricada_en ? new Date(pieza.fabricada_en).toLocaleDateString('es-ES') : '-'}
                        </div>
                        <div class="celda celda-acciones">
                            <button class="btn-accion btn-equipar" 
                                    onclick="window.tabManager.equiparPieza('${pieza.id}')"
                                    ${equipada ? 'disabled' : ''}>
                                ${equipada ? '✓' : 'EQUIPAR'}
                            </button>
                            <button class="btn-accion btn-vender" 
                                    onclick="window.tabManager.venderPieza('${pieza.id}')">
                                VENDER
                            </button>
                        </div>
                    </div>
                `;
            });
    
            html += '</div>';
            container.innerHTML = html;
    
        } catch (error) {
            console.error('Error cargando almacén:', error);
            container.innerHTML = '<div class="error">Error cargando el almacén</div>';
        }
    }
       async equiparTodasPiezasArea(areaId) {
        console.log(`🔧 Equipando todas las piezas del área: ${areaId}`);
        
        try {
            // 1. Buscar piezas disponibles del área
            const { data: piezas, error } = await supabase
                .from('piezas_almacen')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .eq('area', areaId)
                .eq('estado', 'disponible');
            
            if (error) throw error;
            
            if (!piezas || piezas.length === 0) {
                if (window.f1Manager?.showNotification) {
                    window.f1Manager.showNotification('No hay piezas disponibles en esta área', 'info');
                }
                return;
            }
            
            // 2. Equipar cada pieza
            for (const pieza of piezas) {
                await supabase
                    .from('piezas_almacen')
                    .update({ 
                        estado: 'equipada',
                        equipada_en: new Date().toISOString()
                    })
                    .eq('id', pieza.id);
                
                // 3. Sumar puntos del coche
                await this.sumarPuntosAlCoche(pieza.area, pieza.puntos_base);
            }
            
            // 4. Actualizar UI
            this.loadAlmacenPiezas();
            
            // 5. Actualizar UI principal
            if (window.f1Manager?.loadCarStatus) {
                setTimeout(() => {
                    window.f1Manager.loadCarStatus();
                    window.f1Manager.updateCarAreasUI();
                }, 500);
            }
            
            // 6. Mostrar notificación
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification(`✅ ${piezas.length} piezas equipadas`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error equipando todas las piezas:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error al equipar las piezas', 'error');
            }
        }
    }
    
    async desequiparTodasPiezasArea(areaId) {
        console.log(`🔧 Desequipando todas las piezas del área: ${areaId}`);
        
        try {
            // 1. Buscar piezas equipadas del área
            const { data: piezas, error } = await supabase
                .from('piezas_almacen')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .eq('area', areaId)
                .eq('estado', 'equipada');
            
            if (error) throw error;
            
            if (!piezas || piezas.length === 0) {
                if (window.f1Manager?.showNotification) {
                    window.f1Manager.showNotification('No hay piezas equipadas en esta área', 'info');
                }
                return;
            }
            
            // 2. Desequipar cada pieza
            for (const pieza of piezas) {
                await supabase
                    .from('piezas_almacen')
                    .update({ 
                        estado: 'disponible',
                        equipada_en: null
                    })
                    .eq('id', pieza.id);
                
                // 3. Restar puntos del coche
                await this.restarPuntosDelCoche(pieza.area, pieza.puntos_base);
            }
            
            // 4. Actualizar UI
            this.loadAlmacenPiezas();
            
            // 5. Actualizar UI principal
            if (window.f1Manager?.loadCarStatus) {
                setTimeout(() => {
                    window.f1Manager.loadCarStatus();
                    window.f1Manager.updateCarAreasUI();
                }, 500);
            }
            
            // 6. Mostrar notificación
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification(`✅ ${piezas.length} piezas desequipadas`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error desequipando todas las piezas:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error al desequipar las piezas', 'error');
            }
        }
    }
    
    // ===== FUNCIONES PARA MANEJAR PIEZAS =====
    // ... el resto de tu código sigue aquí ... 
    
    
    
    // ===== FUNCIONES PARA MANEJAR PIEZAS =====
    
    async equiparPieza(piezaId) {
        console.log(`🔧 Equipando pieza: ${piezaId}`);
        
        try {
            // 1. OBTENER PIEZA DESDE LA TABLA CORRECTA
            const { data: pieza, error: fetchError } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('id', piezaId)
                .single();
            
            if (fetchError) throw fetchError;
            if (!pieza) throw new Error('Pieza no encontrada');
            
            console.log('✅ Pieza encontrada:', pieza);
            
            // 2. MARCAR COMO EQUIPADA EN LA MISMA TABLA
            const { error: updateError } = await supabase
                .from('almacen_piezas')
                .update({ 
                    equipada: true,
                    creada_en: new Date().toISOString()
                })
                .eq('id', piezaId);
            
            if (updateError) throw updateError;
            
            // 3. SUMAR PUNTOS AL COCHE
            await this.sumarPuntosAlCoche(pieza.area, pieza.puntos_base || 10);
            
            // 4. SUMAR PUNTOS A LA ESCUDERÍA
            const puntosSumar = pieza.puntos_base || 10;
            const nuevosPuntos = (window.f1Manager?.escuderia?.puntos || 0) + puntosSumar;
            
            const { error: puntosError } = await supabase
                .from('escuderias')
                .update({ puntos: nuevosPuntos })
                .eq('id', window.f1Manager?.escuderia?.id);
            
            if (puntosError) throw puntosError;
            
            // 5. ACTUALIZAR EN MEMORIA
            if (window.f1Manager?.escuderia) {
                window.f1Manager.escuderia.puntos = nuevosPuntos;
            }
            
            // 6. ACTUALIZAR UI
            const puntosElement = document.getElementById('points-value');
            if (puntosElement) {
                puntosElement.textContent = nuevosPuntos;
            }
            
            // 7. RECARGAR ALMACÉN Y ESTADÍSTICAS
            this.loadAlmacenPiezas();
            
            if (window.f1Manager?.loadCarStatus) {
                setTimeout(() => {
                    window.f1Manager.loadCarStatus();
                    if (window.f1Manager.updateCarAreasUI) {
                        window.f1Manager.updateCarAreasUI();
                    }
                }, 500);
            }
            
            // 8. NOTIFICACIÓN
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification(`✅ ${pieza.area} equipada (+${puntosSumar} pts)`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error equipando pieza:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error al equipar la pieza: ' + error.message, 'error');
            }
        }
    }
    
    async sumarPuntosAlCoche(areaNombre, puntos) {
        try {
            // 1. CONVERTIR nombre del área al ID correcto (de window.CAR_AREAS)
            let areaId = null;
            
            // Buscar en CAR_AREAS por nombre
            const areaConfig = window.CAR_AREAS.find(a => 
                a.name === areaNombre || a.id === areaNombre
            );
            
            if (areaConfig) {
                areaId = areaConfig.id; // Ej: "caja_cambios"
            } else {
                // Mapeo manual para áreas con espacios
                const mapeoManual = {
                    'caja de cambios': 'caja_cambios',
                    'alerón delantero': 'aleron_delantero',
                    'alerón trasero': 'aleron_trasero',
                    'suelo y difusor': 'suelo'
                };
                areaId = mapeoManual[areaNombre.toLowerCase()] || areaNombre.toLowerCase().replace(/ /g, '_');
            }
            
            console.log(`📊 Sumando ${puntos} pts al área ${areaId} (original: ${areaNombre})`);
            
            // 2. Obtener stats actuales del coche
            const { data: stats, error: fetchError } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                // Si no hay stats, crear registro
                const { error: createError } = await supabase
                    .from('coches_stats')
                    .insert([{
                        escuderia_id: window.f1Manager.escuderia.id,
                        [`${areaId}_progreso`]: 1,
                        [`${areaId}_nivel`]: 0,
                        actualizado_en: new Date().toISOString()
                    }]);
                
                if (createError) throw createError;
                console.log('✅ Stats creados desde cero');
                return;
            }
            
            if (!stats) return;
            
            // 3. Calcular nuevo progreso
            const columnaProgreso = `${areaId}_progreso`;
            const columnaNivel = `${areaId}_nivel`;
            
            const progresoActual = stats[columnaProgreso] || 0;
            const nivelActual = stats[columnaNivel] || 0;
            
            let nuevoProgreso = progresoActual + 1;
            let nuevoNivel = nivelActual;
            
            // Si alcanza 20 piezas, subir de nivel
            if (nuevoProgreso >= 20) {
                nuevoProgreso = 0;
                nuevoNivel = nivelActual + 1;
                if (nuevoNivel > 10) nuevoNivel = 10;
                
                console.log(`🎉 ¡NIVEL UP! ${areaId} ahora es nivel ${nuevoNivel}`);
            }
            
            // 4. Actualizar en BD
            const { error: updateError } = await supabase
                .from('coches_stats')
                .update({
                    [columnaProgreso]: nuevoProgreso,
                    [columnaNivel]: nuevoNivel,
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', stats.id);
            
            if (updateError) throw updateError;
            
            console.log(`✅ Progreso actualizado: ${areaId} - Progreso: ${nuevoProgreso}/20, Nivel: ${nuevoNivel}`);
            
        } catch (error) {
            console.error('❌ Error sumando puntos al coche:', error);
        }
    }
    
    async restarPuntosDelCoche(areaNombre, puntos) {
        try {
            // 1. CONVERTIR nombre del área al ID correcto
            let areaId = null;
            const areaConfig = window.CAR_AREAS.find(a => 
                a.name === areaNombre || a.id === areaNombre
            );
            
            if (areaConfig) {
                areaId = areaConfig.id;
            } else {
                const mapeoManual = {
                    'caja de cambios': 'caja_cambios',
                    'alerón delantero': 'aleron_delantero',
                    'alerón trasero': 'aleron_trasero',
                    'suelo y difusor': 'suelo'
                };
                areaId = mapeoManual[areaNombre.toLowerCase()] || areaNombre.toLowerCase().replace(/ /g, '_');
            }
            
            console.log(`📊 Restando ${puntos} pts del área ${areaId} (original: ${areaNombre})`);
            
            // 2. Obtener stats actuales del coche
            const { data: stats, error: fetchError } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .single();
            
            if (fetchError || !stats) {
                console.log('⚠️ No hay stats del coche para restar puntos');
                return;
            }
            
            // 3. Calcular nuevo progreso
            const columnaProgreso = `${areaId}_progreso`;
            const columnaNivel = `${areaId}_nivel`;
            
            const progresoActual = stats[columnaProgreso] || 0;
            const nivelActual = stats[columnaNivel] || 0;
            
            let nuevoProgreso = Math.max(0, progresoActual - 1);
            let nuevoNivel = nivelActual;
            
            // Si estaba en progreso 0 y nivel > 0, bajar de nivel
            if (progresoActual === 0 && nivelActual > 0) {
                nuevoNivel = nivelActual - 1;
                nuevoProgreso = 19;
                if (nuevoNivel < 0) nuevoNivel = 0;
            }
            
            // 4. Actualizar en BD
            const { error: updateError } = await supabase
                .from('coches_stats')
                .update({
                    [columnaProgreso]: nuevoProgreso,
                    [columnaNivel]: nuevoNivel,
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', stats.id);
            
            if (updateError) throw updateError;
            
            console.log(`✅ Progreso actualizado: ${areaId} - Progreso: ${nuevoProgreso}/20, Nivel: ${nuevoNivel}`);
            
        } catch (error) {
            console.error('❌ Error restando puntos del coche:', error);
        }
    }
    
    async venderPieza(piezaId) {
        if (!confirm('¿Vender esta pieza? Se eliminará permanentemente.')) return;
        
        try {
            // TABLA CORRECTA
            const { data: pieza, error: fetchError } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('id', piezaId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // RESTAR PUNTOS SI ESTABA EQUIPADA
            if (pieza.equipada === true) {
                await this.restarPuntosDelCoche(pieza.area, pieza.puntos_base || 10);
                
                // RESTAR PUNTOS DE LA ESCUDERÍA
                const puntosRestar = pieza.puntos_base || 10;
                const nuevosPuntos = Math.max(0, (window.f1Manager?.escuderia?.puntos || 0) - puntosRestar);
                
                await supabase
                    .from('escuderias')
                    .update({ puntos: nuevosPuntos })
                    .eq('id', window.f1Manager?.escuderia?.id);
                
                if (window.f1Manager?.escuderia) {
                    window.f1Manager.escuderia.puntos = nuevosPuntos;
                }
                
                const puntosElement = document.getElementById('points-value');
                if (puntosElement) {
                    puntosElement.textContent = nuevosPuntos;
                }
            }
            
            // CALCULAR PRECIO DE VENTA
            const costoBase = 10000;
            const precioVenta = Math.round(costoBase * 1.4);
            
            // SUMAR DINERO A LA ESCUDERÍA
            if (window.f1Manager?.escuderia) {
                window.f1Manager.escuderia.dinero += precioVenta;
                await window.f1Manager.updateEscuderiaMoney();
            }
            
            // ELIMINAR PIEZA DE LA BD
            const { error: deleteError } = await supabase
                .from('almacen_piezas')
                .delete()
                .eq('id', piezaId);
            
            if (deleteError) throw deleteError;
            
            // RECARGAR ALMACÉN
            this.loadAlmacenPiezas();
            
            // ACTUALIZAR UI DEL COCHE
            if (window.f1Manager?.loadCarStatus) {
                setTimeout(() => window.f1Manager.loadCarStatus(), 500);
            }
            
            // NOTIFICACIÓN
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification(`💰 Pieza vendida por €${precioVenta.toLocaleString()}`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error vendiendo pieza:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error al vender la pieza', 'error');
            }
        }
    }
    
    async desequiparPieza(piezaId) {
        console.log(`🔧 Desequipando pieza: ${piezaId}`);
        
        try {
            // 1. OBTENER PIEZA DESDE TABLA CORRECTA
            const { data: pieza, error: fetchError } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('id', piezaId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // 2. MARCAR PIEZA COMO NO EQUIPADA
            const { error: updateError } = await supabase
                .from('almacen_piezas')
                .update({ 
                    equipada: false
                })
                .eq('id', piezaId);
            
            if (updateError) throw updateError;
            
            // 3. RESTAR PUNTOS DEL COCHE
            await this.restarPuntosDelCoche(pieza.area, pieza.puntos_base || 10);
            
            // 4. RESTAR PUNTOS DE LA ESCUDERÍA
            const puntosRestar = pieza.puntos_base || 10;
            const nuevosPuntos = Math.max(0, (window.f1Manager?.escuderia?.puntos || 0) - puntosRestar);
            
            await supabase
                .from('escuderias')
                .update({ puntos: nuevosPuntos })
                .eq('id', window.f1Manager?.escuderia?.id);
            
            if (window.f1Manager?.escuderia) {
                window.f1Manager.escuderia.puntos = nuevosPuntos;
            }
            
            // 5. ACTUALIZAR UI
            const puntosElement = document.getElementById('points-value');
            if (puntosElement) {
                puntosElement.textContent = nuevosPuntos;
            }
            
            this.loadAlmacenPiezas();
            
            // 6. ACTUALIZAR UI PRINCIPAL
            if (window.f1Manager?.loadCarStatus) {
                setTimeout(() => {
                    window.f1Manager.loadCarStatus();
                    if (window.f1Manager.updateCarAreasUI) {
                        window.f1Manager.updateCarAreasUI();
                    }
                }, 500);
            }
            
            // 7. NOTIFICACIÓN
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification(`✅ Pieza desequipada (-${pieza.puntos_base || 10} pts)`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error desequipando pieza:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error al desequipar la pieza', 'error');
            }
        }
    }
    
    filterAlmacen(filter) {
        console.log(`Filtrando almacén por: ${filter}`);
        // Implementar lógica de filtrado
    }
    
    filterMercado() {
        const area = document.getElementById('filter-area')?.value;
        const nivel = document.getElementById('filter-nivel')?.value;
        const precio = document.getElementById('filter-precio')?.value;
        
        console.log(`Filtrando mercado: área=${area}, nivel=${nivel}, precio=${precio}`);
        // Implementar lógica de filtrado
    }
    
    async equiparTodasPiezas() {
        if (window.f1Manager) {
            window.f1Manager.showNotification('Equipando todas las piezas disponibles...', 'info');
        }
        // Implementar lógica
    }
    
    async venderTodasPiezas() {
        if (confirm('¿Estás seguro de vender todas las piezas no equipadas?')) {
            if (window.f1Manager) {
                window.f1Manager.showNotification('Vendiendo todas las piezas no equipadas...', 'info');
            }
            // Implementar lógica
        }
    }
    
    showVenderPiezaModal() {
        if (window.f1Manager) {
            window.f1Manager.showNotification('Funcionalidad de venta en desarrollo', 'info');
        }
    }
    
    async loadFabricacionHistory() {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        // Aquí iría la carga del historial
        container.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-industry"></i>
                <p>No hay historial de fabricación</p>
                <p class="empty-subtitle">Tu historial aparecerá aquí</p>
            </div>
        `;
    }
}
// Hacer la clase disponible globalmente
window.TabManager = TabManager;

// Inicializar INMEDIATAMENTE (no esperar DOMContentLoaded)
console.log('🔴 [DEBUG] Creando tabManager INMEDIATAMENTE');
window.tabManager = new TabManager();
console.log('🔴 [DEBUG] tabManager creado:', window.tabManager);
console.log('✅ Sistema de pestañas listo para usar');
