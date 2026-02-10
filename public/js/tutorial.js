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
    // MOSTRAR PANTALLA ÚNICA (VERSIÓN OVERLAY)
    // ========================
    mostrarPantallaUnica() {
        // 1. Asegurarnos de que el dashboard esté completamente cargado
        if (!document.getElementById('tab-principal')) {
            console.error('❌ Dashboard no cargado, esperando...');
            setTimeout(() => this.mostrarPantallaUnica(), 500);
            return;
        }
    
        // 2. Crear overlay modal (NO reemplazar todo)
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
    
        // 3. Contenido del tutorial (mismo que antes pero como modal)
        overlay.innerHTML = `
            <div style="
                background: rgba(10, 15, 30, 0.95);
                border: 3px solid #00d2be;
                border-radius: 15px;
                max-width: 600px;
                width: 100%;
                padding: 30px;
                box-shadow: 0 0 40px rgba(0, 210, 190, 0.3);
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid rgba(0, 210, 190, 0.3);">
                    <h1 style="color: #00d2be; font-size: 1.8rem; margin: 0;">🏎️ ¡BIENVENIDO A F1 MANAGER!</h1>
                </div>
                
                <div style="margin: 25px 0; line-height: 1.6;">
                    <p>Estás a punto de comenzar tu aventura como director de la escudería <strong>${this.f1Manager.escuderia?.nombre || "tu equipo"}</strong>.</p>
                    
                    <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00d2be;">
                        <p>💰 <strong>¡Fondos iniciales!</strong></p>
                        <p>Tienes <strong style="color: #FFD700; font-size: 1.3rem; font-weight: bold;">5,000,000€</strong> para empezar.</p>
                    </div>
                    
                    <p>🎯 <strong>Tu objetivo:</strong> Convertirte en el mejor estratega compitiendo contra miles de jugadores.</p>
                    
                    <p>¡Pulsa el botón para empezar tu aventura!</p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <button id="btn-comenzar-ahora" style="
                        background: linear-gradient(135deg, #e10600 0%, #ff4444 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        transition: transform 0.2s, box-shadow 0.2s;
                        min-width: 250px;
                    ">
                        ¡EMPEZAR A COMPETIR!
                        <i class="fas fa-flag-checkered"></i>
                    </button>
                </div>
            </div>
        `;
    
        // 4. Añadir al body (NO reemplazarlo)
        document.body.appendChild(overlay);
    
        // 5. Configurar botón
        overlay.querySelector('#btn-comenzar-ahora').onclick = () => {
            this.finalizar();
        };
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
