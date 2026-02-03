// ========================
// PRESUPUESTO.JS - Sistema de registro financiero SEMANAL
// ========================
console.log('💰 Sistema de presupuesto semanal cargado');

class PresupuestoManager {
    constructor() {
        this.supabase = window.supabase;
        this.escuderia = null;
        this.transacciones = [];
        this.ultimaActualizacion = null;
        this.semanaInicio = this.obtenerInicioSemana();
    }

    // Obtener el lunes de la semana actual
    obtenerInicioSemana() {
        const hoy = new Date();
        const lunes = new Date(hoy);
        const dia = hoy.getDay(); // 0=domingo, 1=lunes...
        const diff = dia === 0 ? 6 : dia - 1; // Si es domingo, retrocede 6 días
        lunes.setDate(hoy.getDate() - diff);
        lunes.setHours(0, 0, 0, 0);
        return lunes;
    }

    async inicializar(escuderia) {
        console.log('💰 Inicializando PresupuestoManager para:', escuderia.nombre);
        this.escuderia = escuderia;
        await this.cargarTransaccionesSemanales();
        return true;
    }

    // Cargar transacciones de la semana actual (Lunes a hoy)
    async cargarTransaccionesSemanales() {
        try {
            const { data, error } = await this.supabase
                .from('transacciones')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .gte('fecha', this.semanaInicio.toISOString())
                .order('fecha', { ascending: false });

            if (error) throw error;
            
            this.transacciones = data || [];
            this.ultimaActualizacion = new Date();
            console.log(`📊 ${this.transacciones.length} transacciones de esta semana`);
            
            return this.transacciones;
            
        } catch (error) {
            console.error('❌ Error cargando transacciones semanales:', error);
            return [];
        }
    }

    async registrarTransaccion(tipo, cantidad, descripcion, categoria = null, referencia = null) {
        try {
            // VERIFICAR SI TENEMOS ESCUDERÍA
            if (!this.escuderia || !this.escuderia.id) {
                console.error('❌ No hay escudería para registrar transacción');
                
                if (window.f1Manager && window.f1Manager.escuderia) {
                    this.escuderia = window.f1Manager.escuderia;
                    console.log('✅ Escudería obtenida de f1Manager');
                } else {
                    console.error('❌ No se puede obtener la escudería');
                    return false;
                }
            }
            
            // Categorías automáticas basadas en descripción
            if (!categoria) {
                if (descripcion.includes('fabricar') || descripcion.includes('producción')) {
                    categoria = 'produccion';
                } else if (descripcion.includes('mercado') || descripcion.includes('venta') || descripcion.includes('compra')) {
                    categoria = 'mercado';
                } else if (descripcion.includes('sueldo') || descripcion.includes('estratega')) {
                    categoria = 'sueldos';
                } else if (descripcion.includes('ingreso') || descripcion.includes('premio')) {
                    categoria = 'ingresos';
                } else {
                    categoria = 'otros';
                }
            }
            
            const transaccion = {
                escuderia_id: this.escuderia.id,
                tipo: tipo, // 'ingreso' o 'gasto'
                cantidad: cantidad,
                descripcion: descripcion,
                categoria: categoria,
                referencia: referencia,
                fecha: new Date().toISOString(),
                saldo_resultante: this.escuderia.dinero || 0
            };
    
            const { error } = await this.supabase
                .from('transacciones')
                .insert([transaccion]);
    
            if (error) throw error;
            
            // Actualizar lista local
            this.transacciones.unshift(transaccion);
            
            console.log(`✅ Transacción registrada: ${tipo} ${cantidad}€ - ${descripcion} (${categoria})`);
            return true;
            
        } catch (error) {
            console.error('❌ Error registrando transacción:', error);
            return false;
        }
    }

