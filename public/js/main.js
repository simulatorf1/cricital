// ========================
// MAIN.JS - FLUJO SIMPLE
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

// Esperar a que se cargue Supabase
// Esperar a que se cargue y se inicialice Supabase
async function waitForSupabase(maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        if (window.supabase) {
            console.log('✅ Supabase disponible después de', i * 100, 'ms');
            return window.supabase;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.error('❌ Supabase no se cargó después de', maxAttempts * 100, 'ms');
    return null;
}

// Iniciar la aplicación cuando Supabase esté listo
waitForSupabase().then(async (supabaseClient) => {
    if (!supabaseClient) {
        console.error('❌ No se pudo cargar Supabase');
        mostrarError('Error de conexión con la base de datos');
        return;
    }
    
    console.log('🚀 Iniciando aplicación F1 Manager');
    await iniciarAplicacion();
});

async function iniciarAplicacion() {
    // 1. Verificar si ya está logueado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // Si YA tiene sesión, cargar el juego directamente
        console.log('✅ Usuario ya autenticado:', session.user.email);
        window.f1Manager = new F1Manager();
    } else {
        // Si NO tiene sesión, mostrar pantalla de login
        console.log('👤 No hay sesión, mostrar login');
        mostrarPantallaLogin();
    }
}

function mostrarPantallaLogin() {
    document.body.innerHTML = `
        <style>
            .login-screen {
                min-height: 100vh;
                background: linear-gradient(135deg, #15151e 0%, #1a1a2e 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .login-container {
                background: rgba(42, 42, 56, 0.9);
                border-radius: 15px;
                padding: 40px;
                width: 100%;
                max-width: 400px;
                border: 2px solid #e10600;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            
            .login-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .login-header h1 {
                font-family: 'Orbitron', sans-serif;
                font-size: 2rem;
                background: linear-gradient(90deg, #e10600, #00d2be);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }
            
            .login-header p {
                color: #888;
                font-size: 0.9rem;
            }
            
            .login-form {
                margin-bottom: 25px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                color: #aaa;
                margin-bottom: 5px;
                font-size: 0.9rem;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 5px;
                color: white;
                font-size: 1rem;
                transition: border 0.3s;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #00d2be;
            }
            
            .login-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 30px;
            }
            
            .btn-login, .btn-register {
                padding: 15px;
                border: none;
                border-radius: 5px;
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .btn-login {
                background: linear-gradient(135deg, #e10600, #ff4444);
                color: white;
            }
            
            .btn-register {
                background: transparent;
                border: 2px solid #00d2be;
                color: #00d2be;
            }
            
            .btn-login:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(225, 6, 0, 0.4);
            }
            
            .btn-register:hover {
                background: rgba(0, 210, 190, 0.1);
            }
            
            .login-footer {
                text-align: center;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                color: #666;
                font-size: 0.9rem;
            }
            
            .error-message {
                background: rgba(255, 56, 96, 0.2);
                color: #ff3860;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
                border: 1px solid #ff3860;
            }
            
            .error-message.show {
                display: block;
            }
        </style>
        
        <div class="login-screen">
            <div class="login-container">
                <div class="login-header">
                    <h1>F1 MANAGER E-STRATEGY</h1>
                    <p>Gestiona tu escudería de Fórmula 1</p>
                </div>
                
                <div id="login-error" class="error-message"></div>
                
                <div class="login-form">
                    <div class="form-group">
                        <label for="login-email">Correo electrónico</label>
                        <input type="email" id="login-email" placeholder="tu@email.com">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Contraseña</label>
                        <input type="password" id="login-password" placeholder="••••••••">
                    </div>
                </div>
                
                <div class="login-buttons">
                    <button class="btn-login" id="btn-login">
                        <i class="fas fa-sign-in-alt"></i>
                        INICIAR SESIÓN
                    </button>
                    <button class="btn-register" id="btn-register">
                        <i class="fas fa-user-plus"></i>
                        CREAR CUENTA NUEVA
                    </button>
                </div>
                
                <div class="login-footer">
                    <p>Un juego de gestión 100% online</p>
                    <p>v${CONFIG.VERSION}</p>
                </div>
            </div>
        </div>
    `;
    
    // Configurar eventos
    document.getElementById('btn-login').addEventListener('click', manejarLogin);
    document.getElementById('btn-register').addEventListener('click', mostrarRegistro);
    
    // Permitir Enter para login
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') manejarLogin();
    });
}

