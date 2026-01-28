// admin-pronosticos.js - VERSIÓN CORREGIDA DEFINITIVA

console.log('🔧 Admin Pronósticos cargando...');

// CONFIGURACIÓN
const SUPABASE_URL = 'https://xbnbbmhcveyzrvvmdktg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg';

// 1. VERIFICAR QUE LA LIBRERÍA ESTÁ CARGADA
if (typeof supabase === 'undefined') {
    console.error('❌ ERROR: La librería Supabase no está cargada');
    document.body.innerHTML = `
        <div style="padding: 50px; text-align: center; font-family: Arial;">
            <h1 style="color: red;">❌ ERROR</h1>
            <p>La librería Supabase no se cargó correctamente.</p>
            <p>Recarga la página o verifica la conexión.</p>
        </div>
    `;
    throw new Error('Supabase library not loaded');
}

// 2. CREAR CLIENTE Y HACERLO GLOBAL
let supabaseCliente;
try {
    supabaseCliente = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseCliente = supabaseCliente;  // ← MANDATORIO
    console.log('✅ Cliente Supabase creado y global:', window.supabaseCliente);
} catch (error) {
    console.error('❌ Error creando cliente:', error);
    document.body.innerHTML = `
        <div style="padding: 50px; text-align: center; font-family: Arial;">
            <h1 style="color: red;">❌ ERROR DE CONEXIÓN</h1>
            <p>No se pudo conectar a la base de datos:</p>
            <p><code>${error.message}</code></p>
        </div>
    `;
    throw error;
}

// 3. CLASE ADMIN
class AdminPronosticos {
    constructor() {
        console.log("🔨 Constructor iniciado");
        
        // Intentar en este orden:
        // 1. Variable local supabaseCliente
        // 2. window.supabaseCliente 
        // 3. Crear nuevo si nada funciona
        let clienteFinal = supabaseCliente || window.supabaseCliente;
        
        if (!clienteFinal) {
            console.warn("⚠️ No hay cliente, creando uno...");
            clienteFinal = supabase.createClient(
                'https://xbnbbmhcveyzrvvmdktg.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg'
            );
            supabaseCliente = clienteFinal;
        }
        
        this.supabase = clienteFinal;
        console.log("✅ this.supabase asignado:", this.supabase);
        
        this.carreras = [];
        this.preguntasActuales = [];
        this.init();
    }
    
