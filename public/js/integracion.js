// ========================
// INTEGRACION.JS - Conexión entre sistemas
// ========================

class IntegracionManager {
    constructor() {
        this.integrationTimers = {};
    }

    async inicializar(escuderiaId) {
        console.log('🔗 Inicializando integración entre sistemas...');
        
        // 1. Sincronizar fabricación con almacén
        this.integrationTimers.fabricacion = setInterval(() => {
            this.sincronizarFabricacionAlmacen();
        }, 5000); // Cada 5 segundos

        // 2. Sincronizar estadísticas del coche
        this.integrationTimers.stats = setInterval(() => {
            this.sincronizarEstadisticas();
        }, 10000); // Cada 10 segundos

        return true;
    }

    async sincronizarFabricacionAlmacen() {
        try {
            // Verificar si hay piezas listas para recoger
            const { data: fabricacionesListas, error } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('completada', true)
                .eq('procesada_almacen', false) // Necesitarías añadir este campo
                .limit(5);

            if (error) throw error;

            if (fabricacionesListas && fabricacionesListas.length > 0) {
                console.log(`📦 ${fabricacionesListas.length} piezas listas para procesar en almacén`);
                
                // Procesar cada fabricación
                for (const fabricacion of fabricacionesListas) {
                    await this.procesarPiezaParaAlmacen(fabricacion);
                }
            }

        } catch (error) {
            console.error('❌ Error sincronizando fabricación-almacén:', error);
        }
    }

    async procesarPiezaParaAlmacen(fabricacion) {
        try {
            // 1. Crear pieza en almacén
            const { error: createError } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: fabricacion.area,
                    nivel: fabricacion.nivel,
                    estado: 'disponible',
                    puntos_base: 10,
                    fabricada_en: new Date().toISOString(),
                    origen_fabricacion_id: fabricacion.id
                }]);

            if (createError) throw createError;

            // 2. Marcar fabricación como procesada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ procesada_almacen: true })
                .eq('id', fabricacion.id);

            if (updateError) throw updateError;

            console.log(`✅ Pieza ${fabricacion.area} procesada para almacén`);

            // 3. Notificar al usuario
            this.notificarPiezaLista(fabricacion.area);

        } catch (error) {
            console.error('❌ Error procesando pieza:', error);
        }
    }

    async sincronizarEstadisticas() {
        try {
            // Verificar si hay cambios en las estadísticas
            const { data: cambios, error } = await supabase
                .from('coches_stats')
                .select('*')
                .order('actualizado_en', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (cambios && cambios.length > 0) {
                const ultimoCambio = new Date(cambios[0].actualizado_en);
                const ahora = new Date();
                const diferencia = ahora - ultimoCambio;

                // Si hay cambios recientes (últimos 30 segundos)
                if (diferencia < 30000) {
                    console.log('📊 Actualizando estadísticas del coche...');
                    
                    // Actualizar en main.js si existe
                    if (window.f1Manager && window.f1Manager.loadCarStatus) {
                        await window.f1Manager.loadCarStatus();
                    }

                    // Actualizar en taller si está activo
                    if (window.tabManager && window.tabManager.currentTab === 'taller') {
                        this.actualizarTaller();
                    }
                }
            }

        } catch (error) {
            console.error('❌ Error sincronizando estadísticas:', error);
        }
    }

    notificarPiezaLista(area) {
        // Mostrar notificación
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification(`✅ Pieza de ${area} lista en almacén`, 'success');
        }

        // Actualizar almacén si está activo
        if (window.tabManager && window.tabManager.currentTab === 'almacen') {
            if (window.tabManager.loadAlmacenPiezas) {
                window.tabManager.loadAlmacenPiezas();
            }
        }

        // Mostrar alerta en dashboard
        const alerta = document.getElementById('alerta-almacen');
        if (alerta) {
            alerta.style.display = 'flex';
            alerta.innerHTML = `
                <i class="fas fa-bell"></i>
                <span>¡Nueva pieza de ${area} disponible en almacén!</span>
            `;
        }
    }

    actualizarTaller() {
        // Actualizar áreas del taller
        const container = document.getElementById('taller-areas');
        if (!container || !window.f1Manager || !window.f1Manager.carStats) return;

        // Esta función debería ser llamada desde tabManager
        if (window.tabManager && window.tabManager.loadTallerAreas) {
            window.tabManager.loadTallerAreas();
        }
    }

    detener() {
        // Detener todos los timers
        Object.values(this.integrationTimers).forEach(timer => {
            clearInterval(timer);
        });
        this.integrationTimers = {};
    }
}

// Inicializar globalmente
window.IntegracionManager = IntegracionManager;

document.addEventListener('DOMContentLoaded', () => {
    window.integracionManager = new IntegracionManager();
    console.log('✅ IntegracionManager inicializado');
});
