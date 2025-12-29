// ========================
// AUTH.JS - SISTEMA REAL CON SUPABASE AUTH
// ========================

class AuthManager {
    constructor() {
        this.user = null;
        this.escuderia = null;
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
            // 1. Obtener datos del usuario
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            // 2. Obtener escudería
            const { data: escuderia } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!escuderia) {
                console.log('⚠️ Usuario sin escudería, creando...');
                await this.createDefaultEscuderia(user.id, userData?.username || 'Nuevo Manager');
                return await this.loadUserData(user);
            }

            this.user = { ...user, ...userData };
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
            }

            return true;

        } catch (error) {
            console.error('❌ Error cargando datos usuario:', error);
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
            const { data: pilotos } = await supabase
                .from('pilotos_catalogo')
                .select('*')
                .eq('disponible', true)
                .limit(6);

            const container = document.getElementById('tutorial-pilotos');
            if (!container) return;

            container.innerHTML = `
                <div class="pilotos-grid">
                    ${pilotos?.map(piloto => `
                        <div class="piloto-card" data-piloto-id="${piloto.id}">
                            <div class="piloto-header">
                                <h4>${piloto.nombre}</h4>
                                <span class="piloto-nacionalidad">${piloto.nacionalidad}</span>
                            </div>
                            <div class="piloto-stats">
                                <div class="stat">
                                    <i class="fas fa-star"></i>
                                    <span>Habilidad: ${piloto.habilidad}/100</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-trophy"></i>
                                    <span>Experiencia: ${piloto.experiencia} años</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>Salario: €${piloto.salario_base?.toLocaleString()}/mes</span>
                                </div>
                            </div>
                            <button class="btn-seleccionar" onclick="selectPiloto(${piloto.id})">
                                <i class="fas fa-user-plus"></i> Seleccionar
                            </button>
                        </div>
                    `).join('') || '<p>No hay pilotos disponibles</p>'}
                </div>
                
                <div class="pilotos-selected" id="pilotos-selected">
                    <h4>Pilotos seleccionados (0/2)</h4>
                    <div id="selected-list"></div>
                    <button class="btn-confirmar" id="btn-confirm-pilots" disabled>
                        Confirmar selección
                    </button>
                </div>
            `;

        } catch (error) {
            console.error('Error cargando pilotos:', error);
        }
    }

    logout() {
        supabase.auth.signOut();
        localStorage.clear();
        location.reload();
    }
}
