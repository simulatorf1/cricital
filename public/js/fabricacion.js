// ========================
// SISTEMA DE FABRICACIÓN COMPLETO
// ========================
console.log('🔧 Sistema de fabricación cargado - ESPERANDO CONFIG');

// ESPERAR ACTIVAMENTE a que config.js cargue
(async function() {
    // Esperar hasta que window.CONFIG exista
    let espera = 0;
    while (!window.CONFIG && espera < 50) { // 5 segundos máximo
        await new Promise(resolve => setTimeout(resolve, 100));
        espera++;
        if (espera % 10 === 0) console.log('⏳ Esperando CONFIG...', espera/10 + 's');
    }
    
    if (!window.CONFIG) {
        console.error('❌ ERROR CRÍTICO: CONFIG nunca se cargó');
        window.CONFIG = {
            FABRICATION_TIME: 4 * 60 * 60 * 1000,
            PIECE_COST: 10000,
            MAX_LEVEL: 10,
            PIECES_PER_LEVEL: 20,
            POINTS_PER_PIECE: 10
        };
    }
    
    if (!window.CAR_AREAS) {
        console.warn('⚠️ CAR_AREAS no definido, creando básico');
        window.CAR_AREAS = [
            { id: 'motor', name: 'Motor' },
            { id: 'frenos', name: 'Frenos' }
        ];
    }
    
    console.log('✅ Config lista, iniciando fabricación...');
    
    // ========================
    // CLASE FabricacionManager
    // ========================
    class FabricacionManager {
        constructor() {
            this.currentProduction = null;
            this.productionTimer = null;
            this.productionUpdateInterval = null;
            this.init();
        }
        
        init() {
            console.log('🏭 Inicializando sistema de fabricación...');
            
            // Verificar producción en curso
            this.checkCurrentProduction();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
        }
        
        setupGlobalEvents() {
            // Botón recoger pieza (en dashboard)
            document.addEventListener('click', (e) => {
                if (e.target.id === 'btn-recoger-pieza' || 
                    e.target.closest('#btn-recoger-pieza')) {
                    this.collectPiece();
                }
            });
        }
        
        async checkCurrentProduction() {
            try {
                if (!window.f1Manager?.escuderia?.id) {
                    console.log('⏳ Esperando escudería para verificar producción...');
                    return;
                }
                
                const { data: production, error } = await supabase
                    .from('fabricacion_actual')
                    .select('*')
                    .eq('escuderia_id', window.f1Manager.escuderia.id)
                    .eq('completada', false)
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                
                if (production) {
                    this.currentProduction = production;
                    console.log('📦 Producción en curso encontrada:', production);
                    this.startProductionTimer();
                    this.updateProductionUI();
                }
                
            } catch (error) {
                console.error('❌ Error verificando producción:', error);
            }
        }
        
        async startFabrication(areaId, nivel = 1) {
            console.log(`🏭 Iniciando fabricación: ${areaId} Nivel ${nivel}`);
            
            if (!window.f1Manager?.escuderia) {
                window.f1Manager?.showNotification('❌ No tienes escudería', 'error');
                return false;
            }
            
            // Verificar si ya hay producción en curso
            if (this.currentProduction) {
                window.f1Manager?.showNotification('❌ Ya hay una pieza en fabricación', 'error');
                return false;
            }
            
            // Verificar fondos
            if (window.f1Manager.escuderia.dinero < window.CONFIG.PIECE_COST) {
                window.f1Manager?.showNotification('❌ Fondos insuficientes', 'error');
                return false;
            }
            
            // Verificar nivel máximo
            const areaName = window.CAR_AREAS.find(a => a.id === areaId)?.name || areaId;
            const carStats = await this.getCarStats();
            const currentLevel = carStats?.[`${areaId}_nivel`] || 0;
            
            if (currentLevel >= window.CONFIG.MAX_LEVEL) {
                window.f1Manager?.showNotification(`❌ ${areaName} ya está al nivel máximo`, 'error');
                return false;
            }
            
            try {
                // Calcular tiempos
                const inicio = new Date();
                const fin = new Date(inicio.getTime() + window.CONFIG.FABRICATION_TIME);
                
                // Crear registro en base de datos
                const { data: production, error } = await supabase
                    .from('fabricacion_actual')
                    .insert([
                        {
                            escuderia_id: window.f1Manager.escuderia.id,
                            area: areaId,
                            nivel: nivel,
                            inicio_fabricacion: inicio.toISOString(),
                            fin_fabricacion: fin.toISOString(),
                            completada: false,
                            costo: window.CONFIG.PIECE_COST
                        }
                    ])
                    .select()
                    .single();
                
                if (error) throw error;
                
                // Descontar dinero
                window.f1Manager.escuderia.dinero -= window.CONFIG.PIECE_COST;
                await window.f1Manager.updateEscuderiaMoney();
                
                // Actualizar estado local
                this.currentProduction = production;
                
                // Iniciar timer
                this.startProductionTimer();
                
                // Actualizar UI
                this.updateProductionUI();
                
                // Mostrar notificación
                window.f1Manager?.showNotification(
                    `🏭 Fabricación de ${areaName} Nivel ${nivel} iniciada (4 horas)`,
                    'success'
                );
                
                return true;
                
            } catch (error) {
                console.error('❌ Error iniciando fabricación:', error);
                window.f1Manager?.showNotification('❌ Error al iniciar fabricación', 'error');
                return false;
            }
        }
        
        startProductionTimer() {
            if (!this.currentProduction) return;
            
            // Limpiar timer anterior
            if (this.productionUpdateInterval) {
                clearInterval(this.productionUpdateInterval);
            }
            
            // Actualizar inmediatamente
            this.updateProductionProgress();
            
            // Actualizar cada segundo
            this.productionUpdateInterval = setInterval(() => {
                this.updateProductionProgress();
            }, 1000);
        }
        
        updateProductionProgress() {
            if (!this.currentProduction) return;
            
            const now = new Date();
            const endTime = new Date(this.currentProduction.fin_fabricacion);
            const startTime = new Date(this.currentProduction.inicio_fabricacion);
            
            // Calcular tiempo transcurrido y restante
            const elapsed = now - startTime;
            const remaining = endTime - now;
            const totalTime = window.CONFIG.FABRICATION_TIME;
            
            // Calcular porcentaje
            let progress = Math.min(100, (elapsed / totalTime) * 100);
            
            // Actualizar UI
            this.updateProductionUI(progress, remaining);
            
            // Si se completó
            if (remaining <= 0) {
                this.completeProduction();
            }
        }
        
        updateProductionUI(progress = 0, remaining = 0) {
            // Actualizar en dashboard
            const progressBar = document.getElementById('production-progress');
            const timeLeft = document.getElementById('time-left');
            const collectBtn = document.getElementById('btn-recoger-pieza');
            const statusEl = document.getElementById('factory-status');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (timeLeft) {
                if (remaining <= 0) {
                    timeLeft.textContent = '¡Listo para recoger!';
                    if (collectBtn) collectBtn.disabled = false;
                } else {
                    const hours = Math.floor(remaining / (1000 * 60 * 60));
                    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                    timeLeft.textContent = `Tiempo restante: ${hours}h ${minutes}m ${seconds}s`;
                    if (collectBtn) collectBtn.disabled = true;
                }
            }
            
            if (statusEl && this.currentProduction) {
                const area = window.CAR_AREAS.find(a => a.id === this.currentProduction.area);
                const areaName = area ? area.name : this.currentProduction.area;
                statusEl.innerHTML = `
                    <p><i class="fas fa-industry"></i> Fabricando: 
                    <strong>${areaName} Nivel ${this.currentProduction.nivel}</strong></p>
                `;
            }
            
            // Actualizar en taller si está visible
            if (window.tabManager?.currentTab === 'taller') {
                this.updateTallerUI();
            }
        }
        
        updateTallerUI() {
            // Actualizar todas las áreas en el taller
            window.CAR_AREAS.forEach(area => {
                const progressBar = document.getElementById(`progress-${area.id}`);
                if (progressBar) {
                    const fill = progressBar.querySelector('.progress-fill');
                    // Aquí obtendrías el progreso real de la base de datos
                    // Por ahora mostramos 0%
                    if (fill) fill.style.width = '0%';
                }
            });
        }
        
        async completeProduction() {
            if (!this.currentProduction) return;
            
            console.log('🎉 Producción completada:', this.currentProduction);
            
            // Limpiar timer
            if (this.productionUpdateInterval) {
                clearInterval(this.productionUpdateInterval);
                this.productionUpdateInterval = null;
            }
            
            // Actualizar UI para mostrar completado
            this.updateProductionUI(100, 0);
            
            // Mostrar notificación
            const area = window.CAR_AREAS.find(a => a.id === this.currentProduction.area);
            const areaName = area ? area.name : this.currentProduction.area;
            
            window.f1Manager?.showNotification(
                `✅ ${areaName} Nivel ${this.currentProduction.nivel} lista para recoger!`,
                'success'
            );
        }
        
        async collectPiece() {
            if (!this.currentProduction) {
                window.f1Manager?.showNotification('❌ No hay pieza para recoger', 'error');
                return false;
            }
            
            // Verificar si realmente está completada
            const now = new Date();
            const endTime = new Date(this.currentProduction.fin_fabricacion);
            
            if (now < endTime) {
                window.f1Manager?.showNotification('❌ La pieza aún no está lista', 'error');
                return false;
            }
            
            try {
                // 1. Marcar producción como completada en BD
                const { error: updateError } = await supabase
                    .from('fabricacion_actual')
                    .update({ completada: true })
                    .eq('id', this.currentProduction.id);
                
                if (updateError) throw updateError;
                
                // 2. Crear pieza en almacén
                const { error: piezaError } = await supabase
                    .from('piezas_almacen')
                    .insert([
                        {
                            escuderia_id: window.f1Manager.escuderia.id,
                            area: this.currentProduction.area,
                            nivel: this.currentProduction.nivel,
                            estado: 'disponible',
                            puntos_base: window.CONFIG.POINTS_PER_PIECE,
                            fabricada_en: new Date().toISOString()
                        }
                    ]);
                
                if (piezaError) throw piezaError;
                
                // 3. Actualizar progreso del área del coche
                await this.updateCarProgress(this.currentProduction.area);
                
                // 4. Dar recompensa (dinero por vender la pieza)
                const reward = 15000; // €15,000 por pieza fabricada
                window.f1Manager.escuderia.dinero += reward;
                await window.f1Manager.updateEscuderiaMoney();
                
                // 5. Limpiar producción actual
                const pieceName = window.CAR_AREAS.find(a => a.id === this.currentProduction.area)?.name || 
                                 this.currentProduction.area;
                this.currentProduction = null;
                
                // 6. Actualizar UI
                this.updateProductionUI(0, 0);
                
                // 7. Mostrar notificación de éxito
                window.f1Manager?.showNotification(
                    `🎁 ¡Pieza recogida! +${window.CONFIG.POINTS_PER_PIECE} puntos y €${reward.toLocaleString()}`,
                    'success'
                );
                
                // 8. Actualizar almacén si está visible
                if (window.tabManager?.currentTab === 'almacen') {
                    window.tabManager.loadAlmacenPiezas();
                }
                
                return true;
                
            } catch (error) {
                console.error('❌ Error recogiendo pieza:', error);
                window.f1Manager?.showNotification('❌ Error al recoger pieza', 'error');
                return false;
            }
        }
        
        async updateCarProgress(areaId) {
            try {
                // Obtener estadísticas actuales del coche
                const { data: carStats, error: fetchError } = await supabase
                    .from('coches_stats')
                    .select('*')
                    .eq('escuderia_id', window.f1Manager.escuderia.id)
                    .single();
                
                if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
                
                let currentStats = carStats || this.createEmptyCarStats();
                const currentProgress = currentStats[`${areaId}_progreso`] || 0;
                const currentLevel = currentStats[`${areaId}_nivel`] || 0;
                
                let newProgress = currentProgress + 1;
                let newLevel = currentLevel;
                
                // Si se completan 20 piezas, subir de nivel
                if (newProgress >= window.CONFIG.PIECES_PER_LEVEL) {
                    newProgress = 0;
                    newLevel = currentLevel + 1;
                    
                    if (newLevel > window.CONFIG.MAX_LEVEL) {
                        newLevel = window.CONFIG.MAX_LEVEL;
                    }
                    
                    // Notificar subida de nivel
                    const areaName = window.CAR_AREAS.find(a => a.id === areaId)?.name || areaId;
                    window.f1Manager?.showNotification(
                        `🚀 ¡${areaName} ha subido al Nivel ${newLevel}!`,
                        'success'
                    );
                }
                
                // Actualizar estadísticas
                const updates = {
                    [`${areaId}_progreso`]: newProgress,
                    [`${areaId}_nivel`]: newLevel,
                    actualizado_en: new Date().toISOString()
                };
                
                let error;
                
                if (carStats) {
                    // Actualizar registro existente
                    const { error: updateError } = await supabase
                        .from('coches_stats')
                        .update(updates)
                        .eq('id', carStats.id);
                    error = updateError;
                } else {
                    // Crear nuevo registro
                    updates.escuderia_id = window.f1Manager.escuderia.id;
                    const { error: insertError } = await supabase
                        .from('coches_stats')
                        .insert([updates]);
                    error = insertError;
                }
                
                if (error) throw error;
                
                // Actualizar UI del coche
                if (window.f1Manager) {
                    await window.f1Manager.loadCarStatus();
                }
                
            } catch (error) {
                console.error('❌ Error actualizando progreso del coche:', error);
            }
        }
        
        createEmptyCarStats() {
            const stats = {
                escuderia_id: window.f1Manager?.escuderia?.id
            };
            
            window.CAR_AREAS.forEach(area => {
                stats[`${area.id}_nivel`] = 0;
                stats[`${area.id}_progreso`] = 0;
            });
            
            return stats;
        }
        
        async getCarStats() {
            try {
                const { data: carStats, error } = await supabase
                    .from('coches_stats')
                    .select('*')
                    .eq('escuderia_id', window.f1Manager?.escuderia?.id)
                    .single();
                
                if (error && error.code !== 'PGRST116') throw error;
                
                return carStats || this.createEmptyCarStats();
                
            } catch (error) {
                console.error('❌ Error obteniendo estadísticas del coche:', error);
                return this.createEmptyCarStats();
            }
        }
        
        // ===== FUNCIONES PÚBLICAS =====
        
        async cancelProduction() {
            if (!this.currentProduction) {
                return { success: false, message: 'No hay producción en curso' };
            }
            
            if (confirm('¿Estás seguro de cancelar la fabricación? Se perderá el 50% del costo.')) {
                try {
                    // Devolver 50% del dinero
                    const refund = Math.floor(this.currentProduction.costo * 0.5);
                    window.f1Manager.escuderia.dinero += refund;
                    await window.f1Manager.updateEscuderiaMoney();
                    
                    // Marcar como cancelada
                    const { error } = await supabase
                        .from('fabricacion_actual')
                        .update({ 
                            completada: true,
                            cancelada: true 
                        })
                        .eq('id', this.currentProduction.id);
                    
                    if (error) throw error;
                    
                    // Limpiar timer
                    if (this.productionUpdateInterval) {
                        clearInterval(this.productionUpdateInterval);
                        this.productionUpdateInterval = null;
                    }
                    
                    // Limpiar producción actual
                    this.currentProduction = null;
                    
                    // Actualizar UI
                    this.updateProductionUI(0, 0);
                    
                    window.f1Manager?.showNotification(
                        `🔄 Fabricación cancelada. Recibiste €${refund.toLocaleString()} de reembolso.`,
                        'info'
                    );
                    
                    return { success: true, refund: refund };
                    
                } catch (error) {
                    console.error('❌ Error cancelando producción:', error);
                    return { success: false, message: error.message };
                }
            }
            
            return { success: false, message: 'Cancelado por el usuario' };
        }
        
        getProductionStatus() {
            if (!this.currentProduction) {
                return {
                    active: false,
                    message: 'No hay producción en curso'
                };
            }
            
            const now = new Date();
            const endTime = new Date(this.currentProduction.fin_fabricacion);
            const startTime = new Date(this.currentProduction.inicio_fabricacion);
            
            const elapsed = now - startTime;
            const remaining = endTime - now;
            const totalTime = window.CONFIG.FABRICATION_TIME;
            const progress = Math.min(100, (elapsed / totalTime) * 100);
            
            const area = window.CAR_AREAS.find(a => a.id === this.currentProduction.area);
            
            return {
                active: true,
                piece: area ? area.name : this.currentProduction.area,
                level: this.currentProduction.nivel,
                progress: progress,
                remaining: remaining,
                ready: remaining <= 0,
                startTime: startTime,
                endTime: endTime
            };
        }
    }
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        window.fabricacionManager = new FabricacionManager();
        
        // Hacer accesible desde otros módulos
        if (window.f1Manager) {
            window.f1Manager.iniciarFabricacion = (areaId) => {
                window.fabricacionManager.startFabrication(areaId);
            };
        }
    });
    
    console.log('✅ Sistema de fabricación listo y configurado');
    
})(); // FIN de la función async auto-ejecutable
// ========================
// FIX TEMPORAL - Asegurar que f1Manager pueda llamar a fabricacionManager
// ========================


