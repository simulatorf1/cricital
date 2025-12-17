// ============================================
// MÓDULO DE FABRICACIÓN (Extensión de main.js)
// ============================================

class FabricacionManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.init();
    }
    
    init() {
        console.log('🏭 Módulo de fabricación inicializado');
    }
    
    // Métodos específicos de fabricación pueden ir aquí
    // Por ejemplo: cálculos avanzados, optimizaciones, etc.
    
    calcularCostoFabricacion(area, nivel) {
        const costoBase = this.f1Manager.CONFIG.PRECIO_BASE_PIEZA;
        const multiplicadorNivel = 1 + (nivel * 0.1); // 10% más por nivel
        return Math.round(costoBase * multiplicadorNivel);
    }
    
    calcularTiempoFabricacion(area, nivel) {
        const tiempoBase = this.f1Manager.CONFIG.TIEMPO_FABRICACION;
        const multiplicadorNivel = 1 + (nivel * 0.05); // 5% más por nivel
        return Math.round(tiempoBase * multiplicadorNivel);
    }
    
    getProximaMejora(area) {
        const stats = this.f1Manager.cocheStats;
        const nivelActual = stats[`${area}_nivel`] || 0;
        const progresoActual = stats[`${area}_progreso`] || 0;
        const piezasRestantes = this.f1Manager.CONFIG.PIEZAS_POR_NIVEL - progresoActual;
        
        return {
            area: area,
            nivelActual: nivelActual,
            nivelProximo: nivelActual + 1,
            progresoActual: progresoActual,
            piezasRestantes: piezasRestantes,
            porcentajeCompletado: (progresoActual / this.f1Manager.CONFIG.PIEZAS_POR_NIVEL) * 100,
            puedeMejorar: nivelActual < this.f1Manager.CONFIG.NIVEL_MAXIMO
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.f1Manager) {
        window.fabricacionManager = new FabricacionManager(window.f1Manager);
    }
});

export default FabricacionManager;
