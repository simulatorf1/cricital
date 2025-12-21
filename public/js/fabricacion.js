// ========================
// SISTEMA DE FABRICACIÓN CORREGIDO
// ========================
console.log('🔧 Sistema de fabricación cargado');

class FabricacionManager {
    constructor() {
        this.currentProduction = null;
        this.productionTimer = null;
        this.productionUpdateInterval = null;
        this.escuderiaId = null;
        console.log('🏭 FabricacionManager creado (modo pasivo)');
    }
    
    // Método para inicializar manualmente
    async inicializar(escuderiaId) {
        console.log('🔧 [DEBUG] Inicializando fabricación para escudería:', escuderiaId);
        console.log('🔧 [DEBUG] window.supabase disponible:', !!window.supabase);
        
        if (!escuderiaId) {
            console.error('❌ [DEBUG] No se recibió escuderiaId');
            return false;
        }
        
        if (!window.supabase) {
            console.error('❌ [DEBUG] Supabase no disponible');
            return false;
        }
        
        this.escuderiaId = escuderiaId;
        
        try {
            await this.checkCurrentProduction();
            this.setupGlobalEvents();
            console.log('✅ [DEBUG] Fabricación inicializada correctamente');
            return true;
        } catch (error) {
            console.error('❌ [DEBUG] Error inicializando fabricación:', error);
            return false;
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
    
    async startFabrication(areaId, nivel = 1) {
        console.log(`🏭 Iniciando fabricación: ${areaId} Nivel ${nivel}`);
        
        if (!this.escuderiaId) {
            this.showNotificationGlobal('❌ No tienes escudería', 'error');
            return false;
        }
        
        if (this.currentProduction) {
            this.showNotificationGlobal('❌ Ya hay fabricación en curso', 'error');
            return false;
        }
        
        // Obtener datos de f1Manager si existe
        const f1Manager = window.f1Manager;
        if (f1Manager && f1Manager.escuderia) {
            if (f1Manager.escuderia.dinero < window.CONFIG.PIECE_COST) {
                this.showNotificationGlobal('❌ Fondos insuficientes', 'error');
                return false;
            }
        }
        
        const areaName = window.CAR_AREAS?.find(a => a.id === areaId)?.name || areaId;
        
        try {
            const inicio = new Date();
            const fin = new Date(inicio.getTime() + window.CONFIG.FABRICATION_TIME);
            
            const { data: production, error } = await supabase
                .from('fabricacion_actual')
                .insert([
                    {
                        escuderia_id: this.escuderiaId,
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
            
            // Actualizar dinero si f1Manager existe
            if (f1Manager && f1Manager.escuderia) {
                f1Manager.escuderia.dinero -= window.CONFIG.PIECE_COST;
                if (f1Manager.updateEscuderiaMoney) {
                    await f1Manager.updateEscuderiaMoney();
                }
            }
            
            this.currentProduction = production;
            this.startProductionTimer();
            this.updateProductionUI();
            
            this.showNotificationGlobal(
                `🏭 ${areaName} Nivel ${nivel} iniciada (4h)`,
                'success'
            );
            
            return true;
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.showNotificationGlobal('❌ Error al iniciar', 'error');
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
    
    async collectPiece() {
        if (!this.currentProduction) {
            this.showNotificationGlobal('❌ No hay pieza para recoger', 'error');
            return false;
        }

        const now = new Date();
        const endTime = new Date(this.currentProduction.fin_fabricacion);
        
        if (now < endTime) {
            this.showNotificationGlobal('❌ La pieza aún no está lista', 'error');
            return false;
        }
        
        try {
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', this.currentProduction.id);
            
            if (updateError) throw updateError;
            
            const { error: piezaError } = await supabase
                .from('piezas_almacen')
                .insert([
                    {
                        escuderia_id: this.escuderiaId,
                        area: this.currentProduction.area,
                        nivel: this.currentProduction.nivel,
                        estado: 'disponible',
                        puntos_base: window.CONFIG.POINTS_PER_PIECE || 10,
                        fabricada_en: new Date().toISOString(),
                        equipada_en: null
                    }
                ]);
            
            if (piezaError) throw piezaError;
            
            await this.updateCarProgress(this.currentProduction.area);
            
            const reward = 15000;
            const f1Manager = window.f1Manager;
            if (f1Manager && f1Manager.escuderia) {
                f1Manager.escuderia.dinero += reward;
                if (f1Manager.updateEscuderiaMoney) {
                    await f1Manager.updateEscuderiaMoney();
                }
            }
            
            const areaObj = window.CAR_AREAS?.find(a => a.id === this.currentProduction.area);
            this.currentProduction = null;
            
            this.updateProductionUI(0, 0);
            
            this.showNotificationGlobal(
                `🎁 ¡Pieza recogida! +10 puntos y €${reward.toLocaleString()}`,
                'success'
            );
            
            if (window.tabManager?.currentTab === 'almacen') {
                window.tabManager.loadAlmacenPiezas();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.showNotificationGlobal('❌ Error al recoger', 'error');
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
        if (!this.currentProduction) {
            return { active: false, message: 'No hay producción' };
        }
        
        const now = new Date();
        const endTime = new Date(this.currentProduction.fin_fabricacion);
        const startTime = new Date(this.currentProduction.inicio_fabricacion);
        
        const elapsed = now - startTime;
        const remaining = endTime - now;
        const totalTime = window.CONFIG.FABRICATION_TIME;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        
        const area = window.CAR_AREAS?.find(a => a.id === this.currentProduction.area);
        
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

// Crear instancia global pero NO autoiniciar
document.addEventListener('DOMContentLoaded', () => {
    window.fabricacionManager = new FabricacionManager();
    console.log('✅ FabricacionManager listo (modo pasivo - esperando inicialización)');
});
