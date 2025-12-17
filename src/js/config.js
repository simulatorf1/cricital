// ============================================
// CONFIGURACIÓN SUPABASE
// ============================================

// Obtener las variables de entorno de Vercel
const SUPABASE_URL = 'https://xbnbbmhcveyzrvvmdktg.supabase.co'; // CAMBIAR POR TU URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg'; // CAMBIAR POR TU ANON KEY

// Crear cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// CONFIGURACIÓN DEL JUEGO
// ============================================
const CONFIG = {
    // Tiempos
    TIEMPO_FABRICACION: 4 * 60 * 60 * 1000, // 4 horas en milisegundos
    ACTUALIZACION_DATOS: 30000, // 30 segundos
    
    // Sistema de piezas
    PIEZAS_POR_NIVEL: 20,
    NIVEL_MAXIMO: 10,
    PUNTOS_POR_PIEZA: 10,
    
    // Economía
    PRECIO_BASE_PIEZA: 10000,
    INGRESO_BASE_CARRERA: 250000,
    SALARIO_BASE_PILOTO: 500000,
    
    // Apuestas
    PUNTOS_APUESTA_EXACTA: 10,
    PUNTOS_APUESTA_TOP10: 5,
    
    // Pilotoscatalogo
    PILOTOS_DISPONIBLES: 20,
    
    // URLs
    API_BASE_URL: '/api',
    
    // Estado
    ESTADO_INICIAL: {
        dinero: 5000000,
        puntos: 0,
        nivel_ingenieria: 1
    }
};

// ============================================
// ÁREAS DEL COCHE
// ============================================
const AREAS_COCHE = [
    { key: 'suelo', nombre: 'Suelo y Difusor', icon: 'fas fa-car-side', color: '#FF6B6B' },
    { key: 'motor', nombre: 'Motor', icon: 'fas fa-cog', color: '#4ECDC4' },
    { key: 'aleron_delantero', nombre: 'Alerón Delantero', icon: 'fas fa-plane', color: '#FFD166' },
    { key: 'caja_cambios', nombre: 'Caja de Cambios', icon: 'fas fa-exchange-alt', color: '#06D6A0' },
    { key: 'pontones', nombre: 'Pontones', icon: 'fas fa-water', color: '#118AB2' },
    { key: 'suspension', nombre: 'Suspensión', icon: 'fas fa-compress-alt', color: '#EF476F' },
    { key: 'aleron_trasero', nombre: 'Alerón Trasero', icon: 'fas fa-plane-arrival', color: '#7209B7' },
    { key: 'chasis', nombre: 'Chasis', icon: 'fas fa-car', color: '#F3722C' },
    { key: 'frenos', nombre: 'Frenos', icon: 'fas fa-stop-circle', color: '#577590' },
    { key: 'volante', nombre: 'Volante', icon: 'fas fa-steering-wheel', color: '#90BE6D' },
    { key: 'electronica', nombre: 'Electrónica', icon: 'fas fa-microchip', color: '#43AA8B' }
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Formatear tiempo
function formatTime(ms) {
    if (ms <= 0) return '00:00:00';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Formatear fecha
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Generar ID único
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Capitalizar texto
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================
// EXPORTAR
// ============================================
export {
    supabase,
    CONFIG,
    AREAS_COCHE,
    formatCurrency,
    formatTime,
    formatDate,
    generateId,
    isValidEmail,
    capitalize
};
