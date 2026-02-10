// ========================
// F1 MANAGER - TUTORIAL.JS
// ========================
console.log('📚 Tutorial cargado');

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
            // No mostrar nada, ya completó
            console.log('✅ Tutorial ya completado, omitiendo...');
            return;
        }
        
        // Mostrar única pantalla de bienvenida
        this.mostrarPantallaUnica();
    }

    // ========================
    // MOSTRAR PANTALLA ÚNICA
    // ========================
    // ========================
    // MOSTRAR PANTALLA ÚNICA (VERSIÓN VENTANA FLOTANTE)
    // ========================
    mostrarPantallaUnica() {
        // 1. Asegurarnos de que el dashboard esté completamente cargado
        if (!document.getElementById('tab-principal')) {
            console.error('❌ Dashboard no cargado, esperando...');
            setTimeout(() => this.mostrarPantallaUnica(), 500);
            return;
        }
    
        // 2. Crear ventana flotante en la parte inferior (NO overlay completo)
        const ventanaTutorial = document.createElement('div');
        ventanaTutorial.id = 'tutorial-ventana-flotante';
        ventanaTutorial.style.cssText = `
            position: fixed;
            bottom: 15vh;  /* ← CAMBIADO: 15% de la altura en lugar de 20px */
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
            max-height: 40vh; /* ← Añadido: límite de altura */
            overflow-y: auto; /* ← Añadido: scroll si contenido largo */
        `;
    
        // 3. Contenido del tutorial
        ventanaTutorial.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #00d2be; margin: 0; font-size: 1.2rem;">
                        <i class="fas fa-graduation-cap" style="margin-right: 8px;"></i>
                        TUTORIAL - Paso 1/5
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
            </div>
            
            <div style="margin: 15px 0; line-height: 1.6;">
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
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <div style="color: #888; font-size: 0.8rem;">
                    <i class="fas fa-hand-pointer"></i> Haz clic fuera para continuar
                </div>
                <button id="btn-comenzar-ahora" style="
                    background: linear-gradient(135deg, #e10600 0%, #ff4444 100%);
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
                    Comenzar Tutorial
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 15px;">
                <div style="display: flex; gap: 8px;">
                    <div style="width: 10px; height: 10px; background: #00d2be; border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                </div>
            </div>
        `;
    
        // 4. Añadir al body
        document.body.appendChild(ventanaTutorial);
    
        // 5. Configurar botón de minimizar CORREGIDO
        const btnMinimizar = ventanaTutorial.querySelector('#btn-minimizar-tutorial');
        let estaMinimizado = false;
        
        btnMinimizar.onclick = () => {
            if (estaMinimizado) {
                // Maximizar
                ventanaTutorial.style.transform = 'translateY(0)';
                ventanaTutorial.style.height = 'auto';
                ventanaTutorial.style.overflowY = 'auto';
                btnMinimizar.innerHTML = '_';
                estaMinimizado = false;
            } else {
                // Minimizar - solo mostrar 40px de altura
                ventanaTutorial.style.transform = 'translateY(calc(100% - 40px))';
                ventanaTutorial.style.height = '40px';
                ventanaTutorial.style.overflowY = 'hidden';
                btnMinimizar.innerHTML = '^';
                estaMinimizado = true;
            }
        };
    
        // 6. Configurar botón principal
        ventanaTutorial.querySelector('#btn-comenzar-ahora').onclick = () => {
            // Aquí puedes implementar el siguiente paso del tutorial
            // Por ahora solo finalizamos
            this.finalizar();
        };
    
        // 7. Permitir clics fuera del tutorial
        document.addEventListener('click', (e) => {
            if (!ventanaTutorial.contains(e.target)) {
                // El usuario hizo clic fuera del tutorial
                // Podrías avanzar al siguiente paso aquí
                console.log('📝 Usuario interactuando con el juego durante tutorial');
            }
        }, { once: true });
    }
    
    // ========================
    // FINALIZAR TUTORIAL (VERSIÓN CORREGIDA)
    // ========================
    async finalizar() {
        console.log('✅ Finalizando tutorial...');
        
        // 1. Guardar que se completó
        localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
        localStorage.setItem('f1_tutorial_completado', 'true');
        
        // 2. Actualizar base de datos si existe
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
        
        // 3. REMOVER solo el overlay (NO redirigir al dashboard)
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // 4. El dashboard ya está cargado debajo, así que solo notificamos
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification('🎉 ¡Bienvenido a F1 Manager!', 'success');
            }
        }, 500);
    }

}

console.log('✅ Tutorial.js cargado correctamente');
