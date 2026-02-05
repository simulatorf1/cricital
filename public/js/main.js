// ========================
// F1 MANAGER - MAIN.JS COMPLETO (CON TUTORIAL)
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

const produccionStyles = `
.progress-bar-global {
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
    margin: 5px 0;
    overflow: hidden;
}

.progress-fill-global {
    height: 100%;
    background: linear-gradient(90deg, #00d2be, #0066cc);
    border-radius: 3px;
    transition: width 0.3s ease;
}

.area-progreso-global {
    font-size: 0.7rem;
    color: #aaa;
    margin-top: 2px;
}
`;

const tallerStyles = '';

// ========================
// ========================
// 4. CLASE F1Manager PRINCIPAL CON TUTORIAL
// ========================
class F1Manager {
    constructor(user, escuderia, supabase) {
        console.log('🚗 Creando F1Manager para:', user.email);
        this.user = user;
        this.escuderia = escuderia;
        this.supabase = supabase;
        this.pilotos = [];
        this.carStats = null;
        this.proximoGP = null;
        
        // Nombres personalizados para cada pieza de cada área (50 por área)
        this.nombresPiezas = {
            'suelo': [
                'Aerodinámica básico', 'Difusor estándar', 'Planes de succión', 'Viento v1',
                'Doble difusor', 'Suelo escalonado', 'Alas gaviota', 'Viento v2',
                'Suelo poroso', 'Plus vórtice', 'Difusor soplado', 'viento v3',
                'Suelo flexible', 'Canales flujo', 'Doble plano', 'viento v4',
                'succión activa', 'Difusor ajustable', 'Alas delta', 'viento v5',
                'Suelo magnético', 'Canales helicoidales', 'Difusor turbo', 'viento v6',
                'Sistema antigravitatorio', 'Perfiles adaptativos', 'Difusor cuántico', 'viento v7',
                'Suelo inteligente', 'Microcanales', 'Difusor holográfico', 'viento v8',
                'Sistema de levitación', 'Nanoperfiles', 'Difusor iónico', 'viento v9',
                'Suelo cuántico', 'Canales plasmáticos', 'Difusor gravitatorio', 'viento v10',
                'Sistema distorsión', 'Perfiles temporales', 'Difusor dimensional', 'viento omega',
                'singularidad', 'taquiones', 'Difusor 3f', 'Tecnología final'
            ],
            'motor': [
                'Motor V6 estándar', 'Turbo simple', 'Sistema MGU-H', 'MGU-K v1',
                'Motor V6 turbo', 'Turbocompresor dual', 'Sistema MGU-H+', 'MGU-K v2',
                'Motor V8', 'Turbo variable', 'MGU-H avanzado', 'MGU-K v3',
                'Motor V10', 'Turbocompresor2', 'Sistema híbrido v1', 'MGU-K v4',
                'Motor V12', 'Turbo magnético', 'Sistema híbrido v2', 'MGU-K v5',
                'Motor W16', 'Turbo plasmático', 'Sistema híbrido v3', 'MGU-K v6',
                'Motor rotativo', 'Turbo iónico', 'Sistema híbrido v4', 'MGU-K v7',
                'Motor eléctrico puro', 'Turbo cuántico', 'Sistema híbrido v5', 'MGU-K v8',
                'Motor de fusión', 'Turbo gravitatorio', 'Sistema híbrido v6', 'MGU-K v9',
                'Motor de antimateria', 'Turbo temporal', 'Sistema híbrido v7', 'MGU-K omega',
                'Motor de singularidad', 'Turbo dimensional', 'Sistema híbrido final', 'MGU-K perfecto',
                'Motor cuántico', 'Turbo de taquiones', 'Sistema de agujero de gusano', 'Tecnología final'
            ],
            'aleron_delantero': [
                'Alerón básico', 'Perfiles estándar', 'Elementos endplate', 'Flaps v1',
                'Alerón con DRS', 'Perfiles optimizados', 'Endplate vortex', 'Flaps v2',
                'Alerón ajustable', 'Perfiles aerodinámicos', 'Endplate soplado', 'Flaps v3',
                'Alerón flexible', 'Perfiles adaptativos', 'Endplate magnético', 'Flaps v4',
                'Alerón inteligente', 'Perfiles activos', 'Endplate iónico', 'Flaps v5',
                'Alerón holográfico', 'Perfiles cuánticos', 'Endplate gravitatorio', 'Flaps v6',
                'Alerón cuántico', 'Perfiles temporales', 'Endplate dimensional', 'Flaps v7',
                'Alerón de plasma', 'Perfiles de taquiones', 'Endplate de singularidad', 'Flaps v8',
                'Alerón gravitatorio', 'Perfiles de agujero de gusano', 'Endplate final', 'Flaps omega',
                'Alerón temporal', 'Perfiles omnidireccionales', 'Endplate perfecto', 'Tecnología final'
            ],
            'caja_cambios': [
                'Caja 7 velocidades', 'Cambio secuencial', 'Embrague semiautomático', 'Diferencial v1',
                'Caja 8 velocidades', 'Cambio rápido', 'Embrague dual', 'Diferencial v2',
                'Caja 9 velocidades', 'Cambio instantáneo', 'Embrague magnético', 'Diferencial v3',
                'Caja 10 velocidades', 'Cambio predictivo', 'Embrague iónico', 'Diferencial v4',
                'Caja CVT', 'Cambio adaptativo', 'Embrague cuántico', 'Diferencial v5',
                'Caja magnética', 'Cambio temporal', 'Embrague gravitatorio', 'Diferencial v6',
                'Caja iónica', 'Cambio cuántico', 'Embrague dimensional', 'Diferencial v7',
                'Caja cuántica', 'Cambio de taquiones', 'Embrague de singularidad', 'Diferencial v8',
                'Caja gravitatoria', 'Cambio omnidireccional', 'Embrague perfecto', 'Diferencial omega',
                'Caja temporal', 'Cambio final', 'Embrague final', 'Tecnología final'
            ],
            'pontones': [
                'Pontones estándar', 'Conductos de freno', 'Entradas de aire', 'Salidas v1',
                'Pontones optimizados', 'Conductos mejorados', 'Entradas optimizadas', 'Salidas v2',
                'Pontones soplados', 'Conductos soplados', 'Entradas sopladas', 'Salidas v3',
                'Pontones flexibles', 'Conductos magnéticos', 'Entradas inteligentes', 'Salidas v4',
                'Pontones inteligentes', 'Conductos iónicos', 'Entradas cuánticas', 'Salidas v5',
                'Pontones holográficos', 'Conductos cuánticos', 'Entradas gravitatorias', 'Salidas v6',
                'Pontones cuánticos', 'Conductos gravitatorios', 'Entradas dimensionales', 'Salidas v7',
                'Pontones de plasma', 'Conductos temporales', 'Entradas de taquiones', 'Salidas v8',
                'Pontones gravitatorios', 'Conductos de singularidad', 'Entradas finales', 'Salidas omega',
                'Pontones temporales', 'Conductos finales', 'Entradas perfectas', 'Tecnología final'
            ],
            'suspension': [
                'Suspensión push-rod', 'Amortiguadores v1', 'Barra estabilizadora', 'Muelles v1',
                'Suspensión pull-rod', 'Amortiguadores v2', 'Barra activa', 'Muelles v2',
                'Suspensión activa', 'Amortiguadores magnéticos', 'Barra inteligente', 'Muelles v3',
                'Suspensión hidráulica', 'Amortiguadores iónicos', 'Barra cuántica', 'Muelles v4',
                'Suspensión neumática', 'Amortiguadores cuánticos', 'Barra gravitatoria', 'Muelles v5',
                'Suspensión magnética', 'Amortiguadores gravitatorios', 'Barra temporal', 'Muelles v6',
                'Suspensión iónica', 'Amortiguadores dimensionales', 'Barra de taquiones', 'Muelles v7',
                'Suspensión cuántica', 'Amortiguadores de singularidad', 'Barra final', 'Muelles v8',
                'Suspensión gravitatoria', 'Amortiguadores perfectos', 'Sistema omnidireccional', 'Muelles omega',
                'Suspensión temporal', 'Sistema final', 'Tecnología definitiva', 'Perfección alcanzada'
            ],
            'aleron_trasero': [
                'Alerón trasero básico', 'DRS estándar', 'Flap principal', 'Endplates v1',
                'Alerón optimizado', 'DRS mejorado', 'Flap activo', 'Endplates v2',
                'Alerón soplado', 'DRS magnético', 'Flap inteligente', 'Endplates v3',
                'Alerón flexible', 'DRS iónico', 'Flap cuántico', 'Endplates v4',
                'Alerón inteligente', 'DRS cuántico', 'Flap gravitatorio', 'Endplates v5',
                'Alerón holográfico', 'DRS gravitatorio', 'Flap dimensional', 'Endplates v6',
                'Alerón cuántico', 'DRS temporal', 'Flap de taquiones', 'Endplates v7',
                'Alerón de plasma', 'DRS de singularidad', 'Flap final', 'Endplates v8',
                'Alerón gravitatorio', 'DRS perfecto', 'Sistema omnidireccional', 'Endplates omega',
                'Alerón temporal', 'Tecnología final', 'Perfección aerodinámica', 'Última evolución'
            ],
            'chasis': [
                'Chasis monocasco', 'Estructura v1', 'Protección anti-intrusión', 'Jaula v1',
                'Chasis carbono', 'Estructura v2', 'Protección mejorada', 'Jaula v2',
                'Chasis compuesto', 'Estructura v3', 'Protección activa', 'Jaula v3',
                'Chasis inteligente', 'Estructura v4', 'Protección magnética', 'Jaula v4',
                'Chasis adaptativo', 'Estructura v5', 'Protección iónica', 'Jaula v5',
                'Chasis magnético', 'Estructura v6', 'Protección cuántica', 'Jaula v6',
                'Chasis iónico', 'Estructura v7', 'Protección gravitatoria', 'Jaula v7',
                'Chasis cuántico', 'Estructura v8', 'Protección dimensional', 'Jaula v8',
                'Chasis gravitatorio', 'Estructura v9', 'Protección de taquiones', 'Jaula v9',
                'Chasis temporal', 'Estructura omega', 'Protección final', 'Tecnología definitiva'
            ],
            'frenos': [
                'Frenos de disco', 'Pastillas carbono', 'Pinzas v1', 'Sistema hidráulico',
                'Frenos carbono', 'Pastillas mejoradas', 'Pinzas v2', 'Sistema neumático',
                'Frenos cerámicos', 'Pastillas magnéticas', 'Pinzas v3', 'Sistema magnético',
                'Frenos magnéticos', 'Pastillas iónicas', 'Pinzas v4', 'Sistema iónico',
                'Frenos iónicos', 'Pastillas cuánticas', 'Pinzas v5', 'Sistema cuántico',
                'Frenos cuánticos', 'Pastillas gravitatorias', 'Pinzas v6', 'Sistema gravitatorio',
                'Frenos gravitatorios', 'Pastillas dimensionales', 'Pinzas v7', 'Sistema dimensional',
                'Frenos de plasma', 'Pastillas de taquiones', 'Pinzas v8', 'Sistema temporal',
                'Frenos temporales', 'Pastillas de singularidad', 'Pinzas omega', 'Sistema final',
                'Frenos perfectos', 'Tecnología definitiva', 'Sistema omnidireccional', 'Última evolución'
            ],
            'volante': [
                'Volante básico', 'Botones v1', 'Pantalla LCD', 'Sistema telemetría',
                'Volante mejorado', 'Botones v2', 'Pantalla OLED', 'Telemetría avanzada',
                'Volante táctil', 'Botones haptic', 'Pantalla holográfica', 'Telemetría en tiempo real',
                'Volante inteligente', 'Botones adaptativos', 'Pantalla 3D', 'Telemetría predictiva',
                'Volante holográfico', 'Botones cuánticos', 'Pantalla cuántica', 'Telemetría cuántica',
                'Volante cuántico', 'Botones gravitatorios', 'Pantalla gravitatoria', 'Telemetría gravitatoria',
                'Volante gravitatorio', 'Botones dimensionales', 'Pantalla dimensional', 'Telemetría temporal',
                'Volante temporal', 'Botones de taquiones', 'Pantalla de singularidad', 'Telemetría omnidireccional',
                'Volante perfecto', 'Botones finales', 'Pantalla definitiva', 'Telemetría final',
                'Volante final', 'Tecnología omega', 'Interfaz perfecta', 'Control total'
            ],
            'electronica': [
                'ECU básica', 'Sensores v1', 'Sistema adquisición', 'Telemetría básica',
                'ECU mejorada', 'Sensores v2', 'Adquisición avanzada', 'Telemetría v2',
                'ECU predictiva', 'Sensores v3', 'Sistema inteligente', 'Telemetría v3',
                'ECU inteligente', 'Sensores v4', 'Sistema adaptativo', 'Telemetría v4',
                'ECU cuántica', 'Sensores cuánticos', 'Sistema cuántico', 'Telemetría cuántica',
                'ECU gravitatoria', 'Sensores gravitatorios', 'Sistema gravitatorio', 'Telemetría gravitatoria',
                'ECU temporal', 'Sensores dimensionales', 'Sistema dimensional', 'Telemetría temporal',
                'ECU de taquiones', 'Sensores de taquiones', 'Sistema taquiónico', 'Telemetría omnidireccional',
                'ECU de singularidad', 'Sensores perfectos', 'Sistema final', 'Telemetría definitiva',
                'ECU omega', 'Tecnología final', 'Sistema perfecto', 'Control total'
            ]
        };
        // Sistema de puntos "dientes de sierra" irregular con ceros y bajadas
        this.puntosDientesSierra = {
            // Suelo: Patrón irregular con ceros y saltos
            'suelo': [2, 5, 0, 7, 3, 10, 5, 12, 0, 15, 8, 18, 10, 20, 0, 23, 15, 25, 0, 28,
                      18, 30, 0, 33, 22, 35, 0, 38, 25, 40, 0, 43, 28, 45, 0, 48, 30, 50, 0, 53,
                      32, 55, 0, 58, 35, 60, 0, 63, 38, 65],
            
            // Motor: Más variación con ceros estratégicos
            'motor': [3, 8, 11, 12, 5, 15, 0, 20, 10, 23, 0, 28, 15, 30, 34, 35, 20, 38, 39, 43,
                      25, 45, 0, 0, 1, 52, 0, 57, 30, 60, 0, 65, 32, 68, 40, 73, 35, 75, 36, 80,
                      38, 82, 50, 87, 40, 90, 91, 95, 42, 100],
            
            // Alerón Delantero: Patrón más errático
            'aleron_delantero': [1, 4, 12, 6, 2, 9, 0, 11, 3, 14, 13, 16, 5, 19, 0, 21, 6, 24, 20, 26,
                                 8, 29, 36, 31, 10, 34, 0, 36, 12, 39, 39, 41, 14, 44, 0, 46, 16, 49, 48, 51,
                                 18, 54, 30, 56, 20, 59, 60, 61, 22, 64],
            
            // Caja Cambios: Patrón con algunos ceros
            'caja_cambios': [2, 6, 10, 9, 4, 12, 0, 15, 6, 18, 10, 21, 8, 24, 20, 27, 10, 30, 40, 33,
                             12, 36, 10, 39, 14, 42, 50, 45, 16, 48, 50, 51, 18, 54, 60, 57, 20, 60, 70, 63,
                             22, 66, 20, 69, 24, 72, 78, 75, 26, 78],
            
            // Pontones: Patrón más suave pero con ceros
            'pontones': [1, 3, 0, 5, 2, 7, 10, 9, 3, 11, 0, 13, 4, 15, 20, 17, 5, 19, 5, 21,
                         6, 23, 0, 25, 7, 27, 20, 29, 8, 31, 10, 33, 9, 35, 0, 37, 10, 39, 40, 41,
                         11, 43, 45, 45, 12, 47, 52, 49, 13, 52],
            
            // Suspensión: Variación moderada con ceros
            'suspension': [2, 4, 0, 6, 3, 8, 0, 10, 4, 12, 0, 14, 5, 16, 0, 18, 6, 20, 0, 22,
                           7, 24, 0, 26, 8, 28, 0, 30, 9, 32, 0, 34, 10, 36, 0, 38, 11, 40, 0, 42,
                           12, 44, 0, 46, 13, 48, 0, 50, 14, 55],
            
            // Alerón Trasero: Patrón similar al delantero
            'aleron_trasero': [0, 5, 5, 7, 2, 10, 5, 12, 4, 15, 6, 17, 6, 20, 7, 22, 8, 25, 9, 27,
                               10, 30, 30, 32, 12, 35, 35, 37, 14, 40, 0, 42, 16, 45, 45, 47, 18, 50, 0, 52,
                               20, 55, 0, 57, 22, 60, 0, 62, 24, 65],
            
            // Chasis: Patrón con ceros
            'chasis': [2, 6, 0, 8, 3, 11, 0, 13, 5, 16, 0, 18, 7, 21, 0, 23, 9, 26, 0, 28,
                       11, 31, 0, 33, 13, 36, 0, 38, 15, 41, 0, 43, 17, 46, 0, 48, 19, 51, 0, 53,
                       21, 56, 0, 58, 23, 61, 0, 63, 25, 68],
            
            // Frenos: Patrón más conservador
            'frenos': [1, 3, 5, 5, 2, 7, 5, 9, 3, 11, 20, 13, 4, 15, 20, 17, 5, 19, 20, 21,
                       6, 23, 0, 25, 7, 27, 0, 0, 8, 31, 0, 33, 9, 0, 0, 0, 10, 39, 0, 41,
                       11, 43, 50, 45, 12, 47, 50, 49, 13, 50],
            
            // Volante: Patrón más errático
            'volante': [0, 2, 1, 1, 3, 5, 1, 7, 2, 0, 4, 8, 0, 10, 3, 28, 5, 11, 0, 13,
                        4, 0, 6, 14, 20, 16, 5, 0, 7, 17, 0, 19, 6, 0, 8, 20, 28, 22, 7, 0,
                        9, 23, 0, 25, 8, 0, 10, 26, 0, 28],
            
            // Electrónica: Patrón con más ceros
            'electronica': [0, 0, 0, 5, 0, 7, 4, 0, 5, 9, 5, 11, 6, 18, 7, 13, 0, 15, 8, 0,
                            9, 17, 0, 19, 10, 10, 11, 21, 0, 23, 12, 0, 13, 25, 15, 27, 14, 0,
                            15, 29, 20, 31, 16, 0, 17, 33, 0, 35, 18, 20]
        };


        
    }