    generarHTMLPresupuesto() {
        const saldoActual = this.escuderia.dinero || 0;
        const transaccionesSemana = this.transacciones;
        
        // Calcular resumen semanal
        const resumenSemanal = this.calcularResumenSemanal();
        
        return `
            <div class="presupuesto-container compacto">
                <!-- Encabezado compacto -->
                <div class="presupuesto-header compacto">
                    <h2><i class="fas fa-coins"></i> PRESUPUESTO SEMANAL</h2>
                    <div class="semana-info">
                        Semana del ${this.formatFecha(this.semanaInicio)} al ${this.formatFecha(new Date())}
                    </div>
                </div>
                
                <!-- RESUMEN SEMANAL COMPACTO -->
                <div class="resumen-semanal">
                    <div class="resumen-header">
                        <h3><i class="fas fa-chart-pie"></i> RESUMEN SEMANAL</h3>
                        <div class="saldo-total ${saldoActual >= 0 ? 'positivo' : 'negativo'}">
                            ${saldoActual.toLocaleString()}€
                        </div>
                    </div>
                    
                    <div class="resumen-grid">
                        <!-- Presupuesto inicial -->
                        <div class="resumen-item">
                            <div class="resumen-label">Presupuesto Inicial</div>
                            <div class="resumen-valor">${resumenSemanal.presupuestoInicial.toLocaleString()}€</div>
                        </div>
                        
                        <!-- Ingresos -->
                        <div class="resumen-item positivo">
                            <div class="resumen-label">Ingresos Totales</div>
                            <div class="resumen-valor">+${resumenSemanal.ingresosTotales.toLocaleString()}€</div>
                        </div>
                        
                        <!-- Gastos por categoría -->
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Gastos Producción</div>
                            <div class="resumen-valor">-${resumenSemanal.gastosProduccion.toLocaleString()}€</div>
                        </div>
                        
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Gastos Mercado</div>
                            <div class="resumen-valor">-${resumenSemanal.gastosMercado.toLocaleString()}€</div>
                        </div>
                        
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Sueldos Estrategas</div>
                            <div class="resumen-valor">-${resumenSemanal.gastosSueldos.toLocaleString()}€</div>
                        </div>
                        
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Otros Gastos</div>
                            <div class="resumen-valor">-${resumenSemanal.gastosOtros.toLocaleString()}€</div>
                        </div>
                        
                        <!-- Balance semanal -->
                        <div class="resumen-item balance">
                            <div class="resumen-label">BALANCE SEMANAL</div>
                            <div class="resumen-valor ${resumenSemanal.balanceSemanal >= 0 ? 'positivo' : 'negativo'}">
                                ${resumenSemanal.balanceSemanal >= 0 ? '+' : ''}${resumenSemanal.balanceSemanal.toLocaleString()}€
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- TRANSACCIONES DETALLADAS -->
                <div class="transacciones-detalladas">
                    <div class="transacciones-header">
                        <h3><i class="fas fa-list"></i> MOVIMIENTOS DIARIOS</h3>
                        <span class="contador">${transaccionesSemana.length} operaciones</span>
                    </div>
                    
                    ${transaccionesSemana.length === 0 ? 
                        `<div class="sin-transacciones compacto">
                            <p>📭 No hay movimientos esta semana</p>
                        </div>` : 
                        `<div class="transacciones-lista compacto">
                            ${transaccionesSemana.map(trans => this.generarHTMLTransaccionCompacta(trans)).join('')}
                        </div>`
                    }
                </div>
            </div>
            
            <style>
                /* ESTILOS COMPACTOS */
                .presupuesto-container.compacto {
                    padding: 10px;
                    color: white;
                    max-width: 800px;
                    margin: 0 auto;
                    font-size: 0.9rem;
                }
                
                .presupuesto-header.compacto {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(0, 210, 190, 0.2);
                }
                
                .presupuesto-header.compacto h2 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.2rem;
                    color: white;
                    margin-bottom: 5px;
                }
                
                .semana-info {
                    color: #aaa;
                    font-size: 0.8rem;
                }
                
                /* RESUMEN SEMANAL */
                .resumen-semanal {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .resumen-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .resumen-header h3 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.95rem;
                    color: white;
                }
                
                .saldo-total {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.1rem;
                    font-weight: bold;
                }
                
                .resumen-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 8px;
                }
                
                .resumen-item {
                    padding: 8px 10px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 4px;
                    border-left: 3px solid;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .resumen-item.balance {
                    background: rgba(0, 210, 190, 0.1);
                    border-left-color: #00d2be;
                    grid-column: 1 / -1;
                    margin-top: 5px;
                }
                
                .resumen-label {
                    color: #ddd;
                    font-size: 0.8rem;
                }
                
                .resumen-valor {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                
                /* TRANSACCIONES DETALLADAS */
                .transacciones-detalladas {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                    padding: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .transacciones-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .transacciones-header h3 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.95rem;
                    color: white;
                }
                
                .contador {
                    background: rgba(0, 210, 190, 0.2);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                }
                
                /* LISTA COMPACTA DE TRANSACCIONES */
                .transacciones-lista.compacto {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .transaccion-item.compacto {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 10px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 4px;
                    border-left: 3px solid;
                    font-size: 0.85rem;
                    margin: 1px 0;
                }
                
                .transaccion-compacta.ingreso {
                    border-left-color: #4CAF50;
                }
                
                .transaccion-compacta.gasto {
                    border-left-color: #F44336;
                }
                
                .transaccion-info.compacto {
                    flex: 1;
                    min-width: 0;
                }
                
                .transaccion-descripcion.compacto {
                    font-weight: normal;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 2px;
                }
                
                .transaccion-meta.compacto {
                    display: flex;
                    gap: 10px;
                    font-size: 0.75rem;
                    color: #aaa;
                }
                
                .transaccion-categoria {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 1px 6px;
                    border-radius: 3px;
                }
                
                .transaccion-monto.compacto {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    margin-left: 10px;
                }
                
                .sin-transacciones.compacto {
                    text-align: center;
                    padding: 20px 10px;
                    color: #888;
                    font-size: 0.9rem;
                }
                
                /* COLORES */
                .positivo { color: #4CAF50; }
                .negativo { color: #F44336; }
                
                /* RESPONSIVE */
                @media (max-width: 768px) {
                    .resumen-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .transaccion-item.compacto {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 5px;
                    }
                    
                    .transaccion-monto.compacto {
                        margin-left: 0;
                        align-self: flex-end;
                    }
                    
                    .transaccion-meta.compacto {
                        flex-wrap: wrap;
                        gap: 5px;
                    }
                }
                
                @media (max-width: 480px) {
                    .presupuesto-container.compacto {
                        padding: 8px;
                        font-size: 0.85rem;
                    }
                    
                    .resumen-item {
                        padding: 6px 8px;
                    }
                }
            </style>
        `;
    }

