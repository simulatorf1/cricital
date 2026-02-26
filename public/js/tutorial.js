// ========================
// F1 MANAGER - TUTORIAL.JS
// ========================
console.log('📚 Tutorial cargado');

class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.pasoActual = 0;
        this.totalPasos = 14; // AHORA SON 14 PASOS
        this.ventanaTutorial = null;
        this.elementosObjetivo = {}; // Para guardar elementos a los que obligar al usuario
    }

    // ========================
    // INICIAR TUTORIAL
    // ========================
    // ========================
    // INICIAR TUTORIAL (CORREGIDO)
    // ========================
    async iniciar() {
        // Verificar localStorage primero (rápido)
        const tutorialCompletado = localStorage.getItem('f1_tutorial_completado');
        
        if (tutorialCompletado === 'true') {
            console.log('✅ Tutorial ya completado (según localStorage), verificando BD...');
            
            // Doble verificación con BD para estar seguros
            if (this.f1Manager.escuderia?.id && this.f1Manager.supabase) {
                try {
                    const { data, error } = await this.f1Manager.supabase
                        .from('escuderias')
                        .select('tutorial_completado')
                        .eq('id', this.f1Manager.escuderia.id)
                        .single();
                    
                    if (!error && data?.tutorial_completado === true) {
                        console.log('✅ Confirmado: tutorial completado en BD');
                        return;
                    } else {
                        // El localStorage mentía, la BD dice que no está completado
                        console.log('⚠️ LocalStorage decía true pero BD dice false, mostrando tutorial...');
                        localStorage.removeItem('f1_tutorial_completado');
                    }
                } catch (error) {
                    console.error('❌ Error verificando BD:', error);
                }
            } else {
                return; // No podemos verificar BD, asumimos que está completado
            }
        }
        
        // Si llegamos aquí, el tutorial no está completado
        console.log('🎓 Iniciando tutorial por primera vez...');
        setTimeout(() => {
            this.mostrarPaso(0);
        }, 1000);
    }

    // ========================
    // MOSTRAR PASO DEL TUTORIAL
    // ========================
    mostrarPaso(numeroPaso) {
        this.pasoActual = numeroPaso;
        
        if (!this.ventanaTutorial || !document.getElementById('tutorial-ventana-flotante')) {
            this.crearVentanaBase();
        }
        
        this.actualizarContenidoPaso(numeroPaso);
    }


    // ========================
    // CREAR VENTANA BASE
    // ========================
    crearVentanaBase() {
        // Crear OVERLAY (fondo oscuro)
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(4px);
            z-index: 999997;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(overlay);
        
        // Crear ventana tutorial


        
        this.ventanaTutorial = document.createElement('div');
        this.ventanaTutorial.id = 'tutorial-ventana-flotante';
        this.ventanaTutorial.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 700px;
            max-height: 85vh;
            background: #0f0f12;
            border: 1px solid #2a2a30;
            border-radius: 4px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            color: #e8e8e8;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            z-index: 999998;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-size: 13px;
            line-height: 1.5;
            letter-spacing: 0.2px;
        `;
        
        this.ventanaTutorial.innerHTML = `
            <div id="tutorial-header" style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                <div id="tutorial-title-container" style="flex: 1;">
                    <!-- Título y paso se actualizarán desde actualizarContenidoPaso() -->
                </div>
                <button id="btn-minimizar-tutorial" style="
                    background: transparent;
                    border: none;
                    color: #909096;
                    padding: 4px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 400;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: opacity 0.2s;
                    opacity: 0.7;
                    z-index: 999999;
                ">
                    <i class="fas fa-window-minimize" style="color: #909096; font-size: 11px;"></i>
                    Minimizar
                </button>
            </div>
            
            <div id="tutorial-content" style="flex: 1; overflow-y: auto; padding: 5px 10px 5px 5px; line-height: 1.6; font-size: 1rem;">
                <!-- Contenido del paso -->
            </div>
            

            
            <div id="tutorial-botones" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid rgba(0, 210, 190, 0.2); padding-top: 12px;">
                <button id="btn-anterior-paso" style="
                    background: transparent;
                    color: #909096;
                    border: 1px solid #2a2a30;
                    padding: 6px 14px;
                    border-radius: 3px;
                    font-weight: 400;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    letter-spacing: 0.5px;
                ">
                    <i class="fas fa-arrow-left" style="font-size: 11px; color: #909096;"></i>
                    Anterior
                </button>
                
                <div id="tutorial-siguiente-container">
                    <!-- Botón siguiente se insertará aquí -->
                </div>
            </div>
            

        `;
        
        document.body.appendChild(this.ventanaTutorial);
        
        // Configurar botón anterior
        this.ventanaTutorial.querySelector('#btn-anterior-paso').onclick = () => {
            if (this.pasoActual > 0) {
                this.mostrarPaso(this.pasoActual - 1);
            }
        };
        
        this.configurarMinimizar();
    }

    // ========================
    // ACTUALIZAR CONTENIDO DEL PASO (¡NUEVO CON 14 PASOS!)
    // ========================
    // ========================
    // ACTUALIZAR CONTENIDO DEL PASO (CORREGIDO CON ESTILOS)
    // ========================
    actualizarContenidoPaso(numeroPaso) {
        this.pasoActual = numeroPaso;
        
        const header = this.ventanaTutorial.querySelector('#tutorial-header');
        const content = this.ventanaTutorial.querySelector('#tutorial-content');
        
        // Array con todos los pasos
        const pasos = [
            // PASO 0
            {
                titulo: "¡BIENVENIDO A CRITICAL LAP!",
                contenido: `
                    <div style="background: #1a1a1f; padding: 20px; border-radius: 3px; margin-bottom: 20px; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #e8e8e8;">
                            Este juego utiliza los datos de los resultados reales de la máxima categoría del automovilismo.
                            <br><br>
                            <strong style="color: #c0c0c0;">Tu estrategia aquí se mide con el asfalto allá fuera.</strong>
                        </p>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 3px; margin-bottom: 20px; border: 1px solid #2a2a30;">
                        <h4 style="color: #c0c0c0; margin: 0 0 10px 0; font-size: 15px; font-weight: 500;">
                            🏁 Heredas la Escudería <span style="color: #ff3333; font-weight: bold;">${this.f1Manager.escuderia?.nombre || "XXX"}</span>
                        </h4>
                        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #909096;">
                            Un equipo histórico en horas bajas. Tu misión es devolverle la gloria usando los resultados de la competición mundial.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 15px; border-radius: 3px; margin: 20px 0; border: 1px solid #2a2a30;">
                        <div style="display: flex; align-items: flex-start;">
                            <div style="color: #c0c0c0; font-size: 16px; margin-right: 12px;">
                                <i class="fas fa-flag-checkered"></i>
                            </div>
                            <div>
                                <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 500; color: #c0c0c0;">
                                    ¿Aceptas el mando?
                                </p>
                                <p style="margin: 0; font-size: 13px; color: #909096;">
                                    Comienza tu camino hacia la gloria en el circuito más competitivo.
                                </p>
                            </div>
                        </div>
                    </div>
                `,
                botonTexto: "Aceptar el Mando",
                botonIcono: "fa-check-circle",
                colorBoton: "#c0c0c0"
            },
            
            // PASO 1
            {
                titulo: "EL OBJETIVO SEMANAL",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            📅 CADA FIN DE SEMANA DE GRAN PREMIO
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Deberás tener preparado el mejor coche posible, haber enviado tu pronóstico para la carrera y tener contratado a los mejores estrategas para potenciar tus resultados.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; margin-bottom: 8px; color: #e8e8e8;">
                        <strong>🎯 Controlarás:</strong>
                    </p>
                    <ul style="margin: 0 0 12px 20px; font-size: 13px; color: #909096;">
                        <li>Economía</li>
                        <li>Ingeniería</li>
                        <li>Fabricación</li>
                        <li>Estrategas</li>
                    </ul>
                    
                    <p style="font-size: 13px; margin-bottom: 12px; color: #e8e8e8;">
                        <strong>💰 Dispones de 50.000.000€ iniciales.</strong><br>
                        <span style="color: #909096;">Recuerda: cada euro invertido debe acercarte al podio.</span>
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-globe" style="color: #c0c0c0;"></i> 
                            Pelearás por quien consigue la vuelta más rápida de cada circuito, quien gana más dinero, quien acierta más resultados de carreras.
                        </p>
                    </div>
                `,
                botonTexto: "Continuar",
                botonIcono: "fa-arrow-right",
                colorBoton: "#c0c0c0",
                obligarClick: "taller",
                textoObligar: "Siguiente: Ve al Taller"
            },
            
            // PASO 2
            {
                titulo: "EL TALLER",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            🔧 ESTE ES EL CORAZÓN DE TU ESCUDERÍA
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Tienes <strong style="color: #e8e8e8;">11 áreas técnicas</strong> por mejorar. Para empezar, debemos fabricar nuestra primera pieza.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> MINIMIZA ESTA VENTANA y luego fabrica la pieza <strong>"Aerodinámica básico"</strong> del área SUELO (2 minutos, 100.000€), luego vuelve al tutorial.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; margin-bottom: 12px; color: #e8e8e8;">
                        <strong>📦 Cada pieza tiene su coste y tiempo de construcción.</strong><br>
                        <span style="color: #909096;">El tiempo de construcción no determina si será mejor o peor. No todas las carreras rinden igual con las mismas piezas, en cada carrera deberás equipar la que mejor se adapte a cada circuito.</span>
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-stopwatch" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">Importante:</strong> Solo podrás fabricar 4 piezas a la vez.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #ff3333; font-weight: bold;">
                        <strong style="color: #ff3333;">⏱️ Después de fabricar, vete a la pestaña principal y verás las piezas fabricándose en la sección "producción" con el tiempo que falta para acabar, cuando esté lista pulsa en ella y vuelve al tutorial.</strong>
                    </p>
                `,
                botonTexto: "He recogido la pieza",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "taller",
                textoObligar: "Debes ir al Taller para continuar"
            },
            
            // PASO 3 - ALMACÉN
            {
                titulo: "EL ALMACÉN",
                contenido: `
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> MINIMIZA ESTA VENTANA Y haz clic en la pieza que has fabricado. En el momento que la pinchas queda equipada en el coche.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            📦 AQUÍ GUARDAS TUS PIEZAS
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Desde el Almacén puedes equipar, desmontar o vender piezas.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; margin-bottom: 12px; color: #e8e8e8;">
                        Para ver todas las piezas equipadas del coche vete a la pestaña principal a la sección <strong>"piezas montadas"</strong>, allí verás qué tienes montado y qué no.
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-exclamation-triangle" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">¿Te has fijado en la barrita de color debajo de la pieza?</strong> Las piezas equipadas se desgastan en 24 horas y se destruyen. Para evitarlo debes entrar antes de que suceda y repararlas pinchando sobre la barrita. Ahora está al 100% pero pincha sobre ella para restaurarla igualmente.
                        </p>
                    </div>
                `,
                botonTexto: "He restaurado mi pieza",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "almacen",
                textoObligar: "Debes ir al Almacén para continuar"
            },
            
            // PASO 4 - INGENIERÍA
            {
                titulo: "INGENIERÍA",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            📊 AQUÍ SE COMPROBARÁN TUS TIEMPOS CON LOS DE OTROS JUGADORES
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Cambia tantas veces como quieras las piezas equipadas y prueba en ingeniería qué tiempo puedes lograr. Nuestros ingenieros te dirán cuál es el área a mejorar y te mostrarán todas las estadísticas.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Para poder hacer un tiempo por vuelta debes tener alguna pieza equipada. Haz clic en <strong>"Iniciar simulación"</strong>. Cuando finalice ya tendrás tu tiempo por vuelta que aparecerá en todas las estadísticas, en tu perfil y en tu pantalla principal.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; margin-bottom: 12px; color: #e8e8e8;">
                        <strong>🏁 Simulamos la mejor vuelta rápida que puede hacer tu coche:</strong>
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-exclamation-circle" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">IMPORTANTE:</strong> Para poder hacer un pronóstico de carrera debes tener hecho el test de vuelta obligatoriamente.
                        </p>
                    </div>
                `,
                botonTexto: "Ya he hecho mi vuelta de test",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "ingenieria",
                textoObligar: "Debes ir a Ingeniería para continuar"
            },
            
            // PASO 5 - MERCADO
            {
                titulo: "EL MERCADO",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            💰 ¿NECESITAS UNA PIEZA URGENTE PARA UNA COMBINACIÓN ESPECÍFICA?
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            En el Mercado compras y vendes componentes con otros Managers.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Mercado" para continuar.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 10px; border-radius: 3px; margin: 12px 0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-balance-scale" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">ESTRATEGIA:</strong> Desde el almacén, cuando tengas más de una pieza fabricada por área, puedes vender la que desees siempre que no la tengas equipada. Es una buena forma de hacer dinero, pero también vale para ahorrar tiempos de fabricación. Échale un ojo de vez en cuando.
                        </p>
                    </div>
                `,
                botonTexto: "He ido al Mercado",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "mercado",
                textoObligar: "Debes ir al Mercado para continuar"
            },
            
            // PASO 6 - ESTRATEGAS
            {
                titulo: "GESTIÓN DE ESTRATEGAS",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            👨‍💼 CONTRATA HASTA 4 ESTRATEGAS
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Ya tenemos las piezas equipadas y un tiempo por vuelta, para aumentar nuestras posibilidades en carrera necesitamos contratar estrategas.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Gestionar Estrategas" (pantalla principal). Contrata un estratega ahora. La duración del contrato será de 7 días desde que lo contratas, y el salario se paga al final del contrato. Puedes cancelar el contrato antes de tiempo con una penalización.
                        </p>
                    </div>
                    
                    <ul style="margin: 12px 0; padding-left: 20px; font-size: 13px; color: #909096;">
                        <li>Especialización por área</li>
                        <li>Sueldo diferente</li>
                        <li>Bonificación por acierto</li>
                    </ul>
                    
                    <p style="font-size: 13px; color: #909096;">
                        Según el pronóstico que hayas dado para la carrera real y los estrategas que tengas contratados, te darán más o menos dinero. Al final de la semana su sueldo se descontará de tu presupuesto.
                    </p>
                `,
                botonTexto: "He gestionado Estrategas",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "estrategas",
                textoObligar: "Debes gestionar Estrategas para continuar"
            },
            
            // PASO 7 - PRONÓSTICOS
            {
                titulo: "PRONÓSTICOS",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            🔮 ANTICÍPATE A LA REALIDAD
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Envía tus pronósticos sobre la carrera real hasta 48 horas antes del evento. Para poder enviar un pronóstico, debes tener una configuración de coche probada en pista, tu mejor vuelta rápida.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Pronósticos" para continuar. (No hace falta que envíes pronóstico ahora)
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; margin-bottom: 8px; color: #e8e8e8;">
                        <strong>📋 Elige una de las tres opciones de cada pregunta, cada una está asignada a un área que cubrirá tu estratega contratado.</strong>
                    </p>
                    
                    <p style="font-size: 13px; color: #909096;">
                        Cada fin de semana de carrera cambiaremos las preguntas adaptadas a cada circuito. ¡Tus aciertos se vuelven dinero al finalizar la semana! Tu escudería compite con las demás para saber cuál es la que más acierta los pronósticos.
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-calendar" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">CALENDARIO:</strong> Desde la pantalla principal se puede ver cuándo es la próxima carrera y el calendario completo. Cuando el contador llega a 00:00 ya no puedes enviar el pronóstico hasta que abramos para la siguiente carrera al día siguiente.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #ff3333; font-weight: bold;">
                        <strong>🏁 El lunes tras la carrera real, te notificaremos si tus pronósticos fueron certeros y cuanto corrió tu coche. Cuanto mejor sea tu vuelta rápida, mejor quedarás clasificado con tus oponentes reales y mayor será tu premio.</strong>
                    </p>
                `,
                botonTexto: "He ido a Pronóstico",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "pronostico",
                textoObligar: "Debes ir a Pronóstico para continuar"
            },
            
            // PASO 8 - PRESUPUESTO
            {
                titulo: "PRESUPUESTO",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            📊 TODO QUEDA ARCHIVADO EN EL PRESUPUESTO SEMANAL
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Gastos de producción, salarios, compras en el mercado... pero no todo son gastos, tus ingresos dependerán de las carreras reales, ventas del mercado y patrocinadores.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Presupuesto" para continuar.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #909096;">
                        <strong style="color: #e8e8e8;">📊 Ingresos por:</strong> Resultados, ventas, patrocinadores.
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-trophy" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">COMPETICIÓN:</strong> Tu escudería compite también con otras para saber cuál es la más rica. Los lunes al finalizar cada semana recibirás el desglose de tus gastos e ingresos semanales.
                        </p>
                    </div>
                `,
                botonTexto: "He revisado el Presupuesto",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "presupuesto",
                textoObligar: "Debes revisar el Presupuesto para continuar"
            },
            
            // PASO 9 - ESTRELLAS
            {
                titulo: "ESTRELLAS Y PATROCINADORES",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            ⭐ NUESTROS PATROCINADORES QUIEREN VERTE POR AQUÍ
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Una escudería cuidada tarde o temprano traerá sus recompensas.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en el icono de Estrellas (junto al dinero)
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #909096;">
                        <strong style="color: #e8e8e8;">⭐ Cada día, tus patrocinadores te asignarán estrellas por entrar a gestionar la escudería, por fabricar y por probar en pista.</strong>
                    </p>
                `,
                botonTexto: "He visto las Estrellas",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "estrellas",
                textoObligar: "Debes ver las Estrellas para continuar"
            },
            
            // PASO 10 - CLASIFICACIÓN
            {
                titulo: "CLASIFICACIÓN",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            📊 AQUÍ VERÁS TU PROGRESO COMPARADO CON OTROS MANAGERS
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Clasificación" para continuar.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #909096;">
                        <strong style="color: #e8e8e8;">📊 Verás tu posición según:</strong> Dinero, Vuelta rápida y Aciertos por cada carrera.
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-history" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">HISTÓRICO:</strong> Verás un histórico de las diferentes carreras y campeones de cada bloque.
                        </p>
                    </div>
                `,
                botonTexto: "He visto la Clasificación",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "ranking",
                textoObligar: "Debes ver la Clasificación para continuar"
            },
            
            // PASO 11 - NOTIFICACIONES
            {
                titulo: "NOTIFICACIONES",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            🔔 AQUÍ PODRÁS CONSULTAR TUS AVISOS
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Notificaciones" para continuar.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #909096;">
                        <strong style="color: #e8e8e8;">📋 Podrás consultar:</strong> Piezas vendidas, resultados de carrera, estado de almacén, solicitudes...
                    </p>
                `,
                botonTexto: "He revisado Notificaciones",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "notificaciones",
                textoObligar: "Debes revisar Notificaciones para continuar"
            },
            
            // PASO 12 - COMUNICACIÓN
            {
                titulo: "COMUNICACIÓN",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            💬 CONVERSA CON OTROS JUGADORES
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Desde aquí puedes conversar con otros jugadores, buscarlos, compartir pronósticos, ponerse de acuerdo a la hora de comprar o vender piezas, ganar experiencia en el juego... utilízalo como quieras.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> MINIMIZA ESTA VENTANA y explora la sección de comunicación, luego vuelve al tutorial.
                        </p>
                    </div>
                `,
                botonTexto: "He explorado Comunicación",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "comunicacion",
                textoObligar: "Debes explorar Comunicación para continuar"
            },
            
            // PASO 13 - PERFIL
            {
                titulo: "TU PERFIL",
                contenido: `
                    <div style="background: #1a1a1f; padding: 12px; border-radius: 3px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #c0c0c0; font-size: 13px;">
                            👤 MUESTRA AL MUNDO TU TALENTO
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #d4af37;">
                        <p style="margin: 0; font-size: 12px; color: #d4af37;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en tu "Perfil" para continuar.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #909096;">
                        <strong style="color: #e8e8e8;">📊 Entrando en cada perfil de usuario verás:</strong><br>
                        Vitrina de trofeos, Clasificación, Capitalización de escudería, Posición global, Carreras disputadas, % de acierto en pronóstico y Fecha de creación.
                    </p>
                    
                    <div style="background: #1a1a1f; padding: 8px 12px; border-radius: 3px; margin: 12px 0; border-left: 2px solid #c0c0c0;">
                        <p style="margin: 0; font-size: 12px; color: #909096;">
                            <i class="fas fa-users" style="color: #c0c0c0;"></i> 
                            <strong style="color: #e8e8e8;">AMIGOS:</strong> Busca a tus amigos y forma un grupo para competir entre vosotros. Ajusta las notificaciones, ver tutorial, ayuda.
                        </p>
                    </div>
                `,
                botonTexto: "He revisado mi Perfil",
                botonIcono: "fa-check",
                colorBoton: "#c0c0c0",
                obligarClick: "perfil",
                textoObligar: "Debes revisar tu Perfil para continuar"
            },
            
            // PASO 14 - FINAL
            {
                titulo: "TODO LISTO, MANAGER",
                contenido: `
                    <div style="background: #1a1a1f; padding: 15px; border-radius: 3px; margin-bottom: 15px; border-left: 2px solid #d4af37;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: #d4af37; font-size: 13px;">
                            🏁 EL ASFALTO REAL TE ESPERA
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #909096;">
                            Tu trabajo diario: buscar la combinación perfecta.
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; margin-bottom: 12px; color: #e8e8e8;">
                        <strong>🔄 El ciclo del manager:</strong>
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; background: #1a1a1f; padding: 8px; border-radius: 3px;">
                            <div style="background: #c0c0c0; color: #0f0f12; width: 24px; height: 24px; border-radius: 2px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 600; font-size: 12px;">1</div>
                            <span style="color: #909096; font-size: 13px;"><strong style="color: #e8e8e8;">Equipa</strong> las mejores piezas</span>
                        </div>
                        <div style="display: flex; align-items: center; background: #1a1a1f; padding: 8px; border-radius: 3px;">
                            <div style="background: #c0c0c0; color: #0f0f12; width: 24px; height: 24px; border-radius: 2px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 600; font-size: 12px;">2</div>
                            <span style="color: #909096; font-size: 13px;"><strong style="color: #e8e8e8;">Prueba</strong> en pista</span>
                        </div>
                        <div style="display: flex; align-items: center; background: #1a1a1f; padding: 8px; border-radius: 3px;">
                            <div style="background: #c0c0c0; color: #0f0f12; width: 24px; height: 24px; border-radius: 2px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 600; font-size: 12px;">3</div>
                            <span style="color: #909096; font-size: 13px;"><strong style="color: #e8e8e8;">Analiza</strong> los datos</span>
                        </div>
                        <div style="display: flex; align-items: center; background: #1a1a1f; padding: 8px; border-radius: 3px;">
                            <div style="background: #d4af37; color: #0f0f12; width: 24px; height: 24px; border-radius: 2px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 600; font-size: 12px;">4</div>
                            <span style="color: #909096; font-size: 13px;"><strong style="color: #e8e8e8;">Ajusta</strong> según resultados</span>
                        </div>
                    </div>
                    
                    <div style="background: #1a1a1f; padding: 10px; border-radius: 3px; margin: 12px 0; text-align: center; border: 1px dashed #d4af37;">
                        <p style="margin: 0; font-size: 12px; font-weight: 500; color: #d4af37;">
                            🏆 "La gloria es para quien descubre la sinergia que nadie más vio"
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; text-align: center; margin-top: 15px; color: #e8e8e8;">
                        <strong>¡Buena suerte, Manager! El circuito te espera.</strong>
                    </p>
                `,
                botonTexto: "¡COMENZAR AVENTURA!",
                botonIcono: "fa-play-circle",
                colorBoton: "#d4af37",
                esFinal: true
            }
        ];
    
        // Obtener el paso actual
        const paso = pasos[numeroPaso];
    
        // Actualizar header
        const btnMinimizarExistente = header.querySelector('#btn-minimizar-tutorial');
        header.innerHTML = `
            <div id="tutorial-title-container" style="flex: 1;">
                <h2 style="color: ${paso.colorBoton}; margin: 0 0 5px 0; font-size: 18px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #2a2a30; padding-bottom: 8px;">
                    ${paso.titulo}
                </h2>
            </div>
        `;
        
        if (btnMinimizarExistente) {
            header.appendChild(btnMinimizarExistente);
        } else {
            const nuevoBtn = document.createElement('button');
            nuevoBtn.id = 'btn-minimizar-tutorial';
            Object.assign(nuevoBtn.style, {
                background: 'transparent',
                border: 'none',
                color: '#ff3333',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s',
                opacity: '1',
                marginLeft: '20px'
            });
            nuevoBtn.innerHTML = '<i class="fas fa-window-minimize" style="color: #ff3333; font-size: 11px; font-weight: bold;"></i> <span style="color: #ff3333; font-weight: bold;">Minimizar</span>';
            header.appendChild(nuevoBtn);
        }
        
        this.configurarMinimizar();
        
        // Actualizar contenido
        content.innerHTML = paso.contenido;
        
        // Actualizar botón siguiente
        const siguienteContainer = this.ventanaTutorial.querySelector('#tutorial-siguiente-container');
        if (siguienteContainer) {
            if (paso.esFinal) {
                siguienteContainer.innerHTML = `
                    <button id="btn-finalizar-tutorial" style="
                        background: #d4af37;
                        color: #0f0f12;
                        border: none;
                        padding: 6px 16px;
                        border-radius: 3px;
                        font-weight: 600;
                        font-size: 12px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    ">
                        <i class="fas ${paso.botonIcono}" style="color: #0f0f12; font-size: 11px;"></i>
                        ${paso.botonTexto}
                    </button>
                `;
                
                // 👇 IMPORTANTE: Asignar evento onclick
                siguienteContainer.querySelector('#btn-finalizar-tutorial').onclick = () => {
                    this.finalizarTutorialCompleto();
                };
            } else {
                siguienteContainer.innerHTML = `
                    <button id="btn-siguiente-paso" style="
                        background: transparent;
                        color: #c0c0c0;
                        border: 1px solid #c0c0c0;
                        padding: 6px 16px;
                        border-radius: 3px;
                        font-weight: 500;
                        font-size: 12px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    ">
                        ${paso.botonTexto}
                        <i class="fas ${paso.botonIcono}" style="color: #c0c0c0; font-size: 11px;"></i>
                    </button>
                `;
                
                // 👇 IMPORTANTE: Asignar evento onclick
                siguienteContainer.querySelector('#btn-siguiente-paso').onclick = () => {
                    this.mostrarPaso(numeroPaso + 1);
                };
            }
        }
        
        // Configurar verificación de clic si es necesario
        if (paso.obligarClick) {
            this.configurarVerificacionClic(paso.obligarClick, numeroPaso);
        }
        
        // Desplazar al paso actual
        this.ventanaTutorial.scrollTop = 0;
    }

    // ========================
    // CONFIGURAR VERIFICACIÓN DE CLIC (NUEVO)
    // ========================
    configurarVerificacionClic(elementoId, pasoActual) {
        // Buscar el elemento en el DOM
        const elemento = document.querySelector(`[data-tutorial="${elementoId}"]`) || 
                        document.getElementById(elementoId) ||
                        document.querySelector(`[href*="${elementoId}"]`) ||
                        document.querySelector(`button:contains("${elementoId}")`);
        
        if (!elemento) {
            console.warn(`⚠️ No se encontró el elemento para tutorial: ${elementoId}`);
            return;
        }
        
        // Guardar referencia
        this.elementosObjetivo[elementoId] = elemento;
        
        // Agregar estilo destacado
        elemento.style.transition = 'all 0.3s';
        elemento.style.boxShadow = '0 0 0 3px rgba(255, 51, 102, 0.5)';
        elemento.style.position = 'relative';
        elemento.style.zIndex = '999997';
        
        // Crear resplandor
        const resplandor = document.createElement('div');
        resplandor.style.cssText = `
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border-radius: inherit;
            background: rgba(255, 51, 102, 0.2);
            z-index: -1;
            animation: pulse 2s infinite;
        `;
        
        // Agregar animación CSS si no existe
        if (!document.querySelector('#tutorial-animations')) {
            const style = document.createElement('style');
            style.id = 'tutorial-animations';
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                    100% { opacity: 0.2; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        elemento.appendChild(resplandor);
        
        // Configurar evento de clic
        const originalOnClick = elemento.onclick;
        elemento.onclick = (e) => {
            // Restaurar estilo
            elemento.style.boxShadow = '';
            resplandor.remove();
            
            // Restaurar evento original si existía
            if (originalOnClick) {
                originalOnClick.call(elemento, e);
            }
            
            // Mostrar confirmación
            setTimeout(() => {
                this.mostrarPaso(pasoActual + 1);
            }, 300);
        };
    }

    // ========================
    // CONFIGURAR MINIMIZAR (CORREGIDO)
    // ========================
    configurarMinimizar() {
        const btnMinimizar = this.ventanaTutorial.querySelector('#btn-minimizar-tutorial');
        const overlay = document.getElementById('tutorial-overlay');
        if (!btnMinimizar) return;
        
        let estaMinimizado = false;
        
        btnMinimizar.onclick = () => {
            if (estaMinimizado) {
                // ===== MAXIMIZAR =====
                // Ventana grande
                this.ventanaTutorial.style.width = '90%';
                this.ventanaTutorial.style.maxWidth = '700px';
                this.ventanaTutorial.style.height = 'auto';
                this.ventanaTutorial.style.maxHeight = '85vh';
                this.ventanaTutorial.style.top = '50%';
                this.ventanaTutorial.style.left = '50%';
                this.ventanaTutorial.style.transform = 'translate(-50%, -50%)';
                this.ventanaTutorial.style.padding = '20px';
                this.ventanaTutorial.style.borderRadius = '4px';
                
                // Mostrar overlay con oscuridad y blur
                if (overlay) {
                    overlay.style.background = 'rgba(0, 0, 0, 0.85)';
                    overlay.style.backdropFilter = 'blur(4px)';
                    overlay.style.display = 'block'; // Asegurar que está visible
                }
                
                // Mostrar todo el contenido
                const elementos = this.ventanaTutorial.querySelectorAll('*');
                elementos.forEach(el => {
                    if (el.id !== 'btn-minimizar-tutorial') {
                        el.style.display = '';
                        el.style.visibility = '';
                        el.style.opacity = '';
                    }
                });
                
                btnMinimizar.innerHTML = '<i class="fas fa-window-minimize" style="color: #ff3333; font-size: 11px; font-weight: bold;"></i> <span style="color: #ff3333; font-weight: bold;">Minimizar</span>';
                estaMinimizado = false;
                
            } else {
                // ===== MINIMIZAR =====
                // Ventana pequeña en esquina
                this.ventanaTutorial.style.width = 'auto';
                this.ventanaTutorial.style.height = 'auto';
                this.ventanaTutorial.style.top = '20px';
                this.ventanaTutorial.style.left = '20px';
                this.ventanaTutorial.style.transform = 'none';
                this.ventanaTutorial.style.padding = '10px 15px';
                this.ventanaTutorial.style.borderRadius = '3px';
                
                // OCULTAR overlay completamente para que se vea el juego normal
                if (overlay) {
                    overlay.style.display = 'none'; // Simplemente lo ocultamos
                }
                
                // Ocultar TODO excepto header y botón
                const elementos = this.ventanaTutorial.querySelectorAll('*');
                elementos.forEach(el => {
                    if (el.id !== 'tutorial-header' && el.id !== 'btn-minimizar-tutorial') {
                        el.style.display = 'none';
                    }
                });
                
                const header = this.ventanaTutorial.querySelector('#tutorial-header');
                if (header) {
                    header.style.display = 'flex';
                    header.style.justifyContent = 'center';
                    header.style.margin = '0';
                    header.style.padding = '0';
                    
                    const titleContainer = header.querySelector('#tutorial-title-container');
                    if (titleContainer) titleContainer.style.display = 'none';
                    
                    btnMinimizar.style.margin = '0';
                    btnMinimizar.style.width = 'auto';
                }
                
                btnMinimizar.innerHTML = '<i class="fas fa-window-maximize" style="color: #ff3333; font-size: 11px; font-weight: bold;"></i> <span style="color: #ff3333; font-weight: bold;">Tutorial</span>';
                estaMinimizado = true;
            }
        };
    }
    // ========================
    // FINALIZAR TUTORIAL COMPLETO (IGUAL)
    // ========================
    // ========================
    // FINALIZAR TUTORIAL COMPLETO (CORREGIDO)
    // ========================
    // ========================
    // FINALIZAR TUTORIAL COMPLETO
    // ========================
    async finalizarTutorialCompleto() {
        console.log('✅ Finalizando tutorial completo...');
        
        // Eliminar overlay
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.remove();
        
        // Eliminar ventana tutorial
        if (this.ventanaTutorial) {
            this.ventanaTutorial.remove();
            this.ventanaTutorial = null;
        }
        
        localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
        localStorage.setItem('f1_tutorial_completado', 'true');
        
        if (this.f1Manager.escuderia && this.f1Manager.supabase) {
            try {
                const { error } = await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ tutorial_completado: true })
                    .eq('id', this.f1Manager.escuderia.id);
                
                if (error) console.error('❌ Error actualizando tutorial en BD:', error);
            } catch (error) {
                console.error('❌ Error en actualización:', error);
            }
        }
        
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification(
                    '🎉 ¡Tutorial completado! ¡Bienvenido a CRITICAL LAP!',
                    'success'
                );
            }
        }, 300);
        
        if (this.f1Manager.escuderia) {
            this.f1Manager.escuderia.tutorial_completado = true;
        }
    }
    // ========================
    // CERRAR CON TECLA ESC
    // ========================
    configurarCerrarConEsc() {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && this.ventanaTutorial) {
                const overlay = document.getElementById('tutorial-overlay');
                if (overlay) overlay.remove();
                this.ventanaTutorial.remove();
                this.ventanaTutorial = null;
            }
        };
        
        document.addEventListener('keydown', handleEsc);
        
        // Guardar para poder remover después si es necesario
        this.handleEscFunction = handleEsc;
    }
    // ========================
    // FUNCIONES UTILITARIAS (NUEVAS)
    // ========================
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
            : '0, 210, 190'; // Default
    }
    
    darkenColor(hex, percent) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

console.log('✅ Tutorial.js cargado correctamente con 14 pasos');
