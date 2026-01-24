// ========================
// MERCADO.JS - Sistema de mercado independiente
// ========================
console.log('🛒 Mercado.js cargado');

class MercadoManager {
    constructor() {
        this.supabase = window.supabase;
        this.escuderia = null;
        this.ordenesDisponibles = [];
        this.misOrdenes = [];
    }

    // ========================
    // 1. INICIALIZACIÓN
    // ========================
    async inicializar(escuderia) {
        console.log('🔧 Inicializando MercadoManager para:', escuderia.nombre);
        this.escuderia = escuderia;
        
        // Cargar órdenes disponibles
        await this.cargarOrdenesDisponibles();
        
        // Cargar mis órdenes activas
        await this.cargarMisOrdenes();
        
        console.log('✅ MercadoManager inicializado');
    }

    // ========================
    // 2. CARGAR PESTAÑA MERCADO
    // ========================
    async cargarTabMercado() {
        console.log('🛒 Cargando pestaña mercado...');
        
        const container = document.getElementById('tab-mercado');
        if (!container) {
            console.error('❌ No se encontró #tab-mercado');
            return;
        }
        
        if (!this.escuderia) {
            container.innerHTML = '<p class="error">❌ No se encontró tu escudería</p>';
            return;
        }
        
        try {
            // Cargar datos frescos
            await this.cargarOrdenesDisponibles();
            await this.cargarMisOrdenes();
            
            const html = this.generarHTMLMercado();
            container.innerHTML = html;
            
            // Configurar eventos
            this.configurarEventosMercado();
            
        } catch (error) {
            console.error('❌ Error cargando mercado:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>❌ Error cargando el mercado</h3>
                    <p>${error.message}</p>
                    <button onclick="mercadoManager.cargarTabMercado()">Reintentar</button>
                </div>
            `;
        }
    }

    // ========================
    // 3. GENERAR HTML DEL MERCADO
    // ========================
    generarHTMLMercado() {
        return `
            <div class="mercado-container">
                <!-- Header -->
                <div class="mercado-header">
                    <h1><i class="fas fa-store"></i> MERCADO DE PIEZAS</h1>
                    <p class="subtitle">Compra y vende piezas con otros equipos</p>
                </div>
                
                <!-- Stats rápidos -->
                <div class="mercado-stats">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.ordenesDisponibles.length}</div>
                            <div class="stat-label">Órdenes disponibles</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏎️</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.misOrdenes.length}</div>
                            <div class="stat-label">Mis órdenes activas</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.calcularPrecioPromedio()}€</div>
                            <div class="stat-label">Precio promedio</div>
                        </div>
                    </div>
                </div>
                
                <!-- Pestañas -->
                <div class="mercado-tabs">
                    <button class="mercado-tab active" data-tab="comprar">
                        <i class="fas fa-shopping-cart"></i> COMPRAR
                    </button>
                    <button class="mercado-tab" data-tab="vender">
                        <i class="fas fa-tag"></i> VENDER
                    </button>
                    <button class="mercado-tab" data-tab="mis-ventas">
                        <i class="fas fa-history"></i> MIS VENTAS
                    </button>
                </div>
                
                <!-- Contenido de pestañas -->
                <div class="mercado-content">
                    <!-- TAB 1: COMPRAR -->
                    <div id="tab-comprar-content" class="tab-content active">
                        ${this.generarHTMLComprar()}
                    </div>
                    
                    <!-- TAB 2: VENDER -->
                    <div id="tab-vender-content" class="tab-content">
                        ${this.generarHTMLVender()}
                    </div>
                    
                    <!-- TAB 3: MIS VENTAS -->
                    <div id="tab-mis-ventas-content" class="tab-content">
                        ${this.generarHTMLMisVentas()}
                    </div>
                </div>
            </div>
            
            <!-- MODAL DE COMPRA -->
            <div id="modal-compra" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3><i class="fas fa-cart-plus"></i> CONFIRMAR COMPRA</h3>
                        <button class="btn-cerrar-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-compra-body">
                        <!-- Contenido dinámico -->
                    </div>
                </div>
            </div>
            
