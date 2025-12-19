// ========================
// INIT-DB.JS - Inicializar datos demo
// ========================
console.log('🗄️ Sistema de inicialización de DB cargado');

class DBInitializer {
    constructor() {
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return true;
        
        console.log('🔧 Verificando datos iniciales...');
        
        try {
            // Verificar si ya hay datos
            const { data: pilotos, error: pilotosError } = await supabase
                .from('pilotos_catalogo')
                .select('count');
            
            // Si no hay pilotos, crear datos demo
            if (!pilotos || pilotos.length === 0) {
                console.log('📝 Creando datos iniciales...');
                await this.createDemoData();
            }
            
            this.initialized = true;
            console.log('✅ Base de datos verificada');
            return true;
            
        } catch (error) {
            console.error('❌ Error verificando base de datos:', error);
            return false;
        }
    }
    
    async createDemoData() {
        try {
            // 1. Crear pilotos demo
            const pilotosDemo = [
                {
                    nombre: 'Max Verstappen',
                    habilidad: 95,
                    experiencia: 10,
                    salario_base: 5000000,
                    disponible: true,
                    nacionalidad: 'Países Bajos',
                    equipo_original: 'Red Bull Racing'
                },
                {
                    nombre: 'Lewis Hamilton',
                    habilidad: 94,
                    experiencia: 17,
                    salario_base: 4000000,
                    disponible: true,
                    nacionalidad: 'Reino Unido',
                    equipo_original: 'Mercedes'
                },
                {
                    nombre: 'Charles Leclerc',
                    habilidad: 92,
                    experiencia: 6,
                    salario_base: 3000000,
                    disponible: true,
                    nacionalidad: 'Mónaco',
                    equipo_original: 'Ferrari'
                },
                {
                    nombre: 'Lando Norris',
                    habilidad: 90,
                    experiencia: 5,
                    salario_base: 2500000,
                    disponible: true,
                    nacionalidad: 'Reino Unido',
                    equipo_original: 'McLaren'
                },
                {
                    nombre: 'Fernando Alonso',
                    habilidad: 93,
                    experiencia: 20,
                    salario_base: 3500000,
                    disponible: true,
                    nacionalidad: 'España',
                    equipo_original: 'Aston Martin'
                }
            ];
            
            const { error: pilotosError } = await supabase
                .from('pilotos_catalogo')
                .insert(pilotosDemo);
            
            if (pilotosError) throw pilotosError;
            
            // 2. Crear calendario GP demo
            const calendarioDemo = [
                {
                    nombre: 'Gran Premio de España',
                    pais: 'España',
                    circuito: 'Circuit de Barcelona-Catalunya',
                    temporada: 2024,
                    fecha_inicio: '2024-06-21',
                    fecha_fin: '2024-06-23',
                    cerrado_apuestas: false
                },
                {
                    nombre: 'Gran Premio de Mónaco',
                    pais: 'Mónaco',
                    circuito: 'Circuito de Mónaco',
                    temporada: 2024,
                    fecha_inicio: '2024-05-24',
                    fecha_fin: '2024-05-26',
                    cerrado_apuestas: true
                },
                {
                    nombre: 'Gran Premio de Italia',
                    pais: 'Italia',
                    circuito: 'Autódromo Nacional de Monza',
                    temporada: 2024,
                    fecha_inicio: '2024-09-01',
                    fecha_fin: '2024-09-03',
                    cerrado_apuestas: false
                }
            ];
            
            const { error: calendarioError } = await supabase
                .from('calendario_gp')
                .insert(calendarioDemo);
            
            if (calendarioError) throw calendarioError;
            
            console.log('✅ Datos demo creados exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error creando datos demo:', error);
            return false;
        }
    }
    
    async checkConnection() {
        try {
            const { data, error } = await supabase
                .from('pilotos_catalogo')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Error de conexión a Supabase:', error);
                return false;
            }
            
            console.log('✅ Conexión a Supabase establecida');
            return true;
            
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            return false;
        }
    }
}

// Inicializar cuando Supabase esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Supabase esté disponible
    const checkSupabase = setInterval(() => {
        if (window.supabase) {
            clearInterval(checkSupabase);
            window.dbInitializer = new DBInitializer();
            
            // Verificar conexión después de login
            if (window.authManager && window.authManager.user) {
                window.dbInitializer.init();
            }
        }
    }, 100);
});

console.log('✅ Inicializador de DB listo');
