// ========================
// F1 MANAGER - MAIN.JS COMPLETO (CON TUTORIAL)
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

const produccionStyles = '';

const tallerStyles = '';

// ========================
// 4. CLASE F1Manager PRINCIPAL CON TUTORIAL
// ========================
class F1Manager {
    constructor(user, escuderia, supabase) {
        console.log('🚗 Creando F1Manager para:', user.email);
        this.user = user;
        this.escuderia = escuderia;
        this.supabase = supabase;  // ← Añadir
        this.pilotos = [];
        this.carStats = null;
        this.proximoGP = null;

    }

    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER
    // ========================

    async cargarTabTaller() {
        console.log('🔧 Cargando pestaña taller minimalista...');
        
        const container = document.getElementById('tab-taller');
        if (!container) {
            console.error('❌ No se encontró #tab-taller');
            return;
        }
        
        if (!this.escuderia || !this.escuderia.id) {
            container.innerHTML = '<p class="error">❌ No se encontró tu escudería</p>';
            return;
        }
        
        try {
            // 1. Cargar stats del coche desde coches_stats
            await this.cargarCarStats();
            
            // 2. Cargar piezas fabricadas desde almacen_piezas
            const { data: piezasFabricadas, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('area, nivel, calidad')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', false);
            
            if (errorPiezas) {
                console.error('Error cargando piezas:', errorPiezas);
                throw errorPiezas;
            }
            
            // 3. Cargar fabricaciones activas desde fabricacion_actual
            const { data: fabricacionesActivas, error: errorFabricaciones } = await this.supabase
                .from('fabricacion_actual')
                .select('area, nivel, tiempo_fin, completada')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorFabricaciones) {
                console.error('Error cargando fabricaciones:', errorFabricaciones);
                throw errorFabricaciones;
            }
            
            // 4. Definir las 11 áreas del coche (basado en tu tabla coches_stats)
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            // 5. Contar fabricaciones activas
            const fabricacionesCount = fabricacionesActivas?.length || 0;
            
            // 6. Generar HTML simple: solo botones
            let html = `
                <div class="taller-minimalista">
                    <div class="taller-header-mini">
                        <h2><i class="fas fa-tools"></i> TALLER DE FABRICACIÓN</h2>
                        <div class="fabricaciones-activas-mini">
                            <span class="badge-fabricacion">${fabricacionesCount}/4 fabricando</span>
                        </div>
                    </div>
                    
                    <div class="taller-botones-grid">
            `;
            
            // 7. Para cada área, crear fila con 5 botones horizontales
            areas.forEach(area => {
                // Obtener nivel actual del coche desde coches_stats
                const nivelActual = this.carStats ? 
                    this.carStats[`${area.id}_nivel`] || 0 : 0;
                
                // Contar cuántas piezas tenemos ya fabricadas de este nivel actual + 1
                const nivelAFabricar = nivelActual + 1;
                
                // Filtrar piezas de esta área del nivel que estamos fabricando
                const piezasAreaNivel = piezasFabricadas?.filter(p => {
                    // Verificar si el área coincide
                    const areaCoincide = p.area === area.id || p.area === area.nombre;
                    // Verificar si es del nivel que estamos fabricando
                    const nivelCoincide = (p.nivel || 1) === nivelAFabricar;
                    return areaCoincide && nivelCoincide;
                }) || [];
                
                // Verificar si tenemos fabricación activa para esta área y nivel
                const fabricacionActiva = fabricacionesActivas?.find(f => {
                    const areaCoincide = f.area === area.id || f.area === area.nombre;
                    const nivelCoincide = f.nivel === nivelAFabricar;
                    return areaCoincide && nivelCoincide && !f.completada;
                });
                
                // Añadir nombre del área como título
                html += `
                    <div class="area-fila-mini">
                        <div class="area-titulo-mini">
                            <span class="area-icono-mini">${area.icono}</span>
                            <span class="area-nombre-mini">${area.nombre}</span>
                            <span class="area-nivel-mini">Nivel ${nivelAFabricar}</span>
                        </div>
                        <div class="botones-calidad-mini">
                `;
                
                // Crear 5 botones para esta área (siempre 5 por nivel)
                for (let piezaNum = 1; piezaNum <= 5; piezaNum++) {
                    // Verificar si esta pieza específica ya está fabricada
                    // (en tu sistema, no distinguimos pieza 1, 2, 3... solo contamos total)
                    const piezaFabricada = piezasAreaNivel.length >= piezaNum;
                    
                    if (piezaFabricada) {
                        // Botón LLENO (ya fabricado)
                        html += `
                            <button class="btn-pieza-mini lleno" disabled title="${area.nombre} - Evolución ${piezaNum} fabricada">
                                <i class="fas fa-check"></i>
                                <span class="pieza-num">${piezaNum}</span>
                            </button>
                        `;
                    } else if (fabricacionActiva && piezaNum === piezasAreaNivel.length + 1) {
                        // Botón en FABRICACIÓN (la siguiente pieza a fabricar está en proceso)
                        const tiempoRestante = new Date(fabricacionActiva.tiempo_fin) - new Date();
                        const minutos = Math.ceil(tiempoRestante / (1000 * 60));
                        
                        html += `
                            <button class="btn-pieza-mini fabricando" disabled title="${area.nombre} - Evolución ${piezaNum} en fabricación (${minutos} min)">
                                <i class="fas fa-spinner fa-spin"></i>
                                <span class="pieza-num">${piezaNum}</span>
                            </button>
                        `;
                    } else {
                        // Botón VACÍO (se puede fabricar)
                        const puedeFabricar = fabricacionesCount < 4 && 
                                            this.escuderia.dinero >= 10000 &&
                                            piezaNum === piezasAreaNivel.length + 1;
                        
                        html += `
                            <button class="btn-pieza-mini vacio" 
                                    onclick="iniciarFabricacionTallerDesdeBoton('${area.id}', ${nivelAFabricar})"
                                    ${!puedeFabricar ? 'disabled' : ''}
                                    title="${area.nombre} - Evolución ${piezaNum} (Click para fabricar)">
                                <i class="fas fa-plus"></i>
                                <span class="pieza-num">${piezaNum}</span>
                            </button>
                        `;
                    }
                }
                
                // Botón "SUBIR DE NIVEL" solo cuando tengamos las 5 piezas
                if (piezasAreaNivel.length >= 5) {
                    html += `
                        <button class="btn-subir-nivel" onclick="f1Manager.subirNivelArea('${area.id}')" title="Subir ${area.nombre} al nivel ${nivelAFabricar + 1}">
                            <i class="fas fa-level-up-alt"></i>
                            SUBIR NIVEL
                        </button>
                    `;
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    
                    <div class="taller-info-mini">
                        <p><i class="fas fa-info-circle"></i> Fabricaciones activas: <strong>${fabricacionesCount}/4</strong></p>
                        <p><i class="fas fa-info-circle"></i> Necesitas 5 evoluciones del mismo nivel para subir de nivel</p>
                        
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error cargando taller minimalista:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>❌ Error cargando el taller</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
        }
    }
    
    // ========================
    // MÉTODO CORREGIDO PARA INICIAR FABRICACIÓN
    // ========================
    async iniciarFabricacionTaller(areaId, nivel) {
        console.log('🔧 Iniciando fabricación:', { areaId, nivel });
        
        if (!this.escuderia || !this.escuderia.id) {
            this.showNotification('❌ Error: No tienes escudería', 'error');
            return false;
        }
        
        try {
            // 1. Verificar límite de 4 fabricaciones simultáneas
            const { data: fabricacionesActivas, error: errorLimite } = await this.supabase
                .from('fabricacion_actual')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorLimite) throw errorLimite;
            
            if (fabricacionesActivas && fabricacionesActivas.length >= 4) {
                this.showNotification('❌ Límite alcanzado (máximo 4 fabricaciones simultáneas)', 'error');
                return false;
            }
            
            // 2. Contar cuántas piezas ya has fabricado de esta área y nivel
            const { data: piezasExistentes, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivel);
            
            if (errorPiezas) throw errorPiezas;
            
            const numeroPieza = (piezasExistentes?.length || 0) + 1;
            console.log(`📊 Fabricando pieza ${numeroPieza} para ${areaId} nivel ${nivel}`);
            
            // 3. Calcular tiempo progresivo EN MINUTOS y convertirlo a milisegundos
            const tiempoMinutos = this.calcularTiempoProgresivo(numeroPieza);
            const tiempoMilisegundos = tiempoMinutos * 60 * 1000; // Convertir minutos a milisegundos
            console.log(`⏱️ Tiempo: ${tiempoMinutos} minutos (${tiempoMilisegundos}ms)`);
            
            // 4. Verificar dinero (costo fijo)
            const costo = 10000;
            if (this.escuderia.dinero < costo) {
                this.showNotification(`❌ Fondos insuficientes. Necesitas €${costo.toLocaleString()}`, 'error');
                return false;
            }
            
            // 5. Crear fabricación con tiempo futuro REAL
            const ahora = new Date();
            const tiempoFin = new Date(ahora.getTime() + tiempoMilisegundos); // Añadir tiempo real en milisegundos
            
            console.log('📅 Tiempos:', {
                inicio: ahora.toISOString(),
                fin: tiempoFin.toISOString(),
                diferenciaMinutos: tiempoMinutos
            });
            
            const { data: fabricacion, error: errorCrear } = await this.supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: this.escuderia.id,
                    area: areaId,
                    nivel: nivel,
                    tiempo_inicio: ahora.toISOString(),
                    tiempo_fin: tiempoFin.toISOString(), // ← DEJA LA 'Z' INTACTA
                    completada: false,
                    costo: costo,
                    creada_en: ahora.toISOString()
                }])
                .select()
                .single();
            
            if (errorCrear) throw errorCrear;
            
            // 6. Descontar dinero
            this.escuderia.dinero -= costo;
            await this.updateEscuderiaMoney();
            
            // 7. Mostrar notificación con tiempo REAL
            const nombreArea = this.getNombreArea(areaId);
            this.showNotification(
                `✅ ${nombreArea} (Evolución ${numeroPieza}) en fabricación - ${tiempoMinutos} minutos`, 
                'success'
            );
            
            // 8. Actualizar UI inmediatamente
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando fabricación:', error);
            this.showNotification(`❌ Error: ${error.message}`, 'error');
            return false;
        }
    }
    
    // ========================
    // MÉTODO AUXILIAR: Calcular tiempo progresivo
    // ========================
    calcularTiempoProgresivo(numeroPieza) {
        // Sistema progresivo según especificaste:
        // Pieza 1: 2 minutos
        // Pieza 2: 4 minutos  
        // Pieza 3: 15 minutos
        // Pieza 4: 30 minutos
        // Pieza 5: 60 minutos
        // Pieza 6+: +50 minutos cada una
        
        const tiemposEspeciales = {
            1: 2,   // Primera pieza
            2: 4,   // Segunda pieza
            3: 15,  // Tercera pieza
            4: 30,  // Cuarta pieza
            5: 60   // Quinta pieza
        };
        
        if (tiemposEspeciales[numeroPieza]) {
            return tiemposEspeciales[numeroPieza];
        }
        
        // Para pieza 6 en adelante: 60 + (numeroPieza - 5) * 50
        return 60 + ((numeroPieza - 5) * 50);
    }
    
    // ========================
    // MÉTODO AUXILIAR: Obtener nombre de área
    // ========================
    getNombreArea(areaId) {
        const areas = {
            'suelo': 'Suelo',
            'motor': 'Motor',
            'aleron_delantero': 'Alerón Delantero',
            'caja_cambios': 'Caja Cambios',
            'pontones': 'Pontones',
            'suspension': 'Suspensión',
            'aleron_trasero': 'Alerón Trasero',
            'chasis': 'Chasis',
            'frenos': 'Frenos',
            'volante': 'Volante',
            'electronica': 'Electrónica'
        };
        return areas[areaId] || areaId;
    }
    
    // ========================
    // MÉTODO PARA CALCULAR TIEMPOS PROGRESIVOS
    // ========================
    calcularTiempoFabricacion(piezaNumero) {
        // Sistema progresivo según tu especificación:
        // Pieza 1: 2 minutos
        // Pieza 2: 4 minutos
        // Pieza 3: 15 minutos
        // Pieza 4: 30 minutos
        // Pieza 5: 60 minutos
        // Pieza 6-...: +50 minutos cada una
        
        const tiemposEspeciales = {
            1: 2,    // Primera pieza: 2 minutos
            2: 4,    // Segunda pieza: 4 minutos
            3: 15,   // Tercera pieza: 15 minutos
            4: 30,   // Cuarta pieza: 30 minutos
            5: 60    // Quinta pieza: 60 minutos
        };
        
        if (tiemposEspeciales[piezaNumero]) {
            return tiemposEspeciales[piezaNumero];
        }
        
        // Para piezas 6 en adelante: 60 + (piezaNumero - 5) * 50
        // Ejemplo: 
        // Pieza 6: 60 + (6-5)*50 = 110 minutos
        // Pieza 7: 60 + (7-5)*50 = 160 minutos
        // etc.
        return 60 + ((piezaNumero - 5) * 50);
    }
    
    // ========================
    // MÉTODO PARA SUBIR DE NIVEL UN ÁREA
    // ========================
    async subirNivelArea(areaId) {
        console.log('⬆️ Subiendo nivel del área:', areaId);
        
        if (!this.escuderia || !this.escuderia.id || !this.carStats) {
            this.showNotification('❌ Error: No se encontraron datos del coche', 'error');
            return;
        }
        
        try {
            // 1. Verificar que tenemos 5 piezas del nivel actual
            const nivelActual = this.carStats[`${areaId}_nivel`] || 0;
            const nivelSiguiente = nivelActual + 1;
            
            const { data: piezasArea, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivelSiguiente)
                .eq('equipada', false);
            
            if (errorPiezas) throw errorPiezas;
            
            if (!piezasArea || piezasArea.length < 5) {
                this.showNotification(`❌ Necesitas 5 evoluciones del mismo nivel ${nivelSiguiente} para subir de nivel`, 'error');
                return;
            }
            
            // 2. Actualizar nivel en coches_stats
            const campoNivel = `${areaId}_nivel`;
            const campoProgreso = `${areaId}_progreso`;
            
            const nuevosStats = {
                [campoNivel]: nivelSiguiente,
                [campoProgreso]: 0, // Resetear progreso para el nuevo nivel
                actualizado_en: new Date().toISOString()
            };
            
            const { error: errorStats } = await this.supabase
                .from('coches_stats')
                .update(nuevosStats)
                .eq('escuderia_id', this.escuderia.id);
            
            if (errorStats) throw errorStats;
            
            // 3. Marcar las 5 piezas como equipadas
            const idsPiezas = piezasArea.slice(0, 5).map(p => p.id);
            
            const { error: errorEquipar } = await this.supabase
                .from('almacen_piezas')
                .update({ equipada: true })
                .in('id', idsPiezas);
            
            if (errorEquipar) throw errorEquipar;
            
            // 4. Actualizar datos locales
            this.carStats[campoNivel] = nivelSiguiente;
            this.carStats[campoProgreso] = 0;
            
            // 5. Mostrar notificación y recargar
            const areasNombres = {
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
            
            const nombreArea = areasNombres[areaId] || areaId;
            this.showNotification(`✅ ${nombreArea} subido a nivel ${nivelSiguiente}!`, 'success');
            
            // 6. Recargar la pestaña taller después de 1 segundo
            setTimeout(() => {
                this.cargarTabTaller();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error subiendo nivel:', error);
            this.showNotification(`❌ Error subiendo nivel: ${error.message}`, 'error');
        }
    }

    // Añade este método después del init():

    
    async inicializarSistemasIntegrados() {
        console.log('🔗 Inicializando sistemas integrados...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para inicializar sistemas');
            return;
        }
        
        // 1. Crear instancia de fabricacionManager si no existe
        if (window.FabricacionManager && !window.fabricacionManager) {
            console.log('🔧 Creando fabricacionManager...');
            window.fabricacionManager = new window.FabricacionManager();
        }
        
        if (window.fabricacionManager && typeof window.fabricacionManager.inicializar === 'function') {
            await window.fabricacionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de fabricación inicializado');
        } else {
            console.error('❌ fabricacionManager no disponible - creando nueva instancia');
            // Intentar crear de nuevo
            if (window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                await window.fabricacionManager.inicializar(this.escuderia.id);
                console.log('✅ Sistema de fabricación inicializado (segundo intento)');
            }
        }
        
        // 2. Crear almacenManager - VERSIÓN A PRUEBA DE FALLOS
        console.log('🔧 FORZANDO creación de almacenManager...');
        
        // SI la clase NO existe, créala AHORA MISMO
        if (!window.AlmacenManager) {
            console.log('⚠️ Clase AlmacenManager no existe, creando básica...');
            window.AlmacenManager = class AlmacenManagerBasico {
                constructor() {
                    this.escuderiaId = null;
                    this.piezas = [];
                }
                
                async inicializar(escuderiaId) {
                    this.escuderiaId = escuderiaId;
                    console.log(`✅ almacenManager inicializado para escudería: ${escuderiaId}`);
                    return true;
                }
                
                async cargarPiezas() {
                    if (!this.escuderiaId) return [];
                    try {
                        const { data, error } = await supabase
                            .from('almacen_piezas')
                            .select('*')
                            .eq('escuderia_id', this.escuderiaId)
                            .order('fabricada_en', { ascending: false });
                        
                        if (error) throw error;
                        this.piezas = data || [];
                        return this.piezas;
                    } catch (error) {
                        console.error('Error cargando piezas:', error);
                        return [];
                    }
                }
            };
        }
        
        // CREAR la instancia SI O SÍ
        if (!window.almacenManager) {
            window.almacenManager = new window.AlmacenManager();
            console.log('✅ Instancia de almacenManager creada');
        }
        
        // INICIALIZAR SI O SÍ
        if (window.almacenManager && this.escuderia && this.escuderia.id) {
            await window.almacenManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de almacén inicializado (GARANTIZADO)');
        } else {
            console.error('❌ IMPOSIBLE inicializar almacén - falta escudería');
        }
        
        // 3. Integración (opcional)
        if (window.IntegracionManager) {
            window.integracionManager = new window.IntegracionManager();
            await window.integracionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de integración inicializado');
        } else {
            console.warn('⚠️ IntegracionManager no cargado - continuando sin integración');
        }
        
        this.iniciarTimersAutomaticos();
    }
    
    iniciarTimersAutomaticos() {
        if (this.timersAutomaticos) {
            Object.values(this.timersAutomaticos).forEach(timer => {
                clearInterval(timer);
            });
        }
        // CORRECCIÓN: Añadir llave y nombre de propiedad
        this.timersAutomaticos = {
            produccion: setInterval(() => {
                if (window.fabricacionManager && window.fabricacionManager.actualizarUIProduccion) {
                    window.fabricacionManager.actualizarUIProduccion(true); // true = solo contador
                }
            }, 1000), // Cada segundo para contador fluido 

            
            dashboard: setInterval(() => {
                this.updateProductionMonitor();
            }, 3000)
        };
        
        console.log('⏱️ Timers automáticos iniciados');
    };

    async cargarPiezasMontadas() {
        console.log('🎯 Cargando piezas montadas...');
        
        const contenedor = document.getElementById('grid-piezas-montadas');
        if (!contenedor) return;
        
        try {
            // 1. Obtener piezas montadas
            const { data: piezasMontadas } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
            // 2. MAPEO de nombres de la BD a IDs del código
            const mapeoAreas = {
                'Suelo y Difusor': 'suelo',
                'Motor': 'motor',
                'Aerodinámica': 'aerodinamica',
                'Chasis': 'chasis',
                'Suspensión': 'suspension',
                'Frenos': 'frenos',
                'Transmisión': 'transmision',
                'Electrónica': 'electronica',
                'Volante': 'volante',
                'Pontones': 'pontones',
                'Alerón Delantero': 'aleron_delantero',
                'Alerón Trasero': 'aleron_trasero',
                'Caja de Cambios': 'caja_cambios'
            };
            
            // 3. Crear mapeo área -> pieza montada
            const piezasPorArea = {};
            piezasMontadas?.forEach(p => {
                // Convertir nombre de BD a ID del código
                const areaId = mapeoAreas[p.area] || p.area.toLowerCase().replace(/ /g, '_');
                piezasPorArea[areaId] = p;
            });
            
            // 4. Generar 11 botones (usando los IDs que espera tu código)
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            let puntosTotales = 0;
            let html = '';
            
            areas.forEach(area => {
                const pieza = piezasPorArea[area.id];
                
                if (pieza) {
                    // Botón con pieza montada
                    puntosTotales += pieza.puntos_base || 0;
                    html += `
                        <div class="boton-area-montada" onclick="irAlAlmacenDesdePiezas()" 
                             title="${pieza.area} - Nivel ${pieza.nivel} - ${pieza.calidad}">
                            <div class="icono-area">${area.icono}</div>
                            <div class="nombre-area">${area.nombre}</div>
                            <div class="nivel-pieza">Nivel ${pieza.nivel}</div>
                            <div class="puntos-pieza">+${pieza.puntos_base}</div>
                            <div class="calidad-pieza" style="font-size:0.6rem;color:#aaa">${pieza.calidad}</div>
                        </div>
                    `;
                } else {
                    // Botón vacío
                    html += `
                        <div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()" 
                             title="Sin pieza - Click para equipar">
                            <div class="icono-area">+</div>
                            <div class="nombre-area">${area.nombre}</div>
                            <div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>
                        </div>
                    `;
                }
            });
            
            contenedor.innerHTML = html;
            
            // Actualizar total de puntos
            const puntosElement = document.getElementById('puntos-totales-montadas');
            if (puntosElement) {
                puntosElement.textContent = puntosTotales;
            }
            
            console.log(`✅ Piezas montadas cargadas: ${Object.keys(piezasPorArea).length} áreas equipadas`);
            console.log(`📊 Puntos totales: ${puntosTotales}`);
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            // Mostrar botones vacíos como fallback
            this.mostrarBotonesVacios(contenedor);
        }
    }
    
    // Función auxiliar para mostrar botones vacíos
    mostrarBotonesVacios(contenedor) {
        const areas = ['Suelo', 'Motor', 'Alerón Del.', 'Caja Cambios', 'Pontones', 
                       'Suspensión', 'Alerón Tras.', 'Chasis', 'Frenos', 'Volante', 'Electrónica'];
        
        let html = '';
        areas.forEach(area => {
            html += `
                <div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()">
                    <div class="icono-area">+</div>
                    <div class="nombre-area">${area}</div>
                    <div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>
                </div>
            `;
        });
        
        contenedor.innerHTML = html;
    }
    



    async loadPilotosContratados() {
        if (!this.escuderia || !this.escuderia.id || !this.supabase) {
            console.log('❌ No hay escudería o supabase');
            return;
        }
    
        try {
            console.log('👥 Cargando ingenieros contratados...');
            const { data: ingenieros, error } = await this.supabase
                .from('ingenieros_contratados')  // ← TABLA CORRECTA
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true)
                .order('contratado_en', { ascending: false });
    
            if (error) throw error;
    
            this.pilotos = ingenieros || [];
            console.log(`✅ ${this.pilotos.length} ingeniero(s) cargado(s)`);
            
            this.updatePilotosUI(); // Esta función debe usar this.pilotos
            
        } catch (error) {
            this.pilotos = [];
            console.error('❌ Error cargando ingenieros:', error);
            this.updatePilotosUI();
        }
    }
    

    async cargarCarStats() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats, error } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .maybeSingle();
            
            if (!error && stats) {
                this.carStats = stats;
            }
        } catch (error) {
            console.error('Error cargando car stats:', error);
        }
    }
    

    // ========================
    // DASHBOARD COMPLETO (VERSIÓN OPTIMIZADA - UNA SOLA FILA)
    // ========================
    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard COMPACTO con funcionalidad completa...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }
        // ============================================
        // ============================================
        // 1. PRIMERO: Cargar el próximo GP desde la BD
        // ============================================
        console.log('📅 Cargando próximo GP...');
        await this.cargarProximoGP();
        console.log('✅ Próximo GP cargado:', this.proximoGP?.nombre || 'No hay carreras');
        
        // ============================================
        // 2. LUEGO: Añade la función formatearFecha
        // ============================================
        function formatearFecha(fechaStr) {
            if (!fechaStr) return 'Fecha no definida';
            const fecha = new Date(fechaStr);
            const opciones = { 
                day: 'numeric', 
                month: 'short'  // Solo día y mes abreviado
            };
            return fecha.toLocaleDateString('es-ES', opciones);
        }
                
        // ============================================
        // 3. AHORA SÍ: Definir countdownHTML
        // ============================================
        const countdownHTML = `
            <div class="countdown-f1-container">
                <!-- Encabezado con botón Calendario -->
                <div class="countdown-header-f1">
                    <div class="countdown-title">
                        <i class="fas fa-flag-checkered"></i>
                        <h2>PRÓXIMA CARRERA</h2>
                    </div>
                    <button class="btn-calendario-mini" id="btn-calendario" title="Ver calendario completo">
                        <i class="fas fa-calendar-alt"></i>
                        CALENDARIO
                    </button>
                </div>
                
                <!-- Información de la carrera -->
                <div class="carrera-info-f1" style="margin-bottom: 5px;">
                    <div class="carrera-nombre-f1" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0;">
                        <i class="fas fa-trophy" style="color: #FFD700;"></i>
                        <span id="nombre-carrera" style="color: white; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: bold;">
                            ${this.proximoGP?.nombre || 'No hay carreras'}
                        </span>
                    </div>
                </div>
                
                <!-- Countdown principal -->
                <div class="countdown-main-f1">
                    <div class="countdown-label">CIERRE DE APUESTAS EN:</div>
                    
                    <div class="timer-container-f1">
                        <!-- Días -->
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-dias">--</div>
                            <div class="time-label-f1">DÍAS</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <!-- Horas -->
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-horas">--</div>
                            <div class="time-label-f1">HORAS</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <!-- Minutos -->
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-minutos">--</div>
                            <div class="time-label-f1">MIN</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <!-- Segundos -->
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-segundos">--</div>
                            <div class="time-label-f1">SEG</div>
                        </div>
                    </div>
                </div>
                
                <!-- Botón único para estado/apuestas -->
                <button class="btn-pronostico-f1" id="btn-estado-apuestas">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Cargando...</span>
                </button>
                

            </div>
        `;

        
        // 1. Crear el HTML con diseño compacto pero manteniendo IDs ORIGINALES
        document.body.innerHTML = `
            <div id="app">
                <!-- Header compacto (UNA SOLA FILA) -->
                <header class="dashboard-header-compacto">
                    <!-- Izquierda: Logo y dinero -->
                    <div class="header-left-compacto">
                        <div class="logo-compacto">
                            <i class="fas fa-flag-checkered"></i>
                            <span id="escuderia-nombre">${this.escuderia.nombre}</span>
                        </div>
                        <div class="money-display-compacto">
                            <i class="fas fa-coins"></i>
                            <span id="money-value">€${this.escuderia?.dinero?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                    
                    <!-- Centro: Tabs -->
                    <nav class="tabs-compactas">
                        <button class="tab-btn-compacto active" data-tab="principal">
                            <i class="fas fa-home"></i> Principal
                        </button>
                        <button class="tab-btn-compacto" data-tab="taller">
                            <i class="fas fa-tools"></i> Taller
                        </button>
                        <button class="tab-btn-compacto" data-tab="almacen">
                            <i class="fas fa-warehouse"></i> Almacén
                        </button>
                        <button class="tab-btn-compacto" data-tab="mercado">
                            <i class="fas fa-shopping-cart"></i> Mercado
                        </button>
                        <button class="tab-btn-compacto" data-tab="presupuesto">
                            <i class="fas fa-chart-pie"></i> Presupuesto
                        </button>
                        <button class="tab-btn-compacto" data-tab="clasificacion">
                            <i class="fas fa-medal"></i> Clasificación
                        </button>
                    </nav>
                    
                    <!-- Derecha: Botón salir (manteniendo ID original) -->

                </header>
                
                <!-- Main Content - MANTENIENDO ESTRUCTURA ORIGINAL -->
                <main class="dashboard-content">
                    <!-- Tab Principal -->
                    <div id="tab-principal" class="tab-content active">
                        <!-- Three Columns Layout - MANTENIENDO IDs ORIGINALES -->
                        <div class="three-columns-layout">
                            
                            <!-- Columna 1: Estrategas Compactos - MANTENIENDO IDs ORIGINALES -->

                            <div class="col-estrategas">
                                <!-- Encabezado con título y botón "Gestionar" al lado -->
                                <div class="section-header">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <h2><i class="fas fa-users"></i> ESTRATEGAS</h2>
                                        <button class="btn-gestionar-estrategas" onclick="gestionarEstrategas()" style="
                                            background: rgba(0,210,190,0.1);
                                            border: 1px solid rgba(0,210,190,0.4);
                                            color: #00d2be;
                                            border-radius: 4px;
                                            font-size: 0.7rem;
                                            padding: 2px 6px;
                                            cursor: pointer;
                                            display: flex;
                                            align-items: center;
                                            gap: 3px;
                                            white-space: nowrap;
                                        ">
                                            <i class="fas fa-cog"></i> GESTIONAR
                                        </button>
                                    </div>
                                    <span class="badge" id="contador-estrategas">0/4</span>
                                </div>
                                
                                <!-- Grid 2x2 IGUAL QUE PRODUCCIÓN -->
                                <div id="pilotos-container" class="pilotos-container">
                                    <!-- El contenido dinámico se cargará aquí -->
                                    <!-- Se mantendrá la misma funcionalidad, solo cambia el aspecto -->
                                </div>
                                
                                <!-- ELIMINAMOS el botón de abajo, ya está arriba -->
                            </div>
                            

                            <!-- Columna 2: Countdown F1 NUEVO - CON DISEÑO COMPLETO -->
                            <div class="col-countdown">
                                ${countdownHTML}
                            </div>

                            
                            <!-- Columna 3: Monitor de Fábrica - MANTENIENDO IDs ORIGINALES -->
                            <div class="col-fabrica">
                                <div class="monitor-fabrica">
                                    <div class="section-header">
                                        <h2><i class="fas fa-industry"></i> PRODUCCIÓN</h2>
                                        <div id="alerta-almacen" class="alerta-almacen" style="display: none;">
                                            <i class="fas fa-bell"></i>
                                            <span>¡Piezas nuevas en almacén!</span>
                                        </div>
                                    </div>
                                    <div id="produccion-actual" class="produccion-actual">
                                        <!-- Grid de 4 slots - MANTENIENDO estructura original -->
                                        <div id="produccion-slots" class="produccion-slots" style="
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            grid-template-rows: repeat(2, 1fr);
                                            gap: 8px;
                                            height: 100%;
                                            padding: 5px;
                                        ">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Piezas Montadas en el Coche - MANTENIENDO IDs ORIGINALES -->
                        <section class="piezas-montadas">
                            <div class="section-header">
                                <h2><i class="fas fa-car"></i> PIEZAS MONTADAS EN EL COCHE</h2>
                                <div class="total-puntos-montadas">
                                    <i class="fas fa-star"></i>
                                    <span>Puntos totales: <strong id="puntos-totales-montadas">0</strong></span>
                                </div>
                            </div>
                            
                            <div id="grid-piezas-montadas" class="grid-11-columns">
                                <!-- Se generarán dinámicamente 11 botones -->
                            </div>
                        </section>
                    </div>
                    
                    <!-- Otras pestañas - MANTENIENDO IDs ORIGINALES -->
                    <div id="tab-taller" class="tab-content"></div>
                    <div id="tab-almacen" class="tab-content"></div>
                    <div id="tab-mercado" class="tab-content"></div>
                    <div id="tab-presupuesto" class="tab-content"></div>
                    <div id="tab-clasificacion" class="tab-content"></div>
                </main>
                
                <!-- Footer -->
                <footer class="dashboard-footer">
                    <div class="user-info-compacto">
                        <i class="fas fa-user-circle"></i>
                        <span>${this.user.email?.split('@')[0] || 'Usuario'}</span>
                    </div>
                    <!-- AÑADE EL BOTÓN AQUÍ -->
                    <button class="logout-btn-compacto" id="logout-btn-visible" title="Cerrar sesión" style="
                        background: rgba(225, 6, 0, 0.1);
                        border: 1px solid rgba(225, 6, 0, 0.3);
                        color: #e10600;
                        padding: 4px 10px;
                        border-radius: 8px;
                        font-size: 0.8rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <i class="fas fa-sign-out-alt"></i> Salir
                    </button>
                    <div style="font-size: 0.7rem; color: #666;">
                        F1 Manager v1.0
                    </div>
                </footer>
            </div>
            
            <!-- Scripts - MANTENIENDO CÓDIGO JAVASCRIPT ORIGINAL -->
            <script>
                // Ocultar loading screen después de 1 segundo
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                }, 1000);
                
                // Configurar sistema de pestañas con la funcionalidad ORIGINAL
                document.querySelectorAll('.tab-btn-compacto').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const tabId = e.currentTarget.dataset.tab;
                        
                        // Remover activo de todos (MISMA LÓGICA ORIGINAL)
                        document.querySelectorAll('.tab-btn-compacto').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        
                        // Activar tab seleccionado
                        e.currentTarget.classList.add('active');
                        document.getElementById(\`tab-\${tabId}\`).classList.add('active');
                        
                        // Cargar contenido específico de cada tab (MISMA FUNCIONALIDAD ORIGINAL)
                        if (window.tabManager && window.tabManager.switchTab) {
                            window.tabManager.switchTab(tabId);
                        }
                        
                        // Si es la pestaña principal, recargar contenido (MISMA LÓGICA ORIGINAL)
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                            }, 100);
                        }
                    });
                });
                
                // Configurar logout button (MISMA FUNCIONALIDAD ORIGINAL)
                const logoutBtn = document.getElementById('logout-btn-visible');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            const supabaseClient = window.supabase;
                            if (supabaseClient) {
                                await supabaseClient.auth.signOut();
                                console.log('✅ Sesión cerrada');
                                // Forzar recarga completa para ir al login
                                window.location.href = window.location.origin;
                            }
                        } catch (error) {
                            console.error('❌ Error cerrando sesión:', error);
                            // Si falla, recargar de todas formas
                            window.location.href = window.location.origin;
                        }
                    });
                }
                
                // Función global para ir al taller (MISMA FUNCIONALIDAD ORIGINAL)
                window.irAlTallerDesdeProduccion = function() {
                    document.querySelector('[data-tab="taller"]').click();
                };
                
                window.gestionarEstrategas = function() {
                    // Misma funcionalidad que antes
                    if (window.f1Manager && window.f1Manager.mostrarModalContratacion) {
                        window.f1Manager.mostrarModalContratacion();
                    }
                };
                
                // =============================================
                // ¡¡MANTENIENDO FUNCIÓN ORIGINAL!!
                // =============================================
                window.cargarContenidoPrincipal = async function() {
                    if (window.f1Manager) {
                        // Cargar piezas montadas
                        if (window.f1Manager.cargarPiezasMontadas) {
                            await window.f1Manager.cargarPiezasMontadas();
                        }
                        // Cargar estrategas
                        if (window.f1Manager.loadPilotosContratados) {
                            await window.f1Manager.loadPilotosContratados();
                        }
                        // Cargar producción
                        if (window.f1Manager.updateProductionMonitor) {
                            window.f1Manager.updateProductionMonitor();
                        }
                    }
                };
                
                // Ejecutar al cargar por primera vez (MISMA LÓGICA ORIGINAL)
                setTimeout(() => {
                    if (window.cargarContenidoPrincipal) {
                        window.cargarContenidoPrincipal();
                    }
                }, 1500);
            </script>
        `;

        // ========================
        // CONFIGURAR EVENTOS DEL DASHBOARD
        // ========================
        
        // 1. Evento para cerrar sesión
        document.getElementById('logout-btn-visible').addEventListener('click', async () => {
            try {
                console.log('🔒 Cerrando sesión...');
                const { error } = await this.supabase.auth.signOut();
                if (error) {
                    console.error('❌ Error al cerrar sesión:', error);
                    this.showNotification('Error al cerrar sesión', 'error');
                } else {
                    console.log('✅ Sesión cerrada, recargando...');
                    location.reload(); // Esto llevará al login
                }
            } catch (error) {
                console.error('❌ Error inesperado:', error);
                this.showNotification('Error inesperado', 'error');
            }
        });
        
        // 2. INICIALIZAR SISTEMAS CRÍTICOS INMEDIATAMENTE (MISMA FUNCIONALIDAD ORIGINAL)
        setTimeout(async () => {
            console.log('🔧 Inicializando sistemas críticos del dashboard...');
            
            // A. Asegurar que fabricacionManager existe
            if (!window.fabricacionManager && window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                if (this.escuderia) {
                    await window.fabricacionManager.inicializar(this.escuderia.id);
                }
            }
            
            // B. Configurar sistema de pestañas CON LA FUNCIÓN DE RECARGA (MISMA LÓGICA ORIGINAL)
            setTimeout(() => {
                if (window.tabManager && window.tabManager.setup) {
                    // Guardar el switchTab original
                    const originalSwitchTab = window.tabManager.switchTab;
                    
                    // Sobrescribir para que recargue contenido al volver a principal
                    window.tabManager.switchTab = function(tabId) {
                        // Llamar al original
                        originalSwitchTab.call(this, tabId);
                        
                        // Si es la pestaña principal, recargar contenido
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                            }, 100);
                        }
                    };
                    
                    window.tabManager.setup();
                }
            }, 400);
            
            // 3. Cargar datos iniciales (MISMA FUNCIONALIDAD ORIGINAL)
            const supabase = window.supabase; // Ya está disponible globalmente
            if (supabase) {
                await this.loadCarStatus();
                await this.loadPilotosContratados();
                await this.cargarProximoGP();
                // Iniciar countdown con datos reales
                setTimeout(() => {
                    this.iniciarCountdownCompacto();
                }, 500);
                
                // 4. Cargar piezas montadas INMEDIATAMENTE
                setTimeout(async () => {
                    await this.cargarPiezasMontadas();
                }, 500);
            }
            
            console.log('✅ Dashboard compacto cargado correctamente con toda la funcionalidad');
            // QUITAR LA PANTALLA DE CARGA
            setTimeout(() => {
                const loadingScreen = document.getElementById('f1-loading-screen');
                if (loadingScreen) {
                    loadingScreen.remove();
                }
            }, 500);
        }, 1000);
    }
    

    
    getIconoEspecialidad(especialidad) {
        const iconos = {
            'Tiempos': '⏱️',
            'Meteorología': '🌧️',
            'Fiabilidad': '🔧',
            'Estrategia': '📊',
            'Neumáticos': '🔄',
            'default': '👨‍🔧'
        };
        return iconos[especialidad] || iconos.default;
    }
    
    // ========================
    // MÉTODO PARA ACTUALIZAR MONITOR DE PRODUCCIÓN (COMPACTO)
    // ========================
    async updateProductionMonitorCompacto() {
        const container = document.getElementById('produccion-grid-compacto');
        const contador = document.getElementById('contador-produccion');
        
        if (!container || !this.escuderia) return;
        
        try {
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .order('tiempo_fin', { ascending: true });
            
            if (error) throw error;
            
            const slots = container.querySelectorAll('.slot-produccion-compacto');
            slots.forEach((slot, index) => {
                const fabricacion = fabricaciones && fabricaciones[index];
                
                if (fabricacion) {
                    // Calcular tiempo restante
                    const tiempoFin = new Date(fabricacion.tiempo_fin);
                    const ahora = new Date();
                    const diferencia = tiempoFin - ahora;
                    
                    let tiempoTexto = '';
                    if (diferencia > 0) {
                        const horas = Math.floor(diferencia / (1000 * 60 * 60));
                        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                        tiempoTexto = `${horas}h ${minutos}m`;
                    } else {
                        tiempoTexto = '¡Listo!';
                    }
                    
                    // Actualizar slot
                    slot.classList.add('slot-activo-compacto');
                    slot.innerHTML = `
                        <div class="slot-icono-compacto"><i class="fas fa-cog fa-spin"></i></div>
                        <div class="slot-texto-compacto">
                            <div style="color: #4CAF50; font-weight: bold; font-size: 0.7rem;">${fabricacion.area || 'Evolución'}</div>
                            <div style="color: #FF9800; font-size: 0.65rem;">${tiempoTexto}</div>
                        </div>
                    `;
                    
                    // Actualizar evento onclick para ir al taller
                    slot.onclick = () => {
                        document.querySelector('[data-tab="taller"]').click();
                    };
                } else {
                    // Slot vacío
                    slot.classList.remove('slot-activo-compacto');
                    slot.innerHTML = `
                        <div class="slot-icono-compacto"><i class="fas fa-plus"></i></div>
                        <div class="slot-texto-compacto">Slot ${index + 1}</div>
                    `;
                    slot.onclick = () => {
                        document.querySelector('[data-tab="taller"]').click();
                    };
                }
            });
            
            if (contador) {
                contador.textContent = `${fabricaciones?.length || 0}/4`;
            }
            
        } catch (error) {
            console.error('Error actualizando producción:', error);
        }
    }
    
    // ========================
    // MÉTODO PARA CARGAR PIEZAS MONTADAS (COMPACTO)
    // ========================
    async cargarPiezasMontadasCompacto() {
        console.log('🎯 Cargando piezas montadas compactas...');
        
        const container = document.getElementById('grid-piezas-compacto');
        const puntosElement = document.getElementById('puntos-totales-compacto');
        
        if (!container) return;
        
        try {
            // Obtener piezas montadas (MISMA LÓGICA QUE ANTES)
            const { data: piezasMontadas } = await this.supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
            // Mapeo de áreas
            const mapeoAreas = {
                'Suelo y Difusor': 'suelo',
                'Motor': 'motor',
                'Aerodinámica': 'aerodinamica',
                'Chasis': 'chasis',
                'Suspensión': 'suspension',
                'Frenos': 'frenos',
                'Transmisión': 'transmision',
                'Electrónica': 'electronica',
                'Volante': 'volante',
                'Pontones': 'pontones',
                'Alerón Delantero': 'aleron_delantero',
                'Alerón Trasero': 'aleron_trasero',
                'Caja de Cambios': 'caja_cambios'
            };
            
            const piezasPorArea = {};
            piezasMontadas?.forEach(p => {
                const areaId = mapeoAreas[p.area] || p.area.toLowerCase().replace(/ /g, '_');
                piezasPorArea[areaId] = p;
            });
            
            // Áreas del coche
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'A.Del', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Susp.', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'A.Tras', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Elect.', icono: '💡' }
            ];
            
            let puntosTotales = 0;
            let html = '';
            
            areas.forEach(area => {
                const pieza = piezasPorArea[area.id];
                
                if (pieza) {
                    puntosTotales += pieza.puntos_base || 0;
                    html += `
                        <div class="pieza-boton-compacto pieza-montada-compacto" onclick="irAlAlmacenDesdePiezas()" 
                             title="${pieza.area} - Nivel ${pieza.nivel} - ${pieza.calidad}">
                            <div class="pieza-icono-compacto">${area.icono}</div>
                            <div class="pieza-nombre-compacto">${area.nombre}</div>
                            <div class="pieza-nivel-compacto">N${pieza.nivel}</div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="pieza-boton-compacto" onclick="irAlAlmacenDesdePiezas()" 
                             title="Sin pieza - Click para equipar">
                            <div class="pieza-icono-compacto" style="color: #666;">+</div>
                            <div class="pieza-nombre-compacto">${area.nombre}</div>
                            <div style="font-size: 0.55rem; color: #888;">Vacío</div>
                        </div>
                    `;
                }
            });
            
            container.innerHTML = html;
            
            // Actualizar puntos totales
            if (puntosElement) {
                puntosElement.textContent = `${puntosTotales} pts`;
            }
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            // Fallback
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 10px;">
                    Error cargando piezas
                </div>
            `;
        }
    }
    
    // ========================
    // MÉTODO PARA COUNTDOWN COMPLETO CON DISEÑO F1
    // ========================
    async iniciarCountdownCompacto() {
        console.log('🏎️ Iniciando countdown estilo F1...');
        
        // Cargar próximo GP si no está cargado
        if (!this.proximoGP) {
            await this.cargarProximoGP();
        }
        
        // Si no hay próximo GP, mostrar mensaje
        if (!this.proximoGP) {
            console.log('❌ No hay próximas carreras');
            return;
        }
        
        // Crear fecha de carrera (48 horas antes)
        const fechaCarrera = new Date(this.proximoGP.fecha_inicio);
        fechaCarrera.setHours(14, 0, 0, 0); // Hora de carrera: 14:00
        const fechaLimiteApuestas = new Date(fechaCarrera);
        fechaLimiteApuestas.setHours(fechaCarrera.getHours() - 48); // 48 horas antes
        
        console.log('📅 Fechas:', {
            carrera: fechaCarrera,
            limiteApuestas: fechaLimiteApuestas,
            ahora: new Date()
        });
        
        // Función para formatear fecha
        const formatearFecha = (fecha) => {
            const opciones = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            return fecha.toLocaleDateString('es-ES', opciones);
        };
        
        // Función para actualizar el countdown
        const actualizarCountdown = () => {
            const ahora = new Date();
            const diferencia = fechaLimiteApuestas - ahora;
            
            // Elementos del DOM
            const diasElem = document.getElementById('countdown-dias');
            const horasElem = document.getElementById('countdown-horas');
            const minutosElem = document.getElementById('countdown-minutos');
            const segundosElem = document.getElementById('countdown-segundos');
            const btnPronostico = document.getElementById('btn-enviar-pronostico');
            const estadoApuestasElem = document.getElementById('estado-apuestas');
            
            if (diferencia > 0) {
                // Calcular tiempo restante
                const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
                
                // Actualizar elementos
                if (diasElem) diasElem.textContent = dias.toString().padStart(2, '0');
                if (horasElem) horasElem.textContent = horas.toString().padStart(2, '0');
                if (minutosElem) minutosElem.textContent = minutos.toString().padStart(2, '0');
                if (segundosElem) segundosElem.textContent = segundos.toString().padStart(2, '0');
                
                // UN SOLO BOTÓN
                const btnApuestas = document.getElementById('btn-estado-apuestas');
                if (btnApuestas) {
                    if (diferencia > 0) {
                        // Apuestas abiertas
                        btnApuestas.disabled = false;
                        btnApuestas.innerHTML = '<i class="fas fa-paper-plane"></i> ENVIAR PRONÓSTICO';
                        btnApuestas.className = 'btn-pronostico-f1 abierto';
                    } else {
                        // Apuestas cerradas
                        btnApuestas.disabled = true;
                        btnApuestas.innerHTML = '<i class="fas fa-lock"></i> APUESTAS CERRADAS';
                        btnApuestas.className = 'btn-pronostico-f1 cerrado';
                    }
                }
                
            } else {
                // Tiempo agotado
                if (diasElem) diasElem.textContent = '00';
                if (horasElem) horasElem.textContent = '00';
                if (minutosElem) minutosElem.textContent = '00';
                if (segundosElem) segundosElem.textContent = '00';
                
                // Botón desactivado
                if (btnPronostico) {
                    btnPronostico.disabled = true;
                    btnPronostico.innerHTML = '<i class="fas fa-lock"></i> APUESTAS CERRADAS';
                }
                
                // Estado apuestas
                if (estadoApuestasElem) {
                    estadoApuestasElem.innerHTML = `
                        <i class="fas fa-lock"></i>
                        <span>APUESTAS CERRADAS</span>
                    `;
                    estadoApuestasElem.className = 'estado-apuestas cerrado';
                }
            }
        };
        
        // Iniciar el countdown
        actualizarCountdown();
        const intervalId = setInterval(actualizarCountdown, 1000);
        this.countdownInterval = intervalId;
    }
    
    // ========================
    // MÉTODO PARA CERRAR SESIÓN
    // ========================
    async cerrarSesion() {
        try {
            if (window.supabase) {
                await window.supabase.auth.signOut();
                console.log('✅ Sesión cerrada');
            }
            window.location.href = window.location.origin;
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            window.location.href = window.location.origin;
        }
    }
        
    async loadProximoGP() {
        // VERIFICAR primero que window.supabase existe
        if (!window.supabase || !window.supabase.from) {
            console.error('❌ window.supabase no está disponible en loadProximoGP');
            // Crear datos de ejemplo
            this.proximoGP = {
                nombre: 'Gran Premio de España',
                fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                circuito: 'Circuit de Barcelona-Catalunya'
            };
            this.updateCountdown();
            return;
        }
        
        try {
            const { data: gp, error } = await window.supabase
                .from('calendario_gp')
                .select('*')
                .eq('cerrado_apuestas', false)
                .gt('fecha_inicio', new Date().toISOString())
                .order('fecha_inicio', { ascending: true })
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error('❌ Error en consulta GP:', error.message);
                // Crear datos de ejemplo
                this.proximoGP = {
                    nombre: 'Gran Premio de España',
                    fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                    circuito: 'Circuit de Barcelona-Catalunya'
                };
            } else if (gp) {
                this.proximoGP = gp;
                console.log('✅ GP cargado:', gp.nombre);
            } else {
                // Caso NUEVO: gp es null (no se encontró nada)
                console.log('ℹ️ No hay GP próximo configurado en la base de datos');
                this.proximoGP = {
                    nombre: 'Próximo GP por confirmar',
                    fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                    circuito: 'Circuito por confirmar'
                };
            }
            
            this.updateCountdown();
            
        } catch (error) {
            console.error('❌ Error fatal en loadProximoGP:', error);
            // Crear datos de ejemplo
            this.proximoGP = {
                nombre: 'Próximo GP por confirmar',
                fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                circuito: 'Circuito por confirmar'
            };
            this.updateCountdown();
        }
    }
    
    // ========================
    // MÉTODOS AUXILIARES (igual que antes)
    // ========================
    
    async loadCarStatus() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .maybeSingle();
            
            if (stats) {
                this.carStats = stats;
                this.updateCarAreasUI();
            }
        } catch (error) {
            console.error('Error cargando stats:', error);
        }
    }
    
    async loadPilotos() {
        if (!this.escuderia) return;
        
        try {
            const { data: pilotos } = await supabase
                .from('pilotos_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true);
            
            if (pilotos && pilotos.length > 0) {
                this.pilotos = pilotos;
                this.updatePilotosUI();
            }
        } catch (error) {
            console.error('Error cargando pilotos:', error);
        }
    }
    // ========================
    // MÉTODO PARA CARGAR PRÓXIMO GP DESDE BD
    // ========================
    async cargarProximoGP() {
        console.log('📅 Cargando próximo GP desde BD...');
        
        if (!this.escuderia || !this.supabase) {
            console.error('❌ No hay escudería o supabase');
            return null;
        }
        
        try {
            // Buscar la próxima carrera (fecha_inicio >= hoy)
            const { data: proximosGPs, error } = await this.supabase
                .from('calendario_gp')
                .select('*')
                .gte('fecha_inicio', new Date().toISOString().split('T')[0]) // Fecha >= hoy
                .order('fecha_inicio', { ascending: true })
                .limit(1);
            
            if (error) throw error;
            
            if (proximosGPs && proximosGPs.length > 0) {
                this.proximoGP = proximosGPs[0];
                console.log('✅ Próximo GP cargado:', this.proximoGP.nombre);
                return this.proximoGP;
            } else {
                console.log('ℹ️ No hay próximos GP programados');
                this.proximoGP = null;
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error cargando próximo GP:', error);
            this.proximoGP = null;
            return null;
        }
    }
    
    updateCarAreasUI() {
        const container = document.getElementById('areas-coche');
        if (!container || !this.carStats) return;
        
        container.innerHTML = window.CAR_AREAS.map(area => {
            const nivel = this.carStats[`${area.id}_nivel`] || 0;
            const progreso = this.carStats[`${area.id}_progreso`] || 0;
            const porcentaje = (progreso / window.CONFIG.PIECES_PER_LEVEL) * 100;
            
            return `
                <div class="area-item" style="border-left-color: ${area.color}">
                    <span class="area-nombre">${area.name}</span>
                    <div class="area-nivel">
                        <span>Nivel</span>
                        <span class="nivel-valor">${nivel}</span>
                    </div>
                    <div class="area-progreso">
                        Progreso: <span class="progreso-valor">${progreso}/20</span>
                    </div>
                    <div class="progress-bar-small">
                        <div class="progress-fill-small" style="width: ${porcentaje}%"></div>
                    </div>
                    <button class="btn-fabricar" data-area="${area.id}">
                        <i class="fas fa-hammer"></i> Fabricar (€${window.CONFIG.PIECE_COST.toLocaleString()})
                    </button>
                </div>
            `;
        }).join('');
        
        // Configurar eventos de botones de fabricación
        document.querySelectorAll('.btn-fabricar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const areaId = e.target.closest('.btn-fabricar').dataset.area;
                this.iniciarFabricacion(areaId);
            });
        });
    }
    
    updatePilotosUI() {
        const container = document.getElementById('pilotos-container');
        if (!container) {
            console.error('❌ No se encontró #pilotos-container');
            return;
        }
        
        const estrategasContratados = this.pilotos || [];
        
        // Actualizar contador
        const contadorElement = document.getElementById('contador-estrategas');
        if (contadorElement) {
            contadorElement.textContent = `${estrategasContratados.length}/4`;
        }
        
        // HTML de la cuadrícula 2x2 minimalista
        let html = `
            <div class="estrategas-grid-minimal">
        `;
        
        // Mostrar 4 huecos (2 filas x 2 columnas)
        for (let i = 0; i < 4; i++) {
            const estratega = estrategasContratados[i];
            
            if (estratega) {
                // Botón con estratega contratado
                html += `
                    <div class="estratega-btn contratado" onclick="mostrarInfoEstratega(${i})">
                        <div class="estratega-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="estratega-info">
                            <span class="estratega-nombre">${estratega.nombre || 'Estratega'}</span>
                            <span class="estratega-salario">€${(estratega.salario || 0).toLocaleString()}/mes</span>
                            <span class="estratega-funcion">${estratega.especialidad || 'General'}</span>
                        </div>
                        <div class="estratega-bono">+${estratega.bonificacion_valor || 0}%</div>
                    </div>
                `;
            } else {
                // Botón vacío para contratar
                html += `
                    <div class="estratega-btn vacio" onclick="contratarNuevoEstratega(${i})">
                        <div class="estratega-icon">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="estratega-info">
                            <span class="estratega-nombre">Vacío</span>
                            <span class="estratega-funcion">Click para contratar</span>
                        </div>
                    </div>
                `;
            }
        }
        
        html += `</div>`;
        
        container.innerHTML = html;

        `;
        
        // Añadir estilos solo si no existen
        if (!document.getElementById('estilos-estrategas')) {
            styles.id = 'estilos-estrategas';
            document.head.appendChild(styles);
        }
    }
    
    // Añade este método auxiliar para obtener iniciales
    getIniciales(nombre) {
        if (!nombre) return "??";
        return nombre.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 3);
    }
    
    iniciarFabricacion(areaId) {
        console.log('🔧 [DEBUG] === INICIAR FABRICACION ===');
        console.log('1. window.fabricacionManager:', window.fabricacionManager);
        console.log('2. window.FabricacionManager:', window.FabricacionManager);
        console.log('3. this.escuderia:', this.escuderia);

    // AÑADE ESTA VERIFICACIÓN AQUÍ:
    if (!this.escuderia || this.escuderia.dinero < window.CONFIG.PIECE_COST) {
        const falta = window.CONFIG.PIECE_COST - (this.escuderia?.dinero || 0);
        const mensaje = '❌ Fondos insuficientes. Necesitas €' + falta.toLocaleString() + ' más';
        this.showNotification(mensaje, 'error');
        return false;
    }

        
        // SI fabricacionManager no existe, CREARLO
        if (!window.fabricacionManager) {
            console.log('⚠️ [DEBUG] fabricacionManager es undefined...');
            
            if (window.FabricacionManager) {
                console.log('✅ [DEBUG] Clase existe, creando instancia...');
                window.fabricacionManager = new window.FabricacionManager();
                console.log('✅ [DEBUG] Instancia creada:', window.fabricacionManager);
            } else {
                console.error('❌ [DEBUG] Clase NO existe - Error fatal');
                // Ver qué scripts se cargaron
                console.log('Scripts cargados:');
                console.log('- config.js:', typeof CONFIG !== 'undefined');
                console.log('- auth.js:', typeof authManager !== 'undefined');
                console.log('- main.js:', typeof f1Manager !== 'undefined');
                console.log('- fabricacion.js:', typeof FabricacionManager !== 'undefined');
                this.showNotification('Error: Sistema de fabricación no cargado', 'error');
                return false;
            }
        }
        
        // Verificar escudería
        if (!this.escuderia) {
            console.error('❌ No tienes escudería');
            this.showNotification('❌ No tienes escudería', 'error');
            return false;
        }
        
        // Inicializar si es necesario
        if (window.fabricacionManager && !window.fabricacionManager.escuderiaId && this.escuderia) {
            console.log('🔧 [DEBUG] Inicializando fabricacionManager con escudería:', this.escuderia.id);
            window.fabricacionManager.inicializar(this.escuderia.id);
        }
        
        console.log('🔧 [DEBUG] Llamando a iniciarFabricacion...'); // <-- CAMBIADO
        
        // Verificar que el método existe (CORREGIDO EL NOMBRE)
        if (!window.fabricacionManager.iniciarFabricacion) { // <-- CAMBIADO
            console.error('❌ [DEBUG] iniciarFabricacion no existe en fabricacionManager');
            console.log('Métodos disponibles:', Object.keys(window.fabricacionManager));
            this.showNotification('Error: Método de fabricación no disponible', 'error');
            return false;
        }
        
        // Ejecutar la fabricación y CAPTURAR el resultado
        const resultado = window.fabricacionManager.iniciarFabricacion(areaId); // <-- CAMBIADO
        
        // SI fue exitoso, ACTUALIZAR LA UI
        if (resultado) {
            console.log('✅ Fabricación iniciada exitosamente');
            
            // 1. Mostrar notificación
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (area) {
                const mensaje = '✅ Fabricación de ' + area.name + ' iniciada (30 segundos)';
                this.showNotification(mensaje, 'success');
            }
            
            // 2. Actualizar el monitor de producción INMEDIATAMENTE
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 1000);
            
            // 3. Deshabilitar temporalmente el botón
            const selector = '[data-area="' + areaId + '"]';
            const boton = document.querySelector(selector);
            if (boton) {
                boton.disabled = true;
                boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fabricando...';
            }
            
            // 4. Actualizar dinero si hubo costo
            if (this.escuderia.dinero !== null) {
                this.escuderia.dinero -= window.CONFIG.PIECE_COST || 10000;
                this.updateEscuderiaMoney();
            }
        } else {
            this.showNotification('❌ No se pudo iniciar la fabricación', 'error');
        }
        
        return resultado;
    }
    showNotification(mensaje, tipo = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification ' + tipo;
        
        // Determinar icono
        let icono = 'info-circle';
        if (tipo === 'success') icono = 'check-circle';
        if (tipo === 'error') icono = 'exclamation-circle';
        
        notification.innerHTML = 
            '<i class="fas fa-' + icono + '"></i>' +
            '<span>' + mensaje + '</span>';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    async updateEscuderiaMoney() {
        if (!this.escuderia) return;
        
        try {
            const { error } = await supabase
                .from('escuderias')
                .update({ dinero: this.escuderia.dinero })
                .eq('id', this.escuderia.id);
            
            if (!error) {
                const moneyValue = document.getElementById('money-value');
                if (moneyValue) {
                    moneyValue.textContent = `€${this.escuderia.dinero.toLocaleString()}`;
                }
            }
        } catch (error) {
            console.error('Error actualizando dinero:', error);
        }
    }
    
    async cargarDatosDashboard() {
        console.log('📊 Cargando datos del dashboard...');
        
        // Actualizar producción en tiempo real INMEDIATAMENTE
        this.updateProductionMonitor();
        
        // Configurar eventos de botones
        this.setupDashboardEvents();
        
        // Iniciar temporizadores para actualización automática
        this.startTimers();
        
        console.log('✅ Dashboard configurado con timers');
    }
    
    startTimers() {
        // Timer de producción (actualizar cada 5 segundos)
        if (this.productionTimer) {
            clearInterval(this.productionTimer);
        }
        
        // PRIMERA ejecución con retraso para que el DOM esté listo
        setTimeout(() => {
            this.updateProductionMonitor();
        }, 300); // 300ms es suficiente para que el HTML se renderice
        
        // Luego iniciar el intervalo normal cada 5 segundos
        this.productionTimer = setInterval(() => {
            this.updateProductionMonitor();
        }, 5000);
        
        // Timer de countdown
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        this.countdownTimer = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        console.log('⏱️ Timers iniciados');
    }
    
    // En el método updateProductionMonitor() de la clase F1Manager
    async updateProductionMonitor() {
        if (!this.escuderia || !this.escuderia.id || !this.supabase) {
            console.log('❌ No hay escudería para monitor de producción');
            return;
        }
        
        const container = document.getElementById('produccion-actual');
        if (!container) {
            console.log('❌ No se encontró #produccion-actual');
            return;
        }
        
        try {
            // Cargar fabricaciones activas
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .order('tiempo_inicio', { ascending: true });
            
            if (error) throw error;
            
            console.log('📊 Fabricaciones activas encontradas:', fabricaciones?.length || 0);
            
            // Verificar tiempos REALES de cada fabricación
            
            const ahoraUTC = Date.now(); // UTC en milisegundos
            const fabricacionesConEstado = (fabricaciones || []).map(f => {
                // Asegurar que se interpreta como UTC
                const tiempoFinStr = f.tiempo_fin.endsWith('Z') ? f.tiempo_fin : f.tiempo_fin + 'Z';
                const tiempoFinUTC = new Date(tiempoFinStr).getTime();
                
                const tiempoRestante = tiempoFinUTC - ahoraUTC;
                const lista = tiempoRestante <= 0;
                
                return {
                    ...f,
                    tiempoRestante,
                    lista
                };
            });
            
            console.log('⏱️ Estado fabricaciones:', fabricacionesConEstado.map(f => ({
                area: f.area,
                tiempoFin: f.tiempo_fin,
                tiempoRestante: f.tiempoRestante,
                lista: f.lista
            })));
            
            // Para cada fabricación, calcular su número de pieza
            const fabricacionesConNumero = [];
            for (const fabricacion of fabricacionesConEstado) {
                // Calcular número de pieza basado en cuántas ya hay fabricadas
                const { data: piezasExistentes } = await this.supabase
                    .from('almacen_piezas')
                    .select('id')
                    .eq('escuderia_id', this.escuderia.id)
                    .eq('area', fabricacion.area)
                    .eq('nivel', fabricacion.nivel);
                
                const numeroPieza = (piezasExistentes?.length || 0) + 1;
                fabricacionesConNumero.push({
                    ...fabricacion,
                    numero_pieza: numeroPieza
                });
            }
            
            // Asegurar estilos
            this.cargarEstilosProduccion();
            
            let html = `
                <div class="produccion-slots">
            `;
            
            // Crear 4 slots
            for (let i = 0; i < 4; i++) {
                const fabricacion = fabricacionesConNumero[i];
                
                if (fabricacion) {
                    const tiempoRestante = fabricacion.tiempoRestante;
                    const lista = fabricacion.lista;
                    
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const tiempoFormateado = this.formatTime(tiempoRestante);
                    const numeroPieza = fabricacion.numero_pieza || 1;
                    
                    html += `
                        <div class="produccion-slot ${lista ? 'produccion-lista' : 'produccion-activa'}" 
                             onclick="recogerPiezaSiLista('${fabricacion.id}', ${lista}, ${i})"
                             title="${nombreArea} - Evolución ${numeroPieza} de nivel ${fabricacion.nivel}">
                            <div class="produccion-icon">
                                ${lista ? '✅' : ''}
                            </div>
                            <div class="produccion-info">
                                <span class="produccion-nombre">${nombreArea}</span>
                                <span class="produccion-pieza-num">Evolución ${numeroPieza}</span>
                                ${lista ? 
                                    `<span class="produccion-lista-text">¡LISTA!</span>` :
                                    `<span class="produccion-tiempo">${tiempoFormateado}</span>`
                                }
                            </div>
                        </div>
                    `;
                } else {
                    // Slot vacío
                    html += `
                        <div class="produccion-slot" data-slot="${i}" onclick="irAlTallerDesdeProduccion()">
                            <div class="slot-content">
                                <i class="fas fa-plus"></i>
                                <span>Departamento ${i + 1}</span>
                                <span class="slot-disponible">Disponible</span>
                            </div>
                        </div>
                    `;
                }
            }
            
            html += `</div>`;
            container.innerHTML = html;
            
            // Iniciar timer para actualización en tiempo real
            this.iniciarTimerProduccion();
            
        } catch (error) {
            console.error("Error en updateProductionMonitor:", error);
            container.innerHTML = `
                <div class="produccion-error">
                    <p>❌ Error cargando producción</p>
                    <button onclick="window.f1Manager.updateProductionMonitor()">Reintentar</button>
                </div>
            `;
        }
    }
    
    // ========================
    // TIMER PARA ACTUALIZACIÓN EN TIEMPO REAL
    // ========================
    iniciarTimerProduccion() {
        // Limpiar timer anterior si existe
        if (this.productionUpdateTimer) {
            clearInterval(this.productionUpdateTimer);
        }
        
        // Actualizar cada segundo para tiempos en vivo
        this.productionUpdateTimer = setInterval(() => {
            this.actualizarTiemposEnVivo();
        }, 1000);
    }
    
    // ========================
    // ACTUALIZAR TIEMPOS EN VIVO SIN RECARGAR TODO
    // ========================
    async actualizarTiemposEnVivo() {
        const slots = document.querySelectorAll('.produccion-slot.produccion-activa');
        if (slots.length === 0) return;
        
        try {
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('id,tiempo_fin,area,nivel')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (error || !fabricaciones) return;
            
            // Actualizar cada slot activo
            slots.forEach(slot => {
                const fabricacionId = slot.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (!fabricacionId) return;
                
                const fabricacion = fabricaciones.find(f => f.id === fabricacionId);
                if (!fabricacion) return;
                
                const ahoraUTC = Date.now();
                const tiempoFinStr = fabricacion.tiempo_fin.endsWith('Z') ? fabricacion.tiempo_fin : fabricacion.tiempo_fin + 'Z';
                const tiempoFinUTC = new Date(tiempoFinStr).getTime();
                const tiempoRestante = tiempoFinUTC - ahoraUTC;
                
                if (tiempoRestante <= 0) {
                    // ¡LISTA!
                    slot.classList.remove('produccion-activa');
                    slot.classList.add('produccion-lista');
                    slot.innerHTML = `
                        <div class="produccion-icon">✅</div>
                        <div class="produccion-info">
                            <span class="produccion-nombre">${this.getNombreArea(fabricacion.area)}</span>
                            <span class="produccion-pieza-num">Evolución ${fabricacion.nivel || 1}</span>
                            <span class="produccion-lista-text">¡LISTA!</span>
                        </div>
                    `;
                } else {
                    // Actualizar tiempo
                    const tiempoElement = slot.querySelector('.produccion-tiempo');
                    if (tiempoElement) {
                        tiempoElement.textContent = this.formatTime(tiempoRestante);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error actualizando tiempos en vivo:', error);
        }
    }
    
    // Añadir este método auxiliar
    cargarEstilosProduccion() {
        if (!document.getElementById('estilos-produccion')) {
            const style = document.createElement('style');
            style.id = 'estilos-produccion';
            style.innerHTML = produccionStyles; // Usa los estilos definidos arriba
            document.head.appendChild(style);
        }
    }
    
    getNombreArea(areaId) {
        const areas = {
            'motor': 'Motor',
            'chasis': 'Chasis',
            'aerodinamica': 'Aerodinámica',
            'suspension': 'Suspensión',
            'transmision': 'Transmisión',
            'frenos': 'Frenos',
            'electronica': 'Electrónica',
            'control': 'Control',
            'difusor': 'Difusor',
            'alerones': 'Alerones',
            'pontones': 'Pontones'
        };
        return areas[areaId] || areaId;
    }
    
    setupDashboardEvents() {
        // Botón de iniciar fabricación
        document.getElementById('iniciar-fabricacion-btn')?.addEventListener('click', () => {
            this.irAlTaller();
        });
        
        // Botón de contratar pilotos
        document.getElementById('contratar-pilotos-btn')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        document.getElementById('contratar-primer-piloto')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        // Botón de apuestas
        document.getElementById('btn-apostar')?.addEventListener('click', () => {
            this.mostrarApuestas();
        });
    }
    
    formatTime(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        
        const totalSegundos = Math.floor(milliseconds / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos}m ${segundos}s`;
        } else if (minutos > 0) {
            return `${minutos}m ${segundos}s`;
        } else {
            return `${segundos}s`;
        }
    }
    
    startTimers() {
        // Timer de producción
        setInterval(() => {
            this.updateProductionMonitor();
        }, 1000);
        
        // Timer de countdown
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    mostrarContratarPilotos() {
        this.showNotification('🏎️ Sistema de pilotos en desarrollo', 'info');
        // Aquí implementarías la lógica para contratar pilotos
    }
    
    mostrarApuestas() {
        this.showNotification('💰 Sistema de apuestas en desarrollo', 'info');
        // Aquí implementarías la lógica para apostar
    }
    
    updateCountdown() {
        if (!this.proximoGP) return;
        
        const now = new Date();
        const gpDate = new Date(this.proximoGP.fecha_inicio);
        const timeDiff = gpDate - now;
        
        if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const gpNombreEl = document.getElementById('gp-nombre');
            const gpFechaEl = document.getElementById('gp-fecha');
            const gpCircuitoEl = document.getElementById('gp-circuito');
            
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
            if (gpNombreEl) gpNombreEl.textContent = this.proximoGP.nombre;
            if (gpFechaEl) gpFechaEl.textContent = new Date(this.proximoGP.fecha_inicio).toLocaleDateString('es-ES');
            if (gpCircuitoEl) gpCircuitoEl.textContent = this.proximoGP.circuito || 'Circuito por confirmar';
        }
    }
    
    irAlTaller() {
        if (window.tabManager) {
            window.tabManager.switchTab('taller');
        }
    }
}

    // FUNCIONES GLOBALES PARA EL TUTORIAL
    window.tutorialManager = null;
    window.tutorialData = {
        estrategaSeleccionado: null,
        areaSeleccionada: null,
        pronosticosSeleccionados: {},
        piezaFabricando: false
    };
    // Al final del archivo, con las otras funciones globales
    window.irAlTallerDesdeProduccion = function() {
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('taller');
        } else {
            alert('Redirigiendo al taller para fabricar...');
            // Aquí deberías implementar la navegación al taller
        }
    };
    
    window.recogerPiezaSiLista = async function(fabricacionId, lista, slotIndex) {
        console.log("🔧 Recogiendo pieza:", { fabricacionId, lista });
        
        if (!lista) {
            if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification("⏳ La pieza aún está en producción", "info");
            }
            // Mostrar información de la pieza en fabricación
            try {
                const { data: fabricacion } = await window.supabase
                    .from('fabricacion_actual')
                    .select('*')
                    .eq('id', fabricacionId)
                    .single();
                    
                if (fabricacion) {
                    const ahora = new Date(); // Ya está en hora local
                    const tiempoFin = new Date(fabricacion.tiempo_fin); // Esto ya es UTC si guardaste con 'Z'
                    const tiempoRestante = tiempoFin - ahora;
                    const tiempoFormateado = tiempoRestante > 0 ? 
                        window.f1Manager?.formatTime(tiempoRestante) : "Finalizando...";
                    
                    // Calcular número de pieza
                    const { data: piezasExistentes } = await window.supabase
                        .from('almacen_piezas')
                        .select('id')
                        .eq('escuderia_id', fabricacion.escuderia_id)
                        .eq('area', fabricacion.area)
                        .eq('nivel', fabricacion.nivel);
                    
                    const numeroPieza = (piezasExistentes?.length || 0) + 1;
                    const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
                    
                    alert(`🔄 ${nombreArea}\nPieza ${numeroPieza} de nivel ${fabricacion.nivel}\nTiempo restante: ${tiempoFormateado}`);
                }
            } catch (error) {
                console.error("Error obteniendo info:", error);
            }
            return;
        }
        
        // SI está lista, recoger
        try {
            // 1. Obtener fabricación
            const { data: fabricacion, error: fetchError } = await window.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // 2. Calcular número de pieza y puntos
            const { data: piezasExistentes } = await window.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', fabricacion.escuderia_id)
                .eq('area', fabricacion.area)
                .eq('nivel', fabricacion.nivel);
            
            const numeroPieza = (piezasExistentes?.length || 0) + 1;
            
            // Calcular puntos basados en área, nivel y número de pieza
            const puntosBase = calcularPuntosBase(fabricacion.area, fabricacion.nivel);
            const puntosExtra = numeroPieza * 2; // Bonus por dificultad
            const puntosTotales = puntosBase + puntosExtra;
            
            // 3. Crear pieza en almacen_piezas (COLUMNAS EXISTENTES SOLO)
            const { error: insertError } = await window.supabase
                .from('almacen_piezas')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: fabricacion.area,
                    nivel: fabricacion.nivel || 1,
                    puntos_base: puntosTotales,
                    calidad: 'Normal',
                    equipada: false,
                    fabricada_en: new Date().toISOString(),
                    creada_en: new Date().toISOString()
                    // NO incluir 'pieza_numero' porque no existe en la tabla
                }]);
            
            if (insertError) {
                console.error("Error insertando pieza:", insertError);
                throw insertError;
            }
            
            console.log("✅ Pieza añadida a almacen_piezas");
            
            // 4. Marcar fabricación como completada
            const { error: updateError } = await window.supabase
                .from('fabricacion_actual')
                .update({ 
                    completada: true,
                    // Opcional: asignar pieza_id si quieres relacionarlas
                    // pieza_id: resultado.id
                })
                .eq('id', fabricacionId);
            
            if (updateError) throw updateError;
            
            console.log("✅ Fabricación marcada como completada");
            
            // 5. Mostrar notificación
            const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(
                    `✅ ${nombreArea} (Pieza ${numeroPieza}) recogida\n+${puntosTotales} puntos técnicos`, 
                    'success'
                );
            }
            
            // 6. Actualizar UI
            if (window.f1Manager) {
                // Parar timer de actualización
                if (window.f1Manager.productionUpdateTimer) {
                    clearInterval(window.f1Manager.productionUpdateTimer);
                }
                
                // Actualizar producción
                setTimeout(() => {
                    window.f1Manager.updateProductionMonitor();
                }, 500);
                
                // Actualizar almacén si está abierto
                if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                    setTimeout(() => {
                        if (window.tabManager.loadAlmacenPiezas) {
                            window.tabManager.loadAlmacenPiezas();
                        }
                    }, 1000);
                }
                
                // Actualizar piezas montadas
                setTimeout(() => {
                    if (window.f1Manager.cargarPiezasMontadas) {
                        window.f1Manager.cargarPiezasMontadas();
                    }
                }, 1500);
            }
            
        } catch (error) {
            console.error('❌ Error recogiendo pieza:', error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`❌ Error: ${error.message}`, 'error');
            }
        }
    };
    
    // ========================
    // FUNCIONES AUXILIARES
    // ========================
    function calcularPuntosBase(area, nivel) {
        const puntosPorArea = {
            'motor': 15,
            'chasis': 12,
            'suelo': 10,
            'electronica': 14,
            'aleron_delantero': 8,
            'aleron_trasero': 8,
            'caja_cambios': 9,
            'suspension': 7,
            'frenos': 6,
            'volante': 5,
            'pontones': 7
        };
        
        const puntosArea = puntosPorArea[area] || 10;
        return puntosArea * (nivel || 1);
    }
    
    function formatTime(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        
        const totalSegundos = Math.floor(milliseconds / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        } else if (minutos > 0) {
            return `${minutos}m ${segundos}s`;
        } else {
            return `${segundos}s`;
        }
    };
    
    // Función auxiliar para calcular puntos
    function calcularPuntosPorArea(area, nivel) {
        const puntosBase = {
            'motor': 15,
            'chasis': 12,
            'suelo': 10,
            'aleron_delantero': 8,
            'aleron_trasero': 8,
            'caja_cambios': 9,
            'suspension': 7,
            'frenos': 6,
            'electronica': 14,
            'volante': 5,
            'pontones': 7
        };
        return (puntosBase[area] || 10) * (nivel || 1);
    }
    // Función de prueba para cerrar sesión
    window.testLogout = async function() {
        console.log('DEBUG: testLogout() ejecutado');
        console.log('DEBUG: window.supabase existe?', !!window.supabase);
        console.log('DEBUG: window.location.origin:', window.location.origin);
        
        try {
            if (window.supabase) {
                console.log('DEBUG: Intentando cerrar sesión...');
                await window.supabase.auth.signOut();
                console.log('DEBUG: Sesión cerrada, redirigiendo...');
            }
            window.location.href = window.location.origin;
        } catch (error) {
            console.error('DEBUG: Error:', error);
            window.location.href = window.location.origin;
        }
    };
 
    window.cargarEstrategasTutorial = function() {
        const container = document.getElementById('grid-estrategas-tutorial');
        if (!container) return;
        
        const estrategas = [
            { id: 1, nombre: "Analista de Tiempos", icono: "⏱️", especialidad: "Diferencias de tiempo", bono: "+15%", sueldo: "50,000€", ejemplo: "Diferencia 1º-2º" },
            { id: 2, nombre: "Meteorólogo", icono: "🌧️", especialidad: "Condiciones climáticas", bono: "+20%", sueldo: "60,000€", ejemplo: "Lluvia/Sequía" },
            { id: 3, nombre: "Experto en Fiabilidad", icono: "🔧", especialidad: "Abandonos y fallos", bono: "+18%", sueldo: "55,000€", ejemplo: "Número de abandonos" },
            { id: 4, nombre: "Estratega de Carrera", icono: "🏁", especialidad: "Estrategias de parada", bono: "+22%", sueldo: "75,000€", ejemplo: "Número de paradas" },
            { id: 5, nombre: "Analista de Neumáticos", icono: "🛞", especialidad: "Degradación de neumáticos", bono: "+16%", sueldo: "52,000€", ejemplo: "Compuesto predominante" },
            { id: 6, nombre: "Especialista en Overtakes", icono: "💨", especialidad: "Adelantamientos", bono: "+19%", sueldo: "58,000€", ejemplo: "Adelantamientos entre compañeros" }
        ];
        
        container.innerHTML = estrategas.map(e => `
            <div class="estratega-tutorial-card seleccionable">
                <div class="estratega-icon-tut">${e.icono}</div>
                <div class="estratega-nombre-tut">${e.nombre}</div>
                <div class="estratega-especialidad">${e.especialidad}</div>
                <div class="estratega-bono">Bono: <span class="bono-valor">${e.bono}</span></div>
                <div class="estratega-ejemplo">Ej: "${e.ejemplo}"</div>
            </div>
        `).join('');
    };

    // Función global para fabricar desde los botones del taller
    // Función global CORREGIDA
    window.iniciarFabricacionTallerDesdeBoton = async function(areaId, nivel) {
        console.log('🔧 Botón presionado para:', areaId, nivel);
        
        if (!window.f1Manager || !window.f1Manager.iniciarFabricacionTaller) {
            alert('Error: Sistema de fabricación no disponible');
            return false;
        }
        
        // Verificar dinero primero
        if (!window.f1Manager.escuderia || window.f1Manager.escuderia.dinero < 10000) {
            window.f1Manager.showNotification('❌ Fondos insuficientes (necesitas €10,000)', 'error');
            return false;
        }
        
        // Ejecutar fabricación
        const resultado = await window.f1Manager.iniciarFabricacionTaller(areaId, nivel);
        
        // Si se inició, actualizar UI
        if (resultado) {
            // Actualizar taller
            setTimeout(() => {
                if (window.f1Manager.cargarTabTaller) {
                    window.f1Manager.cargarTabTaller();
                }
            }, 1000);
            
            // Ir a principal para ver la producción
            setTimeout(() => {
                if (window.tabManager && window.tabManager.switchTab) {
                    window.tabManager.switchTab('principal');
                }
            }, 1500);
        }
        
        return resultado;
    };


    window.irAlAlmacenDesdePiezas = function() {
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('almacen');
        } else {
            console.log('Redirigiendo al almacén...');
            // Aquí puedes añadir más lógica
        }
    };

    
    window.tutorialSimularCarrera = function() {
        // 1. Obtener las selecciones del usuario
        const tutorialData = window.tutorialData || {};
        const pronosticosSeleccionados = tutorialData.pronosticosSeleccionados || {};
        
        // 2. Definir resultados REALES de la simulación (puedes cambiarlos)
        const resultadosReales = {
            bandera: 'si',        // Sí hubo bandera amarilla
            abandonos: '3-5',     // Hubo 3-5 abandonos
            diferencia: '1-5s'    // Diferencia fue de 2.3s (1-5s)
        };
        
        // 3. Calcular aciertos
        let aciertos = 0;
        let detalles = [];
        
        // Bandera amarilla
        const banderaCorrecto = pronosticosSeleccionados.bandera === resultadosReales.bandera;
        detalles.push(`<div class="resultado-item ${banderaCorrecto ? 'correcto' : 'incorrecto'}">
            ${banderaCorrecto ? '✅' : '❌'} Bandera amarilla: ${pronosticosSeleccionados.bandera === 'si' ? 'SÍ' : 'NO'} 
            (${banderaCorrecto ? 'correcto' : 'incorrecto, fue ' + (resultadosReales.bandera === 'si' ? 'SÍ' : 'NO')})
        </div>`);
        if (banderaCorrecto) aciertos++;
        
        // Abandonos
        const abandonosCorrecto = pronosticosSeleccionados.abandonos === resultadosReales.abandonos;
        detalles.push(`<div class="resultado-item ${abandonosCorrecto ? 'correcto' : 'incorrecto'}">
            ${abandonosCorrecto ? '✅' : '❌'} Abandonos: ${pronosticosSeleccionados.abandonos} 
            (${abandonosCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.abandonos})
        </div>`);
        if (abandonosCorrecto) aciertos++;
        
        // Diferencia
        const diferenciaCorrecto = pronosticosSeleccionados.diferencia === resultadosReales.diferencia;
        detalles.push(`<div class="resultado-item ${diferenciaCorrecto ? 'correcto' : 'incorrecto'}">
            ${diferenciaCorrecto ? '✅' : '❌'} Diferencia 1º-2º: ${pronosticosSeleccionados.diferencia} 
            (${diferenciaCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.diferencia})
        </div>`);
        if (diferenciaCorrecto) aciertos++;
        
        // 4. Guardar resultados para el PASO 10
        tutorialData.aciertosPronosticos = aciertos;
        tutorialData.totalPronosticos = 3;
        tutorialData.resultadosReales = resultadosReales;
        tutorialData.puntosBaseCalculados = (banderaCorrecto ? 150 : 0) + 
                                            (abandonosCorrecto ? 180 : 0) + 
                                            (diferenciaCorrecto ? 200 : 0);
        
        // 5. Mostrar resultados
        const resultados = document.getElementById('resultado-simulacion');
        if (resultados) {
            resultados.innerHTML = `
                <div class="resultado-simulado">
                    <h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>
                    ${detalles.join('')}
                    <div class="resumen-simulacion">
                        <strong>${aciertos} de 3 pronósticos acertados (${Math.round(aciertos/3*100)}%)</strong>
                    </div>
                    <div class="puntos-simulacion">
                        Puntos base obtenidos: <strong>${tutorialData.puntosBaseCalculados} pts</strong>
                    </div>
                </div>
            `;
            resultados.style.display = 'block';
        }
        
        // 6. Notificación
        const notifCarrera = document.createElement('div');
        notifCarrera.className = 'notification info';
        notifCarrera.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-flag-checkered"></i>
                <span>🏁 Carrera simulada - ${aciertos} de 3 aciertos (${Math.round(aciertos/3*100)}%)</span>
            </div>
        `;
        document.body.appendChild(notifCarrera);
        
        setTimeout(() => notifCarrera.classList.add('show'), 10);
        setTimeout(() => {
            notifCarrera.classList.remove('show');
            setTimeout(() => {
                if (notifCarrera.parentNode) {
                    notifCarrera.parentNode.removeChild(notifCarrera);
                }
            }, 300);
        }, 2000);
        // ========== AÑADE ESTA LÍNEA AL FINAL ==========
        // 7. MOSTRAR EL BOTÓN SIGUIENTE
        document.getElementById('btn-tutorial-next-large').classList.remove('hidden');
        // ========== FIN DE LA LÍNEA A AÑADIR ==========
    };
    window.tutorialIrSeccion = function(seccion) {
        alert(`Esta función te llevaría a la sección: ${seccion.toUpperCase()}\n\nEn el juego real, puedes navegar entre secciones usando el menú superior.`);
    };

    
    // Función para ejecutar pronóstico
    window.tutorialEjecutarPronostico = function() {
        // Verificar que los datos existen
        if (!window.tutorialData || !window.tutorialData.pronosticosSeleccionados) {
            alert("No has seleccionado ningún pronóstico");
            return;
        }
        
        const selecciones = window.tutorialData.pronosticosSeleccionados;
        const count = Object.keys(selecciones).length;
        
        if (count < 3) {
            alert(`Has seleccionado ${count} de 3 pronósticos. Necesitas seleccionar uno de cada categoría.`);
            return;
        }
        
        // SIMULAR RESULTADOS REALES (esto sería aleatorio en el juego real)
        const resultadosReales = {
            bandera: 'si',      // En la simulación siempre hay bandera amarilla
            abandonos: '3-5',   // En la simulación siempre hay 3-5 abandonos
            diferencia: '1-5s'  // En la simulación siempre es 1-5s
        };
        
        // Calcular aciertos REALES
        let aciertos = 0;
        const detalles = [];
        
        if (selecciones.bandera === resultadosReales.bandera) {
            aciertos++;
            detalles.push('✅ Bandera amarilla: SÍ (acertaste)');
        } else {
            detalles.push(`❌ Bandera amarilla: ${selecciones.bandera === 'si' ? 'SÍ' : 'NO'} (era ${resultadosReales.bandera === 'si' ? 'SÍ' : 'NO'})`);
        }
        
        if (selecciones.abandonos === resultadosReales.abandonos) {
            aciertos++;
            detalles.push('✅ Abandonos: 3-5 (acertaste)');
        } else {
            detalles.push(`❌ Abandonos: ${selecciones.abandonos} (era ${resultadosReales.abandonos})`);
        }
        
        if (selecciones.diferencia === resultadosReales.diferencia) {
            aciertos++;
            detalles.push('✅ Diferencia: 1-5s (acertaste)');
        } else {
            detalles.push(`❌ Diferencia: ${selecciones.diferencia} (era ${resultadosReales.diferencia})`);
        }
        
        // Mostrar resultados
        const resultados = document.getElementById('resultado-simulacion');
        if (resultados) {
            resultados.innerHTML = `
                <div class="resultado-simulado">
                    <h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>
                    ${detalles.map(d => `<div class="resultado-item">${d}</div>`).join('')}
                    <div class="resumen-simulacion">
                        <strong>${aciertos} de 3 pronósticos acertados (${Math.round((aciertos/3)*100)}%)</strong>
                    </div>
                </div>
            `;
            resultados.style.display = 'block';
        }
        
        // Guardar resultados para el paso final
        window.tutorialData.aciertosPronosticos = aciertos;
        window.tutorialData.totalPronosticos = 3;
        
        // Notificación basada en aciertos reales
        const notificacion = document.createElement('div');
        notificacion.className = aciertos >= 2 ? 'notification success' : 'notification warning';
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${aciertos >= 2 ? 'trophy' : 'chart-line'}"></i>
                <span>${aciertos} de 3 pronósticos acertados</span>
            </div>
        `;
        document.body.appendChild(notificacion);
        
        setTimeout(() => notificacion.classList.add('show'), 10);
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 2000);
        
        // Avanzar automáticamente después de 2 segundos
        setTimeout(() => {
            if (window.tutorialManager) {
                window.tutorialManager.tutorialStep++;
                window.tutorialManager.mostrarTutorialStep();
            }
        }, 2000);
    };
    // Añade esto al final de tu archivo, con las otras funciones globales
    window.mostrarInfoEstratega = function(index) {
        const estratega = window.f1Manager.pilotos[index];
        if (estratega) {
            alert(`📊 Estratega: ${estratega.nombre}\n💰 Salario: €${estratega.salario}/mes\n🎯 Función: ${estratega.especialidad}\n✨ Bono: +${estratega.bonificacion_valor}% puntos`);
        }
    };
    
    window.contratarNuevoEstratega = function(hueco) {
        // Esto abriría tu sistema de contratación
        if (window.tabManager) {
            window.tabManager.switchTab('equipo'); // Asume que tienes pestaña "equipo"
        } else {
            // Fallback simple
            alert(`Contratar nuevo estratega para hueco ${hueco + 1}\nRedirigiendo al mercado...`);
            // Aquí implementarías tu lógica de contratación
        }
    };
    // Al final del archivo, con las otras funciones globales
    window.recogerPiezaTutorial = async function(fabricacionId, area) {
        try {
            // 1. Marcar como completada
            await window.supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);
            
            // 2. Crear pieza en almacen
            const { error: errorAlmacen } = await window.supabase
                .from('almacen_piezas')
                .insert([{
                    escuderia_id: window.f1Manager.escuderia.id,
                    area: area,
                    nivel: 1,
                    puntos_base: 15, // Ajusta según área
                    calidad: 'Básica',
                    equipada: false,
                    fabricada_en: new Date().toISOString(),
                    creada_en: new Date().toISOString()
                }]);
            
            if (errorAlmacen) throw errorAlmacen;
            
            // Notificación en lugar de alert
            const notificacion = document.createElement('div');
            notificacion.className = 'notification success';
            notificacion.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-box-open"></i>
                    <span>✅ Pieza añadida al almacén</span>
                </div>
            `;
            document.body.appendChild(notificacion);
            
            setTimeout(() => notificacion.classList.add('show'), 10);
            setTimeout(() => {
                notificacion.classList.remove('show');
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        notificacion.parentNode.removeChild(notificacion);
                    }
                }, 300);
            }, 2000);
            
            // 3. Actualizar UI
            if (window.f1Manager) {
                window.f1Manager.updateProductionMonitor();
            }
            
        } catch (error) {
            console.error("Error recogiendo pieza:", error);
            alert("Error recogiendo pieza: " + error.message);
        }
    };
// ========================
// ESCUCHAR AUTENTICACIÓN EXITOSA
// ========================

// Escuchar el evento de autenticación completada
window.addEventListener('auth-completado', async (evento) => {
    console.log('✅ Evento auth-completado recibido en main.js');
    
    const { user, escuderia, supabase } = evento.detail || window.authData || {};
    
    if (user && escuderia) {
        console.log('🎮 Creando F1Manager con datos de autenticación...');
        
        // Crear instancia F1Manager
        window.f1Manager = new F1Manager(user, escuderia, supabase);
        
        // Verificar si necesitas tutorial
        if (!escuderia.tutorial_completado) {
            console.log('📚 Mostrando tutorial...');
            // Crear instancia del tutorial externo
            window.tutorialManager = new TutorialManager(window.f1Manager);
            window.tutorialManager.iniciar();
        } else {
            console.log('✅ Tutorial ya completado, cargando dashboard...');
            await window.f1Manager.cargarDashboardCompleto();
        }
    } 
});

// También verificar si ya hay datos almacenados
setTimeout(() => {
    if (window.authData && window.authData.user && window.authData.escuderia) {
        console.log('📦 Usando datos de authData almacenados');
        const evento = new CustomEvent('auth-completado', { detail: window.authData });
        window.dispatchEvent(evento);
    }
}, 1000);


// AL FINAL DE TU ARCHIVO JS, FUERA DE CUALQUIER CLASE/FUNCIÓN
(function() {
    // Variable global para los datos del tutorial
    window.tutorialData = {
        estrategaSeleccionado: null,
        estrategaContratado: false,
        areaSeleccionada: null,
        piezaFabricando: false,
        pronosticoSeleccionado: null
    };
    
    // Funciones globales que llaman a los métodos del objeto
    window.tutorialSeleccionarEstratega = function(id) {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialSeleccionarEstratega === 'function') {
            window.tutorialManager.tutorialSeleccionarEstratega(id);
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialContratarEstratega = function() {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialContratarEstratega === 'function') {
            window.tutorialManager.tutorialContratarEstratega();
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialSeleccionarArea = function(area) {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialSeleccionarArea === 'function') {
            window.tutorialManager.tutorialSeleccionarArea(area);
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialIniciarFabricacion = function() {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialIniciarFabricacion === 'function') {
            window.tutorialManager.tutorialIniciarFabricacion();
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    // Funciones para gestionar estrategas
    window.mostrarModalContratacion = function(huecoNumero) {
        alert(`Mostrar modal para contratar estratega en hueco ${huecoNumero}`);
        // Aquí implementarías la lógica para mostrar un modal de contratación
    };
    
    window.despedirEstratega = function(estrategaId) {
        if (confirm('¿Estás seguro de despedir a este estratega?')) {
            // Aquí implementarías la lógica para despedir estratega
            console.log('Despedir estratega ID:', estrategaId);
            alert('Estratega despedido. Hueco disponible para nuevo contrato.');
            
            // Recargar UI
            if (window.f1Manager) {
                setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
            }
        }
    };
    // Reemplazar cualquier función de logout con:
    window.cerrarSesion = function() {
        if (window.authManager) {
            window.authManager.cerrarSesion();
        }
    };
    // Reemplazar loadUserData con:
    window.recargarDatosUsuario = async function() {
        if (window.authManager && window.authManager.supabase) {
            const { data: { session } } = await window.authManager.supabase.auth.getSession();
            if (session) {
                await window.authManager.cargarDatosUsuario(session.user);
                return { user: window.authManager.user, escuderia: window.authManager.escuderia };
            }
        }
        return null;
    };
    window.gestionarEstrategas = function() {
        alert('Mostrar pantalla completa de gestión de estrategas');
        // Aquí puedes redirigir a una pestaña específica o mostrar un modal grande
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('equipo');
        }
    };
    // Función global para acceder desde los botones
    window.iniciarFabricacionTaller = function(areaId, nivel) {
        if (window.f1Manager && window.f1Manager.iniciarFabricacionTaller) {
            window.f1Manager.iniciarFabricacionTaller(areaId, nivel);
        } else {
            alert('Error: Sistema de fabricación no disponible');
        }
    };    
    window.mostrarModalContratacion = function(huecoNumero) {
        // Modal simple para contratar
        const modalHTML = `
            <div id="modal-contratacion" style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1a1a2e;
                    padding: 20px;
                    border-radius: 10px;
                    border: 2px solid #00d2be;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h3 style="color: #00d2be; margin-top: 0;">Contratar Estratega</h3>
                    <p>Selecciona un estratega para el hueco ${huecoNumero}:</p>
                    
                    <div style="margin: 20px 0;">
                        <button onclick="contratarEstrategaFicticio(1, ${huecoNumero})" style="
                            width: 100%;
                            padding: 10px;
                            margin: 5px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            🕐 Analista de Tiempos (+15%)
                        </button>
                        
                        <button onclick="contratarEstrategaFicticio(2, ${huecoNumero})" style="
                            width: 100%;
                            padding: 10px;
                            margin: 5px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            🌧️ Meteorólogo (+20%)
                        </button>
                        
                        <button onclick="contratarEstrategaFicticio(3, ${huecoNumero})" style="
                            width: 100%;
                            padding: 10px;
                            margin: 5px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            🔧 Experto en Fiabilidad (+18%)
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="document.getElementById('modal-contratacion').remove()" style="
                            flex: 1;
                            padding: 10px;
                            background: transparent;
                            border: 1px solid #666;
                            color: #aaa;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };
    
    window.contratarEstrategaFicticio = function(tipo, hueco) {
        const estrategas = {
            1: { nombre: "Analista Tiempos", especialidad: "Análisis", bono: 15 },
            2: { nombre: "Meteorólogo", especialidad: "Clima", bono: 20 },
            3: { nombre: "Experto Fiabilidad", especialidad: "Técnica", bono: 18 }
        };
        
        alert(`Contratado: ${estrategas[tipo].nombre} en hueco ${hueco}`);
        document.getElementById('modal-contratacion').remove();
        
        // Actualizar UI
        if (window.f1Manager) {
            setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
        }
    };
    
    // Función para contratar estratega desde tutorial
    window.contratarEstrategaDesdeTutorial = function() {
        // Redirigir al sistema de contratación
        if (window.tabManager) {
            window.tabManager.switchTab('equipo'); // Asumiendo que tienes una pestaña "equipo"
        } else {
            window.mostrarModalContratacion(1);
        }
    };

    // ========================
    // EVENTOS GLOBALES PARA EL COUNTDOWN
    // ========================
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎮 Configurando eventos del countdown...');
        
        const btnPronostico = document.getElementById('btn-enviar-pronostico');
        const btnCalendario = document.getElementById('btn-calendario');
        
        if (btnPronostico) {
            console.log('✅ Botón pronóstico encontrado');
            btnPronostico.addEventListener('click', () => {
                console.log('📤 Click en Enviar Pronóstico');
                
                // Redirigir a la pestaña de pronósticos
                const tabPronosticos = document.querySelector('[data-tab="pronosticos"]');
                if (tabPronosticos) {
                    tabPronosticos.click();
                    console.log('📍 Cambiando a pestaña pronósticos');
                } else {
                    // Si no existe la pestaña, buscar alternativas
                    const tabApuestas = document.querySelector('[data-tab="apuestas"]');
                    if (tabApuestas) {
                        tabApuestas.click();
                    } else {
                        alert('🚀 Redirigiendo a pronósticos...\n\n(Para probar: ve a la pestaña "PRONÓSTICOS" en el menú)');
                    }
                }
            });
        } else {
            console.log('⚠️ Botón pronóstico NO encontrado');
        }
        
        if (btnCalendario) {
            console.log('✅ Botón calendario encontrado');
            btnCalendario.addEventListener('click', () => {
                console.log('📅 Click en Calendario');
                
                // Por ahora solo un placeholder
                alert('📅 CALENDARIO F1 2026\n\nFuncionalidad en desarrollo...\n\nPróximamente podrás:\n• Ver todas las carreras\n• Filtrar por temporada\n• Ver resultados pasados\n• Planificar estrategias');
                
                // Aquí pondrás la lógica real para mostrar el calendario
                // Por ejemplo: window.f1Manager.mostrarCalendario();
            });
        } else {
            console.log('⚠️ Botón calendario NO encontrado');
        }
    });
    // Función para recoger piezas y actualizar almacén
    window.recogerPiezaYActualizarAlmacen = async function(fabricacionId) {
        try {
            console.log("Recogiendo pieza:", fabricacionId);
            
            // 1. Obtener fabricación
            const { data: fabricacion, error: fetchError } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // 2. Convertir nombre a ID (ej: "Motor" → "motor")
            const areaId = fabricacion.area.toLowerCase().replace(/ /g, '_');
            
            // 3. Crear pieza en piezas_almacen (tabla correcta)
            const { error: insertError } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: areaId,
                    nivel: fabricacion.nivel || 1,
                    puntos_base: 10,
                    estado: 'disponible',
                    fabricada_en: new Date().toISOString()
                }]);
            
            if (insertError) throw insertError;
            
            // 4. Marcar como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);
            
            if (updateError) throw updateError;
            
            // 5. Notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`✅ ${fabricacion.area} añadida al almacén`, 'success');
            }
            
            // 6. Actualizar producción
            if (window.f1Manager && window.f1Manager.updateProductionMonitor) {
                setTimeout(() => window.f1Manager.updateProductionMonitor(), 500);
            }
            
            // 7. Si estamos en almacén, actualizar
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                if (window.tabManager.loadAlmacenPiezas) {
                    setTimeout(() => window.tabManager.loadAlmacenPiezas(), 1000);
                }
            } else {
                // Forzar recarga del almacén la próxima vez que se abra
                window.almacenNecesitaActualizar = true;
            }
            
        } catch (error) {
            console.error("Error recogiendo pieza:", error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification("❌ Error al recoger pieza", 'error');
            }
        }
    };
    
})();
