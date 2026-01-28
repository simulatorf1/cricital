// Configuración Supabase (usa tus propias credenciales)
const SUPABASE_URL = 'https://xbnbbmhcveyzrvvmdktg.supabase.co';
const SUPABASE_ANON_KEY = 'tu_anon_key_aqui';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AdminPronosticos {
    constructor() {
        this.supabase = supabase;
        this.carreras = [];
        this.preguntasActuales = [];
        this.init();
    }
    
    async init() {
        console.log("🔧 Inicializando Admin Pronósticos");
        
        // Configurar tabs
        this.setupTabs();
        
        // Cargar carreras
        await this.cargarCarreras();
        
        // Configurar eventos
        this.setupEventos();
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
            const { data, error } = await this.supabase
                .from('calendario_gp')
                .select('*')
                .order('fecha_inicio', { ascending: true });
            
            if (error) throw error;
            
            this.carreras = data;
            
            // Llenar selectores
            this.actualizarSelectoresCarreras();
            
            console.log(`✅ ${data.length} carreras cargadas`);
            
        } catch (error) {
            console.error("❌ Error cargando carreras:", error);
            this.mostrarMensaje("Error cargando carreras", "error");
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
            // Buscar preguntas existentes
            const { data, error } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraId)
                .order('numero_pregunta', { ascending: true });
            
            if (error) throw error;
            
            this.preguntasActuales = data || [];
            
            // Generar formulario de 10 preguntas
            this.generarFormularioPreguntas(carreraId);
            
            document.getElementById('btn-guardar-preguntas').disabled = false;
            
        } catch (error) {
            console.error("❌ Error cargando preguntas:", error);
            this.mostrarMensaje("Error cargando preguntas", "error");
        }
    }
    
    generarFormularioPreguntas(carreraId) {
        const container = document.getElementById('preguntas-container');
        let html = '<div class="preguntas-grid">';
        
        // Mapeo de áreas para bonificaciones
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
            this.mostrarMensaje("Selecciona una carrera primero", "error");
            return;
        }
        
        try {
            const preguntas = [];
            
            // Recoger las 10 preguntas
            for (let i = 1; i <= 10; i++) {
                const texto = document.getElementById(`p${i}_texto`).value.trim();
                const opcionA = document.getElementById(`p${i}_a`).value.trim();
                const opcionB = document.getElementById(`p${i}_b`).value.trim();
                const opcionC = document.getElementById(`p${i}_c`).value.trim();
                const area = document.getElementById(`p${i}_area`).value;
                
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
                    area: area
                });
            }
            
            // 1. Eliminar preguntas existentes para esta carrera
            const { error: deleteError } = await this.supabase
                .from('preguntas_pronostico')
                .delete()
                .eq('carrera_id', carreraId);
            
            if (deleteError) throw deleteError;
            
            // 2. Insertar nuevas preguntas
            const { error: insertError } = await this.supabase
                .from('preguntas_pronostico')
                .insert(preguntas);
            
            if (insertError) throw insertError;
            
            this.mostrarMensaje("✅ 10 preguntas guardadas correctamente", "success");
            console.log("📝 Preguntas guardadas:", preguntas);
            
        } catch (error) {
            console.error("❌ Error guardando preguntas:", error);
            this.mostrarMensaje(`Error: ${error.message}`, "error");
        }
    }
    
    async cargarParaCorreccion(carreraId) {
        if (!carreraId) return;
        
        try {
            // 1. Cargar preguntas de esta carrera
            const { data: preguntas, error: errorPreguntas } = await this.supabase
                .from('preguntas_pronostico')
                .select('*')
                .eq('carrera_id', carreraId)
                .order('numero_pregunta', { ascending: true });
            
            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                document.getElementById('correccion-container').innerHTML = `
                    <div class="alert error">
                        <p>⚠️ Esta carrera no tiene preguntas creadas.</p>
                        <p>Primero crea las preguntas en la pestaña "Crear Preguntas".</p>
                    </div>
                `;
                document.getElementById('btn-guardar-correccion').disabled = true;
                return;
            }
            
            // 2. Cargar respuestas correctas existentes (si hay)
            const { data: correccionExistente } = await this.supabase
                .from('resultados_carrera')
                .select('*')
                .eq('carrera_id', carreraId)
                .single();
            
            // 3. Generar formulario de corrección
            this.generarFormularioCorreccion(preguntas, correccionExistente);
            
            document.getElementById('btn-guardar-correccion').disabled = false;
            
        } catch (error) {
            console.error("❌ Error cargando para corrección:", error);
            this.mostrarMensaje("Error cargando datos para corrección", "error");
        }
    }
    
    generarFormularioCorreccion(preguntas, correccionExistente) {
        const container = document.getElementById('correccion-container');
        let html = `
            <div class="alert info">
                <p>Selecciona la respuesta correcta para cada pregunta.</p>
                <p>Al guardar, el sistema calculará automáticamente los aciertos de todos los usuarios.</p>
            </div>
            
            <div class="preguntas-grid">
        `;
        
        const respuestasGuardadas = correccionExistente?.respuestas_correctas || {};
        
        preguntas.forEach((pregunta, index) => {
            const numero = index + 1;
            const respuestaGuardada = respuestasGuardadas[`p${numero}`];
            
            html += `
                <div class="pregunta-card">
                    <h3>Pregunta ${numero}: ${pregunta.texto_pregunta}</h3>
                    
                    <div class="opciones">
                        <div class="${respuestaGuardada === 'A' ? 'respuesta-correcta' : ''}">
                            <label>
                                <input type="radio" name="p${numero}" value="A" ${respuestaGuardada === 'A' ? 'checked' : ''}>
                                <strong>A)</strong> ${pregunta.opcion_a}
                            </label>
                        </div>
                        <div class="${respuestaGuardada === 'B' ? 'respuesta-correcta' : ''}">
                            <label>
                                <input type="radio" name="p${numero}" value="B" ${respuestaGuardada === 'B' ? 'checked' : ''}>
                                <strong>B)</strong> ${pregunta.opcion_b}
                            </label>
                        </div>
                        <div class="${respuestaGuardada === 'C' ? 'respuesta-correcta' : ''}">
                            <label>
                                <input type="radio" name="p${numero}" value="C" ${respuestaGuardada === 'C' ? 'checked' : ''}>
                                <strong>C)</strong> ${pregunta.opcion_c}
                            </label>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    async guardarCorreccion() {
        const carreraId = document.getElementById('select-carrera-corregir').value;
        if (!carreraId) {
            this.mostrarMensaje("Selecciona una carrera primero", "error");
            return;
        }
        
        try {
            const respuestasCorrectas = {};
            let completado = true;
            
            // Recoger las 10 respuestas
            for (let i = 1; i <= 10; i++) {
                const respuesta = document.querySelector(`input[name="p${i}"]:checked`);
                if (!respuesta) {
                    this.mostrarMensaje(`Debes seleccionar respuesta para pregunta ${i}`, "error");
                    completado = false;
                    break;
                }
                respuestasCorrectas[`p${i}`] = respuesta.value;
            }
            
            if (!completado) return;
            
            // Guardar en resultados_carrera
            const { error } = await this.supabase
                .from('resultados_carrera')
                .upsert([{
                    carrera_id: parseInt(carreraId),
                    respuestas_correctas: respuestasCorrectas,
                    fecha_publicacion: new Date().toISOString()
                }], {
                    onConflict: 'carrera_id'
                });
            
            if (error) throw error;
            
            // Actualizar estado de pronósticos
            await this.supabase
                .from('pronosticos_usuario')
                .update({ estado: 'calificado' })
                .eq('carrera_id', carreraId);
            
            // Crear notificaciones para usuarios
            await this.crearNotificacionesResultados(carreraId);
            
            this.mostrarMensaje("✅ Respuestas correctas guardadas. Los pronósticos se están calificando.", "success");
            console.log("📊 Corrección guardada:", respuestasCorrectas);
            
        } catch (error) {
            console.error("❌ Error guardando corrección:", error);
            this.mostrarMensaje(`Error: ${error.message}`, "error");
        }
    }
    
    async crearNotificacionesResultados(carreraId) {
        // Obtener carrera para el nombre
        const carrera = this.carreras.find(c => c.id == carreraId);
        if (!carrera) return;
        
        // Obtener usuarios con pronósticos
        const { data: pronosticos } = await this.supabase
            .from('pronosticos_usuario')
            .select('escuderia_id')
            .eq('carrera_id', carreraId);
        
        if (!pronosticos || pronosticos.length === 0) return;
        
        // Obtener user_id de cada escudería
        const notificaciones = [];
        for (const pronostico of pronosticos) {
            const { data: escuderia } = await this.supabase
                .from('escuderias')
                .select('user_id')
                .eq('id', pronostico.escuderia_id)
                .single();
            
            if (escuderia && escuderia.user_id) {
                notificaciones.push({
                    usuario_id: escuderia.user_id,
                    tipo: 'resultados',
                    titulo: 'Resultados disponibles',
                    mensaje: `Los resultados del ${carrera.nombre} están disponibles`,
                    vista: false,
                    fecha_creacion: new Date().toISOString()
                });
            }
        }
        
        if (notificaciones.length > 0) {
            await this.supabase
                .from('notificaciones_usuarios')
                .insert(notificaciones);
            console.log(`📢 ${notificaciones.length} notificaciones creadas`);
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
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 5000);
    }
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.adminPronosticos = new AdminPronosticos();
});
