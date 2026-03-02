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
        
        
        // GARANTIZAR QUE escuderiaId EXISTE Y ES STRING
        if (escuderia && escuderia.id) {
            this.escuderiaId = escuderia.id;
            console.log('✅ escuderiaId guardado:', this.escuderiaId, typeof this.escuderiaId);
        } else {
            // Si no hay escuderia válida, usar valores por defecto pero marcar error
            console.error('❌ ERROR CRÍTICO: escuderia inválida:', escuderia);
            this.escuderiaId = null;
            // Crear objeto mínimo para evitar crashes
            this.escuderia = {
                id: 'unknown',
                nombre: 'Escudería no encontrada',
                dinero: 0,
                puntos: 0
            };
        }
        
        this.supabase = supabase;
        this.pilotos = [];
        this.carStats = null;
        this.proximoGP = null;
        this.estrategiaManager = null;
        this._cargandoPiezas = false;  // ← AÑADE ESTO
        
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


        // Sistema de puntos "Dientes de sierra" - CAOS TOTAL (0-100 mezclado)
        this.puntosDientesSierra = {
            // SUELO - Completamente aleatorio
            'suelo': [12, 45, 3, 78, 22, 91, 0, 34, 67, 15, 
                      82, 41, 5, 63, 29, 100, 18, 74, 38, 57,
                      8, 96, 49, 11, 70, 84, 2, 53, 31, 88,
                      43, 19, 61, 0, 76, 35, 92, 26, 59, 14,
                      47, 81, 6, 69, 24, 100, 39, 72, 55, 17],
        
            // MOTOR - Desorden propio
            'motor': [33, 71, 0, 58, 94, 12, 45, 27, 83, 6,
                      62, 100, 19, 41, 77, 3, 51, 35, 89, 15,
                      68, 24, 0, 73, 46, 98, 8, 55, 31, 100,
                      17, 64, 81, 9, 37, 53, 0, 79, 21, 43,
                      95, 29, 66, 11, 49, 86, 4, 39, 72, 57],
        
            // ALERÓN DELANTERO - Puro caos
            'aleron_delantero': [0, 52, 87, 14, 63, 31, 100, 5, 45, 78,
                                 22, 69, 8, 91, 36, 59, 1, 73, 42, 95,
                                 17, 54, 0, 81, 28, 67, 100, 11, 48, 83,
                                 6, 38, 75, 20, 93, 33, 61, 2, 55, 89,
                                 25, 70, 13, 46, 97, 40, 79, 16, 64, 35],
        
            // CAJA CAMBIOS - Sin orden
            'caja_cambios': [44, 18, 92, 7, 60, 33, 76, 1, 54, 100,
                             27, 70, 14, 85, 41, 96, 3, 62, 38, 79,
                             21, 100, 50, 9, 73, 29, 66, 12, 57, 90,
                             35, 82, 5, 48, 100, 24, 69, 16, 94, 41,
                             77, 2, 56, 31, 88, 19, 63, 45, 8, 98],
        
            // PONTONES - Aleatorio puro
            'pontones': [27, 83, 4, 71, 46, 12, 95, 33, 58, 0,
                         69, 100, 17, 52, 39, 74, 8, 61, 88, 22,
                         43, 79, 14, 91, 36, 100, 1, 64, 30, 55,
                         0, 76, 19, 48, 86, 10, 67, 41, 93, 25,
                         59, 6, 82, 37, 100, 15, 50, 73, 3, 98],
        
            // SUSPENSIÓN - Caos total
            'suspension': [52, 0, 83, 21, 67, 38, 94, 7, 45, 100,
                           16, 59, 31, 75, 3, 49, 88, 12, 71, 42,
                           100, 27, 63, 5, 80, 34, 96, 18, 54, 0,
                           69, 23, 77, 10, 57, 91, 40, 100, 14, 73,
                           36, 85, 1, 60, 29, 82, 47, 99, 8, 44],
        
            // ALERÓN TRASERO - Desorden extremo
            'aleron_trasero': [73, 8, 100, 29, 54, 0, 82, 37, 65, 16,
                               91, 42, 0, 69, 23, 100, 48, 5, 77, 34,
                               60, 11, 86, 50, 1, 95, 32, 71, 19, 58,
                               100, 14, 45, 79, 3, 66, 39, 84, 26, 0,
                               55, 92, 20, 62, 46, 100, 7, 74, 35, 89],
        
            // CHASIS - Sin sentido
            'chasis': [41, 97, 12, 63, 0, 79, 28, 54, 100, 17,
                       70, 33, 85, 5, 48, 92, 21, 59, 100, 8,
                       36, 74, 0, 50, 89, 14, 67, 42, 100, 3,
                       25, 81, 38, 96, 9, 56, 0, 72, 44, 100,
                       19, 61, 31, 83, 2, 68, 47, 77, 15, 90],
        
            // FRENOS - Caos
            'frenos': [6, 81, 33, 100, 19, 57, 0, 74, 42, 95,
                       28, 63, 100, 10, 49, 84, 2, 70, 36, 100,
                       15, 53, 0, 78, 22, 67, 39, 91, 4, 59,
                       100, 31, 72, 13, 87, 45, 100, 8, 51, 25,
                       0, 64, 99, 17, 55, 82, 29, 93, 11, 70],
        
            // VOLANTE - Impredecible
            'volante': [100, 12, 45, 0, 78, 31, 64, 0, 89, 23,
                        56, 100, 7, 41, 82, 19, 93, 3, 68, 35,
                        0, 74, 28, 100, 16, 51, 0, 62, 44, 97,
                        9, 80, 100, 4, 38, 71, 25, 59, 0, 86,
                        33, 100, 14, 54, 0, 77, 41, 69, 22, 95],
        
            // ELECTRÓNICA - Aleatorio puro
            'electronica': [0, 54, 100, 11, 73, 28, 0, 89, 36, 62,
                            100, 5, 47, 81, 19, 0, 68, 33, 100, 15,
                            42, 77, 2, 59, 93, 24, 0, 71, 39, 100,
                            8, 56, 0, 84, 30, 65, 100, 17, 45, 78,
                            22, 0, 61, 96, 13, 50, 87, 4, 100, 38]
        };
  
    }


    // ========================
    // RECOMPENSA LOGIN DIARIO
    // ========================
    // Añadir después de otros métodos similares
    // ========================
    // RECOMPENSA LOGIN DIARIO - VERSIÓN CORREGIDA (NO DUPLICADA)
    // ========================
    async verificarRecompensaLoginDiario() {
        // VERIFICAR SI YA SE EJECUTÓ HOY
        const hoy = new Date().toISOString().split('T')[0];
        
        // Variable global para evitar múltiples ejecuciones
        if (window.loginVerificadoHoy === hoy) {
            console.log('ℹ️ Login ya verificado hoy, omitiendo...');
            return;
        }
        
        console.log('🌟 [LOGIN] Ejecutando verificarRecompensaLoginDiario - PRIMERA EJECUCIÓN');
        
        try {
            console.log('📅 Hoy:', hoy, 'Último login:', this.escuderia.ultimo_login_dia);
            
            // VERIFICAR SI YA CONECTÓ HOY
            if (this.escuderia.ultimo_login_dia === hoy) {
                console.log('ℹ️ Ya conectó hoy - Mostrar bienvenida');
                this.showNotification('¡Bienvenido a la escudería, jefe!');
                
                // Marcar como verificado
                window.loginVerificadoHoy = hoy;
                return;
            }
            
            console.log('🎯 Dando +5 estrellas por login diario');
            const nuevasEstrellas = (this.escuderia.estrellas_semana || 0) + 5;
            
            // Actualizar en la base de datos
            const { error } = await this.supabase
                .from('escuderias')
                .update({ 
                    estrellas_semana: nuevasEstrellas,
                    ultimo_login_dia: hoy
                })
                .eq('id', this.escuderia.id);
            
            if (error) {
                console.error('❌ Error actualizando estrellas de login:', error);
                this.showNotification('❌ Error dando estrellas de login', 'error');
                return;
            }
            
            // Actualizar en memoria
            this.escuderia.estrellas_semana = nuevasEstrellas;
            this.escuderia.ultimo_login_dia = hoy;
            
            // Actualizar UI
            const estrellasElement = document.getElementById('estrellas-value');
            if (estrellasElement) {
                estrellasElement.textContent = nuevasEstrellas;
            }
            
            // ✅ NOTIFICACIÓN ÚNICA
            console.log('🔔 Mostrando notificación de +5 estrellas');
            this.showNotification('🌟 +5🌟 (bonus diario)', 'info');
            
            // Marcar como verificado para hoy
            window.loginVerificadoHoy = hoy;
            
        } catch (error) {
            console.error('❌ Error en verificarRecompensaLoginDiario:', error);
            this.showNotification('❌ Error verificando login', 'error');
        }
    }
    
    async darEstrellasFabricacion() {
        console.log('💰 [ESTRELLAS] Ejecutando darEstrellasFabricacion');
        
        try {
            // Obtener datos actualizados de la escudería
            const { data: escuderiaActualizada, error } = await this.supabase
                .from('escuderias')
                .select('primera_fabricacion_hoy, estrellas_semana')
                .eq('id', this.escuderia.id)
                .single();
            
            if (error) {
                console.error('❌ Error obteniendo datos de escudería:', error);
                this.showNotification('❌ Error verificando estrellas', 'error');
                return;
            }
            
            console.log('📊 Estado escudería:', escuderiaActualizada);
            
            // Verificar si es primera fabricación del día
            if (escuderiaActualizada && !escuderiaActualizada.primera_fabricacion_hoy) {
                console.log('🎯 Es primera fabricación del día, dando +10 estrellas');
                
                const nuevasEstrellas = (escuderiaActualizada.estrellas_semana || 0) + 10;
                
                // Actualizar en la base de datos
                const { error: updateError } = await this.supabase
                    .from('escuderias')
                    .update({ 
                        estrellas_semana: nuevasEstrellas,
                        primera_fabricacion_hoy: true
                    })
                    .eq('id', this.escuderia.id);
                
                if (updateError) {
                    console.error('❌ Error actualizando estrellas:', updateError);
                    this.showNotification('❌ Error actualizando estrellas', 'error');
                    return;
                }
                
                // Actualizar en memoria
                this.escuderia.estrellas_semana = nuevasEstrellas;
                this.escuderia.primera_fabricacion_hoy = true;
                
                // Actualizar UI
                const estrellasElement = document.getElementById('estrellas-value');
                if (estrellasElement) {
                    estrellasElement.textContent = nuevasEstrellas;
                }
                
                // ✅✅✅ ¡¡¡NOTIFICACIÓN OBLIGATORIA!!!
                console.log('🔔 Mostrando notificación de +10 estrellas');
                this.showNotification('💰 +10🌟 (primera fabricación del día)', 'info');
                
            } else {
                console.log('ℹ️ No es primera fabricación del día o ya recibió estrellas');
                // Mostrar notificación informativa de todos modos
                this.showNotification('📅 Ya recibiste estrellas por fabricar hoy', 'info');
            }
            
        } catch (error) {
            console.error('❌ Error en darEstrellasFabricacion:', error);
            this.showNotification('❌ Error dando estrellas', 'error');
        }
    }
    async procesarPiezaDestruida(piezaId, areaId, puntosBase) {
        console.log(`💥 Procesando pieza destruida: ${piezaId} (${puntosBase} pts)`);
        
        // 1. OBTENER PUNTOS ACTUALES DIRECTAMENTE DE LA BD
        const { data: escuderiaBD, error: errorConsulta } = await this.supabase
            .from('escuderias')
            .select('puntos')
            .eq('id', this.escuderia.id)
            .single();
        
        if (errorConsulta) {
            console.error('❌ Error obteniendo puntos:', errorConsulta);
            this.showNotification('Error al procesar la pieza', 'error');
            return;
        }
        
        const puntosActuales = escuderiaBD.puntos || 0;
        console.log('💰 Puntos actuales en BD:', puntosActuales);
        console.log('💰 Puntos de la pieza destruida:', puntosBase);
        
        // 2. CALCULAR NUEVOS PUNTOS (RESTAR SOLO LO DE ESTA PIEZA)
        // Asegurar que puntosBase es un número
        const puntosARestar = Number(puntosBase) || 0;
        const nuevosPuntos = Math.max(0, puntosActuales - puntosARestar);
        console.log('💰 Nuevos puntos totales:', nuevosPuntos);
        console.log('💰 Puntos restados:', puntosActuales - nuevosPuntos);
        
        // 3. ACTUALIZAR BD CON LOS NUEVOS PUNTOS
        const { error: errorUpdate } = await this.supabase
            .from('escuderias')
            .update({ puntos: nuevosPuntos })
            .eq('id', this.escuderia.id);
        
        if (errorUpdate) {
            console.error('❌ Error actualizando puntos:', errorUpdate);
            this.showNotification('Error al actualizar puntos', 'error');
            return;
        }
        
        // 4. ACTUALIZAR MEMORIA
        this.escuderia.puntos = nuevosPuntos;
        
        // 5. ACTUALIZAR UI (el contador de puntos)
        // 5. ACTUALIZAR UI (el contador de puntos)
        const puntosElement = document.getElementById('points-value'); // ← SOLO UNA VEZ
        if (puntosElement) {
            puntosElement.textContent = nuevosPuntos;
        }
        
        // 6. RESTAR PUNTOS DEL COCHE (progreso del área)
        await this.restarPuntosDelCoche(areaId, puntosBase);
        
        // 7. ELIMINAR LA PIEZA DE ALMACÉN
        const { error: errorDelete } = await this.supabase
            .from('almacen_piezas')
            .delete()
            .eq('id', piezaId);
        
        if (errorDelete) {
            console.error('❌ Error eliminando pieza:', errorDelete);
        }
        
        // 8. NOTIFICACIÓN AL USUARIO
        this.showNotification('😞 Hemos perdido piezas por falta de mantenimiento jefe!', 'error');
        
        // 9. ACTUALIZAR LA VISTA DE PIEZAS MONTADAS
        // 9. ACTUALIZAR SOLO EL BOTÓN DE LA PIEZA DESTRUIDA
        const botones = document.querySelectorAll('[onclick*="procesarPiezaDestruida"]');
        for (const btn of botones) {
            if (btn.getAttribute('onclick').includes(piezaId)) {
                // Encontrar el área
                const areaNombre = btn.querySelector('div div:first-child')?.textContent.trim() || areaId;
                
                // Crear botón vacío
                const nuevoBoton = document.createElement('div');
                nuevoBoton.className = 'boton-area-vacia';
                nuevoBoton.setAttribute('onclick', 'irAlAlmacenDesdePiezas()');
                nuevoBoton.setAttribute('title', `${areaNombre}: Sin pieza - Click para ir al Almacén`);
                nuevoBoton.innerHTML = `
                    <div style="font-size: 0.7rem; line-height: 1.1; text-align: center; width: 100%; color: #888;">
                        ${areaNombre}<br>
                        <small style="font-size: 0.6rem;">Vacío</small>
                    </div>
                `;
                
                // Reemplazar
                btn.closest('.boton-area-vacia, .boton-area-montada').replaceWith(nuevoBoton);
                break;
            }
        }
        

        
        // NO llamar a cargarPiezasMontadas()
        console.log('✅ Proceso completado');
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
    // REEMPLAZAR BOTÓN DE PIEZA DESTRUIDA
    // ========================
    reemplazarBotonPiezaDestruida(piezaId, areaNombre) {
        console.log(`🔄 Reemplazando botón de pieza destruida: ${piezaId}`);
        
        // Buscar el botón que contiene esta pieza (por el onclick de restaurar)
        const botones = document.querySelectorAll(`[onclick*="restaurarPiezaEquipada('${piezaId}')"]`);
        
        botones.forEach(btn => {
            if (btn && btn.closest('.boton-area-montada')) {
                const contenedor = btn.closest('.boton-area-montada');
                
                // Obtener nombre del área para mostrar
                let nombreArea = areaNombre;
                const mapaNombres = {
                    'suelo': 'Suelo',
                    'motor': 'Motor',
                    'aleron_delantero': 'Alerón Del.',
                    'caja_cambios': 'Caja Cambios',
                    'pontones': 'Pontones',
                    'suspension': 'Suspensión',
                    'aleron_trasero': 'Alerón Tras.',
                    'chasis': 'Chasis',
                    'frenos': 'Frenos',
                    'volante': 'Volante',
                    'electronica': 'Electrónica'
                };
                
                if (mapaNombres[areaNombre]) {
                    nombreArea = mapaNombres[areaNombre];
                }
                
                // Crear el nuevo botón vacío
                const nuevoBoton = document.createElement('div');
                nuevoBoton.className = 'boton-area-vacia';
                nuevoBoton.setAttribute('onclick', 'irAlAlmacenDesdePiezas()');
                nuevoBoton.setAttribute('title', `${nombreArea}: Sin pieza - Click para ir al Almacén`);
                nuevoBoton.innerHTML = `
                    <div style="font-size: 0.7rem; line-height: 1.1; text-align: center; width: 100%; color: #888;">
                        ${nombreArea}<br>
                        <small style="font-size: 0.6rem;">Vacío</small>
                    </div>
                `;
                
                // Reemplazar el botón antiguo
                if (contenedor && contenedor.parentNode) {
                    contenedor.parentNode.replaceChild(nuevoBoton, contenedor);
                    console.log('✅ Botón reemplazado correctamente');
                }
            }
        });
        
        // Si no se encontró por el onclick, intentar buscar por el ID en el HTML
        if (botones.length === 0) {
            console.log('⚠️ No se encontró botón por onclick, buscando en el grid...');
            const grid = document.getElementById('grid-piezas-montadas');
            if (grid) {
                const todosLosBotones = grid.querySelectorAll('.boton-area-montada');
                todosLosBotones.forEach(btn => {
                    if (btn.innerHTML.includes(piezaId) || btn.innerHTML.includes(areaNombre)) {
                        // Este podría ser el botón, pero es menos preciso
                        console.log('🔍 Posible botón encontrado por contenido');
                    }
                });
            }
        }
    }
    // ========================
    // MÉTODO PARA RESTAR PUNTOS DEL COCHE (NECESARIO PARA DESTRUCCIÓN)
    // ========================
    async restarPuntosDelCoche(areaNombre, puntos) {
        try {
            // 1. CONVERTIR nombre del área al ID correcto
            let areaId = null;
            const areaConfig = window.CAR_AREAS?.find(a => 
                a.name === areaNombre || a.id === areaNombre
            );
            
            if (areaConfig) {
                areaId = areaConfig.id;
            } else {
                const mapeoManual = {
                    'caja de cambios': 'caja_cambios',
                    'alerón delantero': 'aleron_delantero',
                    'alerón trasero': 'aleron_trasero',
                    'suelo y difusor': 'suelo'
                };
                areaId = mapeoManual[areaNombre?.toLowerCase()] || areaNombre?.toLowerCase().replace(/ /g, '_');
            }
            
            if (!areaId) {
                console.warn('⚠️ No se pudo determinar areaId para:', areaNombre);
                return;
            }
            
            console.log(`📊 Restando ${puntos} pts del área ${areaId} (original: ${areaNombre})`);
            
            // 2. Obtener stats actuales del coche
            const { data: stats, error: fetchError } = await this.supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .single();
            
            if (fetchError || !stats) {
                console.log('⚠️ No hay stats del coche para restar puntos');
                return;
            }
            
            // 3. Calcular nuevo progreso
            const columnaProgreso = `${areaId}_progreso`;
            const columnaNivel = `${areaId}_nivel`;
            
            const progresoActual = stats[columnaProgreso] || 0;
            const nivelActual = stats[columnaNivel] || 0;
            
            let nuevoProgreso = Math.max(0, progresoActual - 1);
            let nuevoNivel = nivelActual;
            
            // Si estaba en progreso 0 y nivel > 0, bajar de nivel
            if (progresoActual === 0 && nivelActual > 0) {
                nuevoNivel = nivelActual - 1;
                nuevoProgreso = 19;
                if (nuevoNivel < 0) nuevoNivel = 0;
            }
            
            // 4. Actualizar en BD
            const { error: updateError } = await this.supabase
                .from('coches_stats')
                .update({
                    [columnaProgreso]: nuevoProgreso,
                    [columnaNivel]: nuevoNivel,
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', stats.id);
            
            if (updateError) throw updateError;
            
            console.log(`✅ Progreso actualizado: ${areaId} - Progreso: ${nuevoProgreso}/20, Nivel: ${nuevoNivel}`);
            
        } catch (error) {
            console.error('❌ Error restando puntos del coche:', error);
        }
    }

    // MÉTODO SIMPLIFICADO: Calcular desgaste desde fabricación
    // ========================
    // ========================
    // MÉTODO SIMPLIFICADO: Calcular desgaste desde fabricación
    // ========================
    async calcularDesgastePieza(piezaId) {
        try {
            // 🟢 NUEVO: Verificar si ya fue destruida en esta sesión
            if (this.piezasDestruidas?.has(piezaId)) {
                console.log(`⏭️ Pieza ${piezaId} ya fue destruida, omitiendo...`);
                return 0;
            }
            
            const { data: pieza, error } = await this.supabase
                .from('almacen_piezas')
                .select('id, equipada, montada_en, desgaste_actual, area, puntos_base')
                .eq('id', piezaId)
                .single();
            
            if (error || !pieza) return 0;
            
            // Si NO está equipada → NO tiene desgaste activo
            if (!pieza.equipada || !pieza.montada_en) {
                return pieza.desgaste_actual || 100;
            }
            
            // Calcular minutos desde que se MONTÓ
            const fechaMontaje = new Date(pieza.montada_en);
            const ahora = new Date();
            const minutosMontada = (ahora - fechaMontaje) / (1000 * 60);
            
            // Si lleva menos de 1 minuto montada, mostrar 100%
            if (minutosMontada < 1) return 100;
            
            // Calcular desgaste (24h = 1440 minutos)
            let desgasteActual = 100 - ((minutosMontada / 1440) * 100);
            desgasteActual = Math.max(0, Math.min(100, desgasteActual));
            
            console.log(`⏱️ Pieza ${piezaId}: montada hace ${minutosMontada.toFixed(0)}min → ${desgasteActual.toFixed(1)}%`);
            
            // 🟢🟢🟢 DESTRUCCIÓN: Si llegó a 0% Y está equipada 🟢🟢🟢
            if (desgasteActual <= 0 && pieza.equipada) {
                console.log(`💥 DESTRUCCIÓN: Pieza ${piezaId} (${pieza.componente}) completó 24h montada`);
                
                // 1. OBTENER PUNTOS ACTUALES DE LA BD
                const { data: escuderiaBD } = await this.supabase
                    .from('escuderias')
                    .select('puntos')
                    .eq('id', this.escuderia.id)
                    .single();
                
                const puntosActuales = escuderiaBD?.puntos || 0;
                const puntosARestar = pieza.puntos_base || 10;
                
                // 🟢🟢🟢 CREAR NOTIFICACIÓN EN LA BD 🟢🟢🟢
                if (window.notificacionesManager) {
                    await window.notificacionesManager.crearNotificacion(
                        this.user.id,                          // usuario_id
                        'desgaste',                             // tipo
                        '💥 PIEZA DESTRUIDA',                   // titulo
                        `La pieza que tenías equipada se ha destruido por falta de mantenimiento. Jefe debes visitar mas amenudo las instalaciones....`, // mensaje
                        piezaId                                  // tipo_relacion (guardamos el ID de la pieza)
                    );
                }
                
                // Validar que no se resten más puntos de los que hay
                if (puntosARestar > puntosActuales) {
                    console.warn(`⚠️ Intentando restar ${puntosARestar} pero solo hay ${puntosActuales}`);
                }
                
                const nuevosPuntos = Math.max(0, puntosActuales - puntosARestar);
                
                // 2. RESTAR PUNTOS DE LA ESCUDERÍA
                await this.supabase
                    .from('escuderias')
                    .update({ puntos: nuevosPuntos })
                    .eq('id', this.escuderia.id);
                
                // Actualizar en memoria
                this.escuderia.puntos = nuevosPuntos;
                
                // Actualizar UI
                const puntosElement = document.getElementById('points-value');
                if (puntosElement) {
                    puntosElement.textContent = nuevosPuntos;
                }
                
                console.log(`📉 Puntos restados por destrucción: -${puntosARestar}, ahora: ${nuevosPuntos}`);
                
                // 3. RESTAR PUNTOS DEL PROGRESO DEL COCHE
                await this.restarPuntosDelCoche(pieza.area, puntosARestar);
                
                // 4. ELIMINAR LA PIEZA
                await this.supabase
                    .from('almacen_piezas')
                    .delete()
                    .eq('id', piezaId);
                
                // 🟢 NUEVO: Marcar como destruida para evitar procesarla de nuevo
                if (!this.piezasDestruidas) this.piezasDestruidas = new Set();
                this.piezasDestruidas.add(piezaId);
                
                // 5. ACTUALIZAR EL BOTÓN EN LA UI
                this.reemplazarBotonPiezaDestruida(piezaId, pieza.area);
                
                return 0;
            }
            
            // Actualizar desgaste en BD si cambió
            if (Math.abs((pieza.desgaste_actual || 100) - desgasteActual) > 1) {
                await this.supabase
                    .from('almacen_piezas')
                    .update({ 
                        desgaste_actual: desgasteActual,
                        ultima_actualizacion_desgaste: ahora.toISOString()
                    })
                    .eq('id', piezaId);
            }
            
            return desgasteActual;
            
        } catch (error) {
            console.error('Error calculando desgaste:', error);
            return 100;
        }
    }
    
    getColorDesgaste(porcentaje) {
        if (porcentaje > 70) return '#4CAF50';        // Verde
        if (porcentaje > 40) return '#FF9800';        // Naranja
        if (porcentaje > 0) return '#e10600';         // Rojo (F1)
        return '#666';                                 // Gris (completamente desgastado)
    }
    // ========================
    // CALCULAR TIEMPO RESTANTE EN HORAS:MINUTOS
    // ========================
    calcularTiempoRestante(porcentajeDesgaste) {
        // Si ya está destruida
        if (porcentajeDesgaste <= 0) return "0:00";
        
        // Calcular minutos restantes basado en porcentaje
        // 100% = 1440 minutos, 50% = 720 minutos, etc.
        const minutosTotales = 1440;
        const minutosRestantes = (porcentajeDesgaste / 100) * minutosTotales;
        
        const horas = Math.floor(minutosRestantes / 60);
        const minutos = Math.floor(minutosRestantes % 60);
        
        return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
    }
    
    // ========================
    // INICIALIZAR PRESUPUESTO MANAGER (GARANTIZADO) - VERSIÓN CORREGIDA
    // ========================
    async inicializarPresupuestoManager() {
        try {
            // 1. Verificar que tenemos datos necesarios
            if (!this.escuderia || !this.escuderia.id) {
                console.error('❌ No se puede inicializar presupuesto: Escudería sin ID');
                return;
            }
            
            // 2. Verificar que la clase existe
            if (!window.PresupuestoManager) {
                console.error('❌ PresupuestoManager no está cargado');
                return;
            }
            
            // 3. Crear instancia si no existe
            if (!window.presupuestoManager) {
                console.log('💰 Creando presupuestoManager para escudería:', this.escuderia.id);
                window.presupuestoManager = new window.PresupuestoManager();
            }
            
            // 4. Inicializar si no está inicializado
            if (!window.presupuestoManager.escuderiaId) {
                console.log('🔄 Inicializando presupuestoManager...');
                
                // DEBUG: Verificar qué estamos pasando
                console.log('🔍 DEBUG - this.escuderiaId:', this.escuderiaId, typeof this.escuderiaId);
                console.log('🔍 DEBUG - this.escuderia.id:', this.escuderia.id, typeof this.escuderia.id);
                
                // SEGURIDAD: Usar this.escuderia.id directamente para garantizar que sea string
                const idParaPasar = this.escuderia.id; // ¡ESTO ES UN STRING!
                
                if (!idParaPasar || typeof idParaPasar !== 'string') {
                    console.error('❌ ERROR CRÍTICO: ID no es string:', idParaPasar);
                    return;
                }
                
                console.log('📤 Pasando ID a presupuestoManager:', idParaPasar);
                
                // PASAR SOLO EL ID STRING
                await window.presupuestoManager.inicializar(idParaPasar);
                
                console.log('✅ presupuestoManager inicializado correctamente');
            } else {
                console.log('✅ presupuestoManager ya estaba inicializado');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando presupuestoManager:', error);
            // NO lanzar error, solo loguear
        }
    }
    
    // ========================
    // MÉTODO PARA CARGAR Y MOSTRAR ÚLTIMO TIEMPO
    // ========================
    async cargarUltimoTiempoUI() {
        const container = document.getElementById('ultimo-tiempo-container');
        if (!container) {
            console.error('❌ No se encontró #ultimo-tiempo-container');
            return;
        }
        
        // Timeout de seguridad (3 segundos máximo)
        let timeoutId;
        const setupTimeout = () => {
            timeoutId = setTimeout(() => {
                console.warn('⚠️ Timeout en cargarUltimoTiempoUI - mostrando estado por defecto');
                container.innerHTML = `
                    <div class="tiempo-sin-datos">
                        <div class="tiempo-sin-datos-icon"><i class="fas fa-clock"></i></div>
                        <div class="tiempo-sin-datos-text">
                            Tiempo de carga excedido
                        </div>
                        <button class="tiempo-f1-boton" onclick="if(window.f1Manager) window.f1Manager.cargarUltimoTiempoUI()">
                            <i class="fas fa-redo"></i>
                            REINTENTAR
                        </button>
                    </div>
                `;
            }, 3000); // 3 segundos
        };
        
        // Limpiar timeout
        const clearTimeoutSafe = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
        
        // Estado inicial: cargando (pero breve)
        container.innerHTML = `
            <div class="tiempo-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Cargando tiempo...</span>
            </div>
        `;
        
        // Iniciar timeout
        setupTimeout();
        
        try {
            const ultimoTiempo = await this.obtenerUltimoTiempoPrueba();
            clearTimeoutSafe(); // Éxito, limpiar timeout
            
            if (ultimoTiempo && ultimoTiempo.tiempo_formateado) {
                // Formatear fecha si existe
                let fechaTexto = '';
                if (ultimoTiempo.fecha) {
                    try {
                        const fecha = new Date(ultimoTiempo.fecha);
                        fechaTexto = fecha.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } catch (dateError) {
                        console.warn('Error formateando fecha:', dateError);
                        fechaTexto = 'Fecha reciente';
                    }
                }
                
                container.innerHTML = `
                    <div class="tiempo-f1-content">
                        <div class="tiempo-f1-info">
                            <div class="tiempo-f1-label">
                                MEJOR TIEMPO POR VUELTA
                            </div>
                            <div class="tiempo-f1-valor">${ultimoTiempo.tiempo_formateado}</div>
                            
                            <div class="tiempo-f1-detalles">
                                <span><i class="fas fa-calendar-alt"></i> ${fechaTexto || 'Sin fecha'}</span>
                            </div>
                        </div>
                        
                        <button class="tiempo-f1-boton" onclick="window.irAPruebaPista()" 
                                title="Intenta batir tu récord en una nueva prueba">
                            <i class="fas fa-stopwatch"></i>
                            TEST
                        </button>
                    </div>
                `;
            } else {
                // No hay tiempos registrados
                container.innerHTML = `
                    <div class="tiempo-sin-datos">
                        <div class="tiempo-sin-datos-icon"><i class="fas fa-tachometer-alt"></i></div>
                        <div class="tiempo-sin-datos-text">
                            SIN TIEMPO REGISTRADO<br>
                            <small>Realiza tu primera vuelta cronometrada</small>
                        </div>
                        <button class="tiempo-f1-boton" onclick="window.irAPruebaPista()">
                            <i class="fas fa-play-circle"></i>
                            INICIAR PRUEBA
                        </button>
                    </div>
                `;
            }
            
        } catch (error) {
            clearTimeoutSafe(); // Error, limpiar timeout
            console.error('❌ Error cargando último tiempo:', error);
            
            container.innerHTML = `
                <div class="tiempo-sin-datos">
                    <div class="tiempo-sin-datos-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="tiempo-sin-datos-text">
                        Error cargando tiempos
                    </div>
                    <button class="tiempo-f1-boton" onclick="if(window.f1Manager) window.f1Manager.cargarUltimoTiempoUI()">
                        <i class="fas fa-redo"></i>
                        REINTENTAR
                    </button>
                </div>
            `;
        }
    }

    
    // ========================
    // ========================
    // MÉTODO SIMPLIFICADO PARA OBTENER ÚLTIMO TIEMPO
    // ========================
    async obtenerUltimoTiempoPrueba() {
        try {
            if (!this.escuderia || !this.escuderia.id) {
                console.log('❌ No hay escudería');
                return null;
            }
            
            console.log('🔍 Buscando último tiempo formateado...');
            
            // SOLO pedir tiempo_formateado, nada más
            const { data: ultimaPrueba, error } = await this.supabase
                .from('pruebas_pista')
                .select('tiempo_formateado, fecha_prueba')  // Solo estas columnas
                .eq('escuderia_id', this.escuderia.id)
                .order('fecha_prueba', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error('❌ Error obteniendo último tiempo:', error);
                return null;
            }
            
            console.log('📊 Resultado de consulta:', ultimaPrueba);
            
            if (!ultimaPrueba) {
                console.log('ℹ️ No hay tiempos registrados');
                return null;
            }
            
            if (!ultimaPrueba.tiempo_formateado) {
                console.log('⚠️ Hay registro pero tiempo_formateado está vacío:', ultimaPrueba);
                return null;
            }
            
            return {
                tiempo_formateado: ultimaPrueba.tiempo_formateado,
                fecha: ultimaPrueba.fecha_prueba
            };
            
        } catch (error) {
            console.error('❌ Error en obtenerUltimoTiempoPrueba:', error);
            return null;
        }
    }

    
    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER (VERSIÓN CORREGIDA - BLOQUEO TOTAL POR ÁREA)
    // ========================
    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER (CON TIEMPO DE FABRICACIÓN)
    // ========================
    async cargarTabTaller() {
        console.log('🔧 Cargando pestaña taller con filtros...');
        
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
                .select('area, nivel, calidad, numero_global, componente')
                .eq('escuderia_id', this.escuderia.id)
                .order('numero_global', { ascending: true });
        
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
            
            // 🟢🟢🟢 CAMBIO CRÍTICO: Crear SET de áreas con fabricación activa 🟢🟢🟢
            const areasConFabricacionActiva = new Set();
            if (fabricacionesActivas && fabricacionesActivas.length > 0) {
                fabricacionesActivas.forEach(f => {
                    const areaId = f.area;
                    areasConFabricacionActiva.add(areaId);
                    console.log(`🚫 Área bloqueada por fabricación activa: ${areaId}`);
                });
            }
            
            // Contar fabricaciones por área (para log)
            const fabricacionesPorArea = {};
            fabricacionesActivas?.forEach(f => {
                fabricacionesPorArea[f.area] = (fabricacionesPorArea[f.area] || 0) + 1;
            });
            console.log('🚫 Áreas con fabricación activa:', Object.keys(fabricacionesPorArea).join(', ') || 'ninguna');
            
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
            
            let html = '';
        
            // ====== 1. FILTROS POR ÁREA (11 BOTONES COMPACTOS) ======
            html += '<div class="filtros-areas-taller">';
            html += '<div class="filtros-header">';
            html += '<span class="filtros-titulo"><i class="fas fa-filter"></i> ÁREAS:</span>';
            html += '</div>';
            
            html += '<div class="filtros-botones-grid">';
            areas.forEach(area => {
                html += `<button class="filtro-area-btn-mini" data-area="${area.id}" onclick="filtrarAreaTaller('${area.id}')">`;
                html += `<span class="filtro-nombre-mini">${area.nombre}</span>`;
                html += '</button>';
            });
            html += '</div>';
            html += '</div>';
            
            // ====== 2. CONTENEDOR PARA LAS ÁREAS ======
            html += '<div class="contenedor-areas-taller" id="contenedor-areas-taller">';
            
            // ÁREAS
            for (const area of areas) {
                // 🟢🟢🟢 VERIFICACIÓN SIMPLE: ¿Esta área TIENE ALGUNA fabricación activa? 🟢🟢🟢
                const tieneFabricacionActiva = areasConFabricacionActiva.has(area.id);
                
                if (tieneFabricacionActiva) {
                    console.log(`🔴 ÁREA BLOQUEADA COMPLETAMENTE: ${area.id} - tiene fabricación activa`);
                }
                
                html += '<div class="area-completa" id="area-' + area.id + '">';
                html += '<div class="area-header-completa">';
                html += '<span class="area-icono-completa">' + area.icono + '</span>';
                html += '<span class="area-nombre-completa">' + area.nombre + '</span>';
                
                const piezasAreaFabricadas = piezasFabricadas?.filter(p => 
                    p.area === area.id || p.area === area.nombre
                ) || [];
                const progreso = piezasAreaFabricadas.length;
                
                html += '<span class="area-progreso-badge">' + progreso + '/50</span>';
                
                // 🟢🟢🟢 MOSTRAR INDICADOR DE BLOQUEO si está fabricando 🟢🟢🟢
                if (tieneFabricacionActiva) {
                    html += '<span class="area-bloqueada-badge" style="margin-left: 8px; background: #FF9800; color: black; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; animation: pulse 1.5s infinite;">⏳ FABRICANDO</span>';
                }
                
                html += '</div>';
                
                html += '<div class="botones-area-completa">';
                
                const piezasAreaFabricadasAll = piezasFabricadas?.filter(p => 
                    p.area === area.id || p.area === area.nombre
                ) || [];
                
                for (let piezaNum = 1; piezaNum <= 50; piezaNum++) {
                    // ===== VALORES FIJOS PARA ESTE BOTÓN =====
                    const nivel = Math.ceil(piezaNum / 5);
                    const numeroPiezaEnNivel = ((piezaNum - 1) % 5) + 1;
                    const costoPieza = this.calcularCostoPieza(nivel, numeroPiezaEnNivel);
                    const nombrePieza = this.nombresPiezas[area.id]?.[piezaNum - 1] || `${area.nombre} Mejora ${piezaNum}`;
                    
                    // ===== CALCULAR TIEMPO DE FABRICACIÓN =====
                    const tiempoMinutos = this.calcularTiempoProgresivo(piezaNum);
                    let tiempoFormateado = '';
                    
                    if (tiempoMinutos < 60) {
                        tiempoFormateado = `${tiempoMinutos}m`;
                    } else if (tiempoMinutos < 1440) {
                        const horas = Math.floor(tiempoMinutos / 60);
                        const minutos = tiempoMinutos % 60;
                        tiempoFormateado = minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
                    } else {
                        const dias = Math.floor(tiempoMinutos / 1440);
                        const horas = Math.floor((tiempoMinutos % 1440) / 60);
                        tiempoFormateado = horas > 0 ? `${dias}d ${horas}h` : `${dias}d`;
                    }
                    
                    // ===== VERIFICACIÓN: ¿YA TENGO ESTE NOMBRE EN ALMACÉN? =====
                    const yaFabricada = piezasAreaFabricadasAll.some(p => p.componente === nombrePieza);
                    const esCompradaMercado = yaFabricada ? piezasAreaFabricadasAll.find(p => p.componente === nombrePieza)?.origen === 'mercado' || false : false;
                    
                    if (yaFabricada) {
                        const claseCSS = esCompradaMercado ? 'btn-pieza-50 comprada-mercado' : 'btn-pieza-50 lleno';
                        const icono = esCompradaMercado ? 'fa-shopping-cart' : 'fa-check';
                        
                        html += `<button class="${claseCSS}" disabled title="${nombrePieza}">`;
                        html += `<i class="fas ${icono}"></i>`;
                        html += `<div class="pieza-nombre-50">${nombrePieza}</div>`;
                        html += `<div class="pieza-precio-50">€${costoPieza.toLocaleString()} (${tiempoFormateado})</div>`;
                        html += '</button>';
                        
                    } else {
                        // 🟢🟢🟢 REGLA SIMPLE: Si el área TIENE fabricación activa, TODAS las piezas se bloquean 🟢🟢🟢
                        const puedeFabricar = !yaFabricada && !tieneFabricacionActiva;
                        
                        let estadoBoton = 'vacio';
                        let iconoBoton = 'fa-plus';
                        let tituloExtra = '';
                        let disabledAttr = '';
                        let textoOcupado = '';
                        
                        if (tieneFabricacionActiva) {
                            estadoBoton = 'fabricando';
                            iconoBoton = 'fa-ban';
                            tituloExtra = 'Área ocupada - Fabricación en curso';
                            disabledAttr = ' disabled';
                            textoOcupado = '<div style="font-size: 0.5rem; color: #FF9800; margin-bottom: 2px; font-weight: bold;">⛔ OCUPADO</div>';
                        }
                        
                        html += `<button class="btn-pieza-50 ${estadoBoton}" ${disabledAttr} `;
                        
                        if (puedeFabricar) {
                            html += `onclick="iniciarFabricacionConBloqueo('${area.id}', ${nivel}, '${nombrePieza.replace(/'/g, "\\'")}', ${piezaNum})" `;
                        }
                        
                        html += `title="${nombrePieza} - Costo: €${costoPieza.toLocaleString()} - Tiempo: ${tiempoFormateado} ${tituloExtra ? ' - ' + tituloExtra : ''}">`;
                        
                        if (tieneFabricacionActiva) {
                            html += `<i class="fas ${iconoBoton}"></i>`;
                            html += textoOcupado;
                        } else {
                            html += `<i class="fas ${iconoBoton}"></i>`;
                        }
                        
                        html += `<div class="pieza-nombre-50">${nombrePieza}</div>`;
                        html += `<div class="pieza-precio-50">€${costoPieza.toLocaleString()} (${tiempoFormateado})</div>`;
                        html += '</button>';
                    }
                }
                
                html += '</div>'; // Cierra botones-area-completa
                html += '</div>'; // Cierra area-completa
            }
            
            html += '</div>'; // Cierra contenedor-areas-taller
            
            container.innerHTML = html;
            
            // Añadir estilos de filtro y animación pulse
            if (!document.querySelector('#estilos-filtros-taller')) {
                const style = document.createElement('style');
                style.id = 'estilos-filtros-taller';
                style.innerHTML = `
                    /* === FILTROS DE ÁREA (4 columnas) === */
                    .filtros-areas-taller {
                        background: rgba(10, 15, 30, 0.95);
                        border-bottom: 2px solid rgba(0, 210, 190, 0.2);
                        padding: 5px 8px;
                        margin-bottom: 6px;
                        border-radius: 6px;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }
                    
                    .filtros-header {
                        margin-bottom: 6px;
                    }
                    
                    .filtros-titulo {
                        color: #00d2be;
                        font-weight: bold;
                        font-size: 0.75rem;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    
                    .filtros-botones-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: repeat(3, auto);
                        gap: 3px;
                    }
                    
                    .filtros-botones-grid button:nth-child(9) {
                        grid-column: 1;
                    }
                    .filtros-botones-grid button:nth-child(10) {
                        grid-column: 2;
                    }
                    .filtros-botones-grid button:nth-child(11) {
                        grid-column: 3;
                    }
                    
                    @media (max-width: 768px) {
                        .filtros-botones-grid {
                            grid-template-columns: repeat(3, 1fr);
                            grid-template-rows: repeat(4, auto);
                        }
                        .filtros-botones-grid button:nth-child(10) {
                            grid-column: 1;
                        }
                        .filtros-botones-grid button:nth-child(11) {
                            grid-column: 2;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .filtros-botones-grid {
                            grid-template-columns: repeat(2, 1fr);
                            grid-template-rows: repeat(6, auto);
                        }
                    }
                    
                    .filtro-area-btn-mini {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 210, 190, 0.08);
                        border: 1px solid rgba(0, 210, 190, 0.15);
                        border-radius: 4px;
                        color: #00d2be;
                        padding: 4px 2px;
                        font-size: 0.6rem;
                        cursor: pointer;
                        height: 32px;
                        transition: all 0.2s ease;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                    
                    .filtro-area-btn-mini:hover {
                        background: rgba(0, 210, 190, 0.15);
                    }
                    
                    .filtro-area-btn-mini.active {
                        background: rgba(0, 210, 190, 0.25);
                        color: white;
                        border-color: #00d2be;
                        font-weight: bold;
                    }
                    
                    .filtro-nombre-mini {
                        font-size: 0.75rem;
                        line-height: 1.2;
                        text-align: center;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 100%;
                        padding: 0 2px;
                        text-transform: uppercase;
                        font-weight: bold;
                    }
                    
                    .contenedor-areas-taller {
                        max-height: calc(100vh - 200px);
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        padding-bottom: 10px;
                    }
                    
                    .area-completa {
                        display: none;
                    }
                    
                    .sin-filtro .area-completa {
                        display: block;
                    }
                    
                    .area-completa.visible {
                        display: block;
                    }
                    
                    /* 🟢🟢🟢 ANIMACIÓN PULSE PARA BADGE DE FABRICANDO 🟢🟢🟢 */
                    @keyframes pulse {
                        0% { opacity: 0.8; }
                        50% { opacity: 1; box-shadow: 0 0 5px #FF9800; }
                        100% { opacity: 0.8; }
                    }
                    
                    .btn-pieza-50.fabricando i.fa-ban {
                        color: #FF9800;
                        font-size: 1.2rem;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Asegurar que los estilos existentes del taller se carguen
            if (!document.querySelector('#estilos-taller-simple')) {
                const styleExistente = document.createElement('style');
                styleExistente.id = 'estilos-taller-simple';
                styleExistente.innerHTML = `
                    #tab-taller {
                        padding: 10px;
                        overflow-y: auto;
                        height: calc(100vh - 120px);
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    .area-completa {
                        margin-bottom: 20px;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        border: 1px solid rgba(0, 210, 190, 0.2);
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
                        .botones-area-completa { grid-template-columns: repeat(4, 1fr); }
                    }
                    @media (max-width: 900px) {
                        .botones-area-completa { grid-template-columns: repeat(3, 1fr); }
                    }
                    @media (max-width: 600px) {
                        .botones-area-completa { grid-template-columns: repeat(2, 1fr); }
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
                        padding: 8px;
                        text-align: center;
                        position: relative;
                        font-size: 0.9rem;
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
                        margin-bottom: 3px;
                    }
                    
                    .pieza-precio-50 {
                        font-size: 0.65rem;
                        color: #FFD700;
                        font-weight: bold;
                        background: rgba(255, 215, 0, 0.1);
                        padding: 2px 5px;
                        border-radius: 3px;
                        text-align: center;
                        width: 100%;
                    }
                    
                    .btn-pieza-50.comprada-mercado {
                        border-color: #FF9800;
                        background: rgba(255, 152, 0, 0.1);
                        color: #FF9800;
                    }
                `;
                document.head.appendChild(styleExistente);
            }
            
            // Mostrar todas las áreas por defecto
            setTimeout(() => {
                mostrarTodasAreasTaller();
            }, 100);
            
        } catch (error) {
            console.error('❌ Error cargando taller:', error);
            container.innerHTML = '<div class="error"><p>Error cargando el taller</p></div>';
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
    // MÉTODO CORREGIDO PARA INICIAR FABRICACIÓN CON BLOQUEO TOTAL POR ÁREA
    // ========================
    async iniciarFabricacionTaller(areaId, nivel, nombrePieza, numeroPieza) {
        console.log('🔧 Iniciando fabricación de:', { areaId, nivel, nombrePieza, numeroPieza });
        
        // ===== VERIFICACIÓN 0: ¿YA HAY UNA FABRICACIÓN EN ESTA ÁREA? =====
        const { data: fabricacionesActivasEnArea, error: errorVerificacion } = await this.supabase
            .from('fabricacion_actual')
            .select('id')
            .eq('escuderia_id', this.escuderia.id)
            .eq('area', areaId)
            .eq('completada', false);
        
        if (errorVerificacion) {
            console.error('❌ Error verificando fabricaciones activas:', errorVerificacion);
            this.showNotification('❌ Error verificando disponibilidad', 'error');
            return false;
        }
        
        if (fabricacionesActivasEnArea && fabricacionesActivasEnArea.length > 0) {
            console.log(`🚫 ÁREA BLOQUEADA: Ya hay una fabricación activa en ${areaId}`);
            this.showNotification(`❌ Ya hay una pieza en fabricación en esta área`, 'error');
            return false;
        }
        
        // ===== VERIFICACIÓN 1: Escudería válida =====
        if (!this.escuderia || !this.escuderia.id) {
            console.error('❌ No hay escudería');
            this.showNotification('❌ Error: No se encontró tu escudería', 'error');
            return false;
        }
        
        // ===== VERIFICACIÓN 2: Límite global de fabricaciones =====
        const { data: fabricacionesActivas, error: errorLimite } = await this.supabase
            .from('fabricacion_actual')
            .select('id')
            .eq('escuderia_id', this.escuderia.id)
            .eq('completada', false);
        
        if (errorLimite) {
            console.error('❌ Error verificando límite:', errorLimite);
            this.showNotification('❌ Error verificando fabricaciones', 'error');
            return false;
        }
        
        if (fabricacionesActivas && fabricacionesActivas.length >= 4) {
            this.showNotification('❌ Límite alcanzado (máximo 4 fabricaciones simultáneas)', 'error');
            return false;
        }
        
        // ===== VERIFICACIÓN 3: ¿YA TENGO ESTA PIEZA EN ALMACÉN? =====
        const { data: piezaExistente, error: errorConsulta } = await this.supabase
            .from('almacen_piezas')
            .select('id')
            .eq('escuderia_id', this.escuderia.id)
            .eq('area', areaId)
            .eq('componente', nombrePieza)
            .maybeSingle();
        
        if (errorConsulta) {
            console.error('❌ Error verificando pieza existente:', errorConsulta);
            this.showNotification('❌ Error verificando disponibilidad', 'error');
            return false;
        }
        
        if (piezaExistente) {
            console.log(`❌ Ya tienes "${nombrePieza}" en almacén`);
            this.showNotification(`❌ Ya tienes "${nombrePieza}" en tu almacén`, 'error');
            return false;
        }
        
        // ===== VERIFICACIÓN 4: Dinero suficiente =====
        const nivelPieza = Math.ceil(numeroPieza / 5);
        const numeroEnNivel = ((numeroPieza - 1) % 5) + 1;
        const costo = this.calcularCostoPieza(nivelPieza, numeroEnNivel);
        
        if (this.escuderia.dinero < costo) {
            this.showNotification(`❌ Dinero insuficiente. Necesitas €${costo.toLocaleString()}`, 'error');
            return false;
        }
        
        // ===== CREAR FABRICACIÓN =====
        const tiempoMinutos = this.calcularTiempoProgresivo(numeroPieza);
        const tiempoMilisegundos = tiempoMinutos * 60 * 1000;
        const ahora = new Date();
        const tiempoFin = new Date(ahora.getTime() + tiempoMilisegundos);
        
        console.log(`⏱️ Tiempo de fabricación: ${tiempoMinutos} minutos`);
        console.log(`💰 Costo: €${costo.toLocaleString()}`);
        
        const { data: fabricacion, error: errorCrear } = await this.supabase
            .from('fabricacion_actual')
            .insert([{
                escuderia_id: this.escuderia.id,
                area: areaId,
                nivel: nivelPieza,
                tiempo_inicio: ahora.toISOString(),
                tiempo_fin: tiempoFin.toISOString(),
                completada: false,
                costo: costo,
                nombre_pieza: nombrePieza,
                numero_pieza: numeroPieza,
                creada_en: ahora.toISOString()
            }])
            .select()
            .single();
        
        if (errorCrear) {
            console.error('❌ Error creando fabricación:', errorCrear);
            this.showNotification('❌ Error en fabricación', 'error');
            return false;
        }
        
        // ===== RESTAR DINERO =====
        this.escuderia.dinero -= costo;
        await this.updateEscuderiaMoney();
        
        // ===== REGISTRAR TRANSACCIÓN =====
        if (window.presupuestoManager && window.presupuestoManager.registrarTransaccion) {
            try {
                await window.presupuestoManager.registrarTransaccion(
                    'gasto',
                    costo,
                    `Fabricación ${nombrePieza}`,
                    'produccion',
                    { area: areaId, nivel: nivelPieza, nombre_pieza: nombrePieza }
                );
            } catch (error) {
                console.warn('⚠️ No se pudo registrar transacción:', error);
            }
        }
        
        // ===== VERIFICAR PRIMERA FABRICACIÓN DEL DÍA =====
        if (!this.escuderia.primera_fabricacion_hoy) {
            await this.darEstrellasFabricacion();
        }
        
        // ===== NOTIFICACIÓN ÉXITO =====
        this.showNotification(`🏭 Fabricación iniciada: ${nombrePieza}`, 'success');
        
        // 🟢🟢🟢 CRÍTICO: RECARGAR EL TALLER PARA BLOQUEAR EL ÁREA INMEDIATAMENTE 🟢🟢🟢
        setTimeout(() => {
            if (this.cargarTabTaller) {
                console.log(`🔄 Recargando taller para bloquear área ${areaId}...`);
                this.cargarTabTaller();
            }
        }, 500);
        
        // ===== ACTUALIZAR PRODUCCIÓN =====
        setTimeout(() => {
            this.updateProductionMonitor();
        }, 500);
        
        return true;
    }
    
    calcularTiempoProgresivo(numeroPiezaGlobal) {
        // Tabla de tiempos para 50 piezas en minutos - TODOS ENTRE 2min Y 12 HORAS (720min)
        // Sin progresión, cada pieza tiene su propio tiempo arbitrario y bien repartido
        const tiemposPorPiezaGlobal = {
            // Mezcla de tiempos muy cortos, cortos, medios, largos y máximos
            1: 2,      // 2 minutos
            2: 45,     // 45 minutos
            3: 15,     // 15 minutos
            4: 180,    // 3 horas
            5: 90,     // 1.5 horas
            6: 5,      // 5 minutos
            7: 360,    // 6 horas
            8: 30,     // 30 minutos
            9: 480,    // 8 horas
            10: 10,    // 10 minutos
            11: 600,   // 10 horas
            12: 75,    // 1 hora 15 minutos
            13: 20,    // 20 minutos
            14: 270,   // 4.5 horas
            15: 720,   // 12 horas (máximo)
            16: 8,     // 8 minutos
            17: 420,   // 7 horas
            18: 55,    // 55 minutos
            19: 540,   // 9 horas
            20: 12,    // 12 minutos
            21: 240,   // 4 horas
            22: 25,    // 25 minutos
            23: 390,   // 6.5 horas
            24: 40,    // 40 minutos
            25: 660,   // 11 horas
            26: 3,     // 3 minutos
            27: 300,   // 5 horas
            28: 85,    // 1 hora 25 minutos
            29: 510,   // 8.5 horas
            30: 18,    // 18 minutos
            31: 450,   // 7.5 horas
            32: 35,    // 35 minutos
            33: 200,   // 3 horas 20 minutos
            34: 120,   // 2 horas
            35: 570,   // 9.5 horas
            36: 7,     // 7 minutos
            37: 330,   // 5.5 horas
            38: 95,    // 1 hora 35 minutos
            39: 140,   // 2 horas 20 minutos
            40: 22,    // 22 minutos
            41: 630,   // 10.5 horas
            42: 50,    // 50 minutos
            43: 380,   // 6 horas 20 minutos
            44: 220,   // 3 horas 40 minutos
            45: 28,    // 28 minutos
            46: 690,   // 11.5 horas
            47: 70,    // 1 hora 10 minutos
            48: 400,   // 6 horas 40 minutos
            49: 100,   // 1 hora 40 minutos
            50: 80     // 1 hora 20 minutos
        };
        
        // Si es una pieza mayor a 50, tiempo pseudo-aleatorio entre 2 y 720 minutos
        if (numeroPiezaGlobal > 50) {
            // Usar un pseudo-aleatorio basado en el número para mantener consistencia
            const pseudoRandom = ((numeroPiezaGlobal * 997) % 719) + 2;
            return pseudoRandom;
        }
        
        return tiemposPorPiezaGlobal[numeroPiezaGlobal] || 120; // 2 horas por defecto
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
                .update({ 
                    equipada: true,
                    montada_en: new Date().toISOString()  // ← ¡AÑADIR ESTO!
                })
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

        // NUEVO: Inicializar sistema de estrategas
        if (window.EstrategiaManager) {
            console.log('🧠 Creando estrategiaManager...');
            this.estrategiaManager = new window.EstrategiaManager(this);
            await this.estrategiaManager.inicializar();
            console.log('✅ Sistema de estrategas inicializado');
            
            // Exponer al global para acceso desde botones
            window.estrategiaManager = this.estrategiaManager;
        }
        console.log('🧠 Inicializando sistema de estrategas...');
        
        if (window.EstrategiaManager) {
            // Crear instancia si no existe
            if (!window.estrategiaManager) {
                window.estrategiaManager = new window.EstrategiaManager(this);
                console.log('✅ EstrategiaManager creado');
            }
            
            // Inicializar
            try {
                await window.estrategiaManager.inicializar();
                console.log('✅ Sistema de estrategas inicializado');
                
                // Asignar a f1Manager para acceso fácil
                this.estrategiaManager = window.estrategiaManager;
                
            } catch (error) {
                console.error('❌ Error inicializando estrategas:', error);
            }
        } else {
            console.warn('⚠️ EstrategiaManager no disponible');
        }        
        // ============================================
        // NUEVO: INICIALIZAR PRESUPUESTO MANAGER (VERSIÓN CORREGIDA)
        // ============================================
        if (window.PresupuestoManager) {
            // 1. Obtener ID de forma segura
            let escuderiaIdParaUsar;
            
            if (this.escuderiaId && typeof this.escuderiaId === 'string') {
                escuderiaIdParaUsar = this.escuderiaId;
                console.log('🔑 Usando this.escuderiaId:', escuderiaIdParaUsar);
            } else if (this.escuderia && this.escuderia.id) {
                escuderiaIdParaUsar = String(this.escuderia.id).trim();
                console.log('⚠️ this.escuderiaId no válido, usando this.escuderia.id:', escuderiaIdParaUsar);
            } else {
                console.error('❌ ERROR: No se puede obtener escuderiaId para presupuesto');
                return;
            }
            
            // 2. Verificar que el ID es válido (UUID formato)
            if (!escuderiaIdParaUsar || escuderiaIdParaUsar.length < 10) {
                console.error('❌ ERROR: ID de escudería inválido:', escuderiaIdParaUsar);
                return;
            }
            
            // 3. Crear o reutilizar instancia
            if (!window.presupuestoManager) {
                console.log('💰 Creando presupuestoManager para escudería:', escuderiaIdParaUsar);
                window.presupuestoManager = new window.PresupuestoManager();
                
                try {
                    await window.presupuestoManager.inicializar(escuderiaIdParaUsar);
                    console.log('✅ presupuestoManager inicializado correctamente');
                } catch (error) {
                    console.error('❌ Error inicializando presupuestoManager:', error);
                    // No fallar todo si presupuesto falla
                }
            } else if (window.presupuestoManager && !window.presupuestoManager.escuderiaId) {
                // Si ya existe pero no está inicializado
                console.log('🔄 PresupuestoManager existe pero sin inicializar, inicializando...');
                try {
                    await window.presupuestoManager.inicializar(escuderiaIdParaUsar);
                    console.log('✅ presupuestoManager inicializado tardíamente');
                } catch (error) {
                    console.error('❌ Error inicializando presupuestoManager existente:', error);
                }
            } else if (window.presupuestoManager) {
                console.log('✅ presupuestoManager ya está inicializado');
            }
        } else {
            console.log('⚠️ PresupuestoManager no disponible en window');
        }
        // ============================================
        // FIN NUEVO CÓDIGO
        // ============================================

        
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
            }, 3000),
            // NUEVO: Actualizar último tiempo cada 30 segundos
            tiempoPrueba: setInterval(() => {
                if (this.cargarUltimoTiempoUI) {
                    this.cargarUltimoTiempoUI();
                }
            }, 30000),
            // === ACTUALIZAR DESGASTE CADA MINUTO EN TIEMPO REAL ===
            desgaste: setInterval(() => {
                // Solo actualizar si estamos en la pestaña principal
                const tabPrincipal = document.getElementById('tab-principal');
                if (tabPrincipal && tabPrincipal.classList.contains('active')) {
                    if (this.cargarPiezasMontadas) {
                        // Forzar recálculo de desgaste y actualización UI
                        this.cargarPiezasMontadas().catch(error => {
                            console.error('Error actualizando desgaste:', error);
                        });
                    }
                }
            }, 60000) // 1 MINUTO (no 5 minutos)
            
        };
        
        console.log('⏱️ Timers automáticos iniciados');
        // ========================
        // PAGO DE ESTRELLAS (MIÉRCOLES) - COLOCADO AQUÍ, FUERA DEL OBJETO
        // ========================
        
        // Verificar pago de estrellas (miércoles)
        this.verificarPagoEstrellas = async function() {
            try {
                const hoy = new Date();
                const esMiercoles = hoy.getDay() === 3; // 3 = miércoles
                
                if (!esMiercoles) return;
                
                // Crear tabla si no existe
                await this.supabase.rpc('crear_tabla_pagos_estrellas');
                
                // Comprobar si ya se pagó hoy
                const { data: config } = await this.supabase
                    .from('config_pagos_estrellas')
                    .select('ultimo_pago')
                    .eq('id', 1)
                    .single();
                
                const ultimoPago = config?.ultimo_pago;
                const hoyStr = hoy.toISOString().split('T')[0];
                
                if (ultimoPago === hoyStr) return;
                
                // Obtener estrellas
                const { data: perfil } = await this.supabase
                    .from('perfiles')
                    .select('estrellas_semana')
                    .eq('id', this.escuderia.id)
                    .single();
                
                const estrellas = perfil?.estrellas_semana || 0;
                
                if (estrellas > 0) {
                    const pago = estrellas * 10000;
                    
                    // Registrar transacción
                    await window.presupuestoManager.registrarTransaccion(
                        'ingreso',
                        pago,
                        'Pago semanal por estrellas de patrocinio',
                        'publicidad'
                    );
                    
                    // Poner estrellas a cero
                    await this.supabase
                        .from('perfiles')
                        .update({ estrellas_semana: 0 })
                        .eq('id', this.escuderia.id);
                    
                    // Actualizar UI
                    const estrellasElement = document.getElementById('estrellas-value');
                    if (estrellasElement) estrellasElement.textContent = '0';
                    
                    // Notificación
                    this.showNotification(`⭐ ${pago.toLocaleString()}€ por ${estrellas} estrellas`, 'success');
                }
                
                // Actualizar fecha
                await this.supabase
                    .from('config_pagos_estrellas')
                    .update({ ultimo_pago: hoyStr })
                    .eq('id', 1);
                    
            } catch (error) {
                console.error('❌ Error en pago de estrellas:', error);
            }
        };
        
        // Ejecutar verificación
        setTimeout(() => this.verificarPagoEstrellas(), 5000);
    }



    // ========================
    // MÉTODO CARGAR PIEZAS MONTADAS CON BLOQUEO ANTI-DOBLE EJECUCIÓN
    // ========================
    async cargarPiezasMontadas() {
        // 🚫 BLOQUEO: Si ya está cargando, salir inmediatamente
        if (this._cargandoPiezas) {
            console.log('⏭️ Ya hay una carga de piezas en progreso, ignorando esta llamada...');
            return;
        }
        
        // Marcar que estamos cargando
        this._cargandoPiezas = true;
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
                { id: 'suelo', nombre: 'Suelo' },
                { id: 'motor', nombre: 'Motor' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.' },
                { id: 'caja_cambios', nombre: 'Caja Cambios' },
                { id: 'pontones', nombre: 'Pontones' },
                { id: 'suspension', nombre: 'Suspensión' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.' },
                { id: 'chasis', nombre: 'Chasis' },
                { id: 'frenos', nombre: 'Frenos' },
                { id: 'volante', nombre: 'Volante' },
                { id: 'electronica', nombre: 'Electrónica' }
            ];
            
            let puntosTotales = 0;
            let html = '';
            
            // Usamos Promise.all para esperar todos los cálculos de desgaste
            const promesas = areas.map(async (area) => {
                const pieza = piezasPorArea[area.id];
                
                let areaHTML = '';
                
                if (pieza) {
                    puntosTotales += pieza.puntos_base || 0;
                    
                    // Obtener nombre personalizado de la pieza
                    let nombreMostrar = pieza.componente || 'Pieza ' + area.nombre;
                    if (pieza.numero_global && this.nombresPiezas && 
                        this.nombresPiezas[area.id] && 
                        pieza.numero_global <= this.nombresPiezas[area.id].length) {
                        nombreMostrar = this.nombresPiezas[area.id][pieza.numero_global - 1];
                    }
                    
                    // === Calcular desgaste ===
                    const desgaste = await this.calcularDesgastePieza(pieza.id);
                    const desgastePorcentaje = Math.max(0, Math.min(100, desgaste));
                    
                    // Si la pieza fue destruida (desgaste = 0)
                    if (desgastePorcentaje <= 0) {
                        // Mostrar hueco vacío (ya fue destruida automáticamente)
                        return `<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()" 
                                title="${area.nombre}: Pieza destruida - Click para ir al Almacén"
                                style="background: rgba(225, 6, 0, 0.1); border: 2px dashed #e10600; cursor: pointer;">
                                <div style="font-size: 0.7rem; line-height: 1.1; text-align: center; width: 100%; color: #e10600;">
                                    ${area.nombre}<br>
                                    <small style="font-size: 0.6rem; font-weight: bold;">DESTRUIDA</small>
                                </div>
                            </div>`;
                    }
                    
                    // Si la pieza existe, mostrar con opción de restaurar
                    const desgasteColor = this.getColorDesgaste(desgastePorcentaje);
                    const tiempoRestante = this.calcularTiempoRestante(desgastePorcentaje);
                    
                    areaHTML += `<div class="boton-area-montada" onclick="restaurarPiezaEquipada('${pieza.id}')" 
                                title="${area.nombre}: ${nombreMostrar}
                        Desgaste: ${desgastePorcentaje.toFixed(1)}%
                        Tiempo restante: ${tiempoRestante}
                        CLICK para restaurar al 100%">
                        
                        <div style="font-size: 0.7rem; line-height: 1.1; text-align: center; width: 100%; 
                            overflow: hidden; text-overflow: ellipsis; display: -webkit-box; 
                            -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${nombreMostrar}
                        </div>
                        
                        <!-- Barra de desgaste -->
                        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); 
                            border-radius: 2px; margin-top: 3px; overflow: hidden;">
                            <div style="width: ${desgastePorcentaje}%; height: 100%; 
                                background: ${desgasteColor}; border-radius: 2px; transition: width 0.3s ease;">
                            </div>
                        </div>
                        
                        <!-- PORCENTAJE DE DESGASTE -->
                        <div style="font-size: 0.45rem; color: ${desgasteColor}; 
                            text-align: center; margin-top: 1px; font-weight: bold; opacity: 0.8;">
                            ${desgastePorcentaje.toFixed(0)}%
                        </div>
                        
                        <!-- Texto según desgaste -->
                        ${desgastePorcentaje < 30 ? 
                            `<div style="font-size: 0.45rem; color: ${desgastePorcentaje < 10 ? '#e10600' : '#FF9800'}; 
                                margin-top: 1px; font-weight: bold;">
                                ${tiempoRestante} restantes
                            </div>` 
                            : ''}
                    </div>`;
                    
                } else {
                    // Para huecos vacíos (SIN PIEZA)
                    areaHTML += `<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()" 
                                title="${area.nombre}: Sin pieza - Click para ir al Almacén y equipar">
                            <div style="font-size: 0.7rem; line-height: 1.1; text-align: center; width: 100%; color: #888;">
                                ${area.nombre}<br>
                                <small style="font-size: 0.6rem;">Vacío</small>
                            </div>
                        </div>`;
                }
                
                return areaHTML;
            });
            
            // Esperar a que todas las promesas se resuelvan
            const resultados = await Promise.all(promesas);
            html = resultados.join('');
            
            contenedor.innerHTML = html;
            
            const puntosElement = document.getElementById('puntos-totales-montadas');
            if (puntosElement) {
                puntosElement.textContent = puntosTotales;
            }
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            this.mostrarBotonesVacios(contenedor);
        } finally {
            // 🟢 IMPORTANTE: Liberar el bloqueo después de 2 segundos
            // Esto permite que futuras llamadas (después de 2s) puedan ejecutarse
            setTimeout(() => {
                this._cargandoPiezas = false;
                console.log('🔓 Bloqueo de carga liberado');
            }, 2000);
        }
    }
    
    mostrarBotonesVacios(contenedor) {
        const areas = ['Suelo', 'Motor', 'Alerón Del.', 'Caja Cambios', 'Pontones', 
                       'Suspensión', 'Alerón Tras.', 'Chasis', 'Frenos', 'Volante', 'Electrónica'];
        
        let html = '';
        areas.forEach(area => {
            html += `<div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()">`;
            html += `<div style="font-size: 0.7rem; line-height: 1.1; text-align: center; width: 100%; color: #888;">${area}<br><small style="font-size: 0.6rem;">Vacío</small></div>`;
            html += `</div>`;
        });
        
        contenedor.innerHTML = html;
        

    }
    


    async loadPilotosContratados() {
        console.log('👥 Cargando estrategas contratados...');
        
        // 1. SI existe el nuevo sistema, usarlo SOLO
        if (window.estrategiaManager) {
            console.log('✅ Usando nuevo sistema de estrategas');
            await window.estrategiaManager.cargarEstrategasContratados();
            window.estrategiaManager.actualizarUIEstrategas();
            return;
        }
        
        // 2. SI no, crear instancia del nuevo sistema
        if (window.EstrategiaManager && window.f1Manager) {
            console.log('⚡ Creando EstrategiaManager...');
            try {
                window.estrategiaManager = new window.EstrategiaManager(window.f1Manager);
                this.estrategiaManager = window.estrategiaManager;
                
                // Inicializar
                await window.estrategiaManager.inicializar();
                console.log('✅ Nuevo sistema inicializado');
                
                // Actualizar UI
                window.estrategiaManager.actualizarUIEstrategas();
                return;
            } catch (error) {
                console.error('❌ Error con nuevo sistema:', error);
            }
        }
        
        // 3. SOLO como ÚLTIMO recurso, usar sistema antiguo (pero vacío)
        console.log('⚠️ Usando sistema antiguo (vacío)');
        this.pilotos = []; // ← VACÍO, para que no muestre datos antiguos
        this.updatePilotosUI();
        
        // Mostrar slots vacíos
        const container = document.getElementById('pilotos-container');
        if (container) {
            container.innerHTML = `
                <div class="produccion-slots">
                    <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(0)">
                        <div class="slot-content">
                            <i class="fas fa-plus"></i>
                            <span>Slot 1</span>
                            <span class="slot-disponible">Vacío</span>
                        </div>
                    </div>
                    <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(1)">
                        <div class="slot-content">
                            <i class="fas fa-plus"></i>
                            <span>Slot 2</span>
                            <span class="slot-disponible">Vacío</span>
                        </div>
                    </div>
                    <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(2)">
                        <div class="slot-content">
                            <i class="fas fa-plus"></i>
                            <span>Slot 3</span>
                            <span class="slot-disponible">Vacío</span>
                        </div>
                    </div>
                    <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(3)">
                        <div class="slot-content">
                            <i class="fas fa-plus"></i>
                            <span>Slot 4</span>
                            <span class="slot-disponible">Vacío</span>
                        </div>
                    </div>
                </div>
            `;
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

    // ========================
    // DASHBOARD CON HEADER REORGANIZADO
    // ========================
    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard con header reorganizado...');
        
        // Inicializar presupuesto
        await this.inicializarPresupuestoManager();
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }
    
        await this.verificarRecompensaLoginDiario();
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
            <div id="black-wrapper" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: black;
                z-index: 0;
            ">
    
                <div id="inner-game-container" style="
                    position: absolute;
                    top: env(safe-area-inset-top, 10px);
                    bottom: env(safe-area-inset-bottom, 10px);
                    left: env(safe-area-inset-left, 0);
                    right: env(safe-area-inset-right, 0);
                    overflow: hidden;
                    height: calc(100vh - env(safe-area-inset-top, 10px) - env(safe-area-inset-bottom, 10px));
                ">
                    <div id="app" style="
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        margin: 0;
                        padding: 0;
                    ">


                        <!-- HEADER PRINCIPAL -->
                        <header class="dashboard-header-compacto" style="
                            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                            border-bottom: 3px solid #00d2be;
                            padding: 10px 15px;
                            z-index: 1000;
                        ">
                            <!-- FILA SUPERIOR: SOLO EL NOMBRE DE LA ESCUDERÍA -->
                            <div class="header-top-row" style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                margin-bottom: 10px;
                            ">
                                <div class="logo-compacto" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 10px;
                                    color: white;
                                    font-size: 1.4rem;
                                    font-weight: bold;
                                    font-family: 'Orbitron', sans-serif;
                                    text-align: center;
                                    cursor: pointer;
                                " onclick="abrirPerfilDesdeHeader()">
                                    <i class="fas fa-flag-checkered" style="color: #00d2be; font-size: 1.3rem;"></i>
                                    <span id="escuderia-nombre" style="color: white;">${this.escuderia.nombre}</span>
                                </div>
                            </div>
                            
                            <!-- FILA INFERIOR: DINERO, ESTRELLAS Y NOTIFICACIONES -->
                            <div class="header-bottom-row" style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                gap: 8px;
                            ">

                                <!-- DINERO - SE AJUSTA AL CONTENIDO -->
                                <div class="money-display-compacto" onclick="irAPresupuesto()" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    background: rgba(0, 0, 0, 0.4);
                                    border: 2px solid #FFD700;
                                    border-radius: 8px;
                                    padding: 6px 10px;
                                    color: white;
                                    width: auto;
                                    flex: 0 0 auto;
                                    cursor: pointer;  /* ← AÑADE TAMBIÉN ESTO */
                                    transition: transform 0.2s;  /* ← OPCIONAL: efecto suave */
                                ">
                                    <i class="fas fa-coins" style="color: #FFD700; font-size: 1rem;"></i>
                                    <span id="money-value" style="
                                        font-weight: bold;
                                        font-size: 0.9rem;
                                        color: #FFD700;
                                        white-space: nowrap;
                                    ">€${this.escuderia?.dinero?.toLocaleString() || '0'}</span>
                                </div>
                                
                                <!-- ESTRELLAS - SE AJUSTA AL CONTENIDO -->
                                <div class="estrellas-display-compacto" onclick="mostrarExplicacionEstrellas()" 
                                    title="Click para más info" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    background: rgba(0, 0, 0, 0.4);
                                    border: 2px solid #FF9800;
                                    border-radius: 8px;
                                    padding: 6px 10px;
                                    color: white;
                                    width: auto;
                                    flex: 0 0 auto;
                                    cursor: pointer;
                                ">
                                    <i class="fas fa-star" style="color: #FFD700; font-size: 1rem;"></i>
                                    <span id="estrellas-value" style="
                                        font-weight: bold;
                                        font-size: 0.9rem;
                                        color: #FFD700;
                                        white-space: nowrap;
                                    ">${this.escuderia?.estrellas_semana || 0}</span>
                                </div>
                                <!-- Espacio para notificaciones (se llenará después) -->
                                <div id="notificaciones-placeholder" style="display: inline-block;"></div>
                                <!-- Espacio para mensajes (se llenará después) -->
                                <div id="mensajes-placeholder" style="display: inline-block;"></div>                                

                            </div>
                        </header>
                        
                        <!-- 4 PESTAÑAS PRINCIPALES -->
                        <nav class="tabs-principales" style="
                            display: flex;
                            background: rgba(10, 15, 30, 0.95);
                            border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                            padding: 8px 5px;
                            z-index: 999;
                        ">
                            <button class="tab-btn-compacto active" data-tab="principal" style="flex: 1;">
                                <i class="fas fa-home"></i> Principal
                            </button>
                            <button class="tab-btn-compacto" data-tab="taller" style="flex: 1;">
                                <i class="fas fa-tools"></i> Taller
                            </button>
                            <button class="tab-btn-compacto" data-tab="almacen" style="flex: 1;">
                                <i class="fas fa-warehouse"></i> Almacén
                            </button>
                            <button class="tab-btn-compacto" data-tab="ingenieria" style="flex: 1;">
                                <i class="fas fa-flask"></i> Ingeniería
                            </button>
                        </nav>
                        


                        <!-- PESTAÑAS SECUNDARIAS - MOVIDAS ARRIBA -->
                        <nav class="tabs-secundarias">
                            <button class="tab-btn-secundario" data-tab="mercado">
                                <i class="fas fa-shopping-cart"></i> Mercado
                            </button>
                            <button class="tab-btn-secundario" data-tab="pronosticos">
                                <i class="fas fa-chart-line"></i> Pronósticos
                            </button>
                            <button class="tab-btn-secundario" data-tab="presupuesto">
                                <i class="fas fa-chart-pie"></i> Presupuesto
                            </button>
                            <button class="tab-btn-secundario" data-tab="clasificacion">
                                <i class="fas fa-medal"></i> Clasificación
                            </button>
                            
                            <!-- PESTAÑA SALIR EN ROJO -->
                            <button class="tab-btn-secundario tab-btn-salir" id="logout-btn-visible" 
                                    title="Cerrar sesión">
                                <i class="fas fa-sign-out-alt"></i> Salir
                            </button>
                        </nav>
                      
                        <!-- CONTENIDO PRINCIPAL -->
                        <div id="main-content-area" style="
                            flex: 1;
                            overflow-y: auto;
                            -webkit-overflow-scrolling: touch;
                            padding-bottom: 70px;
                        ">
                            <div id="tab-principal" class="tab-content active">
                                <!-- ÚLTIMO TIEMPO F1 -->
                                <div id="ultimo-tiempo-container" class="ultimo-tiempo-f1">
                                    <div class="tiempo-loading">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <span>Cargando últimos tiempos...</span>
                                    </div>
                                </div>
                                
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
                                    
                                    <div id="grid-piezas-montadas" class="grid-11-columns" style="
                                        max-height: 280px;
                                        overflow-y: auto;
                                        -webkit-overflow-scrolling: touch;
                                        padding-bottom: 20px;
                                        display: grid;
                                        grid-template-columns: repeat(3, 1fr);
                                        gap: 8px;
                                        margin-bottom: 15px;
                                    ">
                                    </div>
                                </section>
                            </div>
                            
                            <div id="tab-taller" class="tab-content"></div>
                            <div id="tab-almacen" class="tab-content"></div>
                            <div id="tab-ingenieria" class="tab-content"></div>
                            
                            <!-- PESTAÑAS SECUNDARIAS -->
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
    

                    </div>
                </div>
            </div>
            <!-- REPRODUCTOR DE MÚSICA -->
            <div id="reproductor-fijo" style="position: fixed; width: 0; height: 0; overflow: hidden; opacity: 0; pointer-events: none; z-index: -9999;">
                <iframe src="/player.html" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>            
    
            <!-- SCRIPTS -->
            <script>
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                }, 1000);
                
                // CONFIGURAR EVENTOS DE PESTAÑAS PRINCIPALES
                document.querySelectorAll('.tab-btn-compacto').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const tabId = e.currentTarget.dataset.tab;
                        
                        // Actualizar clases activas
                        document.querySelectorAll('.tab-btn-compacto').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        
                        e.currentTarget.classList.add('active');
                        document.getElementById('tab-' + tabId).classList.add('active');
                        
                        // Recalcular márgenes
                        setTimeout(() => {
                            if (window.recalcularMargenesMoviles) {
                                window.recalcularMargenesMoviles();
                            }
                        }, 200);
                        
                        // Llamar al tabManager si existe
                        if (window.tabManager && window.tabManager.switchTab) {
                            window.tabManager.switchTab(tabId);
                        }
                        
                        // Si es la pestaña principal, cargar contenido
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                                
                                setTimeout(() => {
                                    if (window.f1Manager && window.f1Manager.cargarUltimoTiempoUI) {
                                        window.f1Manager.cargarUltimoTiempoUI();
                                    }
                                }, 100);
                            }, 150);
                        }
                    });
                });
                
                // CONFIGURAR EVENTOS DE PESTAÑAS SECUNDARIAS
                document.querySelectorAll('.tab-btn-secundario').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const tabId = e.currentTarget.dataset.tab;
                        
                        // Si es salir, manejar logout
                        if (tabId === undefined && e.currentTarget.classList.contains('tab-btn-salir')) {
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
                            return;
                        }
                        
                        // Para otras pestañas secundarias
                        if (tabId) {
                            // Actualizar clases
                            document.querySelectorAll('.tab-btn-secundario').forEach(b => b.classList.remove('active'));
                            e.currentTarget.classList.add('active');
                            
                            // Ocultar todas las pestañas
                            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                            
                            // Mostrar la pestaña seleccionada
                            const tabElement = document.getElementById('tab-' + tabId);
                            if (tabElement) {
                                tabElement.classList.add('active');
                            }
                            
                            // Llamar al tabManager
                            if (window.tabManager && window.tabManager.switchTab) {
                                window.tabManager.switchTab(tabId);
                            }
                        }
                    });
                });
                
                // FUNCIONES AUXILIARES
                window.irAlTallerDesdeProduccion = function() {
                    document.querySelector('[data-tab="taller"]').click();
                };
                
                window.gestionarEstrategas = function() {
                    console.log('🎯 Click en GESTIONAR - Usando nuevo sistema');
                    
                    // 1. Usar el nuevo EstrategiaManager si existe
                    if (window.estrategiaManager && window.estrategiaManager.mostrarGestionCompleta) {
                        console.log('✅ Usando EstrategiaManager nuevo');
                        window.estrategiaManager.mostrarGestionCompleta();
                        return;
                    }
                    
                    // 2. Si no, usar el de f1Manager
                    if (window.f1Manager && window.f1Manager.estrategiaManager) {
                        console.log('✅ Usando estrategiaManager de f1Manager');
                        window.f1Manager.estrategiaManager.mostrarGestionCompleta();
                        return;
                    }
                    
                    // 3. Crear instancia si no existe
                    if (window.EstrategiaManager && window.f1Manager) {
                        console.log('⚡ Creando EstrategiaManager al vuelo');
                        try {
                            window.f1Manager.estrategiaManager = new window.EstrategiaManager(window.f1Manager);
                            window.estrategiaManager = window.f1Manager.estrategiaManager;
                            
                            // Inicializar rápidamente
                            window.estrategiaManager.inicializar().then(() => {
                                window.estrategiaManager.mostrarGestionCompleta();
                            });
                            return;
                        } catch (error) {
                            console.error('❌ Error creando EstrategiaManager:', error);
                        }
                    }
                    
                    // 4. Fallback al sistema viejo (solo si todo falla)
                    console.warn('⚠️ Usando sistema viejo como fallback');
                    if (window.f1Manager && window.f1Manager.mostrarModalContratacion) {
                        window.f1Manager.mostrarModalContratacion();
                    } else {
                        alert('Sistema de estrategas no disponible. Recarga la página.');
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
                
                // Cargar contenido inicial
                setTimeout(() => {
                    if (window.cargarContenidoPrincipal) {
                        window.cargarContenidoPrincipal();
                    }
                }, 1500);
            </script>
        `;

        // ===== REINICIALIZAR NOTIFICACIONES DESPUÉS DE CARGAR EL DASHBOARD =====
        setTimeout(() => {
            if (window.notificacionesManager) {
                console.log('🔔 Dashboard cargado, reinicializando notificaciones...');
                window.notificacionesManager.reinicializar();
            } else {
                console.log('🔔 Dashboard cargado, creando notificaciones por primera vez...');
                window.notificacionesManager = new NotificacionesManager();
                window.notificacionesManager.inicializar();
            }
        }, 2000); // 2 segundos para asegurar que todo está listo

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
            // CARGAR ÚLTIMO TIEMPO
            if (window.f1Manager && window.f1Manager.cargarUltimoTiempoUI) {
                setTimeout(() => {
                    window.f1Manager.cargarUltimoTiempoUI();
                }, 800);
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
        const contador = document.getElementById('contador-estrategas');
        
        if (!container) {
            console.error('❌ No se encontró #pilotos-container');
            return;
        }
        
        // 1. SI existe el nuevo sistema, DEJAR que él maneje la UI
        if (window.estrategiaManager && window.estrategiaManager.actualizarUIEstrategas) {
            console.log('🔄 EstrategiaManager manejará la UI');
            // No hacer nada aquí, el nuevo sistema lo hará
            return;
        }
        
        // 2. SI no, mostrar slots vacíos
        console.log('⚠️ Mostrando slots vacíos (sistema antiguo desactivado)');
        
        if (contador) {
            contador.textContent = '0/4';
        }
        
        container.innerHTML = `
            <div class="produccion-slots">
                <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(0)">
                    <div class="slot-content">
                        <i class="fas fa-plus"></i>
                        <span>Slot 1</span>
                        <span class="slot-disponible">Vacío</span>
                    </div>
                </div>
                <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(1)">
                    <div class="slot-content">
                        <i class="fas fa-plus"></i>
                        <span>Slot 2</span>
                        <span class="slot-disponible">Vacío</span>
                    </div>
                </div>
                <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(2)">
                    <div class="slot-content">
                        <i class="fas fa-plus"></i>
                        <span>Slot 3</span>
                        <span class="slot-disponible">Vacío</span>
                    </div>
                </div>
                <div class="produccion-slot estratega-vacio" onclick="contratarNuevoEstratega(3)">
                    <div class="slot-content">
                        <i class="fas fa-plus"></i>
                        <span>Slot 4</span>
                        <span class="slot-disponible">Vacío</span>
                    </div>
                </div>
            </div>
        `;
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
        console.log(`🔔 [NOTIFICACIÓN] "${mensaje}" (${tipo})`);
        
        // Crear elemento
        const notification = document.createElement('div');
        
        // ESTILOS DIRECTOS E INMEDIATOS
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px'; // Cambiado de left a right
        notification.style.background = '#1a1a2e';
        notification.style.borderLeft = `4px solid ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#e10600' : tipo === 'info' ? '#2196F3' : '#FF9800'}`;
        notification.style.color = 'white';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '6px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.zIndex = '2147483647';
        notification.style.maxWidth = '300px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.transition = 'all 0.3s ease'; // Transición suave para todo
        notification.style.opacity = '0'; // Inicialmente invisible
        notification.style.transform = 'translateX(50px)'; // Inicialmente desplazado
        
        // Icono
        let icono = '🔔';
        if (tipo === 'success') icono = '✅';
        if (tipo === 'error') icono = '❌';
        if (tipo === 'info') icono = 'ℹ️';
        if (tipo === 'warning') icono = '⚠️';
        
        notification.innerHTML = `<div style="font-size: 18px;">${icono}</div><div>${mensaje}</div>`;
        
        // Añadir al body
        document.body.appendChild(notification);
        
        // Calcular posición basada en notificaciones existentes
        const notificacionesExistentes = document.querySelectorAll('[style*="position: fixed"][style*="right: 20px"]');
        let topPosicion = 20;
        
        notificacionesExistentes.forEach(notif => {
            if (notif !== notification) {
                topPosicion += notif.offsetHeight + 10; // 10px de separación
            }
        });
        
        // Aplicar posición y hacer visible
        notification.style.top = `${topPosicion}px`;
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
        
        // Función para actualizar posiciones cuando se elimina una notificación
        const actualizarPosiciones = () => {
            const todasNotificaciones = document.querySelectorAll('[style*="position: fixed"][style*="right: 20px"]');
            let nuevaTopPosicion = 20;
            
            todasNotificaciones.forEach(notif => {
                notif.style.transition = 'top 0.3s ease';
                notif.style.top = `${nuevaTopPosicion}px`;
                nuevaTopPosicion += notif.offsetHeight + 10;
            });
        };
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(50px)';
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                        // Actualizar posiciones de las notificaciones restantes
                        actualizarPosiciones();
                    }
                }, 300);
            }
        }, 3000);
        
        return notification;
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
                    let nombreMostrar = fabricacion.nombre_pieza || "Actualización " + nombreArea;
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
                    html += 'data-slot-index="' + i + '" ';
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
                .select('id, tiempo_fin, area, nivel')
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
                
                // 🟢 CAMBIO AQUÍ: Si tiempoRestante <= 0, actualizar el onclick
                if (tiempoRestante <= 0) {
                    // Obtener el slotIndex actual (si está en el onclick antiguo)
                    const match = slot.getAttribute('onclick')?.match(/, (\d+)\)/);
                    const slotIndex = match ? match[1] : '0';
                    
                    // ACTUALIZAR EL ONCLICK con lista = true
                    slot.setAttribute('onclick', `recogerPiezaSiLista('${fabricacionId}', true, ${slotIndex})`);
                    
                    // Cambiar clases y contenido visual
                    slot.classList.remove('produccion-activa');
                    slot.classList.add('produccion-lista');
                    
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const nombreMostrar = "Actualización " + nombreArea;
                    const nivelMostrar = "Q" + fabricacion.nivel;
                    
                    slot.innerHTML = `
                        <div class="produccion-icon">✅</div>
                        <div class="produccion-info">
                            <span class="produccion-nombre">${nombreMostrar}</span>
                            <span class="produccion-pieza-num">${nivelMostrar}</span>
                            <span class="produccion-lista-text">¡LISTA!</span>
                        </div>
                    `;
                } else {
                    // Si no ha llegado a cero, solo actualizar el tiempo
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
        // Mostrar notificación temporal simple
        const notificacion = document.createElement('div');
        notificacion.className = 'notification info';
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-hourglass-half"></i>
                <span>Fabricación en curso<br><small>Ya casi está...</small></span>
            </div>
        `;
        document.body.appendChild(notificacion);
        
        setTimeout(() => notificacion.classList.add('show'), 10);
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
        
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
        const { data: todasPiezasArea } = await window.supabase
            .from('almacen_piezas')
            .select('id, numero_global')
            .eq('escuderia_id', fabricacion.escuderia_id)
            .eq('area', fabricacion.area);
        
        let maxNumeroGlobal = 0;
        if (todasPiezasArea && todasPiezasArea.length > 0) {
            todasPiezasArea.forEach(p => {
                if (p.numero_global && p.numero_global > maxNumeroGlobal) {
                    maxNumeroGlobal = p.numero_global;
                }
            });
        }
        let nuevoNumeroGlobal = maxNumeroGlobal + 1;
        
        let componente = fabricacion.nombre_pieza;
        if (window.f1Manager && window.f1Manager.nombresPiezas && 
            window.f1Manager.nombresPiezas[fabricacion.area]) {
            const nombresArea = window.f1Manager.nombresPiezas[fabricacion.area];
            if (nuevoNumeroGlobal <= nombresArea.length) {
                componente = nombresArea[nuevoNumeroGlobal - 1];
            }
        }
        
        // ===== Calcular puntos =====
        let puntosTotales;
        if (window.f1Manager && window.f1Manager.calcularPuntosPieza) {
            puntosTotales = window.f1Manager.calcularPuntosPieza(fabricacion.area, nuevoNumeroGlobal);
        } else {
            puntosTotales = calcularPuntosBase(fabricacion.area, fabricacion.nivel, nuevoNumeroGlobal);
        }
        
        // ===== Insertar con numero_global =====
        const nombrePieza = fabricacion.nombre_pieza || `${fabricacion.area} Mejora ${nuevoNumeroGlobal}`;
        
        const { error: insertError } = await window.supabase
            .from('almacen_piezas')
            .insert([{
                escuderia_id: fabricacion.escuderia_id,
                area: fabricacion.area,
                nivel: fabricacion.nivel || 1,
                numero_global: fabricacion.numero_pieza || nuevoNumeroGlobal,
                componente: nombrePieza,
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
        
        // Obtener nombre personalizado para notificación
        let nombrePiezaNotif = componente;
        
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification('✅ ' + nombrePiezaNotif + ' recogida', 'success');
        }
        
        // 🟢🟢🟢 ACTUALIZACIONES CRÍTICAS 🟢🟢🟢
        if (window.f1Manager) {
            // 1. Limpiar timer de producción
            if (window.f1Manager.productionUpdateTimer) {
                clearInterval(window.f1Manager.productionUpdateTimer);
            }
            
            // 2. Actualizar slot específico
            const slotElement = document.querySelector(`.produccion-slot[onclick*="${fabricacionId}"]`);
            if (slotElement) {
                slotElement.className = 'produccion-slot';
                slotElement.setAttribute('onclick', 'irAlTallerDesdeProduccion()');
                slotElement.innerHTML = `
                    <div class="slot-content">
                        <i class="fas fa-plus"></i>
                        <span>Departamento ${slotIndex + 1}</span>
                        <span class="slot-disponible">Disponible</span>
                    </div>
                `;
            } else {
                setTimeout(() => {
                    window.f1Manager.updateProductionMonitor();
                }, 500);
            }
            
            // 🟢🟢🟢 3. RECARGAR EL TALLER PARA DESBLOQUEAR EL ÁREA 🟢🟢🟢
            setTimeout(() => {
                if (window.f1Manager.cargarTabTaller) {
                    console.log(`🔄 Recargando taller para desbloquear área ${fabricacion.area}...`);
                    window.f1Manager.cargarTabTaller();
                }
            }, 500);
            
            // 4. Actualizar almacén si es necesario
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                setTimeout(() => {
                    if (window.tabManager.loadAlmacenPiezas) {
                        window.tabManager.loadAlmacenPiezas();
                    }
                }, 1000);
            }
            
            // 5. Actualizar piezas montadas
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

window.addEventListener('auth-completado', (evento) => {
    console.log('✅ Evento auth-completado recibido en main.js');
    
    const { user, escuderia, supabase } = evento.detail || window.authData || {};
    
    if (user && escuderia) {
        console.log('🎮 Creando F1Manager con datos de autenticación...');
        
        // MOSTRAR PANTALLA DE CARGA - SIEMPRE AL INICIAR
        mostrarPantallaCargaInicial();
        
        window.f1Manager = new F1Manager(user, escuderia, supabase);
        
        // Usar una IIFE async para manejar toda la inicialización
        (async function inicializarSistemas() {
            try {
                // Inicializar ingenieriaManager
                if (window.IngenieriaManager && !window.ingenieriaManager) {
                    console.log('🔧 Creando ingenieriaManager...');
                    try {
                        window.ingenieriaManager = new window.IngenieriaManager(window.f1Manager);
                        await window.ingenieriaManager.inicializar();
                        console.log('✅ ingenieriaManager inicializado');
                    } catch (error) {
                        console.error('❌ Error inicializando ingenieriaManager:', error);
                    }
                }
                
                // Inicializar mercadoManager usando .then() para evitar problemas
                if (window.MercadoManager) {
                    console.log('🔧 Inicializando mercadoManager con escudería:', escuderia.id);
                    if (!window.mercadoManager) {
                        window.mercadoManager = new window.MercadoManager();
                    }
                    
                    // Manejar la promesa sin await problemático
                    window.mercadoManager.inicializar(escuderia)
                        .then(() => {
                            console.log('✅ mercadoManager inicializado');
                        })
                        .catch(error => {
                            console.error('❌ Error inicializando mercadoManager:', error);
                        });
                }
                // 👇 AÑADE AQUÍ EL CÓDIGO DEL RESUMEN SEMANAL
                // Inicializar ResumenSemanalManager
                if (window.ResumenSemanalManager && !window.resumenSemanalManager) {
                    window.resumenSemanalManager = new ResumenSemanalManager();
                    window.resumenSemanalManager.inicializar();
                    console.log('✅ ResumenSemanalManager inicializado');
                }

                // Verificar si mostrar tutorial
                // PRIMERO: Siempre cargar dashboard principal
                console.log('✅ Cargando dashboard principal...');
                
                // Simular progreso de carga
                actualizarProgresoCarga(30, "Cargando escudería...");
                await new Promise(resolve => setTimeout(resolve, 800));
                
                actualizarProgresoCarga(60, "Preparando dashboard...");
                await new Promise(resolve => setTimeout(resolve, 800));
                
                actualizarProgresoCarga(90, "Inicializando sistemas...");
                await new Promise(resolve => setTimeout(resolve, 800));
                
                actualizarProgresoCarga(100, "¡Listo!");
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Ocultar pantalla de carga
                ocultarPantallaCarga();
                
                // Cargar dashboard
                if (window.f1Manager.cargarDashboardCompleto) {
                    await window.f1Manager.cargarDashboardCompleto();
                }

                setTimeout(async () => {
                    if (window.f1Manager && !window.f1Manager.estrategiaManager && window.EstrategiaManager) {
                        window.f1Manager.estrategiaManager = new window.EstrategiaManager(window.f1Manager);
                        await window.f1Manager.estrategiaManager.inicializar();
                        window.estrategiaManager = window.f1Manager.estrategiaManager;
                        console.log('✅ EstrategiaManager inicializado en auth-completado');
                    }
                }, 2000);                    
                

                // DESPUÉS: Verificar si mostrar tutorial
                if (!escuderia.tutorial_completado) {
                    console.log('📚 Verificando tutorial...');
                    
                    // ✅ SOLUCIÓN: Usar patrón Singleton del TutorialManager
                    if (!window.tutorialManager) {
                        console.log('📚 Creando TutorialManager por primera vez...');
                        window.tutorialManager = new TutorialManager(window.f1Manager);
                    } else {
                        console.log('📚 TutorialManager ya existe, actualizando f1Manager...');
                        window.tutorialManager.f1Manager = window.f1Manager;
                    }
                    
                    // ✅ IMPORTANTE: Solo iniciar si no está ya iniciado
                    if (window.tutorialManager.tutorialIniciado) {
                        console.log('📚 Tutorial ya iniciado previamente, omitiendo...');
                    } else {
                        console.log('📚 Iniciando tutorial...');
                        window.tutorialManager.iniciar();
                    }
                    
                    // ✅ También guardar referencia global
                    window.tutorialManagerGlobal = window.tutorialManager;
                    
                } else {
                    console.log('✅ Tutorial ya completado, continuando en dashboard...');
                    
                    // ✅ Limpiar tutorial si ya está completado
                    if (window.tutorialManager) {
                        console.log('🧹 Limpiando tutorial ya completado...');
                        if (window.tutorialManager.ventanaTutorial) {
                            window.tutorialManager.ventanaTutorial.remove();
                        }
                        window.tutorialManager = null;
                    }
                }
                
            } catch (error) {
                console.error('❌ Error crítico durante la inicialización:', error);
                // Mostrar error al usuario
                document.body.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0a0a0f; color: white; display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 20px; font-family: Arial, sans-serif; z-index: 99999;">
                        <h1 style="color: #e10600; font-size: 2.5rem; margin-bottom: 20px;">❌ ERROR DE INICIALIZACIÓN</h1>
                        <div style="background: rgba(225, 6, 0, 0.1); padding: 20px; border-radius: 10px; border: 2px solid #e10600; max-width: 600px; margin-bottom: 30px;">
                            <h3 style="color: #ff4444; margin-top: 0;">Detalles del error:</h3>
                            <p style="font-family: monospace; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto;">${error.message}</p>
                        </div>
                        <button onclick="location.reload()" style="padding: 15px 30px; background: linear-gradient(135deg, #e10600, #ff4444); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: transform 0.2s;">
                            <i class="fas fa-redo" style="margin-right: 10px;"></i> REINTENTAR
                        </button>
                        <p style="margin-top: 20px; color: #888; font-size: 0.9rem;">Si el problema persiste, contacta con soporte técnico.</p>
                    </div>
                `;
            }
        })(); // <-- Ejecutar inmediatamente
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
    // ========================
    // FUNCIÓN DE DEBUG PARA VER FABRICACIONES ACTIVAS
    // ========================
    window.debugFabricacionesActivas = async function() {
        if (!window.f1Manager || !window.f1Manager.supabase || !window.f1Manager.escuderia) {
            console.error('❌ No hay F1Manager');
            return;
        }
        
        try {
            const { data, error } = await window.f1Manager.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', window.f1Manager.escuderia.id)
                .eq('completada', false);
            
            if (error) throw error;
            
            console.log('🔍 FABRICACIONES ACTIVAS:', data?.length || 0);
            console.table(data);
            
            // Crear SET de áreas
            const areasConFabricacion = new Set();
            data?.forEach(f => areasConFabricacion.add(f.area));
            console.log('🚫 ÁREAS OCUPADAS:', Array.from(areasConFabricacion).join(', ') || 'ninguna');
            
            return data;
        } catch (error) {
            console.error('❌ Error en debug:', error);
        }
    };
    // ========================
    // FUNCIÓN PARA IR A PRUEBAS DE PISTA
    // ========================
    window.irAPruebaPista = function() {
        console.log('🏎️ Redirigiendo a pruebas de pista...');
        
        // Primero intentar usar el tabManager para ir a ingeniería
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('ingenieria');
            console.log('✅ Redirigido usando tabManager a ingeniería');
            
            // Después de un pequeño delay, intentar abrir el modal de pruebas si existe
            setTimeout(() => {
                if (window.ingenieriaManager && window.ingenieriaManager.iniciarPruebaPista) {
                    console.log('🔧 Abriendo modal de prueba de pista...');
                    window.ingenieriaManager.iniciarPruebaPista();
                } else if (window.ingenieriaManager && window.ingenieriaManager.mostrarModalPruebas) {
                    console.log('🔧 Abriendo modal de pruebas...');
                    window.ingenieriaManager.mostrarModalPruebas();
                } else {
                    console.log('⚠️ ingenieriaManager no tiene método para iniciar pruebas');
                    // Mostrar notificación
                    if (window.f1Manager && window.f1Manager.showNotification) {
                        window.f1Manager.showNotification('🔧 Busca "Pruebas en Pista" en la pestaña Ingeniería', 'info');
                    }
                }
            }, 1000);
            return;
        }
        
        // Método alternativo: buscar y hacer click en la pestaña de ingeniería
        const tabIngenieria = document.querySelector('[data-tab="ingenieria"]');
        if (tabIngenieria) {
            tabIngenieria.click();
            console.log('✅ Click en pestaña ingeniería');
            
            // Notificación para guiar al usuario
            setTimeout(() => {
                if (window.f1Manager && window.f1Manager.showNotification) {
                    window.f1Manager.showNotification('🔍 Busca la sección "Pruebas en Pista"', 'info');
                }
            }, 1500);
        } else {
            // Último recurso: mostrar mensaje
            alert('🏎️ Para realizar pruebas en pista:\n\n1. Ve a la pestaña "INGENIERÍA"\n2. Busca la opción "Pruebas en Pista"\n3. Realiza vueltas para registrar tiempos\n\n¡Registra tu primer tiempo!');
        }
    };
    // ========================
    // FUNCIÓN PARA IR A PRESUPUESTO
    // ========================
    window.irAPresupuesto = function() {
        console.log('💰 Redirigiendo a presupuesto...');
        
        // Buscar el botón de la pestaña presupuesto
        const tabButton = document.querySelector('[data-tab="presupuesto"]');
        
        if (tabButton) {
            tabButton.click();
            console.log('✅ Click simulado en pestaña Presupuesto');
        } else {
            console.error('❌ No se encontró el botón de pestaña Presupuesto');
            
            // Plan B: Activar manualmente
            document.querySelectorAll('.tab-btn-secundario').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            const presupuestoTab = document.getElementById('tab-presupuesto');
            if (presupuestoTab) {
                presupuestoTab.classList.add('active');
                console.log('✅ Pestaña Presupuesto activada manualmente');
            }
        }
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
    window.mostrarModalContratacion = function(huecoNumero) {
        // Verificar si ya existe un modal
        if (document.getElementById('modal-contratacion')) {
            document.getElementById('modal-contratacion').remove();
        }
        
        const modalHTML = `
            <div id="modal-contratacion" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1a1a2e;
                    padding: 20px;
                    border-radius: 10px;
                    border: 2px solid #00d2be;
                    max-width: 400px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                    ">
                        <h3 style="color: #00d2be; margin: 0;">Contratar Estratega</h3>
                        <button onclick="document.getElementById('modal-contratacion').remove()" style="
                            background: none;
                            border: none;
                            color: #aaa;
                            font-size: 1.2rem;
                            cursor: pointer;
                        ">✕</button>
                    </div>
                    
                    <p style="color: white; margin-bottom: 20px;">Selecciona un estratega para el hueco ${huecoNumero}:</p>
                    
                    <div style="margin: 20px 0;">
                        <button onclick="contratarEstrategaFicticio(1, ${huecoNumero})" style="
                            width: 100%;
                            padding: 12px;
                            margin: 8px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <span>🕐 Analista de Tiempos</span>
                            <span style="color: #FFD700;">+15%</span>
                        </button>
                        
                        <button onclick="contratarEstrategaFicticio(2, ${huecoNumero})" style="
                            width: 100%;
                            padding: 12px;
                            margin: 8px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <span>🌧️ Meteorólogo</span>
                            <span style="color: #FFD700;">+20%</span>
                        </button>
                        
                        <button onclick="contratarEstrategaFicticio(3, ${huecoNumero})" style="
                            width: 100%;
                            padding: 12px;
                            margin: 8px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <span>🔧 Experto en Fiabilidad</span>
                            <span style="color: #FFD700;">+18%</span>
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button onclick="document.getElementById('modal-contratacion').remove()" style="
                            flex: 1;
                            padding: 10px;
                            background: transparent;
                            border: 1px solid #666;
                            color: #aaa;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };
    
    // ========================
    // FUNCIÓN PARA CONTRATAR ESTRATEGA (YA EXISTÍA)
    // ========================    
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
        console.log('🔧 Botón presionado para:', areaId);
        
        // Bloquear botón
        const boton = event?.currentTarget;
        if (boton) {
            boton.disabled = true;
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><div class="pieza-nombre-50">Verificando...</div>';
        }
        
        if (!window.f1Manager || !window.f1Manager.iniciarFabricacionTaller) {
            alert('Error: Sistema de fabricación no disponible');
            return false;
        }
        
        // 🟢🟢🟢 ÚNICA LÍNEA QUE IMPORTA 🟢🟢🟢
        // Llamar DIRECTAMENTE al método de la clase, SIN CALCULAR NADA AQUÍ
        const resultado = await window.f1Manager.iniciarFabricacionTaller(areaId);
        
        // Restaurar botón si falla
        if (!resultado) {
            setTimeout(() => {
                if (boton) {
                    boton.disabled = false;
                    boton.innerHTML = '<i class="fas fa-plus"></i>' +
                        `<div class="pieza-nombre-50">${boton.title?.split(' - ')[0] || 'Fabricar'}</div>` +
                        `<div class="pieza-precio-50">€${boton.title?.match(/€([\d,]+)/)?.[1] || '0'}</div>`;
                }
            }, 2000);
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
    // ========================
    // FUNCIÓN PARA MANTENER PIEZAS EQUIPADAS
    // ========================
    // ========================
    window.mantenerPiezaEquipada = function(piezaId) {
        console.log('⚠️ Mantenimiento desactivado - Las piezas se destruyen automáticamente');
        if (window.f1Manager && window.f1Manager.showNotification) {
            window.f1Manager.showNotification('❌ Esta pieza ya no existe - Fue destruida por desgaste', 'error');
        }
    };
    
    // También puedes añadir una versión alternativa por si acaso
    window.goToAlmacen = window.irAlAlmacenDesdePiezas;    
    
    // ============================================
    // Añade esta función en algún lugar accesible (en la IIFE al final)
    window.cargarContenidoPrincipal = async function() {
        console.log('🔧 Cargando contenido principal...');
        
        if (window.f1Manager) {
            // 1. Cargar piezas montadas
            if (window.f1Manager.cargarPiezasMontadas) {
                await window.f1Manager.cargarPiezasMontadas();
            }
            
            // 2. Cargar estrategas
            if (window.f1Manager.loadPilotosContratados) {
                await window.f1Manager.loadPilotosContratados();
            }
            
            // 3. Cargar producción
            if (window.f1Manager.updateProductionMonitor) {
                window.f1Manager.updateProductionMonitor();
            }
            
            // 4. Cargar último tiempo (¡ESTO ES NUEVO!)
            if (window.f1Manager.cargarUltimoTiempoUI) {
                await window.f1Manager.cargarUltimoTiempoUI();
            }
        }
    };

    // ========================
    // FUNCIÓN PARA RESTAURAR PIEZA EQUIPADA AL 100%
    // ========================
    window.restaurarPiezaEquipada = async function(piezaId) {
        console.log('🔄 Restaurando pieza:', piezaId);
        
        if (!window.f1Manager || !window.f1Manager.supabase) {
            console.error('❌ No hay F1Manager o Supabase');
            return;
        }
        
        try {
            const ahora = new Date().toISOString();
            
            // Actualizar la pieza: desgaste 100% y REINICIAR montada_en
            const { error } = await window.f1Manager.supabase
                .from('almacen_piezas')
                .update({ 
                    desgaste_actual: 100,
                    montada_en: ahora,  // Reiniciar contador de 24h
                    ultima_actualizacion_desgaste: ahora
                })
                .eq('id', piezaId);
            
            if (error) {
                console.error('❌ Error restaurando pieza:', error);
                if (window.f1Manager.showNotification) {
                    window.f1Manager.showNotification('❌ Error restaurando pieza', 'error');
                }
                return;
            }
            
            console.log('✅ Pieza restaurada al 100%');
            
            // Mostrar notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification('✅ Pieza restaurada al 100%', 'success');
            }
            
            // Actualizar la vista inmediatamente (sin cambiar de pestaña)
            setTimeout(() => {
                if (window.f1Manager && window.f1Manager.cargarPiezasMontadas) {
                    window.f1Manager.cargarPiezasMontadas();
                }
            }, 300);
            
        } catch (error) {
            console.error('❌ Error en restaurarPiezaEquipada:', error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification('❌ Error restaurando', 'error');
            }
        }
    };
    // ========================
    // FUNCIONES DE FILTRADO PARA EL TALLER
    // ========================
    window.filtrarAreaTaller = function(areaId) {
        console.log('🔍 Filtrando por área:', areaId);
        
        // 1. Remover clase activa de todos los botones de filtro
        document.querySelectorAll('.filtro-area-btn-mini').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 2. Activar el botón clickeado
        const btnActivo = document.querySelector(`.filtro-area-btn-mini[data-area="${areaId}"]`);
        if (btnActivo) {
            btnActivo.classList.add('active');
        }
        
        // 3. Remover clase de mostrar todas del contenedor
        const contenedor = document.getElementById('contenedor-areas-taller');
        if (contenedor) {
            contenedor.classList.remove('sin-filtro');
        }
        
        // 4. Ocultar todas las áreas
        document.querySelectorAll('.area-completa').forEach(area => {
            area.classList.remove('visible');
        });
        
        // 5. Mostrar solo el área seleccionada
        const areaSeleccionada = document.getElementById(`area-${areaId}`);
        if (areaSeleccionada) {
            areaSeleccionada.classList.add('visible');
            
            // Hacer scroll suave hasta el área
            setTimeout(() => {
                areaSeleccionada.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    };
    
    window.mostrarTodasAreasTaller = function() {
        console.log('👁️ Mostrando todas las áreas');
        
        // 1. Desactivar todos los botones de filtro
        document.querySelectorAll('.filtro-area-btn-mini').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 2. Añadir clase de mostrar todas al contenedor
        const contenedor = document.getElementById('contenedor-areas-taller');
        if (contenedor) {
            contenedor.classList.add('sin-filtro');
        }
        
        // 3. Mostrar todas las áreas
        document.querySelectorAll('.area-completa').forEach(area => {
            area.classList.add('visible');
        });
        
        // 4. Scroll al inicio
        setTimeout(() => {
            if (contenedor) {
                contenedor.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    };

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
                        <strong>Conversión:</strong> Cada estrella = <span style="color: #4CAF50; font-weight: bold;">€10,000</span>
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
    // Evento para actualizar último tiempo cuando se complete una prueba
    window.addEventListener('prueba-completada', (event) => {
        console.log('🏎️ Prueba completada, actualizando último tiempo...');
        if (window.f1Manager && window.f1Manager.cargarUltimoTiempoUI) {
            setTimeout(() => {
                window.f1Manager.cargarUltimoTiempoUI();
            }, 1000);
        }
    }); 
    // ========================
    // FUNCIÓN PARA ABRIR PERFIL DESDE CUALQUIER PARTE
    // ========================
    window.abrirPerfilDesdeHeader = function() {
        console.log('👤 Intentando abrir perfil...');
        
        // Método 1: Usar perfilManager global
        if (window.perfilManager && typeof window.perfilManager.mostrarPerfil === 'function') {
            console.log('✅ Usando perfilManager existente');
            window.perfilManager.mostrarPerfil();
            return;
        }
        
        // Método 2: Si no existe, intentar crearlo
        if (typeof PerfilManager !== 'undefined') {
            console.log('⚡ Creando nuevo PerfilManager');
            window.perfilManager = new PerfilManager();
            setTimeout(() => {
                window.perfilManager.mostrarPerfil();
            }, 100);
            return;
        }
        
        // Método 3: Error
        console.error('❌ PerfilManager no disponible');
        alert('Error: Sistema de perfiles no cargado. Recarga la página.');
    };

    
    // ========================
    // FIX PARA MÁRGENES MÓVILES Y SCROLL
    // ========================
    window.recalcularMargenesMoviles = function() {
        const container = document.getElementById('inner-game-container');
        const mainContent = document.getElementById('main-content-area');
        
        if (!container || !mainContent) return;
        
        // 1. Aplicar safe-area-inset dinámicamente
        const topSafe = 'env(safe-area-inset-top, 10px)';
        const bottomSafe = 'env(safe-area-inset-bottom, 10px)';
        
        container.style.top = topSafe;
        container.style.bottom = bottomSafe;
        container.style.height = `calc(100vh - ${topSafe} - ${bottomSafe})`;
        
        // 2. Forzar recalculo del layout
        setTimeout(() => {
            // Aplicar estilos de scroll a TODOS los contenedores principales
            const contenedoresScroll = [
                '#main-content-area',
                '.contenedor-areas-desplazable',
                '#grid-piezas-montadas'
            ];
            
            contenedoresScroll.forEach(selector => {
                const elemento = document.querySelector(selector);
                if (elemento) {
                    elemento.style.maxHeight = 'calc(100vh - 180px)';
                    elemento.style.overflowY = 'auto';
                    elemento.style.WebkitOverflowScrolling = 'touch';
                }
            });
            
            // Scroll específico para piezas montadas (11 botones)
            const gridPiezas = document.getElementById('grid-piezas-montadas');
            if (gridPiezas) {
                gridPiezas.style.minHeight = '200px';
                gridPiezas.style.maxHeight = '300px';
                gridPiezas.parentElement.style.overflow = 'visible';
            }
            
            // Scroll específico para taller (550 botones)
            const contenedorTaller = document.querySelector('.contenedor-areas-desplazable');
            if (contenedorTaller) {
                contenedorTaller.style.maxHeight = 'calc(100vh - 250px)';
                contenedorTaller.style.paddingBottom = '100px'; // Espacio extra para scroll
            }
        }, 100);
    };
    
    // Ejecutar al cargar y al cambiar pestañas
    window.addEventListener('load', window.recalcularMargenesMoviles);
    document.addEventListener('DOMContentLoaded', window.recalcularMargenesMoviles);
    
    // Interceptar cambios de pestaña
    const observerTabChanges = new MutationObserver(() => {
        if (document.querySelector('.tab-content.active')) {
            setTimeout(window.recalcularMargenesMoviles, 300);
        }
    });
    
    observerTabChanges.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    // ✅ FUNCIÓN DE BLOQUEO GLOBAL - AÑADE ESTO NUEVO
    window.fabricacionEnProgreso = false;
    
    window.iniciarFabricacionConBloqueo = async function(areaId, nivel, nombrePieza, numeroPieza) {
        // Evitar doble click
        if (window.fabricacionEnProgreso) {
            console.log('⚠️ Ya hay una fabricación en curso');
            return false;
        }
        
        window.fabricacionEnProgreso = true;
        
        // CALCULAR COSTO (igual que en el botón)
        const nivelPieza = Math.ceil(numeroPieza / 5);
        const numeroEnNivel = ((numeroPieza - 1) % 5) + 1;
        const costo = window.f1Manager.calcularCostoPieza(nivelPieza, numeroEnNivel);
        
        // BLOQUEO VISUAL INMEDIATO
        const boton = event?.currentTarget;
        if (boton) {
            boton.disabled = true;
            boton.classList.remove('vacio');
            boton.classList.add('fabricando');
            boton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>
                              <div class="pieza-nombre-50">${nombrePieza}</div>
                              <div class="pieza-precio-50">€${costo.toLocaleString()}</div>`;
        }        
        
        try {
            const resultado = await window.f1Manager.iniciarFabricacionTaller(areaId, nivel, nombrePieza, numeroPieza);
            return resultado;
        } finally {
            setTimeout(() => {
                window.fabricacionEnProgreso = false;
            }, 1000);
        }
    };


})(); // <-- SOLO UN CIERRE
