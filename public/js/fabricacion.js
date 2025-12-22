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
            // 1. Verificar fondos disponibles
            const costoFabricacion = 10000; // €10,000
            
            // Obtener escudería actual
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

            // 5. CORREGIR AQUÍ: Calcular tiempos correctamente
            const tiempoInicio = new Date();
            const tiempoFin = new Date(tiempoInicio.getTime() + (120 * 1000)); // 2 minutos
            
            console.log('⏰ Tiempos calculados:');
            console.log('Inicio:', tiempoInicio.toISOString());
            console.log('Fin:', tiempoFin.toISOString());
            console.log('Duración:', (tiempoFin - tiempoInicio) / 1000, 'segundos');

            // 6. Crear nueva fabricación
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

            if (insertError) {
                console.error('❌ Error insertando fabricación:', insertError);
                throw insertError;
            }

            console.log('✅ Fabricación creada:', nuevaFabricacion);

            // 7. Añadir a lista local
            this.produccionesActivas.push(nuevaFabricacion);

            // 8. Iniciar timer
            this.iniciarTimerProduccion(nuevaFabricacion.id);

            // 9. Actualizar UI
            this.actualizarUIProduccion();

            // 10. Mostrar notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`💰 -€${costoFabricacion.toLocaleString()} por fabricación de ${area.name}`, 'info');
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
                return false;
            }

            // 3. CONVERTIR el nombre del área al ID correcto
            let areaId = null;
            
            // Buscar en CAR_AREAS qué ID corresponde a este nombre
            const areaConfig = window.CAR_AREAS.find(a => a.name === fabricacion.area);
            
            if (areaConfig) {
                areaId = areaConfig.id; // Ej: 'suelo', 'motor', etc.
                console.log(`🗺️ Conversión área: "${fabricacion.area}" -> "${areaId}"`);
            } else {
                // Fallback: intentar extraer el ID del nombre
                console.warn(`⚠️ Área no encontrada en CAR_AREAS: "${fabricacion.area}"`);
                
                // Mapeo manual de emergencia
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
                console.log(`🔄 Usando mapeo de emergencia: "${fabricacion.area}" -> "${areaId}"`);
            }

            // 4. Crear pieza en almacén con el ID CORRECTO
            const { error: piezaError } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: areaId,  // <-- ¡USAR EL ID, NO EL NOMBRE!
                    nivel: fabricacion.nivel,
                    estado: 'disponible',
                    puntos_base: 10,
                    fabricada_en: new Date().toISOString()
                }]);

            if (piezaError) {
                console.error('❌ Error insertando pieza:', piezaError);
                throw piezaError;
            }

            // 5. Marcar fabricación como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);

            if (updateError) throw updateError;

            // 6. Actualizar progreso del coche (pasar el NOMBRE, no el ID)
            await this.actualizarProgresoCoche(fabricacion.area);

            // 7. Remover de lista local
            this.produccionesActivas = this.produccionesActivas.filter(f => f.id !== fabricacionId);

            // 8. Limpiar timer
            if (this.timers[fabricacionId]) {
                clearInterval(this.timers[fabricacionId]);
                delete this.timers[fabricacionId];
            }

            // 9. Actualizar UI
            this.actualizarUIProduccion();

            console.log(`✅ Pieza "${areaId}" recogida y almacenada`);
            
            // 10. Mostrar notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`✅ Pieza de ${fabricacion.area} recogida`, 'success');
            }
            
            return true;

        } catch (error) {
            console.error('❌ Error recogiendo pieza:', error);
            
            // Mostrar error al usuario
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification('❌ Error al recoger la pieza', 'error');
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
                    <p class="small-text">Ve al Taller para iniciar fabricaciones</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="produccion-header">
                <h3><i class="fas fa-industry"></i> Producción en curso</h3>
                <span class="badge">${this.produccionesActivas.length} activa(s)</span>
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
            const minutosRestantes = Math.max(0, Math.floor(tiempoRestante / 60000));
            const segundosRestantes = Math.max(0, Math.floor((tiempoRestante % 60000) / 1000));

            html += `
                <div class="fabricacion-item ${lista ? 'lista' : 'fabricando'}">
                    <div class="fabricacion-info">
                        <div class="fab-area">
                            <i class="fas fa-cog"></i>
                            <span>${fab.area} • Nivel ${fab.nivel}</span>
                        </div>
                        <div class="fab-estado">
                            <span class="estado-badge ${lista ? 'lista' : 'fabricando'}">
                                ${lista ? '✅ LISTA' : '⏳ ' + minutosRestantes.toString().padStart(2, '0') + ':' + segundosRestantes.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                    
                    <div class="fab-progreso">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${progreso}%"></div>
                        </div>
                        <div class="fab-tiempo">
                            <i class="far fa-clock"></i>
                            <span>${lista ? '¡Lista para recoger!' : `Listo en: ${minutosRestantes}m ${segundosRestantes}s`}</span>
                        </div>
                    </div>
                    
                    ${lista ? `
                    <div class="fab-acciones">
                        <button class="btn-recoger-pieza" onclick="window.fabricacionManager.recogerPieza('${fab.id}')">
                            <i class="fas fa-box-open"></i> Recoger Pieza
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        });

        html += `</div>`; // Cerrar fabricaciones-lista

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

    // Método para cancelar fabricación (si es necesario)
    async cancelarFabricacion(fabricacionId) {
        try {
            // Eliminar de la base de datos
            const { error } = await supabase
                .from('fabricacion_actual')
                .delete()
                .eq('id', fabricacionId);

            if (error) throw error;

            // Remover de lista local
            this.produccionesActivas = this.produccionesActivas.filter(f => f.id !== fabricacionId);

            // Limpiar timer
            if (this.timers[fabricacionId]) {
                clearInterval(this.timers[fabricacionId]);
                delete this.timers[fabricacionId];
            }

            // Actualizar UI
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

// ========================
// GARANTIZAR QUE EL MANAGER EXISTE
// ========================

// 1. Función para obtener o crear el manager
window.getFabricacionManager = function() {
    if (!window.fabricacionManager) {
        console.log('🔧 Creando fabricacionManager...');
        window.fabricacionManager = new FabricacionManager();
        
        // Si ya tenemos escudería, inicializamos
        if (window.f1Manager && window.f1Manager.escuderia) {
            window.fabricacionManager.inicializar(window.f1Manager.escuderia.id);
        }
    }
    return window.fabricacionManager;
};

// 2. Crear alias para compatibilidad con los botones existentes
window.ensureFabricacionManager = function() {
    const manager = window.getFabricacionManager();
    
    // Crear alias para los botones que usan nombres incorrectos
    if (!manager.collectPiece) {
        manager.collectPiece = manager.recogerPieza.bind(manager);
        console.log('✅ Alias creado: collectPiece -> recogerPieza');
    }
    
    if (!manager.recogerPieza) {
        console.error('❌ ERROR CRÍTICO: recogerPieza no existe en el manager');
        console.log('Métodos disponibles:', Object.keys(manager));
    }
    
    return manager;
};

// 3. Verificar periódicamente que el manager está listo
setInterval(() => {
    if (window.fabricacionManager && window.fabricacionManager.recogerPieza) {
        console.log('✅ fabricacionManager listo');
    } else if (window.FabricacionManager) {
        // Si la clase existe pero no la instancia, crearla
        window.ensureFabricacionManager();
    }
}, 2000);

console.log('🛡️ Sistema de garantía de fabricacionManager activado');
