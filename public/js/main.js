// ========================
// F1 MANAGER - MAIN.JS COMPLETO (CON TUTORIAL)
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

const produccionStyles = `
.progress-bar-global {
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
    margin: 5px 0;
    overflow: hidden;
}

.progress-fill-global {
    height: 100%;
    background: linear-gradient(90deg, #00d2be, #0066cc);
    border-radius: 3px;
    transition: width 0.3s ease;
}

.area-progreso-global {
    font-size: 0.7rem;
    color: #aaa;
    margin-top: 2px;
}
`;

const tallerStyles = '';

// ========================
// 4. CLASE F1Manager PRINCIPAL CON TUTORIAL
// ========================
class F1Manager {
    constructor(user, escuderia, supabase) {
        console.log('🚗 Creando F1Manager para:', user.email);
        this.user = user;
        this.escuderia = escuderia;
        this.supabase = supabase;
        this.pilotos = [];
        this.carStats = null;
        this.proximoGP = null;
    }

    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER
    // ========================

    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER (MODIFICADO)
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
            await this.cargarCarStats();
            
            const { data: piezasFabricadas, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('area, nivel, calidad')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', false);
            
            if (errorPiezas) {
                console.error('Error cargando piezas:', errorPiezas);
                throw errorPiezas;
            }
            
            const { data: fabricacionesActivas, error: errorFabricaciones } = await this.supabase
                .from('fabricacion_actual')
                .select('area, nivel, tiempo_fin, completada')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorFabricaciones) {
                console.error('Error cargando fabricaciones:', errorFabricaciones);
                throw errorFabricaciones;
            }
            
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
            
            const fabricacionesCount = fabricacionesActivas?.length || 0;
            
            let html = '<div class="taller-minimalista">';
            html += '<div class="taller-header-mini">';
            html += '<h2><i class="fas fa-tools"></i> TALLER DE FABRICACIÓN</h2>';
            html += '<div class="fabricaciones-activas-mini">';
            html += '<span class="badge-fabricacion">' + fabricacionesCount + '/4 fabricando</span>';
            html += '</div>';
            html += '</div>';
            
            html += '<div class="taller-botones-grid">';
            
            // Para cada área, procesar las 5 piezas posibles
            for (const area of areas) {
                const nivelActual = this.carStats ? 
                    this.carStats[area.id + '_nivel'] || 0 : 0;
                const nivelAFabricar = nivelActual + 1;
                
                const piezasAreaNivel = piezasFabricadas?.filter(p => {
                    const areaCoincide = p.area === area.id || p.area === area.nombre;
                    const nivelCoincide = (p.nivel || 1) === nivelAFabricar;
                    return areaCoincide && nivelCoincide;
                }) || [];
                
                const fabricacionActiva = fabricacionesActivas?.find(f => {
                    const areaCoincide = f.area === area.id || f.area === area.nombre;
                    const nivelCoincide = f.nivel === nivelAFabricar;
                    return areaCoincide && nivelCoincide && !f.completada;
                });
                
                html += '<div class="area-fila-mini">';
                html += '<div class="area-titulo-mini">';
                html += '<span class="area-icono-mini">' + area.icono + '</span>';
                html += '<span class="area-nombre-mini">' + area.nombre + '</span>';
                html += '<span class="area-nivel-mini">Nivel ' + nivelAFabricar + '</span>';
                
                // Barra simple
                html += '<div style="width: 100%; margin: 5px 0 10px 0;">';
                html += '<div style="font-size: 0.7rem; color: #aaa; margin-bottom: 3px;">Progreso del área</div>';
                html += '<div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">';
                html += '<div style="width: 2%; height: 100%; background: #00d2be; border-radius: 3px;"></div>';
                html += '</div>';
                html += '</div>';
                
                html += '</div>';  // ← Cierra 'area-titulo-mini'
                html += '<div class="botones-calidad-mini">';
                
                // Primero, obtener el total de piezas fabricadas para esta área
                const { data: todasPiezasArea } = await this.supabase
                    .from('almacen_piezas')
                    .select('id')
                    .eq('escuderia_id', this.escuderia.id)
                    .eq('area', area.id);
                
                const totalPiezasFabricadas = todasPiezasArea?.length || 0;
                
                // Para cada una de las 5 posibles piezas de este nivel
                // Primero, obtener todas las piezas de esta área para saber los numeros_global usados
                const { data: todasPiezasAreaConGlobal } = await this.supabase  // ← CAMBIÉ EL NOMBRE
                    .from('almacen_piezas')
                    .select('id, nivel, numero_global')
                    .eq('escuderia_id', this.escuderia.id)
                    .eq('area', area.id);
                
                // Crear array de numeros_global ya usados en este nivel
                const numerosGlobalesUsados = [];
                todasPiezasAreaConGlobal?.forEach(p => {  // ← USAR EL NUEVO NOMBRE
                    if (p.nivel === nivelAFabricar && p.numero_global) {
                        numerosGlobalesUsados.push(p.numero_global);
                    }
                });
                
                // Para cada una de las 5 posibles piezas
                for (let piezaNum = 1; piezaNum <= 5; piezaNum++) {
                    // Calcular qué número global sería esta pieza
                    const numeroGlobalEsperado = ((nivelAFabricar - 1) * 5) + piezaNum;
                    
                    // Verificar si YA EXISTE una pieza con este numero_global
                    const yaLaTienes = numerosGlobalesUsados.includes(numeroGlobalEsperado);
                    const piezaFabricada = piezasAreaNivel.length >= piezaNum;
                    
                    // Calcular puntos para mostrar
                    const puntosPieza = this.calcularPuntosPieza(numeroGlobalEsperado);
                    
                    if (yaLaTienes || piezaFabricada) {
                        // YA LA TIENES (fabricada O comprada)
                        html += '<button class="btn-pieza-mini lleno" disabled title="' + area.nombre + ' - Ya posees esta pieza (+' + puntosPieza + ' pts)">';
                        html += '<i class="fas fa-check"></i>';
                        html += '<span class="pieza-num">+' + puntosPieza + '</span>';
                        html += '</button>';
                    } else if (fabricacionActiva && piezaNum === piezasAreaNivel.length + 1) {
                        const tiempoRestante = new Date(fabricacionActiva.tiempo_fin) - new Date();
                        const minutos = Math.ceil(tiempoRestante / (1000 * 60));
                        
                        html += '<button class="btn-pieza-mini fabricando" disabled title="' + area.nombre + ' - Evolución ' + piezaNum + ' en fabricación (' + minutos + ' min) - +' + puntosPieza + ' pts">';
                        html += '<i class="fas fa-spinner fa-spin"></i>';
                        html += '<span class="pieza-num">+' + puntosPieza + '</span>';
                        html += '</button>';
                    } else {
                        const puedeFabricar = fabricacionesCount < 4 && 
                                            this.escuderia.dinero >= 10000 &&
                                            piezaNum === piezasAreaNivel.length + 1;
                        
                        html += '<button class="btn-pieza-mini vacio" ';
                        html += 'onclick="iniciarFabricacionTallerDesdeBoton(\'' + area.id + '\', ' + nivelAFabricar + ')"';
                        html += (!puedeFabricar ? ' disabled' : '') + '>';
                        html += '<i class="fas fa-plus"></i>';
                        html += '<span class="pieza-num">+' + puntosPieza + '</span>';
                        html += '</button>';
                    }
                }
                
                if (piezasAreaNivel.length >= 5) {
                    html += '<button class="btn-subir-nivel" onclick="f1Manager.subirNivelArea(\'' + area.id + '\')" title="Subir ' + area.nombre + ' al nivel ' + (nivelAFabricar + 1) + '">';
                    html += '<i class="fas fa-level-up-alt"></i>';
                    html += 'SUBIR NIVEL';
                    html += '</button>';
                }
                
                html += '</div>';
                html += '</div>';
            }
            
            html += '</div>';
            html += '<div class="taller-info-mini">';
            html += '<p><i class="fas fa-info-circle"></i> Fabricaciones activas: <strong>' + fabricacionesCount + '/4</strong></p>';
            html += '<p><i class="fas fa-info-circle"></i> Necesitas 5 evoluciones del mismo nivel para subir de nivel</p>';
            html += '<p><i class="fas fa-info-circle"></i> Los números muestran los puntos técnicos que otorga cada pieza</p>';
            html += '</div>';
            html += '</div>';
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error cargando taller minimalista:', error);
            container.innerHTML = '<div class="error"><h3>❌ Error cargando el taller</h3><p>' + error.message + '</p><button onclick="location.reload()">Reintentar</button></div>';
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
            
            const { data: piezasExistentes, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivel);
            
            if (errorPiezas) throw errorPiezas;
            
