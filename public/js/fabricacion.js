// ========================
// FABRICACION.JS - VERSIÓN DEFINITIVA
// ========================
console.log('🔧 Sistema de fabricación DEFINITIVO cargado');

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
            console.log(`📊 ${this.produccionesActivas.length} producciones activas cargadas`);

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
        if (this.timers[produccionId]) {
            clearInterval(this.timers[produccionId]);
        }
    
        this.timers[produccionId] = setInterval(() => {
            // 1. Primero verificar si terminó
            this.verificarProduccion(produccionId);
        
            // 2. Luego solo actualizar contador (NO toda la UI)
            this.actualizarUIProduccion(true); // true = solo contador
        }, 1000); // Cada 1 segundo para contador fluido
    }

    async verificarProduccion(produccionId) {
        try {
            const produccion = this.produccionesActivas.find(p => p.id === produccionId);
            if (!produccion) return;

            const ahora = new Date();
            const tiempoInicio = new Date(produccion.tiempo_inicio);
            const tiempoFin = new Date(produccion.tiempo_fin);
        
            const duracionTotal = tiempoFin - tiempoInicio;
            const tiempoTranscurrido = ahora - tiempoInicio;

            console.log('🔧 Verificación ajustada:', {
                horaFinBD: produccion.tiempo_fin,
                horaFinAjustada: tiempoFin.toISOString(),
                duracionTotal: duracionTotal/1000 + 's',
                tiempoTranscurrido: tiempoTranscurrido/1000 + 's',
                progreso: (tiempoTranscurrido/duracionTotal*100).toFixed(1) + '%'
            });
            
            if (tiempoTranscurrido >= duracionTotal) {
                console.log(`✅ Producción ${produccionId} COMPLETADA (con ajuste horario)`);
                
                clearInterval(this.timers[produccionId]);
                delete this.timers[produccionId];
                
                const { error } = await supabase
                    .from('fabricacion_actual')
                    .update({ completada: true })
                    .eq('id', produccionId);
                
                if (error) console.error('Error marcando como completada:', error);
                
                this.produccionesActivas = this.produccionesActivas.filter(p => p.id !== produccionId);
                
                await this.crearPiezaEnAlmacen(produccion);
                
                setTimeout(() => this.actualizarUIProduccion(), 1000);
            }

        } catch (error) {
            console.error('❌ Error verificando producción:', error);
        }
    }
    // Añade este método a la clase:
    async crearPiezaEnAlmacen(fabricacion) {
        try {
            // Tu lógica de conversión de área aquí...
            let areaId = 'motor'; // Simplificado
            
            const { error } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: areaId,
                    nivel: fabricacion.nivel,
                    estado: 'disponible',
                    puntos_base: 10,
                    fabricada_en: new Date().toISOString()
                }]);
            
            if (!error) {
                console.log(`📦 Pieza creada en almacén automáticamente`);
                if (window.f1Manager?.showNotification) {
                    window.f1Manager.showNotification(`📦 Pieza de ${fabricacion.area} enviada al almacén`, 'success');
                }
            }
        } catch (error) {
            console.error('Error creando pieza:', error);
        }
    }

    async iniciarFabricacion(areaId) {
        console.log('🔨 Iniciando fabricación para área:', areaId);
        
        if (!this.escuderiaId) {
            console.error('❌ No hay escudería ID');
            return false;
        }

        try {
            // 1. Verificar fondos disponibles
            const costoFabricacion = 10000;
            
            const { data: escuderia, error: escError } = await supabase
                .from('escuderias')
                .select('dinero')
                .eq('id', this.escuderiaId)
                .single();
                
            if (escError) throw escError;
            
            if (escuderia.dinero < costoFabricacion) {
                alert(`❌ Fondos insuficientes. Necesitas €${costoFabricacion.toLocaleString()}, tienes €${escuderia.dinero.toLocaleString()}`);
                return false;
            }
            
            // 2. Descontar dinero
            const nuevoDinero = escuderia.dinero - costoFabricacion;
            const { error: updateError } = await supabase
                .from('escuderias')
                .update({ dinero: nuevoDinero })
                .eq('id', this.escuderiaId);
                
            if (updateError) throw updateError;
            
            // 3. Actualizar en main.js si está disponible
            if (window.f1Manager && window.f1Manager.escuderia) {
                window.f1Manager.escuderia.dinero = nuevoDinero;
                window.f1Manager.updateEscuderiaMoney();
            }
            
            console.log(`💰 Descontados €${costoFabricacion.toLocaleString()}. Nuevo saldo: €${nuevoDinero.toLocaleString()}`);
            
            // 4. Obtener información del área
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (!area) {
                console.error('❌ Área no encontrada');
                return false;
            }

            // 5. Calcular tiempos
            const duracionSegundos = 120; // 2 minutos para pruebas
            const tiempoInicio = new Date();
            const tiempoFin = new Date(tiempoInicio.getTime() + (duracionSegundos * 1000));
            
            // DEBUG CRÍTICO: Verificar diferencia horaria
            console.log('🕒 DEBUG HORAS:');
            console.log('Hora local (navegador):', tiempoInicio.toISOString());
            console.log('Hora fin calculada:', tiempoFin.toISOString());
            console.log('Diferencia con ahora:', (tiempoFin - tiempoInicio) / 1000, 'segundos');

            // 6. Crear nueva fabricación en BD
            const { data: nuevaFabricacion, error: insertError } = await supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: this.escuderiaId,
                    area: area.name,
                    nivel: 1,
                    tiempo_inicio: tiempoInicio.toISOString(),
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: costoFabricacion,
                    creada_en: new Date().toISOString()
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            console.log('✅ Fabricación creada en BD:', nuevaFabricacion.id);

            // 7. VERIFICACIÓN CRÍTICA: Comparar horas
            console.log('🔍 VERIFICACIÓN CRÍTICA:');
            console.log('Hora inicio guardada:', nuevaFabricacion.tiempo_inicio);
            console.log('Hora fin guardada:', nuevaFabricacion.tiempo_fin);
            
            const inicioBD = new Date(nuevaFabricacion.tiempo_inicio);
            const finBD = new Date(nuevaFabricacion.tiempo_fin);
            const ahora = new Date();
            
            console.log('Diferencia inicioBD - ahora:', (inicioBD - ahora) / 1000, 'segundos');
            console.log('Diferencia finBD - ahora:', (finBD - ahora) / 1000, 'segundos');
            console.log('¿finBD > ahora?', finBD > ahora);

            // 8. Añadir a lista local CON LOS DATOS DE BD
            this.produccionesActivas.push(nuevaFabricacion);

            // 9. Iniciar timer
            this.iniciarTimerProduccion(nuevaFabricacion.id);

            // 10. Actualizar UI
            setTimeout(() => this.actualizarUIProduccion(), 100);

            // 11. Mostrar notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`🔨 Fabricación de ${area.name} iniciada (2 minutos)`, 'info');
            }
            
            return true;

        } catch (error) {
            console.error('❌ Error iniciando fabricación:', error);
            return false;
        }
    }
    async recogerPieza(fabricacionId) {
        try {
            // 1. Buscar la fabricación
            const fabricacion = this.produccionesActivas.find(f => f.id === fabricacionId);
            if (!fabricacion) {
                console.error('❌ Fabricación no encontrada');
                return false;
            }

            // 2. Verificar que está lista
            const ahora = new Date();
            const fin = new Date(fabricacion.tiempo_fin);
            if (ahora < fin) {
                console.error('❌ La pieza aún no está lista');
                alert('⏳ La pieza aún no está lista para recoger');
                return false;
            }

            // 3. Convertir nombre del área al ID correcto
            let areaId = null;
            const areaConfig = window.CAR_AREAS.find(a => a.name === fabricacion.area);
            
            if (areaConfig) {
                areaId = areaConfig.id;
            } else {
                // Mapeo manual
                const mapeoEmergencia = {
                    'Suelo y Difusor': 'suelo',
                    'Motor': 'motor',
                    'Alerón Delantero': 'aleron_delantero',
                    'Caja de Cambios': 'caja_cambios',
                    'Pontones': 'pontones',
                    'Suspensión': 'suspension',
                    'Alerón Trasero': 'aleron_trasero',
                    'Chasis': 'chasis',
                    'Frenos': 'frenos',
                    'Volante': 'volante',
                    'Electrónica': 'electronica'
                };
                areaId = mapeoEmergencia[fabricacion.area] || 'motor';
            }
            // ACTUALIZAR UI COMPLETA SOLO UNA VEZ
            this.actualizarUIProduccion(false);
            // 4. Crear pieza en almacén
            const { error: piezaError } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: areaId,
                    nivel: fabricacion.nivel,
                    estado: 'disponible',
                    puntos_base: 10,
                    fabricada_en: new Date().toISOString()
                }]);

            if (piezaError) throw piezaError;

            // 5. Marcar fabricación como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);

            if (updateError) throw updateError;

            // 6. Actualizar progreso del coche
            await this.actualizarProgresoCoche(fabricacion.area);

            // 7. Remover de lista local
            this.produccionesActivas = this.produccionesActivas.filter(f => f.id !== fabricacionId);

            // 8. Limpiar timer
            if (this.timers[fabricacionId]) {
                clearInterval(this.timers[fabricacionId]);
                delete this.timers[fabricacionId];
            }

            // 9. Actualizar UI
            setTimeout(() => this.actualizarUIProduccion(), 100);

            console.log(`✅ Pieza "${areaId}" recogida y almacenada`);
            
            // 10. Mostrar notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`✅ Pieza de ${fabricacion.area} recogida`, 'success');
            }
            
            return true;

        } catch (error) {
            console.error('❌ Error recogiendo pieza:', error);
            alert('Error al recoger la pieza');
            return false;
        }
    }

    async actualizarProgresoCoche(areaNombre) {
        try {
            const area = window.CAR_AREAS.find(a => a.name === areaNombre);
            if (!area) return;

            const areaId = area.id;

            const { data: stats, error: fetchError } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .single();

            let currentStats = stats;
            
            if (!currentStats) {
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
                const currentProgress = currentStats[`${areaId}_progreso`] || 0;
                const currentLevel = currentStats[`${areaId}_nivel`] || 0;
                
                let newProgress = currentProgress + 1;
                let newLevel = currentLevel;

                if (newProgress >= 20) {
                    newProgress = 0;
                    newLevel = currentLevel + 1;
                    if (newLevel > 10) newLevel = 10;
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

            if (window.f1Manager && window.f1Manager.loadCarStatus) {
                setTimeout(() => window.f1Manager.loadCarStatus(), 500);
            }

        } catch (error) {
            console.error('❌ Error actualizando progreso del coche:', error);
        }
    }

    actualizarUIProduccion(soloContador = false) {
        const container = document.getElementById('produccion-actual');
        if (!container) return;
        
        // Si no hay producciones, mostrar mensaje estático
        if (this.produccionesActivas.length === 0) {
            if (!soloContador) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-industry"></i>
                        <p>No hay producción en curso</p>
                        <p class="small-text">Ve al Taller para iniciar fabricaciones</p>
                    </div>
                `;
            }
            return;
        }
        
        // SOLO si no es soloContador, actualizar toda la UI
        if (!soloContador) {
            let html = `
                <div class="produccion-header">
                    <h3><i class="fas fa-industry"></i> Producción en curso</h3>
                    <span class="badge">${this.produccionesActivas.length} activa(s)</span>
                </div>
                <div class="fabricaciones-lista">
            `;
            
            this.produccionesActivas.forEach(fab => {
                html += this.generarHTMLFabricacion(fab);
            });
            
            html += `</div>`;
            container.innerHTML = html;
        } 
        // Si es soloContador, solo actualizar los tiempos
        else {
            this.actualizarContadoresTiempo();
        }
    }

    // NUEVA FUNCIÓN: Solo actualiza contadores
    actualizarContadoresTiempo() {
        this.produccionesActivas.forEach(fab => {
            const elemento = document.querySelector(`[data-fabricacion-id="${fab.id}"] .fab-tiempo`);
            if (elemento) {
                const ahora = new Date();
                const tiempoFin = new Date(fab.tiempo_fin);
                const tiempoRestante = Math.max(0, tiempoFin - ahora);
                
                if (tiempoRestante > 0) {
                    const minutos = Math.floor(tiempoRestante / 60000);
                    const segundos = Math.floor((tiempoRestante % 60000) / 1000);
                    elemento.textContent = `Listo en: ${minutos}m ${segundos}s`;
                } else {
                    elemento.textContent = '¡Lista para recoger!';
                }
            }
        });
    }

    // NUEVA FUNCIÓN: Generar HTML una sola vez
    generarHTMLFabricacion(fab) {
        const ahora = new Date();
        const tiempoFin = new Date(fab.tiempo_fin);
        const tiempoRestante = Math.max(0, tiempoFin - ahora);
        const lista = tiempoRestante <= 0;
        const minutos = Math.floor(tiempoRestante / 60000);
        const segundos = Math.floor((tiempoRestante % 60000) / 1000);
        
        return `
            <div class="fabricacion-item ${lista ? 'lista' : 'fabricando'}" data-fabricacion-id="${fab.id}">
                <div class="fabricacion-info">
                    <div class="fab-area">
                        <i class="fas fa-cog"></i>
                        <span>${fab.area} • Nivel ${fab.nivel}</span>
                    </div>
                    <div class="fab-estado">
                        <span class="estado-badge ${lista ? 'lista' : 'fabricando'}">
                            ${lista ? '✅ LISTA' : `⏳ ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`}
                        </span>
                    </div>
                </div>
                
                <div class="fab-progreso">
                    <div class="progress-bar-small">
                        <div class="progress-fill-small" 
                             style="width: ${Math.min(100, ((fab.duracionTotal - tiempoRestante) / fab.duracionTotal) * 100)}%">
                        </div>
                    </div>
                    <div class="fab-tiempo">
                        <i class="far fa-clock"></i>
                        <span>${lista ? '¡Lista para recoger!' : `Listo en: ${minutos}m ${segundos}s`}</span>
                    </div>
                </div>
                
                ${lista ? `
                <div class="fab-acciones">
                    <button class="btn-recoger-pieza" 
                            onclick="window.fabricacionManager.recogerPieza('${fab.id}')">
                        <i class="fas fa-box-open"></i> Recoger Pieza
                    </button>
                </div>
                ` : ''}
            </div>
        `;
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

    async cancelarFabricacion(fabricacionId) {
        try {
            const { error } = await supabase
                .from('fabricacion_actual')
                .delete()
                .eq('id', fabricacionId);

            if (error) throw error;

            this.produccionesActivas = this.produccionesActivas.filter(f => f.id !== fabricacionId);

            if (this.timers[fabricacionId]) {
                clearInterval(this.timers[fabricacionId]);
                delete this.timers[fabricacionId];
            }

            this.actualizarUIProduccion();

            console.log('✅ Fabricación cancelada');
            return true;

        } catch (error) {
            console.error('❌ Error cancelando fabricación:', error);
            return false;
        }
    }
}

// Inicializar globalmente
window.FabricacionManager = FabricacionManager;

// Crear instancia cuando se necesite
window.crearFabricacionManager = function() {
    if (!window.fabricacionManager) {
        window.fabricacionManager = new FabricacionManager();
        console.log('✅ Instancia de FabricacionManager creada');
    }
    return window.fabricacionManager;
};

console.log('✅ Clase FabricacionManager registrada');

// Función para obtener o crear el manager
window.getFabricacionManager = function() {
    if (!window.fabricacionManager) {
        window.fabricacionManager = new FabricacionManager();
        if (window.f1Manager && window.f1Manager.escuderia) {
            window.fabricacionManager.inicializar(window.f1Manager.escuderia.id);
        }
    }
    return window.fabricacionManager;
};

console.log('🔧 Sistema de fabricación listo');
