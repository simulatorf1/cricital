// pronosticos.js
// Sistema de pronósticos para F1 Manager

import { supabase } from './supabase-client.js';

// Variables globales
let preguntaAreas = {}; // Mapeo de preguntas a áreas
let preguntasActuales = []; // Preguntas de la carrera actual
let carreraActual = null; // Datos de la carrera actual
let usuarioPuntos = 0; // Puntos actuales del usuario
let estrategasActivos = []; // Estrategias contratados
let pronosticoGuardado = false; // Estado del pronóstico

// Inicializar sistema de pronósticos
export function initPronosticos() {
    console.log("Sistema de pronósticos inicializado");
    
    // Configurar mapeo de áreas para bonificaciones
    preguntaAreas = {
        1: 'meteorologia',
        2: 'fiabilidad',
        3: 'estrategia',
        4: 'rendimiento',
        5: 'neumaticos',
        6: 'seguridad',
        7: 'clasificacion',
        8: 'carrera',
        9: 'overtakes',
        10: 'incidentes'
    };
    
    // Verificar si hay notificaciones pendientes
    verificarNotificaciones();
}

// ============================================
// FUNCIÓN PRINCIPAL: Cargar pantalla de pronósticos
// ============================================
export async function cargarPantallaPronostico() {
    console.log("Cargando pantalla de pronósticos...");
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        mostrarError("Debes iniciar sesión para hacer pronósticos");
        return;
    }
    
    // Obtener carrera activa más próxima
    const hoy = new Date();
    const { data: carreras, error } = await supabase
        .from('calendario_gp')
        .select('*')
        .gte('fecha_carrera', hoy.toISOString().split('T')[0])
        .order('fecha_carrera', { ascending: true })
        .limit(1);
    
    if (error || !carreras || carreras.length === 0) {
        mostrarError("No hay carreras próximas disponibles");
        return;
    }
    
    carreraActual = carreras[0];
    
    // Verificar fecha límite (48 horas antes)
    const fechaLimite = new Date(carreraActual.fecha_limite_pronosticos || carreraActual.fecha_carrera);
    fechaLimite.setHours(fechaLimite.getHours() - 48);
    
    if (hoy > fechaLimite) {
        mostrarError("El plazo para pronósticos ha expirado (48 horas antes de la carrera)");
        return;
    }
    
    // Verificar si ya hizo pronóstico
    const { data: pronosticoExistente } = await supabase
        .from('pronosticos_usuario')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('carrera_id', carreraActual.id)
        .single();
    
    pronosticoGuardado = !!pronosticoExistente;
    
    // Obtener preguntas de la carrera
    await cargarPreguntasCarrera(carreraActual.id);
    
    // Obtener datos del usuario
    await cargarDatosUsuario(user.id);
    
    // Mostrar interfaz
    mostrarInterfazPronostico();
}

// ============================================
// CARGAR PREGUNTAS DE LA CARRERA
// ============================================
async function cargarPreguntasCarrera(carreraId) {
    const { data, error } = await supabase
        .from('preguntas_pronostico')
        .select('*')
        .eq('carrera_id', carreraId)
        .order('numero_pregunta', { ascending: true });
    
    if (error) {
        console.error("Error cargando preguntas:", error);
        preguntasActuales = generarPreguntasDefault();
    } else {
        preguntasActuales = data;
    }
}

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================
async function cargarDatosUsuario(usuarioId) {
    try {
        // 1. Obtener puntos del coche
        const { data: coche } = await supabase
            .from('coches_stats')
            .select('puntos_totales')
            .eq('usuario_id', usuarioId)
            .single();
        
        usuarioPuntos = coche?.puntos_totales || 0;
        
        // 2. Obtener estrategas contratados
        const { data: estrategas } = await supabase
            .from('ingenieros_contratados')
            .select(`
                ingeniero_id,
                ingenieros (
                    nombre,
                    especialidad,
                    bonificacion_meteorologia,
                    bonificacion_fiabilidad,
                    bonificacion_estrategia,
                    bonificacion_rendimiento
                )
            `)
            .eq('usuario_id', usuarioId)
            .eq('activo', true);
        
        estrategasActivos = estrategas || [];
        
    } catch (error) {
        console.error("Error cargando datos usuario:", error);
    }
}