            const numeroPieza = (piezasExistentes?.length || 0) + 1;
            // Obtener número global de pieza para esta área
            const { data: todasPiezasArea } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId);
            
            const numeroPiezaGlobal = (todasPiezasArea?.length || 0) + 1;
            const numeroPiezaEnNivel = ((numeroPiezaGlobal - 1) % 5) + 1;            
            console.log('📊 Fabricando pieza ' + numeroPieza + ' para ' + areaId + ' nivel ' + nivel);
            
            const tiempoMinutos = this.calcularTiempoProgresivo(numeroPiezaGlobal);
            const tiempoMilisegundos = tiempoMinutos * 60 * 1000;
            console.log('⏱️ Tiempo: ' + tiempoMinutos + ' minutos (' + tiempoMilisegundos + 'ms)');
            

            
            // Calcular costo basado en nivel y número de pieza
            const costo = this.calcularCostoPieza(nivel, numeroPiezaEnNivel);
            
            if (this.escuderia.dinero < costo) {
                this.showNotification('❌ Fondos insuficientes. Necesitas €' + costo.toLocaleString(), 'error');
                return false;
            }
                        
            const ahora = new Date();
            const tiempoFin = new Date(ahora.getTime() + tiempoMilisegundos);
            
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
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: costo,
                    creada_en: ahora.toISOString()
                }])
                .select()
                .single();
            
            if (errorCrear) throw errorCrear;
            
            this.escuderia.dinero -= costo;
            await this.updateEscuderiaMoney();
            const nombreArea = this.getNombreArea(areaId);
            const horas = Math.floor(tiempoMinutos / 60);
            const dias = Math.floor(horas / 24);
            let tiempoTexto = '';
            if (dias > 0) {
                tiempoTexto = dias + ' días ' + (horas % 24) + ' horas';
            } else if (horas > 0) {
                tiempoTexto = horas + ' horas ' + (tiempoMinutos % 60) + ' minutos';
            } else {
                tiempoTexto = tiempoMinutos + ' minutos';
            }
            
            const nivelMostrar = "Q" + nivel;
            this.showNotification('✅ Actualización ' + nombreArea + ' (Mejora ' + numeroPiezaGlobal + ' ' + nivelMostrar + ') en fabricación - ' + tiempoTexto, 'success');            

            setTimeout(() => {
                this.updateProductionMonitor();
            }, 500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando fabricación:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
            return false;
        }
    }
    
    calcularTiempoProgresivo(numeroPiezaGlobal) {
        // Tabla de tiempos para 50 piezas en minutos
        const tiemposPorPiezaGlobal = {
            1: 2,      // Nivel 1, Pieza 1: 2 min
            2: 15,     // Nivel 1, Pieza 2: 15 min
            3: 30,     // Nivel 1, Pieza 3: 30 min
            4: 60,     // Nivel 1, Pieza 4: 1 hora
            5: 120,    // Nivel 1, Pieza 5: 2 horas
            6: 180,    // Nivel 2, Pieza 1: 3 horas
            7: 240,    // Nivel 2, Pieza 2: 4 horas
            8: 360,    // Nivel 2, Pieza 3: 6 horas
            9: 480,    // Nivel 2, Pieza 4: 8 horas
            10: 720,   // Nivel 2, Pieza 5: 12 horas
            11: 900,   // Nivel 3, Pieza 1: 15 horas
            12: 1080,  // Nivel 3, Pieza 2: 18 horas
            13: 1260,  // Nivel 3, Pieza 3: 21 horas
            14: 1440,  // Nivel 3, Pieza 4: 1 día
            15: 1620,  // Nivel 3, Pieza 5: 1.125 días
            // Niveles 4-10: progresión más lenta
            16: 1800, 17: 2160, 18: 2520, 19: 2880, 20: 3240, // Nivel 4: 1.25-2.25 días
            21: 3600, 22: 4320, 23: 5040, 24: 5760, 25: 6480, // Nivel 5: 2.5-4.5 días
            26: 7200, 27: 8640, 28: 10080, 29: 11520, 30: 12960, // Nivel 6: 5-9 días
            31: 14400, 32: 17280, 33: 20160, 34: 23040, 35: 25920, // Nivel 7: 10-18 días
            36: 28800, 37: 34560, 38: 40320, 39: 46080, 40: 51840, // Nivel 8: 20-36 días
            41: 57600, 42: 69120, 43: 80640, 44: 92160, 45: 103680, // Nivel 9: 40-72 días
            46: 115200, 47: 126720, 48: 138240, 49: 149760, 50: 161280 // Nivel 10: 80-112 días
        };
        
        // Si es una pieza mayor a 50, usar progresión continua
        if (numeroPiezaGlobal > 50) {
            const diasExtra = Math.floor((numeroPiezaGlobal - 50) / 5) * 7;
            return 161280 + (diasExtra * 24 * 60);
        }
        
        return tiemposPorPiezaGlobal[numeroPiezaGlobal] || 161280;
    }

    calcularCostoPieza(nivel, numeroPiezaEnNivel) {
        // Costes base por nivel (en euros)
        const costesBase = [
            0,           // nivel 0 (no existe)
            100000,      // nivel 1: €100K
            350000,      // nivel 2: €350K
            700000,      // nivel 3: €700K
            1200000,     // nivel 4: €1.2M
            2000000,     // nivel 5: €2M
            4000000,     // nivel 6: €4M
            8000000,     // nivel 7: €8M
            13000000,    // nivel 8: €13M
            18000000,    // nivel 9: €18M
            23000000     // nivel 10: €23M
        ];
        
        const base = costesBase[nivel] || 23000000;
        // Incremento del 10% por cada pieza dentro del mismo nivel
        return Math.floor(base * Math.pow(1.1, numeroPiezaEnNivel - 1));
    }
    
    calcularPuntosPieza(numeroPiezaGlobal) {
        // Progresión exponencial: Pieza 1 = 10 pts, Pieza 50 = ~53,084 pts
        const puntosBase = 10 * Math.pow(1.25, numeroPiezaGlobal - 1);
        return Math.floor(puntosBase);
    }
    
    async obtenerNumeroPiezaGlobal(areaId, nivel) {
        if (!this.escuderia || !this.escuderia.id) return 1;
        
        try {
            // Contar todas las piezas fabricadas para esta área
            const { data: piezasExistentes, error } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId);
            
            if (error) throw error;
            
            return (piezasExistentes?.length || 0) + 1;
            
        } catch (error) {
            console.error('Error obteniendo número de pieza global:', error);
            return 1;
        }
    }    
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
    
    calcularTiempoFabricacion(piezaNumero) {
        const tiemposEspeciales = {
            1: 2,
            2: 4,
            3: 15,
            4: 30,
            5: 60
        };
        
        if (tiemposEspeciales[piezaNumero]) {
            return tiemposEspeciales[piezaNumero];
        }
        
        return 60 + ((piezaNumero - 5) * 50);
    }
    
    async subirNivelArea(areaId) {
        console.log('⬆️ Subiendo nivel del área:', areaId);
        
        if (!this.escuderia || !this.escuderia.id || !this.carStats) {
            this.showNotification('❌ Error: No se encontraron datos del coche', 'error');
            return;
        }
        
        try {
            const nivelActual = this.carStats[areaId + '_nivel'] || 0;
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
                this.showNotification('❌ Necesitas 5 evoluciones del mismo nivel ' + nivelSiguiente + ' para subir de nivel', 'error');
                return;
            }
            
            const campoNivel = areaId + '_nivel';
            const campoProgreso = areaId + '_progreso';
            
            const nuevosStats = {
                [campoNivel]: nivelSiguiente,
                [campoProgreso]: 0,
                actualizado_en: new Date().toISOString()
            };
            
            const { error: errorStats } = await this.supabase
                .from('coches_stats')
                .update(nuevosStats)
                .eq('escuderia_id', this.escuderia.id);
            
            if (errorStats) throw errorStats;
            
            const idsPiezas = piezasArea.slice(0, 5).map(p => p.id);
            
            const { error: errorEquipar } = await this.supabase
                .from('almacen_piezas')
                .update({ equipada: true })
                .in('id', idsPiezas);
            
            if (errorEquipar) throw errorEquipar;
            
            this.carStats[campoNivel] = nivelSiguiente;
            this.carStats[campoProgreso] = 0;
            
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
            this.showNotification('✅ ' + nombreArea + ' subido a nivel ' + nivelSiguiente + '!', 'success');
            
            setTimeout(() => {
                this.cargarTabTaller();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error subiendo nivel:', error);
            this.showNotification('❌ Error subiendo nivel: ' + error.message, 'error');
        }
    }

    async inicializarSistemasIntegrados() {
        console.log('🔗 Inicializando sistemas integrados...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para inicializar sistemas');
            return;
        }
        if (window.MercadoManager && !window.window.mercadoManager) {
            console.log('🔧 Creando mercadoManager...');
            window.mercadoManager = new window.MercadoManager();
        }
        if (window.mercadoManager && typeof window.mercadoManager.inicializar === 'function') {
            await window.mercadoManager.inicializar(this.escuderia);
            console.log('✅ Sistema de mercado inicializado');
        }
        if (window.FabricacionManager && !window.fabricacionManager) {
            console.log('🔧 Creando fabricacionManager...');
            window.fabricacionManager = new window.FabricacionManager();
        }
        
        if (window.fabricacionManager && typeof window.fabricacionManager.inicializar === 'function') {
            await window.fabricacionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de fabricación inicializado');
        }
        
        console.log('🔧 FORZANDO creación de almacenManager...');
        
        if (!window.AlmacenManager) {
            console.log('⚠️ Clase AlmacenManager no existe, creando básica...');
            window.AlmacenManager = class AlmacenManagerBasico {
                constructor() {
                    this.escuderiaId = null;
                    this.piezas = [];
                }
                
                async inicializar(escuderiaId) {
                    this.escuderiaId = escuderiaId;
                    console.log('✅ almacenManager inicializado para escudería: ' + escuderiaId);
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
        
        if (!window.almacenManager) {
            window.almacenManager = new window.AlmacenManager();
            console.log('✅ Instancia de almacenManager creada');
        }
        
        if (window.almacenManager && this.escuderia && this.escuderia.id) {
            await window.almacenManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de almacén inicializado (GARANTIZADO)');
        }
        
        if (window.IntegracionManager) {
            window.integracionManager = new window.IntegracionManager();
            await window.integracionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de integración inicializado');
        }
        
        this.iniciarTimersAutomaticos();
    }
    
    iniciarTimersAutomaticos() {
        if (this.timersAutomaticos) {
            Object.values(this.timersAutomaticos).forEach(timer => {
                clearInterval(timer);
            });
        }
        
        this.timersAutomaticos = {
            produccion: setInterval(() => {
                if (window.fabricacionManager && window.fabricacionManager.actualizarUIProduccion) {
                    window.fabricacionManager.actualizarUIProduccion(true);
                }
            }, 1000),
            
            dashboard: setInterval(() => {
                this.updateProductionMonitor();
            }, 3000)
        };
        
        console.log('⏱️ Timers automáticos iniciados');
    }

    async cargarPiezasMontadas() {
        console.log('🎯 Cargando piezas montadas...');
        
        const contenedor = document.getElementById('grid-piezas-montadas');
        if (!contenedor) return;
        
        try {
            const { data: piezasMontadas } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
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
                    puntosTotales += pieza.puntos_base || 0;
                    html += '<div class="boton-area-montada" onclick="irAlAlmacenDesdePiezas()" title="' + pieza.area + ' - Nivel ' + pieza.nivel + ' - ' + pieza.calidad + '">';
                    html += '<div class="icono-area">' + area.icono + '</div>';
                    html += '<div class="nombre-area">' + area.nombre + '</div>';
                    html += '<div class="nivel-pieza">Nivel ' + pieza.nivel + '</div>';
                    html += '<div class="puntos-pieza">+' + pieza.puntos_base + '</div>';
                    html += '<div class="calidad-pieza" style="font-size:0.6rem;color:#aaa">' + pieza.calidad + '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()" title="Sin pieza - Click para equipar">';
                    html += '<div class="icono-area">+</div>';
                    html += '<div class="nombre-area">' + area.nombre + '</div>';
                    html += '<div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>';
                    html += '</div>';
                }
            });
            
            contenedor.innerHTML = html;
            
            const puntosElement = document.getElementById('puntos-totales-montadas');
            if (puntosElement) {
                puntosElement.textContent = puntosTotales;
            }
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            this.mostrarBotonesVacios(contenedor);
        }
    }
    
    mostrarBotonesVacios(contenedor) {
        const areas = ['Suelo', 'Motor', 'Alerón Del.', 'Caja Cambios', 'Pontones', 
                       'Suspensión', 'Alerón Tras.', 'Chasis', 'Frenos', 'Volante', 'Electrónica'];
        
        let html = '';
        areas.forEach(area => {
            html += '<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()">';
            html += '<div class="icono-area">+</div>';
            html += '<div class="nombre-area">' + area + '</div>';
            html += '<div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>';
            html += '</div>';
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
                .from('ingenieros_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true)
                .order('contratado_en', { ascending: false });
    
            if (error) throw error;
    
            this.pilotos = ingenieros || [];
            console.log('✅ ' + this.pilotos.length + ' ingeniero(s) cargado(s)');
            
            this.updatePilotosUI();
            
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

    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard COMPACTO con funcionalidad completa...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }

        await this.cargarProximoGP();
        
        function formatearFecha(fechaStr) {
            if (!fechaStr) return 'Fecha no definida';
            const fecha = new Date(fechaStr);
            const opciones = { 
                day: 'numeric', 
                month: 'short'
            };
            return fecha.toLocaleDateString('es-ES', opciones);
        }
                
        const countdownHTML = `
            <div class="countdown-f1-container">
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
                
                <div class="carrera-info-f1" style="margin-bottom: 5px;">
                    <div class="carrera-nombre-f1" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0;">
                        <i class="fas fa-trophy" style="color: #FFD700;"></i>
                        <span id="nombre-carrera" style="color: white; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: bold;">
                            ${this.proximoGP?.nombre || 'No hay carreras'}
                        </span>
                    </div>
                </div>
                
                <div class="countdown-main-f1">
                    <div class="countdown-label">CIERRE DE APUESTAS EN:</div>
                    
                    <div class="timer-container-f1">
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-dias">--</div>
                            <div class="time-label-f1">DÍAS</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-horas">--</div>
                            <div class="time-label-f1">HORAS</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-minutos">--</div>
                            <div class="time-label-f1">MIN</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-segundos">--</div>
                            <div class="time-label-f1">SEG</div>
                        </div>
                    </div>
                </div>
                
                <button class="btn-pronostico-f1" id="btn-estado-apuestas">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Cargando...</span>
                </button>
            </div>
        `;

        document.body.innerHTML = `
            <div id="app" style="min-height: 100vh; display: flex; flex-direction: column;">
                <header class="dashboard-header-compacto">
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
                        <button class="tab-btn-compacto" data-tab="pronosticos">
                            <i class="fas fa-chart-line"></i> Pronósticos
                        </button>
                        <button class="tab-btn-compacto" data-tab="presupuesto">
                            <i class="fas fa-chart-pie"></i> Presupuesto
                        </button>
                        <button class="tab-btn-compacto" data-tab="clasificacion">
                            <i class="fas fa-medal"></i> Clasificación
                        </button>
                    </nav>
                </header>
                
                <main class="dashboard-content" style="flex: 1; overflow-y: auto;">
                    <div id="tab-principal" class="tab-content active">
                        <div class="three-columns-layout">
                            <div class="col-estrategas">
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
                                
                                <div id="pilotos-container" class="pilotos-container">
                                </div>
                            </div>
                            
                            <div class="col-countdown">
                                ${countdownHTML}
                            </div>
                            
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
                        
                        <section class="piezas-montadas">
                            <div class="section-header">
                                <h2><i class="fas fa-car"></i> PIEZAS MONTADAS EN EL COCHE</h2>
                                <div class="total-puntos-montadas">
                                    <i class="fas fa-star"></i>
                                    <span>Puntos totales: <strong id="puntos-totales-montadas">0</strong></span>
                                </div>
                            </div>
                            
                            <div id="grid-piezas-montadas" class="grid-11-columns">
                            </div>
                        </section>
                    </div>
                    
                    <div id="tab-taller" class="tab-content"></div>
                    <div id="tab-almacen" class="tab-content"></div>
                    <div id="tab-mercado" class="tab-content">
                        <div class="mercado-cargando">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Cargando mercado...</p>
                        </div>
                    </div>
                    <div id="tab-pronosticos" class="tab-content"></div>
                    <div id="tab-presupuesto" class="tab-content"></div>
                    <div id="tab-clasificacion" class="tab-content"></div>
                </main>
                
                <footer class="dashboard-footer">
                    <div class="user-info-compacto">
                        <i class="fas fa-user-circle"></i>
                        <span>${this.user.email?.split('@')[0] || 'Usuario'}</span>
                    </div>
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
            
            <script>
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                }, 1000);
                
                document.querySelectorAll('.tab-btn-compacto').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const tabId = e.currentTarget.dataset.tab;
                        
                        document.querySelectorAll('.tab-btn-compacto').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        
                        e.currentTarget.classList.add('active');
                        document.getElementById('tab-' + tabId).classList.add('active');
                        
                        if (window.tabManager && window.tabManager.switchTab) {
                            window.tabManager.switchTab(tabId);
                        }
                        
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                            }, 100);
                        }
                    });
                });
                
                const logoutBtn = document.getElementById('logout-btn-visible');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            const supabaseClient = window.supabase;
                            if (supabaseClient) {
                                await supabaseClient.auth.signOut();
                                console.log('✅ Sesión cerrada');
                                window.location.href = window.location.origin;
                            }
                        } catch (error) {
                            console.error('❌ Error cerrando sesión:', error);
                            window.location.href = window.location.origin;
                        }
                    });
                }
                
                window.irAlTallerDesdeProduccion = function() {
                    document.querySelector('[data-tab="taller"]').click();
                };
                
                window.gestionarEstrategas = function() {
                    if (window.f1Manager && window.f1Manager.mostrarModalContratacion) {
                        window.f1Manager.mostrarModalContratacion();
                    }
                };
                
                window.cargarContenidoPrincipal = async function() {
                    if (window.f1Manager) {
                        if (window.f1Manager.cargarPiezasMontadas) {
                            await window.f1Manager.cargarPiezasMontadas();
                        }
                        if (window.f1Manager.loadPilotosContratados) {
                            await window.f1Manager.loadPilotosContratados();
                        }
                        if (window.f1Manager.updateProductionMonitor) {
                            window.f1Manager.updateProductionMonitor();
                        }
                    }
                };
                
                setTimeout(() => {
                    if (window.cargarContenidoPrincipal) {
                        window.cargarContenidoPrincipal();
                    }
                }, 1500);
            </script>
        `;

        document.getElementById('logout-btn-visible').addEventListener('click', async () => {
            try {
                console.log('🔒 Cerrando sesión...');
                const { error } = await this.supabase.auth.signOut();
                if (error) {
                    console.error('❌ Error al cerrar sesión:', error);
                    this.showNotification('Error al cerrar sesión', 'error');
                } else {
                    console.log('✅ Sesión cerrada, recargando...');
                    location.reload();
                }
            } catch (error) {
                console.error('❌ Error inesperado:', error);
                this.showNotification('Error inesperado', 'error');
            }
        });
        
        setTimeout(async () => {
            console.log('🔧 Inicializando sistemas críticos del dashboard...');
            
            if (!window.fabricacionManager && window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                if (this.escuderia) {
                    await window.fabricacionManager.inicializar(this.escuderia.id);
                }
            }
            
            setTimeout(() => {
                if (window.tabManager && window.tabManager.setup) {
                    const originalSwitchTab = window.tabManager.switchTab;
                    
                    window.tabManager.switchTab = function(tabId) {
                        originalSwitchTab.call(this, tabId);
                        
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
            
            const supabase = window.supabase;
            if (supabase) {
                await this.loadCarStatus();
                await this.loadPilotosContratados();
                await this.cargarProximoGP();
                
                setTimeout(() => {
                    this.iniciarCountdownCompacto();
                }, 500);
                
                setTimeout(async () => {
                    await this.cargarPiezasMontadas();
                }, 500);
            }
            
            console.log('✅ Dashboard compacto cargado correctamente con toda la funcionalidad');
            
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
                    const tiempoFin = new Date(fabricacion.tiempo_fin);
                    const ahora = new Date();
                    const diferencia = tiempoFin - ahora;
                    
                    let tiempoTexto = '';
                    if (diferencia > 0) {
                        const horas = Math.floor(diferencia / (1000 * 60 * 60));
                        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                        tiempoTexto = horas + 'h ' + minutos + 'm';
                    } else {
                        tiempoTexto = '¡Listo!';
                    }
                    
                    slot.classList.add('slot-activo-compacto');
                    slot.innerHTML = '<div class="slot-icono-compacto"><i class="fas fa-cog fa-spin"></i></div><div class="slot-texto-compacto"><div style="color: #4CAF50; font-weight: bold; font-size: 0.7rem;">' + (fabricacion.area || 'Evolución') + '</div><div style="color: #FF9800; font-size: 0.65rem;">' + tiempoTexto + '</div></div>';
                    
                    slot.onclick = () => {
                        document.querySelector('[data-tab="taller"]').click();
                    };
                } else {
                    slot.classList.remove('slot-activo-compacto');
                    slot.innerHTML = '<div class="slot-icono-compacto"><i class="fas fa-plus"></i></div><div class="slot-texto-compacto">Slot ' + (index + 1) + '</div>';
                    slot.onclick = () => {
                        document.querySelector('[data-tab="taller"]').click();
                    };
                }
            });
            
            if (contador) {
                contador.textContent = (fabricaciones?.length || 0) + '/4';
            }
            
        } catch (error) {
            console.error('Error actualizando producción:', error);
        }
    }

    async cargarPiezasMontadasCompacto() {
        console.log('🎯 Cargando piezas montadas compactas...');
        
        const container = document.getElementById('grid-piezas-compacto');
        const puntosElement = document.getElementById('puntos-totales-compacto');
        
        if (!container) return;
        
        try {
            const { data: piezasMontadas } = await this.supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
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
                    html += '<div class="pieza-boton-compacto pieza-montada-compacto" onclick="irAlAlmacenDesdePiezas()" title="' + pieza.area + ' - Nivel ' + pieza.nivel + ' - ' + pieza.calidad + '">';
                    html += '<div class="pieza-icono-compacto">' + area.icono + '</div>';
                    html += '<div class="pieza-nombre-compacto">' + area.nombre + '</div>';
                    html += '<div class="pieza-nivel-compacto">N' + pieza.nivel + '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="pieza-boton-compacto" onclick="irAlAlmacenDesdePiezas()" title="Sin pieza - Click para equipar">';
                    html += '<div class="pieza-icono-compacto" style="color: #666;">+</div>';
                    html += '<div class="pieza-nombre-compacto">' + area.nombre + '</div>';
                    html += '<div style="font-size: 0.55rem; color: #888;">Vacío</div>';
                    html += '</div>';
                }
            });
            
            container.innerHTML = html;
            
            if (puntosElement) {
                puntosElement.textContent = puntosTotales + ' pts';
            }
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 10px;">Error cargando piezas</div>';
        }
    }

    async iniciarCountdownCompacto() {
        console.log('🏎️ Iniciando countdown estilo F1...');
        
        if (!this.proximoGP) {
            await this.cargarProximoGP();
        }
        
        if (!this.proximoGP) {
            console.log('❌ No hay próximas carreras');
            return;
        }
        
        const fechaCarrera = new Date(this.proximoGP.fecha_inicio);
        fechaCarrera.setHours(14, 0, 0, 0);
        const fechaLimiteApuestas = new Date(fechaCarrera);
        fechaLimiteApuestas.setHours(fechaCarrera.getHours() - 48);
        
        const formatearFecha = (fecha) => {
            const opciones = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            return fecha.toLocaleDateString('es-ES', opciones);
        };
        
        const actualizarCountdown = () => {
            const ahora = new Date();
            const diferencia = fechaLimiteApuestas - ahora;
            
            const diasElem = document.getElementById('countdown-dias');
            const horasElem = document.getElementById('countdown-horas');
            const minutosElem = document.getElementById('countdown-minutos');
            const segundosElem = document.getElementById('countdown-segundos');
            
            if (diferencia > 0) {
                const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
                
                if (diasElem) diasElem.textContent = dias.toString().padStart(2, '0');
                if (horasElem) horasElem.textContent = horas.toString().padStart(2, '0');
                if (minutosElem) minutosElem.textContent = minutos.toString().padStart(2, '0');
                if (segundosElem) segundosElem.textContent = segundos.toString().padStart(2, '0');
                
                const btnApuestas = document.getElementById('btn-estado-apuestas');
                if (btnApuestas) {
                    if (diferencia > 0) {
                        btnApuestas.disabled = false;
                        btnApuestas.innerHTML = '<i class="fas fa-paper-plane"></i> ENVIAR PRONÓSTICO';
                        btnApuestas.className = 'btn-pronostico-f1 abierto';
                    } else {
                        btnApuestas.disabled = true;
                        btnApuestas.innerHTML = '<i class="fas fa-lock"></i> APUESTAS CERRADAS';
                        btnApuestas.className = 'btn-pronostico-f1 cerrado';
                    }
                }
                
            } else {
                if (diasElem) diasElem.textContent = '00';
                if (horasElem) horasElem.textContent = '00';
                if (minutosElem) minutosElem.textContent = '00';
                if (segundosElem) segundosElem.textContent = '00';
            }
        };
        
        actualizarCountdown();
        const intervalId = setInterval(actualizarCountdown, 1000);
        this.countdownInterval = intervalId;
    }

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
        if (!window.supabase || !window.supabase.from) {
            console.error('❌ window.supabase no está disponible en loadProximoGP');
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
                this.proximoGP = {
                    nombre: 'Gran Premio de España',
                    fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                    circuito: 'Circuit de Barcelona-Catalunya'
                };
            } else if (gp) {
                this.proximoGP = gp;
                console.log('✅ GP cargado:', gp.nombre);
            } else {
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
            this.proximoGP = {
                nombre: 'Próximo GP por confirmar',
                fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                circuito: 'Circuito por confirmar'
            };
            this.updateCountdown();
        }
    }

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

    async cargarProximoGP() {
        console.log('📅 Cargando próximo GP desde BD...');
        
        if (!this.escuderia || !this.supabase) {
            console.error('❌ No hay escudería o supabase');
            return null;
        }
        
        try {
            const { data: proximosGPs, error } = await this.supabase
                .from('calendario_gp')
                .select('*')
                .gte('fecha_inicio', new Date().toISOString().split('T')[0])
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
            const nivel = this.carStats[area.id + '_nivel'] || 0;
            const progreso = this.carStats[area.id + '_progreso'] || 0;
            const porcentaje = (progreso / window.CONFIG.PIECES_PER_LEVEL) * 100;
            
            return '<div class="area-item" style="border-left-color: ' + area.color + '">' +
                   '<span class="area-nombre">' + area.name + '</span>' +
                   '<div class="area-nivel">' +
                   '<span>Nivel</span>' +
                   '<span class="nivel-valor">' + nivel + '</span>' +
                   '</div>' +
                   '<div class="area-progreso">' +
                   'Progreso: <span class="progreso-valor">' + progreso + '/20</span>' +
                   '</div>' +
                   '<div class="progress-bar-small">' +
                   '<div class="progress-fill-small" style="width: ' + porcentaje + '%"></div>' +
                   '</div>' +
                   '<button class="btn-fabricar" data-area="' + area.id + '">' +
                   '<i class="fas fa-hammer"></i> Fabricar (€' + window.CONFIG.PIECE_COST.toLocaleString() + ')' +
                   '</button>' +
                   '</div>';
        }).join('');
        
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
        
        const contadorElement = document.getElementById('contador-estrategas');
        if (contadorElement) {
            contadorElement.textContent = estrategasContratados.length + '/4';
        }
        
        // QUITAR LOS ESTILOS INLINE CON !important
        let html = '<div class="produccion-slots">';  // CAMBIADO: Sin style
        
        for (let i = 0; i < 4; i++) {
            const estratega = estrategasContratados[i];
            
            if (estratega) {
                // CAMBIADO: Sin style="height: 80px !important;"
                html += '<div class="produccion-slot estratega-slot" onclick="mostrarInfoEstratega(' + i + ')">';
                html += '<div class="slot-content">';
                html += '<div class="estratega-icon" style="font-size: 1.1rem; color: #00d2be; margin-bottom: 5px;">';
                html += '<i class="fas fa-user-tie"></i>';
                html += '</div>';
                html += '<span style="display: block; font-size: 0.75rem; color: white; font-weight: bold; margin-bottom: 2px;">' + (estratega.nombre || 'Estratega') + '</span>';
                html += '<span style="display: block; font-size: 0.65rem; color: #FFD700;">€' + (estratega.salario || 0).toLocaleString() + '/mes</span>';
                html += '<span style="display: block; font-size: 0.6rem; color: #aaa; margin-top: 2px;">' + (estratega.especialidad || 'General') + '</span>';
                html += '</div>';
                html += '</div>';
            } else {
                // CAMBIADO: Sin style="height: 80px !important;"
                html += '<div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(' + i + ')">';
                html += '<div class="slot-content">';
                html += '<i class="fas fa-plus" style="font-size: 1.1rem; color: #666; margin-bottom: 5px;"></i>';
                html += '<span style="display: block; font-size: 0.75rem; color: #888;">Slot ' + (i + 1) + '</span>';
                html += '<span style="display: block; font-size: 0.65rem; color: #aaa; margin-top: 2px;">Vacío</span>';
                html += '</div>';
                html += '</div>';
            }
        }
        
        html += '</div>';
        
        container.innerHTML = html;
    }
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
        
        if (!this.escuderia || this.escuderia.dinero < window.CONFIG.PIECE_COST) {
            const falta = window.CONFIG.PIECE_COST - (this.escuderia?.dinero || 0);
            const mensaje = '❌ Fondos insuficientes. Necesitas €' + falta.toLocaleString() + ' más';
            this.showNotification(mensaje, 'error');
            return false;
        }

        if (!window.fabricacionManager) {
            console.log('⚠️ [DEBUG] fabricacionManager es undefined...');
            
            if (window.FabricacionManager) {
                console.log('✅ [DEBUG] Clase existe, creando instancia...');
                window.fabricacionManager = new window.FabricacionManager();
                console.log('✅ [DEBUG] Instancia creada:', window.fabricacionManager);
            } else {
                console.error('❌ [DEBUG] Clase NO existe - Error fatal');
                this.showNotification('Error: Sistema de fabricación no cargado', 'error');
                return false;
            }
        }
        
        if (!this.escuderia) {
            console.error('❌ No tienes escudería');
            this.showNotification('❌ No tienes escudería', 'error');
            return false;
        }
        
        if (window.fabricacionManager && !window.fabricacionManager.escuderiaId && this.escuderia) {
            console.log('🔧 [DEBUG] Inicializando fabricacionManager con escudería:', this.escuderia.id);
            window.fabricacionManager.inicializar(this.escuderia.id);
        }
        
        console.log('🔧 [DEBUG] Llamando a iniciarFabricacion...');
        
        if (!window.fabricacionManager.iniciarFabricacion) {
            console.error('❌ [DEBUG] iniciarFabricacion no existe en fabricacionManager');
            this.showNotification('Error: Método de fabricación no disponible', 'error');
            return false;
        }
        
        const resultado = window.fabricacionManager.iniciarFabricacion(areaId);
        
        if (resultado) {
            console.log('✅ Fabricación iniciada exitosamente');
            
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (area) {
                const mensaje = '✅ Fabricación de ' + area.name + ' iniciada (30 segundos)';
                this.showNotification(mensaje, 'success');
            }
            
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 1000);
            
            const selector = '[data-area="' + areaId + '"]';
            const boton = document.querySelector(selector);
            if (boton) {
                boton.disabled = true;
                boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fabricando...';
            }
            
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
        
        let icono = 'info-circle';
        if (tipo === 'success') icono = 'check-circle';
        if (tipo === 'error') icono = 'exclamation-circle';
        
        notification.innerHTML = '<i class="fas fa-' + icono + '"></i><span>' + mensaje + '</span>';
        
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
                    moneyValue.textContent = '€' + this.escuderia.dinero.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error actualizando dinero:', error);
        }
    }

    async cargarDatosDashboard() {
        console.log('📊 Cargando datos del dashboard...');
        
        this.updateProductionMonitor();
        
        this.setupDashboardEvents();
        
        this.startTimers();
        
        console.log('✅ Dashboard configurado con timers');
    }

    startTimers() {
        if (this.productionTimer) {
            clearInterval(this.productionTimer);
        }
        
        setTimeout(() => {
            this.updateProductionMonitor();
        }, 300);
        
        this.productionTimer = setInterval(() => {
            this.updateProductionMonitor();
        }, 5000);
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        this.countdownTimer = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        console.log('⏱️ Timers iniciados');
    }

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
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .order('tiempo_inicio', { ascending: true });
            
            if (error) throw error;
            
            console.log('📊 Fabricaciones activas encontradas:', fabricaciones?.length || 0);
            
            const ahoraUTC = Date.now();
            const fabricacionesConEstado = (fabricaciones || []).map(f => {
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
            
            const fabricacionesConNumero = [];
            for (const fabricacion of fabricacionesConEstado) {
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
            
            this.cargarEstilosProduccion();
            
            let html = '<div class="produccion-slots">';
            
            for (let i = 0; i < 4; i++) {
                const fabricacion = fabricacionesConNumero[i];
                
                if (fabricacion) {
                    const tiempoRestante = fabricacion.tiempoRestante;
                    const lista = fabricacion.lista;
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const tiempoFormateado = this.formatTime(tiempoRestante);
                    const numeroPieza = fabricacion.numero_pieza || 1;
                    
                    // === NUEVO: Cambiar textos de visualización ===
                    // "Actualización Suelo" en lugar del nombre del área
                    const nombreMostrar = "Actualización " + nombreArea;
                    
                    // "Mejora 4 Q1" en lugar de "Pieza 4/50 (Nivel 1)"
                    // Q1, Q2, Q3... en lugar de nivel 1, nivel 2
                    const nivelMostrar = "Q" + fabricacion.nivel;
                    const mejoraTexto = "Mejora " + numeroPieza + " " + nivelMostrar;
                    // === FIN NUEVO ===
                    
                    html += '<div class="produccion-slot ' + (lista ? 'produccion-lista' : 'produccion-activa') + '" ';
                    html += 'onclick="recogerPiezaSiLista(\'' + fabricacion.id + '\', ' + lista + ', ' + i + ')" ';
                    html += 'title="' + nombreArea + ' - Evolución ' + numeroPieza + ' de nivel ' + fabricacion.nivel + '">';
                    html += '<div class="produccion-icon">';
                    html += (lista ? '✅' : '');
                    html += '</div>';
                    html += '<div class="produccion-info">';
                    html += '<span class="produccion-nombre">' + nombreMostrar + '</span>';
                    
                    // Calcular número global de pieza
                    const { data: piezasAreaTotal } = await this.supabase
                        .from('almacen_piezas')
                        .select('id')
                        .eq('escuderia_id', this.escuderia.id)
                        .eq('area', fabricacion.area);
                    
                    const totalPiezasFabricadas = piezasAreaTotal?.length || 0;
                    const numeroPiezaGlobal = totalPiezasFabricadas + 1;
                    
                    // Mostrar "Mejora 4 Q1" en lugar del texto anterior
                    html += '<span class="produccion-pieza-num">' + mejoraTexto + '</span>';
                    
                    if (lista) {
                        html += '<span class="produccion-lista-text">¡LISTA!</span>';
                    } else {
                        html += '<span class="produccion-tiempo">' + tiempoFormateado + '</span>';
                    }
                    html += '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="produccion-slot" data-slot="' + i + '" onclick="irAlTallerDesdeProduccion()">';
                    html += '<div class="slot-content">';
                    html += '<i class="fas fa-plus"></i>';
                    html += '<span>Departamento ' + (i + 1) + '</span>';
                    html += '<span class="slot-disponible">Disponible</span>';
                    html += '</div>';
                    html += '</div>';
                }
            }
            
            html += '</div>';
            container.innerHTML = html;
            
            this.iniciarTimerProduccion();
            
        } catch (error) {
            console.error("Error en updateProductionMonitor:", error);
            container.innerHTML = '<div class="produccion-error"><p>❌ Error cargando producción</p><button onclick="window.f1Manager.updateProductionMonitor()">Reintentar</button></div>';
        }
    }

    iniciarTimerProduccion() {
        if (this.productionUpdateTimer) {
            clearInterval(this.productionUpdateTimer);
        }
        
        this.productionUpdateTimer = setInterval(() => {
            this.actualizarTiemposEnVivo();
        }, 1000);
    }

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
                    slot.classList.remove('produccion-activa');
                    slot.classList.add('produccion-lista');
                    // === ACTUALIZAR TEXTO A NUEVO FORMATO ===
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const nombreMostrar = "Actualización " + nombreArea;
                    const nivelMostrar = "Q" + fabricacion.nivel;
                    // === FIN ACTUALIZACIÓN ===
                    slot.innerHTML = '<div class="produccion-icon">✅</div><div class="produccion-info"><span class="produccion-nombre">' + nombreMostrar + '</span><span class="produccion-pieza-num">' + nivelMostrar + '</span><span class="produccion-lista-text">¡LISTA!</span></div>';
                } else {
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

    cargarEstilosProduccion() {
        if (!document.getElementById('estilos-produccion')) {
            const style = document.createElement('style');
            style.id = 'estilos-produccion';
            style.innerHTML = produccionStyles;
            document.head.appendChild(style);
        }
    }

    formatTime(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        
        const totalSegundos = Math.floor(milliseconds / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        
        if (horas > 0) {
            return horas + 'h ' + minutos + 'm ' + segundos + 's';
        } else if (minutos > 0) {
            return minutos + 'm ' + segundos + 's';
        } else {
            return segundos + 's';
        }
    }

    setupDashboardEvents() {
        document.getElementById('iniciar-fabricacion-btn')?.addEventListener('click', () => {
            this.irAlTaller();
        });
        
        document.getElementById('contratar-pilotos-btn')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        document.getElementById('contratar-primer-piloto')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        document.getElementById('btn-apostar')?.addEventListener('click', () => {
            this.mostrarApuestas();
        });
    }

    mostrarContratarPilotos() {
        this.showNotification('🏎️ Sistema de pilotos en desarrollo', 'info');
    }

    mostrarApuestas() {
        this.showNotification('💰 Sistema de apuestas en desarrollo', 'info');
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

window.tutorialManager = null;
window.tutorialData = {
    estrategaSeleccionado: null,
    areaSeleccionada: null,
    pronosticosSeleccionados: {},
    piezaFabricando: false
};

window.irAlTallerDesdeProduccion = function() {
    if (window.tabManager && window.tabManager.switchTab) {
        window.tabManager.switchTab('taller');
    } else {
        alert('Redirigiendo al taller para fabricar...');
    }
};

window.recogerPiezaSiLista = async function(fabricacionId, lista, slotIndex) {
    console.log("🔧 Recogiendo pieza:", { fabricacionId, lista });
    
    if (!lista) {
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification("⏳ La pieza aún está en producción", "info");
        }
        
        try {
            const { data: fabricacion } = await window.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
                
            if (fabricacion) {
                const ahora = new Date();
                const tiempoFin = new Date(fabricacion.tiempo_fin);
                const tiempoRestante = tiempoFin - ahora;
                const tiempoFormateado = tiempoRestante > 0 ? 
                    window.f1Manager?.formatTime(tiempoRestante) : "Finalizando...";
                
                const { data: piezasExistentes } = await window.supabase
                    .from('almacen_piezas')
                    .select('id')
                    .eq('escuderia_id', fabricacion.escuderia_id)
                    .eq('area', fabricacion.area)
                    .eq('nivel', fabricacion.nivel);
                
                const numeroPieza = (piezasExistentes?.length || 0) + 1;
                const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
                
                alert('🔄 ' + nombreArea + '\nPieza ' + numeroPieza + ' de nivel ' + fabricacion.nivel + '\nTiempo restante: ' + tiempoFormateado);
            }
        } catch (error) {
            console.error("Error obteniendo info:", error);
        }
        return;
    }
    
    try {
        const { data: fabricacion, error: fetchError } = await window.supabase
            .from('fabricacion_actual')
            .select('*')
            .eq('id', fabricacionId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // ===== NUEVO: Calcular número global =====
        // 1. Obtener todas las piezas de esta área
        const { data: todasPiezasArea } = await window.supabase
            .from('almacen_piezas')
            .select('id, numero_global')
            .eq('escuderia_id', fabricacion.escuderia_id)
            .eq('area', fabricacion.area);
        
        // 2. Encontrar el siguiente número global
        let maxNumeroGlobal = 0;
        if (todasPiezasArea && todasPiezasArea.length > 0) {
            // Buscar el máximo numero_global existente
            todasPiezasArea.forEach(p => {
                if (p.numero_global && p.numero_global > maxNumeroGlobal) {
                    maxNumeroGlobal = p.numero_global;
                }
            });
        }
        const nuevoNumeroGlobal = maxNumeroGlobal + 1;
        
        // ===== 3. Calcular puntos =====
        let puntosTotales;
        if (window.f1Manager && window.f1Manager.calcularPuntosPieza) {
            puntosTotales = window.f1Manager.calcularPuntosPieza(nuevoNumeroGlobal);
        } else {
            puntosTotales = calcularPuntosBase(fabricacion.area, fabricacion.nivel, nuevoNumeroGlobal);
        }
        
        // ===== 4. Insertar con numero_global =====
        const { error: insertError } = await window.supabase
            .from('almacen_piezas')
            .insert([{
                escuderia_id: fabricacion.escuderia_id,
                area: fabricacion.area,
                nivel: fabricacion.nivel || 1,
                numero_global: nuevoNumeroGlobal,
                puntos_base: puntosTotales,
                calidad: 'Normal',
                equipada: false,
                fabricada_en: new Date().toISOString(),
                creada_en: new Date().toISOString()
            }]);
        
        if (insertError) {
            console.error("Error insertando pieza:", insertError);
            throw insertError;
        }
        
        console.log("✅ Pieza añadida a almacen_piezas");
        
        const { error: updateError } = await window.supabase
            .from('fabricacion_actual')
            .update({ 
                completada: true
            })
            .eq('id', fabricacionId);
        
        if (updateError) throw updateError;
        
        console.log("✅ Fabricación marcada como completada");
        
        const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification('✅ ' + nombreArea + ' (Pieza ' + numeroPieza + ') recogida\n+' + puntosTotales + ' puntos técnicos', 'success');
        }
        
        if (window.f1Manager) {
            if (window.f1Manager.productionUpdateTimer) {
                clearInterval(window.f1Manager.productionUpdateTimer);
            }
            
            setTimeout(() => {
                window.f1Manager.updateProductionMonitor();
            }, 500);
            
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                setTimeout(() => {
                    if (window.tabManager.loadAlmacenPiezas) {
                        window.tabManager.loadAlmacenPiezas();
                    }
                }, 1000);
            }
            
            setTimeout(() => {
                if (window.f1Manager.cargarPiezasMontadas) {
                    window.f1Manager.cargarPiezasMontadas();
                }
            }, 1500);
        }
        
    } catch (error) {
        console.error('❌ Error recogiendo pieza:', error);
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification('❌ Error: ' + error.message, 'error');
        }
    }
};
function calcularPuntosBase(area, nivel, numeroPiezaGlobal) {
    // Usar el nuevo sistema de puntos exponencial
    if (window.f1Manager && window.f1Manager.calcularPuntosPieza) {
        return window.f1Manager.calcularPuntosPieza(numeroPiezaGlobal || 1);
    }
    
    // Fallback al sistema antiguo
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
        return horas + 'h ' + minutos + 'm';
    } else if (minutos > 0) {
        return minutos + 'm ' + segundos + 's';
    } else {
        return segundos + 's';
    }
}

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
    
    container.innerHTML = estrategas.map(e => 
        '<div class="estratega-tutorial-card seleccionable">' +
        '<div class="estratega-icon-tut">' + e.icono + '</div>' +
        '<div class="estratega-nombre-tut">' + e.nombre + '</div>' +
        '<div class="estratega-especialidad">' + e.especialidad + '</div>' +
        '<div class="estratega-bono">Bono: <span class="bono-valor">' + e.bono + '</span></div>' +
        '<div class="estratega-ejemplo">Ej: "' + e.ejemplo + '"</div>' +
        '</div>'
    ).join('');
};

