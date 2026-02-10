// ========================
// F1 MANAGER - TUTORIAL.JS
// ========================
console.log('📚 Tutorial cargado');

class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.pasoActual = 0;
        this.totalPasos = 2;
        this.ventanaTutorial = null;
    }

    // ========================
    // INICIAR TUTORIAL
    // ========================
    iniciar() {
        // Verificar si ya completó el tutorial
        const tutorialCompletado = localStorage.getItem('f1_tutorial_completado');
        
        if (tutorialCompletado === 'true') {
            // No mostrar nada, ya completó
            console.log('✅ Tutorial ya completado, omitiendo...');
            return;
        }
        
        // Mostrar primer paso del tutorial
        setTimeout(() => {
            this.mostrarPaso(0);
        }, 1000);
    }

    // ========================
    // MOSTRAR PASO DEL TUTORIAL
    // ========================
    mostrarPaso(numeroPaso) {
        this.pasoActual = numeroPaso;
        
        // Si no existe la ventana, crearla
        if (!this. || !document.getElementById('tutorial-ventana-flotante')) {
            this.crearVentanaBase();
        }
        
        // Actualizar el contenido según el paso
        this.actualizarContenidoPaso(numeroPaso);
    }

    // ========================
    // CREAR VENTANA BASE
    // ========================
    crearVentanaBase() {
        // 1. Crear ventana flotante
        this. = document.createElement('div');
        this..id = 'tutorial-ventana-flotante';
        this..style.cssText = `
            position: fixed;
            bottom: 15vh;
            right: 20px;
            left: 20px;
            background: rgba(10, 15, 30, 0.95);
            border: 3px solid #00d2be;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 0 30px rgba(0, 210, 190, 0.4);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 999998;
            max-width: 500px;
            margin: 0 auto;
            max-height: 45vh;
            overflow-y: auto;
        `;
        
        // Contenido base que se actualizará
        this..innerHTML = `
            <div id="tutorial-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <!-- Título y paso se actualizarán -->
            </div>
            
            <div id="tutorial-content" style="margin: 15px 0; line-height: 1.6;">
                <!-- Contenido del paso -->
            </div>
            
            <div id="tutorial-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <!-- Botones se actualizarán -->
            </div>
            
            <div id="tutorial-pagination" style="display: flex; justify-content: center; margin-top: 15px;">
                <!-- Puntos de paginación -->
            </div>
        `;
        
        document.body.appendChild(this.ventanaTutorial);
        this.configurarMinimizar();
    }

    // ========================
    // ACTUALIZAR CONTENIDO DEL PASO
    // ========================
