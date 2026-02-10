// ========================
// F1 MANAGER - TUTORIAL.JS (VERSIÓN MODAL MEJORADA)
// ========================
console.log('📚 Tutorial cargado - Versión Modal Mejorada');

class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.overlay = null;
        this.modal = null;
    }

    // ========================
    // INICIAR TUTORIAL
    // ========================
    iniciar() {
        // Verificar si ya completó el tutorial
        const tutorialCompletado = localStorage.getItem('f1_tutorial_completado');
        
        if (tutorialCompletado === 'true') {
            console.log('✅ Tutorial ya completado, omitiendo...');
            return;
        }
        
        // Mostrar modal de bienvenida
        this.mostrarModalBienvenida();
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
                        Eres el nuevo director de <strong>${this.f1Manager.escuderia?.nombre || "tu escudería"}</strong>
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
            this.finalizar();
        };
        
        // Configurar evento del botón de salir
        document.getElementById('btn-salir-tutorial').onclick = () => {
            this.finalizar();
        };
        
        // NO cerrar al hacer clic fuera - permite interacción con la aplicación
        // Eliminamos el evento onclick del overlay para permitir interacción
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
    // FINALIZAR TUTORIAL
    // ========================
    async finalizar() {
        console.log('✅ Tutorial completado');
        
        // Guardar que se completó
        localStorage.setItem('f1_tutorial_completado', 'true');
        
        // Actualizar base de datos si existe
        if (this.f1Manager.escuderia && this.f1Manager.supabase) {
            try {
                await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ tutorial_completado: true })
                    .eq('id', this.f1Manager.escuderia.id);
            } catch (error) {
                console.error('Error actualizando tutorial:', error);
            }
        }
        
        // Cerrar el modal
        this.cerrarModal();
        
        // Intentar cargar el juego
        await this.intentarCargarJuego();
        
        // Mostrar notificación de bienvenida
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
        // Opción 1: Si tu F1Manager tiene un método para iniciar el juego
        if (this.f1Manager.iniciarJuego) {
            this.f1Manager.iniciarJuego();
        }
        // Opción 2: Si tiene un método para cargar el dashboard
        else if (this.f1Manager.cargarDashboardCompleto) {
            await this.f1Manager.cargarDashboardCompleto();
        }
        // Opción 3: Si tiene un método para inicializar sistemas
        else if (this.f1Manager.inicializarSistemasIntegrados) {
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
            }
            // Si nada funciona, no hacemos nada - la aplicación ya está visible
        }
    }

    // ========================
    // REABRIR TUTORIAL (OPCIONAL)
    // ========================
    reabrir() {
        // Eliminar el estado completado
        localStorage.removeItem('f1_tutorial_completado');
        
        // Si hay un modal abierto, cerrarlo primero
        this.cerrarModal();
        
        // Mostrar de nuevo
        setTimeout(() => {
            this.mostrarModalBienvenida();
        }, 300);
    }
}

console.log('✅ Tutorial.js cargado correctamente (Modal Mejorado)');
