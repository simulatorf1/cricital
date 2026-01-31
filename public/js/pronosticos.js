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
        this.usuarioAceptoCondiciones = false; // <- Añade esto
        this.injectarEstilos();
    }
    injectarEstilos() {
        if (document.getElementById('estilos-pronosticos-f1')) return;
        
        const estilos = `
            /* ========== ESTILOS F1 SIMPLIFICADOS ========== */
            
            /* Contenedor principal - SIMPLE Y PEQUEÑO */
            .pronostico-container {
                padding: 8px;
                background: #0a0a0a;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
            }
            
            /* Tarjetas - MÍNIMAS */
            .card {
                background: #1a1a1a;
                border-radius: 4px;
                border: 1px solid #00d2be;
                margin-bottom: 8px;
                font-size: 11px;
            }
            
            /* Cabeceras de tarjetas */
            .card-header {
                background: #0066cc;
                padding: 4px 8px;
                color: white;
                border-bottom: 1px solid #00d2be;
                font-size: 11px;
            }
            
            .card-header h4 {
                margin: 0;
                font-size: 12px;
                font-weight: bold;
            }
            
            .card-body {
                padding: 8px;
                font-size: 11px;
            }
            
            /* Botones - PEQUEÑOS */
            .btn {
                border-radius: 3px;
                padding: 3px 6px;
                font-size: 10px;
                margin: 2px;
                border: 1px solid;
                cursor: pointer;
            }
            
            .btn-success {
                background: #00d2be;
                border-color: #00d2be;
                color: white;
            }
            
            .btn-primary {
                background: #e10600;
                border-color: #e10600;
                color: white;
            }
            
            .btn-outline-secondary {
                background: transparent;
                border-color: #666;
                color: #ccc;
            }
            
            /* Preguntas */
            .pregunta-card {
                background: #222;
                border-radius: 3px;
                padding: 6px;
                margin-bottom: 6px;
                border-left: 2px solid #00d2be;
                font-size: 11px;
            }
            
            .pregunta-card h5 {
                color: #00d2be;
                margin-bottom: 4px;
                font-size: 11px;
            }
            
            /* Opciones de respuesta */
            .opciones {
                display: grid;
                gap: 3px;
                margin-top: 4px;
            }
            
            .opcion {
                position: relative;
            }
            
            .opcion input[type="radio"] {
                display: none;
            }
            
            .opcion label {
                display: block;
                padding: 4px 6px;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 2px;
                cursor: pointer;
                color: #ddd;
                font-size: 10px;
            }
            
            .opcion input[type="radio"]:checked + label {
                background: #003333;
                border-color: #00d2be;
                color: white;
            }
            
            .opcion label strong {
                color: #00d2be;
                font-size: 10px;
                min-width: 15px;
            }
            
            /* Badges */
            .badge {
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: bold;
            }
            
            .bg-success {
                background: #00d2be;
            }
            
            .bg-danger {
                background: #e10600;
            }
            
            .bg-warning {
                background: #ffb400;
            }
            
            .bg-info {
                background: #0066cc;
            }
            
            .bg-secondary {
                background: #444;
                color: #aaa;
            }
            
            /* Tablas */
            .table {
                background: #1a1a1a;
                border-radius: 3px;
                margin: 4px 0;
                font-size: 10px;
                width: 100%;
            }
            
            .table thead {
                background: #0066cc;
            }
            
            .table th {
                padding: 3px;
                color: white;
                font-weight: bold;
                font-size: 10px;
            }
            
            .table td {
                padding: 3px;
                color: #ddd;
                font-size: 10px;
            }
            
            .table-success {
                background: rgba(0, 210, 190, 0.1);
            }
            
            .table-danger {
                background: rgba(225, 6, 0, 0.1);
            }
            
            /* Alertas */
            .alert {
                padding: 4px 6px;
                margin: 4px 0;
                border-radius: 3px;
                font-size: 10px;
                border: 1px solid;
            }
            
            .alert-success {
                border-color: #00d2be;
                background: rgba(0, 210, 190, 0.1);
                color: #00d2be;
            }
            
            .alert-danger {
                border-color: #e10600;
                background: rgba(225, 6, 0, 0.1);
                color: #ff6b6b;
            }
            
            .alert-warning {
                border-color: #ffb400;
                background: rgba(255, 180, 0, 0.1);
                color: #ffd166;
            }
            
            .alert-info {
                border-color: #0066cc;
                background: rgba(0, 102, 204, 0.1);
                color: #66b3ff;
            }
            
            /* Tarjetas de estadísticas */
            .stat-card {
                background: #222;
                border-radius: 3px;
                padding: 6px;
                text-align: center;
                border: 1px solid #444;
                font-size: 10px;
            }
            
            .stat-value {
                font-size: 14px;
                font-weight: bold;
                color: #00d2be;
                margin: 2px 0;
            }
            
            /* Estrategas */
            .estratega-card {
                background: #222;
                border-radius: 2px;
                padding: 4px;
                margin-bottom: 3px;
                border-left: 2px solid #00d2be;
                font-size: 10px;
            }
            
            /* Grids */
            .row {
                margin: 0 -2px;
            }
            
            .col-md-3, .col-md-4, .col-md-6 {
                padding: 0 2px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .pronostico-container {
                    padding: 4px;
                }
                
                .card-header {
                    padding: 3px 6px;
                }
                
                .card-body {
                    padding: 6px;
                }
                
                .btn {
                    padding: 2px 4px;
                    font-size: 9px;
                }
            }
            
            /* ESTILOS COMPACTOS ESPECIALES */
            .compacto .card {
                margin-bottom: 4px;
            }
            
            .compacto .card-header {
                padding: 3px 6px;
                font-size: 10px;
            }
            
            .compacto .card-header h4 {
                font-size: 11px;
            }
            
            .compacto .card-body {
                padding: 6px;
                font-size: 10px;
            }
            
            .compacto .pregunta-card {
                padding: 4px;
                margin-bottom: 4px;
                font-size: 10px;
            }
            
            .compacto .pregunta-card h5 {
                font-size: 10px;
                margin-bottom: 2px;
            }
            
            .compacto .opcion label {
                padding: 3px 4px;
                font-size: 9px;
            }
            
            .compacto .alert {
                padding: 3px 4px;
                margin: 3px 0;
                font-size: 9px;
            }
            
            .compacto .table {
                font-size: 9px;
            }
            
            .compacto .table th,
            .compacto .table td {
                padding: 2px;
            }
            
            .compacto .badge {
                padding: 1px 3px;
                font-size: 8px;
            }
            
            .compacto .stat-value-mini {
                font-size: 12px;
                color: #00d2be;
            }
            
            .compacto .btn-sm {
                padding: 2px 4px;
                font-size: 9px;
            }
            
            /* Tablas súper compactas */
            .table-sm th,
            .table-sm td {
                padding: 2px;
                font-size: 9px;
            }
            
            /* Espaciados mínimos */
            .mb-1 { margin-bottom: 0.1rem !important; }
            .mb-2 { margin-bottom: 0.2rem !important; }
            .mb-3 { margin-bottom: 0.3rem !important; }
            .mt-1 { margin-top: 0.1rem !important; }
            .mt-2 { margin-top: 0.2rem !important; }
            .mt-3 { margin-top: 0.3rem !important; }
            .pt-1 { padding-top: 0.1rem !important; }
            .pt-2 { padding-top: 0.2rem !important; }
            .pt-3 { padding-top: 0.3rem !important; }
            
            /* Grid compacto */
            .row.g-2 {
                margin: 0 -1px !important;
            }
            
            .row.g-2 > [class*="col-"] {
                padding: 0 1px !important;
            }
            
            /* Contenedor de estrategas mini */
            .estratega-mini {
                background: #222;
                border-radius: 2px;
                padding: 3px;
                margin-bottom: 2px;
                border-left: 1px solid #00d2be;
                font-size: 9px;
            }
            
            /* Texto de preguntas */
            .pregunta-texto small {
                font-size: 9px;
                color: #bbb;
            }
            
            .respuesta-usuario {
                font-size: 9px;
                color: #00d2be;
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
        // Reemplaza esta parte en mostrarInterfazPronostico:
        if (this.pronosticoGuardado) {
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <div class="card">
                        <div class="card-header bg-success text-white py-2">
                            <h5 class="mb-0"><i class="fas fa-check-circle"></i> Pronóstico enviado</h5>
                        </div>
                        <div class="card-body py-3">
                            <div class="alert alert-success alert-sm mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-check me-2"></i>
                                    <div>
                                        <strong class="d-block">${this.carreraActual.nombre}</strong>
                                        <small>Ya has enviado tu pronóstico</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row g-2 mb-3">
                                <div class="col-6">
                                    <div class="stat-card-sm text-center p-2">
                                        <small class="d-block text-muted">Estado</small>
                                        <span class="badge bg-warning">Pendiente</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="stat-card-sm text-center p-2">
                                        <small class="d-block text-muted">Resultados</small>
                                        <span class="text-info">Próximamente</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="window.pronosticosManager.verPronosticoGuardado()">
                                    <i class="fas fa-eye"></i> Ver mi pronóstico
                                </button>
                                <button class="btn btn-outline-secondary btn-sm" onclick="window.tabManager.switchTab('principal')">
                                    <i class="fas fa-home"></i> Volver al inicio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        if (!this.usuarioAceptoCondiciones) {
            this.mostrarCondicionesIniciales(container);
            return;
        }
        
        this.mostrarPreguntasPronostico(container);
    }
    
    mostrarCondicionesIniciales(container) {
        const fechaCarrera = new Date(this.carreraActual.fecha_inicio);
        fechaCarrera.setHours(fechaCarrera.getHours() + 24);
        const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let estrategasHTML = '<p class="text-muted mb-0">No tienes estrategas contratados</p>';
        if (this.estrategasActivos.length > 0) {
            estrategasHTML = `
                <div class="estrategas-mini-list">
                    ${this.estrategasActivos.map(e => `
                        <div class="estratega-mini">
                            <strong>${e.nombre || 'Estratega'}</strong>
                            <small class="text-muted d-block">${e.especialidad || 'Sin especialidad'}</small>
                            ${e.bonificacion_valor > 0 ? 
                                `<span class="badge bg-info badge-sm">+${e.bonificacion_valor}%</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="pronosticos-container-f1 compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2">
                        <h5 class="mb-0"><i class="fas fa-flag-checkered"></i> Pronóstico - ${this.carreraActual.nombre}</h5>
                    </div>
                    <div class="card-body py-3">
                        <h6 class="text-warning mb-3"><i class="fas fa-info-circle"></i> Datos que se guardarán:</h6>
                        
                        <div class="table-responsive mb-3">
                            <table class="table table-sm table-dark">
                                <thead class="bg-secondary">
                                    <tr>
                                        <th width="25%">Puntos coche</th>
                                        <th width="25%">Estrategas activos</th>
                                        <th width="25%">Fecha captura</th>
                                        <th width="25%">Resultados</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">
                                            <div class="stat-value-mini">${this.usuarioPuntos}</div>
                                            <small class="text-muted">puntos actuales</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="stat-value-mini">${this.estrategasActivos.length}</div>
                                            <small class="text-muted">estrategas</small>
                                            ${this.estrategasActivos.length > 0 ? '<div class="mt-1"><small>Ver abajo</small></div>' : ''}
                                        </td>
                                        <td class="text-center">
                                            <div class="fecha-actual">${new Date().toLocaleDateString('es-ES')}</div>
                                            <small class="text-muted">Hoy</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="text-info">${fechaResultados.split(' ')[0]}</div>
                                            <small class="text-muted">aprox.</small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        ${this.estrategasActivos.length > 0 ? `
                            <div class="estrategas-detalle mb-3">
                                <h6 class="text-info mb-2"><i class="fas fa-users"></i> Tus estrategas:</h6>
                                ${estrategasHTML}
                            </div>
                        ` : ''}
                        
                        <div class="alert alert-warning alert-sm py-2 mb-3">
                            <i class="fas fa-clock"></i>
                            <small>
                                <strong>Importante:</strong> Cuanto más tarde hagas el pronóstico, más puntos tendrás, ya que se guardarán los puntos de <strong>hoy</strong> (${new Date().toLocaleDateString('es-ES')}), no los del día de la carrera.
                            </small>
                        </div>
                        
                        <div class="condiciones-acepto mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="aceptoCondiciones">
                                <label class="form-check-label small" for="aceptoCondiciones">
                                    Entiendo que estos datos se guardarán y se tendrán en cuenta para el cálculo final
                                </label>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-success btn-sm flex-grow-1" onclick="window.pronosticosManager.iniciarPronostico()">
                                <i class="fas fa-play"></i> Empezar pronóstico
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.tabManager.switchTab('principal')">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    mostrarPreguntasPronostico(container) {
        let preguntasHTML = '';
        this.preguntasActuales.forEach((pregunta, index) => {
            const area = this.preguntaAreas[index + 1] || 'general';
            preguntasHTML += `
                <div class="pregunta-card compacto" data-area="${area}">
                    <h6 class="mb-2"><span class="badge bg-dark me-2">${index + 1}</span> ${pregunta.texto_pregunta}</h6>
                    <div class="opciones compacto">
                        <div class="opcion compacto">
                            <input type="radio" 
                                   id="p${index}_a" 
                                   name="p${index}" 
                                   value="A"
                                   required>
                            <label for="p${index}_a">
                                <strong>A)</strong> ${pregunta.opcion_a}
                            </label>
                        </div>
                        <div class="opcion compacto">
                            <input type="radio" 
                                   id="p${index}_b" 
                                   name="p${index}" 
                                   value="B">
                            <label for="p${index}_b">
                                <strong>B)</strong> ${pregunta.opcion_b}
                            </label>
                        </div>
                        <div class="opcion compacto">
                            <input type="radio" 
                                   id="p${index}_c" 
                                   name="p${index}" 
                                   value="C">
                            <label for="p${index}_c">
                                <strong>C)</strong> ${pregunta.opcion_c}
                            </label>
                        </div>
                    </div>
                    <div class="area-indicator mt-2">
                        <span class="badge bg-secondary badge-sm">${area.toUpperCase()}</span>
                        ${this.calcularBonificacionArea(area) > 0 ? 
                            `<span class="bonificacion-text small">
                                <i class="fas fa-chart-line"></i> +${this.calcularBonificacionArea(area)}%
                            </span>` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = `
            <div class="pronosticos-container-f1 compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-bullseye"></i> ${this.carreraActual.nombre}</h5>
                        <button class="btn btn-outline-light btn-sm" onclick="window.pronosticosManager.usuarioAceptoCondiciones = false; window.pronosticosManager.mostrarInterfazPronostico(this.parentElement.parentElement.parentElement);">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                    <div class="card-body py-3">
                        <div class="preguntas-container">
                            ${preguntasHTML}
                        </div>
                        
                        <div class="mt-3 pt-3 border-top">
                            <button type="button" class="btn btn-success btn-sm" onclick="window.pronosticosManager.guardarPronostico()">
                                <i class="fas fa-paper-plane"></i> Enviar pronóstico
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.pronosticosManager.usuarioAceptoCondiciones = false; window.pronosticosManager.mostrarInterfazPronostico(this.parentElement.parentElement.parentElement);">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    iniciarPronostico() {
        const aceptoCheckbox = document.getElementById('aceptoCondiciones');
        if (!aceptoCheckbox || !aceptoCheckbox.checked) {
            this.mostrarError("Debes aceptar las condiciones primero");
            return;
        }
        
        this.usuarioAceptoCondiciones = true;
        
        const container = document.querySelector('.pronosticos-container-f1')?.parentElement || 
                         document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active');
        
        if (container) {
            this.mostrarInterfazPronostico(container);
        }
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
            
            // Texto corto de las opciones
            let opcionUsuarioTexto = '';
            let opcionCorrectaTexto = '';
            
            if (pregunta) {
                if (respuestaUsuario === 'A') opcionUsuarioTexto = pregunta.opcion_a.substring(0, 30);
                else if (respuestaUsuario === 'B') opcionUsuarioTexto = pregunta.opcion_b.substring(0, 30);
                else if (respuestaUsuario === 'C') opcionUsuarioTexto = pregunta.opcion_c.substring(0, 30);
                
                if (respuestaCorrecta === 'A') opcionCorrectaTexto = pregunta.opcion_a.substring(0, 30);
                else if (respuestaCorrecta === 'B') opcionCorrectaTexto = pregunta.opcion_b.substring(0, 30);
                else if (respuestaCorrecta === 'C') opcionCorrectaTexto = pregunta.opcion_c.substring(0, 30);
            }
            
            if (opcionUsuarioTexto.length > 30) opcionUsuarioTexto += '...';
            if (opcionCorrectaTexto.length > 30) opcionCorrectaTexto += '...';
            
            desgloseHTML += `
                <tr class="${esCorrecta ? 'table-success' : 'table-danger'}">
                    <td width="5%"><strong>${i}</strong></td>
                    <td width="45%"><small>${pregunta?.texto_pregunta?.substring(0, 60) || 'Pregunta ' + i}${pregunta?.texto_pregunta?.length > 60 ? '...' : ''}</small></td>
                    <td width="20%">
                        <div>
                            <span class="badge ${respuestaUsuario === 'A' ? 'bg-primary' : 'bg-secondary'} badge-sm">
                                ${respuestaUsuario}
                            </span>
                            <small class="d-block">${opcionUsuarioTexto}</small>
                        </div>
                    </td>
                    <td width="20%">
                        <div>
                            <span class="badge ${respuestaCorrecta === 'A' ? 'bg-primary' : 'bg-secondary'} badge-sm">
                                ${respuestaCorrecta}
                            </span>
                            <small class="d-block">${opcionCorrectaTexto}</small>
                        </div>
                    </td>
                    <td width="10%" class="text-center">
                        ${esCorrecta ? 
                            '<span class="badge bg-success badge-sm"><i class="fas fa-check"></i></span>' : 
                            '<span class="badge bg-danger badge-sm"><i class="fas fa-times"></i></span>'}
                    </td>
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
        
        if (!container) return;
        
        const respuestasUsuario = pronostico.respuestas;
        const estado = pronostico.estado;
        const tieneResultados = estado === 'calificado' && Object.keys(respuestasCorrectas).length > 0;
        
        let tablaHTML = '';
        for (let i = 1; i <= 10; i++) {
            const pregunta = preguntas.find(p => p.numero_pregunta === i);
            const respuestaUsuario = respuestasUsuario[`p${i}`];
            const respuestaCorrecta = respuestasCorrectas[`p${i}`];
            const area = this.preguntaAreas[i] || 'general';
            
            let estadoBadge = '';
            if (tieneResultados) {
                const esCorrecta = respuestaUsuario === respuestaCorrecta;
                estadoBadge = esCorrecta ? 
                    '<span class="badge bg-success badge-sm"><i class="fas fa-check"></i></span>' : 
                    '<span class="badge bg-danger badge-sm"><i class="fas fa-times"></i></span>';
            }
            
            // Opción seleccionada por el usuario
            let opcionUsuario = '';
            if (respuestaUsuario) {
                if (respuestaUsuario === 'A') opcionUsuario = pregunta?.opcion_a?.substring(0, 40) || 'A';
                else if (respuestaUsuario === 'B') opcionUsuario = pregunta?.opcion_b?.substring(0, 40) || 'B';
                else if (respuestaUsuario === 'C') opcionUsuario = pregunta?.opcion_c?.substring(0, 40) || 'C';
                if (opcionUsuario.length > 40) opcionUsuario += '...';
            }
            
            tablaHTML += `
                <tr>
                    <td width="5%"><span class="badge bg-dark">${i}</span></td>
                    <td width="60%">
                        <div class="pregunta-texto">
                            <small>${pregunta?.texto_pregunta?.substring(0, 80) || 'Pregunta ' + i}${pregunta?.texto_pregunta?.length > 80 ? '...' : ''}</small>
                            <div class="mt-1">
                                <span class="badge bg-secondary badge-sm">${area}</span>
                                <span class="respuesta-usuario">
                                    <strong class="text-primary">${respuestaUsuario || '?'}</strong>: ${opcionUsuario}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td width="10%">
                        ${estadoBadge}
                    </td>
                    <td width="15%">
                        ${tieneResultados ? 
                            `<span class="badge ${respuestaCorrecta === 'A' ? 'bg-info' : 'bg-dark'} badge-sm">
                                ${respuestaCorrecta}
                            </span>` : 
                            '<span class="badge bg-secondary badge-sm">-</span>'}
                    </td>
                    <td width="10%">
                        <span class="badge bg-secondary badge-sm">${area.substring(0, 3)}</span>
                    </td>
                </tr>
            `;
        }
        
        container.innerHTML = `
            <div class="pronostico-container compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-eye"></i> Mi Pronóstico</h5>
                        <span class="badge ${estado === 'pendiente' ? 'bg-warning' : 'bg-success'}">
                            ${estado === 'pendiente' ? '⏳ Pendiente' : '✅ Calificado'}
                        </span>
                    </div>
                    <div class="card-body py-3">
                        ${estado === 'pendiente' ? `
                            <div class="alert alert-info alert-sm mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-clock me-2"></i>
                                    <div>
                                        <strong>Pendiente de calificación</strong>
                                        <small class="d-block">Los resultados estarán disponibles después de la carrera</small>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="alert alert-success alert-sm mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-chart-bar me-2"></i>
                                    <div>
                                        <strong>Resultados disponibles</strong>
                                        <small class="d-block">
                                            Aciertos: ${pronostico.aciertos || 0}/10 | 
                                            Puntos: ${pronostico.puntuacion_total || 0} |
                                            Dinero: €${pronostico.dinero_ganado || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        `}
                        
                        <div class="table-responsive">
                            <table class="table table-sm table-hover mb-3">
                                <thead class="bg-secondary">
                                    <tr>
                                        <th>#</th>
                                        <th>Pregunta y tu respuesta</th>
                                        <th>Resultado</th>
                                        <th>Correcta</th>
                                        <th>Área</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tablaHTML}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <div class="stat-card-sm text-center p-2">
                                    <small class="d-block text-muted">Puntos coche</small>
                                    <span class="stat-value-mini">${pronostico.puntos_coche_snapshot || 0}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-card-sm text-center p-2">
                                    <small class="d-block text-muted">Estrategas</small>
                                    <span class="stat-value-mini">${Array.isArray(pronostico.estrategas_snapshot) ? pronostico.estrategas_snapshot.length : 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            ${estado === 'calificado' ? `
                                <button class="btn btn-success btn-sm" onclick="window.pronosticosManager.verResultadosCompletos(${this.carreraActual?.id})">
                                    <i class="fas fa-chart-line"></i> Ver cálculo detallado
                                </button>
                            ` : ''}
                            <button class="btn btn-outline-secondary btn-sm" onclick="window.pronosticosManager.cargarPantallaPronostico()">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
