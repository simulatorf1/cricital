// ========================
// F1 MANAGER - MAIN.JS COMPLETO
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

// ========================
// 1. SISTEMA DE CARGA SEGURA DE SUPABASE
// ========================
console.log('🔧 Inicializando sistema seguro...');

// Variable global para Supabase
var supabase = null;

// Función para inicializar Supabase de forma SEGURA
function initSupabase() {
    console.log('🔍 Verificando Supabase...');
    
    // Simplemente devolver lo que YA debería estar en window
    if (window.supabase && window.supabase.auth) {
        console.log('✅ Supabase encontrado en window');
        return window.supabase;
    }
    
    console.error('❌ CRÍTICO: Supabase no en window');
    console.error('Estado de window.supabase:', window.supabase);
    
    // Intentar crear cliente de emergencia
    try {
        if (typeof supabase !== 'undefined') {
            window.supabase = supabase.createClient(
                'https://xbnbbmhcveyzrvvmdktg.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg'
            );
            console.log('✅ Cliente creado de emergencia');
            return window.supabase;
        }
    } catch (e) {
        console.error('❌ No se pudo crear cliente:', e);
    }
    
    return null;
}
    

// ========================
// 2. INICIALIZACIÓN PRINCIPAL
// ========================
async function iniciarAplicacion() {
    console.log('🚀 Iniciando aplicación F1 Manager...');
    
    // Inicializar Supabase
    supabase = await initSupabase();
    
    if (!supabase) {
        mostrarErrorCritico('No se pudo conectar con la base de datos');
        return;
    }
    
    console.log('✅ Supabase inicializado correctamente');
    
    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        console.log('✅ Usuario autenticado:', session.user.email);
        // Iniciar el juego
        window.f1Manager = new F1Manager(session.user);
    } else {
        console.log('👤 No hay sesión, mostrar login');
        mostrarPantallaLogin();
    }
}

// ========================
// 3. PANTALLAS DE AUTENTICACIÓN
// ========================
function mostrarErrorCritico(mensaje) {
    document.body.innerHTML = `
        <div style="
            min-height: 100vh;
            background: #15151e;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 20px;
        ">
            <div>
                <h1 style="color: #e10600; margin-bottom: 20px;">❌ ERROR CRÍTICO</h1>
                <p>${mensaje}</p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #e10600;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">
                    Reintentar
                </button>
            </div>
        </div>
    `;
}

function mostrarPantallaLogin() {
    document.body.innerHTML = `
        <div class="login-screen">
            <div class="login-container">
                <div class="login-header">
                    <h1>F1 MANAGER E-STRATEGY</h1>
                    <p>Gestiona tu escudería de Fórmula 1</p>
                </div>
                
                <div id="login-error" class="error-message"></div>
                <div id="login-success" class="success-message"></div>
                
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
                        CREAR CUENTA
                    </button>
                </div>
                
                <div class="login-footer">
                    <p>Un juego de gestión 100% online</p>
                    <p>v1.0.0</p>
                </div>
            </div>
        </div>
        
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
            
            .success-message {
                background: rgba(0, 163, 92, 0.2);
                color: #00a35c;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
                border: 1px solid #00a35c;
            }
            
            .success-message.show {
                display: block;
            }
        </style>
    `;
    
    // Configurar eventos
    document.getElementById('btn-login').addEventListener('click', manejarLogin);
    document.getElementById('btn-register').addEventListener('click', mostrarPantallaRegistro);
    
    // Permitir Enter para login
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') manejarLogin();
    });
}

function mostrarPantallaRegistro() {
    document.body.innerHTML = `
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
                <div id="register-success" class="success-message"></div>
                
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
                    CREAR CUENTA
                </button>
                
                <div class="register-footer">
                    <p>Recibirás 5,000,000€ para empezar</p>
                </div>
            </div>
        </div>
        
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
        </style>
    `;
    
    // Configurar eventos
    document.getElementById('btn-back').addEventListener('click', mostrarPantallaLogin);
    document.getElementById('btn-register-submit').addEventListener('click', manejarRegistro);
}

async function manejarLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const successDiv = document.getElementById('login-success');
    
    if (!email || !password) {
        mostrarMensaje('Por favor, completa todos los campos', errorDiv);
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        mostrarMensaje('✅ Sesión iniciada correctamente', successDiv);
        
        // Recargar la aplicación
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Error en login:', error);
        mostrarMensaje('Usuario o contraseña incorrectos', errorDiv);
    }
}

