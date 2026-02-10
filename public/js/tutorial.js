// ========================
// F1 MANAGER - TUTORIAL.JS (VERSIÓN MODAL)
// ========================
console.log('📚 Tutorial cargado - Versión Modal');

class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
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
        // Crear overlay (fondo semitransparente)
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'tutorial-modal';
        modal.style.cssText = `
            position: relative;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
            border-radius: 12px;
            border: 2px solid #00d2be;
            box-shadow: 0 10px 40px rgba(0, 210, 190, 0.3);
            overflow-y: auto;
            z-index: 9999;
            font-family: 'Roboto', sans-serif;
            color: white;
        `;
        
        // Contenido del modal
        modal.innerHTML = `
            <div style="padding: 25px;">
                <!-- Encabezado -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="color: #00d2be; font-size: 2.5rem; margin-bottom: 10px;">🏎️</div>
                    <h1 style="color: white; margin: 0; font-size: 1.5rem; font-family: 'Orbitron', sans-serif;">
                        ¡BIENVENIDO A F1 MANAGER!
                    </h1>
                </div>
                
                <!-- Contenido -->
                <div style="margin-bottom: 25px; line-height: 1.6;">
                    <p>Eres el nuevo director de <strong style="color: #00d2be">${this.f1Manager.escuderia?.nombre || "tu escudería"}</strong>.</p>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #00d2be;">
                        <div style="display: flex; align-items: center; gap: 10px; color: #00d2be;">
                            <span style="font-size: 1.2rem;">💰</span>
                            <div>
                                <div style="font-weight: bold; font-size: 0.9rem;">FONDOS INICIALES</div>
                                <div style="font-size: 1.3rem; font-weight: bold;">5,000,000€</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <span>🎯</span> <span>TU MISIÓN</span>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc;">
                            <li>Gestionar tu escudería en <strong>11 áreas técnicas</strong></li>
                            <li>Contratar <strong>estrategas especializados</strong></li>
                            <li>Hacer <strong>pronósticos</strong> sobre carreras reales</li>
                            <li>Competir para ser el <strong>mejor estratega del mundo</strong></li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; color: #aaa; font-size: 0.9rem; margin-top: 20px;">
                        ¡Pulsa el botón para comenzar tu aventura!
                    </div>
                </div>
                
                <!-- Botón -->
                <div style="text-align: center;">
                    <button id="btn-comenzar-modal" style="
                        background: linear-gradient(135deg, #00d2be, #007c6e);
                        color: white;
                        border: none;
                        padding: 14px 40px;
                        border-radius: 8px;
                        font-family: 'Orbitron', sans-serif;
                        font-weight: bold;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s;
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        <span>¡EMPEZAR A COMPETIR!</span>
                        <span style="font-size: 1.2rem;">🏁</span>
                    </button>
                    
                    <div style="color: #666; font-size: 0.8rem; margin-top: 15px;">
                        Este mensaje solo aparece una vez
                    </div>
                </div>
            </div>
        `;
        
        // Agregar estilos para hover del botón
        const style = document.createElement('style');
        style.textContent = `
            #btn-comenzar-modal:hover {
                background: linear-gradient(135deg, #00e6cf, #008f7e) !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 210, 190, 0.4);
            }
            
            #btn-comenzar-modal:active {
                transform: translateY(0px);
            }
            
            #tutorial-modal::-webkit-scrollbar {
                width: 8px;
            }
            
            #tutorial-modal::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }
            
            #tutorial-modal::-webkit-scrollbar-thumb {
                background: #00d2be;
                border-radius: 10px;
            }
        `;
        
        // Agregar todo al DOM
        document.head.appendChild(style);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Configurar evento del botón
        document.getElementById('btn-comenzar-modal').onclick = () => {
            this.finalizar();
            this.cerrarModal();
        };
        
        // Opcional: Cerrar al hacer clic fuera del modal
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.finalizar();
                this.cerrarModal();
            }
        };
    }

    // ========================
    // CERRAR MODAL
    // ========================
    cerrarModal() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.remove();
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
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification('🎉 ¡Bienvenido a F1 Manager!', 'success');
            }
        }, 500);
    }
}

console.log('✅ Tutorial.js cargado correctamente (Modal)');