window.tutorialSimularCarrera = function() {
    const tutorialData = window.tutorialData || {};
    const pronosticosSeleccionados = tutorialData.pronosticosSeleccionados || {};
    
    const resultadosReales = {
        bandera: 'si',
        abandonos: '3-5',
        diferencia: '1-5s'
    };
    
    let aciertos = 0;
    let detalles = [];
    
    const banderaCorrecto = pronosticosSeleccionados.bandera === resultadosReales.bandera;
    detalles.push('<div class="resultado-item ' + (banderaCorrecto ? 'correcto' : 'incorrecto') + '">' + (banderaCorrecto ? '✅' : '❌') + ' Bandera amarilla: ' + (pronosticosSeleccionados.bandera === 'si' ? 'SÍ' : 'NO') + ' (' + (banderaCorrecto ? 'correcto' : 'incorrecto, fue ' + (resultadosReales.bandera === 'si' ? 'SÍ' : 'NO')) + ')</div>');
    if (banderaCorrecto) aciertos++;
    
    const abandonosCorrecto = pronosticosSeleccionados.abandonos === resultadosReales.abandonos;
    detalles.push('<div class="resultado-item ' + (abandonosCorrecto ? 'correcto' : 'incorrecto') + '">' + (abandonosCorrecto ? '✅' : '❌') + ' Abandonos: ' + pronosticosSeleccionados.abandonos + ' (' + (abandonosCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.abandonos) + ')</div>');
    if (abandonosCorrecto) aciertos++;
    
    const diferenciaCorrecto = pronosticosSeleccionados.diferencia === resultadosReales.diferencia;
    detalles.push('<div class="resultado-item ' + (diferenciaCorrecto ? 'correcto' : 'incorrecto') + '">' + (diferenciaCorrecto ? '✅' : '❌') + ' Diferencia 1º-2º: ' + pronosticosSeleccionados.diferencia + ' (' + (diferenciaCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.diferencia) + ')</div>');
    if (diferenciaCorrecto) aciertos++;
    
    tutorialData.aciertosPronosticos = aciertos;
    tutorialData.totalPronosticos = 3;
    tutorialData.resultadosReales = resultadosReales;
    tutorialData.puntosBaseCalculados = (banderaCorrecto ? 150 : 0) + (abandonosCorrecto ? 180 : 0) + (diferenciaCorrecto ? 200 : 0);
    
    const resultados = document.getElementById('resultado-simulacion');
    if (resultados) {
        resultados.innerHTML = '<div class="resultado-simulado"><h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>' + detalles.join('') + '<div class="resumen-simulacion"><strong>' + aciertos + ' de 3 pronósticos acertados (' + Math.round(aciertos/3*100) + '%)</strong></div><div class="puntos-simulacion">Puntos base obtenidos: <strong>' + tutorialData.puntosBaseCalculados + ' pts</strong></div></div>';
        resultados.style.display = 'block';
    }
    
    const notifCarrera = document.createElement('div');
    notifCarrera.className = 'notification info';
    notifCarrera.innerHTML = '<div class="notification-content"><i class="fas fa-flag-checkered"></i><span>🏁 Carrera simulada - ' + aciertos + ' de 3 aciertos (' + Math.round(aciertos/3*100) + '%)</span></div>';
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
    
    document.getElementById('btn-tutorial-next-large').classList.remove('hidden');
};

