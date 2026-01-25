// ========================
// F1 MANAGER - TUTORIAL.JS
// ========================
console.log('📚 Tutorial cargado');

// ========================
// CLASE TUTORIAL MANAGER
// ========================
class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.step = 0;
        this.data = null;
        this.strategaSeleccionado = null;
        this.fabricacionSeleccionada = null;
        this.pronosticos = {};
    }

    // ========================
    // INICIAR TUTORIAL
    // ========================
    iniciar() {
        this.step = 1;
        this.data = {
            escuderiaCreada: false,
            pilotosContratados: [],
            fabricacionIniciada: false,
            piezaEquipada: false,
            apuestaRealizada: false
        };
        
        this.mostrarPaso();
    }

    // ========================
    // MOSTRAR PASO ACTUAL
    // ========================
    mostrarPaso() {
        const pasos = [
            // PASO 1: Bienvenida
            {
                title: "🏆 ¡BIENVENIDO A RACE STRATEGY MANAGER!",
                content: `
                    <p>Eres el nuevo director de la escudería <span class="escuderia-destacada">${this.f1Manager.escuderia.nombre || "TU EQUIPO"}</span>.</p>
                    
                    <p>Estás a punto de unirte a <strong class="online">una comunidad global</strong> de miles de directores de escuderías que compiten por ser los mejores estrategas del mundo.</p>
                    
                    <div class="highlight-box">
                        <p>💰 <strong>¡Gran noticia!</strong></p>
                        <p>Tus patrocinadores confían en tu visión y han depositado <strong class="money">5,000,000€</strong> en la cuenta del equipo para relanzar esta nueva etapa.</p>
                    </div>
                    
                    <p class="main-mission">🎯 <strong>Tu misión será:</strong></p>
                    <ul>
                        <li>Gestionar y desarrollar tu escudería en <strong>11 áreas técnicas clave</strong></li>
                        <li>Anticiparte a lo que ocurra en carreras reales mediante <strong>estrategas especializados</strong></li>
                        <li>Tomar decisiones que conviertan tus aciertos en puntos y dinero</li>
                        <li>Competir contra miles de jugadores para convertirte en <strong>el mejor estratega del mundo</strong></li>
                    </ul>
                `,
                action: 'siguiente'
            },
            
            // PASO 2: Secciones en GRID
            {
                title: "📊 SECCIONES DE GESTIÓN",
                content: `
                    <p>Tu escudería se gestiona en <strong>6 secciones</strong>:</p>
                    
                    <div class="grid-6-columns">
                        <div class="grid-btn-big">
                            <div class="grid-icon">🏠</div>
                            <div>
                                <div class="grid-title">PRINCIPAL</div>
                                <div class="grid-desc">Vista general del equipo</div>
                            </div>
                        </div>
                        
                        <div class="grid-btn-big">
                            <div class="grid-icon">🔧</div>
                            <div>
                                <div class="grid-title">TALLER</div>
                                <div class="grid-desc">Fabrica piezas del coche</div>
                            </div>
                        </div>
                        
                        <div class="grid-btn-big">
                            <div class="grid-icon">👥</div>
                            <div>
                                <div class="grid-title">EQUIPO</div>
                                <div class="grid-desc">Contrata estrategas</div>
                            </div>
                        </div>
                        
                        <div class="grid-btn-big">
                            <div class="grid-icon">📦</div>
                            <div>
                                <div class="grid-title">ALMACÉN</div>
                                <div class="grid-desc">Equipa o vende piezas</div>
                            </div>
                        </div>
                        
                        <div class="grid-btn-big">
                            <div class="grid-icon">🎯</div>
                            <div>
                                <div class="grid-title">PRONÓSTICOS</div>
                                <div class="grid-desc">Apuesta en carreras</div>
                            </div>
                        </div>
                        
                        <div class="grid-btn-big">
                            <div class="grid-icon">🏆</div>
                            <div>
                                <div class="grid-title">RANKING</div>
                                <div class="grid-desc">Clasificaciones globales</div>
                            </div>
                        </div>
                    </div>
                `,
                action: 'siguiente'
            },
            
            // PASO 3: Áreas técnicas en GRID
            {
                title: "🔧 11 ÁREAS TÉCNICAS",
                content: `
                    <p>Desarrolla <strong>11 áreas</strong> fabricando piezas:</p>
                    
                    <div class="grid-4-columns">
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🏎️</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">SUELO Y DIFUSOR</div>
                                <div class="area-grid-desc">Adherencia</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">⚙️</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">MOTOR</div>
                                <div class="area-grid-desc">Potencia</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🪽</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">ALERÓN DELANTERO</div>
                                <div class="area-grid-desc">Aerodinámica frontal</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🔄</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">CAJA DE CAMBIOS</div>
                                <div class="area-grid-desc">Transmisión</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">📦</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">PONTONES</div>
                                <div class="area-grid-desc">Enfriamiento</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">⚖️</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">SUSPENSIÓN</div>
                                <div class="area-grid-desc">Estabilidad</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🌪️</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">ALERÓN TRASERO</div>
                                <div class="area-grid-desc">Aerodinámica trasera</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">📊</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">CHASIS</div>
                                <div class="area-grid-desc">Estructura</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🛑</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">FRENOS</div>
                                <div class="area-grid-desc">Detención</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🎮</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">VOLANTE</div>
                                <div class="area-grid-desc">Control</div>
                            </div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">💡</div>
                            <div class="area-grid-content">
                                <div class="area-grid-name">ELECTRÓNICA</div>
                                <div class="area-grid-desc">Sistemas</div>
                            </div>
                        </div>
                    </div>
                `,
                action: 'siguiente',
                onLoad: () => {
                    setTimeout(() => {
                        cargarEstrategasTutorial();
                    }, 100);
                }
            },
            
            // PASO 4: Contratación de estrategas en GRID
            {
                title: "👥 CONTRATA ESTRATEGAS",
                content: `
                    <p>Selecciona y contrata estrategas para potenciar tus pronósticos:</p>
                    
                    <div id="grid-estrategas-tutorial" class="grid-3-columns">
                        <div class="loading">Cargando estrategas...</div>
                    </div>
                `,
                action: 'siguiente'
            },
            
            // PASO 5: DÍA 1 - Contratación (Tutorial práctico)
            {
                title: "🎮 SIMULACIÓN SEMANAL",
                content: `
                    <div class="simulacion-dia">
                        <div class="dia-titulo-simulacion">CONTRATA TU PRIMER ESTRATEGA</div>
                        <p class="dia-descripcion">Selecciona tu primer estratega. Cada uno te da bonificaciones diferentes:</p>
                    </div>
                    
                    <div class="grid-3-columns">
                        <div class="estratega-tutorial-card seleccionable" onclick="seleccionarEstrategaTutorial(1)" data-estratega-id="1">
                            <div class="estratega-icon-tut">⏱️</div>
                            <div class="estratega-nombre-tut">ANALISTA DE TIEMPOS</div>
                            <div class="estratega-especialidad">Diferencias entre pilotos</div>
                            <div class="estratega-bono">Bono: <span class="bono-valor">+15% puntos</span></div>
                        </div>
                        
                        <div class="estratega-tutorial-card seleccionable" onclick="seleccionarEstrategaTutorial(2)" data-estratega-id="2">
                            <div class="estratega-icon-tut">🌧️</div>
                            <div class="estratega-nombre-tut">METEORÓLOGO</div>
                            <div class="estratega-especialidad">Condiciones climáticas</div>
                            <div class="estratega-bono">Bono: <span class="bono-valor">+20% puntos</span></div>
                        </div>
                        
                        <div class="estratega-tutorial-card seleccionable" onclick="seleccionarEstrategaTutorial(3)" data-estratega-id="3">
                            <div class="estratega-icon-tut">🔧</div>
                            <div class="estratega-nombre-tut">EXPERTO FIABILIDAD</div>
                            <div class="estratega-especialidad">Abandonos y fallos</div>
                            <div class="estratega-bono">Bono: <span class="bono-valor">+18% puntos</span></div>
                        </div>
                    </div>
                `,
                action: 'siguiente',
                onLoad: () => {
                    const nextBtn = document.getElementById('btn-tutorial-next-large');
                    if (nextBtn) nextBtn.style.display = 'none';
                    
                    window.seleccionarEstrategaTutorial = (id) => {
                        document.querySelectorAll('.estratega-tutorial-card').forEach(card => {
                            card.classList.remove('seleccionado');
                        });
                        document.querySelector(`[data-estratega-id="${id}"]`).classList.add('seleccionado');
                        
                        window.tutorialEstrategaSeleccionado = id;
                        
                        const nextBtn = document.getElementById('btn-tutorial-next-large');
                        if (nextBtn) nextBtn.style.display = 'flex';
                    };
                    
                   
                    if (nextBtn) {
                        nextBtn.onclick = async () => {
                            if (!window.tutorialEstrategaSeleccionado) return;
                            
                            try {
                                const nombres = { 1: "ANALISTA DE TIEMPOS", 2: "METEORÓLOGO", 3: "EXPERTO FIABILIDAD" };
                                const especialidades = { 1: "Tiempos", 2: "Meteorología", 3: "Fiabilidad" };
                                const bonificaciones = { 1: { tipo: 'puntos_extra', valor: 15 }, 2: { tipo: 'puntos_extra', valor: 20 }, 3: { tipo: 'puntos_extra', valor: 18 } };
                                
                                const { error } = await supabase.from('ingenieros_contratados').insert([{
                                    escuderia_id: window.tutorialManager.f1Manager.escuderia.id,
                                    ingeniero_id: window.tutorialEstrategaSeleccionado,
                                    nombre: nombres[window.tutorialEstrategaSeleccionado],
                                    salario: 250000,
                                    especialidad: especialidades[window.tutorialEstrategaSeleccionado],
                                    bonificacion_tipo: bonificaciones[window.tutorialEstrategaSeleccionado].tipo,
                                    bonificacion_valor: bonificaciones[window.tutorialEstrategaSeleccionado].valor,
                                    activo: true,
                                    contratado_en: new Date().toISOString()
                                }]);
                                
                                if (error) throw error;
                                
                                if (window.tutorialData) {
                                    window.tutorialData.estrategaContratado = true;
                                    window.tutorialData.nombreEstratega = nombres[window.tutorialEstrategaSeleccionado];
                                    window.tutorialData.bonoEstratega = window.tutorialEstrategaSeleccionado === 1 ? 15 : window.tutorialEstrategaSeleccionado === 2 ? 20 : 18;
                                }
                                
                                window.tutorialManager.f1Manager.escuderia.dinero -= 250000;
                                await window.tutorialManager.f1Manager.updateEscuderiaMoney();
                                
                                if (window.tutorialManager && window.tutorialManager.step < 11) {
                                    window.tutorialManager.step++;
                                    window.tutorialManager.mostrarPaso();
                                }
                                
                            } catch (error) {
                                console.error('Error contratando estratega:', error);
                                alert('Error contratando estratega: ' + error.message);
                            }
                        };
                    }
                }
            },
            
            // PASO 6: DÍA 2 - Fabricación
            {
                title: "🔧 FABRICAR PIEZA",
                content: `
                    <div class="simulacion-dia">
                        <div class="dia-titulo-simulacion">FABRICA TU PRIMERA PIEZA</div>
                        <p class="dia-descripcion">Elige un área para fabricar tu primera pieza:</p>
                    </div>
                    
                    <div class="grid-3-columns">
                        <div class="fabricacion-tutorial-card seleccionable" onclick="seleccionarFabricacionTutorial('motor')" data-area="motor">
                            <div class="fab-icon-tut">🏎️</div>
                            <div class="fab-nombre-tut">MOTOR</div>
                            <div class="fab-desc-tut">Aumenta potencia</div>
                            <div class="fab-puntos-tut">⭐ +15 puntos</div>
                        </div>
                        
                        <div class="fabricacion-tutorial-card seleccionable" onclick="seleccionarFabricacionTutorial('chasis')" data-area="chasis">
                            <div class="fab-icon-tut">📊</div>
                            <div class="fab-nombre-tut">CHASIS</div>
                            <div class="fab-desc-tut">Mejora estructura</div>
                            <div class="fab-puntos-tut">⭐ +12 puntos</div>
                        </div>
                        
                        <div class="fabricacion-tutorial-card seleccionable" onclick="seleccionarFabricacionTutorial('aerodinamica')" data-area="aerodinamica">
                            <div class="fab-icon-tut">🌀</div>
                            <div class="fab-nombre-tut">AERO</div>
                            <div class="fab-desc-tut">Optimiza flujo aire</div>
                            <div class="fab-puntos-tut">⭐ +10 puntos</div>
                        </div>
                    </div>
                `,
                action: 'siguiente',
                onLoad: () => {
                    const nextBtn = document.getElementById('btn-tutorial-next-large');
                    if (nextBtn) nextBtn.style.display = 'none';
                    
                    window.seleccionarFabricacionTutorial = (area) => {
                        document.querySelectorAll('.fabricacion-tutorial-card').forEach(card => {
                            card.classList.remove('seleccionado');
                        });
                        document.querySelector(`[data-area="${area}"]`).classList.add('seleccionado');
                        window.tutorialFabricacionSeleccionada = area;
                        
                        const nextBtn = document.getElementById('btn-tutorial-next-large');
                        if (nextBtn) nextBtn.style.display = 'flex';
                    };
                    

                    if (nextBtn) {
                        nextBtn.onclick = async () => {
                            if (!window.tutorialFabricacionSeleccionada) return;
                            
                            try {
                                const nombres = { 'motor': 'Motor', 'chasis': 'Chasis', 'aerodinamica': 'Aerodinámica' };
                                const areaSeleccionada = window.tutorialFabricacionSeleccionada;
                                const nombreArea = nombres[areaSeleccionada] || areaSeleccionada;
                                const nivelAFabricar = 1;
                                
                                const { data: fabricacionesActivas, error: errorLimite } = await supabase
                                    .from('fabricacion_actual')
                                    .select('id')
                                    .eq('escuderia_id', window.tutorialManager.f1Manager.escuderia.id)
                                    .eq('completada', false);
                                
                                if (errorLimite) throw errorLimite;
                                if (fabricacionesActivas && fabricacionesActivas.length >= 4) {
                                    alert('❌ Límite alcanzado (máximo 4 fabricaciones simultáneas)');
                                    return;
                                }
                                
                                const tiempoMinutos = 2;
                                const tiempoMilisegundos = tiempoMinutos * 60 * 1000;
                                const costo = 10000;
                                
                                if (window.tutorialManager.f1Manager.escuderia.dinero < costo) {
                                    alert(`❌ Fondos insuficientes. Necesitas €${costo.toLocaleString()}`);
                                    return;
                                }
                                
                                const ahora = new Date();
                                const tiempoFin = new Date(ahora.getTime() + tiempoMilisegundos);
                                
                                const { data: fabricacion, error: errorCrear } = await supabase
                                    .from('fabricacion_actual')
                                    .insert([{
                                        escuderia_id: window.tutorialManager.f1Manager.escuderia.id,
                                        area: areaSeleccionada,
                                        nivel: nivelAFabricar,
                                        tiempo_inicio: ahora.toISOString(),
                                        tiempo_fin: tiempoFin.toISOString(),
                                        completada: false,
                                        costo: costo,
                                        creada_en: ahora.toISOString()
                                    }])
                                    .select()
                                    .single();
                                
                                if (errorCrear) throw errorCrear;
                                
                                window.tutorialManager.f1Manager.escuderia.dinero -= costo;
                                await window.tutorialManager.f1Manager.updateEscuderiaMoney();
                                
                                if (window.tutorialData) {
                                    window.tutorialData.piezaFabricando = true;
                                    window.tutorialData.nombrePieza = nombreArea;
                                    window.tutorialData.puntosPieza = areaSeleccionada === 'motor' ? 15 : areaSeleccionada === 'chasis' ? 12 : 10;
                                }
                                
                                if (window.tutorialManager && window.tutorialManager.step < 11) {
                                    window.tutorialManager.step++;
                                    window.tutorialManager.mostrarPaso();
                                }
                                
                            } catch (error) {
                                console.error('Error fabricando pieza:', error);
                                alert('Error fabricando pieza: ' + error.message);
                            }
                        };
                    }
                }
            },
            
            // PASO 7: DÍA 3-4 - Pronósticos
            {
                title: "🎯 HACER PRONÓSTICOS",
                content: `
                    <div class="simulacion-intro">       
                        <p class="simulacion-nota">Vamos a simular una carrera! En el juego real, tendrás más opciones de pronóstico por carrera.</p>
                    </div>
                    <div class="simulacion-dia">
                        <div class="dia-titulo-simulacion">PRONÓSTICOS DE CARRERA</div>
                        <p class="dia-descripcion">Selecciona tus predicciones (marca una opción en cada categoría):</p>
                    </div>
                    
                    <div class="grid-3-columns">
                        <div class="pronostico-tutorial-card">
                            <div class="pronostico-icon-tut">🚩</div>
                            <div class="pronostico-nombre-tut">BANDERA AMARILLA</div>
                            <div class="pronostico-pregunta">¿Habrá neutralización?</div>
                            <div class="pronostico-opciones">
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="bandera" data-valor="si" onclick="seleccionarPronosticoTutorial('bandera', 'si', this)">SÍ</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="bandera" data-valor="no" onclick="seleccionarPronosticoTutorial('bandera', 'no', this)">NO</div>
                            </div>
                        </div>
                        
                        <div class="pronostico-tutorial-card">
                            <div class="pronostico-icon-tut">🚗</div>
                            <div class="pronostico-nombre-tut">ABANDONOS</div>
                            <div class="pronostico-pregunta">¿Cuántos no terminarán?</div>
                            <div class="pronostico-opciones">
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="abandonos" data-valor="0-2" onclick="seleccionarPronosticoTutorial('abandonos', '0-2', this)">0-2</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="abandonos" data-valor="3-5" onclick="seleccionarPronosticoTutorial('abandonos', '3-5', this)">3-5</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="abandonos" data-valor="mas5" onclick="seleccionarPronosticoTutorial('abandonos', 'mas5', this)">>5</div>
                            </div>
                        </div>
                        
                        <div class="pronostico-tutorial-card">
                            <div class="pronostico-icon-tut">⏱️</div>
                            <div class="pronostico-nombre-tut">DIFERENCIA 1º-2º</div>
                            <div class="pronostico-pregunta">Tiempo entre 1º y 2º</div>
                            <div class="pronostico-opciones">
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="diferencia" data-valor="<1s" onclick="seleccionarPronosticoTutorial('diferencia', '<1s', this)"><1s</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="diferencia" data-valor="1-5s" onclick="seleccionarPronosticoTutorial('diferencia', '1-5s', this)">1-5s</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="diferencia" data-valor=">5s" onclick="seleccionarPronosticoTutorial('diferencia', '>5s', this)">>5s</div>
                            </div>
                        </div>
                    </div>
                `,
                action: 'siguiente',
                onLoad: () => {
                    const nextBtn = document.getElementById('btn-tutorial-next-large');
                    if (nextBtn) nextBtn.style.display = 'none';
                    
                    window.tutorialPronosticos = {};
                    
                    window.seleccionarPronosticoTutorial = (tipo, valor, elemento) => {
                        window.tutorialPronosticos[tipo] = valor;
                        
                        document.querySelectorAll(`[data-tipo="${tipo}"]`).forEach(el => {
                            el.classList.remove('seleccionado');
                        });
                        elemento.classList.add('seleccionado');
                        
                        const tiposRequeridos = ['bandera', 'abandonos', 'diferencia'];
                        const todosSeleccionados = tiposRequeridos.every(tipo => window.tutorialPronosticos[tipo]);
                        
                        if (todosSeleccionados && nextBtn) {
                            nextBtn.style.display = 'flex';
                        }
                    };
                    
                    if (nextBtn) {
                        nextBtn.onclick = async () => {
                            const tiposRequeridos = ['bandera', 'abandonos', 'diferencia'];
                            const todosSeleccionados = tiposRequeridos.every(tipo => window.tutorialPronosticos[tipo]);
                            
                            if (!todosSeleccionados) {
                                alert('Debes completar los 3 pronósticos antes de continuar');
                                return;
                            }
                            
                            const aciertosSimulados = 2;
                            
                            if (window.tutorialData) {
                                window.tutorialData.aciertosPronosticos = aciertosSimulados;
                                window.tutorialData.puntosBaseCalculados = aciertosSimulados * 10;
                                window.tutorialData.pronosticosSeleccionados = {
                                    bandera: window.tutorialPronosticos.bandera,
                                    abandonos: window.tutorialPronosticos.abandonos,
                                    diferencia: window.tutorialPronosticos.diferencia
                                };
                            }
                            
                            if (window.tutorialManager && window.tutorialManager.step < 11) {
                                window.tutorialManager.step++;
                                window.tutorialManager.mostrarPaso();
                            }
                        };
                    }
                }
            },
            
            // PASO 8: FIN DE SEMANA - Simulación carrera
            {
                title: "📅 SIMULACIÓN DE CARRERA",
                content: `
                    <button class="btn-simular-carrera" onclick="tutorialSimularCarrera()" id="btn-simular-carrera-tutorial">
                        <i class="fas fa-play-circle"></i> SIMULAR CARRERA
                    </button>
                    
                    <div id="resultado-simulacion" style="display: none; margin-top: 15px;"></div>
                `,
                action: 'siguiente',
                onLoad: () => {
                    const nextBtn = document.getElementById('btn-tutorial-next-large');
                    if (nextBtn) nextBtn.style.display = 'none';
                    
                    let simulacionEjecutada = false;
                    
                    window.tutorialSimularCarrera = async () => {
                        if (simulacionEjecutada) return;
                        simulacionEjecutada = true;
                        
                        const btnSimular = document.getElementById('btn-simular-carrera-tutorial');
                        if (btnSimular) {
                            btnSimular.disabled = true;
                            btnSimular.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SIMULANDO...';
                        }
                        
                        const datosRealesCarrera = { bandera: 'si', abandonos: '3-5', diferencia: '1-5s' };
                        const pronosticosUsuario = window.tutorialPronosticos || {};
                        
                        if (!pronosticosUsuario.bandera || !pronosticosUsuario.abandonos || !pronosticosUsuario.diferencia) {
                            alert('❌ Error: No se encontraron todos tus pronósticos.');
                            simulacionEjecutada = false;
                            if (btnSimular) {
                                btnSimular.disabled = false;
                                btnSimular.innerHTML = '<i class="fas fa-play-circle"></i> SIMULAR CARRERA';
                            }
                            return;
                        }
                        
                        let aciertosTotales = 0;
                        let puntosTotales = 0;
                        let detalleResultados = [];
                        const PUNTOS_POR_ACIERTO = 10;
                        
                        const aciertoBandera = pronosticosUsuario.bandera === datosRealesCarrera.bandera;
                        const puntosBandera = aciertoBandera ? PUNTOS_POR_ACIERTO : 0;
                        if (aciertoBandera) aciertosTotales++;
                        puntosTotales += puntosBandera;
                        
                        detalleResultados.push({ tipo: 'bandera', pronostico: pronosticosUsuario.bandera, real: datosRealesCarrera.bandera, acierto: aciertoBandera, puntos: puntosBandera });
                        
                        const aciertoAbandonos = pronosticosUsuario.abandonos === datosRealesCarrera.abandonos;
                        const puntosAbandonos = aciertoAbandonos ? PUNTOS_POR_ACIERTO : 0;
                        if (aciertoAbandonos) aciertosTotales++;
                        puntosTotales += puntosAbandonos;
                        
                        detalleResultados.push({ tipo: 'abandonos', pronostico: pronosticosUsuario.abandonos, real: datosRealesCarrera.abandonos, acierto: aciertoAbandonos, puntos: puntosAbandonos });
                        
                        const aciertoDiferencia = pronosticosUsuario.diferencia === datosRealesCarrera.diferencia;
                        const puntosDiferencia = aciertoDiferencia ? PUNTOS_POR_ACIERTO : 0;
                        if (aciertoDiferencia) aciertosTotales++;
                        puntosTotales += puntosDiferencia;
                        
                        detalleResultados.push({ tipo: 'diferencia', pronostico: pronosticosUsuario.diferencia, real: datosRealesCarrera.diferencia, acierto: aciertoDiferencia, puntos: puntosDiferencia });
                        
                        if (window.tutorialData) {
                            window.tutorialData.aciertosPronosticos = aciertosTotales;
                            window.tutorialData.puntosBaseCalculados = puntosTotales;
                            window.tutorialData.detalleResultados = detalleResultados;
                            window.tutorialData.datosRealesCarrera = datosRealesCarrera;
                        }
                        
                        const resultadoDiv = document.getElementById('resultado-simulacion');
                        if (resultadoDiv) {
                            resultadoDiv.style.display = 'block';
                            
                            let htmlResultados = `<div style="background: rgba(0, 210, 190, 0.08); border: 1px solid rgba(0, 210, 190, 0.3); border-radius: 8px; padding: 10px;">`;
                            
                            const nombresCortos = { 'bandera': 'Bandera', 'abandonos': 'Abandonos', 'diferencia': 'Diferencia' };
                            
                            detalleResultados.forEach(resultado => {
                                const icono = resultado.acierto ? '✅' : '❌';
                                const color = resultado.acierto ? '#4CAF50' : '#f44336';
                                
                                htmlResultados += `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; margin-bottom: 3px; background: rgba(255, 255, 255, 0.02); border-radius: 4px; font-size: 0.75rem;">
                                        <div>
                                            <span style="color: #aaa;">${nombresCortos[resultado.tipo]}:</span>
                                            <span style="color: #fff; margin: 0 5px; font-weight: bold;">${resultado.pronostico}</span>
                                            <span style="color: #888;">→</span>
                                            <span style="color: #00d2be; margin-left: 5px; font-weight: bold;">${resultado.real}</span>
                                        </div>
                                        <div>
                                            <span style="color: ${color}; margin-right: 6px;">${icono}</span>
                                            <span style="color: #FFD700; font-weight: bold;">+${resultado.puntos}</span>
                                        </div>
                                    </div>
                                `;
                            });
                            
                            htmlResultados += `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; margin-top: 6px; background: rgba(255, 215, 0, 0.05); border-radius: 5px; border-top: 1px solid rgba(255, 215, 0, 0.2);">
                                        <div style="color: #fff; font-size: 0.8rem;">
                                            <strong>${aciertosTotales}/3</strong> aciertos
                                        </div>
                                        <div style="color: #FFD700; font-size: 1rem; font-weight: bold;">
                                            ${puntosTotales} pts
                                        </div>
                                    </div>
                                </div>
                            `;
                            
                            resultadoDiv.innerHTML = htmlResultados;
                        }
                        
                        if (nextBtn) nextBtn.style.display = 'flex';
                        
                        if (btnSimular) {
                            setTimeout(() => {
                                btnSimular.innerHTML = '<i class="fas fa-check-circle"></i> SIMULACIÓN COMPLETADA';
                                btnSimular.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                            }, 500);
                        }
                    };
                    
                    if (nextBtn) {
                        nextBtn.onclick = () => {
                            if (window.tutorialManager && window.tutorialManager.step < 11) {
                                window.tutorialManager.step++;
                                window.tutorialManager.mostrarPaso();
                            }
                        };
                    }
                }
            },
            
            // PASO 9: LUNES - Resultados
            {
                title: "📅 RESULTADOS SEMANALES",
                content: `
                    <div class="resultados-grid-compact">
                        <div class="resultado-card-compact ${(window.tutorialData?.aciertosPronosticos || 0) > 0 ? 'ganancia' : 'error'}">
                            <div class="resultado-icon-compact">${(window.tutorialData?.aciertosPronosticos || 0) > 0 ? '✅' : '❌'}</div>
                            <div class="resultado-content-compact">
                                <div class="resultado-titulo-compact">PRONÓSTICOS</div>
                                <div class="resultado-detalle-compact">
                                    ${(() => {
                                        const aciertos = window.tutorialData?.aciertosPronosticos || 0;
                                        const total = 3;
                                        return aciertos > 0 ? `${aciertos}/${total} aciertos` : 'Sin aciertos';
                                    })()}
                                </div>
                                <div class="resultado-puntos-compact">+${window.tutorialData?.puntosBaseCalculados || 0}</div>
                            </div>
                        </div>
                        
                        ${window.tutorialData?.estrategaContratado ? `
                        <div class="resultado-card-compact bono">
                            <div class="resultado-icon-compact">👥</div>
                            <div class="resultado-content-compact">
                                <div class="resultado-titulo-compact">BONO</div>
                                <div class="resultado-detalle-compact">${window.tutorialData.nombreEstratega || ''}</div>
                                <div class="resultado-puntos-compact">+${(() => {
                                    const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                                    const bono = window.tutorialData?.bonoEstratega || 15;
                                    return Math.round(puntosBase * (bono / 100));
                                })()}</div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${window.tutorialData?.piezaFabricando ? `
                        <div class="resultado-card-compact pieza">
                            <div class="resultado-icon-compact">🔧</div>
                            <div class="resultado-content-compact">
                                <div class="resultado-titulo-compact">PIEZA</div>
                                <div class="resultado-detalle-compact">${window.tutorialData.nombrePieza || ''}</div>
                                <div class="resultado-puntos-compact">+${window.tutorialData?.puntosPieza || 15}</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="total-ganancias-compact">
                        <div class="total-puntos-compact">${(() => {
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            const total = puntosBase + puntosBono + puntosPieza;
                            return total;
                        })()} PUNTOS</div>
                        <div class="total-dinero-compact">= ${(() => {
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            const totalPuntos = puntosBase + puntosBono + puntosPieza;
                            const dinero = totalPuntos * 100;
                            return dinero.toLocaleString() + '€';
                        })()}</div>
                    </div>
                    
                    <div class="presupuesto-final-compact">
                        <div>Nuevo presupuesto:</div>
                        <div class="presupuesto-valor-compact">${(() => {
                            const inicial = 5000000;
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            let gastos = 0;
                            if (window.tutorialData?.estrategaContratado) gastos += 150000;
                            if (window.tutorialData?.piezaFabricando) gastos += 50000;
                            
                            const final = inicial + ((puntosBase + puntosBono + puntosPieza) * 100) - gastos;
                            return final.toLocaleString() + '€';
                        })()}</div>
                    </div>
                `,
                action: 'siguiente',
                onLoad: () => {
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .resultados-grid-compact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 10px 0; }
                        .resultado-card-compact { background: rgba(255, 255, 255, 0.04); border-radius: 6px; padding: 6px; display: flex; align-items: center; min-height: 60px; }
                        .resultado-card-compact.ganancia { border-top: 3px solid #4CAF50; }
                        .resultado-card-compact.bono { border-top: 3px solid #00d2be; }
                        .resultado-card-compact.pieza { border-top: 3px solid #ff9800; }
                        .resultado-icon-compact { font-size: 1.2rem; margin-right: 8px; flex-shrink: 0; }
                        .resultado-content-compact { flex: 1; }
                        .resultado-titulo-compact { font-size: 0.7rem; font-weight: bold; color: white; margin-bottom: 2px; }
                        .resultado-detalle-compact { color: #aaa; font-size: 0.65rem; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                        .resultado-puntos-compact { font-size: 0.8rem; font-weight: bold; color: #ffd700; }
                        .total-ganancias-compact { background: rgba(255, 215, 0, 0.08); border-radius: 8px; padding: 8px; text-align: center; margin: 10px 0; border: 1px solid rgba(255, 215, 0, 0.2); }
                        .total-puntos-compact { font-size: 1.2rem; font-weight: bold; color: #ffd700; margin-bottom: 3px; }
                        .total-dinero-compact { font-size: 0.9rem; color: #4CAF50; }
                        .presupuesto-final-compact { background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #aaa; }
                        .presupuesto-valor-compact { color: white; font-weight: bold; font-size: 0.9rem; }
                        @media (max-width: 600px) {
                            .resultados-grid-compact { grid-template-columns: 1fr; gap: 4px; }
                            .resultado-card-compact { min-height: 50px; padding: 4px; }
                            .resultado-icon-compact { font-size: 1rem; margin-right: 6px; }
                            .resultado-titulo-compact { font-size: 0.65rem; }
                            .resultado-detalle-compact { font-size: 0.6rem; }
                            .resultado-puntos-compact { font-size: 0.75rem; }
                        }
                    `;
                    
                    if (!document.getElementById('estilos-paso9-compact')) {
                        style.id = 'estilos-paso9-compact';
                        document.head.appendChild(style);
                    }
                }
            },
            
            // PASO 10: Tutorial completado
            {
                title: "🏁 ¡TUTORIAL COMPLETADO!",
                content: `
                    <div class="primeros-pasos-reales">
                        <h4>🚀 AHORA COMENZARÁS A COMPETIR DE VERDAD:</h4>
                        <div class="pasos-reales-grid">
                            <div class="paso-real">1. Ve a <strong>EQUIPO</strong> para contratar más estrategas</div>
                            <div class="paso-real">2. Visita <strong>TALLER</strong> para fabricar piezas reales</div>
                            <div class="paso-real">3. Revisa <strong>PRONÓSTICOS</strong> para la próxima carrera real</div>
                            <div class="paso-real">4. Consulta <strong>RANKING</strong> y compite globalmente</div>
                        </div>
                    </div>
                    
                    <div class="despedida-final">
                        <p class="equipo-nombre-final">¡Buena suerte al mando de <strong>${this.f1Manager.escuderia?.nombre || "tu escudería"}!</strong></p>
                    </div>
                `,
                action: 'finalizar'
            }
        ];
        
        const paso = pasos[this.step - 1];
        if (!paso) return;
        
        window.tutorialManager = this;
        
        document.body.innerHTML = `
            <div class="tutorial-screen">
                <div class="tutorial-container">
                    <div class="tutorial-progress-horizontal">
                        ${pasos.map((s, i) => `
                            <div class="progress-step-horizontal ${i + 1 === this.step ? 'active' : ''} ${i + 1 < this.step ? 'completed' : ''}">
                                <div class="step-number-horizontal">${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="tutorial-header">
                        <h1>${paso.title}</h1>
                    </div>
                    
                    <div class="tutorial-content-wrapper">
                        <div class="tutorial-content-grid">
                            ${paso.content}
                        </div>
                    </div>
                    
                    <div class="tutorial-actions-bottom">
                        ${this.step > 1 && this.step !== 8 ? `
                            <button class="btn-tutorial-prev" id="btn-tutorial-prev">
                                <i class="fas fa-arrow-left"></i> ANTERIOR
                            </button>
                        ` : '<div class="spacer"></div>'}
                        
                        ${paso.action ? `
                            <button class="btn-tutorial-next-large" id="btn-tutorial-next-large">
                                ${paso.action === 'finalizar' ? '¡EMPEZAR A COMPETIR!' : 'SIGUIENTE'}
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        if (paso.onLoad && typeof paso.onLoad === 'function') {
            setTimeout(() => paso.onLoad(), 100);
        }
        
        setTimeout(() => {
            const nextBtn = document.getElementById('btn-tutorial-next-large');
            const prevBtn = document.getElementById('btn-tutorial-prev');
            
            if (nextBtn) {
                nextBtn.onclick = async () => {
                    if ([5, 6, 7].includes(window.tutorialManager.step)) return;
                    
                    if (paso.action === 'finalizar') {
                        await this.finalizar();
                    } else if (paso.action === 'siguiente') {
                        if (this.step < 11) {
                            this.step++;
                            this.mostrarPaso();
                        }
                    }
                };
            }
            
            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (this.step > 1) {
                        this.step--;
                        this.mostrarPaso();
                    }
                };
            }
        }, 50);
    }

    // ========================
    // FINALIZAR TUTORIAL
    // ========================
    async finalizar() {
        console.log('✅ Finalizando tutorial...');
        
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
                        F1
                    </div>
                    <div style="color: #ffffff; font-size: 1.2rem; letter-spacing: 3px; font-weight: 300;">
                        STRATEGY MANAGER
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
                
                <div style="margin-top: 30px; color: #e10600; font-size: 1.5rem; animation: spin 1.5s linear infinite;">
                    🏎️
                </div>
            </div>
        `;

        try {
            const progressBar = document.getElementById('f1-progress-bar');
            const progressText = document.getElementById('f1-progress-text');
            const loadingMessage = document.getElementById('f1-loading-message');
            
            const updateProgress = (percentage, message) => {
                if (progressBar) progressBar.style.width = `${percentage}%`;
                if (progressText) progressText.textContent = `${percentage}%`;
                if (loadingMessage && message) loadingMessage.textContent = message;
            };
            
            updateProgress(10, "Guardando progreso del tutorial...");
            
            localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
            localStorage.setItem('f1_tutorial_completado', 'true');
            updateProgress(25, "Progreso guardado localmente...");
            
            if (this.f1Manager.escuderia && this.f1Manager.supabase) {
                updateProgress(40, "Actualizando base de datos...");
                
                const { error } = await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ tutorial_completado: true })
                    .eq('id', this.f1Manager.escuderia.id);
                
                if (error) {
                    console.error('❌ Error actualizando tutorial en BD:', error);
                    updateProgress(60, "⚠️ Error en base de datos, continuando...");
                    this.f1Manager.showNotification('⚠️ Error guardando progreso, pero continuando...', 'warning');
                } else {
                    updateProgress(60, "Base de datos actualizada correctamente...");
                }
            }
            
            updateProgress(75, "Recargando datos de la escudería...");
            if (this.f1Manager.escuderia && this.f1Manager.supabase) {
                const { data: escuderiaActualizada, error } = await this.f1Manager.supabase
                    .from('escuderias')
                    .select('*')
                    .eq('id', this.f1Manager.escuderia.id)
                    .single();
                
                if (!error && escuderiaActualizada) {
                    this.f1Manager.escuderia = escuderiaActualizada;
                }
            }
            
            updateProgress(90, "Preparando dashboard principal...");
            updateProgress(100, "¡Escudería lista! Redirigiendo...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            document.body.innerHTML = '';
            
            if (this.f1Manager.cargarDashboardCompleto) {
                await this.f1Manager.cargarDashboardCompleto();
            }
            
            if (this.f1Manager.inicializarSistemasIntegrados) {
                await this.f1Manager.inicializarSistemasIntegrados();
            }
            
            setTimeout(() => {
                if (this.f1Manager.showNotification) {
                    this.f1Manager.showNotification('🎉 ¡Tutorial completado! ¡Bienvenido a F1 Manager!', 'success');
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error fatal en finalizarTutorial:', error);
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #15151e;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    font-family: 'Roboto', sans-serif;
                ">
                    <div style="color: #e10600; font-size: 4rem; margin-bottom: 20px;">❌</div>
                    <h2 style="color: #e10600; margin-bottom: 15px;">Error al cargar</h2>
                    <p style="color: #ccc; margin-bottom: 20px;">Hubo un problema al cargar tu escudería.</p>
                    <button onclick="location.reload()" style="
                        padding: 12px 30px;
                        background: #e10600;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-family: 'Orbitron', sans-serif;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// ========================
// FUNCIONES GLOBALES DEL TUTORIAL
// ========================
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
    
    container.innerHTML = estrategas.map(e => `
        <div class="estratega-tutorial-card seleccionable">
            <div class="estratega-icon-tut">${e.icono}</div>
            <div class="estratega-nombre-tut">${e.nombre}</div>
            <div class="estratega-especialidad">${e.especialidad}</div>
            <div class="estratega-bono">Bono: <span class="bono-valor">${e.bono}</span></div>
            <div class="estratega-ejemplo">Ej: "${e.ejemplo}"</div>
        </div>
    `).join('');
};

window.tutorialIrSeccion = function(seccion) {
    alert(`Esta función te llevaría a la sección: ${seccion.toUpperCase()}\n\nEn el juego real, puedes navegar entre secciones usando el menú superior.`);
};

console.log('✅ Tutorial.js cargado correctamente');
