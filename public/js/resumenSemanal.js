// ========================
// resumenSemanal.js - Sistema de Resumen Semanal de Presupuesto
// CON CATEGORÍAS DINÁMICAS
// ========================
console.log('📅 Sistema de resumen semanal cargado');

class ResumenSemanalManager {
    constructor() {
        this.presupuestoManager = window.presupuestoManager;
        this.notificacionesManager = window.notificacionesManager;
        this.ultimoResumenEnviado = null;
        this.resumenesGuardados = []; // Para histórico
    }

    // ========================
    // INICIALIZAR
    // ========================
    inicializar() {
        console.log('📅 Inicializando ResumenSemanalManager...');
        
        // Verificar al inicio
        setTimeout(() => {
            this.verificarYLanzarResumen();
        }, 5000);
        
        // Verificar cada hora
        setInterval(() => {
            this.verificarYLanzarResumen();
        }, 3600000); // 1 hora
        
        console.log('✅ ResumenSemanalManager inicializado');
    }

    // ========================
    // VERIFICAR SI ES LUNES Y LANZAR RESUMEN
    // ========================
    async verificarYLanzarResumen() {
        try {
            const ahora = new Date();
            const diaSemana = ahora.getDay(); // 0 = domingo, 1 = lunes
            const hora = ahora.getHours();
            
            // Si es lunes entre 00:00 y 01:00
            if (diaSemana === 1 && hora === 0) {
                
                // Calcular fechas de la semana anterior
                const fechaFin = new Date(ahora);
                fechaFin.setHours(0, 0, 0, 0); // Lunes 00:00 actual
                
                const fechaInicio = new Date(fechaFin);
                fechaInicio.setDate(fechaInicio.getDate() - 7); // Lunes anterior 00:00
                
                const semanaKey = fechaInicio.toISOString().split('T')[0];
                
                // Verificar si ya enviamos resumen para esta semana
                if (this.ultimoResumenEnviado === semanaKey) {
                    console.log('📅 Resumen de esta semana ya enviado');
                    return;
                }
                
                console.log('📅 Es lunes, generando resumen semanal...');
                
                // Obtener datos de la semana
                const datos = await this.obtenerDatosSemana(fechaInicio, fechaFin);
                
                if (!datos) {
                    console.log('📅 No hay datos para esta semana');
                    return;
                }
                
                // Guardar resumen
                const resumenId = this.guardarResumen(semanaKey, datos);
                
                // Crear notificación
                await this.crearNotificacionResumen(resumenId, datos);
                
                this.ultimoResumenEnviado = semanaKey;
                console.log('✅ Resumen semanal enviado');
            }
        } catch (error) {
            console.error('❌ Error verificando resumen semanal:', error);
        }
    }

    // ========================
    // OBTENER DATOS DE LA SEMANA (CON CATEGORÍAS DINÁMICAS)
    // ========================
    async obtenerDatosSemana(fechaInicio, fechaFin) {
        try {
            if (!window.presupuestoManager || !window.presupuestoManager.escuderiaId) {
                console.error('❌ No hay presupuestoManager inicializado');
                return null;
            }

            const escuderiaId = window.presupuestoManager.escuderiaId;
            
            // Obtener TODAS las transacciones de la semana (sin límite de días)
            const { data: transacciones, error } = await window.supabase
                .from('transacciones')
                .select('*')
                .eq('escuderia_id', escuderiaId)
                .gte('fecha', fechaInicio.toISOString())
                .lt('fecha', fechaFin.toISOString())
                .order('fecha', { ascending: true });

            if (error) throw error;

            if (!transacciones || transacciones.length === 0) {
                return null;
            }

            // Calcular saldo inicial (primera transacción de la semana)
            const saldoInicial = transacciones[0]?.saldo_resultante - 
                (transacciones[0]?.tipo === 'ingreso' ? -transacciones[0]?.cantidad : transacciones[0]?.cantidad);

            // Saldo final (última transacción de la semana)
            const saldoFinal = transacciones[transacciones.length - 1]?.saldo_resultante || 0;

            // ===== CATEGORÍAS DINÁMICAS =====
            const ingresosPorCategoria = {};
            const gastosPorCategoria = {};

            let totalIngresos = 0;
            let totalGastos = 0;

            // Procesar cada transacción y agrupar por categoría
            transacciones.forEach(t => {
                const cantidad = Number(t.cantidad || 0);
                const categoria = t.categoria || 'otros';

                if (t.tipo === 'ingreso') {
                    totalIngresos += cantidad;
                    ingresosPorCategoria[categoria] = (ingresosPorCategoria[categoria] || 0) + cantidad;
                } else {
                    totalGastos += cantidad;
                    gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + cantidad;
                }
            });

            // Separar publicidad si existe como categoría o si viene del pago dominical
            let publicidad = 0;
            if (ingresosPorCategoria['publicidad']) {
                publicidad = ingresosPorCategoria['publicidad'];
            } else {
                // Buscar en transacciones por descripción
                transacciones.forEach(t => {
                    if (t.tipo === 'ingreso' && t.descripcion?.includes('Pago dominical')) {
                        publicidad += Number(t.cantidad || 0);
                    }
                });
            }

            const balance = totalIngresos - totalGastos;

            return {
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFin: fechaFin.toISOString().split('T')[0],
                saldoInicial,
                saldoFinal,
                totalIngresos,
                totalGastos,
                balance,
                ingresosPorCategoria,  // ← OBJETO DINÁMICO
                gastosPorCategoria,     // ← OBJETO DINÁMICO
                publicidad,             // ← PUBLICIDAD POR SEPARADO
                transacciones: transacciones.length
            };

        } catch (error) {
            console.error('❌ Error obteniendo datos de la semana:', error);
            return null;
        }
    }

