// ========================
// F1 MANAGER - TUTORIAL.JS
// ========================
console.log('📚 Tutorial cargado');

class TutorialManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.pasoActual = 1;
        this.totalPasos = 3; // Aumentamos a 3 pasos
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
        
        this.mostrarPaso(this.pasoActual);
    }

    // ========================
    // MOSTRAR PASO DEL TUTORIAL
    // ========================
    mostrarPaso(numeroPaso) {
        this.pasoActual = numeroPaso;
        
        // Asegurarnos de que el dashboard esté cargado
        if (!document.getElementById('tab-principal')) {
            setTimeout(() => this.mostrarPaso(numeroPaso), 500);
            return;
        }

        // Remover ventana anterior si existe
        const ventanaAnterior = document.getElementById('tutorial-ventana-flotante');
        if (ventanaAnterior) {
            ventanaAnterior.remove();
        }

        // Mostrar paso correspondiente
        switch(numeroPaso) {
            case 1:
                this.mostrarPaso1();
                break;
            case 2:
                this.mostrarPaso2();
                break;
            case 3:
                this.mostrarPaso3(); // Paso final
                break;
        }
    }

    // ========================
    // PASO 1: BIENVENIDA (Ya lo tienes)
    // ========================
    mostrarPaso1() {
        // Tu código actual de mostrarPantallaUnica() va aquí
        // Pero cambia el botón para que diga "Siguiente" en lugar de "Comenzar Tutorial"
    }

    // ========================
    // PASO 2: EXPLICACIÓN DEL DASHBOARD
    // ========================
    mostrarPaso2() {
        const ventanaTutorial = document.createElement('div');
        ventanaTutorial.id = 'tutorial-ventana-flotante';
        // ... mismo estilo que antes ...

        ventanaTutorial.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #00d2be; margin: 0; font-size: 1.2rem;">
                        <i class="fas fa-compass" style="margin-right: 8px;"></i>
                        TUTORIAL - Paso 2/3
                    </h2>
                    <div style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">
                        Conoce tu centro de control
                    </div>
                </div>
                <button id="btn-minimizar-tutorial" style="...">_</button>
            </div>
            
            <div id="contenido-tutorial" style="margin: 15px 0; line-height: 1.6;">
                <div style="background: rgba(0, 210, 190, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #00d2be;">
                        🎛️ TU DASHBOARD PRINCIPAL
                    </p>
                    <p style="margin: 0; font-size: 0.95rem;">
                        Aquí gestionarás toda tu escudería:
                    </p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 0.9rem;">
                        <li><strong>💰 Dinero:</strong> Fondos para comprar y fabricar</li>
                        <li><strong>🌟 Estrellas:</strong> Bonus diarios de patrocinadores</li>
                        <li><strong>🔧 Producción:</strong> Fabrica nuevas piezas</li>
                        <li><strong>👥 Estrategas:</strong> Contrata expertos para ayudarte</li>
                    </ul>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.1); padding: 10px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #FFD700;">
                    <p style="margin: 0; font-size: 0.9rem; color: #FFD700;">
                        <i class="fas fa-mouse-pointer"></i> 
                        <strong>Prueba ahora:</strong> Haz clic en "Taller" para ver cómo fabricar piezas
                    </p>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <button id="btn-tutorial-anterior" style="
                    background: rgba(0, 210, 190, 0.2);
                    border: 1px solid #00d2be;
                    color: #00d2be;
                    padding: 8px 15px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    <i class="fas fa-arrow-left"></i> Anterior
                </button>
                
                <button id="btn-tutorial-siguiente" style="
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
                    Siguiente
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 15px;">
                <div style="display: flex; gap: 8px;">
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: #00d2be; border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(ventanaTutorial);

        // Configurar botones
        ventanaTutorial.querySelector('#btn-tutorial-anterior').onclick = () => {
            this.mostrarPaso(1);
        };

        ventanaTutorial.querySelector('#btn-tutorial-siguiente').onclick = () => {
            this.mostrarPaso(3);
        };

        // Configurar botón minimizar (misma lógica que antes)
        this.configurarBotonMinimizar(ventanaTutorial);
    }

    // ========================
    // PASO 3: FINALIZACIÓN
    // ========================
    mostrarPaso3() {
        const ventanaTutorial = document.createElement('div');
        ventanaTutorial.id = 'tutorial-ventana-flotante';
        // ... mismo estilo ...

        ventanaTutorial.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #00d2be; margin: 0; font-size: 1.2rem;">
                        <i class="fas fa-trophy" style="margin-right: 8px;"></i>
                        TUTORIAL - Paso 3/3
                    </h2>
                    <div style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">
                        ¡Estás listo para competir!
                    </div>
                </div>
                <button id="btn-minimizar-tutorial" style="...">_</button>
            </div>
            
            <div id="contenido-tutorial" style="margin: 15px 0; line-height: 1.6;">
                <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4CAF50;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #4CAF50;">
                        🏆 ¡TUTORIAL COMPLETADO!
                    </p>
                    <p style="margin: 0; font-size: 0.95rem;">
                        Has aprendido lo básico para dirigir tu escudería. Ahora:
                    </p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 0.9rem;">
                        <li>🏎️ <strong>Fabrica piezas</strong> en el Taller</li>
                        <li>🛒 <strong>Compra y vende</strong> en el Mercado</li>
                        <li>📊 <strong>Envía pronósticos</strong> para ganar puntos</li>
                        <li>👥 <strong>Contrata estrategas</strong> para obtener ventajas</li>
                    </ul>
                </div>
                
                <div style="text-align: center; padding: 15px; background: rgba(255, 215, 0, 0.05); border-radius: 8px; margin: 20px 0;">
                    <div style="color: #FFD700; font-size: 2rem; margin-bottom: 10px;">🌟</div>
                    <p style="margin: 0; font-size: 0.95rem; color: #FFD700;">
                        <strong>¡Bonus de bienvenida!</strong><br>
                        Recibirás +10 estrellas por completar el tutorial
                    </p>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 25px;">
                <button id="btn-finalizar-tutorial" style="
                    background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 200px;
                    justify-content: center;
                ">
                    <i class="fas fa-check-circle"></i>
                    ¡EMPEZAR A JUGAR!
                </button>
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 15px;">
                <div style="display: flex; gap: 8px;">
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: rgba(0, 210, 190, 0.3); border-radius: 50%;"></div>
                    <div style="width: 10px; height: 10px; background: #4CAF50; border-radius: 50%;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(ventanaTutorial);

        // Configurar botón FINALIZAR
        ventanaTutorial.querySelector('#btn-finalizar-tutorial').onclick = async () => {
            await this.finalizarCompletamente();
        };

        // Configurar botón minimizar
        this.configurarBotonMinimizar(ventanaTutorial);
    }

    // ========================
    // FINALIZAR COMPLETAMENTE
    // ========================
    async finalizarCompletamente() {
        console.log('✅ Finalizando tutorial completamente...');
        
        // 1. Guardar en localStorage
        localStorage.setItem(`f1_tutorial_${this.f1Manager.escuderia?.id}`, 'true');
        localStorage.setItem('f1_tutorial_completado', 'true');
        
        // 2. Actualizar base de datos
        if (this.f1Manager.escuderia && this.f1Manager.supabase) {
            try {
                await this.f1Manager.supabase
                    .from('escuderias')
                    .update({ 
                        tutorial_completado: true,
                        estrellas_semana: (this.f1Manager.escuderia.estrellas_semana || 0) + 10 // Bonus de 10 estrellas
                    })
                    .eq('id', this.f1Manager.escuderia.id);
                
                // Actualizar en memoria
                this.f1Manager.escuderia.tutorial_completado = true;
                this.f1Manager.escuderia.estrellas_semana = (this.f1Manager.escuderia.estrellas_semana || 0) + 10;
                
            } catch (error) {
                console.error('Error actualizando tutorial:', error);
            }
        }
        
        // 3. Remover ventana del tutorial
        const ventanaTutorial = document.getElementById('tutorial-ventana-flotante');
        if (ventanaTutorial) {
            ventanaTutorial.remove();
        }
        
        // 4. Mostrar notificación de éxito
        setTimeout(() => {
            if (this.f1Manager.showNotification) {
                this.f1Manager.showNotification('🎉 ¡Tutorial completado! +10🌟 bonus', 'success');
                
                // Actualizar contador de estrellas en la UI si existe
                const estrellasElement = document.getElementById('estrellas-value');
                if (estrellasElement) {
                    estrellasElement.textContent = this.f1Manager.escuderia.estrellas_semana;
                }
            }
        }, 500);
    }

    // ========================
    // FUNCIÓN AUXILIAR PARA BOTÓN MINIMIZAR
    // ========================
    configurarBotonMinimizar(ventanaTutorial) {
        const btnMinimizar = ventanaTutorial.querySelector('#btn-minimizar-tutorial');
        let estaMinimizado = false;

        btnMinimizar.onclick = () => {
            const contenido = ventanaTutorial.querySelector('#contenido-tutorial');
            
            if (estaMinimizado) {
                // Maximizar
                ventanaTutorial.style.height = 'auto';
                ventanaTutorial.style.maxHeight = '45vh';
                if (contenido) contenido.style.opacity = '1';
                btnMinimizar.innerHTML = '_';
                estaMinimizado = false;
            } else {
                // Minimizar a altura del encabezado
                ventanaTutorial.style.height = '60px';
                if (contenido) contenido.style.opacity = '0';
                btnMinimizar.innerHTML = '^';
                estaMinimizado = true;
            }
        };
    }
}

console.log('✅ Tutorial.js cargado correctamente');