// ============================================
// MOSTRAR INTERFAZ DE PRONÓSTICOS
// ============================================
function mostrarInterfazPronostico() {
    const mainContent = document.getElementById('main-content');
    
    if (pronosticoGuardado) {
        mainContent.innerHTML = `
            <div class="pronostico-container">
                <h2><i class="fas fa-flag-checkered"></i> Pronóstico para ${carreraActual.nombre_gp}</h2>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> 
                    <strong>¡Ya has enviado tu pronóstico!</strong>
                    <p>Puedes revisar tus respuestas y esperar los resultados.</p>
                    <button class="btn btn-info mt-2" onclick="verPronosticoGuardado()">
                        Ver mi pronóstico
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Calcular fecha estimada de resultados
    const fechaCarrera = new Date(carreraActual.fecha_carrera);
    fechaCarrera.setHours(fechaCarrera.getHours() + 24);
    const fechaResultados = fechaCarrera.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Generar HTML de estrategas
    let estrategasHTML = '<p class="text-muted">No tienes estrategas contratados</p>';
    if (estrategasActivos.length > 0) {
        estrategasHTML = estrategasActivos.map(e => `
            <div class="estratega-card">
                <strong>${e.ingenieros.nombre}</strong>
                <small class="text-muted">${e.ingenieros.especialidad}</small>
                <div class="bonificaciones">
                    ${e.ingenieros.bonificacion_meteorologia > 0 ? 
                        `<span class="badge bg-info">Meteo: +${e.ingenieros.bonificacion_meteorologia}%</span>` : ''}
                    ${e.ingenieros.bonificacion_fiabilidad > 0 ? 
                        `<span class="badge bg-warning">Fiab: +${e.ingenieros.bonificacion_fiabilidad}%</span>` : ''}
                    ${e.ingenieros.bonificacion_estrategia > 0 ? 
                        `<span class="badge bg-success">Estr: +${e.ingenieros.bonificacion_estrategia}%</span>` : ''}
                    ${e.ingenieros.bonificacion_rendimiento > 0 ? 
                        `<span class="badge bg-danger">Rend: +${e.ingenieros.bonificacion_rendimiento}%</span>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    // Generar formulario de preguntas
    let preguntasHTML = '';
    preguntasActuales.forEach((pregunta, index) => {
        preguntasHTML += `
            <div class="pregunta-card" data-area="${preguntaAreas[index + 1]}">
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
                    <span class="badge bg-secondary">${preguntaAreas[index + 1].toUpperCase()}</span>
                    ${calcularBonificacionArea(preguntaAreas[index + 1]) > 0 ? 
                        `<span class="bonificacion-text">
                            <i class="fas fa-chart-line"></i> 
                            Bonificación: +${calcularBonificacionArea(preguntaAreas[index + 1])}%
                        </span>` : ''}
                </div>
            </div>
        `;
    });
    
    mainContent.innerHTML = `
        <div class="pronostico-container">
            <!-- Resumen explicativo -->
            <div class="resumen-explicativo card mb-4">
                <div class="card-header bg-primary text-white">
                    <h4><i class="fas fa-info-circle"></i> Información importante</h4>
                </div>
                <div class="card-body">
                    <p>Al enviar tu pronóstico, se registrará un <strong>snapshot</strong> de:</p>
                    
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="stat-card">
                                <h6><i class="fas fa-car"></i> Puntos actuales del coche</h6>
                                <div class="stat-value">${usuarioPuntos} puntos</div>
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
            
            <!-- Formulario de pronóstico -->
            <form id="formPronostico" onsubmit="guardarPronostico(event)">
                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h4><i class="fas fa-bullseye"></i> Pronóstico - ${carreraActual.nombre_gp}</h4>
                    </div>
                    <div class="card-body">
                        ${preguntasHTML}
                        
                        <div class="mt-4">
                            <button type="submit" class="btn btn-success btn-lg">
                                <i class="fas fa-paper-plane"></i> Enviar pronóstico
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="cancelarPronostico()">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
}

// ============================================
// GUARDAR PRONÓSTICO
// ============================================
export async function guardarPronostico(event) {
    if (event) event.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Recoger respuestas
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
        mostrarError("Debes responder todas las preguntas");
        return;
    }
    
    // Preparar snapshot de estrategas
    const snapshotEstrategas = estrategasActivos.map(e => ({
        ingeniero_id: e.ingeniero_id,
        nombre: e.ingenieros.nombre,
        especialidad: e.ingenieros.especialidad,
        bonificaciones: {
            meteorologia: e.ingenieros.bonificacion_meteorologia,
            fiabilidad: e.ingenieros.bonificacion_fiabilidad,
            estrategia: e.ingenieros.bonificacion_estrategia,
            rendimiento: e.ingenieros.bonificacion_rendimiento
        }
    }));
    
    try {
        // Insertar pronóstico
        const { data, error } = await supabase
            .from('pronosticos_usuario')
            .insert([{
                usuario_id: user.id,
                carrera_id: carreraActual.id,
                respuestas: respuestas,
                puntos_coche_snapshot: usuarioPuntos,
                estrategas_snapshot: snapshotEstrategas,
                fecha_pronostico: new Date().toISOString(),
                estado: 'pendiente'
            }]);
        
        if (error) throw error;
        
        // Mostrar confirmación
        mostrarConfirmacion(`
            <h4><i class="fas fa-check-circle text-success"></i> ¡Pronóstico enviado!</h4>
            <p>Tu pronóstico para <strong>${carreraActual.nombre_gp}</strong> ha sido registrado correctamente.</p>
            <p>Recibirás una notificación cuando los resultados estén disponibles.</p>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="cargarPantallaPronostico()">
                    Aceptar
                </button>
            </div>
        `);
        
        pronosticoGuardado = true;
        
    } catch (error) {
        console.error("Error guardando pronóstico:", error);
        mostrarError("Error al guardar el pronóstico. Inténtalo de nuevo.");
    }
}

// ============================================
// CARGAR RESULTADOS DE CARRERA
// ============================================
export async function cargarResultadosCarrera(carreraId = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    if (!carreraId) {
        // Obtener última carrera con resultados
        const { data: carrera } = await supabase
            .from('calendario_gp')
            .select('id, nombre_gp')
            .lt('fecha_carrera', new Date().toISOString())
            .order('fecha_carrera', { ascending: false })
            .limit(1)
            .single();
        
        if (carrera) carreraId = carrera.id;
    }
    
    if (!carreraId) {
        mostrarError("No hay resultados disponibles");
        return;
    }
    
    // Cargar resultados del usuario
    const { data: resultado } = await supabase
        .from('pronosticos_usuario')
        .select(`
            *,
            carreras:calendario_gp(nombre_gp),
            resultados_carrera(respuestas_correctas)
        `)
        .eq('usuario_id', user.id)
        .eq('carrera_id', carreraId)
        .single();
    
    if (!resultado || resultado.estado !== 'calificado') {
        mostrarError("Los resultados no están disponibles aún");
        return;
    }
    
    // Cargar preguntas
    const { data: preguntas } = await supabase
        .from('preguntas_pronostico')
        .select('*')
        .eq('carrera_id', carreraId)
        .order('numero_pregunta', { ascending: true });
    
    // Mostrar resultados
    mostrarDesgloseResultados(resultado, preguntas);
}

// ============================================
// MOSTRAR DESGLOSE DE RESULTADOS
// ============================================
function mostrarDesgloseResultados(resultado, preguntas) {
    const respuestasUsuario = resultado.respuestas;
    const respuestasCorrectas = resultado.resultados_carrera?.respuestas_correctas || {};
    const estrategas = resultado.estrategas_snapshot || [];
    
    // Calcular aciertos y puntos
    let aciertos = 0;
    let puntosPorAciertos = 0;
    let bonificacionesAplicadas = [];
    
    let desgloseHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const pregunta = preguntas.find(p => p.numero_pregunta === i);
        const respuestaUsuario = respuestasUsuario[`p${i}`];
        const respuestaCorrecta = respuestasCorrectas[`p${i}`];
        const esCorrecta = respuestaUsuario === respuestaCorrecta;
        const area = preguntaAreas[i];
        
        if (esCorrecta) {
            aciertos++;
            let puntosPregunta = 100; // Puntos base por acierto
            
            // Aplicar bonificaciones
            let bonificacionTotal = calcularBonificacionArea(area, estrategas);
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
                <td>${pregunta.texto_pregunta}</td>
                <td>
                    <span class="badge ${respuestaUsuario === 'A' ? 'bg-primary' : 'bg-secondary'}">
                        ${respuestaUsuario}: ${pregunta[`opcion_${respuestaUsuario.toLowerCase()}`]}
                    </span>
                </td>
                <td>
                    <span class="badge ${respuestaCorrecta === 'A' ? 'bg-primary' : 'bg-secondary'}">
                        ${respuestaCorrecta}: ${pregunta[`opcion_${respuestaCorrecta.toLowerCase()}`]}
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
    
    // Calcular total
    const puntosTotales = resultado.puntos_coche_snapshot + puntosPorAciertos;
    const dineroGanado = calcularDinero(puntosTotales);
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="resultados-container">
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h4><i class="fas fa-chart-bar"></i> Resultados - ${resultado.carreras.nombre_gp}</h4>
                </div>
                <div class="card-body">
                    <!-- Resumen general -->
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
                    
                    <!-- Desglose detallado -->
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
                    
                    <!-- Bonificaciones aplicadas -->
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
                    
                    <!-- Cálculo final -->
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
                        <button class="btn btn-primary" onclick="actualizarDineroEscuderia(${dineroGanado})">
                            <i class="fas fa-money-bill-wave"></i> Añadir dinero a mi escudería
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Calcular bonificación por área
function calcularBonificacionArea(area, estrategas = estrategasActivos) {
    let bonificacion = 0;
    
    estrategas.forEach(e => {
        const estratega = e.ingenieros || e;
        switch(area) {
            case 'meteorologia':
                bonificacion += estratega.bonificacion_meteorologia || 0;
                break;
            case 'fiabilidad':
                bonificacion += estratega.bonificacion_fiabilidad || 0;
                break;
            case 'estrategia':
                bonificacion += estratega.bonificacion_estrategia || 0;
                break;
            case 'rendimiento':
                bonificacion += estratega.bonificacion_rendimiento || 0;
                break;
        }
    });
    
    return bonificacion;
}

// Calcular dinero a partir de puntos
function calcularDinero(puntos) {
    // Fórmula configurable: 1 punto = $10
    const tasaConversion = 10;
    return Math.round(puntos * tasaConversion);
}

// Verificar notificaciones
async function verificarNotificaciones() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: notificaciones } = await supabase
        .from('notificaciones_usuarios')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('vista', false)
        .order('fecha_creacion', { ascending: false });
    
    if (notificaciones && notificaciones.length > 0) {
        mostrarBadgeNotificaciones(notificaciones.length);
    }
}

// Mostrar badge de notificaciones
function mostrarBadgeNotificaciones(cantidad) {
    const notificacionBadge = document.getElementById('notificacion-badge');
    if (notificacionBadge) {
        notificacionBadge.textContent = cantidad;
        notificacionBadge.style.display = 'inline-block';
    }
}

// Generar preguntas por defecto (backup)
function generarPreguntasDefault() {
    const preguntas = [];
    for (let i = 1; i <= 10; i++) {
        preguntas.push({
            numero_pregunta: i,
            texto_pregunta: `Pregunta ${i} - ¿Cuál será el resultado?`,
            opcion_a: "Opción A",
            opcion_b: "Opción B",
            opcion_c: "Opción C",
            area: preguntaAreas[i] || 'general'
        });
    }
    return preguntas;
}

// Mostrar error
function mostrarError(mensaje) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i> ${mensaje}
        </div>
    `;
}

// Mostrar confirmación
function mostrarConfirmacion(html) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${html}
        </div>
    `;
    document.body.appendChild(modal);
}