    // ========================
    // GUARDAR RESUMEN
    // ========================
    guardarResumen(semanaKey, datos) {
        const resumen = {
            id: `semana_${semanaKey}_${Date.now()}`,
            semanaKey,
            fecha: new Date().toISOString(),
            datos
        };
        
        this.resumenesGuardados.unshift(resumen);
        
        // Mantener solo últimos 10 resúmenes
        if (this.resumenesGuardados.length > 10) {
            this.resumenesGuardados.pop();
        }
        
        return resumen.id;
    }

    // ========================
    // CREAR NOTIFICACIÓN DE RESUMEN
    // ========================
    async crearNotificacionResumen(resumenId, datos) {
        if (!window.notificacionesManager || !window.f1Manager?.user?.id) {
            console.error('❌ No hay notificacionesManager o usuario');
            return;
        }

        const titulo = `📊 RESUMEN SEMANAL ${datos.fechaInicio} al ${datos.fechaFin}`;
        
        let mensaje = '';
        if (datos.balance >= 0) {
            mensaje = `✅ Balance POSITIVO: +${datos.balance.toLocaleString()}€ | Ingresos: ${datos.totalIngresos.toLocaleString()}€ | Gastos: ${datos.totalGastos.toLocaleString()}€`;
        } else {
            mensaje = `⚠️ Balance NEGATIVO: ${datos.balance.toLocaleString()}€ | Ingresos: ${datos.totalIngresos.toLocaleString()}€ | Gastos: ${datos.totalGastos.toLocaleString()}€`;
        }

        await window.notificacionesManager.crearNotificacion(
            window.f1Manager.user.id,
            'resumen_semanal',
            titulo,
            mensaje,
            resumenId // Guardamos el ID del resumen para abrirlo después
        );
    }

    // ========================
    // MOSTRAR MODAL CON RESUMEN SEMANAL
    // ========================
    mostrarResumenSemanal(resumenId = null) {
        let datos = null;
        
        if (resumenId) {
            // Buscar resumen por ID
            const resumen = this.resumenesGuardados.find(r => r.id === resumenId);
            datos = resumen?.datos;
        } else {
            // Mostrar el último resumen
            datos = this.resumenesGuardados[0]?.datos;
        }

        if (!datos) {
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('📅 No hay resumen semanal disponible', 'info');
            }
            return;
        }

