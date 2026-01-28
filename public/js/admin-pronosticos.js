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

// 2. CREAR CLIENTE
let supabaseCliente;
try {
    supabaseCliente = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente Supabase creado');
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
        console.log("🔨 Constructor: window.supabaseCliente =", window.supabaseCliente);
        console.log("🔨 ¿Tiene .from?", typeof window.supabaseCliente?.from);
        
        this.supabase = window.supabaseCliente;
        this.carreras = [];
        this.preguntasActuales = [];
        this.init();
    }
    
    // 🔴 🔴 🔴 AÑADE ESTOS TRES MÉTODOS BÁSICOS:
    setupTabs() {
        console.log("📋 Configurando tabs...");
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                console.log("Click en tab:", tabId);
                
                // Remover activo
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activar
                e.target.classList.add('active');
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
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
        
        const areas = [
            'meteorologia', 'fiabilidad', 'estrategia', 'rendimiento', 'neumaticos',
            'seguridad', 'clasificacion', 'carrera', 'overtakes', 'incidentes'
        ];
        
        for (let i = 1; i <= 10; i++) {
            const preguntaExistente = this.preguntasActuales.find(p => p.numero_pregunta === i);
            const area = areas[i-1] || 'general';
            
            html += `
                <div class="pregunta-card" data-numero="${i}">
                    <h3>Pregunta ${i} <small style="color: #00D2BE;">(${area})</small></h3>
                    
                    <label>Texto de la pregunta:</label>
                    <textarea id="p${i}_texto" rows="3" placeholder="Ej: ¿Quién conseguirá la pole position?">${preguntaExistente?.texto_pregunta || ''}</textarea>
                    
                    <div class="opciones">
                        <div>
                            <label>Opción A:</label>
                            <input type="text" id="p${i}_a" value="${preguntaExistente?.opcion_a || ''}" placeholder="Respuesta A">
                        </div>
                        <div>
                            <label>Opción B:</label>
                            <input type="text" id="p${i}_b" value="${preguntaExistente?.opcion_b || ''}" placeholder="Respuesta B">
                        </div>
                        <div>
                            <label>Opción C:</label>
                            <input type="text" id="p${i}_c" value="${preguntaExistente?.opcion_c || ''}" placeholder="Respuesta C">
                        </div>
                    </div>
                    
                    <input type="hidden" id="p${i}_area" value="${area}">
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    async guardarPreguntas() {
        const carreraId = document.getElementById('select-carrera').value;
        if (!carreraId) {
            this.mostrarMensaje('Selecciona una carrera primero', 'error');
            return;
        }
        
        try {
            const preguntas = [];
            
            for (let i = 1; i <= 10; i++) {
                const texto = document.getElementById(`p${i}_texto`).value.trim();
                const opcionA = document.getElementById(`p${i}_a`).value.trim();
                const opcionB = document.getElementById(`p${i}_b`).value.trim();
                const opcionC = document.getElementById(`p${i}_c`).value.trim();
                const area = document.getElementById(`p${i}_area`).value;
                
                if (!texto || !opcionA || !opcionB || !opcionC) {
                    this.mostrarMensaje(`La pregunta ${i} tiene campos vacíos`, 'error');
                    return;
                }
                
                preguntas.push({
                    carrera_id: parseInt(carreraId),
                    numero_pregunta: i,
                    texto_pregunta: texto,
                    opcion_a: opcionA,
                    opcion_b: opcionB,
                    opcion_c: opcionC,
                    area: area
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
