// ========================
// CONFIG.JS - VERSIÓN DEFINITIVA (FUNCIONA)
// ========================
console.log('✅ F1 Manager - Configuración cargada');

// Configuración del juego
window.CONFIG = {
    VERSION: '1.0.0',
    DEBUG: true,
    FABRICATION_TIME: 4 * 60 * 60 * 1000, // 4 horas en milisegundos
    INITIAL_MONEY: 50000000,
    PIECE_COST: 10000,
    PILOT_SALARY_BASE: 500000,
    MAX_LEVEL: 10,
    PIECES_PER_LEVEL: 20,
    POINTS_PER_PIECE: 10
};

// Áreas del coche
window.CAR_AREAS = [
    { id: 'suelo', name: 'Suelo y Difusor', icon: 'fas fa-car-side', color: '#FF6B6B' },
    { id: 'motor', name: 'Motor', icon: 'fas fa-cog', color: '#4ECDC4' },
    { id: 'aleron_delantero', name: 'Alerón Delantero', icon: 'fas fa-plane', color: '#FFD166' },
    { id: 'caja_cambios', name: 'Caja de Cambios', icon: 'fas fa-exchange-alt', color: '#06D6A0' },
    { id: 'pontones', name: 'Pontones', icon: 'fas fa-water', color: '#118AB2' },
    { id: 'suspension', name: 'Suspensión', icon: 'fas fa-compress-alt', color: '#EF476F' },
    { id: 'aleron_trasero', name: 'Alerón Trasero', icon: 'fas fa-plane-arrival', color: '#7209B7' },
    { id: 'chasis', name: 'Chasis', icon: 'fas fa-car', color: '#F3722C' },
    { id: 'frenos', name: 'Frenos', icon: 'fas fa-stop-circle', color: '#577590' },
    { id: 'volante', name: 'Volante', icon: 'fas fa-steering-wheel', color: '#90BE6D' },
    { id: 'electronica', name: 'Electrónica', icon: 'fas fa-microchip', color: '#43AA8B' }
];

// Variables de Supabase
window.SUPABASE_URL = 'https://xbnbbmhcveyzrvvmdktg.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg';

console.log('🎯 Configuración lista para usar');

// NO intentar inicializar Supabase aquí - main.js lo hará

// ========================
// FUNCIÓN GLOBAL SEGURA PARA RECOGER PIEZAS
// ========================
window.recogerPiezaSeguro = async function(fabricacionId) {
    console.log('🛡️ Recogiendo pieza (método seguro):', fabricacionId);
    
    try {
        // 1. Asegurar que el manager existe
        if (!window.fabricacionManager) {
            console.log('⚠️ Manager no existe, creándolo...');
            if (window.ensureFabricacionManager) {
                window.ensureFabricacionManager();
            } else {
                // Creación de emergencia
                if (window.FabricacionManager) {
                    window.fabricacionManager = new window.FabricacionManager();
                    if (window.f1Manager && window.f1Manager.escuderia) {
                        window.fabricacionManager.inicializar(window.f1Manager.escuderia.id);
                    }
                }
            }
        }
        
        // 2. Intentar con cualquier nombre de método
        const manager = window.fabricacionManager;
        if (!manager) {
            throw new Error('No se pudo crear fabricacionManager');
        }
        
        // 3. Probar diferentes nombres de método
        if (typeof manager.recogerPieza === 'function') {
            return await manager.recogerPieza(fabricacionId);
        } else if (typeof manager.collectPiece === 'function') {
            return await manager.collectPiece(fabricacionId);
        } else {
            // Último recurso: llamar directamente a Supabase
            console.log('🔥 Usando método de emergencia directo a Supabase');
            return await recogerPiezaDirecta(fabricacionId);
        }
        
    } catch (error) {
        console.error('❌ Error en recogerPiezaSeguro:', error);
        alert('Error al recoger la pieza. Recarga la página (F5).');
        return false;
    }
};

// Método de emergencia: recoger pieza directamente
async function recogerPiezaDirecta(fabricacionId) {
    try {
        // 1. Obtener la fabricación
        const { data: fabricacion, error } = await supabase
            .from('fabricacion_actual')
            .select('*')
            .eq('id', fabricacionId)
            .single();
            
        if (error) throw error;
        
        // 2. Crear pieza en almacén
        const { error: piezaError } = await supabase
            .from('piezas_almacen')
            .insert([{
                escuderia_id: fabricacion.escuderia_id,
                area: fabricacion.area,
                nivel: fabricacion.nivel,
                estado: 'disponible',
                puntos_base: 10,
                fabricada_en: new Date().toISOString()
            }]);
            
        if (piezaError) throw piezaError;
        
        // 3. Marcar como completada
        const { error: updateError } = await supabase
            .from('fabricacion_actual')
            .update({ completada: true })
            .eq('id', fabricacionId);
            
        if (updateError) throw updateError;
        
        console.log('✅ Pieza recogida (método directo)');
        
        // 4. Actualizar UI si es posible
        if (window.f1Manager && window.f1Manager.updateProductionMonitor) {
            window.f1Manager.updateProductionMonitor();
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en método directo:', error);
        return false;
    }
}

console.log('✅ Función recogerPiezaSeguro registrada');
