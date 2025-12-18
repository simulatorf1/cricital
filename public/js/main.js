// ========================
// F1 MANAGER - MAIN.JS COMPLETO
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

// ========================
// 1. SISTEMA DE CARGA SEGURA DE SUPABASE
// ========================
console.log('🔧 Inicializando sistema seguro...');

// Variable global para Supabase
let supabase = window.supabase || null;  // ← SOLO SI NO EXISTE

// Función para inicializar Supabase de forma SEGURA
async function initSupabase() {
    console.log('🔄 Inicializando Supabase...');
    
    // Si ya está inicializado, devolverlo
    if (window.supabase && window.supabase.auth) {
        console.log('✅ Supabase ya está inicializado');
        supabase = window.supabase;
        return supabase;
    }
    
    // Si no está en window, cargarlo desde config.js
    if (!window.supabase) {
        console.log('⚠️ window.supabase no existe, esperando configuración...');
        
        // Esperar a que config.js cargue
        for (let i = 0; i < 30; i++) {
            if (window.supabase && window.supabase.auth) {
                console.log(`✅ Supabase cargado después de ${i * 100}ms`);
                supabase = window.supabase;
                return supabase;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.error('❌ Supabase no se cargó en 3 segundos');
        return null;
    }
    
    supabase = window.supabase;
    return supabase;
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
        
        this.init();
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
    
    async saltarTutorial() {
        console.log('⏭️ Saltando tutorial...');
        
        // Verificar si ya tiene escudería
        await this.loadUserData();
        
        if (!this.escuderia) {
            // Crear escudería automáticamente
            try {
                const { data: escuderia, error } = await supabase
                    .from('escuderias')
                    .insert([
                        {
                            user_id: this.user.id,
                            nombre: 'Mi Escudería Rápida',
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
                
                if (!error) {
                    this.escuderia = escuderia;
                    await supabase
                        .from('coches_stats')
                        .insert([{ escuderia_id: escuderia.id }]);
                }
            } catch (error) {
                console.error('Error creando escudería automática:', error);
            }
        }
        
        // Cargar dashboard
        await this.cargarDashboardCompleto();
    }
    
    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard COMPLETO...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }
        
        // Aquí va el HTML COMPLETO del dashboard
        // Por ahora, mostramos una versión básica funcional
        document.body.innerHTML = `
            <div id="app">
                <!-- Header -->
                <header style="background: rgba(21, 21, 30, 0.95); padding: 20px; border-bottom: 3px solid #e10600;">
                    <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto;">
                        <div>
                            <h1 style="color: #e10600; font-family: 'Orbitron', sans-serif;">${this.escuderia.nombre}</h1>
                            <p style="color: #888; font-size: 0.9rem;">#F1MANAGER</p>
                        </div>
                        <div style="display: flex; gap: 30px;">
                            <div style="text-align: center;">
                                <p style="color: #aaa; font-size: 0.8rem; margin: 0;">FONDOS</p>
                                <p style="color: #00d2be; font-size: 1.5rem; font-weight: bold; margin: 5px 0;">€${this.escuderia.dinero.toLocaleString()}</p>
                            </div>
                            <div style="text-align: center;">
                                <p style="color: #aaa; font-size: 0.8rem; margin: 0;">PUNTOS</p>
                                <p style="color: #ffd700; font-size: 1.5rem; font-weight: bold; margin: 5px 0;">${this.escuderia.puntos || 0}</p>
                            </div>
                            <div style="text-align: center;">
                                <p style="color: #aaa; font-size: 0.8rem; margin: 0;">RANKING</p>
                                <p style="color: #9000ff; font-size: 1.5rem; font-weight: bold; margin: 5px 0;">#${this.escuderia.ranking || '-'}</p>
                            </div>
                        </div>
                    </div>
                </header>
                
                <!-- Contenido Principal -->
                <main style="max-width: 1400px; margin: 30px auto; padding: 0 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <!-- Panel Izquierdo -->
                        <div style="background: rgba(42, 42, 56, 0.7); border-radius: 10px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                            <h2 style="color: #00d2be; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user"></i> TUS PILOTOS
                            </h2>
                            <div id="pilotos-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center; color: #888;">
                                <div style="text-align: center;">
                                    <i class="fas fa-user-slash" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;"></i>
                                    <p>No tienes pilotos contratados</p>
                                    <button style="margin-top: 15px; padding: 10px 20px; background: #e10600; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                        <i class="fas fa-plus"></i> Contratar Pilotos
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Panel Derecho -->
                        <div style="background: rgba(42, 42, 56, 0.7); border-radius: 10px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                            <h2 style="color: #00d2be; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-industry"></i> PRODUCCIÓN EN CURSO
                            </h2>
                            <div style="text-align: center; padding: 40px 20px; color: #888;">
                                <i class="fas fa-industry" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                                <p>No hay producción en curso</p>
                                <button style="margin-top: 15px; padding: 10px 20px; background: #00d2be; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    <i class="fas fa-hammer"></i> Iniciar Fabricación
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Estado del Coche -->
                    <div style="background: rgba(42, 42, 56, 0.7); border-radius: 10px; padding: 25px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px;">
                        <h2 style="color: #00d2be; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-car"></i> ESTADO DEL COCHE
                        </h2>
                        <div id="areas-coche" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                            ${this.generarAreasCoche()}
                        </div>
                    </div>
                    
                    <!-- Acciones -->
                    <div style="display: flex; gap: 20px; margin-top: 40px;">
                        <button onclick="window.f1Manager.irAlTaller()" style="flex: 1; padding: 15px; background: #e10600; color: white; border: none; border-radius: 5px; cursor: pointer; font-family: 'Orbitron', sans-serif;">
                            <i class="fas fa-tools"></i> IR AL TALLER
                        </button>
                        <button onclick="window.f1Manager.irAlMercado()" style="flex: 1; padding: 15px; background: #9000ff; color: white; border: none; border-radius: 5px; cursor: pointer; font-family: 'Orbitron', sans-serif;">
                            <i class="fas fa-store"></i> IR AL MERCADO
                        </button>
                        <button onclick="supabase.auth.signOut().then(() => location.reload())" style="flex: 1; padding: 15px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-family: 'Orbitron', sans-serif;">
                            <i class="fas fa-sign-out-alt"></i> CERRAR SESIÓN
                        </button>
                    </div>
                </main>
                
                <!-- Footer -->
                <footer style="text-align: center; padding: 20px; color: #666; font-size: 0.9rem; margin-top: 50px;">
                    <p>F1 Manager E-Strategy v1.0.0 | Un juego de gestión 100% online</p>
                </footer>
            </div>
            
            <style>
                body {
                    background: linear-gradient(135deg, #15151e 0%, #1a1a2e 100%);
                    color: white;
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    min-height: 100vh;
                }
                
                #app {
                    min-height: 100vh;
                }
                
                button {
                    transition: all 0.3s;
                }
                
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
            </style>
        `;
        
        console.log('✅ Dashboard COMPLETO cargado');
    }
    
    generarAreasCoche() {
        const areas = [
            { nombre: 'Motor', nivel: this.carStats?.motor_nivel || 0, color: '#4ECDC4' },
            { nombre: 'Frenos', nivel: this.carStats?.frenos_nivel || 0, color: '#FF6B6B' },
            { nombre: 'Aerodinámica', nivel: this.carStats?.aleron_delantero_nivel || 0, color: '#FFD166' },
            { nombre: 'Suspensión', nivel: this.carStats?.suspension_nivel || 0, color: '#06D6A0' },
            { nombre: 'Caja Cambios', nivel: this.carStats?.caja_cambios_nivel || 0, color: '#118AB2' }
        ];
        
        return areas.map(area => `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 4px solid ${area.color};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: ${area.color};">${area.nombre}</h3>
                    <span style="background: ${area.color}; color: black; padding: 2px 8px; border-radius: 10px; font-weight: bold;">Nivel ${area.nivel}</span>
                </div>
                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${(area.nivel / 10) * 100}%; background: ${area.color}; border-radius: 4px;"></div>
                </div>
                <button style="width: 100%; margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.1); color: white; border: 1px solid ${area.color}; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-hammer"></i> Mejorar (€10,000)
                </button>
            </div>
        `).join('');
    }
    
    // Métodos de navegación (placeholders)
    irAlTaller() {
        alert('🏭 Taller - Próximamente');
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
