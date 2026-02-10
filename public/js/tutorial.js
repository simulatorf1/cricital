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
    mostrarPantallaUnica() {
        document.body.innerHTML = `
            <div class="tutorial-screen">
                <div class="tutorial-container">
                    <div class="tutorial-header">
                        <h1>🏎️ ¡BIENVENIDO A F1 MANAGER!</h1>
                    </div>
                    
                    <div class="tutorial-content-wrapper">
                        <div class="tutorial-content-grid">
                            <p>Estás a punto de comenzar tu aventura como director de la escudería <strong>${this.f1Manager.escuderia?.nombre || "tu equipo"}</strong>.</p>
                            
                            <div class="highlight-box" style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00d2be;">
                                <p>💰 <strong>¡Fondos iniciales!</strong></p>
                                <p>Tienes <strong class="money">5,000,000€</strong> para empezar.</p>
                            </div>
                            
                            <p>🎯 <strong>Tu objetivo:</strong> Convertirte en el mejor estratega compitiendo contra miles de jugadores.</p>
                            
                            <p>¡Pulsa el botón para empezar tu aventura!</p>
                        </div>
                    </div>
                    
                    <div class="tutorial-actions-bottom">
                        <button class="btn-tutorial-next-large" id="btn-comenzar-ahora">
                            ¡EMPEZAR A COMPETIR!
                            <i class="fas fa-flag-checkered"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('btn-comenzar-ahora').onclick = () => {
            this.finalizar();
        };
    }

    // ========================
    // FINALIZAR TUTORIAL
    // ========================
    async finalizar() {
        console.log('✅ Finalizando tutorial...');
        
        // Guardar que se completó
        localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
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
        
        // Redirigir al dashboard
        document.body.innerHTML = '';
        
        if (this.f1Manager.cargarDashboardCompleto) {
            await this.f1Manager.cargarDashboardCompleto();
        }
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification('🎉 ¡Bienvenido a F1 Manager!', 'success');
            }
        }, 1000);
    }
}

console.log('✅ Tutorial.js cargado correctamente');
