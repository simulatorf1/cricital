// ========================
// FABRICACION.JS - VERSIÓN CORREGIDA
// ========================
console.log('🔧 Sistema de fabricación CORREGIDO cargado');

class FabricacionManager {
    constructor() {
        this.escuderiaId = null;
        this.produccionesActivas = [];
        this.timers = {};
    }

    async inicializar(escuderiaId) {
        console.log('🔧 Inicializando fabricación para escudería:', escuderiaId);
        this.escuderiaId = escuderiaId;
        await this.cargarProduccionesActivas();
        return true;
    }

    async cargarProduccionesActivas() {
        try {
            const { data, error } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .eq('completada', false)
                .order('tiempo_inicio', { ascending: true });

            if (error) throw error;

            this.produccionesActivas = data || [];
            console.log(`📊 ${this.produccionesActivas.length} producciones activas`);

            // Iniciar timers para cada producción
            this.produccionesActivas.forEach(prod => {
                this.iniciarTimerProduccion(prod.id);
            });

            return this.produccionesActivas;

        } catch (error) {
            console.error('❌ Error cargando producciones:', error);
            return [];
        }
    }

    iniciarTimerProduccion(produccionId) {
        // Si ya existe timer, limpiarlo
        if (this.timers[produccionId]) {
            clearInterval(this.timers[produccionId]);
        }

        this.timers[produccionId] = setInterval(() => {
            this.verificarProduccion(produccionId);
        }, 1000);
    }

    async verificarProduccion(produccionId) {
        try {
            const produccion = this.produccionesActivas.find(p => p.id === produccionId);
            if (!produccion) return;

            const ahora = new Date();
            const fin = new Date(produccion.tiempo_fin);

            if (ahora >= fin) {
                console.log(`✅ Producción ${produccionId} completada`);
                
                // Detener timer
                clearInterval(this.timers[produccionId]);
                delete this.timers[produccionId];

                // Actualizar UI
                this.actualizarUIProduccion();
            }

        } catch (error) {
            console.error('❌ Error verificando producción:', error);
        }
    }

    async iniciarFabricacion(areaId) {
        console.log('🔨 Iniciando fabricación para área:', areaId);
        
        if (!this.escuderiaId) {
            console.error('❌ No hay escudería ID');
            return false;
        }

        try {
            // 1. Verificar si ya hay fabricación para esta área
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (!area) {
                console.error('❌ Área no encontrada');
                return false;
            }

            // 2. Crear nueva fabricación (30 segundos para pruebas)
            const tiempoInicio = new Date();
            const tiempoFin = new Date();
            tiempoFin.setSeconds(tiempoFin.getSeconds() + 30); // 30 segundos para pruebas

            const { data: nuevaFabricacion, error: insertError } = await supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: this.escuderiaId,
                    area: area.name,
                    nivel: 1,
                    tiempo_inicio: tiempoInicio.toISOString(),
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: 10000.00,
                    creada_en: new Date().toISOString()
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            console.log('✅ Fabricación creada:', nuevaFabricacion);

            // 3. Añadir a lista local
            this.produccionesActivas.push(nuevaFabricacion);

            // 4. Iniciar timer
            this.iniciarTimerProduccion(nuevaFabricacion.id);

            // 5. Actualizar UI
            this.actualizarUIProduccion();

            return true;

        } catch (error) {
            console.error('❌ Error iniciando fabricación:', error);
            return false;
        }
    }