// Cancelar pronóstico
function cancelarPronostico() {
    window.location.hash = '#dashboard';
}

// Actualizar dinero de la escudería
async function actualizarDineroEscuderia(cantidad) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Obtener dinero actual
    const { data: escuderia } = await supabase
        .from('escuderias')
        .select('dinero')
        .eq('usuario_id', user.id)
        .single();
    
    // Actualizar
    const nuevoDinero = (escuderia.dinero || 0) + cantidad;
    await supabase
        .from('escuderias')
        .update({ dinero: nuevoDinero })
        .eq('usuario_id', user.id);
    
    mostrarConfirmacion(`
        <h4><i class="fas fa-money-bill-wave text-success"></i> ¡Dinero actualizado!</h4>
        <p>Se han añadido <strong>$${cantidad}</strong> a tu escudería.</p>
        <p>Dinero total: <strong>$${nuevoDinero}</strong></p>
        <button class="btn btn-primary mt-3" onclick="location.reload()">
            Aceptar
        </button>
    `);
}

// ============================================
// FUNCIONES PARA ADMINISTRADOR
// ============================================

// Panel administrativo (solo admin)
export async function cargarPanelAdminPronosticos() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Verificar si es admin
    const { data: perfil } = await supabase
        .from('perfiles_usuario')
        .select('rol')
        .eq('id', user.id)
        .single();
    
    if (perfil.rol !== 'admin') {
        mostrarError("No tienes permisos de administrador");
        return;
    }
    
    // Obtener carreras
    const { data: carreras } = await supabase
        .from('calendario_gp')
        .select('*')
        .order('fecha_carrera', { ascending: true });
    
    let carrerasHTML = '<option value="">Seleccionar carrera</option>';
    carreras.forEach(c => {
        carrerasHTML += `<option value="${c.id}">${c.nombre_gp} - ${c.fecha_carrera}</option>`;
    });
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="admin-panel">
            <h3><i class="fas fa-cogs"></i> Panel de Administración - Pronósticos</h3>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-plus-circle"></i> Crear preguntas</h5>
                        </div>
                        <div class="card-body">
                            <form id="formCrearPreguntas" onsubmit="crearPreguntasCarrera(event)">
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
                            <form id="formResultados" onsubmit="guardarResultadosCarrera(event)">
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

