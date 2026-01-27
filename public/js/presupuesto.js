// ========================
// PRESUPUESTO.JS - Sistema de registro financiero
// ========================
console.log('💰 Sistema de presupuesto cargado');

class PresupuestoManager {
    constructor() {
        this.supabase = window.supabase;
        this.escuderia = null;
        this.transacciones = [];
        this.ultimaActualizacion = null;
    }

    async inicializar(escuderia) {
        console.log('💰 Inicializando PresupuestoManager para:', escuderia.nombre);
        this.escuderia = escuderia;
        await this.cargarTransacciones();
        return true;
    }

    async cargarTransacciones(dias = 1) {
        try {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            
            const { data, error } = await this.supabase
                .from('transacciones')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .gte('fecha', fechaLimite.toISOString())
                .order('fecha', { ascending: false })
                .limit(50);

            if (error) throw error;
            
            this.transacciones = data || [];
            this.ultimaActualizacion = new Date();
            console.log(`📊 ${this.transacciones.length} transacciones cargadas`);
            
            return this.transacciones;
            
        } catch (error) {
            console.error('❌ Error cargando transacciones:', error);
            return [];
        }
    }

    async registrarTransaccion(tipo, cantidad, descripcion, referencia = null) {
        try {
            const transaccion = {
                escuderia_id: this.escuderia.id,
                tipo: tipo, // 'ingreso' o 'gasto'
                cantidad: cantidad,
                descripcion: descripcion,
                referencia: referencia, // ID de orden, fabricación, etc.
                fecha: new Date().toISOString(),
                saldo_resultante: this.escuderia.dinero
            };

            const { error } = await this.supabase
                .from('transacciones')
                .insert([transaccion]);

            if (error) throw error;
            
            console.log(`✅ Transacción registrada: ${tipo} ${cantidad}€ - ${descripcion}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error registrando transacción:', error);
            return false;
        }
    }

    generarHTMLPresupuesto() {
        const saldoActual = this.escuderia.dinero || 0;
        const ingresos24h = this.calcularTotalTipo('ingreso');
        const gastos24h = this.calcularTotalTipo('gasto');
        
        return `
            <div class="presupuesto-container">
                <!-- Header con stats -->
                <div class="presupuesto-header">
                    <h1><i class="fas fa-chart-line"></i> PRESUPUESTO</h1>
                    <p class="subtitle">Registro de todas tus transacciones</p>
                </div>
                
                <!-- Stats rápidos -->
                <div class="presupuesto-stats">
                    <div class="stat-saldo">
                        <div class="stat-label">SALDO ACTUAL</div>
                        <div class="stat-valor ${saldoActual >= 0 ? 'positivo' : 'negativo'}">
                            ${saldoActual.toLocaleString()}€
                        </div>
                    </div>
                    <div class="stat-ingresos">
                        <div class="stat-label">INGRESOS (24h)</div>
                        <div class="stat-valor positivo">
                            +${ingresos24h.toLocaleString()}€
                        </div>
                    </div>
                    <div class="stat-gastos">
                        <div class="stat-label">GASTOS (24h)</div>
                        <div class="stat-valor negativo">
                            -${gastos24h.toLocaleString()}€
                        </div>
                    </div>
                </div>
                
                <!-- Lista de transacciones -->
                <div class="transacciones-container">
                    <h3><i class="fas fa-history"></i> ÚLTIMAS OPERACIONES</h3>
                    
                    ${this.transacciones.length === 0 ? 
                        `<div class="sin-transacciones">
                            <p>📭 No hay transacciones en las últimas 24 horas</p>
                            <p class="small">Tus compras y ventas aparecerán aquí</p>
                        </div>` : 
                        `<div class="transacciones-list">
                            ${this.transacciones.map(trans => this.generarHTMLTransaccion(trans)).join('')}
                        </div>`
                    }
                </div>
            </div>
            
            <style>
                /* ESTILOS PRESUPUESTO */
                .presupuesto-container {
                    padding: 15px;
                    color: white;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .presupuesto-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                }
                
                .presupuesto-header h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    color: white;
                    margin-bottom: 5px;
                }
                
                .presupuesto-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 25px;
                }
                
                .stat-saldo, .stat-ingresos, .stat-gastos {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .stat-label {
                    color: #aaa;
                    font-size: 0.8rem;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .stat-valor {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.3rem;
                    font-weight: bold;
                }
                
                .positivo { color: #4CAF50; }
                .negativo { color: #F44336; }
                
                .transacciones-container {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    padding: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .transacciones-container h3 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1rem;
                    margin-bottom: 15px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .transacciones-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .transaccion-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 15px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 6px;
                    border-left: 4px solid;
                }
                
                .transaccion-ingreso {
                    border-left-color: #4CAF50;
                }
                
                .transaccion-gasto {
                    border-left-color: #F44336;
                }
                
                .transaccion-info {
                    flex: 1;
                }
                
                .transaccion-descripcion {
                    font-weight: bold;
                    margin-bottom: 4px;
                    color: white;
                }
                
                .transaccion-fecha {
                    color: #aaa;
                    font-size: 0.75rem;
                }
                
                .transaccion-monto {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    font-size: 1.1rem;
                    white-space: nowrap;
                    margin-left: 15px;
                }
                
                .sin-transacciones {
                    text-align: center;
                    padding: 30px 15px;
                    color: #888;
                }
                
                .sin-transacciones p {
                    margin: 5px 0;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .presupuesto-stats {
                        grid-template-columns: 1fr;
                    }
                    
                    .transaccion-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    
                    .transaccion-monto {
                        margin-left: 0;
                        align-self: flex-end;
                    }
                }
            </style>
        `;
    }

    generarHTMLTransaccion(transaccion) {
        const fecha = new Date(transaccion.fecha);
        const hora = fecha.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const esIngreso = transaccion.tipo === 'ingreso';
        const signo = esIngreso ? '+' : '-';
        const clase = esIngreso ? 'transaccion-ingreso' : 'transaccion-gasto';
        
        return `
            <div class="transaccion-item ${clase}">
                <div class="transaccion-info">
                    <div class="transaccion-descripcion">${transaccion.descripcion}</div>
                    <div class="transaccion-fecha">${hora}</div>
                </div>
                <div class="transaccion-monto ${esIngreso ? 'positivo' : 'negativo'}">
                    ${signo}${Math.abs(transaccion.cantidad).toLocaleString()}€
                </div>
            </div>
        `;
    }

    calcularTotalTipo(tipo) {
        return this.transacciones
            .filter(t => t.tipo === tipo)
            .reduce((total, t) => total + t.cantidad, 0);
    }
}

// Inicialización global
window.PresupuestoManager = PresupuestoManager;
if (!window.presupuestoManager) {
    window.presupuestoManager = new PresupuestoManager();
    console.log('💰 PresupuestoManager creado globalmente');
}
