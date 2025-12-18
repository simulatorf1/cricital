// ========================
// MAIN.JS - FLUJO SIMPLE Y CORREGIDO
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

// Esperar a que se cargue y se inicialice Supabase
async function waitForSupabase(maxAttempts = 15) {
    console.log('⏳ Esperando inicialización de Supabase...');
    for (let i = 0; i < maxAttempts; i++) {
        if (window.supabase && window.supabase.auth) {
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
        mostrarErrorGlobal('Error de conexión con la base de datos');
        return;
    }
    
    console.log('🚀 Iniciando aplicación F1 Manager');
    await iniciarAplicacion();
});

async function iniciarAplicacion() {
    console.log('🔍 Verificando sesión...');
    
    // 1. Verificar si ya está logueado
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('📊 Estado de sesión:', session ? 'ACTIVA' : 'INACTIVA');
    
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

function mostrarErrorGlobal(mensaje) {
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
                <h1 style="color: #e10600; margin-bottom: 20px;">❌ ERROR</h1>
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
                        CREAR CUENTA NUEVA
                    </button>
                </div>
                
                <div class="login-footer">
                    <p>Un juego de gestión 100% online</p>
                    <p>v${window.CONFIG ? window.CONFIG.VERSION : '1.0.0'}</p>
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
    
    // Ocultar mensajes anteriores
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');
    
    if (!email || !password) {
        mostrarError('Por favor, completa todos los campos', errorDiv);
        return;
    }
    
    mostrarCargando();
    
    try {
        console.log('🔐 Intentando login para:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('✅ Login exitoso:', data.user.email);
        mostrarExito('✅ Sesión iniciada correctamente', successDiv);
        
        // Pequeña pausa para mostrar el mensaje
        setTimeout(() => {
            location.reload();
        }, 1000);
        
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
    const successDiv = document.getElementById('register-success');
    
    // Ocultar mensajes anteriores
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');
    
    if (!username || !email || !password) {
        mostrarError('Por favor, completa todos los campos', errorDiv);
        return;
    }
    
    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres', errorDiv);
        return;
    }
    
    mostrarCargando();
    
    try {
        console.log('📝 Registrando nuevo usuario:', email);
        
        // SOLO registrar usuario en Auth - NADA MÁS
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: window.location.origin
            }
        });
        
        if (authError) throw authError;
        
        console.log('✅ Registro en Auth exitoso');
        
        // MOSTRAR MENSAJE DE ÉXITO
        const mensajeExito = authData.user && authData.user.identities && authData.user.identities.length > 0
            ? '✅ ¡Cuenta creada! Revisa tu correo para confirmarla.'
            : '✅ ¡Cuenta creada exitosamente!';
        
        mostrarExito(mensajeExito, successDiv);
        
        // Redirigir a login después de 3 segundos
        setTimeout(() => {
            mostrarPantallaLogin();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        
        // Mensaje de error amigable
        let mensajeError = 'Error creando la cuenta';
        if (error.message.includes('already registered') || error.code === '23505') {
            mensajeError = 'Este email ya está registrado';
        } else if (error.message.includes('User already registered')) {
            mensajeError = 'Este usuario ya existe';
        }
        
        mostrarError(mensajeError, errorDiv);
        ocultarCargando();
    }
}

function mostrarError(mensaje, elemento) {
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.classList.add('show');
    }
}

function mostrarExito(mensaje, elemento) {
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.classList.add('show');
    }
}

function mostrarCargando() {
    // Puedes implementar un spinner si quieres
}

function ocultarCargando() {
    // Puedes implementar un spinner si quieres
}

// ================================================
// CLASE F1Manager (SIMPLIFICADA PARA PRUEBAS)
// ================================================

class F1Manager {
    constructor() {
        console.log('🚗 Creando nueva instancia de F1Manager');
        this.user = null;
        this.escuderia = null;
        this.isLoading = true;
        
        this.init();
    }
    