        this.mostrarModal(datos);
    }

    // ========================
    // GENERAR HTML DE CATEGORÍAS DINÁMICAMENTE
    // ========================
    generarHTMLCategorias(datos) {
        const formatoMoneda = (num) => {
            return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
        };

        let htmlIngresos = '';
        let htmlGastos = '';

        // INGRESOS - TODAS LAS CATEGORÍAS
        for (const [categoria, total] of Object.entries(datos.ingresosPorCategoria)) {
            // No mostrar publicidad aquí si ya la mostramos aparte
            if (categoria === 'publicidad') continue;
            
            htmlIngresos += `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                    <span style="text-transform: capitalize;">${categoria}:</span>
                    <span style="color: #4CAF50;">${formatoMoneda(total)}</span>
                </div>
            `;
        }

        // GASTOS - TODAS LAS CATEGORÍAS
        for (const [categoria, total] of Object.entries(datos.gastosPorCategoria)) {
            htmlGastos += `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                    <span style="text-transform: capitalize;">${categoria}:</span>
                    <span style="color: #e10600;">${formatoMoneda(total)}</span>
                </div>
            `;
        }

        // Si no hay ingresos (aparte de publicidad)
        if (htmlIngresos === '') {
            htmlIngresos = '<div style="color: #888; text-align: center; padding: 10px;">No hay ingresos esta semana</div>';
        }

        // Si no hay gastos
        if (htmlGastos === '') {
            htmlGastos = '<div style="color: #888; text-align: center; padding: 10px;">No hay gastos esta semana</div>';
        }

        return { htmlIngresos, htmlGastos };
    }

    // ========================
    // MOSTRAR MODAL
    // ========================
    mostrarModal(datos) {
        // Eliminar modal existente si lo hay
        const modalExistente = document.getElementById('modal-resumen-semanal');
        if (modalExistente) modalExistente.remove();

        const { htmlIngresos, htmlGastos } = this.generarHTMLCategorias(datos);

        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'modal-resumen-semanal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        // Contenedor del contenido
        const contenido = document.createElement('div');
        contenido.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00d2be;
            border-radius: 15px;
            padding: 25px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            box-shadow: 0 0 30px rgba(0, 210, 190, 0.5);
        `;

        const formatoMoneda = (num) => {
            return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
        };

        const balanceClass = datos.balance >= 0 ? 'color: #4CAF50;' : 'color: #e10600;';
        const balanceSigno = datos.balance >= 0 ? '+' : '';

        contenido.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #00d2be; padding-bottom: 10px;">
                <h2 style="margin: 0; color: #00d2be; font-family: 'Orbitron', sans-serif;">
                    <i class="fas fa-calendar-alt"></i> RESUMEN SEMANAL
                </h2>
                <button onclick="document.getElementById('modal-resumen-semanal').remove()" style="background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 8px;">
                <div style="font-size: 0.9rem; color: #aaa;">SEMANA</div>
                <div style="font-size: 1.1rem; font-weight: bold; color: #00d2be;">${datos.fechaInicio} al ${datos.fechaFin}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                    <div style="font-size: 0.8rem; color: #aaa;">SALDO INICIAL</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: white;">${formatoMoneda(datos.saldoInicial)}</div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; border-left: 4px solid #00d2be;">
                    <div style="font-size: 0.8rem; color: #aaa;">SALDO FINAL</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: white;">${formatoMoneda(datos.saldoFinal)}</div>
                </div>
            </div>
            
            <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.8rem; color: #aaa;">BALANCE SEMANAL</div>
                        <div style="font-size: 1.5rem; font-weight: bold; ${balanceClass}">${balanceSigno}${formatoMoneda(datos.balance)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8rem; color: #aaa;">Total operaciones</div>
                        <div style="font-size: 1.1rem; color: #00d2be;">${datos.transacciones}</div>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <!-- INGRESOS -->
                <div style="background: rgba(76, 175, 80, 0.1); border-radius: 8px; padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 1rem;">
                        <i class="fas fa-arrow-up"></i> INGRESOS
                    </h3>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">
                        ${formatoMoneda(datos.totalIngresos)}
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                        ${htmlIngresos}
                    </div>
                </div>
                
                <!-- GASTOS -->
                <div style="background: rgba(225, 6, 0, 0.1); border-radius: 8px; padding: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #e10600; font-size: 1rem;">
                        <i class="fas fa-arrow-down"></i> GASTOS
                    </h3>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #e10600; margin-bottom: 10px;">
                        ${formatoMoneda(datos.totalGastos)}
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                        ${htmlGastos}
                    </div>
                </div>
            </div>
            
            <!-- PUBLICIDAD (si existe) -->
            ${datos.publicidad > 0 ? `
            <div style="margin-top: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 8px; padding: 10px; text-align: center;">
                <span style="color: #FFD700;"><i class="fas fa-star"></i> PUBLICIDAD/ESTRELLAS: ${formatoMoneda(datos.publicidad)}</span>
            </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; font-size: 0.8rem; color: #aaa;">
                <i class="fas fa-info-circle"></i> Puedes volver a ver este resumen desde la pestaña Presupuesto
            </div>
        `;

        modal.appendChild(contenido);
        document.body.appendChild(modal);

        // Cerrar con ESC
        const cerrarHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', cerrarHandler);
            }
        };
        document.addEventListener('keydown', cerrarHandler);

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ========================
    // OBTENER ÚLTIMO RESUMEN (para el botón de presupuesto)
    // ========================
    getUltimoResumen() {
        return this.resumenesGuardados[0]?.datos || null;
    }
}

// Exportar al ámbito global
window.ResumenSemanalManager = ResumenSemanalManager;

// Inicialización automática
document.addEventListener('auth-completado', () => {
    console.log('📅 Inicializando ResumenSemanalManager desde auth-completado');
    
    setTimeout(() => {
        if (!window.resumenSemanalManager) {
            window.resumenSemanalManager = new ResumenSemanalManager();
            window.resumenSemanalManager.inicializar();
        }
    }, 3000);
});

console.log('✅ Sistema de resumen semanal listo');
