// ========================
// ALMACEN.JS - Sistema de Almacén
// ========================
console.log('📦 Sistema de almacén cargado');

class AlmacenManager {
    constructor() {
        this.piezas = [];
        this.escuderiaId = null;
    }
    
    async inicializar(escuderiaId) {
        this.escuderiaId = escuderiaId;
        await this.cargarPiezas();
        return true;
    }

    async cargarPiezas() {
        try {
            const { data, error } = await supabase
                .from('piezas_almacen')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .eq('estado', 'disponible')  // ← CAMBIA 'equipada' por 'estado'
                .order('creada_en', { ascending: false });

            if (error) throw error;

            this.piezas = data || [];
            console.log(`📦 ${this.piezas.length} piezas en almacén`);
            return this.piezas;
        } catch (error) {
            console.error('❌ Error cargando almacén:', error);
            return [];
        }
    }
    
    async agregarPieza(fabricacionData) {
        try {
            // 1. Marcar fabricación como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionData.id);
            
            if (updateError) throw updateError;
            
            // 2. Crear pieza en almacén
            const { data: nuevaPieza, error: insertError } = await supabase
                .from('almacen_piezas')
                .insert([{
                    escuderia_id: this.escuderiaId,
                    area: fabricacionData.area,
                    nivel: fabricacionData.nivel,
                    puntos_base: 10, // Cada pieza da 10 puntos
                    calidad: 'Estándar',
                    equipada: false,
                    fabricada_en: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            // 3. Actualizar lista local
            this.piezas.unshift(nuevaPieza);
            
            // 4. Añadir puntos base al coche
            await this.aplicarPuntosBase(nuevaPieza);
            
            console.log('✅ Pieza añadida al almacén:', nuevaPieza);
            return nuevaPieza;
            
        } catch (error) {
            console.error('❌ Error agregando pieza al almacén:', error);
            return null;
        }
    }
    
    async aplicarPuntosBase(pieza) {
        try {
            // Buscar stats del coche
            const { data: stats, error } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .single();
            
            if (error) throw error;
            
            // Añadir progreso al área correspondiente
            const columnaProgreso = `${pieza.area.toLowerCase().replace(/ /g, '_')}_progreso`;
            const nuevoProgreso = (stats[columnaProgreso] || 0) + 1;
            
            // Verificar si sube de nivel (20 piezas = 1 nivel)
            const columnaNivel = `${pieza.area.toLowerCase().replace(/ /g, '_')}_nivel`;
            const nivelActual = stats[columnaNivel] || 0;
            
            let nuevoNivel = nivelActual;
            if (nuevoProgreso >= 20) {
                nuevoNivel = nivelActual + 1;
                // Reiniciar progreso
                nuevoProgreso = 0;
            }
            
            // Actualizar stats
            const { error: updateError } = await supabase
                .from('coches_stats')
                .update({
                    [columnaProgreso]: nuevoProgreso,
                    [columnaNivel]: nuevoNivel
                })
                .eq('escuderia_id', this.escuderiaId);
            
            if (updateError) throw updateError;
            
            console.log(`✅ +10 puntos base aplicados a ${pieza.area}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error aplicando puntos base:', error);
            return false;
        }
    }
    
    async equiparPieza(piezaId, areaId) {
        // Implementar lógica para equipar pieza
        console.log(`🔧 Equipando pieza ${piezaId} en área ${areaId}`);
        // Aquí iría la lógica para marcar la pieza como equipada
        // y aplicar bonificaciones adicionales
    }
}

// Inicializar globalmente
window.AlmacenManager = AlmacenManager;

// NO crear instancia aquí
console.log('✅ Clase AlmacenManager registrada');

// Crear instancia cuando se solicite
window.crearAlmacenManager = function() {
    if (!window.almacenManager) {
        window.almacenManager = new AlmacenManager();
        console.log('✅ Instancia de AlmacenManager creada');
    }
    return window.almacenManager;
};
