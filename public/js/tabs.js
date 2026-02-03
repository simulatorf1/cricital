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
            // ¡¡PESTAÑA TALLER - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'taller') {
                // ... código del taller ...
                return;
            }
            // ======================================================
            // ¡¡PESTAÑA PRONÓSTICOS - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'pronosticos') {
                // 1. SOLO marcar como activa
                tabContent.classList.add('active');
                this.currentTab = tabId;
                
                // 2. LIMPIAR contenido anterior
                tabContent.innerHTML = '<div class="cargando-pronosticos"><i class="fas fa-spinner fa-spin"></i> Cargando pronósticos...</div>';
                
                // 3. Cargar los pronósticos usando la función del pronosticos.js
                setTimeout(async () => {
                    try {
                        console.log('🔮 Verificando pronosticosManager...');
                        console.log('window.pronosticosManager:', window.pronosticosManager);
                        console.log('window.cargarPantallaPronostico:', window.cargarPantallaPronostico);
                        
                        // PRIMERO intentar con el método del manager
                        if (window.pronosticosManager && typeof window.pronosticosManager.cargarPantallaPronostico === 'function') {
                            console.log('🎯 Usando pronosticosManager.cargarPantallaPronostico()');
                            await window.pronosticosManager.cargarPantallaPronostico();
                        }
                        // SEGUNDO intentar con la función global
                        else if (window.cargarPantallaPronostico && typeof window.cargarPantallaPronostico === 'function') {
                            console.log('🎯 Usando window.cargarPantallaPronostico()');
                            await window.cargarPantallaPronostico();
                        }
                        // TERCERO: si nada funciona, intentar crear el manager
                        else if (window.PronosticosManager) {
                            console.log('🔧 Creando nueva instancia de PronosticosManager');
                            window.pronosticosManager = new window.PronosticosManager();
                            await window.pronosticosManager.cargarPantallaPronostico();
                        }
                        else {
                            console.error('❌ Ningún método de pronósticos disponible');
                            throw new Error('Sistema de pronósticos no disponible');
                        }
                        
                        console.log('✅ Pronósticos cargados exitosamente');
                        
                    } catch (error) {
                        console.error('❌ Error cargando pronósticos:', error);
                        tabContent.innerHTML = `
                            <div class="error-message">
                                <h3>❌ Error cargando pronósticos</h3>
                                <p>${error.message || 'Error desconocido'}</p>
                                <p><small>Verifica la consola para más detalles</small></p>
                                <button onclick="location.reload()">Reintentar</button>
                                <button onclick="window.tabManager.switchTab('principal')" style="margin-left: 10px;">
                                    Volver al inicio
                                </button>
                            </div>
                        `;
                    }
                }, 500); // Aumentar tiempo para asegurar carga
                
                // SALIR del método - no hacer nada más para pronósticos
                return;
            }
            // ======================================================
            // ¡¡PESTAÑA MERCADO - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'mercado') {
                // 1. SOLO marcar como activa
                tabContent.classList.add('active');
                this.currentTab = tabId;
                
                // 2. LIMPIAR contenido anterior
                tabContent.innerHTML = '<div class="cargando-mercado"><i class="fas fa-spinner fa-spin"></i> Cargando mercado...</div>';
                
                // 3. Cargar el mercado directamente usando mercadoManager
                setTimeout(async () => {
                    try {
                        if (window.mercadoManager && window.mercadoManager.cargarTabMercado) {
                            console.log('🛒 Ejecutando cargarTabMercado()...');
                            await window.mercadoManager.cargarTabMercado();
                            console.log('✅ Mercado cargado exitosamente');
                        } else {
                            console.error('❌ mercadoManager no disponible');
                            tabContent.innerHTML = `
                                <div class="error-message">
                                    <h3>❌ Error cargando el mercado</h3>
                                    <p>El sistema de mercado no está disponible</p>
                                    <button onclick="location.reload()">Reintentar</button>
                                </div>
                            `;
                        }
                    } catch (error) {
                        console.error('❌ Error cargando mercado:', error);
                        tabContent.innerHTML = `
                            <div class="error-message">
                                <h3>❌ Error cargando el mercado</h3>
                                <p>${error.message || 'Error desconocido'}</p>
                                <button onclick="location.reload()">Reintentar</button>
                            </div>
                        `;
                    }
                }, 300);
                
                // SALIR del método - no hacer nada más para el mercado
                return;
            }
            // ======================================================
            // ¡¡PESTAÑA PRESUPUESTO - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'presupuesto') {
                // 1. SOLO marcar como activa
                tabContent.classList.add('active');
                this.currentTab = tabId;
                
                // 2. LIMPIAR contenido anterior
                tabContent.innerHTML = '<div class="cargando-presupuesto"><i class="fas fa-spinner fa-spin"></i> Cargando presupuesto...</div>';
                
                // 3. Cargar el presupuesto directamente usando presupuestoManager
                setTimeout(async () => {
                    try {
                        if (window.presupuestoManager && window.presupuestoManager.inicializar) {
                            console.log('💰 Ejecutando inicializar presupuesto...');
                            
                            // Obtener la escudería del f1Manager
                            const escuderia = window.f1Manager?.escuderia;
                            if (!escuderia) {
                                throw new Error('No se encontró la escudería');
                            }
                            
                            // Inicializar el presupuesto manager
                            await window.presupuestoManager.inicializar(escuderia);
                            
                            // Generar HTML del presupuesto
                            const html = window.presupuestoManager.generarHTMLPresupuesto();
                            tabContent.innerHTML = html;
                            
                            console.log('✅ Presupuesto cargado exitosamente');
                        } else {
                            console.error('❌ presupuestoManager no disponible');
                            tabContent.innerHTML = `
                                <div class="error-message">
                                    <h3>❌ Error cargando el presupuesto</h3>
                                    <p>El sistema de presupuesto no está disponible</p>
                                    <button onclick="location.reload()">Reintentar</button>
                                </div>
                            `;
                        }
                    } catch (error) {
                        console.error('❌ Error cargando presupuesto:', error);
                        tabContent.innerHTML = `
                            <div class="error-message">
                                <h3>❌ Error cargando el presupuesto</h3>
                                <p>${error.message || 'Error desconocido'}</p>
                                <button onclick="location.reload()">Reintentar</button>
                            </div>
                        `;
                    }
                }, 300);
                
                // SALIR del método - no hacer nada más para el presupuesto
                return;
            }            
            
            // ======================================================
            // Para TODAS LAS OTRAS pestañas (principal, almacen, etc.)
            // ======================================================   

            // ======================================================
            // ¡¡PESTAÑA CLASIFICACIÓN - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'clasificacion') {
                // 1. SOLO marcar como activa
                tabContent.classList.add('active');
                this.currentTab = tabId;
                
                // 2. LIMPIAR contenido anterior
                tabContent.innerHTML = '<div class="cargando-clasificacion"><i class="fas fa-spinner fa-spin"></i> Cargando clasificación...</div>';
                
                // 3. Cargar la clasificación desde la base de datos
                setTimeout(async () => {
                    try {
                        console.log('🏆 Cargando clasificación desde base de datos...');
                        
                        // Cargar datos y configurar eventos
                        await this.loadClasificacionData();
                        this.setupClasificacionEvents();
                        
                        console.log('✅ Clasificación cargada exitosamente');
                        
                    } catch (error) {
                        console.error('❌ Error cargando clasificación:', error);
                        tabContent.innerHTML = `
                            <div class="error-message">
                                <h3>❌ Error cargando clasificación</h3>
                                <p>${error.message || 'Error desconocido'}</p>
                                <button onclick="location.reload()">Reintentar</button>
                            </div>
                        `;
                    }
                }, 300);
                
                // SALIR del método - no hacer nada más para clasificación
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
        const tabs = ['principal', 'taller', 'almacen', 'mercado', 'presupuesto', 'clasificacion', 'pronosticos'];
        
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
            case 'pronosticos': 
                return this.getPronosticosContent();                
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
            <div class="almacen-botones-container">
                <div class="areas-grid-botones" id="areas-grid-botones">
                    <div class="cargando-almacen">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando piezas...</p>
                    </div>
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
                    <p class="clasificacion-subtitle">Ranking de todas las escuderías por dinero</p>
                </div>
                
                <div class="clasificacion-info-bar">
                    <div class="info-item">
                        <i class="fas fa-coins" style="color: #FFD700;"></i>
                        <div>
                            <span class="info-label">Tu dinero actual</span>
                            <span class="info-value" id="mi-dinero-actual">Cargando...</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-trophy" style="color: #FF9800;"></i>
                        <div>
                            <span class="info-label">Tu posición</span>
                            <span class="info-value" id="mi-posicion-actual">Cargando...</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users" style="color: #2196F3;"></i>
                        <div>
                            <span class="info-label">Total escuderías</span>
                            <span class="info-value" id="total-escuderias">Cargando...</span>
                        </div>
                    </div>
                </div>
                
                <div class="tabla-controls">
                    <div class="ordenamiento-buttons">
                        <button class="btn-ordenar" data-col="dinero" data-order="desc">
                            <i class="fas fa-sort-amount-down-alt"></i> Más dinero
                        </button>
                        <button class="btn-ordenar" data-col="dinero" data-order="asc">
                            <i class="fas fa-sort-amount-up"></i> Menos dinero
                        </button>
                        <button class="btn-ordenar" data-col="nombre" data-order="asc">
                            <i class="fas fa-sort-alpha-down"></i> Nombre A-Z
                        </button>
                    </div>
                    <div class="search-box">
                        <input type="text" id="buscar-escuderia" placeholder="Buscar escudería..." class="search-input">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                
                <div class="tabla-contenedor-scroll">
                    <table class="tabla-clasificacion-simple">
                        <thead>
                            <tr>
                                <th class="col-posicion">#</th>
                                <th class="col-nombre" data-sort="nombre">
                                    <span>Escudería</span>
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="col-dinero active-sort" data-sort="dinero" data-order="desc">
                                    <span>Dinero (€)</span>
                                    <i class="fas fa-sort-down sort-icon"></i>
                                </th>
                            </tr>
                        </thead>
                        <tbody id="tabla-clasificacion-body">
                            <tr class="loading-row">
                                <td colspan="3" style="text-align: center; padding: 40px;">
                                    <div class="cargando-clasificacion">
                                        <i class="fas fa-spinner fa-spin fa-2x"></i>
                                        <p>Cargando clasificación...</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="tabla-footer">
                    <div class="pagination-info">
                        Mostrando <span id="filas-mostradas">0</span> de <span id="total-filas">0</span> escuderías
                    </div>
                    <div class="last-update">
                        <i class="fas fa-sync-alt"></i>
                        <span id="ultima-actualizacion">Actualizado hace unos segundos</span>
                    </div>
                </div>
                
                <div class="actualizar-buttons">
                    <button class="btn-actualizar" id="btn-actualizar-clasificacion">
                        <i class="fas fa-sync-alt"></i> Actualizar clasificación
                    </button>
                </div>
            </div>
        `;
    }    
    
    
    // ===== NUEVO MÉTODO PARA CARGAR CLASIFICACIÓN =====
    async loadClasificacionData(columnaOrden = 'dinero', orden = 'desc') {
        console.log('📊 Cargando datos de clasificación...');
        
        const tablaBody = document.getElementById('tabla-clasificacion-body');
        if (!tablaBody) return;
        
        try {
            // Mostrar estado de carga
            tablaBody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="3" style="text-align: center; padding: 30px;">
                        <div class="cargando-clasificacion">
                            <i class="fas fa-spinner fa-spin fa-lg"></i>
                            <p>Consultando base de datos...</p>
                        </div>
                    </td>
                </tr>
            `;
            
            // Obtener datos de todas las escuderías desde Supabase
            const { data: escuderias, error } = await supabase
                .from('ESCUDERIAS')
                .select('id, nombre, dinero, puntos')
                .order(columnaOrden, { ascending: orden === 'asc' });
            
            if (error) {
                throw error;
            }
            
            if (!escuderias || escuderias.length === 0) {
                tablaBody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 40px; color: #888;">
                            <i class="fas fa-database fa-2x"></i>
                            <p style="margin-top: 10px;">No hay escuderías registradas</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Actualizar contadores
            document.getElementById('total-escuderias').textContent = escuderias.length;
            document.getElementById('total-filas').textContent = escuderias.length;
            document.getElementById('filas-mostradas').textContent = escuderias.length;
            
            // Encontrar mi posición y datos
            const miEscuderiaId = window.f1Manager?.escuderia?.id;
            let miPosicion = 0;
            let miDinero = 0;
            
            // Generar filas de la tabla
            let html = '';
            
            escuderias.forEach((escuderia, index) => {
                const esMiEscuderia = escuderia.id === miEscuderiaId;
                const posicion = index + 1;
                
                if (esMiEscuderia) {
                    miPosicion = posicion;
                    miDinero = escuderia.dinero;
                }
                
                // Formatear dinero con separadores de miles
                const dineroFormateado = new Intl.NumberFormat('es-ES', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(escuderia.dinero || 0);
                
                // Clases CSS
                const claseFila = esMiEscuderia ? 'mi-escuderia' : '';
                const clasePosicion = posicion <= 3 ? `top-${posicion}` : '';
                
                html += `
                    <tr class="${claseFila}">
                        <td class="celda-posicion ${clasePosicion}">
                            <span class="numero-posicion">${posicion}</span>
                        </td>
                        <td class="celda-nombre">
                            ${esMiEscuderia ? '<i class="fas fa-user" style="color: #4CAF50; margin-right: 8px;"></i>' : ''}
                            ${escuderia.nombre || 'Sin nombre'}
                        </td>
                        <td class="celda-dinero">
                            <span class="valor-dinero">€${dineroFormateado}</span>
                        </td>
                    </tr>
                `;
            });
            
            tablaBody.innerHTML = html;
            
            // Actualizar mi información
            document.getElementById('mi-dinero-actual').textContent = `€${new Intl.NumberFormat('es-ES').format(miDinero)}`;
            document.getElementById('mi-posicion-actual').textContent = `#${miPosicion}`;
            
            // Actualizar timestamp
            const ahora = new Date();
            document.getElementById('ultima-actualizacion').textContent = 
                `Actualizado a las ${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
            
            console.log('✅ Clasificación cargada correctamente');
            
        } catch (error) {
            console.error('❌ Error cargando clasificación:', error);
            tablaBody.innerHTML = `
                <tr class="error-row">
                    <td colspan="3" style="text-align: center; padding: 40px; color: #f44336;">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <p style="margin-top: 10px;">Error al cargar la clasificación</p>
                        <p style="font-size: 0.9em; margin-top: 5px;">${error.message || 'Intenta de nuevo más tarde'}</p>
                        <button onclick="window.tabManager.loadClasificacionData()" 
                                style="margin-top: 15px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Reintentar
                        </button>
                    </td>
                </tr>
            `;
        }
    }
    
    // ===== NUEVO MÉTODO PARA CONFIGURAR EVENTOS DE CLASIFICACIÓN =====
    setupClasificacionEvents() {
        console.log('🔧 Configurando eventos de clasificación...');
        
        // Botón actualizar
        document.getElementById('btn-actualizar-clasificacion')?.addEventListener('click', () => {
            this.loadClasificacionData();
        });
        
        // Botones de ordenamiento
        document.querySelectorAll('.btn-ordenar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const columna = e.currentTarget.dataset.col;
                const orden = e.currentTarget.dataset.order;
                this.loadClasificacionData(columna, orden);
                
                // Actualizar estado activo
                document.querySelectorAll('.btn-ordenar').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Ordenar al hacer clic en encabezados de tabla
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const columna = th.dataset.sort;
                const ordenActual = th.dataset.order || 'desc';
                const nuevoOrden = ordenActual === 'desc' ? 'asc' : 'desc';
                
                // Actualizar iconos
                document.querySelectorAll('.sort-icon').forEach(icon => {
                    icon.className = 'fas fa-sort sort-icon';
                });
                
                const icono = th.querySelector('.sort-icon');
                if (icono) {
                    icono.className = `fas fa-sort-${nuevoOrden === 'desc' ? 'down' : 'up'} sort-icon`;
                }
                
                // Actualizar atributos
                document.querySelectorAll('th[data-sort]').forEach(h => {
                    h.classList.remove('active-sort');
                });
                th.classList.add('active-sort');
                th.dataset.order = nuevoOrden;
                
                // Cargar datos con nuevo orden
                this.loadClasificacionData(columna, nuevoOrden);
            });
        });
        
        // Buscador
        const buscador = document.getElementById('buscar-escuderia');
        if (buscador) {
            buscador.addEventListener('input', (e) => {
                const termino = e.target.value.toLowerCase();
                const filas = document.querySelectorAll('#tabla-clasificacion-body tr');
                
                let filasVisibles = 0;
                filas.forEach(fila => {
                    if (fila.classList.contains('loading-row') || fila.classList.contains('error-row')) {
                        return;
                    }
                    
                    const nombre = fila.querySelector('.celda-nombre').textContent.toLowerCase();
                    const esVisible = nombre.includes(termino);
                    fila.style.display = esVisible ? '' : 'none';
                    if (esVisible) filasVisibles++;
                });
                
                document.getElementById('filas-mostradas').textContent = filasVisibles;
            });
        }
    }
    
    // ===== ACTUALIZAR EL MÉTODO setupTabEvents =====
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
            case 'clasificacion':  // ← AÑADIDO
                this.setupClasificacionEvents();
                // Cargar datos cuando se abra la pestaña
                setTimeout(() => {
                    this.loadClasificacionData();
                }, 100);
                break;
        }
    }

    
    getPronosticosContent() {
        return `
            <div class="pronosticos-container" id="pronosticos-container">
                <div class="cargando-pronosticos">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando sistema de pronósticos...</p>
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
        
        // Botón vender todas (deshabilitado)
        document.querySelector('.btn-vender-todas')?.addEventListener('click', () => {
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('Función de venta en desarrollo', 'info');
            }
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
        console.log('🔧 Cargando almacén...');
        const container = document.getElementById('areas-grid-botones');
        if (!container || !window.f1Manager?.escuderia?.id) {
            console.error('❌ No hay contenedor o escudería');
            return;
        }
    
        try {
            const { data: todasLasPiezas, error } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .order('nivel', { ascending: false })
                .order('fabricada_en', { ascending: false });
    
            if (error) throw error;
    
            if (!todasLasPiezas || todasLasPiezas.length === 0) {
                container.innerHTML = `
                    <div class="almacen-vacio">
                        <i class="fas fa-box-open fa-3x"></i>
                        <h3>No hay piezas fabricadas</h3>
                        <p>Ve al taller para fabricar tu primera pieza</p>
                        <button class="btn-ir-taller" onclick="window.tabManager.switchTab('taller')">
                            <i class="fas fa-tools"></i> IR AL TALLER
                        </button>
                    </div>
                `;
                return;
            }
    
            const piezasPorArea = {};
            todasLasPiezas.forEach(pieza => {
                if (!piezasPorArea[pieza.area]) {
                    piezasPorArea[pieza.area] = [];
                }
                piezasPorArea[pieza.area].push(pieza);
            });
    
            const areasConocidas = window.CAR_AREAS || [
                { id: 'motor', name: 'Motor', color: '#FF1E00', icon: 'fas fa-cogs' },
                { id: 'chasis', name: 'Chasis', color: '#00D2BE', icon: 'fas fa-car' },
                { id: 'suelo', name: 'Suelo', color: '#FF8700', icon: 'fas fa-road' }
            ];
    
            let html = '';
            
            areasConocidas.forEach(areaConfig => {
                const piezasArea = piezasPorArea[areaConfig.name] || 
                                  piezasPorArea[areaConfig.id] || 
                                  [];
                
                if (piezasArea.length > 0) {
                    const piezaEquipada = piezasArea.find(p => p.equipada);
                    
                    html += `
                        <div class="fila-area-almacen">
                            <div class="area-header-almacen" style="border-left-color: ${areaConfig.color}">
                                <div class="area-icono-almacen" style="background: ${areaConfig.color}15">
                                    <i class="${areaConfig.icon}" style="color: ${areaConfig.color}"></i>
                                </div>
                                <div class="area-titulo-almacen">
                                    <h3>${areaConfig.name}</h3>                                
                                </div>
                            </div>
                            
                            <div class="piezas-fila-almacen" style="display:flex;flex-direction:row;flex-wrap:nowrap;gap:8px;padding:10px;overflow-x:auto;min-height:95px;">`;
                    
                    piezasArea.forEach(pieza => {
                        const esEquipada = piezaEquipada && piezaEquipada.id === pieza.id;
                        const puntos = pieza.puntos_base || 10;
                        const nivel = pieza.nivel || 1;
                        
                        const nombreComponente = pieza.componente || pieza.area;
                        
                        // CONTENEDOR para pieza + botón vender
                        html += `<div style="display:flex;flex-direction:column;align-items:center;gap:5px;margin-right:8px;position:relative;">`;
                        
                        // BOTÓN PRINCIPAL DE LA PIEZA
                        html += `<button class="pieza-boton-almacen ${esEquipada ? 'equipada' : ''}" 
                                onclick="window.tabManager.equiparPieza('${pieza.id}')"
                                data-color="${areaConfig.color}"
                                style="flex-shrink:0;min-width:75px;max-width:75px;height:85px;padding:8px;border:2px solid ${areaConfig.color};border-radius:10px;background:linear-gradient(145deg, rgba(20,20,30,0.95), rgba(10,10,20,0.95));color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;${esEquipada ? 'box-shadow:0 0 15px ' + areaConfig.color + ', 0 0 30px ' + areaConfig.color + '80;' : 'box-shadow:0 4px 12px rgba(0,0,0,0.4);'};position:relative;"
                                title="${nombreComponente}">
                            
                            <!-- SOLO EL NOMBRE DEL COMPONENTE -->
                            <div style="font-size: 0.7rem; color: white; text-align: center; line-height: 1.1; max-height: 70px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                ${nombreComponente}
                            </div>
                            
                            <!-- TICK DE EQUIPADO -->
                            ${esEquipada ? 
                                '<div style="position: absolute; top: -5px; right: -5px; background: #FFD700; color: black; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; z-index: 10;">✓</div>' : 
                                ''
                            }
                        </button>`;
                        
                        // BOTÓN VENDER (NUEVO - solo si no está equipada)
                        if (!esEquipada && !pieza.en_venta) {
                            html += `<button class="btn-vender-pieza" 
                                    onclick="venderPiezaDesdeAlmacen('${pieza.id}')"
                                    style="
                                        background: linear-gradient(135deg, #FF9800, #F57C00);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 0.65rem;
                                        cursor: pointer;
                                        font-weight: bold;
                                        width: 75px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 3px;
                                    ">
                                <i class="fas fa-tag" style="font-size: 0.6rem;"></i>
                                VENDER
                            </button>`;
                        } else if (pieza.en_venta) {
                            html += `<div style="
                                        background: linear-gradient(135deg, #4CAF50, #2E7D32);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        font-size: 0.65rem;
                                        font-weight: bold;
                                        width: 75px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 3px;
                                    ">
                                <i class="fas fa-store" style="font-size: 0.6rem;"></i>
                                EN VENTA
                            </div>`;
                        } else {
                            html += `<div style="height:24px;width:75px;"></div>`;
                        }
                        
                        html += `</div>`;

                    });
                    
                    html += `</div></div>`;
                }
            });
    
            container.innerHTML = html;
            console.log('✅ Almacén cargado');
    
        } catch (error) {
            console.error('❌ Error:', error);
            container.innerHTML = `
                <div class="error-almacen">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error cargando el almacén</h3>
                    <button onclick="window.tabManager.loadAlmacenPiezas()">Reintentar</button>
                </div>
            `;
        }
    }
    // Método para ajustar color con opacidad
    ajustarColor(colorHex, opacidad = 0.7) {
        if (!colorHex || !colorHex.startsWith('#')) {
            return `rgba(100, 100, 100, ${opacidad})`;
        }
        
        try {
            const r = parseInt(colorHex.slice(1, 3), 16);
            const g = parseInt(colorHex.slice(3, 5), 16);
            const b = parseInt(colorHex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
        } catch (e) {
            return `rgba(100, 100, 100, ${opacidad})`;
        }
    }
    
    setupAlmacenBotonesEvents() {
        // Delegación de eventos para todos los botones de piezas
        document.getElementById('areas-grid')?.addEventListener('click', (e) => {
            const boton = e.target.closest('.pieza-boton.disponible, .pieza-boton.equipada');
            if (!boton) return;
            
            const piezaId = boton.dataset.piezaId;
            if (!piezaId) return; // Es un botón vacío
            
            if (boton.classList.contains('equipada')) {
                this.desequiparPieza(piezaId);
            } else {
                this.equiparPieza(piezaId);
            }
        });
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
    

    
    // ===== FUNCIONES PARA MANEJAR PIEZAS =====
    // ... el resto de tu código sigue aquí ... 
    
    
    
    // ===== FUNCIONES PARA MANEJAR PIEZAS =====
    
    async equiparPieza(piezaId) {
        console.log(`🔧 Equipando pieza: ${piezaId}`);
        
        try {
            // 1. OBTENER PIEZA NUEVA
            const { data: piezaNueva, error: fetchError } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('id', piezaId)
                .single();
            
            if (fetchError) throw fetchError;
            if (!piezaNueva) throw new Error('Pieza no encontrada');
            
            console.log('📦 Pieza a equipar:', piezaNueva.area, 'Nivel', piezaNueva.nivel);
            
            // 2. BUSCAR PIEZA EQUIPADA ACTUAL EN LA MISMA ÁREA
            const { data: piezaEquipadaActual, error: fetchEquipadaError } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .eq('area', piezaNueva.area)
                .eq('equipada', true)
                .maybeSingle();
            
            if (fetchEquipadaError) throw fetchEquipadaError;
            
            // 3. SI HAY PIEZA EQUIPADA, DESEQUIPARLA PRIMERO
            if (piezaEquipadaActual) {
                console.log('🔄 Desequipando pieza anterior:', piezaEquipadaActual.id);
                
                // DESEQUIPAR LA ANTERIOR - SOLO CAMBIAR equipada a false
                const { error: desequiparError } = await supabase
                    .from('almacen_piezas')
                    .update({ 
                        equipada: false  // ← COLUMNA QUE SÍ EXISTE
                    })
                    .eq('id', piezaEquipadaActual.id);
                
                if (desequiparError) throw desequiparError;
                
                // RESTAR PUNTOS DE LA PIEZA ANTERIOR
                await this.restarPuntosDelCoche(piezaEquipadaActual.area, piezaEquipadaActual.puntos_base || 10);
                
                // RESTAR PUNTOS DE LA ESCUDERÍA
                const puntosRestar = piezaEquipadaActual.puntos_base || 10;
                const puntosDespuesRestar = Math.max(0, (window.f1Manager?.escuderia?.puntos || 0) - puntosRestar);
                
                await supabase
                    .from('escuderias')
                    .update({ puntos: puntosDespuesRestar })
                    .eq('id', window.f1Manager?.escuderia?.id);
                
                if (window.f1Manager?.escuderia) {
                    window.f1Manager.escuderia.puntos = puntosDespuesRestar;
                }
                
                console.log('✅ Pieza anterior desequipada y puntos restados');
            }
            
            // 4. EQUIPAR LA NUEVA PIEZA
            console.log('🎯 Equipando nueva pieza...');
            const { error: equiparError } = await supabase
                .from('almacen_piezas')
                .update({ 
                    equipada: true  // ← COLUMNA QUE SÍ EXISTE
                })
                .eq('id', piezaId);
            
            if (equiparError) throw equiparError;
            
            // SUMAR PUNTOS DE LA NUEVA PIEZA
            await this.sumarPuntosAlCoche(piezaNueva.area, piezaNueva.puntos_base || 10);
            
            // SUMAR PUNTOS A LA ESCUDERÍA
            const puntosSumar = piezaNueva.puntos_base || 10;
            const nuevosPuntosTotales = (window.f1Manager?.escuderia?.puntos || 0) + puntosSumar;
            
            await supabase
                .from('escuderias')
                .update({ puntos: nuevosPuntosTotales })
                .eq('id', window.f1Manager?.escuderia?.id);
            
            if (window.f1Manager?.escuderia) {
                window.f1Manager.escuderia.puntos = nuevosPuntosTotales;
            }
            
            console.log('✅ Nueva pieza equipada y puntos sumados');
            
            // 5. ACTUALIZAR UI
            const puntosElement = document.getElementById('points-value');
            if (puntosElement) {
                puntosElement.textContent = nuevosPuntosTotales;
            }
            
            // 6. RECARGAR ALMACÉN
            setTimeout(() => {
                this.loadAlmacenPiezas();
            }, 300);
            
            // 7. ACTUALIZAR COCHE
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
                const mensaje = piezaEquipadaActual ? 
                    `🔄 ${piezaNueva.area} actualizada (+${puntosSumar} pts)` :
                    `✅ ${piezaNueva.area} equipada (+${puntosSumar} pts)`;
                window.f1Manager.showNotification(mensaje, 'success');
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
    async loadMercadoPiezas() {
        console.log('🛒 Cargando mercado...');
        const container = document.getElementById('mercado-grid');
        if (!container) return;
        
        try {
            const { data: piezasMercado, error } = await supabase
                .from('mercado_piezas')
                .select('*')
                .eq('vendida', false)
                .order('fecha_publicacion', { ascending: false });
                
            if (error) throw error;
            
            if (!piezasMercado || piezasMercado.length === 0) {
                container.innerHTML = `
                    <div class="empty-mercado">
                        <i class="fas fa-store-slash fa-3x"></i>
                        <h3>No hay piezas en el mercado</h3>
                        <p>Sé el primero en vender una pieza en tu almacén</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            
            piezasMercado.forEach(pieza => {
                const esMia = pieza.escuderia_id === window.f1Manager?.escuderia?.id;
                
                html += `
                    <div class="mercado-item ${esMia ? 'mi-pieza' : ''}">
                        <div class="mercado-item-header">
                            <h4>${pieza.area}</h4>
                            <span class="mercado-nivel">Nivel ${pieza.nivel}</span>
                        </div>
                        
                        <div class="mercado-item-info">
                            <div class="info-row">
                                <span><i class="fas fa-star"></i> Puntos:</span>
                                <strong>${pieza.puntos_base}</strong>
                            </div>
                            <div class="info-row">
                                <span><i class="fas fa-medal"></i> Calidad:</span>
                                <span>${pieza.calidad}</span>
                            </div>
                            <div class="info-row">
                                <span><i class="fas fa-store"></i> Vendedor:</span>
                                <span>${pieza.escuderia_nombre}</span>
                            </div>
                        </div>
                        
                        <div class="mercado-item-precio">
                            <div class="precio-label">PRECIO</div>
                            <div class="precio-valor">€${pieza.precio.toLocaleString()}</div>
                        </div>
                        
                        <div class="mercado-item-acciones">
                            ${esMia ? 
                                `<button class="btn-cancelar-venta" onclick="window.tabManager.cancelarVenta('${pieza.id}')">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>` :
                                `<button class="btn-comprar" onclick="window.tabManager.comprarPieza('${pieza.id}')"
                                         ${!window.f1Manager?.escuderia || window.f1Manager.escuderia.dinero < pieza.precio ? 'disabled' : ''}>
                                    <i class="fas fa-shopping-cart"></i> COMPRAR
                                </button>`
                            }
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error cargando mercado:', error);
            container.innerHTML = `
                <div class="error-mercado">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error cargando el mercado</h3>
                    <button onclick="window.tabManager.loadMercadoPiezas()">Reintentar</button>
                </div>
            `;
        }
    }    
    async venderPiezaDesdeAlmacen(piezaId) {
        console.log('💰 Vender pieza:', piezaId);
        
        if (!window.f1Manager?.escuderia) {
            alert('❌ No tienes escudería');
            return;
        }
        
        try {
            // 1. Obtener pieza
            const { data: pieza, error: fetchError } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('id', piezaId)
                .single();
                
            if (fetchError) throw fetchError;
            
            if (pieza.equipada) {
                alert('❌ No puedes vender una pieza equipada. Deséquipala primero.');
                return;
            }
            
            if (pieza.en_venta) {
                alert('ℹ️ Esta pieza ya está en venta.');
                return;
            }
            
            // 2. Pedir precio
            const costoBase = 10000;
            const precioMinimo = Math.round(costoBase * 0.8);
            const precioSugerido = Math.round(costoBase * 1.5);
            
            const precioInput = prompt(
                `💸 VENDER: ${pieza.area} (Nivel ${pieza.nivel})\n\n` +
                `Precio sugerido: €${precioSugerido.toLocaleString()}\n` +
                `Mínimo aceptado: €${precioMinimo.toLocaleString()}\n\n` +
                `Introduce el precio de venta (€):`,
                precioSugerido
            );
            
            if (!precioInput) return;
            
            const precio = parseInt(precioInput);
            if (isNaN(precio) || precio < precioMinimo) {
                alert(`❌ Precio inválido. Mínimo: €${precioMinimo.toLocaleString()}`);
                return;
            }
            
            // 3. Poner en mercado
            const { error: mercadoError } = await supabase
                .from('mercado_piezas')
                .insert([{
                    escuderia_id: window.f1Manager.escuderia.id,
                    escuderia_nombre: window.f1Manager.escuderia.nombre,
                    pieza_id: piezaId,
                    area: pieza.area,
                    nivel: pieza.nivel,
                    calidad: pieza.calidad || 'Normal',
                    puntos_base: pieza.puntos_base || 10,
                    precio: precio,
                    fecha_publicacion: new Date().toISOString(),
                    vendida: false
                }]);
                
            if (mercadoError) throw mercadoError;
            
            // 4. Marcar como en venta en almacén
            const { error: updateError } = await supabase
                .from('almacen_piezas')
                .update({
                    en_venta: true,
                    precio_venta: precio
                })
                .eq('id', piezaId);
                
            if (updateError) throw updateError;
            
            // 5. Actualizar UI
            this.loadAlmacenPiezas();
            
            // 6. Notificar
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification(`✅ Pieza puesta en venta por €${precio.toLocaleString()}`, 'success');
            }
            
            // 7. Recargar mercado si está activo
            if (this.currentTab === 'mercado') {
                this.loadMercadoPiezas();
            }
            
        } catch (error) {
            console.error('❌ Error vendiendo pieza:', error);
            alert('❌ Error al vender la pieza: ' + error.message);
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

    // === NUEVO MÉTODO (AÑADIR AQUÍ) ===
    async equiparODesequiparPieza(piezaId, actualmenteEquipada) {
        console.log(`🔧 ${actualmenteEquipada ? 'Desequipando' : 'Equipando'} pieza:`, piezaId);
        
        if (actualmenteEquipada) {
            await this.desequiparPieza(piezaId);
        } else {
            await this.equiparPieza(piezaId);
        }
        
        // Recargar después de 500ms
        setTimeout(() => {
            this.loadAlmacenPiezas();
        }, 500);
    }
}  // <-- Esto es el CIERRE de la clase



// Inicializar INMEDIATAMENTE (no esperar DOMContentLoaded)
console.log('🔴 [DEBUG] Creando tabManager INMEDIATAMENTE');
window.tabManager = new TabManager();
console.log('🔴 [DEBUG] tabManager creado:', window.tabManager);
console.log('✅ Sistema de pestañas listo para usar');
