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
                            
                            // PASAR SOLO EL ID, NO EL OBJETO
                            const escuderiaId = escuderia.id;
                            if (!escuderiaId) {
                                throw new Error('La escudería no tiene ID');
                            }
                            
                            console.log('🔑 Pasando ID a presupuestoManager:', escuderiaId);
                            
                            // Inicializar el presupuesto manager CON EL ID
                            await window.presupuestoManager.inicializar(escuderiaId);
                            // ¡¡ESTA LÍNEA FALTA Y ES CRÍTICA!!
                            window.presupuestoManager.escuderia = escuderia;                            
                            
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
            // ¡¡PESTAÑA CLASIFICACIÓN - NUEVO COMPORTAMIENTO!!
            // ======================================================
            if (tabId === 'clasificacion') {
                console.log("🎯 Iniciando carga de clasificación");
                
                // 1. SOLO marcar como activa
                tabContent.classList.add('active');
                this.currentTab = tabId;
                
                // 2. USAR EL HTML COMPLETO (¡ESTA ES LA CLAVE!)
                tabContent.innerHTML = this.getClasificacionContent();
                
                // 3. Pequeña pausa para que el DOM se renderice
                setTimeout(async () => {
                    try {
                        console.log('🏆 Cargando datos de clasificación...');
                        
                        // Cargar datos
                        await this.loadClasificacionData();
                        
                        // Configurar eventos
                        this.setupClasificacionEvents();
                        
                        console.log('✅ Clasificación cargada exitosamente');
                        
                    } catch (error) {
                        console.error('❌ Error cargando clasificación:', error);
                    }
                }, 100);
                
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
        }  // <--- Cierra el if (tabContent)
    }  // <--- Cierre del método switchTab
    
    loadTabContents() {
        // Precargar contenido de todas las pestañas
        const tabs = ['principal', 'taller', 'almacen', 'mercado', 'presupuesto', 'clasificacion', 'pronosticos', 'ingenieria'];
        
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
            case 'ingenieria': // AÑADIR ESTE CASO
                return this.getIngenieriaContent();                
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

    getIngenieriaContent() {
        return `
            <div class="tab-cargando">
                <div class="spinner-ingenieria">
                    <i class="fas fa-flask fa-spin"></i>
                </div>
                <p>Cargando pruebas en pista...</p>
                <p class="subtexto">Preparando simulación de ingeniería</p>
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
                    <h2><i class="fas fa-medal"></i> Clasificación</h2>
                    <p class="clasificacion-subtitle">Ranking global y resultados por Gran Premio</p>
                </div>
                
                <!-- 🏁 SECCIÓN GRAN PREMIO ACTUAL (NUEVA) -->
                <div class="gp-actual-container" style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, rgba(0,210,190,0.15), rgba(0,0,0,0.3)); border-radius: 12px; border-left: 4px solid #00d2be;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div class="gp-selector-wrapper" style="display: flex; gap: 10px; align-items: center;">
                            <select id="selector-gp-historico" style="width: 250px; padding: 8px 12px; background: #1a1a1a; color: white; border: 1px solid #444; border-radius: 6px;">
                                <option value="">📅 Ver otro Gran Premio...</option>
                            </select>
                            <button id="btn-cargar-gp-seleccionado" class="btn-primary" style="padding: 8px 16px; background: #333; color: white; border: 1px solid #00d2be; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-search"></i> Ver
                            </button>
                        </div>
                    </div>
                    
                    <!-- CONTENEDOR ÚNICO PARA EL GP SELECCIONADO/ACTUAL -->
                    <div id="contenedor-gp-actual" style="min-height: 200px;">
                        <div class="cargando-gp" style="text-align: center; padding: 30px;">
                            <i class="fas fa-spinner fa-spin fa-2x" style="color: #00d2be;"></i>
                            <p style="margin-top: 10px; color: #888;">Cargando información del Gran Premio...</p>
                        </div>
                    </div>
                </div>
                
                <!-- 📊 CLASIFICACIONES GLOBALES (SOLO 2) -->
                <div class="clasificacion-global-container">
                    <div class="clasificacion-selector" style="margin-bottom: 20px;">
                        <div class="selector-buttons" style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="btn-selector-tipo active" data-tipo="dinero" style="padding: 10px 20px; background: #00d2be; color: black; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-coins"></i> Por Dinero
                            </button>
                            <button class="btn-selector-tipo" data-tipo="carreras" style="padding: 10px 20px; background: #1a1a1a; color: white; border: 1px solid #444; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-flag-checkered"></i> Por Carreras Disputadas
                            </button>
                        </div>
                    </div>
                    
                    <!-- CONTROLES DE BÚSQUEDA Y ORDEN (se mantienen) -->
                    <div class="tabla-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <div class="ordenamiento-buttons" style="display: flex; gap: 8px;">
                            <button class="btn-ordenar active" data-order="desc" id="btn-desc" style="padding: 8px 16px; background: #333; color: white; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-sort-amount-down-alt"></i> Mayor a menor
                            </button>
                            <button class="btn-ordenar" data-order="asc" id="btn-asc" style="padding: 8px 16px; background: #1a1a1a; color: white; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-sort-amount-up"></i> Menor a mayor
                            </button>
                            <button class="btn-ordenar" data-order="nombre" id="btn-nombre" style="padding: 8px 16px; background: #1a1a1a; color: white; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-sort-alpha-down"></i> Nombre A-Z
                            </button>
                        </div>
                        <div class="search-box" style="position: relative;">
                            <input type="text" id="buscar-escuderia" placeholder="Buscar escudería..." class="search-input" style="padding: 8px 12px 8px 35px; background: #1a1a1a; color: white; border: 1px solid #444; border-radius: 20px; width: 250px;">
                            <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                        </div>
                    </div>
                    
                    <!-- TABLA DE CLASIFICACIÓN -->
                    <div class="tabla-contenedor-scroll" style="overflow-x: auto; border-radius: 8px; border: 1px solid #333;">
                        <table class="tabla-clasificacion-simple" style="width: 100%; border-collapse: collapse;">
                            <thead style="background: #1a1a1a; border-bottom: 2px solid #00d2be;">
                                <tr>
                                    <th class="col-posicion" style="padding: 12px; text-align: left;">#</th>
                                    <th class="col-nombre" style="padding: 12px; text-align: left;">Escudería</th>
                                    <th class="col-metrica" id="columna-metrica-titulo" style="padding: 12px; text-align: left;">Dinero (€)</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-clasificacion-body">
                                <tr class="loading-row">
                                    <td colspan="3" style="text-align: center; padding: 40px;">
                                        <div class="cargando-clasificacion">
                                            <i class="fas fa-spinner fa-spin fa-2x" style="color: #00d2be;"></i>
                                            <p style="margin-top: 10px; color: #888;">Cargando clasificación...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- FOOTER (se mantiene) -->
                    <div class="tabla-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 10px; background: #1a1a1a; border-radius: 6px;">
                        <div class="pagination-info" style="color: #888;">
                            Mostrando <span id="filas-mostradas">0</span> de <span id="total-filas">0</span> escuderías
                        </div>
                        <div class="last-update" style="color: #888;">
                            <i class="fas fa-sync-alt"></i>
                            <span id="ultima-actualizacion">Actualizado hace unos segundos</span>
                        </div>
                    </div>
                    
                    <!-- BOTÓN ACTUALIZAR -->
                    <div class="actualizar-buttons" style="margin-top: 15px; text-align: right;">
                        <button class="btn-actualizar" id="btn-actualizar-clasificacion" style="padding: 10px 20px; background: #00d2be; color: black; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> Actualizar clasificación
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    
    // ===== NUEVO MÉTODO PARA CARGAR CLASIFICACIÓN =====
    async loadClasificacionData(tipo = 'dinero', orden = 'desc') {
        console.log(`📊 Cargando clasificación: ${tipo} - ${orden}`);
        
        const tablaBody = document.getElementById('tabla-clasificacion-body');
        if (!tablaBody) return;
        
        try {
            // Mostrar estado de carga
            tablaBody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="3" style="text-align: center; padding: 30px;">
                        <div class="cargando-clasificacion">
                            <i class="fas fa-spinner fa-spin fa-lg"></i>
                            <p>Cargando datos...</p>
                        </div>
                    </td>
                </tr>
            `;
            
            // 1. OBTENER TODAS LAS ESCUDERÍAS (incluyendo nuevas columnas)
            const { data: todasEscuderias, error: errorEscuderias } = await supabase
                .from('escuderias')
                .select('id, nombre, dinero, puntos, gp_participados, aciertos_totales, preguntas_totales');
            
            if (errorEscuderias) throw errorEscuderias;
            
            if (!todasEscuderias || todasEscuderias.length === 0) {
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
            
            console.log(`🏁 Encontradas ${todasEscuderias.length} escuderías`);
            
            // 2. PROCESAR DATOS SEGÚN EL TIPO
            let escuderiasConDatos = todasEscuderias;
            
            if (tipo === 'vuelta') {
                // Obtener mejor vuelta de cada escudería
                escuderiasConDatos = await Promise.all(
                    todasEscuderias.map(async (escuderia) => {
                        try {
                            const { data: resultados } = await supabase
                                .from('pruebas_pista')
                                .select('tiempo_formateado, tiempo_vuelta')
                                .eq('escuderia_id', escuderia.id)
                                .order('tiempo_vuelta', { ascending: true })
                                .limit(1);
                            
                            const mejorVuelta = resultados && resultados.length > 0 ? resultados[0] : null;
                            
                            return {
                                ...escuderia,
                                vuelta_rapida: mejorVuelta?.tiempo_formateado || 'Sin vuelta',
                                tiempo_vuelta: mejorVuelta?.tiempo_vuelta || 999999
                            };
                            
                        } catch (error) {
                            return {
                                ...escuderia,
                                vuelta_rapida: 'Sin vuelta',
                                tiempo_vuelta: 999999
                            };
                        }
                    })
                );
            } else if (tipo === 'aciertos') {
                // Calcular porcentaje de aciertos
                escuderiasConDatos = todasEscuderias.map(escuderia => {
                    const aciertos = escuderia.aciertos_totales || 0;
                    const totales = escuderia.preguntas_totales || 0;
                    const porcentaje = totales > 0 ? Math.round((aciertos / totales) * 100) : 0;
                    
                    return {
                        ...escuderia,
                        porcentaje_aciertos: porcentaje,
                        aciertos_mostrar: totales > 0 ? `${aciertos}/${totales} (${porcentaje}%)` : 'Sin datos'
                    };
                });
            } else if (tipo === 'carreras') {
                // Usar gp_participados directamente
                escuderiasConDatos = todasEscuderias.map(escuderia => ({
                    ...escuderia,
                    carreras_disputadas: escuderia.gp_participados || 0
                }));
            }
            
            // 3. ORDENAR SEGÚN TIPO Y ORDEN
            let escuderiasOrdenadas;
            
            switch(tipo) {
                case 'dinero':
                    if (orden === 'nombre') {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => 
                            (a.nombre || '').localeCompare(b.nombre || '')
                        );
                    } else {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => 
                            orden === 'desc' ? b.dinero - a.dinero : a.dinero - b.dinero
                        );
                    }
                    break;
                    
                case 'vuelta':
                    if (orden === 'nombre') {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => 
                            (a.nombre || '').localeCompare(b.nombre || '')
                        );
                    } else {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => {
                            if (orden === 'desc') {
                                // 'desc' para vueltas = peores tiempos primero (mayor número)
                                return b.tiempo_vuelta - a.tiempo_vuelta;
                            } else {
                                // 'asc' para vueltas = mejores tiempos primero (menor número)
                                return a.tiempo_vuelta - b.tiempo_vuelta;
                            }
                        });
                    }
                    break;
                    
                case 'aciertos':
                    if (orden === 'nombre') {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => 
                            (a.nombre || '').localeCompare(b.nombre || '')
                        );
                    } else {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => {
                            const aValor = a.porcentaje_aciertos || 0;
                            const bValor = b.porcentaje_aciertos || 0;
                            return orden === 'desc' ? bValor - aValor : aValor - bValor;
                        });
                    }
                    break;
                    
                case 'carreras':
                    if (orden === 'nombre') {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => 
                            (a.nombre || '').localeCompare(b.nombre || '')
                        );
                    } else {
                        escuderiasOrdenadas = escuderiasConDatos.sort((a, b) => {
                            const aValor = a.carreras_disputadas || 0;
                            const bValor = b.carreras_disputadas || 0;
                            return orden === 'desc' ? bValor - aValor : aValor - bValor;
                        });
                    }
                    break;
                    
                default:
                    escuderiasOrdenadas = escuderiasConDatos;
            }
            
            // 4. GENERAR TABLA
            this.generarTablaClasificacion(tablaBody, escuderiasOrdenadas, tipo, orden);
            
            // 5. Configurar eventos de usuarios
            setTimeout(() => {
                this.configurarEventosUsuariosClasificacion();
            }, 100);
            
            console.log('✅ Clasificación cargada correctamente');
            
        } catch (error) {
            console.error('❌ Error cargando clasificación:', error);
            tablaBody.innerHTML = `
                <tr class="error-row">
                    <td colspan="3" style="text-align: center; padding: 40px; color: #f44336;">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <p style="margin-top: 10px;">Error al cargar la clasificación</p>
                        <button onclick="window.tabManager.loadClasificacionData('dinero', 'desc')" 
                                style="margin-top: 15px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Reintentar
                        </button>
                    </td>
                </tr>
            `;
        }
    }
    // Añadir este método después de loadClasificacionData()
    generarTablaClasificacion(tablaBody, escuderias, tipo, orden) {
        // Solo mantener los contadores que aún se usan en el footer
        document.getElementById('total-filas').textContent = escuderias.length;
        document.getElementById('filas-mostradas').textContent = escuderias.length;
        
        // Actualizar título de columna según tipo
        const tituloMetrica = document.getElementById('columna-metrica-titulo');
        if (tituloMetrica) {
            let titulo = '<span>Dinero (€)</span>';
            if (tipo === 'vuelta') titulo = '<span>Mejor Vuelta</span>';
            if (tipo === 'aciertos') titulo = '<span>% Aciertos</span>';
            if (tipo === 'carreras') titulo = '<span>Carreras Disputadas</span>';
            tituloMetrica.innerHTML = titulo;
        }
        
        // Encontrar mi escudería si existe
        const miEscuderiaId = window.f1Manager?.escuderia?.id;
        
        // Generar filas de la tabla
        let html = '';
        
        escuderias.forEach((escuderia, index) => {
            const esMiEscuderia = escuderia.id === miEscuderiaId;
            const posicion = index + 1;
            
            // Formatear valor a mostrar según tipo
            let valorMostrar;
            let claseColumna = '';
            
            switch(tipo) {
                case 'dinero':
                    valorMostrar = `€${new Intl.NumberFormat('es-ES', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(escuderia.dinero || 0)}`;
                    claseColumna = 'celda-dinero';
                    break;
                    
                case 'vuelta':
                    valorMostrar = escuderia.vuelta_rapida;
                    claseColumna = 'celda-vuelta';
                    break;
                    
                case 'aciertos':
                    valorMostrar = escuderia.porcentaje_aciertos ? `${escuderia.porcentaje_aciertos}%` : '0%';
                    if (escuderia.aciertos_mostrar && escuderia.aciertos_mostrar !== 'Sin datos') {
                        valorMostrar = escuderia.aciertos_mostrar;
                    }
                    claseColumna = 'celda-aciertos';
                    break;
                    
                case 'carreras':
                    valorMostrar = escuderia.carreras_disputadas || 0;
                    claseColumna = 'celda-carreras';
                    break;
                    
                default:
                    valorMostrar = '';
            }
            
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
                        <span class="usuario-link" 
                              data-usuario-id="${escuderia.id}"
                              data-usuario-nombre="${escuderia.nombre || 'Sin nombre'}"
                              style="cursor: pointer; color: #00d2be; text-decoration: underline; text-decoration-style: dotted; transition: all 0.2s; display: inline-block; padding: 2px 4px; border-radius: 3px;">
                            ${escuderia.nombre || 'Sin nombre'}
                        </span>
                    </td>
                    <td class="${claseColumna}">
                        <span class="${tipo === 'dinero' ? 'valor-dinero' : 'valor-vuelta'}">
                            ${valorMostrar}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        tablaBody.innerHTML = html;
        
        // Actualizar timestamp
        const ahora = new Date();
        document.getElementById('ultima-actualizacion').textContent = 
            `Actualizado a las ${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    }
    
    
    // ===== NUEVO MÉTODO PARA CONFIGURAR EVENTOS DE CLASIFICACIÓN =====
    setupClasificacionEvents() {
        console.log('🔧 Configurando eventos de clasificación...');
        
        // Variables para estado actual
        let tipoActual = 'dinero';
        let ordenActual = 'desc';
        
        // ============================================
        // 🏁 CARGAR GP ACTUAL Y SELECTOR
        // ============================================
        this.cargarGrandesPremiosSelector();
        
        // ============================================
        // 🎯 MOSTRAR GP ACTUAL AUTOMÁTICAMENTE
        // ============================================

        setTimeout(async () => {
            const gpActual = await this.obtenerGranPremioActual();
            
            if (gpActual) {
                // Hay GP en curso - mostrar datos normales
                console.log('🏁 Mostrando GP en curso:', gpActual.nombre);
                await this.cargarDatosGranPremio(gpActual.id);
                
                // Seleccionar en el dropdown
                const selector = document.getElementById('selector-gp-historico');
                if (selector) {
                    selector.value = gpActual.id;
                }
            } else {
                // NO HAY GP EN CURSO - Mostrar la primera carrera del calendario
                const { data: primerGp } = await supabase
                    .from('calendario_gp')
                    .select('id, nombre, fecha_fin')
                    .order('fecha_fin', { ascending: true })
                    .limit(1)
                    .single();
        
                if (primerGp) {
                    console.log('📅 Mostrando primera carrera del calendario:', primerGp.nombre);
                    await this.cargarDatosGranPremio(primerGp.id);
                    
                    const gpNombreSpan = document.getElementById('gp-actual-nombre');
                    if (gpNombreSpan) {
                        const fecha = new Date(primerGp.fecha_fin).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short'
                        });
                        gpNombreSpan.textContent = `${primerGp.nombre} (${fecha})`;
                    }
                }
            }
        }, 100);
        
        // ============================================
        // 📅 EVENTO DEL SELECTOR DE GP
        // ============================================
        const btnCargar = document.getElementById('btn-cargar-gp-seleccionado');
        if (btnCargar) {
            const nuevoBtn = btnCargar.cloneNode(true);
            btnCargar.parentNode.replaceChild(nuevoBtn, btnCargar);
            
            nuevoBtn.addEventListener('click', async () => {
                const gpId = document.getElementById('selector-gp-historico').value;
                if (!gpId) {
                    if (window.f1Manager?.showNotification) {
                        window.f1Manager.showNotification('❌ Selecciona un Gran Premio', 'error');
                    }
                    return;
                }
                
                // Actualizar título del GP actual
                const { data: carrera } = await supabase
                    .from('calendario_gp')
                    .select('nombre, fecha_inicio')
                    .eq('id', gpId)
                    .single();
                
                if (carrera) {
                    const gpNombreSpan = document.getElementById('gp-actual-nombre');
                    if (gpNombreSpan) {
                        const fecha = new Date(carrera.fecha_inicio).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short'
                        });
                        gpNombreSpan.textContent = `${carrera.nombre} (${fecha})`;
                    }
                }
                
                await this.cargarDatosGranPremio(gpId);
            });
        }
        
        // ============================================
        // 📊 EVENTOS DE CLASIFICACIÓN GLOBAL (SOLO 2 TIPOS)
        // ============================================
        
        // Selector de tipo (Dinero / Carreras)
        document.querySelectorAll('.btn-selector-tipo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nuevoTipo = e.currentTarget.dataset.tipo;
                
                document.querySelectorAll('.btn-selector-tipo').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#1a1a1a';
                    b.style.color = 'white';
                });
                
                e.currentTarget.classList.add('active');
                e.currentTarget.style.background = '#00d2be';
                e.currentTarget.style.color = 'black';
                
                tipoActual = nuevoTipo;
                
                // Resetear orden por defecto según tipo
                if (nuevoTipo === 'dinero') {
                    ordenActual = 'desc';
                } else if (nuevoTipo === 'carreras') {
                    ordenActual = 'desc';
                }
                
                this.loadClasificacionData(tipoActual, ordenActual);
            });
        });
        
        // Botones de ordenamiento
        document.querySelectorAll('.btn-ordenar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-ordenar').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#1a1a1a';
                });
                
                e.currentTarget.classList.add('active');
                e.currentTarget.style.background = '#333';
                
                ordenActual = e.currentTarget.dataset.order;
                this.loadClasificacionData(tipoActual, ordenActual);
            });
        });
        
        // Botón actualizar
        document.getElementById('btn-actualizar-clasificacion')?.addEventListener('click', () => {
            this.loadClasificacionData(tipoActual, ordenActual);
            
            // También recargar GP actual si hay uno
            setTimeout(async () => {
                const selector = document.getElementById('selector-gp-historico');
                if (selector && selector.value) {
                    await this.cargarDatosGranPremio(selector.value);
                } else {
                    const gpActual = await this.obtenerGranPremioActual();
                    if (gpActual) {
                        await this.cargarDatosGranPremio(gpActual.id);
                    }
                }
            }, 500);
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
                    
                    const nombre = fila.querySelector('.celda-nombre')?.textContent.toLowerCase() || '';
                    const esVisible = nombre.includes(termino);
                    fila.style.display = esVisible ? '' : 'none';
                    if (esVisible) filasVisibles++;
                });
                
                document.getElementById('filas-mostradas').textContent = filasVisibles;
            });
        }
        
        // Cargar datos iniciales de clasificación global
        setTimeout(() => {
            this.loadClasificacionData('dinero', 'desc');
            
            setTimeout(() => {
                this.configurarEventosUsuariosClasificacion();
            }, 200);
        }, 100);
    }
    // ===== NUEVO: OBTENER GRAN PREMIO ACTUAL =====
    // ===== NUEVO: OBTENER GRAN PREMIO ACTUAL (CORREGIDO) =====
    // ===== OBTENER GRAN PREMIO EN CURSO (LA PRÓXIMA CARRERA) =====
    async obtenerGranPremioActual() {
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Principio del día de hoy
            
            console.log('📅 Buscando próximo GP - Fecha actual:', hoy.toISOString().split('T')[0]);
            
            // Obtener TODOS los GP ordenados por fecha_fin (más cercanos primero)
            const { data: todosGps, error } = await supabase
                .from('calendario_gp')
                .select('id, nombre, fecha_fin')
                .order('fecha_fin', { ascending: true });
            
            if (error) throw error;
            
            if (!todosGps || todosGps.length === 0) {
                console.log('📅 No hay GP en calendario');
                return null;
            }
            
            console.log('📅 Total GPs:', todosGps.length);
            
            // Buscar el primer GP cuya fecha_fin sea >= hoy (la próxima carrera)
            const proximaCarrera = todosGps.find(gp => {
                const fechaFin = new Date(gp.fecha_fin);
                fechaFin.setHours(0, 0, 0, 0);
                return fechaFin >= hoy;
            });
            
            if (proximaCarrera) {
                console.log(`🏁 PRÓXIMA CARRERA: ${proximaCarrera.nombre} (finaliza: ${proximaCarrera.fecha_fin})`);
                return proximaCarrera;
            }
            
            // Si todas las carreras ya pasaron, mostrar la última (la más reciente)
            const ultimaCarrera = todosGps[todosGps.length - 1];
            console.log(`📅 TEMPORADA FINALIZADA - Última carrera: ${ultimaCarrera.nombre}`);
            return ultimaCarrera;
            
        } catch (error) {
            console.error('❌ Error obteniendo próximo GP:', error);
            return null;
        }
    }
    
    // ===== NUEVO: CARGAR DATOS DEL GP ACTUAL =====
    // ===== NUEVO: CARGAR DATOS DEL GP ACTUAL (CONSULTAS CORREGIDAS) =====
    // ===== CARGAR DATOS DEL GP ACTUAL CON TABLA ÚNICA =====
    async cargarDatosGranPremio(gpId) {
        const contenedor = document.getElementById('contenedor-gp-actual');
        if (!contenedor) return;
        
        contenedor.innerHTML = `
            <div class="cargando-gp" style="text-align: center; padding: 30px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: #00d2be;"></i>
                <p style="margin-top: 10px; color: #888;">Cargando datos...</p>
            </div>
        `;
        
        try {
            // Obtener nombre de la carrera
            const { data: carrera, error: errorCarrera } = await supabase
                .from('calendario_gp')
                .select('nombre, fecha_fin')
                .eq('id', gpId)
                .single();
            
            if (errorCarrera) throw errorCarrera;
            
            // Calcular período de vueltas (7 días antes de la carrera)
            const fechaCarrera = new Date(carrera.fecha_fin);
            const fechaInicioPeriodo = new Date(fechaCarrera);
            fechaInicioPeriodo.setDate(fechaCarrera.getDate() - 7);
            fechaInicioPeriodo.setHours(0, 0, 0, 0);
            
            const fechaFinPeriodo = new Date(fechaCarrera);
            fechaFinPeriodo.setHours(23, 59, 59, 999);
            
            // Obtener TODAS las vueltas del período
            const { data: vueltas, error: errorVueltas } = await supabase
                .from('pruebas_pista')
                .select(`
                    tiempo_formateado,
                    tiempo_vuelta,
                    fecha_prueba,
                    escuderia_id,
                    escuderias!inner (
                        id,
                        nombre
                    )
                `)
                .gte('fecha_prueba', fechaInicioPeriodo.toISOString())
                .lte('fecha_prueba', fechaFinPeriodo.toISOString())
                .order('tiempo_vuelta', { ascending: true });
            
            if (errorVueltas) console.error('Error consultando vueltas:', errorVueltas);
            
            // Obtener TODOS los pronósticos del GP
            const { data: pronosticos, error: errorPronosticos } = await supabase
                .from('pronosticos_usuario')
                .select(`
                    escuderia_id,
                    aciertos,
                    puntuacion_total,
                    escuderias!inner (
                        id,
                        nombre
                    )
                `)
                .eq('carrera_id', gpId)
                .eq('estado', 'calificado')
                .not('aciertos', 'is', null)
                .order('aciertos', { ascending: false })
                .order('puntuacion_total', { ascending: false });
            
            if (errorPronosticos) console.error('Error consultando pronósticos:', errorPronosticos);
            
            // ID de mi escudería
            const miEscuderiaId = window.f1Manager?.escuderia?.id;
            
            // Generar HTML con título en línea superior
            let html = `
                <!-- TÍTULO EN LÍNEA SUPERIOR -->
                <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <h3 style="color: #00d2be; margin: 0;" id="gp-actual-nombre-titulo">
                        <i class="fas fa-flag-checkered"></i> ${carrera.nombre} (${new Date(carrera.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})
                    </h3>
                    
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button id="btn-tabla-vueltas" class="btn-selector-tipo active" style="padding: 8px 16px; background: #00d2be; color: black; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-stopwatch"></i> Mejores Vueltas
                        </button>
                        <button id="btn-tabla-aciertos" class="btn-selector-tipo" style="padding: 8px 16px; background: #1a1a1a; color: white; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trophy"></i> Pronósticos
                        </button>
                    </div>
                    
                    <div id="contenido-tabla-gp" style="background: #1a1a1a; border-radius: 8px; border: 1px solid #333; overflow: hidden;">
            `;
            
            // PROCESAR VUELTAS: solo la mejor de cada escudería
            const vueltasUnicas = this.procesarMejoresVueltas(vueltas);
            
            // Generar tabla de vueltas por defecto
            html += this.generarTablaVueltasGP(vueltasUnicas, miEscuderiaId);
            
            html += `
                    </div>
                </div>
            `;
            
            contenedor.innerHTML = html;
            
            // Configurar eventos de los botones
            setTimeout(() => {
                const btnVueltas = document.getElementById('btn-tabla-vueltas');
                const btnAciertos = document.getElementById('btn-tabla-aciertos');
                const contenidoTabla = document.getElementById('contenido-tabla-gp');
                
                if (btnVueltas) {
                    btnVueltas.addEventListener('click', () => {
                        btnVueltas.style.background = '#00d2be';
                        btnVueltas.style.color = 'black';
                        btnAciertos.style.background = '#1a1a1a';
                        btnAciertos.style.color = 'white';
                        
                        contenidoTabla.innerHTML = this.generarTablaVueltasGP(vueltasUnicas, miEscuderiaId);
                    });
                }
                
                if (btnAciertos) {
                    btnAciertos.addEventListener('click', () => {
                        btnAciertos.style.background = '#00d2be';
                        btnAciertos.style.color = 'black';
                        btnVueltas.style.background = '#1a1a1a';
                        btnVueltas.style.color = 'white';
                        
                        contenidoTabla.innerHTML = this.generarTablaPronosticosGP(pronosticos, miEscuderiaId);
                    });
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Error cargando datos del GP:', error);
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #f44336;">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p style="margin-top: 10px;">Error cargando datos</p>
                </div>
            `;
        }
    }
    
    // ===== NUEVO: PROCESAR SOLO LA MEJOR VUELTA DE CADA ESCUDERÍA =====
    procesarMejoresVueltas(vueltas) {
        if (!vueltas || vueltas.length === 0) return [];
        
        const mapaMejoresVueltas = new Map();
        
        vueltas.forEach(vuelta => {
            const escuderiaId = vuelta.escuderia_id;
            
            if (!mapaMejoresVueltas.has(escuderiaId)) {
                mapaMejoresVueltas.set(escuderiaId, vuelta);
            } else {
                const vueltaActual = mapaMejoresVueltas.get(escuderiaId);
                if (vuelta.tiempo_vuelta < vueltaActual.tiempo_vuelta) {
                    mapaMejoresVueltas.set(escuderiaId, vuelta);
                }
            }
        });
        
        // Convertir mapa a array y ordenar por tiempo
        const vueltasUnicas = Array.from(mapaMejoresVueltas.values());
        return vueltasUnicas.sort((a, b) => a.tiempo_vuelta - b.tiempo_vuelta);
    }
    
    // ===== GENERAR TABLA DE VUELTAS =====
    generarTablaVueltasGP(vueltas, miEscuderiaId) {
        if (!vueltas || vueltas.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <i class="fas fa-clock" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Aún no hay vueltas registradas para este GP</p>
                </div>
            `;
        }
        
        // Encontrar mi posición
        let miIndice = -1;
        if (miEscuderiaId) {
            miIndice = vueltas.findIndex(v => v.escuderia_id === miEscuderiaId);
        }
        
        // Determinar qué vueltas mostrar (alrededor de mi posición o las primeras)
        let vueltasAMostrar = [];
        
        if (miIndice >= 0) {
            // Mostrar 9 por encima, mi vuelta, y 9 por debajo
            const inicio = Math.max(0, miIndice - 9);
            const fin = Math.min(vueltas.length, miIndice + 10);
            vueltasAMostrar = vueltas.slice(inicio, fin);
        } else {
            // Si no tengo vuelta, mostrar las primeras 19
            vueltasAMostrar = vueltas.slice(0, 19);
        }
        
        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead style="background: #0a0a0a; border-bottom: 2px solid #00d2be;">
                    <tr>
                        <th style="padding: 12px 8px; text-align: left; width: 50px;">#</th>
                        <th style="padding: 12px 8px; text-align: left;">Escudería</th>
                        <th style="padding: 12px 8px; text-align: right; width: 100px;">Tiempo</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        vueltasAMostrar.forEach((vuelta, index) => {
            const esMiEscuderia = vuelta.escuderia_id === miEscuderiaId;
            const posicionGlobal = vueltas.findIndex(v => v.escuderia_id === vuelta.escuderia_id) + 1;
            
            let colorFila = '';
            if (esMiEscuderia) {
                colorFila = 'background: rgba(0,210,190,0.2); border-left: 3px solid #00d2be;';
            } else if (index === 0 && !miEscuderiaId) {
                colorFila = 'background: rgba(255,215,0,0.1);'; // Dorado para el primero
            }
            
            html += `
                <tr style="border-bottom: 1px solid #333; ${colorFila}">
                    <td style="padding: 10px 8px; font-weight: bold; color: ${posicionGlobal === 1 ? '#FFD700' : (posicionGlobal === 2 ? '#C0C0C0' : (posicionGlobal === 3 ? '#CD7F32' : 'white'))};">${posicionGlobal}</td>
                    <td style="padding: 10px 8px;">
                        ${esMiEscuderia ? '<i class="fas fa-user" style="color: #00d2be; margin-right: 5px;"></i>' : ''}
                        ${vuelta.escuderias?.nombre || 'Desconocida'}
                    </td>
                    <td style="padding: 10px 8px; text-align: right; font-family: monospace; font-weight: bold; color: #00d2be;">${vuelta.tiempo_formateado}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    }
    
    // ===== GENERAR TABLA DE PRONÓSTICOS =====
    generarTablaPronosticosGP(pronosticos, miEscuderiaId) {
        if (!pronosticos || pronosticos.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Aún no hay pronósticos calificados para este GP</p>
                </div>
            `;
        }
        
        // Encontrar mi posición
        let miIndice = -1;
        if (miEscuderiaId) {
            miIndice = pronosticos.findIndex(p => p.escuderia_id === miEscuderiaId);
        }
        
        // Determinar qué pronósticos mostrar (alrededor de mi posición o los primeros)
        let pronosticosAMostrar = [];
        
        if (miIndice >= 0) {
            // Mostrar 9 por encima, mi pronóstico, y 9 por debajo
            const inicio = Math.max(0, miIndice - 9);
            const fin = Math.min(pronosticos.length, miIndice + 10);
            pronosticosAMostrar = pronosticos.slice(inicio, fin);
        } else {
            // Si no tengo pronóstico, mostrar los primeros 19
            pronosticosAMostrar = pronosticos.slice(0, 19);
        }
        
        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead style="background: #0a0a0a; border-bottom: 2px solid #00d2be;">
                    <tr>
                        <th style="padding: 12px 8px; text-align: left; width: 50px;">#</th>
                        <th style="padding: 12px 8px; text-align: left;">Escudería</th>
                        <th style="padding: 12px 8px; text-align: right; width: 80px;">Aciertos</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        pronosticosAMostrar.forEach((p, index) => {
            const esMiEscuderia = p.escuderia_id === miEscuderiaId;
            const posicionGlobal = pronosticos.findIndex(pr => pr.escuderia_id === p.escuderia_id) + 1;
            
            let colorFila = '';
            if (esMiEscuderia) {
                colorFila = 'background: rgba(0,210,190,0.2); border-left: 3px solid #00d2be;';
            } else if (index === 0 && !miEscuderiaId) {
                colorFila = 'background: rgba(255,215,0,0.1);';
            }
            
            html += `
                <tr style="border-bottom: 1px solid #333; ${colorFila}">
                    <td style="padding: 10px 8px; font-weight: bold; color: ${posicionGlobal === 1 ? '#FFD700' : (posicionGlobal === 2 ? '#C0C0C0' : (posicionGlobal === 3 ? '#CD7F32' : 'white'))};">${posicionGlobal}</td>
                    <td style="padding: 10px 8px;">
                        ${esMiEscuderia ? '<i class="fas fa-user" style="color: #00d2be; margin-right: 5px;"></i>' : ''}
                        ${p.escuderias?.nombre || 'Desconocida'}
                    </td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #00d2be;">${p.aciertos}/10</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    }

    

    

    async cargarRankingPorGPUnico(gpId, tipo = 'vueltas') {
        console.log(`🏁 Cargando ranking único para GP: ${gpId}, tipo: ${tipo}`);
        
        const contenedor = document.getElementById('contenedor-historico-gp');
        const titulo = document.getElementById('titulo-gp-seleccionado');
        
        if (!contenedor || !titulo) return;
        
        // Mostrar contenedor
        contenedor.style.display = 'block';
        
        try {
            // Obtener nombre de la carrera
            const { data: carrera, error: errorCarrera } = await supabase
                .from('calendario_gp')
                .select('nombre, fecha_inicio')
                .eq('id', gpId)
                .single();
            
            if (errorCarrera) throw errorCarrera;
            
            titulo.textContent = `${carrera.nombre} - ${new Date(carrera.fecha_inicio).toLocaleDateString('es-ES')}`;
            
            // Cargar según el tipo
            if (tipo === 'vueltas') {
                await this.cargarVueltasGP(gpId);
            } else {
                await this.cargarAciertosGP(gpId);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            const contenido = document.getElementById('contenido-historico-unico');
            if (contenido) {
                contenido.innerHTML = '<div style="text-align: center; padding: 40px; color: #f44336;">Error cargando datos</div>';
            }
        }
    }    
    async cargarGrandesPremiosSelector() {
        try {
            console.log('📅 Cargando Grandes Premios para selector...');
            
            const { data: carreras, error } = await supabase
                .from('calendario_gp')
                .select('id, nombre, fecha_inicio')
                .order('fecha_inicio', { ascending: false }); // Orden descendente para ver los más recientes primero
            
            if (error) throw error;
            
            const selector = document.getElementById('selector-gp-historico');
            if (!selector) return;
            
            let html = '<option value="">📅 Ver otro Gran Premio...</option>';
            
            carreras.forEach(carrera => {
                const fecha = new Date(carrera.fecha_inicio).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                html += `<option value="${carrera.id}">${carrera.nombre} (${fecha})</option>`;
            });
            
            selector.innerHTML = html;
            console.log(`✅ ${carreras.length} Grandes Premios cargados`);
            
        } catch (error) {
            console.error('❌ Error cargando Grandes Premios:', error);
        }
    }

    async refrescarSelectorGP() {
        await this.cargarGrandesPremiosSelector();
    }    
    // ========================
    // CONFIGURAR EVENTOS DE USUARIOS EN CLASIFICACIÓN
    // ========================
    configurarEventosUsuariosClasificacion() {
        // Eventos para los nombres de usuario cliqueables
        document.querySelectorAll('.usuario-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const usuarioId = e.target.dataset.usuarioId;
                const usuarioNombre = e.target.dataset.usuarioNombre;
                
                console.log('👤 Clic en usuario de clasificación:', usuarioNombre, 'ID:', usuarioId);
                
                // Usar el perfilManager global para abrir el perfil
                if (window.perfilManager) {
                    window.perfilManager.abrirPerfilUsuario(usuarioId, usuarioNombre, e);
                } else {
                    console.error('❌ perfilManager no disponible');
                    if (window.f1Manager?.showNotification) {
                        window.f1Manager.showNotification('❌ Error: Sistema de perfiles no disponible', 'error');
                    }
                }
            });
        });
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
            case 'ingenieria': // AÑADIR ESTE CASO
                this.setupIngenieriaEvents();
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

    setupIngenieriaEvents() {
        console.log('🔧 Configurando eventos de ingeniería...');
        
        // Esta función cargará el contenido real cuando la pestaña se active
        setTimeout(() => {
            if (window.ingenieriaManager && window.ingenieriaManager.cargarTabIngenieria) {
                window.ingenieriaManager.cargarTabIngenieria();
                console.log('✅ Contenido de ingeniería cargado');
            } else {
                console.error('❌ ingenieriaManager no disponible');
                const tabContent = document.getElementById('tab-ingenieria');
                if (tabContent) {
                    tabContent.innerHTML = `
                        <div class="error-tab">
                            <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
                            <p>Sistema de ingeniería no disponible</p>
                            <button onclick="location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            }
        }, 100);
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
            
            // VERIFICACIÓN CRÍTICA: NO PERMITIR EQUIPAR PIEZAS EN VENTA
            if (piezaNueva.en_venta) {
                console.warn('❌ Intento de equipar pieza en venta:', piezaId);
                
                // MOSTRAR SOLO MENSAJE INFORMATIVO - SIN OPCIONES
                alert('⚠️ Esta pieza está actualmente en venta en el mercado.\n\nPara poder equiparla, primero debes retirarla de la venta en la pestaña del Mercado.');
                
                // NO PERMITIR EQUIPAR - SIMPLEMENTE SALIR
                return;
            }
            
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
                // VERIFICAR QUE LA PIEZA A DESEQUIPAR NO ESTÉ EN VENTA (por seguridad)
                if (piezaEquipadaActual.en_venta) {
                    alert('⚠️ No puedes desequipar una pieza que está en venta.\nRetírala primero del mercado.');
                    return;
                }
                
                console.log('🔄 Desequipando pieza anterior:', piezaEquipadaActual.id);
                
                // DESEQUIPAR LA ANTERIOR - SOLO CAMBIAR equipada a false
                const { error: desequiparError } = await supabase
                    .from('almacen_piezas')
                    .update({ 
                        equipada: false,  // ← COLUMNA QUE SÍ EXISTE
                        desmontada_en: new Date().toISOString()                        
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
                    equipada: true,  // ← COLUMNA QUE SÍ EXISTE
                    montada_en: new Date().toISOString(),  // ← NUEVO
                    desmontada_en: null,                    // ← NUEVO
                    desgaste_actual: 100                    // ← NUEVO (reiniciar)                    
                })
                .eq('id', piezaId);
            
            if (equiparError) throw equiparError;
            
            // SUMAR PUNTOS DE LA NUEVA PIEZA
            await this.sumarPuntosAlCoche(piezaNueva.area, piezaNueva.puntos_base || 10);
            
            // SUMAR PUNTOS A LA ESCUDERÍA
            const puntosSumar = piezaNueva.puntos_base;
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
            
            // 8. ACTUALIZAR MERCADO SI ESTÁ VISIBLE
            if (window.tabManager?.currentTab === 'mercado' && window.mercadoManager?.cargarTabMercado) {
                setTimeout(() => {
                    window.mercadoManager.cargarTabMercado();
                }, 500);
            }
            
            // 9. NOTIFICACIÓN
            if (window.f1Manager?.showNotification) {
                const mensaje = piezaEquipadaActual ? 
                    `🔄 ${piezaNueva.area} actualizada` :  // ← CAMBIADO
                    `✅ ${piezaNueva.area} equipada`;      // ← CAMBIADO
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