window.tutorialIrSeccion = function(seccion) {
    alert('Esta función te llevaría a la sección: ' + seccion.toUpperCase() + '\n\nEn el juego real, puedes navegar entre secciones usando el menú superior.');
};

window.tutorialEjecutarPronostico = function() {
    if (!window.tutorialData || !window.tutorialData.pronosticosSeleccionados) {
        alert("No has seleccionado ningún pronóstico");
        return;
    }
    
    const selecciones = window.tutorialData.pronosticosSeleccionados;
    const count = Object.keys(selecciones).length;
    
    if (count < 3) {
        alert('Has seleccionado ' + count + ' de 3 pronósticos. Necesitas seleccionar uno de cada categoría.');
        return;
    }
    
    const resultadosReales = {
        bandera: 'si',
        abandonos: '3-5',
        diferencia: '1-5s'
    };
    
    let aciertos = 0;
    const detalles = [];
    
    if (selecciones.bandera === resultadosReales.bandera) {
        aciertos++;
        detalles.push('✅ Bandera amarilla: SÍ (acertaste)');
    } else {
        detalles.push('❌ Bandera amarilla: ' + (selecciones.bandera === 'si' ? 'SÍ' : 'NO') + ' (era ' + (resultadosReales.bandera === 'si' ? 'SÍ' : 'NO') + ')');
    }
    
    if (selecciones.abandonos === resultadosReales.abandonos) {
        aciertos++;
        detalles.push('✅ Abandonos: 3-5 (acertaste)');
    } else {
        detalles.push('❌ Abandonos: ' + selecciones.abandonos + ' (era ' + resultadosReales.abandonos + ')');
    }
    
    if (selecciones.diferencia === resultadosReales.diferencia) {
        aciertos++;
        detalles.push('✅ Diferencia: 1-5s (acertaste)');
    } else {
        detalles.push('❌ Diferencia: ' + selecciones.diferencia + ' (era ' + resultadosReales.diferencia + ')');
    }
    
    const resultados = document.getElementById('resultado-simulacion');
    if (resultados) {
        resultados.innerHTML = '<div class="resultado-simulado"><h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>' + detalles.map(d => '<div class="resultado-item">' + d + '</div>').join('') + '<div class="resumen-simulacion"><strong>' + aciertos + ' de 3 pronósticos acertados (' + Math.round((aciertos/3)*100) + '%)</strong></div></div>';
        resultados.style.display = 'block';
    }
    
    window.tutorialData.aciertosPronosticos = aciertos;
    window.tutorialData.totalPronosticos = 3;
    
    const notificacion = document.createElement('div');
    notificacion.className = aciertos >= 2 ? 'notification success' : 'notification warning';
    notificacion.innerHTML = '<div class="notification-content"><i class="fas fa-' + (aciertos >= 2 ? 'trophy' : 'chart-line') + '"></i><span>' + aciertos + ' de 3 pronósticos acertados</span></div>';
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
    
    setTimeout(() => {
        if (window.tutorialManager) {
            window.tutorialManager.tutorialStep++;
            window.tutorialManager.mostrarTutorialStep();
        }
    }, 2000);
};