    setupEventos() {
        console.log("🎯 Configurando eventos...");
        const btnGuardar = document.getElementById('btn-guardar-preguntas');
        const btnCorregir = document.getElementById('btn-guardar-correccion');
        
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarPreguntas());
        }
        
        if (btnCorregir) {
            btnCorregir.addEventListener('click', () => this.guardarCorreccion());
        }
    }
    
    mostrarMensaje(texto, tipo = 'info') {
        const container = document.getElementById('mensajes');
        if (!container) {
            console.log(`[${tipo}] ${texto}`);
            return;
        }
        
        const mensaje = document.createElement('div');
        mensaje.className = `alert ${tipo}`;
        mensaje.innerHTML = texto;
        container.appendChild(mensaje);
        
        setTimeout(() => {
            if (mensaje.parentNode) mensaje.remove();
        }, 5000);
    }
    async init() {
        console.log('🔧 Inicializando Admin...');
        
        // Configurar tabs
        this.setupTabs();
        
        // Cargar carreras
        await this.cargarCarreras();
        
        // Configurar eventos
        this.setupEventos();
        
        console.log('✅ Admin inicializado');
    }
    
    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover activo de todos
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activar actual
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
    
    async cargarCarreras() {
        try {
            console.log('📋 Cargando carreras...');
            const { data, error } = await this.supabase
                .from('calendario_gp')
                .select('*')
                .order('fecha_inicio', { ascending: true });
            
            if (error) throw error;
            
            this.carreras = data;
            console.log(`✅ ${data.length} carreras cargadas`);
            
            // Llenar selectores
            this.actualizarSelectoresCarreras();
            
        } catch (error) {
            console.error('❌ Error cargando carreras:', error);
            this.mostrarMensaje('Error cargando carreras: ' + error.message, 'error');
        }
    }
    
    actualizarSelectoresCarreras() {
        const selectCrear = document.getElementById('select-carrera');
        const selectCorregir = document.getElementById('select-carrera-corregir');
        
        let html = '<option value="">Seleccionar carrera...</option>';
        this.carreras.forEach(c => {
            const fecha = new Date(c.fecha_inicio).toLocaleDateString();
            html += `<option value="${c.id}">${c.nombre} - ${fecha}</option>`;
        });
        
        selectCrear.innerHTML = html;
        selectCorregir.innerHTML = html;
        
        // Configurar eventos
        selectCrear.addEventListener('change', (e) => this.cargarPreguntasCarrera(e.target.value));
        selectCorregir.addEventListener('change', (e) => this.cargarParaCorreccion(e.target.value));
    }
    
    async cargarPreguntasCarrera(carreraId) {
        if (!carreraId) {
            document.getElementById('preguntas-container').innerHTML = `
                <div class="alert info">
                    <p>Selecciona una carrera para crear o editar las preguntas.</p>
                </div>
            `;
            document.getElementById('btn-guardar-preguntas').disabled = true;
            return;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraId)
                .order('numero_pregunta', { ascending: true });
            
            if (error) throw error;
            
            this.preguntasActuales = data || [];
            this.generarFormularioPreguntas(carreraId);
            document.getElementById('btn-guardar-preguntas').disabled = false;
            
        } catch (error) {
            console.error('❌ Error cargando preguntas:', error);
            this.mostrarMensaje('Error cargando preguntas', 'error');
        }
    }
    
    generarFormularioPreguntas(carreraId) {
        const container = document.getElementById('preguntas-container');
        let html = '<div class="preguntas-grid">';
        
        // LISTA DE ÁREAS DISPONIBLES (puedes personalizar)
        const areasDisponibles = [
            { value: 'meteorologia', label: 'Meteorología' },
            { value: 'fiabilidad', label: 'Fiabilidad' },
            { value: 'estrategia', label: 'Estrategia' },
            { value: 'rendimiento', label: 'Rendimiento' },
            { value: 'neumaticos', label: 'Neumáticos' },
            { value: 'seguridad', label: 'Seguridad' },
            { value: 'clasificacion', label: 'Clasificación' },
            { value: 'carrera', label: 'Carrera' },
            { value: 'overtakes', label: 'Adelantamientos' },
            { value: 'incidentes', label: 'Incidentes' },
            { value: 'equipos', label: 'Equipos' },
            { value: 'tiempos', label: 'Tiempos' },
            { value: 'paradas', label: 'Paradas en boxes' }
        ];
        
        for (let i = 1; i <= 10; i++) {
            const preguntaExistente = this.preguntasActuales.find(p => p.numero_pregunta === i);
            const areaActual = preguntaExistente?.area || 'meteorologia';
            
            // Generar opciones para el select
            // Generar opciones para el select CON ESTILOS MEJORADOS
            let opcionesArea = '';
            areasDisponibles.forEach(area => {
                const seleccionado = area.value === areaActual ? 'selected' : '';
                // Forzar estilos directamente en cada option
                opcionesArea += `<option value="${area.value}" ${seleccionado} 
                                 style="background: #000; color: #fff; padding: 8px 12px;">
                                    ${area.label}
                                 </option>`;
            });
            
            html += `
                <div class="pregunta-card">
                    <!-- CABECERA CON SELECTOR DE ÁREA - CORREGIDO -->
                    <div class="pregunta-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="margin: 0;">Pregunta ${i}</h3>
                        <div class="area-selector" style="display: flex; align-items: center; gap: 10px;">
                            <span style="color: #aaa; font-size: 0.9rem;">Área:</span>
                            <select id="p${i}_area" 
                                    class="area-select" 
                                    style="
                                        padding: 6px 12px 6px 12px;
                                        background: #111;
                                        color: white;
                                        border: 1px solid #444;
                                        border-radius: 6px;
                                        min-width: 150px;
                                        cursor: pointer;
                                        appearance: none;
                                        -webkit-appearance: none;
                                        -moz-appearance: none;
                                        background-image: url('data:image/svg+xml;utf8,<svg fill=\"white\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>');
                                        background-repeat: no-repeat;
                                        background-position: right 10px center;
                                        background-size: 16px;
                                        padding-right: 30px;
                                    ">
                                ${opcionesArea}
                            </select>
                        </div>
                    </div>
                    
                    <!-- TEXTO DE LA PREGUNTA -->
                    <div class="pregunta-texto" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #aaa; font-size: 0.9rem;">
                            <i class="fas fa-question-circle"></i> Texto de la pregunta:
                        </label>
                        <textarea id="p${i}_texto" 
                                  rows="3" 
                                  style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid #444; color: white; border-radius: 6px; resize: vertical;"
                                  placeholder="Ej: ¿Cuántas veces saldrá el coche de seguridad?">${preguntaExistente?.texto_pregunta || ''}</textarea>
                    </div>
                    
                    <!-- OPCIONES DE RESPUESTA -->
                    <div class="opciones" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div class="opcion" style="background: rgba(0,210,190,0.1); padding: 15px; border-radius: 6px; border-left: 3px solid #00D2BE;">
                            <label style="display: block; margin-bottom: 8px; color: #00D2BE; font-weight: bold;">
                                <i class="fas fa-a"></i> Opción A:
                            </label>
                            <input type="text" 
                                   id="p${i}_a" 
                                   value="${preguntaExistente?.opcion_a || ''}" 
                                   placeholder="Respuesta A"
                                   style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        
                        <div class="opcion" style="background: rgba(255,135,0,0.1); padding: 15px; border-radius: 6px; border-left: 3px solid #FF8700;">
                            <label style="display: block; margin-bottom: 8px; color: #FF8700; font-weight: bold;">
                                <i class="fas fa-b"></i> Opción B:
                            </label>
                            <input type="text" 
                                   id="p${i}_b" 
                                   value="${preguntaExistente?.opcion_b || ''}" 
                                   placeholder="Respuesta B"
                                   style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        
                        <div class="opcion" style="background: rgba(255,105,180,0.1); padding: 15px; border-radius: 6px; border-left: 3px solid #FF69B4;">
                            <label style="display: block; margin-bottom: 8px; color: #FF69B4; font-weight: bold;">
                                <i class="fas fa-c"></i> Opción C:
                            </label>
                            <input type="text" 
                                   id="p${i}_c" 
                                   value="${preguntaExistente?.opcion_c || ''}" 
                                   placeholder="Respuesta C"
                                   style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                    </div>
                </div>
            `;
        }   
        
        html += '</div>';
        container.innerHTML = html;
    }

    async cargarParaCorreccion(carreraId) {
        if (!carreraId) {
            document.getElementById('correccion-container').innerHTML = `
                <div class="alert info">
                    <p>Selecciona una carrera para ingresar las respuestas correctas.</p>
                </div>
            `;
            document.getElementById('btn-guardar-correccion').disabled = true;
            return;
        }
        
        try {
            console.log('📝 Cargando preguntas para corrección...');
            
            // 1. Cargar preguntas de la carrera (esto ya funciona)
            const { data: preguntas, error: errorPreguntas } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraId)
                .order('numero_pregunta', { ascending: true });
            
            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                document.getElementById('correccion-container').innerHTML = `
                    <div class="alert error">
                        <p>❌ Esta carrera no tiene preguntas creadas.</p>
                        <p>Primero crea las preguntas en la pestaña "Crear Preguntas".</p>
                    </div>
                `;
                document.getElementById('btn-guardar-correccion').disabled = true;
                return;
            }
            
            // 2. CORREGIDO: Verificar respuestas correctas - SIN EL .single()
            let respuestasGuardadas = {};
            
            try {
                const { data: resultadosExistentes, error: errorResultados } = await this.supabase
                    .from('resultados_carrera')
                    .select('respuestas_correctas, publicado_por, fecha_publicacion')
                    .eq('carrera_id', carreraId);
                
                // Si hay datos, tomar el primero (debería ser solo uno)
                if (resultadosExistentes && resultadosExistentes.length > 0) {
                    respuestasGuardadas = resultadosExistentes[0].respuestas_correctas || {};
                    console.log('📊 Respuestas existentes encontradas:', respuestasGuardadas);
                } else {
                    console.log('📭 No hay respuestas guardadas para esta carrera');
                }
                
            } catch (consultaError) {
                console.warn('⚠️ Error al consultar resultados:', consultaError);
                // Continuar con objeto vacío
            }
            
            // 3. Generar formulario de corrección
            let html = `
                <div class="alert info">
                    <p>📋 <strong>Instrucciones:</strong> Para cada pregunta, selecciona la opción correcta (A, B o C).</p>
                    <p>Los usuarios recibirán puntos por cada acierto.</p>
                </div>
                
                <div class="preguntas-grid">
            `;
            
            preguntas.forEach((pregunta) => {
                const numPregunta = pregunta.numero_pregunta;
                const respuestaCorrectaActual = respuestasGuardadas[`p${numPregunta}`] || '';
                
                // Determinar qué botón está seleccionado
                const btnAseleccionado = respuestaCorrectaActual === 'A' ? 'selected' : '';
                const btnBseleccionado = respuestaCorrectaActual === 'B' ? 'selected' : '';
                const btnCseleccionado = respuestaCorrectaActual === 'C' ? 'selected' : '';
                
                html += `
                    <div class="pregunta-card" style="background: rgba(30, 45, 30, 0.2);">
                        <!-- CABECERA CON NÚMERO Y ÁREA -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <h3 style="margin: 0; color: #00D2BE;">
                                <i class="fas fa-question-circle"></i> Pregunta ${numPregunta}
                            </h3>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: #aaa; font-size: 0.9rem;">Área:</span>
                                <span style="background: rgba(0,210,190,0.2); padding: 4px 12px; border-radius: 20px; color: #00D2BE; font-size: 0.9rem;">
                                    ${this.getAreaLabel(pregunta.area)}
                                </span>
                            </div>
                        </div>
                        
                        <!-- TEXTO DE LA PREGUNTA -->
                        <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <p style="margin: 0; font-size: 1.1rem; line-height: 1.4;">
                                ${pregunta.texto_pregunta}
                            </p>
                        </div>
                        
                        <!-- OPCIONES CON BOTONES PARA MARCAR LA CORRECTA -->
                        <div style="margin-bottom: 20px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                                <!-- OPCIÓN A -->
                                <div class="opcion-container" style="position: relative; padding: 15px; background: rgba(0,210,190,0.1); border-radius: 8px; border: 2px solid ${respuestaCorrectaActual === 'A' ? '#00D2BE' : 'rgba(0,210,190,0.3)'}; transition: all 0.3s;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                        <div>
                                            <strong style="color: #00D2BE; font-size: 1.2rem;">A</strong>
                                            <span style="color: #aaa; font-size: 0.9rem; margin-left: 8px;">Opción A</span>
                                        </div>
                                        <button type="button" 
                                                class="btn-marcar-correcta ${btnAseleccionado}" 
                                                data-pregunta="${numPregunta}" 
                                                data-respuesta="A"
                                                style="
                                                    width: 40px; 
                                                    height: 40px; 
                                                    border-radius: 50%; 
                                                    background: ${respuestaCorrectaActual === 'A' ? '#00D2BE' : 'rgba(255,255,255,0.1)'}; 
                                                    border: 2px solid ${respuestaCorrectaActual === 'A' ? '#00D2BE' : 'rgba(255,255,255,0.3)'};
                                                    color: white;
                                                    cursor: pointer;
                                                    font-weight: bold;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                ">
                                            ${respuestaCorrectaActual === 'A' ? '✓' : 'A'}
                                        </button>
                                    </div>
                                    <p style="margin: 0; font-size: 1rem; color: #fff;">
                                        ${pregunta.opcion_a}
                                    </p>
                                </div>
                                
                                <!-- OPCIÓN B -->
                                <div class="opcion-container" style="position: relative; padding: 15px; background: rgba(255,135,0,0.1); border-radius: 8px; border: 2px solid ${respuestaCorrectaActual === 'B' ? '#FF8700' : 'rgba(255,135,0,0.3)'}; transition: all 0.3s;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                        <div>
                                            <strong style="color: #FF8700; font-size: 1.2rem;">B</strong>
                                            <span style="color: #aaa; font-size: 0.9rem; margin-left: 8px;">Opción B</span>
                                        </div>
                                        <button type="button" 
                                                class="btn-marcar-correcta ${btnBseleccionado}" 
                                                data-pregunta="${numPregunta}" 
                                                data-respuesta="B"
                                                style="
                                                    width: 40px; 
                                                    height: 40px; 
                                                    border-radius: 50%; 
                                                    background: ${respuestaCorrectaActual === 'B' ? '#FF8700' : 'rgba(255,255,255,0.1)'}; 
                                                    border: 2px solid ${respuestaCorrectaActual === 'B' ? '#FF8700' : 'rgba(255,255,255,0.3)'};
                                                    color: white;
                                                    cursor: pointer;
                                                    font-weight: bold;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                ">
                                            ${respuestaCorrectaActual === 'B' ? '✓' : 'B'}
                                        </button>
                                    </div>
                                    <p style="margin: 0; font-size: 1rem; color: #fff;">
                                        ${pregunta.opcion_b}
                                    </p>
                                </div>
                                
                                <!-- OPCIÓN C -->
                                <div class="opcion-container" style="position: relative; padding: 15px; background: rgba(255,105,180,0.1); border-radius: 8px; border: 2px solid ${respuestaCorrectaActual === 'C' ? '#FF69B4' : 'rgba(255,105,180,0.3)'}; transition: all 0.3s;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                        <div>
                                            <strong style="color: #FF69B4; font-size: 1.2rem;">C</strong>
                                            <span style="color: #aaa; font-size: 0.9rem; margin-left: 8px;">Opción C</span>
                                        </div>
                                        <button type="button" 
                                                class="btn-marcar-correcta ${btnCseleccionado}" 
                                                data-pregunta="${numPregunta}" 
                                                data-respuesta="C"
                                                style="
                                                    width: 40px; 
                                                    height: 40px; 
                                                    border-radius: 50%; 
                                                    background: ${respuestaCorrectaActual === 'C' ? '#FF69B4' : 'rgba(255,255,255,0.1)'}; 
                                                    border: 2px solid ${respuestaCorrectaActual === 'C' ? '#FF69B4' : 'rgba(255,255,255,0.3)'};
                                                    color: white;
                                                    cursor: pointer;
                                                    font-weight: bold;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                ">
                                            ${respuestaCorrectaActual === 'C' ? '✓' : 'C'}
                                        </button>
                                    </div>
                                    <p style="margin: 0; font-size: 1rem; color: #fff;">
                                        ${pregunta.opcion_c}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- INDICADOR DE RESPUESTA CORRECTA -->
                            <div id="indicador-p${numPregunta}" style="margin-top: 15px; padding: 10px; background: ${respuestaCorrectaActual ? 'rgba(30, 90, 30, 0.3)' : 'rgba(90, 30, 30, 0.3)'}; border-radius: 6px; display: ${respuestaCorrectaActual ? 'block' : 'none'};">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="color: ${respuestaCorrectaActual ? '#90EE90' : '#FF6B6B'};">
                                        ${respuestaCorrectaActual ? '✅' : '❌'}
                                    </span>
                                    <span style="color: ${respuestaCorrectaActual ? '#90EE90' : '#FF6B6B'};">
                                        <strong>Respuesta correcta actual:</strong> 
                                        ${respuestaCorrectaActual ? `Opción ${respuestaCorrectaActual}` : 'No seleccionada'}
                                    </span>
                                    <input type="hidden" id="respuesta_correcta_${numPregunta}" value="${respuestaCorrectaActual}">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>'; // Cierra .preguntas-grid
            
            // 4. Insertar el HTML
            document.getElementById('correccion-container').innerHTML = html;
            document.getElementById('btn-guardar-correccion').disabled = false;
            
            // 5. Configurar eventos para los botones de selección
            this.configurarEventosCorreccion();
            
            console.log('✅ Formulario de corrección generado');
            
        } catch (error) {
            console.error('❌ Error cargando para corrección:', error);
            document.getElementById('correccion-container').innerHTML = `
                <div class="alert error">
                    <p>❌ Error al cargar las preguntas: ${error.message}</p>
                </div>
            `;
            this.mostrarMensaje('Error cargando preguntas para corrección', 'error');
        }
    }
    
    configurarEventosCorreccion() {
        // Configurar eventos para los botones de marcar correcta
        document.querySelectorAll('.btn-marcar-correcta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preguntaNum = e.target.dataset.pregunta;
                const respuesta = e.target.dataset.respuesta;
                
                // 1. Actualizar todos los botones de esta pregunta
                document.querySelectorAll(`.btn-marcar-correcta[data-pregunta="${preguntaNum}"]`).forEach(b => {
                    const resp = b.dataset.respuesta;
                    
                    // Restablecer estilos para todos
                    b.innerHTML = resp; // Volver a poner A, B o C
                    b.style.background = 'rgba(255,255,255,0.1)';
                    b.style.border = '2px solid rgba(255,255,255,0.3)';
                    
                    // Estilos específicos por opción
                    if (resp === 'A') {
                        b.style.color = '#00D2BE';
                    } else if (resp === 'B') {
                        b.style.color = '#FF8700';
                    } else if (resp === 'C') {
                        b.style.color = '#FF69B4';
                    }
                });
                
                // 2. Marcar el botón seleccionado
                e.target.innerHTML = '✓';
                e.target.style.color = 'white';
                
                // Estilos según la opción seleccionada
                if (respuesta === 'A') {
                    e.target.style.background = '#00D2BE';
                    e.target.style.border = '2px solid #00D2BE';
                } else if (respuesta === 'B') {
                    e.target.style.background = '#FF8700';
                    e.target.style.border = '2px solid #FF8700';
                } else if (respuesta === 'C') {
                    e.target.style.background = '#FF69B4';
                    e.target.style.border = '2px solid #FF69B4';
                }
                
                // 3. Actualizar el campo oculto y el indicador
                document.getElementById(`respuesta_correcta_${preguntaNum}`).value = respuesta;
                
                const indicador = document.getElementById(`indicador-p${preguntaNum}`);
                indicador.style.display = 'block';
                indicador.style.background = 'rgba(30, 90, 30, 0.3)';
                indicador.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #90EE90;">✅</span>
                        <span style="color: #90EE90;">
                            <strong>Respuesta correcta:</strong> Opción ${respuesta}
                        </span>
                        <input type="hidden" id="respuesta_correcta_${preguntaNum}" value="${respuesta}">
                    </div>
                `;
                
                console.log(`✓ Pregunta ${preguntaNum} marcada como: ${respuesta}`);
            });
        });
    }    
    // Función auxiliar para obtener etiqueta del área
    getAreaLabel(areaValue) {
        const areas = {
            'meteorologia': 'Meteorología',
            'fiabilidad': 'Fiabilidad',
            'estrategia': 'Estrategia',
            'rendimiento': 'Rendimiento',
            'neumaticos': 'Neumáticos',
            'seguridad': 'Seguridad',
            'clasificacion': 'Clasificación',
            'carrera': 'Carrera',
            'overtakes': 'Adelantamientos',
            'incidentes': 'Incidentes',
            'equipos': 'Equipos',
            'tiempos': 'Tiempos',
            'paradas': 'Paradas en boxes'
        };
        return areas[areaValue] || areaValue;
    }
    async calcularPuntajesCarrera(carreraId) {
        try {
            console.log('🧮 Calculando puntajes para carrera:', carreraId);
            
            // 1. Obtener respuestas correctas
            const { data: resultados, error: errorResultados } = await this.supabase
                .from('resultados_carrera')
                .select('respuestas_correctas')
                .eq('carrera_id', carreraId)
                .single();
            
            if (errorResultados || !resultados) {
                throw new Error('No se encontraron resultados para esta carrera');
            }
            
            // 2. Obtener todos los pronósticos de esta carrera
            const { data: pronosticos, error: errorPronosticos } = await this.supabase
                .from('pronosticos_usuario') // Asegúrate que esta tabla existe
                .select('*')
                .eq('carrera_id', carreraId)
                .eq('estado', 'pendiente'); // O el estado que uses
            
            if (errorPronosticos) throw errorPronosticos;
            
            if (!pronosticos || pronosticos.length === 0) {
                console.log('⚠️ No hay pronósticos para calcular');
                return;
            }
            
            // 3. Calcular puntajes para cada usuario
            for (const pronostico of pronosticos) {
                let aciertos = 0;
                
                // Comparar respuestas
                const respuestasUsuario = pronostico.respuestas_usuario; // JSON con respuestas
                const respuestasCorrectas = resultados.respuestas_correctas;
                
                for (let i = 1; i <= 10; i++) {
                    if (respuestasUsuario[`p${i}`] === respuestasCorrectas[`p${i}`]) {
                        aciertos++;
                    }
                }
                
                // Calcular puntos totales (ejemplo: 10 puntos por acierto)
                const puntosTotales = aciertos * 10;
                
                // 4. Actualizar el pronóstico con el resultado
                const { error: errorUpdate } = await this.supabase
                    .from('pronosticos_usuario')
                    .update({
                        estado: 'calificado',
                        aciertos: aciertos,
                        puntos_totales: puntosTotales,
                        fecha_calificacion: new Date().toISOString()
                    })
                    .eq('id', pronostico.id);
                
                if (errorUpdate) {
                    console.error(`Error actualizando pronóstico ${pronostico.id}:`, errorUpdate);
                }
            }
            
            console.log(`✅ Puntajes calculados para ${pronosticos.length} usuarios`);
            this.mostrarMensaje(`✅ Puntajes calculados para ${pronosticos.length} usuarios`, 'success');
            
        } catch (error) {
            console.error('❌ Error calculando puntajes:', error);
            this.mostrarMensaje(`Error calculando puntajes: ${error.message}`, 'error');
        }
    }
    
    async guardarCorreccion() {
        const carreraId = document.getElementById('select-carrera-corregir').value;
        if (!carreraId) {
            this.mostrarMensaje("Selecciona una carrera primero", "error");
            return;
        }
        
        try {
            console.log('💾 Guardando corrección para carrera:', carreraId);
            
            // 1. Recoger respuestas correctas (tu código funciona)
            const respuestasCorrectas = {};
            let todasCompletas = true;
            
            for (let i = 1; i <= 10; i++) {
                const input = document.getElementById(`respuesta_correcta_${i}`);
                if (!input) continue;
                
                const respuesta = input.value.trim();
                if (!respuesta) {
                    this.mostrarMensaje(`❌ Pregunta ${i} sin respuesta`, "error");
                    todasCompletas = false;
                    break;
                }
                
                respuestasCorrectas[`p${i}`] = respuesta;
            }
            
            if (!todasCompletas) return;
            
            if (Object.keys(respuestasCorrectas).length !== 10) {
                this.mostrarMensaje("❌ Debes seleccionar las 10 respuestas", "error");
                return;
            }
            
            // 2. Obtener usuario actual (para publicado_por)
            let usuarioId = null;
            try {
                const { data: { user } } = await this.supabase.auth.getUser();
                usuarioId = user?.id || null;
            } catch (authError) {
                console.warn('⚠️ Sin usuario autenticado');
            }
            
            // 3. PREPARAR DATOS CON LAS COLUMNAS EXACTAS DE TU TABLA
            const datosParaGuardar = {
                carrera_id: parseInt(carreraId),
                respuestas_correctas: respuestasCorrectas,
                publicado_por: usuarioId,
                fecha_publicacion: new Date().toISOString()
                // NO INCLUIR: estado (no existe en tu tabla)
                // NO INCLUIR: created_at (se genera automático)
            };
            
            console.log('📤 Datos a guardar:', datosParaGuardar);
            
            // 4. Guardar usando upsert (insert or update)
            const { data, error } = await this.supabase
                .from('resultados_carrera')
                .upsert(datosParaGuardar, {
                    onConflict: 'carrera_id',
                    ignoreDuplicates: false
                });
            
            if (error) {
                console.error('❌ Error Supabase:', error);
                
                // Intentar con insert normal si upsert falla
                if (error.code === 'PGRST204') {
                    console.log('🔄 Intentando insert directo...');
                    
                    // Primero intentar eliminar si existe
                    await this.supabase
                        .from('resultados_carrera')
                        .delete()
                        .eq('carrera_id', carreraId);
                    
                    // Luego insertar nuevo
                    const { data: newData, error: newError } = await this.supabase
                        .from('resultados_carrera')
                        .insert(datosParaGuardar);
                    
                    if (newError) throw newError;
                    
                    this.mostrarMensaje('✅ Respuestas guardadas (modo alternativo)', 'success');
                    console.log('✅ Corrección guardada con insert directo');
                    return;
                }
                
                throw error;
            }
            
            // 5. Éxito
            this.mostrarMensaje('✅ Respuestas correctas guardadas exitosamente', 'success');
            console.log('✅ Corrección guardada:', respuestasCorrectas);
            
            // 6. OPCIONAL: Calcular puntajes automáticamente
            // await this.calcularPuntajesCarrera(carreraId);
            
        } catch (error) {
            console.error('❌ Error guardando corrección:', error);
            
            let mensajeError = `Error: ${error.message}`;
            if (error.message.includes("column") && error.message.includes("does not exist")) {
                mensajeError = "Error: La tabla tiene columnas diferentes. Revisa la estructura.";
            }
            
            this.mostrarMensaje(mensajeError, 'error');
        }
    }
    
    async guardarPreguntas() {
        const carreraId = document.getElementById('select-carrera').value;
        if (!carreraId) {
            this.mostrarMensaje("Selecciona una carrera primero", "error");
            return;
        }
        
        try {
            const preguntas = [];
            
            for (let i = 1; i <= 10; i++) {
                const texto = document.getElementById(`p${i}_texto`).value.trim();
                const opcionA = document.getElementById(`p${i}_a`).value.trim();
                const opcionB = document.getElementById(`p${i}_b`).value.trim();
                const opcionC = document.getElementById(`p${i}_c`).value.trim();
                const area = document.getElementById(`p${i}_area`).value;  // ← Nuevo: obtener del select
                
                if (!texto || !opcionA || !opcionB || !opcionC) {
                    this.mostrarMensaje(`La pregunta ${i} tiene campos vacíos`, "error");
                    return;
                }
                
                preguntas.push({
                    carrera_id: parseInt(carreraId),
                    numero_pregunta: i,
                    texto_pregunta: texto,
                    opcion_a: opcionA,
                    opcion_b: opcionB,
                    opcion_c: opcionC,
                    area: area  // ← Guardar el área seleccionada
                });
            }
            
            // Eliminar existentes
            const { error: deleteError } = await this.supabase
                .from('preguntas_pronostico')
                .delete()
                .eq('carrera_id', carreraId);
            
            if (deleteError) throw deleteError;
            
            // Insertar nuevas
            const { error: insertError } = await this.supabase
                .from('preguntas_pronostico')
                .insert(preguntas);
            
            if (insertError) throw insertError;
            
            this.mostrarMensaje('✅ 10 preguntas guardadas correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error guardando preguntas:', error);
            this.mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    }
    
    setupEventos() {
        document.getElementById('btn-guardar-preguntas').addEventListener('click', () => this.guardarPreguntas());
        document.getElementById('btn-guardar-correccion').addEventListener('click', () => this.guardarCorreccion());
    }
    
    mostrarMensaje(texto, tipo = 'info') {
        const container = document.getElementById('mensajes');
        const mensaje = document.createElement('div');
        mensaje.className = `alert ${tipo}`;
        mensaje.innerHTML = texto;
        container.appendChild(mensaje);
        
        setTimeout(() => {
            if (mensaje.parentNode) mensaje.remove();
        }, 5000);
    }
}

// 4. INICIALIZAR CUANDO EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, creando Admin...');
    
    try {
        window.adminPronosticos = new AdminPronosticos();
        console.log('🎉 Admin creado exitosamente');
    } catch (error) {
        console.error('❌ Error creando Admin:', error);
        document.body.innerHTML = `
            <div style="padding: 50px; text-align: center; font-family: Arial;">
                <h1 style="color: red;">❌ ERROR INESPERADO</h1>
                <p>${error.message}</p>
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
});