            <!-- MODAL DE VENTA -->
            <div id="modal-venta" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3><i class="fas fa-tag"></i> VENDER PIEZA</h3>
                        <button class="btn-cerrar-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-venta-body">
                        <!-- Contenido dinámico -->
                    </div>
                </div>
            </div>
            
            <style>
                /* ==================== */
                /* ESTILOS MERCADO */
                /* ==================== */
                .mercado-container {
                    padding: 20px;
                    color: white;
                }
                
                .mercado-header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                }
                
                .mercado-header h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.8rem;
                    color: white;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .subtitle {
                    color: #aaa;
                    font-size: 0.9rem;
                }
                
                /* Stats */
                .mercado-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-bottom: 25px;
                }
                
                .stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .stat-icon {
                    font-size: 2rem;
                    width: 50px;
                    height: 50px;
                    background: rgba(0, 210, 190, 0.1);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .stat-value {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 3px;
                }
                
                .stat-label {
                    color: #aaa;
                    font-size: 0.8rem;
                }
                
                /* Tabs */
                .mercado-tabs {
                    display: flex;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 5px;
                    margin-bottom: 20px;
                }
                
                .mercado-tab {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: #aaa;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border-radius: 8px;
                    transition: all 0.3s;
                }
                
                .mercado-tab.active {
                    background: rgba(0, 210, 190, 0.2);
                    color: white;
                    font-weight: bold;
                }
                
                .mercado-tab:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                /* Contenido de tabs */
                .tab-content {
                    display: none;
                }
                
                .tab-content.active {
                    display: block;
                }
                
                /* Tabla de órdenes */
                .ordenes-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .ordenes-table th {
                    background: rgba(0, 210, 190, 0.2);
                    color: white;
                    padding: 12px 15px;
                    text-align: left;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .ordenes-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: #ccc;
                }
                
                .ordenes-table tr:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .btn-comprar {
                    background: linear-gradient(135deg, #4CAF50, #388E3C);
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 5px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .btn-comprar:hover {
                    background: linear-gradient(135deg, #66BB6A, #4CAF50);
                }
                
                /* Pieza card */
                .pieza-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 10px;
                    margin-bottom: 10px;
                    border-left: 3px solid #00d2be;
                }
                
                .pieza-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .pieza-nombre {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.9rem;
                    color: white;
                    font-weight: bold;
                }
                
                .pieza-info {
                    display: flex;
                    gap: 15px;
                    font-size: 0.8rem;
                    color: #aaa;
                }
                
                .pieza-precio {
                    color: #FFD700;
                    font-weight: bold;
                }
                
                /* Modales */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                
                .modal-container {
                    background: #1a1a2e;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 500px;
                    border: 3px solid #00d2be;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: white;
                    font-family: 'Orbitron', sans-serif;
                }
                
                .btn-cerrar-modal {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                /* Formulario precio */
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    color: #aaa;
                    margin-bottom: 5px;
                    font-size: 0.9rem;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 5px;
                    color: white;
                    font-size: 1rem;
                }
                
                .precio-sugerido {
                    background: rgba(255, 215, 0, 0.1);
                    border: 1px solid #FFD700;
                    border-radius: 8px;
                    padding: 10px;
                    margin: 15px 0;
                    color: #FFD700;
                    font-size: 0.9rem;
                }
                
                .btn-confirmar {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #00d2be, #009688);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 15px;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .mercado-stats {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    
                    .ordenes-table {
                        font-size: 0.8rem;
                    }
                    
                    .ordenes-table th,
                    .ordenes-table td {
                        padding: 8px 10px;
                    }
                }
            </style>
        `;
    }

    // ========================
    // 4. FUNCIONES AUXILIARES
    // ========================
    calcularPrecioPromedio() {
        if (this.ordenesDisponibles.length === 0) return 0;
        const total = this.ordenesDisponibles.reduce((sum, orden) => sum + orden.precio, 0);
        return Math.round(total / this.ordenesDisponibles.length).toLocaleString();
    }

    generarHTMLComprar() {
        if (this.ordenesDisponibles.length === 0) {
            return `
                <div class="sin-ordenes">
                    <p>😔 No hay órdenes disponibles en este momento</p>
                    <p class="small">Sé el primero en vender una pieza</p>
                </div>
            `;
        }

        return `
            <h3>Órdenes disponibles (${this.ordenesDisponibles.length})</h3>
            <div class="table-container">
                <table class="ordenes-table">
                    <thead>
                        <tr>
                            <th>Pieza</th>
                            <th>Área</th>
                            <th>Nivel</th>
                            <th>Calidad</th>
                            <th>Vendedor</th>
                            <th>Precio</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.ordenesDisponibles.map(orden => `
                            <tr>
                                <td>${orden.pieza_nombre}</td>
                                <td>${this.getAreaNombre(orden.area)}</td>
                                <td>${orden.nivel}</td>
                                <td><span class="badge-calidad">${orden.calidad}</span></td>
                                <td>${orden.vendedor_nombre}</td>
                                <td class="precio">${orden.precio.toLocaleString()}€</td>
                                <td>
                                    <button class="btn-comprar" data-orden-id="${orden.id}">
                                        COMPRAR
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generarHTMLVender() {
        return `
            <div class="vender-instructions">
                <h3>¿Cómo vender una pieza?</h3>
                <p>1. Ve a tu <strong>Almacén</strong></p>
                <p>2. Busca una pieza que quieras vender</p>
                <p>3. Haz clic en el botón <strong>"Vender"</strong></p>
                <p>4. Establece el precio y confirma</p>
            </div>
            
            <div class="precios-referencia">
                <h4><i class="fas fa-chart-line"></i> Precios de referencia</h4>
                <div class="precios-grid">
                    ${this.generarPreciosReferencia()}
                </div>
            </div>
        `;
    }

    generarHTMLMisVentas() {
        if (this.misOrdenes.length === 0) {
            return `
                <div class="sin-ventas">
                    <p>📦 No tienes ventas activas</p>
                    <p class="small">Vende una pieza para verla aquí</p>
                </div>
            `;
        }

        return `
            <h3>Mis ventas activas (${this.misOrdenes.length})</h3>
            <div class="mis-ventas-list">
                ${this.misOrdenes.map(orden => `
                    <div class="pieza-card" data-orden-id="${orden.id}">
                        <div class="pieza-header">
                            <div class="pieza-nombre">${orden.pieza_nombre}</div>
                            <div class="pieza-precio">${orden.precio.toLocaleString()}€</div>
                        </div>
                        <div class="pieza-info">
                            <span>Área: ${this.getAreaNombre(orden.area)}</span>
                            <span>Nivel: ${orden.nivel}</span>
                            <span>Calidad: ${orden.calidad}</span>
                            <span>Estado: <span class="estado-${orden.estado}">${orden.estado}</span></span>
                        </div>
                        <div class="pieza-acciones">
                            <button class="btn-cancelar-venta" data-orden-id="${orden.id}">
                                Cancelar venta
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarPreciosReferencia() {
        const precios = {
            'Común': '5,000 - 15,000€',
            'Rara': '15,000 - 30,000€',
            'Épica': '30,000 - 60,000€',
            'Legendaria': '60,000 - 150,000€'
        };
        
        let html = '';
        for (const [calidad, rango] of Object.entries(precios)) {
            html += `
                <div class="referencia-card">
                    <div class="referencia-calidad">${calidad}</div>
                    <div class="referencia-rango">${rango}</div>
                </div>
            `;
        }
        return html;
    }

    getAreaNombre(areaId) {
        const areas = {
            'suelo': 'Suelo',
            'motor': 'Motor',
            'aleron_delantero': 'Alerón Del.',
            'caja_cambios': 'Caja Cambios',
            'pontones': 'Pontones',
            'suspension': 'Suspensión',
            'aleron_trasero': 'Alerón Tras.',
            'chasis': 'Chasis',
            'frenos': 'Frenos',
            'volante': 'Volante',
            'electronica': 'Electrónica'
        };
        return areas[areaId] || areaId;
    }

    // ========================
    // 5. CONFIGURAR EVENTOS
    // ========================
    configurarEventosMercado() {
        // Tabs
        document.querySelectorAll('.mercado-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.cambiarTab(tabId);
            });
        });

        // Botones comprar
        document.querySelectorAll('.btn-comprar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ordenId = e.target.dataset.ordenId;
                this.mostrarModalCompra(ordenId);
            });
        });

        // Botones cancelar venta
        document.querySelectorAll('.btn-cancelar-venta').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const ordenId = e.target.dataset.ordenId;
                await this.cancelarVenta(ordenId);
            });
        });

        // Cerrar modales
        document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.ocultarModales();
            });
        });

        // Cerrar modal al hacer clic fuera
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.ocultarModales();
                }
            });
        });
    }

    cambiarTab(tabId) {
        // Actualizar tabs activos
        document.querySelectorAll('.mercado-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Mostrar contenido correspondiente
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}-content`).classList.add('active');
    }

    // ========================
    // 6. FUNCIONES PRINCIPALES
    // ========================
    async cargarOrdenesDisponibles() {
        try {
            const { data, error } = await this.supabase
                .from('mercado')
                .select('*')
                .eq('estado', 'disponible')
                .order('creada_en', { ascending: false });

            if (error) throw error;
            this.ordenesDisponibles = data || [];
            
            console.log(`📊 ${this.ordenesDisponibles.length} órdenes disponibles cargadas`);
        } catch (error) {
            console.error('❌ Error cargando órdenes:', error);
            this.ordenesDisponibles = [];
        }
    }

    async cargarMisOrdenes() {
        if (!this.escuderia) return;
        
        try {
            const { data, error } = await this.supabase
                .from('mercado')
                .select('*')
                .eq('vendedor_id', this.escuderia.id)
                .in('estado', ['disponible', 'pendiente'])
                .order('creada_en', { ascending: false });

            if (error) throw error;
            this.misOrdenes = data || [];
            
            console.log(`📦 ${this.misOrdenes.length} mis órdenes cargadas`);
        } catch (error) {
            console.error('❌ Error cargando mis órdenes:', error);
            this.misOrdenes = [];
        }
    }

    async mostrarModalCompra(ordenId) {
        const orden = this.ordenesDisponibles.find(o => o.id === ordenId);
        if (!orden) return;

        const modal = document.getElementById('modal-compra');
        const modalBody = document.getElementById('modal-compra-body');

        modalBody.innerHTML = `
            <div class="compra-info">
                <div class="info-item">
                    <strong>Pieza:</strong> ${orden.pieza_nombre}
                </div>
                <div class="info-item">
                    <strong>Área:</strong> ${this.getAreaNombre(orden.area)}
                </div>
                <div class="info-item">
                    <strong>Nivel:</strong> ${orden.nivel}
                </div>
                <div class="info-item">
                    <strong>Calidad:</strong> ${orden.calidad}
                </div>
                <div class="info-item">
                    <strong>Vendedor:</strong> ${orden.vendedor_nombre}
                </div>
                <div class="info-item precio-final">
                    <strong>Precio:</strong> ${orden.precio.toLocaleString()}€
                </div>
            </div>
            
            <div class="saldo-info">
                Tu saldo actual: <strong>${this.escuderia.dinero.toLocaleString()}€</strong>
            </div>
            
            ${this.escuderia.dinero >= orden.precio ? `
                <button class="btn-confirmar" id="btn-confirmar-compra">
                    <i class="fas fa-check-circle"></i> CONFIRMAR COMPRA (${orden.precio.toLocaleString()}€)
                </button>
            ` : `
                <div class="error-saldo">
                    <i class="fas fa-exclamation-triangle"></i>
                    Saldo insuficiente. Necesitas ${(orden.precio - this.escuderia.dinero).toLocaleString()}€ más.
                </div>
            `}
        `;

        modal.style.display = 'flex';

        // Evento confirmar compra
        const confirmBtn = document.getElementById('btn-confirmar-compra');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                await this.procesarCompra(orden);
            });
        }
    }

    async procesarCompra(orden) {
        try {
            // 1. Verificar saldo nuevamente
            if (this.escuderia.dinero < orden.precio) {
                alert('❌ Saldo insuficiente');
                return;
            }

            // 2. Actualizar orden como vendida
            const { error: updateError } = await this.supabase
                .from('mercado')
                .update({
                    estado: 'vendido',
                    vendida_en: new Date().toISOString(),
                    comprador_id: this.escuderia.id
                })
                .eq('id', orden.id);

            if (updateError) throw updateError;

            // 3. Transferir pieza al comprador (crear copia en su almacén)
            const { error: piezaError } = await this.supabase
                .from('almacen_piezas')
                .insert([{
                    escuderia_id: this.escuderia.id,
                    area: orden.area,
                    nivel: orden.nivel,
                    calidad: orden.calidad,
                    puntos_base: this.calcularPuntosBase(orden.nivel, orden.calidad),
                    equipada: false,
                    fabricada_en: new Date().toISOString(),
                    comprada_en: new Date().toISOString(),
                    precio_compra: orden.precio
                }]);

            if (piezaError) throw piezaError;

            // 4. Descontar dinero al comprador
            this.escuderia.dinero -= orden.precio;
            await this.actualizarDineroEscuderia();

            // 5. Añadir dinero al vendedor (en un sistema real, necesitarías webhook o trigger)
            // Por ahora, solo mostramos mensaje

            // 6. Actualizar UI
            this.ocultarModales();
            await this.cargarTabMercado();

            // 7. Mostrar notificación
            this.mostrarNotificacion(`✅ Compra realizada: ${orden.pieza_nombre} por ${orden.precio.toLocaleString()}€`, 'success');

        } catch (error) {
            console.error('❌ Error procesando compra:', error);
            this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
        }
    }

    async cancelarVenta(ordenId) {
        if (!confirm('¿Cancelar esta venta? La pieza volverá a tu almacén.')) return;

        try {
            const { error } = await this.supabase
                .from('mercado')
                .update({ estado: 'cancelado' })
                .eq('id', ordenId)
                .eq('vendedor_id', this.escuderia.id);

            if (error) throw error;

            await this.cargarTabMercado();
            this.mostrarNotificacion('✅ Venta cancelada', 'success');

        } catch (error) {
            console.error('❌ Error cancelando venta:', error);
            this.mostrarNotificacion('❌ Error cancelando venta', 'error');
        }
    }

    ocultarModales() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // ========================
    // 7. FUNCIONES PARA VENDER DESDE ALMACÉN
    // ========================
    async mostrarModalVenta(pieza) {
        const modal = document.getElementById('modal-venta');
        const modalBody = document.getElementById('modal-venta-body');

        // Calcular precio sugerido basado en nivel y calidad
        const precioSugerido = this.calcularPrecioSugerido(pieza.nivel, pieza.calidad);

        modalBody.innerHTML = `
            <div class="venta-info">
                <div class="info-item">
                    <strong>Pieza:</strong> ${this.getAreaNombre(pieza.area)} Nivel ${pieza.nivel}
                </div>
                <div class="info-item">
                    <strong>Calidad:</strong> ${pieza.calidad}
                </div>
                <div class="info-item">
                    <strong>Puntos base:</strong> ${pieza.puntos_base || 0}
                </div>
            </div>
            
            <div class="precio-sugerido">
                <i class="fas fa-lightbulb"></i>
                Precio sugerido: <strong>${precioSugerido.toLocaleString()}€</strong>
                <p class="small">Basado en nivel, calidad y precios de mercado</p>
            </div>
            
            <div class="form-group">
                <label for="precio-venta">Precio de venta (€)</label>
                <input type="number" id="precio-venta" value="${precioSugerido}" min="1000" max="1000000" step="1000">
                <p class="small">Mínimo: 1,000€ - Máximo: 1,000,000€</p>
            </div>
            
            <div class="precios-mercado">
                <h4><i class="fas fa-store"></i> Precios similares en mercado:</h4>
                ${this.generarPreciosSimilares(pieza.area, pieza.nivel)}
            </div>
            
            <button class="btn-confirmar" id="btn-confirmar-venta">
                <i class="fas fa-tag"></i> PUBLICAR VENTA
            </button>
        `;

        modal.style.display = 'flex';

        // Evento confirmar venta
        document.getElementById('btn-confirmar-venta').addEventListener('click', async () => {
            await this.procesarVenta(pieza);
        });
    }

    async procesarVenta(pieza) {
        const precioInput = document.getElementById('precio-venta');
        const precio = parseInt(precioInput.value);

        if (!precio || precio < 1000 || precio > 1000000) {
            alert('❌ Precio inválido. Debe estar entre 1,000€ y 1,000,000€');
            return;
        }

        try {
            // 1. Crear orden en mercado
            const { error: mercadoError } = await this.supabase
                .from('mercado')
                .insert([{
                    vendedor_id: this.escuderia.id,
                    vendedor_nombre: this.escuderia.nombre,
                    pieza_id: pieza.id,
                    pieza_nombre: `${this.getAreaNombre(pieza.area)} Nivel ${pieza.nivel}`,
                    area: pieza.area,
                    nivel: pieza.nivel,
                    calidad: pieza.calidad,
                    precio: precio,
                    estado: 'disponible',
                    creada_en: new Date().toISOString()
                }]);

            if (mercadoError) throw mercadoError;

            // 2. Marcar pieza como en venta en almacén
            const { error: piezaError } = await this.supabase
                .from('almacen_piezas')
                .update({ en_venta: true })
                .eq('id', pieza.id);

            if (piezaError) throw piezaError;

            // 3. Actualizar UI
            this.ocultarModales();
            this.mostrarNotificacion(`✅ Pieza puesta en venta por ${precio.toLocaleString()}€`, 'success');

            // 4. Recargar mercado
            await this.cargarTabMercado();

            // 5. Recargar almacén si está abierto
            if (window.almacenManager && typeof window.almacenManager.cargarPiezas === 'function') {
                await window.almacenManager.cargarPiezas();
            }

        } catch (error) {
            console.error('❌ Error procesando venta:', error);
            this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
        }
    }

    calcularPrecioSugerido(nivel, calidad) {
        const base = nivel * 5000;
        const multiplicador = {
            'Común': 1,
            'Rara': 2,
            'Épica': 4,
            'Legendaria': 8
        }[calidad] || 1;
        
        return Math.round(base * multiplicador);
    }

    calcularPuntosBase(nivel, calidad) {
        const base = nivel * 10;
        const multiplicador = {
            'Común': 1,
            'Rara': 1.5,
            'Épica': 2.5,
            'Legendaria': 4
        }[calidad] || 1;
        
        return Math.round(base * multiplicador);
    }

    generarPreciosSimilares(area, nivel) {
        const similares = this.ordenesDisponibles.filter(
            orden => orden.area === area && orden.nivel === nivel
        ).slice(0, 3);

        if (similares.length === 0) {
            return '<p class="small">No hay precios similares en el mercado</p>';
        }

        return `
            <ul class="precios-lista">
                ${similares.map(orden => `
                    <li>
                        ${orden.vendedor_nombre}: <strong>${orden.precio.toLocaleString()}€</strong>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    async actualizarDineroEscuderia() {
        try {
            const { error } = await this.supabase
                .from('escuderias')
                .update({ dinero: this.escuderia.dinero })
                .eq('id', this.escuderia.id);

            if (error) throw error;
        } catch (error) {
            console.error('❌ Error actualizando dinero:', error);
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `notification ${tipo}`;
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                notificacion.remove();
            }, 300);
        }, 3000);
    }
}

// ========================
// 8. INICIALIZACIÓN GLOBAL
// ========================
window.MercadoManager = MercadoManager;

// Crear instancia global
if (!window.mercadoManager) {
    window.mercadoManager = new MercadoManager();
    console.log('🛒 MercadoManager creado globalmente');
}
