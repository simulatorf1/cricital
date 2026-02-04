
// ========================
// INGENIERÍA Y SIMULACIÓN - ingenieria.js
// ========================
console.log('🔧 Ingeniería - Sistema de pruebas en pista cargado');

class IngenieriaManager {
    constructor(f1Manager) {
        console.log('🔬 Creando IngenieriaManager');
        this.f1Manager = f1Manager;
        this.supabase = f1Manager.supabase;
        this.user = f1Manager.user;
        this.escuderia = f1Manager.escuderia;
        this.simulacionActiva = false;
        this.tiempoRestante = 0;
        this.timerInterval = null;
        this.tiemposHistoricos = [];
        this.piezasEnPrueba = [];
        this.config = {
            tiempoBase: 83.125, // Tiempo base en segundos (01:23.125)
            tiempoMinimo: 75.382, // Tiempo mínimo en segundos (01:15.382)
            puntosMaximos: 660, // Puntos máximos alcanzables
            puntosBase: 0, // Puntos base (sin mejoras)
            vueltasPrueba: 10, // Número de vueltas en la simulación
            duracionSimulacion: 60 // Duración en segundos (1 hora)
        };
    }

    // ========================
    // CARGAR PESTAÑA INGENIERÍA
    // ========================
    async cargarTabIngenieria() {
        console.log('🔬 Cargando pestaña ingeniería...');
        
        const container = document.getElementById('tab-ingenieria');
        if (!container) {
            console.error('❌ No se encontró #tab-ingenieria');
            return;
        }
        
        try {
            // Cargar datos históricos
            await this.cargarHistorialTiempos();
            
            // Cargar piezas montadas actuales
            await this.cargarPiezasMontadasActuales();
            
            // Obtener última simulación si existe
            const ultimaSimulacion = this.tiemposHistoricos[0];
            const ultimoTiempo = ultimaSimulacion ? ultimaSimulacion.tiempo_vuelta : null;
            const puntosActuales = this.escuderia.puntos || 0;
            
            // Calcular tiempo estimado basado en puntos actuales
            const tiempoEstimado = this.calcularTiempoDesdePuntos(puntosActuales);
            
            let html = `
                <div class="ingenieria-container">
                    <div class="ingenieria-header">
                        <h2><i class="fas fa-flask"></i> PRUEBAS EN PISTA</h2>

                    </div>
                    
                    <div class="simulacion-panel">
                        <div class="simulacion-info">                   
                            <div class="info-card">
                                <div class="info-icon"><i class="fas fa-history"></i></div>
                                <div class="info-content">
                                    <div class="info-title">ÚLTIMA PRUEBA</div>
                                    <div class="info-value">${ultimoTiempo ? this.formatearTiempo(ultimoTiempo) : 'Sin datos'}</div>
                                    <div class="info-sub">${ultimaSimulacion ? this.formatearFecha(ultimaSimulacion.fecha_prueba) : 'Nunca probado'}</div>
                                </div>
                            </div>
                            

                        </div>
                        
                        <div class="simulacion-control">
                            ${this.simulacionActiva ? this.generarHTMLSimulacionActiva() : this.generarHTMLSimulacionInactiva()}
                        </div>
                    </div>
                    
                    <div class="piezas-panel">
                        <h3><i class="fas fa-cogs"></i> PIEZAS QUE SERÁN PROBADAS</h3>
                        <div id="lista-piezas-prueba" class="lista-piezas">
                            ${this.generarHTMLListaPiezas()}
                        </div>
                    </div>
                    
                    <div class="historial-panel">
                        <h3><i class="fas fa-chart-line"></i> HISTORIAL DE PRUEBAS</h3>
                        <div id="tabla-historial" class="tabla-historial">
                            ${this.generarHTMLHistorial()}
                        </div>
                    </div>
                    
                    <div class="ingenieria-footer">
                        <p><i class="fas fa-info-circle"></i> La simulación tarda 1 hora en completarse. Durante este tiempo podrás seguir usando otras secciones.</p>                        
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Agregar eventos si la simulación está inactiva
            if (!this.simulacionActiva) {
                this.agregarEventosSimulacion();
            } else {
                this.iniciarContadorVisual();
            }
            
            // Añadir estilos
            this.aplicarEstilosIngenieria();
            
        } catch (error) {
            console.error('❌ Error cargando ingeniería:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>❌ Error cargando pruebas en pista</h3>
                    <p>${error.message}</p>
                    <button onclick="window.ingenieriaManager.cargarTabIngenieria()">Reintentar</button>
                </div>
            `;
        }
    }
    
