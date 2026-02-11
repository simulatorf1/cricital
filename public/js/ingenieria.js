
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
            
            // 4. Tomar últimas 8 pruebas como máximo (para que sea legible)
            const historial = this.tiemposHistoricos.slice(0, 8).reverse();
            
            if (historial.length < 2) {
                contenedor.innerHTML = '<p style="color: #888; text-align: center; padding: 30px;">Necesitas al menos 2 pruebas para ver el gráfico</p>';
                return;
            }
    
            // 5. CALCULAR ESCALA REAL
            const tiempos = historial.map(p => p.tiempo_vuelta);
            
            // Añadir el tiempo del líder al conjunto para que la escala lo incluya
            if (mejorGlobal) {
                tiempos.push(mejorGlobal.tiempo);
            }
            
            const tiempoMinimo = Math.min(...tiempos) - 0.2;
            const tiempoMaximo = Math.max(...tiempos) + 0.2;
            const rango = tiempoMaximo - tiempoMinimo;
            
            // Altura del gráfico en píxeles
            const ALTURA_GRAFICO = 200;
            
            // 6. Generar puntos para la línea SVG
            let puntos = [];
            const pasoX = 70;
            
            historial.forEach((prueba, index) => {
                const x = 50 + (index * pasoX);
                const y = ALTURA_GRAFICO - ((prueba.tiempo_vuelta - tiempoMinimo) / rango) * ALTURA_GRAFICO + 20;
                puntos.push(`${x},${y}`);
            });
            
            const puntosString = puntos.join(' ');
            
            // 7. Calcular posición Y de la línea del líder
            let lineaMetaY = null;
            if (mejorGlobal) {
                lineaMetaY = ALTURA_GRAFICO - ((mejorGlobal.tiempo - tiempoMinimo) / rango) * ALTURA_GRAFICO + 20;
            }
            
            // 8. Generar marcas del eje Y (tiempos)
            const marcasY = [];
            const numMarcas = 6;
            for (let i = 0; i <= numMarcas; i++) {
                const tiempo = tiempoMaximo - (i * (rango / numMarcas));
                marcasY.push(tiempo);
            }
            
            // 9. Generar HTML del gráfico
            let html = `
                <div class="grafico-titulo" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-chart-line" style="color: #00d2be;"></i>
                        <span style="color: white; font-weight: bold;">EVOLUCIÓN DE TIEMPOS POR VUELTA</span>
                    </div>
                    <div style="display: flex; gap: 15px; font-size: 0.75rem;">
                        <span style="display: flex; align-items: center; gap: 5px;">
                            <span style="display: inline-block; width: 12px; height: 3px; background: #00d2be;"></span>
                            <span style="color: #aaa;">TU PROGRESIÓN</span>
                        </span>
                        <span style="display: flex; align-items: center; gap: 5px;">
                            <span style="display: inline-block; width: 12px; height: 2px; border-top: 2px dashed #FFD700;"></span>
                            <span style="color: #FFD700;">LÍDER GLOBAL</span>
                        </span>
                    </div>
                </div>
                
                <div class="grafico-contenedor" style="position: relative; width: 100%; height: 350px; margin-top: 10px;">
                    
                    <!-- ESCALA VERTICAL (EJE Y) - TIEMPOS GRADUADOS -->
                    <div class="escala-y" style="position: absolute; left: 0; top: 0; bottom: 0; width: 70px; display: flex; flex-direction: column; justify-content: space-between; padding: 20px 0; color: #aaa; font-size: 0.75rem; font-family: 'Orbitron', monospace; background: rgba(0,0,0,0.3); border-right: 1px solid #00d2be; border-radius: 4px 0 0 4px;">
            `;
            
            marcasY.forEach((tiempo) => {
                const tiempoFormateado = this.formatearTiempo(tiempo);
                html += `<div style="text-align: right; padding-right: 10px; border-bottom: 1px dotted rgba(255,255,255,0.1);">${tiempoFormateado}</div>`;
            });
            
            html += `
                    </div>
                    
                    <!-- ÁREA DEL GRÁFICO SVG -->
                    <div class="area-svg" style="position: absolute; left: 80px; right: 20px; top: 0; bottom: 0; height: 280px;">
                        <svg width="100%" height="280" viewBox="0 0 ${50 + (historial.length - 1) * pasoX + 80} 280" preserveAspectRatio="xMidYMid meet" style="overflow: visible;">
                            
                            <!-- Líneas de grid horizontales -->
            `;
            
            marcasY.forEach((tiempo, i) => {
                const y = 20 + (i * (ALTURA_GRAFICO / numMarcas));
                html += `<line x1="40" y1="${y}" x2="${50 + (historial.length - 1) * pasoX + 40}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4,4" />`;
            });
            
            // LÍNEA DEL LÍDER (META)
            if (mejorGlobal && lineaMetaY !== null) {
                const nombreEscuderia = mejorGlobal.escuderia ? mejorGlobal.escuderia.substring(0, 20) : 'Líder';
                html += `
                    <line x1="40" y1="${lineaMetaY}" x2="${50 + (historial.length - 1) * pasoX + 40}" y2="${lineaMetaY}" 
                          stroke="#FFD700" stroke-width="2" stroke-dasharray="6,4" />
                    <text x="${50 + (historial.length - 1) * pasoX + 45}" y="${lineaMetaY - 8}" 
                          fill="#FFD700" font-size="9" font-family="Orbitron, monospace" font-weight="bold">
                          🏆 ${mejorGlobal.formateado} (${nombreEscuderia})
                    </text>
                `;
            }
            
            // LÍNEA DE PROGRESIÓN DEL USUARIO
            html += `
                            <polyline points="${puntosString}" 
                                      fill="none" 
                                      stroke="#00d2be" 
                                      stroke-width="3" 
                                      stroke-linecap="round" 
                                      stroke-linejoin="round" />
            `;
            
            // 🟢🔴🔵 PUNTOS (marcadores de cada prueba) - VERSIÓN CORREGIDA
            historial.forEach((prueba, index) => {
                const x = 50 + (index * pasoX);
                const y = ALTURA_GRAFICO - ((prueba.tiempo_vuelta - tiempoMinimo) / rango) * ALTURA_GRAFICO + 20;
                
                // Color del punto según mejora/empeora - CORREGIDO
                let colorPunto = '#00d2be';
                let tooltipTexto = `${prueba.tiempo_formateado || this.formatearTiempo(prueba.tiempo_vuelta)}`;
                let tooltipMejora = '';
                
                if (index === 0) {
                    // Primer punto - sin comparación
                    colorPunto = '#00d2be';
                    tooltipMejora = 'PRIMERA PRUEBA';
                } else {
                    // A PARTIR DEL SEGUNDO PUNTO, SÍ TENEMOS 'anterior'
                    const anterior = historial[index - 1];
                    if (prueba.tiempo_vuelta < anterior.tiempo_vuelta) {
                        colorPunto = '#4CAF50'; // Mejoró (tiempo menor)
                        tooltipMejora = '▼ MEJORÓ';
                    } else if (prueba.tiempo_vuelta > anterior.tiempo_vuelta) {
                        colorPunto = '#e10600'; // Empeoró (tiempo mayor)
                        tooltipMejora = '▲ EMPEORÓ';
                    } else {
                        colorPunto = '#00d2be'; // Igual
                        tooltipMejora = '● IGUAL';
                    }
                }
                
                // Formatear fecha
                let fechaStr = '';
                try {
                    const fecha = new Date(prueba.fecha_prueba || prueba.fecha);
                    fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
                } catch {
                    fechaStr = `P${index + 1}`;
                }
                
                html += `
                    <circle cx="${x}" cy="${y}" r="6" fill="${colorPunto}" stroke="white" stroke-width="2" />
                    
                    <!-- Tooltip mejorado -->
                    <g class="tooltip-group" style="cursor: help;">
                        <circle cx="${x}" cy="${y}" r="14" fill="transparent" stroke="none" />
                        <title>
                            ${fechaStr}
                            Tiempo: ${prueba.tiempo_formateado || this.formatearTiempo(prueba.tiempo_vuelta)}
                            ${tooltipMejora ? `- ${tooltipMejora}` : ''}
                        </title>
                    </g>
                    
                    <!-- Etiqueta con fecha (abajo) -->
                    <text x="${x}" y="270" text-anchor="middle" fill="#aaa" font-size="9" font-family="Arial, sans-serif">
                        ${fechaStr}
                    </text>
                `;
            });
            
            html += `</svg></div>`;
            
            // PIE DEL GRÁFICO - DIFERENCIA CON EL LÍDER
            if (mejorGlobal) {
                const ultimoTiempo = historial[historial.length - 1].tiempo_vuelta;
                const diferencia = ultimoTiempo - mejorGlobal.tiempo;
                const diferenciaFormateada = this.formatearTiempo(Math.abs(diferencia));
                const signo = diferencia > 0 ? '+' : (diferencia < 0 ? '-' : '');
                
                html += `
                    <div style="position: absolute; bottom: -40px; left: 80px; right: 20px; 
                                display: flex; justify-content: space-between; align-items: center;
                                padding: 12px 15px; background: rgba(0,0,0,0.3); border-radius: 6px;
                                margin-top: 10px; border-left: 4px solid #FFD700;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-trophy" style="color: #FFD700;"></i>
                            <span style="color: white;">DISTANCIA AL LÍDER:</span>
                        </div>
                        <div style="font-family: 'Orbitron', monospace; font-size: 1.2rem; font-weight: bold; color: #FFD700;">
                            ${signo}${diferenciaFormateada}
                        </div>
                    </div>
                `;
                
                // Tendencia (mejora/empeora en las últimas pruebas)
                if (historial.length >= 3) {
                    const primero = historial[0].tiempo_vuelta;
                    const ultimo = historial[historial.length - 1].tiempo_vuelta;
                    const tendencia = primero - ultimo;
                    
                    let tendenciaTexto = '';
                    let tendenciaColor = '';
                    let tendenciaIcono = '';
                    
                    if (tendencia > 0.1) {
                        tendenciaTexto = `MEJORANDO: -${this.formatearTiempo(tendencia)} en ${historial.length} pruebas`;
                        tendenciaColor = '#4CAF50';
                        tendenciaIcono = 'fa-arrow-down';
                    } else if (tendencia < -0.1) {
                        tendenciaTexto = `EMPEORANDO: +${this.formatearTiempo(Math.abs(tendencia))} en ${historial.length} pruebas`;
                        tendenciaColor = '#e10600';
                        tendenciaIcono = 'fa-arrow-up';
                    } else {
                        tendenciaTexto = `ESTABLE: ±${this.formatearTiempo(Math.abs(tendencia))} en ${historial.length} pruebas`;
                        tendenciaColor = '#FF9800';
                        tendenciaIcono = 'fa-minus';
                    }
                    
                    html += `
                        <div style="position: absolute; bottom: -90px; left: 80px; right: 20px; 
                                    display: flex; align-items: center; gap: 10px;
                                    padding: 8px 15px; background: rgba(0,0,0,0.2); border-radius: 6px;
                                    margin-top: 5px; color: ${tendenciaColor};">
                            <i class="fas ${tendenciaIcono}"></i>
                            <span style="font-size: 0.85rem;">${tendenciaTexto}</span>
                        </div>
                    `;
                }
            }
            
            html += `</div>`; // Cierra grafico-contenedor
            
            contenedor.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error dibujando gráfico de líneas:', error);
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #e10600;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Error al cargar el gráfico</p>
                    <p style="font-size: 0.8rem; color: #aaa; margin-top: 5px;">${error.message}</p>
                    <button onclick="window.ingenieriaManager.dibujarGraficoEvolucionConMeta()" 
                            style="margin-top: 15px; padding: 8px 20px; background: #00d2be; color: black; border: none; border-radius: 4px; cursor: pointer;">
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
                
                <!-- ========== CUADERNO DEL INGENIERO - SIEMPRE MINIMIZADO ========== -->
                <div id="cuaderno-ingeniero-container" style="
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(0,210,190,0.3);
                    border-radius: 8px;
                    margin-bottom: 20px;
                    overflow: hidden;
                ">
                    <!-- SOLO CABECERA - SIEMPRE VISIBLE -->
                    <div id="cabecera-cuaderno" onclick="toggleCuadernoIngeniero()" style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: rgba(0, 210, 190, 0.1);
                        cursor: pointer;
                    ">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="
                                background: #00d2be;
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: black;
                                font-weight: bold;
                            ">
                                <i class="fas fa-book"></i>
                            </div>
                            <div>
                                <span style="color: white; font-weight: bold; font-size: 0.95rem;">
                                    NOTAS DEL INGENIERO JEFE
                                </span>
                                <span style="
                                    display: inline-block;
                                    margin-left: 10px;
                                    padding: 2px 8px;
                                    background: rgba(255,255,255,0.1);
                                    color: #aaa;
                                    border-radius: 12px;
                                    font-size: 0.7rem;
                                    font-weight: bold;
                                ">
                                    📘 ARCHIVO
                                </span>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span id="flecha-cuaderno" style="color: #00d2be; font-size: 0.9rem;">
                                <i class="fas fa-chevron-down"></i> TOCA PARA LEER
                            </span>
                            <span style="color: #FFD700; font-size: 1rem;">📔</span>
                        </div>
                    </div>
                    
                    <!-- CONTENIDO - SIEMPRE OCULTO POR DEFECTO -->
                    <div id="contenido-cuaderno" style="display: none; padding: 18px; background: rgba(0, 0, 0, 0.6); border-top: 1px solid #00d2be;">
                        <!-- AQUÍ TODO EL CONTENIDO DEL CUADERNO -->
                        <div style="display: flex; gap: 15px; align-items: flex-start;">
                            <div style="font-size: 2rem; color: #FFD700;">📔</div>
                            
                            <div style="flex: 1;">
                                <p style="color: #FFD700; margin: 0 0 10px 0; font-weight: bold; font-size: 1rem;">
                                    "Jefe, llevo 20 años en esto y aún me sorprendo"
                                </p>
                                
                                <p style="color: #ccc; margin: 0 0 16px 0; font-size: 0.95rem; line-height: 1.6;">
                                    <span style="color: #e10600; font-weight: bold;">¿Recuerdas el Gran Premio de Spa del año pasado?</span> 
                                    Todo el mundo daba por favorito a Ferrari. Traían <span style="color: #00d2be; font-weight: bold;">42 evoluciones</span> en las últimas 8 semanas. 
                                    Gastaron <span style="color: #FFD700; font-weight: bold;">€18 millones</span> solo en el mes anterior.
                                </p>
                                
                                <p style="color: #ccc; margin: 0 0 16px 0; font-size: 0.95rem; line-height: 1.6;">
                                    Y perdieron. Contra un equipo con <span style="color: #FFD700; font-weight: bold;">presupuesto medio</span>, 
                                    solo <span style="color: #00d2be; font-weight: bold;">23 evoluciones</span>, pero <span style="color: #4CAF50; font-weight: bold; text-decoration: underline;">LAS PIEZAS ADECUADAS</span>.
                                </p>
                                
                                <p style="color: #ccc; margin: 0 0 16px 0; font-size: 0.95rem; line-height: 1.6;">
                                    <span style="color: #FFD700; font-size: 1.1rem; font-weight: bold;">🔍 ¿Qué tenían ellos que nosotros no?</span><br>
                                    No era dinero. No era personal. <span style="color: #e10600; font-weight: bold;">Era CONOCIMIENTO.</span> 
                                    Habían probado, fallado, anotado, repetido. 
                                    <span style="color: #4CAF50; font-weight: bold;">Sabían qué posiciones funcionaban y cuáles eran veneno puro.</span>
                                </p>
                                
                                <p style="color: #ccc; margin: 0 0 16px 0; font-size: 0.95rem; line-height: 1.6;">
                                    <span style="color: #FF9800; font-weight: bold; font-size: 1rem;">⚡ El 60% de las evoluciones fueron descartadas.</span><br>
                                    Directamente a la papelera. No porque estuvieran rotas. 
                                    <span style="color: #e10600; font-weight: bold;">Porque hacían el coche MÁS LENTO.</span> 
                                    Y si no pruebas, <span style="color: #FFD700; font-weight: bold;">nunca sabes cuáles son veneno y cuáles son oro</span>.
                                </p>
                                
                                <div style="
                                    background: linear-gradient(145deg, rgba(0,210,190,0.08) 0%, rgba(0,0,0,0.2) 100%);
                                    border-left: 6px solid #00d2be;
                                    padding: 16px 20px;
                                    margin: 20px 0 10px 0;
                                    border-radius: 0 12px 12px 0;
                                ">
                                    <p style="color: white; margin: 0 0 8px 0; font-weight: bold; font-size: 1rem;">
                                        <i class="fas fa-lightbulb" style="color: #FFD700; margin-right: 8px;"></i>
                                        Esto es lo que aprendieron:
                                    </p>
                                    
                                    <div style="display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap;">
                                        <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px;">
                                            <span style="color: #4CAF50; font-size: 1.2rem; display: block; margin-bottom: 6px;">✅ 40%</span>
                                            <span style="color: #ccc; font-size: 0.85rem;">Piezas que MEJORARON el tiempo</span>
                                        </div>
                                        <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px;">
                                            <span style="color: #e10600; font-size: 1.2rem; display: block; margin-bottom: 6px;">❌ 60%</span>
                                            <span style="color: #ccc; font-size: 0.85rem;">Piezas que EMPEORARON el tiempo o no mejoraron NADA</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p style="color: #ffaa00; margin: 20px 0 0 0; font-size: 1rem; font-style: italic; font-weight: bold; border-top: 1px solid rgba(255,170,0,0.3); padding-top: 16px;">
                                    <i class="fas fa-flag-checkered" style="color: #FFD700; margin-right: 8px;"></i>
                                    "Nosotros no gastamos más que nadie. Solo <span style="color: #00d2be; border-bottom: 2px solid #00d2be;">GASTAMOS MEJOR</span>."
                                    <span style="display: block; color: #888; font-size: 0.8rem; margin-top: 6px; font-style: normal;">— Ingeniero Jefe, equipo campeón</span>
                                </p>
                                
                                <!-- RESTO DEL CONTENIDO... -->
                                <div style="
                                    display: flex;
                                    justify-content: flex-end;
                                    margin-top: 15px;
                                    padding-top: 10px;
                                    border-top: 1px solid rgba(255,255,255,0.1);
                                ">
                                    <span style="color: #888; font-size: 0.75rem;">
                                        <i class="fas fa-info-circle"></i> Siempre disponible en el archivo
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
                    ${puedeProbar ? 'INICIAR SIMULACIÓN (1 HORA)' : 'NO HAY PIEZAS MONTADAS'}
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