    generarHTMLTransaccionCompacta(transaccion) {
        const fecha = new Date(transaccion.fecha);
        const hora = fecha.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dia = fecha.toLocaleDateString('es-ES', { 
            weekday: 'short',
            day: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase());
        
        const esIngreso = transaccion.tipo === 'ingreso';
        const signo = esIngreso ? '+' : '-';
        const claseTipo = esIngreso ? 'ingreso' : 'gasto';
        
        // Icono según categoría
        let icono = 'fa-receipt';
        if (transaccion.categoria === 'produccion') icono = 'fa-industry';
        else if (transaccion.categoria === 'mercado') icono = 'fa-shopping-cart';
        else if (transaccion.categoria === 'sueldos') icono = 'fa-user-tie';
        else if (transaccion.categoria === 'ingresos') icono = 'fa-money-bill-wave';
        
        return `
            <div class="transaccion-item compacto transaccion-compacta ${claseTipo}">
                <div class="transaccion-info compacto">
                    <div class="transaccion-descripcion compacto">
                        <i class="fas ${icono} fa-xs" style="margin-right: 6px; opacity: 0.7;"></i>
                        ${transaccion.descripcion}
                    </div>
                    <div class="transaccion-meta compacto">
                        <span class="transaccion-fecha">${dia} ${hora}</span>
                        <span class="transaccion-categoria">${transaccion.categoria || 'general'}</span>
                    </div>
                </div>
                <div class="transaccion-monto compacto ${esIngreso ? 'positivo' : 'negativo'}">
                    ${signo}${Math.abs(transaccion.cantidad).toLocaleString()}€
                </div>
            </div>
        `;
    }

    calcularResumenSemanal() {
        const transaccionesSemana = this.transacciones;
        
        // Presupuesto inicial (dinero al inicio de semana)
        // Esto debería venir de una tabla de histórico o calcularse
        const presupuestoInicial = this.escuderia.dinero_inicial || 1000000;
        
        // Totales por categoría
        const gastosProduccion = this.calcularTotalPorCategoria('gasto', 'produccion');
        const gastosMercado = this.calcularTotalPorCategoria('gasto', 'mercado');
        const gastosSueldos = this.calcularTotalPorCategoria('gasto', 'sueldos');
        const gastosOtros = this.calcularTotalPorCategoria('gasto', 'otros') + 
                          this.calcularTotalPorCategoria('gasto', null) +
                          this.calcularTotalPorCategoria('gasto', 'general');
        
        const ingresosTotales = transaccionesSemana
            .filter(t => t.tipo === 'ingreso')
            .reduce((total, t) => total + t.cantidad, 0);
        
        const gastosTotales = gastosProduccion + gastosMercado + gastosSueldos + gastosOtros;
        const balanceSemanal = ingresosTotales - gastosTotales;
        
        return {
            presupuestoInicial,
            gastosProduccion,
            gastosMercado,
            gastosSueldos,
            gastosOtros,
            ingresosTotales,
            gastosTotales,
            balanceSemanal
        };
    }

    calcularTotalPorCategoria(tipo, categoria) {
        return this.transacciones
            .filter(t => t.tipo === tipo && t.categoria === categoria)
            .reduce((total, t) => total + t.cantidad, 0);
    }

    formatFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit'
        });
    }
}

// Inicialización global
window.PresupuestoManager = PresupuestoManager;
if (!window.presupuestoManager) {
    window.presupuestoManager = new PresupuestoManager();
    console.log('💰 PresupuestoManager semanal creado globalmente');
}
