
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
        this.tiempoInicioSimulacion = null; // Guardar cuándo empezó
        this.duracionTotalSimulacion = 60000; // 60 segundos
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
        }; // ✅ CERRADO CORRECTAMENTE                
        // ========================
        // SISTEMAS DE ANÁLISIS AVANZADO
        // ========================
        this.sinergias = {
            // ID: [pieza1, pieza2, nombreAmigable, descripcion]
            s1: ['suelo', 'aleron_delantero', 'CARGA FRONTAL', 'El equilibrio aerodinámico delantero'],
            s2: ['suelo', 'aleron_trasero', 'CARGA TRASERA', 'La estabilidad a alta velocidad'],
            s3: ['motor', 'caja_cambios', 'TRANSMISIÓN', 'La entrega de potencia al asfalto'],
            s4: ['motor', 'electronica', 'GESTIÓN MOTOR', 'El mapeado y la eficiencia del propulsor'],
            s5: ['suspension', 'chasis', 'INTEGRIDAD ESTRUCTURAL', 'La rigidez torsional del conjunto'],
            s6: ['suspension', 'frenos', 'FRENADA ESTABLE', 'El equilibrio en deceleración'],
            s7: ['frenos', 'electronica', 'MODULACIÓN', 'La precisión en la frenada'],
            s8: ['chasis', 'pontones', 'REFRIGERACIÓN', 'La gestión térmica del monoplaza'],
            s9: ['volante', 'electronica', 'INTERFAZ PILOTO', 'La respuesta a las órdenes'],
            s10: ['aleron_delantero', 'aleron_trasero', 'PAQUETE AERODINÁMICO', 'La eficiencia del DRS y la carga']
        };
        
        this.atributos = [
            { nombre: '🚀 ACELERACIÓN', icono: 'fa-rocket', color: '#4CAF50' },
            { nombre: '🎯 PRECISIÓN CURVA', icono: 'fa-arrows-alt-h', color: '#00d2be' },
            { nombre: '🛑 FRENADA', icono: 'fa-stop-circle', color: '#FF9800' },
            { nombre: '📈 TRACCIÓN SALIDA', icono: 'fa-arrow-up', color: '#9c27b0' },
            { nombre: '⚡ VELOCIDAD PUNTA', icono: 'fa-tachometer-alt', color: '#e10600' },
            { nombre: '🛡️ ESTABILIDAD', icono: 'fa-shield-alt', color: '#2196F3' }
        ];
        
        this.ponderaciones = {
            // Atributo 0 (Aceleración)
            0: { motor: 0.50, caja_cambios: 0.30, electronica: 0.10, suspension: 0.10 },
            // Atributo 1 (Precisión curva)
            1: { aleron_delantero: 0.30, aleron_trasero: 0.20, suelo: 0.25, suspension: 0.15, chasis: 0.10 },
            // Atributo 2 (Frenada)
            2: { frenos: 0.60, electronica: 0.20, suspension: 0.15, chasis: 0.05 },
            // Atributo 3 (Tracción salida)
            3: { suspension: 0.40, caja_cambios: 0.25, motor: 0.20, suelo: 0.15 },
            // Atributo 4 (Velocidad punta)
            4: { motor: 0.60, aleron_trasero: 0.30, electronica: 0.10 },
            // Atributo 5 (Estabilidad)
            5: { chasis: 0.40, suspension: 0.30, pontones: 0.15, volante: 0.15 }
        };
        
        this.cuadernoNotas = []; // Se cargará desde histórico
            

    }

    // ========================
    // CARGAR PESTAÑA INGENIERÍA
    // ========================
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
                    
                    <div class="historial-panel">
                        <h3><i class="fas fa-chart-line"></i> HISTORIAL DE PRUEBAS</h3>
                        <div id="tabla-historial" class="tabla-historial">
                            ${this.generarHTMLHistorial()}
                        </div>
                    </div>
                    
                    <!-- 📊 NUEVO: GRÁFICO DE EVOLUCIÓN CON META DEL LÍDER -->
                    <div class="grafico-panel">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="display: flex; align-items: center; gap: 10px; color: #00d2be; margin: 0;">
                                <i class="fas fa-chart-line"></i> 
                                EVOLUCIÓN VS LÍDER GLOBAL
                                <span style="font-size: 0.7rem; background: rgba(255,215,0,0.2); color: #FFD700; padding: 2px 8px; border-radius: 12px; margin-left: 10px;">
                                    <i class="fas fa-trophy"></i> META
                                </span>
                            </h3>
                            <button onclick="window.ingenieriaManager.actualizarGraficoEvolucion()" 
                                    style="background: transparent; border: 1px solid #00d2be; color: #00d2be; 
                                           padding: 4px 12px; border-radius: 16px; font-size: 0.7rem; 
                                           display: flex; align-items: center; gap: 5px; cursor: pointer;">
                                <i class="fas fa-sync-alt"></i> ACTUALIZAR
                            </button>
                        </div>
                        <div id="grafico-evolucion-container" class="grafico-container">
                            <div style="text-align: center; padding: 30px; color: #888;">
                                <i class="fas fa-spinner fa-spin"></i> Cargando gráfico de evolución...
                            </div>
                        </div>
                    </div>
                    
                    <div class="ingenieria-footer">
                        <p><i class="fas fa-info-circle"></i> La simulación tarda 1 minuto en completarse. Durante este tiempo podrás seguir usando otras secciones.</p>                        
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            // Si hay una simulación activa, restaurar su estado visual
            if (this.simulacionActiva && this.tiempoInicioSimulacion) {
                // Calcular tiempo restante real
                const tiempoTranscurrido = Date.now() - this.tiempoInicioSimulacion;
                const tiempoRestanteReal = Math.max(0, this.duracionTotalSimulacion - tiempoTranscurrido);
                this.tiempoRestante = Math.ceil(tiempoRestanteReal / 1000);
                
                // Iniciar contador pero respetando el progreso real
                this.iniciarContadorSimulacion();
            }            
            // Agregar eventos si la simulación está inactiva
            if (!this.simulacionActiva) {
                this.agregarEventosSimulacion();
            } else {
                this.iniciarContadorVisual();
            }
            
            // Añadir estilos
            this.aplicarEstilosIngenieria();
            
            // 🆕 DIBUJAR EL GRÁFICO DESPUÉS DE QUE EL HTML ESTÉ EN EL DOM
            // Usamos setTimeout para asegurar que el contenedor existe
            setTimeout(() => {
                this.dibujarGraficoEvolucionConMeta();
            }, 300);
            
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
    // CALCULAR SINERGIAS ENTRE PIEZAS EQUIPADAS
    // ========================
    calcularSinergias() {
        const resultados = [];
        
        // Crear mapa de piezas por área para acceso rápido
        const mapaPiezas = {};
        this.piezasEnPrueba.forEach(pieza => {
            mapaPiezas[pieza.area_id] = pieza;
        });
        
        // Evaluar cada sinergia
        Object.entries(this.sinergias).forEach(([id, sinergia]) => {
            const [area1, area2, nombre, descripcion] = sinergia;
            
            const pieza1 = mapaPiezas[area1];
            const pieza2 = mapaPiezas[area2];
            
            if (!pieza1 || !pieza2) return; // No están ambas equipadas
            
            // Calcular puntuación de sinergia (0-100)
            // FÓRMULA: Media ponderada de puntos + factor aleatorio controlado
            const puntos1 = pieza1.puntos_base || 60;
            const puntos2 = pieza2.puntos_base || 60;
            
            // Media base
            let puntuacion = (puntos1 + puntos2) / 2;
            
            // Añadir factor de compatibilidad (simula que unas parejas funcionan mejor que otras)
            // Esto es FIJO por tipo de sinergia, no por pieza - el usuario no puede calcularlo
            const factoresCompatibilidad = {
                s1: 1.05, // Suelo + Alerón D suelen funcionar bien
                s2: 0.98,
                s3: 1.02,
                s4: 0.95,
                s5: 1.08, // Suspensión + Chasis, sinergia natural
                s6: 1.03,
                s7: 0.97,
                s8: 0.92, // Pontones + Chasis, difícil acertar
                s9: 1.01,
                s10: 0.96
            };
            
            puntuacion = puntuacion * (factoresCompatibilidad[id] || 1.0);
            
            // Pequeño azar (±3 puntos) para que no sea siempre idéntico
            puntuacion += (Math.random() * 6) - 3;
            
            // Limitar entre 0-100
            puntuacion = Math.max(0, Math.min(100, puntuacion));
            
            // Determinar estado
            let estado, mensaje;
            if (puntuacion >= 75) {
                estado = 'excelente';
                mensaje = 'Trabajo en equipo óptimo';
            } else if (puntuacion >= 50) {
                estado = 'buena';
                mensaje = 'Comportamiento aceptable';
            } else if (puntuacion >= 30) {
                estado = 'deficiente';
                mensaje = 'Tensión entre componentes';
            } else {
                estado = 'critica';
                mensaje = 'Conflicto grave';
            }
            
            resultados.push({
                id,
                nombre,
                descripcion,
                pieza1: pieza1.nombre,
                pieza2: pieza2.nombre,
                area1,
                area2,
                puntuacion: Math.round(puntuacion),
                estado,
                mensaje
            });
        });
        
        // Ordenar de peor a mejor (para destacar lo crítico)
        return resultados.sort((a, b) => a.puntuacion - b.puntuacion);
    }    

    // ========================
    // CALCULAR ATRIBUTOS DEL COCHE (ADN)
    // ========================
    calcularAtributos() {
        const resultados = [];
        
        // Crear mapa de piezas por área
        const mapaPiezas = {};
        this.piezasEnPrueba.forEach(pieza => {
            mapaPiezas[pieza.area_id] = pieza.puntos_base || 60;
        });
        
        // Si faltan piezas, asignar valores por defecto
        const areasNecesarias = ['motor', 'caja_cambios', 'electronica', 'suspension', 'chasis', 
                                'aleron_delantero', 'aleron_trasero', 'suelo', 'frenos', 'pontones', 'volante'];
        
        areasNecesarias.forEach(area => {
            if (!mapaPiezas[area]) {
                mapaPiezas[area] = 50; // Valor por defecto si no está equipada
            }
        });
        
        // Calcular cada atributo
        this.atributos.forEach((atributo, index) => {
            const ponderacion = this.ponderaciones[index];
            let valor = 0;
            let pesoTotal = 0;
            
            Object.entries(ponderacion).forEach(([area, peso]) => {
                const puntos = mapaPiezas[area] || 50;
                valor += puntos * peso;
                pesoTotal += peso;
            });
            
            // Normalizar a 0-100
            valor = valor / pesoTotal;
            
            // Pequeño factor de sinergia global (simula que el conjunto es más que la suma)
            // Esto evita que el usuario pueda calcularlo exactamente
            valor = valor * (0.95 + (Math.random() * 0.1));
            
            // Limitar
            valor = Math.max(30, Math.min(100, Math.round(valor)));
            
            resultados.push({
                ...atributo,
                valor,
                index
            });
        });
        
        return resultados;
    }

    // ========================
    // GENERAR CUADERNO DEL INGENIERO
    // ========================
    generarCuadernoIngeniero(tiempoActual, tiempoAnterior, mejora, piezaDebil, sinergiasCriticas) {
        const fecha = new Date();
        const semana = this.obtenerNumeroSemana(fecha);
        
        let entrada = {
            fecha: fecha.toISOString(),
            semana: semana,
            tiempo: this.formatearTiempo(tiempoActual),
            mejora: mejora ? (mejora > 0 ? `+${this.formatearTiempo(mejora)}` : `${this.formatearTiempo(mejora)}`) : 'Primera prueba',
            notas: []
        };
        
        // Nota sobre el rendimiento general
        if (!tiempoAnterior) {
            entrada.notas.push(`📝 PRIMERA PRUEBA: Registramos ${this.formatearTiempo(tiempoActual)} como referencia. Mucho trabajo por delante.`);
        } else if (mejora > 0.1) {
            entrada.notas.push(`🏆 ¡GRAN AVANCE! Ganamos ${this.formatearTiempo(mejora)}. El setup funciona. No tocar lo que funciona.`);
        } else if (mejora > 0.02) {
            entrada.notas.push(`📈 Progreso constante: +${this.formatearTiempo(mejora)}. Dirección correcta.`);
        } else if (mejora > 0) {
            entrada.notas.push(`↗️ Mejora marginal: +${this.formatearTiempo(mejora)}. Casi imperceptible.`);
        } else if (mejora < -0.1) {
            entrada.notas.push(`🔻 ALERTA: Perdemos ${this.formatearTiempo(Math.abs(mejora))}. Algo cambió y no fue bien.`);
        } else if (mejora < 0) {
            entrada.notas.push(`↘️ Ligera regresión: -${this.formatearTiempo(Math.abs(mejora))}. Revisar ajustes finos.`);
        }
        
        // Nota sobre la pieza débil
        if (piezaDebil) {
            const areasMap = {
                'suelo': 'suelo',
                'motor': 'motor',
                'aleron_delantero': 'alerón delantero',
                'caja_cambios': 'caja de cambios',
                'pontones': 'pontones',
                'suspension': 'suspensión',
                'aleron_trasero': 'alerón trasero',
                'chasis': 'chasis',
                'frenos': 'frenos',
                'volante': 'volante',
                'electronica': 'electrónica'
            };
            const nombreArea = areasMap[piezaDebil] || piezaDebil;
            entrada.notas.push(`🔍 El ${nombreArea} es nuestro eslabón más débil. Necesita desarrollo urgente.`);
        }
        
        // Nota sobre la peor sinergia
        if (sinergiasCriticas && sinergiasCriticas.length > 0) {
            const peorSinergia = sinergiasCriticas[0];
            entrada.notas.push(`⚠️ ${peorSinergia.nombre}: ${peorSinergia.descripcion.toLowerCase()} no es óptimo. Revisar ${peorSinergia.area1} y ${peorSinergia.area2}.`);
        }
        
        // Añadir al cuaderno (mantener solo últimas 10 entradas)
        this.cuadernoNotas.unshift(entrada);
        if (this.cuadernoNotas.length > 10) {
            this.cuadernoNotas.pop();
        }
        
        return entrada;
    }
    
    // ========================
    // OBTENER NÚMERO DE SEMANA
    // ========================
    obtenerNumeroSemana(fecha) {
        const d = new Date(fecha);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
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
    // OBTENER MEJOR TIEMPO GLOBAL (DESDE CLASIFICACIÓN)
    // ========================
    async obtenerMejorTiempoGlobal() {
        try {
            console.log('🏁 Buscando mejor tiempo global para gráfico...');
            
            const { data: todasEscuderias, error } = await this.supabase
                .from('escuderias')
                .select('id, nombre');
            
            if (error) throw error;
            if (!todasEscuderias || todasEscuderias.length === 0) return null;
            
            const escuderiasConVueltas = await Promise.all(
                todasEscuderias.map(async (escuderia) => {
                    const { data: resultados } = await this.supabase
                        .from('pruebas_pista')
                        .select('tiempo_formateado, tiempo_vuelta, fecha_prueba')
                        .eq('escuderia_id', escuderia.id)
                        .order('tiempo_vuelta', { ascending: true })
                        .limit(1);
                    
                    const mejorVuelta = resultados && resultados.length > 0 ? resultados[0] : null;
                    
                    return {
                        ...escuderia,
                        vuelta_rapida: mejorVuelta?.tiempo_formateado || null,
                        tiempo_vuelta: mejorVuelta?.tiempo_vuelta || 999999,
                        fecha: mejorVuelta?.fecha_prueba || null
                    };
                })
            );
            
            const conVuelta = escuderiasConVueltas.filter(e => e.vuelta_rapida !== null);
            conVuelta.sort((a, b) => a.tiempo_vuelta - b.tiempo_vuelta);
            
            if (conVuelta.length === 0) return null;
            
            const mejor = conVuelta[0];
            
            return {
                tiempo: mejor.tiempo_vuelta,
                formateado: mejor.vuelta_rapida,
                escuderia: mejor.nombre,
                fecha: mejor.fecha
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo mejor tiempo global:', error);
            return null;
        }
    }
    

    // ========================
    // GRÁFICO DE LÍNEAS CON ESCALA REAL Y META DEL LÍDER - CORREGIDO
    // ========================
    // ========================
    // GRÁFICO DE LÍNEAS CON ESCALA REAL Y META DEL LÍDER - VERSIÓN RESPONSIVE
    // ========================
    async dibujarGraficoEvolucionConMeta() {
        // 1. No hacer nada si no hay historial
        if (!this.tiemposHistoricos || this.tiemposHistoricos.length < 2) {
            console.log('📊 No hay suficientes datos para el gráfico');
            return;
        }
    
        const contenedor = document.getElementById('grafico-evolucion-container');
        if (!contenedor) return;
    
        // 2. Mostrar estado de carga
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #888;">
                <i class="fas fa-spinner fa-spin"></i> Cargando gráfico de evolución...
            </div>
        `;
    
        try {
            // 3. Obtener mejor tiempo global (líder)
            const mejorGlobal = await this.obtenerMejorTiempoGlobal();
            
            // 4. Tomar últimas 8 pruebas como máximo
            const historial = this.tiemposHistoricos.slice(0, 8).reverse();
            
            if (historial.length < 2) {
                contenedor.innerHTML = '<p style="color: #888; text-align: center; padding: 30px;">Necesitas al menos 2 pruebas para ver el gráfico</p>';
                return;
            }
    
            // 5. CONFIGURACIÓN DEL GRÁFICO - 100% ANCHO DEL CONTENEDOR
            const ANCHO_BASE = 680; // Ancho base para mantener proporciones
            const ALTURA_TOTAL = 320;
            const MARGEN_IZQUIERDO = 68;  // Espacio compacto para eje Y
            const MARGEN_DERECHO = 20;
            const MARGEN_SUPERIOR = 25;
            const MARGEN_INFERIOR = 35;
            
            const ANCHO_GRAFICO = ANCHO_BASE - MARGEN_IZQUIERDO - MARGEN_DERECHO;
            const ALTURA_GRAFICO = ALTURA_TOTAL - MARGEN_SUPERIOR - MARGEN_INFERIOR;
            
            // 6. CALCULAR ESCALA REAL
            const tiempos = historial.map(p => p.tiempo_vuelta);
            if (mejorGlobal) tiempos.push(mejorGlobal.tiempo);
            
            const tiempoMinimo = Math.min(...tiempos) - 0.15;
            const tiempoMaximo = Math.max(...tiempos) + 0.15;
            const rangoTiempos = tiempoMaximo - tiempoMinimo;
            
            // 7. GENERAR MARCAS DEL EJE Y (6 marcas)
            const marcasY = [];
            const posicionesY = [];
            for (let i = 0; i <= 6; i++) {
                const tiempo = tiempoMaximo - (i * (rangoTiempos / 6));
                marcasY.push(tiempo);
                const y = MARGEN_SUPERIOR + (i * (ALTURA_GRAFICO / 6));
                posicionesY.push(y);
            }
    
            // 8. CALCULAR POSICIONES X (distribución uniforme)
            const pasoX = ANCHO_GRAFICO / (historial.length - 1);
            const puntosX = historial.map((_, index) => 
                MARGEN_IZQUIERDO + (index * pasoX)
            );
    
            // 9. GENERAR HTML - SVG con viewBox que mantiene proporciones
            let html = `
                <div style="position: relative; width: 100%;">
                    <!-- Contenedor SVG con aspect ratio fijo -->
                    <div style="position: relative; width: 100%; padding-bottom: ${(ALTURA_TOTAL / ANCHO_BASE) * 100}%;">
                        <svg width="100%" height="100%" 
                             viewBox="0 0 ${ANCHO_BASE} ${ALTURA_TOTAL}" 
                             preserveAspectRatio="xMidYMid meet"
                             style="position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.2); border-radius: 8px; font-family: 'Orbitron', monospace;">
                            
                            <!-- Fondo del gráfico -->
                            <rect x="${MARGEN_IZQUIERDO}" y="${MARGEN_SUPERIOR}" 
                                  width="${ANCHO_GRAFICO}" height="${ALTURA_GRAFICO}" 
                                  fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                            
                            <!-- CUADRÍCULA HORIZONTAL (REGLAS) -->
                            ${posicionesY.map((y, i) => `
                                <line x1="${MARGEN_IZQUIERDO}" y1="${y}" 
                                      x2="${MARGEN_IZQUIERDO + ANCHO_GRAFICO}" y2="${y}" 
                                      stroke="rgba(255,255,255,0.15)" stroke-width="1" 
                                      stroke-dasharray="${i % 2 === 0 ? '6,4' : '2,4'}" />
                            `).join('')}
                            
                            <!-- CUADRÍCULA VERTICAL -->
                            ${puntosX.map((x, i) => `
                                <line x1="${x}" y1="${MARGEN_SUPERIOR}" 
                                      x2="${x}" y2="${MARGEN_SUPERIOR + ALTURA_GRAFICO}" 
                                      stroke="rgba(255,255,255,0.1)" stroke-width="1" 
                                      stroke-dasharray="4,4" />
                            `).join('')}
                            
                            <!-- EJE Y (TIEMPOS) - COMPACTO Y FIJO -->
                            <g class="eje-y">
                                <!-- Fondo semitransparente para el eje -->
                                <rect x="0" y="${MARGEN_SUPERIOR - 5}" 
                                      width="${MARGEN_IZQUIERDO - 5}" height="${ALTURA_GRAFICO + 10}" 
                                      fill="rgba(0,0,0,0.7)" />
                                
                                <!-- Marcas y valores del eje Y -->
                                ${marcasY.map((tiempo, i) => {
                                    const tiempoFormateado = this.formatearTiempo(tiempo);
                                    const y = posicionesY[i];
                                    return `
                                        <g>
                                            <line x1="${MARGEN_IZQUIERDO - 6}" y1="${y}" 
                                                  x2="${MARGEN_IZQUIERDO}" y2="${y}" 
                                                  stroke="#00d2be" stroke-width="1.5" />
                                            <text x="${MARGEN_IZQUIERDO - 10}" y="${y + 4}" 
                                                  text-anchor="end" fill="white" font-size="9" 
                                                  font-weight="bold" font-family="Orbitron, monospace">
                                                  ${tiempoFormateado}
                                            </text>
                                        </g>
                                    `;
                                }).join('')}
                            </g>
                            
                            <!-- LÍNEA DEL LÍDER GLOBAL (META) -->
                            ${mejorGlobal ? (() => {
                                const yLider = MARGEN_SUPERIOR + ((tiempoMaximo - mejorGlobal.tiempo) / rangoTiempos) * ALTURA_GRAFICO;
                                return `
                                    <line x1="${MARGEN_IZQUIERDO}" y1="${yLider}" 
                                          x2="${MARGEN_IZQUIERDO + ANCHO_GRAFICO}" y2="${yLider}" 
                                          stroke="#FFD700" stroke-width="2" stroke-dasharray="8,6" />
                                    <circle cx="${MARGEN_IZQUIERDO - 4}" cy="${yLider}" r="3" fill="#FFD700" />
                                    <circle cx="${MARGEN_IZQUIERDO + ANCHO_GRAFICO + 4}" cy="${yLider}" r="3" fill="#FFD700" />
                                `;
                            })() : ''}
                            
                            <!-- LÍNEA DE PROGRESIÓN DEL USUARIO -->
                            <polyline points="${historial.map((prueba, index) => {
                                const x = puntosX[index];
                                const y = MARGEN_SUPERIOR + ((tiempoMaximo - prueba.tiempo_vuelta) / rangoTiempos) * ALTURA_GRAFICO;
                                return `${x},${y}`;
                            }).join(' ')}" 
                                      fill="none" stroke="#00d2be" stroke-width="3" 
                                      stroke-linecap="round" stroke-linejoin="round" />
                            
                            <!-- PUNTOS DE LAS PRUEBAS -->
                            ${historial.map((prueba, index) => {
                                const x = puntosX[index];
                                const y = MARGEN_SUPERIOR + ((tiempoMaximo - prueba.tiempo_vuelta) / rangoTiempos) * ALTURA_GRAFICO;
                                
                                let colorPunto = '#00d2be';
                                if (index > 0) {
                                    const anterior = historial[index - 1];
                                    if (prueba.tiempo_vuelta < anterior.tiempo_vuelta) colorPunto = '#4CAF50';
                                    else if (prueba.tiempo_vuelta > anterior.tiempo_vuelta) colorPunto = '#e10600';
                                }
                                
                                return `
                                    <g class="punto-prueba" style="cursor: pointer;">
                                        <circle cx="${x}" cy="${y}" r="5" fill="${colorPunto}" 
                                                stroke="white" stroke-width="2" />
                                        <title>
                                            ${this.formatearFecha(prueba.fecha_prueba)}
                                            Tiempo: ${prueba.tiempo_formateado || this.formatearTiempo(prueba.tiempo_vuelta)}
                                            ${index > 0 ? `\n${prueba.tiempo_vuelta < historial[index-1].tiempo_vuelta ? '▼ MEJORÓ' : '▲ EMPEORÓ'}` : '\nPRIMERA PRUEBA'}
                                        </title>
                                    </g>
                                `;
                            }).join('')}
                            
                            <!-- ETIQUETAS DEL EJE X (FECHAS) -->
                            ${historial.map((prueba, index) => {
                                const x = puntosX[index];
                                let fechaStr = '';
                                try {
                                    const fecha = new Date(prueba.fecha_prueba || prueba.fecha);
                                    fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
                                } catch {
                                    fechaStr = `P${index + 1}`;
                                }
                                
                                return `
                                    <text x="${x}" y="${ALTURA_TOTAL - 12}" 
                                          text-anchor="middle" fill="#aaa" font-size="8" 
                                          font-family="Arial, sans-serif">
                                          ${fechaStr}
                                    </text>
                                `;
                            }).join('')}
                            
                            <!-- TÍTULO DEL EJE Y (COMPACTO) -->
                            <text x="10" y="${MARGEN_SUPERIOR - 8}" 
                                  fill="#00d2be" font-size="8" font-weight="bold" 
                                  font-family="Orbitron, monospace">
                                  SEG
                            </text>
                            
                            <!-- MINI LEYENDA (OPCIONAL) -->
                            <g transform="translate(${MARGEN_IZQUIERDO + 10}, 12)">
                                <circle cx="0" cy="0" r="4" fill="#00d2be" stroke="white" stroke-width="1" />
                                <text x="10" y="4" fill="#ccc" font-size="7">Tu progresión</text>
                                ${mejorGlobal ? `
                                    <line x1="80" y1="0" x2="100" y2="0" stroke="#FFD700" stroke-width="2" stroke-dasharray="6,4" />
                                    <text x="110" y="4" fill="#FFD700" font-size="7">Líder</text>
                                ` : ''}
                            </g>
                            
                        </svg>
                    </div>
                    
                    <!-- INFO DEL LÍDER (FUERA DEL SVG) -->
                    ${mejorGlobal ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; 
                                    padding: 10px 15px; background: rgba(0,0,0,0.4); border-radius: 6px; 
                                    border-left: 4px solid #FFD700;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: #FFD700; font-weight: bold;">🏆 LÍDER GLOBAL</span>
                                <span style="color: white; font-family: 'Orbitron', monospace; font-weight: bold;">
                                    ${mejorGlobal.formateado}
                                </span>
                                <span style="color: #aaa; font-size: 0.8rem;">
                                    ${mejorGlobal.escuderia?.substring(0, 25) || 'Líder'}
                                </span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="color: #aaa;">TU DIFERENCIA:</span>
                                <span style="color: ${historial[historial.length-1].tiempo_vuelta - mejorGlobal.tiempo > 0 ? '#FF9800' : '#4CAF50'}; 
                                           font-family: 'Orbitron', monospace; font-weight: bold; font-size: 1.1rem;">
                                    ${(historial[historial.length-1].tiempo_vuelta - mejorGlobal.tiempo > 0 ? '+' : '')}
                                    ${this.formatearTiempo(Math.abs(historial[historial.length-1].tiempo_vuelta - mejorGlobal.tiempo))}
                                </span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- TENDENCIA (OPCIONAL) -->
                    ${historial.length >= 3 ? (() => {
                        const primero = historial[0].tiempo_vuelta;
                        const ultimo = historial[historial.length - 1].tiempo_vuelta;
                        const tendencia = primero - ultimo;
                        const tendenciaColor = tendencia > 0.05 ? '#4CAF50' : tendencia < -0.05 ? '#e10600' : '#FF9800';
                        const tendenciaIcono = tendencia > 0.05 ? 'fa-arrow-down' : tendencia < -0.05 ? 'fa-arrow-up' : 'fa-minus';
                        const tendenciaTexto = tendencia > 0.05 ? 'MEJORANDO' : tendencia < -0.05 ? 'EMPEORANDO' : 'ESTABLE';
                        
                        return `
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; 
                                        padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                                <i class="fas ${tendenciaIcono}" style="color: ${tendenciaColor};"></i>
                                <span style="color: ${tendenciaColor}; font-size: 0.8rem; font-weight: bold;">
                                    ${tendenciaTexto}
                                </span>
                                <span style="color: #aaa; font-size: 0.8rem;">
                                    (${tendencia > 0 ? '-' : '+'}${this.formatearTiempo(Math.abs(tendencia))} en ${historial.length} pruebas)
                                </span>
                            </div>
                        `;
                    })() : ''}
                </div>
            `;
            
            contenedor.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error dibujando gráfico:', error);
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #e10600;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Error al cargar el gráfico</p>
                    <button onclick="window.ingenieriaManager.dibujarGraficoEvolucionConMeta()" 
                            style="margin-top: 15px; padding: 8px 20px; background: #00d2be; color: black; 
                                   border: none; border-radius: 4px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
    
    // ========================
    // ACTUALIZAR GRÁFICO (para llamar después de cada simulación)
    // ========================
    async actualizarGraficoEvolucion() {
        await this.cargarHistorialTiempos();
        await this.dibujarGraficoEvolucionConMeta();
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
            this.tiempoInicioSimulacion = Date.now(); // ✅ GUARDAR TIEMPO DE INICIO
            this.duracionTotalSimulacion = this.config.duracionSimulacion * 1000; // en ms            
            

            
            // Mostrar notificación
            this.f1Manager.showNotification('🏁 Simulación iniciada - Resultados en 1 minuto', 'success');
            
            // Recargar la vista
            // Recargar la vista y asegurar que el coche existe
            setTimeout(() => {
                this.cargarTabIngenieria();
                
                // Dar tiempo a que se renderice el SVG antes de iniciar el contador
                setTimeout(() => {
                    if (this.simulacionActiva) {
                        this.iniciarContadorSimulacion();
                    }
                }, 300);
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

            
            // AÑADIR ESTO ↓ - Dar estrellas si es primera prueba del día
            if (!insertError) {
                try {
                    // Verificar si es primera prueba hoy para esta escudería
                    const { data: escuderiaActual } = await this.supabase
                        .from('escuderias')
                        .select('primera_prueba_hoy')
                        .eq('id', this.escuderia.id)
                        .single();
                    
                    if (escuderiaActual && !escuderiaActual.primera_prueba_hoy) {
                        // Obtener estrellas actuales
                        const { data: escuderiaEstrellas } = await this.supabase
                            .from('escuderias')
                            .select('estrellas_semana')
                            .eq('id', this.escuderia.id)
                            .single();
                        
                        const nuevasEstrellas = (escuderiaEstrellas?.estrellas_semana || 0) + 20;
                        
                        // Actualizar en BD
                        const { error: updateError } = await this.supabase
                            .from('escuderias')
                            .update({ 
                                estrellas_semana: nuevasEstrellas,
                                primera_prueba_hoy: true
                            })
                            .eq('id', this.escuderia.id);
                        
                        if (!updateError) {
                            // Actualizar en el manager principal si está disponible
                            if (window.f1Manager) {
                                window.f1Manager.escuderia.estrellas_semana = nuevasEstrellas;
                                window.f1Manager.escuderia.primera_prueba_hoy = true;
                                
                                // Actualizar display
                                const estrellasElement = document.getElementById('estrellas-value');
                                if (estrellasElement) {
                                    estrellasElement.textContent = nuevasEstrellas;
                                }
                                
                                // Notificación - SIEMPRE mostrar si dio estrellas
                                if (window.f1Manager && window.f1Manager.showNotification) {
                                    // Mostrar siempre, no solo si no hay error
                                    console.log('🔔 Mostrando notificación de +20 estrellas por prueba');
                                    window.f1Manager.showNotification('🏎️ +20🌟 (prueba en pista completada)', 'info');
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error dando estrellas por prueba:', error);
                }
            }
            // AÑADIR ESTO ↑            
            
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
            await this.dibujarGraficoEvolucionConMeta();
            
            // Mostrar notificación con informe
            this.mostrarInformeCompleto(informeIngeniero, tiempoFormateado, mejoraReal);
            
            // Poner el coche en verde al completar
            const coche = document.getElementById('coche-animado');
            if (coche) {
                coche.setAttribute('fill', '#4CAF50');
                // Opcional: hacerlo un poco más grande
                coche.setAttribute('r', '10');
            }
            
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
    // ========================
    // GENERAR INFORME DEL INGENIERO - NUEVA VERSIÓN
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
        
        // ========== 1. CALCULAR SINERGIAS ==========
        const sinergias = this.calcularSinergias();
        const sinergiasDeficientes = sinergias.filter(s => s.puntuacion < 50);
        const sinergiaCritica = sinergiasDeficientes.length > 0 ? sinergiasDeficientes[0] : null;
        
        // ========== 2. CALCULAR ATRIBUTOS ADN ==========
        const atributos = this.calcularAtributos();
        const atributoDebil = [...atributos].sort((a, b) => a.valor - b.valor)[0];
        const atributoFuerte = [...atributos].sort((a, b) => b.valor - a.valor)[0];
        
        // ========== 3. GENERAR CUADERNO ==========
        const entradaCuaderno = this.generarCuadernoIngeniero(tiempoActual, tiempoAnterior, mejora, piezaDebil, sinergiasDeficientes);
        
        // ========== 4. CONSTRUIR INFORME ==========
        let informe = `
            <div class="informe-ingeniero">
                <div class="informe-header">
                    <h4><i class="fas fa-file-alt"></i> INFORME TÉCNICO - DEPARTAMENTO DE INGENIERÍA</h4>
                    <span class="informe-fecha">${fecha}</span>
                </div>
                
                <!-- SECCIÓN 1: RESULTADO DE LA PRUEBA -->
                <div class="informe-seccion">
                    <h5><i class="fas fa-stopwatch"></i> RESULTADO DE LA SIMULACIÓN</h5>
                    <p>Después de completar ${this.config.vueltasPrueba} vueltas, el <strong>mejor tiempo registrado</strong> es de <span style="color: #00d2be; font-size: 1.2rem; font-weight: bold;">${tiempoFormateado}</span>.</p>
        `;
        
        if (tiempoAnterior) {
            if (mejora > 0) {
                informe += `<p class="mejora-positiva"><i class="fas fa-arrow-up"></i> <strong>MEJORA DE ${this.formatearTiempo(mejora)}</strong> respecto a la prueba anterior (${tiempoAnteriorFormateado}).</p>`;
            } else if (mejora < 0) {
                informe += `<p class="mejora-negativa"><i class="fas fa-arrow-down"></i> <strong>REGRESIÓN DE ${this.formatearTiempo(Math.abs(mejora))}</strong> respecto a la prueba anterior (${tiempoAnteriorFormateado}).</p>`;
            } else {
                informe += `<p class="mejora-neutra"><i class="fas fa-equals"></i> <strong>TIEMPO IDÉNTICO</strong> a la prueba anterior.</p>`;
            }
        } else {
            informe += `<p class="primera-prueba"><i class="fas fa-star"></i> <strong>PRIMERA PRUEBA REGISTRADA</strong> - Establecemos tiempo de referencia.</p>`;
        }
        
        informe += `</div>`;
        
        // ========== SECCIÓN 2: PERFIL ADN DEL COCHE ==========
        informe += `
            <div class="informe-seccion">
                <h5><i class="fas fa-dna"></i> PERFIL DE COMPORTAMIENTO</h5>
                <p style="color: #ccc; margin-bottom: 15px;">Rendimiento estimado del monoplaza en diferentes áreas:</p>
                
                <div class="atributos-container" style="display: flex; flex-direction: column; gap: 12px;">
        `;
        
        // Generar barras para cada atributo
        atributos.forEach(atributo => {
            const porcentaje = atributo.valor;
            let color = atributo.color;
            
            // Gradiente según valor
            if (porcentaje < 40) color = '#e10600';
            else if (porcentaje < 60) color = '#FF9800';
            else if (porcentaje < 75) color = '#00d2be';
            else color = '#4CAF50';
            
            informe += `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="min-width: 160px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas ${atributo.icono}" style="color: ${atributo.color}; width: 20px;"></i>
                        <span style="color: white;">${atributo.nombre}</span>
                    </div>
                    <div style="flex: 1; height: 16px; background: rgba(0,0,0,0.5); border-radius: 8px; overflow: hidden; position: relative;">
                        <div style="width: ${porcentaje}%; height: 100%; background: ${color}; border-radius: 8px; transition: width 0.3s;"></div>
                    </div>
                    <div style="min-width: 45px; text-align: right; color: ${color}; font-weight: bold; font-family: 'Orbitron', sans-serif;">
                        ${porcentaje}%
                    </div>
                </div>
            `;
        });
        
        informe += `
                </div>
                
                <div style="margin-top: 20px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; border-left: 4px solid ${atributoDebil.color};">
                    <span style="color: #aaa;">📊 PERFIL DOMINANTE:</span>
                    <span style="color: ${atributoFuerte.color}; font-weight: bold; margin-left: 8px;">${atributoFuerte.nombre} (${atributoFuerte.valor}%)</span>
                    <br>
                    <span style="color: #aaa;">⚠️ DEBILIDAD DETECTADA:</span>
                    <span style="color: ${atributoDebil.color}; font-weight: bold; margin-left: 8px;">${atributoDebil.nombre} (${atributoDebil.valor}%)</span>
                </div>
            </div>
        `;
        
        // ========== SECCIÓN 3: INFORME DE SINERGIAS ==========
        informe += `
            <div class="informe-seccion">
                <h5><i class="fas fa-link"></i> ANÁLISIS DE COMPATIBILIDAD</h5>
        `;
        
        if (sinergiasDeficientes.length > 0) {
            // Mostrar SOLO UNA sinergia deficiente (la peor) - como pides
            const s = sinergiaCritica;
            informe += `
                <div style="background: rgba(225, 6, 0, 0.15); padding: 15px; border-radius: 8px; border-left: 4px solid #e10600; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <i class="fas fa-exclamation-triangle" style="color: #e10600; font-size: 1.2rem;"></i>
                        <span style="color: #e10600; font-weight: bold; font-size: 1.1rem;">⚠️ ALERTA DE COMPATIBILIDAD</span>
                    </div>
                    <p style="margin: 0; color: #ffaa00; font-weight: bold; font-size: 1rem;">
                        ${s.nombre} - ${s.puntuacion}/100
                    </p>
                    <p style="margin: 8px 0 0 0; color: #fff;">
                        <strong>INFORME DE COMPATIBILIDAD:</strong> Hemos detectado una sinergia deficiente en <strong style="color: #ffaa00;">${s.nombre}</strong>. 
                        ${s.descripcion} no trabajan en armonía. Revisa ambos componentes.
                    </p>
                    <p style="margin: 8px 0 0 0; color: #ccc; font-size: 0.9rem;">
                        <i class="fas fa-wrench"></i> Componentes implicados: ${s.pieza1} / ${s.pieza2}
                    </p>
                </div>
            `;
            
            // Mostrar las demás sinergias en una tabla compacta
            informe += `<p style="color: #aaa; margin-bottom: 8px;">Otras compatibilidades monitorizadas:</p>`;
            informe += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">`;
            
            sinergias.forEach(s => {
                let color, icono;
                if (s.puntuacion >= 75) { color = '#4CAF50'; icono = 'fa-check-circle'; }
                else if (s.puntuacion >= 50) { color = '#00d2be'; icono = 'fa-check'; }
                else if (s.puntuacion >= 30) { color = '#FF9800'; icono = 'fa-exclamation-triangle'; }
                else { color = '#e10600'; icono = 'fa-times-circle'; }
                
                informe += `
                    <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; border-left: 3px solid ${color};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: white; font-weight: bold; font-size: 0.85rem;">${s.nombre}</span>
                            <span style="color: ${color}; font-weight: bold; font-family: 'Orbitron', sans-serif;">${s.puntuacion}</span>
                        </div>
                        <div style="color: #aaa; font-size: 0.75rem; margin-top: 4px;">
                            <i class="fas ${icono}" style="color: ${color};"></i> ${s.mensaje}
                        </div>
                    </div>
                `;
            });
            
            informe += `</div>`;
            
        } else {
            informe += `
                <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                    <p style="margin: 0; color: #4CAF50; font-weight: bold;">
                        <i class="fas fa-check-circle"></i> TODAS LAS SINERGIAS SON ÓPTIMAS
                    </p>
                    <p style="margin: 8px 0 0 0; color: #ccc;">
                        El conjunto muestra un equilibrio excepcional. Cualquier mejora requerirá desarrollar componentes individuales.
                    </p>
                </div>
            `;
        }
        
        informe += `</div>`;
        
        // ========== SECCIÓN 4: CUADERNO DEL INGENIERO ==========
        informe += `
            <div class="informe-seccion">
                <h5><i class="fas fa-book"></i> CUADERNO DEL INGENIERO JEFE</h5>
                
                <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 15px; border: 1px dashed rgba(255,215,0,0.3);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <i class="fas fa-user-tie" style="color: #FFD700; font-size: 1.3rem;"></i>
                        <span style="color: #FFD700; font-weight: bold;">NOTAS DE CARLOS MÉNDEZ - SEMANA ${entradaCuaderno.semana}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
        `;
        
        // Mostrar las notas actuales
        entradaCuaderno.notas.forEach(nota => {
            informe += `<div style="display: flex; gap: 10px; align-items: flex-start;">
                            <span style="color: #FFD700;">📌</span>
                            <span style="color: #fff;">${nota}</span>
                        </div>`;
        });
        
        // Mostrar entradas anteriores (últimas 3)
        if (this.cuadernoNotas.length > 1) {
            informe += `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 8px;">
                                <i class="fas fa-history"></i> ANOTACIONES ANTERIORES:
                            </p>
            `;
            
            for (let i = 1; i < Math.min(4, this.cuadernoNotas.length); i++) {
                const entry = this.cuadernoNotas[i];
                if (entry.notas.length > 0) {
                    informe += `<div style="color: #888; font-size: 0.85rem; margin-bottom: 8px; padding-left: 10px; border-left: 2px solid #444;">
                                    <span style="color: #aaa;">Semana ${entry.semana}:</span> ${entry.notas[0]}
                                </div>`;
                }
            }
            
            informe += `</div>`;
        }
        
        informe += `
                    </div>
                </div>
            </div>
        `;
        
        // ========== SECCIÓN 5: RECOMENDACIONES ==========
        informe += `
            <div class="informe-seccion">
                <h5><i class="fas fa-lightbulb"></i> PRÓXIMOS PASOS</h5>
                <ul style="margin: 10px 0 0 20px;">
        `;
        
        if (sinergiaCritica) {
            informe += `<li style="margin-bottom: 8px;"><span style="color: #ffaa00;">⚠️ PRIORIDAD ALTA:</span> Revisar <strong>${sinergiaCritica.pieza1}</strong> o <strong>${sinergiaCritica.pieza2}</strong> para resolver la sinergia deficiente.</li>`;
        }
        
        if (atributoDebil.valor < 60) {
            informe += `<li style="margin-bottom: 8px;"><span style="color: ${atributoDebil.color};">📉 DEBILIDAD ESTRUCTURAL:</span> El monoplaza sufre en <strong>${atributoDebil.nombre.toLowerCase()}</strong>. Desarrolla componentes que mejoren esta área.</li>`;
        }
        
        if (piezaDebil) {
            const areasMap = {
                'suelo': 'suelo',
                'motor': 'motor',
                'aleron_delantero': 'alerón delantero',
                'caja_cambios': 'caja de cambios',
                'pontones': 'pontones',
                'suspension': 'suspensión',
                'aleron_trasero': 'alerón trasero',
                'chasis': 'chasis',
                'frenos': 'frenos',
                'volante': 'volante',
                'electronica': 'electrónica'
            };
            informe += `<li style="margin-bottom: 8px;"><span style="color: #FF9800;">🔧 PIEZA DÉBIL:</span> El <strong>${areasMap[piezaDebil] || piezaDebil}</strong> es el componente de menor rendimiento. Considera reemplazarlo o mejorarlo.</li>`;
        }
        
        informe += `
                    <li style="margin-bottom: 8px;"><span style="color: #00d2be;">🔄 CICLO DE MEJORA:</span> Programa una nueva prueba tras realizar cambios para verificar evolución.</li>
                </ul>
            </div>
            
            <div class="informe-firma">
                <p><strong>Ing. Carlos Méndez</strong><br>
                Jefe de Departamento de Pruebas y Validación<br>
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
            background: rgba(0,0,0,0.95);
            z-index: 99999;
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
                position: relative;
                box-shadow: 0 0 30px rgba(0,210,190,0.5);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #00d2be;
                    position: sticky;
                    top: 0;
                    background: #1a1a2e;
                    z-index: 10;
                ">
                    <h3 style="color: #00d2be; margin: 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-flag-checkered"></i>
                        SIMULACIÓN COMPLETADA
                    </h3>
                    <button class="cerrar-informe-btn" style="
                        background: #e10600;
                        color: white;
                        border: none;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 1.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        border: 2px solid #ff4444;
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
                            ${mejora > 0 ? 'MEJORA DE ' : 'REGRESIÓN DE '}${this.formatearTiempo(Math.abs(mejora))}
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
                    position: sticky;
                    bottom: 0;
                    background: #1a1a2e;
                    z-index: 10;
                ">
                    <button class="ver-historico-btn" style="
                        flex: 1;
                        padding: 12px;
                        background: rgba(0,210,190,0.2);
                        border: 1px solid #00d2be;
                        color: #00d2be;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    ">
                        <i class="fas fa-history"></i> VER HISTÓRICO
                    </button>
                    <button class="nueva-prueba-btn" style="
                        flex: 1;
                        padding: 12px;
                        background: #00d2be;
                        border: 1px solid #00d2be;
                        color: black;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    ">
                        <i class="fas fa-redo"></i> NUEVA PRUEBA
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Eventos del modal - USANDO CLASS EN LUGAR DE ID
        const cerrarBtn = modal.querySelector('.cerrar-informe-btn');
        const verHistoricoBtn = modal.querySelector('.ver-historico-btn');
        const nuevaPruebaBtn = modal.querySelector('.nueva-prueba-btn');
        
        // Función para cerrar modal
        const cerrarModal = () => {
            if (modal && modal.parentNode) {
                modal.remove();
            }
        };
        
        // Evento cerrar
        if (cerrarBtn) {
            cerrarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cerrarModal();
            });
        }
        
        // Evento ver histórico
        if (verHistoricoBtn) {
            verHistoricoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cerrarModal();
                // Desplazarse al histórico
                setTimeout(() => {
                    const historialSection = document.querySelector('.historial-panel');
                    if (historialSection) {
                        historialSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            });
        }
        
        // Evento nueva prueba
        if (nuevaPruebaBtn) {
            nuevaPruebaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cerrarModal();
                // Iniciar nueva simulación si no hay activa
                setTimeout(() => {
                    if (!this.simulacionActiva) {
                        this.iniciarSimulacion();
                    }
                }, 100);
            });
        }
        
        // Cerrar con ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                cerrarModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
        
        // Prevenir que el scroll del body se desplace mientras el modal está abierto
        document.body.style.overflow = 'hidden';
        
        // Restaurar scroll al cerrar
        const restoreScroll = () => {
            document.body.style.overflow = '';
        };
        
        // Guardar la función de restauración para usarla al cerrar
        const originalRemove = modal.remove;
        modal.remove = function() {
            restoreScroll();
            originalRemove.call(this);
        };
    }
    
    // ========================
    // INICIAR CONTADOR DE SIMULACIÓN
    // ========================
    // ========================
    // INICIAR CONTADOR DE SIMULACIÓN
    // ========================
    iniciarContadorSimulacion() {
        console.log('🏁 Iniciando contador de simulación con circuito animado');
        
        // Referencias a elementos DOM (con reintento si no existen)
        let coche = document.getElementById('coche-animado');
        let faseActual = document.getElementById('fase-actual');
        let sectoresContainer = document.getElementById('sectores-container');
        let tiempoRestanteSpan = document.getElementById('tiempo-restante-circuito');
        
        // Reintentar obtener referencias si no existen (el DOM puede tardar)
        let reintentos = 0;
        const esperarElementos = setInterval(() => {
            coche = document.getElementById('coche-animado');
            faseActual = document.getElementById('fase-actual');
            sectoresContainer = document.getElementById('sectores-container');
            tiempoRestanteSpan = document.getElementById('tiempo-restante-circuito');
            
            if (coche && faseActual) {
                clearInterval(esperarElementos);
                console.log('✅ Elementos del circuito encontrados');
                iniciarAnimacion();
            } else {
                reintentos++;
                if (reintentos > 20) { // 2 segundos máximo de espera
                    clearInterval(esperarElementos);
                    console.error('❌ No se pudieron encontrar los elementos del circuito');
                    // Fallback: usar el contador antiguo
                    this.iniciarContadorSimple();
                }
            }
        }, 100);
        
        const iniciarAnimacion = () => {
            // Variables de control
            let calentamientoDuration = 30000; // 30 segundos
            let clasificacionDuration = 30000; // 30 segundos
            let duracionTotal = 60000; // 60 segundos en milisegundos
            
            // Si no hay tiempo de inicio guardado, crear uno nuevo
            if (!this.tiempoInicioSimulacion) {
                this.tiempoInicioSimulacion = Date.now();
                this.duracionTotalSimulacion = duracionTotal;
            }
            
            // Resetear sectores
            document.querySelectorAll('.sector').forEach(s => {
                s.style.strokeDashoffset = s.style.strokeDasharray.split(' ')[0];
            });
            
            // Puntos del circuito (DESDE GEOGEBRA - ESCALADOS para 500x180)
            const puntosCircuito = [
                {x: 250, y: 90, t: 0.000},
                {x: 170, y: 90, t: 0.021},
                {x: 165.4, y: 86.5, t: 0.042},
                {x: 165.4, y: 81.9, t: 0.063},
                {x: 164.4, y: 71.9, t: 0.083},
                {x: 154.736, y: 69.703, t: 0.104},
                {x: 147.016, y: 80.775, t: 0.125},
                {x: 146.483, y: 90, t: 0.146},
                {x: 145.152, y: 98.784, t: 0.167},
                {x: 139.296, y: 97.453, t: 0.188},
                {x: 132.641, y: 92.928, t: 0.208},
                {x: 124.389, y: 93.46, t: 0.229},
                {x: 121.194, y: 108.633, t: 0.250},
                {x: 120.928, y: 129.131, t: 0.271},
                {x: 110.935, y: 146.027, t: 0.292},
                {x: 99.874, y: 161.236, t: 0.313},
                {x: 101.947, y: 173.335, t: 0.333},
                {x: 110.589, y: 179.557, t: 0.354},
                {x: 119.922, y: 174.372, t: 0.375},
                {x: 134.441, y: 165.384, t: 0.396},
                {x: 142.737, y: 161.927, t: 0.417},
                {x: 157.601, y: 165.73, t: 0.438},
                {x: 166.242, y: 176.791, t: 0.458},
                {x: 175.23, y: 188.544, t: 0.479},
                {x: 190, y: 190, t: 0.500},
                {x: 201.846, y: 182.668, t: 0.521},
                {x: 206.686, y: 169.532, t: 0.542},
                {x: 199.426, y: 155.705, t: 0.563},
                {x: 184.908, y: 141.533, t: 0.583},
                {x: 181.452, y: 132.545, t: 0.604},
                {x: 193.204, y: 131.508, t: 0.625},
                {x: 205.649, y: 128.397, t: 0.646},
                {x: 218.438, y: 127.015, t: 0.667},
                {x: 226.735, y: 141.533, t: 0.688},
                {x: 233.302, y: 162.273, t: 0.708},
                {x: 241.944, y: 179.557, t: 0.729},
                {x: 256.462, y: 174.372, t: 0.750},
                {x: 260.265, y: 164.347, t: 0.771},
                {x: 258.536, y: 156.051, t: 0.792},
                {x: 270, y: 150, t: 0.813},
                {x: 281.696, y: 151.557, t: 0.833},
                {x: 284.116, y: 142.57, t: 0.854},
                {x: 284.807, y: 122.175, t: 0.875},
                {x: 286.536, y: 101.781, t: 0.896},
                {x: 288.61, y: 76.201, t: 0.917},
                {x: 273.054, y: 74.473, t: 0.938},
                {x: 266.487, y: 90, t: 0.958},
                {x: 259.573, y: 99.015, t: 0.979},
                {x: 250, y: 90, t: 1.000}
            ];
    
            // Posicionar coche al inicio
            coche.setAttribute('x', puntosCircuito[0].x);
            coche.setAttribute('y', puntosCircuito[0].y);
            coche.setAttribute('fill', '#FFD700');
            
            // Función para obtener posición interpolada
            const getPosicionEnCircuito = (progreso) => {
                progreso = Math.max(0, Math.min(1, progreso));
                
                for (let i = 0; i < puntosCircuito.length - 1; i++) {
                    if (progreso >= puntosCircuito[i].t && progreso <= puntosCircuito[i+1].t) {
                        const p1 = puntosCircuito[i];
                        const p2 = puntosCircuito[i+1];
                        
                        const segmentoProgreso = (progreso - p1.t) / (p2.t - p1.t);
                        const x = p1.x + (p2.x - p1.x) * segmentoProgreso;
                        const y = p1.y + (p2.y - p1.y) * segmentoProgreso;
                        
                        return {x, y};
                    }
                }
                return puntosCircuito[0];
            };
            
            // Limpiar intervalo anterior
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            
            // Intervalo de animación (cada 50ms)
            this.timerInterval = setInterval(() => {
                // Calcular progreso real basado en el tiempo transcurrido desde el inicio GLOBAL
                const tiempoTranscurridoReal = Date.now() - this.tiempoInicioSimulacion;
                
                // Actualizar tiempo restante (para el display)
                if (tiempoRestanteSpan) {
                    const segundosRestantes = Math.max(0, Math.ceil((this.duracionTotalSimulacion - tiempoTranscurridoReal) / 1000));
                    this.tiempoRestante = segundosRestantes;
                    tiempoRestanteSpan.textContent = this.formatearTiempoContador(segundosRestantes);
                }
                
                // Determinar en qué fase estamos basado en el tiempo REAL
                if (tiempoTranscurridoReal < calentamientoDuration) {
                    // FASE 1: CALENTAMIENTO (0-30 segundos)
                    if (faseActual) {
                        faseActual.innerHTML = '🟢 VUELTA DE CALENTAMIENTO - Preparando neumáticos...';
                        faseActual.style.color = '#aaa';
                    }
                    if (sectoresContainer) sectoresContainer.style.display = 'none';
                    
                    // Progreso en calentamiento (0 a 1) - ocupa la primera mitad del recorrido (t: 0 a 0.5)
                    const progresoCalentamiento = tiempoTranscurridoReal / calentamientoDuration;
                    const pos = getPosicionEnCircuito(progresoCalentamiento * 0.5);
                    coche.setAttribute('x', pos.x);
                    coche.setAttribute('y', pos.y);
                } 
                else if (tiempoTranscurridoReal < duracionTotal) {
                    // FASE 2: CLASIFICACIÓN (30-60 segundos)
                    if (faseActual) {
                        faseActual.innerHTML = '🔴 VUELTA DE CLASIFICACIÓN - Marcando sectores';
                        faseActual.style.color = '#e10600';
                    }
                    if (sectoresContainer) sectoresContainer.style.display = 'flex';
                    
                    // Progreso en clasificación (0 a 1) - ocupa la segunda mitad del recorrido (t: 0.5 a 1)
                    const progresoClasif = (tiempoTranscurridoReal - calentamientoDuration) / clasificacionDuration;
                    const pos = getPosicionEnCircuito(0.5 + progresoClasif * 0.5);
                    coche.setAttribute('x', pos.x);
                    coche.setAttribute('y', pos.y);
                    
                    // ========== SECTORES: APARECEN COMPLETOS NADA MÁS EMPEZAR LA CLASIFICACIÓN ==========
                    // Los 3 sectores se muestran completos desde el segundo 30
                    document.querySelector('.sector1').style.strokeDashoffset = 0;
                    document.querySelector('.sector2').style.strokeDashoffset = 0;
                    document.querySelector('.sector3').style.strokeDashoffset = 0;
                    // ========== FIN SECTORES ==========
                } 
                else {
                    // FINALIZAR SIMULACIÓN
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                    
                    // Coche en meta
                    coche.setAttribute('x', 250);
                    coche.setAttribute('y', 90);
                    coche.setAttribute('fill', '#4CAF50');
                    
                    if (faseActual) {
                        faseActual.innerHTML = '✅ SIMULACIÓN COMPLETADA';
                        faseActual.style.color = '#4CAF50';
                    }
                    
                    // Todos los sectores completados
                    const sector1 = document.querySelector('.sector1');
                    if (sector1) sector1.style.strokeDashoffset = 0;
                    
                    const sector2 = document.querySelector('.sector2');
                    if (sector2) sector2.style.strokeDashoffset = 0;
                    
                    const sector3 = document.querySelector('.sector3');
                    if (sector3) sector3.style.strokeDashoffset = 0;
                    
                    this.finalizarSimulacion(this.simulacionId);
                }
            }, 50);
        };
    }
    iniciarContadorSimple() {
        console.log('⚠️ Usando contador simple de emergencia');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.tiempoRestante > 0) {
                this.tiempoRestante--;
            } else {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.finalizarSimulacion(this.simulacionId);
            }
        }, 1000);
    }    
    // ========================
    // INICIAR CONTADOR VISUAL
    // ========================
    iniciarContadorVisual() {
        // Simplemente llamamos a iniciarContadorSimulacion que ya tiene la lógica
        this.iniciarContadorSimulacion();
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
                
                <!-- ========== CUADERNO DEL INGENIERO - SIEMPRE MINIMIZADO ========== -->
                <div id="cuaderno-ingeniero-container" style="
                    background: rgba(20, 20, 25, 0.95);
                    border: 1px solid rgba(200, 200, 200, 0.2);
                    border-radius: 6px;
                    margin-bottom: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                ">
                    <!-- SOLO CABECERA - SIEMPRE VISIBLE -->
                    <div id="cabecera-cuaderno" onclick="toggleCuadernoIngeniero()" style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 14px 18px;
                        background: rgba(40, 40, 45, 0.8);
                        cursor: pointer;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    ">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="
                                background: #3a3a40;
                                width: 32px;
                                height: 32px;
                                border-radius: 4px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: #d4d4d8;
                                font-size: 0.9rem;
                            ">
                                <i class="fas fa-book-open"></i>
                            </div>
                            <div>
                                <span style="color: #e0e0e0; font-weight: 500; font-size: 0.95rem; letter-spacing: 0.3px;">
                                    NOTAS DEL INGENIERO JEFE
                                </span>
                                <span style="
                                    display: inline-block;
                                    margin-left: 12px;
                                    padding: 2px 8px;
                                    background: rgba(150, 150, 150, 0.15);
                                    color: #aaa;
                                    border-radius: 12px;
                                    font-size: 0.7rem;
                                ">
                                    ARCHIVO TÉCNICO
                                </span>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span id="flecha-cuaderno" style="color: #a0a0a0; font-size: 0.85rem;">
                                <i class="fas fa-chevron-down"></i> VER ANOTACIONES
                            </span>
                        </div>
                    </div>
                    
                    <!-- CONTENIDO - SIEMPRE OCULTO POR DEFECTO -->
                    <div id="contenido-cuaderno" style="display: none; padding: 24px; background: rgba(18, 18, 22, 0.95); border-top: 1px solid rgba(200, 200, 200, 0.1);">
                        
                        <div style="display: flex; gap: 20px; align-items: flex-start;">
                            <div style="font-size: 2.2rem; color: #5a5a60; opacity: 0.5; line-height: 1;">📓</div>
                            
                            <div style="flex: 1;">
                                <!-- Título más profesional -->
                                <div style="margin-bottom: 20px;">
                                    <span style="color: #b0b0b8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(200,200,200,0.2); padding-bottom: 6px;">
                                        ANÁLISIS TÉCNICO · DEPARTAMENTO DE INGENIERÍA
                                    </span>
                                </div>
                                
                                <!-- Texto principal con tono profesional -->
                                <p style="color: #d0d0d8; margin: 0 0 20px 0; font-size: 0.95rem; line-height: 1.7; font-weight: 400;">
                                    <span style="color: #b0b0b8;">"Jefe, llevo 20 años en esto y aún me sorprendo."</span>
                                </p>
                                
                                <p style="color: #c0c0c8; margin: 0 0 18px 0; font-size: 0.95rem; line-height: 1.7;">
                                    ¿Recuerda el Gran Premio de Spa del año pasado? Todo el mundo daba por favorito a Ferrari. 
                                    Traían 42 evoluciones en las últimas 8 semanas. Gastaron €18 millones solo en el mes anterior.
                                </p>
                                
                                <p style="color: #c0c0c8; margin: 0 0 18px 0; font-size: 0.95rem; line-height: 1.7;">
                                    Y perdieron. Contra un equipo con presupuesto medio, solo 23 evoluciones, pero las piezas adecuadas.
                                </p>
                                
                                <p style="color: #c0c0c8; margin: 0 0 18px 0; font-size: 0.95rem; line-height: 1.7;">
                                    <span style="color: #d8d8e0;">¿Qué tenían ellos que nosotros no?</span> No era dinero. No era personal. 
                                    Era conocimiento. Habían probado, fallado, anotado, repetido. Sabían qué configuraciones funcionaban 
                                    y cuáles eran contraproducentes.
                                </p>
                                
                                <p style="color: #c0c0c8; margin: 0 0 18px 0; font-size: 0.95rem; line-height: 1.7;">
                                    El 60% de las evoluciones fueron descartadas. Directamente a la papelera. No porque estuvieran rotas. 
                                    Porque hacían el coche más lento. Y si no pruebas, nunca sabes cuáles son perjudiciales y cuáles son beneficiosas.
                                </p>
                                
                                <!-- Bloque de estadísticas con diseño limpio -->
                                <div style="
                                    background: rgba(25, 25, 30, 0.8);
                                    border-left: 3px solid #6a6a72;
                                    padding: 18px 20px;
                                    margin: 24px 0 20px 0;
                                ">
                                    <p style="color: #e0e0e8; margin: 0 0 12px 0; font-weight: 500; font-size: 0.9rem;">
                                        Análisis de efectividad:
                                    </p>
                                    
                                    <div style="display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap;">
                                        <div style="flex: 1; min-width: 180px;">
                                            <div style="color: #9a9aa2; font-size: 0.8rem; margin-bottom: 4px;">MEJORAS EFECTIVAS</div>
                                            <div style="color: #8bc34a; font-size: 1.2rem; font-weight: 400;">40%</div>
                                        </div>
                                        <div style="flex: 1; min-width: 180px;">
                                            <div style="color: #9a9aa2; font-size: 0.8rem; margin-bottom: 4px;">SIN EFECTO O NEGATIVAS</div>
                                            <div style="color: #ef5350; font-size: 1.2rem; font-weight: 400;">60%</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Cita final profesional -->
                                <p style="color: #aaaab2; margin: 24px 0 0 0; font-size: 0.9rem; font-style: italic; border-top: 1px solid rgba(150,150,160,0.2); padding-top: 18px;">
                                    <i class="fas fa-flag-checkered" style="color: #7a7a82; margin-right: 8px;"></i>
                                    "Nosotros no gastamos más que nadie. Solo gastamos mejor."
                                    <span style="display: block; color: #888890; font-size: 0.8rem; margin-top: 6px; font-style: normal;">
                                        — Ingeniero Jefe
                                    </span>
                                </p>
                                
                                <div style="
                                    display: flex;
                                    justify-content: flex-end;
                                    margin-top: 20px;
                                    padding-top: 10px;
                                ">
                                    <span style="color: #66666e; font-size: 0.7rem;">
                                        <i class="fas fa-info-circle"></i> Documentación interna · v1.0
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- ========== FIN CUADERNO DEL INGENIERO ========== -->
                
                <p class="simulacion-desc" style="margin-top: 5px;">
                    La simulación realizará <strong>${this.config.vueltasPrueba} vueltas</strong> para determinar el 
                    <strong style="color: #00d2be;">mejor tiempo por vuelta</strong> de tu coche.
                    <br><span style="color: #aaa; font-size: 0.9rem;">⏱️ Registramos la vuelta MÁS RÁPIDA - tu referencia para pronósticos.</span>
                </p>
            
                <button id="iniciar-simulacion-btn" class="btn-iniciar-simulacion" ${!puedeProbar ? 'disabled' : ''}>
                    <i class="fas fa-play"></i>
                    ${puedeProbar ? 'INICIAR SIMULACIÓN (1 Minuto)' : 'NO HAY PIEZAS MONTADAS'}
                </button>
                
                ${ultimaPrueba ? `
                    <div class="ultima-prueba-info">
                        <p><i class="fas fa-history"></i> Última prueba: ${this.formatearFecha(ultimaPrueba.fecha_prueba)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    generarHTMLSimulacionActiva() {
        return `
            <div class="control-activo">
                <h4><i class="fas fa-spinner fa-spin"></i> SIMULACIÓN EN CURSO</h4>


                <!-- CIRCUITO ANIMADO - DISEÑO PERSONALIZADO -->
                <div class="circuito-container">
                    <svg id="circuito-svg" width="100%" height="440" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <filter id="glow-coche" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            
                            <g id="coche-icon">
                                <circle cx="0" cy="0" r="6" fill="#FFD700" stroke="white" stroke-width="2"/>
                                <circle cx="0" cy="0" r="3" fill="black"/>
                                <line x1="0" y1="-8" x2="0" y2="8" stroke="white" stroke-width="1.5"/>
                                <line x1="-8" y1="0" x2="8" y2="0" stroke="white" stroke-width="1.5"/>
                            </g>
                        </defs>
                        
                        <!-- Fondo del circuito (gris) - TU CIRCUITO DE GEOGEBRA -->
                        <path id="circuito-base" 
                              d="M 250,90 
                                 L 170,90 
                                 L 165.4,86.5 
                                 L 165.4,81.9 
                                 L 164.4,71.9 
                                 L 154.736,69.703 
                                 L 147.016,80.775 
                                 L 146.483,90 
                                 L 145.152,98.784 
                                 L 139.296,97.453 
                                 L 132.641,92.928 
                                 L 124.389,93.46 
                                 L 121.194,108.633 
                                 L 120.928,129.131 
                                 L 110.935,146.027 
                                 L 99.874,161.236 
                                 L 101.947,173.335 
                                 L 110.589,179.557 
                                 L 119.922,174.372 
                                 L 134.441,165.384 
                                 L 142.737,161.927 
                                 L 157.601,165.73 
                                 L 166.242,176.791 
                                 L 175.23,188.544 
                                 L 190,190 
                                 L 201.846,182.668 
                                 L 206.686,169.532 
                                 L 199.426,155.705 
                                 L 184.908,141.533 
                                 L 181.452,132.545 
                                 L 193.204,131.508 
                                 L 205.649,128.397 
                                 L 218.438,127.015 
                                 L 226.735,141.533 
                                 L 233.302,162.273 
                                 L 241.944,179.557 
                                 L 256.462,174.372 
                                 L 260.265,164.347 
                                 L 258.536,156.051 
                                 L 270,150 
                                 L 281.696,151.557 
                                 L 284.116,142.57 
                                 L 284.807,122.175 
                                 L 286.536,101.781 
                                 L 288.61,76.201 
                                 L 273.054,74.473 
                                 L 266.487,90 
                                 L 259.573,99.015 
                                 L 250,90" 
                              fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        
                        <!-- SECTOR 1 (Verde) - Primer tercio del circuito -->
                        <path id="sector1" 
                              d="M 250,90 
                                 L 170,90 
                                 L 165.4,86.5 
                                 L 165.4,81.9 
                                 L 164.4,71.9 
                                 L 154.736,69.703 
                                 L 147.016,80.775 
                                 L 146.483,90 
                                 L 145.152,98.784 
                                 L 139.296,97.453 
                                 L 132.641,92.928 
                                 L 124.389,93.46 
                                 L 121.194,108.633 
                                 L 120.928,129.131 
                                 L 110.935,146.027 
                                 L 99.874,161.236" 
                              fill="none" stroke="#4CAF50" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"
                              class="sector sector1" style="stroke-dasharray: 450; stroke-dashoffset: 450;"/>
                        
                        <!-- SECTOR 2 (Azul) - Segundo tercio del circuito -->
                        <path id="sector2" 
                              d="M 99.874,161.236 
                                 L 101.947,173.335 
                                 L 110.589,179.557 
                                 L 119.922,174.372 
                                 L 134.441,165.384 
                                 L 142.737,161.927 
                                 L 157.601,165.73 
                                 L 166.242,176.791 
                                 L 175.23,188.544 
                                 L 190,190 
                                 L 201.846,182.668 
                                 L 206.686,169.532 
                                 L 199.426,155.705 
                                 L 184.908,141.533 
                                 L 181.452,132.545 
                                 L 193.204,131.508" 
                              fill="none" stroke="#2196F3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"
                              class="sector sector2" style="stroke-dasharray: 380; stroke-dashoffset: 380;"/>
                        
                        <!-- SECTOR 3 (Rojo) - Último tercio del circuito -->
                        <path id="sector3" 
                              d="M 193.204,131.508 
                                 L 205.649,128.397 
                                 L 218.438,127.015 
                                 L 226.735,141.533 
                                 L 233.302,162.273 
                                 L 241.944,179.557 
                                 L 256.462,174.372 
                                 L 260.265,164.347 
                                 L 258.536,156.051 
                                 L 270,150 
                                 L 281.696,151.557 
                                 L 284.116,142.57 
                                 L 284.807,122.175 
                                 L 286.536,101.781 
                                 L 288.61,76.201 
                                 L 273.054,74.473 
                                 L 266.487,90 
                                 L 259.573,99.015 
                                 L 250,90" 
                              fill="none" stroke="#e10600" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"
                              class="sector sector3" style="stroke-dasharray: 420; stroke-dashoffset: 420;"/>
                        
                        <!-- COCHE -->
                        <use id="coche-animado" href="#coche-icon" x="250" y="90" filter="url(#glow-coche)"/>
                    </svg>
                    
                    <!-- FASE ACTUAL Y MENSAJES -->
                    <div id="fase-actual" class="fase-actual" style="text-align: center; margin: 15px 0 10px 0; font-weight: bold; color: #00d2be;">
                        🟢 VUELTA DE CALENTAMIENTO - Preparando neumáticos...
                    </div>
                    
                    <!-- INDICADOR DE SECTORES -->
                    <div id="sectores-container" class="sectores-container" style="display: none; justify-content: center; gap: 20px; margin: 10px 0;">
                        <div class="sector-indicator" id="sector1-indicator" style="padding: 5px 15px; border-radius: 20px; background: #333; color: #4CAF50; border: 1px solid #4CAF50;">🏁 S1</div>
                        <div class="sector-indicator" id="sector2-indicator" style="padding: 5px 15px; border-radius: 20px; background: #333; color: #2196F3; border: 1px solid #2196F3;">🏁 S2</div>
                        <div class="sector-indicator" id="sector3-indicator" style="padding: 5px 15px; border-radius: 20px; background: #333; color: #e10600; border: 1px solid #e10600;">🏁 S3</div>
                    </div>
                    
                    <!-- TIEMPO RESTANTE -->
                    <div style="text-align: center; color: #aaa; font-size: 0.8rem; margin-top: 5px;">
                        <span id="tiempo-restante-circuito">${this.formatearTiempoContador(this.tiempoRestante)}</span>
                    </div>
                </div>
                
                <div class="simulacion-activa-info" style="margin-top: 20px;">
                    <p><i class="fas fa-info-circle"></i> Primero vuelta de calentamiento (30s), luego vuelta de clasificación por sectores.</p>
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
            /* Mejora visual del circuito */
            #circuito-base {
                filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));
                stroke-linecap: round;
                stroke-linejoin: round;
            }
            
            .sector {
                transition: stroke-dashoffset 0.3s ease-out;
                stroke-linecap: round;
                stroke-linejoin: round;
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
            
            
            /* === GRÁFICO DE EVOLUCIÓN === */
            .grafico-panel {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                border: 1px solid rgba(0, 210, 190, 0.2);
                padding: 20px;
                margin-top: 25px;
                margin-bottom: 25px;
            }
            
            .grafico-container {
                width: 100%;
                min-height: 280px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                padding: 20px 15px;
                position: relative;
            }
            
            .grafico-titulo {
                color: #00d2be;
                font-weight: bold;
                font-size: 0.85rem;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
                letter-spacing: 1px;
            }
            
            .barras-container {
                display: flex;
                align-items: flex-end;
                justify-content: space-around;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .barra-item {
                text-align: center;
                width: 70px;
                transition: transform 0.2s;
            }
            
            .barra-item:hover {
                transform: translateY(-5px);
            }
            
            .barra-wrapper {
                height: 120px;
                display: flex;
                flex-direction: column-reverse;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .barra {
                width: 36px;
                background: #00d2be;
                border-radius: 4px 4px 0 0;
                transition: height 0.3s, box-shadow 0.3s;
                position: relative;
            }
            
            .barra:hover {
                box-shadow: 0 0 12px currentColor;
            }
            
            .barra-tiempo {
                font-family: 'Orbitron', monospace;
                font-size: 0.8rem;
                color: white;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
            }
            
            .barra-fecha {
                font-size: 0.65rem;
                color: #aaa;
                margin-top: 4px;
            }
            
            .linea-meta {
                border-top: 2px dashed #FFD700;
                width: 100%;
                pointer-events: none;
            }
            
            .linea-meta-texto {
                background: rgba(255, 215, 0, 0.15);
                color: #FFD700;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 0.7rem;
                font-weight: bold;
                backdrop-filter: blur(2px);
                border: 1px solid rgba(255, 215, 0, 0.3);
                white-space: nowrap;
            }
            
            .diferencia-meta {
                margin-top: 20px;
                padding: 12px 18px;
                background: rgba(255, 215, 0, 0.08);
                border-left: 4px solid #FFD700;
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .barras-container {
                    gap: 5px;
                }
                
                .barra-item {
                    width: 55px;
                }
                
                .barra {
                    width: 28px;
                }
                
                .barra-tiempo {
                    font-size: 0.7rem;
                }
                
                .linea-meta-texto {
                    white-space: normal;
                    font-size: 0.6rem;
                    right: 0 !important;
                    left: 0 !important;
                    width: 90%;
                    margin: 0 auto;
                    text-align: center;
                }
            }
            
            @media (max-width: 480px) {
                .barras-container {
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .barra-item {
                    width: 45px;
                }
                
                .barra {
                    width: 24px;
                }
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
            // AÑADIR DENTRO DE aplicarEstilosIngenieria(), junto con los otros estilos
            
            /* CIRCUITO ANIMADO */
            /* CIRCUITO ANIMADO */
            .circuito-container {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 12px;
                padding: 20px;
                margin: 15px 0;
                border: 1px solid rgba(255, 215, 0, 0.2);
            }
            
            /* ✅ MEJORADO: más sombra y brillo */
            .circuito-container {
                background: rgba(0, 0, 0, 0.5);
                border-radius: 16px;
                padding: 20px;
                margin: 15px 0;
                border: 2px solid rgba(0, 210, 190, 0.3);
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            }
            
            #circuito-svg {
                filter: drop-shadow(0 0 10px rgba(0, 210, 190, 0.3));
            }
            
            /* ✅ MEJORADO: más sombra */
            #circuito-svg {
                filter: drop-shadow(0 0 15px rgba(0, 210, 190, 0.5));
            }
            
            .sector {
                transition: stroke-dashoffset 0.3s ease;
                filter: drop-shadow(0 0 8px currentColor);
            }
            
            /* ✅ MEJORADO: update más rápido y más glow */
            .sector {
                transition: stroke-dashoffset 0.2s ease;
                filter: drop-shadow(0 0 12px currentColor);
            }
            
            .sector1 {
                stroke: #4CAF50;
                filter: drop-shadow(0 0 12px #4CAF50);
            }
            
            /* ✅ MEJORADO */
            .sector1 {
                stroke: #4CAF50;
                filter: drop-shadow(0 0 15px #4CAF50);
            }
            
            .sector2 {
                stroke: #2196F3;
                filter: drop-shadow(0 0 12px #2196F3);
            }
            
            /* ✅ MEJORADO */
            .sector2 {
                stroke: #2196F3;
                filter: drop-shadow(0 0 15px #2196F3);
            }
            
            .sector3 {
                stroke: #e10600;
                filter: drop-shadow(0 0 12px #e10600);
            }
            
            /* ✅ MEJORADO */
            .sector3 {
                stroke: #e10600;
                filter: drop-shadow(0 0 15px #e10600);
            }
            
            #coche-animado {
                transition: cx 0.1s linear, cy 0.1s linear;
                filter: drop-shadow(0 0 15px gold);
                r: 8;
            }
            
            /* ✅ CAMBIADO: ahora usamos x,y en lugar de cx,cy (porque es un <use>) */
            #coche-animado {
                transition: x 0.2s linear, y 0.2s linear;
                filter: drop-shadow(0 0 20px gold);
            }
            
            /* ✅ NUEVO: estilos para el círculo dentro del coche */
            #coche-animado circle {
                transition: r 0.2s ease;
            }
            
            #coche-animado:hover {
                r: 10;
                filter: drop-shadow(0 0 20px #FFD700);
            }
            
            /* ✅ MEJORADO */
            #coche-animado:hover circle {
                r: 8;
            }
            
            .sector-indicator {
                transition: all 0.3s ease;
                font-weight: bold;
                letter-spacing: 1px;
            }
            
            /* ✅ NUEVO: fondo más oscuro y blur */
            .sector-indicator {
                transition: all 0.3s ease;
                font-weight: bold;
                letter-spacing: 1px;
                background: rgba(0, 0, 0, 0.6) !important;
                backdrop-filter: blur(5px);
            }
            
            .sector-indicator.completado {
                background: currentColor !important;
                color: black !important;
            }
            
            /* ✅ NUEVO: sombra al completar */
            .sector-indicator.completado {
                background: currentColor !important;
                color: black !important;
                box-shadow: 0 0 20px currentColor;
            }
            
            .fase-actual {
                font-size: 1rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                animation: pulse 2s infinite;
            }
            
            /* ✅ MEJORADO: más grande y con glow */
            .fase-actual {
                font-size: 1.1rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                animation: pulse 1.5s infinite;
                text-shadow: 0 0 10px currentColor;
            }
            
            @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
            
            /* ✅ MEJORADO: con text-shadow */
            @keyframes pulse {
                0% { opacity: 0.7; text-shadow: 0 0 5px currentColor; }
                50% { opacity: 1; text-shadow: 0 0 15px currentColor; }
                100% { opacity: 0.7; text-shadow: 0 0 5px currentColor; }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .circuito-container svg {
                    height: 150px;
                }
                
                #coche-animado {
                    r: 6;
                }
            }
            
            /* ✅ NUEVO: responsive para el nuevo coche */
            @media (max-width: 768px) {
                .circuito-container svg {
                    height: 150px;
                }
                
                #coche-animado circle {
                    r: 4;
                }
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
        // 🆕 CARGAR GRÁFICO AL INICIAR (si ya hay datos)
        setTimeout(() => {
            if (this.tiemposHistoricos && this.tiemposHistoricos.length > 0) {
                this.dibujarGraficoEvolucionConMeta();
            }
        }, 1000);        
        console.log('✅ Sistema de ingeniería inicializado');
    }
}

// ========================
// FUNCIONES GLOBALES
// ========================
window.IngenieriaManager = IngenieriaManager;

// ========================
// FUNCIÓN PARA ABRIR/CERRAR CUADERNO
// ========================
window.toggleCuadernoIngeniero = function() {
    const contenido = document.getElementById('contenido-cuaderno');
    const flecha = document.getElementById('flecha-cuaderno');
    
    if (!contenido) return;
    
    if (contenido.style.display === 'none') {
        // ABRIR
        contenido.style.display = 'block';
        flecha.innerHTML = '<i class="fas fa-chevron-up"></i> TOCA PARA CERRAR';
    } else {
        // CERRAR
        contenido.style.display = 'none';
        flecha.innerHTML = '<i class="fas fa-chevron-down"></i> TOCA PARA LEER';
    }
};

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