function mostrarRegistro() {
    document.body.innerHTML = `
        <style>
            .register-screen {
                min-height: 100vh;
                background: linear-gradient(135deg, #15151e 0%, #1a1a2e 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .register-container {
                background: rgba(42, 42, 56, 0.9);
                border-radius: 15px;
                padding: 40px;
                width: 100%;
                max-width: 400px;
                border: 2px solid #00d2be;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            
            .register-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .register-header h1 {
                font-family: 'Orbitron', sans-serif;
                font-size: 2rem;
                background: linear-gradient(90deg, #00d2be, #e10600);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
            }
            
            .register-header p {
                color: #888;
                font-size: 0.9rem;
            }
            
            .back-button {
                background: transparent;
                border: none;
                color: #aaa;
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                margin-bottom: 20px;
                transition: color 0.3s;
            }
            
            .back-button:hover {
                color: #00d2be;
            }
            
            .register-form {
                margin-bottom: 25px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                color: #aaa;
                margin-bottom: 5px;
                font-size: 0.9rem;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 5px;
                color: white;
                font-size: 1rem;
                transition: border 0.3s;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #e10600;
            }
            
            .register-button {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #00d2be, #00a35c);
                border: none;
                border-radius: 5px;
                color: white;
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-top: 10px;
            }
            
            .register-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 210, 190, 0.4);
            }
            
            .register-footer {
                text-align: center;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                color: #666;
                font-size: 0.9rem;
            }
            
            .error-message {
                background: rgba(255, 56, 96, 0.2);
                color: #ff3860;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
                border: 1px solid #ff3860;
            }
            
            .error-message.show {
                display: block;
            }
        </style>
        
        <div class="register-screen">
            <div class="register-container">
                <button class="back-button" id="btn-back">
                    <i class="fas fa-arrow-left"></i>
                    Volver al login
                </button>
                
                <div class="register-header">
                    <h1>CREAR CUENTA</h1>
                    <p>Comienza tu aventura en la F1</p>
                </div>
                
                <div id="register-error" class="error-message"></div>
                
                <div class="register-form">
                    <div class="form-group">
                        <label for="register-username">Nombre de usuario</label>
                        <input type="text" id="register-username" placeholder="Ej: RedBullManager" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label for="register-email">Correo electrónico</label>
                        <input type="email" id="register-email" placeholder="tu@email.com">
                    </div>
                    <div class="form-group">
                        <label for="register-password">Contraseña</label>
                        <input type="password" id="register-password" placeholder="•••••••• (mínimo 6 caracteres)">
                    </div>
                </div>
                
                <button class="register-button" id="btn-register-submit">
                    <i class="fas fa-check-circle"></i>
                    CREAR MI ESCUDERÍA
                </button>
                
                <div class="register-footer">
                    <p>Recibirás 5,000,000€ para empezar</p>
                </div>
            </div>
        </div>
    `;
    
    // Configurar eventos
    document.getElementById('btn-back').addEventListener('click', mostrarPantallaLogin);
    document.getElementById('btn-register-submit').addEventListener('click', manejarRegistro);
}

async function manejarLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!email || !password) {
        mostrarError('Por favor, completa todos los campos', errorDiv);
        return;
    }
    
    mostrarCargando('Iniciando sesión...');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('✅ Login exitoso:', data.user.email);
        // Recargar para que inicie el juego
        location.reload();
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        mostrarError('Usuario o contraseña incorrectos', errorDiv);
        ocultarCargando();
    }
}

async function manejarRegistro() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    if (!username || !email || !password) {
        mostrarError('Por favor, completa todos los campos', errorDiv);
        return;
    }
    
    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres', errorDiv);
        return;
    }
    
    mostrarCargando('Creando tu escudería...');
    
    try {
        // 1. Registrar usuario en Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });
        
        if (authError) throw authError;
        
        // 2. Crear perfil en tabla users
        const { error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    username: username,
                    email: email,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (profileError) throw profileError;
        
        // 3. Crear escudería automáticamente
        const { data: escuderia, error: escuderiaError } = await supabase
            .from('escuderias')
            .insert([
                {
                    user_id: authData.user.id,
                    nombre: username,
                    dinero: CONFIG.INITIAL_MONEY,
                    puntos: 0,
                    ranking: null,
                    color_principal: '#e10600',
                    color_secundario: '#ffffff',
                    nivel_ingenieria: 1,
                    creada_en: new Date().toISOString()
                }
            ])
            .select()
            .single();
        
        if (escuderiaError) throw escuderiaError;
        
        // 4. Crear stats del coche
        await supabase
            .from('coches_stats')
            .insert([{ escuderia_id: escuderia.id }]);
        
        console.log('✅ Registro exitoso:', email);
        mostrarExito('¡Cuenta creada! Redirigiendo...');
        
        // Esperar y recargar
        setTimeout(() => location.reload(), 1500);
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        mostrarError(error.message || 'Error creando la cuenta', errorDiv);
        ocultarCargando();
    }
}

function mostrarError(mensaje, elemento) {
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.classList.add('show');
    }
}

function mostrarCargando(mensaje) {
    // Implementar si quieres un spinner
}

function ocultarCargando() {
    // Implementar si quieres un spinner
}

function mostrarExito(mensaje) {
    // Puedes añadir un toast de éxito
    alert(mensaje);
}

// Tu clase F1Manager existente continúa aquí...
// NO MODIFIQUE NADA DESPUÉS DE ESTA LÍNEA
// ================================================

class F1Manager {
    constructor() {
        this.user = null;
        this.escuderia = null;
        this.isLoading = true;
        this.tutorialCompleted = false;
        this.currentStep = 0;
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Inicializando sistema...');
        
        // 1. Verificar autenticación
        await this.checkAuth();
        
        // 2. Si no hay usuario, mostrar login/registro
        if (!this.user) {
            this.showAuthScreen();
            return;
        }
        
        // 3. Cargar datos del usuario
        await this.loadUserData();
        
        // 4. Si no tiene escudería, mostrar tutorial
        if (!this.escuderia) {
            this.startTutorial();
            return;
        }
        
        // 5. Cargar dashboard
        await this.loadDashboard();
    }
    