    // ========================
    // CARGAR PIEZAS MONTADAS ACTUALES
    // ========================
    async cargarPiezasMontadasActuales() {
        try {
            const { data: piezasMontadas, error } = await this.supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true)
                .order('area', { ascending: true });
            
            if (error) throw error;
            
            // Mapear nombres de áreas
            const areasMap = {
                'suelo': 'Suelo',
                'motor': 'Motor',
                'aleron_delantero': 'Alerón Delantero',
                'caja_cambios': 'Caja de Cambios',
                'pontones': 'Pontones',
                'suspension': 'Suspensión',
                'aleron_trasero': 'Alerón Trasero',
                'chasis': 'Chasis',
                'frenos': 'Frenos',
                'volante': 'Volante',
                'electronica': 'Electrónica'
            };
            
            this.piezasEnPrueba = piezasMontadas?.map(pieza => {
                // Obtener nombre personalizado de la pieza
                let nombrePieza = pieza.componente || areasMap[pieza.area] || pieza.area;
                
                if (this.f1Manager.nombresPiezas && 
                    this.f1Manager.nombresPiezas[pieza.area] && 
                    pieza.numero_global) {
                    const nombresArea = this.f1Manager.nombresPiezas[pieza.area];
                    if (pieza.numero_global <= nombresArea.length) {
                        nombrePieza = nombresArea[pieza.numero_global - 1];
                    }
                }
                
                return {
                    id: pieza.id,
                    area: areasMap[pieza.area] || pieza.area,
                    nombre: nombrePieza,
                    nivel: pieza.nivel || 1,
                    puntos_base: pieza.puntos_base || 0,
                    fabricada_en: pieza.fabricada_en,
                    area_id: pieza.area // Mantener el ID original para referencias
                };
            }) || [];
            
            console.log(`✅ ${this.piezasEnPrueba.length} piezas cargadas para prueba`);
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            this.piezasEnPrueba = [];
        }
    }
    
    // ========================
    // CARGAR HISTORIAL DE TIEMPOS
    // ========================
    async cargarHistorialTiempos() {
        try {
            const { data: historial, error } = await this.supabase
                .from('pruebas_pista')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .order('fecha_prueba', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            this.tiemposHistoricos = historial || [];
            console.log(`✅ ${this.tiemposHistoricos.length} pruebas históricas cargadas`);
            
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
            this.tiemposHistoricos = [];
        }
    }
    

    // ========================
    // CALCULAR TIEMPO DESDE PUNTOS
    // ========================
    calcularTiempoDesdePuntos(puntos) {
        const { tiempoBase, tiempoMinimo, puntosMaximos, puntosBase } = this.config;
        
        // 1. Puntos limitados entre base y máximo
        const puntosLimitados = Math.max(puntosBase, Math.min(puntos, puntosMaximos));
        
        // 2. Proporción lineal simple
        const proporcion = (puntosLimitados - puntosBase) / (puntosMaximos - puntosBase);
        
        // 3. Tiempo base calculado (SIEMPRE EL MISMO para mismos puntos)
        const tiempoCalculado = tiempoBase - (proporcion * (tiempoBase - tiempoMinimo));
        
        // 4. AZAR FIJADO: ±0.040 SIEMPRE (40 milisegundos)
        const azar = (Math.random() * 0.080) - 0.040; // Número entre -0.040 y +0.040
        
        // 5. Tiempo final con azar
        const tiempoFinal = Math.max(tiempoMinimo, tiempoCalculado + azar);
        
        console.log('⚙️ Cálculo FIJO + Azar:', {
            puntos: puntos,
            tiempoBaseCalculado: tiempoCalculado.toFixed(3) + 's', // SIEMPRE IGUAL
            azar: azar.toFixed(3) + 's', // Solo ±0.040
            tiempoFinal: tiempoFinal.toFixed(3) + 's'
        });
        
        return tiempoFinal;
    }
    
    // ========================
    // INICIAR SIMULACIÓN
    // ========================
    async iniciarSimulacion() {
        console.log('🏁 Iniciando simulación de pruebas en pista...');
        
        // Verificar si ya hay una simulación activa
        if (this.simulacionActiva) {
            this.f1Manager.showNotification('⏳ Ya hay una simulación en curso', 'info');
            return;
        }
        
        // Verificar si hay piezas montadas
        if (this.piezasEnPrueba.length === 0) {
            this.f1Manager.showNotification('❌ No hay piezas montadas para probar', 'error');
            return;
        }
        
        // Calcular tiempo estimado basado en puntos actuales
        const puntosActuales = this.escuderia.puntos || 0;
        const tiempoEstimado = this.calcularTiempoDesdePuntos(puntosActuales);
        
        // Obtener última prueba para comparación
        const ultimaPrueba = this.tiemposHistoricos[0];
        const tiempoAnterior = ultimaPrueba ? ultimaPrueba.tiempo_vuelta : null;
        
        // Determinar si hay mejora
        let mejora = null;
        if (tiempoAnterior) {
            mejora = tiempoAnterior - tiempoEstimado; // Positivo = mejora
        }
        
        // Encontrar la pieza más débil
        const piezaMasDebil = this.encontrarPiezaMasDebil();
        
        // Crear registro de simulación
        const simulacionData = {
            escuderia_id: this.escuderia.id,
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(Date.now() + (this.config.duracionSimulacion * 1000)).toISOString(),
            tiempo_estimado: tiempoEstimado,
            tiempo_anterior: tiempoAnterior,
            mejora_estimada: mejora,
            pieza_debil: piezaMasDebil ? piezaMasDebil.area : null,
            estado: 'en_progreso',
            puntos_simulacion: puntosActuales,
            piezas_probadas: this.piezasEnPrueba.map(p => ({
                id: p.id,
                area: p.area,
                nombre: p.nombre
            }))
        };
        
        try {
            // Insertar en base de datos
            const { data: simulacion, error } = await this.supabase
                .from('simulaciones_activas')
                .insert([simulacionData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar estado local
            this.simulacionActiva = true;
            this.simulacionId = simulacion.id;
            this.tiempoRestante = this.config.duracionSimulacion;
            
            // Iniciar contador
            this.iniciarContadorSimulacion();
            
            // Mostrar notificación
            this.f1Manager.showNotification('🏁 Simulación iniciada - Resultados en 1 hora', 'success');
            
            // Recargar la vista
            setTimeout(() => {
                this.cargarTabIngenieria();
            }, 500);
            
            // Programar finalización automática
            setTimeout(() => {
                this.finalizarSimulacion(simulacion.id);
            }, this.config.duracionSimulacion * 1000);
            
        } catch (error) {
            console.error('❌ Error iniciando simulación:', error);
            this.f1Manager.showNotification('❌ Error al iniciar simulación', 'error');
        }
    }
    
    // ========================
    // FINALIZAR SIMULACIÓN
    // ========================
    async finalizarSimulacion(simulacionId = this.simulacionId) {
        console.log('🏁 Finalizando simulación...');
        
        if (!simulacionId) {
            console.error('❌ No hay ID de simulación');
            return;
        }
        
        try {
            // Obtener datos de la simulación
            const { data: simulacion, error: fetchError } = await this.supabase
                .from('simulaciones_activas')
                .select('*')
                .eq('id', simulacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // USAR EL TIEMPO YA CALCULADO (que ya incluye el azar ±0.040)
            const tiempoFinal = simulacion.tiempo_estimado;
            
            // Formatear tiempo
            const tiempoFormateado = this.formatearTiempo(tiempoFinal);
            
            // Calcular mejora real
            let mejoraReal = null;
            if (simulacion.tiempo_anterior) {
                mejoraReal = simulacion.tiempo_anterior - tiempoFinal;
            }
            
            // Generar informe del ingeniero
            const informeIngeniero = this.generarInformeIngeniero(
                tiempoFinal,
                simulacion.tiempo_anterior,
                mejoraReal,
                simulacion.pieza_debil
            );
            
            // Crear registro de prueba
            const pruebaData = {
                escuderia_id: this.escuderia.id,
                fecha_prueba: new Date().toISOString(),
                tiempo_vuelta: tiempoFinal,
                tiempo_formateado: tiempoFormateado,
                mejora_vs_anterior: mejoraReal,
                puntos_simulacion: simulacion.puntos_simulacion,
                piezas_probadas: simulacion.piezas_probadas,
                informe_ingeniero: informeIngeniero,
                simulacion_id: simulacionId
            };
            
            // Insertar en historial
            const { error: insertError } = await this.supabase
                .from('pruebas_pista')
                .insert([pruebaData]);
            
            if (insertError) throw insertError;
            
            // Actualizar puntos de la escudería (si es mejor que el anterior)
            if (!simulacion.tiempo_anterior || tiempoFinal < simulacion.tiempo_anterior) {
                await this.supabase
                    .from('escuderias')
                    .update({ 
                        puntos: simulacion.puntos_simulacion,
                        ultima_prueba: new Date().toISOString()
                    })
                    .eq('id', this.escuderia.id);
                
                // Actualizar objeto local
                this.escuderia.puntos = simulacion.puntos_simulacion;
                this.escuderia.ultima_prueba = new Date().toISOString();
            }
            
            // Marcar simulación como completada
            await this.supabase
                .from('simulaciones_activas')
                .update({ 
                    estado: 'completada',
                    tiempo_final: tiempoFinal,
                    tiempo_final_formateado: tiempoFormateado,
                    informe_final: informeIngeniero,
                    completada_en: new Date().toISOString()
                })
                .eq('id', simulacionId);
            
            // Actualizar estado local
            this.simulacionActiva = false;
            this.simulacionId = null;
            this.tiempoRestante = 0;
            
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            // Recargar datos
            await this.cargarHistorialTiempos();
            
            // Mostrar notificación con informe
            this.mostrarInformeCompleto(informeIngeniero, tiempoFormateado, mejoraReal);
            
            // Recargar vista
            setTimeout(() => {
                this.cargarTabIngenieria();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error finalizando simulación:', error);
            this.f1Manager.showNotification('❌ Error al finalizar simulación', 'error');
            
            // Intentar limpiar simulación activa
            try {
                await this.supabase
                    .from('simulaciones_activas')
                    .update({ estado: 'error' })
                    .eq('id', simulacionId);
            } catch (cleanupError) {
                console.error('❌ Error limpiando simulación:', cleanupError);
            }
            
            this.simulacionActiva = false;
            this.simulacionId = null;
        }
    }
    
    // ========================
    // ENCONTRAR PIEZA MÁS DÉBIL
    // ========================
    encontrarPiezaMasDebil() {
        if (this.piezasEnPrueba.length === 0) return null;
        
        // Ordenar por puntos (ascendente) para encontrar la más débil
        const piezasOrdenadas = [...this.piezasEnPrueba].sort((a, b) => 
            (a.puntos_base || 0) - (b.puntos_base || 0)
        );
        
        return piezasOrdenadas[0];
    }
    
    // ========================
    // GENERAR INFORME DEL INGENIERO
    // ========================
    generarInformeIngeniero(tiempoActual, tiempoAnterior, mejora, piezaDebil) {
        const fecha = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const tiempoFormateado = this.formatearTiempo(tiempoActual);
        const tiempoAnteriorFormateado = tiempoAnterior ? this.formatearTiempo(tiempoAnterior) : null;
        
        let informe = `
            <div class="informe-ingeniero">
                <div class="informe-header">
                    <h4><i class="fas fa-file-alt"></i> INFORME DE PRUEBAS</h4>
                    <span class="informe-fecha">${fecha}</span>
                </div>
                
                <div class="informe-seccion">
                    <h5><i class="fas fa-stopwatch"></i> RESULTADOS DE LA SIMULACIÓN</h5>
                    <p>Después de completar ${this.config.vueltasPrueba} vueltas de prueba en condiciones controladas, el coche ha registrado un <strong>tiempo promedio por vuelta de ${tiempoFormateado}</strong>.</p>
        `;
        
        if (tiempoAnterior) {
            if (mejora > 0) {
                informe += `
                    <p class="mejora-positiva">
                        <i class="fas fa-arrow-up"></i> <strong>¡MEJORA DETECTADA!</strong><br>
                        El coche es ${this.formatearTiempo(mejora)} más rápido que en la prueba anterior (${tiempoAnteriorFormateado}).
                    </p>
                `;
            } else if (mejora < 0) {
                informe += `
                    <p class="mejora-negativa">
                        <i class="fas fa-arrow-down"></i> <strong>REGREsiÓN DETECTADA</strong><br>
                        El coche es ${this.formatearTiempo(Math.abs(mejora))} más lento que en la prueba anterior (${tiempoAnteriorFormateado}).
                    </p>
                `;
            } else {
                informe += `
                    <p class="mejora-neutra">
                        <i class="fas fa-equals"></i> <strong>TIEMPOS SIMILARES</strong><br>
                        El coche mantiene el mismo rendimiento que en la prueba anterior (${tiempoAnteriorFormateado}).
                    </p>
                `;
            }
        } else {
            informe += `
                <p class="primera-prueba">
                    <i class="fas fa-star"></i> <strong>PRIMERA PRUEBA REGISTRADA</strong><br>
                    Este será tu tiempo de referencia para futuras comparaciones.
                </p>
            `;
        }
        
        informe += `
                </div>
                
                <div class="informe-seccion">
                    <h5><i class="fas fa-search"></i> ANÁLISIS DE COMPONENTES</h5>
                    <p>El análisis tele métrico ha identificado que todos los componentes están funcionando dentro de los parámetros esperados.</p>
        `;
        
        if (piezaDebil) {
            // Buscar el nombre amigable del área
            const areasMap = {
                'suelo': 'sistema de suelo',
                'motor': 'propulsión',
                'aleron_delantero': 'alerón delantero',
                'caja_cambios': 'transmisión',
                'pontones': 'sistema de refrigeración',
                'suspension': 'suspensión',
                'aleron_trasero': 'alerón trasero',
                'chasis': 'estructura del chasis',
                'frenos': 'sistema de frenado',
                'volante': 'unidad de control',
                'electronica': 'electrónica de a bordo'
            };
            
            const areaNombre = areasMap[piezaDebil] || piezaDebil.toLowerCase();
            
            informe += `
                    <p class="recomendacion">
                        <i class="fas fa-exclamation-triangle"></i> <strong>RECOMENDACIÓN PRIORITARIA:</strong><br>
                        El área que muestra <strong>mayor margen de mejora</strong> es el <strong>${areaNombre}</strong>. Considera desarrollar mejoras en esta zona para obtener ganancias significativas de tiempo.
                    </p>
            `;
        } else {
            informe += `
                    <p class="recomendacion-neutra">
                        <i class="fas fa-check-circle"></i> <strong>BALANCE ÓPTIMO:</strong><br>
                        Todos los componentes muestran un rendimiento equilibrado. Para mejorar, considera desarrollos generales en todas las áreas.
                    </p>
            `;
        }
        
        informe += `
                </div>
                
                <div class="informe-seccion">
                    <h5><i class="fas fa-lightbulb"></i> PRÓXIMOS PASOS RECOMENDADOS</h5>
                    <ul>
                        <li>Realiza mejoras en el área identificada para maximizar ganancias</li>
                        <li>Programa otra prueba dentro de 24 horas para verificar mejoras</li>
                        <li>Consulta el histórico de pruebas para analizar tendencias</li>
                        <li>Considera ajustes finos en la configuración del coche</li>
                    </ul>
                </div>
                
                <div class="informe-firma">
                    <p><strong>Ing. Carlos Méndez</strong><br>
                    Jefe de Departamento de Pruebas<br>
                    Escudería ${this.escuderia.nombre}</p>
                </div>
            </div>
        `;
        
        return informe;
    }
    
    // ========================
    // MOSTRAR INFORME COMPLETO
    // ========================
    mostrarInformeCompleto(informeHTML, tiempoFormateado, mejora) {
        // Crear modal para el informe
        const modal = document.createElement('div');
        modal.className = 'modal-informe-ingeniero';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div class="informe-modal-container" style="
                background: #1a1a2e;
                border-radius: 10px;
                border: 2px solid #00d2be;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                padding: 25px;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #00d2be;
                ">
                    <h3 style="color: #00d2be; margin: 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-flag-checkered"></i>
                        SIMULACIÓN COMPLETADA
                    </h3>
                    <button id="cerrar-informe" style="
                        background: #e10600;
                        color: white;
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 1rem;
                    ">×</button>
                </div>
                
                <div class="resultado-destacado" style="
                    background: rgba(0,210,190,0.1);
                    border: 1px solid rgba(0,210,190,0.3);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 25px;
                    text-align: center;
                ">
                    <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 5px;">TIEMPO POR VUELTA ALCANZADO</div>
                    <div style="color: #00d2be; font-size: 2.5rem; font-weight: bold; font-family: 'Orbitron', sans-serif; margin-bottom: 10px;">
                        ${tiempoFormateado}
                    </div>
                    ${mejora ? `
                        <div style="color: ${mejora > 0 ? '#4CAF50' : '#e10600'}; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-${mejora > 0 ? 'arrow-up' : 'arrow-down'}"></i>
                            ${mejora > 0 ? 'MEJORA DE ' : 'REGREsiÓN DE '}${this.formatearTiempo(Math.abs(mejora))}
                        </div>
                    ` : ''}
                </div>
                
                ${informeHTML}
                
                <div class="modal-actions" style="
                    display: flex;
                    gap: 10px;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #333;
                ">
                    <button id="ver-historico" style="
                        flex: 1;
                        padding: 12px;
                        background: rgba(0,210,190,0.2);
                        border: 1px solid #00d2be;
                        color: #00d2be;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        <i class="fas fa-history"></i> VER HISTÓRICO
                    </button>
                    <button id="nueva-prueba" style="
                        flex: 1;
                        padding: 12px;
                        background: #00d2be;
                        border: 1px solid #00d2be;
                        color: black;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        <i class="fas fa-redo"></i> NUEVA PRUEBA
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Eventos del modal
        document.getElementById('cerrar-informe').onclick = () => modal.remove();
        document.getElementById('ver-historico').onclick = () => {
            modal.remove();
            // Desplazarse al histórico
            const historialSection = document.querySelector('.historial-panel');
            if (historialSection) {
                historialSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
        document.getElementById('nueva-prueba').onclick = () => {
            modal.remove();
            // Iniciar nueva simulación si no hay activa
            if (!this.simulacionActiva) {
                this.iniciarSimulacion();
            }
        };
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
    }
    
    // ========================
    // INICIAR CONTADOR DE SIMULACIÓN
    // ========================
    iniciarContadorSimulacion() {
        this.timerInterval = setInterval(() => {
            if (this.tiempoRestante > 0) {
                this.tiempoRestante--;
                
                // Actualizar contador visual si está visible
                const contadorElement = document.getElementById('tiempo-restante');
                if (contadorElement) {
                    contadorElement.textContent = this.formatearTiempoContador(this.tiempoRestante);
                }
                
                // Actualizar barra de progreso
                const progresoElement = document.getElementById('progreso-simulacion');
                if (progresoElement) {
                    const porcentaje = 100 - ((this.tiempoRestante / this.config.duracionSimulacion) * 100);
                    progresoElement.style.width = `${porcentaje}%`;
                }
            } else {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }, 1000);
    }
    
    // ========================
    // INICIAR CONTADOR VISUAL
    // ========================
    iniciarContadorVisual() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.tiempoRestante > 0) {
                this.tiempoRestante--;
                
                const contadorElement = document.getElementById('tiempo-restante');
                const progresoElement = document.getElementById('progreso-simulacion');
                
                if (contadorElement) {
                    contadorElement.textContent = this.formatearTiempoContador(this.tiempoRestante);
                }
                
                if (progresoElement) {
                    const porcentaje = 100 - ((this.tiempoRestante / this.config.duracionSimulacion) * 100);
                    progresoElement.style.width = `${porcentaje}%`;
                }
            }
        }, 1000);
    }
    
    // ========================
    // FORMATOS Y HTML
    // ========================
    formatearTiempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segs = Math.floor(segundos % 60);
        const milisegs = Math.floor((segundos % 1) * 1000);
        
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}.${milisegs.toString().padStart(3, '0')}`;
    }
    
    formatearTiempoContador(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
        } else {
            return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
        }
    }
    
    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
    }
    
    generarHTMLSimulacionInactiva() {
        const ultimaPrueba = this.tiemposHistoricos[0];
        const puedeProbar = this.piezasEnPrueba.length > 0;
        
        return `
            <div class="control-inactivo">
                <h4><i class="fas fa-play-circle"></i> INICIAR NUEVA SIMULACIÓN</h4>
                <p class="simulacion-desc">
                    La simulación realizará ${this.config.vueltasPrueba} vueltas de prueba en condiciones controladas para determinar el <strong>mejor tiempo por vuelta</strong> de tu coche. <i class="fas fa-info-circle"></i> <strong>Nota importante:</strong> Los tiempos nunca serán exactamente iguales incluso con las mismas piezas, ya que factores como el pilotaje, temperatura de neumáticos y condiciones de pista varían ligeramente en cada intento. El sistema registra la <strong>vuelta más rápida</strong> de las ${this.config.vueltasPrueba}, que es la referencia que debes considerar para tus pronósticos.
                </p>
            
                <button id="iniciar-simulacion-btn" class="btn-iniciar-simulacion" ${!puedeProbar ? 'disabled' : ''}>
                    <i class="fas fa-play"></i>
                    ${puedeProbar ? 'INICIAR SIMULACIÓN (1 HORA)' : 'NO HAY PIEZAS MONTADAS'}
                </button>
                
                ${ultimaPrueba ? `
                    <div class="ultima-prueba-info">
                        <p><i class="fas fa-info-circle"></i> Última prueba: ${this.formatearFecha(ultimaPrueba.fecha_prueba)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    generarHTMLSimulacionActiva() {
        const porcentaje = 100 - ((this.tiempoRestante / this.config.duracionSimulacion) * 100);
        
        return `
            <div class="control-activo">
                <h4><i class="fas fa-spinner fa-spin"></i> SIMULACIÓN EN CURSO</h4>
                <p class="simulacion-progreso-text">Analizando ${this.config.vueltasPrueba} vueltas de prueba...</p>
                
                <div class="progreso-container">
                    <div class="progreso-bar">
                        <div id="progreso-simulacion" class="progreso-fill" style="width: ${porcentaje}%"></div>
                    </div>
                    <div class="progreso-info">
                        <span class="progreso-porcentaje">${Math.round(porcentaje)}%</span>
                        <span class="progreso-tiempo" id="tiempo-restante">${this.formatearTiempoContador(this.tiempoRestante)}</span>
                    </div>
                </div>
                
                <div class="simulacion-activa-info">
                    <p><i class="fas fa-info-circle"></i> La simulación se completará automáticamente. Puedes continuar usando otras secciones.</p>
                    <p><i class="fas fa-cogs"></i> ${this.piezasEnPrueba.length} componentes siendo analizados</p>
                </div>
            </div>
        `;
    }
    
    generarHTMLListaPiezas() {
        if (this.piezasEnPrueba.length === 0) {
            return `
                <div class="sin-piezas">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No hay piezas montadas en el coche</p>
                    <p class="subtexto">Ve al <a href="#" onclick="irAlAlmacenDesdePiezas()">almacén</a> para equipar piezas antes de probar</p>
                </div>
            `;
        }
        
        return this.piezasEnPrueba.map(pieza => `
            <div class="pieza-prueba-item">
                <div class="pieza-icon">
                    ${this.obtenerIconoArea(pieza.area_id)}
                </div>
                <div class="pieza-info">
                    <div class="pieza-nombre">${pieza.nombre}</div>
                    <div class="pieza-detalle">
                        <span class="pieza-area">${pieza.area}</span>
                        <span class="pieza-nivel">Nivel ${pieza.nivel}</span>
                    </div>
                </div>
                <div class="pieza-estado">
                    <i class="fas fa-check-circle"></i>
                    <span>Lista para prueba</span>
                </div>
            </div>
        `).join('');
    }
    
    generarHTMLHistorial() {
        if (this.tiemposHistoricos.length === 0) {
            return `
                <div class="sin-historial">
                    <i class="fas fa-history"></i>
                    <p>Aún no has realizado pruebas en pista</p>
                    <p class="subtexto">Realiza tu primera simulación para comenzar el historial</p>
                </div>
            `;
        }
        
        const rows = this.tiemposHistoricos.map((prueba, index) => {
            const mejoraHTML = prueba.mejora_vs_anterior ? `
                <span class="${prueba.mejora_vs_anterior > 0 ? 'mejora-positiva' : 'mejora-negativa'}">
                    <i class="fas fa-${prueba.mejora_vs_anterior > 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${this.formatearTiempo(Math.abs(prueba.mejora_vs_anterior))}
                </span>
            ` : '<span class="sin-comparacion">—</span>';
            
            const piezasCount = prueba.piezas_probadas ? prueba.piezas_probadas.length : 0;
            
            return `
                <tr class="${index === 0 ? 'ultima-prueba' : ''}">
                    <td>${this.formatearFecha(prueba.fecha_prueba)}</td>
                    <td class="tiempo-destacado">${prueba.tiempo_formateado || this.formatearTiempo(prueba.tiempo_vuelta)}</td>
                    <td>${piezasCount} piezas</td>
                    <td>${mejoraHTML}</td>
                    <td>
                        <button class="btn-ver-detalle" onclick="window.ingenieriaManager.verDetallePrueba('${prueba.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        return `
            <table class="tabla-historial-detalle">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>TIEMPO</th>
                        <th>PIEZAS</th>
                        <th>MEJORA</th>
                        <th>DETALLE</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
    
    obtenerIconoArea(areaId) {
        const iconos = {
            'suelo': '🏎️',
            'motor': '⚙️',
            'aleron_delantero': '🪽',
            'caja_cambios': '🔄',
            'pontones': '📦',
            'suspension': '⚖️',
            'aleron_trasero': '🌪️',
            'chasis': '📊',
            'frenos': '🛑',
            'volante': '🎮',
            'electronica': '💡'
        };
        
        return iconos[areaId] || '🔧';
    }
    
    // ========================
    // AGREGAR EVENTOS
    // ========================
    agregarEventosSimulacion() {
        const btnIniciar = document.getElementById('iniciar-simulacion-btn');
        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => this.iniciarSimulacion());
        }
    }
    
    // ========================
    // VER DETALLE DE PRUEBA
    // ========================
    async verDetallePrueba(pruebaId) {
        try {
            const { data: prueba, error } = await this.supabase
                .from('pruebas_pista')
                .select('*')
                .eq('id', pruebaId)
                .single();
            
            if (error) throw error;
            
            // Mostrar modal con detalles
            this.mostrarModalDetallePrueba(prueba);
            
        } catch (error) {
            console.error('❌ Error cargando detalle de prueba:', error);
            this.f1Manager.showNotification('❌ Error al cargar detalles', 'error');
        }
    }
    
    mostrarModalDetallePrueba(prueba) {
        const modal = document.createElement('div');
        modal.className = 'modal-detalle-prueba';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
        
        const piezasHTML = prueba.piezas_probadas ? prueba.piezas_probadas.map(p => `
            <div class="pieza-detalle-item">
                <span class="pieza-area-detalle">${p.area}</span>
                <span class="pieza-nombre-detalle">${p.nombre}</span>
            </div>
        `).join('') : '<p>No hay información de piezas</p>';
        
        modal.innerHTML = `
            <div class="detalle-container" style="
                background: #1a1a2e;
                border-radius: 10px;
                border: 2px solid #00d2be;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                padding: 25px;
            ">
                <div class="detalle-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #00d2be;
                ">
                    <h3 style="color: #00d2be; margin: 0;">
                        <i class="fas fa-file-alt"></i> DETALLE DE PRUEBA
                    </h3>
                    <button id="cerrar-detalle" style="
                        background: #e10600;
                        color: white;
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-weight: bold;
                    ">×</button>
                </div>
                
                <div class="detalle-info" style="margin-bottom: 25px;">
                    <div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #aaa;">Fecha:</span>
                        <span style="color: white;">${this.formatearFecha(prueba.fecha_prueba)}</span>
                    </div>
                    <div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #aaa;">Tiempo por vuelta:</span>
                        <span style="color: #00d2be; font-weight: bold; font-size: 1.2rem;">
                            ${prueba.tiempo_formateado || this.formatearTiempo(prueba.tiempo_vuelta)}
                        </span>
                    </div>
                    <div class="info-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #aaa;">Puntos técnicos:</span>
                        <span style="color: white;">${prueba.puntos_simulacion || 'N/A'}</span>
                    </div>
                </div>
                
                ${prueba.informe_ingeniero ? `
                    <div class="detalle-informe" style="
                        background: rgba(0,0,0,0.3);
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 25px;
                    ">
                        <h4 style="color: #00d2be; margin-top: 0; margin-bottom: 10px;">
                            <i class="fas fa-user-tie"></i> INFORME DEL INGENIERO
                        </h4>
                        <div style="color: #ccc; font-size: 0.9rem; line-height: 1.5;">
                            ${prueba.informe_ingeniero}
                        </div>
                    </div>
                ` : ''}
                
                <div class="detalle-piezas" style="margin-bottom: 20px;">
                    <h4 style="color: #00d2be; margin-top: 0; margin-bottom: 10px;">
                        <i class="fas fa-cogs"></i> PIEZAS PROBADAS (${prueba.piezas_probadas ? prueba.piezas_probadas.length : 0})
                    </h4>
                    <div class="lista-piezas-detalle" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 10px;
                        max-height: 200px;
                        overflow-y: auto;
                        padding: 10px;
                        background: rgba(0,0,0,0.3);
                        border-radius: 6px;
                    ">
                        ${piezasHTML}
                    </div>
                </div>
                
                <button id="cerrar-modal" style="
                    width: 100%;
                    padding: 12px;
                    background: rgba(0,210,190,0.2);
                    border: 1px solid #00d2be;
                    color: #00d2be;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 10px;
                ">
                    <i class="fas fa-times"></i> CERRAR
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Eventos
        document.getElementById('cerrar-detalle').onclick = () => modal.remove();
        document.getElementById('cerrar-modal').onclick = () => modal.remove();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // ========================
    // APLICAR ESTILOS
    // ========================
    aplicarEstilosIngenieria() {
        if (document.getElementById('estilos-ingenieria')) return;
        
        const style = document.createElement('style');
        style.id = 'estilos-ingenieria';
        style.innerHTML = `
            /* CONTENEDOR PRINCIPAL */
            .ingenieria-container {
                padding: 15px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .ingenieria-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(0, 210, 190, 0.3);
            }
            
            .ingenieria-header h2 {
                color: #00d2be;
                margin: 0;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .puntos-actuales {
                background: rgba(0, 210, 190, 0.1);
                border: 1px solid rgba(0, 210, 190, 0.3);
                border-radius: 8px;
                padding: 8px 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .puntos-label {
                color: #aaa;
                font-size: 0.8rem;
                margin-bottom: 3px;
            }
            
            .puntos-valor {
                color: #00d2be;
                font-weight: bold;
                font-size: 1.2rem;
                font-family: 'Orbitron', sans-serif;
            }
            
            /* PANEL DE SIMULACIÓN */
            .simulacion-panel {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                border: 1px solid rgba(0, 210, 190, 0.2);
                padding: 20px;
                margin-bottom: 25px;
            }
            
            .simulacion-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .info-card {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .info-icon {
                font-size: 2rem;
                color: #00d2be;
                min-width: 50px;
                text-align: center;
            }
            
            .info-content {
                flex: 1;
            }
            
            .info-title {
                color: #aaa;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            
            .info-value {
                color: white;
                font-size: 1.4rem;
                font-weight: bold;
                font-family: 'Orbitron', sans-serif;
                margin-bottom: 3px;
            }
            
            .info-sub {
                color: #888;
                font-size: 0.8rem;
            }
            
            /* CONTROLES DE SIMULACIÓN */
            .control-inactivo, .control-activo {
                padding: 20px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
            }
            
            .control-inactivo h4, .control-activo h4 {
                color: #00d2be;
                margin-top: 0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .simulacion-desc {
                color: #ccc;
                margin-bottom: 20px;
                line-height: 1.5;
            }
            
            .simulacion-estadisticas {
                display: flex;
                justify-content: space-around;
                margin-bottom: 25px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }
            
            .estadistica {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .est-label {
                color: #aaa;
                font-size: 0.8rem;
                margin-bottom: 5px;
            }
            
            .est-value {
                color: white;
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            .btn-iniciar-simulacion {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #00d2be, #009688);
                border: none;
                border-radius: 8px;
                color: black;
                font-weight: bold;
                font-size: 1.1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .btn-iniciar-simulacion:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 210, 190, 0.4);
            }
            
            .btn-iniciar-simulacion:disabled {
                background: #666;
                color: #999;
                cursor: not-allowed;
            }
            
            .ultima-prueba-info {
                margin-top: 15px;
                padding: 10px;
                background: rgba(0, 210, 190, 0.1);
                border-radius: 6px;
                color: #aaa;
                font-size: 0.9rem;
                text-align: center;
            }
            
            /* SIMULACIÓN ACTIVA */
            .simulacion-progreso-text {
                color: #ccc;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .progreso-container {
                margin-bottom: 25px;
            }
            
            .progreso-bar {
                height: 12px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progreso-fill {
                height: 100%;
                background: linear-gradient(90deg, #00d2be, #4CAF50);
                border-radius: 6px;
                transition: width 1s linear;
            }
            
            .progreso-info {
                display: flex;
                justify-content: space-between;
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .progreso-porcentaje {
                color: #00d2be;
                font-weight: bold;
            }
            
            .progreso-tiempo {
                color: #FF9800;
                font-family: 'Orbitron', sans-serif;
            }
            
            .simulacion-activa-info {
                padding: 15px;
                background: rgba(255, 152, 0, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(255, 152, 0, 0.3);
            }
            
            .simulacion-activa-info p {
                margin: 5px 0;
                color: #FF9800;
                font-size: 0.9rem;
            }
            
            /* LISTA DE PIEZAS */
            .piezas-panel, .historial-panel {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                border: 1px solid rgba(0, 210, 190, 0.2);
                padding: 20px;
                margin-bottom: 25px;
            }
            
            .piezas-panel h3, .historial-panel h3 {
                color: #00d2be;
                margin-top: 0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .lista-piezas {
                max-height: 300px;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .pieza-prueba-item {
                display: flex;
                align-items: center;
                padding: 12px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .pieza-icon {
                font-size: 1.5rem;
                margin-right: 15px;
                min-width: 40px;
                text-align: center;
            }
            
            .pieza-info {
                flex: 1;
            }
            
            .pieza-nombre {
                color: white;
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 0.95rem;
            }
            
            .pieza-detalle {
                display: flex;
                gap: 15px;
                color: #aaa;
                font-size: 0.8rem;
            }
            
            .pieza-estado {
                color: #4CAF50;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .sin-piezas, .sin-historial {
                text-align: center;
                padding: 40px 20px;
                color: #888;
            }
            
            .sin-piezas i, .sin-historial i {
                font-size: 3rem;
                margin-bottom: 15px;
                color: #666;
            }
            
            .subtexto {
                color: #666;
                font-size: 0.9rem;
                margin-top: 10px;
            }
            
            /* HISTORIAL */
            .tabla-historial-detalle {
                width: 100%;
                border-collapse: collapse;
                color: white;
            }
            
            .tabla-historial-detalle thead {
                background: rgba(0, 210, 190, 0.2);
            }
            
            .tabla-historial-detalle th {
                padding: 12px 15px;
                text-align: left;
                color: #00d2be;
                font-weight: bold;
                font-size: 0.9rem;
                border-bottom: 2px solid rgba(0, 210, 190, 0.3);
            }
            
            .tabla-historial-detalle td {
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .tabla-historial-detalle tr:hover {
                background: rgba(0, 210, 190, 0.05);
            }
            
            .tabla-historial-detalle tr.ultima-prueba {
                background: rgba(0, 210, 190, 0.1);
            }
            
            .tiempo-destacado {
                color: #00d2be;
                font-weight: bold;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.1rem;
            }
            
            .mejora-positiva {
                color: #4CAF50;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .mejora-negativa {
                color: #e10600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .sin-comparacion {
                color: #666;
            }
            
            .btn-ver-detalle {
                background: rgba(0, 210, 190, 0.1);
                border: 1px solid rgba(0, 210, 190, 0.3);
                color: #00d2be;
                border-radius: 4px;
                padding: 5px 10px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .btn-ver-detalle:hover {
                background: rgba(0, 210, 190, 0.2);
            }
            
            /* FOOTER */
            .ingenieria-footer {
                color: #666;
                font-size: 0.9rem;
                padding: 15px;
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 20px;
            }
            
            .ingenieria-footer p {
                margin: 8px 0;
            }
            
            /* INFORME DEL INGENIERO (en modal) */
            .informe-ingeniero {
                color: #ccc;
                font-size: 0.95rem;
                line-height: 1.6;
            }
            
            .informe-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(0, 210, 190, 0.3);
            }
            
            .informe-header h4 {
                color: #00d2be;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .informe-fecha {
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .informe-seccion {
                margin-bottom: 25px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }
            
            .informe-seccion h5 {
                color: #00d2be;
                margin-top: 0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .mejora-positiva {
                color: #4CAF50;
                padding: 10px;
                background: rgba(76, 175, 80, 0.1);
                border-radius: 6px;
                border-left: 4px solid #4CAF50;
            }
            
            .mejora-negativa {
                color: #e10600;
                padding: 10px;
                background: rgba(225, 6, 0, 0.1);
                border-radius: 6px;
                border-left: 4px solid #e10600;
            }
            
            .mejora-neutra {
                color: #FF9800;
                padding: 10px;
                background: rgba(255, 152, 0, 0.1);
                border-radius: 6px;
                border-left: 4px solid #FF9800;
            }
            
            .primera-prueba {
                color: #00d2be;
                padding: 10px;
                background: rgba(0, 210, 190, 0.1);
                border-radius: 6px;
                border-left: 4px solid #00d2be;
            }
            
            .recomendacion {
                color: #FF9800;
                padding: 10px;
                background: rgba(255, 152, 0, 0.1);
                border-radius: 6px;
                border-left: 4px solid #FF9800;
            }
            
            .recomendacion-neutra {
                color: #4CAF50;
                padding: 10px;
                background: rgba(76, 175, 80, 0.1);
                border-radius: 6px;
                border-left: 4px solid #4CAF50;
            }
            
            .informe-seccion ul {
                padding-left: 20px;
                margin: 10px 0;
            }
            
            .informe-seccion li {
                margin-bottom: 8px;
            }
            
            .informe-firma {
                text-align: right;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .informe-firma strong {
                color: #00d2be;
            }
            
            /* RESPONSIVE */
            @media (max-width: 768px) {
                .simulacion-info {
                    grid-template-columns: 1fr;
                }
                
                .simulacion-estadisticas {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .tabla-historial-detalle {
                    display: block;
                    overflow-x: auto;
                }
                
                .ingenieria-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .puntos-actuales {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // ========================
    // INICIALIZACIÓN
    // ========================
    async inicializar() {
        console.log('🔧 Inicializando sistema de ingeniería...');
        
        // Verificar si hay simulaciones activas pendientes
        try {
            const { data: simulacionesActivas, error } = await this.supabase
                .from('simulaciones_activas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('estado', 'en_progreso')
                .order('fecha_inicio', { ascending: false })
                .limit(1);
            
            if (error) throw error;
            
            if (simulacionesActivas && simulacionesActivas.length > 0) {
                const simulacion = simulacionesActivas[0];
                const fechaFin = new Date(simulacion.fecha_fin);
                const ahora = new Date();
                
                if (fechaFin > ahora) {
                    // Simulación aún activa
                    this.simulacionActiva = true;
                    this.simulacionId = simulacion.id;
                    this.tiempoRestante = Math.floor((fechaFin - ahora) / 1000);
                    
                    console.log(`⏱️ Simulación activa encontrada, tiempo restante: ${this.tiempoRestante}s`);
                    
                    // Programar finalización
                    setTimeout(() => {
                        this.finalizarSimulacion(simulacion.id);
                    }, this.tiempoRestante * 1000);
                    
                } else {
                    // Simulación expirada, finalizar
                    console.log('⚠️ Simulación expirada, finalizando...');
                    await this.finalizarSimulacion(simulacion.id);
                }
            }
            
        } catch (error) {
            console.error('❌ Error verificando simulaciones activas:', error);
        }
        
        console.log('✅ Sistema de ingeniería inicializado');
    }
}

// ========================
// FUNCIONES GLOBALES
// ========================
window.IngenieriaManager = IngenieriaManager;

// Inicializar cuando se cargue la pestaña
if (window.tabManager) {
    // Extender el tabManager para incluir ingeniería
    const originalSwitchTab = window.tabManager.switchTab;
    window.tabManager.switchTab = function(tabId) {
        originalSwitchTab.call(this, tabId);
        
        if (tabId === 'ingenieria' && window.ingenieriaManager) {
            setTimeout(() => {
                window.ingenieriaManager.cargarTabIngenieria();
            }, 100);
        }
    };
}

// Añadir pestaña al menú
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el menú de pestañas y agregar ingeniería
    const menuTabs = document.querySelector('.tabs-compactas');
    if (menuTabs && !document.querySelector('[data-tab="ingenieria"]')) {
        const btnIngenieria = document.createElement('button');
        btnIngenieria.className = 'tab-btn-compacto';
        btnIngenieria.dataset.tab = 'ingenieria';
        btnIngenieria.innerHTML = '<i class="fas fa-flask"></i> Ingeniería';
        menuTabs.appendChild(btnIngenieria);
        
        // Añadir contenedor para la pestaña
        const mainContent = document.querySelector('.dashboard-content');
        if (mainContent) {
            const tabIngenieria = document.createElement('div');
            tabIngenieria.id = 'tab-ingenieria';
            tabIngenieria.className = 'tab-content';
            mainContent.appendChild(tabIngenieria);
        }
    }
});

// Variable para verificar si ya estamos inicializando
let inicializandoIngenieria = false;

// Función para inicializar el manager de ingeniería
async function inicializarIngenieriaManager() {
    if (inicializandoIngenieria || window.ingenieriaManager) return;
    
    inicializandoIngenieria = true;
    console.log('🔧 Intentando inicializar ingenieriaManager...');
    
    // Esperar a que F1Manager esté disponible
    if (!window.f1Manager) {
        console.log('⏳ Esperando a que F1Manager esté disponible...');
        // Intentar de nuevo en 1 segundo
        setTimeout(inicializarIngenieriaManager, 1000);
        inicializandoIngenieria = false;
        return;
    }
    
    try {
        window.ingenieriaManager = new IngenieriaManager(window.f1Manager);
        await window.ingenieriaManager.inicializar();
        console.log('✅ ingenieriaManager inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando ingenieriaManager:', error);
    }
    
    inicializandoIngenieria = false;
}

// Inicializar cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un momento para asegurar que otros scripts se carguen
    setTimeout(inicializarIngenieriaManager, 1500);
});

// También inicializar cuando F1Manager esté disponible (por si se carga después)
if (window.f1Manager) {
    inicializarIngenieriaManager();
} else {
    // Escuchar evento personalizado cuando F1Manager esté listo
    window.addEventListener('f1manager-list', function() {
        inicializarIngenieriaManager();
    });
}

// Verificar si hay una instancia global
window.verificarIngenieriaManager = function() {
    console.log('🔍 Estado de ingenieriaManager:', {
        tieneClase: !!window.IngenieriaManager,
        tieneInstancia: !!window.ingenieriaManager,
        tieneF1Manager: !!window.f1Manager
    });
    
    if (!window.ingenieriaManager && window.f1Manager && window.IngenieriaManager) {
        console.log('⚠️ Inicializando ingenieriaManager manualmente...');
        inicializarIngenieriaManager();
    }
};

console.log('✅ ingenieria.js cargado - Clase disponible: ', !!window.IngenieriaManager);
