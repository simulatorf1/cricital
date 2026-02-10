// ========================
// F1 MANAGER - TUTORIAL.JS (VERSIÓN CORREGIDA)
// ========================
console.log('📚 Tutorial cargado - Versión Modal Mejorada');

class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.overlay = null;
        this.modal = null;
        this.tutorialKey = 'f1_tutorial_completado'; // Clave por defecto
        this.onTutorialComplete = null; // ← AÑADE ESTA LÍNEA
    }

    // ========================
    // INICIAR TUTORIAL
    // ========================
    async iniciar() {
        console.log('🔍 Verificando estado del tutorial...');

        // Si no hay escudería, continuar sin tutorial
        if (!this.f1Manager.escuderia) {
            console.warn('⚠️ No hay escudería disponible, saltando tutorial');
            this.continuarCargaJuego();
            return;
        }
        
        // Esperar a que la escudería esté disponible
        await this.esperarEscuderia();
        
        // Crear clave específica para esta escudería
        if (this.f1Manager.escuderia && this.f1Manager.escuderia.id) {
            this.tutorialKey = `f1_tutorial_completado_${this.f1Manager.escuderia.id}`;
            console.log('🔑 Clave tutorial específica:', this.tutorialKey);
        } else {
            console.log('⚠️ No hay ID de escudería, usando clave genérica');
        }
        
        // 1. Primero verificar en la base de datos
        const necesitaTutorialBD = await this.verificarNecesitaTutorial();
        
        if (!necesitaTutorial) {
            console.log('✅ Tutorial ya completado en BD, sincronizando...');
            localStorage.setItem(this.tutorialKey, 'true');
            this.continuarCarga(); // ← CAMBIA por esto
            return;
        }
        
        // 2. Verificar localStorage (con clave específica)
        const tutorialCompletadoLocal = localStorage.getItem(this.tutorialKey);
        
        if (tutorialCompletadoLocal === 'true') {
            console.log('✅ Tutorial ya completado en localStorage, saltando...');
            this.continuarCarga(); // ← CAMBIA por esto en lugar de return;
            return;
        }
            console.log('🎯 Mostrando tutorial de todas formas para sincronizar...');
        } else {
            console.log('🎯 Mostrando tutorial...');
        }
        
        // Mostrar modal de bienvenida
        this.mostrarModalBienvenida();
    }

    // ========================
    // ESPERAR ESCUDERÍA
    // ========================
    esperarEscuderia() {
        return new Promise((resolve) => {
            let intentos = 0;
            const maxIntentos = 10;
            
            const verificar = () => {
                intentos++;
                
                if (this.f1Manager.escuderia) {
                    console.log('✅ Escudería disponible:', this.f1Manager.escuderia.nombre);
                    resolve();
                } else if (intentos >= maxIntentos) {
                    console.warn('⚠️ Timeout esperando escudería, continuando sin ella');
                    resolve();
                } else {
                    console.log(`⏳ Esperando escudería... (${intentos}/${maxIntentos})`);
                    setTimeout(verificar, 100);
                }
            };
            
            verificar();
        });
    }

    // ========================
    // VERIFICAR SI NECESITA TUTORIAL
    // ========================
    async verificarNecesitaTutorial() {
        try {
            // Si no hay conexión a Supabase o no hay escudería, asumir que necesita tutorial
            if (!this.f1Manager.supabase || !this.f1Manager.escuderia) {
                console.log('⚠️ No hay conexión o escudería, asumiendo que necesita tutorial');
                return true;
            }
            
            console.log('🔍 Consultando BD para escudería:', this.f1Manager.escuderia.id);
            
            // Consultar la base de datos directamente
            const { data, error } = await this.f1Manager.supabase
                .from('escuderias')
                .select('tutorial_completado, nombre')
                .eq('id', this.f1Manager.escuderia.id)
                .single();
            
            if (error) {
                console.error('❌ Error consultando estado del tutorial:', error);
                return true; // Si hay error, mostrar tutorial por seguridad
            }
            
            console.log('📊 Estado tutorial en BD:', {
                nombre: data.nombre,
                tutorial_completado: data.tutorial_completado
            });
            
            // Si es null o false, necesita tutorial
            const necesita = !data.tutorial_completado;
            console.log(necesita ? '🎯 Necesita tutorial' : '✅ No necesita tutorial');
            
            return necesita;
            
        } catch (error) {
            console.error('❌ Error en verificarNecesitaTutorial:', error);
            return true; // Por defecto, mostrar tutorial
        }
    }

    // ========================
    // MOSTRAR MODAL DE BIENVENIDA
    // ========================
    mostrarModalBienvenida() {
        // Crear overlay (solo para bloqueo parcial)
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            pointer-events: none; /* Permite clics a través del overlay */
        `;
        
        // Crear modal en la mitad inferior
        this.modal = document.createElement('div');
        this.modal.id = 'tutorial-modal';
        this.modal.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 800px;
            height: 50vh; /* Mitad de la pantalla */
            min-height: 400px;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%);
            backdrop-filter: blur(10px); /* Efecto de desenfoque para ver el fondo */
            border-radius: 20px 20px 0 0;
            border: 2px solid #00d2be;
            border-bottom: none;
            box-shadow: 0 -10px 40px rgba(0, 210, 190, 0.3);
            overflow: hidden;
            z-index: 9999;
            font-family: 'Roboto', sans-serif;
            color: white;
            transition: all 0.4s ease;
            display: flex;
            flex-direction: column;
        `;
        
        // Obtener nombre de escudería (con valor por defecto)
        const nombreEscuderia = this.f1Manager.escuderia?.nombre || "tu escudería";
        const idEscuderia = this.f1Manager.escuderia?.id ? 
            this.f1Manager.escuderia.id.substring(0, 8) : 'nueva';
        
        // Contenido del modal
        this.modal.innerHTML = `
            <!-- Cabecera con botón de cerrar -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; background: rgba(0, 210, 190, 0.1); border-bottom: 1px solid rgba(0, 210, 190, 0.3);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="color: #00d2be; font-size: 1.5rem;">🏎️</div>
                    <div style="font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: bold;">
                        TUTORIAL F1 MANAGER
                    </div>
                </div>
                
                <!-- Botón pequeño de salir -->
                <button id="btn-salir-tutorial" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: #aaa;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                ">
                    <span>✕</span>
                    <span>Salir</span>
                </button>
            </div>
            
            <!-- Contenido desplazable -->
            <div style="flex: 1; overflow-y: auto; padding: 25px;">
                <!-- Encabezado principal -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: white; margin: 0; font-size: 1.8rem; font-family: 'Orbitron', sans-serif; margin-bottom: 5px;">
                        ¡BIENVENIDO A F1 MANAGER!
                    </h1>
                    <p style="color: #00d2be; margin: 0; font-size: 1rem;">
                        Eres el nuevo director de <strong>${nombreEscuderia}</strong>
                    </p>
                </div>
                
                <!-- Sección de fondos -->
                <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #00d2be;">
                    <div style="display: flex; align-items: center; gap: 10px; color: #00d2be;">
                        <span style="font-size: 1.5rem;">💰</span>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">FONDOS INICIALES</div>
                            <div style="font-size: 1.5rem; font-weight: bold;">5,000,000€</div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de misión -->
                <div style="margin: 25px 0;">
                    <div style="color: #FFD700; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">🎯</span>
                        <span style="font-size: 1.1rem;">TU MISIÓN</span>
                    </div>
                    <ul style="margin: 0; padding-left: 20px; color: #ccc; line-height: 1.8;">
                        <li style="margin-bottom: 10px;">Gestionar tu escudería en <strong style="color: #00d2be">11 áreas técnicas</strong></li>
                        <li style="margin-bottom: 10px;">Contratar <strong style="color: #00d2be">estrategas especializados</strong></li>
                        <li style="margin-bottom: 10px;">Hacer <strong style="color: #00d2be">pronósticos</strong> sobre carreras reales</li>
                        <li style="margin-bottom: 10px;">Competir para ser el <strong style="color: #00d2be">mejor estratega del mundo</strong></li>
                    </ul>
                </div>
                
                <!-- Instrucción de interacción -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-top: 20px; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #00d2be; margin-bottom: 10px;">
                        <span>💡</span>
                        <div style="font-weight: bold;">Puedes interactuar con la aplicación detrás</div>
                    </div>
                    <p style="color: #aaa; font-size: 0.9rem; margin: 0;">
                        El tutorial permanece abierto. Haz clic fuera o usa el botón "Salir" para cerrarlo.
                    </p>
                </div>
            </div>
            
            <!-- Pie con botón principal -->
            <div style="padding: 20px 25px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(0, 210, 190, 0.2); text-align: center;">
                <button id="btn-comenzar-modal" style="
                    background: linear-gradient(135deg, #00d2be, #007c6e);
                    color: white;
                    border: none;
                    padding: 15px 50px;
                    border-radius: 10px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: inline-flex;
                    align-items: center;
                    gap: 15px;
                    width: 100%;
                    justify-content: center;
                ">
                    <span>¡EMPEZAR A COMPETIR!</span>
                    <span style="font-size: 1.3rem;">🏁</span>
                </button>
                
                <div style="color: #666; font-size: 0.8rem; margin-top: 10px;">
                    Cierra el tutorial para guardar tu progreso
                </div>
            </div>
        `;
        
        // Agregar estilos personalizados
        const style = document.createElement('style');
        style.textContent = `
            #btn-comenzar-modal:hover {
                background: linear-gradient(135deg, #00e6cf, #008f7e) !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0, 210, 190, 0.5);
            }
            
            #btn-comenzar-modal:active {
                transform: translateY(0px);
            }
            
            #btn-salir-tutorial:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                color: white !important;
                border-color: rgba(255, 255, 255, 0.3) !important;
            }
            
            #tutorial-modal > div:nth-child(2)::-webkit-scrollbar {
                width: 6px;
            }
            
            #tutorial-modal > div:nth-child(2)::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }
            
            #tutorial-modal > div:nth-child(2)::-webkit-scrollbar-thumb {
                background: #00d2be;
                border-radius: 10px;
            }
            
            /* Animación de entrada */
            @keyframes slideUp {
                from {
                    transform: translate(-50%, 100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
            
            #tutorial-modal {
                animation: slideUp 0.5s ease forwards;
            }
            
            /* Efecto de borde brillante */
            #tutorial-modal::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #00d2be, transparent);
                animation: borderPulse 3s infinite;
            }
            
            @keyframes borderPulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }
        `;
        
        // Agregar todo al DOM
        document.head.appendChild(style);
        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);
        
        // Configurar evento del botón principal
        document.getElementById('btn-comenzar-modal').onclick = () => {
            console.log('🎯 Botón "Comenzar" clickeado');
            this.finalizar();
        };
        
        // Configurar evento del botón de salir
        document.getElementById('btn-salir-tutorial').onclick = () => {
            console.log('⏭️ Botón "Salir" clickeado');
            this.finalizar();
        };
    }

    // ========================
    // CERRAR MODAL
    // ========================
    cerrarModal() {
        if (this.modal) {
            // Animación de salida
            this.modal.style.transform = 'translate(-50%, 100%)';
            this.modal.style.opacity = '0';
            
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.remove();
                }
                this.overlay = null;
                this.modal = null;
            }, 400);
        }
    }
    // ========================
    // CONTINUAR CARGA DESPUÉS DEL TUTORIAL
    // ========================
    continuarCarga() {
        console.log('🚀 Continuando carga después del tutorial...');
        
        // Opción 1: Usar el método que ya existía
        if (this.f1Manager.cargarDashboardCompleto) {
            console.log('📊 Llamando a cargarDashboardCompleto()');
            setTimeout(() => this.f1Manager.cargarDashboardCompleto(), 100);
        }
        // Opción 2: Método alternativo
        else if (this.f1Manager.inicializarSistemasIntegrados) {
            console.log('🔧 Llamando a inicializarSistemasIntegrados()');
            setTimeout(() => this.f1Manager.inicializarSistemasIntegrados(), 100);
        }
        // Opción 3: Método principal
        else if (this.f1Manager.iniciarJuego) {
            console.log('🎮 Llamando a iniciarJuego()');
            setTimeout(() => this.f1Manager.iniciarJuego(), 100);
        }
        // Opción 4: Función global
        else if (window.cargarJuegoPrincipal) {
            console.log('🌍 Llamando a cargarJuegoPrincipal()');
            setTimeout(() => window.cargarJuegoPrincipal(), 100);
        }
        // Último recurso: recargar
        else {
            console.warn('⚠️ No se encontró método para continuar, recargando...');
            setTimeout(() => location.reload(), 1000);
        }
    }
    // ========================
    // FINALIZAR TUTORIAL
    // ========================
    async finalizar() {
        console.log('✅ Finalizando tutorial...');
        
        // Guardar estado
        localStorage.setItem(this.tutorialKey, 'true');
        
        // Actualizar BD si es necesario
        if (this.f1Manager.escuderia && this.f1Manager.supabase) {
            try {
                await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ tutorial_completado: true })
                    .eq('id', this.f1Manager.escuderia.id);
            } catch (error) {
                console.error('❌ Error:', error);
            }
        }
        
        // Cerrar modal
        this.cerrarModal();
        
        // ⬇️⬇️⬇️ ESTA ES LA PARTE IMPORTANTE ⬇️⬇️⬇️
        // Esperar un poco para que se cierre el modal y luego continuar
        setTimeout(() => {
            this.continuarCarga(); // ← LLAMA AL MÉTODO NUEVO
        }, 300);
        
        // Notificación opcional
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification('🎉 ¡Bienvenido a F1 Manager!', 'success');
            }
        }, 500);
    }
    
    // ========================
    // INTENTAR CARGAR EL JUEGO
    // ========================
    async intentarCargarJuego() {
        console.log('🚀 Intentando cargar juego después del tutorial...');
        
        // Opción 1: Si tu F1Manager tiene un método para iniciar el juego
        if (this.f1Manager.iniciarJuego) {
            console.log('🎮 Llamando a f1Manager.iniciarJuego()');
            this.f1Manager.iniciarJuego();
        }
        // Opción 2: Si tiene un método para cargar el dashboard
        else if (this.f1Manager.cargarDashboardCompleto) {
            console.log('📊 Llamando a f1Manager.cargarDashboardCompleto()');
            await this.f1Manager.cargarDashboardCompleto();
        }
        // Opción 3: Si tiene un método para inicializar sistemas
        else if (this.f1Manager.inicializarSistemasIntegrados) {
            console.log('🔧 Llamando a f1Manager.inicializarSistemasIntegrados()');
            await this.f1Manager.inicializarSistemasIntegrados();
        }
        // Opción 4: Si el juego ya está cargado, solo ocultar el tutorial
        else {
            console.log('✅ Tutorial cerrado, aplicación principal visible');
            
            // Verificar si hay una función global para cargar el juego
            if (window.cargarJuegoPrincipal) {
                window.cargarJuegoPrincipal();
            } else if (window.iniciarAplicacion) {
                window.iniciarAplicacion();
            } else {
                console.log('⚠️ No se encontró método específico, recargando página...');
                location.reload();
            }
        }
    }
    // ========================
    // CONTINUAR CARGA DEL JUEGO
    // ========================
    continuarCargaJuego() {
        console.log('🚀 Continuando carga del juego...');
        
        // Si hay un callback específico, usarlo
        if (this.onTutorialComplete && typeof this.onTutorialComplete === 'function') {
            this.onTutorialComplete();
            return;
        }
        
        // Intentar métodos del F1Manager
        if (this.f1Manager.continuarInicializacion) {
            this.f1Manager.continuarInicializacion();
        } 
        else if (this.f1Manager.cargarDashboard) {
            this.f1Manager.cargarDashboard();
        }
        else if (this.f1Manager.iniciarJuego) {
            this.f1Manager.iniciarJuego();
        }
        // Si nada funciona, forzar recarga
        else {
            console.warn('⚠️ No se encontró método para continuar, recargando...');
            setTimeout(() => location.reload(), 1000);
        }
    }

    

    // ========================
    // REINICIAR TUTORIAL (para debugging)
    // ========================
    reiniciar() {
        console.log('🔄 Reiniciando tutorial...');
        
        // Limpiar localStorage
        localStorage.removeItem(this.tutorialKey);
        localStorage.removeItem('f1_tutorial_completado');
        
        // Cerrar modal si está abierto
        this.cerrarModal();
        
        // Mostrar tutorial de nuevo
        setTimeout(() => {
            this.mostrarModalBienvenida();
        }, 300);
        
        console.log('✅ Tutorial reiniciado');
    }
}

console.log('✅ Tutorial.js cargado correctamente (Modal Mejorado)');
