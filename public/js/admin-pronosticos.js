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
