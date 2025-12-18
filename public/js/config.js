// ========================
// CONFIG.JS - VERSIÓN CORREGIDA DEFINITIVA
// ========================
console.log('✅ F1 Manager - Configuración cargada');

// URL y clave de tu proyecto Supabase
const SUPABASE_URL = 'https://xbnbbmhcveyzrvvmdktg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg';

// Configuración del juego
const CONFIG = {
    VERSION: '1.0.0',
    DEBUG: true,
    FABRICATION_TIME: 4 * 60 * 60 * 1000, // 4 horas en milisegundos
    INITIAL_MONEY: 5000000,
    PIECE_COST: 10000,
    PILOT_SALARY_BASE: 500000,
    MAX_LEVEL: 10,
    PIECES_PER_LEVEL: 20,
    POINTS_PER_PIECE: 10
};

// Áreas del coche
const CAR_AREAS = [
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

// Función para inicializar Supabase
async function initSupabase() {
    try {
        // Si ya está inicializado, devolverlo
        if (window.supabase && window.supabase.auth) {
            console.log('✅ Supabase ya está inicializado');
            return window.supabase;
        }
        
        // Importar la biblioteca de Supabase dinámicamente
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.7');
        
        // Crear el cliente
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Asignar a window
        window.supabase = supabaseClient;
        
        console.log('🚀 Supabase inicializado correctamente:', SUPABASE_URL);
        return supabaseClient;
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return null;
    }
}

// Inicializar Supabase inmediatamente
initSupabase().then(client => {
    if (client) {
        console.log('✅ Supabase listo para usar');
        
        // Verificar que funciona
        client.auth.getSession().then(({ data }) => {
            console.log('🔐 Sesión verificada:', data.session ? 'ACTIVA' : 'INACTIVA');
        });
    }
});

// Exportar configuraciones
window.CONFIG = CONFIG;
window.CAR_AREAS = CAR_AREAS;
// NO exportar window.supabase aquí - ya se hace en initSupabase()

console.log('🎯 Configuración lista para usar');