// Crear preguntas para una carrera
export async function crearPreguntasCarrera(event) {
    event.preventDefault();
    
    const carreraId = document.getElementById('carreraPreguntas').value;
    
    // Crear 10 preguntas por defecto
    const preguntas = [];
    for (let i = 1; i <= 10; i++) {
        preguntas.push({
            carrera_id: carreraId,
            numero_pregunta: i,
            texto_pregunta: `Pregunta ${i} - Editar texto según la carrera`,
            opcion_a: "Opción A",
            opcion_b: "Opción B",
            opcion_c: "Opción C",
            area: preguntaAreas[i] || 'general'
        });
    }
    
    try {
        const { error } = await supabase
            .from('preguntas_pronostico')
            .insert(preguntas);
        
        if (error) throw error;
        
        mostrarConfirmacion(`
            <h4><i class="fas fa-check"></i> Preguntas creadas</h4>
            <p>Se han creado 10 preguntas para la carrera.</p>
            <p>Recuerda editarlas para personalizarlas.</p>
        `);
    } catch (error) {
        mostrarError("Error al crear preguntas");
    }
}

// Guardar resultados de carrera
export async function guardarResultadosCarrera(event) {
    event.preventDefault();
    
    const carreraId = document.getElementById('carreraResultados').value;
    
    // Recoger respuestas
    const respuestasCorrectas = {};
    for (let i = 1; i <= 10; i++) {
        const respuesta = document.querySelector(`input[name="p${i}"]:checked`);
        if (!respuesta) {
            mostrarError(`Debes seleccionar respuesta para pregunta ${i}`);
            return;
        }
        respuestasCorrectas[`p${i}`] = respuesta.value;
    }
    
    try {
        // Guardar resultados
        const { error } = await supabase
            .from('resultados_carrera')
            .insert([{
                carrera_id: carreraId,
                respuestas_correctas: respuestasCorrectas,
                fecha_publicacion: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        // Actualizar estado de pronósticos
        await supabase
            .from('pronosticos_usuario')
            .update({ estado: 'calificado' })
            .eq('carrera_id', carreraId);
        
        // Crear notificaciones para usuarios
        await crearNotificacionesResultados(carreraId);
        
        mostrarConfirmacion(`
            <h4><i class="fas fa-check-circle"></i> Resultados guardados</h4>
            <p>Los resultados han sido publicados y los usuarios han sido notificados.</p>
            <p>Los pronósticos se están calificando automáticamente.</p>
        `);
        
    } catch (error) {
        mostrarError("Error al guardar resultados");
    }
}

// Crear notificaciones de resultados
async function crearNotificacionesResultados(carreraId) {
    // Obtener usuarios con pronósticos
    const { data: pronosticos } = await supabase
        .from('pronosticos_usuario')
        .select('usuario_id')
        .eq('carrera_id', carreraId);
    
    if (!pronosticos) return;
    
    // Obtener nombre de la carrera
    const { data: carrera } = await supabase
        .from('calendario_gp')
        .select('nombre_gp')
        .eq('id', carreraId)
        .single();
    
    // Crear notificaciones
    const notificaciones = pronosticos.map(p => ({
        usuario_id: p.usuario_id,
        tipo: 'resultados',
        titulo: 'Resultados disponibles',
        mensaje: `Los resultados del GP ${carrera.nombre_gp} están disponibles`,
        fecha_creacion: new Date().toISOString(),
        vista: false
    }));
    
    await supabase
        .from('notificaciones_usuarios')
        .insert(notificaciones);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página correcta
    if (window.location.hash === '#pronosticos') {
        initPronosticos();
    }
});

// Hacer funciones disponibles globalmente
window.cargarPantallaPronostico = cargarPantallaPronostico;
window.guardarPronostico = guardarPronostico;
window.cargarResultadosCarrera = cargarResultadosCarrera;
window.cargarPanelAdminPronosticos = cargarPanelAdminPronosticos;
window.crearPreguntasCarrera = crearPreguntasCarrera;
window.guardarResultadosCarrera = guardarResultadosCarrera;
