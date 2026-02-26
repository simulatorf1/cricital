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
    actualizarContenidoPaso(numeroPaso) {
        const header = this.ventanaTutorial.querySelector('#tutorial-header');
        const content = this.ventanaTutorial.querySelector('#tutorial-content');
        const footer = this.ventanaTutorial.querySelector('#tutorial-footer');

        
        // Array con todos los pasos - ¡TODOS LOS TEXTO QUE ME DISTE!
        const pasos = [
            // PASO 0
            {
                titulo: "¡BIENVENIDO A CRITICAL LAP!",

                contenido: `
                    <div style="background: rgba(255, 51, 102, 0.15); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #ff3366;">

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
                        <strong>💰 Dispones de 50.000.000€ iniciales.</strong><br>
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

                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            🔧 ESTE ES EL CORAZÓN DE TU ESCUDERÍA
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Tienes <strong>11 áreas técnicas</strong> por mejorar. Para empezar, debemos fabricar nuestra primera pieza.
                        </p>
                    </div>
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> MINIMIZA ESTA VENTANA y luego Haz clic en la pestaña "Taller" para continuar, luego vuelve al tutorial.
                        </p>
                    </div>
                    
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📦 Selecciona una pieza disponible y dale a "Producir".</strong><br>
                        Cada pieza tiene un Potencial individual. ¡Pero ojo!: un motor potente puede desequilibrar un chasis débil.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-stopwatch"></i> 
                            <strong>Importante:</strong> Lo rápido que será tu coche solo se revela en ingeniería, probando en pista. Recuerda que solo podrás fabricar 4 piezas a la vez, deberás recoger una pieza para seguir fabricando.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>⏱️ En la pantalla principal verás el tiempo que queda para terminar la pieza.</strong><br>
                        Cuando esté lista, debes <strong>recogerla manualmente</strong>. Una vez recogida, se enviará automáticamente a tu almacén para que puedas usarla.
                    </p>
                    

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

                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> MINIMIZA ESTA VENTANA Y Haz clic en la pestaña "Almacén" para continuar. LUEGO VUELE AL TUTORIAL.
                        </p>
                    </div>
                
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            📦 AQUÍ GUARDAS TUS PIEZAS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Si en el almacén no hay piezas recuerda recogerlas primero desde la pestaña principal en el area producción. Una vez recogida ya aparecerá en el almacén. Desde el Almacén puedes:
                        </p>
                    </div>
                    
                    <ul style="margin: 15px 0; padding-left: 20px; font-size: 0.95rem;">
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-wrench" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Equipar/Desmontar:</strong> Instala o cambia piezas en tu coche. Haz clic en la pieza deseada para equipar.
                        </li>
                        <li style="margin-bottom: 8px;">
                            <i class="fas fa-money-bill-wave" style="color: #00d2be; margin-right: 8px;"></i>
                            <strong>Vender:</strong> Saca beneficio en el mercado comunitario.
                        </li>
                    </ul>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>🔮 La magia ocurre cuando pruebas la combinación en pista.</strong><br>
                        Una vez equipado, ve a la pestaña <strong>Ingeniería</strong> para la Sesión de Pruebas y descubre la puntuación REAL de tu conjunto.
                    </p>
                    
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-exclamation-triangle"></i> 
                            <strong>¡ADVERTENCIA!</strong> Revisa el desgaste de tus piezas equipadas a diario. Si no las reparas en 24 horas, perderás la pieza.
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

                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            📊 AQUÍ NO HAY TEORÍAS, SOLO DATOS REALES
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Tu coche es un ecosistema: se prueban todas las piezas en conjunto.
                        </p>
                    </div>
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Ingeniería" para continuar.
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
                        Una combinación aparentemente modesta puede superar a componentes individualmente mejores. DALE YA A INICIAR SIMULACION!! cuando acabe te mostrará el mejor tiempo por vuelta que hemos conseguido!
                    </p>
                    

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

                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            💰 ¿NECESITAS UNA PIEZA URGENTE?
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            En el Mercado compras y vendes componentes con otros Managers.
                        </p>
                    </div>
                     <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Mercado" para continuar.
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
                        <strong>📈 El mercado fluctúa según la demanda, lo diztan las propias escuderias.</strong><br>
                        Una pieza popular antes de un Gran Premio puede subir de precio, gestiona tus compras.
                    </p>
                    

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

                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            👨‍💼 YA TENEMOS LAS PIEZAS EQUIPADAS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Para aumentar nuestras posibilidades en carrera necesitamos contratar estrategas.
                        </p>
                    </div>
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Gestionar Estrategas" para continuar. ( El botón "Gestionar" se encuentra en la pantalla principal)
                        </p>
                    </div>                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>📋 Puedes contratar hasta 4 estrategas a la vez,</strong> cada uno con:
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

                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            🔮 ENVÍA TUS PRONÓSTICOS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Anticípate a la realidad. Envía tus pronósticos sobre la carrera real hasta 48 horas antes del evento. Recomendamos no enviar el pronostico hasta que tengas el coche bien equipado, contratado estrategas y con el minimo margen antes de que cerremos las apuestas. NO LO ENVIES AHORA.
                        </p>
                    </div>
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en la pestaña "Pronósticos" para continuar.
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
                            <strong>CUANDO SE ACERQUE EL GRAN PREMIO, ELIGE UNA DE LAS TRES OPCIONES</strong> de cada pregunta, cada una asignada a un área que cubrirá tu estratega contratado.
                        </p>
                    </div>
                    
                    <p style="font-size: 0.95rem; margin-bottom: 15px;">
                        <strong>💰 ¡Tus aciertos se vuelven dinero al finalizar la semana!</strong><br>
                        Tu escudería compite con las demás para saber cuál es la que más acierta los pronósticos.
                    </p>
                    

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

                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            💸 TODO QUEDA ARCHIVADO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            En el presupuesto semanal: gastos de producción, salarios, compras en el mercado...
                        </p>
                    </div>
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                        <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Presupuesto" para continuar.
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
                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            ⭐ RECOMPENSAS DIARIAS
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Cada día, tus patrocinadores te asignarán estrellas por:
                        </p>
                    </div>
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en el icono de Estrellas para continuar (AL LADO DEL DINERO DISPONIBLE EN LA ZONA SUPERIOR).
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
                    

                `,
                botonTexto: "He visto las Estrellas",
                botonIcono: "fa-check",
                colorBoton: "#FFD700",
                obligarClick: "estrellas",
                textoObligar: "Debes ver las Estrellas para continuar"
            },
            
            // PASO 10 (Obligar: RANKING)
            {
                titulo: "CLASIFICACIÓN",

                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            📊 AQUÍ VES TU PROGRESO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            Comparado con otros managers, verás tu posición según:
                        </p>
                    </div>
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Clasificación" para continuar.
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

                contenido: `
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                            🔔 AQUÍ PODRÁS CONSULTAR TUS AVISOS
                        </p>
                    </div>
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en "Notificaciones" para continuar (al lado del recuento de estrellas).
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

                contenido: `
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                            👤 MUESTRA AL MUNDO TU TALENTO
                        </p>
                        <p style="margin: 0; font-size: 0.95rem;">
                            En tu perfil verás quién tiene el mejor coche, dinero o aciertos.
                        </p>
                    </div>
                    <div style="background: rgba(255, 51, 102, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ff3366;">
                        <p style="margin: 0; font-size: 0.9rem; color: #ff3366;">
                            <i class="fas fa-mouse-pointer"></i> 
                            <strong>OBLIGATORIO:</strong> Haz clic en tu "Perfil" para continuar (clic en el nombre de tu escuderia).
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
        
        // Mantener el botón minimizar que ya existe en el header
        const btnMinimizarExistente = header.querySelector('#btn-minimizar-tutorial');
        header.innerHTML = `
            <div id="tutorial-title-container" style="flex: 1;">
                <h2 style="color: ${paso.colorBoton}; margin: 0 0 5px 0; font-size: 1.5rem; font-weight: 600;">
                    ${paso.titulo}
                </h2>

            </div>
        `;
        
        // Si el botón minimizar existía, volver a agregarlo
        if (btnMinimizarExistente) {
            header.appendChild(btnMinimizarExistente);
        } else {
            // Si no existe, crearlo
            const nuevoBtn = document.createElement('button');
            nuevoBtn.id = 'btn-minimizar-tutorial';
            nuevoBtn.style.cssText = `
                background: rgba(0, 210, 190, 0.25);
                border: 2px solid #00d2be;
                color: #00d2be;
                padding: 8px 18px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.95rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s;
                box-shadow: 0 0 15px rgba(0, 210, 190, 0.3);
                margin-left: 20px;
            `;
            nuevoBtn.innerHTML = '<i class="fas fa-window-minimize"></i> Minimizar';
            header.appendChild(nuevoBtn);
        }
        
        // Volver a configurar el evento minimizar
        this.configurarMinimizar();
        
        // Actualizar contenido
        content.innerHTML = paso.contenido;
        
        // Actualizar footer
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
            }
        }
        
        // Configurar verificación de clic si es necesario
        if (paso.obligarClick) {
            this.configurarVerificacionClic(paso.obligarClick, numeroPaso);
        }
        


    
    // Actualizar el indicador de paso
    const pasoActualSpan = document.getElementById('paso-actual-num');
    const pasoTotaltSpan = document.getElementById('paso-total-num');
    if (pasoActualSpan) pasoActualSpan.textContent = numeroPaso + 1;
    if (pasoTotaltSpan) pasoTotaltSpan.textContent = this.totalPasos;
        

        
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
    // ========================
    // FINALIZAR TUTORIAL COMPLETO (CORREGIDO)
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
                // SOLO actualizar tutorial_completado, sin updated_at
                const { error } = await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ tutorial_completado: true })
                    .eq('id', this.f1Manager.escuderia.id);
                
                if (error) {
                    console.error('❌ Error actualizando tutorial en BD:', error);
                } else {
                    console.log('✅ Tutorial marcado como completado en BD');
                }
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
