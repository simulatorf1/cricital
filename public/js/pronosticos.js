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
            
            /* Contenedor principal - TODOS LOS TAMAÑOS IGUAL QUE LAS RESPUESTAS */
            .pronostico-container {
                padding: 15px;
                background: #0a0a0a;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                line-height: 1.4;
            }
            
            /* Tarjetas */
            .card {
                background: #1a1a1a;
                border-radius: 8px;
                border: 1px solid #00d2be;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            /* Cabeceras de tarjetas - MISMO TAMAÑO */
            .card-header {
                background: #0066cc;
                padding: 12px 15px;
                color: white;
                border-bottom: 1px solid #00d2be;
                font-size: 16px;
            }
            
            .card-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: bold;
            }
            
            .card-body {
                padding: 15px;
                font-size: 16px;
            }
            
            /* Botones - MISMO TAMAÑO */
            .btn {
                border-radius: 5px;
                padding: 10px 15px;
                font-size: 16px;
                margin: 5px;
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
            
            /* Preguntas - MISMO TAMAÑO QUE LAS RESPUESTAS */
            .pregunta-card {
                background: #222;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 12px;
                border-left: 3px solid #00d2be;
                font-size: 16px;
            }
            
            .pregunta-card h5 {
                color: #00d2be;
                margin-bottom: 10px;
                font-size: 16px;
                font-weight: bold;
            }
            
            /* Opciones de respuesta - TAMAÑO BASE (16px) */
            .opciones {
                display: grid;
                gap: 8px;
                margin-top: 12px;
            }
            
            .opcion {
                position: relative;
            }
            
            .opcion input[type="radio"] {
                display: none;
            }
            
            .opcion label {
                display: block;
                padding: 12px 15px;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 5px;
                cursor: pointer;
                color: #ddd;
                font-size: 16px;
                line-height: 1.4;
            }
            
            .opcion input[type="radio"]:checked + label {
                background: #003333;
                border-color: #00d2be;
                color: white;
            }
            
            .opcion label strong {
                color: #00d2be;
                font-size: 16px;
                min-width: 25px;
            }
            
            /* Badges - MISMO TAMAÑO */
            .badge {
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 16px;
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
            
            /* Tablas - MISMO TAMAÑO */
            .table {
                background: #1a1a1a;
                border-radius: 6px;
                margin: 12px 0;
                font-size: 16px;
                width: 100%;
            }
            
            .table thead {
                background: #0066cc;
            }
            
            .table th {
                padding: 12px;
                color: white;
                font-weight: bold;
                font-size: 16px;
            }
            
            .table td {
                padding: 12px;
                color: #ddd;
                font-size: 16px;
                line-height: 1.4;
            }
            
            .table-success {
                background: rgba(0, 210, 190, 0.1);
            }
            
            .table-danger {
                background: rgba(225, 6, 0, 0.1);
            }
            
            /* Alertas - MISMO TAMAÑO */
            .alert {
                padding: 12px 15px;
                margin: 10px 0;
                border-radius: 5px;
                font-size: 16px;
                border: 1px solid;
                line-height: 1.4;
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
            
            /* Tarjetas de estadísticas - MISMO TAMAÑO */
            .stat-card {
                background: #222;
                border-radius: 6px;
                padding: 15px;
                text-align: center;
                border: 1px solid #444;
                font-size: 16px;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #00d2be;
                margin: 8px 0;
            }
            
            /* Estrategas - MISMO TAMAÑO */
            .estratega-card {
                background: #222;
                border-radius: 5px;
                padding: 12px;
                margin-bottom: 8px;
                border-left: 3px solid #00d2be;
                font-size: 16px;
            }
            
            /* Grids */
            .row {
                margin: 0 -8px;
            }
            
            .col-md-3, .col-md-4, .col-md-6 {
                padding: 0 8px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .pronostico-container {
                    padding: 12px;
                    font-size: 16px;
                }
                
                .card-header {
                    padding: 10px 12px;
                    font-size: 16px;
                }
                
                .card-header h4 {
                    font-size: 16px;
                }
                
                .card-body {
                    padding: 12px;
                    font-size: 16px;
                }
                
                .btn {
                    padding: 8px 12px;
                    font-size: 16px;
                }
                
                .pregunta-card {
                    padding: 12px;
                    font-size: 16px;
                }
                
                .pregunta-card h5 {
                    font-size: 16px;
                }
                
                .opcion label {
                    padding: 10px 12px;
                    font-size: 16px;
                }
            }
            
            /* ESTILOS COMPACTOS ESPECIALES - MISMO TAMAÑO */
            .compacto .card {
                margin-bottom: 12px;
            }
            
            .compacto .card-header {
                padding: 10px 12px;
                font-size: 16px;
            }
            
            .compacto .card-header h4 {
                font-size: 16px;
            }
            
            .compacto .card-body {
                padding: 12px;
                font-size: 16px;
            }
            
            .compacto .pregunta-card {
                padding: 12px;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .compacto .pregunta-card h5 {
                font-size: 16px;
                margin-bottom: 8px;
            }
            
            .compacto .opcion label {
                padding: 10px 12px;
                font-size: 16px;
            }
            
            .compacto .alert {
                padding: 10px 12px;
                margin: 8px 0;
                font-size: 16px;
            }
            
            .compacto .table {
                font-size: 16px;
            }
            
            .compacto .table th,
            .compacto .table td {
                padding: 10px;
            }
            
            .compacto .badge {
                padding: 4px 8px;
                font-size: 16px;
            }
            
            .compacto .stat-value-mini {
                font-size: 20px;
                color: #00d2be;
            }
            
            .compacto .btn-sm {
                padding: 8px 12px;
                font-size: 16px;
            }
            
            /* Tablas súper compactas - MISMO TAMAÑO */
            .table-sm th,
            .table-sm td {
                padding: 10px;
                font-size: 16px;
            }
            
            /* Espaciados */
            .mb-1 { margin-bottom: 0.4rem !important; }
            .mb-2 { margin-bottom: 0.8rem !important; }
            .mb-3 { margin-bottom: 1.2rem !important; }
            .mt-1 { margin-top: 0.4rem !important; }
            .mt-2 { margin-top: 0.8rem !important; }
            .mt-3 { margin-top: 1.2rem !important; }
            .pt-1 { padding-top: 0.4rem !important; }
            .pt-2 { padding-top: 0.8rem !important; }
            .pt-3 { padding-top: 1.2rem !important; }
            
            /* Grid compacto */
            .row.g-2 {
                margin: 0 -5px !important;
            }
            
            .row.g-2 > [class*="col-"] {
                padding: 0 5px !important;
            }
            
            /* Contenedor de estrategas mini - MISMO TAMAÑO */
            .estratega-mini {
                background: #222;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 6px;
                border-left: 2px solid #00d2be;
                font-size: 16px;
            }
            
            /* Texto de preguntas - MISMO TAMAÑO */
            .pregunta-texto small {
                font-size: 16px;
                color: #bbb;
                line-height: 1.4;
            }
            
            .respuesta-usuario {
                font-size: 16px;
                color: #00d2be;
                line-height: 1.4;
            }
            
            .stat-value-mini {
                font-size: 20px;
                font-weight: bold;
                color: #00d2be;
                margin: 5px 0;
            }
            
            .fecha-actual {
                font-size: 16px;
                font-weight: 600;
                color: #00d2be;
            }
            
            /* Formularios - MISMO TAMAÑO */
            .form-check-input {
                width: 18px;
                height: 18px;
                margin-top: 0.3rem;
            }
            
            .form-check-label {
                font-size: 16px;
                margin-left: 8px;
            }
            
            /* Scrollbar */
            .pronostico-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .pronostico-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .pronostico-container::-webkit-scrollbar-thumb {
                background: #00d2be;
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
        
        // 🔴 **PASO 1: Cargar datos del usuario (esto establece this.escuderiaId)**
        await this.cargarDatosUsuario(user.id);
        
        if (!this.escuderiaId) {
            this.mostrarError("No se pudo obtener tu escudería", container);
            return;
        }
        
        // 🔴 **PASO 2: Buscar SI TIENE PRONÓSTICOS ANTERIORES (prioridad #1)**
        const { data: pronosticosExistentes, error: errorPronosticos } = await this.supabase
            .from('pronosticos_usuario')
            .select(`
                *,
                calendario_gp!inner(*)
            `)
            .eq('escuderia_id', this.escuderiaId)
            .order('fecha_pronostico', { ascending: false });
        
        if (errorPronosticos) {
            console.error("Error verificando pronósticos:", errorPronosticos);
        }
        
        // ✅ Si TIENE pronósticos, mostrar el más reciente (sin importar la fecha)
        // ✅ Guardar pronósticos para selector histórico PERO NO MOSTRARLOS AUTOMÁTICAMENTE
        let pronosticosAnteriores = [];
        if (pronosticosExistentes && pronosticosExistentes.length > 0) {
            console.log("✅ Usuario tiene", pronosticosExistentes.length, "pronósticos anteriores");
            pronosticosAnteriores = pronosticosExistentes;
            // NO MOSTRAMOS EL ÚLTIMO AUTOMÁTICAMENTE, SEGUIMOS A LA SIGUIENTE CARRERA
        }
        
        // 🔴 **PASO 3: Si NO tiene pronósticos, buscar carrera activa para pronosticar**
        console.log("ℹ️ Usuario sin pronósticos, buscando carrera activa");
        
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
        
        // 🔴 Verificar fecha límite para NUEVOS pronósticos
        const fechaLimite = new Date(this.carreraActual.fecha_limite_pronosticos || this.carreraActual.fecha_inicio);
        fechaLimite.setHours(fechaLimite.getHours() - 48);
        
        if (hoy > fechaLimite) {
            // Si pasó la fecha pero no tiene pronóstico, mensaje claro
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <div class="card">
                        <div class="card-header bg-danger text-white py-2">
                            <h5 class="mb-0"><i class="fas fa-clock"></i> Plazo expirado</h5>
                        </div>
                        <div class="card-body py-3">
                            <div class="alert alert-warning mb-3">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>El plazo para pronosticar ${this.carreraActual.nombre} ha expirado.</strong>
                                <p class="mt-2 mb-0">No realizaste pronóstico para esta carrera.</p>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary btn-sm" onclick="window.pronosticosManager.buscarProximaCarrera()">
                                    <i class="fas fa-forward"></i> Ver próxima carrera
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
        
        // 🔴 Verificar si ya tiene pronóstico para esta carrera específica
        const { data: pronosticoActual } = await this.supabase
            .from('pronosticos_usuario')
            .select('id')
            .eq('escuderia_id', this.escuderiaId)
            .eq('carrera_id', this.carreraActual.id)
            .maybeSingle();
        
        this.pronosticoGuardado = !!pronosticoActual;
        
        // 🔴 **PASO 4: Cargar preguntas y mostrar interfaz**
        await this.cargarPreguntasCarrera(this.carreraActual.id);
        this.mostrarPantallaPrincipal(container, pronosticosAnteriores);
    }
    mostrarPantallaPrincipal(container, pronosticosAnteriores) {
        // Si ya tiene pronóstico, mostrar interfaz original pero con selector
        if (this.pronosticoGuardado) {
            // Llamar a la función existente pero pasando histórico
            this.mostrarInterfazPronosticoConHistorico(container, pronosticosAnteriores);
            return;
        }
        
        if (!this.usuarioAceptoCondiciones) {
            this.mostrarCondicionesInicialesConHistorico(container, pronosticosAnteriores);
            return;
        }
        
        this.mostrarPreguntasPronosticoConHistorico(container, pronosticosAnteriores);
    }
    mostrarInterfazPronosticoConHistorico(container, historico) {
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
                        
                        ${historico.length > 0 ? this.renderizarSelectorHistorico(historico) : ''}
                        
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
    }
    mostrarCondicionesInicialesConHistorico(container, historico) {
        const fechaCarrera = new Date(this.carreraActual.fecha_inicio);
        fechaCarrera.setHours(fechaCarrera.getHours() + 24);
        const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let estrategasHTML = '<p class="text-muted mb-0">No tienes estrategas contratados</p>';
        if (this.estrategasActivos && this.estrategasActivos.length > 0) {
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
        
        // 🔴 CONSULTAR VUELTA RÁPIDA DE LA CARRERA ACTUAL
        // 🔴 CONSULTAR VUELTA RÁPIDA DE LA CARRERA ACTUAL
        let vueltaRapidaHTML = '<div class="spinner-border spinner-border-sm text-info"></div> Cargando...';
        
        // Hacer la consulta a pruebas_pista
        this.supabase
            .from('pruebas_pista')
            .select('tiempo_formateado')
            .eq('escuderia_id', this.escuderiaId)
            .order('created_at', { ascending: false })
            .limit(1)
            .then(({ data, error }) => {
                const vueltaElement = document.getElementById('vuelta-rapida-valor');
                if (vueltaElement) {
                    if (!error && data && data.length > 0 && data[0].tiempo_formateado) {
                        vueltaElement.innerHTML = data[0].tiempo_formateado;
                    } else {
                        vueltaElement.innerHTML = '--:--:---';
                    }
                }
            });
        
        container.innerHTML = `
            <div class="pronosticos-container-f1 compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2">
                        <h5 class="mb-0"><i class="fas fa-flag-checkered"></i> Pronóstico - ${this.carreraActual.nombre}</h5>
                    </div>
                    <div class="card-body py-3">
                        ${historico.length > 0 ? this.renderizarSelectorHistorico(historico) : ''}
                        
                        <h5 class="text-warning mb-3"><i class="fas fa-info-circle"></i> Datos que se guardarán:</h5>
                        
                        <div class="table-responsive mb-3">
                            <table class="table table-sm table-dark">
                                <thead class="bg-secondary">
                                    <tr>
                                        <th width="25%">Vuelta rápida</th>
                                        <th width="25%">Estrategas activos</th>
                                        <th width="25%">Fecha captura</th>
                                        <th width="25%">Resultados</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">
                                            <div class="stat-value-mini" id="vuelta-rapida-valor">
                                                <span class="spinner-border spinner-border-sm text-info"></span>
                                            </div>
                                            <small class="text-muted">mejor tiempo</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="stat-value-mini">${this.estrategasActivos ? this.estrategasActivos.length : 0}</div>
                                            <small class="text-muted">estrategas</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="fecha-actual">${new Date().toLocaleDateString('es-ES')}</div>
                                            <small class="text-muted">Hoy</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="text-info">${fechaResultados.split(',')[0]}</div>
                                            <small class="text-muted">${fechaResultados.split(',')[1] || 'aprox.'}</small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Los puntos del coche se guardan ocultos para el cálculo -->
                        <input type="hidden" id="puntos-coche-ocultos" value="${this.usuarioPuntos}">
                        
                        ${this.estrategasActivos && this.estrategasActivos.length > 0 ? `
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
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-success flex-grow-1" onclick="window.pronosticosManager.iniciarPronostico()">
                                <i class="fas fa-play"></i> Empezar pronóstico
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="window.tabManager.switchTab('principal')">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }  
    renderizarSelectorHistorico(historico) {
        if (historico.length === 0) return '';
        
        const opcionesHistorico = historico.map(p => {
            const fecha = p.calendario_gp?.fecha_inicio ? new Date(p.calendario_gp.fecha_inicio).toLocaleDateString('es-ES') : '';
            const estado = p.estado === 'calificado' ? '✅ Resultados' : '⏳ Pendiente';
            return `
                <option value="${p.id}" data-carrera-id="${p.carrera_id}">
                    ${p.calendario_gp?.nombre || 'Carrera'} - ${fecha} (${estado})
                </option>
            `;
        }).join('');
        
        return `
            <div class="historico-pronosticos mb-3 p-3" style="background: #1a1a1a; border-radius: 8px; border: 2px solid #00d2be;">
                <h6 class="text-info mb-3"><i class="fas fa-history me-2"></i>Consultar pronósticos anteriores:</h6>
                <div class="d-flex gap-2">
                    <select id="selectorHistoricoPronosticos" class="form-select form-select-lg bg-dark text-white border-secondary" style="flex: 1; font-size: 16px; padding: 12px;">
                        <option value="">-- Selecciona una carrera --</option>
                        ${opcionesHistorico}
                    </select>
                    <button class="btn btn-outline-info btn-lg" onclick="window.pronosticosManager.verPronosticoSeleccionado()" style="font-size: 16px; padding: 12px 20px;">
                        <i class="fas fa-eye me-2"></i> Ver
                    </button>
                </div>
            </div>
        `;
    }
    
    async verPronosticoSeleccionado() {
        const selector = document.getElementById('selectorHistoricoPronosticos');
        if (!selector || !selector.value) {
            this.mostrarError("Selecciona una carrera primero");
            return;
        }
        
        const pronosticoId = selector.value;
        const optionSeleccionada = selector.options[selector.selectedIndex];
        const carreraId = optionSeleccionada.dataset.carreraId;
        
        try {
            const { data: pronostico, error } = await this.supabase
                .from('pronosticos_usuario')
                .select(`
                    *,
                    calendario_gp!inner(*)
                `)
                .eq('id', pronosticoId)
                .single();
            
            if (error || !pronostico) throw error;
            
            const { data: preguntas } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraId)
                .order('numero_pregunta');
            
            let respuestasCorrectas = {};
            if (pronostico.estado === 'calificado') {
                const { data: resultados } = await this.supabase
                    .from('resultados_carrera')
                    .select('respuestas_correctas')
                    .eq('carrera_id', carreraId)
                    .maybeSingle();
                
                if (resultados) respuestasCorrectas = resultados.respuestas_correctas;
            }
            
            this.mostrarVistaPronosticoGuardado(pronostico, preguntas || [], respuestasCorrectas);
            
        } catch (error) {
            console.error("Error:", error);
            this.mostrarError("Error al cargar el pronóstico");
        }
    }

    
    mostrarPreguntasPronosticoConHistorico(container, historico) {
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
                        <button class="btn btn-outline-light btn-sm" onclick="window.pronosticosManager.usuarioAceptoCondiciones = false; window.pronosticosManager.mostrarPantallaPrincipal(document.querySelector('.tab-content.active'), ${JSON.stringify(historico)})">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                    <div class="card-body py-3">
                        ${historico.length > 0 ? this.renderizarSelectorHistorico(historico) : ''}
                        
                        <div class="preguntas-container">
                            ${preguntasHTML}
                        </div>
                        
                        <div class="mt-3 pt-3 border-top">
                            <button type="button" class="btn btn-success btn-sm" onclick="window.pronosticosManager.guardarPronostico()">
                                <i class="fas fa-paper-plane"></i> Enviar pronóstico
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.pronosticosManager.usuarioAceptoCondiciones = false; window.pronosticosManager.mostrarPantallaPrincipal(document.querySelector('.tab-content.active'), ${JSON.stringify(historico)})">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // AÑADE ESTA NUEVA FUNCIÓN después de cargarPantallaPronostico()
    async buscarProximaCarrera() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const hoy = new Date();
        const fechaHoy = hoy.toISOString().split('T')[0];
        
        const { data: carreras } = await this.supabase
            .from('calendario_gp')
            .select('*')
            .gte('fecha_inicio', fechaHoy)
            .order('fecha_inicio', { ascending: true })
            .limit(1);
        
        if (carreras && carreras.length > 0) {
            this.carreraActual = carreras[0];
            await this.cargarPreguntasCarrera(this.carreraActual.id);
            this.mostrarInterfazPronostico(container);
        } else {
            this.mostrarError("No hay próximas carreras programadas", container);
        }
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
            this.usuarioPuntos = escuderia.puntos || 0;
            console.log("✅ Puntos de escudería:", this.usuarioPuntos);
            

            const { data: estrategas, error: errorEstrategas } = await this.supabase
                .from('estrategas_contrataciones')
                .select(`
                    id,
                    estratega_id,
                    slot_asignado,
                    estado,
                    estrategas_catalogo!inner (
                        nombre,
                        especialidad,
                        porcentaje_bono
                    )
                `)
                .eq('escuderia_id', escuderia.id)
                .eq('estado', 'activo');
            
            if (errorEstrategas) {
                console.error("❌ Error obteniendo estrategas:", errorEstrategas);
                this.estrategasActivos = [];
            } else {
                this.estrategasActivos = (estrategas || []).map(c => ({
                    ingeniero_id: c.estratega_id,
                    nombre: c.estrategas_catalogo?.nombre || 'Estratega',
                    especialidad: c.estrategas_catalogo?.especialidad || 'general',
                    // Usamos porcentaje_bono como bonificacion_valor
                    bonificacion_valor: c.estrategas_catalogo?.porcentaje_bono || 0,
                    // El tipo de bonificación lo determinamos por la especialidad
                    bonificacion_tipo: c.estrategas_catalogo?.especialidad || 'general',
                    activo: true,
                    slot_asignado: c.slot_asignado
                }));
                
                console.log("✅ Estrategas encontrados:", this.estrategasActivos.length);
                console.log("Detalle:", this.estrategasActivos);
            }
            
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
        if (this.estrategasActivos && this.estrategasActivos.length > 0) {
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
        
        // 🔴 CONSULTAR VUELTA RÁPIDA

        this.supabase
            .from('pruebas_pista')
            .select('tiempo_formateado')
            .eq('escuderia_id', this.escuderiaId)
            .order('created_at', { ascending: false })
            .limit(1)
            .then(({ data, error }) => {
                const vueltaElement = document.getElementById('vuelta-rapida-valor-original');
                if (vueltaElement) {
                    if (!error && data && data.length > 0 && data[0].tiempo_formateado) {
                        vueltaElement.innerHTML = data[0].tiempo_formateado;
                    } else {
                        vueltaElement.innerHTML = '--:--:---';
                    }
                }
            });
        
        container.innerHTML = `
            <div class="pronosticos-container-f1 compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2">
                        <h5 class="mb-0"><i class="fas fa-flag-checkered"></i> Pronóstico - ${this.carreraActual.nombre}</h5>
                    </div>
                    <div class="card-body py-3">
                        <h5 class="text-warning mb-3"><i class="fas fa-info-circle"></i> Datos que se guardarán:</h5>
                        
                        <div class="table-responsive mb-3">
                            <table class="table table-sm table-dark">
                                <thead class="bg-secondary">
                                    <tr>
                                        <th width="25%">Vuelta rápida</th>
                                        <th width="25%">Estrategas activos</th>
                                        <th width="25%">Fecha captura</th>
                                        <th width="25%">Resultados</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">
                                            <div class="stat-value-mini" id="vuelta-rapida-valor-original">
                                                <span class="spinner-border spinner-border-sm text-info"></span>
                                            </div>
                                            <small class="text-muted">mejor tiempo</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="stat-value-mini">${this.estrategasActivos ? this.estrategasActivos.length : 0}</div>
                                            <small class="text-muted">estrategas</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="fecha-actual">${new Date().toLocaleDateString('es-ES')}</div>
                                            <small class="text-muted">Hoy</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="text-info">${fechaResultados.split(',')[0]}</div>
                                            <small class="text-muted">${fechaResultados.split(',')[1] || 'aprox.'}</small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Los puntos del coche se guardan ocultos para el cálculo -->
                        <input type="hidden" id="puntos-coche-ocultos-original" value="${this.usuarioPuntos}">
                        
                        ${this.estrategasActivos && this.estrategasActivos.length > 0 ? `
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
                        
                        <div class="mt-3">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> 
                                Estos datos se guardarán y se tendrán en cuenta para el cálculo final
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-success flex-grow-1" onclick="window.pronosticosManager.iniciarPronostico()">
                                <i class="fas fa-play"></i> Empezar pronóstico
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="window.tabManager.switchTab('principal')">
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
        
        // 🔴 NUEVO: Calcular qué preguntas afecta cada estratega
        const bonificacionesAplicadas = {};
        
        this.estrategasActivos.forEach(estratega => {
            const areaEstratega = (estratega.bonificacion_tipo || estratega.especialidad || '').toLowerCase();
            if (!areaEstratega) return;
            
            const preguntasAfectadas = [];
            
            // Recorrer las 10 preguntas
            for (let i = 1; i <= 10; i++) {
                const areaPregunta = this.preguntaAreas[i]?.toLowerCase() || '';
                
                // Si el área del estratega coincide con el área de la pregunta
                if (areaPregunta.includes(areaEstratega) || areaEstratega.includes(areaPregunta)) {
                    preguntasAfectadas.push(i);
                }
            }
            
            if (preguntasAfectadas.length > 0) {
                bonificacionesAplicadas[estratega.ingeniero_id] = {
                    nombre: estratega.nombre,
                    area: areaEstratega,
                    porcentaje: estratega.bonificacion_valor || 0,
                    preguntas: preguntasAfectadas
                };
            }
        });
        
        console.log("📊 Bonificaciones calculadas:", bonificacionesAplicadas);
        
        try {
            const { data, error } = await this.supabase
                .from('pronosticos_usuario')
                .insert([{
                    escuderia_id: this.escuderiaId,
                    usuario_id: user.id,
                    carrera_id: this.carreraActual.id,
                    respuestas: respuestas,
                    puntos_coche_snapshot: this.usuarioPuntos,
                    estrategas_snapshot: snapshotEstrategas,
                    bonificaciones_aplicadas: bonificacionesAplicadas, // ← NUEVO
                    fecha_pronostico: new Date().toISOString(),
                    estado: 'pendiente'
                }]);
            
            if (error) throw error;
            
            // Mostrar notificación temporal
            this.mostrarNotificacionTemporal(`
                <div class="notificacion-exito">
                    <i class="fas fa-check-circle text-success" style="font-size: 24px;"></i>
                    <div>
                        <h5 style="margin: 0 0 5px 0; color: #00d2be;">¡Pronóstico enviado!</h5>
                        <p style="margin: 0; font-size: 14px;">Tu pronóstico para <strong>${this.carreraActual.nombre}</strong> ha sido registrado correctamente.</p>
                        <p style="margin: 5px 0 0 0; font-size: 13px;">Recibirás una notificación cuando los resultados estén disponibles.</p>
                    </div>
                </div>
            `);
            
            this.pronosticoGuardado = true;
            
            // Esperar 2 segundos y recargar la pantalla para mostrar "ya enviado"
            setTimeout(() => {
                this.cargarPantallaPronostico();
            }, 2000);
            
        } catch (error) {
            console.error("Error guardando pronóstico:", error);
            this.mostrarNotificacionTemporal(`
                <div class="notificacion-error">
                    <i class="fas fa-exclamation-circle text-danger" style="font-size: 24px;"></i>
                    <div>
                        <h5 style="margin: 0 0 5px 0; color: #e10600;">Error</h5>
                        <p style="margin: 0; font-size: 14px;">Error al guardar el pronóstico. Inténtalo de nuevo.</p>
                    </div>
                </div>
            `);
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
                <button class="btn btn-sm btn-outline-secondary mt-2" onclick="window.location.hash = '#principal'">
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

    mostrarNotificacionTemporal(mensajeHTML, duracion = 4000) {
        // Crear contenedor de notificación
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-temporal';
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(20, 20, 40, 0.95);
            border: 2px solid #00d2be;
            border-radius: 8px;
            padding: 15px;
            color: white;
            z-index: 10000;
            min-width: 300px;
            box-shadow: 0 4px 15px rgba(0, 210, 190, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notificacion.innerHTML = mensajeHTML;
        
        // Añadir al body
        document.body.appendChild(notificacion);
        
        // Eliminar después del tiempo especificado
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    document.body.removeChild(notificacion);
                }
            }, 300);
        }, duracion);
        
        // Añadir estilos de animación si no existen
        if (!document.getElementById('estilos-notificaciones')) {
            const estilos = document.createElement('style');
            estilos.id = 'estilos-notificaciones';
            estilos.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .notificacion-exito {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .notificacion-error {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
            `;
            document.head.appendChild(estilos);
        }
    }    
    
    mostrarVistaPronosticoGuardado(pronostico, preguntas, respuestasCorrectas = {}) {
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active') ||
                         document.querySelector('.pronosticos-container');
        
        if (!container) return;
        
        const respuestasUsuario = pronostico.respuestas;
        const estado = pronostico.estado;
        const tieneResultados = estado === 'calificado' && Object.keys(respuestasCorrectas).length > 0;
        
        // VALORES DIRECTOS EN EUROS
        const VALOR_BASE_PREGUNTA = 5000000; // 5.000.000 € por pregunta acertada
        const VALOR_PUNTO_COCHE = 10000;     // 10.000 € por punto del coche
        
        // Mapeo de áreas
        const nombresArea = {
            'meteorologia': '🌦️ Meteorología',
            'fiabilidad': '🔧 Fiabilidad', 
            'estrategia': '📋 Estrategia',
            'rendimiento': '⚡ Rendimiento',
            'neumaticos': '🛞 Neumáticos',
            'seguridad': '🛡️ Seguridad',
            'clasificacion': '⏱️ Clasificación',
            'carrera': '🏁 Carrera',
            'overtakes': '👋 Adelantamientos',
            'incidentes': '🚨 Incidentes'
        };
        
        // Acumuladores
        let totalDineroPreguntas = 0;
        let totalBonificaciones = 0;
        let filasPreguntas = '';
        let aciertos = 0;
        let dineroPorAciertos = 0;
        let dineroPorBonificaciones = 0;
        
        for (let i = 1; i <= 10; i++) {
            const pregunta = preguntas.find(p => p.numero_pregunta === i);
            const respuestaUsuario = respuestasUsuario[`p${i}`];
            const respuestaCorrecta = respuestasCorrectas[`p${i}`];
            const esCorrecta = tieneResultados ? respuestaUsuario === respuestaCorrecta : false;
            const area = this.preguntaAreas[i] || 'general';
            
            if (esCorrecta) aciertos++;
            
            // Buscar qué estrategas bonifican esta pregunta
            let estrategasBonifican = [];
            let bonificacionTotalPregunta = 0;
            
            if (tieneResultados && esCorrecta && pronostico.bonificaciones_aplicadas) {
                Object.values(pronostico.bonificaciones_aplicadas).forEach(estratega => {
                    if (estratega.preguntas && estratega.preguntas.includes(i)) {
                        estrategasBonifican.push({
                            nombre: estratega.nombre,
                            porcentaje: estratega.porcentaje
                        });
                        bonificacionTotalPregunta += estratega.porcentaje;
                    }
                });
            }
            
            // Calcular valores en EUROS
            const dineroBasePregunta = esCorrecta ? VALOR_BASE_PREGUNTA : 0;
            const dineroBonificacion = esCorrecta ? Math.round(dineroBasePregunta * (bonificacionTotalPregunta / 100)) : 0;
            const dineroTotalPregunta = dineroBasePregunta + dineroBonificacion;
            
            if (esCorrecta) {
                dineroPorAciertos += dineroBasePregunta;
                dineroPorBonificaciones += dineroBonificacion;
                totalDineroPreguntas += dineroTotalPregunta;
            }
            
            // Texto de la opción seleccionada
            let opcionTexto = '';
            if (respuestaUsuario === 'A') opcionTexto = pregunta?.opcion_a || 'Opción A';
            else if (respuestaUsuario === 'B') opcionTexto = pregunta?.opcion_b || 'Opción B';
            else if (respuestaUsuario === 'C') opcionTexto = pregunta?.opcion_c || 'Opción C';
            
            if (opcionTexto.length > 40) opcionTexto = opcionTexto.substring(0, 37) + '...';
            
            // Generar HTML para mostrar los estrategas que bonifican esta pregunta
            let estrategasHTML = '';
            if (estrategasBonifican.length > 0) {
                estrategasHTML = '<div class="small text-success mt-1">';
                estrategasBonifican.forEach(e => {
                    estrategasHTML += `<span class="badge bg-info me-1">${e.nombre} +${e.porcentaje}%</span>`;
                });
                estrategasHTML += '</div>';
            }
            
            filasPreguntas += `
                <tr class="${esCorrecta ? 'table-success' : ''}">
                    <td class="text-center align-middle"><strong>${i}</strong></td>
                    <td class="align-middle">
                        <div><strong>${nombresArea[area] || area}</strong></div>
                        <small class="text-muted">${pregunta?.texto_pregunta?.substring(0, 50) || ''}${pregunta?.texto_pregunta?.length > 50 ? '...' : ''}</small>
                        ${estrategasHTML}
                    </td>
                    <td class="align-middle">
                        <span class="badge bg-secondary">${respuestaUsuario}</span>
                        <small class="d-block text-muted">${opcionTexto}</small>
                    </td>
                    <td class="text-center align-middle">
                        ${tieneResultados ? `
                            <span class="badge ${esCorrecta ? 'bg-success' : 'bg-danger'}" style="font-size: 1rem;">
                                ${esCorrecta ? '✓' : '✗'}
                            </span>
                        ` : '<span class="badge bg-warning">⏳ Pendiente</span>'}
                    </td>
                    <td class="text-end align-middle">
                        ${tieneResultados && esCorrecta ? `
                            <div><span class="text-muted">Base:</span> <strong>${dineroBasePregunta.toLocaleString('es-ES')} €</strong></div>
                            ${bonificacionTotalPregunta > 0 ? `
                                <div class="text-success">
                                    <small>+${bonificacionTotalPregunta}% (${estrategasBonifican.map(e => e.nombre).join(', ')}):</small>
                                    <strong>+${dineroBonificacion.toLocaleString('es-ES')} €</strong>
                                </div>
                            ` : ''}
                            <div class="mt-1"><strong>Total: ${dineroTotalPregunta.toLocaleString('es-ES')} €</strong></div>
                        ` : tieneResultados ? '0 €' : '---'}
                    </td>
                </tr>
            `;
        }
        
        // Calcular dinero por puntos del coche
        const puntosCoche = pronostico.puntos_coche_snapshot || 0;
        const dineroPorPuntosCoche = puntosCoche * VALOR_PUNTO_COCHE;
        
        // Total final
        const dineroTotalFinal = totalDineroPreguntas + dineroPorPuntosCoche;
        
        // Verificar si ya cobró
        const yaCobro = pronostico.cobrado || false;
        
        container.innerHTML = `
            <div class="pronostico-container compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-chart-line"></i> Resultados - ${pronostico.calendario_gp?.nombre || 'Carrera'}</h5>
                        <span class="badge ${estado === 'pendiente' ? 'bg-warning' : 'bg-success'} fs-6 p-2">
                            ${estado === 'pendiente' ? '⏳ Pendiente de calificación' : '✅ Resultados disponibles'}
                        </span>
                    </div>
                    
                    <div class="card-body py-3">
                        ${estado === 'pendiente' ? `
                            <div class="alert alert-warning mb-4">
                                <i class="fas fa-hourglass-half me-2"></i>
                                <strong>⏳ Pronóstico pendiente de evaluación</strong>
                                <p class="mb-0 mt-1">Los resultados se publicarán después de la carrera. Aquí puedes ver lo que pronosticaste y qué estrategas te ayudarán si aciertas:</p>
                            </div>
                            
                            <!-- SECCIÓN DE ESTRATEGAS EN PENDIENTE -->
                            ${pronostico.bonificaciones_aplicadas && Object.keys(pronostico.bonificaciones_aplicadas).length > 0 ? `
                                <div class="card bg-dark border-info mb-4">
                                    <div class="card-header bg-info py-2 text-white">
                                        <h6 class="mb-0"><i class="fas fa-users me-2"></i> Tus estrategas y sus bonificaciones</h6>
                                    </div>
                                    <div class="card-body py-3">
                                        <div class="row">
                                            ${Object.values(pronostico.bonificaciones_aplicadas).map(estratega => `
                                                <div class="col-md-6 mb-2">
                                                    <div class="p-2" style="background: #1e1e1e; border-radius: 5px; border-left: 4px solid #00d2be;">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span class="fw-bold fs-6">${estratega.nombre}</span>
                                                                <span class="badge bg-info ms-2">${estratega.area}</span>
                                                            </div>
                                                            <span class="text-success fw-bold fs-5">+${estratega.porcentaje}%</span>
                                                        </div>
                                                        <div class="small text-muted mt-2">
                                                            <i class="fas fa-check-circle text-success me-1"></i> 
                                                            <strong>Bonifica las preguntas:</strong> ${estratega.preguntas.join(', ')}
                                                        </div>
                                                        <div class="small text-info mt-1">
                                                            <i class="fas fa-info-circle me-1"></i>
                                                            Si aciertas estas preguntas, recibirás un +${estratega.porcentaje}% extra
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <div class="alert alert-info mt-3 mb-0 py-2">
                                            <i class="fas fa-lightbulb me-2"></i>
                                            <strong>Recuerda:</strong> Las bonificaciones solo se aplican en las preguntas que aciertes.
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="alert alert-secondary mb-4">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>No tenías estrategas contratados</strong> cuando hiciste este pronóstico.
                                </div>
                            `}
                            
                            <!-- MOSTRAR PRONÓSTICO (TABLA DE PREGUNTAS) -->
                            <h6 class="mb-3"><i class="fas fa-list me-2"></i> Tu pronóstico para esta carrera:</h6>
                            <div class="table-responsive mb-4">
                                <table class="table table-sm table-dark table-hover">
                                    <thead class="bg-secondary">
                                        <tr>
                                            <th class="text-center" width="5%">#</th>
                                            <th width="40%">Área / Pregunta</th>
                                            <th width="30%">Tu respuesta</th>
                                            <th class="text-center" width="25%">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.generarFilasPronosticoPendiente(preguntas, respuestasUsuario)}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-hourglass-half me-2"></i>
                                <strong>Resumen:</strong> Respondiste 10 preguntas. Cuando se publiquen los resultados, sabrás cuántos aciertos tuviste y qué bonificaciones aplicaron.
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-secondary" onclick="window.pronosticosManager.cargarPantallaPronostico()">
                                    <i class="fas fa-arrow-left me-2"></i> Volver a pronósticos
                                </button>
                            </div>
                        ` : `
                            <!-- RESULTADOS DETALLADOS -->
                            <div class="alert alert-success mb-4">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="fas fa-trophy me-2"></i>
                                        <strong>Has acertado ${aciertos}/10 preguntas</strong>
                                    </div>
                                    <div class="text-end">
                                        <small class="d-block text-muted">Total bruto</small>
                                        <span class="fs-5 fw-bold">${dineroTotalFinal.toLocaleString('es-ES')} €</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- TABLA DE PREGUNTAS -->
                            <h6 class="mb-3"><i class="fas fa-list"></i> Desglose por pregunta:</h6>
                            <div class="table-responsive mb-4">
                                <table class="table table-sm table-dark table-hover">
                                    <thead class="bg-secondary">
                                        <tr>
                                            <th class="text-center" width="5%">#</th>
                                            <th width="25%">Área / Pregunta</th>
                                            <th width="25%">Tu respuesta</th>
                                            <th class="text-center" width="10%">Resultado</th>
                                            <th class="text-end" width="35%">Dinero obtenido</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${filasPreguntas}
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- RESUMEN ECONÓMICO -->
                            <div class="card bg-dark border-secondary mb-4">
                                <div class="card-header bg-secondary py-2">
                                    <h6 class="mb-0"><i class="fas fa-calculator"></i> Resumen económico</h6>
                                </div>
                                <div class="card-body py-3">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <div class="d-flex justify-content-between">
                                                    <span>💰 Preguntas acertadas (${aciertos} × 5.000.000 €):</span>
                                                    <span class="fw-bold">${dineroPorAciertos.toLocaleString('es-ES')} €</span>
                                                </div>
                                                <div class="d-flex justify-content-between text-success">
                                                    <span>✨ Bonificaciones de estrategas:</span>
                                                    <span class="fw-bold">+${dineroPorBonificaciones.toLocaleString('es-ES')} €</span>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
                                                    <span><strong>SUBTOTAL PREGUNTAS:</strong></span>
                                                    <span class="fw-bold">${totalDineroPreguntas.toLocaleString('es-ES')} €</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <div class="d-flex justify-content-between">
                                                    <span>🏎️ Puntos del coche (${puntosCoche} × 10.000 €):</span>
                                                    <span class="fw-bold">${dineroPorPuntosCoche.toLocaleString('es-ES')} €</span>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2 pt-2 border-top border-secondary fs-5">
                                                    <span><strong>TOTAL FINAL:</strong></span>
                                                    <span class="fw-bold text-warning">${dineroTotalFinal.toLocaleString('es-ES')} €</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- BOTÓN COBRAR -->
                            <div class="d-grid gap-2">
                                ${yaCobro ? `
                                    <button class="btn btn-secondary btn-lg" disabled>
                                        <i class="fas fa-check-circle me-2"></i> COBRADO (${new Date(pronostico.fecha_cobro).toLocaleDateString('es-ES')})
                                    </button>
                                ` : `
                                    <button class="btn btn-success btn-lg" onclick="window.pronosticosManager.cobrarDinero(${pronostico.id}, ${dineroTotalFinal})">
                                        <i class="fas fa-money-bill-wave me-2"></i> COBRAR AHORA ${dineroTotalFinal.toLocaleString('es-ES')} €
                                    </button>
                                `}
                                
                                <button class="btn btn-outline-secondary" onclick="window.pronosticosManager.cargarPantallaPronostico()">
                                    <i class="fas fa-arrow-left me-2"></i> Volver a pronósticos
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    generarDetalleEstrategasDesdeGuardado(bonificaciones, dineroPorBonificaciones) {
        console.log("🎯 generando detalle con:", bonificaciones);
        console.log("🎯 dineroPorBonificaciones:", dineroPorBonificaciones);
        
        // Si no hay bonificaciones, no mostrar nada
        if (!bonificaciones) {
            console.log("❌ No hay bonificaciones");
            return '';
        }
        
        // Obtener los valores del objeto (ignorando las claves numéricas)
        const listaEstrategas = Object.values(bonificaciones);
        console.log("📊 Lista de estrategas:", listaEstrategas);
        
        if (listaEstrategas.length === 0) {
            console.log("❌ Lista vacía");
            return '';
        }
        
        let html = `
            <div class="mt-3 pt-2" style="border-top: 1px solid #00d2be;">
                <div class="text-success fw-bold mb-2">
                    <i class="fas fa-star"></i> ✨ EXTRAS POR ESTRATEGAS:
                </div>
        `;
        
        const numEstrategas = listaEstrategas.length;
        const bonusPorEstratega = dineroPorBonificaciones > 0 ? Math.round(dineroPorBonificaciones / numEstrategas) : 0;
        
        listaEstrategas.forEach((estratega, index) => {
            console.log(`📌 Estratega ${index + 1}:`, estratega);
            
            // Extraer datos directamente del objeto
            const nombre = estratega.nombre || `Estratega ${index + 1}`;
            const area = estratega.area || 'general';
            const porcentaje = estratega.porcentaje || 0;
            const preguntas = estratega.preguntas || [];
            
            html += `
                <div class="mb-2" style="background: #1e1e1e; border-radius: 5px; padding: 10px; border-left: 4px solid #00d2be;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold fs-6">${nombre}</span>
                            <span class="badge bg-info ms-2">${area}</span>
                            <div class="small text-muted mt-1">
                                <i class="fas fa-check-circle text-success"></i> 
                                Preguntas: ${preguntas.length > 0 ? preguntas.join(', ') : 'Ninguna'}
                                <br><i class="fas fa-percentage text-success"></i> 
                                +${porcentaje}%
                            </div>
                        </div>
                        <div class="text-end">
                            <span class="text-success fw-bold">+${porcentaje}%</span><br>
                            <small class="text-info">≈ ${bonusPorEstratega.toLocaleString('es-ES')} €</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="d-flex justify-content-between mt-3 pt-2 fw-bold" style="border-top: 2px dashed #00d2be;">
                <span class="text-success fs-6">💰 TOTAL BONIFICACIONES:</span>
                <span class="text-success fs-6 fw-bold">+${dineroPorBonificaciones.toLocaleString('es-ES')} €</span>
            </div>
        `;
        
        return html;
    }
    
    generarFilasPronosticoPendiente(preguntas, respuestasUsuario) {
        if (!preguntas || !respuestasUsuario) return '<tr><td colspan="4" class="text-center">No hay datos disponibles</td></tr>';
        
        const nombresArea = {
            'meteorologia': '🌦️ Meteorología',
            'fiabilidad': '🔧 Fiabilidad', 
            'estrategia': '📋 Estrategia',
            'rendimiento': '⚡ Rendimiento',
            'neumaticos': '🛞 Neumáticos',
            'seguridad': '🛡️ Seguridad',
            'clasificacion': '⏱️ Clasificación',
            'carrera': '🏁 Carrera',
            'overtakes': '👋 Adelantamientos',
            'incidentes': '🚨 Incidentes'
        };
        
        let filas = '';
        
        for (let i = 1; i <= 10; i++) {
            const pregunta = preguntas.find(p => p.numero_pregunta === i);
            const respuestaUsuario = respuestasUsuario[`p${i}`];
            const area = this.preguntaAreas[i] || 'general';
            
            // Texto de la opción seleccionada
            let opcionTexto = '';
            if (respuestaUsuario === 'A') opcionTexto = pregunta?.opcion_a || 'Opción A';
            else if (respuestaUsuario === 'B') opcionTexto = pregunta?.opcion_b || 'Opción B';
            else if (respuestaUsuario === 'C') opcionTexto = pregunta?.opcion_c || 'Opción C';
            
            if (opcionTexto.length > 50) opcionTexto = opcionTexto.substring(0, 47) + '...';
            
            filas += `
                <tr>
                    <td class="text-center align-middle"><strong>${i}</strong></td>
                    <td class="align-middle">
                        <div><strong>${nombresArea[area] || area}</strong></div>
                        <small class="text-muted">${pregunta?.texto_pregunta?.substring(0, 60) || ''}${pregunta?.texto_pregunta?.length > 60 ? '...' : ''}</small>
                    </td>
                    <td class="align-middle">
                        <span class="badge bg-secondary me-2">${respuestaUsuario}</span>
                        <span>${opcionTexto}</span>
                    </td>
                    <td class="text-center align-middle">
                        <span class="badge bg-warning" style="font-size: 0.9rem;">
                            <i class="fas fa-hourglass-half me-1"></i> Pendiente
                        </span>
                    </td>
                </tr>
            `;
        }
        
        return filas;
    }
    generarDetalleEstrategas(pronostico, dineroPorBonificaciones) {
        // Si no hay estrategas, no mostrar nada
        if (!pronostico.estrategas_snapshot || pronostico.estrategas_snapshot.length === 0) {
            return '';
        }
        
        console.log("🎯 Generando detalle para estrategas:", pronostico.estrategas_snapshot);
        
        let html = `
            <div class="mt-3 pt-2" style="border-top: 1px solid #00d2be;">
                <div class="text-success fw-bold mb-2">
                    <i class="fas fa-star"></i> ✨ EXTRAS POR ESTRATEGAS:
                </div>
        `;
        
        // Recorrer cada estratega y mostrar su aporte
        pronostico.estrategas_snapshot.forEach((estratega, index) => {
            const nombre = estratega.nombre || 'Estratega';
            const especialidad = estratega.especialidad || estratega.bonificacion_tipo || 'general';
            const porcentaje = estratega.bonificacion_valor || 0;
            
            // Calcular cuánto generó este estratega (aproximado)
            const aporteAproximado = Math.round(dineroPorBonificaciones / pronostico.estrategas_snapshot.length);
            
            html += `
                <div class="mb-2" style="background: #1e1e1e; border-radius: 5px; padding: 8px; border-left: 3px solid #00d2be;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold">${nombre}</span>
                            <span class="badge bg-info ms-2">${especialidad}</span>
                            <div class="small text-muted">
                                <i class="fas fa-percentage text-success"></i> 
                                Bonificación: +${porcentaje}%
                            </div>
                        </div>
                        <div class="text-end">
                            <span class="text-success fw-bold">+${porcentaje}%</span><br>
                            <small class="text-info">≈ ${aporteAproximado.toLocaleString('es-ES')} €</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="d-flex justify-content-between mt-2 pt-2 fw-bold" style="border-top: 1px dashed #00d2be;">
                <span class="text-success">TOTAL BONIFICACIONES ESTRATEGAS:</span>
                <span class="text-success">+${dineroPorBonificaciones.toLocaleString('es-ES')} €</span>
            </div>
        `;
        
        return html;
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
    async cobrarDinero(pronosticoId, cantidad) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                this.mostrarError("Debes iniciar sesión");
                return;
            }
            
            // Mostrar confirmación
            if (!confirm(`¿Confirmas que quieres cobrar ${cantidad.toLocaleString('es-ES')} €?`)) {
                return;
            }
            
            // 1. Obtener dinero actual de la escudería
            const { data: escuderia, error: errorEscuderia } = await this.supabase
                .from('escuderias')
                .select('dinero')
                .eq('user_id', user.id)
                .single();
            
            if (errorEscuderia) throw errorEscuderia;
            
            const dineroActual = escuderia.dinero || 0;
            const nuevoDinero = dineroActual + cantidad;
            
            // 2. Actualizar dinero de la escudería
            const { error: errorUpdate } = await this.supabase
                .from('escuderias')
                .update({ dinero: nuevoDinero })
                .eq('user_id', user.id);
            
            if (errorUpdate) throw errorUpdate;
            
            // 3. Marcar pronóstico como cobrado
            const { error: errorPronostico } = await this.supabase
                .from('pronosticos_usuario')
                .update({ 
                    cobrado: true,
                    fecha_cobro: new Date().toISOString()
                })
                .eq('id', pronosticoId);
            
            if (errorPronostico) throw errorPronostico;
            
            // 4. Mostrar éxito y recargar
            this.mostrarNotificacionTemporal(`
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-check-circle" style="font-size: 30px; color: #00d2be;"></i>
                    <div>
                        <h5 style="margin: 0; color: #00d2be;">¡Dinero cobrado!</h5>
                        <p style="margin: 5px 0 0 0;">Se han añadido ${cantidad.toLocaleString('es-ES')} € a tu escudería</p>
                        <p style="margin: 0; font-size: 13px;">Nuevo saldo: ${nuevoDinero.toLocaleString('es-ES')} €</p>
                    </div>
                </div>
            `, 5000);
            
            // Recargar la vista para mostrar botón deshabilitado
            setTimeout(() => {
                this.cargarPantallaPronostico();
            }, 2000);
            
        } catch (error) {
            console.error("Error al cobrar:", error);
            this.mostrarError("Error al procesar el cobro");
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
        try {
            console.log("🔔 Creando notificaciones de resultados para carrera:", carreraId);
            
            // 1. Obtener TODOS los pronósticos de esta carrera con usuario_id
            const { data: pronosticos, error: errorPronosticos } = await this.supabase
                .from('pronosticos_usuario')
                .select(`
                    *,
                    escuderias!inner(usuario_id)
                `)
                .eq('carrera_id', carreraId);
            
            if (errorPronosticos || !pronosticos) {
                console.error("❌ Error obteniendo pronósticos:", errorPronosticos);
                return;
            }
            
            // 2. Obtener los resultados correctos de la carrera
            const { data: resultados, error: errorResultados } = await this.supabase
                .from('resultados_carrera')
                .select('respuestas_correctas')
                .eq('carrera_id', carreraId)
                .single();
            
            if (errorResultados || !resultados) {
                console.error("❌ Error obteniendo resultados:", errorResultados);
                return;
            }
            
            // 3. Obtener nombre del GP
            const { data: carrera, error: errorCarrera } = await this.supabase
                .from('calendario_gp')
                .select('nombre')
                .eq('id', carreraId)
                .single();
            
            if (errorCarrera || !carrera) {
                console.error("❌ Error obteniendo nombre del GP:", errorCarrera);
                return;
            }
            
            const respuestasCorrectas = resultados.respuestas_correctas;
            const notificaciones = [];
            
            // 4. Procesar cada pronóstico y calcular sus aciertos
            for (const pronostico of pronosticos) {
                const usuarioId = pronostico.escuderias?.usuario_id;
                if (!usuarioId) continue;
                
                // Calcular cuántos aciertos tuvo
                let aciertos = 0;
                const respuestasUsuario = pronostico.respuestas;
                
                for (let i = 1; i <= 10; i++) {
                    if (respuestasUsuario[`p${i}`] === respuestasCorrectas[`p${i}`]) {
                        aciertos++;
                    }
                }
                
                // Calcular puntos si tuvo aciertos
                let puntosFinales = 0;
                if (aciertos > 0) {
                    const puntosBase = aciertos * 100;
                    
                    // Aplicar bonificaciones de estrategas
                    let bonificacionTotal = 0;
                    const estrategas = pronostico.estrategas_snapshot || [];
                    
                    estrategas.forEach(estratega => {
                        if (estratega.bonificacion_valor) {
                            bonificacionTotal += estratega.bonificacion_valor;
                        }
                    });
                    
                    puntosFinales = Math.round(puntosBase * (1 + bonificacionTotal / 100));
                }
                
                // Crear notificación personalizada según resultados
                if (aciertos > 0) {
                    // ✅ Tuvo aciertos - notificación de éxito
                    notificaciones.push({
                        usuario_id: usuarioId,
                        tipo: 'pronostico',
                        titulo: '🎯 ¡Pronóstico acertado!',
                        mensaje: `Acertaste ${aciertos}/10 en ${carrera.nombre} y ganaste ${puntosFinales} puntos`,
                        relacion_id: carreraId,
                        tipo_relacion: 'gp',
                        fecha_creacion: new Date().toISOString(),
                        vista: false
                    });
                } else {
                    // ❌ No acertó nada - notificación informativa
                    notificaciones.push({
                        usuario_id: usuarioId,
                        tipo: 'pronostico',
                        titulo: '📊 Resultados disponibles',
                        mensaje: `Ya puedes ver los resultados del GP ${carrera.nombre}. Esta vez no hubo aciertos, ¡suerte en la próxima!`,
                        relacion_id: carreraId,
                        tipo_relacion: 'gp',
                        fecha_creacion: new Date().toISOString(),
                        vista: false
                    });
                }
            }
            
            // 5. Insertar todas las notificaciones de una vez (MÁS EFICIENTE)
            if (notificaciones.length > 0) {
                const { error: insertError } = await this.supabase
                    .from('notificaciones_usuarios')
                    .insert(notificaciones);
                
                if (insertError) {
                    console.error("❌ Error insertando notificaciones:", insertError);
                } else {
                    console.log(`✅ ${notificaciones.length} notificaciones creadas correctamente`);
                }
            }
            
        } catch (error) {
            console.error("💥 Error en crearNotificacionesResultados:", error);
        }
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
