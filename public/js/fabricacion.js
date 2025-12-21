// ========================
// SISTEMA DE FABRICACIÓN CORREGIDO
// ========================
console.log('🔧 Sistema de fabricación cargado');


class FabricacionManager {
    constructor() {
        this.currentProduction = null; // Para compatibilidad
        this.produccionesEnCurso = []; // ← NUEVO: Lista de todas las fabricaciones
        this.productionTimer = null;
        this.productionUpdateInterval = null;
        this.escuderiaId = null;
    }

    // NUEVO método para manejar múltiples fabricaciones
    async cargarTodasFabricaciones() {
        try {
            const { data, error } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .eq('completada', false)
                .order('tiempo_inicio', { ascending: true });
            
            if (error) throw error;
            
            this.produccionesEnCurso = data || [];
            console.log(`📊 ${this.produccionesEnCurso.length} fabricaciones en curso`);
            
            // Iniciar timers para cada una
            this.produccionesEnCurso.forEach(fab => {
                this.iniciarTimerFabricacion(fab.id);
            });
            
            return this.produccionesEnCurso;
            
        } catch (error) {
            console.error('❌ Error cargando fabricaciones:', error);
            return [];
        }
    }

    // NUEVO método para iniciar timer individual
    iniciarTimerFabricacion(fabricacionId) {
        // Si ya hay un timer para esta fabricación, no crear otro
        if (this[`timer_${fabricacionId}`]) {
            clearInterval(this[`timer_${fabricacionId}`]);
        }
        
        this[`timer_${fabricacionId}`] = setInterval(() => {
            this.verificarFabricacion(fabricacionId);
        }, 1000); // Verificar cada segundo
    }

    // NUEVO método para verificar una fabricación específica
    async verificarFabricacion(fabricacionId) {
        try {
            const fabricacion = this.produccionesEnCurso.find(f => f.id === fabricacionId);
            if (!fabricacion) return;
            
            const ahora = new Date();
            const fin = new Date(fabricacion.tiempo_fin);
            
            if (ahora >= fin) {
                // La fabricación ha terminado
                console.log(`⏰ Fabricación ${fabricacionId} de ${fabricacion.area} terminada`);
                
                // Detener timer
                clearInterval(this[`timer_${fabricacionId}`]);
                delete this[`timer_${fabricacionId}`];
                
                // Mostrar notificación
                this.showNotificationGlobal(
                    `✅ ¡Pieza de ${fabricacion.area} lista para recoger!`,
                    'success'
                );
                
                // Actualizar UI si estamos en la pestaña taller
                this.actualizarUI();
            }
            
        } catch (error) {
            console.error('❌ Error verificando fabricación:', error);
        }
    }
    
    setupGlobalEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-recoger-pieza' || e.target.closest('#btn-recoger-pieza')) {
                this.collectPiece();
            }
        });
    }
    
    async checkCurrentProduction() {
        try {
            if (!this.escuderiaId) {
                console.log('⏳ Esperando escudería ID...');
                return;
            }
            
            const { data: production, error } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .eq('completada', false)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (production) {
                this.currentProduction = production;
                console.log('📦 Producción en curso:', production);
                this.startProductionTimer();
                this.updateProductionUI();
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    async startFabrication(areaId) {
        if (!this.escuderiaId) {
            console.error('❌ No hay escudería inicializada');
            return false;
        }
        
        try {
            // PRIMERO verifica si ya hay una fabricación en curso PARA ESTA MISMA ÁREA
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (!area) {
                console.error('❌ Área no encontrada:', areaId);
                return false;
            }
            
            const { data: existing, error: checkError } = await supabase
                .from('fabricacion_actual')
                .select('id, area')
                .eq('escuderia_id', this.escuderiaId)
                .eq('completada', false)
                .eq('area', area.name)  // ← SOLO verifica para esta área específica
                .maybeSingle();
            
            if (checkError) {
                console.error('❌ Error verificando fabricación existente:', checkError);
                return false;
            }
            
            if (existing) {
                console.log('⚠️ Ya hay una fabricación en curso para', area.name);
                this.showNotificationGlobal(`⚠️ Ya estás fabricando una pieza de ${area.name}`, 'warning');
                return false;
            }
            
            // Crea NUEVA fabricación
            const tiempoFin = new Date();
            tiempoFin.setSeconds(tiempoFin.getSeconds() + 30); // 30 segundos
            
            const { data: newFabricacion, error: insertError } = await supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: this.escuderiaId,
                    area: area.name,
                    nivel: 1,
                    tiempo_inicio: new Date().toISOString(),
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: 10000.00,
                    pieza_id: null,
                    creada_en: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (insertError) {
                console.error('❌ Error creando fabricación:', insertError);
                return false;
            }
            
            console.log('✅ Fabricación iniciada para', area.name, ':', newFabricacion);
            
            // Añadir a la lista de producciones en curso
            if (!this.produccionesEnCurso) {
                this.produccionesEnCurso = [];
            }
            this.produccionesEnCurso.push(newFabricacion);
            
            // Iniciar timer para esta fabricación específica
            this.iniciarTimerFabricacion(newFabricacion.id);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en startFabrication:', error);
            return false;
        }
    }
    
    startProductionTimer() {
        if (!this.currentProduction) return;
        
        if (this.productionUpdateInterval) {
            clearInterval(this.productionUpdateInterval);
        }
        
        this.updateProductionProgress();
        this.productionUpdateInterval = setInterval(() => {
            this.updateProductionProgress();
        }, 1000);
    }
    
    updateProductionProgress() {
        if (!this.currentProduction) return;
        
        const now = new Date();
        const endTime = new Date(this.currentProduction.fin_fabricacion);
        const startTime = new Date(this.currentProduction.inicio_fabricacion);
        
        const elapsed = now - startTime;
        const remaining = endTime - now;
        const totalTime = window.CONFIG.FABRICATION_TIME;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        
        this.updateProductionUI(progress, remaining);
        
        if (remaining <= 0) {
            this.completeProduction();
        }
    }
    
    updateProductionUI(progress = 0, remaining = 0) {
        const progressBar = document.getElementById('production-progress');
        const timeLeft = document.getElementById('time-left');
        const collectBtn = document.getElementById('btn-recoger-pieza');
        const statusEl = document.getElementById('factory-status');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        
        if (timeLeft) {
            if (remaining <= 0) {
                timeLeft.textContent = '¡Listo para recoger!';
                if (collectBtn) collectBtn.disabled = false;
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                timeLeft.textContent = `${hours}h ${minutes}m ${seconds}s`;
                if (collectBtn) collectBtn.disabled = true;
            }
        }
        
        if (statusEl && this.currentProduction) {
            const area = window.CAR_AREAS?.find(a => a.id === this.currentProduction.area);
            const areaName = area ? area.name : this.currentProduction.area;
            statusEl.innerHTML = `<p><i class="fas fa-industry"></i> ${areaName} Nivel ${this.currentProduction.nivel}</p>`;
        }
    }
    
    async completeProduction() {
        if (!this.currentProduction) return;
        
        console.log('🎉 Producción completada');
        
        if (this.productionUpdateInterval) {
            clearInterval(this.productionUpdateInterval);
            this.productionUpdateInterval = null;
        }
        
        this.updateProductionUI(100, 0);
        
        const area = window.CAR_AREAS?.find(a => a.id === this.currentProduction.area);
        const areaName = area ? area.name : this.currentProduction.area;
        
        this.showNotificationGlobal(
            `✅ ${areaName} lista para recoger!`,
            'success'
        );
    }
    
    async collectPiece(fabricacionId = null) {
        // Si no se especifica ID, usar la primera disponible
        if (!fabricacionId) {
            const fabricacionLista = this.produccionesEnCurso.find(fab => {
                const fin = new Date(fab.tiempo_fin);
                return new Date() >= fin;
            });
            
            if (!fabricacionLista) {
                this.showNotificationGlobal('❌ No hay piezas listas para recoger', 'error');
                return false;
            }
            fabricacionId = fabricacionLista.id;
        }
        
        try {
            // Buscar la fabricación específica
            const fabricacion = this.produccionesEnCurso.find(f => f.id === fabricacionId);
            if (!fabricacion) {
                this.showNotificationGlobal('❌ Fabricación no encontrada', 'error');
                return false;
            }
            
            const now = new Date();
            const endTime = new Date(fabricacion.tiempo_fin);
            
            if (now < endTime) {
                this.showNotificationGlobal('❌ La pieza aún no está lista', 'error');
                return false;
            }
            
            // 1. Marcar fabricación como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacion.id);
            
            if (updateError) throw updateError;
            
            // 2. Crear pieza en almacén
            const { error: piezaError } = await supabase
                .from('piezas_almacen')
                .insert([
                    {
                        escuderia_id: this.escuderiaId,
                        area: fabricacion.area,
                        nivel: fabricacion.nivel,
                        estado: 'disponible',
                        puntos_base: window.CONFIG.POINTS_PER_PIECE || 10,
                        fabricada_en: new Date().toISOString(),
                        equipada_en: null
                    }
                ]);
            
            if (piezaError) throw piezaError;
            
            // 3. Añadir puntos base al coche
            await this.updateCarProgress(fabricacion.area);
            
            // 4. Dar recompensa en dinero
            const reward = 15000;
            const f1Manager = window.f1Manager;
            if (f1Manager && f1Manager.escuderia) {
                f1Manager.escuderia.dinero += reward;
                if (f1Manager.updateEscuderiaMoney) {
                    await f1Manager.updateEscuderiaMoney();
                }
            }
            
            // 5. Eliminar de la lista local
            this.produccionesEnCurso = this.produccionesEnCurso.filter(f => f.id !== fabricacionId);
            
            // 6. Detener timer
            if (this[`timer_${fabricacionId}`]) {
                clearInterval(this[`timer_${fabricacionId}`]);
                delete this[`timer_${fabricacionId}`];
            }
            
            // 7. Mostrar notificación
            this.showNotificationGlobal(
                `🎁 ¡Pieza de ${fabricacion.area} recogida! +10 puntos y €${reward.toLocaleString()}`,
                'success'
            );
            
            // 8. Actualizar stats del coche en main.js
            if (window.f1Manager && window.f1Manager.loadCarStatus) {
                await window.f1Manager.loadCarStatus();
            }
            
            // 9. Si estamos en la pestaña almacén, recargar
            if (window.tabManager?.currentTab === 'almacen') {
                window.tabManager.loadAlmacenPiezas();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.showNotificationGlobal('❌ Error al recoger la pieza', 'error');
            return false;
        }
    }
    async updateCarProgress(areaId) {
        try {
            const { data: carStats, error: fetchError } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
            
            let currentStats = carStats || this.createEmptyCarStats();
            const currentProgress = currentStats[`${areaId}_progreso`] || 0;
            const currentLevel = currentStats[`${areaId}_nivel`] || 0;
            
            let newProgress = currentProgress + 1;
            let newLevel = currentLevel;
            
            if (newProgress >= window.CONFIG.PIECES_PER_LEVEL) {
                newProgress = 0;
                newLevel = currentLevel + 1;
                
                if (newLevel > window.CONFIG.MAX_LEVEL) {
                    newLevel = window.CONFIG.MAX_LEVEL;
                }
                
                const areaName = window.CAR_AREAS?.find(a => a.id === areaId)?.name || areaId;
                this.showNotificationGlobal(
                    `🚀 ¡${areaName} ha subido al Nivel ${newLevel}!`,
                    'success'
                );
            }
            
            const updates = {
                [`${areaId}_progreso`]: newProgress,
                [`${areaId}_nivel`]: newLevel,
                actualizado_en: new Date().toISOString()
            };
            
            let error;
            
            if (carStats) {
                const { error: updateError } = await supabase
                    .from('coches_stats')
                    .update(updates)
                    .eq('id', carStats.id);
                error = updateError;
            } else {
                updates.escuderia_id = this.escuderiaId;
                const { error: insertError } = await supabase
                    .from('coches_stats')
                    .insert([updates]);
                error = insertError;
            }
            
            if (error) throw error;
            
            const f1Manager = window.f1Manager;
            if (f1Manager && f1Manager.loadCarStatus) {
                await f1Manager.loadCarStatus();
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    createEmptyCarStats() {
        const stats = {
            escuderia_id: this.escuderiaId
        };
        
        if (window.CAR_AREAS) {
            window.CAR_AREAS.forEach(area => {
                stats[`${area.id}_nivel`] = 0;
                stats[`${area.id}_progreso`] = 0;
            });
        }
        
        return stats;
    }
    
    async getCarStats() {
        try {
            const { data: carStats, error } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            return carStats || this.createEmptyCarStats();
            
        } catch (error) {
            console.error('❌ Error:', error);
            return this.createEmptyCarStats();
        }
    }
    
    async cancelProduction() {
        if (!this.currentProduction) {
            return { success: false, message: 'No hay producción' };
        }
        
        if (confirm('¿Cancelar fabricación? Se pierde 50% del costo.')) {
            try {
                const refund = Math.floor(this.currentProduction.costo * 0.5);
                const f1Manager = window.f1Manager;
                if (f1Manager && f1Manager.escuderia) {
                    f1Manager.escuderia.dinero += refund;
                    if (f1Manager.updateEscuderiaMoney) {
                        await f1Manager.updateEscuderiaMoney();
                    }
                }
                
                const { error } = await supabase
                    .from('fabricacion_actual')
                    .update({ completada: true, cancelada: true })
                    .eq('id', this.currentProduction.id);
                
                if (error) throw error;
                
                if (this.productionUpdateInterval) {
                    clearInterval(this.productionUpdateInterval);
                    this.productionUpdateInterval = null;
                }
                
                this.currentProduction = null;
                this.updateProductionUI(0, 0);
                
                this.showNotificationGlobal(
                    `🔄 Cancelada. Reembolso: €${refund.toLocaleString()}`,
                    'info'
                );
                
                return { success: true, refund: refund };
                
            } catch (error) {
                console.error('❌ Error:', error);
                return { success: false, message: error.message };
            }
        }
        
        return { success: false, message: 'Cancelado' };
    }
    
    getProductionStatus() {
        if (!this.produccionActual) {
            return { active: false };
        }
        
        const ahora = new Date();
        const inicio = new Date(this.produccionActual.tiempo_inicio);
        const fin = new Date(this.produccionActual.tiempo_fin);
        
        // Verificar si ya pasó el tiempo
        if (ahora >= fin) {
            return {
                active: true,
                piece: this.produccionActual.area,
                level: this.produccionActual.nivel,
                progress: 100,
                remaining: 0,
                ready: true,
                id: this.produccionActual.id
            };
        }
        
        // Calcular progreso
        const tiempoTotal = fin - inicio;
        const tiempoTranscurrido = ahora - inicio;
        const progreso = Math.min(100, (tiempoTranscurrido / tiempoTotal) * 100);
        const tiempoRestante = fin - ahora;
        
        return {
            active: true,
            piece: this.produccionActual.area,
            level: this.produccionActual.nivel,
            progress: Math.round(progreso),
            remaining: tiempoRestante,
            ready: false,
            id: this.produccionActual.id
        };
    }
    
    // Método auxiliar para notificaciones
    showNotificationGlobal(message, type = 'info') {
        // Usar f1Manager si existe
        const f1Manager = window.f1Manager;
        if (f1Manager && f1Manager.showNotification) {
            f1Manager.showNotification(message, type);
            return;
        }
        
        // Si no existe, crear notificación básica
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
// ========================
// LOGS DE DIAGNÓSTICO (AL FINAL)
// ========================
console.log('=== FABRICACION.JS CARGADO ===');
console.log('1. FabricacionManager definido:', typeof FabricacionManager);
console.log('2. Ubicación:', window.location.href);

// Crear instancia global con verificación
function inicializarFabricacionManager() {
    console.log('🔧 [DEBUG] Creando fabricacionManager...');
    
    if (window.fabricacionManager) {
        console.log('⚠️ [DEBUG] fabricacionManager ya existe');
        return window.fabricacionManager;
    }
    
    try {
        window.fabricacionManager = new FabricacionManager();
        console.log('✅ [DEBUG] fabricacionManager creado:', window.fabricacionManager);
        
        // Añadir al objeto window para depuración
        window.debugFabricacion = {
            manager: window.fabricacionManager,
            creado: new Date(),
            version: '1.0'
        };
        
        return window.fabricacionManager;
    } catch (error) {
        console.error('❌ [DEBUG] Error creando fabricacionManager:', error);
        return null;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 [DEBUG] DOM listo, inicializando fabricacionManager...');
    inicializarFabricacionManager();
});

// También inicializar si ya está listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🔧 [DEBUG] DOM ya listo, inicializando ahora...');
    setTimeout(() => inicializarFabricacionManager(), 100);
}
