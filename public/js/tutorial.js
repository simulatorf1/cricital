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
        if (!this.ventanaTutorial || !document.getElementById('tutorial-ventana-flotante')) {
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
        this.ventanaTutorial = document.createElement('div');
        this.ventanaTutorial.id = 'tutorial-ventana-flotante';
        this.ventanaTutorial.style.cssText = `
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
        this.ventanaTutorial.innerHTML = `
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
    actualizarContenidoPaso(numeroPaso) {
        const header = this.ventanaTutorial.querySelector('#tutorial-header');
        const content = this.ventanaTutorial.querySelector('#tutorial-content');
        const footer = this.ventanaTutorial.querySelector('#tutorial-footer');
        const pagination = this.ventanaTutorial.querySelector('#tutorial-pagination');
        
        if (numeroPaso === 0) {
            // PASO 1: Pantalla de bienvenida
            header.innerHTML = `
                <div>
                    <h2 style="color: #00d2be; margin: 0; font-size: 1.2rem;">
                        <i class="fas fa-graduation-cap" style="margin-right: 8px;"></i>
                        TUTORIAL - Paso 1/2
                    </h2>
                    <div style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">
                        Puedes explorar el juego mientras lees
                    </div>
                </div>
                <button id="btn-minimizar-tutorial" style="
                    background: rgba(0, 210, 190, 0.2);
                    border: 1px solid #00d2be;
                    color: #00d2be;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">
                    _
                </button>
            `;
            
            content.innerHTML = `
                <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                        🏎️ ¡BIENVENIDO A F1 MANAGER!
                    </p>
                    <p style="margin: 0; font-size: 0.95rem;">
                        Eres el director de <strong>${this.f1Manager.escuderia?.nombre || "tu equipo"}</strong>.
                        Tienes <strong style="color: #FFD700;">5,000,000€</strong> para empezar.
                    </p>
                </div>
                
                <p style="font-size: 0.95rem; margin-bottom: 15px;">
                    <strong>🎯 Tu objetivo:</strong> Convertirte en el mejor estratega.
                </p>
                
                <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                    <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                        <i class="fas fa-lightbulb"></i> 
                        <strong>Explora el juego:</strong> Puedes hacer clic en cualquier parte mientras lees los pasos.
                    </p>
                </div>
            `;
            
            footer.innerHTML = `
                <div style="color: #888; font-size: 0.8rem;">
                    <i class="fas fa-hand-pointer"></i> Siguiente: Funcionalidades principales
                </div>
                <button id="btn-siguiente-paso" style="
                    background: linear-gradient(135deg, #00d2be 0%, #009688 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    Siguiente Paso
                    <i class="fas fa-arrow-right"></i>
                </button>
            `;
            
            // Configurar botón siguiente
            footer.querySelector('#btn-siguiente-paso').onclick = () => {
                this.mostrarPaso(1);
            };
            
        } else if (numeroPaso === 1) {
            // PASO 2: Pantalla final
            header.innerHTML = `
                <div>
                    <h2 style="color: #FFD700; margin: 0; font-size: 1.2rem;">
                        <i class="fas fa-flag-checkered" style="margin-right: 8px;"></i>
                        TUTORIAL - Paso 2/2
                    </h2>
                    <div style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">
                        ¡Estás listo para comenzar!
                    </div>
                </div>
                <button id="btn-minimizar-tutorial" style="
                    background: rgba(255, 215, 0, 0.2);
                    border: 1px solid #FFD700;
                    color: #FFD700;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">
                    _
                </button>
            `;
            
            content.innerHTML = `
                <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #FFD700;">
                        🏁 ¡TODO LISTO!
                    </p>
                    <p style="margin: 0; font-size: 0.95rem;">
                        Has completado el tutorial básico. Ahora puedes:
                    </p>
                </div>
                
                <ul style="margin: 15px 0; padding-left: 20px; font-size: 0.95rem;">
                    <li style="margin-bottom: 8px;">
                        <i class="fas fa-user-tie" style="color: #00d2be; margin-right: 8px;"></i>
                        <strong>Contratar personal:</strong> Ve al menú "Personal"
                    </li>
                    <li style="margin-bottom: 8px;">
                        <i class="fas fa-car" style="color: #00d2be; margin-right: 8px;"></i>
                        <strong>Mejorar tu auto:</strong> Ve al menú "Desarrollo"
                    </li>
                    <li style="margin-bottom: 8px;">
                        <i class="fas fa-calendar-alt" style="color: #00d2be; margin-right: 8px;"></i>
                        <strong>Planificar carreras:</strong> Ve al menú "Calendario"
                    </li>
                    <li>
                        <i class="fas fa-chart-line" style="color: #00d2be; margin-right: 8px;"></i>
                        <strong>Ver estadísticas:</strong> Ve al menú "Informes"
                    </li>
                </ul>
                
                <div style="background: rgba(0, 210, 190, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #00d2be;">
                    <p style="margin: 0; font-size: 0.9rem; color: #00d2be;">
                        <i class="fas fa-star"></i> 
                        <strong>Recuerda:</strong> Tu presupuesto inicial es 5M€. Gástalo sabiamente.
                    </p>
                </div>
            `;
            
            footer.innerHTML = `
                <div style="color: #888; font-size: 0.8rem;">
                    <i class="fas fa-graduation-cap"></i> Tutorial básico
                </div>
                <button id="btn-finalizar-tutorial" style="
                    background: linear-gradient(135deg, #e10600 0%, #ff4444 100%);
                    color: white;
                    border: none;
                    padding: 10px 25px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                ">
                    <i class="fas fa-play-circle"></i>
                    ¡Comenzar Juego!
                </button>
            `;
            
            // Configurar botón finalizar
            footer.querySelector('#btn-finalizar-tutorial').onclick = () => {
                this.finalizarTutorialCompleto();
            };
        }
        
        // Actualizar paginación
        pagination.innerHTML = '';
        for (let i = 0; i < this.totalPasos; i++) {
            const punto = document.createElement('div');
            punto.style.cssText = `
                width: 10px;
                height: 10px;
                background: ${i === numeroPaso ? '#00d2be' : 'rgba(0, 210, 190, 0.3)'};
                border-radius: 50%;
                margin: 0 4px;
                transition: background 0.3s;
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