    async init() {
        console.log('🔧 F1Manager inicializando...');
        
        // 1. Verificar autenticación
        const authOk = await this.checkAuth();
        if (!authOk) {
            console.log('❌ F1Manager: No autenticado, mostrando login');
            mostrarPantallaLogin();
            return;
        }
        
        // 2. Cargar datos del usuario
        await this.loadUserData();
        
        // 3. Si no tiene escudería, mostrar tutorial
        if (!this.escuderia) {
            console.log('📝 Usuario sin escudería, mostrando tutorial');
            this.startTutorial();
            return;
        }
        
        // 4. Cargar dashboard
        console.log('📊 Cargando dashboard para:', this.escuderia.nombre);
        await this.loadDashboard();
    }
    
    async checkAuth() {
        try {
            console.log('🔍 F1Manager verificando autenticación...');
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.warn('⚠️ Error en checkAuth:', error.message);
                return false;
            }
            
            if (user) {
                this.user = user;
                console.log('👤 F1Manager: Usuario autenticado:', user.email);
                return true;
            }
            
            console.log('👤 F1Manager: No hay usuario autenticado');
            return false;
            
        } catch (error) {
            console.error('❌ Error crítico en checkAuth:', error);
            return false;
        }
    }
    
    async loadUserData() {
        if (!this.user) {
            console.log('⚠️ loadUserData: No hay usuario');
            return;
        }
        
        console.log('📥 Cargando datos para usuario:', this.user.id);
        
        try {
            // 1. Buscar escudería del usuario
            const { data: escuderias, error } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', this.user.id)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('ℹ️ El usuario no tiene escudería creada aún');
                    this.escuderia = null;
                } else {
                    console.error('❌ Error cargando escudería:', error);
                }
                return;
            }
            
            if (escuderias) {
                this.escuderia = escuderias;
                console.log('✅ Escudería cargada:', this.escuderia.nombre);
            }
            
        } catch (error) {
            console.error('❌ Error en loadUserData:', error);
        }
    }
    
    async loadDashboard() {
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            this.startTutorial();
            return;
        }
        
        console.log('🏁 Cargando dashboard completo');
        
        // Mostrar un dashboard simple para prueba
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                background: #15151e;
                color: white;
                padding: 20px;
            ">
                <h1 style="color: #e10600;">🏎️ F1 MANAGER - DASHBOARD</h1>
                <h2>Escudería: ${this.escuderia.nombre}</h2>
                <p>Dinero: ${this.formatMoney(this.escuderia.dinero)}</p>
                <p>Puntos: ${this.escuderia.puntos || 0}</p>
                
                <div style="margin-top: 30px;">
                    <button onclick="location.reload()" style="
                        padding: 10px 20px;
                        background: #e10600;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        margin-right: 10px;
                    ">
                        Recargar
                    </button>
                    <button onclick="supabase.auth.signOut().then(() => location.reload())" style="
                        padding: 10px 20px;
                        background: #666;
                        color: white;
                        border: none;
                        border-radius: 5px;
                    ">
                        Cerrar Sesión
                    </button>
                </div>
                
                <div style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <h3>Próximos pasos:</h3>
                    <ul>
                        <li>Implementar tutorial completo</li>
                        <li>Cargar pilotos desde base de datos</li>
                        <li>Mostrar estado del coche</li>
                        <li>Implementar sistema de fabricación</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    startTutorial() {
        console.log('🎮 Iniciando tutorial');
        
        // Tutorial simple para empezar
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                background: linear-gradient(135deg, #15151e, #1a1a2e);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            ">
                <div style="
                    background: rgba(42, 42, 56, 0.9);
                    padding: 40px;
                    border-radius: 15px;
                    border: 2px solid #00d2be;
                    max-width: 500px;
                    text-align: center;
                ">
                    <h1 style="color: #00d2be;">🎮 TUTORIAL</h1>
                    <p style="margin: 20px 0;">¡Bienvenido a F1 Manager! Vamos a crear tu escudería.</p>
                    
                    <div style="margin: 30px 0;">
                        <input type="text" id="tutorial-escuderia-nombre" placeholder="Nombre de tu escudería" style="
                            width: 100%;
                            padding: 12px;
                            background: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.2);
                            border-radius: 5px;
                            color: white;
                            margin-bottom: 15px;
                        ">
                    </div>
                    
                    <button onclick="window.f1Manager.crearEscuderiaDesdeTutorial()" style="
                        padding: 15px 30px;
                        background: linear-gradient(135deg, #00d2be, #00a35c);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-weight: bold;
                        cursor: pointer;
                        width: 100%;
                    ">
                        CREAR MI ESCUDERÍA
                    </button>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 10px; background: #666; color: white; border: none; border-radius: 5px; width: 100%;">
                        ⏭️ Saltar Tutorial e Ir al Juego
                    </button>
                </div>
            </div>
        `;
    }
    
    async crearEscuderiaDesdeTutorial() {
        const nombre = document.getElementById('tutorial-escuderia-nombre')?.value || 'Mi Escudería';
        
        if (!nombre.trim()) {
            alert('Por favor, ingresa un nombre para tu escudería');
            return;
        }
        
        console.log('🔍 Verificando si el trigger ya creó la escudería...');
        
        // ESPERAR 2 segundos para dar tiempo al trigger
        console.log('⏳ Esperando 2 segundos para que el trigger complete...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            // 1. VERIFICAR si YA existe escudería (trigger la creó)
            const { data: existingEscuderia, error: escError } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', this.user.id)
                .single();
            
            if (escError && escError.code === 'PGRST116') {
                // NO existe escudería → El trigger FALLÓ o está desactivado
                console.log('❌ Trigger no creó escudería, creando manualmente...');
                
                // PRIMERO asegurar usuario en public.users
                const { error: userError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: this.user.id,
                            username: this.user.user_metadata?.username || nombre,
                            email: this.user.email,
                            created_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();
                
                if (userError && !userError.message.includes('duplicate')) {
                    console.warn('⚠️ Error creando usuario (puede que ya exista):', userError);
                }
                
                // LUEGO crear escudería
                const { data: escuderia, error: createError } = await supabase
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
                
                if (createError) {
                    // Si es error de duplicado, buscar la que ya existe
                    if (createError.code === '23505') {
                        console.log('🔄 Escudería ya existe, buscando...');
                        const { data: foundEscuderia } = await supabase
                            .from('escuderias')
                            .select('*')
                            .eq('user_id', this.user.id)
                            .single();
                        
                        this.escuderia = foundEscuderia;
                    } else {
                        throw createError;
                    }
                } else {
                    this.escuderia = escuderia;
                    console.log('✅ Escudería creada manualmente:', escuderia.nombre);
                    
                    // Crear stats del coche
                    await supabase
                        .from('coches_stats')
                        .insert([{ escuderia_id: escuderia.id }]);
                }
                
            } else if (escError) {
                // Otro error
                console.error('❌ Error verificando escudería:', escError);
                throw escError;
            } else {
                // ¡YA EXISTE! El trigger funcionó
                console.log('✅ El trigger YA creó la escudería:', existingEscuderia.nombre);
                this.escuderia = existingEscuderia;
            }
            
            // VERIFICAR stats del coche
            const { data: carStats, error: statsError } = await supabase
                .from('coches_stats')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .single();
            
            if (statsError && statsError.code === 'PGRST116') {
                console.log('➕ Creando stats del coche...');
                await supabase
                    .from('coches_stats')
                    .insert([{ escuderia_id: this.escuderia.id }]);
            }
            
            // ¡ÉXITO! Recargar para mostrar dashboard
            console.log('🎉 Todo listo, recargando...');
            setTimeout(() => location.reload(), 1000);
            
        } catch (error) {
            console.error('❌ Error en proceso:', error);
            
            let mensaje = 'Error: ' + (error.message || 'Desconocido');
            if (error.code === '23503') {
                mensaje = 'Problema con la base de datos. Por favor, contacta al administrador.';
            } else if (error.code === '23505') {
                mensaje = 'La escudería ya existe. Recargando...';
                setTimeout(() => location.reload(), 2000);
            }
            
            alert(mensaje);
        }
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// ================================================
// FIN DEL ARCHIVO
// ================================================
