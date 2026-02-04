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
                
                <!-- Stats rápidos en horizontal -->
                <div class="mercado-stats-horizontal">
                    <div class="stat-card-horizontal">
                        <div class="stat-icon-horizontal">💰</div>
                        <div class="stat-content-horizontal">
                            <div class="stat-value-horizontal">${this.ordenesDisponibles.length}</div>
                            <div class="stat-label-horizontal">Disponibles</div>
                        </div>
                    </div>
                    <div class="stat-card-horizontal">
                        <div class="stat-icon-horizontal">🏎️</div>
                        <div class="stat-content-horizontal">
                            <div class="stat-value-horizontal">${this.misOrdenes.length}</div>
                            <div class="stat-label-horizontal">Mis órdenes</div>
                        </div>
                    </div>
                    <div class="stat-card-horizontal">
                        <div class="stat-icon-horizontal">📈</div>
                        <div class="stat-content-horizontal">
                            <div class="stat-value-horizontal">${this.calcularPrecioPromedio()}€</div>
                            <div class="stat-label-horizontal">Precio avg</div>
                        </div>
                    </div>
                </div>
                
                <!-- Tabla de compras (siempre visible, sin pestañas) -->
                <div class="mercado-tabla-container">
                    <h3 class="tabla-titulo">Órdenes disponibles para comprar (${this.ordenesDisponibles.length})</h3>
                    ${this.ordenesDisponibles.length === 0 ? 
                        `<div class="sin-ordenes">
                            <p>😔 No hay órdenes disponibles en este momento</p>
                            <p class="small">Sé el primero en vender una pieza</p>
                        </div>` : 
                        `<div class="table-responsive">
                            <table class="ordenes-table-compact">
                                <thead>
                                    <tr>
                                        <th>Pieza</th>
                                        <th>Nivel</th>
                                        <th>Vendedor</th>
                                        <th>Precio</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    ${this.ordenesDisponibles.map(orden => {
                                        const esMiOrden = orden.vendedor_id === this.escuderia.id;
                                        
                                        return `
                                            <tr>
                                                <td class="pieza-nombre-col">${orden.pieza_nombre}</td>
                                                <td class="nivel-col">${orden.nivel}</td>
                                                <td class="vendedor-col">${orden.vendedor_nombre}</td>
                                                <td class="precio-col">${orden.precio.toLocaleString()}€</td>
                                                <td class="accion-col">
                                                    ${esMiOrden ? 
                                                        `<button class="btn-cancelar-compact" data-orden-id="${orden.id}">
                                                            CANCELAR
                                                        </button>` : 
                                                        `<button class="btn-comprar-compact" data-orden-id="${orden.id}">
                                                            COMPRAR
                                                        </button>`
                                                    }
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>`
                    }
                </div>
                
                <!-- Modales -->
                <div id="modal-compra" class="modal-overlay" style="display: none;">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h3><i class="fas fa-cart-plus"></i> CONFIRMAR COMPRA</h3>
                            <button class="btn-cerrar-modal">&times;</button>
                        </div>
                        <div class="modal-body" id="modal-compra-body"></div>
                    </div>
                </div>
                
                <style>
                    /* ==================== */
                    /* ESTILOS MERCADO COMPACTO */
                    /* ==================== */
                    .mercado-container {
                        padding: 12px;
                        color: white;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    
                    .mercado-header {
                        text-align: center;
                        margin-bottom: 15px;
                        padding-bottom: 12px;
                        border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                    }
                    
                    .mercado-header h1 {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 1.3rem;
                        color: white;
                        margin-bottom: 5px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    
                    .subtitle {
                        color: #aaa;
                        font-size: 0.8rem;
                    }
                    
                    /* Stats compactos */
                    .mercado-stats-horizontal {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 15px;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    
                    .stat-card-horizontal {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 6px;
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        flex: 1;
                        min-width: 110px;
                        max-width: 130px;
                    }
                    
                    .stat-icon-horizontal {
                        font-size: 1.2rem;
                        width: 35px;
                        height: 35px;
                        background: rgba(0, 210, 190, 0.1);
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .stat-value-horizontal {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 1.1rem;
                        font-weight: bold;
                        color: white;
                        margin-bottom: 2px;
                    }
                    
                    .stat-label-horizontal {
                        color: #aaa;
                        font-size: 0.7rem;
                        white-space: nowrap;
                    }
                    
                    /* Contenedor tabla */
                    .mercado-tabla-container {
                        margin-top: 12px;
                    }
                    
                    .tabla-titulo {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 0.9rem;
                        color: white;
                        margin-bottom: 10px;
                        padding-left: 3px;
                    }
                    
                    /* Tabla ultra compacta */
                    .table-responsive {
                        overflow-x: auto;
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    
                    .ordenes-table-compact {
                        width: 100%;
                        border-collapse: collapse;
                        min-width: 500px;
                    }
                    
                    .ordenes-table-compact th {
                        background: rgba(0, 210, 190, 0.15);
                        color: white;
                        padding: 8px 4px;
                        text-align: left;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                        white-space: nowrap;
                    }
                    
                    .ordenes-table-compact td {
                        padding: 8px 4px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        color: #ccc;
                        font-size: 0.8rem;
                        white-space: nowrap;
                    }
                    
                    .ordenes-table-compact tr:hover {
                        background: rgba(255, 255, 255, 0.05);
                    }
                    
                    /* Columnas ajustadas al texto */
                    .pieza-nombre-col {
                        font-weight: bold;
                        color: white;
                        min-width: 120px;
                        max-width: 140px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    
                    .nivel-col {
                        text-align: center;
                        min-width: 40px;
                        max-width: 50px;
                    }
                    
                    .vendedor-col {
                        min-width: 80px;
                        max-width: 100px;
                        color: #aaa;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    
                    .precio-col {
                        color: #FFD700;
                        font-weight: bold;
                        min-width: 70px;
                        max-width: 90px;
                    }
                    
                    .accion-col {
                        min-width: 70px;
                        max-width: 80px;
                    }
                    
                    .btn-comprar-compact {
                        background: linear-gradient(135deg, #4CAF50, #388E3C);
                        border: none;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        cursor: pointer;
                        font-weight: bold;
                        white-space: nowrap;
                    }
                    .btn-cancelar-compact {
                        background: linear-gradient(135deg, #FF5722, #D32F2F);
                        border: none;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        cursor: pointer;
                        font-weight: bold;
                        white-space: nowrap;
                    }
                    
                    .btn-cancelar-compact:hover {
                        background: linear-gradient(135deg, #FF7043, #E53935);
                    }                    
                    .btn-comprar-compact:hover {
                        background: linear-gradient(135deg, #66BB6A, #4CAF50);
                    }
                    
                    .sin-ordenes {
                        text-align: center;
                        padding: 30px 15px;
                        color: #888;
                    }
                    
                    .sin-ordenes p {
                        margin: 5px 0;
                        font-size: 0.9rem;
                    }
                    
                    .sin-ordenes .small {
                        font-size: 0.8rem;
                        color: #666;
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
                        border-radius: 12px;
                        width: 90%;
                        max-width: 450px;
                        border: 2px solid #00d2be;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                    }
                    
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 15px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .modal-header h3 {
                        margin: 0;
                        color: white;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 0.9rem;
                    }
                    
                    .btn-cerrar-modal {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.3rem;
                        cursor: pointer;
                        padding: 0;
                        width: 25px;
                        height: 25px;
                    }
                    
                    .modal-body {
                        padding: 15px;
                    }
                    
                    /* Responsive móvil ultra compacto */
                    @media (max-width: 768px) {
                        .mercado-container {
                            padding: 8px;
                        }
                        
                        .mercado-header h1 {
                            font-size: 1.1rem;
                            gap: 6px;
                        }
                        
                        .subtitle {
                            font-size: 0.75rem;
                        }
                        
                        .mercado-stats-horizontal {
                            gap: 6px;
                        }
                        
                        .stat-card-horizontal {
                            padding: 8px;
                            gap: 8px;
                            min-width: 95px;
                            max-width: 110px;
                        }
                        
                        .stat-icon-horizontal {
                            font-size: 1rem;
                            width: 30px;
                            height: 30px;
                        }
                        
                        .stat-value-horizontal {
                            font-size: 0.9rem;
                        }
                        
                        .stat-label-horizontal {
                            font-size: 0.65rem;
                        }
                        
                        .tabla-titulo {
                            font-size: 0.85rem;
                            margin-bottom: 8px;
                        }
                        
                        .ordenes-table-compact th,
                        .ordenes-table-compact td {
                            padding: 6px 3px;
                            font-size: 0.75rem;
                        }
                        
                        .pieza-nombre-col {
                            min-width: 100px;
                            max-width: 120px;
                        }
                        
                        .nivel-col {
                            min-width: 35px;
                            max-width: 45px;
                        }
                        
                        .vendedor-col {
                            min-width: 70px;
                            max-width: 90px;
                        }
                        
                        .precio-col {
                            min-width: 65px;
                            max-width: 80px;
                        }
                        
                        .accion-col {
                            min-width: 65px;
                            max-width: 75px;
                        }
                        
                        .btn-comprar-compact {
                            padding: 5px 8px;
                            font-size: 0.65rem;
                        }
                        .btn-cancelar-compact {
                            padding: 5px 8px;
                            font-size: 0.65rem;
                        }                        
                    }
                    
                    @media (max-width: 480px) {
                        .mercado-container {
                            padding: 5px;
                        }
                        
                        .mercado-header {
                            margin-bottom: 10px;
                            padding-bottom: 8px;
                        }
                        
                        .mercado-header h1 {
                            font-size: 1rem;
                        }
                        
                        .subtitle {
                            font-size: 0.7rem;
                        }
                        
                        .stat-card-horizontal {
                            min-width: 85px;
                            max-width: 100px;
                            padding: 6px;
                        }
                        
                        .stat-icon-horizontal {
                            width: 28px;
                            height: 28px;
                            font-size: 0.9rem;
                        }
                        
                        .stat-value-horizontal {
                            font-size: 0.85rem;
                        }
                        
                        .stat-label-horizontal {
                            font-size: 0.6rem;
                        }
                        
                        .tabla-titulo {
                            font-size: 0.8rem;
                        }
                        
                        .ordenes-table-compact th,
                        .ordenes-table-compact td {
                            padding: 5px 2px;
                            font-size: 0.7rem;
                        }
                        
                        .pieza-nombre-col {
                            min-width: 90px;
                            max-width: 110px;
                        }
                        
                        .nivel-col {
                            min-width: 30px;
                            max-width: 40px;
                        }
                        
                        .vendedor-col {
                            min-width: 60px;
                            max-width: 80px;
                        }
                        
                        .precio-col {
                            min-width: 60px;
                            max-width: 75px;
                        }
                        
                        .accion-col {
                            min-width: 60px;
                            max-width: 70px;
                        }
                        
                        .btn-comprar-compact {
                            padding: 4px 6px;
                            font-size: 0.6rem;
                        }
                        .btn-cancelar-compact {
                            padding: 4px 6px;
                            font-size: 0.6rem;
                        }                        
                        .table-responsive {
                            margin: 0 -5px;
                            border-radius: 0;
                            border-left: none;
                            border-right: none;
                        }
                    }
                    
                    @media (max-width: 360px) {
                        .ordenes-table-compact th,
                        .ordenes-table-compact td {
                            padding: 4px 1px;
                            font-size: 0.65rem;
                        }
                        
                        .btn-comprar-compact {
                            padding: 3px 5px;
                            font-size: 0.55rem;
                        }
                        .btn-cancelar-compact {
                            padding: 3px 5px;
                            font-size: 0.55rem;
                        }                        
                        .stat-card-horizontal {
                            min-width: 75px;
                            padding: 5px;
                        }
                        
                        .stat-icon-horizontal {
                            width: 25px;
                            height: 25px;
                        }
                    }
                </style>
            </div>
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
        // Botones comprar
        document.querySelectorAll('.btn-comprar-compact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ordenId = e.target.dataset.ordenId;
                this.mostrarModalCompra(ordenId);
            });
        });
    
        // Botones cancelar
        document.querySelectorAll('.btn-cancelar-compact').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const ordenId = e.target.dataset.ordenId;
                // ELIMINAR EL CONFIRM DE AQUÍ
                await this.cancelarVenta(ordenId);
            });
        });
    
        // Cerrar modales
        document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.ocultarModales();
            });
        });
    
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.ocultarModales();
                }
            });
        });
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
            // 1. Verificar saldo
            if (this.escuderia.dinero < orden.precio) {
                alert('❌ Saldo insuficiente');
                return;
            }
    
            // 2. ENCONTRAR LA PIEZA ORIGINAL DEL VENDEDOR
            const { data: piezasOriginales, error: findError } = await this.supabase
                .from('almacen_piezas')
                .select('*')
                .eq('id', orden.pieza_id);
            
            if (findError || !piezasOriginales || piezasOriginales.length === 0) {
                throw new Error('No se encontró la pieza original');
            }
            
            const piezaOriginal = piezasOriginales[0];
    
            // 3. TRANSFERIR la pieza al comprador (NO crear nueva)
            const { error: transferPiezaError } = await this.supabase
                .from('almacen_piezas')
                .update({
                    escuderia_id: this.escuderia.id,
                    en_venta: false,
                    comprada_en: new Date().toISOString(),
                    precio_compra: orden.precio
                })
                .eq('id', orden.pieza_id);
            
            if (transferPiezaError) throw transferPiezaError;
    
            // 4. Y 5. TRANSFERIR DINERO CON LA FUNCIÓN SEGURA
            const { error: transferDineroError } = await this.supabase.rpc(  // ← NOMBRE DIFERENTE
                'procesar_compra_mercado',
                {
                    p_orden_id: orden.id,
                    p_comprador_id: this.escuderia.id,
                    p_monto: orden.precio
                }
            );
            
            if (transferDineroError) {  // ← USA NUEVO NOMBRE
                console.log('⚠️ Error en transferencia de dinero:', transferDineroError.message);
            }
            
            // 6. Actualizar el dinero local del comprador
            this.escuderia.dinero -= orden.precio;
            await this.actualizarDineroEscuderia();
    
            // 7. Marcar orden como vendida  // ← AHORA ES 7, NO 6
            const { error: updateError } = await this.supabase
                .from('mercado')
                .update({
                    estado: 'vendido',
                    vendida_en: new Date().toISOString(),
                    comprador_id: this.escuderia.id
                })
                .eq('id', orden.id);
    
            if (updateError) throw updateError;
    
            // 8. Actualizar UI
            this.ocultarModales();
            await this.cargarTabMercado();
    
            // 9. Mostrar notificación
            this.mostrarNotificacion(`✅ Compra realizada: ${orden.pieza_nombre} por ${orden.precio.toLocaleString()}€`, 'success');

            // 10. REGISTRAR TRANSACCIÓN PARA EL COMPRADOR
            try {
                const { error: transaccionError } = await this.supabase
                    .from('transacciones')
                    .insert([{
                        escuderia_id: this.escuderia.id,
                        tipo: 'gasto',
                        cantidad: orden.precio,
                        descripcion: `Compra mercado: ${orden.pieza_nombre} de ${orden.vendedor_nombre}`,
                        referencia: orden.id,
                        fecha: new Date().toISOString(),
                        saldo_resultante: this.escuderia.dinero - orden.precio,
                        categoria: 'mercado'
                    }]);
            } catch (error) {
                console.log('⚠️ Error registrando transacción de compra:', error);
            }

            // 11. REGISTRAR TRANSACCIÓN PARA EL VENDEDOR
            try {
                const { error: transaccionVendedorError } = await this.supabase
                    .from('transacciones')
                    .insert([{
                        escuderia_id: orden.vendedor_id,
                        tipo: 'ingreso',
                        cantidad: orden.precio,
                        descripcion: `Venta mercado: ${orden.pieza_nombre} a ${this.escuderia.nombre}`,
                        referencia: orden.id,
                        fecha: new Date().toISOString(),
                        saldo_resultante: null,
                        categoria: 'mercado'
                    }]);
            } catch (error) {
                console.log('⚠️ Error registrando transacción del vendedor:', error);
            }
    
        } catch (error) {
            console.error('❌ Error procesando compra:', error);
            this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
        }
    }
    async cancelarVenta(ordenId) {
        // ELIMINAR EL CONFIRM DE AQUÍ TAMBIÉN
        try {
            const { error } = await this.supabase
                .from('mercado')
                .update({ estado: 'cancelado' })
                .eq('id', ordenId)
                .eq('vendedor_id', this.escuderia.id);
    
            if (error) throw error;
    
            await this.cargarTabMercado();
            this.mostrarNotificacion('✅ Venta cancelada', 'success');

            // Registrar cancelación
            try {
                const { error: transaccionError } = await this.supabase
                    .from('transacciones')
                    .insert([{
                        escuderia_id: this.escuderia.id,
                        tipo: 'ajuste',
                        cantidad: 0,
                        descripcion: `Venta cancelada: Orden ${ordenId}`,
                        referencia: ordenId,
                        fecha: new Date().toISOString(),
                        saldo_resultante: this.escuderia.dinero,
                        categoria: 'mercado_cancelacion'
                    }]);
            } catch (error) {
                console.log('⚠️ Error registrando cancelación:', error);
            }
    
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
        if (!document.getElementById('modal-venta')) {
            return this.mostrarModalVentaBasico(pieza);
        }
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
                    pieza_nombre: pieza.componente,
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
// 10. MODAL BÁSICO PARA VENDER DESDE ALMACÉN
// ========================
async function mostrarModalVentaBasico(pieza) {
    console.log('🔧 Mostrando modal básico para venta desde almacén');
    
    // Crear modal simple
    const modalHTML = `
        <div id="modal-venta-rapido" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                background: #1a1a2e;
                border-radius: 10px;
                padding: 20px;
                border: 3px solid #00d2be;
                max-width: 450px;
                width: 90%;
                color: white;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #00d2be;">
                        <i class="fas fa-tag"></i> VENDER PIEZA
                    </h3>
                    <button onclick="document.getElementById('modal-venta-rapido').remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.5rem;
                        cursor: pointer;
                    ">&times;</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Pieza:</strong> ${this.getAreaNombre(pieza.area)}</p>
                    <p><strong>Nivel:</strong> ${pieza.nivel}</p>
                    <p><strong>Calidad:</strong> ${pieza.calidad || 'Normal'}</p>
                    <p><strong>Puntos:</strong> ${pieza.puntos_base || 10}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #aaa;">
                        <i class="fas fa-euro-sign"></i> Precio de venta:
                    </label>
                    <input type="number" 
                           id="precio-rapido" 
                           value="${this.calcularPrecioSugerido(pieza.nivel, pieza.calidad)}" 
                           min="1000" 
                           max="1000000" 
                           step="1000"
                           style="
                                width: 100%;
                                padding: 10px;
                                background: rgba(255,255,255,0.1);
                                border: 1px solid #00d2be;
                                border-radius: 5px;
                                color: white;
                                font-size: 1rem;
                           ">
                    <p style="font-size: 0.8rem; color: #aaa; margin-top: 5px;">
                        Precio sugerido: ${this.calcularPrecioSugerido(pieza.nivel, pieza.calidad).toLocaleString()}€
                    </p>
                </div>
                
                <button onclick="window.mercadoManager.procesarVentaRapida('${pieza.id}')" style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #00d2be, #009688);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    <i class="fas fa-check"></i> PUBLICAR VENTA
                </button>
            </div>
        </div>
    `;
    
    // Añadir al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ========================
// 11. PROCESAR VENTA RÁPIDA

// ========================
MercadoManager.prototype.procesarVentaRapida = async function(piezaId) {
    // VERIFICACIÓN CRÍTICA - HACER ESTO PRIMERO
    if (!this.escuderia || !this.escuderia.id) {
        console.error('❌ mercadoManager.escuderia es null o no tiene id:', this.escuderia);
        alert('Error: Sistema de mercado no está listo. Por favor, recarga la página.');
        return;
    }
    
    const precioInput = document.getElementById('precio-rapido');
    const precio = parseInt(precioInput.value);
    const modal = document.getElementById('modal-venta-rapido');
    
    if (!precio || precio < 1000) {
        alert('❌ Precio mínimo: 1,000€');
        return;
    }
    
    try {
        // Obtener pieza
        const { data: pieza, error } = await this.supabase
            .from('almacen_piezas')
            .select('*')
            .eq('id', piezaId)
            .eq('escuderia_id', this.escuderia.id)  // ← Usa this.escuderia.id que ya verificamos
            .single();
        
        if (error) {
            console.error('❌ Error obteniendo pieza:', error);
            alert('Error: No se pudo encontrar la pieza en tu inventario');
            return;
        }
        
        if (!pieza) {
            alert('❌ Pieza no encontrada en tu inventario');
            return;
        }
        
        // Verificar que no esté ya en venta
        const { data: yaEnVenta } = await this.supabase
            .from('mercado')
            .select('*')
            .eq('pieza_id', piezaId)
            .eq('estado', 'disponible')
            .single();
            
        if (yaEnVenta) {
            alert('⚠️ Esta pieza ya está en venta en el mercado');
            if (modal) modal.remove();
            return;
        }
        
        // Crear orden en mercado
        const { error: mercadoError } = await this.supabase
            .from('mercado')
            .insert([{
                vendedor_id: this.escuderia.id,
                vendedor_nombre: this.escuderia.nombre,
                pieza_id: piezaId,
                pieza_nombre: pieza.componente,
                area: pieza.area,
                nivel: pieza.nivel,
                calidad: pieza.calidad || 'Normal',
                precio: precio,
                estado: 'disponible',
                creada_en: new Date().toISOString()
            }]);
        
        if (mercadoError) throw mercadoError;
        
        // Marcar pieza como en venta
        await this.supabase
            .from('almacen_piezas')
            .update({ en_venta: true })
            .eq('id', piezaId);
        
        // Cerrar modal
        if (modal) modal.remove();
        
        // Mostrar confirmación
        this.mostrarNotificacion(`✅ Pieza puesta en venta por ${precio.toLocaleString()}€`, 'success');

        // Registrar transacción de "puesta en venta"
        try {
            const { error: transaccionError } = await this.supabase
                .from('transacciones')
                .insert([{
                    escuderia_id: this.escuderia.id,
                    tipo: 'ajuste',
                    cantidad: 0,
                    descripcion: `Pieza en venta: ${this.getAreaNombre(pieza.area)} Nivel ${pieza.nivel} por ${precio.toLocaleString()}€`,
                    referencia: piezaId,
                    fecha: new Date().toISOString(),
                    saldo_resultante: this.escuderia.dinero,
                    categoria: 'mercado_venta'
                }]);
        } catch (error) {
            console.log('⚠️ Error registrando venta en mercado:', error);
        }
        
        // Si está en pestaña mercado, recargar
        if (window.tabManager?.currentTab === 'mercado') {
            await this.cargarTabMercado();
        }
        
        // Actualizar almacén si está visible
        if (window.tabManager?.currentTab === 'almacen' && window.tabManager.loadAlmacenPiezas) {
            setTimeout(() => window.tabManager.loadAlmacenPiezas(), 500);
        }
        
    } catch (error) {
        console.error('❌ Error en venta rápida:', error);
        alert('❌ Error: ' + error.message);
    }
}
// ========================
// 9. FUNCIÓN PARA VENDER DESDE ALMACÉN
// ========================
async function venderPiezaDesdeAlmacen(piezaId) {
    console.log('🛒 Iniciando venta desde almacén para pieza:', piezaId);
    
    if (!this.escuderia || !this.escuderia.id) {
        this.mostrarNotificacion('❌ No se encontró tu escudería', 'error');
        return;
    }
    
    try {
        // Obtener pieza
        const { data: piezas, error } = await this.supabase
            .from('almacen_piezas')
            .select('*')
            .eq('id', piezaId)
            .eq('escuderia_id', this.escuderia.id);
        
        if (error) {
            console.error('❌ Error obteniendo pieza:', error);
            alert('Error: No se pudo encontrar la pieza en tu inventario');
            return;
        }
        
        if (!piezas || piezas.length === 0) {
            alert('❌ Pieza no encontrada en tu inventario');
            return;
        }
        
        const pieza = piezas[0];
        
        // Verificar que no esté ya en venta
        const { data: yaEnVenta } = await this.supabase
            .from('mercado')
            .select('*')
            .eq('pieza_id', piezaId)
            .eq('estado', 'disponible');
            
        if (yaEnVenta && yaEnVenta.length > 0) {
            alert('⚠️ Esta pieza ya está en venta en el mercado');
            if (modal) modal.remove();
            return;
        }
        
        // 3. Mostrar modal de venta
        await this.mostrarModalVenta(pieza);
        
    } catch (error) {
        console.error('❌ Error obteniendo pieza para vender:', error);
        this.mostrarNotificacion('❌ Error al obtener datos de la pieza', 'error');
    }
}

window.venderPiezaDesdeAlmacen = async function(piezaId) {
    console.log('🛒 Botón VENDER clickeado para pieza:', piezaId);
    
    if (!window.mercadoManager) {
        console.error('❌ mercadoManager no disponible');
        alert('El sistema de mercado no está disponible. Recarga la página.');
        return;
    }
    
    try {
        // Obtener datos de la pieza directamente
        const { data: pieza, error } = await supabase
            .from('almacen_piezas')
            .select('*')
            .eq('id', piezaId)
            .single();
        
        if (error) throw error;
        
        // Verificar que no esté equipada
        if (pieza.equipada) {
            alert('❌ No puedes vender una pieza equipada');
            return;
        }
        
        // VERIFICA SI EL MÉTODO NUEVO EXISTE
        if (typeof mostrarModalVentaBasico === 'function') {
            // Usar la función global (no this)
            await mostrarModalVentaBasico.call(window.mercadoManager, pieza);
        } else if (window.mercadoManager.mostrarModalVenta) {
            // Fallback al método viejo
            await window.mercadoManager.mostrarModalVenta(pieza);
        } else {
            alert('Sistema de mercado no disponible');
        }
        
    } catch (error) {
        console.error('❌ Error vendiendo pieza:', error);
        alert('Error al vender la pieza: ' + error.message);
    }
};


// ========================
// 8. INICIALIZACIÓN GLOBAL
// ========================
window.MercadoManager = MercadoManager;

// Crear instancia global
if (!window.mercadoManager) {
    window.mercadoManager = new MercadoManager();
    console.log('🛒 MercadoManager creado globalmente');
}
