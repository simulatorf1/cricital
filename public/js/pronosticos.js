// pronosticos.js - VERSIÓN COMPATIBLE CON TU SISTEMA
console.log("📊 Sistema de pronósticos cargado");

class PronosticosManager {

    constructor() {
        console.log("📊 Sistema de pronósticos cargado");
        this.supabase = window.supabaseCliente || window.adminPronosticos?.supabase || window.supabase;
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
        this.usuarioAceptoCondiciones = false;
        this.injectarEstilos();
        
        // 🔥 NUEVO: Escuchar evento de resultados guardados
        window.addEventListener('resultados-guardados', (event) => {
            console.log("📢 Evento recibido: resultados guardados para carrera", event.detail?.carreraId);
            
            // Si la carrera que se guardó es la actual, recargar pantalla
            if (this.carreraActual && this.carreraActual.id === event.detail?.carreraId) {
                console.log("🔄 Recargando pantalla de pronósticos por nuevos resultados");
                
                // Mostrar notificación
                this.mostrarNotificacionTemporal(`
                    <div style="background: #003300; border-left: 4px solid #00d2be; padding: 12px;">
                        <strong>📊 ¡Resultados publicados!</strong>
                        <p>Ya puedes ver los resultados de ${this.carreraActual.nombre}</p>
                    </div>
                `);
                
                // Recargar después de 2 segundos
                setTimeout(() => {
                    this.cargarPantallaPronostico();
                }, 2000);
            }
        });
    }