window.mostrarInfoEstratega = function(index) {
    const estratega = window.f1Manager.pilotos[index];
    if (estratega) {
        alert('📊 Estratega: ' + estratega.nombre + '\n💰 Salario: €' + estratega.salario + '/mes\n🎯 Función: ' + estratega.especialidad + '\n✨ Bono: +' + estratega.bonificacion_valor + '% puntos');
    }
};

window.contratarNuevoEstratega = function(hueco) {
    if (window.tabManager) {
        window.tabManager.switchTab('equipo');
    } else {
        alert('Contratar nuevo estratega para hueco ' + (hueco + 1) + '\nRedirigiendo al mercado...');
    }
};

window.recogerPiezaTutorial = async function(fabricacionId, area) {
    try {
        await window.supabase
            .from('fabricacion_actual')
            .update({ completada: true })
            .eq('id', fabricacionId);
        
        const { error: errorAlmacen } = await window.supabase
            .from('almacen_piezas')
            .insert([{
                escuderia_id: window.f1Manager.escuderia.id,
                area: area,
                nivel: 1,
                puntos_base: 15,
                calidad: 'Básica',
                equipada: false,
                fabricada_en: new Date().toISOString(),
                creada_en: new Date().toISOString()
            }]);
        
        if (errorAlmacen) throw errorAlmacen;
        
        const notificacion = document.createElement('div');
        notificacion.className = 'notification success';
        notificacion.innerHTML = '<div class="notification-content"><i class="fas fa-box-open"></i><span>✅ Pieza añadida al almacén</span></div>';
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
        
        if (window.f1Manager) {
            window.f1Manager.updateProductionMonitor();
        }
        
    } catch (error) {
        console.error("Error recogiendo pieza:", error);
        alert("Error recogiendo pieza: " + error.message);
    }
};