async function manejarRegistro() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    if (!username || !email || !password) {
        mostrarMensaje('Por favor, completa todos los campos', errorDiv);
        return;
    }
    
    if (password.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', errorDiv);
        return;
    }
    
    try {
        // SOLO registrar en Auth - El trigger creará el perfil automáticamente
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: window.location.origin
            }
        });
        
        if (authError) throw authError;
        
        mostrarMensaje('✅ ¡Cuenta creada! Revisa tu correo para confirmarla.', successDiv);
        
        // Volver a login después de 3 segundos
        setTimeout(() => mostrarPantallaLogin(), 3000);
        
    } catch (error) {
        console.error('Error en registro:', error);
        mostrarMensaje(error.message || 'Error creando la cuenta', errorDiv);
    }
}

function mostrarMensaje(mensaje, elemento) {
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.classList.add('show');
        setTimeout(() => elemento.classList.remove('show'), 5000);
    }
}

// ========================
// 4. CLASE F1Manager PRINCIPAL
// ========================
class F1Manager {
    constructor(user) {
        console.log('🚗 Creando F1Manager para:', user.email);
        this.user = user;
        this.escuderia = null;
        this.pilotos = [];
        this.carStats = null;
        this.proximoGP = null;
        
        this.init();
    }
    async esperarSupabase() {
        console.log('⏳ Esperando Supabase...');
        let intentos = 0;
        while (intentos < 50) {
            if (window.supabase && window.supabase.auth) {
                console.log('✅ Supabase listo después de ' + (intentos * 100) + 'ms');
                return window.supabase;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            intentos++;
        }
        console.error('❌ Supabase nunca se inicializó');
        return null;
    }
    async init() {
        console.log('🔧 Inicializando juego...');
        
        // 1. Cargar datos del usuario
        await this.loadUserData();
        
        // 2. Si no tiene escudería, mostrar tutorial
        if (!this.escuderia) {
            console.log('📝 Usuario sin escudería, mostrando tutorial');
            this.mostrarTutorialInicial();
            return;
        }
        
        // 3. Si tiene escudería, cargar dashboard completo
        console.log('📊 Usuario con escudería, cargando dashboard');
        await this.cargarDashboardCompleto();
    }
    
    async loadUserData() {
        console.log('📥 Cargando datos del usuario...');
        
        try {
            // Buscar escudería del usuario
            const { data: escuderias, error } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', this.user.id)
                .maybeSingle();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('ℹ️ Usuario sin escudería (normal para nuevo usuario)');
                    this.escuderia = null;
                } else {
                    console.error('Error cargando escudería:', error);
                }
                return;
            }
            
            if (escuderias) {
                this.escuderia = escuderias;
                console.log('✅ Escudería cargada:', escuderias.nombre);
                
                // Cargar stats del coche
                await this.cargarCarStats();
            }
            
        } catch (error) {
            console.error('Error en loadUserData:', error);
        }
    }
    
    async cargarCarStats() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats, error } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .maybeSingle();
            
            if (!error && stats) {
                this.carStats = stats;
            }
        } catch (error) {
            console.error('Error cargando car stats:', error);
        }
    }
    
    mostrarTutorialInicial() {
        document.body.innerHTML = `
            <div class="tutorial-screen">
                <div class="tutorial-container">
                    <div class="tutorial-header">
                        <h1>🏁 ¡BIENVENIDO A F1 MANAGER!</h1>
                        <p>Crea tu escudería de Fórmula 1</p>
                    </div>
                    
                    <div class="tutorial-content">
                        <div class="tutorial-step">
                            <h2>🏎️ PASO 1: NOMBRE DE TU ESCUDERÍA</h2>
                            <p>Elige un nombre único para tu equipo. Este será tu identidad en el juego.</p>
                            
                            <div class="tutorial-form">
                                <input type="text" id="escuderia-nombre" 
                                       placeholder="Ej: McLaren Racing, Ferrari, etc." 
                                       maxlength="30"
                                       style="width: 100%; padding: 12px; margin: 20px 0; border-radius: 5px; border: 2px solid #00d2be; background: rgba(255,255,255,0.1); color: white;">
                            </div>
                        </div>
                        
                        <div class="tutorial-actions">
                            <button class="btn-crear-escuderia" id="btn-crear-escuderia">
                                <i class="fas fa-flag-checkered"></i>
                                CREAR MI ESCUDERÍA
                            </button>
                        </div>
                    </div>
                    
                    <div class="tutorial-footer">
                        <p><i class="fas fa-info-circle"></i> Recibirás 5,000,000€ para empezar tu aventura</p>
                    </div>
                </div>
            </div>
            
            <style>
                .tutorial-screen {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #15151e 0%, #1a1a2e 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                
                .tutorial-container {
                    background: rgba(42, 42, 56, 0.95);
                    border-radius: 20px;
                    padding: 40px;
                    width: 100%;
                    max-width: 600px;
                    border: 3px solid #00d2be;
                    box-shadow: 0 15px 40px rgba(0, 210, 190, 0.3);
                }
                
                .tutorial-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                }
                
                .tutorial-header h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5rem;
                    background: linear-gradient(90deg, #00d2be, #e10600);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 10px;
                }
                
                .tutorial-header p {
                    color: #aaa;
                    font-size: 1.1rem;
                }
                
                .tutorial-step {
                    margin-bottom: 40px;
                }
                
                .tutorial-step h2 {
                    color: #00d2be;
                    margin-bottom: 15px;
                    font-size: 1.5rem;
                }
                
                .tutorial-step p {
                    color: #ccc;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                
                .tutorial-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-top: 30px;
                }
                
                .btn-crear-escuderia, .btn-saltar-tutorial {
                    padding: 18px;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .btn-crear-escuderia {
                    background: linear-gradient(135deg, #00d2be, #009688);
                    color: white;
                }
                
                .btn-saltar-tutorial {
                    background: transparent;
                    border: 2px solid #e10600;
                    color: #e10600;
                }
                
                .btn-crear-escuderia:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 210, 190, 0.4);
                }
                
                .btn-saltar-tutorial:hover {
                    background: rgba(225, 6, 0, 0.1);
                    transform: translateY(-3px);
                }
                
                .tutorial-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    color: #888;
                    font-size: 0.9rem;
                }
                
                .tutorial-footer i {
                    color: #00d2be;
                    margin-right: 8px;
                }
            </style>
        `;
        
        // Configurar eventos
        document.getElementById('btn-crear-escuderia').addEventListener('click', () => this.crearEscuderiaDesdeTutorial());
    }
    
    async crearEscuderiaDesdeTutorial() {
        const nombre = document.getElementById('escuderia-nombre').value.trim();
        
        if (!nombre) {
            alert('⚠️ Por favor, ingresa un nombre para tu escudería');
            return;
        }
        
        console.log('🏗️ Creando escudería para usuario:', this.user.id);
        
        try {
            // 1. PRIMERO: Asegurar que el usuario existe en public.users
            console.log('👤 Verificando usuario en public.users...');
            
            const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('id', this.user.id)
                .maybeSingle();
            
            if (userError && userError.code !== 'PGRST116') {
                console.error('❌ Error verificando usuario:', userError);
            }
            
            // Si no existe, crearlo
            if (!existingUser) {
                console.log('➕ Creando usuario en public.users...');
                
                const { error: createUserError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: this.user.id,
                            username: this.user.user_metadata?.username || nombre,
                            email: this.user.email,
                            created_at: new Date().toISOString()
                        }
                    ]);
                
                if (createUserError) {
                    console.warn('⚠️ Error creando usuario (puede ser duplicado):', createUserError.message);
                    // Continuar de todas formas
                } else {
                    console.log('✅ Usuario creado en public.users');
                }
            } else {
                console.log('✅ Usuario ya existe en public.users');
            }
            
            // 2. ESPERAR 1 segundo para asegurar
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. VERIFICAR si YA existe escudería (por si acaso)
            const { data: existingEscuderia, error: escError } = await supabase
                .from('escuderias')
                .select('id')
                .eq('user_id', this.user.id)
                .maybeSingle();
            
            if (existingEscuderia) {
                console.log('✅ Escudería ya existe, cargando datos...');
                this.escuderia = existingEscuderia;
                await this.cargarDashboardCompleto();
                return;
            }
            
            // 4. CREAR ESCUDERÍA
            console.log('🏎️ Creando nueva escudería...');
            const { data: escuderia, error } = await supabase
                .from('escuderias')
                .insert([
                    {
                        user_id: this.user.id,
                        nombre: nombre,
                        dinero: 5000000,
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
            
            if (error) {
                // Si es error de duplicado (ya existe)
                if (error.code === '23505' || error.message.includes('duplicate')) {
                    console.log('🔄 Escudería ya existe, buscando...');
                    const { data: foundEscuderia } = await supabase
                        .from('escuderias')
                        .select('*')
                        .eq('user_id', this.user.id)
                        .single();
                    
                    this.escuderia = foundEscuderia;
                } else {
                    throw error;
                }
            } else {
                this.escuderia = escuderia;
                console.log('✅ Escudería creada:', escuderia.nombre);
            }
            
            // 5. CREAR STATS DEL COCHE (si no existen) - CORREGIDO
            console.log('🔧 Creando stats del coche...');
            try {
                const { error: statsError } = await supabase
                    .from('coches_stats')
                    .insert([{ escuderia_id: this.escuderia.id }]);
                
                if (statsError) {
                    console.log('📝 Stats ya existían o error menor:', statsError.message);
                }
            } catch (statsErr) {
                console.log('📝 Error creando stats (normal si ya existen):', statsErr.message);
            }
            
            // 6. VERIFICAR que this.escuderia está definido
            if (!this.escuderia || !this.escuderia.id) {
                console.error('❌ ERROR CRÍTICO: this.escuderia es undefined');
                throw new Error('La escudería no se creó correctamente');
            }
            
            // 7. CARGAR DASHBOARD
            console.log('🎉 Todo listo, cargando dashboard...');
            await this.cargarDashboardCompleto();
            
        } catch (error) {
            console.error('❌ Error en crearEscuderiaDesdeTutorial:', error);
            
            let mensaje = 'Error: ' + (error.message || 'Desconocido');
            
            if (error.code === '23503') {
                mensaje = '❌ ERROR: El usuario no existe en la base de datos.';
            } else if (error.code === '23505') {
                mensaje = '✅ Ya tienes una escudería. Cargando juego...';
                // Forzar recarga
                setTimeout(() => location.reload(), 1000);
                return;
            } else if (error.message.includes('undefined')) {
                mensaje = '⚠️ Error técnico. Por favor, recarga la página y prueba de nuevo.';
                setTimeout(() => location.reload(), 2000);
                return;
            }
            
            alert(mensaje);
        }
    }
    
    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard COMPLETO con CSS...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }
        
        // 1. PRIMERO crear el HTML COMPLETO (sin datos)
        document.body.innerHTML = `
            <div id="app">
                <!-- Loading Screen -->
                <div id="loading-screen">
                    <div class="loading-content">
                        <div class="f1-logo">
                            <i class="fas fa-flag-checkered"></i>
                        </div>
                        <h1>F1 MANAGER E-STRATEGY</h1>
                        <div class="loading-bar">
                            <div class="loading-progress"></div>
                        </div>
                        <p class="loading-text">Cargando tu escudería...</p>
                    </div>
                </div>
                
                <!-- Header -->
                <header class="dashboard-header">
                    <div class="header-top">
                        <div class="logo-section">
                            <div class="logo">
                                <i class="fas fa-flag-checkered"></i>
                                <span id="escuderia-nombre">${this.escuderia.nombre}</span>
                            </div>
                            <span class="team-tag">#F1MANAGER</span>
                        </div>
                        
                        <div class="stats-header">
                            <div class="stat-card money">
                                <i class="fas fa-coins"></i>
                                <div>
                                    <span class="stat-label">FONDOS</span>
                                    <span class="stat-value" id="money-value">€${this.escuderia?.dinero?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                            <div class="stat-card points">
                                <i class="fas fa-trophy"></i>
                                <div>
                                    <span class="stat-label">PUNTOS</span>
                                    <span class="stat-value" id="points-value">${this.escuderia.puntos || 0}</span>
                                </div>
                            </div>
                            <div class="stat-card ranking">
                                <i class="fas fa-medal"></i>
                                <div>
                                    <span class="stat-label">RANKING</span>
                                    <span class="stat-value" id="ranking-value">#${this.escuderia.ranking || '-'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="user-menu">
                            <button class="user-btn" id="user-menu-btn">
                                <i class="fas fa-user"></i>
                                <span>${this.user.email?.split('@')[0] || 'Usuario'}</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="user-dropdown" id="user-dropdown">
                                <a href="#" id="refresh-btn"><i class="fas fa-sync-alt"></i> Actualizar</a>
                                <a href="#" id="settings-btn"><i class="fas fa-cog"></i> Configuración</a>
                                <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tabs Navigation -->
                    <nav class="tabs-navigation">
                        <button class="tab-btn active" data-tab="principal">
                            <i class="fas fa-home"></i> Principal
                        </button>
                        <button class="tab-btn" data-tab="taller">
                            <i class="fas fa-tools"></i> Taller
                        </button>
                        <button class="tab-btn" data-tab="almacen">
                            <i class="fas fa-warehouse"></i> Almacén
                        </button>
                        <button class="tab-btn" data-tab="mercado">
                            <i class="fas fa-shopping-cart"></i> Mercado
                        </button>
                        <button class="tab-btn" data-tab="presupuesto">
                            <i class="fas fa-chart-pie"></i> Presupuesto
                        </button>
                        <button class="tab-btn" data-tab="clasificacion">
                            <i class="fas fa-medal"></i> Clasificación
                        </button>
                    </nav>
                </header>
                
                <!-- Main Content -->
                <main class="dashboard-content">
                    <!-- Tab Principal -->
                    <div id="tab-principal" class="tab-content active">
                        <!-- Panel de Pilotos -->
                        <section class="panel-pilotos">
                            <div class="section-header">
                                <h2><i class="fas fa-user"></i> TUS PILOTOS</h2>
                                <button class="btn-primary" id="contratar-pilotos-btn">
                                    <i class="fas fa-plus"></i> Contratar Pilotos
                                </button>
                            </div>
                            <div id="pilotos-container" class="pilotos-container">
                                <div class="empty-state">
                                    <i class="fas fa-user-slash"></i>
                                    <p>No tienes pilotos contratados</p>
                                    <button class="btn-primary" id="contratar-primer-piloto">
                                        <i class="fas fa-user-plus"></i> Contratar mi primer piloto
                                    </button>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Two Columns Layout -->
                        <div class="two-columns">
                            <!-- Columna 1: Countdown y GP -->
                            <div class="countdown-section">
                                <div class="section-header">
                                    <h2><i class="fas fa-clock"></i> PRÓXIMA CARRERA</h2>
                                    <span class="tag upcoming">EN VIVO</span>
                                </div>
                                <div id="countdown-container">
                                    <div class="countdown-timer">
                                        <div class="time-block">
                                            <span class="time-number" id="hours">00</span>
                                            <span class="time-label">Horas</span>
                                        </div>
                                        <div class="time-separator">:</div>
                                        <div class="time-block">
                                            <span class="time-number" id="minutes">00</span>
                                            <span class="time-label">Minutos</span>
                                        </div>
                                        <div class="time-separator">:</div>
                                        <div class="time-block">
                                            <span class="time-number" id="seconds">00</span>
                                            <span class="time-label">Segundos</span>
                                        </div>
                                    </div>
                                    <div class="proximo-gp">
                                        <h3 id="gp-nombre">Cargando próximo GP...</h3>
                                        <div class="gp-info">
                                            <div class="gp-date">
                                                <i class="far fa-calendar"></i>
                                                <span id="gp-fecha">Fecha por confirmar</span>
                                            </div>
                                            <div class="gp-circuit">
                                                <i class="fas fa-map-marker-alt"></i>
                                                <span id="gp-circuito">Circuito por confirmar</span>
                                            </div>
                                        </div>
                                        <button class="btn-primary" id="btn-apostar">
                                            <i class="fas fa-coins"></i> HACER APUESTA
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Columna 2: Monitor de Fábrica -->
                            <div class="monitor-fabrica">
                                <div class="section-header">
                                    <h2><i class="fas fa-industry"></i> PRODUCCIÓN</h2>
                                    <div id="alerta-almacen" class="alerta-almacen" style="display: none;">
                                        <i class="fas fa-bell"></i>
                                        <span>¡Piezas nuevas en almacén!</span>
                                    </div>
                                </div>
                                <div id="produccion-actual" class="produccion-actual">
                                    <div class="empty-state">
                                        <i class="fas fa-industry"></i>
                                        <p>No hay producción en curso</p>
                                        <button class="btn-primary" id="iniciar-fabricacion-btn">
                                            <i class="fas fa-hammer"></i> Iniciar primera fabricación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Análisis de Rendimiento -->
                        <section class="analisis-rendimiento">
                            <div class="section-header">
                                <h2><i class="fas fa-tachometer-alt"></i> ESTADO DEL COCHE</h2>
                                <div class="performance-summary">
                                    <div class="perf-best">
                                        <i class="fas fa-caret-up"></i>
                                        <span id="best-area">Mejor: Motor</span>
                                    </div>
                                    <div class="perf-worst">
                                        <i class="fas fa-caret-down"></i>
                                        <span id="worst-area">Peor: Frenos</span>
                                    </div>
                                </div>
                            </div>
                            <div id="areas-coche" class="areas-coche">
                                <!-- Las áreas se cargarán dinámicamente -->
                            </div>
                        </section>
                        
                        <!-- Estadísticas y Calendario -->
                        <section class="panel-estadisticas">
                            <div class="section-header">
                                <h2><i class="fas fa-chart-bar"></i> ESTADÍSTICAS Y CALENDARIO</h2>
                            </div>
                            <div class="stats-calendar-grid">
                                <div class="mini-calendar">
                                    <h3><i class="far fa-calendar"></i> Próximas Carreras</h3>
                                    <div id="calendario-lista" class="calendar-list">
                                        <div class="calendar-item">
                                            <h4>Gran Premio de España</h4>
                                            <div class="calendar-date">
                                                <i class="far fa-clock"></i>
                                                <span>21-23 Junio 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="quick-stats">
                                    <h3><i class="fas fa-chart-line"></i> Tus Estadísticas</h3>
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <i class="fas fa-check-circle"></i>
                                            <div>
                                                <span class="stat-title">Mejor acierto</span>
                                                <span class="stat-number" id="mejor-acierto">0 pts</span>
                                            </div>
                                        </div>
                                        <div class="stat-item">
                                            <i class="fas fa-history"></i>
                                            <div>
                                                <span class="stat-title">Piezas fabricadas</span>
                                                <span class="stat-number" id="piezas-fabricadas">0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    
                    <!-- Otras pestañas -->
                    <div id="tab-taller" class="tab-content"></div>
                    <div id="tab-almacen" class="tab-content"></div>
                    <div id="tab-mercado" class="tab-content"></div>
                    <div id="tab-presupuesto" class="tab-content"></div>
                    <div id="tab-clasificacion" class="tab-content"></div>
                </main>
                
                <!-- Footer -->
                <footer class="dashboard-footer">
                    <div class="footer-content">
                        <div class="footer-logo">
                            <i class="fas fa-flag-checkered"></i>
                            <span>F1 Manager E-Strategy</span>
                        </div>
                        <div class="footer-links">
                            <a href="#"><i class="fas fa-question-circle"></i> Ayuda</a>
                            <a href="#"><i class="fas fa-book"></i> Reglas</a>
                            <a href="#"><i class="fas fa-users"></i> Comunidad</a>
                        </div>
                        <div class="footer-status">
                            <i class="fas fa-circle" style="color: #00a35c;"></i>
                            <span>Conectado</span>
                        </div>
                    </div>
                </footer>
            </div>
            
            <!-- Scripts -->
            <script>
                // Ocultar loading screen después de 1 segundo
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                }, 1000);
                
                // Configurar eventos del usuario
                document.getElementById('user-menu-btn').addEventListener('click', () => {
                    document.getElementById('user-dropdown').classList.toggle('show');
                });
                
                document.getElementById('logout-btn').addEventListener('click', async (e) => {
                    e.preventDefault();
                    await supabase.auth.signOut();
                    location.reload();
                });
                
                document.getElementById('refresh-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    location.reload();
                });
                
                // Cerrar dropdown al hacer clic fuera
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.user-menu')) {
                        document.getElementById('user-dropdown').classList.remove('show');
                    }
                });
            </script>
        `;
        
        // 2. LUEGO inicializar pestañas
        if (window.tabManager) {
            window.tabManager.setup();
        }
        
        // 3. FINALMENTE cargar datos
        const supabase = await this.esperarSupabase();
        if (!supabase) {
            console.error('❌ No se pudo cargar Supabase, usando datos de ejemplo');
            this.proximoGP = {
                nombre: 'Gran Premio de España',
                fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                circuito: 'Circuit de Barcelona-Catalunya'
            };
        } else {
            await this.loadCarStatus();
            await this.loadPilotos();
            await this.loadProximoGP();
        }
        
        // 4. Configurar eventos
        await this.cargarDatosDashboard();
        
        console.log('✅ Dashboard cargado correctamente con CSS');
    }
    
    // ========================
    // MÉTODOS AUXILIARES
    // ========================
    
    async loadCarStatus() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .single();
            
            if (stats) {
                this.carStats = stats;
                this.updateCarAreasUI();
            }
        } catch (error) {
            console.error('Error cargando stats:', error);
        }
    }
    
    async loadPilotos() {
        if (!this.escuderia) return;
        
        try {
            const { data: pilotos } = await supabase
                .from('pilotos_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true);
            
            if (pilotos && pilotos.length > 0) {
                this.pilotos = pilotos;
                this.updatePilotosUI();
            }
        } catch (error) {
            console.error('Error cargando pilotos:', error);
        }
    }
    
    async loadProximoGP() {
        // VERIFICAR primero que window.supabase existe
        if (!window.supabase || !window.supabase.from) {
            console.error('❌ window.supabase no está disponible en loadProximoGP');
            // Crear datos de ejemplo
            this.proximoGP = {
                nombre: 'Gran Premio de España',
                fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                circuito: 'Circuit de Barcelona-Catalunya'
            };
            this.updateCountdown();
            return;
        }
        
        try {
            const { data: gp, error } = await window.supabase
                .from('calendario_gp')
                .select('*')
                .eq('cerrado_apuestas', false)
                .gt('fecha_inicio', new Date().toISOString())
                .order('fecha_inicio', { ascending: true })
                .limit(1)
                .single();
            
            if (error) {
                console.error('❌ Error en consulta GP:', error.message);
                // Crear datos de ejemplo
                this.proximoGP = {
                    nombre: 'Gran Premio de España',
                    fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                    circuito: 'Circuit de Barcelona-Catalunya'
                };
            } else if (gp) {
                this.proximoGP = gp;
                console.log('✅ GP cargado:', gp.nombre);
            }
            
            this.updateCountdown();
            
        } catch (error) {
            console.error('❌ Error fatal en loadProximoGP:', error);
            // Crear datos de ejemplo
            this.proximoGP = {
                nombre: 'Gran Premio de España',
                fecha_inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
                circuito: 'Circuit de Barcelona-Catalunya'
            };
            this.updateCountdown();
        }
    }
    
    updateCarAreasUI() {
        const container = document.getElementById('areas-coche');
        if (!container || !this.carStats) return;
        
        container.innerHTML = window.CAR_AREAS.map(area => {
            const nivel = this.carStats[`${area.id}_nivel`] || 0;
            const progreso = this.carStats[`${area.id}_progreso`] || 0;
            const porcentaje = (progreso / CONFIG.PIECES_PER_LEVEL) * 100;
            
            return `
                <div class="area-item" style="border-left-color: ${area.color}">
                    <span class="area-nombre">${area.name}</span>
                    <div class="area-nivel">
                        <span>Nivel</span>
                        <span class="nivel-valor">${nivel}</span>
                    </div>
                    <div class="area-progreso">
                        Progreso: <span class="progreso-valor">${progreso}/20</span>
                    </div>
                    <div class="progress-bar-small">
                        <div class="progress-fill-small" style="width: ${porcentaje}%"></div>
                    </div>
                    <button class="btn-fabricar" data-area="${area.id}">
                        <i class="fas fa-hammer"></i> Fabricar (€${CONFIG.PIECES_PER_LEVEL.toLocaleString()})
                    </button>
                </div>
            `;
        }).join('');
        
        // Configurar eventos de botones de fabricación
        document.querySelectorAll('.btn-fabricar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const areaId = e.target.closest('.btn-fabricar').dataset.area;
                this.iniciarFabricacion(areaId);
            });
        });
    }
    
    // ========================
    // FUNCIONALIDADES PRINCIPALES
    // ========================
    
    iniciarFabricacion(areaId) {
        console.log('🛠️ Iniciando fabricación para:', areaId);
        
        if (!window.fabricacionManager) {
            console.error('❌ fabricacionManager no está inicializado');
            return;
        }
        
        window.fabricacionManager.startFabrication(areaId);
    }
    
    showNotification(mensaje, tipo = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 
                             tipo === 'error' ? 'exclamation-circle' : 
                             'info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    async updateEscuderiaMoney() {
        if (!this.escuderia) return;
        
        try {
            const { error } = await supabase
                .from('escuderias')
                .update({ dinero: this.escuderia.dinero })
                .eq('id', this.escuderia.id);
            
            if (!error) {
                const moneyValue = document.getElementById('money-value');
                if (moneyValue) {
                    moneyValue.textContent = `€${this.escuderia.dinero.toLocaleString()}`;
                }
            }
        } catch (error) {
            console.error('Error actualizando dinero:', error);
        }
    }
    
    async cargarDatosDashboard() {
        console.log('📊 Cargando datos del dashboard...');
        
        // Actualizar producción en tiempo real
        this.updateProductionMonitor();
        
        // Configurar eventos de botones
        this.setupDashboardEvents();
        
        // Iniciar temporizadores
        this.startTimers();
    }
    
    updateProductionMonitor() {
        if (!window.fabricacionManager) return;
        
        const status = window.fabricacionManager.getProductionStatus();
        const container = document.getElementById('produccion-actual');
        
        if (!container) return;
        
        if (status.active) {
            const area = CAR_AREAS.find(a => a.id === status.piece.toLowerCase().replace(' ', '_'));
            const areaName = area ? area.name : status.piece;
            
            container.innerHTML = `
                <div class="pieza-header">
                    <h3 id="pieza-nombre">${areaName} Nivel ${status.level}</h3>
                    <span class="pieza-tag">${status.ready ? 'LISTA' : 'FABRICANDO'}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="production-progress" style="width: ${status.progress}%"></div>
                    </div>
                    <div class="progress-time">
                        <i class="far fa-clock"></i>
                        <span id="time-left">${status.ready ? '¡Lista para recoger!' : `Tiempo restante: ${this.formatTime(status.remaining)}`}</span>
                    </div>
                </div>
                <div class="pieza-stats">
                    <div class="stat-mini">
                        <span>Costo</span>
                        <strong>€10,000</strong>
                    </div>
                    <div class="stat-mini">
                        <span>Puntos</span>
                        <strong>+10</strong>
                    </div>
                </div>
                <div class="produccion-actions">
                    <button class="btn-secondary" id="btn-cancelar">Cancelar</button>
                    <button class="btn-primary" id="btn-recoger-pieza" ${!status.ready ? 'disabled' : ''}>
                        ${status.ready ? 'Recoger Pieza' : 'En fabricación...'}
                    </button>
                </div>
            `;
            
            // Configurar eventos
            document.getElementById('btn-recoger-pieza')?.addEventListener('click', () => {
                window.fabricacionManager.collectPiece();
            });
            
            document.getElementById('btn-cancelar')?.addEventListener('click', () => {
                window.fabricacionManager.cancelProduction();
            });
        }
    }
    
    setupDashboardEvents() {
        // Botón de iniciar fabricación
        document.getElementById('iniciar-fabricacion-btn')?.addEventListener('click', () => {
            this.irAlTaller();
        });
        
        // Botón de contratar pilotos
        document.getElementById('contratar-pilotos-btn')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        document.getElementById('contratar-primer-piloto')?.addEventListener('click', () => {
            this.mostrarContratarPilotos();
        });
        
        // Botón de apuestas
        document.getElementById('btn-apostar')?.addEventListener('click', () => {
            this.mostrarApuestas();
        });
    }
    
    formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    startTimers() {
        // Timer de producción
        setInterval(() => {
            this.updateProductionMonitor();
        }, 1000);
        
        // Timer de countdown
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    mostrarContratarPilotos() {
        this.showNotification('🏎️ Sistema de pilotos en desarrollo', 'info');
        // Aquí implementarías la lógica para contratar pilotos
    }
    
    mostrarApuestas() {
        this.showNotification('💰 Sistema de apuestas en desarrollo', 'info');
        // Aquí implementarías la lógica para apostar
    }
    
    updateCountdown() {
        if (!this.proximoGP) return;
        
        const now = new Date();
        const gpDate = new Date(this.proximoGP.fecha_inicio);
        const timeDiff = gpDate - now;
        
        if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const gpNombreEl = document.getElementById('gp-nombre');
            const gpFechaEl = document.getElementById('gp-fecha');
            const gpCircuitoEl = document.getElementById('gp-circuito');
            
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
            if (gpNombreEl) gpNombreEl.textContent = this.proximoGP.nombre;
            if (gpFechaEl) gpFechaEl.textContent = new Date(this.proximoGP.fecha_inicio).toLocaleDateString('es-ES');
            if (gpCircuitoEl) gpCircuitoEl.textContent = this.proximoGP.circuito || 'Circuito por confirmar';
        }
    }
    
    irAlTaller() {
        if (window.tabManager) {
            window.tabManager.switchTab('taller');
        }
    }
    
    irAlMercado() {
        alert('🛒 Mercado - Próximamente');
    }
}

// ========================
// 5. INICIALIZACIÓN FINAL
// ========================
// Esperar a que todo esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM cargado, iniciando aplicación...');
    
    // Pequeña pausa para asegurar que todo está listo
    setTimeout(async () => {
        await iniciarAplicacion();
    }, 100);
});
