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
    iniciar() {
        const tutorialCompletado = localStorage.getItem('f1_tutorial_completado');
        
        if (tutorialCompletado === 'true') {
            console.log('✅ Tutorial ya completado, omitiendo...');
            return;
        }
        
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
    // CREAR VENTANA BASE (IGUAL)
    // ========================
    crearVentanaBase() {
        this.ventanaTutorial = document.createElement('div');
        this.ventanaTutorial.id = 'tutorial-ventana-flotante';
        this.ventanaTutorial.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
            background: linear-gradient(135deg, #0c0c1a 0%, #1a1a3a 100%);
            border: 3px solid #00f0ff;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 240, 255, 0.6),
                        0 0 120px rgba(0, 240, 255, 0.3);
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 999998;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(10px);
        `;
        
        this.ventanaTutorial.innerHTML = `
            <div id="tutorial-header" style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div id="tutorial-title-container" style="flex: 1;">
                    <!-- Título y paso se actualizarán -->
                </div>
                <button id="btn-minimizar-tutorial" style="
                    background: rgba(0, 240, 255, 0.2);
                    border: 2px solid #00f0ff;
                    color: #00f0ff;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: 20px;
                    align-self: flex-start;
                ">
                    <i class="fas fa-window-minimize"></i>
                    Minimizar
                </button>
            </div>
            
            <div id="tutorial-content" style="flex: 1; overflow-y: auto; padding-right: 10px; line-height: 1.7; font-size: 1.1rem;">
                <!-- Contenido del paso -->
            </div>
            
            <div id="tutorial-controls" style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 10px;">
                    <button id="btn-anterior-paso" style="
                        background: linear-gradient(135deg, #ff3366 0%, #cc2255 100%);
                        border: 2px solid #ff5588;
                        box-shadow: 0 4px 15px rgba(255, 51, 102, 0.5);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-arrow-left"></i>
                        Anterior
                    </button>
                    

                </div>
                
                <div id="tutorial-pagination" style="display: flex; gap: 8px;">
                    <!-- Puntos de paginación -->
                </div>
                
                <div id="tutorial-footer" style="display: flex; align-items: center;">
                    <!-- Botón siguiente/final se actualizará aquí -->
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(255, 51, 102, 0.1); border-radius: 10px; border-left: 4px solid #ff3366;">
                <p style="margin: 0; font-size: 0.9rem; color: #ffccd5;">
                    <i class="fas fa-lightbulb"></i> 
                    <strong>Tip:</strong> Puedes minimizar esta ventana en cualquier momento si necesitas explorar el juego.
                </p>
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
    actualizarContenidoPaso(numeroPaso) {
        const header = this.ventanaTutorial.querySelector('#tutorial-header');
        const content = this.ventanaTutorial.querySelector('#tutorial-content');
        const footer = this.ventanaTutorial.querySelector('#tutorial-footer');
        const pagination = this.ventanaTutorial.querySelector('#tutorial-pagination');
        
        // Array con todos los pasos - ¡TODOS LOS TEXTO QUE ME DISTE!
        const pasos = [
            // PASO 0
            {
                titulo: "¡BIENVENIDO A CRITICAL LAP!",
                subtitulo: "Paso 1/14 - El juego que combina gestión con realidad",
                contenido: `
                    <div style="background: rgba(255, 51, 102, 0.15); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #ff3366;">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div style="background: #ff3366; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 1.2rem;">
                                🏎️
                            </div>
                            <h3 style="margin: 0; color: #ffccd5; font-size: 1.5rem;">
                                ¡Bienvenido a CRITICAL LAP!
                            </h3>
                        </div>
                        <p style="margin: 0; font-size: 1.15rem; line-height: 1.8; color: #e0e0e0;">
                            Estás ante el juego en tiempo real con otros jugadores que combina tu trabajo de gestión con los resultados reales de las carreras.
                            <br><br>
                            <strong style="color: #ffccd5;">Tu estrategia aquí se mide con el asfalto allá fuera.</strong>
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <h4 style="color: #00d2be; margin: 0 0 15px 0; font-size: 1.3rem;">
                            🏁 Heredas la Escudería <span style="color: #ffffff;">${this.f1Manager.escuderia?.nombre || "XXX"}</span>
                        </h4>
                        <p style="margin: 0; font-size: 1.15rem; line-height: 1.7; color: #cccccc;">
                            Un equipo histórico en horas bajas. Tu misión es devolverle la gloria usando los resultados de la competición mundial.
                        </p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(0, 210, 190, 0.15) 0%, rgba(0, 166, 150, 0.15) 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid rgba(0, 210, 190, 0.3);">
                        <div style="display: flex; align-items: flex-start;">
                            <div style="color: #00d2be; font-size: 1.3rem; margin-right: 15px; margin-top: 5px;">
                                <i class="fas fa-flag-checkered"></i>
                            </div>
                            <div>
                                <p style="margin: 0 0 10px 0; font-size: 1.2rem; font-weight: bold; color: #00d2be;">
                                    ¿Aceptas el mando?
                                </p>
                                <p style="margin: 0; font-size: 1.1rem; color: #a6fff5;">
                                    Comienza tu camino hacia la gloria en el circuito más competitivo.
                                </p>
                            </div>
                        </div>
                    </div>
                `,
                botonTexto: "Aceptar el Mando",
                botonIcono: "fa-check-circle",
                colorBoton: "#00d2be"
            },
            
            // PASO 1
            {
                titulo: "EL OBJETIVO SEMANAL",
                subtitulo: "Paso 2/14 - Prepárate para cada Gran Premio",
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            📅 CADA FIN DE SEMANA DE GRAN PREMIO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Deberás tener preparado el mejor coche posible, haber enviado tu pronóstico para la carrera y tener contratado a los mejores estrategas para potenciar tus resultados.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 10px;">
                        <strong>🎯 Controlarás:</strong>
                    </p>
                    <ul style="margin: 0 0 15px 15px; font-size: 0.95rem;">
                        <li>Economía</li>
                        <li>Ingeniería</li>
                        <li>Fabricación</li>
                        <li>Estrategas</li>
                    </ul>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>💰 Dispones de 5.000.000€ iniciales.</strong><br>
                        Recuerda: cada euro invertido debe acercarte al podio.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-globe"></i> 
                            Competirás con todo el mundo, aunque podrás crear también tu propia liga entre amigos.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem;">
                        <strong>🏁 La temporada está dividida en bloques de 3 carreras.</strong>
                    </p>
                `,
                botonTexto: "Continuar",
                botonIcono: "fa-arrow-right",
                colorBoton: "#FFD700",
                obligarClick: "taller", // Nombre de la pestaña/ID a obligar
                textoObligar: "Siguiente: Ve al Taller"
            },
            
            // PASO 2 (Obligar: TALLER)
            {
                titulo: "EL TALLER",
                subtitulo: "Paso 3/14 - El corazón de tu escudería",
                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            🔧 ESTE ES EL CORAZÓN DE TU ESCUDERÍA
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Tienes <strong>11 áreas técnicas</strong> por mejorar. Para empezar, debemos fabricar nuestra primera pieza.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📦 Selecciona una pieza disponible y dale a "Producir".</strong><br>
                        Cada pieza tiene un Potencial individual. ¡Pero ojo!: un motor potente puede desequilibrar un chasis débil.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-stopwatch"></i> 
                            <strong>Importante:</strong> Lo rápido que será tu coche solo se revela en ingeniería, probando en pista.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>⏱️ En la pantalla principal verás el tiempo que queda para terminar la pieza.</strong><br>
                        Cuando esté lista, debes <strong>recogerla manualmente</strong>. Una vez recogida, se enviará automáticamente a tu almacén para que puedas usarla.
                    </p>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Taller" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He ido al Taller",
                botonIcono: "fa-check",
                colorBoton: "#00d2be",
                obligarClick: "taller",
                textoObligar: "Debes ir al Taller para continuar"
            },
            
            // PASO 3 (Obligar: ALMACÉN)
            {
                titulo: "EL ALMACÉN",
                subtitulo: "Paso 4/14 - Gestiona tus piezas",
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            📦 AQUÍ GUARDAS TUS PIEZAS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Desde el Almacén puedes:
                        </p>
                    </div>
                    
                    <ul style="margin: 15px 0; padding-left: 20px; font-size: 0.95rem;">
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-wrench" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Equipar/Desmontar:</strong> Instala o cambia piezas en tu coche.
                        </li>
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-money-bill-wave" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Vender:</strong> Saca beneficio en el mercado comunitario.
                        </li>
                    </ul>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🔮 La magia ocurre cuando pruebas la combinación en pista.</strong><br>
                        Una vez equipado, ve a <strong>Ingeniería</strong> para la Sesión de Pruebas y descubre la puntuación REAL de tu conjunto.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-exclamation-triangle"></i> 
                            <strong>¡ADVERTENCIA!</strong> Revisa el desgaste de tus piezas equipadas a diario. Si no las reparas en 24 horas, perderás la pieza.
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Almacén" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He ido al Almacén",
                botonIcono: "fa-check",
                colorBoton: "#FFD700",
                obligarClick: "almacen",
                textoObligar: "Debes ir al Almacén para continuar"
            },
            
            // PASO 4 (Obligar: INGENIERÍA)
            {
                titulo: "INGENIERÍA",
                subtitulo: "Paso 5/14 - Donde la teoría se vuelve realidad",
                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            📊 AQUÍ NO HAY TEORÍAS, SOLO DATOS REALES
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Tu coche es un ecosistema: se prueban todas las piezas en conjunto.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🏁 Desde ingeniería, simularemos vueltas y te daremos:</strong>
                    </p>
                    <ul style="margin: 0 0 15px 15px; font-size: 0.95rem;">
                        <li>El tiempo por vuelta más rápido para tu configuración actual</li>
                        <li>Un informe detallado para mejorar</li>
                    </ul>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-exclamation-circle"></i> 
                            <strong>VERDAD CRUCIAL:</strong> No porque equipes la última pieza fabricada será mejor que la anterior. Las piezas que diseñamos no siempre funcionan como esperamos.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🔍 La prueba en pista revela sinergias ocultas.</strong><br>
                        Una combinación aparentemente modesta puede superar a componentes individualmente mejores.
                    </p>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Ingeniería" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He ido a Ingeniería",
                botonIcono: "fa-check",
                colorBoton: "#00d2be",
                obligarClick: "ingenieria",
                textoObligar: "Debes ir a Ingeniería para continuar"
            },
            
            // PASO 5 (Obligar: MERCADO)
            {
                titulo: "EL MERCADO",
                subtitulo: "Paso 6/14 - Compra y vende con otros Managers",
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            💰 ¿NECESITAS UNA PIEZA URGENTE?
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            En el Mercado compras y vendes componentes con otros Managers.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🎯 Busca piezas que complementen tu conjunto</strong> o saca un dinero extra produciendo para otras escuderías.
                    </p>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #00d2be;">
                        <p style="margin: 0; font-size: 0.9rem; color: #00d2be;">
                            <i class="fas fa-balance-scale"></i> 
                            <strong>ESTRATEGIA DE MERCADO:</strong><br>
                            • Vende piezas que no uses<br>
                            • Compra componentes específicos para combinaciones<br>
                            • Aprovecha ofertas de otros managers
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📈 El mercado fluctúa según la demanda.</strong><br>
                        Una pieza popular antes de un Gran Premio puede subir de precio.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Mercado" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He ido al Mercado",
                botonIcono: "fa-check",
                colorBoton: "#FFD700",
                obligarClick: "mercado",
                textoObligar: "Debes ir al Mercado para continuar"
            },
            
            // PASO 6 (Obligar: ESTRATEGAS)
            {
                titulo: "GESTIÓN DE ESTRATEGAS",
                subtitulo: "Paso 7/14 - Potencia tus resultados",
                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            👨‍💼 YA TENEMOS LAS PIEZAS EQUIPADAS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Para aumentar nuestras posibilidades en carrera necesitamos contratar estrategas.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📋 Puedes contratar hasta 4 estrategas,</strong> cada uno con:
                    </p>
                    <ul style="margin: 0 0 15px 15px; font-size: 0.95rem;">
                        <li>Un área específica de especialización</li>
                        <li>Sueldo diferente</li>
                        <li>Bonificación diferente por acierto</li>
                    </ul>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>💼 Contrata en el catálogo.</strong><br>
                        Al final de la semana su sueldo se descontará de tu presupuesto.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Gestionar Estrategas" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He gestionado Estrategas",
                botonIcono: "fa-check",
                colorBoton: "#00d2be",
                obligarClick: "estrategas",
                textoObligar: "Debes gestionar Estrategas para continuar"
            },
            
            // PASO 7 (Obligar: PRONÓSTICO)
            {
                titulo: "PRONÓSTICOS",
                subtitulo: "Paso 8/14 - Anticípate a la realidad",
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            🔮 ENVÍA TUS PRONÓSTICOS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Anticípate a la realidad. Envía tus pronósticos sobre la carrera real hasta 48 horas antes del evento.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>⚠️ Para poder enviar un pronóstico, necesitas:</strong><br>
                        • Una configuración de coche probada en pista<br>
                        • Tu mejor vuelta rápida registrada
                    </p>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #00d2be;">
                        <p style="margin: 0; font-size: 0.9rem; color: #00d2be;">
                            <i class="fas fa-question-circle"></i> 
                            <strong>ELIGE UNA DE LAS TRES OPCIONES</strong> de cada pregunta, cada una asignada a un área que cubrirá tu estratega contratado.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>💰 ¡Tus aciertos se vuelven dinero al finalizar la semana!</strong><br>
                        Tu escudería compite con las demás para saber cuál es la que más acierta los pronósticos.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Pronóstico" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He ido a Pronóstico",
                botonIcono: "fa-check",
                colorBoton: "#FFD700",
                obligarClick: "pronostico",
                textoObligar: "Debes ir a Pronóstico para continuar"
            },
            
            // PASO 8 (Obligar: PRESUPUESTO)
            {
                titulo: "PRESUPUESTO",
                subtitulo: "Paso 9/14 - Controla tu economía",
                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            💸 TODO QUEDA ARCHIVADO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            En el presupuesto semanal: gastos de producción, salarios, compras en el mercado...
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📊 Pero no todo son gastos, tus ingresos dependen de:</strong>
                    </p>
                    <ul style="margin: 0 0 15px 15px; font-size: 0.95rem;">
                        <li>Resultados en las carreras reales</li>
                        <li>Ventas en el mercado</li>
                        <li>Patrocinadores</li>
                    </ul>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-trophy"></i> 
                            <strong>COMPETICIÓN ECONÓMICA:</strong> Tu escudería compite también con otras para saber cuál es la más rica.
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Presupuesto" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He revisado el Presupuesto",
                botonIcono: "fa-check",
                colorBoton: "#00d2be",
                obligarClick: "presupuesto",
                textoObligar: "Debes revisar el Presupuesto para continuar"
            },
            
            // PASO 9 (Obligar: ESTRELLAS)
            {
                titulo: "ESTRELLAS Y PATROCINADORES",
                subtitulo: "Paso 10/14 - Recompensas diarias",
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            ⭐ RECOMPENSAS DIARIAS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Cada día, tus patrocinadores te asignarán estrellas por:
                        </p>
                    </div>
                    
                    <ul style="margin: 15px 0; padding-left: 20px; font-size: 0.95rem;">
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-sign-in-alt" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Entrar a gestionar la escudería</strong>
                        </li>
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-industry" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Fabricar piezas</strong>
                        </li>
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-stopwatch" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Probar en pista</strong>
                        </li>
                    </ul>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #00d2be;">
                        <p style="margin: 0; font-size: 0.9rem; color: #00d2be;">
                            <i class="fas fa-gem"></i> 
                            <strong>LAS ESTRELLAS SON TU RECOMPENSA</strong> por ser un manager activo. Acumúlalas para beneficios especiales.
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en el icono de Estrellas para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He visto las Estrellas",
                botonIcono: "fa-check",
                colorBoton: "#FFD700",
                obligarClick: "estrellas",
                textoObligar: "Debes ver las Estrellas para continuar"
            },
            
            // PASO 10 (Obligar: RANKING)
            {
                titulo: "RANKING",
                subtitulo: "Paso 11/14 - Compara tu progreso",
                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            📊 AQUÍ VES TU PROGRESO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Comparado con otros managers, verás tu posición según:
                        </p>
                    </div>
                    
                    <ul style="margin: 15px 0; padding-left: 20px; font-size: 0.95rem;">
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-money-bill-wave" style="color: #FFD700; margin-right: 8px;"></i>
                            <strong>Dinero</strong> (escudería más rica)
                        </li>
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-stopwatch" style="color: #FFD700; margin-right: 8px;"></i>
                            <strong>Vuelta rápida</strong> (mejor tiempo)
                        </li>
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-bullseye" style="color: #FFD700; margin-right: 8px;"></i>
                            <strong>Aciertos de carrera</strong> (pronósticos correctos)
                        </li>
                    </ul>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🏆 Verás un histórico de las diferentes carreras</strong> y campeones de cada bloque.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Ranking" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He visto el Ranking",
                botonIcono: "fa-check",
                colorBoton: "#00d2be",
                obligarClick: "ranking",
                textoObligar: "Debes ver el Ranking para continuar"
            },
            
            // PASO 11 (Obligar: NOTIFICACIONES)
            {
                titulo: "NOTIFICACIONES",
                subtitulo: "Paso 12/14 - Mantente informado",
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            🔔 AQUÍ PODRÁS CONSULTAR TUS AVISOS
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📋 Mantente al día con:</strong>
                    </p>
                    <ul style="margin: 0 0 15px 15px; font-size: 0.95rem;">
                        <li>Piezas vendidas en el mercado</li>
                        <li>Resultados de carrera</li>
                        <li>Avisos importantes del juego</li>
                        <li>Solicitudes de amistad o liga</li>
                        <li>Estado de fabricación de piezas</li>
                    </ul>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #00d2be;">
                        <p style="margin: 0; font-size: 0.9rem; color: #00d2be;">
                            <i class="fas fa-bell"></i> 
                            <strong>NO TE PIERDAS NADA:</strong> Revisa las notificaciones regularmente para no perder oportunidades.
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Notificaciones" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He revisado Notificaciones",
                botonIcono: "fa-check",
                colorBoton: "#FFD700",
                obligarClick: "notificaciones",
                textoObligar: "Debes revisar Notificaciones para continuar"
            },
            
            // PASO 12 (Obligar: PERFIL)
            {
                titulo: "TU PERFIL",
                subtitulo: "Paso 13/14 - Muestra tu talento",
                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            👤 MUESTRA AL MUNDO TU TALENTO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            En tu perfil verás quién tiene el mejor coche, dinero o aciertos.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🏆 Entrando en cada perfil de usuario verás:</strong>
                    </p>
                    <ul style="margin: 0 0 15px 15px; font-size: 0.95rem;">
                        <li>Vitrinas de trofeos</li>
                        <li>Datos más relevantes (vuelta rápida, clasificación)</li>
                        <li>Estrategas contratados</li>
                        <li>Logros desbloqueados</li>
                    </ul>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>👥 Busca a tus amigos y forma un grupo</strong> para competir entre vosotros en ligas privadas.
                    </p>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-cog"></i> 
                            <strong>CONFIGURACIÓN:</strong> Desde tu perfil puedes ajustar notificaciones, ver este tutorial de nuevo o buscar ayuda.
                        </p>
                    </div>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en tu "Perfil" para continuar.
                        </p>
                    </div>
                `,
                botonTexto: "He revisado mi Perfil",
                botonIcono: "fa-check",
                colorBoton: "#00d2be",
                obligarClick: "perfil",
                textoObligar: "Debes revisar tu Perfil para continuar"
            },
            
            // PASO 13 (FINAL)
            {
                titulo: "TODO LISTO, MANAGER",
                subtitulo: "Paso 14/14 - Comienza tu aventura",
                contenido: `
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #ff3366;">
                            🏁 EL ASFALTO REAL TE ESPERA
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Tu trabajo diario: buscar la combinación perfecta.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🔄 El ciclo del manager:</strong>
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 6px;">
                            <div style="background: #00d2be; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">1</div>
                            <span><strong>Equipa</strong> las mejores piezas</span>
                        </div>
                        <div style="display: flex; align-items: center; background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px;">
                            <div style="background: #FFD700; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">2</div>
                            <span><strong>Prueba</strong> en pista la combinación</span>
                        </div>
                        <div style="display: flex; align-items: center; background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px;">
                            <div style="background: #ff3366; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">3</div>
                            <span><strong>Analiza</strong> los datos de ingeniería</span>
                        </div>
                        <div style="display: flex; align-items: center; background: rgba(156, 39, 176, 0.1); padding: 10px; border-radius: 6px;">
                            <div style="background: #9c27b0; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">4</div>
                            <span><strong>Ajusta</strong> según los resultados</span>
                        </div>
                    </div>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 12px; border-radius: 8px; margin: 15px 0; text-align: center; border: 2px dashed #00d2be;">
                        <p style="margin: 0; font-size: 1rem; font-weight: bold; color: #00d2be;">
                            🏆 "La gloria es para quien descubre la sinergia que nadie más vio"
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; text-align: center; margin-top: 20px;">
                        <strong>¡Buena suerte, Manager! El circuito te espera.</strong>
                    </p>
                `,
                botonTexto: "¡COMENZAR AVENTURA!",
                botonIcono: "fa-play-circle",
                colorBoton: "#ff3366",
                esFinal: true
            }
        ];

        // Obtener el paso actual
        const paso = pasos[numeroPaso];
        

        // Actualizar header
        const iconos = [
            'fa-graduation-cap', 'fa-flag', 'fa-wrench', 'fa-box-open',
            'fa-cogs', 'fa-shopping-cart', 'fa-user-tie', 'fa-bullseye',
            'fa-money-bill-wave', 'fa-star', 'fa-trophy', 'fa-bell',
            'fa-user', 'fa-flag-checkered'
        ];
        
        header.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <div style="font-size: 0.9rem; color: #00d2be; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
                    Paso ${numeroPaso + 1} de ${this.totalPasos}
                </div>
                <h2 style="color: ${paso.colorBoton}; margin: 0 0 10px 0; font-size: 1.8rem; font-weight: 700;">
                    <i class="fas ${iconos[numeroPaso] || 'fa-info-circle'}" style="margin-right: 10px;"></i>
                    ${paso.titulo}
                </h2>
                <div style="color: #a0a0a0; font-size: 1rem; border-bottom: 2px solid rgba(0, 210, 190, 0.3); padding-bottom: 15px;">
                    ${paso.subtitulo}
                </div>
            </div>
        `;
        
        // Actualizar contenido
        content.innerHTML = paso.contenido;
        
        // Actualizar footer
        if (paso.esFinal) {
            footer.innerHTML = `
                <div style="color: #888; font-size: 0.8rem;">
                    <i class="fas fa-graduation-cap"></i> Tutorial completo
                </div>
                <button id="btn-finalizar-tutorial" style="
                    background: linear-gradient(135deg, ${paso.colorBoton} 0%, ${this.darkenColor(paso.colorBoton, 20)} 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.1rem;
                    box-shadow: 0 4px 15px rgba(${this.hexToRgb(paso.colorBoton)}, 0.4);
                ">
                    <i class="fas ${paso.botonIcono}"></i>
                    ${paso.botonTexto}
                </button>
            `;
            
            footer.querySelector('#btn-finalizar-tutorial').onclick = () => {
                this.finalizarTutorialCompleto();
            };
        } else {
            let textoInfo = paso.textoObligar || "Siguiente paso";
            

            footer.innerHTML = `
                <button id="btn-siguiente-paso" style="
                    background: linear-gradient(135deg, #00f0ff 0%, #00a0ff 100%);
                    border: 2px solid #00ffff;
                    box-shadow: 0 4px 20px rgba(0, 240, 255, 0.7);
                    font-size: 1.2rem;
                    padding: 14px 35px;
                    color: white;


                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    transition: all 0.3s;

                ">
                    ${paso.botonTexto}
                    <i class="fas ${paso.botonIcono}"></i>
                </button>
            `;
            
            footer.querySelector('#btn-siguiente-paso').onclick = () => {
                this.mostrarPaso(numeroPaso + 1);
            };
            
            // Si el paso obliga a hacer clic en algo, configurar verificación
            if (paso.obligarClick) {
                this.configurarVerificacionClic(paso.obligarClick, numeroPaso);
            }
        }
        

        // Actualizar paginación
    pagination.innerHTML = '';
    for (let i = 0; i < this.totalPasos; i++) {
        const punto = document.createElement('div');
        punto.style.cssText = `
            width: ${i === numeroPaso ? '16px' : '12px'};
            height: ${i === numeroPaso ? '16px' : '12px'};
            background: ${i === numeroPaso ? paso.colorBoton : 'rgba(255, 255, 255, 0.2)'};
            border-radius: 50%;
            margin: 0 4px;
            transition: all 0.3s;
            cursor: ${i <= this.pasoActual ? 'pointer' : 'not-allowed'};
            border: ${i === numeroPaso ? '2px solid white' : 'none'};
            opacity: ${i <= this.pasoActual ? '1' : '0.5'};
        `;
        
        if (i <= this.pasoActual) {
            punto.onclick = () => {
                this.mostrarPaso(i);
            };
        }
        
        punto.title = `Paso ${i + 1}: ${i === 0 ? 'Bienvenida' : i === 13 ? 'Final' : i <= this.pasoActual ? 'Disponible' : 'Bloqueado'}`;
        pagination.appendChild(punto);
    }
        
        // Re-configurar minimizar
        this.configurarMinimizar();
        
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
    // CONFIGURAR MINIMIZAR (IGUAL)
    // ========================
    // ========================
    // ========================
    // CONFIGURAR MINIMIZAR (NUEVA VERSIÓN CORREGIDA)
    // ========================
    configurarMinimizar() {
        const btnMinimizar = this.ventanaTutorial.querySelector('#btn-minimizar-tutorial');
        if (!btnMinimizar) return;
        
        let estaMinimizado = false;
        
        btnMinimizar.onclick = () => {
            if (estaMinimizado) {
                // MAXIMIZAR: Mostrar todo normal
                this.ventanaTutorial.style.width = '90%';
                this.ventanaTutorial.style.maxWidth = '800px';
                this.ventanaTutorial.style.height = 'auto';
                this.ventanaTutorial.style.maxHeight = '85vh';
                this.ventanaTutorial.style.top = '50%';
                this.ventanaTutorial.style.left = '50%';
                this.ventanaTutorial.style.transform = 'translate(-50%, -50%)';
                this.ventanaTutorial.style.padding = '30px';
                this.ventanaTutorial.style.borderRadius = '20px';
                
                // Mostrar todo el contenido
                const elementos = this.ventanaTutorial.querySelectorAll('*');
                elementos.forEach(el => {
                    if (el.id !== 'btn-minimizar-tutorial') {
                        el.style.display = '';
                        el.style.visibility = '';
                        el.style.opacity = '';
                        el.style.position = '';
                    }
                });
                
                // Cambiar icono
                btnMinimizar.innerHTML = '<i class="fas fa-window-minimize"></i> Minimizar';
                estaMinimizado = false;
                
            } else {
                // MINIMIZAR: Solo mostrar el botón en esquina
                this.ventanaTutorial.style.width = 'auto';
                this.ventanaTutorial.style.height = 'auto';
                this.ventanaTutorial.style.top = '20px';
                this.ventanaTutorial.style.left = '20px';
                this.ventanaTutorial.style.transform = 'none';
                this.ventanaTutorial.style.padding = '15px';
                this.ventanaTutorial.style.borderRadius = '10px';
                this.ventanaTutorial.style.bottom = 'auto';
                this.ventanaTutorial.style.right = 'auto';
                
                // Ocultar TODO excepto el header y el botón
                const elementos = this.ventanaTutorial.querySelectorAll('*');
                elementos.forEach(el => {
                    // No ocultar el botón ni el header
                    if (el.id !== 'tutorial-header' && el.id !== 'btn-minimizar-tutorial') {
                        el.style.display = 'none';
                    }
                });
                
                // Asegurar que header solo muestre el botón
                const header = this.ventanaTutorial.querySelector('#tutorial-header');
                if (header) {
                    header.style.display = 'flex';
                    header.style.justifyContent = 'center';
                    header.style.alignItems = 'center';
                    header.style.margin = '0';
                    header.style.padding = '0';
                    
                    const titleContainer = header.querySelector('#tutorial-title-container');
                    if (titleContainer) {
                        titleContainer.style.display = 'none';
                    }
                    
                    // Centrar botón en header
                    btnMinimizar.style.margin = '0 auto';
                    btnMinimizar.style.width = '100%';
                    btnMinimizar.style.justifyContent = 'center';
                    btnMinimizar.style.alignSelf = 'center';
                }
                
                // Cambiar texto
                btnMinimizar.innerHTML = '<i class="fas fa-window-maximize"></i> Tutorial';
                estaMinimizado = true;
            }
        };
        
        
    }
    // ========================
    // FINALIZAR TUTORIAL COMPLETO (IGUAL)
    // ========================
    async finalizarTutorialCompleto() {
        console.log('✅ Finalizando tutorial completo...');
        
        if (this.ventanaTutorial) {
            this.ventanaTutorial.remove();
            this.ventanaTutorial = null;
        }
        
        localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
        localStorage.setItem('f1_tutorial_completado', 'true');
        
        if (this.f1Manager.escuderia && this.f1Manager.supabase) {
            try {
                await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ 
                        tutorial_completado: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.f1Manager.escuderia.id);
                console.log('✅ Tutorial marcado como completado en BD');
            } catch (error) {
                console.error('❌ Error actualizando tutorial en BD:', error);
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