// ========================
// CREAR VENTANA BASE
// ========================
crearVentanaBase() {
    // 1. Crear ventana flotante
    this.ventanaTutorial = document.createElement('div');
    this.ventanaTutorial.id = 'tutorial-ventana-flotante';
    this.ventanaTutorial.style.cssText = `
        position: fixed;
        bottom: 15vh;
        right: 20px;
        left: 20px;
        background: white;
        border: 4px solid #FF3366;
        border-radius: 20px;
        padding: 25px;
        box-shadow: 
            0 0 40px rgba(255, 51, 102, 0.6),
            0 0 80px rgba(255, 51, 102, 0.3),
            0 0 120px rgba(255, 51, 102, 0.15),
            0 10px 30px rgba(0, 0, 0, 0.3);
        color: #222;
        font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        z-index: 999999;
        max-width: 550px;
        margin: 0 auto;
        max-height: 50vh;
        overflow-y: auto;
        animation: pulse-glow 2s infinite alternate;
    `;
    
    // Añadir estilo para la animación de resplandor
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-glow {
            0% {
                box-shadow: 
                    0 0 30px rgba(255, 51, 102, 0.4),
                    0 0 60px rgba(255, 51, 102, 0.2),
                    0 0 90px rgba(255, 51, 102, 0.1),
                    0 10px 30px rgba(0, 0, 0, 0.3);
                border-color: #FF3366;
            }
            100% {
                box-shadow: 
                    0 0 50px rgba(255, 51, 102, 0.8),
                    0 0 100px rgba(255, 51, 102, 0.4),
                    0 0 150px rgba(255, 51, 102, 0.2),
                    0 15px 40px rgba(0, 0, 0, 0.4);
                border-color: #FF0066;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Contenido base que se actualizará
    this.ventanaTutorial.innerHTML = `
        <div id="tutorial-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <!-- Título y paso se actualizarán -->
        </div>
        
        <div id="tutorial-content" style="margin: 20px 0; line-height: 1.7; font-size: 1rem;">
            <!-- Contenido del paso -->
        </div>
        
        <div id="tutorial-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
            <!-- Botones se actualizarán -->
        </div>
        
        <div id="tutorial-pagination" style="display: flex; justify-content: center; margin-top: 20px;">
            <!-- Puntos de paginación -->
        </div>
    `;
    
    document.body.appendChild(this.ventanaTutorial);
    this.configurarMinimizar();
}

    // ========================
    // ACTUALIZAR CONTENIDO DEL PASO
    // ========================
    actualizarContenidoPaso(numeroPaso) {
        const header = this.ventanaTutorial.querySelector('#tutorial-header');
        const content = this.ventanaTutorial.querySelector('#tutorial-content');
        const footer = this.ventanaTutorial.querySelector('#tutorial-footer');
        const pagination = this.ventanaTutorial.querySelector('#tutorial-pagination');
        
        if (numeroPaso === 0) {
            // PASO 1: Pantalla de bienvenida
            header.innerHTML = `
                <div>
                    <h2 style="color: #FF3366; margin: 0; font-size: 1.4rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-graduation-cap" style="margin-right: 10px;"></i>
                        🏁 TUTORIAL - Paso 1/2
                    </h2>
                    <div style="color: #666; font-size: 0.9rem; margin-top: 8px; font-weight: 500;">
                        ⚡ ¡Atención! Guía importante para empezar
                    </div>
                </div>
                <button id="btn-minimizar-tutorial" style="
                    background: white;
                    border: 2px solid #FF3366;
                    color: #FF3366;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.1rem;
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(255, 51, 102, 0.3);
                    transition: all 0.3s;
                ">
                    _
                </button>
            `;
            
            content.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(255, 51, 102, 0.1) 0%, rgba(255, 153, 51, 0.1) 100%); 
                        padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(255, 51, 102, 0.3);">
                    <p style="margin: 0 0 12px 0; font-weight: 800; color: #FF3366; font-size: 1.1rem;">
                        🚀 ¡BIENVENIDO A F1 MANAGER!
                    </p>
                    <p style="margin: 0; font-size: 1rem; line-height: 1.6;">
                        Eres el director de <strong style="color: #FF3366;">${this.f1Manager.escuderia?.nombre || "tu equipo"}</strong>.
                        Tienes <strong style="color: #FF9900; text-shadow: 0 2px 4px rgba(255, 153, 0, 0.3);">5,000,000€</strong> para empezar tu aventura.
                    </p>
                </div>
                
                <p style="font-size: 1rem; margin-bottom: 18px; color: #333; font-weight: 600;">
                    <span style="color: #FF3366; margin-right: 8px;">🎯</span>
                    <strong style="color: #222;">Tu objetivo:</strong> Convertirte en el mejor estratega de la F1
                </p>
                
                <div style="background: linear-gradient(135deg, rgba(255, 153, 0, 0.15) 0%, rgba(255, 204, 0, 0.15) 100%); 
                        padding: 16px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF9900;
                        box-shadow: 0 5px 20px rgba(255, 153, 0, 0.1);">
                    <p style="margin: 0; font-size: 0.95rem; color: #CC6600; font-weight: 600;">
                        <i class="fas fa-bolt" style="margin-right: 10px; color: #FF9900;"></i> 
                        <strong>¡Explora el juego!</strong> Puedes hacer clic en cualquier parte mientras lees los pasos.
                    </p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 20px; padding: 15px; 
                        background: rgba(255, 51, 102, 0.05); border-radius: 10px; border: 1px dashed #FF3366;">
                    <i class="fas fa-exclamation-triangle" style="color: #FF3366; font-size: 1.2rem;"></i>
                    <span style="color: #666; font-size: 0.9rem;">
                        <strong>Importante:</strong> No cierres esta ventana hasta completar el tutorial
                    </span>
                </div>
            `;
            
            footer.innerHTML = `
                <div style="color: #888; font-size: 0.85rem; font-weight: 500;">
                    <i class="fas fa-arrow-right" style="margin-right: 8px;"></i> 
                    Siguiente: Funcionalidades principales
                </div>
                <button id="btn-siguiente-paso" style="
                    background: linear-gradient(135deg, #FF3366 0%, #FF0066 100%);
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 6px 20px rgba(255, 51, 102, 0.4);
                    transition: all 0.3s;
                ">
                    Siguiente Paso
                    <i class="fas fa-arrow-right"></i>
                </button>
            `;
            
            // Configurar botón siguiente
            const btnSiguiente = footer.querySelector('#btn-siguiente-paso');
            btnSiguiente.onmouseenter = () => {
                btnSiguiente.style.transform = 'translateY(-3px)';
                btnSiguiente.style.boxShadow = '0 10px 25px rgba(255, 51, 102, 0.6)';
            };
            btnSiguiente.onmouseleave = () => {
                btnSiguiente.style.transform = 'translateY(0)';
                btnSiguiente.style.boxShadow = '0 6px 20px rgba(255, 51, 102, 0.4)';
            };
            btnSiguiente.onclick = () => {
                this.mostrarPaso(1);
            };
            
        } else if (numeroPaso === 1) {
            // PASO 2: Pantalla final
            header.innerHTML = `
                <div>
                    <h2 style="color: #FF9900; margin: 0; font-size: 1.4rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-flag-checkered" style="margin-right: 10px;"></i>
                        🏆 TUTORIAL - Paso 2/2
                    </h2>
                    <div style="color: #666; font-size: 0.9rem; margin-top: 8px; font-weight: 500;">
                        🎉 ¡Estás listo para comenzar!
                    </div>
                </div>
                <button id="btn-minimizar-tutorial" style="
                    background: white;
                    border: 2px solid #FF9900;
                    color: #FF9900;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.1rem;
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
                    transition: all 0.3s;
                ">
                    _
                </button>
            `;
            
            content.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(255, 153, 0, 0.15) 0%, rgba(255, 204, 51, 0.15) 100%); 
                        padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(255, 153, 0, 0.3);">
                    <p style="margin: 0 0 12px 0; font-weight: 800; color: #CC6600; font-size: 1.1rem;">
                        🎯 ¡TODO LISTO PARA LA ACCIÓN!
                    </p>
                    <p style="margin: 0; font-size: 1rem; line-height: 1.6;">
                        Has completado el tutorial básico. Ahora puedes comenzar tu aventura:
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                    <div style="background: rgba(255, 51, 102, 0.08); padding: 15px; border-radius: 10px; border: 2px solid rgba(255, 51, 102, 0.2);">
                        <i class="fas fa-user-tie" style="color: #FF3366; font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
                        <strong style="color: #222;">Contratar personal</strong>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 5px;">Menú "Personal"</div>
                    </div>
                    
                    <div style="background: rgba(0, 180, 216, 0.08); padding: 15px; border-radius: 10px; border: 2px solid rgba(0, 180, 216, 0.2);">
                        <i class="fas fa-car" style="color: #00B4D8; font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
                        <strong style="color: #222;">Mejorar tu auto</strong>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 5px;">Menú "Desarrollo"</div>
                    </div>
                    
                    <div style="background: rgba(72, 187, 120, 0.08); padding: 15px; border-radius: 10px; border: 2px solid rgba(72, 187, 120, 0.2);">
                        <i class="fas fa-calendar-alt" style="color: #48BB78; font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
                        <strong style="color: #222;">Planificar carreras</strong>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 5px;">Menú "Calendario"</div>
                    </div>
                    
                    <div style="background: rgba(159, 122, 234, 0.08); padding: 15px; border-radius: 10px; border: 2px solid rgba(159, 122, 234, 0.2);">
                        <i class="fas fa-chart-line" style="color: #9F7AEA; font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
                        <strong style="color: #222;">Ver estadísticas</strong>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 5px;">Menú "Informes"</div>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255, 51, 102, 0.1) 0%, rgba(255, 153, 51, 0.1) 100%); 
                        padding: 16px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #FF3366;
                        box-shadow: 0 5px 20px rgba(255, 51, 102, 0.1);">
                    <p style="margin: 0; font-size: 0.95rem; color: #FF3366; font-weight: 700;">
                        <i class="fas fa-star" style="margin-right: 10px;"></i> 
                        <strong>¡RECUERDA!</strong> Tu presupuesto inicial es 5,000,000€. Gástalo sabiamente para tener éxito.
                    </p>
                </div>
            `;
            
            footer.innerHTML = `
                <div style="color: #888; font-size: 0.85rem; font-weight: 500;">
                    <i class="fas fa-graduation-cap" style="margin-right: 8px;"></i> 
                    Tutorial básico completado
                </div>
                <button id="btn-finalizar-tutorial" style="
                    background: linear-gradient(135deg, #FF9900 0%, #FF6600 100%);
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    box-shadow: 0 8px 25px rgba(255, 153, 0, 0.5);
                    transition: all 0.3s;
                ">
                    <i class="fas fa-play-circle" style="font-size: 1.2rem;"></i>
                    ¡COMENZAR JUEGO!
                </button>
            `;
            
            // Configurar botón finalizar
            const btnFinalizar = footer.querySelector('#btn-finalizar-tutorial');
            btnFinalizar.onmouseenter = () => {
                btnFinalizar.style.transform = 'translateY(-3px) scale(1.05)';
                btnFinalizar.style.boxShadow = '0 12px 30px rgba(255, 153, 0, 0.7)';
            };
            btnFinalizar.onmouseleave = () => {
                btnFinalizar.style.transform = 'translateY(0) scale(1)';
                btnFinalizar.style.boxShadow = '0 8px 25px rgba(255, 153, 0, 0.5)';
            };
            btnFinalizar.onclick = () => {
                this.finalizarTutorialCompleto();
            };
        }
        
        // Actualizar paginación
        pagination.innerHTML = '';
        for (let i = 0; i < this.totalPasos; i++) {
            const punto = document.createElement('div');
            punto.style.cssText = `
                width: 14px;
                height: 14px;
                background: ${i === numeroPaso ? 
                    (numeroPaso === 0 ? '#FF3366' : '#FF9900') : 
                    'rgba(200, 200, 200, 0.5)'};
                border-radius: 50%;
                margin: 0 6px;
                transition: all 0.3s;
                box-shadow: ${i === numeroPaso ? 
                    '0 0 15px ' + (numeroPaso === 0 ? 'rgba(255, 51, 102, 0.8)' : 'rgba(255, 153, 0, 0.8)') : 
                    'none'};
            `;
            pagination.appendChild(punto);
        }
        
        // Re-configurar minimizar
        this.configurarMinimizar();
    }

    // ========================
    // CONFIGURAR MINIMIZAR
    // ========================
    configurarMinimizar() {
        const btnMinimizar = this.ventanaTutorial.querySelector('#btn-minimizar-tutorial');
        if (!btnMinimizar) return;
        
        let estaMinimizado = false;
        const alturaOriginal = this.ventanaTutorial.offsetHeight;
        const alturaMinimizada = Math.max(40, Math.floor(alturaOriginal / 3));
        
        btnMinimizar.onclick = () => {
            if (estaMinimizado) {
                this.ventanaTutorial.style.transform = 'translateY(0)';
                this.ventanaTutorial.style.height = 'auto';
                this.ventanaTutorial.style.maxHeight = '45vh';
                this.ventanaTutorial.style.overflowY = 'auto';
                btnMinimizar.innerHTML = '_';
                estaMinimizado = false;
            } else {
                this.ventanaTutorial.style.transform = `translateY(calc(100% - ${alturaMinimizada}px))`;
                this.ventanaTutorial.style.height = `${alturaMinimizada}px`;
                this.ventanaTutorial.style.overflowY = 'hidden';
                btnMinimizar.innerHTML = '^';
                estaMinimizado = true;
            }
        };
    }

    // ========================
    // FINALIZAR TUTORIAL COMPLETO
    // ========================
    async finalizarTutorialCompleto() {
        console.log('✅ Finalizando tutorial completo...');
        
        // 1. REMOVER la ventana del tutorial
        if (this.ventanaTutorial) {
            this.ventanaTutorial.remove();
            this.ventanaTutorial = null;
        }
        
        // 2. Guardar en localStorage que ya completó
        localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
        localStorage.setItem('f1_tutorial_completado', 'true');
        
        // 3. ACTUALIZAR BASE DE DATOS
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
        
        // 4. Notificación de éxito
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification(
                    '🎉 ¡Tutorial completado! ¡Bienvenido a F1 Manager!',
                    'success'
                );
            }
        }, 300);
        
        // 5. Actualizar estado en el objeto f1Manager si existe
        if (this.f1Manager.escuderia) {
            this.f1Manager.escuderia.tutorial_completado = true;
        }
    }

}

console.log('✅ Tutorial.js cargado correctamente');
