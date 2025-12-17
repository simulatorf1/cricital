// CONFIGURACIÓN REAL F1 MANAGER CON TUS DATOS
console.log('✅ F1 Manager - Configuración cargada');

// TUS CREDENCIALES SUPABASE
const SUPABASE_URL = 'https://xbnbbmhcveyzrvvmdktg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg';

// Crear cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuración del juego
const CONFIG = {
    VERSION: '1.0.0',
    DEBUG: true,
    
    // Tiempos
    FABRICATION_TIME: 4 * 60 * 60 * 1000, // 4 horas
    UPDATE_INTERVAL: 10000, // 10 segundos
    
    // Economía
    INITIAL_MONEY: 5000000,
    PIECE_COST: 10000,
    PILOT_SALARY_BASE: 500000,
    
    // Juego
    MAX_LEVEL: 10,
    PIECES_PER_LEVEL: 20,
    POINTS_PER_PIECE: 10,
    
    // URLs
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_KEY: SUPABASE_ANON_KEY
};

// Funciones de utilidad
function formatMoney(amount) {
    return '€' + amount.toLocaleString('es-ES');
}

function formatTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Exportar
window.CONFIG = CONFIG;
window.supabase = supabase;
window.formatMoney = formatMoney;
window.formatTime = formatTime;

console.log('🚀 Supabase configurado:', SUPABASE_URL);
console.log('🎮 Configuración del juego:', CONFIG);