    injectarEstilos() {
        if (document.getElementById('estilos-pronosticos-f1')) return;
        
        const estilos = `
            /* ========== ESTILOS F1 NORMALIZADOS ========== */
            
            /* Contenedor principal */
            .pronostico-container {
                padding: 12px;
                background: #0a0a0a;
                color: #e0e0e0;
                font-family: 'Segoe UI', Roboto, Arial, sans-serif;
                font-size: 14px;
                line-height: 1.4;
            }
            
            /* Tarjetas */
            .card {
                background: #1a1a1a;
                border-radius: 6px;
                border: 1px solid #333;
                margin-bottom: 12px;
            }
            
            .card-header {
                background: #0066cc;
                padding: 10px 12px;
                color: white;
                border-bottom: 1px solid #00d2be;
                font-weight: 600;
            }
            
            .card-header h4, .card-header h5, .card-header h6 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
            }
            
            .card-body {
                padding: 12px;
            }
            
            /* Botones */
            .btn {
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 13px;
                font-weight: 500;
                border: 1px solid transparent;
                cursor: pointer;
                display: inline-block;
            }
            
            .btn-success {
                background: #00d2be;
                color: #000;
                font-weight: 600;
            }
            
            .btn-primary {
                background: #e10600;
                color: white;
            }
            
            .btn-outline-secondary {
                background: transparent;
                border-color: #444;
                color: #ccc;
            }
            
            .btn-outline-info {
                background: transparent;
                border-color: #17a2b8;
                color: #17a2b8;
            }
            
            .btn-outline-info:hover {
                background: #17a2b8;
                color: white;
            }
            
            .btn-sm {
                padding: 6px 10px;
                font-size: 12px;
            }
            
            .btn-lg {
                padding: 10px 16px;
                font-size: 15px;
            }
            
            /* Preguntas */
            .pregunta-card {
                background: #222;
                border-radius: 4px;
                padding: 12px;
                margin-bottom: 10px;
                border-left: 3px solid #00d2be;
            }
            
            .pregunta-card h5, .pregunta-card h6 {
                color: #00d2be;
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
            }
            
            /* Opciones de respuesta */
            .opciones {
                display: grid;
                gap: 6px;
                margin-top: 8px;
            }
            
            .opcion {
                position: relative;
            }
            
            .opcion input[type="radio"] {
                display: none;
            }
            
            .opcion label {
                display: block;
                padding: 10px 12px;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 4px;
                cursor: pointer;
                color: #ddd;
                font-size: 13px;
                transition: all 0.2s;
            }
            
            .opcion input[type="radio"]:checked + label {
                background: #003333;
                border-color: #00d2be;
                color: white;
            }
            
            .opcion label strong {
                color: #00d2be;
                margin-right: 6px;
            }
            
            /* Badges */
            .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .bg-success { background: #00d2be; color: #000; }
            .bg-danger { background: #e10600; color: white; }
            .bg-warning { background: #ffb400; color: #000; }
            .bg-info { background: #0066cc; color: white; }
            .bg-secondary { background: #444; color: #ccc; }
            
            /* Tablas */
            .table {
                width: 100%;
                background: #1a1a1a;
                border-radius: 4px;
                border-collapse: collapse;
                font-size: 13px;
            }
            
            .table thead {
                background: #0066cc;
            }
            
            .table th {
                padding: 8px 10px;
                color: white;
                font-weight: 600;
                text-align: left;
            }
            
            .table td {
                padding: 8px 10px;
                color: #ddd;
                border-bottom: 1px solid #333;
            }
            
            .table-success td { background: rgba(0, 210, 190, 0.1); }
            .table-danger td { background: rgba(225, 6, 0, 0.1); }
            
            .table-sm th, .table-sm td {
                padding: 6px 8px;
                font-size: 12px;
            }
            
            /* Alertas */
            .alert {
                padding: 10px 12px;
                margin: 8px 0;
                border-radius: 4px;
                font-size: 13px;
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
                color: #ff8a8a;
            }
            
            .alert-warning {
                border-color: #ffb400;
                background: rgba(255, 180, 0, 0.1);
                color: #ffd966;
            }
            
            .alert-info {
                border-color: #0066cc;
                background: rgba(0, 102, 204, 0.1);
                color: #99ccff;
            }
            
            /* Stats */
            .stat-card {
                background: #222;
                border-radius: 4px;
                padding: 10px;
                text-align: center;
                border: 1px solid #333;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: 600;
                color: #00d2be;
                margin: 4px 0;
            }
            
            .stat-value-mini {
                font-size: 18px;
                font-weight: 600;
                color: #00d2be;
            }
            
            /* Estrategas */
            .estratega-mini {
                background: #222;
                border-radius: 4px;
                padding: 8px 10px;
                margin-bottom: 6px;
                border-left: 3px solid #00d2be;
                font-size: 13px;
            }
            
            /* Grid */
            .row { display: flex; flex-wrap: wrap; margin: 0 -5px; }
            .col-md-3, .col-md-4, .col-md-6, .col-6 { padding: 0 5px; box-sizing: border-box; }
            .col-6 { width: 50%; }
            .col-md-3 { width: 25%; }
            .col-md-4 { width: 33.33%; }
            .col-md-6 { width: 50%; }
            
            /* Espaciados */
            .mb-1 { margin-bottom: 5px !important; }
            .mb-2 { margin-bottom: 10px !important; }
            .mb-3 { margin-bottom: 15px !important; }
            .mb-4 { margin-bottom: 20px !important; }
            .mt-1 { margin-top: 5px !important; }
            .mt-2 { margin-top: 10px !important; }
            .mt-3 { margin-top: 15px !important; }
            .mt-4 { margin-top: 20px !important; }
            .p-2 { padding: 10px !important; }
            .p-3 { padding: 15px !important; }
            
            /* Utilidades */
            .text-center { text-align: center; }
            .text-end { text-align: right; }
            .text-success { color: #00d2be; }
            .text-warning { color: #ffb400; }
            .text-info { color: #99ccff; }
            .text-muted { color: #888; }
            .fw-bold { font-weight: 600; }
            .small { font-size: 12px; }
            .border-top { border-top: 1px solid #333; }
            .border-secondary { border-color: #444; }
            .d-flex { display: flex; }
            .justify-content-between { justify-content: space-between; }
            .align-items-center { align-items: center; }
            .gap-2 { gap: 8px; }
            .d-grid { display: grid; }
            .d-block { display: block; }
            .me-1 { margin-right: 4px; }
            .me-2 { margin-right: 8px; }
            .ms-2 { margin-left: 8px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            
            /* Responsive */
            @media (max-width: 768px) {
                .col-md-3, .col-md-4, .col-md-6 { width: 100%; }
                .pronostico-container { padding: 8px; }
                .table { font-size: 12px; }
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'estilos-pronosticos-f1';
        style.textContent = estilos;
        document.head.appendChild(style);
    }
    async obtenerEstadisticasEscuderia() {
        if (!this.escuderiaId) return null;
        
        const { data, error } = await this.supabase
            .from('escuderias')
            .select('gp_participados, aciertos_totales, preguntas_totales')
            .eq('id', this.escuderiaId)
            .single();
        
        if (error || !data) return null;
        
        // Calcular porcentaje
        const porcentaje = data.preguntas_totales > 0 
            ? Math.round((data.aciertos_totales * 100 / data.preguntas_totales) * 100) / 100
            : 0;
        
        return {
            ...data,
            porcentaje: porcentaje,
            gp_faltantes: data.preguntas_totales / 10 // Número de GP participados
        };
    }
    async obtenerVueltaRapida() {
        if (!this.escuderiaId) return '--:--:---';
        
        const { data, error } = await this.supabase
            .from('pruebas_pista')
            .select('tiempo_formateado')
            .eq('escuderia_id', this.escuderiaId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        return data?.tiempo_formateado || '--:--:---';
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
        
        await this.cargarDatosUsuario(user.id);
        
        if (!this.escuderiaId) {
            this.mostrarError("No se pudo obtener tu escudería", container);
            return;
        }
        
        // Obtener TODOS los pronósticos anteriores
        const { data: pronosticosAnteriores } = await this.supabase
            .from('pronosticos_usuario')
            .select(`
                *,
                calendario_gp!inner(*)
            `)
            .eq('escuderia_id', this.escuderiaId)
            .order('fecha_pronostico', { ascending: false });
        
        // Obtener carreras que ya ha cobrado el usuario
        const { data: pronosticosCobrados } = await this.supabase
            .from('pronosticos_usuario')
            .select('carrera_id')
            .eq('escuderia_id', this.escuderiaId)
            .eq('cobrado', true);
        
        const carrerasCobradas = new Set(pronosticosCobrados?.map(p => p.carrera_id) || []);
        console.log("💰 Carreras ya cobradas:", Array.from(carrerasCobradas));
        
        const hoy = new Date();
        const fechaHoy = hoy.toISOString().split('T')[0];
        
        // Obtener TODAS las carreras desde hoy en adelante
        const { data: carreras } = await this.supabase
            .from('calendario_gp')
            .select('*')
            .gte('fecha_inicio', fechaHoy)
            .order('fecha_inicio', { ascending: true });
        
        if (!carreras || carreras.length === 0) {
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <div class="card">
                        <div class="card-header bg-info text-white py-2">
                            <h5 class="mb-0"><i class="fas fa-calendar"></i> Temporada finalizada</h5>
                        </div>
                        <div class="card-body py-3">
                            ${pronosticosAnteriores?.length > 0 ? this.renderizarSelectorHistorico(pronosticosAnteriores) : '<p class="text-muted">No hay pronósticos anteriores</p>'}
                            <button class="btn btn-outline-secondary btn-sm mt-3" onclick="window.tabManager.switchTab('principal')">Volver al inicio</button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Buscar la PRIMERA carrera que cumpla las condiciones
        let carreraSeleccionada = null;
        let tipoPantalla = 'pronosticar';
        let pronosticoExistente = null;
        let resultadosExistentes = null;
        
        for (const carrera of carreras) {
            // SALTAR carreras ya cobradas
            if (carrerasCobradas.has(carrera.id)) {
                console.log(`⏩ Carrera ${carrera.id} (${carrera.nombre}) ya cobrada, saltando`);
                continue;
            }
            
            const fechaInicio = new Date(carrera.fecha_inicio);
            
            // ✅ CORREGIDO: Calcular fecha límite correctamente (48 horas antes)
            const fechaLimite = new Date(carrera.fecha_limite_pronosticos || carrera.fecha_inicio);
            // Restar 48 horas de forma segura (en milisegundos)
            fechaLimite.setTime(fechaLimite.getTime() - (48 * 60 * 60 * 1000));
            
            // 📌 Para depuración (opcional, puedes borrar estas líneas después)
            console.log(`🔍 Carrera: ${carrera.nombre}`);
            console.log(`   📅 Fecha inicio: ${fechaInicio.toLocaleString()}`);
            console.log(`   ⏰ Fecha límite (48h antes): ${fechaLimite.toLocaleString()}`);
            console.log(`   🕐 Hoy: ${hoy.toLocaleString()}`);
            
            // Verificar si tiene pronóstico
            const { data: pronostico } = await this.supabase
                .from('pronosticos_usuario')
                .select('*')
                .eq('escuderia_id', this.escuderiaId)
                .eq('carrera_id', carrera.id)
                .maybeSingle();
            
            const tienePronostico = !!pronostico;
            
            // Verificar si tiene resultados
            const { data: resultados } = await this.supabase
                .from('resultados_carrera')
                .select('*')
                .eq('carrera_id', carrera.id)
                .maybeSingle();
            
            const tieneResultados = !!resultados;
            
            // CASO 1: Carrera con resultados
            if (tieneResultados) {
                if (tienePronostico) {
                    carreraSeleccionada = carrera;
                    pronosticoExistente = pronostico;
                    resultadosExistentes = resultados;
                    tipoPantalla = 'resultados';
                    break;
                } else {
                    continue;
                }
            }
            
            // CASO 2: Carrera pasada sin resultados
            if (hoy > fechaInicio && !tieneResultados) {
                if (tienePronostico) {
                    carreraSeleccionada = carrera;
                    pronosticoExistente = pronostico;
                    tipoPantalla = 'esperando';
                    break;
                } else {
                    continue;
                }
            }
            
            // CASO 3: Plazo expirado (entre fecha límite y fecha de inicio)
            if (hoy > fechaLimite && hoy <= fechaInicio) {
                carreraSeleccionada = carrera;
                if (tienePronostico) {
                    pronosticoExistente = pronostico;
                    tipoPantalla = 'enviado';
                } else {
                    tipoPantalla = 'expirado';
                }
                break;
            }
            
            // CASO 4: Dentro del plazo (antes de la fecha límite)
            if (hoy <= fechaLimite) {
                carreraSeleccionada = carrera;
                if (tienePronostico) {
                    pronosticoExistente = pronostico;
                    tipoPantalla = 'enviado';
                } else {
                    tipoPantalla = 'pronosticar';
                }
                break;
            }
        }
        
        // Si no encontramos ninguna, buscar la primera carrera NO cobrada
        if (!carreraSeleccionada && carreras.length > 0) {
            for (const carrera of carreras) {
                if (!carrerasCobradas.has(carrera.id)) {
                    carreraSeleccionada = carrera;
                    break;
                }
            }
            
            // Si todas las carreras están cobradas
            if (!carreraSeleccionada) {
                const historicoHTML = pronosticosAnteriores?.length > 0 ? 
                    this.renderizarSelectorHistorico(pronosticosAnteriores) : 
                    this.renderizarSelectorHistoricoVacio();
                
                container.innerHTML = `
                    <div class="pronostico-container compacto">
                        <div class="card">
                            <div class="card-header bg-success text-white py-2">
                                <h5 class="mb-0"><i class="fas fa-check-circle"></i> ¡Has cobrado todos los pronósticos!</h5>
                            </div>
                            <div class="card-body py-3">
                                <p class="mb-3">Has cobrado todas las carreras disponibles. Vuelve más tarde para nuevas carreras.</p>
                                ${historicoHTML}
                                <button class="btn btn-outline-secondary btn-sm mt-3" onclick="window.tabManager.switchTab('principal')">
                                    <i class="fas fa-home"></i> Volver al inicio
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            const fechaLimite = new Date(carreraSeleccionada.fecha_limite_pronosticos || carreraSeleccionada.fecha_inicio);
            fechaLimite.setHours(fechaLimite.getHours() - 48);
            
            const { data: pronostico } = await this.supabase
                .from('pronosticos_usuario')
                .select('id')
                .eq('escuderia_id', this.escuderiaId)
                .eq('carrera_id', carreraSeleccionada.id)
                .maybeSingle();
            
            if (pronostico) {
                tipoPantalla = 'enviado';
            } else if (hoy > fechaLimite) {
                tipoPantalla = 'expirado';
            } else {
                tipoPantalla = 'pronosticar';
            }
        }
        
        // Establecer carrera actual
        this.carreraActual = carreraSeleccionada;
        this.pronosticoGuardado = !!pronosticoExistente;
        await this.cargarPreguntasCarrera(carreraSeleccionada.id);
        
        // Histórico siempre arriba
        const historicoHTML = pronosticosAnteriores?.length > 0 ? 
            this.renderizarSelectorHistorico(pronosticosAnteriores) : 
            this.renderizarSelectorHistoricoVacio();
        