window.addEventListener('auth-completado', async (evento) => {
    console.log('✅ Evento auth-completado recibido en main.js');
    
    const { user, escuderia, supabase } = evento.detail || window.authData || {};
    
    if (user && escuderia) {
        console.log('🎮 Creando F1Manager con datos de autenticación...');
        
        window.f1Manager = new F1Manager(user, escuderia, supabase);
        if (window.MercadoManager) {
            console.log('🔧 Inicializando mercadoManager con escudería:', escuderia.id);
            if (!window.mercadoManager) {
                window.mercadoManager = new window.MercadoManager();
            }
            // INICIALIZAR mercadoManager CON LA ESCUDERÍA
            await window.mercadoManager.inicializar(escuderia);
            console.log('✅ mercadoManager inicializado');
        } else {
            console.error('❌ MercadoManager no está disponible');
        }        
        if (!escuderia.tutorial_completado) {
            console.log('📚 Mostrando tutorial...');
            window.tutorialManager = new TutorialManager(window.f1Manager);
            window.tutorialManager.iniciar();
        } else {
            console.log('✅ Tutorial ya completado, cargando dashboard...');
            await window.f1Manager.cargarDashboardCompleto();
        }
    } 
});

setTimeout(() => {
    if (window.authData && window.authData.user && window.authData.escuderia) {
        console.log('📦 Usando datos de authData almacenados');
        const evento = new CustomEvent('auth-completado', { detail: window.authData });
        window.dispatchEvent(evento);
    }
}, 1000);

