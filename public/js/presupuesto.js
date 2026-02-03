// ========================
// PRESUPUESTO.JS - Versión FUNCIONAL (sin async)
// ========================
console.log('💰 Sistema de presupuesto FUNCIONAL cargado');

class PresupuestoManager {
    constructor() {
        this.supabase = window.supabase;
        this.escuderia = null;
        this.transacciones = [];
        this.ultimaActualizacion = null;
        this.semanaInicio = this.obtenerInicioSemana();
        this.categorias = {
            'produccion': 'Fabricación',
            'mercado': 'Mercado', 
            'sueldos': 'Sueldos',
            'apuestas': 'Apuestas',
            'ingresos': 'Ingresos',
            'otros': 'Otros'
        };
    }

    obtenerInicioSemana() {
        const hoy = new Date();
        const lunes = new Date(hoy);
        const dia = hoy.getDay();
        const diff = dia === 0 ? 6 : dia - 1;
        lunes.setDate(hoy.getDate() - diff);
        lunes.setHours(0, 0, 0, 0);
        return lunes;
    }

    async inicializar(escuderia) {
        console.log('💰 Inicializando para:', escuderia.nombre);
        this.escuderia = escuderia;
        await this.cargarTransacciones();
        return true;
    }

    async cargarTransacciones(dias = 7) {
        try {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            
            const { data, error } = await this.supabase
                .from('transacciones')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .gte('fecha', fechaLimite.toISOString())
                .order('fecha', { ascending: false })
                .limit(100);

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

    // VERSIÓN FUNCIONAL - SIN ASYNC, NO DA ERRORES
    generarHTMLPresupuesto() {
        const saldoActual = this.escuderia.dinero || 0;
        
        // Filtrar transacciones de esta semana
        const transaccionesSemana = this.transacciones.filter(t => {
            if (!t || !t.fecha) return false;
            try {
                const fechaTrans = new Date(t.fecha);
                return fechaTrans >= this.semanaInicio;
            } catch {
                return false;
            }
        });
        
        // Calcular resumen
        const resumen = this.calcularResumenSemanal(transaccionesSemana);
        
        // Calcular presupuesto inicial aproximado
        const presupuestoInicial = saldoActual - resumen.balanceSemanal;
        
        return `
            <div class="presupuesto-container compacto">
                <!-- Encabezado compacto -->
                <div class="presupuesto-header compacto">
                    <h2><i class="fas fa-coins"></i> PRESUPUESTO SEMANAL</h2>
                    <div class="semana-info">
                        Semana del ${this.formatFecha(this.semanaInicio)} al ${this.formatFecha(new Date())}
                    </div>
                </div>
                
                <!-- RESUMEN SEMANAL -->
                <div class="resumen-semanal">
                    <div class="resumen-header">
                        <h3><i class="fas fa-chart-pie"></i> RESUMEN SEMANAL</h3>
                        <div class="saldo-total ${saldoActual >= 0 ? 'positivo' : 'negativo'}">
                            ${Number(saldoActual).toLocaleString('es-ES', {minimumFractionDigits: 2})}€
                        </div>
                    </div>
                    
                    <div class="resumen-grid">
                        <div class="resumen-item">
                            <div class="resumen-label">Presupuesto Inicial</div>
                            <div class="resumen-valor">${Number(presupuestoInicial).toLocaleString('es-ES', {minimumFractionDigits: 2})}€</div>
                        </div>
                        
                        <div class="resumen-item positivo">
                            <div class="resumen-label">Ingresos Totales</div>
                            <div class="resumen-valor">+${Number(resumen.ingresosTotales).toLocaleString('es-ES', {minimumFractionDigits: 2})}€</div>
                        </div>
                        
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Gastos Producción</div>
                            <div class="resumen-valor">-${Number(resumen.gastosProduccion).toLocaleString('es-ES', {minimumFractionDigits: 2})}€</div>
                        </div>
                        
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Gastos Mercado</div>
                            <div class="resumen-valor">-${Number(resumen.gastosMercado).toLocaleString('es-ES', {minimumFractionDigits: 2})}€</div>
                        </div>
                        
                        <div class="resumen-item negativo">
                            <div class="resumen-label">Sueldos</div>
                            <div class="resumen-valor">-${Number(resumen.gastosSueldos).toLocaleString('es-ES', {minimumFractionDigits: 2})}€</div>
                        </div>
                        
                        <div class="resumen-item balance">
                            <div class="resumen-label">BALANCE SEMANAL</div>
                            <div class="resumen-valor ${resumen.balanceSemanal >= 0 ? 'positivo' : 'negativo'}">
                                ${resumen.balanceSemanal >= 0 ? '+' : ''}${Number(resumen.balanceSemanal).toLocaleString('es-ES', {minimumFractionDigits: 2})}€
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- TRANSACCIONES DETALLADAS -->
                <div class="transacciones-detalladas">
                    <div class="transacciones-header">
                        <h3><i class="fas fa-list"></i> MOVIMIENTOS SEMANALES</h3>
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
                    border-left: 3px solid #333;
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
                
                .transaccion-ingreso {
                    border-left-color: #4CAF50;
                }
                
                .transaccion-gasto {
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
                
                .positivo { color: #4CAF50; }
                .negativo { color: #F44336; }
                
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
        if (!transaccion) return '';
        
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
        const claseTipo = esIngreso ? 'transaccion-ingreso' : 'transaccion-gasto';
        const categoria = transaccion.categoria || 'otros';
        const nombreCategoria = this.categorias[categoria] || categoria;
        
        let icono = 'fa-receipt';
        if (categoria === 'produccion') icono = 'fa-industry';
        else if (categoria === 'mercado') icono = 'fa-shopping-cart';
        else if (categoria === 'sueldos') icono = 'fa-user-tie';
        else if (categoria === 'apuestas') icono = 'fa-dice';
        
        return `
            <div class="transaccion-item compacto ${claseTipo}">
                <div class="transaccion-info compacto">
                    <div class="transaccion-descripcion compacto">
                        <i class="fas ${icono} fa-xs" style="margin-right: 6px; opacity: 0.7;"></i>
                        ${transaccion.descripcion || 'Sin descripción'}
                    </div>
                    <div class="transaccion-meta compacto">
                        <span class="transaccion-fecha">${dia} ${hora}</span>
                        <span class="transaccion-categoria">${nombreCategoria}</span>
                    </div>
                </div>
                <div class="transaccion-monto compacto ${esIngreso ? 'positivo' : 'negativo'}">
                    ${signo}${Math.abs(Number(transaccion.cantidad || 0)).toLocaleString('es-ES', {minimumFractionDigits: 2})}€
                </div>
            </div>
        `;
    }

    calcularResumenSemanal(transacciones) {
        let gastosProduccion = 0;
        let gastosMercado = 0;
        let gastosSueldos = 0;
        let ingresosTotales = 0;
        let gastosOtros = 0;
        
        transacciones.forEach(t => {
            if (!t) return;
            
            const cantidad = Number(t.cantidad || 0);
            const categoria = t.categoria || 'otros';
            
            if (t.tipo === 'ingreso') {
                ingresosTotales += cantidad;
            } else {
                switch (categoria) {
                    case 'produccion':
                        gastosProduccion += cantidad;
                        break;
                    case 'mercado':
                        gastosMercado += cantidad;
                        break;
                    case 'sueldos':
                        gastosSueldos += cantidad;
                        break;
                    default:
                        gastosOtros += cantidad;
                        break;
                }
            }
        });
        
        const gastosTotales = gastosProduccion + gastosMercado + gastosSueldos + gastosOtros;
        const balanceSemanal = ingresosTotales - gastosTotales;
        
        return {
            gastosProduccion,
            gastosMercado,
            gastosSueldos,
            gastosOtros,
            ingresosTotales,
            gastosTotales,
            balanceSemanal
        };
    }

    formatFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit'
        });
    }

    async registrarTransaccion(tipo, cantidad, descripcion, categoria = null, referencia = null) {
        try {
            if (!this.escuderia || !this.escuderia.id) {
                console.error('❌ No hay escudería');
                return false;
            }
            
            const transaccion = {
                escuderia_id: this.escuderia.id,
                tipo: tipo,
                cantidad: cantidad,
                descripcion: descripcion,
                categoria: categoria || 'otros',
                referencia: referencia,
                fecha: new Date().toISOString(),
                saldo_resultante: this.escuderia.dinero || 0
            };
    
            const { error } = await this.supabase
                .from('transacciones')
                .insert([transaccion]);
    
            if (error) throw error;
            
            this.transacciones.unshift(transaccion);
            console.log(`✅ Transacción: ${tipo} ${cantidad}€ - ${descripcion}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error:', error);
            return false;
        }
    }
}

// Inicialización (IGUAL que tu original)
window.PresupuestoManager = PresupuestoManager;
if (!window.presupuestoManager) {
    window.presupuestoManager = new PresupuestoManager();
    console.log('💰 PresupuestoManager creado');
}
