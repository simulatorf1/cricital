// ========================
// AUTH.JS - SISTEMA REAL CON SUPABASE AUTH
// ========================

class AuthManager {
    constructor() {
        this.user = null;
        this.escuderia = null;
    }
    // 🔥 NUEVO MÉTODO AÑADIDO
    showAuthModal() {
        console.log('🔐 Mostrando modal de autenticación...');
        
        // 1. Ocultar la interfaz del juego si existe
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.style.display = 'none';
        }
        
        // 2. Mostrar el modal de autenticación
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'block';
        } else {
            console.warn('⚠️ Elemento #auth-modal no encontrado en el DOM');
        }
    }
    async init() {
        console.log('🔐 Inicializando autenticación Supabase...');
        
        // Verificar sesión activa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
            await this.loadUserData(session.user);
            return true;
        }
        
        this.showAuthModal();
        return false;
    }

    async handleRegister(email, password, username, teamName) {
        try {
            // 1. Registrar usuario en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        team_name: teamName
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {


                this.showNotification('✅ ¡Registro exitoso! Revisa tu email para confirmar.', 'success');
                return true;
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showNotification('❌ Error al registrarse: ' + error.message, 'error');
            return false;
        }
    }

    async handleLogin(email, password) {
        // 🔥 NUEVO: Verificar y crear la función si no existe
        if (!window.iniciarJuegoSiNoHayTutorial) {
            console.log('⚠️ Función iniciarJuegoSiNoHayTutorial no existe, creando fallback...');
            window.iniciarJuegoSiNoHayTutorial = function() {
                console.log('🎮 [FALLBACK] Iniciando juego desde auth.js...');
                // Iniciar el juego directamente si main.js no lo ha hecho
                if (window.f1Manager && window.f1Manager.initGame) {
                    window.f1Manager.initGame();
                }
            };
        }
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) throw authError;

            if (authData.user) {
                await this.loadUserData(authData.user);
                this.showNotification('✅ ¡Bienvenido de vuelta!', 'success');
                return true;
            }

        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification('❌ Credenciales incorrectas', 'error');
            return false;
        }
    }

    async loadUserData(user) {
        try {
            // PASO 1: Verificar SI existe el usuario en la tabla 'users'
            const { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle(); // Cambiado a maybeSingle (devuelve null si no existe)

            let currentUserData = userData;

            // PASO 2: Si NO existe (userData es null), CREARLO
            if (!currentUserData) {
                console.log('🆕 Usuario no existe en BD. Creando...');
                
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        id: user.id, // ID CRÍTICO: debe coincidir con Supabase Auth
                        email: user.email,
                        username: user.user_metadata?.username || user.email.split('@')[0], // Usa metadata o parte del email
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
                    
                if (insertError) {
                    console.error('❌ Error creando usuario:', insertError);
                    throw insertError;
                }
                currentUserData = newUser;
                console.log('✅ Usuario creado en BD:', currentUserData);
            }

            // PASO 3: Ahora sí buscar la escudería con un user_id VÁLIDO
            const { data: escuderia } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', user.id) // ← Ahora user.id existe en la tabla 'users'
                .maybeSingle(); // Usar maybeSingle aquí también

            if (!escuderia) {
                console.log('⚠️ Usuario sin escudería, creando...');
                await this.createDefaultEscuderia(user.id, currentUserData.username);
                // Recargar datos tras crear escudería
                return await this.loadUserData(user);
            }

            this.user = { ...user, ...currentUserData };
            this.escuderia = escuderia;

            // Guardar en localStorage
            localStorage.setItem('f1_user', JSON.stringify(this.user));
            localStorage.setItem('f1_escuderia', JSON.stringify(this.escuderia));

            // Ocultar modal
            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.style.display = 'none';

            // Inicializar managers
            this.initializeManagers();

            // Mostrar tutorial si es primer inicio
            if (!localStorage.getItem('f1_tutorial_completed')) {
                this.showTutorial();
            } else {
                // Si NO hay tutorial, iniciar el juego inmediatamente
                if (window.iniciarJuegoSiNoHayTutorial) {
                    window.iniciarJuegoSiNoHayTutorial();
                }
            }    
            return true;

        } catch (error) {
            console.error('❌ Error CATASTRÓFICO en loadUserData:', error);
            this.showNotification('Error crítico al cargar el juego.', 'error');
            return false;
        }
    }
    async createDefaultEscuderia(userId, username) {
        const escuderiaNombre = `${username}'s Team`;
        
        const { data: escuderia } = await supabase
            .from('escuderias')
            .insert([{
                user_id: userId,
                nombre: escuderiaNombre,
                dinero: 5000000,
                puntos: 0,
                ranking: 999,
                nivel_ingenieria: 1,
                color_principal: '#e10600',
                color_secundario: '#ffffff',
                creada_en: new Date().toISOString()
            }])
            .select()
            .single();

        // Crear stats del coche
        await supabase
            .from('coches_stats')
            .insert([{ escuderia_id: escuderia.id }]);

        return escuderia;
    }

    initializeManagers() {
        // Inicializar todos los managers
        if (window.FabricacionManager && !window.fabricacionManager) {
            window.fabricacionManager = new window.FabricacionManager();
            window.fabricacionManager.inicializar(this.escuderia.id);
        }

        if (window.AlmacenManager && !window.almacenManager) {
            window.almacenManager = new window.AlmacenManager();
            window.almacenManager.inicializar(this.escuderia.id);
        }

        if (window.IntegracionManager && !window.integracionManager) {
            window.integracionManager = new window.IntegracionManager();
            window.integracionManager.inicializar(this.escuderia.id);
        }

        // Inicializar f1Manager si existe
        if (window.f1Manager) {
            window.f1Manager.user = this.user;
            window.f1Manager.escuderia = this.escuderia;
            window.f1Manager.initGame();
        }
    }

    showTutorial() {
        // Crear tutorial modal
        const tutorialHTML = `
            <div class="tutorial-modal" id="tutorial-modal">
                <div class="tutorial-content">
                    <div class="tutorial-header">
                        <h2><i class="fas fa-graduation-cap"></i> Bienvenido a F1 Manager</h2>
                        <span class="tutorial-step">Paso 1/3</span>
                    </div>
                    
                    <div class="tutorial-body">
                        <h3>🎯 Objetivo del Juego</h3>
                        <p>Gestiona tu escudería de F1: fabrica piezas, contrata pilotos, apuesta en carreras reales y compite en el ranking global.</p>
                        
                        <h3>🏎️ Primero: Elige tus pilotos</h3>
                        <p>Necesitas 2 pilotos para empezar. Cada uno tiene diferente habilidad y costo.</p>
                        
                        <div id="tutorial-pilotos">
                            <!-- Se cargarán dinámicamente -->
                        </div>
                        
                        <h3>🎨 Personaliza tu escudería</h3>
                        <div class="tutorial-inputs">
                            <input type="text" id="tutorial-team-name" placeholder="Nombre de tu escudería" value="${this.escuderia?.nombre || ''}">
                            
                            <div class="color-picker">
                                <label>Color principal:</label>
                                <input type="color" id="tutorial-color-main" value="${this.escuderia?.color_principal || '#e10600'}">
                            </div>
                            
                            <div class="color-picker">
                                <label>Color secundario:</label>
                                <input type="color" id="tutorial-color-second" value="${this.escuderia?.color_secundario || '#ffffff'}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-footer">
                        <button class="btn-secondary" id="btn-skip-tutorial">
                            Saltar tutorial
                        </button>
                        <button class="btn-primary" id="btn-next-tutorial">
                            Siguiente <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', tutorialHTML);
        this.loadTutorialPilotos();
    }

    async loadTutorialPilotos() {
        try {
            // 🔥 CAMBIO AQUÍ: Consultar 'ingenieros_catalogo' en lugar de 'pilotos_catalogo'
            const { data: ingenieros } = await supabase
                .from('ingenieros_catalogo')
                .select('*')
                .eq('disponible', true)
                .limit(6);

            const container = document.getElementById('tutorial-pilotos');
            if (!container) return;

            // 🔥 CAMBIO AQUÍ: Actualizar los nombres de propiedades para ingenieros
            container.innerHTML = `
                <div class="pilotos-grid">
                    ${ingenieros?.map(ingeniero => `
                        <div class="piloto-card" data-ingeniero-id="${ingeniero.id}">
                            <div class="piloto-header">
                                <h4>${ingeniero.nombre}</h4>
                                <span class="piloto-nacionalidad">${ingeniero.nacionalidad || 'N/A'}</span>
                            </div>
                            <div class="piloto-stats">
                                <div class="stat">
                                    <i class="fas fa-star"></i>
                                    <span>Habilidad: ${ingeniero.nivel_habilidad || 0}/100</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-trophy"></i>
                                    <span>Experiencia: ${ingeniero.experiencia || 0} años</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>Salario: €${(ingeniero.salario_base || 0)?.toLocaleString()}/mes</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-cogs"></i>
                                    <span>Especialidad: ${ingeniero.especialidad || 'General'}</span>
                                </div>
                            </div>
                            <button class="btn-seleccionar" onclick="selectIngeniero(${ingeniero.id})">
                                <i class="fas fa-user-plus"></i> Seleccionar Ingeniero
                            </button>
                        </div>
                    `).join('') || '<p>No hay ingenieros disponibles</p>'}
                </div>
                
                <div class="pilotos-selected" id="pilotos-selected">
                    <h4>Ingenieros seleccionados (0/2)</h4>
                    <div id="selected-list"></div>
                    <button class="btn-confirmar" id="btn-confirm-pilots" disabled>
                        Confirmar selección
                    </button>
                </div>
            `;

        } catch (error) {
            console.error('Error cargando ingenieros:', error);
        }
    }

    logout() {
        supabase.auth.signOut();
        localStorage.clear();
        location.reload();
    }
}
// ========================
// INSTANCIA GLOBAL DE AUTHMANAGER
// ========================
console.log('🔧 Creando instancia global de AuthManager...');

// Crear la instancia global
window.authManager = new AuthManager();

// También puedes crear un alias más corto si quieres
window.am = window.authManager;

console.log('✅ AuthManager disponible globalmente como window.authManager');
// ========================
// FUNCIONES PARA EL TUTORIAL DE INGENIEROS
// ========================

// Array global para almacenar ingenieros seleccionados
window.ingenierosSeleccionados = [];

// Función para seleccionar un ingeniero en el tutorial
window.selectIngeniero = function(ingenieroId) {
    console.log('🔧 Intentando seleccionar ingeniero:', ingenieroId);
    
    // 1. Aquí deberías buscar los datos del ingeniero en supabase
    // Por ahora, simulamos con un objeto básico
    const ingeniero = {
        id: ingenieroId,
        nombre: `Ingeniero ${ingenieroId}`,
        especialidad: 'Estrategia'
    };
    
    // 2. Verificar si ya está seleccionado
    const yaSeleccionado = window.ingenierosSeleccionados.find(i => i.id === ingenieroId);
    
    if (yaSeleccionado) {
        alert('Este ingeniero ya está seleccionado');
        return;
    }
    
    // 3. Añadir a la lista (máximo 2)
    if (window.ingenierosSeleccionados.length >= 2) {
        alert('Ya has seleccionado el máximo de 2 ingenieros');
        return;
    }
    
    window.ingenierosSeleccionados.push(ingeniero);
    console.log('✅ Ingeniero añadido:', ingeniero);
    
    // 4. Actualizar la UI del tutorial
    actualizarListaSeleccionados();
    
    // 5. Habilitar el botón de confirmar si hay 2 ingenieros
    if (window.ingenierosSeleccionados.length === 2) {
        const btnConfirmar = document.getElementById('btn-confirm-pilots');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.onclick = window.confirmarIngenieros;
        }
    }
};

// Función para actualizar la lista visual
function actualizarListaSeleccionados() {
    const container = document.getElementById('selected-list');
    if (!container) return;
    
    container.innerHTML = window.ingenierosSeleccionados.map(ingeniero => 
        `<div class="selected-item">
            <i class="fas fa-user-cog"></i>
            <span>${ingeniero.nombre} - ${ingeniero.especialidad}</span>
        </div>`
    ).join('');
    
    // Actualizar contador
    const titulo = document.querySelector('#pilotos-selected h4');
    if (titulo) {
        titulo.textContent = `Ingenieros seleccionados (${window.ingenierosSeleccionados.length}/2)`;
    }
}

// Función para confirmar la selección (debe guardar en Supabase)
window.confirmarIngenieros = async function() {
    console.log('✅ Confirmando selección de ingenieros:', window.ingenierosSeleccionados);
    
    if (window.ingenierosSeleccionados.length === 0) {
        alert('Debes seleccionar al menos un ingeniero');
        return;
    }
    
    try {
        // 1. Aquí debes guardar en 'ingenieros_contratados'
        // Ejemplo (ajusta según tu esquema):
        for (const ingeniero of window.ingenierosSeleccionados) {
            const { error } = await supabase
                .from('ingenieros_contratados')
                .insert([{
                    escuderia_id: window.authManager.escuderia.id,
                    ingeniero_id: ingeniero.id,
                    nombre: ingeniero.nombre,
                    especialidad: ingeniero.especialidad,
                    contratado_en: new Date().toISOString(),
                    activo: true
                }]);
            
            if (error) throw error;
        }
        
        // 2. Marcar tutorial como completado
        localStorage.setItem('f1_tutorial_completed', 'true');
        
        // 3. Cerrar el tutorial
        const modal = document.getElementById('tutorial-modal');
        if (modal) modal.remove();
        
        // 4. Mostrar mensaje de éxito
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification('✅ Ingenieros contratados exitosamente', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error contratando ingenieros:', error);
        alert('Error al contratar ingenieros: ' + error.message);
    }
};

// Función para saltar el tutorial (ya deberías tenerla)
window.completarTutorial = function() {
    localStorage.setItem('f1_tutorial_completed', 'true');
    const modal = document.getElementById('tutorial-modal');
    if (modal) modal.remove();
    console.log('✅ Tutorial saltado');
};