(function() {
    window.tutorialData = {
        estrategaSeleccionado: null,
        estrategaContratado: false,
        areaSeleccionada: null,
        piezaFabricando: false,
        pronosticoSeleccionado: null
    };
    
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
    
    window.mostrarModalContratacion = function(huecoNumero) {
        alert('Mostrar modal para contratar estratega en hueco ' + huecoNumero);
    };
    
    window.despedirEstratega = function(estrategaId) {
        if (confirm('¿Estás seguro de despedir a este estratega?')) {
            console.log('Despedir estratega ID:', estrategaId);
            alert('Estratega despedido. Hueco disponible para nuevo contrato.');
            
            if (window.f1Manager) {
                setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
            }
        }
    };
    
    window.cerrarSesion = function() {
        if (window.authManager) {
            window.authManager.cerrarSesion();
        }
    };
    
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
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('equipo');
        }
    };
    
    window.iniciarFabricacionTaller = function(areaId, nivel) {
        if (window.f1Manager && window.f1Manager.iniciarFabricacionTaller) {
            window.f1Manager.iniciarFabricacionTaller(areaId, nivel);
        } else {
            alert('Error: Sistema de fabricación no disponible');
        }
    };
    
    window.mostrarModalContratacion = function(huecoNumero) {
        const modalHTML = '<div id="modal-contratacion" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;">' +
            '<div style="background: #1a1a2e; padding: 20px; border-radius: 10px; border: 2px solid #00d2be; max-width: 400px; width: 90%;">' +
            '<h3 style="color: #00d2be; margin-top: 0;">Contratar Estratega</h3>' +
            '<p>Selecciona un estratega para el hueco ' + huecoNumero + ':</p>' +
            '<div style="margin: 20px 0;">' +
            '<button onclick="contratarEstrategaFicticio(1, ' + huecoNumero + ')" style="width: 100%; padding: 10px; margin: 5px 0; background: rgba(0,210,190,0.1); border: 1px solid #00d2be; color: white; border-radius: 5px; cursor: pointer;">🕐 Analista de Tiempos (+15%)</button>' +
            '<button onclick="contratarEstrategaFicticio(2, ' + huecoNumero + ')" style="width: 100%; padding: 10px; margin: 5px 0; background: rgba(0,210,190,0.1); border: 1px solid #00d2be; color: white; border-radius: 5px; cursor: pointer;">🌧️ Meteorólogo (+20%)</button>' +
            '<button onclick="contratarEstrategaFicticio(3, ' + huecoNumero + ')" style="width: 100%; padding: 10px; margin: 5px 0; background: rgba(0,210,190,0.1); border: 1px solid #00d2be; color: white; border-radius: 5px; cursor: pointer;">🔧 Experto en Fiabilidad (+18%)</button>' +
            '</div>' +
            '<div style="display: flex; gap: 10px;">' +
            '<button onclick="document.getElementById(\'modal-contratacion\').remove()" style="flex: 1; padding: 10px; background: transparent; border: 1px solid #666; color: #aaa; border-radius: 5px; cursor: pointer;">Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };
    
    window.contratarEstrategaFicticio = function(tipo, hueco) {
        const estrategas = {
            1: { nombre: "Analista Tiempos", especialidad: "Análisis", bono: 15 },
            2: { nombre: "Meteorólogo", especialidad: "Clima", bono: 20 },
            3: { nombre: "Experto Fiabilidad", especialidad: "Técnica", bono: 18 }
        };
        
        alert('Contratado: ' + estrategas[tipo].nombre + ' en hueco ' + hueco);
        document.getElementById('modal-contratacion').remove();
        
        if (window.f1Manager) {
            setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
        }
    };
    
    window.contratarEstrategaDesdeTutorial = function() {
        if (window.tabManager) {
            window.tabManager.switchTab('equipo');
        } else {
            window.mostrarModalContratacion(1);
        }
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎮 Configurando eventos del countdown...');
        
        const btnPronostico = document.getElementById('btn-enviar-pronostico');
        const btnCalendario = document.getElementById('btn-calendario');
        
        if (btnPronostico) {
            console.log('✅ Botón pronóstico encontrado');
            btnPronostico.addEventListener('click', () => {
                console.log('📤 Click en Enviar Pronóstico');
                
                const tabPronosticos = document.querySelector('[data-tab="pronosticos"]');
                if (tabPronosticos) {
                    tabPronosticos.click();
                    console.log('📍 Cambiando a pestaña pronósticos');
                } else {
                    const tabApuestas = document.querySelector('[data-tab="apuestas"]');
                    if (tabApuestas) {
                        tabApuestas.click();
                    } else {
                        alert('🚀 Redirigiendo a pronósticos...\n\n(Para probar: ve a la pestaña "PRONÓSTICOS" en el menú)');
                    }
                }
            });
        }
        
        if (btnCalendario) {
            console.log('✅ Botón calendario encontrado');
            btnCalendario.addEventListener('click', () => {
                console.log('📅 Click en Calendario');
                alert('📅 CALENDARIO F1 2026\n\nFuncionalidad en desarrollo...\n\nPróximamente podrás:\n• Ver todas las carreras\n• Filtrar por temporada\n• Ver resultados pasados\n• Planificar estrategias');
            });
        }
    });
    
    window.recogerPiezaYActualizarAlmacen = async function(fabricacionId) {
        try {
            console.log("Recogiendo pieza:", fabricacionId);
            
            const { data: fabricacion, error: fetchError } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            const areaId = fabricacion.area.toLowerCase().replace(/ /g, '_');
            
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
            
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);
            
            if (updateError) throw updateError;
            
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification('✅ ' + fabricacion.area + ' añadida al almacén', 'success');
            }
            
            if (window.f1Manager && window.f1Manager.updateProductionMonitor) {
                setTimeout(() => window.f1Manager.updateProductionMonitor(), 500);
            }
            
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                if (window.tabManager.loadAlmacenPiezas) {
                    setTimeout(() => window.tabManager.loadAlmacenPiezas(), 1000);
                }
            } else {
                window.almacenNecesitaActualizar = true;
            }
            
        } catch (error) {
            console.error("Error recogiendo pieza:", error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification("❌ Error al recoger pieza", 'error');
            }
        }
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
    // Función para redirigir al almacén desde las piezas montadas
    window.irAlAlmacenDesdePiezas = function() {
        console.log('📦 Redirigiendo al almacén desde piezas montadas...');
        
        // Método 1: Usar el tabManager si existe
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('almacen');
            console.log('✅ Redirigido usando tabManager');
            return;
        }
        
        // Método 2: Simular click en la pestaña de almacén
        const tabAlmacen = document.querySelector('[data-tab="almacen"]');
        if (tabAlmacen) {
            tabAlmacen.click();
            console.log('✅ Redirigido haciendo click en pestaña');
            return;
        }
        
        // Método 3: Alternativa directa
        const almacenTab = document.getElementById('tab-almacen');
        if (almacenTab) {
            // Ocultar todas las pestañas
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Desactivar todos los botones
            document.querySelectorAll('.tab-btn-compacto').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Activar pestaña de almacén
            almacenTab.classList.add('active');
            
            // Activar botón correspondiente
            const btnAlmacen = document.querySelector('[data-tab="almacen"]');
            if (btnAlmacen) {
                btnAlmacen.classList.add('active');
            }
            
            console.log('✅ Redirigido activando pestaña manualmente');
            
            // Si hay cargador de almacén, ejecutarlo
            setTimeout(() => {
                if (window.tabManager && window.tabManager.loadAlmacenPiezas) {
                    window.tabManager.loadAlmacenPiezas();
                } else if (window.cargarContenidoAlmacen) {
                    window.cargarContenidoAlmacen();
                }
            }, 100);
        } else {
            console.warn('⚠️ No se encontró la pestaña de almacén');
            alert('Redirigiendo al almacén...');
        }
    };
    
    // También puedes añadir una versión alternativa por si acaso
    window.goToAlmacen = window.irAlAlmacenDesdePiezas;    
})();