    async recogerPieza(fabricacionId) {
        try {
            // 1. Buscar la fabricación
            const { data: fabricacion, error: fabError } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fabError || !fabricacion) throw new Error('Fabricación no encontrada');

            // 2. Crear pieza en almacén (usando la tabla correcta)
            const { data: nuevaPieza, error: piezaError } = await supabase
                .from('piezas_almacen')  // ← TABLA CORRECTA
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: fabricacion.area,
                    nivel: fabricacion.nivel,
                    estado: 'disponible',
                    puntos_base: 10,
                    fabricada_en: new Date().toISOString()
                }])
                .select()
                .single();

            if (piezaError) throw piezaError;

            // 3. Marcar fabricación como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ 
                    completada: true,
                    pieza_id: nuevaPieza.id 
                })
                .eq('id', fabricacionId);

            if (updateError) throw updateError;

            // 4. Actualizar lista local
            this.produccionesActivas = this.produccionesActivas.filter(f => f.id !== fabricacionId);

            // 5. Mostrar notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`✅ Pieza de ${fabricacion.area} recogida`, 'success');
            }

            // 6. Actualizar almacén si está activo
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                window.tabManager.loadAlmacenPiezas();
            }

            // 7. Actualizar UI
            this.actualizarUIProduccion();

            return true;

        } catch (error) {
            console.error('❌ Error recogiendo pieza:', error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification('❌ Error al recoger pieza', 'error');
            }
            return false;
        }
    }

    async actualizarProgresoCoche(areaNombre) {
        try {
            // Convertir nombre de área a ID
            const area = window.CAR_AREAS.find(a => a.name === areaNombre);
            if (!area) return;

            const areaId = area.id;

            // Buscar stats actuales
            const { data: stats, error: fetchError } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .single();

            let currentStats = stats;
            
            if (!currentStats) {
                // Crear stats iniciales
                const { data: newStats, error: createError } = await supabase
                    .from('coches_stats')
                    .insert([{
                        escuderia_id: this.escuderiaId,
                        [`${areaId}_nivel`]: 0,
                        [`${areaId}_progreso`]: 1
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                currentStats = newStats;
            } else {
                // Actualizar progreso existente
                const currentProgress = currentStats[`${areaId}_progreso`] || 0;
                const currentLevel = currentStats[`${areaId}_nivel`] || 0;
                
                let newProgress = currentProgress + 1;
                let newLevel = currentLevel;

                // Verificar si sube de nivel
                if (newProgress >= 20) {
                    newProgress = 0;
                    newLevel = currentLevel + 1;
                    
                    if (newLevel > 10) {
                        newLevel = 10;
                    }
                }

                const { error: updateError } = await supabase
                    .from('coches_stats')
                    .update({
                        [`${areaId}_progreso`]: newProgress,
                        [`${areaId}_nivel`]: newLevel,
                        actualizado_en: new Date().toISOString()
                    })
                    .eq('id', currentStats.id);

                if (updateError) throw updateError;
            }

            // Actualizar en main.js si existe
            if (window.f1Manager && window.f1Manager.loadCarStatus) {
                window.f1Manager.loadCarStatus();
            }

        } catch (error) {
            console.error('❌ Error actualizando progreso del coche:', error);
        }
    }

    actualizarUIProduccion() {
        const container = document.getElementById('produccion-actual');
        if (!container) return;

        if (this.produccionesActivas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-industry"></i>
                    <p>No hay producción en curso</p>
                    <button class="btn-primary" id="iniciar-fabricacion-btn">
                        <i class="fas fa-hammer"></i> Iniciar primera fabricación
                    </button>
                </div>
            `;
            return;
        }

        let html = `
            <div class="produccion-header">
                <h3><i class="fas fa-industry"></i> Fabricaciones en curso</h3>
                <span class="badge">${this.produccionesActivas.length} activas</span>
            </div>
            <div class="fabricaciones-lista">
        `;

        this.produccionesActivas.forEach(fab => {
            const ahora = new Date();
            const fin = new Date(fab.tiempo_fin);
            const inicio = new Date(fab.tiempo_inicio);
            
            const tiempoTotal = fin - inicio;
            const tiempoTranscurrido = ahora - inicio;
            const progreso = Math.min(100, (tiempoTranscurrido / tiempoTotal) * 100);
            const tiempoRestante = fin - ahora;
            const lista = ahora >= fin;

            html += `
                <div class="fabricacion-item ${lista ? 'lista' : ''}">
                    <div class="fabricacion-info">
                        <div class="fab-area">
                            <i class="fas fa-cog"></i>
                            <span>${fab.area} Nivel ${fab.nivel}</span>
                        </div>
                        <div class="fab-estado">
                            <span class="estado-badge ${lista ? 'lista' : 'fabricando'}">
                                ${lista ? '✅ LISTA' : '🔄 FABRICANDO'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="fab-progreso">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${progreso}%"></div>
                        </div>
                        <div class="fab-tiempo">
                            <i class="far fa-clock"></i>
                            <span>${lista ? '¡Lista para recoger!' : `Tiempo restante: ${this.formatearTiempo(tiempoRestante)}`}</span>
                        </div>
                    </div>
                    
                    <div class="fab-acciones">
                        <button class="btn-small btn-success" onclick="window.fabricacionManager.recogerPieza('${fab.id}')" ${!lista ? 'disabled' : ''}>
                            <i class="fas fa-box-open"></i> Recoger Pieza
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="fabricacion-footer">
                <button class="btn-secondary" onclick="window.f1Manager.irAlTaller()">
                    <i class="fas fa-plus"></i> Iniciar nueva fabricación
                </button>
            </div>
        `;

        container.innerHTML = html;
    }

    formatearTiempo(milisegundos) {
        const segundos = Math.floor(milisegundos / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        
        if (horas > 0) {
            return `${horas}h ${minutos % 60}m`;
        } else if (minutos > 0) {
            return `${minutos}m ${segundos % 60}s`;
        } else {
            return `${segundos}s`;
        }
    }

    getProduccionesEnCurso() {
        return this.produccionesActivas;
    }
}

// Inicializar globalmente
window.FabricacionManager = FabricacionManager;

// NO crear instancia aquí - main.js lo hará después
console.log('✅ Clase FabricacionManager registrada');

// Crear instancia cuando se solicite
window.crearFabricacionManager = function() {
    if (!window.fabricacionManager) {
        window.fabricacionManager = new FabricacionManager();
        console.log('✅ Instancia de FabricacionManager creada');
    }
    return window.fabricacionManager;
};
