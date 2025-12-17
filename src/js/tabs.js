// ========================
// SISTEMA DE PESTAÑAS COMPLETO
// ========================
console.log('📑 Sistema de pestañas cargado');

class TabManager {
    constructor() {
        this.currentTab = 'principal';
        this.tabContents = {};
        this.init();
    }
    
    init() {
        console.log('🔧 Inicializando sistema de pestañas...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Configurar botones de pestañas
        this.setupTabButtons();
        
        // Cargar contenido de pestañas
        this.loadTabContents();
        
        // Mostrar pestaña principal
        this.switchTab('principal');
        
        console.log('✅ Sistema de pestañas listo');
    }
    
    setupTabButtons() {
        const tabButtons = document.querySelectorAll('[data-tab]');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
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
            tabContent.classList.add('active');
            this.currentTab = tabId;
            
            // Cargar contenido si no está cargado
            if (!this.tabContents[tabId]) {
                this.loadTabContent(tabId);
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
        const tabContent = document.getElementById(`tab-${tabId}`);
        if (!tabContent) return;
        
        tabContent.innerHTML = this.tabContents[tabId];
        
        // Configurar eventos específicos de la pestaña
        this.setupTabEvents(tabId);
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
            <div class="almacen-container">
                <div class="almacen-header">
                    <h2><i class="fas fa-warehouse"></i> Almacén de Piezas</h2>
                    <div class="almacen-stats">
                        <div class="stat-almacen">
                            <span class="stat-number" id="total-piezas">0</span>
                            <span class="stat-label">Piezas totales</span>
                        </div>
                        <div class="stat-almacen">
                            <span class="stat-number" id="piezas-disponibles">0</span>
                            <span class="stat-label">Disponibles</span>
                        </div>
                        <div class="stat-almacen">
                            <span class="stat-number" id="piezas-equipadas">0</span>
                            <span class="stat-label">Equipadas</span>
                        </div>
                    </div>
                </div>
                
                <div class="almacen-filters">
                    <button class="filter-btn active" data-filter="all">Todas</button>
                    <button class="filter-btn" data-filter="available">Disponibles</button>
                    <button class="filter-btn" data-filter="equipped">Equipadas</button>
                    <button class="filter-btn" data-filter="sold">Vendidas</button>
                </div>
                
                <div class="almacen-grid" id="almacen-grid">
                    <div class="empty-almacen">
                        <i class="fas fa-box-open"></i>
                        <p>No hay piezas en el almacén</p>
                        <button class="btn-primary" onclick="window.f1Manager?.iniciarFabricacion('motor')">
                            <i class="fas fa-industry"></i> Fabricar primera pieza
                        </button>
                    </div>
                </div>
                
                <div class="almacen-actions">
                    <button class="btn-secondary" id="btn-equipar-todas">
                        <i class="fas fa-bolt"></i> Equipar todas disponibles
                    </button>
                    <button class="btn-secondary" id="btn-vender-todas">
                        <i class="fas fa-tags"></i> Vender todas no equipadas
                    </button>
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
        if (!container) return;
        
        // Aquí iría la carga real desde Supabase
        // Por ahora mostramos mensaje
        container.innerHTML = `
            <div class="empty-almacen">
                <i class="fas fa-box-open"></i>
                <p>No hay piezas en el almacén</p>
                <p class="empty-subtitle">Fabrica piezas en el taller para verlas aquí</p>
            </div>
        `;
    }
    
    async loadMercadoPiezas() {
        const container = document.getElementById('mercado-grid');
        if (!container) return;
        
        // Aquí iría la carga real desde Supabase
        container.innerHTML = `
            <div class="empty-mercado">
                <i class="fas fa-store-slash"></i>
                <p>No hay piezas en el mercado</p>
                <p class="empty-subtitle">Sé el primero en vender una pieza</p>
            </div>
        `;
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tabManager = new TabManager();
});

console.log('✅ Sistema de pestañas listo para usar');
