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
                    <h2><i class="fas fa-warehouse"></i> ALMACÉN DE PIEZAS</h2>
                    <div class="almacen-stats">
                        <div class="stat-card-almacen">
                            <i class="fas fa-boxes"></i>
                            <div>
                                <span class="stat-label">PIEZAS TOTALES</span>
                                <span class="stat-value" id="total-piezas">0</span>
                            </div>
                        </div>
                        <div class="stat-card-almacen">
                            <i class="fas fa-car"></i>
                            <div>
                                <span class="stat-label">PIEZAS EQUIPADAS</span>
                                <span class="stat-value" id="piezas-equipadas">0</span>
                            </div>
                        </div>
                        <div class="stat-card-almacen">
                            <i class="fas fa-star"></i>
                            <div>
                                <span class="stat-label">PUNTOS TOTALES</span>
                                <span class="stat-value" id="puntos-totales">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="areas-almacen" id="areas-almacen">
                    <!-- Áreas con botones se cargarán aquí -->
                    <div class="cargando-almacen">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando almacén...</p>
                    </div>
                </div>
                
                <div class="almacen-info-panel">
                    <h3><i class="fas fa-info-circle"></i> Cómo usar el almacén</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="hueco-ejemplo vacio"></div>
                            <span>Hueco vacío - Sin pieza</span>
                        </div>
                        <div class="info-item">
                            <div class="hueco-ejemplo fabricada"></div>
                            <span>Pieza fabricada</span>
                        </div>
                        <div class="info-item">
                            <div class="hueco-ejemplo equipada"></div>
                            <span>Pieza equipada</span>
                        </div>
                        <div class="info-item">
                            <div class="hueco-ejemplo puede-equipar"></div>
                            <span>Se puede equipar</span>
                        </div>
                    </div>
                    <p class="info-text">Cada área necesita 5 piezas por nivel. Click en pieza para equipar/desmontar.</p>
                </div>
            </div>
            
            <style>
                .almacen-stats {
                    display: flex;
                    gap: 15px;
                    margin: 15px 0;
                    flex-wrap: wrap;
                }
                
                .stat-card-almacen {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 200px;
                    border: 1px solid rgba(0, 210, 190, 0.2);
                }
                
                .stat-card-almacen i {
                    font-size: 1.5rem;
                    color: #00d2be;
                }
                
                .stat-label {
                    display: block;
                    font-size: 0.8rem;
                    color: #aaa;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    display: block;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: white;
                }
                
                .areas-almacen {
                    margin: 20px 0;
                }
                
                .cargando-almacen {
                    text-align: center;
                    padding: 40px;
                    color: #aaa;
                }
                
                .almacen-info-panel {
                    margin-top: 30px;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    border-left: 4px solid #00d2be;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin: 15px 0;
                }
                
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .hueco-ejemplo {
                    width: 25px;
                    height: 25px;
                    border-radius: 5px;
                    border: 2px solid;
                }
                
                .hueco-ejemplo.vacio {
                    border-color: rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .hueco-ejemplo.fabricada {
                    border-color: rgba(76, 175, 80, 0.6);
                    background: rgba(76, 175, 80, 0.2);
                }
                
                .hueco-ejemplo.equipada {
                    border-color: #4CAF50;
                    background: #4CAF50;
                }
                
                .hueco-ejemplo.puede-equipar {
                    border-color: rgba(255, 193, 7, 0.6);
                    background: rgba(255, 193, 7, 0.2);
                }
                
                .info-text {
                    margin-top: 15px;
                    color: #aaa;
                    font-size: 0.9rem;
                }
            </style>
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
        console.log('📦 Cargando almacén con botones...');
        
        const container = document.getElementById('areas-almacen');
        if (!container || !window.f1Manager?.escuderia?.id) return;
        
        try {
            // 1. Cargar nivel actual de cada área desde coches_stats
            if (window.f1Manager && !window.f1Manager.carStats) {
                await window.f1Manager.cargarCarStats();
            }
            
            // 2. Cargar TODAS las piezas del almacén
            const { data: todasLasPiezas, error } = await supabase
                .from('almacen_piezas')
                .select('id, area, nivel, puntos_base, equipada, fabricada_en')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .order('nivel', { ascending: true })
                .order('fabricada_en', { ascending: true });
            
            if (error) throw error;
            
            // 3. Calcular estadísticas
            const totalPiezas = todasLasPiezas?.length || 0;
            const piezasEquipadas = todasLasPiezas?.filter(p => p.equipada === true).length || 0;
            const puntosTotales = todasLasPiezas?.reduce((sum, p) => sum + (p.puntos_base || 0), 0) || 0;
            
            // Actualizar estadísticas en UI
            document.getElementById('total-piezas').textContent = totalPiezas;
            document.getElementById('piezas-equipadas').textContent = piezasEquipadas;
            document.getElementById('puntos-totales').textContent = puntosTotales;
            
            if (totalPiezas === 0) {
                container.innerHTML = `
                    <div class="almacen-vacio">
                        <i class="fas fa-box-open fa-3x"></i>
                        <h3>No hay piezas fabricadas</h3>
                        <p>Ve al taller para fabricar tu primera pieza</p>
                    </div>
                `;
                return;
            }
            
            // 4. Agrupar piezas por área y nivel
            const piezasPorArea = {};
            todasLasPiezas?.forEach(pieza => {
                if (!piezasPorArea[pieza.area]) {
                    piezasPorArea[pieza.area] = {};
                }
                if (!piezasPorArea[pieza.area][pieza.nivel]) {
                    piezasPorArea[pieza.area][pieza.nivel] = [];
                }
                piezasPorArea[pieza.area][pieza.nivel].push(pieza);
            });
            
            // 5. Definir las 11 áreas (igual que en el taller)
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            let html = '<div class="areas-grid-almacen">';
            
            // 6. Para cada área
            areas.forEach(area => {
                // Obtener nivel actual del coche
                const nivelActual = window.f1Manager.carStats ? 
                    (window.f1Manager.carStats[`${area.id}_nivel`] || 0) : 0;
                
                // Obtener piezas de esta área
                const piezasArea = piezasPorArea[area.id] || {};
                
                // Encontrar qué pieza está equipada (si hay alguna)
                let piezaEquipada = null;
                Object.values(piezasArea).forEach(nivelArray => {
                    nivelArray.forEach(pieza => {
                        if (pieza.equipada === true) {
                            piezaEquipada = pieza;
                        }
                    });
                });
                
                html += `
                    <div class="area-almacen-card">
                        <div class="area-titulo-almacen">
                            <span class="area-icono-almacen">${area.icono}</span>
                            <span class="area-nombre-almacen">${area.nombre}</span>
                            <span class="area-nivel-actual-almacen">Nivel ${nivelActual}</span>
                        </div>
                        
                        <div class="niveles-grupo-almacen">
                `;
                
                // 7. Mostrar niveles del 0 al 5 (puedes cambiar a 20 si quieres)
                const nivelesAMostrar = 5; // Cambia a 20 si quieres mostrar todos
                
                for (let nivel = 0; nivel <= nivelesAMostrar; nivel++) {
                    const piezasNivel = piezasArea[nivel] || [];
                    const piezasFabricadas = piezasNivel.length;
                    const todasFabricadas = piezasFabricadas >= 5;
                    
                    // Verificar si hay una pieza equipada en este nivel
                    const tieneEquipada = piezasNivel.some(p => p.equipada === true);
                    
                    html += `
                        <div class="nivel-container-almacen ${nivel === nivelActual ? 'nivel-actual-almacen' : ''}">
                            <div class="nivel-cabecera-almacen">
                                <span class="nivel-numero-almacen">Nivel ${nivel}</span>
                                <span class="nivel-progreso-almacen">${piezasFabricadas}/5</span>
                            </div>
                            
                            <div class="huecos-container-almacen">
                    `;
                    
                    // 8. Mostrar 5 huecos por nivel
                    for (let hueco = 1; hueco <= 5; hueco++) {
                        const pieza = piezasNivel[hueco - 1];
                        
                        if (pieza) {
                            // Hay pieza en este hueco
                            const esEquipada = pieza.equipada === true;
                            const puedeEquipar = !esEquipada && nivel > nivelActual;
                            
                            html += `
                                <button class="hueco-pieza-almacen ${esEquipada ? 'equipada-almacen' : 'fabricada-almacen'} ${puedeEquipar ? 'puede-equipar-almacen' : ''}"
                                        onclick="window.tabManager.manejarClickPiezaAlmacen('${pieza.id}', ${esEquipada}, ${puedeEquipar})"
                                        title="${area.nombre} - Nivel ${nivel} - Pieza ${hueco}
    ${esEquipada ? '✅ EQUIPADA' : '📦 Almacenada'}
    Puntos: ${pieza.puntos_base || 10}
    Fabricada: ${pieza.fabricada_en ? new Date(pieza.fabricada_en).toLocaleDateString() : 'Fecha desconocida'}">
                                    <div class="hueco-numero-almacen">${hueco}</div>
                                    <div class="hueco-estado-almacen">
                                        ${esEquipada ? '✅' : '✓'}
                                    </div>
                                    ${puedeEquipar ? '<div class="hueco-equipar-almacen">↑</div>' : ''}
                                </button>
                            `;
                        } else {
                            // Hueco vacío
                            html += `
                                <div class="hueco-pieza-almacen vacio-almacen" 
                                     title="${area.nombre} - Nivel ${nivel} - Pieza ${hueco}
    No fabricada aún">
                                    <div class="hueco-numero-almacen">${hueco}</div>
                                    <div class="hueco-estado-almacen">-</div>
                                </div>
                            `;
                        }
                    }
                    
                    html += `
                            </div>
                            
                            ${todasFabricadas && nivel === nivelActual ? `
                            <div class="acciones-nivel-almacen">
                                <button class="btn-subir-nivel-almacen" onclick="window.tabManager.subirNivelDesdeAlmacen('${area.id}')">
                                    <i class="fas fa-level-up-alt"></i> SUBIR A NIVEL ${nivel + 1}
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            // 9. Añadir estilos CSS si no existen
            this.agregarEstilosAlmacen();
            
        } catch (error) {
            console.error('❌ Error cargando almacén con botones:', error);
            container.innerHTML = `
                <div class="error-almacen">
                    <h3>❌ Error cargando el almacén</h3>
                    <p>${error.message}</p>
                    <button onclick="window.tabManager.loadAlmacenPiezas()">Reintentar</button>
                </div>
            `;
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

agregarEstilosAlmacen() {
    if (document.getElementById('estilos-almacen-nuevo')) return;
    
    const style = document.createElement('style');
    style.id = 'estilos-almacen-nuevo';
    style.textContent = `
        .areas-grid-almacen {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .area-almacen-card {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 10px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        
        .area-almacen-card:hover {
            border-color: rgba(0, 210, 190, 0.3);
            transform: translateY(-3px);
        }
        
        .area-titulo-almacen {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .area-icono-almacen {
            font-size: 1.5rem;
        }
        
        .area-nombre-almacen {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1rem;
            color: white;
            font-weight: bold;
            flex: 1;
        }
        
        .area-nivel-actual-almacen {
            background: rgba(0, 210, 190, 0.15);
            color: #00d2be;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        .niveles-grupo-almacen {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .nivel-container-almacen {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .nivel-container-almacen.nivel-actual-almacen {
            border-color: rgba(0, 210, 190, 0.4);
            background: rgba(0, 210, 190, 0.05);
        }
        
        .nivel-cabecera-almacen {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .nivel-numero-almacen {
            font-weight: bold;
            color: #aaa;
            font-size: 0.85rem;
        }
        
        .nivel-progreso-almacen {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .huecos-container-almacen {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 5px;
            margin-bottom: 8px;
        }
        
        .hueco-pieza-almacen {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: 2px solid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
            position: relative;
        }
        
        .hueco-pieza-almacen.vacio-almacen {
            border-color: rgba(255, 255, 255, 0.1);
            color: #666;
            cursor: default;
        }
        
        .hueco-pieza-almacen.fabricada-almacen {
            border-color: rgba(76, 175, 80, 0.4);
            color: #4CAF50;
            background: rgba(76, 175, 80, 0.1);
        }
        
        .hueco-pieza-almacen.fabricada-almacen:hover {
            border-color: rgba(76, 175, 80, 0.8);
            background: rgba(76, 175, 80, 0.2);
            transform: translateY(-2px);
        }
        
        .hueco-pieza-almacen.equipada-almacen {
            border-color: #4CAF50;
            color: #4CAF50;
            background: rgba(76, 175, 80, 0.2);
            animation: pulse-verde-almacen 2s infinite;
        }
        
        @keyframes pulse-verde-almacen {
            0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
            70% { box-shadow: 0 0 0 5px rgba(76, 175, 80, 0); }
            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
        
        .hueco-pieza-almacen.puede-equipar-almacen {
            border-color: rgba(255, 193, 7, 0.6);
            background: rgba(255, 193, 7, 0.1);
        }
        
        .hueco-numero-almacen {
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .hueco-estado-almacen {
            font-size: 0.9rem;
            margin-top: 2px;
        }
        
        .hueco-equipar-almacen {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #FFC107;
            color: black;
            font-size: 0.6rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .acciones-nivel-almacen {
            margin-top: 8px;
        }
        
        .btn-subir-nivel-almacen {
            width: 100%;
            padding: 6px;
            background: linear-gradient(135deg, #4CAF50, #388E3C);
            border: none;
            border-radius: 6px;
            color: white;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.75rem;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            transition: all 0.3s;
        }
        
        .btn-subir-nivel-almacen:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 10px rgba(76, 175, 80, 0.3);
        }
        
        .almacen-vacio {
            text-align: center;
            padding: 40px;
            color: #aaa;
        }
        
        .almacen-vacio i {
            font-size: 3rem;
            margin-bottom: 15px;
            color: #666;
        }
        
        .error-almacen {
            text-align: center;
            padding: 30px;
            color: #ff4444;
        }
    `;
    
    document.head.appendChild(style);
}

// Añade estos métodos al final de la clase TabManager:

async manejarClickPiezaAlmacen(piezaId, esEquipada, puedeEquipar) {
    console.log('Click en pieza almacén:', { piezaId, esEquipada, puedeEquipar });
    
    if (esEquipada) {
        // Desmontar pieza
        if (confirm('¿Desmontar esta pieza del coche?')) {
            await this.desequiparPieza(piezaId);
        }
    } else if (puedeEquipar) {
        // Equipar pieza
        // 1. Primero desmontar cualquier otra pieza equipada de la misma área
        const { data: pieza } = await supabase
            .from('almacen_piezas')
            .select('area')
            .eq('id', piezaId)
            .single();
        
        if (!pieza) {
            window.f1Manager?.showNotification('Pieza no encontrada', 'error');
            return;
        }
        
        // Desmontar todas las piezas equipadas de esta área
        await supabase
            .from('almacen_piezas')
            .update({ equipada: false })
            .eq('escuderia_id', window.f1Manager.escuderia.id)
            .eq('area', pieza.area)
            .eq('equipada', true);
        
        // Equipar esta pieza
        await supabase
            .from('almacen_piezas')
            .update({ equipada: true })
            .eq('id', piezaId);
        
        window.f1Manager?.showNotification('✅ Pieza equipada', 'success');
        
        // Recargar almacén y piezas montadas
        setTimeout(() => {
            this.loadAlmacenPiezas();
            if (window.f1Manager?.cargarPiezasMontadas) {
                window.f1Manager.cargarPiezasMontadas();
            }
        }, 500);
    } else {
        // Pieza almacenada pero no se puede equipar
        alert('Esta pieza no se puede equipar porque su nivel es igual o inferior al actual.\n\nEquipa piezas de nivel superior para mejorar tu coche.');
    }
}

async subirNivelDesdeAlmacen(areaId) {
    console.log('Subiendo nivel desde almacén:', areaId);
    
    if (window.f1Manager && window.f1Manager.subirNivelArea) {
        await window.f1Manager.subirNivelArea(areaId);
        
        // Recargar almacén después de subir nivel
        setTimeout(() => {
            this.loadAlmacenPiezas();
        }, 1000);
    }
}

// Hacer la clase disponible globalmente
window.TabManager = TabManager;

// Inicializar INMEDIATAMENTE (no esperar DOMContentLoaded)
console.log('🔴 [DEBUG] Creando tabManager INMEDIATAMENTE');
window.tabManager = new TabManager();
console.log('🔴 [DEBUG] tabManager creado:', window.tabManager);
console.log('✅ Sistema de pestañas listo para usar');