    // ========================
    // RECOMPENSA LOGIN DIARIO
    // ========================
    // Añadir después de otros métodos similares
    async verificarRecompensaLoginDiario() {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            
            if (this.escuderia.ultimo_login_dia === hoy) {
                return;
            }
            
            const nuevasEstrellas = (this.escuderia.estrellas_semana || 0) + 5;
            
            const { error } = await this.supabase
                .from('escuderias')
                .update({ 
                    estrellas_semana: nuevasEstrellas,
                    ultimo_login_dia: hoy
                })
                .eq('id', this.escuderia.id);
            
            if (!error) {
                this.escuderia.estrellas_semana = nuevasEstrellas;
                this.escuderia.ultimo_login_dia = hoy;
                
                const estrellasElement = document.getElementById('estrellas-value');
                if (estrellasElement) {
                    estrellasElement.textContent = nuevasEstrellas;
                }
                
                this.showNotification('+5🌟 (bonus diario)', 'info');
            }
        } catch (error) {
            console.error('Error en recompensa login:', error);
        }
    }
    
    async darEstrellasFabricacion() {
        try {
            const { data: escuderiaActualizada } = await this.supabase
                .from('escuderias')
                .select('primera_fabricacion_hoy')
                .eq('id', this.escuderia.id)
                .single();
            
            if (escuderiaActualizada && !escuderiaActualizada.primera_fabricacion_hoy) {
                const nuevasEstrellas = (this.escuderia.estrellas_semana || 0) + 10;
                
                const { error } = await this.supabase
                    .from('escuderias')
                    .update({ 
                        estrellas_semana: nuevasEstrellas,
                        primera_fabricacion_hoy: true
                    })
                    .eq('id', this.escuderia.id);
                
                if (!error) {
                    this.escuderia.estrellas_semana = nuevasEstrellas;
                    this.escuderia.primera_fabricacion_hoy = true;
                    
                    const estrellasElement = document.getElementById('estrellas-value');
                    if (estrellasElement) {
                        estrellasElement.textContent = nuevasEstrellas;
                    }
                    
                    this.showNotification('+10🌟 (primera fabricación del día)', 'info');
                }
            }
        } catch (error) {
            console.error('Error dando estrellas por fabricación:', error);
        }
    }
    
    async verificarResetDiario() {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            
            if (this.escuderia.ultimo_login_dia && this.escuderia.ultimo_login_dia !== hoy) {
                const { error } = await this.supabase
                    .from('escuderias')
                    .update({ 
                        primera_fabricacion_hoy: false,
                        primera_prueba_hoy: false
                    })
                    .eq('id', this.escuderia.id);
                
                if (!error) {
                    this.escuderia.primera_fabricacion_hoy = false;
                    this.escuderia.primera_prueba_hoy = false;
                }
            }
        } catch (error) {
            console.error('Error en reset diario:', error);
        }
    }

    
    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER (MODIFICADO CON 50 BOTONES Y NAVEGACIÓN)
    // ========================
    async cargarTabTaller() {
        console.log('🔧 Cargando pestaña taller con 50 botones y navegación...');
        
        const container = document.getElementById('tab-taller');
        if (!container) {
            console.error('❌ No se encontró #tab-taller');
            return;
        }
        
        if (!this.escuderia || !this.escuderia.id) {
            container.innerHTML = '<p class="error">❌ No se encontró tu escudería</p>';
            return;
        }
        
        try {
            await this.cargarCarStats();
            
            const { data: piezasFabricadas, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('area, nivel, calidad, numero_global')
                .eq('escuderia_id', this.escuderia.id);
    
            if (errorPiezas) {
                console.error('Error cargando piezas:', errorPiezas);
                throw errorPiezas;
            }
            
            const { data: fabricacionesActivas, error: errorFabricaciones } = await this.supabase
                .from('fabricacion_actual')
                .select('area, nivel, tiempo_fin, completada')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorFabricaciones) {
                console.error('Error cargando fabricaciones:', errorFabricaciones);
                throw errorFabricaciones;
            }
            
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            const fabricacionesCount = fabricacionesActivas?.length || 0;
            
            let html = '<div class="taller-minimalista">';
            html += '<div class="taller-header-mini">';
            html += '<h2><i class="fas fa-tools"></i> TALLER DE FABRICACIÓN</h2>';
            html += '<div class="fabricaciones-activas-mini">';
            html += '<span class="badge-fabricacion">' + fabricacionesCount + '/4 fabricando</span>';
            html += '</div>';
            html += '</div>';
            
            // === BARRA DE NAVEGACIÓN FIJA ===
            html += '<div id="nav-areas-taller" class="nav-areas-fija">';
            html += '<div class="nav-areas-contenedor">';
            
            areas.forEach((area, index) => {
                // Contar piezas fabricadas para esta área
                const piezasAreaFabricadas = piezasFabricadas?.filter(p => 
                    p.area === area.id || p.area === area.nombre
                ) || [];
                
                const progreso = piezasAreaFabricadas.length;
                const porcentaje = (progreso / 50) * 100;
                
                html += '<button class="nav-area-btn" data-area="' + area.id + '" ';
                html += 'title="' + area.nombre + ' (' + progreso + '/50)">';
                html += '<span class="nav-area-icon">' + area.icono + '</span>';
                html += '<span class="nav-area-nombre">' + area.nombre + '</span>';
                html += '<div class="nav-area-progreso">';
                html += '<div class="nav-area-progreso-fill" style="width: ' + porcentaje + '%"></div>';
                html += '</div>';
                html += '</button>';
            });
            
            html += '</div>'; // Cierra nav-areas-contenedor
            html += '</div>'; // Cierra nav-areas-fija
            
            // === CONTENEDOR DE ÁREAS DESPLAZABLE ===
            html += '<div id="contenedor-areas-taller" class="contenedor-areas-desplazable">';
            
            // Para cada área
            for (const area of areas) {
                html += '<div class="area-completa" id="area-' + area.id + '">';
                html += '<div class="area-header-completa">';
                html += '<span class="area-icono-completa">' + area.icono + '</span>';
                html += '<span class="area-nombre-completa">' + area.nombre + '</span>';
                
                // Mostrar progreso
                const piezasAreaFabricadas = piezasFabricadas?.filter(p => 
                    p.area === area.id || p.area === area.nombre
                ) || [];
                const progreso = piezasAreaFabricadas.length;
                
                html += '<span class="area-progreso-badge">' + progreso + '/50 mejoras</span>';
                html += '</div>';
                
                html += '<div class="botones-area-completa">';
                
                // Obtener todas las piezas fabricadas para esta área
                const piezasAreaFabricadasAll = piezasFabricadas?.filter(p => 
                    p.area === area.id || p.area === area.nombre
                ) || [];
                
                // Obtener fabricaciones activas para esta área
                const fabricacionesAreaActivas = fabricacionesActivas?.filter(f => 
                    (f.area === area.id || f.area === area.nombre) && !f.completada
                ) || [];
                
                // Para cada una de las 50 piezas
                for (let piezaNum = 1; piezaNum <= 50; piezaNum++) {
                    // Calcular nivel (cada 5 piezas es un nivel)
                    const nivel = Math.ceil(piezaNum / 5);
                    
                    // Verificar si esta pieza ya está fabricada
                    const yaFabricada = piezasAreaFabricadasAll.some(p => p.numero_global === piezaNum);
                    
                    // Verificar si está en fabricación
                    const enFabricacion = fabricacionesAreaActivas.some(f => {
                        // Calcular qué pieza del nivel estaría fabricando
                        const nivelFabricacion = f.nivel;
                        const rangoInicio = (nivelFabricacion - 1) * 5 + 1;
                        const rangoFin = nivelFabricacion * 5;
                        
                        // Encontrar la próxima pieza no fabricada en ese nivel
                        const piezasNivelFabricadas = piezasAreaFabricadasAll.filter(p => {
                            const nivelPieza = Math.ceil(p.numero_global / 5);
                            return nivelPieza === nivelFabricacion;
                        }).length;
                        
                        const proximaPieza = rangoInicio + piezasNivelFabricadas;
                        return proximaPieza === piezaNum && !yaFabricada;
                    });
                    
                    // Nombre personalizado para esta pieza
                    const nombrePieza = this.nombresPiezas[area.id]?.[piezaNum - 1] || `${area.nombre} Mejora ${piezaNum}`;
                    
                    // Calcular puntos (aunque no se muestren en el botón)
                    const puntosPieza = this.calcularPuntosPieza(area.id, piezaNum);
                    
                    if (yaFabricada) {
                        // Ya fabricada
                        html += '<button class="btn-pieza-50 lleno" disabled title="' + nombrePieza + ' - Ya posees esta pieza">';
                        html += '<i class="fas fa-check"></i>';
                        html += '<div class="pieza-nombre-50">' + nombrePieza + '</div>';
                        html += '</button>';
                    } else if (enFabricacion) {
                        // En fabricación
                        const fabricacion = fabricacionesAreaActivas.find(f => {
                            const nivelFabricacion = f.nivel;
                            const rangoInicio = (nivelFabricacion - 1) * 5 + 1;
                            const piezasNivelFabricadas = piezasAreaFabricadasAll.filter(p => {
                                const nivelPieza = Math.ceil(p.numero_global / 5);
                                return nivelPieza === nivelFabricacion;
                            }).length;
                            const proximaPieza = rangoInicio + piezasNivelFabricadas;
                            return proximaPieza === piezaNum;
                        });
                        
                        const tiempoRestante = fabricacion ? new Date(fabricacion.tiempo_fin) - new Date() : 0;
                        const minutos = Math.ceil(tiempoRestante / (1000 * 60));
                        
                        html += '<button class="btn-pieza-50 fabricando" disabled title="' + nombrePieza + ' - En fabricación (' + minutos + ' min)">';
                        html += '<i class="fas fa-spinner fa-spin"></i>';
                        html += '<div class="pieza-nombre-50">' + nombrePieza + '</div>';
                        html += '</button>';
                    } else {
                        // Verificar si es la próxima pieza a fabricar
                        const proximaPiezaNoFabricada = !yaFabricada && 
                            piezaNum === (piezasAreaFabricadasAll.length + 1);
                        
                        const puedeFabricar = fabricacionesCount < 4 && 
                                            this.escuderia.dinero >= 10000 &&
                                            proximaPiezaNoFabricada;
                        
                        html += '<button class="btn-pieza-50 vacio" ';
                        if (puedeFabricar) {
                            html += 'onclick="iniciarFabricacionTallerDesdeBoton(\'' + area.id + '\', ' + nivel + ')"';
                        } else {
                            html += ' disabled';
                        }
                        html += ' title="' + nombrePieza + ' - Nivel ' + nivel + '">';
                        html += '<i class="fas fa-plus"></i>';
                        html += '<div class="pieza-nombre-50">' + nombrePieza + '</div>';
                        html += '</button>';
                    }
                }
                
                html += '</div>'; // Cierra botones-area-completa
                html += '</div>'; // Cierra area-completa
            }
            
            html += '</div>'; // Cierra contenedor-areas-desplazable
            
            html += '<div class="taller-info-mini">';
            html += '<p><i class="fas fa-info-circle"></i> Fabricaciones activas: <strong>' + fabricacionesCount + '/4</strong></p>';
            html += '<p><i class="fas fa-info-circle"></i> Fabricación secuencial: Solo puedes fabricar la siguiente pieza disponible</p>';
            html += '<p><i class="fas fa-info-circle"></i> Cada área tiene 50 mejoras progresivas</p>';
            html += '</div>';
            html += '</div>';
            
            container.innerHTML = html;
            
            // Configurar eventos de navegación
            this.configurarNavegacionAreas();
            
            // Añadir estilos CSS para la nueva disposición
            if (!document.querySelector('#estilos-taller-50')) {
                const style = document.createElement('style');
                style.id = 'estilos-taller-50';
                style.innerHTML = `
                    /* BARRA DE NAVEGACIÓN FIJA */
                    .nav-areas-fija {
                        position: sticky;
                        top: 0;
                        z-index: 100;
                        background: rgba(10, 15, 30, 0.95);
                        backdrop-filter: blur(10px);
                        border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                        padding: 8px 0;
                        margin-bottom: 15px;
                    }
                    
                    .nav-areas-contenedor {
                        display: grid;
                        grid-template-columns: repeat(6, 1fr);
                        gap: 6px;
                        max-width: 100%;
                        overflow-x: auto;
                        padding: 0 5px;
                    }
                    
                    @media (min-width: 1200px) {
                        .nav-areas-contenedor {
                            grid-template-columns: repeat(11, 1fr);
                        }
                    }
                    
                    @media (max-width: 1199px) and (min-width: 768px) {
                        .nav-areas-contenedor {
                            grid-template-columns: repeat(6, 1fr);
                        }
                    }
                    
                    @media (max-width: 767px) {
                        .nav-areas-contenedor {
                            grid-template-columns: repeat(4, 1fr);
                        }
                    }
                    
                    .nav-area-btn {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 210, 190, 0.1);
                        border: 1px solid rgba(0, 210, 190, 0.3);
                        border-radius: 6px;
                        padding: 8px 4px;
                        cursor: pointer;
                        transition: all 0.2s;
                        min-height: 60px;
                        color: white;
                    }
                    
                    .nav-area-btn:hover {
                        background: rgba(0, 210, 190, 0.2);
                        border-color: #00d2be;
                        transform: translateY(-2px);
                    }
                    
                    .nav-area-btn.active {
                        background: rgba(0, 210, 190, 0.3);
                        border-color: #00d2be;
                        box-shadow: 0 0 10px rgba(0, 210, 190, 0.3);
                    }
                    
                    .nav-area-icon {
                        font-size: 1.3rem;
                        margin-bottom: 4px;
                    }
                    
                    .nav-area-nombre {
                        font-size: 0.7rem;
                        font-weight: bold;
                        margin-bottom: 4px;
                        text-align: center;
                        line-height: 1.1;
                    }
                    
                    .nav-area-progreso {
                        width: 90%;
                        height: 4px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 2px;
                        overflow: hidden;
                    }
                    
                    .nav-area-progreso-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #00d2be, #4CAF50);
                        border-radius: 2px;
                        transition: width 0.3s ease;
                    }
                    
                    /* CONTENEDOR DESPLAZABLE */
                    .contenedor-areas-desplazable {
                        max-height: calc(100vh - 200px);
                        overflow-y: auto;
                        padding-right: 5px;
                    }
                    
                    /* ÁREAS INDIVIDUALES */
                    .area-completa {
                        margin-bottom: 25px;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        border: 1px solid rgba(0, 210, 190, 0.2);
                        scroll-margin-top: 100px; /* Para que al hacer scroll quede debajo de la barra fija */
                    }
                    
                    .area-header-completa {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .area-icono-completa {
                        font-size: 1.5rem;
                    }
                    
                    .area-nombre-completa {
                        font-weight: bold;
                        color: #00d2be;
                        font-size: 1.1rem;
                    }
                    
                    .area-progreso-badge {
                        margin-left: auto;
                        background: rgba(0, 210, 190, 0.2);
                        color: #00d2be;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 0.8rem;
                        font-weight: bold;
                    }
                    
                    .botones-area-completa {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 8px;
                    }
                    
                    @media (max-width: 1200px) {
                        .botones-area-completa {
                            grid-template-columns: repeat(4, 1fr);
                        }
                    }
                    
                    @media (max-width: 900px) {
                        .botones-area-completa {
                            grid-template-columns: repeat(3, 1fr);
                        }
                    }
                    
                    @media (max-width: 600px) {
                        .botones-area-completa {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                    
                    .btn-pieza-50 {
                        height: 80px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid rgba(0, 210, 190, 0.3);
                        border-radius: 6px;
                        background: rgba(0, 0, 0, 0.5);
                        color: white;
                        cursor: pointer;
                        transition: all 0.2s;
                        padding: 8px;
                        text-align: center;
                    }
                    
                    .btn-pieza-50:hover:not(:disabled) {
                        border-color: #00d2be;
                        background: rgba(0, 210, 190, 0.1);
                        transform: translateY(-2px);
                    }
                    
                    .btn-pieza-50:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    
                    .btn-pieza-50.lleno {
                        border-color: #4CAF50;
                        background: rgba(76, 175, 80, 0.1);
                    }
                    
                    .btn-pieza-50.fabricando {
                        border-color: #FF9800;
                        background: rgba(255, 152, 0, 0.1);
                    }
                    
                    .btn-pieza-50.vacio {
                        border-color: #666;
                        background: rgba(100, 100, 100, 0.1);
                    }
                    
                    .btn-pieza-50 i {
                        font-size: 1.2rem;
                        margin-bottom: 5px;
                    }
                    
                    .pieza-nombre-50 {
                        font-size: 0.7rem;
                        line-height: 1.1;
                        max-height: 32px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                    }
                `;
                document.head.appendChild(style);
            }
            
        } catch (error) {
            console.error('❌ Error cargando taller con 50 botones:', error);
            container.innerHTML = '<div class="error"><h3>❌ Error cargando el taller</h3><p>' + error.message + '</p><button onclick="location.reload()">Reintentar</button></div>';
        }
    }
    
    // ========================
    // CONFIGURAR NAVEGACIÓN ENTRE ÁREAS
    // ========================
    configurarNavegacionAreas() {
        const navButtons = document.querySelectorAll('.nav-area-btn');
        const contenedorAreas = document.getElementById('contenedor-areas-taller');
        
        if (!navButtons.length || !contenedorAreas) return;
        
        // Función para navegar a un área específica
        const navegarAArea = (areaId) => {
            // Remover clase activa de todos los botones
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase activa al botón correspondiente
            const btnActivo = document.querySelector(`.nav-area-btn[data-area="${areaId}"]`);
            if (btnActivo) {
                btnActivo.classList.add('active');
            }
            
            // Encontrar el elemento del área
            const areaElement = document.getElementById(`area-${areaId}`);
            if (areaElement && contenedorAreas) {
                // Hacer scroll suave hasta el área
                areaElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        };
        
        // Agregar evento a cada botón de navegación
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const areaId = btn.dataset.area;
                navegarAArea(areaId);
            });
        });
        
        // Configurar observador de intersección para actualizar botón activo
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    const areaId = entry.target.id.replace('area-', '');
                    
                    // Actualizar botón activo
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    const btnActivo = document.querySelector(`.nav-area-btn[data-area="${areaId}"]`);
                    if (btnActivo) {
                        btnActivo.classList.add('active');
                    }
                }
            });
        }, {
            root: contenedorAreas,
            threshold: 0.5,
            rootMargin: '-100px 0px -100px 0px' // Margen para considerar "visible"
        });
        
        // Observar cada área
        const areasElements = document.querySelectorAll('.area-completa');
        areasElements.forEach(area => observer.observe(area));
        
        // Activar el primer área por defecto
        if (navButtons.length > 0) {
            const primeraArea = navButtons[0].dataset.area;
            navegarAArea(primeraArea);
        }
    }
    
    // ========================
    // MÉTODO CORREGIDO PARA INICIAR FABRICACIÓN
    // ========================
    async iniciarFabricacionTaller(areaId, nivel) {
        console.log('🔧 Iniciando fabricación:', { areaId, nivel });
        
        if (!this.escuderia || !this.escuderia.id) {
            this.showNotification('❌ Error: No tienes escudería', 'error');
            return false;
        }
        
        try {
            const { data: fabricacionesActivas, error: errorLimite } = await this.supabase
                .from('fabricacion_actual')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorLimite) throw errorLimite;
            
            if (fabricacionesActivas && fabricacionesActivas.length >= 4) {
                this.showNotification('❌ Límite alcanzado (máximo 4 fabricaciones simultáneas)', 'error');
                return false;
            }
            
            const { data: piezasExistentes, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivel);
            
            if (errorPiezas) throw errorPiezas;
            
            const numeroPieza = (piezasExistentes?.length || 0) + 1;
            // Obtener número global de pieza para esta área
            const { data: todasPiezasArea } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId);
            
            const numeroPiezaGlobal = (todasPiezasArea?.length || 0) + 1;
            const numeroPiezaEnNivel = ((numeroPiezaGlobal - 1) % 5) + 1;            
            console.log('📊 Fabricando pieza ' + numeroPieza + ' para ' + areaId + ' nivel ' + nivel);
            
            const tiempoMinutos = this.calcularTiempoProgresivo(numeroPiezaGlobal);
            const tiempoMilisegundos = tiempoMinutos * 60 * 1000;
            console.log('⏱️ Tiempo: ' + tiempoMinutos + ' minutos (' + tiempoMilisegundos + 'ms)');
            
            // Calcular costo basado en nivel y número de pieza
            const costo = this.calcularCostoPieza(nivel, numeroPiezaEnNivel);
            
            if (this.escuderia.dinero < costo) {
                this.showNotification('❌ Fondos insuficientes. Necesitas €' + costo.toLocaleString(), 'error');
                return false;
            }
            
            // ✅✅✅ MUEVE ESTO AQUÍ (ARRIBA, ANTES DE USARLO):
            const nombreArea = this.getNombreArea(areaId);
            // Obtener nombre personalizado para la notificación
            let nombrePiezaNotif = nombreArea;
            if (this.nombresPiezas && this.nombresPiezas[areaId]) {
                const nombresArea = this.nombresPiezas[areaId];
                if (numeroPiezaGlobal <= nombresArea.length) {
                    nombrePiezaNotif = nombresArea[numeroPiezaGlobal - 1];
                }
            }
            console.log('🔍 Nombre de pieza calculado:', nombrePiezaNotif);
            // ✅✅✅ FIN DEL MOVIMIENTO
            
            const ahora = new Date();
            const tiempoFin = new Date(ahora.getTime() + tiempoMilisegundos);
            
            console.log('📅 Tiempos:', {
                inicio: ahora.toISOString(),
                fin: tiempoFin.toISOString(),
                diferenciaMinutos: tiempoMinutos
            });
            
            const { data: fabricacion, error: errorCrear } = await this.supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: this.escuderia.id,
                    area: areaId,
                    nivel: nivel,
                    tiempo_inicio: ahora.toISOString(),
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: costo,
                    creada_en: ahora.toISOString()
                }])
                .select()
                .single();
            
            if (errorCrear) throw errorCrear;
            
            this.escuderia.dinero -= costo;
            await this.updateEscuderiaMoney();
            
            // ✅ AHORA SÍ PUEDES USAR nombrePiezaNotif (porque ya existe)
            // Registrar transacción de presupuesto
            try {
                if (window.presupuestoManager && window.presupuestoManager.registrarTransaccion) {
                    await window.presupuestoManager.registrarTransaccion(
                        'gasto',
                        costo,
                        `Fabricación ${nombrePiezaNotif}`, // ← ¡AHORA SÍ EXISTE!
                        'produccion',
                        { 
                            area: areaId, 
                            nivel: nivel,
                            nombre_pieza: nombrePiezaNotif,
                            numero_pieza: numeroPiezaGlobal
                        }
                    );
                    console.log('💰 Transacción registrada en presupuesto');
                }
            } catch (error) {
                console.warn('⚠️ No se pudo registrar transacción:', error);
                // No fallar la fabricación si el registro de transacción falla
            }
            
            const horas = Math.floor(tiempoMinutos / 60);
            const dias = Math.floor(horas / 24);
            let tiempoTexto = '';
            if (dias > 0) {
                tiempoTexto = dias + ' días ' + (horas % 24) + ' horas';
            } else if (horas > 0) {
                tiempoTexto = horas + ' horas ' + (tiempoMinutos % 60) + ' minutos';
            } else {
                tiempoTexto = tiempoMinutos + ' minutos';
            }
            
            const nivelMostrar = "Q" + nivel;
            
            this.showNotification('✅ ' + nombrePiezaNotif + ' en fabricación - ' + tiempoTexto, 'success');                        
            // ✅ AGREGAR TAMBIÉN AQUÍ para actualizar presupuesto en pantalla:
            if (window.presupuestoManager && window.presupuestoManager.actualizarVistaPresupuesto) {
                window.presupuestoManager.actualizarVistaPresupuesto();
            }
            
            // AÑADIR ESTO ↓ - Dar estrellas si es primera fabricación del día
            if (!this.escuderia.primera_fabricacion_hoy) {
                await this.darEstrellasFabricacion();
            }
            // AÑADIR ESTO ↑
            
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando fabricación:', error);
            this.showNotification('❌ Error: ' + error.message, 'error');
            return false;
        }
    }
    
    calcularTiempoProgresivo(numeroPiezaGlobal) {
        // Tabla de tiempos para 50 piezas en minutos
        const tiemposPorPiezaGlobal = {
            1: 2,      // Nivel 1, Pieza 1: 2 min
            2: 15,     // Nivel 1, Pieza 2: 15 min
            3: 30,     // Nivel 1, Pieza 3: 30 min
            4: 60,     // Nivel 1, Pieza 4: 1 hora
            5: 120,    // Nivel 1, Pieza 5: 2 horas
            6: 180,    // Nivel 2, Pieza 1: 3 horas
            7: 240,    // Nivel 2, Pieza 2: 4 horas
            8: 360,    // Nivel 2, Pieza 3: 6 horas
            9: 480,    // Nivel 2, Pieza 4: 8 horas
            10: 720,   // Nivel 2, Pieza 5: 12 horas
            11: 900,   // Nivel 3, Pieza 1: 15 horas
            12: 1080,  // Nivel 3, Pieza 2: 18 horas
            13: 1260,  // Nivel 3, Pieza 3: 21 horas
            14: 1440,  // Nivel 3, Pieza 4: 1 día
            15: 1620,  // Nivel 3, Pieza 5: 1.125 días
            // Niveles 4-10: progresión más lenta
            16: 1800, 17: 2160, 18: 2520, 19: 2880, 20: 3240, // Nivel 4: 1.25-2.25 días
            21: 3600, 22: 4320, 23: 5040, 24: 5760, 25: 6480, // Nivel 5: 2.5-4.5 días
            26: 7200, 27: 8640, 28: 10080, 29: 11520, 30: 12960, // Nivel 6: 5-9 días
            31: 14400, 32: 17280, 33: 20160, 34: 23040, 35: 25920, // Nivel 7: 10-18 días
            36: 28800, 37: 34560, 38: 40320, 39: 46080, 40: 51840, // Nivel 8: 20-36 días
            41: 57600, 42: 69120, 43: 80640, 44: 92160, 45: 103680, // Nivel 9: 40-72 días
            46: 115200, 47: 126720, 48: 138240, 49: 149760, 50: 161280 // Nivel 10: 80-112 días
        };
        
        // Si es una pieza mayor a 50, usar progresión continua
        if (numeroPiezaGlobal > 50) {
            const diasExtra = Math.floor((numeroPiezaGlobal - 50) / 5) * 7;
            return 161280 + (diasExtra * 24 * 60);
        }
        
        return tiemposPorPiezaGlobal[numeroPiezaGlobal] || 161280;
    }

    calcularCostoPieza(nivel, numeroPiezaEnNivel) {
        // Costes base por nivel (en euros)
        const costesBase = [
            0,           // nivel 0 (no existe)
            100000,      // nivel 1: €100K
            350000,      // nivel 2: €350K
            700000,      // nivel 3: €700K
            1200000,     // nivel 4: €1.2M
            2000000,     // nivel 5: €2M
            4000000,     // nivel 6: €4M
            8000000,     // nivel 7: €8M
            13000000,    // nivel 8: €13M
            18000000,    // nivel 9: €18M
            23000000     // nivel 10: €23M
        ];
        
        const base = costesBase[nivel] || 23000000;
        // Incremento del 10% por cada pieza dentro del mismo nivel
        return Math.floor(base * Math.pow(1.1, numeroPiezaEnNivel - 1));
    }
    
    calcularPuntosPieza(areaId, numeroPiezaGlobal) {
        // USAR SISTEMA PERSONALIZADO "DIENTES DE SIERRA"
        if (this.puntosDientesSierra && 
            this.puntosDientesSierra[areaId] && 
            this.puntosDientesSierra[areaId][numeroPiezaGlobal - 1] !== undefined) {
            
            return this.puntosDientesSierra[areaId][numeroPiezaGlobal - 1];
        }
        
        // Fallback a la fórmula antigua si no hay datos
        console.warn('⚠️ No hay puntos personalizados para', areaId, 'pieza', numeroPiezaGlobal);
        const puntosBase = 10 * Math.pow(1.25, numeroPiezaGlobal - 1);
        return Math.floor(puntosBase);
    }
    
    async obtenerNumeroPiezaGlobal(areaId, nivel) {
        if (!this.escuderia || !this.escuderia.id) return 1;
        
        try {
            // Contar todas las piezas fabricadas para esta área
            const { data: piezasExistentes, error } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId);
            
            if (error) throw error;
            
            return (piezasExistentes?.length || 0) + 1;
            
        } catch (error) {
            console.error('Error obteniendo número de pieza global:', error);
            return 1;
        }
    }    
    getNombreArea(areaId) {
        const areas = {
            'suelo': 'Suelo',
            'motor': 'Motor',
            'aleron_delantero': 'Alerón Delantero',
            'caja_cambios': 'Caja Cambios',
            'pontones': 'Pontones',
            'suspension': 'Suspensión',
            'aleron_trasero': 'Alerón Trasero',
            'chasis': 'Chasis',
            'frenos': 'Frenos',
            'volante': 'Volante',
            'electronica': 'Electrónica'
        };
        return areas[areaId] || areaId;
    }
    
    calcularTiempoFabricacion(piezaNumero) {
        const tiemposEspeciales = {
            1: 2,
            2: 4,
            3: 15,
            4: 30,
            5: 60
        };
        
        if (tiemposEspeciales[piezaNumero]) {
            return tiemposEspeciales[piezaNumero];
        }
        
        return 60 + ((piezaNumero - 5) * 50);
    }
    
    async subirNivelArea(areaId) {
        console.log('⬆️ Subiendo nivel del área:', areaId);
        
        if (!this.escuderia || !this.escuderia.id || !this.carStats) {
            this.showNotification('❌ Error: No se encontraron datos del coche', 'error');
            return;
        }
        
        try {
            const nivelActual = this.carStats[areaId + '_nivel'] || 0;
            const nivelSiguiente = nivelActual + 1;
            
            const { data: piezasArea, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivelSiguiente)
                .eq('equipada', false);
            
            if (errorPiezas) throw errorPiezas;
            
            if (!piezasArea || piezasArea.length < 5) {
                this.showNotification('❌ Necesitas 5 evoluciones del mismo nivel ' + nivelSiguiente + ' para subir de nivel', 'error');
                return;
            }
            
            const campoNivel = areaId + '_nivel';
            const campoProgreso = areaId + '_progreso';
            
            const nuevosStats = {
                [campoNivel]: nivelSiguiente,
                [campoProgreso]: 0,
                actualizado_en: new Date().toISOString()
            };
            
            const { error: errorStats } = await this.supabase
                .from('coches_stats')
                .update(nuevosStats)
                .eq('escuderia_id', this.escuderia.id);
            
            if (errorStats) throw errorStats;
            
            const idsPiezas = piezasArea.slice(0, 5).map(p => p.id);
            
            const { error: errorEquipar } = await this.supabase
                .from('almacen_piezas')
                .update({ equipada: true })
                .in('id', idsPiezas);
            
            if (errorEquipar) throw errorEquipar;
            
            this.carStats[campoNivel] = nivelSiguiente;
            this.carStats[campoProgreso] = 0;
            
            const areasNombres = {
                'suelo': 'Suelo',
                'motor': 'Motor',
                'aleron_delantero': 'Alerón Delantero',
                'caja_cambios': 'Caja de Cambios',
                'pontones': 'Pontones',
                'suspension': 'Suspensión',
                'aleron_trasero': 'Alerón Trasero',
                'chasis': 'Chasis',
                'frenos': 'Frenos',
                'volante': 'Volante',
                'electronica': 'Electrónica'
            };
            
            const nombreArea = areasNombres[areaId] || areaId;
            this.showNotification('✅ ' + nombreArea + ' subido a nivel ' + nivelSiguiente + '!', 'success');
            
            setTimeout(() => {
                this.cargarTabTaller();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error subiendo nivel:', error);
            this.showNotification('❌ Error subiendo nivel: ' + error.message, 'error');
        }
    }

    async inicializarSistemasIntegrados() {
        console.log('🔗 Inicializando sistemas integrados...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para inicializar sistemas');
            return;
        }
        if (window.MercadoManager && !window.window.mercadoManager) {
            console.log('🔧 Creando mercadoManager...');
            window.mercadoManager = new window.MercadoManager();
        }
        if (window.mercadoManager && typeof window.mercadoManager.inicializar === 'function') {
            await window.mercadoManager.inicializar(this.escuderia);
            console.log('✅ Sistema de mercado inicializado');
        }
        if (window.FabricacionManager && !window.fabricacionManager) {
            console.log('🔧 Creando fabricacionManager...');
            window.fabricacionManager = new window.FabricacionManager();
        }
        
        if (window.fabricacionManager && typeof window.fabricacionManager.inicializar === 'function') {
            await window.fabricacionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de fabricación inicializado');
        }
        
        console.log('🔧 FORZANDO creación de almacenManager...');
        
        if (!window.AlmacenManager) {
            console.log('⚠️ Clase AlmacenManager no existe, creando básica...');
            window.AlmacenManager = class AlmacenManagerBasico {
                constructor() {
                    this.escuderiaId = null;
                    this.piezas = [];
                }
                
                async inicializar(escuderiaId) {
                    this.escuderiaId = escuderiaId;
                    console.log('✅ almacenManager inicializado para escudería: ' + escuderiaId);
                    return true;
                }
                
                async cargarPiezas() {
                    if (!this.escuderiaId) return [];
                    try {
                        const { data, error } = await supabase
                            .from('almacen_piezas')
                            .select('*')
                            .eq('escuderia_id', this.escuderiaId)
                            .order('fabricada_en', { ascending: false });
                        
                        if (error) throw error;
                        this.piezas = data || [];
                        return this.piezas;
                    } catch (error) {
                        console.error('Error cargando piezas:', error);
                        return [];
                    }
                }
            };
        }
        
        if (!window.almacenManager) {
            window.almacenManager = new window.AlmacenManager();
            console.log('✅ Instancia de almacenManager creada');
        }
        
        if (window.almacenManager && this.escuderia && this.escuderia.id) {
            await window.almacenManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de almacén inicializado (GARANTIZADO)');
        }
        
        if (window.IntegracionManager) {
            window.integracionManager = new window.IntegracionManager();
            await window.integracionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de integración inicializado');
        }
        if (window.IngenieriaManager && !window.ingenieriaManager) {
            console.log('🔧 Creando ingenieriaManager...');
            try {
                window.ingenieriaManager = new window.IngenieriaManager(this);
                await window.ingenieriaManager.inicializar();
                console.log('✅ Sistema de ingeniería inicializado');
            } catch (error) {
                console.error('❌ Error inicializando ingeniería:', error);
            }
        } else if (window.ingenieriaManager) {
            console.log('✅ ingenieriaManager ya existe');
        } else {
            console.warn('⚠️ IngenieriaManager no disponible en window');
        }
        
        // AÑADIR ESTO ↓ - Timer para pago dominical
        setInterval(() => {
            this.verificarPagoDominical();
        }, 3600000); // 1 hora
        
        // Ejecutar inmediatamente al cargar
        this.verificarPagoDominical();
        // AÑADIR ESTO ↑
        
        this.iniciarTimersAutomaticos();
    }
    
    iniciarTimersAutomaticos() {
        if (this.timersAutomaticos) {
            Object.values(this.timersAutomaticos).forEach(timer => {
                clearInterval(timer);
            });
        }
        
        this.timersAutomaticos = {
            produccion: setInterval(() => {
                if (window.fabricacionManager && window.fabricacionManager.actualizarUIProduccion) {
                    window.fabricacionManager.actualizarUIProduccion(true);
                }
            }, 1000),
            
            dashboard: setInterval(() => {
                this.updateProductionMonitor();
            }, 3000)
        };
        
        console.log('⏱️ Timers automáticos iniciados');
    }

    async cargarPiezasMontadas() {
        console.log('🎯 Cargando piezas montadas...');
        
        const contenedor = document.getElementById('grid-piezas-montadas');
        if (!contenedor) return;
        
        try {
            const { data: piezasMontadas } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
            const mapeoAreas = {
                'Suelo y Difusor': 'suelo',
                'Motor': 'motor',
                'Aerodinámica': 'aerodinamica',
                'Chasis': 'chasis',
                'Suspensión': 'suspension',
                'Frenos': 'frenos',
                'Transmisión': 'transmision',
                'Electrónica': 'electronica',
                'Volante': 'volante',
                'Pontones': 'pontones',
                'Alerón Delantero': 'aleron_delantero',
                'Alerón Trasero': 'aleron_trasero',
                'Caja de Cambios': 'caja_cambios'
            };
            
            const piezasPorArea = {};
            piezasMontadas?.forEach(p => {
                const areaId = mapeoAreas[p.area] || p.area.toLowerCase().replace(/ /g, '_');
                piezasPorArea[areaId] = p;
            });
            
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            let puntosTotales = 0;
            let html = '';
            
            areas.forEach(area => {
                const pieza = piezasPorArea[area.id];
                
                if (pieza) {
                    puntosTotales += pieza.puntos_base || 0;
                    
                    // Obtener nombre personalizado de la pieza
                    let nombreMostrar = pieza.componente || area.nombre;
                    if (pieza.numero_global && this.nombresPiezas && 
                        this.nombresPiezas[area.id] && 
                        pieza.numero_global <= this.nombresPiezas[area.id].length) {
                        nombreMostrar = this.nombresPiezas[area.id][pieza.numero_global - 1];
                    }
                    
                    // Crear contenido con área arriba y pieza abajo
                    html += '<div class="boton-area-montada" onclick="irAlAlmacenDesdePiezas()" title="' + area.nombre + ': ' + nombreMostrar + '">';
                    html += '<div class="icono-area">' + area.icono + '</div>';
                    html += '<div class="area-pieza-info">';
                    html += '<div class="area-nombre-titulo">' + area.nombre + '</div>';
                    html += '<div class="pieza-nombre-detalle">' + nombreMostrar + '</div>';
                    html += '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()" title="Sin pieza - Click para equipar">';
                    html += '<div class="icono-area">+</div>';
                    html += '<div class="area-pieza-info">';
                    html += '<div class="area-nombre-titulo">' + area.nombre + '</div>';
                    html += '<div class="pieza-nombre-detalle" style="color: #888; font-size: 0.8rem;">Vacío</div>';
                    html += '</div>';
                    html += '</div>';
                }
            });
            
            contenedor.innerHTML = html;
            
            const puntosElement = document.getElementById('puntos-totales-montadas');
            if (puntosElement) {
                puntosElement.textContent = puntosTotales;
            }
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            this.mostrarBotonesVacios(contenedor);
        }
    }
    
    mostrarBotonesVacios(contenedor) {
        const areas = ['Suelo', 'Motor', 'Alerón Del.', 'Caja Cambios', 'Pontones', 
                       'Suspensión', 'Alerón Tras.', 'Chasis', 'Frenos', 'Volante', 'Electrónica'];
        
        let html = '';
        areas.forEach(area => {
            html += '<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()">';
            html += '<div class="icono-area">+</div>';
            html += '<div class="nombre-area">' + area + '</div>';
            html += '<div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>';
            html += '</div>';
        });
        
        contenedor.innerHTML = html;
    }

    async loadPilotosContratados() {
        if (!this.escuderia || !this.escuderia.id || !this.supabase) {
            console.log('❌ No hay escudería o supabase');
            return;
        }
    
        try {
            console.log('👥 Cargando ingenieros contratados...');
            const { data: ingenieros, error } = await this.supabase
                .from('ingenieros_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true)
                .order('contratado_en', { ascending: false });
    
            if (error) throw error;
    
            this.pilotos = ingenieros || [];
            console.log('✅ ' + this.pilotos.length + ' ingeniero(s) cargado(s)');
            
            this.updatePilotosUI();
            
        } catch (error) {
            this.pilotos = [];
            console.error('❌ Error cargando ingenieros:', error);
            this.updatePilotosUI();
        }
    }

    async cargarCarStats() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats, error } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .maybeSingle();
            
            if (!error && stats) {
                this.carStats = stats;
            }
        } catch (error) {
            console.error('Error cargando car stats:', error);
        }
    }

    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard COMPACTO con funcionalidad completa...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }

        await this.cargarProximoGP();
        
        function formatearFecha(fechaStr) {
            if (!fechaStr) return 'Fecha no definida';
            const fecha = new Date(fechaStr);
            const opciones = { 
                day: 'numeric', 
                month: 'short'
            };
            return fecha.toLocaleDateString('es-ES', opciones);
        }
                
        const countdownHTML = `
            <div class="countdown-f1-container">
                <div class="countdown-header-f1">
                    <div class="countdown-title">
                        <i class="fas fa-flag-checkered"></i>
                        <h2>PRÓXIMA CARRERA</h2>
                    </div>
                    <button class="btn-calendario-mini" id="btn-calendario" 
                            onclick="mostrarCalendarioSimple()"
                            title="Ver calendario completo">
                        <i class="fas fa-calendar-alt"></i>
                        CALENDARIO
                    </button>
                </div>
                
                <div class="carrera-info-f1" style="margin-bottom: 5px;">
                    <div class="carrera-nombre-f1" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0;">
                        <i class="fas fa-trophy" style="color: #FFD700;"></i>
                        <span id="nombre-carrera" style="color: white; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: bold;">
                            ${this.proximoGP?.nombre || 'No hay carreras'}
                        </span>
                    </div>
                </div>
                
                <div class="countdown-main-f1">
                    <div class="countdown-label">CIERRE DE APUESTAS EN:</div>
                    
                    <div class="timer-container-f1">
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-dias">--</div>
                            <div class="time-label-f1">DÍAS</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-horas">--</div>
                            <div class="time-label-f1">HORAS</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-minutos">--</div>
                            <div class="time-label-f1">MIN</div>
                        </div>
                        
                        <div class="time-separator-f1">:</div>
                        
                        <div class="time-unit-f1">
                            <div class="time-value-f1" id="countdown-segundos">--</div>
                            <div class="time-label-f1">SEG</div>
                        </div>
                    </div>
                </div>
                
                <button class="btn-pronostico-f1" id="btn-estado-apuestas" onclick="irAPestañaPronosticos()">
                    <i class="fas fa-paper-plane"></i>
                    <span>ENVIAR PRONÓSTICO</span>
                </button>
            </div>
        `;

        document.body.innerHTML = `
            <div id="app" style="min-height: 100vh; display: flex; flex-direction: column;">
                <header class="dashboard-header-compacto">
                    <div class="header-left-compacto">
                        <div class="logo-compacto">
                            <i class="fas fa-flag-checkered"></i>
                            <span id="escuderia-nombre">${this.escuderia.nombre}</span>
                        </div>
                        <div class="money-display-compacto">
                            <i class="fas fa-coins"></i>
                            <span id="money-value">€${this.escuderia?.dinero?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="estrellas-display-compacto" onclick="mostrarExplicacionEstrellas()" title="Click para más info">
                            <i class="fas fa-star" style="color: #FFD700;"></i>
                            <span id="estrellas-value">${this.escuderia?.estrellas_semana || 0}</span>
                        </div>
                    </div>
                    
                    <!-- 4 PESTAÑAS ARRIBA -->
                    <nav class="tabs-compactas">
                        <button class="tab-btn-compacto active" data-tab="principal">
                            <i class="fas fa-home"></i> Principal
                        </button>
                        <button class="tab-btn-compacto" data-tab="taller">
                            <i class="fas fa-tools"></i> Taller
                        </button>
                        <button class="tab-btn-compacto" data-tab="almacen">
                            <i class="fas fa-warehouse"></i> Almacén
                        </button>
                        <button class="tab-btn-compacto" data-tab="ingenieria">
                            <i class="fas fa-flask"></i> Ingeniería
                        </button>
                    </nav>
                </header>
                
                <!-- CONTENIDO PRINCIPAL (SOLO ESTO CAMBIARÁ CON LAS PESTAÑAS) -->
                <div id="main-content-area" style="flex: 1; overflow-y: auto;">
                    <div id="tab-principal" class="tab-content active">
                        <div class="three-columns-layout">
                            <div class="col-estrategas">
                                <div class="section-header">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <h2><i class="fas fa-users"></i> ESTRATEGAS</h2>
                                        <button class="btn-gestionar-estrategas" onclick="gestionarEstrategas()" style="
                                            background: rgba(0,210,190,0.1);
                                            border: 1px solid rgba(0,210,190,0.4);
                                            color: #00d2be;
                                            border-radius: 4px;
                                            font-size: 0.7rem;
                                            padding: 2px 6px;
                                            cursor: pointer;
                                            display: flex;
                                            align-items: center;
                                            gap: 3px;
                                            white-space: nowrap;
                                        ">
                                            <i class="fas fa-cog"></i> GESTIONAR
                                        </button>
                                    </div>
                                    <span class="badge" id="contador-estrategas">0/4</span>
                                </div>
                                
                                <div id="pilotos-container" class="pilotos-container">
                                </div>
                            </div>
                            
                            <div class="col-countdown">
                                ${countdownHTML}
                            </div>
                            
                            <div class="col-fabrica">
                                <div class="monitor-fabrica">
                                    <div class="section-header">
                                        <h2><i class="fas fa-industry"></i> PRODUCCIÓN</h2>
                                        <div id="alerta-almacen" class="alerta-almacen" style="display: none;">
                                            <i class="fas fa-bell"></i>
                                            <span>¡Piezas nuevas en almacén!</span>
                                        </div>
                                    </div>
                                    <div id="produccion-actual" class="produccion-actual">
                                        <div id="produccion-slots" class="produccion-slots" style="
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            grid-template-rows: repeat(2, 1fr);
                                            gap: 8px;
                                            height: 100%;
                                            padding: 5px;
                                        ">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <section class="piezas-montadas">
                            <div class="section-header">
                                <h2><i class="fas fa-car"></i> PIEZAS MONTADAS EN EL COCHE</h2>
                            </div>
                            
                            <div id="grid-piezas-montadas" class="grid-11-columns">
                            </div>
                        </section>
                    </div>
                    
                    <div id="tab-taller" class="tab-content"></div>
                    <div id="tab-almacen" class="tab-content"></div>
                    <div id="tab-ingenieria" class="tab-content"></div>
                    
                    <!-- PESTAÑAS ABAJO (inicialmente ocultas) -->
                    <div id="tab-mercado" class="tab-content">
                        <div class="mercado-cargando">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Cargando mercado...</p>
                        </div>
                    </div>
                    <div id="tab-pronosticos" class="tab-content"></div>
                    <div id="tab-presupuesto" class="tab-content"></div>
                    <div id="tab-clasificacion" class="tab-content"></div>
                </div>
                
                <!-- FOOTER FIJO - SIEMPRE VISIBLE -->
                <footer class="dashboard-footer" style="
                    position: sticky;
                    bottom: 0;
                    background: #1a1a2e;
                    border-top: 1px solid rgba(0, 210, 190, 0.3);
                    z-index: 1000;
                ">
                    <div class="user-info-compacto">
                        <i class="fas fa-user-circle"></i>
                        <span>${this.user.email?.split('@')[0] || 'Usuario'}</span>
                    </div>
                    
                    <!-- 4 PESTAÑAS ABAJO - USANDO LA MISMA CLASE QUE ARRIBA -->
                    <nav class="tabs-compactas" style="flex: 1; justify-content: center; margin: 0 10px;">
                        <button class="tab-btn-compacto" data-tab="mercado">
                            <i class="fas fa-shopping-cart"></i> Mercado
                        </button>
                        <button class="tab-btn-compacto" data-tab="pronosticos">
                            <i class="fas fa-chart-line"></i> Pronósticos
                        </button>
                        <button class="tab-btn-compacto" data-tab="presupuesto">
                            <i class="fas fa-chart-pie"></i> Presupuesto
                        </button>
                        <button class="tab-btn-compacto" data-tab="clasificacion">
                            <i class="fas fa-medal"></i> Clasificación
                        </button>
                    </nav>
                    
                    <button class="logout-btn-compacto" id="logout-btn-visible" title="Cerrar sesión" style="
                        background: rgba(225, 6, 0, 0.1);
                        border: 1px solid rgba(225, 6, 0, 0.3);
                        color: #e10600;
                        padding: 4px 10px;
                        border-radius: 8px;
                        font-size: 0.8rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <i class="fas fa-sign-out-alt"></i> Salir
                    </button>
                    <div style="font-size: 0.7rem; color: #666;">
                        CRITICAL LAP v1.0
                    </div>
                </footer>
            </div>

            
            <script>
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                }, 1000);
                
                document.querySelectorAll('.tab-btn-compacto').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const tabId = e.currentTarget.dataset.tab;
                        
                        document.querySelectorAll('.tab-btn-compacto').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        
                        e.currentTarget.classList.add('active');
                        document.getElementById('tab-' + tabId).classList.add('active');
                        
                        if (window.tabManager && window.tabManager.switchTab) {
                            window.tabManager.switchTab(tabId);
                        }
                        
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                            }, 100);
                        }
                    });
                });
                
                const logoutBtn = document.getElementById('logout-btn-visible');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            const supabaseClient = window.supabase;
                            if (supabaseClient) {
                                await supabaseClient.auth.signOut();
                                console.log('✅ Sesión cerrada');
                                window.location.href = window.location.origin;
                            }
                        } catch (error) {
                            console.error('❌ Error cerrando sesión:', error);
                            window.location.href = window.location.origin;
                        }
                    });
                }
                
                window.irAlTallerDesdeProduccion = function() {
                    document.querySelector('[data-tab="taller"]').click();
                };
                
                window.gestionarEstrategas = function() {
                    if (window.f1Manager && window.f1Manager.mostrarModalContratacion) {
                        window.f1Manager.mostrarModalContratacion();
                    }
                };
                
                window.cargarContenidoPrincipal = async function() {
                    if (window.f1Manager) {
                        if (window.f1Manager.cargarPiezasMontadas) {
                            await window.f1Manager.cargarPiezasMontadas();
                        }
                        if (window.f1Manager.loadPilotosContratados) {
                            await window.f1Manager.loadPilotosContratados();
                        }
                        if (window.f1Manager.updateProductionMonitor) {
                            window.f1Manager.updateProductionMonitor();
                        }
                    }
                };
                
                setTimeout(() => {
                    if (window.cargarContenidoPrincipal) {
                        window.cargarContenidoPrincipal();
                    }
                }, 1500);
            </script>
        `;

        document.getElementById('logout-btn-visible').addEventListener('click', async () => {
            try {
                console.log('🔒 Cerrando sesión...');
                const { error } = await this.supabase.auth.signOut();
                if (error) {
                    console.error('❌ Error al cerrar sesión:', error);
                    this.showNotification('Error al cerrar sesión', 'error');
                } else {
                    console.log('✅ Sesión cerrada, recargando...');
                    location.reload();
                }
            } catch (error) {
                console.error('❌ Error inesperado:', error);
                this.showNotification('Error inesperado', 'error');
            }
        });
        
        setTimeout(async () => {
            console.log('🔧 Inicializando sistemas críticos del dashboard...');
            
            if (!window.fabricacionManager && window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                if (this.escuderia) {
                    await window.fabricacionManager.inicializar(this.escuderia.id);
                }
            }
            
            setTimeout(() => {
                if (window.tabManager && window.tabManager.setup) {
                    const originalSwitchTab = window.tabManager.switchTab;
                    
                    window.tabManager.switchTab = function(tabId) {
                        originalSwitchTab.call(this, tabId);
                        
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                            }, 100);
                        }
                    };
                    
                    window.tabManager.setup();
                }
            }, 400);
            
            const supabase = window.supabase;
            if (supabase) {
                await this.loadCarStatus();
                await this.loadPilotosContratados();
                await this.cargarProximoGP();
                await this.verificarResetDiario();
                await this.verificarRecompensaLoginDiario();
                
                
                setTimeout(() => {
                    this.iniciarCountdownCompacto();
                }, 500);
                
                setTimeout(async () => {
                    await this.cargarPiezasMontadas();
                }, 500);
            }
            
            console.log('✅ Dashboard compacto cargado correctamente con toda la funcionalidad');
            
            setTimeout(() => {
                const loadingScreen = document.getElementById('f1-loading-screen');
                if (loadingScreen) {
                    loadingScreen.remove();
                }
            }, 500);
        }, 1000);
    }

    getIconoEspecialidad(especialidad) {
        const iconos = {
            'Tiempos': '⏱️',
            'Meteorología': '🌧️',
            'Fiabilidad': '🔧',
            'Estrategia': '📊',
            'Neumáticos': '🔄',
            'default': '👨‍🔧'
        };
        return iconos[especialidad] || iconos.default;
    }

    async updateProductionMonitorCompacto() {
        const container = document.getElementById('produccion-grid-compacto');
        const contador = document.getElementById('contador-produccion');
        
        if (!container || !this.escuderia) return;
        
        try {
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .order('tiempo_fin', { ascending: true });
            
            if (error) throw error;
            
            const slots = container.querySelectorAll('.slot-produccion-compacto');
            slots.forEach((slot, index) => {
                const fabricacion = fabricaciones && fabricaciones[index];
                
                if (fabricacion) {
                    const tiempoFin = new Date(fabricacion.tiempo_fin);
                    const ahora = new Date();
                    const diferencia = tiempoFin - ahora;
                    
                    let tiempoTexto = '';
                    if (diferencia > 0) {
                        const horas = Math.floor(diferencia / (1000 * 60 * 60));
                        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                        tiempoTexto = horas + 'h ' + minutos + 'm';
                    } else {
                        tiempoTexto = '¡Listo!';
                    }
                    
                    slot.classList.add('slot-activo-compacto');
                    slot.innerHTML = '<div class="slot-icono-compacto"><i class="fas fa-cog fa-spin"></i></div><div class="slot-texto-compacto"><div style="color: #4CAF50; font-weight: bold; font-size: 0.7rem;">' + (fabricacion.area || 'Evolución') + '</div><div style="color: #FF9800; font-size: 0.65rem;">' + tiempoTexto + '</div></div>';
                    
                    slot.onclick = () => {
                        document.querySelector('[data-tab="taller"]').click();
                    };
                } else {
                    slot.classList.remove('slot-activo-compacto');
                    slot.innerHTML = '<div class="slot-icono-compacto"><i class="fas fa-plus"></i></div><div class="slot-texto-compacto">Slot ' + (index + 1) + '</div>';
                    slot.onclick = () => {
                        document.querySelector('[data-tab="taller"]').click();
                    };
                }
            });
            
            if (contador) {
                contador.textContent = (fabricaciones?.length || 0) + '/4';
            }
            
        } catch (error) {
            console.error('Error actualizando producción:', error);
        }
    }

    async cargarPiezasMontadasCompacto() {
        console.log('🎯 Cargando piezas montadas compactas...');
        
        const container = document.getElementById('grid-piezas-compacto');
        const puntosElement = document.getElementById('puntos-totales-compacto');
        
        if (!container) return;
        
        try {
            const { data: piezasMontadas } = await this.supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
            const mapeoAreas = {
                'Suelo y Difusor': 'suelo',
                'Motor': 'motor',
                'Aerodinámica': 'aerodinamica',
                'Chasis': 'chasis',
                'Suspensión': 'suspension',
                'Frenos': 'frenos',
                'Transmisión': 'transmision',
                'Electrónica': 'electronica',
                'Volante': 'volante',
                'Pontones': 'pontones',
                'Alerón Delantero': 'aleron_delantero',
                'Alerón Trasero': 'aleron_trasero',
                'Caja de Cambios': 'caja_cambios'
            };
            
            const piezasPorArea = {};
            piezasMontadas?.forEach(p => {
                const areaId = mapeoAreas[p.area] || p.area.toLowerCase().replace(/ /g, '_');
                piezasPorArea[areaId] = p;
            });
            
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'A.Del', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Susp.', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'A.Tras', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Elect.', icono: '💡' }
            ];
            
            let puntosTotales = 0;
            let html = '';
            
            areas.forEach(area => {
                const pieza = piezasPorArea[area.id];
                
                if (pieza) {
                    puntosTotales += pieza.puntos_base || 0;
                    
                    // Obtener nombre personalizado de la pieza
                    let nombrePiezaMostrar = pieza.componente || area.nombre;
                    if (pieza.numero_global && this.nombresPiezas && 
                        this.nombresPiezas[area.id] && 
                        pieza.numero_global <= this.nombresPiezas[area.id].length) {
                        nombrePiezaMostrar = this.nombresPiezas[area.id][pieza.numero_global - 1];
                    }
                    
                    // Crear contenido con área arriba y pieza abajo
                    html += '<div class="pieza-boton-compacto pieza-montada-compacto" onclick="irAlAlmacenDesdePiezas()" title="' + area.nombre + ': ' + nombrePiezaMostrar + '">';
                    html += '<div class="pieza-icono-compacto">' + area.icono + '</div>';
                    html += '<div class="pieza-info-compacto">';
                    html += '<div class="pieza-area-titulo">' + area.nombre + '</div>';
                    html += '<div class="pieza-nombre-detalle">' + nombrePiezaMostrar + '</div>';
                    html += '</div>';
                    html += '</div>';
                } else {
                    // Para huecos vacíos
                    html += '<div class="pieza-boton-compacto" onclick="irAlAlmacenDesdePiezas()" title="Sin pieza - Click para equipar">';
                    html += '<div class="pieza-icono-compacto" style="color: #666;">+</div>';
                    html += '<div class="pieza-info-compacto">';
                    html += '<div class="pieza-area-titulo">' + area.nombre + '</div>';
                    html += '<div class="pieza-nombre-detalle" style="color: #888; font-size: 0.8rem;">Vacío</div>';
                    html += '</div>';
                    html += '</div>';
                }
            });
            
            container.innerHTML = html;
            
            if (puntosElement) {
                puntosElement.textContent = puntosTotales + ' pts';
            }
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 10px;">Error cargando piezas</div>';
        }
    }
    async iniciarCountdownCompacto() {
        console.log('🏎️ Iniciando countdown estilo F1...');
        
        if (!this.proximoGP) {
            await this.cargarProximoGP();
        }
        
        if (!this.proximoGP) {
            console.log('❌ No hay próximas carreras');
            return;
        }
        
        const fechaCarrera = new Date(this.proximoGP.fecha_inicio);
        fechaCarrera.setHours(14, 0, 0, 0);
        const fechaLimiteApuestas = new Date(fechaCarrera);
        fechaLimiteApuestas.setHours(fechaCarrera.getHours() - 48);
        
        const formatearFecha = (fecha) => {
            const opciones = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            return fecha.toLocaleDateString('es-ES', opciones);
        };
        
        const actualizarCountdown = () => {
            const ahora = new Date();
            const diferencia = fechaLimiteApuestas - ahora;
            
            const diasElem = document.getElementById('countdown-dias');
            const horasElem = document.getElementById('countdown-horas');
            const minutosElem = document.getElementById('countdown-minutos');
            const segundosElem = document.getElementById('countdown-segundos');
            
            if (diferencia > 0) {
                const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
                
                if (diasElem) diasElem.textContent = dias.toString().padStart(2, '0');
                if (horasElem) horasElem.textContent = horas.toString().padStart(2, '0');
                if (minutosElem) minutosElem.textContent = minutos.toString().padStart(2, '0');
                if (segundosElem) segundosElem.textContent = segundos.toString().padStart(2, '0');
                
                const btnApuestas = document.getElementById('btn-estado-apuestas');
                if (btnApuestas) {
                    if (diferencia > 0) {
                        // Apuestas ABIERTAS
                        btnApuestas.disabled = false;
                        btnApuestas.innerHTML = '<i class="fas fa-paper-plane"></i> ENVIAR PRONÓSTICO';
                        btnApuestas.className = 'btn-pronostico-f1 abierto';
                        // Mantener el onclick que ya pusimos
                    } else {
                        // Apuestas CERRADAS
                        btnApuestas.disabled = true;
                        btnApuestas.innerHTML = '<i class="fas fa-lock"></i> APUESTAS CERRADAS';
                        btnApuestas.className = 'btn-pronostico-f1 cerrado';
                        btnApuestas.onclick = null; // Quitar onclick cuando esté cerrado
                    }
                }
                
            } else {
                if (diasElem) diasElem.textContent = '00';
                if (horasElem) horasElem.textContent = '00';
                if (minutosElem) minutosElem.textContent = '00';
                if (segundosElem) segundosElem.textContent = '00';
            }
        };
        
        actualizarCountdown();
        const intervalId = setInterval(actualizarCountdown, 1000);
        this.countdownInterval = intervalId;
    }

    async cerrarSesion() {
        try {
            if (window.supabase) {
                await window.supabase.auth.signOut();
                console.log('✅ Sesión cerrada');
            }
            window.location.href = window.location.origin;
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            window.location.href = window.location.origin;
        }
    }
        
    async loadProximoGP() {
        if (!window.supabase || !window.supabase.from) {
            console.error('❌ window.supabase no está disponible en loadProximoGP');
            this.proximoGP = {
                nombre: 'Gran Premio de España',
                fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                circuito: 'Circuit de Barcelona-Catalunya'
            };
            this.updateCountdown();
            return;
        }
        
        try {
            const { data: gp, error } = await window.supabase
                .from('calendario_gp')
                .select('*')
                .eq('cerrado_apuestas', false)
                .gt('fecha_inicio', new Date().toISOString())
                .order('fecha_inicio', { ascending: true })
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error('❌ Error en consulta GP:', error.message);
                this.proximoGP = {
                    nombre: 'Gran Premio de España',
                    fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                    circuito: 'Circuit de Barcelona-Catalunya'
                };
            } else if (gp) {
                this.proximoGP = gp;
                console.log('✅ GP cargado:', gp.nombre);
            } else {
                console.log('ℹ️ No hay GP próximo configurado en la base de datos');
                this.proximoGP = {
                    nombre: 'Próximo GP por confirmar',
                    fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                    circuito: 'Circuito por confirmar'
                };
            }
            
            this.updateCountdown();
            
        } catch (error) {
            console.error('❌ Error fatal en loadProximoGP:', error);
            this.proximoGP = {
                nombre: 'Próximo GP por confirmar',
                fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                circuito: 'Circuito por confirmar'
            };
            this.updateCountdown();
        }
    }

    async loadCarStatus() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .maybeSingle();
            
            if (stats) {
                this.carStats = stats;
                this.updateCarAreasUI();
            }
        } catch (error) {
            console.error('Error cargando stats:', error);
        }
    }

    async loadPilotos() {
        if (!this.escuderia) return;
        
        try {
            const { data: pilotos } = await supabase
                .from('pilotos_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true);
            
            if (pilotos && pilotos.length > 0) {
                this.pilotos = pilotos;
                this.updatePilotosUI();
            }
        } catch (error) {
            console.error('Error cargando pilotos:', error);
        }
    }

    async cargarProximoGP() {
        console.log('📅 Cargando próximo GP desde BD...');
        
        if (!this.escuderia || !this.supabase) {
            console.error('❌ No hay escudería o supabase');
            return null;
        }
        
        try {
            const { data: proximosGPs, error } = await this.supabase
                .from('calendario_gp')
                .select('*')
                .gte('fecha_inicio', new Date().toISOString().split('T')[0])
                .order('fecha_inicio', { ascending: true })
                .limit(1);
            
            if (error) throw error;
            
            if (proximosGPs && proximosGPs.length > 0) {
                this.proximoGP = proximosGPs[0];
                console.log('✅ Próximo GP cargado:', this.proximoGP.nombre);
                return this.proximoGP;
            } else {
                console.log('ℹ️ No hay próximos GP programados');
                this.proximoGP = null;
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error cargando próximo GP:', error);
            this.proximoGP = null;
            return null;
        }
    }

    updateCarAreasUI() {
        const container = document.getElementById('areas-coche');
        if (!container || !this.carStats) return;
        
        container.innerHTML = window.CAR_AREAS.map(area => {
            const nivel = this.carStats[area.id + '_nivel'] || 0;
            const progreso = this.carStats[area.id + '_progreso'] || 0;
            const porcentaje = (progreso / window.CONFIG.PIECES_PER_LEVEL) * 100;
            
            return '<div class="area-item" style="border-left-color: ' + area.color + '">' +
                   '<span class="area-nombre">' + area.name + '</span>' +
                   '<div class="area-nivel">' +
                   '<span>Nivel</span>' +
                   '<span class="nivel-valor">' + nivel + '</span>' +
                   '</div>' +
                   '<div class="area-progreso">' +
                   'Progreso: <span class="progreso-valor">' + progreso + '/20</span>' +
                   '</div>' +
                   '<div class="progress-bar-small">' +
                   '<div class="progress-fill-small" style="width: ' + porcentaje + '%"></div>' +
                   '</div>' +
                   '<button class="btn-fabricar" data-area="' + area.id + '">' +
                   '<i class="fas fa-hammer"></i> Fabricar (€' + window.CONFIG.PIECE_COST.toLocaleString() + ')' +
                   '</button>' +
                   '</div>';
        }).join('');
        
        document.querySelectorAll('.btn-fabricar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const areaId = e.target.closest('.btn-fabricar').dataset.area;
                this.iniciarFabricacion(areaId);
            });
        });
    }

    updatePilotosUI() {
        const container = document.getElementById('pilotos-container');
        if (!container) {
            console.error('❌ No se encontró #pilotos-container');
            return;
        }
        
        const estrategasContratados = this.pilotos || [];
        
        const contadorElement = document.getElementById('contador-estrategas');
        if (contadorElement) {
            contadorElement.textContent = estrategasContratados.length + '/4';
        }
        
        // QUITAR LOS ESTILOS INLINE CON !important
        let html = '<div class="produccion-slots">';  // CAMBIADO: Sin style
        
        for (let i = 0; i < 4; i++) {
            const estratega = estrategasContratados[i];
            
            if (estratega) {
                // CAMBIADO: Sin style="height: 80px !important;"
                html += '<div class="produccion-slot estratega-slot" onclick="mostrarInfoEstratega(' + i + ')">';
                html += '<div class="slot-content">';
                html += '<div class="estratega-icon" style="font-size: 1.1rem; color: #00d2be; margin-bottom: 5px;">';
                html += '<i class="fas fa-user-tie"></i>';
                html += '</div>';
                html += '<span style="display: block; font-size: 0.75rem; color: white; font-weight: bold; margin-bottom: 2px;">' + (estratega.nombre || 'Estratega') + '</span>';
                html += '<span style="display: block; font-size: 0.65rem; color: #FFD700;">€' + (estratega.salario || 0).toLocaleString() + '/mes</span>';
                html += '<span style="display: block; font-size: 0.6rem; color: #aaa; margin-top: 2px;">' + (estratega.especialidad || 'General') + '</span>';
                html += '</div>';
                html += '</div>';
            } else {
                // CAMBIADO: Sin style="height: 80px !important;"
                html += '<div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(' + i + ')">';
                html += '<div class="slot-content">';
                html += '<i class="fas fa-plus" style="font-size: 1.1rem; color: #666; margin-bottom: 5px;"></i>';
                html += '<span style="display: block; font-size: 0.75rem; color: #888;">Slot ' + (i + 1) + '</span>';
                html += '<span style="display: block; font-size: 0.65rem; color: #aaa; margin-top: 2px;">Vacío</span>';
                html += '</div>';
                html += '</div>';
            }
        }
        
        html += '</div>';
        
        container.innerHTML = html;
    }
    getIniciales(nombre) {
        if (!nombre) return "??";
        return nombre.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 3);
    }

    iniciarFabricacion(areaId) {
        console.log('🔧 [DEBUG] === INICIAR FABRICACION ===');
        
        if (!this.escuderia || this.escuderia.dinero < window.CONFIG.PIECE_COST) {
            const falta = window.CONFIG.PIECE_COST - (this.escuderia?.dinero || 0);
            const mensaje = '❌ Fondos insuficientes. Necesitas €' + falta.toLocaleString() + ' más';
            this.showNotification(mensaje, 'error');
            return false;
        }

        if (!window.fabricacionManager) {
            console.log('⚠️ [DEBUG] fabricacionManager es undefined...');
            
            if (window.FabricacionManager) {
                console.log('✅ [DEBUG] Clase existe, creando instancia...');
                window.fabricacionManager = new window.FabricacionManager();
                console.log('✅ [DEBUG] Instancia creada:', window.fabricacionManager);
            } else {
                console.error('❌ [DEBUG] Clase NO existe - Error fatal');
                this.showNotification('Error: Sistema de fabricación no cargado', 'error');
                return false;
            }
        }
        
        if (!this.escuderia) {
            console.error('❌ No tienes escudería');
            this.showNotification('❌ No tienes escudería', 'error');
            return false;
        }
        
        if (window.fabricacionManager && !window.fabricacionManager.escuderiaId && this.escuderia) {
            console.log('🔧 [DEBUG] Inicializando fabricacionManager con escudería:', this.escuderia.id);
            window.fabricacionManager.inicializar(this.escuderia.id);
        }
        
        console.log('🔧 [DEBUG] Llamando a iniciarFabricacion...');
        
        if (!window.fabricacionManager.iniciarFabricacion) {
            console.error('❌ [DEBUG] iniciarFabricacion no existe en fabricacionManager');
            this.showNotification('Error: Método de fabricación no disponible', 'error');
            return false;
        }
        
        const resultado = window.fabricacionManager.iniciarFabricacion(areaId);
        
        if (resultado) {
            console.log('✅ Fabricación iniciada exitosamente');
            
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (area) {
                const mensaje = '✅ Fabricación de ' + area.name + ' iniciada (30 segundos)';
                this.showNotification(mensaje, 'success');
            }
            
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 1000);
            
            const selector = '[data-area="' + areaId + '"]';
            const boton = document.querySelector(selector);
            if (boton) {
                boton.disabled = true;
                boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fabricando...';
            }
            
            if (this.escuderia.dinero !== null) {
                this.escuderia.dinero -= window.CONFIG.PIECE_COST || 10000;
                this.updateEscuderiaMoney();
            }
        } else {
            this.showNotification('❌ No se pudo iniciar la fabricación', 'error');
        }
        
        return resultado;
    }

    showNotification(mensaje, tipo = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification ' + tipo;
        
        let icono = 'info-circle';
        if (tipo === 'success') icono = 'check-circle';
        if (tipo === 'error') icono = 'exclamation-circle';
        
        notification.innerHTML = '<i class="fas fa-' + icono + '"></i><span>' + mensaje + '</span>';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async updateEscuderiaMoney() {
        if (!this.escuderia) return;
        
        try {
            const { error } = await supabase
                .from('escuderias')
                .update({ dinero: this.escuderia.dinero })
                .eq('id', this.escuderia.id);
            
            if (!error) {
                const moneyValue = document.getElementById('money-value');
                if (moneyValue) {
                    moneyValue.textContent = '€' + this.escuderia.dinero.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error actualizando dinero:', error);
        }
    }

    async cargarDatosDashboard() {
        console.log('📊 Cargando datos del dashboard...');
        
        this.updateProductionMonitor();
        
        this.setupDashboardEvents();
        
        this.startTimers();
        
        console.log('✅ Dashboard configurado con timers');
    }

    startTimers() {
        if (this.productionTimer) {
            clearInterval(this.productionTimer);
        }
        
        setTimeout(() => {
            this.updateProductionMonitor();
        }, 300);
        
        this.productionTimer = setInterval(() => {
            this.updateProductionMonitor();
        }, 5000);
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        this.countdownTimer = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        console.log('⏱️ Timers iniciados');
    }

    async updateProductionMonitor() {
        if (!this.escuderia || !this.escuderia.id || !this.supabase) {
            console.log('❌ No hay escudería para monitor de producción');
            return;
        }
        
        const container = document.getElementById('produccion-actual');
        if (!container) {
            console.log('❌ No se encontró #produccion-actual');
            return;
        }
        
        try {
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .order('tiempo_inicio', { ascending: true });
            
            if (error) throw error;
            
            console.log('📊 Fabricaciones activas encontradas:', fabricaciones?.length || 0);
            
            const ahoraUTC = Date.now();
            const fabricacionesConEstado = (fabricaciones || []).map(f => {
                const tiempoFinStr = f.tiempo_fin.endsWith('Z') ? f.tiempo_fin : f.tiempo_fin + 'Z';
                const tiempoFinUTC = new Date(tiempoFinStr).getTime();
                const tiempoRestante = tiempoFinUTC - ahoraUTC;
                const lista = tiempoRestante <= 0;
                
                return {
                    ...f,
                    tiempoRestante,
                    lista
                };
            });
            
            const fabricacionesConNumero = [];
            for (const fabricacion of fabricacionesConEstado) {
                const { data: piezasExistentes } = await this.supabase
                    .from('almacen_piezas')
                    .select('id')
                    .eq('escuderia_id', this.escuderia.id)
                    .eq('area', fabricacion.area)
                    .eq('nivel', fabricacion.nivel);
                
                const numeroPieza = (piezasExistentes?.length || 0) + 1;
                fabricacionesConNumero.push({
                    ...fabricacion,
                    numero_pieza: numeroPieza
                });
            }
            
            this.cargarEstilosProduccion();
            
            let html = '<div class="produccion-slots">';
            
            for (let i = 0; i < 4; i++) {
                const fabricacion = fabricacionesConNumero[i];
                
                if (fabricacion) {
                    const tiempoRestante = fabricacion.tiempoRestante;
                    const lista = fabricacion.lista;
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const tiempoFormateado = this.formatTime(tiempoRestante);
                    const numeroPieza = fabricacion.numero_pieza || 1;
                    
                    // === CALCULAR NÚMERO GLOBAL DE PIEZA (MOVER ARRIBA) ===
                    const { data: piezasAreaTotal } = await this.supabase
                        .from('almacen_piezas')
                        .select('id')
                        .eq('escuderia_id', this.escuderia.id)
                        .eq('area', fabricacion.area);
                    
                    const totalPiezasFabricadas = piezasAreaTotal?.length || 0;
                    const numeroPiezaGlobal = totalPiezasFabricadas + 1;
                    
                    // === USAR NOMBRES PERSONALIZADOS ===
                    let nombreMostrar = "Actualización " + nombreArea;
                    let mejoraTexto = "";
                    
                    // Buscar en los nombres personalizados si existe
                    if (this.nombresPiezas && this.nombresPiezas[fabricacion.area]) {
                        const nombresArea = this.nombresPiezas[fabricacion.area];
                        // El número global está en numeroPiezaGlobal (ya definido)
                        if (numeroPiezaGlobal <= nombresArea.length) {
                            nombreMostrar = nombresArea[numeroPiezaGlobal - 1];
                        }
                    }
                    
                    // Mostrar solo el nivel
                    mejoraTexto = nombreArea;
                    
                    html += '<div class="produccion-slot ' + (lista ? 'produccion-lista' : 'produccion-activa') + '" ';
                    html += 'onclick="recogerPiezaSiLista(\'' + fabricacion.id + '\', ' + lista + ', ' + i + ')" ';
                    html += 'title="' + nombreMostrar + ' - Mejora ' + numeroPiezaGlobal + ' de 50">';
                    html += '<div class="produccion-icon">';
                    html += (lista ? '✅' : '');
                    html += '</div>';
                    html += '<div class="produccion-info">';
                    html += '<span class="produccion-nombre">' + nombreMostrar + '</span>';
                    
                    // Mostrar nivel
                    html += '<span class="produccion-pieza-num">' + mejoraTexto + '</span>';
                    
                    if (lista) {
                        html += '<span class="produccion-lista-text">¡LISTA!</span>';
                    } else {
                        html += '<span class="produccion-tiempo">' + tiempoFormateado + '</span>';
                    }
                    html += '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="produccion-slot" data-slot="' + i + '" onclick="irAlTallerDesdeProduccion()">';
                    html += '<div class="slot-content">';
                    html += '<i class="fas fa-plus"></i>';
                    html += '<span>Departamento ' + (i + 1) + '</span>';
                    html += '<span class="slot-disponible">Disponible</span>';
                    html += '</div>';
                    html += '</div>';
                }
            }
            
            html += '</div>';
            container.innerHTML = html;
            
            this.iniciarTimerProduccion();
            
        } catch (error) {
            console.error("Error en updateProductionMonitor:", error);
            container.innerHTML = '<div class="produccion-error"><p>❌ Error cargando producción</p><button onclick="window.f1Manager.updateProductionMonitor()">Reintentar</button></div>';
        }
    }

    iniciarTimerProduccion() {
        if (this.productionUpdateTimer) {
            clearInterval(this.productionUpdateTimer);
        }
        
        this.productionUpdateTimer = setInterval(() => {
            this.actualizarTiemposEnVivo();
        }, 1000);
    }

    async actualizarTiemposEnVivo() {
        const slots = document.querySelectorAll('.produccion-slot.produccion-activa');
        if (slots.length === 0) return;
        
        try {
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('id,tiempo_fin,area,nivel')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (error || !fabricaciones) return;
            
            slots.forEach(slot => {
                const fabricacionId = slot.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (!fabricacionId) return;
                
                const fabricacion = fabricaciones.find(f => f.id === fabricacionId);
                if (!fabricacion) return;
                
                const ahoraUTC = Date.now();
                const tiempoFinStr = fabricacion.tiempo_fin.endsWith('Z') ? fabricacion.tiempo_fin : fabricacion.tiempo_fin + 'Z';
                const tiempoFinUTC = new Date(tiempoFinStr).getTime();
                const tiempoRestante = tiempoFinUTC - ahoraUTC;
                
                if (tiempoRestante <= 0) {
                    slot.classList.remove('produccion-activa');
                    slot.classList.add('produccion-lista');
                    // === ACTUALIZAR TEXTO A NUEVO FORMATO ===
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const nombreMostrar = "Actualización " + nombreArea;
                    const nivelMostrar = "Q" + fabricacion.nivel;
                    // === FIN ACTUALIZACIÓN ===
                    slot.innerHTML = '<div class="produccion-icon">✅</div><div class="produccion-info"><span class="produccion-nombre">' + nombreMostrar + '</span><span class="produccion-pieza-num">' + nivelMostrar + '</span><span class="produccion-lista-text">¡LISTA!</span></div>';
                } else {
                    const tiempoElement = slot.querySelector('.produccion-tiempo');
                    if (tiempoElement) {
                        tiempoElement.textContent = this.formatTime(tiempoRestante);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error actualizando tiempos en vivo:', error);
        }
    }

    cargarEstilosProduccion() {
        if (!document.getElementById('estilos-produccion')) {
            const style = document.createElement('style');
            style.id = 'estilos-produccion';
            style.innerHTML = produccionStyles;
            document.head.appendChild(style);
        }
    }

    formatTime(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        
        const totalSegundos = Math.floor(milliseconds / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        
        if (horas > 0) {
            return horas + 'h ' + minutos + 'm ' + segundos + 's';
        } else if (minutos > 0) {
            return minutos + 'm ' + segundos + 's';
        } else {
            return segundos + 's';
        }
    }

    setupDashboardEvents() {
        document.getElementById('iniciar-fabricacion-btn')?.addEventListener('click', () => {
            this.irAlTaller();
        });
        
        document.getElementById('contratar-pilotos-btn')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        document.getElementById('contratar-primer-piloto')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        document.getElementById('btn-apostar')?.addEventListener('click', () => {
            this.mostrarApuestas();
        });
    }

    mostrarContratarPilotos() {
        this.showNotification('🏎️ Sistema de pilotos en desarrollo', 'info');
    }

    mostrarApuestas() {
        this.showNotification('💰 Sistema de apuestas en desarrollo', 'info');
    }

    updateCountdown() {
        if (!this.proximoGP) return;
        
        const now = new Date();
        const gpDate = new Date(this.proximoGP.fecha_inicio);
        const timeDiff = gpDate - now;
        
        if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const gpNombreEl = document.getElementById('gp-nombre');
            const gpFechaEl = document.getElementById('gp-fecha');
            const gpCircuitoEl = document.getElementById('gp-circuito');
            
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
            if (gpNombreEl) gpNombreEl.textContent = this.proximoGP.nombre;
            if (gpFechaEl) gpFechaEl.textContent = new Date(this.proximoGP.fecha_inicio).toLocaleDateString('es-ES');
            if (gpCircuitoEl) gpCircuitoEl.textContent = this.proximoGP.circuito || 'Circuito por confirmar';
        }
    }

    irAlTaller() {
        if (window.tabManager) {
            window.tabManager.switchTab('taller');
        }
    }
    // AÑADIR ESTE MÉTODO NUEVO ↓
    async verificarPagoDominical() {
        try {
            const ahora = new Date();
            const diaSemana = ahora.getDay(); // 0 = Domingo, 1 = Lunes...
            const hora = ahora.getHours();
            
            // Si es domingo entre 23:00 y 23:59
            if (diaSemana === 0 && hora === 23 && this.escuderia.estrellas_semana > 0) {
                const dineroExtra = this.escuderia.estrellas_semana * 2000;
                const nuevoDinero = (this.escuderia.dinero || 0) + dineroExtra;
                
                const { error } = await this.supabase
                    .from('escuderias')
                    .update({ 
                        dinero: nuevoDinero,
                        estrellas_semana: 0,
                        primera_fabricacion_hoy: false,
                        primera_prueba_hoy: false,
                        ultimo_login_dia: null
                    })
                    .eq('id', this.escuderia.id);
                
                if (!error) {
                    this.escuderia.dinero = nuevoDinero;
                    this.escuderia.estrellas_semana = 0;
                    this.escuderia.primera_fabricacion_hoy = false;
                    this.escuderia.primera_prueba_hoy = false;
                    this.escuderia.ultimo_login_dia = null;
                    
                    // Actualizar UI
                    const dineroElement = document.getElementById('money-value');
                    const estrellasElement = document.getElementById('estrellas-value');
                    
                    if (dineroElement) dineroElement.textContent = '€' + nuevoDinero.toLocaleString();
                    if (estrellasElement) estrellasElement.textContent = '0';
                    
                    // Notificación
                    this.showNotification(`💰 Bonus patrocinio: +€${dineroExtra.toLocaleString()}`, 'success');
                }
            }
        } catch (error) {
            console.error('Error en pago dominical:', error);
        }
    }
    // AÑADIR ESTE MÉTODO NUEVO ↑
    
}

window.tutorialManager = null;
window.tutorialData = {
    estrategaSeleccionado: null,
    areaSeleccionada: null,
    pronosticosSeleccionados: {},
    piezaFabricando: false
};

window.irAlTallerDesdeProduccion = function() {
    if (window.tabManager && window.tabManager.switchTab) {
        window.tabManager.switchTab('taller');
    } else {
        alert('Redirigiendo al taller para fabricar...');
    }
};

window.recogerPiezaSiLista = async function(fabricacionId, lista, slotIndex) {
    console.log("🔧 Recogiendo pieza:", { fabricacionId, lista });
    
    if (!lista) {
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification("⏳ La pieza aún está en producción", "info");
        }
        
        try {
            const { data: fabricacion } = await window.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
                
            if (fabricacion) {
                const ahora = new Date();
                const tiempoFin = new Date(fabricacion.tiempo_fin);
                const tiempoRestante = tiempoFin - ahora;
                const tiempoFormateado = tiempoRestante > 0 ? 
                    window.f1Manager?.formatTime(tiempoRestante) : "Finalizando...";
                
                // Obtener número GLOBAL de la próxima pieza (no solo del nivel)
                const { data: todasPiezasArea } = await window.supabase
                    .from('almacen_piezas')
                    .select('numero_global')
                    .eq('escuderia_id', fabricacion.escuderia_id)
                    .eq('area', fabricacion.area)
                    .order('numero_global', { ascending: true });
                
                const siguienteNumeroGlobal = (todasPiezasArea?.length || 0) + 1;
                let nombrePiezaMostrar = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
                
                // Usar el nombre personalizado si existe
                if (window.f1Manager && window.f1Manager.nombresPiezas && 
                    window.f1Manager.nombresPiezas[fabricacion.area]) {
                    const nombresArea = window.f1Manager.nombresPiezas[fabricacion.area];
                    if (siguienteNumeroGlobal <= nombresArea.length) {
                        nombrePiezaMostrar = nombresArea[siguienteNumeroGlobal - 1];
                    }
                }
                
                alert('🔄 ' + nombrePiezaMostrar + '\nMejora ' + siguienteNumeroGlobal + ' de 50\nNivel ' + fabricacion.nivel + '\nTiempo restante: ' + tiempoFormateado);
            }
        } catch (error) {
            console.error("Error obteniendo info:", error);
        }
        return;
    }
    
    try {
        const { data: fabricacion, error: fetchError } = await window.supabase
            .from('fabricacion_actual')
            .select('*')
            .eq('id', fabricacionId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // ===== NUEVO: Calcular número global =====
        // 1. Obtener todas las piezas de esta área
        const { data: todasPiezasArea } = await window.supabase
            .from('almacen_piezas')
            .select('id, numero_global')
            .eq('escuderia_id', fabricacion.escuderia_id)
            .eq('area', fabricacion.area);
        
        // 2. Encontrar el siguiente número global
        let maxNumeroGlobal = 0;
        if (todasPiezasArea && todasPiezasArea.length > 0) {
            // Buscar el máximo numero_global existente
            todasPiezasArea.forEach(p => {
                if (p.numero_global && p.numero_global > maxNumeroGlobal) {
                    maxNumeroGlobal = p.numero_global;
                }
            });
        }
        const nuevoNumeroGlobal = maxNumeroGlobal + 1;
        // ===== AÑADIR ESTO =====
        let componente = `${fabricacion.area} Mejora ${nuevoNumeroGlobal}`;
        if (window.f1Manager && window.f1Manager.nombresPiezas && 
            window.f1Manager.nombresPiezas[fabricacion.area]) {
            const nombresArea = window.f1Manager.nombresPiezas[fabricacion.area];
            if (nuevoNumeroGlobal <= nombresArea.length) {
                componente = nombresArea[nuevoNumeroGlobal - 1];
            }
        }
        // ===== FIN AÑADIR =====        
        
        // ===== 3. Calcular puntos =====
        let puntosTotales;
        if (window.f1Manager && window.f1Manager.calcularPuntosPieza) {
            // Pasar areaId y numeroPiezaGlobal
            puntosTotales = window.f1Manager.calcularPuntosPieza(fabricacion.area, nuevoNumeroGlobal);
        } else {
            puntosTotales = calcularPuntosBase(fabricacion.area, fabricacion.nivel, nuevoNumeroGlobal);
        }
        
        // ===== 4. Insertar con numero_global =====
        const { error: insertError } = await window.supabase
            .from('almacen_piezas')
            .insert([{
                escuderia_id: fabricacion.escuderia_id,
                area: fabricacion.area,
                nivel: fabricacion.nivel || 1,
                numero_global: nuevoNumeroGlobal,
                componente: componente, 
                puntos_base: puntosTotales,
                calidad: 'Normal',
                equipada: false,
                fabricada_en: new Date().toISOString(),
                creada_en: new Date().toISOString()
            }]);
        
        if (insertError) {
            console.error("Error insertando pieza:", insertError);
            throw insertError;
        }
        
        console.log("✅ Pieza añadida a almacen_piezas");
        
        const { error: updateError } = await window.supabase
            .from('fabricacion_actual')
            .update({ 
                completada: true
            })
            .eq('id', fabricacionId);
        
        if (updateError) throw updateError;
        
        console.log("✅ Fabricación marcada como completada");
        
        // Calcular qué número de pieza es dentro del nivel (1-5)
        const numeroPiezaEnNivel = ((nuevoNumeroGlobal - 1) % 5) + 1;
        const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
        
        // Obtener nombre personalizado
        let nombrePiezaNotif = nombreArea;
        if (window.f1Manager && window.f1Manager.nombresPiezas && 
            window.f1Manager.nombresPiezas[fabricacion.area]) {
            const nombresArea = window.f1Manager.nombresPiezas[fabricacion.area];
            if (nuevoNumeroGlobal <= nombresArea.length) {
                nombrePiezaNotif = nombresArea[nuevoNumeroGlobal - 1];
            }
        }
        
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification('✅ ' + nombrePiezaNotif + ' recogida\n+' + puntosTotales + ' puntos técnicos', 'success');
        }
        
        if (window.f1Manager) {
            if (window.f1Manager.productionUpdateTimer) {
                clearInterval(window.f1Manager.productionUpdateTimer);
            }
            
            setTimeout(() => {
                window.f1Manager.updateProductionMonitor();
            }, 500);
            
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                setTimeout(() => {
                    if (window.tabManager.loadAlmacenPiezas) {
                        window.tabManager.loadAlmacenPiezas();
                    }
                }, 1000);
            }
            
            setTimeout(() => {
                if (window.f1Manager.cargarPiezasMontadas) {
                    window.f1Manager.cargarPiezasMontadas();
                }
            }, 1500);
        }
        
    } catch (error) {
        console.error('❌ Error recogiendo pieza:', error);
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification('❌ Error: ' + error.message, 'error');
        }
    }
};
function calcularPuntosBase(area, nivel, numeroPiezaGlobal) {
    // Usar el nuevo sistema de puntos exponencial
    if (window.f1Manager && window.f1Manager.calcularPuntosPieza) {
        return window.f1Manager.calcularPuntosPieza(numeroPiezaGlobal || 1);
    }
    
    // Fallback al sistema antiguo
    const puntosPorArea = {
        'motor': 15,
        'chasis': 12,
        'suelo': 10,
        'electronica': 14,
        'aleron_delantero': 8,
        'aleron_trasero': 8,
        'caja_cambios': 9,
        'suspension': 7,
        'frenos': 6,
        'volante': 5,
        'pontones': 7
    };
    
    const puntosArea = puntosPorArea[area] || 10;
    return puntosArea * (nivel || 1);
}


function formatTime(milliseconds) {
    if (milliseconds <= 0) return "00:00:00";
    
    const totalSegundos = Math.floor(milliseconds / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    
    if (horas > 0) {
        return horas + 'h ' + minutos + 'm';
    } else if (minutos > 0) {
        return minutos + 'm ' + segundos + 's';
    } else {
        return segundos + 's';
    }
}

function calcularPuntosPorArea(area, nivel) {
    const puntosBase = {
        'motor': 15,
        'chasis': 12,
        'suelo': 10,
        'aleron_delantero': 8,
        'aleron_trasero': 8,
        'caja_cambios': 9,
        'suspension': 7,
        'frenos': 6,
        'electronica': 14,
        'volante': 5,
        'pontones': 7
    };
    return (puntosBase[area] || 10) * (nivel || 1);
}

window.testLogout = async function() {
    console.log('DEBUG: testLogout() ejecutado');
    console.log('DEBUG: window.supabase existe?', !!window.supabase);
    console.log('DEBUG: window.location.origin:', window.location.origin);
    
    try {
        if (window.supabase) {
            console.log('DEBUG: Intentando cerrar sesión...');
            await window.supabase.auth.signOut();
            console.log('DEBUG: Sesión cerrada, redirigiendo...');
        }
        window.location.href = window.location.origin;
    } catch (error) {
        console.error('DEBUG: Error:', error);
        window.location.href = window.location.origin;
    }
};

window.cargarEstrategasTutorial = function() {
    const container = document.getElementById('grid-estrategas-tutorial');
    if (!container) return;
    
    const estrategas = [
        { id: 1, nombre: "Analista de Tiempos", icono: "⏱️", especialidad: "Diferencias de tiempo", bono: "+15%", sueldo: "50,000€", ejemplo: "Diferencia 1º-2º" },
        { id: 2, nombre: "Meteorólogo", icono: "🌧️", especialidad: "Condiciones climáticas", bono: "+20%", sueldo: "60,000€", ejemplo: "Lluvia/Sequía" },
        { id: 3, nombre: "Experto en Fiabilidad", icono: "🔧", especialidad: "Abandonos y fallos", bono: "+18%", sueldo: "55,000€", ejemplo: "Número de abandonos" },
        { id: 4, nombre: "Estratega de Carrera", icono: "🏁", especialidad: "Estrategias de parada", bono: "+22%", sueldo: "75,000€", ejemplo: "Número de paradas" },
        { id: 5, nombre: "Analista de Neumáticos", icono: "🛞", especialidad: "Degradación de neumáticos", bono: "+16%", sueldo: "52,000€", ejemplo: "Compuesto predominante" },
        { id: 6, nombre: "Especialista en Overtakes", icono: "💨", especialidad: "Adelantamientos", bono: "+19%", sueldo: "58,000€", ejemplo: "Adelantamientos entre compañeros" }
    ];
    
    container.innerHTML = estrategas.map(e => 
        '<div class="estratega-tutorial-card seleccionable">' +
        '<div class="estratega-icon-tut">' + e.icono + '</div>' +
        '<div class="estratega-nombre-tut">' + e.nombre + '</div>' +
        '<div class="estratega-especialidad">' + e.especialidad + '</div>' +
        '<div class="estratega-bono">Bono: <span class="bono-valor">' + e.bono + '</span></div>' +
        '<div class="estratega-ejemplo">Ej: "' + e.ejemplo + '"</div>' +
        '</div>'
    ).join('');
};

window.tutorialSimularCarrera = function() {
    const tutorialData = window.tutorialData || {};
    const pronosticosSeleccionados = tutorialData.pronosticosSeleccionados || {};
    
    const resultadosReales = {
        bandera: 'si',
        abandonos: '3-5',
        diferencia: '1-5s'
    };
    
    let aciertos = 0;
    let detalles = [];
    
    const banderaCorrecto = pronosticosSeleccionados.bandera === resultadosReales.bandera;
    detalles.push('<div class="resultado-item ' + (banderaCorrecto ? 'correcto' : 'incorrecto') + '">' + (banderaCorrecto ? '✅' : '❌') + ' Bandera amarilla: ' + (pronosticosSeleccionados.bandera === 'si' ? 'SÍ' : 'NO') + ' (' + (banderaCorrecto ? 'correcto' : 'incorrecto, fue ' + (resultadosReales.bandera === 'si' ? 'SÍ' : 'NO')) + ')</div>');
    if (banderaCorrecto) aciertos++;
    
    const abandonosCorrecto = pronosticosSeleccionados.abandonos === resultadosReales.abandonos;
    detalles.push('<div class="resultado-item ' + (abandonosCorrecto ? 'correcto' : 'incorrecto') + '">' + (abandonosCorrecto ? '✅' : '❌') + ' Abandonos: ' + pronosticosSeleccionados.abandonos + ' (' + (abandonosCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.abandonos) + ')</div>');
    if (abandonosCorrecto) aciertos++;
    
    const diferenciaCorrecto = pronosticosSeleccionados.diferencia === resultadosReales.diferencia;
    detalles.push('<div class="resultado-item ' + (diferenciaCorrecto ? 'correcto' : 'incorrecto') + '">' + (diferenciaCorrecto ? '✅' : '❌') + ' Diferencia 1º-2º: ' + pronosticosSeleccionados.diferencia + ' (' + (diferenciaCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.diferencia) + ')</div>');
    if (diferenciaCorrecto) aciertos++;
    
    tutorialData.aciertosPronosticos = aciertos;
    tutorialData.totalPronosticos = 3;
    tutorialData.resultadosReales = resultadosReales;
    tutorialData.puntosBaseCalculados = (banderaCorrecto ? 150 : 0) + (abandonosCorrecto ? 180 : 0) + (diferenciaCorrecto ? 200 : 0);
    
    const resultados = document.getElementById('resultado-simulacion');
    if (resultados) {
        resultados.innerHTML = '<div class="resultado-simulado"><h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>' + detalles.join('') + '<div class="resumen-simulacion"><strong>' + aciertos + ' de 3 pronósticos acertados (' + Math.round(aciertos/3*100) + '%)</strong></div><div class="puntos-simulacion">Puntos base obtenidos: <strong>' + tutorialData.puntosBaseCalculados + ' pts</strong></div></div>';
        resultados.style.display = 'block';
    }
    
    const notifCarrera = document.createElement('div');
    notifCarrera.className = 'notification info';
    notifCarrera.innerHTML = '<div class="notification-content"><i class="fas fa-flag-checkered"></i><span>🏁 Carrera simulada - ' + aciertos + ' de 3 aciertos (' + Math.round(aciertos/3*100) + '%)</span></div>';
    document.body.appendChild(notifCarrera);
    
    setTimeout(() => notifCarrera.classList.add('show'), 10);
    setTimeout(() => {
        notifCarrera.classList.remove('show');
        setTimeout(() => {
            if (notifCarrera.parentNode) {
                notifCarrera.parentNode.removeChild(notifCarrera);
            }
        }, 300);
    }, 2000);
    
    document.getElementById('btn-tutorial-next-large').classList.remove('hidden');
};

window.tutorialIrSeccion = function(seccion) {
    alert('Esta función te llevaría a la sección: ' + seccion.toUpperCase() + '\n\nEn el juego real, puedes navegar entre secciones usando el menú superior.');
};

window.tutorialEjecutarPronostico = function() {
    if (!window.tutorialData || !window.tutorialData.pronosticosSeleccionados) {
        alert("No has seleccionado ningún pronóstico");
        return;
    }
    
    const selecciones = window.tutorialData.pronosticosSeleccionados;
    const count = Object.keys(selecciones).length;
    
    if (count < 3) {
        alert('Has seleccionado ' + count + ' de 3 pronósticos. Necesitas seleccionar uno de cada categoría.');
        return;
    }
    
    const resultadosReales = {
        bandera: 'si',
        abandonos: '3-5',
        diferencia: '1-5s'
    };
    
    let aciertos = 0;
    const detalles = [];
    
    if (selecciones.bandera === resultadosReales.bandera) {
        aciertos++;
        detalles.push('✅ Bandera amarilla: SÍ (acertaste)');
    } else {
        detalles.push('❌ Bandera amarilla: ' + (selecciones.bandera === 'si' ? 'SÍ' : 'NO') + ' (era ' + (resultadosReales.bandera === 'si' ? 'SÍ' : 'NO') + ')');
    }
    
    if (selecciones.abandonos === resultadosReales.abandonos) {
        aciertos++;
        detalles.push('✅ Abandonos: 3-5 (acertaste)');
    } else {
        detalles.push('❌ Abandonos: ' + selecciones.abandonos + ' (era ' + resultadosReales.abandonos + ')');
    }
    
    if (selecciones.diferencia === resultadosReales.diferencia) {
        aciertos++;
        detalles.push('✅ Diferencia: 1-5s (acertaste)');
    } else {
        detalles.push('❌ Diferencia: ' + selecciones.diferencia + ' (era ' + resultadosReales.diferencia + ')');
    }
    
    const resultados = document.getElementById('resultado-simulacion');
    if (resultados) {
        resultados.innerHTML = '<div class="resultado-simulado"><h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>' + detalles.map(d => '<div class="resultado-item">' + d + '</div>').join('') + '<div class="resumen-simulacion"><strong>' + aciertos + ' de 3 pronósticos acertados (' + Math.round((aciertos/3)*100) + '%)</strong></div></div>';
        resultados.style.display = 'block';
    }
    
    window.tutorialData.aciertosPronosticos = aciertos;
    window.tutorialData.totalPronosticos = 3;
    
    const notificacion = document.createElement('div');
    notificacion.className = aciertos >= 2 ? 'notification success' : 'notification warning';
    notificacion.innerHTML = '<div class="notification-content"><i class="fas fa-' + (aciertos >= 2 ? 'trophy' : 'chart-line') + '"></i><span>' + aciertos + ' de 3 pronósticos acertados</span></div>';
    document.body.appendChild(notificacion);
    
    setTimeout(() => notificacion.classList.add('show'), 10);
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 2000);
    
    setTimeout(() => {
        if (window.tutorialManager) {
            window.tutorialManager.tutorialStep++;
            window.tutorialManager.mostrarTutorialStep();
        }
    }, 2000);
};

window.mostrarInfoEstratega = function(index) {
    const estratega = window.f1Manager.pilotos[index];
    if (estratega) {
        alert('📊 Estratega: ' + estratega.nombre + '\n💰 Salario: €' + estratega.salario + '/mes\n🎯 Función: ' + estratega.especialidad + '\n✨ Bono: +' + estratega.bonificacion_valor + '% puntos');
    }
};

window.contratarNuevoEstratega = function(hueco) {
    if (window.tabManager) {
        window.tabManager.switchTab('equipo');
    } else {
        alert('Contratar nuevo estratega para hueco ' + (hueco + 1) + '\nRedirigiendo al mercado...');
    }
};

window.recogerPiezaTutorial = async function(fabricacionId, area) {
    try {
        await window.supabase
            .from('fabricacion_actual')
            .update({ completada: true })
            .eq('id', fabricacionId);
        
        const { error: errorAlmacen } = await window.supabase
            .from('almacen_piezas')
            .insert([{
                escuderia_id: window.f1Manager.escuderia.id,
                area: area,
                nivel: 1,
                puntos_base: 15,
                calidad: 'Básica',
                equipada: false,
                fabricada_en: new Date().toISOString(),
                creada_en: new Date().toISOString()
            }]);
        
        if (errorAlmacen) throw errorAlmacen;
        
        const notificacion = document.createElement('div');
        notificacion.className = 'notification success';
        notificacion.innerHTML = '<div class="notification-content"><i class="fas fa-box-open"></i><span>✅ Pieza añadida al almacén</span></div>';
        document.body.appendChild(notificacion);
        
        setTimeout(() => notificacion.classList.add('show'), 10);
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 2000);
        
        if (window.f1Manager) {
            window.f1Manager.updateProductionMonitor();
        }
        
    } catch (error) {
        console.error("Error recogiendo pieza:", error);
        alert("Error recogiendo pieza: " + error.message);
    }
};

window.addEventListener('auth-completado', async (evento) => {
    console.log('✅ Evento auth-completado recibido en main.js');
    
    const { user, escuderia, supabase } = evento.detail || window.authData || {};
    
    if (user && escuderia) {
        console.log('🎮 Creando F1Manager con datos de autenticación...');
        
        // MOSTRAR PANTALLA DE CARGA - SIEMPRE AL INICIAR
        mostrarPantallaCargaInicial();
        
        window.f1Manager = new F1Manager(user, escuderia, supabase);
        
        if (window.IngenieriaManager && !window.ingenieriaManager) {
            console.log('🔧 Creando ingenieriaManager...');
            try {
                window.ingenieriaManager = new window.IngenieriaManager(window.f1Manager);
                // Inicializar pero no esperar (se hará async)
                window.ingenieriaManager.inicializar().then(() => {
                    console.log('✅ ingenieriaManager inicializado');
                }).catch(error => {
                    console.error('❌ Error inicializando ingenieriaManager:', error);
                });
            } catch (error) {
                console.error('❌ Error creando ingenieriaManager:', error);
            }
        }
        
        
        if (window.MercadoManager) {
            console.log('🔧 Inicializando mercadoManager con escudería:', escuderia.id);
            if (!window.mercadoManager) {
                window.mercadoManager = new window.MercadoManager();
            }
            await window.mercadoManager.inicializar(escuderia);
            console.log('✅ mercadoManager inicializado');
        } else {
            console.error('❌ MercadoManager no está disponible');
        }
        
        if (!escuderia.tutorial_completado) {
            console.log('📚 Mostrando tutorial...');
            window.tutorialManager = new TutorialManager(window.f1Manager);
            window.tutorialManager.iniciar();
        } else {
            console.log('✅ Tutorial ya completado, cargando dashboard...');
            // Simular progreso de carga
            actualizarProgresoCarga(30, "Cargando escudería...");
            await new Promise(resolve => setTimeout(resolve, 800));
            
            actualizarProgresoCarga(60, "Preparando dashboard...");
            await new Promise(resolve => setTimeout(resolve, 800));
            
            actualizarProgresoCarga(90, "Inicializando sistemas...");
            await new Promise(resolve => setTimeout(resolve, 800));
            
            actualizarProgresoCarga(100, "¡Listo!");
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Ocultar pantalla de carga antes de cargar el dashboard
            ocultarPantallaCarga();
            
            await window.f1Manager.cargarDashboardCompleto();
        }
    }
});

// Añade estas funciones auxiliares después del event listener:

function mostrarPantallaCargaInicial() {
    document.body.innerHTML = `
        <div id="f1-loading-screen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            font-family: 'Orbitron', sans-serif;
        ">
            <div style="margin-bottom: 40px; text-align: center;">
                <div style="color: #e10600; font-size: 4rem; font-weight: bold; margin-bottom: 10px; text-shadow: 0 0 20px rgba(225, 6, 0, 0.7); letter-spacing: 2px;">
                    CRITICAL LAP
                </div>
                <div style="color: #ffffff; font-size: 1.2rem; letter-spacing: 3px; font-weight: 300;">
                    STRATEGY & DESIGN
                </div>
            </div>
            
            <div style="color: #ffffff; font-size: 1.5rem; margin-bottom: 30px; text-align: center; font-weight: 500; letter-spacing: 1px;">
                CARGANDO ESCUDERÍA
            </div>
            
            <div style="width: 80%; max-width: 500px; background: rgba(255, 255, 255, 0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 20px; position: relative;">
                <div id="f1-progress-bar" style="
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #e10600, #ff4444);
                    border-radius: 4px;
                    transition: width 1.5s ease;
                    position: relative;
                    box-shadow: 0 0 10px rgba(225, 6, 0, 0.5);
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 20%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
                        animation: shine 2s infinite;
                        transform: skewX(-20deg);
                    "></div>
                </div>
            </div>
            
            <div style="color: #00d2be; font-size: 1.2rem; font-weight: bold; margin-top: 15px; font-family: 'Orbitron', sans-serif;">
                <span id="f1-progress-text">0%</span>
            </div>
            
            <div id="f1-loading-message" style="
                color: #888;
                font-size: 0.9rem;
                margin-top: 25px;
                text-align: center;
                max-width: 500px;
                padding: 0 20px;
                font-family: 'Roboto', sans-serif;
            ">
                Preparando tu escudería para la competición...
            </div>
            
        </div>
        
        <style>
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
            }
            

        </style>
    `;
}

function actualizarProgresoCarga(percentage, message) {
    const progressBar = document.getElementById('f1-progress-bar');
    const progressText = document.getElementById('f1-progress-text');
    const loadingMessage = document.getElementById('f1-loading-message');
    
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}%`;
    if (loadingMessage && message) loadingMessage.textContent = message;
}

function ocultarPantallaCarga() {
    const loadingScreen = document.getElementById('f1-loading-screen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

setTimeout(() => {
    if (window.authData && window.authData.user && window.authData.escuderia) {
        console.log('📦 Usando datos de authData almacenados');
        const evento = new CustomEvent('auth-completado', { detail: window.authData });
        window.dispatchEvent(evento);
    }
}, 1000);

(function() {
    window.tutorialData = {
        estrategaSeleccionado: null,
        estrategaContratado: false,
        areaSeleccionada: null,
        piezaFabricando: false,
        pronosticoSeleccionado: null
    };
    
    window.tutorialSeleccionarEstratega = function(id) {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialSeleccionarEstratega === 'function') {
            window.tutorialManager.tutorialSeleccionarEstratega(id);
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialContratarEstratega = function() {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialContratarEstratega === 'function') {
            window.tutorialManager.tutorialContratarEstratega();
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialSeleccionarArea = function(area) {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialSeleccionarArea === 'function') {
            window.tutorialManager.tutorialSeleccionarArea(area);
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialIniciarFabricacion = function() {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialIniciarFabricacion === 'function') {
            window.tutorialManager.tutorialIniciarFabricacion();
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.mostrarModalContratacion = function(huecoNumero) {
        alert('Mostrar modal para contratar estratega en hueco ' + huecoNumero);
    };
    
    window.despedirEstratega = function(estrategaId) {
        if (confirm('¿Estás seguro de despedir a este estratega?')) {
            console.log('Despedir estratega ID:', estrategaId);
            alert('Estratega despedido. Hueco disponible para nuevo contrato.');
            
            if (window.f1Manager) {
                setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
            }
        }
    };
    
    window.cerrarSesion = function() {
        if (window.authManager) {
            window.authManager.cerrarSesion();
        }
    };
    
    window.recargarDatosUsuario = async function() {
        if (window.authManager && window.authManager.supabase) {
            const { data: { session } } = await window.authManager.supabase.auth.getSession();
            if (session) {
                await window.authManager.cargarDatosUsuario(session.user);
                return { user: window.authManager.user, escuderia: window.authManager.escuderia };
            }
        }
        return null;
    };
    
    window.gestionarEstrategas = function() {
        alert('Mostrar pantalla completa de gestión de estrategas');
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('equipo');
        }
    };
    
    window.iniciarFabricacionTaller = function(areaId, nivel) {
        if (window.f1Manager && window.f1Manager.iniciarFabricacionTaller) {
            window.f1Manager.iniciarFabricacionTaller(areaId, nivel);
        } else {
            alert('Error: Sistema de fabricación no disponible');
        }
    };
    
    window.mostrarModalContratacion = function(huecoNumero) {
        const modalHTML = '<div id="modal-contratacion" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;">' +
            '<div style="background: #1a1a2e; padding: 20px; border-radius: 10px; border: 2px solid #00d2be; max-width: 400px; width: 90%;">' +
            '<h3 style="color: #00d2be; margin-top: 0;">Contratar Estratega</h3>' +
            '<p>Selecciona un estratega para el hueco ' + huecoNumero + ':</p>' +
            '<div style="margin: 20px 0;">' +
            '<button onclick="contratarEstrategaFicticio(1, ' + huecoNumero + ')" style="width: 100%; padding: 10px; margin: 5px 0; background: rgba(0,210,190,0.1); border: 1px solid #00d2be; color: white; border-radius: 5px; cursor: pointer;">🕐 Analista de Tiempos (+15%)</button>' +
            '<button onclick="contratarEstrategaFicticio(2, ' + huecoNumero + ')" style="width: 100%; padding: 10px; margin: 5px 0; background: rgba(0,210,190,0.1); border: 1px solid #00d2be; color: white; border-radius: 5px; cursor: pointer;">🌧️ Meteorólogo (+20%)</button>' +
            '<button onclick="contratarEstrategaFicticio(3, ' + huecoNumero + ')" style="width: 100%; padding: 10px; margin: 5px 0; background: rgba(0,210,190,0.1); border: 1px solid #00d2be; color: white; border-radius: 5px; cursor: pointer;">🔧 Experto en Fiabilidad (+18%)</button>' +
            '</div>' +
            '<div style="display: flex; gap: 10px;">' +
            '<button onclick="document.getElementById(\'modal-contratacion\').remove()" style="flex: 1; padding: 10px; background: transparent; border: 1px solid #666; color: #aaa; border-radius: 5px; cursor: pointer;">Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };
    
    window.contratarEstrategaFicticio = function(tipo, hueco) {
        const estrategas = {
            1: { nombre: "Analista Tiempos", especialidad: "Análisis", bono: 15 },
            2: { nombre: "Meteorólogo", especialidad: "Clima", bono: 20 },
            3: { nombre: "Experto Fiabilidad", especialidad: "Técnica", bono: 18 }
        };
        
        alert('Contratado: ' + estrategas[tipo].nombre + ' en hueco ' + hueco);
        document.getElementById('modal-contratacion').remove();
        
        if (window.f1Manager) {
            setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
        }
    };
    
    window.contratarEstrategaDesdeTutorial = function() {
        if (window.tabManager) {
            window.tabManager.switchTab('equipo');
        } else {
            window.mostrarModalContratacion(1);
        }
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎮 Configurando eventos del countdown...');
        
        const btnPronostico = document.getElementById('btn-enviar-pronostico');
        const btnCalendario = document.getElementById('btn-calendario');
        
        if (btnPronostico) {
            console.log('✅ Botón pronóstico encontrado');
            btnPronostico.addEventListener('click', () => {
                console.log('📤 Click en Enviar Pronóstico');
                
                const tabPronosticos = document.querySelector('[data-tab="pronosticos"]');
                if (tabPronosticos) {
                    tabPronosticos.click();
                    console.log('📍 Cambiando a pestaña pronósticos');
                } else {
                    const tabApuestas = document.querySelector('[data-tab="apuestas"]');
                    if (tabApuestas) {
                        tabApuestas.click();
                    } else {
                        alert('🚀 Redirigiendo a pronósticos...\n\n(Para probar: ve a la pestaña "PRONÓSTICOS" en el menú)');
                    }
                }
            });
        }
        
        if (btnCalendario) {
            console.log('✅ Botón calendario encontrado');
            btnCalendario.addEventListener('click', () => {
                console.log('📅 Click en Calendario');
                alert('📅 CALENDARIO F1 2026\n\nFuncionalidad en desarrollo...\n\nPróximamente podrás:\n• Ver todas las carreras\n• Filtrar por temporada\n• Ver resultados pasados\n• Planificar estrategias');
            });
        }
    });
    
    window.recogerPiezaYActualizarAlmacen = async function(fabricacionId) {
        try {
            console.log("Recogiendo pieza:", fabricacionId);
            
            const { data: fabricacion, error: fetchError } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            const areaId = fabricacion.area.toLowerCase().replace(/ /g, '_');
            
            const { error: insertError } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: areaId,
                    nivel: fabricacion.nivel || 1,
                    puntos_base: 10,
                    estado: 'disponible',
                    fabricada_en: new Date().toISOString()
                }]);
            
            if (insertError) throw insertError;
            
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);
            
            if (updateError) throw updateError;
            
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification('✅ ' + fabricacion.area + ' añadida al almacén', 'success');
            }
            
            if (window.f1Manager && window.f1Manager.updateProductionMonitor) {
                setTimeout(() => window.f1Manager.updateProductionMonitor(), 500);
            }
            
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                if (window.tabManager.loadAlmacenPiezas) {
                    setTimeout(() => window.tabManager.loadAlmacenPiezas(), 1000);
                }
            } else {
                window.almacenNecesitaActualizar = true;
            }
            
        } catch (error) {
            console.error("Error recogiendo pieza:", error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification("❌ Error al recoger pieza", 'error');
            }
        }
    };

    // ========================
    // FUNCIÓN GLOBAL MODIFICADA PARA CALCULAR NIVEL
    // ========================
    window.iniciarFabricacionTallerDesdeBoton = async function(areaId, nivelDesdeBoton) {
        console.log('🔧 Botón presionado para:', areaId, 'nivel desde botón:', nivelDesdeBoton);
        
        if (!window.f1Manager || !window.f1Manager.iniciarFabricacionTaller) {
            alert('Error: Sistema de fabricación no disponible');
            return false;
        }
        
        // Obtener la próxima pieza a fabricar para esta área
        const { data: piezasFabricadas } = await supabase
            .from('almacen_piezas')
            .select('numero_global')
            .eq('escuderia_id', window.f1Manager.escuderia.id)
            .eq('area', areaId)
            .order('numero_global', { ascending: true });
        
        const siguienteNumeroGlobal = (piezasFabricadas?.length || 0) + 1;
        const nivelCalculado = Math.ceil(siguienteNumeroGlobal / 5);
        
        console.log('📊 Calculando fabricación:', {
            siguienteNumeroGlobal,
            nivelCalculado,
            nivelDesdeBoton
        });
        
        // Verificar dinero primero
        if (!window.f1Manager.escuderia || window.f1Manager.escuderia.dinero < 10000) {
            window.f1Manager.showNotification('❌ Fondos insuficientes (necesitas €10,000)', 'error');
            return false;
        }
        
        // Ejecutar fabricación con el nivel calculado
        const resultado = await window.f1Manager.iniciarFabricacionTaller(areaId, nivelCalculado);
        
        // Si se inició, actualizar UI
        if (resultado) {
            // Actualizar taller
            setTimeout(() => {
                if (window.f1Manager.cargarTabTaller) {
                    window.f1Manager.cargarTabTaller();
                }
            }, 1000);
            
            // Ir a principal para ver la producción
            setTimeout(() => {
                if (window.tabManager && window.tabManager.switchTab) {
                    window.tabManager.switchTab('principal');
                }
            }, 1500);
        }
        
        return resultado;
    };
    // ========================
    // ========================
    // CALENDARIO SIMPLE - VERSIÓN LEGIBLE
    // ========================
    window.mostrarCalendarioSimple = async function() {
        try {
            const { data: carreras, error } = await supabase
                .from('calendario_gp')
                .select('*')
                .order('fecha_inicio', { ascending: true });
            
            if (error) throw error;
            
            // Crear modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                z-index: 9999;
                padding: 15px;
                overflow: auto;
            `;
            
            // Contenedor
            const container = document.createElement('div');
            container.style.cssText = `
                max-width: 100%;
                margin: 15px auto;
                background: #1a1a2e;
                border-radius: 8px;
                padding: 15px;
                border: 2px solid #00d2be;
            `;
            
            // Header
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #00d2be;
            `;
            
            const titulo = document.createElement('h3');
            titulo.textContent = 'CALENDARIO F1 2024';
            titulo.style.cssText = 'color: #00d2be; margin: 0; font-size: 1rem; font-weight: bold;';
            
            const btnCerrar = document.createElement('button');
            btnCerrar.textContent = '✕';
            btnCerrar.style.cssText = `
                background: #e10600;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.9rem;
            `;
            btnCerrar.onclick = () => modal.remove();
            
            header.appendChild(titulo);
            header.appendChild(btnCerrar);
            
            // Tabla
            const tabla = document.createElement('table');
            tabla.style.cssText = `
                width: 100%;
                border-collapse: collapse;
                color: white;
                font-size: 0.85rem;
            `;
            
            // Encabezados
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr style="background: #00d2be; color: black;">
                    <th style="padding: 8px; text-align: left; width: 35px;">#</th>
                    <th style="padding: 8px; text-align: left;">GRAN PREMIO</th>
                    <th style="padding: 8px; text-align: left; width: 65px;">FECHA</th>
                    <th style="padding: 8px; text-align: left; width: 80px;">APUESTAS</th>
                </tr>
            `;
            
            // Cuerpo
            const tbody = document.createElement('tbody');
            
            if (carreras && carreras.length > 0) {
                carreras.forEach((carrera, index) => {
                    const fecha = new Date(carrera.fecha_inicio);
                    const dia = fecha.getDate().toString().padStart(2, '0');
                    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                    const fechaFormateada = `${dia}-${mes}`;
                    
                    const fila = document.createElement('tr');
                    fila.style.cssText = `
                        border-bottom: 1px solid #333;
                        background: ${index % 2 === 0 ? '#222' : '#1a1a2e'};
                    `;
                    
                    // Dividir nombre en dos líneas si tiene "de"
                    let nombreHTML = carrera.nombre;
                    if (carrera.nombre.includes(' de ')) {
                        const partes = carrera.nombre.split(' de ');
                        nombreHTML = `${partes[0]}<br><span style="color: #aaa; font-size: 0.75rem;">de ${partes[1]}</span>`;
                    } else if (carrera.nombre.includes(' ')) {
                        const palabras = carrera.nombre.split(' ');
                        if (palabras.length > 2) {
                            nombreHTML = `${palabras.slice(0, 2).join(' ')}<br><span style="color: #aaa; font-size: 0.75rem;">${palabras.slice(2).join(' ')}</span>`;
                        }
                    }
                    
                    fila.innerHTML = `
                        <td style="padding: 8px; color: #aaa; vertical-align: top;">${index + 1}</td>
                        <td style="padding: 8px; font-weight: bold; vertical-align: top; line-height: 1.2;">${nombreHTML}</td>
                        <td style="padding: 8px; color: #00d2be; vertical-align: top; text-transform: uppercase;">${fechaFormateada}</td>
                        <td style="padding: 8px; vertical-align: top;">
                            <span style="color: ${carrera.cerrado_apuestas ? '#e10600' : '#00d2be'}; 
                                  font-weight: bold; font-size: 0.8rem;">
                                ${carrera.cerrado_apuestas ? 'CERRADO' : 'ABIERTO'}
                            </span>
                        </td>
                    `;
                    
                    tbody.appendChild(fila);
                });
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="padding: 20px; text-align: center; color: #888; font-size: 0.9rem;">
                            No hay carreras programadas
                        </td>
                    </tr>
                `;
            }
            
            tabla.appendChild(thead);
            tabla.appendChild(tbody);
            
            // Footer
            const footer = document.createElement('div');
            footer.style.cssText = `
                margin-top: 12px;
                padding-top: 8px;
                border-top: 1px solid #333;
                color: #aaa;
                font-size: 0.8rem;
                text-align: center;
            `;
            footer.textContent = `Total: ${carreras?.length || 0} Grandes Premios`;
            
            // Ensamblar
            container.appendChild(header);
            container.appendChild(tabla);
            container.appendChild(footer);
            modal.appendChild(container);
            document.body.appendChild(modal);
            
            // Cerrar con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') modal.remove();
            });
            
            // Cerrar tocando fuera
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
        } catch (error) {
            console.error('Error cargando calendario:', error);
            alert('Error al cargar el calendario: ' + error.message);
        }
    };
    // ========================
    // FUNCIÓN PARA IR A PESTAÑA PRONÓSTICOS
    // ========================
    window.irAPestañaPronosticos = function() {
        console.log('📊 Redirigiendo a pestaña Pronósticos...');
        
        // Buscar el botón de la pestaña pronosticos
        const tabButton = document.querySelector('[data-tab="pronosticos"]');
        
        if (tabButton) {
            // Simular click para activar todo el sistema que ya tienes
            tabButton.click();
            console.log('✅ Click simulado en pestaña Pronósticos');
        } else {
            console.error('❌ No se encontró el botón de pestaña Pronósticos');
            
            // Plan B: Activar manualmente
            document.querySelectorAll('.tab-btn-compacto').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            const pronosticosTab = document.getElementById('tab-pronosticos');
            if (pronosticosTab) {
                pronosticosTab.classList.add('active');
                console.log('✅ Pestaña Pronósticos activada manualmente');
            }
        }
    };
    
    
    // Función para redirigir al almacén desde las piezas montadas
    window.irAlAlmacenDesdePiezas = function() {
        console.log('📦 Redirigiendo al almacén desde piezas montadas...');
        
        // Método 1: Usar el tabManager si existe
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('almacen');
            console.log('✅ Redirigido usando tabManager');
            return;
        }
        
        // Método 2: Simular click en la pestaña de almacén
        const tabAlmacen = document.querySelector('[data-tab="almacen"]');
        if (tabAlmacen) {
            tabAlmacen.click();
            console.log('✅ Redirigido haciendo click en pestaña');
            return;
        }
        
        // Método 3: Alternativa directa
        const almacenTab = document.getElementById('tab-almacen');
        if (almacenTab) {
            // Ocultar todas las pestañas
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Desactivar todos los botones
            document.querySelectorAll('.tab-btn-compacto').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Activar pestaña de almacén
            almacenTab.classList.add('active');
            
            // Activar botón correspondiente
            const btnAlmacen = document.querySelector('[data-tab="almacen"]');
            if (btnAlmacen) {
                btnAlmacen.classList.add('active');
            }
            
            console.log('✅ Redirigido activando pestaña manualmente');
            
            // Si hay cargador de almacén, ejecutarlo
            setTimeout(() => {
                if (window.tabManager && window.tabManager.loadAlmacenPiezas) {
                    window.tabManager.loadAlmacenPiezas();
                } else if (window.cargarContenidoAlmacen) {
                    window.cargarContenidoAlmacen();
                }
            }, 100);
        } else {
            console.warn('⚠️ No se encontró la pestaña de almacén');
            alert('Redirigiendo al almacén...');
        }
    };
    
    // También puedes añadir una versión alternativa por si acaso
    window.goToAlmacen = window.irAlAlmacenDesdePiezas;    
    
    // ============================================
    // AÑADIR ESTO - FUNCIÓN EXPLICACIÓN ESTRELLAS
    // ============================================
    window.mostrarExplicacionEstrellas = function() {
        // Crear elemento de explicación
        const explicacion = document.createElement('div');
        explicacion.id = 'explicacion-estrellas';
        explicacion.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
                border: 3px solid #FFD700;
                border-radius: 15px;
                padding: 25px;
                z-index: 9999;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 3rem; color: #FFD700; margin-bottom: 10px;">🌟</div>
                    <h2 style="color: #FFD700; margin: 0 0 5px 0; font-size: 1.5rem;">BONUS DE PATROCINIO</h2>
                    <div style="color: #00d2be; font-size: 1.2rem; font-weight: bold;">Tu compromiso = Más financiación</div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 15px;">
                        <strong>Los patrocinadores</strong> premian tu dedicación diaria a la escudería. 
                        Cuanto más te impliques en desarrollar el coche, más fondos te aportarán.
                    </p>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>✅ Conectar cada día</span>
                            <span style="color: #FFD700; font-weight: bold;">+5🌟</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>🔧 Fabricar primera pieza del día</span>
                            <span style="color: #FFD700; font-weight: bold;">+10🌟</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🏎️ Realizar prueba en pista</span>
                            <span style="color: #FFD700; font-weight: bold;">+20🌟</span>
                        </div>
                    </div>
                    
                    <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 15px;">
                        <strong>Máximo diario: 35🌟</strong> (si haces las 3 acciones)<br>
                        <strong>Conversión:</strong> Cada estrella = <span style="color: #4CAF50; font-weight: bold;">€2,000</span>
                    </p>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 0.9rem; color: #aaa; margin-bottom: 5px;">PAGO AUTOMÁTICO</div>
                        <div style="color: #00d2be; font-weight: bold; font-size: 1.1rem;">
                            Cada domingo a las 23:00, tus estrellas se convierten en dinero
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; color: #888; font-size: 0.9rem;">
                    Esta ventana se cerrará en 5 segundos...
                </div>
            </div>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9998;
            " onclick="cerrarExplicacionEstrellas()"></div>
        `;
        
        document.body.appendChild(explicacion);
        
        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            cerrarExplicacionEstrellas();
        }, 5000);
    };
    
    window.cerrarExplicacionEstrellas = function() {
        const explicacion = document.getElementById('explicacion-estrellas');
        if (explicacion) {
            explicacion.remove();
        }
        // También remover el fondo oscuro
        const backdrops = document.querySelectorAll('body > div');
        backdrops.forEach(div => {
            if (div.style.position === 'fixed' && 
                div.style.background === 'rgba(0, 0, 0, 0.8)') {
                div.remove();
            }
        });
    };
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.cerrarExplicacionEstrellas();
        }
    });
    // ============================================
    // FIN FUNCIÓN EXPLICACIÓN ESTRELLAS
    // ============================================
    
})();