    async checkAuth() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            if (user) {
                this.user = user;
                console.log('👤 Usuario autenticado:', user.email);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.warn('⚠️ No autenticado:', error.message);
            return false;
        }
    }
    
    showAuthScreen() {
        // Inyectar pantalla completa de autenticación
        document.body.innerHTML = this.getAuthHTML();
        this.setupAuthEvents();
    }
    
    getAuthHTML() {
        return `
            <div class="auth-screen">
                <div class="auth-container">
                    <div class="auth-header">
                        <h1>🏎️ F1 MANAGER E-STRATEGY</h1>
                        <p>Gestiona tu propia escudería de Fórmula 1</p>
                    </div>
                    
                    <div class="auth-box">
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-tab="login">INICIAR SESIÓN</button>
                            <button class="auth-tab" data-tab="register">REGISTRARSE</button>
                        </div>
                        
                        <div class="auth-form active" id="login-form">
                            <div class="form-group">
                                <label for="login-email">Correo electrónico</label>
                                <input type="email" id="login-email" placeholder="tu@email.com">
                            </div>
                            <div class="form-group">
                                <label for="login-password">Contraseña</label>
                                <input type="password" id="login-password" placeholder="••••••••">
                            </div>
                            <button class="btn-auth btn-primary" id="btn-login">
                                <i class="fas fa-sign-in-alt"></i> ENTRAR AL JUEGO
                            </button>
                        </div>
                        
                        <div class="auth-form" id="register-form">
                            <div class="form-group">
                                <label for="register-username">Nombre de usuario</label>
                                <input type="text" id="register-username" placeholder="MiEscuderíaF1">
                            </div>
                            <div class="form-group">
                                <label for="register-email">Correo electrónico</label>
                                <input type="email" id="register-email" placeholder="tu@email.com">
                            </div>
                            <div class="form-group">
                                <label for="register-password">Contraseña</label>
                                <input type="password" id="register-password" placeholder="••••••••">
                            </div>
                            <button class="btn-auth btn-primary" id="btn-register">
                                <i class="fas fa-user-plus"></i> CREAR CUENTA
                            </button>
                        </div>
                        
                        <div class="auth-divider">
                            <span>O</span>
                        </div>
                        
                        <button class="btn-auth btn-demo" id="btn-demo">
                            <i class="fas fa-gamepad"></i> MODO DEMO (SIN REGISTRO)
                        </button>
                        
                        <p class="auth-note">
                            <i class="fas fa-info-circle"></i>
                            El modo demo te permite probar el juego sin registro
                        </p>
                    </div>
                    
                    <div class="auth-footer">
                        <p>Un juego de gestión de Fórmula 1 100% online</p>
                        <p class="version">v1.0.0</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupAuthEvents() {
        // Tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                
                e.target.classList.add('active');
                const tabId = e.target.dataset.tab;
                document.getElementById(`${tabId}-form`).classList.add('active');
            });
        });
        
        // Login
        document.getElementById('btn-login')?.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                this.showNotification('Por favor, completa todos los campos', 'error');
                return;
            }
            
            await this.login(email, password);
        });
        
        // Registro
        document.getElementById('btn-register')?.addEventListener('click', async () => {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            if (!username || !email || !password) {
                this.showNotification('Por favor, completa todos los campos', 'error');
                return;
            }
            
            await this.register(username, email, password);
        });
        
        // Demo
        document.getElementById('btn-demo')?.addEventListener('click', () => {
            this.startDemoMode();
        });
    }
    
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.user = data.user;
            this.showNotification('✅ Sesión iniciada correctamente', 'success');
            this.init(); // Reiniciar el flujo
            
        } catch (error) {
            this.showNotification(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async register(username, email, password) {
        try {
            // 1. Registrar usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                    emailRedirectTo: window.location.origin // Esto ayuda con la confirmación
                }
            });
            
            if (authError) throw authError;
            
            // 2. IMPORTANTE: NO crear perfil manualmente aquí
            // El trigger 'on_auth_user_created' en Supabase ya lo hace automáticamente
            // Si intentamos crear el perfil aquí, da error 409 porque ya existe
            
            console.log('✅ Registro exitoso. Trigger creará perfil automáticamente.');
            
            // 3. Mostrar mensaje apropiado
            if (authData.user && authData.user.identities && authData.user.identities.length > 0) {
                // Usuario creado, necesita confirmar email
                this.showNotification('✅ ¡Cuenta creada! Por favor, revisa tu correo para confirmarla.', 'success');
                
                // Redirigir a pantalla de login después de 3 segundos
                setTimeout(() => {
                    if (document.querySelector('.auth-modal')) {
                        document.querySelector('.auth-modal').remove();
                    }
                    this.showAuthModal(); // O mostrarPantallaLogin() si usas la nueva función
                }, 3000);
            } else {
                // Usuario ya existía o no necesita confirmación
                this.user = authData.user;
                this.showNotification('✅ ¡Bienvenido de nuevo!', 'success');
                this.startTutorial();
            }
            
        } catch (error) {
            console.error('Error en registro:', error);
            
            // Mostrar mensaje de error más amigable
            if (error.message.includes('already registered') || error.code === '23505') {
                this.showNotification('❌ Este email ya está registrado. ¿Has olvidado tu contraseña?', 'error');
            } else {
                this.showNotification(`❌ Error: ${error.message}`, 'error');
            }
        }
    }
    
    startDemoMode() {
        this.user = {
            id: 'demo-user-' + Date.now(),
            email: 'demo@f1manager.com',
            username: 'DemoPlayer'
        };
        
        this.showNotification('🎮 Modo demo activado', 'info');
        this.startTutorial();
    }
    
    async loadUserData() {
        if (!this.user) return;
        
        try {
            // Cargar escudería
            const { data: escuderias, error } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', this.user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (escuderias) {
                this.escuderia = escuderias;
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }
    
    // ===== TUTORIAL =====
    
    startTutorial() {
        this.tutorialCompleted = false;
        this.currentStep = 0;
        
        const tutorialSteps = [
            {
                title: "🏁 ¡Bienvenido a F1 Manager!",
                content: "Vas a crear y gestionar tu propia escudería de Fórmula 1. Tomarás decisiones estratégicas que afectarán tu rendimiento.",
                action: "Continuar"
            },
            {
                title: "💰 Simulación Financiera",
                content: "Antes de empezar, veamos de dónde vendrán tus ingresos y gastos:<br><br>" +
                        "📈 <strong>INGRESOS:</strong><br>" +
                        "• Apuestas Top 10: Hasta 1M€ por GP<br>" +
                        "• Evolución del coche: 500€ por punto<br>" +
                        "• Publicidad: 250K€ fijos por carrera<br><br>" +
                        "📉 <strong>GASTOS:</strong><br>" +
                        "• Pilotos: 1-5M€ anuales<br>" +
                        "• Fabricación: 10K€ por pieza<br>" +
                        "• Mantenimiento: 100K€ por nivel<br>" +
                        "• Seguridad: 50K€ anti-espionaje",
                action: "Entendido"
            },
            {
                title: "🏎️ Crear tu Escudería",
                content: "Elige el nombre y colores de tu equipo. Esto será tu identidad en el juego.",
                action: "Crear Escudería",
                input: true
            },
            {
                title: "👥 Contratar Pilotos",
                content: "Selecciona dos pilotos para tu equipo. ¡Cuidado con sus salarios! Cada piloto tiene habilidad, experiencia y coste diferente.",
                action: "Ver Pilotos Disponibles"
            },
            {
                title: "🔧 Primera Fabricación",
                content: "Ahora fabrica tu primera pieza para mejorar el coche. Cada pieza tarda 4 horas y cuesta 10,000€.",
                action: "Iniciar Fabricación"
            }
        ];
        
        this.showTutorialScreen(tutorialSteps[0], tutorialSteps);
    }
    
    showTutorialScreen(step, allSteps) {
        document.body.innerHTML = this.getTutorialHTML(step, allSteps);
        this.setupTutorialEvents(allSteps);
    }
    
    getTutorialHTML(step, allSteps) {
        return `
            <div class="tutorial-screen">
                <div class="tutorial-container">
                    <div class="tutorial-progress">
                        ${allSteps.map((s, i) => `
                            <div class="progress-step ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'completed' : ''}">
                                <div class="step-number">${i + 1}</div>
                                <div class="step-label">Paso ${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="tutorial-content">
                        <h2>${step.title}</h2>
                        <div class="tutorial-body">${step.content}</div>
                        
                        ${step.input ? `
                            <div class="tutorial-inputs">
                                <div class="form-group">
                                    <label for="escuderia-nombre-input">Nombre de tu escudería</label>
                                    <input type="text" id="escuderia-nombre-input" placeholder="Ej: Red Bull Racing" maxlength="30">
                                </div>
                                
                                <div class="color-picker-group">
                                    <div class="form-group">
                                        <label for="color-principal">Color principal</label>
                                        <input type="color" id="color-principal" value="#e10600">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="color-secundario">Color secundario</label>
                                        <input type="color" id="color-secundario" value="#ffffff">
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="tutorial-footer">
                        ${this.currentStep > 0 ? `
                            <button class="btn-secondary" id="tutorial-prev">
                                <i class="fas fa-arrow-left"></i> Anterior
                            </button>
                        ` : '<div></div>'}
                        
                        <button class="btn-primary" id="tutorial-next">
                            ${step.action} <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupTutorialEvents(steps) {
        // Botón siguiente
        document.getElementById('tutorial-next')?.addEventListener('click', () => {
            if (this.currentStep === 2) { // Paso de crear escudería
                this.createEscuderiaFromTutorial();
                return;
            }
            
            this.currentStep++;
            
            if (this.currentStep < steps.length) {
                this.showTutorialScreen(steps[this.currentStep], steps);
            } else {
                this.completeTutorial();
            }
        });
        
        // Botón anterior
        document.getElementById('tutorial-prev')?.addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.showTutorialScreen(steps[this.currentStep], steps);
            }
        });
    }
    
    async createEscuderiaFromTutorial() {
        const escuderiaNombre = document.getElementById('escuderia-nombre-input')?.value || 'Mi Escudería';
        const colorPrincipal = document.getElementById('color-principal')?.value || '#e10600';
        const colorSecundario = document.getElementById('color-secundario')?.value || '#ffffff';
        
        if (!escuderiaNombre.trim()) {
            this.showNotification('Por favor, ingresa un nombre para tu escudería', 'error');
            return;
        }
        
        try {
            const { data: escuderia, error } = await supabase
                .from('escuderias')
                .insert([
                    {
                        user_id: this.user.id,
                        nombre: escuderiaNombre,
                        dinero: 5000000, // CONFIG.INITIAL_MONEY
                        puntos: 0,
                        ranking: null,
                        color_principal: colorPrincipal,
                        color_secundario: colorSecundario,
                        nivel_ingenieria: 1,
                        creada_en: new Date().toISOString()
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
            
            this.escuderia = escuderia;
            this.tutorialCompleted = true;
            
            // Crear stats iniciales del coche
            await supabase
                .from('coches_stats')
                .insert([{ escuderia_id: escuderia.id }]);
            
            this.showNotification('🎉 ¡Escudería creada con éxito!', 'success');
            
            // Avanzar al siguiente paso del tutorial
            this.currentStep++;
            const tutorialSteps = [
                // ... mismos pasos que antes
            ];
            this.showTutorialScreen(tutorialSteps[this.currentStep], tutorialSteps);
            
        } catch (error) {
            console.error('Error creando escudería:', error);
            this.showNotification('❌ Error creando escudería: ' + error.message, 'error');
        }
    }
    
    async completeTutorial() {
        this.tutorialCompleted = true;
        this.showNotification('✅ Tutorial completado', 'success');
        await this.loadDashboard();
    }
    
    // ===== DASHBOARD =====
    
    async loadDashboard() {
        if (!this.escuderia) {
            console.error('No hay escudería para cargar dashboard');
            return;
        }
        
        console.log('📊 Cargando dashboard para:', this.escuderia.nombre);
        
        // 1. Inyectar el HTML completo del dashboard
        document.body.innerHTML = this.getDashboardHTML();
        
        // 2. Configurar eventos globales
        this.setupDashboardEvents();
        
        // 3. Cargar y mostrar datos
        await this.updateDashboardData();
        
        // 4. Iniciar sistemas
        this.startCountdownTimer();
        this.checkProductionStatus();
    }
    
    getDashboardHTML() {
        return `
            <div id="app">
                <!-- Header de Identidad -->
                <header class="dashboard-header">
                    <div class="escuderia-info">
                        <div class="escuderia-brand">
                            <div class="escuderia-logo" style="background: ${this.escuderia?.color_principal || '#e10600'}; border-color: ${this.escuderia?.color_secundario || '#ffffff'}"></div>
                            <div>
                                <h1 id="escuderia-nombre">${this.escuderia?.nombre || 'Mi Escudería'}</h1>
                                <p class="escuderia-id">#F1MANAGER</p>
                            </div>
                        </div>
                        <div class="stats-header">
                            <div class="stat-card">
                                <span class="stat-label">FONDOS</span>
                                <span class="stat-value" id="saldo">${this.formatMoney(this.escuderia?.dinero || 5000000)}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">PUNTOS</span>
                                <span class="stat-value" id="puntos">${this.escuderia?.puntos || 0}</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-label">RANKING</span>
                                <span class="stat-value" id="ranking">${this.escuderia?.ranking ? '#' + this.escuderia.ranking : '#-'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Panel de Pilotos -->
                <section class="panel-pilotos">
                    <h2><i class="fas fa-user"></i> TUS PILOTOS</h2>
                    <div class="pilotos-container" id="pilotos-container">
                        <div class="empty-pilotos">
                            <i class="fas fa-user-slash"></i>
                            <p>No tienes pilotos contratados</p>
                            <button class="btn-small" id="contratar-pilotos-btn">
                                <i class="fas fa-plus"></i> Contratar Pilotos
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Centro de Competición -->
                <section class="centro-competicion">
                    <div class="countdown-section">
                        <h2><i class="fas fa-clock"></i> CIERRE DE APUESTAS</h2>
                        <div class="countdown-timer">
                            <div class="time-block">
                                <span class="time-number" id="countdown-hours">23</span>
                                <span class="time-label">HORAS</span>
                            </div>
                            <span class="time-separator">:</span>
                            <div class="time-block">
                                <span class="time-number" id="countdown-minutes">45</span>
                                <span class="time-label">MINUTOS</span>
                            </div>
                            <span class="time-separator">:</span>
                            <div class="time-block">
                                <span class="time-number" id="countdown-seconds">18</span>
                                <span class="time-label">SEGUNDOS</span>
                            </div>
                        </div>
                        <div class="proximo-gp">
                            <h3 id="gp-nombre">GRAN PREMIO DE BARÉIN</h3>
                            <p id="gp-fecha"><i class="far fa-calendar"></i> 2-4 MARZO</p>
                            <p id="gp-circuito"><i class="fas fa-road"></i> Circuito Internacional de Sakhir</p>
                        </div>
                    </div>

                    <!-- Monitor de Fábrica -->
                    <div class="monitor-fabrica">
                        <h2><i class="fas fa-industry"></i> PRODUCCIÓN EN CURSO</h2>
                        <div class="fabrica-alert" id="fabrica-alert">
                            <i class="fas fa-bell"></i>
                            <span id="piezas-nuevas">0</span> piezas nuevas
                        </div>
                        <div class="produccion-actual">
                            <div class="pieza-info">
                                <h4 id="pieza-actual">NINGUNA EN PRODUCCIÓN</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progreso-fabricacion" style="width: 0%"></div>
                                </div>
                                <p class="tiempo-restante" id="tiempo-restante-texto">-</p>
                            </div>
                            <div class="fabrica-cost">
                                <p>COSTE <span id="fabrica-costo">€10,000</span></p>
                                <p>PUNTOS <span id="fabrica-puntos">+10</span></p>
                            </div>
                            <button id="btn-recoger-pieza" class="btn-primary" disabled>
                                <i class="fas fa-box-open"></i> RECOGER PIEZA
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Estado del Coche -->
                <section class="estado-coche">
                    <h2><i class="fas fa-car"></i> ESTADO DEL COCHE</h2>
                    <div class="areas-coche" id="areas-coche">
                        <!-- Las áreas se cargarán dinámicamente -->
                    </div>
                    <div class="mejores-peores">
                        <div class="mejor-area">
                            <h4><i class="fas fa-trophy"></i> MEJOR</h4>
                            <p id="mejor-area">MOTOR</p>
                        </div>
                        <div class="peor-area">
                            <h4><i class="fas fa-wrench"></i> PEOR</h4>
                            <p id="peor-area">FRENOS</p>
                        </div>
                    </div>
                </section>

                <!-- Calendario y Estadísticas -->
                <section class="calendario-estadisticas">
                    <div class="calendario-section">
                        <h2><i class="far fa-calendar-alt"></i> PRÓXIMAS CARRERAS</h2>
                        <div class="calendar-list" id="calendar-list">
                            <!-- Las carreras se cargarán dinámicamente -->
                        </div>
                    </div>
                    <div class="estadisticas-section">
                        <h2><i class="fas fa-chart-bar"></i> TUS ESTADÍSTICAS</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Mejor Acierto</span>
                                <span class="stat-value">85%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Ingresos Totales</span>
                                <span class="stat-value">€2.5M</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Piezas Fabricadas</span>
                                <span class="stat-value">12</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Carreras Jugadas</span>
                                <span class="stat-value">3</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Navegación Inferior -->
                <nav class="dashboard-nav">
                    <button class="nav-btn" data-tab="taller">
                        <i class="fas fa-tools"></i>
                        <span>TALLER</span>
                    </button>
                    <button class="nav-btn" data-tab="almacen">
                        <i class="fas fa-warehouse"></i>
                        <span>ALMACÉN</span>
                    </button>
                    <button class="nav-btn" data-tab="mercado">
                        <i class="fas fa-store"></i>
                        <span>MERCADO</span>
                    </button>
                    <button class="nav-btn" data-tab="presupuesto">
                        <i class="fas fa-chart-pie"></i>
                        <span>PRESUPUESTO</span>
                    </button>
                    <button class="nav-btn" data-tab="clasificacion">
                        <i class="fas fa-list-ol"></i>
                        <span>CLASIFICACIÓN</span>
                    </button>
                </nav>
            </div>
        `;
    }
    
    setupDashboardEvents() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
            });
        });
        
        // Botón contratar pilotos
        document.getElementById('contratar-pilotos-btn')?.addEventListener('click', () => {
            this.showPilotosMarket();
        });
        
        // Botón recoger pieza
        document.getElementById('btn-recoger-pieza')?.addEventListener('click', () => {
            this.collectPiece();
        });
    }
    
    async updateDashboardData() {
        // Actualizar datos del header
        if (this.escuderia) {
            document.getElementById('escuderia-nombre').textContent = this.escuderia.nombre;
            document.getElementById('saldo').textContent = this.formatMoney(this.escuderia.dinero);
            document.getElementById('puntos').textContent = this.escuderia.puntos;
            document.getElementById('ranking').textContent = this.escuderia.ranking ? '#' + this.escuderia.ranking : '#-';
        }
        
        // Cargar pilotos
        await this.loadPilotos();
        
        // Cargar estado del coche
        await this.loadCarStatus();
        
        // Cargar producción actual
        await this.loadCurrentProduction();
        
        // Cargar calendario
        await this.loadCalendar();
    }
    
    // ===== MÉTODOS DE CARGA DE DATOS =====
    // [Los métodos loadPilotos(), loadCarStatus(), etc. se mantienen igual que en tu código original]
    // ... (copia aquí todos los métodos desde "async loadPilotos()" hasta "renderCalendar()" de tu código original)
    
    async loadPilotos() {
        try {
            const { data: pilotos, error } = await supabase
                .from('pilotos_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true);
            
            if (error) throw error;
            
            this.renderPilotos(pilotos || []);
            
        } catch (error) {
            console.error('Error cargando pilotos:', error);
        }
    }
    
    renderPilotos(pilotos) {
        const container = document.getElementById('pilotos-container');
        if (!container) return;
        
        if (pilotos.length === 0) {
            container.innerHTML = `
                <div class="empty-pilotos">
                    <i class="fas fa-user-slash"></i>
                    <p>No tienes pilotos contratados</p>
                    <button class="btn-small" id="contratar-pilotos-btn">
                        <i class="fas fa-plus"></i> Contratar Pilotos
                    </button>
                </div>
            `;
            
            document.getElementById('contratar-pilotos-btn')?.addEventListener('click', () => {
                this.showPilotosMarket();
            });
            
            return;
        }
        
        container.innerHTML = pilotos.map(piloto => `
            <div class="piloto-card">
                <div class="piloto-header">
                    <h3>${piloto.nombre}</h3>
                    <span class="piloto-nacionalidad">🇪🇸</span>
                </div>
                <div class="piloto-stats">
                    <div class="stat">
                        <span class="label">Habilidad</span>
                        <span class="value">${piloto.habilidad || 80}/100</span>
                    </div>
                    <div class="stat">
                        <span class="label">Experiencia</span>
                        <span class="value">${piloto.experiencia || 5} años</span>
                    </div>
                </div>
                <div class="piloto-contract">
                    <p>Contrato: <strong>${piloto.carreras_restantes || 21} carreras</strong></p>
                    <p>Salario: <strong>${this.formatMoney(piloto.salario || 1000000)}/año</strong></p>
                </div>
                <div class="piloto-actions">
                    <button class="btn-small" onclick="window.f1Manager.renovarContrato('${piloto.id}')">
                        <i class="fas fa-file-signature"></i> Renovar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadCarStatus() {
        try {
            const { data: carStats, error } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            this.renderCarStatus(carStats || this.createDefaultCarStats());
            
        } catch (error) {
            console.error('Error cargando estado del coche:', error);
        }
    }
    
    createDefaultCarStats() {
        const CAR_AREAS = [
            { id: 'suelo', name: 'Suelo y Difusor', icon: 'fas fa-car-side', color: '#FF5722' },
            { id: 'motor', name: 'Unidad de Potencia', icon: 'fas fa-bolt', color: '#FF9800' },
            { id: 'aleron_delantero', name: 'Alerón Delantero', icon: 'fas fa-angle-double-up', color: '#4CAF50' },
            { id: 'caja_cambios', name: 'Caja de Cambios', icon: 'fas fa-cogs', color: '#2196F3' },
            { id: 'pontones', name: 'Pontones', icon: 'fas fa-water', color: '#3F51B5' },
            { id: 'suspension', name: 'Suspensión', icon: 'fas fa-compress-alt', color: '#9C27B0' },
            { id: 'aleron_trasero', name: 'Alerón Trasero', icon: 'fas fa-angle-double-down', color: '#E91E63' },
            { id: 'chasis', name: 'Chasis', icon: 'fas fa-car', color: '#795548' },
            { id: 'frenos', name: 'Frenos', icon: 'fas fa-stop-circle', color: '#F44336' },
            { id: 'volante', name: 'Volante', icon: 'fas fa-circle', color: '#00BCD4' },
            { id: 'electronica', name: 'Electrónica', icon: 'fas fa-microchip', color: '#607D8B' }
        ];
        
        const stats = {
            escuderia_id: this.escuderia.id
        };
        
        CAR_AREAS.forEach(area => {
            stats[`${area.id}_nivel`] = 0;
            stats[`${area.id}_progreso`] = 0;
        });
        
        return stats;
    }
    
    renderCarStatus(stats) {
        const CAR_AREAS = [
            { id: 'suelo', name: 'Suelo y Difusor', icon: 'fas fa-car-side', color: '#FF5722' },
            { id: 'motor', name: 'Unidad de Potencia', icon: 'fas fa-bolt', color: '#FF9800' },
            { id: 'aleron_delantero', name: 'Alerón Delantero', icon: 'fas fa-angle-double-up', color: '#4CAF50' },
            { id: 'caja_cambios', name: 'Caja de Cambios', icon: 'fas fa-cogs', color: '#2196F3' },
            { id: 'pontones', name: 'Pontones', icon: 'fas fa-water', color: '#3F51B5' },
            { id: 'suspension', name: 'Suspensión', icon: 'fas fa-compress-alt', color: '#9C27B0' },
            { id: 'aleron_trasero', name: 'Alerón Trasero', icon: 'fas fa-angle-double-down', color: '#E91E63' },
            { id: 'chasis', name: 'Chasis', icon: 'fas fa-car', color: '#795548' },
            { id: 'frenos', name: 'Frenos', icon: 'fas fa-stop-circle', color: '#F44336' },
            { id: 'volante', name: 'Volante', icon: 'fas fa-circle', color: '#00BCD4' },
            { id: 'electronica', name: 'Electrónica', icon: 'fas fa-microchip', color: '#607D8B' }
        ];
        
        const container = document.getElementById('areas-coche');
        if (!container) return;
        
        let mejorArea = { nombre: 'Ninguna', nivel: -1 };
        let peorArea = { nombre: 'Ninguna', nivel: 11 };
        
        container.innerHTML = CAR_AREAS.map(area => {
            const nivel = stats[`${area.id}_nivel`] || 0;
            const progreso = stats[`${area.id}_progreso`] || 0;
            const porcentaje = (progreso / 20) * 100; // 20 piezas por nivel
            
            // Actualizar mejor/peor área
            if (nivel > mejorArea.nivel) {
                mejorArea = { nombre: area.name, nivel };
            }
            if (nivel < peorArea.nivel) {
                peorArea = { nombre: area.name, nivel };
            }
            
            return `
                <div class="area-item" data-area="${area.id}">
                    <div class="area-icon" style="color: ${area.color}">
                        <i class="${area.icon}"></i>
                    </div>
                    <span class="area-nombre">${area.name}</span>
                    <div class="area-nivel">
                        <span>Nivel</span>
                        <span class="nivel-valor">${nivel}</span>
                    </div>
                    <div class="area-progreso">
                        <span>${progreso}/20</span>
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${porcentaje}%"></div>
                        </div>
                    </div>
                    <button class="btn-fabricar" onclick="window.f1Manager.iniciarFabricacion('${area.id}')">
                        <i class="fas fa-hammer"></i> Fabricar (€10,000)
                    </button>
                </div>
            `;
        }).join('');
        
        // Actualizar mejor/peor área
        document.getElementById('mejor-area').textContent = mejorArea.nombre;
        document.getElementById('peor-area').textContent = peorArea.nombre;
    }
    
    async loadCurrentProduction() {
        try {
            const { data: production, error } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            this.updateFactoryUI(production);
            
        } catch (error) {
            console.error('Error cargando producción:', error);
        }
    }
    
    updateFactoryUI(production) {
        const CAR_AREAS = [
            { id: 'suelo', name: 'Suelo y Difusor' },
            { id: 'motor', name: 'Unidad de Potencia' },
            { id: 'aleron_delantero', name: 'Alerón Delantero' },
            { id: 'caja_cambios', name: 'Caja de Cambios' },
            { id: 'pontones', name: 'Pontones' },
            { id: 'suspension', name: 'Suspensión' },
            { id: 'aleron_trasero', name: 'Alerón Trasero' },
            { id: 'chasis', name: 'Chasis' },
            { id: 'frenos', name: 'Frenos' },
            { id: 'volante', name: 'Volante' },
            { id: 'electronica', name: 'Electrónica' }
        ];
        
        const statusEl = document.getElementById('pieza-actual');
        const progressEl = document.getElementById('progreso-fabricacion');
        const timeEl = document.getElementById('tiempo-restante-texto');
        const collectBtn = document.getElementById('btn-recoger-pieza');
        
        if (!production) {
            if (statusEl) statusEl.textContent = 'NINGUNA EN PRODUCCIÓN';
            if (progressEl) progressEl.style.width = '0%';
            if (timeEl) timeEl.textContent = '-';
            if (collectBtn) collectBtn.disabled = true;
            return;
        }
        
        const area = CAR_AREAS.find(a => a.id === production.area);
        const areaName = area ? area.name : production.area;
        
        if (statusEl) {
            statusEl.textContent = `${areaName} NIVEL ${production.nivel}`;
        }
        
        // Calcular progreso
        const startTime = new Date(production.inicio_fabricacion);
        const endTime = new Date(production.fin_fabricacion);
        const now = new Date();
        
        const totalTime = endTime - startTime;
        const elapsed = now - startTime;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        const remaining = endTime - now;
        
        if (progressEl) progressEl.style.width = `${progress}%`;
        
        if (timeEl) {
            if (remaining <= 0) {
                timeEl.textContent = '¡LISTO PARA RECOGER!';
                if (collectBtn) collectBtn.disabled = false;
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                timeEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
                if (collectBtn) collectBtn.disabled = true;
            }
        }
    }
    
    async loadCalendar() {
        try {
            const { data: calendario, error } = await supabase
                .from('calendario_gp')
                .select('*')
                .order('fecha_inicio', { ascending: true })
                .limit(5);
            
            if (error) throw error;
            
            this.renderCalendar(calendario || []);
            
        } catch (error) {
            console.error('Error cargando calendario:', error);
        }
    }
    
    renderCalendar(calendario) {
        const container = document.getElementById('calendar-list');
        if (!container) return;
        
        if (calendario.length === 0) {
            container.innerHTML = '<p class="no-calendar">No hay carreras programadas</p>';
            return;
        }
        
        container.innerHTML = calendario.map(gp => `
            <div class="calendar-item">
                <h4>${gp.nombre}</h4>
                <p class="gp-date">
                    <i class="far fa-calendar"></i>
                    ${new Date(gp.fecha_inicio).toLocaleDateString('es-ES')}
                </p>
                <p class="gp-circuit">
                    <i class="fas fa-road"></i>
                    ${gp.circuito}
                </p>
                ${!gp.cerrado_apuestas ? `
                    <button class="btn-small" onclick="window.f1Manager.apostarGP('${gp.id}')">
                        <i class="fas fa-bet"></i> Apostar
                    </button>
                ` : ''}
            </div>
        `).join('');
    }
    
    // ===== UTILIDADES =====
    
    startCountdownTimer() {
        // Temporizador para el cierre de apuestas
        const updateCountdown = () => {
            const now = new Date();
            const target = new Date();
            target.setDate(target.getDate() + 1);
            target.setHours(23, 59, 0, 0);
            
            const diff = target - now;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const hoursEl = document.getElementById('countdown-hours');
            const minutesEl = document.getElementById('countdown-minutes');
            const secondsEl = document.getElementById('countdown-seconds');
            
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    checkProductionStatus() {
        // Verificar periódicamente el estado de producción
        setInterval(async () => {
            if (this.escuderia) {
                await this.loadCurrentProduction();
            }
        }, 30000); // Cada 30 segundos
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // Eliminar notificaciones anteriores
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00a35c' : type === 'error' ? '#ff3860' : '#209cee'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
        
        // Añadir estilos de animación si no existen
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar la aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.f1Manager = new F1Manager();
});
