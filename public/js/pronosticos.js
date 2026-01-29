// pronosticos.js - VERSIÓN COMPATIBLE CON TU SISTEMA
console.log("📊 Sistema de pronósticos cargado");

class PronosticosManager {
    constructor() {
        this.supabase = window.supabase;
        this.preguntaAreas = {
            1: 'meteorologia', 2: 'fiabilidad', 3: 'estrategia', 4: 'rendimiento',
            5: 'neumaticos', 6: 'seguridad', 7: 'clasificacion', 8: 'carrera',
            9: 'overtakes', 10: 'incidentes'
        };
        this.preguntasActuales = [];
        this.carreraActual = null;
        this.usuarioPuntos = 0;
        this.estrategasActivos = [];
        this.pronosticoGuardado = false;
        this.injectarEstilos();
    }
    injectarEstilos() {
        if (document.getElementById('estilos-pronosticos-f1')) return;
        
        const estilos = `
            /* ========== ESTILOS F1 PARA PRONÓSTICOS (ADAPTADOS A CLASES EXISTENTES) ========== */
            
            /* Contenedor principal - usa la clase que ya tienes */
            .pronostico-container {
                padding: 20px;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                min-height: 100vh;
                color: white;
                font-family: 'Orbitron', 'Segoe UI', sans-serif;
            }
            
            /* Tarjetas - usa las clases Bootstrap que ya tienes */
            .card {
                background: rgba(20, 20, 40, 0.9) !important;
                border-radius: 15px !important;
                border: 2px solid rgba(0, 210, 190, 0.3) !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
                backdrop-filter: blur(10px);
                margin-bottom: 25px !important;
                overflow: hidden;
                transition: transform 0.3s ease, border-color 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-5px);
                border-color: rgba(0, 210, 190, 0.7) !important;
            }
            
            /* Cabeceras de tarjetas - mantiene clases Bootstrap */
            .card-header {
                background: linear-gradient(90deg, #00d2be 0%, #0066cc 100%) !important;
                padding: 15px 25px !important;
                color: white !important;
                border-bottom: 3px solid rgba(255, 255, 255, 0.1) !important;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .card-header h4 {
                margin: 0 !important;
                font-weight: 700 !important;
                letter-spacing: 1px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .card-body {
                padding: 25px !important;
            }
            
            /* Botones - mantiene clases Bootstrap pero con estilo F1 */
            .btn {
                border-radius: 8px !important;
                padding: 12px 24px !important;
                font-weight: bold !important;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                transition: all 0.3s ease !important;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-family: 'Orbitron', sans-serif !important;
                font-size: 0.9rem !important;
            }
            
            .btn-success {
                background: linear-gradient(90deg, #00d2be 0%, #0066cc 100%) !important;
                border: none !important;
                box-shadow: 0 4px 15px rgba(0, 210, 190, 0.3) !important;
            }
            
            .btn-success:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(0, 210, 190, 0.4) !important;
                background: linear-gradient(90deg, #0066cc 0%, #00d2be 100%) !important;
            }
            
            .btn-primary {
                background: linear-gradient(90deg, #e10600 0%, #ff6b00 100%) !important;
                border: none !important;
                box-shadow: 0 4px 15px rgba(225, 6, 0, 0.3) !important;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(225, 6, 0, 0.4) !important;
                background: linear-gradient(90deg, #ff6b00 0%, #e10600 100%) !important;
            }
            
            .btn-outline-secondary {
                background: rgba(0, 210, 190, 0.1) !important;
                border: 2px solid #00d2be !important;
                color: #00d2be !important;
            }
            
            .btn-outline-secondary:hover {
                background: rgba(0, 210, 190, 0.2) !important;
                transform: translateY(-2px) !important;
                border-color: #00d2be !important;
                color: white !important;
            }
            
            /* Preguntas - usa tu clase .pregunta-card existente */
            .pregunta-card {
                background: rgba(30, 30, 50, 0.7) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                margin-bottom: 20px !important;
                border-left: 5px solid #00d2be !important;
                transition: all 0.3s ease !important;
            }
            
            .pregunta-card:hover {
                background: rgba(40, 40, 60, 0.8) !important;
                border-left-color: #e10600 !important;
            }
            
            .pregunta-card h5 {
                color: #00d2be !important;
                margin-bottom: 15px !important;
                font-size: 1.1rem !important;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            /* Opciones de respuesta - usa tus clases .opciones y .opcion */
            .opciones {
                display: grid !important;
                gap: 12px !important;
                margin-top: 15px !important;
            }
            
            .opcion {
                position: relative;
            }
            
            .opcion input[type="radio"] {
                display: none;
            }
            
            .opcion label {
                display: block !important;
                padding: 15px !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border: 2px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                color: #ddd !important;
                font-size: 0.95rem !important;
                display: flex !important;
                align-items: center;
                gap: 12px;
            }
            
            .opcion label:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                border-color: rgba(0, 210, 190, 0.3) !important;
            }
            
            .opcion input[type="radio"]:checked + label {
                background: rgba(0, 210, 190, 0.15) !important;
                border-color: #00d2be !important;
                color: white !important;
                box-shadow: 0 0 15px rgba(0, 210, 190, 0.3) !important;
            }
            
            .opcion label strong {
                color: #00d2be !important;
                font-size: 1.1rem !important;
                min-width: 25px;
            }
            
            /* Badges - mantiene clase .badge */
            .badge {
                padding: 6px 12px !important;
                border-radius: 20px !important;
                font-size: 0.8rem !important;
                font-weight: bold !important;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .bg-success {
                background: linear-gradient(90deg, #00d2be, #0066cc) !important;
            }
            
            .bg-danger {
                background: linear-gradient(90deg, #e10600, #ff6b00) !important;
            }
            
            .bg-warning {
                background: linear-gradient(90deg, #ffb400, #ff6b00) !important;
            }
            
            .bg-info {
                background: linear-gradient(90deg, #0066cc, #0099ff) !important;
            }
            
            .bg-secondary {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #aaa !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            /* Tablas - mantiene clase .table */
            .table {
                background: rgba(20, 20, 40, 0.8) !important;
                border-radius: 10px !important;
                overflow: hidden !important;
                margin: 20px 0 !important;
                border-collapse: separate !important;
                border-spacing: 0 !important;
            }
            
            .table thead {
                background: linear-gradient(90deg, #00d2be 0%, #0066cc 100%) !important;
            }
            
            .table th {
                padding: 15px !important;
                color: white !important;
                font-weight: 600 !important;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 0.85rem !important;
            }
            
            .table tbody tr {
                border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                transition: background 0.3s ease !important;
            }
            
            .table tbody tr:hover {
                background: rgba(0, 210, 190, 0.1) !important;
            }
            
            .table td {
                padding: 15px !important;
                color: #ddd !important;
                vertical-align: middle !important;
            }
            
            .table-success {
                background: rgba(0, 210, 190, 0.15) !important;
            }
            
            .table-danger {
                background: rgba(225, 6, 0, 0.15) !important;
            }
            
            /* Alertas - mantiene clase .alert */
            .alert {
                background: rgba(255, 255, 255, 0.08) !important;
                border: 2px solid !important;
                border-radius: 10px !important;
                padding: 15px 20px !important;
                margin: 15px 0 !important;
                display: flex !important;
                align-items: center;
                gap: 12px;
                font-size: 0.95rem !important;
            }
            
            .alert-success {
                border-color: #00d2be !important;
                background: rgba(0, 210, 190, 0.1) !important;
                color: #00d2be !important;
            }
            
            .alert-danger {
                border-color: #e10600 !important;
                background: rgba(225, 6, 0, 0.1) !important;
                color: #ff6b6b !important;
            }
            
            .alert-warning {
                border-color: #ffb400 !important;
                background: rgba(255, 180, 0, 0.1) !important;
                color: #ffd166 !important;
            }
            
            .alert-info {
                border-color: #0066cc !important;
                background: rgba(0, 102, 204, 0.1) !important;
                color: #66b3ff !important;
            }
            
            /* Tarjetas de estadísticas - mantiene .stat-card */
            .stat-card {
                background: rgba(30, 30, 50, 0.7) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                text-align: center !important;
                border: 1px solid rgba(0, 210, 190, 0.2) !important;
                transition: all 0.3s ease !important;
            }
            
            .stat-card:hover {
                transform: translateY(-3px);
                border-color: #00d2be !important;
                box-shadow: 0 8px 20px rgba(0, 210, 190, 0.2) !important;
            }
            
            .stat-value {
                font-size: 2.2rem !important;
                font-weight: 700 !important;
                background: linear-gradient(90deg, #00d2be, #0066cc) !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
                margin: 10px 0 !important;
                font-family: 'Orbitron', sans-serif !important;
            }
            
            /* Estrategas - mantiene .estratega-card */
            .estratega-card {
                background: rgba(40, 40, 60, 0.7) !important;
                border-radius: 10px !important;
                padding: 15px !important;
                margin-bottom: 10px !important;
                border-left: 4px solid #00d2be !important;
                transition: all 0.3s ease !important;
            }
            
            .estratega-card:hover {
                background: rgba(50, 50, 70, 0.8) !important;
                transform: translateX(5px);
            }
            
            /* Grids - mantiene tus clases row y col-* */
            .row {
                margin: 0 -10px !important;
            }
            
            .col-md-3, .col-md-4, .col-md-6 {
                padding: 0 10px !important;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .row {
                    flex-direction: column !important;
                }
                
                .col-md-3, .col-md-4, .col-md-6 {
                    margin-bottom: 15px !important;
                }
                
                .card-header h4 {
                    font-size: 1.1rem !important;
                }
                
                .btn {
                    padding: 10px 18px !important;
                    font-size: 0.85rem !important;
                }
            }
            
            /* Scrollbar personalizado */
            .pronostico-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .pronostico-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .pronostico-container::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #00d2be, #0066cc);
                border-radius: 4px;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'estilos-pronosticos-f1';
        style.textContent = estilos;
        document.head.appendChild(style);
    }


    
    async inicializar(usuarioId) {
        console.log("📊 Inicializando PronosticosManager");
        await this.verificarNotificaciones();
        return true;
    }
    
    async cargarPantallaPronostico() {
        console.log("Cargando pantalla de pronósticos...");
        
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active') ||
                         document.querySelector('.pronosticos-container');
        
        if (!container) {
            console.error("No se encontró contenedor para pronósticos");
            return;
        }
        
        container.innerHTML = '<div class="cargando"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
        
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) {
            this.mostrarError("Debes iniciar sesión para hacer pronósticos", container);
            return;
        }
        
        // 🔴 **PRIMERO:** Cargar datos del usuario (esto establece this.escuderiaId)
        await this.cargarDatosUsuario(user.id);
        
        if (!this.escuderiaId) {
            this.mostrarError("No se pudo obtener tu escudería", container);
            return;
        }
        
        // 🔴 **SEGUNDO:** Obtener carrera activa
        const hoy = new Date();
        const fechaHoy = hoy.toISOString().split('T')[0];
        
        const { data: carreras, error } = await this.supabase
            .from('calendario_gp')
            .select('*')
            .gte('fecha_inicio', fechaHoy)
            .order('fecha_inicio', { ascending: true })
            .limit(1);
        
        if (error || !carreras || carreras.length === 0) {
            this.mostrarError("No hay carreras próximas disponibles", container);
            return;
        }
        
        this.carreraActual = carreras[0];
        
        // 🔴 **TERCERO:** Verificar fecha límite
        const fechaLimite = new Date(this.carreraActual.fecha_limite_pronosticos || this.carreraActual.fecha_inicio);
        fechaLimite.setHours(fechaLimite.getHours() - 48);
        
        if (hoy > fechaLimite) {
            this.mostrarError("El plazo para pronósticos ha expirado (48 horas antes de la carrera)", container);
            return;
        }
        
        // 🔴 **CUARTO:** Ahora sí verificar pronóstico existente (this.escuderiaId ya está definido)
        const { data: pronosticos, error: errorPronosticos } = await this.supabase
            .from('pronosticos_usuario')
            .select('id')
            .eq('escuderia_id', this.escuderiaId)
            .eq('carrera_id', this.carreraActual.id);
        
        if (errorPronosticos) {
            console.error("❌ Error verificando pronóstico:", errorPronosticos);
            this.pronosticoGuardado = false;
        } else {
            this.pronosticoGuardado = pronosticos && pronosticos.length > 0;
        }
        

        
        // 🔴 **QUINTO:** Obtener preguntas de la carrera
        await this.cargarPreguntasCarrera(this.carreraActual.id);
        
        // 🔴 **SEXTO:** Mostrar interfaz
        this.mostrarInterfazPronostico(container);
    }
    
    async cargarPreguntasCarrera(carreraId) {
        const { data, error } = await this.supabase
            .from('preguntas_pronostico')
            .select('*')
            .eq('carrera_id', carreraId)
            .order('numero_pregunta', { ascending: true });
        
        if (error) {
            console.error("Error cargando preguntas:", error);
            this.preguntasActuales = this.generarPreguntasDefault();
        } else {
            this.preguntasActuales = data;
        }
    }
    
    async cargarDatosUsuario(usuarioId) {
        try {
            console.log("🔍 Cargando datos para usuario:", usuarioId);
            
            // 1. Obtener la ESCUDERÍA del usuario
            const { data: escuderia, error: errorEscuderia } = await this.supabase
                .from('escuderias')
                .select('id, puntos, dinero')
                .eq('user_id', usuarioId)
                .single();
            
            if (errorEscuderia || !escuderia) {
                console.error("❌ Error obteniendo escudería:", errorEscuderia);
                this.usuarioPuntos = 0;
                this.estrategasActivos = [];
                this.escuderiaId = null;
                return;
            }
            
            console.log("✅ Escudería encontrada:", escuderia);
            this.escuderiaId = escuderia.id;
            
            // 2. Usar los PUNTOS DIRECTAMENTE de la escudería (ya están bien calculados)
            this.usuarioPuntos = escuderia.puntos || 0;
            console.log("✅ Puntos de escudería:", this.usuarioPuntos);
            
            // 3. Obtener estrategas contratados
            const { data: estrategas, error: errorEstrategas } = await this.supabase
                .from('ingenieros_contratados')
                .select(`
                    id,
                    ingeniero_id,
                    nombre,
                    especialidad,
                    bonificacion_tipo,
                    bonificacion_valor,
                    activo
                `)
                .eq('escuderia_id', escuderia.id)
                .eq('activo', true);
            
            if (errorEstrategas) {
                console.error("❌ Error obteniendo estrategas:", errorEstrategas);
                this.estrategasActivos = [];
            } else {
                this.estrategasActivos = estrategas.map(e => ({
                    ingeniero_id: e.ingeniero_id,
                    nombre: e.nombre,
                    especialidad: e.especialidad,
                    bonificacion_tipo: e.bonificacion_tipo,
                    bonificacion_valor: e.bonificacion_valor,
                    activo: e.activo
                }));
                console.log("✅ Estrategas encontrados:", this.estrategasActivos.length);
            }
            
            console.log("📊 Datos finales:", {
                escuderiaId: this.escuderiaId,
                puntos: this.usuarioPuntos,
                estrategasCount: this.estrategasActivos.length
            });
            
        } catch (error) {
            console.error("💥 Error completo en cargarDatosUsuario:", error);
            this.usuarioPuntos = 0;
            this.estrategasActivos = [];
            this.escuderiaId = null;
        }
    }
    
    mostrarInterfazPronostico(container) {
        if (this.pronosticoGuardado) {
            container.innerHTML = `
                <div class="pronostico-container">
                    <h2><i class="fas fa-flag-checkered"></i> Pronóstico para ${this.carreraActual.nombre}</h2>
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i> 
                        <strong>¡Ya has enviado tu pronóstico!</strong>
                        <p>Puedes revisar tus respuestas y esperar los resultados.</p>
                        <button class="btn btn-info mt-2" onclick="window.pronosticosManager.verPronosticoGuardado()">
                            Ver mi pronóstico
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        const fechaCarrera = new Date(this.carreraActual.fecha_inicio);
        fechaCarrera.setHours(fechaCarrera.getHours() + 24);
        const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let estrategasHTML = '<p class="text-muted">No tienes estrategas contratados</p>';
        if (this.estrategasActivos.length > 0) {
            estrategasHTML = this.estrategasActivos.map(e => `
                <div class="estratega-card">
                    <strong>${e.nombre || 'Estratega'}</strong>  // ← USA e.nombre directo
                    <small class="text-muted">${e.especialidad || 'Sin especialidad'}</small>
                    <div class="bonificaciones">
                        ${e.bonificacion_valor > 0 ? 
                            `<span class="badge bg-info">${e.bonificacion_tipo || 'Bonificación'}: +${e.bonificacion_valor}%</span>` : 
                            '<span class="badge bg-secondary">Sin bonificación</span>'}
                    </div>
                </div>
            `).join('');
        }
        
        let preguntasHTML = '';
        this.preguntasActuales.forEach((pregunta, index) => {
            const area = this.preguntaAreas[index + 1] || 'general';
            preguntasHTML += `
                <div class="pregunta-card" data-area="${area}">
                    <h5>Pregunta ${index + 1}: ${pregunta.texto_pregunta}</h5>
                    <div class="opciones">
                        <div class="opcion">
                            <input type="radio" 
                                   id="p${index}_a" 
                                   name="p${index}" 
                                   value="A"
                                   required>
                            <label for="p${index}_a">
                                <strong>A)</strong> ${pregunta.opcion_a}
                            </label>
                        </div>
                        <div class="opcion">
                            <input type="radio" 
                                   id="p${index}_b" 
                                   name="p${index}" 
                                   value="B">
                            <label for="p${index}_b">
                                <strong>B)</strong> ${pregunta.opcion_b}
                            </label>
                        </div>
                        <div class="opcion">
                            <input type="radio" 
                                   id="p${index}_c" 
                                   name="p${index}" 
                                   value="C">
                            <label for="p${index}_c">
                                <strong>C)</strong> ${pregunta.opcion_c}
                            </label>
                        </div>
                    </div>
                    <div class="area-indicator">
                        <span class="badge bg-secondary">${area.toUpperCase()}</span>
                        ${this.calcularBonificacionArea(area) > 0 ? 
                            `<span class="bonificacion-text">
                                <i class="fas fa-chart-line"></i> 
                                Bonificación: +${this.calcularBonificacionArea(area)}%
                            </span>` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = `
            <div class="pronosticos-container-f1">
                <div class="f1-card">
                    <div class="f1-card-header">
                        <i class="fas fa-info-circle"></i>
                        <h4>INFORMACIÓN IMPORTANTE</h4>
                    </div>
                    <div class="card-body">
                        <p>Al enviar tu pronóstico, se registrará un <strong>snapshot</strong> de:</p>
                        
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <div class="stat-card">
                                    <h6><i class="fas fa-car"></i> Puntos actuales del coche</h6>
                                    <div class="stat-value">${this.usuarioPuntos} puntos</div>
                                    <small class="text-muted">Estos puntos se sumarán a tu puntuación final</small>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="stat-card">
                                    <h6><i class="fas fa-users"></i> Estrategas activos</h6>
                                    <div class="estrategas-list">
                                        ${estrategasHTML}
                                    </div>
                                    <small class="text-muted">Sus bonificaciones se aplicarán a preguntas de su especialidad</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-warning mt-3">
                            <i class="fas fa-clock"></i>
                            <strong>Fecha estimada de resultados:</strong> 
                            ${fechaResultados} (aprox. 24h después de la carrera)
                        </div>
                    </div>
                </div>
                
                <form id="formPronostico" onsubmit="event.preventDefault(); window.pronosticosManager.guardarPronostico();">
                    <div class="card">
                        <div class="card-header bg-dark text-white">
                            <h4><i class="fas fa-bullseye"></i> Pronóstico - ${this.carreraActual.nombre}</h4>
                        </div>
                        <div class="card-body">
                            ${preguntasHTML}
                            
                            <div class="mt-4">
                                <button type="submit" class="btn btn-success btn-lg">
                                    <i class="fas fa-paper-plane"></i> Enviar pronóstico
                                </button>
                                <button type="button" class="btn btn-outline-secondary" onclick="window.tabManager.switchTab('principal')">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }
    
    async guardarPronostico() {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return;
        
        const respuestas = {};
        let completado = true;
        
        for (let i = 0; i < 10; i++) {
            const respuesta = document.querySelector(`input[name="p${i}"]:checked`);
            if (!respuesta) {
                completado = false;
                break;
            }
            respuestas[`p${i + 1}`] = respuesta.value;
        }
        
        if (!completado) {
            this.mostrarError("Debes responder todas las preguntas");
            return;
        }
        
        const snapshotEstrategas = this.estrategasActivos.map(e => ({
            ingeniero_id: e.ingeniero_id,
            nombre: e.nombre,
            especialidad: e.especialidad,
            bonificacion_tipo: e.bonificacion_tipo,
            bonificacion_valor: e.bonificacion_valor
        }));
        
        try {
            const { data, error } = await this.supabase
                .from('pronosticos_usuario')
                .insert([{
                    escuderia_id: this.escuderiaId,  // ← Usar this.escuderiaId
                    usuario_id: user.id,  // ← También guardar user_id por si acaso
                    carrera_id: this.carreraActual.id,
                    respuestas: respuestas,
                    puntos_coche_snapshot: this.usuarioPuntos,
                    estrategas_snapshot: snapshotEstrategas,
                    fecha_pronostico: new Date().toISOString(),
                    estado: 'pendiente'
                }]);
            
            if (error) throw error;
            
            this.mostrarConfirmacion(`
                <h4><i class="fas fa-check-circle text-success"></i> ¡Pronóstico enviado!</h4>
                <p>Tu pronóstico para <strong>${this.carreraActual.nombre}</strong> ha sido registrado correctamente.</p>
                <p>Recibirás una notificación cuando los resultados estén disponibles.</p>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="window.pronosticosManager.cargarPantallaPronostico()">
                        Aceptar
                    </button>
                </div>
            `);
            
            this.pronosticoGuardado = true;
            
        } catch (error) {
            console.error("Error guardando pronóstico:", error);
            this.mostrarError("Error al guardar el pronóstico. Inténtalo de nuevo.");
        }
    }
    
    async cargarResultadosCarrera(carreraId = null) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return;
        
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active');
        
        if (!carreraId) {
            const { data: carrera } = await this.supabase
                .from('calendario_gp')
                .select('id, nombre')
                .lt('fecha_inicio', new Date().toISOString())
                .order('fecha_inicio', { ascending: false })
                .limit(1)
                .single();
            
            if (carrera) carreraId = carrera.id;
        }
        
        if (!carreraId) {
            this.mostrarError("No hay resultados disponibles", container);
            return;
        }
        
        const { data: resultados, error: errorResultados } = await this.supabase
            .from('pronosticos_usuario')
            .select(`
                *,
                carreras:calendario_gp(nombre),
                resultados_carrera(respuestas_correctas)
            `)
            .eq('escuderia_id', this.escuderiaId)
            .eq('carrera_id', carreraId);
        
        if (errorResultados || !resultados || resultados.length === 0) {
            this.mostrarError("No hay resultados disponibles");
            return;
        }
        
        const resultado = resultados[0];  // ← Tomar el primero;
        
        if (!resultado || resultado.estado !== 'calificado') {
            this.mostrarError("Los resultados no están disponibles aún", container);
            return;
        }
        
        const { data: preguntas } = await this.supabase
            .from('preguntas_pronostico')
            .select('*')
            .eq('carrera_id', carreraId)
            .order('numero_pregunta', { ascending: true });
        
        this.mostrarDesgloseResultados(resultado, preguntas);
    }
    
    mostrarDesgloseResultados(resultado, preguntas) {
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active');
        
        const respuestasUsuario = resultado.respuestas;
        const respuestasCorrectas = resultado.resultados_carrera?.respuestas_correctas || {};
        const estrategas = resultado.estrategas_snapshot || [];
        
        let aciertos = 0;
        let puntosPorAciertos = 0;
        let bonificacionesAplicadas = [];
        
        let desgloseHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const pregunta = preguntas.find(p => p.numero_pregunta === i);
            const respuestaUsuario = respuestasUsuario[`p${i}`];
            const respuestaCorrecta = respuestasCorrectas[`p${i}`];
            const esCorrecta = respuestaUsuario === respuestaCorrecta;
            const area = this.preguntaAreas[i] || 'general';
            
            if (esCorrecta) {
                aciertos++;
                let puntosPregunta = 100;
                
                let bonificacionTotal = this.calcularBonificacionArea(area, estrategas);
                if (bonificacionTotal > 0) {
                    puntosPregunta += puntosPregunta * (bonificacionTotal / 100);
                    bonificacionesAplicadas.push({
                        pregunta: i,
                        area: area,
                        bonificacion: bonificacionTotal
                    });
                }
                
                puntosPorAciertos += puntosPregunta;
            }
            
            desgloseHTML += `
                <tr class="${esCorrecta ? 'table-success' : 'table-danger'}">
                    <td>${i}</td>
                    <td>${pregunta?.texto_pregunta || 'Pregunta ' + i}</td>
                    <td>
                        <span class="badge ${respuestaUsuario === 'A' ? 'bg-primary' : 'bg-secondary'}">
                            ${respuestaUsuario}: ${pregunta?.[`opcion_${respuestaUsuario?.toLowerCase()}`] || ''}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${respuestaCorrecta === 'A' ? 'bg-primary' : 'bg-secondary'}">
                            ${respuestaCorrecta}: ${pregunta?.[`opcion_${respuestaCorrecta?.toLowerCase()}`] || ''}
                        </span>
                    </td>
                    <td>
                        ${esCorrecta ? 
                            `<span class="badge bg-success">
                                <i class="fas fa-check"></i> Correcto
                            </span>` : 
                            `<span class="badge bg-danger">
                                <i class="fas fa-times"></i> Incorrecto
                            </span>`
                        }
                    </td>
                    <td>${area}</td>
                </tr>
            `;
        }
        
        const puntosTotales = resultado.puntos_coche_snapshot + puntosPorAciertos;
        const dineroGanado = this.calcularDinero(puntosTotales);
        
        container.innerHTML = `
            <div class="resultados-container">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h4><i class="fas fa-chart-bar"></i> Resultados - ${resultado.carreras?.nombre || 'Carrera'}</h4>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <div class="stat-card text-center">
                                    <h6>Aciertos</h6>
                                    <div class="stat-value text-primary">${aciertos}/10</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card text-center">
                                    <h6>Puntos coche</h6>
                                    <div class="stat-value text-success">${resultado.puntos_coche_snapshot}</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card text-center">
                                    <h6>Puntos pronóstico</h6>
                                    <div class="stat-value text-warning">${Math.round(puntosPorAciertos)}</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card text-center">
                                    <h6>TOTAL</h6>
                                    <div class="stat-value text-danger">${Math.round(puntosTotales)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <h5><i class="fas fa-list-alt"></i> Desglose por pregunta</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Pregunta</th>
                                        <th>Tu respuesta</th>
                                        <th>Respuesta correcta</th>
                                        <th>Resultado</th>
                                        <th>Área</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${desgloseHTML}
                                </tbody>
                            </table>
                        </div>
                        
                        ${bonificacionesAplicadas.length > 0 ? `
                            <div class="bonificaciones-card mt-4">
                                <h5><i class="fas fa-star"></i> Bonificaciones aplicadas</h5>
                                <div class="row">
                                    ${bonificacionesAplicadas.map(b => `
                                        <div class="col-md-4 mb-2">
                                            <div class="bonificacion-item">
                                                <small>Pregunta ${b.pregunta}</small><br>
                                                <strong>${b.area.toUpperCase()}: +${b.bonificacion}%</strong>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="calculo-final card mt-4">
                            <div class="card-body">
                                <h5><i class="fas fa-calculator"></i> Cálculo final</h5>
                                <div class="calculos">
                                    <div class="calculo-linea">
                                        <span>Puntos base del coche:</span>
                                        <span class="valor">${resultado.puntos_coche_snapshot}</span>
                                    </div>
                                    <div class="calculo-linea">
                                        <span>Puntos por aciertos (${aciertos} × 100):</span>
                                        <span class="valor">${aciertos * 100}</span>
                                    </div>
                                    ${bonificacionesAplicadas.length > 0 ? `
                                        <div class="calculo-linea">
                                            <span>Bonificaciones de estrategas:</span>
                                            <span class="valor text-success">+${Math.round(puntosPorAciertos - (aciertos * 100))}</span>
                                        </div>
                                    ` : ''}
                                    <div class="calculo-linea total">
                                        <span><strong>TOTAL PUNTOS:</strong></span>
                                        <span class="valor"><strong>${Math.round(puntosTotales)}</strong></span>
                                    </div>
                                    <div class="calculo-linea conversion">
                                        <span><strong>Conversión a dinero (1 punto = $10):</strong></span>
                                        <span class="valor text-success"><strong>$${dineroGanado}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <button class="btn btn-primary" onclick="window.pronosticosManager.actualizarDineroEscuderia(${dineroGanado})">
                                <i class="fas fa-money-bill-wave"></i> Añadir dinero a mi escudería
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    calcularBonificacionArea(area, estrategas = this.estrategasActivos) {
        let bonificacion = 0;
        
        // Mapeo de áreas a tipos de bonificación
        const mapeoAreas = {
            'meteorologia': 'meteorologia',
            'fiabilidad': 'fiabilidad', 
            'estrategia': 'estrategia',
            'rendimiento': 'rendimiento',
            'neumaticos': 'neumaticos',
            'seguridad': 'seguridad',
            'clasificacion': 'clasificacion',
            'carrera': 'carrera',
            'overtakes': 'overtakes',
            'incidentes': 'incidentes'
        };
        
        const tipoBusqueda = mapeoAreas[area] || area;
        
        estrategas.forEach(e => {
            // Verificar si el estratega tiene bonificación para esta área
            if (e.bonificacion_tipo && e.bonificacion_tipo.toLowerCase().includes(tipoBusqueda.toLowerCase())) {
                bonificacion += e.bonificacion_valor || 0;
            }
        });
        
        return bonificacion;
    }
    
    calcularDinero(puntos) {
        const tasaConversion = 10;
        return Math.round(puntos * tasaConversion);
    }
    
    async verificarNotificaciones() {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return;
        
        const { data: notificaciones } = await this.supabase
            .from('notificaciones_usuarios')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('vista', false)
            .order('fecha_creacion', { ascending: false });
        
        if (notificaciones && notificaciones.length > 0) {
            this.mostrarBadgeNotificaciones(notificaciones.length);
        }
    }
    
    mostrarBadgeNotificaciones(cantidad) {
        const notificacionBadge = document.getElementById('notificacion-badge');
        if (notificacionBadge) {
            notificacionBadge.textContent = cantidad;
            notificacionBadge.style.display = 'inline-block';
        }
    }
    
    generarPreguntasDefault() {
        const preguntas = [];
        for (let i = 1; i <= 10; i++) {
            preguntas.push({
                numero_pregunta: i,
                texto_pregunta: `Pregunta ${i} - ¿Cuál será el resultado?`,
                opcion_a: "Opción A",
                opcion_b: "Opción B",
                opcion_c: "Opción C",
                area: this.preguntaAreas[i] || 'general'
            });
        }
        return preguntas;
    }
    
    mostrarError(mensaje, container = document.body) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${mensaje}
                <button class="btn btn-sm btn-outline-secondary mt-2" onclick="window.tabManager.switchTab('principal')">
                    Volver al inicio
                </button>
            </div>
        `;
    }
    
    mostrarConfirmacion(html) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                ${html}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    mostrarVistaPronosticoGuardado(pronostico, preguntas, respuestasCorrectas) {
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active') ||
                         document.querySelector('.pronosticos-container');
        
        if (!container) {
            console.error("No se encontró contenedor");
            return;
        }
        
        const respuestasUsuario = pronostico.respuestas;
        const estado = pronostico.estado;
        const tieneResultados = Object.keys(respuestasCorrectas).length > 0;
        
        let contenidoHTML = `
            <div class="pronostico-container">
                <div class="card">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h4><i class="fas fa-eye"></i> Mi Pronóstico - ${this.carreraActual?.nombre || 'Carrera'}</h4>
                        <span class="badge ${estado === 'pendiente' ? 'bg-warning' : 'bg-success'}">
                            ${estado === 'pendiente' ? '⏳ Pendiente' : '✅ Calificado'}
                        </span>
                    </div>
                    <div class="card-body">
        `;
        
        if (estado === 'pendiente') {
            contenidoHTML += `
                <div class="alert alert-info">
                    <i class="fas fa-clock"></i>
                    <strong>Estado:</strong> Tu pronóstico está pendiente de calificación.
                    <p class="mb-0">Los resultados estarán disponibles después de la carrera.</p>
                </div>
            `;
        } else if (estado === 'calificado') {
            contenidoHTML += `
                <div class="alert alert-success">
                    <i class="fas fa-chart-bar"></i>
                    <strong>¡Resultados disponibles!</strong>
                    <p class="mb-0">
                        <strong>Aciertos:</strong> ${pronostico.aciertos || 0}/10<br>
                        <strong>Puntuación total:</strong> ${pronostico.puntuacion_total || 0} puntos<br>
                        <strong>Dinero ganado:</strong> €${pronostico.dinero_ganado || 0}
                    </p>
                    <button class="btn btn-success btn-sm mt-2" 
                            onclick="window.pronosticosManager.verResultadosCompletos(${this.carreraActual?.id})">
                        <i class="fas fa-chart-line"></i> Ver desglose completo
                    </button>
                </div>
            `;
        }
        
        // Lista de preguntas con respuestas
        contenidoHTML += `
            <h5 class="mt-4"><i class="fas fa-list-ol"></i> Tus respuestas:</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Pregunta</th>
                            <th>Tu respuesta</th>
                            ${tieneResultados ? '<th>Respuesta correcta</th><th>Resultado</th>' : ''}
                            <th>Área</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let i = 1; i <= 10; i++) {
            const pregunta = preguntas.find(p => p.numero_pregunta === i);
            const respuestaUsuario = respuestasUsuario[`p${i}`];
            const respuestaCorrecta = respuestasCorrectas[`p${i}`];
            const area = this.preguntaAreas[i] || 'general';
            
            let opcionTexto = '';
            if (pregunta) {
                if (respuestaUsuario === 'A') opcionTexto = pregunta.opcion_a;
                else if (respuestaUsuario === 'B') opcionTexto = pregunta.opcion_b;
                else if (respuestaUsuario === 'C') opcionTexto = pregunta.opcion_c;
            }
            
            let filaHTML = `
                <tr>
                    <td>${i}</td>
                    <td>${pregunta?.texto_pregunta || 'Pregunta ' + i}</td>
                    <td>
                        <span class="badge bg-primary">
                            ${respuestaUsuario || 'No respondida'}: ${opcionTexto}
                        </span>
                    </td>
            `;
            
            if (tieneResultados) {
                const esCorrecta = respuestaUsuario === respuestaCorrecta;
                let opcionCorrectaTexto = '';
                if (pregunta && respuestaCorrecta) {
                    if (respuestaCorrecta === 'A') opcionCorrectaTexto = pregunta.opcion_a;
                    else if (respuestaCorrecta === 'B') opcionCorrectaTexto = pregunta.opcion_b;
                    else if (respuestaCorrecta === 'C') opcionCorrectaTexto = pregunta.opcion_c;
                }
                
                filaHTML += `
                    <td>
                        ${respuestaCorrecta ? 
                            `<span class="badge ${respuestaCorrecta === 'A' ? 'bg-info' : 'bg-secondary'}">
                                ${respuestaCorrecta}: ${opcionCorrectaTexto}
                            </span>` : 
                            '<span class="badge bg-secondary">No disponible</span>'
                        }
                    </td>
                    <td>
                        ${esCorrecta ? 
                            '<span class="badge bg-success"><i class="fas fa-check"></i> Acierto</span>' : 
                            '<span class="badge bg-danger"><i class="fas fa-times"></i> Fallo</span>'
                        }
                    </td>
                `;
            }
            
            filaHTML += `
                    <td><span class="badge bg-secondary">${area}</span></td>
                </tr>
            `;
            
            contenidoHTML += filaHTML;
        }
        
        contenidoHTML += `
                    </tbody>
                </table>
            </div>
            
            <!-- Información adicional -->
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6><i class="fas fa-car"></i> Snapshot del coche</h6>
                            <p class="mb-1"><strong>Puntos registrados:</strong> ${pronostico.puntos_coche_snapshot}</p>
                            <small class="text-muted">Estos puntos se sumarán a tu puntuación final</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6><i class="fas fa-users"></i> Estrategas registrados</h6>
                            <p class="mb-1"><strong>Cantidad:</strong> ${Array.isArray(pronostico.estrategas_snapshot) ? pronostico.estrategas_snapshot.length : 0}</p>
                            <small class="text-muted">Sus bonificaciones se aplicarán al cálculo final</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <button class="btn btn-outline-secondary" onclick="window.pronosticosManager.cargarPantallaPronostico()">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
                ${estado === 'calificado' ? `
                    <button class="btn btn-success" onclick="window.pronosticosManager.verResultadosCompletos(${this.carreraActual?.id})">
                        <i class="fas fa-chart-line"></i> Ver cálculo detallado
                    </button>
                ` : ''}
            </div>
        `;
        
        contenidoHTML += `
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = contenidoHTML;
    }

    async verResultadosCompletos(carreraId) {
        // Reutiliza tu función existente cargarResultadosCarrera
        await this.cargarResultadosCarrera(carreraId);
    }    
    
    async actualizarDineroEscuderia(cantidad) {
        const { data: { user } } = await this.supabase.auth.getUser();
        
        const { data: escuderia } = await this.supabase
            .from('escuderias')
            .select('dinero')
            .eq('usuario_id', user.id)
            .single();
        
        const nuevoDinero = (escuderia.dinero || 0) + cantidad;
        await this.supabase
            .from('escuderias')
            .update({ dinero: nuevoDinero })
            .eq('usuario_id', user.id);
        
        this.mostrarConfirmacion(`
            <h4><i class="fas fa-money-bill-wave text-success"></i> ¡Dinero actualizado!</h4>
            <p>Se han añadido <strong>$${cantidad}</strong> a tu escudería.</p>
            <p>Dinero total: <strong>$${nuevoDinero}</strong></p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">
                Aceptar
            </button>
        `);
    }
    
    async cargarPanelAdminPronosticos() {
        const { data: { user } } = await this.supabase.auth.getUser();
        
        const { data: perfil } = await this.supabase
            .from('perfiles_usuario')
            .select('rol')
            .eq('id', user.id)
            .single();
        
        if (perfil.rol !== 'admin') {
            this.mostrarError("No tienes permisos de administrador");
            return;
        }
        
        const { data: carreras } = await this.supabase
            .from('calendario_gp')
            .select('*')
            .order('fecha_inicio', { ascending: true });
        
        let carrerasHTML = '<option value="">Seleccionar carrera</option>';
        carreras.forEach(c => {
            carrerasHTML += `<option value="${c.id}">${c.nombre} - ${c.fecha_inicio}</option>`;
        });
        
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active');
        
        container.innerHTML = `
            <div class="admin-panel">
                <h3><i class="fas fa-cogs"></i> Panel de Administración - Pronósticos</h3>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-plus-circle"></i> Crear preguntas</h5>
                            </div>
                            <div class="card-body">
                                <form id="formCrearPreguntas" onsubmit="event.preventDefault(); window.pronosticosManager.crearPreguntasCarrera();">
                                    <div class="mb-3">
                                        <label>Carrera</label>
                                        <select id="carreraPreguntas" class="form-select" required>
                                            ${carrerasHTML}
                                        </select>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-plus"></i> Crear 10 preguntas
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-clipboard-check"></i> Ingresar resultados</h5>
                            </div>
                            <div class="card-body">
                                <form id="formResultados" onsubmit="event.preventDefault(); window.pronosticosManager.guardarResultadosCarrera();">
                                    <div class="mb-3">
                                        <label>Carrera</label>
                                        <select id="carreraResultados" class="form-select" required>
                                            ${carrerasHTML}
                                        </select>
                                    </div>
                                    
                                    <div id="formularioRespuestas" style="display: none;">
                                        <h6>Respuestas correctas:</h6>
                                        ${Array.from({length: 10}, (_, i) => `
                                            <div class="mb-2">
                                                <label>Pregunta ${i + 1}</label>
                                                <div class="btn-group" role="group">
                                                    <input type="radio" class="btn-check" name="p${i + 1}" value="A" id="r${i}a">
                                                    <label class="btn btn-outline-primary" for="r${i}a">A</label>
                                                    
                                                    <input type="radio" class="btn-check" name="p${i + 1}" value="B" id="r${i}b">
                                                    <label class="btn btn-outline-primary" for="r${i}b">B</label>
                                                    
                                                    <input type="radio" class="btn-check" name="p${i + 1}" value="C" id="r${i}c">
                                                    <label class="btn btn-outline-primary" for="r${i}c">C</label>
                                                </div>
                                            </div>
                                        `).join('')}
                                        
                                        <button type="submit" class="btn btn-success mt-3">
                                            <i class="fas fa-save"></i> Guardar resultados
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async crearPreguntasCarrera() {
        const carreraId = document.getElementById('carreraPreguntas').value;
        
        const preguntas = [];
        for (let i = 1; i <= 10; i++) {
            preguntas.push({
                carrera_id: carreraId,
                numero_pregunta: i,
                texto_pregunta: `Pregunta ${i} - Editar texto según la carrera`,
                opcion_a: "Opción A",
                opcion_b: "Opción B",
                opcion_c: "Opción C",
                area: this.preguntaAreas[i] || 'general'
            });
        }
        
        try {
            const { error } = await this.supabase
                .from('preguntas_pronostico')
                .insert(preguntas);
            
            if (error) throw error;
            
            this.mostrarConfirmacion(`
                <h4><i class="fas fa-check"></i> Preguntas creadas</h4>
                <p>Se han creado 10 preguntas para la carrera.</p>
                <p>Recuerda editarlas para personalizarlas.</p>
            `);
        } catch (error) {
            this.mostrarError("Error al crear preguntas");
        }
    }

    async verPronosticoGuardado() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                this.mostrarError("Debes iniciar sesión");
                return;
            }
            
            if (!this.carreraActual || !this.carreraActual.id) {
                await this.cargarPantallaPronostico(); // Recargar para obtener carrera
                return;
            }
            
            console.log("🔍 Buscando pronóstico guardado para carrera:", this.carreraActual.id);
            
            // Buscar el pronóstico del usuario para esta carrera
            const { data: pronosticos, error } = await this.supabase
                .from('pronosticos_usuario')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .eq('carrera_id', this.carreraActual.id)
                .maybeSingle(); // Usar maybeSingle en lugar de single
            
            if (error) {
                console.error("❌ Error buscando pronóstico:", error);
                this.mostrarError("Error al cargar tu pronóstico");
                return;
            }
            
            if (!pronosticos) {
                this.mostrarError("No se encontró tu pronóstico");
                return;
            }
            
            console.log("✅ Pronóstico encontrado:", pronosticos);
            
            // Obtener las preguntas de esta carrera
            const { data: preguntas, error: errorPreguntas } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', this.carreraActual.id)
                .order('numero_pregunta');
            
            if (errorPreguntas) {
                console.error("❌ Error cargando preguntas:", errorPreguntas);
                this.mostrarError("Error al cargar las preguntas");
                return;
            }
            
            // Obtener respuestas correctas (si ya existen)
            let respuestasCorrectas = {};
            if (pronosticos.estado === 'calificado') {
                const { data: resultados } = await this.supabase
                    .from('resultados_carrera')
                    .select('respuestas_correctas')
                    .eq('carrera_id', this.carreraActual.id)
                    .single();
                
                if (resultados) {
                    respuestasCorrectas = resultados.respuestas_correctas;
                }
            }
            
            // Mostrar la vista de pronóstico
            this.mostrarVistaPronosticoGuardado(pronosticos, preguntas, respuestasCorrectas);
            
        } catch (error) {
            console.error("💥 Error en verPronosticoGuardado:", error);
            this.mostrarError("Error inesperado al cargar el pronóstico");
        }
    }

    
    async guardarResultadosCarrera() {
        const carreraId = document.getElementById('carreraResultados').value;
        
        const respuestasCorrectas = {};
        for (let i = 1; i <= 10; i++) {
            const respuesta = document.querySelector(`input[name="p${i}"]:checked`);
            if (!respuesta) {
                this.mostrarError(`Debes seleccionar respuesta para pregunta ${i}`);
                return;
            }
            respuestasCorrectas[`p${i}`] = respuesta.value;
        }
        
        try {
            const { error } = await this.supabase
                .from('resultados_carrera')
                .insert([{
                    carrera_id: carreraId,
                    respuestas_correctas: respuestasCorrectas,
                    fecha_publicacion: new Date().toISOString()
                }]);
            
            if (error) throw error;
            
            await this.supabase
                .from('pronosticos_usuario')
                .update({ estado: 'calificado' })
                .eq('carrera_id', carreraId);
            
            await this.crearNotificacionesResultados(carreraId);
            
            this.mostrarConfirmacion(`
                <h4><i class="fas fa-check-circle"></i> Resultados guardados</h4>
                <p>Los resultados han sido publicados y los usuarios han sido notificados.</p>
                <p>Los pronósticos se están calificando automáticamente.</p>
            `);
            
        } catch (error) {
            this.mostrarError("Error al guardar resultados");
        }
    }
    
    async crearNotificacionesResultados(carreraId) {
        const { data: pronosticos } = await this.supabase
            .from('pronosticos_usuario')
            .select('usuario_id')
            .eq('carrera_id', carreraId);
        
        if (!pronosticos) return;
        
        const { data: carrera } = await this.supabase
            .from('calendario_gp')
            .select('nombre')
            .eq('id', carreraId)
            .single();
        
        const notificaciones = pronosticos.map(p => ({
            usuario_id: p.usuario_id,
            tipo: 'resultados',
            titulo: 'Resultados disponibles',
            mensaje: `Los resultados del GP ${carrera.nombre} están disponibles`,
            fecha_creacion: new Date().toISOString(),
            vista: false
        }));
        
        await this.supabase
            .from('notificaciones_usuarios')
            .insert(notificaciones);
    }
}

// Inicialización global
window.PronosticosManager = PronosticosManager;
if (!window.pronosticosManager) {
    window.pronosticosManager = new PronosticosManager();
    console.log('📊 PronosticosManager creado globalmente');
}

// Hacer el método principal disponible globalmente
window.cargarPantallaPronostico = function() {
    if (window.pronosticosManager) {
        return window.pronosticosManager.cargarPantallaPronostico();
    }
    return Promise.reject("pronosticosManager no disponible");
};

console.log("✅ Sistema de pronósticos listo");