        // RENDERIZAR SEGÚN TIPO
        if (tipoPantalla === 'resultados') {
            const { data: preguntas } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraSeleccionada.id)
                .order('numero_pregunta');
            
            this.mostrarVistaPronosticoGuardado(pronosticoExistente, preguntas || [], resultadosExistentes?.respuestas_correctas || {});
            return;
        }
        
        if (tipoPantalla === 'esperando') {
            const { data: preguntas } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraSeleccionada.id)
                .order('numero_pregunta');
            
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <div class="card">
                        <div class="card-header bg-warning text-dark py-2">
                            <h5 class="mb-0"><i class="fas fa-hourglass-half"></i> ${carreraSeleccionada.nombre} - Finalizada</h5>
                        </div>
                        <div class="card-body py-3">
                            ${historicoHTML}
                            
                            <div class="alert alert-warning">
                                <i class="fas fa-clock me-2"></i>
                                <strong>La carrera ya finalizó</strong>
                                <p class="mb-0 mt-1">Los resultados se publicarán pronto. Vuelve más tarde.</p>
                            </div>
                            
                            <div class="d-grid gap-2 mt-3">
                                <button class="btn btn-primary btn-sm" onclick="window.pronosticosManager.verPronosticoGuardado()">
                                    <i class="fas fa-eye"></i> Ver mi pronóstico
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        if (tipoPantalla === 'expirado') {
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <div class="card">
                        <div class="card-header bg-danger text-white py-2">
                            <h5 class="mb-0"><i class="fas fa-clock"></i> Plazo expirado</h5>
                        </div>
                        <div class="card-body py-3">
                            ${historicoHTML}
                            
                            <div class="alert alert-warning mb-3">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>El plazo para pronosticar ${carreraSeleccionada.nombre} ha expirado.</strong>
                                <p class="mt-2 mb-0">No realizaste pronóstico para esta carrera.</p>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary btn-sm" onclick="window.location.reload()">
                                    <i class="fas fa-sync"></i> Ver siguiente carrera
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
        

        if (tipoPantalla === 'enviado') {
            // 📌 CASO 1: PRONÓSTICO ENVIADO (pendiente de resultados)
            const carreraEnviada = carreraSeleccionada;
            
            // Buscar la SIGUIENTE carrera (para mostrarla como información, no para pronosticar)
            const { data: siguienteCarrera } = await this.supabase
                .from('calendario_gp')
                .select('*')
                .gt('fecha_inicio', carreraSeleccionada.fecha_inicio)
                .order('fecha_inicio', { ascending: true })
                .limit(1)
                .maybeSingle();
            
            // Calcular fecha estimada de resultados (24h después de la carrera)
            const fechaCarrera = new Date(carreraEnviada.fecha_inicio);
            fechaCarrera.setHours(fechaCarrera.getHours() + 24);
            const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <!-- Histórico siempre arriba -->
                    ${historicoHTML}
                    
                    <!-- Mensaje principal - PRONÓSTICO ENVIADO CORRECTAMENTE -->
                    <div class="card mb-3" style="background: linear-gradient(145deg, #0a2a1a 0%, #1a3a1a 100%); border: 2px solid #00d2be; box-shadow: 0 0 15px rgba(0,210,190,0.3);">
                        <div class="card-body py-4">
                            <div class="d-flex align-items-center gap-4">
                                <div style="font-size: 60px; color: #00d2be; filter: drop-shadow(0 0 10px rgba(0,210,190,0.5));">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div>
                                    <h4 class="text-success mb-2" style="color: #00d2be !important; font-weight: 700;">✅ ¡PRONÓSTICO ENVIADO CORRECTAMENTE!</h4>
                                    <p class="mb-1 fs-5"><strong style="color: #fff;">${carreraEnviada.nombre}</strong></p>
                                    <p class="mb-0" style="color: #ccc;">Tu pronóstico ha sido registrado en el sistema.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Estado del pronóstico -->
                    <div class="card mb-3">
                        <div class="card-header bg-info text-white py-2">
                            <h5 class="mb-0"><i class="fas fa-hourglass-half me-2"></i> ESTADO DE TU PRONÓSTICO</h5>
                        </div>
                        <div class="card-body py-3">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center mb-3">
                                        <div style="width: 40px; height: 40px; background: #ffb400; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                            <i class="fas fa-clock" style="color: #000;"></i>
                                        </div>
                                        <div>
                                            <h6 class="mb-1" style="color: #ffb400;">⏳ PENDIENTE DE RESULTADOS</h6>
                                            <p class="mb-0 small text-muted">La carrera aún no ha finalizado</p>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <span class="badge bg-warning text-dark p-3 fs-6">
                                            <i class="fas fa-calendar me-2"></i> Resultados estimados: ${fechaResultados}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card bg-dark border-secondary">
                                        <div class="card-body py-2">
                                            <h6 class="text-info mb-2"><i class="fas fa-chart-simple me-2"></i>Resumen</h6>
                                            <div class="d-flex justify-content-between mb-1">
                                                <span class="text-muted">Carrera:</span>
                                                <span class="fw-bold">${carreraEnviada.nombre}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-1">
                                                <span class="text-muted">Fecha:</span>
                                                <span>${new Date(carreraEnviada.fecha_inicio).toLocaleDateString('es-ES')}</span>
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <span class="text-muted">Tus estrategas:</span>
                                                <span class="badge bg-info">${this.estrategasActivos?.length || 0} activos</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información de la siguiente carrera (solo informativa) -->
                    ${siguienteCarrera ? `
                        <div class="card">
                            <div class="card-header bg-dark text-white py-2">
                                <h5 class="mb-0"><i class="fas fa-flag-checkered me-2"></i> PRÓXIMO GRAN PREMIO</h5>
                            </div>
                            <div class="card-body py-3">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h6 class="mb-1">${siguienteCarrera.nombre}</h6>
                                        <p class="small text-muted mb-0">${new Date(siguienteCarrera.fecha_inicio).toLocaleDateString('es-ES')}</p>
                                    </div>
                                    <span class="badge bg-secondary">Próximamente</span>
                                </div>
                                <p class="small text-info mt-2 mb-0">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Podrás pronosticar cuando finalice la carrera actual
                                </p>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Botones de acción -->
                    <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-outline-primary flex-grow-1" onclick="window.pronosticosManager.verPronosticoGuardado()">
                            <i class="fas fa-eye me-2"></i> VER MI PRONÓSTICO
                        </button>
                        <button class="btn btn-outline-secondary" onclick="window.tabManager.switchTab('principal')">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                </div>
            `;
            
            return;
        }
        
        // Si llegamos aquí, es porque es tipo 'pronosticar'
        if (!this.usuarioAceptoCondiciones) {
            this.mostrarCondicionesInicialesConHistorico(container, pronosticosAnteriores || []);
        } else {
            this.mostrarPreguntasPronosticoConHistorico(container, pronosticosAnteriores || []);
        }
    } // ← 🔥 ESTA ES LA LLAVE QUE CIERRA LA FUNCIÓN cargarPantallaPronostico()
    

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
        
        // 🔥 HISTÓRICO SIEMPRE ARRIBA
        const historicoHTML = this.renderizarSelectorHistorico(historico);
        
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
    
        // 🔥 NUEVO: Obtener estadísticas (justo antes del container.innerHTML)
        const statsPromise = this.obtenerEstadisticasEscuderia();
        
        container.innerHTML = `
            <div class="pronosticos-container-f1 compacto">
                <div class="card">
                    <div class="card-header bg-dark text-white py-2">
                        <h5 class="mb-0"><i class="fas fa-flag-checkered"></i> Pronóstico - ${this.carreraActual.nombre}</h5>
                    </div>
                    <div class="card-body py-3">
                        ${historicoHTML}
                        
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
                                <strong>Importante:</strong> Cuanto más tarde hagas el pronóstico, aumentará tu probabilidad de acertar y además podrás mejorar tu vuelta rapida ya que se guardarán los datos de <strong>hoy</strong> (${new Date().toLocaleDateString('es-ES')}), no los del día de la carrera.
                            </small>
                        </div>
                        
                        <!-- 🔥 AQUÍ VAN LAS ESTADÍSTICAS (después del alert) -->
                        <div id="estadisticas-container"></div>
                        
                        <div class="d-flex gap-2">

                            <button class="btn btn-success flex-grow-1" onclick="window.pronosticosManager.verificarYEmpezarPronostico()">
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
    
        // 🔥 Cargar estadísticas después de renderizar
        statsPromise.then(stats => {
            const statsContainer = document.getElementById('estadisticas-container');
            if (statsContainer && stats) {
                statsContainer.innerHTML = `
                    <div class="card mb-3" style="background: #0a2a1a; border: 1px solid #00d2be;">
                        <div class="card-body py-2">
                            <h6 class="text-info mb-2"><i class="fas fa-chart-line me-2"></i>TU HISTORIAL DE ACIERTOS</h6>
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="stat-value-mini">${stats.gp_participados || 0}</div>
                                    <small class="text-muted">GP disputados</small>
                                </div>
                                <div class="col-4">
                                    <div class="stat-value-mini">${stats.aciertos_totales || 0}/${stats.preguntas_totales || 0}</div>
                                    <small class="text-muted">Aciertos</small>
                                </div>
                                <div class="col-4">
                                    <div class="stat-value-mini text-warning">${stats.porcentaje || 0}%</div>
                                    <small class="text-muted">Precisión</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }
    renderizarSelectorHistorico(historico) {
        // SIEMPRE devuelve el contenedor, aunque esté vacío
        let opcionesHistorico = '';
        
        if (historico && historico.length > 0) {
            opcionesHistorico = historico.map(p => {
                const fecha = p.calendario_gp?.fecha_inicio ? new Date(p.calendario_gp.fecha_inicio).toLocaleDateString('es-ES') : '';
                const estado = p.estado === 'calificado' ? '✅ Resultados' : '⏳ Pendiente';
                return `
                    <option value="${p.id}" data-carrera-id="${p.carrera_id}">
                        ${p.calendario_gp?.nombre || 'Carrera'} - ${fecha} (${estado})
                    </option>
                `;
            }).join('');
        } else {
            opcionesHistorico = '<option value="">-- No hay pronósticos anteriores --</option>';
        }
        
        return `
            <div class="historico-pronosticos mb-3 p-3" style="background: #1a1a1a; border-radius: 8px; border: 2px solid #00d2be;">
                <h6 class="text-info mb-3"><i class="fas fa-history me-2"></i>Consultar pronósticos anteriores:</h6>
                <div class="d-flex gap-2 align-items-center">
                    <select id="selectorHistoricoPronosticos" class="form-select form-select-lg bg-dark text-white border-secondary" style="width: 50%; font-size: 16px; padding: 12px;">
                        ${opcionesHistorico}
                    </select>
                    <button class="btn btn-outline-info btn-lg" onclick="window.pronosticosManager.verPronosticoSeleccionado()" style="font-size: 16px; padding: 12px 20px;">
                        <i class="fas fa-eye me-2"></i> Ver
                    </button>
                </div>
            </div>
        `;
    }
    renderizarSelectorHistoricoVacio() {
        return `
            <div class="historico-pronosticos mb-3 p-3" style="background: #1a1a1a; border-radius: 8px; border: 2px solid #00d2be;">
                <h6 class="text-info mb-3"><i class="fas fa-history me-2"></i>Consultar pronósticos anteriores:</h6>
                <div class="d-flex gap-2 align-items-center">
                    <select class="form-select form-select-lg bg-dark text-white border-secondary" style="width: 50%; font-size: 16px; padding: 12px;">
                        <option value="">-- No hay pronósticos anteriores --</option>
                    </select>
                    <button class="btn btn-outline-secondary btn-lg" disabled style="font-size: 16px; padding: 12px 20px;">
                        <i class="fas fa-eye me-2"></i> Ver
                    </button>
                </div>
            </div>
        `;
    }   
    generarDatosGuardado() {
        const fechaCarrera = new Date(this.carreraActual.fecha_inicio);
        fechaCarrera.setHours(fechaCarrera.getHours() + 24);
        const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Obtener vuelta rápida del DOM si ya existe, si no mostrar carga
        const vueltaElement = document.getElementById('vuelta-rapida-valor');
        const vueltaTexto = vueltaElement ? vueltaElement.textContent : '--:--:---';
        
        return `
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
                                <div class="stat-value-mini" id="vuelta-rapida-datos">
                                    ${vueltaTexto}
                                </div>
                                <small class="text-muted">mejor tiempo</small>
                            </td>
                            <td class="text-center">
                                <div class="stat-value-mini">${this.estrategasActivos?.length || 0}</div>
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
            <input type="hidden" id="puntos-coche-ocultos" value="${this.usuarioPuntos || 0}">
        `;
    }
    async cargarVueltaRapidaParaSiguiente() {
        if (!this.escuderiaId) return;
        
        const { data, error } = await this.supabase
            .from('pruebas_pista')
            .select('tiempo_formateado')
            .eq('escuderia_id', this.escuderiaId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        const vueltaElement = document.getElementById('vuelta-rapida-datos');
        if (vueltaElement) {
            vueltaElement.textContent = data?.tiempo_formateado || '--:--:---';
        }
    } 
    async obtenerVueltaRapida() {
        if (!this.escuderiaId) return '--:--:---';
        
        const { data, error } = await this.supabase
            .from('pruebas_pista')
            .select('tiempo_formateado')
            .eq('escuderia_id', this.escuderiaId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        return data?.tiempo_formateado || '--:--:---';
    }
    
    async cargarVueltaRapidaParaElemento(elementId) {
        const vuelta = await this.obtenerVueltaRapida();
        const elemento = document.getElementById(elementId);
        if (elemento) elemento.textContent = vuelta;
    }

        
    async verificarYEmpezarPronostico() {
        console.log("🔍 Verificando si hay preguntas para:", this.carreraActual?.nombre);
        
        // Verificar si hay preguntas en la base de datos para esta carrera
        const { data: preguntas, error } = await this.supabase
            .from('preguntas_pronostico')
            .select('count')
            .eq('carrera_id', this.carreraActual.id)
            .single();
        
        // Si no hay preguntas o hay error
        if (error || !preguntas || preguntas.count === 0) {
            console.log("❌ No hay preguntas disponibles");
            
            // ✅ USAR LA NUEVA FUNCIÓN UNIFICADA
            await this.mostrarPantallaNoDisponible(
                this.carreraActual, 
                'Espera a que el administrador publique las preguntas.'
            );
            return;
        }
        
        // Si hay preguntas, continuar normalmente
        console.log("✅ Hay preguntas disponibles, iniciando pronóstico");
        this.usuarioAceptoCondiciones = true;
        
        const container = document.getElementById('main-content') || 
                         document.querySelector('.tab-content.active');
        
        if (container) {
            const { data: pronosticosAnteriores } = await this.supabase
                .from('pronosticos_usuario')
                .select(`
                    *,
                    calendario_gp!inner(*)
                `)
                .eq('escuderia_id', this.escuderiaId)
                .order('fecha_pronostico', { ascending: false });
            
            this.mostrarPreguntasPronosticoConHistorico(container, pronosticosAnteriores || []);
        }
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
        console.log("🔍 Buscando próxima carrera...");
        
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const { data: { user } } = await this.supabase.auth.getUser();
        await this.cargarDatosUsuario(user.id);
        
        // Obtener pronósticos anteriores
        const { data: pronosticosExistentes } = await this.supabase
            .from('pronosticos_usuario')
            .select(`
                *,
                calendario_gp!inner(*)
            `)
            .eq('escuderia_id', this.escuderiaId)
            .order('fecha_pronostico', { ascending: false });
        
        const hoy = new Date();
        const fechaHoy = hoy.toISOString().split('T')[0];
        
        // Buscar la siguiente carrera (fecha_inicio > hoy)
        const { data: carreras } = await this.supabase
            .from('calendario_gp')
            .select('*')
            .gte('fecha_inicio', fechaHoy)
            .order('fecha_inicio', { ascending: true });
        
        if (carreras && carreras.length > 0) {
            // Encontrar la primera que NO sea la actual
            let siguienteCarrera = null;
            
            if (this.carreraActual) {
                siguienteCarrera = carreras.find(c => c.id !== this.carreraActual.id);
            }
            
            if (!siguienteCarrera) {
                siguienteCarrera = carreras[0];
            }
            
            this.carreraActual = siguienteCarrera;
            
            // Verificar si ya tiene pronóstico
            const { data: pronosticoActual } = await this.supabase
                .from('pronosticos_usuario')
                .select('id')
                .eq('escuderia_id', this.escuderiaId)
                .eq('carrera_id', this.carreraActual.id)
                .maybeSingle();
            
            this.pronosticoGuardado = !!pronosticoActual;
            
            await this.cargarPreguntasCarrera(this.carreraActual.id);
            
            // Resetear aceptación de condiciones para la nueva carrera
            this.usuarioAceptoCondiciones = false;
            
            // Mostrar la nueva carrera
            this.mostrarPantallaPrincipal(container, pronosticosExistentes || []);
            
        } else {
            // No hay más carreras
            container.innerHTML = `
                <div class="pronostico-container compacto">
                    <div class="card">
                        <div class="card-header bg-info text-white py-2">
                            <h5 class="mb-0"><i class="fas fa-calendar"></i> No hay más carreras</h5>
                        </div>
                        <div class="card-body py-3">
                            ${pronosticosExistentes && pronosticosExistentes.length > 0 ? 
                                this.renderizarSelectorHistorico(pronosticosExistentes) : 
                                '<p class="text-muted">No hay pronósticos anteriores</p>'
                            }
                            <button class="btn btn-outline-secondary btn-sm mt-3" onclick="window.tabManager.switchTab('principal')">
                                <i class="fas fa-home"></i> Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            `;
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
    generarVistaPronosticoEnviado(carrera, pronostico, preguntas, historico) {
        return `
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
                                    <strong class="d-block">${carrera.nombre}</strong>
                                    <small>Ya has enviado tu pronóstico</small>
                                </div>
                            </div>
                        </div>
                        
                        ${historico?.length > 0 ? this.renderizarSelectorHistorico(historico) : ''}
                        
                        <div class="d-grid gap-2 mt-3">
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
                                <strong>Importante:</strong> Cuanto más tarde hagas el pronóstico, más puntos tendrás, ya que se guardarán los puntos de <strong>hoy</strong> (${new Date().toLocaleDateString('es-ES')}), no los del día de la carrera. Recuerda que las piezas que ten venían bien en una carrera no tienen porque venirte bien para las siguietnes.
                            </small>
                        </div>
                        
                        <div class="mt-3">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> 
                                Estos datos se guardarán y se tendrán en cuenta para el cálculo final
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-success flex-grow-1" onclick="window.pronosticosManager.verificarYEmpezarPronostico()">
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
    
    async iniciarPronostico() {
        console.log("🔍 VERIFICANDO INICIO DE PRONÓSTICO");
        console.log("Carrera actual:", this.carreraActual);
        
        try {
            // 1. Verificar si hay preguntas
            console.log("📡 Consultando preguntas para carrera ID:", this.carreraActual?.id);
            
            const { data: preguntas, error, status } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', this.carreraActual.id);
            
            console.log("📊 RESULTADO CONSULTA:", { 
                status,
                hayError: !!error,
                errorMsg: error?.message,
                preguntasEncontradas: preguntas?.length || 0,
                esArray: Array.isArray(preguntas),
                primerElemento: preguntas?.[0]
            });
            
            // 2. Verificar si NO hay preguntas
            if (error) {
                console.error("❌ Error en consulta:", error);
                this.mostrarNotificacionTemporal(`Error al verificar preguntas: ${error.message}`, 4000);
                return;
            }
            
            if (!preguntas || preguntas.length === 0) {
                console.log("❌ No se encontraron preguntas");
                this.mostrarNotificacionTemporal(`
                    <div style="background: #330000; border-left: 4px solid #e10600; padding: 15px;">
                        <h5 style="color: #ff8a8a;">⏳ Apuestas no disponibles</h5>
                        <p style="color: #ffb3b3;">No hay preguntas para ${this.carreraActual?.nombre}</p>
                    </div>
                `, 4000);
                return;
            }
            
            // 3. Si llegamos aquí, HAY preguntas
            console.log("✅ HAY PREGUNTAS:", preguntas.length);
            
            // 4. Guardar las preguntas en this.preguntasActuales
            this.preguntasActuales = preguntas;
            
            // 5. Continuar con el flujo normal
            this.usuarioAceptoCondiciones = true;
            
            const container = document.querySelector('.pronosticos-container-f1')?.parentElement || 
                             document.getElementById('main-content') || 
                             document.querySelector('.tab-content.active');
            
            if (container) {
                // Obtener histórico
                const { data: pronosticosAnteriores } = await this.supabase
                    .from('pronosticos_usuario')
                    .select(`
                        *,
                        calendario_gp!inner(*)
                    `)
                    .eq('escuderia_id', this.escuderiaId)
                    .order('fecha_pronostico', { ascending: false });
                
                // Mostrar preguntas con histórico
                this.mostrarPreguntasPronosticoConHistorico(container, pronosticosAnteriores || []);
            }
            
        } catch (error) {
            console.error("💥 Error en iniciarPronostico:", error);
            this.mostrarNotificacionTemporal(`Error inesperado: ${error.message}`, 4000);
        }
    }
    
    async guardarPronostico() {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return;
        
        // Verificar que no haya ya un pronóstico (doble seguro)
        const { data: yaExiste } = await this.supabase
            .from('pronosticos_usuario')
            .select('id')
            .eq('escuderia_id', this.escuderiaId)
            .eq('carrera_id', this.carreraActual.id)
            .maybeSingle();
        
        if (yaExiste) {
            this.mostrarError("Ya tienes un pronóstico para esta carrera");
            this.pronosticoGuardado = true;
            setTimeout(() => this.cargarPantallaPronostico(), 2000);
            return;
        }
        
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
        
        const bonificacionesAplicadas = {};
        
        this.estrategasActivos.forEach(estratega => {
            const areaEstratega = (estratega.bonificacion_tipo || estratega.especialidad || '').toLowerCase();
            if (!areaEstratega) return;
            
            const preguntasAfectadas = [];
            
            for (let i = 1; i <= 10; i++) {
                const areaPregunta = this.preguntaAreas[i]?.toLowerCase() || '';
                
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
                    bonificaciones_aplicadas: bonificacionesAplicadas,
                    fecha_pronostico: new Date().toISOString(),
                    estado: 'pendiente'
                }]);
            
            if (error) throw error;
            
            this.mostrarNotificacionTemporal(`
                <div class="notificacion-exito">
                    <i class="fas fa-check-circle text-success" style="font-size: 24px;"></i>
                    <div>
                        <h5 style="margin: 0 0 5px 0; color: #00d2be;">¡Pronóstico enviado!</h5>
                        <p style="margin: 0; font-size: 14px;">Tu pronóstico para <strong>${this.carreraActual.nombre}</strong> ha sido registrado correctamente.</p>
                    </div>
                </div>
            `);
            
            // 🔥 FORZAR que se marque como guardado
            this.pronosticoGuardado = true;
            
            // 🔥 Recargar la pantalla para que muestre "Pronóstico enviado"
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
    async verificarEstadisticasEscuderia() {
        if (!this.escuderiaId) return;
        
        const { data, error } = await this.supabase
            .from('escuderias')
            .select('gp_participados, aciertos_totales, preguntas_totales')
            .eq('id', this.escuderiaId)
            .single();
        
        console.log("📊 ESTADÍSTICAS ACTUALES:", data);
        console.log("📊 GP participados:", data?.gp_participados);
        console.log("📊 Aciertos totales:", data?.aciertos_totales);
        console.log("📊 Preguntas totales:", data?.preguntas_totales);
        
        return data;
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
                                <p class="mb-0 mt-1">Los resultados se publicarán después de la carrera.</p>
                            </div>
                            
                            <!-- SOLO PREGUNTAS CON BONIFICACIONES INCLUIDAS -->
                            <h6 class="mb-3"><i class="fas fa-list me-2"></i> Tu pronóstico:</h6>
                            <div class="table-responsive mb-4">
                                <table class="table table-sm table-dark table-hover">
                                    <thead class="bg-secondary">
                                        <tr>
                                            <th class="text-center" width="5%">#</th>
                                            <th width="45%">Pregunta</th>
                                            <th width="25%">Tu respuesta</th>
                                            <th width="25%">Bonificación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.generarFilasPronosticoConBonificaciones(preguntas, respuestasUsuario, pronostico.bonificaciones_aplicadas)}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-hourglass-half me-2"></i>
                                <strong>Resumen:</strong> Cuando se publiquen los resultados, sabrás cuántos aciertos tuviste.
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-secondary" onclick="window.pronosticosManager.cargarPantallaPronostico()">
                                    <i class="fas fa-arrow-left me-2"></i> Volver
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
    generarFilasPronosticoConBonificaciones(preguntas, respuestasUsuario, bonificacionesAplicadas) {
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
            
            // Buscar qué estrategas bonifican esta pregunta
            let estrategasQueBonifican = [];
            if (bonificacionesAplicadas) {
                Object.values(bonificacionesAplicadas).forEach(estratega => {
                    if (estratega.preguntas && estratega.preguntas.includes(i)) {
                        estrategasQueBonifican.push(estratega);
                    }
                });
            }
            
            let opcionTexto = '';
            if (respuestaUsuario === 'A') opcionTexto = pregunta?.opcion_a || 'Opción A';
            else if (respuestaUsuario === 'B') opcionTexto = pregunta?.opcion_b || 'Opción B';
            else if (respuestaUsuario === 'C') opcionTexto = pregunta?.opcion_c || 'Opción C';
            
            if (opcionTexto.length > 40) opcionTexto = opcionTexto.substring(0, 37) + '...';
            
            // Generar HTML de bonificaciones para esta pregunta
            let bonificacionesHTML = '<span class="text-muted">-</span>';
            if (estrategasQueBonifican.length > 0) {
                bonificacionesHTML = '<div class="small">';
                estrategasQueBonifican.forEach(e => {
                    bonificacionesHTML += `<div class="text-success"><i class="fas fa-star me-1"></i> <strong>${e.nombre}</strong> <span class="badge bg-info">+${e.porcentaje}%</span></div>`;
                });
                bonificacionesHTML += '</div>';
            }
            
            filas += `
                <tr>
                    <td class="text-center align-middle"><strong>${i}</strong></td>
                    <td class="align-middle">
                        <div><strong>${nombresArea[area] || area}</strong></div>
                        <small class="text-muted">${pregunta?.texto_pregunta?.substring(0, 80) || ''}${pregunta?.texto_pregunta?.length > 80 ? '...' : ''}</small>
                    </td>
                    <td class="align-middle">
                        <span class="badge bg-secondary me-2 fs-6 p-2">${respuestaUsuario}</span>
                        <span class="d-block small text-muted">${opcionTexto}</span>
                    </td>
                    <td class="align-middle">
                        ${bonificacionesHTML}
                    </td>
                </tr>
            `;
        }
        
        return filas;
    } 
    generarVistaPreviaPronostico(pronostico, preguntas) {
        if (!pronostico || !preguntas) return '';
        
        let html = '<div class="mt-3"><h6>Tu pronóstico:</h6><div class="table-responsive">';
        html += '<table class="table table-sm table-dark"><thead><tr><th>#</th><th>Pregunta</th><th>Respuesta</th></tr></thead><tbody>';
        
        for (let i = 1; i <= 10; i++) {
            const pregunta = preguntas.find(p => p.numero_pregunta === i);
            const respuesta = pronostico.respuestas[`p${i}`];
            let respuestaTexto = '';
            
            if (respuesta === 'A') respuestaTexto = pregunta?.opcion_a?.substring(0, 30) + '...';
            else if (respuesta === 'B') respuestaTexto = pregunta?.opcion_b?.substring(0, 30) + '...';
            else if (respuesta === 'C') respuestaTexto = pregunta?.opcion_c?.substring(0, 30) + '...';
            
            html += `<tr><td>${i}</td><td><small>${pregunta?.texto_pregunta?.substring(0, 50)}...</small></td><td><span class="badge bg-secondary">${respuesta}</span> ${respuestaTexto}</td></tr>`;
        }
        
        html += '</tbody></table></div></div>';
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
    generarFilasPronosticoPendienteConBonificaciones(preguntas, respuestasUsuario, bonificacionesAplicadas) {
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
            
            // Buscar qué estrategas bonifican esta pregunta
            let estrategasQueBonifican = [];
            if (bonificacionesAplicadas) {
                Object.values(bonificacionesAplicadas).forEach(estratega => {
                    if (estratega.preguntas && estratega.preguntas.includes(i)) {
                        estrategasQueBonifican.push(estratega);
                    }
                });
            }
            
            let opcionTexto = '';
            if (respuestaUsuario === 'A') opcionTexto = pregunta?.opcion_a || 'Opción A';
            else if (respuestaUsuario === 'B') opcionTexto = pregunta?.opcion_b || 'Opción B';
            else if (respuestaUsuario === 'C') opcionTexto = pregunta?.opcion_c || 'Opción C';
            
            if (opcionTexto.length > 40) opcionTexto = opcionTexto.substring(0, 37) + '...';
            
            // Generar texto de bonificaciones
            let bonificacionesTexto = '<span class="text-muted">-</span>';
            if (estrategasQueBonifican.length > 0) {
                bonificacionesTexto = '<div class="small">';
                estrategasQueBonifican.forEach(e => {
                    bonificacionesTexto += `<div class="text-success"><i class="fas fa-star me-1"></i> <strong>${e.nombre}</strong> <span class="badge bg-info">+${e.porcentaje}%</span></div>`;
                });
                bonificacionesTexto += '</div>';
            }
            
            filas += `
                <tr>
                    <td class="text-center align-middle"><strong>${i}</strong></td>
                    <td class="align-middle">
                        <div><strong>${nombresArea[area] || area}</strong></div>
                        <small class="text-muted">${pregunta?.texto_pregunta?.substring(0, 80) || ''}${pregunta?.texto_pregunta?.length > 80 ? '...' : ''}</small>
                    </td>
                    <td class="align-middle">
                        <span class="badge bg-secondary me-2 fs-6 p-2">${respuestaUsuario}</span>
                        <span class="d-block small text-muted">${opcionTexto}</span>
                    </td>
                    <td class="align-middle">
                        ${bonificacionesTexto}
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
            
            console.log("💰 Procesando cobro:", { pronosticoId, cantidad });
            
            // 1. Verificar que el pronóstico existe y pertenece al usuario
            const { data: pronostico, error: errorVerificar } = await this.supabase
                .from('pronosticos_usuario')
                .select('id, estado, cobrado, escuderia_id')
                .eq('id', pronosticoId)
                .single();
            
            if (errorVerificar) {
                console.error("❌ Error verificando pronóstico:", errorVerificar);
                this.mostrarError("No se pudo verificar el pronóstico");
                return;
            }
            
            if (pronostico.cobrado) {
                this.mostrarError("Este pronóstico ya ha sido cobrado");
                return;
            }
            
            // 2. Obtener dinero actual de la escudería
            const { data: escuderia, error: errorEscuderia } = await this.supabase
                .from('escuderias')
                .select('dinero')
                .eq('user_id', user.id)
                .single();
            
            if (errorEscuderia) {
                console.error("❌ Error obteniendo escudería:", errorEscuderia);
                this.mostrarError("Error al obtener datos de tu escudería");
                return;
            }
            
            const dineroActual = escuderia.dinero || 0;
            const nuevoDinero = dineroActual + cantidad;
            
            // 3. ACTUALIZAR PRIMERO el dinero de la escudería
            const { error: errorUpdate } = await this.supabase
                .from('escuderias')
                .update({ dinero: nuevoDinero })
                .eq('user_id', user.id);
            
            if (errorUpdate) {
                console.error("❌ Error actualizando dinero:", errorUpdate);
                this.mostrarError("Error al actualizar el dinero");
                return;
            }
            
            console.log("✅ Dinero actualizado correctamente");
            
            // ===========================================
            // 🆕 CREAR REGISTRO EN TRANSACCIONES
            // ===========================================
            try {
                // 📦 MOSTRAR DATOS ANTES DE INSERTAR
                const datosAEnviar = {
                    escuderia_id: pronostico.escuderia_id,
                    tipo: 'ingreso',
                    cantidad: cantidad,
                    descripcion: `Cobro de pronóstico - Carrera ${this.carreraActual?.nombre || ''}`,
                    referencia: `pronostico_${pronosticoId}`,
                    saldo_resultante: nuevoDinero,
                    categoria: 'pronosticos',
                    fecha: new Date().toISOString()
                };
                
                console.log("📤 ENVIANDO A TRANSACCIONES:", JSON.stringify(datosAEnviar, null, 2));
                
                // 💥 INTENTAR INSERTAR CON .select() PARA VER RESULTADO
                const { data, error: errorTransaccion } = await this.supabase
                    .from('transacciones')
                    .insert([datosAEnviar])
                    .select();  // ← IMPORTANTE: esto devuelve lo insertado
                
                if (errorTransaccion) {
                    console.error("❌ ERROR DETALLADO:", {
                        mensaje: errorTransaccion.message,
                        codigo: errorTransaccion.code,
                        detalles: errorTransaccion.details,
                        hint: errorTransaccion.hint
                    });
                    
                    // 🚨 MOSTRAR EN PANTALLA TAMBIÉN
                    this.mostrarNotificacionTemporal(`
                        <div style="background: #330000; border-left: 4px solid #ff0000; padding: 12px; color: white;">
                            <strong style="color: #ff6666;">❌ ERROR EN TRANSACCIONES</strong><br>
                            <span>${errorTransaccion.message}</span><br>
                            <small style="color: #aaa;">Código: ${errorTransaccion.code || 'N/A'}</small>
                        </div>
                    `);
                } else {
                    console.log("✅ INSERT EXITOSO:", data);
                    console.log("✅ Registro en transacciones creado con ID:", data?.[0]?.id);
                    
                    this.mostrarNotificacionTemporal(`
                        <div style="background: #003300; border-left: 4px solid #00d2be; padding: 12px; color: white;">
                            <strong style="color: #00d2be;">✅ TRANSACCIÓN REGISTRADA</strong><br>
                            <span>Se ha creado el registro correctamente</span>
                        </div>
                    `);
                }
            } catch (errorTrans) {
                console.error("💥 EXCEPCIÓN EN BLOQUE TRANSACCIONES:", errorTrans);
                console.error("Stack:", errorTrans.stack);
                
                this.mostrarNotificacionTemporal(`
                    <div style="background: #330000; border-left: 4px solid #ff0000; padding: 12px; color: white;">
                        <strong style="color: #ff6666;">💥 EXCEPCIÓN</strong><br>
                        <span>${errorTrans.message}</span>
                    </div>
                `);
            }
            
            // 4. Intentar marcar pronóstico como cobrado (manejar si la columna no existe)
            try {
                const { error: errorPronostico } = await this.supabase
                    .from('pronosticos_usuario')
                    .update({ 
                        cobrado: true,
                        fecha_cobro: new Date().toISOString()
                    })
                    .eq('id', pronosticoId);
                
                if (errorPronostico) {
                    // Si el error es por columna no existente, solo lo registramos
                    if (errorPronostico.message && errorPronostico.message.includes('cobrado')) {
                        console.warn("⚠️ La columna 'cobrado' no existe en la tabla. El dinero se añadió igualmente.");
                        
                        this.mostrarNotificacionTemporal(`
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <i class="fas fa-check-circle" style="font-size: 30px; color: #00d2be;"></i>
                                <div>
                                    <h5 style="margin: 0; color: #00d2be;">¡Dinero cobrado!</h5>
                                    <p style="margin: 5px 0 0 0;">Se han añadido ${cantidad.toLocaleString('es-ES')} € a tu escudería</p>
                                    <p style="margin: 0; font-size: 13px;">Nuevo saldo: ${nuevoDinero.toLocaleString('es-ES')} €</p>
                                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #00d2be;">✅ Registrado en transacciones</p>
                                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #ffb400;">
                                        ⚠️ Nota: El sistema no pudo marcar el pronóstico como cobrado por un error técnico, pero el dinero ya está en tu cuenta.
                                    </p>
                                </div>
                            </div>
                        `, 6000);
                        
                        // Recargar después
                        setTimeout(() => {
                            this.cargarPantallaPronostico();
                        }, 2000);
                        
                        return;
                    } else {
                        throw errorPronostico; // Otro tipo de error
                    }
                }
                
                // Si todo salió bien (con cobrado y transacciones)
                this.mostrarNotificacionTemporal(`
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-check-circle" style="font-size: 30px; color: #00d2be;"></i>
                        <div>
                            <h5 style="margin: 0; color: #00d2be;">¡Dinero cobrado!</h5>
                            <p style="margin: 5px 0 0 0;">Se han añadido ${cantidad.toLocaleString('es-ES')} € a tu escudería</p>
                            <p style="margin: 0; font-size: 13px;">Nuevo saldo: ${nuevoDinero.toLocaleString('es-ES')} €</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #00d2be;">✅ Registrado en transacciones</p>
                        </div>
                    </div>
                `, 5000);
                
                // Recargar la vista para mostrar botón deshabilitado
                setTimeout(() => {
                    this.cargarPantallaPronostico();
                }, 2000);
                
            } catch (errorPronostico) {
                console.error("❌ Error al marcar pronóstico como cobrado:", errorPronostico);
                
                // Aunque falle marcar el pronóstico, el dinero ya se añadió
                this.mostrarNotificacionTemporal(`
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 30px; color: #ffb400;"></i>
                        <div>
                            <h5 style="margin: 0; color: #ffb400;">Cobro parcial</h5>
                            <p style="margin: 5px 0 0 0;">Se añadieron ${cantidad.toLocaleString('es-ES')} € a tu escudería</p>
                            <p style="margin: 0; font-size: 13px;">Nuevo saldo: ${nuevoDinero.toLocaleString('es-ES')} €</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #00d2be;">✅ Registrado en transacciones</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px;">Pero hubo un error al marcar el pronóstico como cobrado.</p>
                        </div>
                    </div>
                `, 8000);
                
                setTimeout(() => {
                    this.cargarPantallaPronostico();
                }, 2000);
            }
            
        } catch (error) {
            console.error("💥 Error general en cobrarDinero:", error);
            this.mostrarError("Error al procesar el cobro. Inténtalo de nuevo.");
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
        const selectCarrera = document.getElementById('carreraResultados');
        if (!selectCarrera || !selectCarrera.value) {
            this.mostrarError("No hay carrera seleccionada");
            return;
        }
        const carreraId = selectCarrera.value;
        
        // Obtener respuestas correctas del formulario
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
            // 1. Guardar resultados en la tabla de resultados
            const { error: errorResultados } = await this.supabase
                .from('resultados_carrera')
                .insert([{
                    carrera_id: carreraId,
                    respuestas_correctas: respuestasCorrectas,
                    fecha_publicacion: new Date().toISOString()
                }]);
            
            if (errorResultados) throw errorResultados;
            
            // 2. Obtener TODOS los pronósticos de esta carrera
            const { data: pronosticos, error: errorPronosticos } = await this.supabase
                .from('pronosticos_usuario')
                .select('*')  // ✅ SIMPLE: seleccionamos todo sin joins complejos
                .eq('carrera_id', carreraId);
            
            if (errorPronosticos) throw errorPronosticos;
            
            // 3. Obtener nombre del GP para notificaciones
            const { data: carrera, error: errorCarrera } = await this.supabase
                .from('calendario_gp')
                .select('nombre')
                .eq('id', carreraId)
                .single();
            
            if (errorCarrera) throw errorCarrera;
            
            const nombreGP = carrera.nombre;
            const notificaciones = [];
            
            // 4. Procesar CADA pronóstico individualmente
            for (const pronostico of pronosticos) {
                // Calcular aciertos
                let aciertos = 0;
                for (let i = 1; i <= 10; i++) {
                    if (pronostico.respuestas[`p${i}`] === respuestasCorrectas[`p${i}`]) {
                        aciertos++;
                    }
                }
                // 🔥 LOGS PARA DEPURAR
                console.log("🔥 VALOR CRÍTICO - aciertos:", aciertos, "para pronóstico", pronostico.id);
                console.log("🔥 respuestas usuario:", pronostico.respuestas);
                console.log("🔥 respuestas correctas:", respuestasCorrectas);                
                // Calcular puntos base (100 por acierto)
                const puntosBase = aciertos * 100;
                
                // Calcular bonificaciones de estrategas
                let bonificacionTotal = 0;
                if (pronostico.bonificaciones_aplicadas && aciertos > 0) {
                    Object.values(pronostico.bonificaciones_aplicadas).forEach(estratega => {
                        const preguntasAcertadasBonificadas = estratega.preguntas.filter(preguntaNum => {
                            return pronostico.respuestas[`p${preguntaNum}`] === respuestasCorrectas[`p${preguntaNum}`];
                        });
                        
                        if (preguntasAcertadasBonificadas.length > 0) {
                            const puntosDeEstasPreguntas = preguntasAcertadasBonificadas.length * 100;
                            const bonificacionEstratega = Math.round(puntosDeEstasPreguntas * (estratega.porcentaje / 100));
                            bonificacionTotal += bonificacionEstratega;
                        }
                    });
                }
                
                const puntosFinales = puntosBase + bonificacionTotal;
                const dineroGanado = puntosFinales * 10000;
                
                // 5. ACTUALIZAR pronóstico con resultados
                await this.supabase
                    .from('pronosticos_usuario')
                    .update({
                        estado: 'calificado',
                        aciertos: aciertos,
                        puntuacion_total: puntosFinales,
                        dinero_ganado: dineroGanado
                    })
                    .eq('id', pronostico.id);
                
                // 6. ACTUALIZAR estadísticas de la escudería
                const { data: escuderia, error: errorEscuderia } = await this.supabase
                    .from('escuderias')
                    .select('gp_participados, aciertos_totales, preguntas_totales, user_id')
                    .eq('id', pronostico.escuderia_id)
                    .single();
                
                if (errorEscuderia) {
                    console.error("❌ Error obteniendo escudería:", errorEscuderia);
                } else if (escuderia) {
                    console.log("📊 Estadísticas actuales:", escuderia);
                    
                    const nuevosGP = (escuderia.gp_participados || 0) + 1;
                    const nuevosAciertos = (escuderia.aciertos_totales || 0) + aciertos;
                    const nuevasPreguntas = (escuderia.preguntas_totales || 0) + 10;
                    
                    const { error: errorUpdate } = await this.supabase
                        .from('escuderias')
                        .update({
                            gp_participados: nuevosGP,
                            aciertos_totales: nuevosAciertos,
                            preguntas_totales: nuevasPreguntas
                        })
                        .eq('id', pronostico.escuderia_id);
                    
                    if (errorUpdate) {
                        console.error("❌ Error actualizando estadísticas:", errorUpdate);
                    } else {
                        console.log("✅ Estadísticas actualizadas:", {
                            gp_participados: nuevosGP,
                            aciertos_totales: nuevosAciertos,
                            preguntas_totales: nuevasPreguntas
                        });
                    }
                    
                    // Guardar user_id para notificación
                    const usuarioId = escuderia.user_id;
                    
                    // 7. Preparar notificación para este usuario
                    if (escuderia.user_id) {
                        notificaciones.push({
                            usuario_id: escuderia.user_id,
                            tipo: 'pronostico',
                            titulo: aciertos > 0 ? '🎯 ¡Resultados disponibles!' : '📊 Resultados disponibles',
                            mensaje: aciertos > 0 
                                ? `Has acertado ${aciertos}/10 en ${nombreGP} y ganaste ${dineroGanado.toLocaleString('es-ES')} €`
                                : `Ya puedes ver los resultados del GP ${nombreGP}. Esta vez no hubo aciertos, ¡suerte en la próxima!`,
                            relacion_id: null,
                            tipo_relacion: `gp_${carreraId}`,
                            leida: false,
                            fecha_creacion: new Date().toISOString()
                        });
                    }
                }
            }
            
            // 8. Insertar notificaciones
            if (notificaciones.length > 0) {
                await this.supabase
                    .from('notificaciones_usuarios')
                    .insert(notificaciones);
            }
            
            // 9. Mostrar confirmación y disparar evento
            this.mostrarConfirmacion(`
                <h4><i class="fas fa-check-circle"></i> Resultados guardados</h4>
                <p>Se han calificado ${pronosticos.length} pronósticos correctamente.</p>
            `);
            
            // Disparar evento para que se actualice la pantalla
            window.dispatchEvent(new CustomEvent('resultados-guardados', {
                detail: { carreraId: carreraId }
            }));
            
        } catch (error) {
            console.error("Error:", error);
            this.mostrarError("Error al guardar resultados: " + error.message);
        }
    }
    async mostrarPantallaNoDisponible(carrera, mensajeAdicional = '') {
        const container = document.getElementById('main-content') || 
                          document.querySelector('.tab-content.active');
        
        if (!container) return;
        
        // Obtener histórico de pronósticos anteriores
        const { data: pronosticosAnteriores } = await this.supabase
            .from('pronosticos_usuario')
            .select(`
                *,
                calendario_gp!inner(*)
            `)
            .eq('escuderia_id', this.escuderiaId)
            .order('fecha_pronostico', { ascending: false });
        
        // Obtener vuelta rápida actual
        const vueltaRapida = await this.obtenerVueltaRapida();
        
        const fechaCarrera = new Date(carrera.fecha_inicio);
        fechaCarrera.setHours(fechaCarrera.getHours() + 24);
        const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const historicoHTML = pronosticosAnteriores?.length > 0 
            ? this.renderizarSelectorHistorico(pronosticosAnteriores)
            : this.renderizarSelectorHistoricoVacio();
        
        const mensajeBase = `Las apuestas para <strong>${carrera.nombre}</strong> aún no están abiertas.`;
        
        container.innerHTML = `
            <div class="pronostico-container compacto">
                <!-- 🔥 SIEMPRE EL HISTÓRICO ARRIBA -->
                ${historicoHTML}
                
                <div class="card">
                    <div class="card-header bg-dark text-white py-2">
                        <h5 class="mb-0"><i class="fas fa-flag-checkered"></i> Próximo GP: ${carrera.nombre}</h5>
                    </div>
                    <div class="card-body py-3">
                        
                        <div class="alert alert-warning mb-3" style="background: #332700; border-color: #ffb400;">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-hourglass-half me-3" style="font-size: 24px; color: #ffb400;"></i>
                                <div>
                                    <strong style="color: #ffd966;">⏳ APUESTAS NO DISPONIBLES</strong>
                                    <p class="mb-0 mt-2" style="color: #ffd966cc;">
                                        ${mensajeBase} ${mensajeAdicional}
                                        ${!mensajeAdicional ? 'Espera a que finalice el Gran Premio actual para que se habiliten.' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 📊 DATOS DE LA CARRERA (IGUAL QUE EN CONDICIONES INICIALES) -->
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
                                            <div class="stat-value-mini" id="vuelta-rapida-no-disponible">
                                                ${vueltaRapida}
                                            </div>
                                            <small class="text-muted">mejor tiempo</small>
                                        </td>
                                        <td class="text-center">
                                            <div class="stat-value-mini">${this.estrategasActivos?.length || 0}</div>
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
                        
                        <!-- ℹ️ MENSAJE INFORMATIVO ADICIONAL -->
                        <div class="alert alert-info alert-sm py-2 mb-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>
                                <strong>Importante:</strong> Cuando se habiliten las apuestas, podrás pronosticar 
                                basándote en los datos de ese momento (vuelta rápida, puntos del coche, etc.).
                            </small>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary flex-grow-1" onclick="window.tabManager.switchTab('principal')">
                                <i class="fas fa-home me-2"></i> Volver al inicio
                            </button>
                            <button class="btn btn-outline-primary" onclick="window.location.reload()">
                                <i class="fas fa-sync"></i> Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }    
    async crearNotificacionesResultados(carreraId) {
        try {
            console.log("🔔 Creando notificaciones de resultados para carrera:", carreraId);
            
            // Obtener TODOS los pronósticos de esta carrera con usuario_id
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
            
            // Obtener nombre del GP
            const { data: carrera, error: errorCarrera } = await this.supabase
                .from('calendario_gp')
                .select('nombre')
                .eq('id', carreraId)
                .single();
            
            if (errorCarrera || !carrera) {
                console.error("❌ Error obteniendo nombre del GP:", errorCarrera);
                return;
            }
            
            // Crear notificaciones
            const notificaciones = [];
            
            for (const pronostico of pronosticos) {
                const usuarioId = pronostico.escuderias?.usuario_id;
                if (!usuarioId) continue;
                
                // Usar los valores YA CALCULADOS en el pronóstico
                const aciertos = pronostico.aciertos || 0;
                const puntosFinales = pronostico.puntuacion_total || 0;
                
                if (aciertos > 0) {
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
            
            // Insertar notificaciones

            if (notificaciones.length > 0) {
                console.log(`📝 Insertando ${notificaciones.length} notificaciones`);
                
                // Verificar que todos tienen usuario_id
                const validas = notificaciones.filter(n => n.usuario_id);
                if (validas.length !== notificaciones.length) {
                    console.warn(`⚠️ ${notificaciones.length - validas.length} notificaciones sin usuario_id`);
                }
                
                const { data, error: insertError } = await this.supabase
                    .from('notificaciones_usuarios')
                    .insert(validas)
                    .select();
                
                if (insertError) {
                    console.error("❌ Error insertando notificaciones:", insertError);
                } else {
                    console.log(`✅ ${validas.length} notificaciones insertadas:`, data);
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
