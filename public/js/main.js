// ========================
// F1 MANAGER - MAIN.JS COMPLETO (CON TUTORIAL)
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

// ========================
// 1. SISTEMA DE CARGA SEGURA DE SUPABASE
// ========================
console.log('🔧 Inicializando sistema seguro...');

// Función para inicializar Supabase de forma SEGURA - VERSIÓN CORREGIDA
function initSupabase() {
    console.log('🔍 Verificando Supabase en window...');
    
    // Opción 1: Ya existe window.supabase del index.html
    if (window.supabase && window.supabase.auth) {
        console.log('✅ Supabase YA inicializado desde index.html');
        return window.supabase;
    }
    
    // Opción 2: Existe la variable global supabase del CDN
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        console.log('⚠️ Creando cliente desde CDN (no debería pasar)');
        try {
            window.supabase = supabase.createClient(
                'https://xbnbbmhcveyzrvvmdktg.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg'
            );
            console.log('✅ Cliente creado como backup');
            return window.supabase;
        } catch (e) {
            console.error('❌ Error creando cliente backup:', e);
            return null;
        }
    }
    
    console.error('❌ CRÍTICO: No se puede encontrar Supabase de ninguna forma');
    console.error('Estado de window.supabase:', window.supabase);
    console.error('Estado de variable supabase:', typeof supabase);
    
    return null;
}

// ========================
// 2. INICIALIZACIÓN PRINCIPAL
// ========================
async function iniciarAplicacion() {
    console.log('🚀 Iniciando aplicación F1 Manager...');
    
    // Inicializar Supabase
    window.supabase = initSupabase();
    
    if (!window.supabase) {
        mostrarErrorCritico('No se pudo conectar con la base de datos');
        return;
    }
    
    console.log('✅ Supabase inicializado correctamente');
    
    // Verificar sesión
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (session) {
        console.log('✅ Usuario autenticado:', session.user.email);
        // Crear instancia y llamar a init()
        window.f1Manager = new F1Manager(session.user);
        await window.f1Manager.init(); // ← ESTO ES CORRECTO, NO LO QUITES
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
    const supabase = window.supabase;
    if (!supabase) {
        mostrarErrorCritico('No se pudo conectar a la base de datos');
        return;
    }
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
    const supabase = window.supabase;
    if (!supabase) {
        mostrarErrorCritico('No se pudo conectar a la base de datos');
        return;
    }
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
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
        console.log('📝 Registrando usuario:', email);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { 
                    username: username,
                    team_name: `${username}'s Team`
                },
                emailRedirectTo: window.location.origin
            }
        });
        
        if (authError) {
            console.error('❌ Error Auth:', authError);
            throw authError;
        }
        
        console.log('✅ Usuario creado en Auth:', authData.user?.id);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: escuderiaCheck, error: checkError } = await supabase
            .from('escuderias')
            .select('id')
            .eq('user_id', authData.user?.id)
            .maybeSingle();
        
        if (checkError) {
            console.error('❌ Error verificando escudería:', checkError);
        }
        
        if (escuderiaCheck) {
            console.log('✅ Escudería creada automáticamente:', escuderiaCheck.id);
        } else {
            console.log('✅ Registro exitoso. Usuario debe confirmar email.');
            // En lugar de llamar al tutorial aquí, simplemente recarga o redirige
            setTimeout(() => {
                // Opción 1: Recargar la página (lo más simple)
                location.reload();
                // Opción 2: Redirigir a la página principal
                // window.location.href = '/';
            }, 1500); // Pequeño delay para mostrar el mensaje de éxito
            
            const { data: nuevaEscuderia, error: escError } = await supabase
                .from('escuderias')
                .insert([{
                    user_id: authData.user.id,
                    nombre: `${username}'s Team`,
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
            
            if (escError) {
                console.error('❌ Error creando escudería manual:', escError);
            } else {
                console.log('✅ Escudería creada manualmente:', nuevaEscuderia.id);
                
                await supabase
                    .from('coches_stats')
                    .insert([{ escuderia_id: nuevaEscuderia.id }]);
            }
        }
        
        mostrarMensaje('✅ ¡Cuenta creada! Revisa tu correo para confirmarla.', successDiv);
        
        setTimeout(() => mostrarPantallaLogin(), 3000);
        
    } catch (error) {
        console.error('❌ Error en registro completo:', error);
        
        let mensajeError = error.message || 'Error creando la cuenta';
        
        if (error.message.includes('already registered')) {
            mensajeError = 'Este correo ya está registrado';
        } else if (error.message.includes('password')) {
            mensajeError = 'La contraseña no cumple los requisitos';
        } else if (error.message.includes('email')) {
            mensajeError = 'El correo electrónico no es válido';
        }
        
        mostrarMensaje(mensajeError, errorDiv);
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
// 4. CLASE F1Manager PRINCIPAL CON TUTORIAL
// ========================
class F1Manager {
    constructor(user) {
        console.log('🚗 Creando F1Manager para:', user.email);
        this.user = user;
        this.escuderia = null;
        this.pilotos = [];
        this.carStats = null;
        this.proximoGP = null;
        this.tutorialStep = 0;
        this.tutorialData = null;
        this.supabase = null; // Añadir referencia a supabase
    }
    
    // En el método init() de F1Manager, después de cargar la escudería:
    async init() {
        console.log('🔧 Inicializando juego...');
        
        // Inicializar Supabase
        this.supabase = await this.esperarSupabase();
        if (!this.supabase) {
            console.error('❌ No se pudo cargar Supabase');
            mostrarErrorCritico('Error de conexión con la base de datos');
            return;
        }
        
        // Cargar datos del usuario
        await this.loadUserData();
        
        // NUEVO: Verificar y crear datos iniciales si faltan
        if (this.user && this.user.id) {
            console.log('🔄 Verificando datos iniciales del usuario...');
            const datosCreados = await this.crearDatosInicialesSiFaltan();
            
            if (!datosCreados) {
                this.showNotification('⚠️ Hubo un problema configurando tu equipo.', 'warning');
            } else {
                console.log('✅ Usuario listo para jugar');
            }
        }
        
        // El resto de tu código (cargar dashboard o tutorial)
        if (!this.escuderia) {
            this.mostrarTutorialInicial();
        } else {
            await this.cargarDashboardCompleto();
            await this.inicializarSistemasIntegrados();
        }
    }
    
    // Añade este método después del init():
    async mostrarFormularioEscuderiaSimple() {
        // Crear un modal HTML en lugar de usar prompt()
        const modalHTML = `
            <div id="escuderia-modal" style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1a1a2e;
                    padding: 30px;
                    border-radius: 10px;
                    border: 2px solid #e10600;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h2 style="color: #e10600; margin-bottom: 20px;">🏎️ Crear tu Escudería</h2>
                    <p style="color: #ccc; margin-bottom: 20px;">¡Bienvenido a F1 Manager! Necesitas un nombre para tu equipo.</p>
                    <input type="text" id="nombre-escuderia" placeholder="Ej: McLaren Racing" style="
                        width: 100%;
                        padding: 12px;
                        margin-bottom: 20px;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid #444;
                        border-radius: 5px;
                        color: white;
                        font-size: 16px;
                    ">
                    <div style="display: flex; gap: 10px;">
                        <button id="btn-crear-escuderia" style="
                            flex: 1;
                            padding: 12px;
                            background: #e10600;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            font-weight: bold;
                            cursor: pointer;
                        ">Crear Escudería</button>
                        <button id="btn-cancelar" style="
                            flex: 1;
                            padding: 12px;
                            background: transparent;
                            border: 1px solid #666;
                            color: #ccc;
                            border-radius: 5px;
                            cursor: pointer;
                        ">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Esperar a que el usuario interactúe
        return new Promise((resolve) => {
            document.getElementById('btn-crear-escuderia').addEventListener('click', async () => {
                const nombre = document.getElementById('nombre-escuderia').value.trim();
                
                if (!nombre) {
                    alert('Por favor, ingresa un nombre para tu escudería.');
                    return;
                }
                
                try {
                    // Crear escudería
                    const { data: escuderia, error } = await this.supabase
                        .from('escuderias')
                        .insert([{
                            user_id: this.user.id,
                            nombre: nombre,
                            dinero: 5000000,
                            puntos: 0,
                            ranking: null,
                            nivel_ingenieria: 1
                        }])
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    this.escuderia = escuderia;
                    
                    // Crear stats del coche
                    await this.supabase
                        .from('coches_stats')
                        .insert([{ escuderia_id: this.escuderia.id }]);
                    
                    // Remover modal
                    document.getElementById('escuderia-modal').remove();
                    
                    // Recargar página
                    location.reload();
                    
                } catch (error) {
                    console.error('Error creando escudería:', error);
                    alert('Error: ' + error.message);
                }
            });
            
            // Botón cancelar
            document.getElementById('btn-cancelar').addEventListener('click', () => {
                document.getElementById('escuderia-modal').remove();
                location.reload(); // Recargar para intentar de nuevo
            });
        });
    }
    
    async inicializarSistemasIntegrados() {
        console.log('🔗 Inicializando sistemas integrados...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para inicializar sistemas');
            return;
        }
        
        // 1. Crear instancia de fabricacionManager si no existe
        if (window.FabricacionManager && !window.fabricacionManager) {
            console.log('🔧 Creando fabricacionManager...');
            window.fabricacionManager = new window.FabricacionManager();
        }
        
        if (window.fabricacionManager && typeof window.fabricacionManager.inicializar === 'function') {
            await window.fabricacionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de fabricación inicializado');
        } else {
            console.error('❌ fabricacionManager no disponible - creando nueva instancia');
            // Intentar crear de nuevo
            if (window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                await window.fabricacionManager.inicializar(this.escuderia.id);
                console.log('✅ Sistema de fabricación inicializado (segundo intento)');
            }
        }
        
        // 2. Crear instancia de almacenManager si no existe
        if (window.AlmacenManager && !window.almacenManager) {
            console.log('🔧 Creando almacenManager...');
            window.almacenManager = new window.AlmacenManager();
        }
        
        if (window.almacenManager && typeof window.almacenManager.inicializar === 'function') {
            await window.almacenManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de almacén inicializado');
        } else {
            console.error('❌ almacenManager no disponible - creando nueva instancia');
            if (window.AlmacenManager) {
                window.almacenManager = new window.AlmacenManager();
                await window.almacenManager.inicializar(this.escuderia.id);
                console.log('✅ Sistema de almacén inicializado (segundo intento)');
            }
        }
        
        // 3. Integración (opcional)
        if (window.IntegracionManager) {
            window.integracionManager = new window.IntegracionManager();
            await window.integracionManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de integración inicializado');
        } else {
            console.warn('⚠️ IntegracionManager no cargado - continuando sin integración');
        }
        
        this.iniciarTimersAutomaticos();
    }
    
    iniciarTimersAutomaticos() {
        if (this.timersAutomaticos) {
            Object.values(this.timersAutomaticos).forEach(timer => {
                clearInterval(timer);
            });
        }
        // CORRECCIÓN: Añadir llave y nombre de propiedad
        this.timersAutomaticos = {
            produccion: setInterval(() => {
                if (window.fabricacionManager && window.fabricacionManager.actualizarUIProduccion) {
                    window.fabricacionManager.actualizarUIProduccion(true); // true = solo contador
                }
            }, 1000), // Cada segundo para contador fluido 

            
            dashboard: setInterval(() => {
                this.updateProductionMonitor();
            }, 3000)
        };
        
        console.log('⏱️ Timers automáticos iniciados');
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
    
    // ELIMINA esta segunda definición del método init() que tienes más abajo
    // async init() {
    //     console.log('🔧 Inicializando juego...');
    //     ... resto del código duplicado ...
    // }
    
    // ========================
    // SISTEMA DE TUTORIAL INTERACTIVO
    // ========================
    mostrarTutorialInicial() {
        this.tutorialStep = 1;
        this.tutorialData = {
            escuderiaCreada: false,
            pilotosContratados: [],
            fabricacionIniciada: false,
            piezaEquipada: false,
            apuestaRealizada: false
        };
        
        this.mostrarTutorialStep();
    }
    
    mostrarTutorialStep() {
        const steps = [
            // PASO 1: Bienvenida y creación de escudería
            {
                title: "🏁 ¡BIENVENIDO A F1 MANAGER!",
                content: `
                    <p>Te damos la bienvenida al mundo de la gestión de Fórmula 1.</p>
                    <p>En este tutorial aprenderás a:</p>
                    <ul>
                        <li>Gestionar tu escudería</li>
                        <li>Contratar pilotos</li>
                        <li>Fabricar piezas para tu coche</li>
                        <li>Hacer apuestas en carreras</li>
                        <li>Subir en el ranking mundial</li>
                    </ul>
                    <p class="success">💰 Tu escudería ya está creada y tiene 5,000,000€ para empezar</p> <!-- Texto actualizado -->
                `,
                action: 'mostrarPestanas' // CAMBIA 'crearEscuderia' por el nombre del SEGUNDO paso real (ej: 'mostrarPestanas' o 'contratarPilotos')
            },
            
            // PASO 2: Dashboard principal
            {
                title: "📊 DASHBOARD PRINCIPAL",
                content: `
                    <p>Esta es tu pantalla principal. Aquí verás:</p>
                    <ul>
                        <li><strong>Cabecera</strong>: Nombre, dinero y puntos</li>
                        <li><strong>Panel de pilotos</strong>: Tus 2 pilotos contratados</li>
                        <li><strong>Countdown</strong>: Tiempo para la próxima apuesta</li>
                        <li><strong>Fábrica</strong>: Piezas en producción</li>
                        <li><strong>Estado del coche</strong>: Nivel de cada área</li>
                    </ul>
                `,
                highlight: '.dashboard-header',
                action: 'mostrarPestanas'
            },
            
            // PASO 3: Sistema de pestañas
            {
                title: "🔍 SISTEMA DE PESTAÑAS",
                content: `
                    <p>Navega por el juego usando estas pestañas:</p>
                    <ul>
                        <li><strong>Principal</strong>: Vista general</li>
                        <li><strong>Taller</strong>: Fabrica piezas</li>
                        <li><strong>Almacén</strong>: Gestiona piezas</li>
                        <li><strong>Mercado</strong>: Compra/vende</li>
                        <li><strong>Presupuesto</strong>: Controla finanzas</li>
                        <li><strong>Clasificación</strong>: Ve el ranking</li>
                    </ul>
                    <p>¡Pruébalas todas!</p>
                `,
                highlight: '.tabs-navigation',
                action: 'mostrarTab'
            },
            
            // PASO 4: Contratar pilotos (OBLIGATORIO)
            {
                title: "👥 CONTRATAR PILOTOS (OBLIGATORIO)",
                content: `
                    <p>Necesitas <strong>2 pilotos</strong> para competir.</p>
                    <p>Características de los pilotos:</p>
                    <ul>
                        <li><strong>Sueldo</strong>: Coste mensual</li>
                        <li><strong>Experiencia</strong>: Mejores decisiones</li>
                        <li><strong>Habilidad</strong>: Más puntos en carrera</li>
                        <li><strong>Contrato</strong>: Duración en carreras</li>
                    </ul>
                    <p class="warning">⚠️ NO puedes continuar sin 2 pilotos</p>
                `,
                highlight: '#contratar-pilotos-btn',
                action: 'contratarPilotos',
                mandatory: true
            },
            
            // PASO 5: Taller y fabricación
            {
                title: "🏭 SISTEMA DE FABRICACIÓN",
                content: `
                    <p>Mejora tu coche fabricando piezas:</p>
                    <ul>
                        <li><strong>4 horas</strong> por pieza</li>
                        <li><strong>20 piezas</strong> para subir de nivel</li>
                        <li><strong>11 áreas</strong> del coche</li>
                        <li><strong>Nivel máximo</strong>: 10</li>
                    </ul>
                    <p>Las piezas dan puntos base que generan ingresos.</p>
                `,
                tab: 'taller',
                action: 'fabricarPieza'
            },
            
            // PASO 6: Sistema de apuestas
            {
                title: "💰 SISTEMA DE APUESTAS",
                content: `
                    <p>Gana dinero apostando en carreras:</p>
                    <ul>
                        <li><strong>Cierre</strong>: Jueves 23:59 antes del GP</li>
                        <li><strong>Top 10</strong>: Predice posiciones</li>
                        <li><strong>Puntos</strong>: Más aciertos = más puntos</li>
                        <li><strong>Dinero</strong>: Los puntos se convierten en €</li>
                    </ul>
                `,
                highlight: '#btn-apostar',
                action: 'apostar'
            },
            
            // PASO 7: Completado
            {
                title: "🎉 ¡TUTORIAL COMPLETADO!",
                content: `
                    <p>¡Felicidades! Ya conoces lo básico de F1 Manager.</p>
                    <p>Recuerda:</p>
                    <ul>
                        <li>Mantén tu coche actualizado</li>
                        <li>Gestiona bien tu dinero</li>
                        <li>Apunta alto en las apuestas</li>
                        <li>¡Sube en el ranking!</li>
                    </ul>
                    <p class="success">💰 Dinero inicial: <strong>5,000,000€</strong></p>
                    <p>¡Que comience la carrera!</p>
                `,
                action: 'completarTutorial'
            }
        ];
        
        const step = steps[this.tutorialStep - 1];
        if (!step) return;
        
        document.body.innerHTML = `
            <div class="tutorial-screen">
                <div class="tutorial-container">
                    <!-- Progreso -->
                    <div class="tutorial-progress">
                        ${steps.map((s, i) => `
                            <div class="progress-step ${i + 1 === this.tutorialStep ? 'active' : ''} 
                                 ${i + 1 < this.tutorialStep ? 'completed' : ''}">
                                ${i + 1}
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Contenido -->
                    <div class="tutorial-header">
                        <h1>${step.title}</h1>
                    </div>
                    
                    <div class="tutorial-content">
                        ${step.content}
                    </div>
                    
                    <!-- Acciones -->
                    <div class="tutorial-actions">
                        ${this.tutorialStep > 1 ? `
                            <button class="btn-tutorial prev" id="btn-tutorial-prev">
                                <i class="fas fa-arrow-left"></i> Anterior
                            </button>
                        ` : ''}
                        
                        ${step.mandatory ? `
                            <div class="mandatory-warning">
                                <i class="fas fa-exclamation-circle"></i>
                                Este paso es obligatorio
                            </div>
                        ` : ''}
                        
                        <button class="btn-tutorial next" id="btn-tutorial-next" 
                                data-action="${step.action}">
                            ${step.action === 'crearEscuderia' ? 'Crear Escudería' : 
                              step.action === 'completarTutorial' ? '¡Comenzar!' : 'Siguiente'}
                            ${step.action !== 'crearEscuderia' && step.action !== 'completarTutorial' ? 
                              '<i class="fas fa-arrow-right"></i>' : ''}
                        </button>
                    </div>
                    
                    <!-- Navegación rápida (solo desarrollo) -->
                    <div class="tutorial-debug">
                        <small>Paso ${this.tutorialStep}/${steps.length}</small>
                    </div>
                </div>
            </div>
            
            <style>
                .tutorial-screen {
                    min-height: 100vh;
                    background: rgba(21, 21, 30, 0.95);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                }
                
                .tutorial-container {
                    background: rgba(42, 42, 56, 0.98);
                    border-radius: 20px;
                    padding: 40px;
                    width: 100%;
                    max-width: 700px;
                    border: 3px solid #00d2be;
                    box-shadow: 0 20px 50px rgba(0, 210, 190, 0.3);
                    backdrop-filter: blur(10px);
                }
                
                .tutorial-progress {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .progress-step {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    color: #888;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-family: 'Orbitron', sans-serif;
                    transition: all 0.3s;
                }
                
                .progress-step.active {
                    background: #00d2be;
                    color: white;
                    transform: scale(1.1);
                    box-shadow: 0 0 15px rgba(0, 210, 190, 0.5);
                }
                
                .progress-step.completed {
                    background: #4CAF50;
                    color: white;
                }
                
                .tutorial-header h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.2rem;
                    text-align: center;
                    background: linear-gradient(90deg, #00d2be, #e10600);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 20px;
                }
                
                .tutorial-content {
                    color: #ddd;
                    line-height: 1.8;
                    margin: 30px 0;
                    font-size: 1.1rem;
                }
                
                .tutorial-content ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .tutorial-content li {
                    margin-bottom: 10px;
                }
                
                .tutorial-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .btn-tutorial {
                    padding: 15px 30px;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .btn-tutorial.prev {
                    background: transparent;
                    border: 2px solid #888;
                    color: #888;
                }
                
                .btn-tutorial.next {
                    background: linear-gradient(135deg, #00d2be, #009688);
                    color: white;
                }
                
                .btn-tutorial:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 210, 190, 0.4);
                }
                
                .mandatory-warning {
                    background: rgba(255, 87, 87, 0.2);
                    color: #ff5757;
                    padding: 10px 20px;
                    border-radius: 5px;
                    border: 1px solid #ff5757;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .warning {
                    color: #ffcc00;
                    font-weight: bold;
                }
                
                .success {
                    color: #4CAF50;
                    font-weight: bold;
                }
                
                .tutorial-debug {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .btn-tutorial:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
        `;
        
        // Eventos
        document.getElementById('btn-tutorial-next').addEventListener('click', () => {
            this.ejecutarAccionTutorial(step.action);
        });
        
        if (document.getElementById('btn-tutorial-prev')) {
            document.getElementById('btn-tutorial-prev').addEventListener('click', () => {
                this.tutorialStep--;
                this.mostrarTutorialStep();
            });
        }
    }
    
    async ejecutarAccionTutorial(accion) {
        console.log('🎯 Acción tutorial:', accion);
        
        switch(accion) {
            case 'crearEscuderia':
                this.mostrarFormularioEscuderia();
                break;
                
            case 'mostrarPestanas':
                // 1. PRIMERO, cargar la escudería si no está en memoria
                if (!this.escuderia || !this.escuderia.id) {
                    console.log('🔄 [Tutorial] Cargando escudería...');
                    // Llama a la función que carga la escudería desde la BD
                    await this.loadUserData(); // Esta función debería cargar this.escuderia
                }
                
                // 2. SI tenemos escudería, avanzar y mostrar
                if (this.escuderia && this.escuderia.id) {
                    console.log('✅ [Tutorial] Escudería cargada:', this.escuderia.nombre);
                    this.tutorialStep++;
                    this.mostrarDashboardConTutorial();
                } else {
                    // 3. SI NO, mostrar error
                    console.error('❌ [Tutorial] No se pudo cargar la escudería.');
                    this.showNotification('Error: No se encontró tu equipo. Recarga la página.', 'error');
                }
                break;
                
            case 'mostrarTab':
                this.tutorialStep++;
                this.mostrarTutorialStep();
                break;
                
            case 'contratarPilotos':
                this.mostrarSelectorPilotos();
                break;
                
            case 'fabricarPieza':
                this.mostrarFabricacionTutorial();
                break;
                
            case 'apostar':
                this.mostrarApuestasTutorial();
                break;
                
            case 'completarTutorial':
                this.finalizarTutorial();
                break;
        }
    }
    
    async mostrarFormularioEscuderia() {
        // Primero verificar si ya tiene escudería
        const { data: existing, error: checkError } = await supabase
            .from('escuderias')
            .select('id')
            .eq('user_id', this.user.id)
            .maybeSingle();
    
        if (existing) {
            alert('Ya tienes una escudería creada. Usaremos esa.');
            this.escuderia = existing;
            this.tutorialStep++;
            this.mostrarTutorialStep();
            return;
        }
        // Usamos el formulario simple que ya tenías
        const nombreEscuderia = prompt('🏎️ Ingresa el nombre de tu escudería:\n(Ej: McLaren Racing, Ferrari, Mercedes)');
        
        if (nombreEscuderia && nombreEscuderia.trim()) {
            try {
                // Crear la escudería en la base de datos
                const { data: escuderia, error } = await supabase
                    .from('escuderias')
                    .insert([
                        {
                            user_id: this.user.id,
                            nombre: nombreEscuderia.trim(),
                            dinero: 5000000,
                            puntos: 0,
                            ranking: null,
                            color_principal: '#e10600',
                            color_secundario: '#ffffff',
                            nivel_ingenieria: 1
                        }
                    ])
                    .select()
                    .single();
                
                if (error) throw error;
                
                this.escuderia = escuderia;
                this.tutorialData.escuderiaCreada = true;
                
                // Crear stats del coche
                await supabase
                    .from('coches_stats')
                    .insert([{ escuderia_id: this.escuderia.id }]);
                
                // Avanzar al siguiente paso
                this.tutorialStep++;
                this.mostrarTutorialStep();
                
            } catch (error) {
                console.error('Error creando escudería:', error);
                alert('Error creando la escudería. Intenta con otro nombre.');
            }
        } else if (nombreEscuderia !== null) {
            alert('Debes ingresar un nombre para tu escudería.');
        }
    }
    
    async mostrarDashboardConTutorial() {
        // Cargar el dashboard normalmente
        await this.cargarDashboardCompleto();
        
        // Después de 1 segundo, mostrar el overlay del tutorial
        setTimeout(() => {
            // Crear overlay
            const overlay = document.createElement('div');
            overlay.id = 'tutorial-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9998;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;
            
            // Crear highlight
            const highlight = document.createElement('div');
            highlight.id = 'tutorial-highlight';
            highlight.style.cssText = `
                position: absolute;
                border: 3px solid #00d2be;
                border-radius: 10px;
                box-shadow: 0 0 30px rgba(0, 210, 190, 0.5);
                animation: pulse 2s infinite;
                pointer-events: none;
            `;
            
            overlay.appendChild(highlight);
            
            // Botón para continuar
            const continueBtn = document.createElement('button');
            continueBtn.textContent = 'Entendido, continuar';
            continueBtn.style.cssText = `
                margin-top: 30px;
                padding: 15px 30px;
                background: #00d2be;
                color: white;
                border: none;
                border-radius: 5px;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                cursor: pointer;
                z-index: 9999;
                font-size: 1rem;
            `;
            continueBtn.addEventListener('click', () => {
                overlay.remove();
                this.tutorialStep++;
                this.mostrarTutorialStep();
            });
            
            overlay.appendChild(continueBtn);
            document.body.appendChild(overlay);
            
            // Posicionar el highlight en el dashboard header
            const target = document.querySelector('.dashboard-header');
            if (target) {
                const rect = target.getBoundingClientRect();
                highlight.style.top = `${rect.top - 10}px`;
                highlight.style.left = `${rect.left - 10}px`;
                highlight.style.width = `${rect.width + 20}px`;
                highlight.style.height = `${rect.height + 20}px`;
            }
            
            // Añadir animación pulse
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 30px rgba(0, 210, 190, 0.5); }
                    50% { box-shadow: 0 0 50px rgba(0, 210, 190, 0.8); }
                    100% { box-shadow: 0 0 30px rgba(0, 210, 190, 0.5); }
                }
            `;
            document.head.appendChild(style);
            
        }, 1500);
    }
    
    async mostrarSelectorPilotos() {
        // Cargar pilotos disponibles desde la base de datos
        try {
            const { data: pilotos, error } = await supabase
                .from('pilotos_catalogo')  // ← NOMBRE CORRECTO
                .select('id, nombre, nacionalidad, experiencia, habilidad, salario_base')
                .eq('disponible', true)    // ← Solo pilotos disponibles
                .order('habilidad', { ascending: false })  // ← Mejores primero
                .limit(10);
            
            if (error) throw error;
            
            // Actualizar el contenido del tutorial
            document.querySelector('.tutorial-content').innerHTML = `
                <div class="pilotos-tutorial">
                    <h3>🏎️ SELECCIONA 2 PILOTOS</h3>
                    <p class="warning">⚠️ Debes seleccionar exactamente 2 pilotos para continuar</p>
                    
                    <div class="pilotos-grid">
                        ${pilotos.map(piloto => `
                            <div class="piloto-card ${this.tutorialData.pilotosContratados.includes(piloto.id) ? 'selected' : ''}" 
                                 data-piloto-id="${piloto.id}">
                                <div class="piloto-header">
                                    <h4>${piloto.nombre}</h4>
                                    <span class="piloto-nacionalidad">${piloto.nacionalidad || 'Internacional'}</span>
                                </div>
                                <div class="piloto-stats">
                                    <div class="stat">
                                        <i class="fas fa-brain"></i>
                                        <span>Experiencia: ${piloto.experiencia || 5}/10</span>
                                    </div>
                                    <div class="stat">
                                        <i class="fas fa-bolt"></i>
                                        <span>Habilidad: ${piloto.habilidad || 5}/10</span>
                                    </div>
                                    <div class="stat">
                                        <i class="fas fa-coins"></i>
                                        <span>Sueldo: €${(parseFloat(piloto.salario_base) || 500000).toLocaleString()}/mes</span>
                                    </div>
                                </div>
                                <button class="btn-seleccionar" data-piloto-id="${piloto.id}">
                                    ${this.tutorialData.pilotosContratados.includes(piloto.id) ? '✓ Seleccionado' : 'Seleccionar'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="pilotos-selected">
                        <h4>Pilotos seleccionados: <span id="contador-pilotos">${this.tutorialData.pilotosContratados.length}</span>/2</h4>
                        <div id="selected-pilotos-list">
                            ${this.tutorialData.pilotosContratados.map(pilotoId => {
                                const piloto = pilotos.find(p => p.id === pilotoId);
                                return piloto ? `<div class="selected-piloto">✓ ${piloto.nombre}</div>` : '';
                            }).join('')}
                        </div>
                        <button class="btn-confirmar" id="btn-confirmar-pilotos" 
                                ${this.tutorialData.pilotosContratados.length !== 2 ? 'disabled' : ''}>
                            CONFIRMAR SELECCIÓN (€${((pilotos.find(p => this.tutorialData.pilotosContratados.includes(p.id))?.sueldo_base || 0) * 2).toLocaleString()}/mes)
                        </button>
                    </div>
                </div>
                
                <style>
                    .pilotos-tutorial {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    .pilotos-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 20px;
                        margin: 20px 0;
                        max-height: 400px;
                        overflow-y: auto;
                        padding: 10px;
                    }
                    
                    .piloto-card {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                        padding: 20px;
                        border: 2px solid transparent;
                        transition: all 0.3s;
                    }
                    
                    .piloto-card.selected {
                        border-color: #00d2be;
                        background: rgba(0, 210, 190, 0.1);
                    }
                    
                    .piloto-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                    }
                    
                    .piloto-header h4 {
                        color: white;
                        margin: 0;
                        font-size: 1.1rem;
                    }
                    
                    .piloto-nacionalidad {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 3px 10px;
                        border-radius: 15px;
                        font-size: 0.8rem;
                    }
                    
                    .piloto-stats {
                        margin: 15px 0;
                    }
                    
                    .piloto-stats .stat {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 8px;
                        color: #ccc;
                        font-size: 0.9rem;
                    }
                    
                    .btn-seleccionar {
                        width: 100%;
                        padding: 10px;
                        background: rgba(0, 210, 190, 0.2);
                        border: 1px solid #00d2be;
                        color: #00d2be;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: bold;
                    }
                    
                    .btn-seleccionar:hover {
                        background: rgba(0, 210, 190, 0.4);
                    }
                    
                    .pilotos-selected {
                        margin-top: 30px;
                        padding: 20px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px dashed #00d2be;
                    }
                    
                    .selected-piloto {
                        background: rgba(0, 210, 190, 0.2);
                        padding: 10px;
                        margin: 5px 0;
                        border-radius: 5px;
                        color: #00d2be;
                    }
                    
                    .btn-confirmar {
                        margin-top: 20px;
                        padding: 15px 30px;
                        background: #00d2be;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-weight: bold;
                        cursor: pointer;
                        width: 100%;
                        font-size: 1.1rem;
                    }
                    
                    .btn-confirmar:disabled {
                        background: #666;
                        cursor: not-allowed;
                    }
                </style>
            `;
            
            // Eventos de selección
            document.querySelectorAll('.btn-seleccionar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pilotoId = e.target.dataset.pilotoId;
                    this.seleccionarPilotoTutorial(pilotoId, pilotos);
                });
            });
            
            document.getElementById('btn-confirmar-pilotos').addEventListener('click', async () => {
                await this.confirmarPilotosTutorial();
            });
            
        } catch (error) {
            console.error('Error cargando pilotos:', error);
            document.querySelector('.tutorial-content').innerHTML = `
                <p class="error">❌ Error cargando pilotos. Recarga la página.</p>
                <button onclick="location.reload()">Recargar</button>
            `;
        }
    }
    
    seleccionarPilotoTutorial(pilotoId, pilotos) {
        const index = this.tutorialData.pilotosContratados.indexOf(pilotoId);
        
        if (index > -1) {
            // Deseleccionar
            this.tutorialData.pilotosContratados.splice(index, 1);
        } else {
            // Seleccionar (máximo 2)
            if (this.tutorialData.pilotosContratados.length < 2) {
                this.tutorialData.pilotosContratados.push(pilotoId);
            } else {
                alert('Solo puedes seleccionar 2 pilotos');
                return;
            }
        }
        
        // Actualizar UI
        document.querySelectorAll('.piloto-card').forEach(card => {
            if (this.tutorialData.pilotosContratados.includes(card.dataset.pilotoId)) {
                card.classList.add('selected');
                card.querySelector('.btn-seleccionar').textContent = '✓ Seleccionado';
            } else {
                card.classList.remove('selected');
                card.querySelector('.btn-seleccionar').textContent = 'Seleccionar';
            }
        });
        
        // Actualizar contador
        const contador = document.getElementById('contador-pilotos');
        if (contador) contador.textContent = this.tutorialData.pilotosContratados.length;
        
        // Actualizar lista de seleccionados
        const lista = document.getElementById('selected-pilotos-list');
        if (lista) {
            lista.innerHTML = this.tutorialData.pilotosContratados.map(id => {
                const piloto = pilotos.find(p => p.id === id);
                return piloto ? `<div class="selected-piloto">✓ ${piloto.nombre}</div>` : '';
            }).join('');
        }
        
        // Actualizar botón de confirmar
        const confirmBtn = document.getElementById('btn-confirmar-pilotos');
        if (confirmBtn) {
            confirmBtn.disabled = this.tutorialData.pilotosContratados.length !== 2;
            
            // Actualizar costo total
            if (this.tutorialData.pilotosContratados.length === 2) {
                const totalSueldo = this.tutorialData.pilotosContratados.reduce((total, id) => {
                    const piloto = pilotos.find(p => p.id === id);
                    return total + (piloto?.salario_base || 500000);
                }, 0);
                confirmBtn.innerHTML = `CONFIRMAR SELECCIÓN (€${totalSueldo.toLocaleString()}/mes)`;
            }
        }
    }
    
    async confirmarPilotosTutorial() {
        if (!this.escuderia) {
            alert('Primero debes crear tu escudería');
            return;
        }
        
        if (this.tutorialData.pilotosContratados.length !== 2) {
            alert('Debes seleccionar exactamente 2 pilotos');
            return;
        }
        
        try {
            // 1. Obtener los pilotos seleccionados CON SUS DATOS REALES
            const { data: pilotosCatalogo, error: catalogoError } = await supabase
                .from('pilotos_catalogo')
                .select('id, nombre, salario_base')
                .in('id', this.tutorialData.pilotosContratados);
            
            if (catalogoError) throw catalogoError;
            
            // 2. Contratar CADA piloto en la tabla pilotos_contratados
            for (const piloto of pilotosCatalogo) {
                const { error: contratoError } = await supabase
                    .from('pilotos_contratados')
                    .insert([{
                        escuderia_id: this.escuderia.id,
                        piloto_id: piloto.id,
                        nombre: piloto.nombre,
                        salario: piloto.salario_base || 500000,
                        carreras_restantes: 12, // 1 temporada
                        activo: true,
                        salario_actual: piloto.salario_base || 500000
                    }]);
                
                if (contratoError) throw contratoError;
            }
            
            // 3. Descontar el dinero de los salarios
            const totalSalarios = pilotosCatalogo.reduce((sum, p) => sum + (p.salario_base || 500000), 0);
            this.escuderia.dinero -= totalSalarios;
            await this.updateEscuderiaMoney();
            
            // 4. Avanzar tutorial
            this.tutorialStep++;
            this.mostrarTutorialStep();
            
            alert(`✅ Pilotos contratados: ${pilotosCatalogo.map(p => p.nombre).join(' y ')}\n💰 Coste mensual: €${totalSalarios.toLocaleString()}`);
            
        } catch (error) {
            console.error('Error contratando pilotos:', error);
            alert('❌ Error contratando pilotos. Verifica la consola.');
        }
    }
    
    mostrarFabricacionTutorial() {
        document.querySelector('.tutorial-content').innerHTML = `
            <div class="fabricacion-tutorial">
                <h3>🏭 PRIMERA FABRICACIÓN</h3>
                <p>Selecciona un área de tu coche para fabricar tu primera pieza:</p>
                
                <div class="areas-grid">
                    ${window.CAR_AREAS.slice(0, 6).map(area => `
                        <div class="area-card" data-area="${area.id}">
                            <div class="area-icon" style="color: ${area.color}">
                                <i class="${area.icon}"></i>
                            </div>
                            <h4>${area.name}</h4>
                            <p>Costo: <strong>€10,000</strong></p>
                            <p>Tiempo: <strong>4 horas</strong></p>
                            <button class="btn-fabricar-tutorial" data-area="${area.id}">
                                <i class="fas fa-hammer"></i> Fabricar
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="fabricacion-info">
                    <p><i class="fas fa-info-circle"></i> Cada pieza fabricada da <strong>10 puntos base</strong> que generan ingresos después de cada carrera.</p>
                    <p><i class="fas fa-chart-line"></i> Necesitas <strong>20 piezas</strong> de un área para subir de nivel.</p>
                </div>
            </div>
            
            <style>
                .fabricacion-tutorial {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .areas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .area-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    border: 2px solid transparent;
                    transition: all 0.3s;
                }
                
                .area-card:hover {
                    border-color: #00d2be;
                    transform: translateY(-5px);
                }
                
                .area-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }
                
                .area-card h4 {
                    color: white;
                    margin: 10px 0;
                    font-size: 1.1rem;
                }
                
                .area-card p {
                    color: #ccc;
                    margin: 5px 0;
                    font-size: 0.9rem;
                }
                
                .btn-fabricar-tutorial {
                    margin-top: 15px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #00d2be, #009688);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                }
                
                .fabricacion-info {
                    margin-top: 30px;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    border-left: 4px solid #00d2be;
                }
                
                .fabricacion-info p {
                    margin: 10px 0;
                    color: #ddd;
                }
            </style>
        `;
        
        // Eventos de fabricación
        document.querySelectorAll('.btn-fabricar-tutorial').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const areaId = e.target.dataset.area;
                const area = window.CAR_AREAS.find(a => a.id === areaId);
                
                // Mostrar confirmación
                if (confirm(`¿Iniciar fabricación de ${area?.name}?\nCosto: €10,000\nTiempo: 4 horas`)) {
                    try {
                        // Simular fabricación (en producción real, llamarías a fabricacionManager)
                        this.tutorialData.fabricacionIniciada = true;
                        
                        // Avanzar tutorial
                        this.tutorialStep++;
                        this.mostrarTutorialStep();
                        
                    } catch (error) {
                        console.error('Error iniciando fabricación:', error);
                        alert('Error al iniciar fabricación');
                    }
                }
            });
        });
    }
    
    mostrarApuestasTutorial() {
        document.querySelector('.tutorial-content').innerHTML = `
            <div class="apuestas-tutorial">
                <h3>💰 SISTEMA DE APUESTAS</h3>
                <p>Predice el Top 10 de la próxima carrera para ganar puntos y dinero:</p>
                
                <div class="apuestas-grid">
                    <div class="apuesta-card">
                        <h4><i class="fas fa-trophy"></i> Mecánica Básica</h4>
                        <ul>
                            <li><strong>Cierre:</strong> Jueves 23:59 antes del GP</li>
                            <li><strong>Predicción:</strong> Orden del Top 10</li>
                            <li><strong>Puntos:</strong> +10 por acierto exacto</li>
                            <li><strong>Dinero:</strong> 1 punto = €1,000</li>
                        </ul>
                    </div>
                    
                    <div class="apuesta-card">
                        <h4><i class="fas fa-chart-line"></i> Estrategia</h4>
                        <ul>
                            <li>Usa las estadísticas de pilotos</li>
                            <li>Considera el circuito</li>
                            <li>Analiza el rendimiento reciente</li>
                            <li>Gestiona tu riesgo</li>
                        </ul>
                    </div>
                    
                    <div class="apuesta-card">
                        <h4><i class="fas fa-coins"></i> Recompensas</h4>
                        <ul>
                            <li><strong>10 aciertos:</strong> 100 pts + €100,000</li>
                            <li><strong>8-9 aciertos:</strong> 80-90 pts</li>
                            <li><strong>5-7 aciertos:</strong> 50-70 pts</li>
                            <li><strong>Bonus:</strong> Puntos extra por predicciones difíciles</li>
                        </ul>
                    </div>
                </div>
                
                <div class="apuestas-ejemplo">
                    <h4>📋 Ejemplo de apuesta:</h4>
                    <p>Si aciertas 7 posiciones exactas:</p>
                    <p><strong>7 aciertos × 10 puntos = 70 puntos</strong></p>
                    <p><strong>70 puntos × €1,000 = €70,000 de ganancia</strong></p>
                </div>
                
                <div class="apuestas-accion">
                    <button class="btn-simular-apuesta" id="btn-simular-apuesta">
                        <i class="fas fa-dice"></i> Simular apuesta de ejemplo
                    </button>
                </div>
            </div>
            
            <style>
                .apuestas-tutorial {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .apuestas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .apuesta-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 20px;
                    border-top: 4px solid #00d2be;
                }
                
                .apuesta-card h4 {
                    color: white;
                    margin: 0 0 15px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .apuesta-card ul {
                    margin: 0;
                    padding-left: 20px;
                }
                
                .apuesta-card li {
                    color: #ccc;
                    margin: 8px 0;
                    font-size: 0.9rem;
                }
                
                .apuestas-ejemplo {
                    margin: 30px 0;
                    padding: 20px;
                    background: rgba(0, 210, 190, 0.1);
                    border-radius: 10px;
                    border: 1px solid #00d2be;
                }
                
                .apuestas-ejemplo h4 {
                    color: #00d2be;
                    margin-top: 0;
                }
                
                .apuestas-ejemplo p {
                    color: #ddd;
                    margin: 10px 0;
                }
                
                .btn-simular-apuesta {
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #e10600, #ff4444);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                }
                
                .btn-simular-apuesta:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(225, 6, 0, 0.4);
                }
            </style>
        `;
        
        // Evento para simular apuesta
        document.getElementById('btn-simular-apuesta').addEventListener('click', () => {
            this.tutorialData.apuestaRealizada = true;
            alert('¡Apuesta simulada exitosamente!\nHas ganado 70,000€ en esta simulación.\n\nEn el juego real, deberás esperar al cierre de apuestas del jueves para ver tus resultados.');
            
            // Avanzar al último paso
            this.tutorialStep++;
            this.mostrarTutorialStep();
        });
    }
    
    finalizarTutorial() {
        // Guardar que el tutorial está completado
        localStorage.setItem('tutorial_completado', 'true');
        
        // Cargar dashboard completo
        this.cargarDashboardCompleto();
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            this.showNotification('🎉 ¡Tutorial completado! ¡Bienvenido a F1 Manager!', 'success');
        }, 1000);
    }
    
    async loadUserData() {
        console.log('📥 Cargando datos del usuario...');
        
        try {
            // Buscar escudería del usuario en Supabase
            const { data: escuderias, error } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', this.user.id)
                .order('creada_en', { ascending: false })
                .limit(1)
                .maybeSingle(); // <- CORRECCIÓN
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error cargando escudería:', error);
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

    async loadPilotosContratados() {
        if (!this.escuderia || !this.escuderia.id) {
            console.log('❌ No hay escudería para cargar pilotos');
            return;
        }

        try {
            console.log('👥 Cargando pilotos contratados...');
            const { data: pilotos, error } = await this.supabase
                .from('pilotos_contratados')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true)
                .order('contratado_en', { ascending: false });

            if (error) throw error;

            this.pilotos = pilotos || [];
            console.log(`✅ ${this.pilotos.length} piloto(s) cargado(s)`);
            
            // Actualizar la interfaz
            this.updatePilotosUI();
            
        } catch (error) {
            console.error('❌ Error cargando pilotos:', error);
            this.pilotos = [];
            this.updatePilotosUI(); // Aún así actualizar la UI para mostrar estado vacío
        }
    }
    
     // AÑADE ESTE MÉTODO DENTRO DE LA CLASE F1Manager en main.js
    async crearDatosInicialesSiFaltan() {
        console.log('🔍 Verificando si faltan datos iniciales...');
        
        // 1. Verificar si el usuario ya está en public.users
        const { data: usuarioPublico, error: userError } = await this.supabase
            .from('users')
            .select('id')
            .eq('id', this.user.id)
            .maybeSingle();
        
        // Si NO existe en public.users, lo creamos
        if (!usuarioPublico && !userError) {
            console.log('👤 Creando usuario en tabla pública...');
            const { error: insertError } = await this.supabase
                .from('users')
                .insert([{
                    id: this.user.id,
                    username: this.user.user_metadata?.username || this.user.email?.split('@')[0],
                    email: this.user.email,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                }]);
            
            if (insertError) {
                console.error('❌ Error creando usuario público:', insertError);
            }
        }
        
        // 2. Verificar si ya tiene escudería
        const { data: escuderia, error: escError } = await this.supabase
            .from('escuderias')
            .select('id')
            .eq('user_id', this.user.id)
            .maybeSingle();
        
        // Si NO tiene escudería, la creamos
        if (!escuderia && !escError) {
            console.log('🏎️ Creando escudería inicial...');
            const nombreEscuderia = this.user.user_metadata?.team_name || `${this.user.user_metadata?.username}'s Team`;
            
            const { error: escInsertError } = await this.supabase
                .from('escuderias')
                .insert([{
                    user_id: this.user.id,
                    nombre: nombreEscuderia,
                    dinero: 5000000,
                    puntos: 0,
                    ranking: 999,
                    nivel_ingenieria: 1,
                    color_principal: '#e10600',
                    color_secundario: '#ffffff',
                    creada_en: new Date().toISOString()
                }], { returning: 'minimal' }); // ← ¡IMPORTANTE!
            
            if (escInsertError) {
                console.error('❌ Error creando escudería:', escInsertError);
                return false;
            }
            
            // 3. Crear stats del coche (SOLO si no existen ya)
            const { data: nuevaEscuderia } = await this.supabase
                .from('escuderias')
                .select('id')
                .eq('user_id', this.user.id)
                .single();
        
            if (nuevaEscuderia) {
                // PRIMERO verificar si ya existen stats para esta escudería
                const { data: statsExistentes, error: statsError } = await this.supabase
                    .from('coches_stats')
                    .select('escuderia_id')
                    .eq('escuderia_id', nuevaEscuderia.id)
                    .maybeSingle();
            
                // SOLO insertar si NO existen stats
                if (!statsExistentes && !statsError) {
                    const { error: statsInsertError } = await this.supabase
                        .from('coches_stats')
                        .insert([{ escuderia_id: nuevaEscuderia.id }]);
                
                    if (statsInsertError) {
                        console.error('❌ Error creando stats del coche:', statsInsertError);
                    } else {
                        console.log('📊 Stats del coche creados');
                    }
                } else {
                    console.log('📊 Stats del coche ya existían, no se crean nuevos');
                }
            }
            
            console.log('✅ Datos iniciales creados correctamente');
            return true;
        }
        
        return true; // Ya tenía todos los datos
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
    
    // ========================
    // DASHBOARD COMPLETO (igual que antes)
    // ========================
    
    async cargarDashboardCompleto() {
        console.log('📊 Cargando dashboard COMPLETO con CSS...');
        
        if (!this.escuderia) {
            console.error('❌ No hay escudería para cargar dashboard');
            return;
        }
        
        // 1. PRIMERO crear el HTML COMPLETO (igual que tu versión actual)
        // [Aquí va TODO tu código HTML de cargarDashboardCompleto() que ya tienes]
        // Lo mantengo igual porque ya funciona bien
        
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
            await this.loadPilotosContratados(); // <-- AÑADE ESTA LÍNEA
            await this.loadProximoGP();
        }
        
        // 4. Configurar eventos
        await this.cargarDatosDashboard();
        
        console.log('✅ Dashboard cargado correctamente con CSS');
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
                .maybeSingle();
            
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
            } else {
                // Caso NUEVO: gp es null (no se encontró nada)
                console.log('ℹ️ No hay GP próximo configurado en la base de datos');
                this.proximoGP = {
                    nombre: 'Próximo GP por confirmar',
                    fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                    circuito: 'Circuito por confirmar'
                };
            }
            
            this.updateCountdown();
            
        } catch (error) {
            console.error('❌ Error fatal en loadProximoGP:', error);
            // Crear datos de ejemplo
            this.proximoGP = {
                nombre: 'Próximo GP por confirmar',
                fecha_inicio: new Date(Date.now() + 86400000 * 7).toISOString(),
                circuito: 'Circuito por confirmar'
            };
            this.updateCountdown();
        }
    }
    
    // ========================
    // MÉTODOS AUXILIARES (igual que antes)
    // ========================
    
    async loadCarStatus() {
        if (!this.escuderia) return;
        
        try {
            const { data: stats } = await supabase
                .from('coches_stats')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .maybeSingle();
            
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
    
    updateCarAreasUI() {
        const container = document.getElementById('areas-coche');
        if (!container || !this.carStats) return;
        
        container.innerHTML = window.CAR_AREAS.map(area => {
            const nivel = this.carStats[`${area.id}_nivel`] || 0;
            const progreso = this.carStats[`${area.id}_progreso`] || 0;
            const porcentaje = (progreso / window.CONFIG.PIECES_PER_LEVEL) * 100;
            
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
                        <i class="fas fa-hammer"></i> Fabricar (€${window.CONFIG.PIECE_COST.toLocaleString()})
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
    
    updatePilotosUI() {
        const container = document.getElementById('pilotos-container'); // El div contenedor
        if (!container) {
            console.error('❌ No se encontró #pilotos-container');
            return;
        }

        if (!this.pilotos || this.pilotos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    <p>No tienes pilotos contratados</p>
                    <button class="btn-primary" id="contratar-primer-piloto">
                        <i class="fas fa-user-plus"></i> Contratar mi primer piloto
                    </button>
                </div>
            `;
            // Opcional: agregar evento al botón
            document.getElementById('contratar-primer-piloto')?.addEventListener('click', () => {
                // Tu lógica para abrir el selector de pilotos
            });
            return;
        }

        // Generar HTML para cada piloto
        let html = '';
        this.pilotos.forEach(piloto => {
            // Calcula carreras restantes si no está en los datos
            const carrerasRestantes = piloto.carreras_restantes || 'N/A';
            const salario = piloto.salario ? '€' + parseInt(piloto.salario).toLocaleString('es-ES') : 'N/A';
            
            html += `
                <div class="piloto-card">
                    <div class="piloto-header">
                        <div class="piloto-name">
                            <h3>${piloto.nombre}</h3>
                            <span class="piloto-nacionalidad">
                                <i class="fas fa-flag"></i> ${piloto.nacionalidad || 'Internacional'}
                            </span>
                        </div>
                        <div class="piloto-status">Contratado</div>
                    </div>
                    <div class="piloto-stats">
                        <div class="piloto-stat">
                            <span class="stat-label">Salario</span>
                            <span class="stat-value">${salario}</span>
                        </div>
                        <div class="piloto-stat">
                            <span class="stat-label">Carreras Restantes</span>
                            <span class="stat-value">${carrerasRestantes}</span>
                        </div>
                        <div class="piloto-stat">
                            <span class="stat-label">Contrato desde</span>
                            <span class="stat-value">${new Date(piloto.contratado_en).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                    <div class="piloto-contract">
                        <div class="contract-progress">
                            <span class="contract-label">Progreso del contrato</span>
                            <span class="carreras-restantes">${carrerasRestantes} carreras</span>
                        </div>
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${(carrerasRestantes/12)*100}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
    
    iniciarFabricacion(areaId) {
        console.log('🔧 [DEBUG] === INICIAR FABRICACION ===');
        console.log('1. window.fabricacionManager:', window.fabricacionManager);
        console.log('2. window.FabricacionManager:', window.FabricacionManager);
        console.log('3. this.escuderia:', this.escuderia);

        // AÑADE ESTA VERIFICACIÓN AQUÍ:
        if (!this.escuderia || this.escuderia.dinero < window.CONFIG.PIECE_COST) {
            const falta = window.CONFIG.PIECE_COST - (this.escuderia?.dinero || 0);
            this.showNotification(`❌ Fondos insuficientes. Necesitas €${falta.toLocaleString()} más`, 'error');
            return false;
        }
        
        // SI fabricacionManager no existe, CREARLO
        if (!window.fabricacionManager) {
            console.log('⚠️ [DEBUG] fabricacionManager es undefined...');
            
            if (window.FabricacionManager) {
                console.log('✅ [DEBUG] Clase existe, creando instancia...');
                window.fabricacionManager = new window.FabricacionManager();
                console.log('✅ [DEBUG] Instancia creada:', window.fabricacionManager);
            } else {
                console.error('❌ [DEBUG] Clase NO existe - Error fatal');
                // Ver qué scripts se cargaron
                console.log('Scripts cargados:');
                console.log('- config.js:', typeof CONFIG !== 'undefined');
                console.log('- auth.js:', typeof authManager !== 'undefined');
                console.log('- main.js:', typeof f1Manager !== 'undefined');
                console.log('- fabricacion.js:', typeof FabricacionManager !== 'undefined');
                this.showNotification('Error: Sistema de fabricación no cargado', 'error');
                return false;
            }
        }
        
        // Verificar escudería
        if (!this.escuderia) {
            console.error('❌ No tienes escudería');
            this.showNotification('❌ No tienes escudería', 'error');
            return false;
        }
        
        // Inicializar si es necesario
        if (window.fabricacionManager && !window.fabricacionManager.escuderiaId && this.escuderia) {
            console.log('🔧 [DEBUG] Inicializando fabricacionManager con escudería:', this.escuderia.id);
            window.fabricacionManager.inicializar(this.escuderia.id);
        }
        
        console.log('🔧 [DEBUG] Llamando a iniciarFabricacion...'); // <-- CAMBIADO
        
        // Verificar que el método existe (CORREGIDO EL NOMBRE)
        if (!window.fabricacionManager.iniciarFabricacion) { // <-- CAMBIADO
            console.error('❌ [DEBUG] iniciarFabricacion no existe en fabricacionManager');
            console.log('Métodos disponibles:', Object.keys(window.fabricacionManager));
            this.showNotification('Error: Método de fabricación no disponible', 'error');
            return false;
        }
        
        // Ejecutar la fabricación y CAPTURAR el resultado
        const resultado = window.fabricacionManager.iniciarFabricacion(areaId); // <-- CAMBIADO
        
        // SI fue exitoso, ACTUALIZAR LA UI
        if (resultado) {
            console.log('✅ Fabricación iniciada exitosamente');
            
            // 1. Mostrar notificación
            const area = window.CAR_AREAS.find(a => a.id === areaId);
            if (area) {
                this.showNotification(`✅ Fabricación de ${area.name} iniciada (30 segundos)`, 'success');
            }
            
            // 2. Actualizar el monitor de producción INMEDIATAMENTE
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 1000);
            
            // 3. Deshabilitar temporalmente el botón
            const boton = document.querySelector(`[data-area="${areaId}"]`);
            if (boton) {
                boton.disabled = true;
                boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fabricando...';
            }
            
            // 4. Actualizar dinero si hubo costo
            if (this.escuderia.dinero !== null) {
                this.escuderia.dinero -= window.CONFIG.PIECE_COST || 10000;
                this.updateEscuderiaMoney();
            }
        } else {
            this.showNotification('❌ No se pudo iniciar la fabricación', 'error');
        }
        
        return resultado;
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
        
        // Actualizar producción en tiempo real INMEDIATAMENTE
        this.updateProductionMonitor();
        
        // Configurar eventos de botones
        this.setupDashboardEvents();
        
        // Iniciar temporizadores para actualización automática
        this.startTimers();
        
        console.log('✅ Dashboard configurado con timers');
    }
    
    startTimers() {
        // Timer de producción (actualizar cada 5 segundos)
        if (this.productionTimer) {
            clearInterval(this.productionTimer);
        }
        
        // PRIMERA ejecución con retraso para que el DOM esté listo
        setTimeout(() => {
            this.updateProductionMonitor();
        }, 300); // 300ms es suficiente para que el HTML se renderice
        
        // Luego iniciar el intervalo normal cada 5 segundos
        this.productionTimer = setInterval(() => {
            this.updateProductionMonitor();
        }, 5000);
        
        // Timer de countdown
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        this.countdownTimer = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        console.log('⏱️ Timers iniciados');
    }
    
    async updateProductionMonitor() {
        if (!window.fabricacionManager) {
            console.log('⚠️ fabricacionManager no disponible - intentando crear');
            
            if (window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                if (this.escuderia && this.escuderia.id) {
                    window.fabricacionManager.inicializar(this.escuderia.id);
                }
            } else {
                console.log('❌ FabricacionManager no está definido');
                return;
            }
        }
        
        const container = document.getElementById('produccion-actual');
        if (!container) {
            console.log('❌ No se encontró #produccion-actual');
            return;
        }
        
        let fabricaciones = [];
        if (window.fabricacionManager.getProduccionesEnCurso) {
            fabricaciones = window.fabricacionManager.getProduccionesEnCurso();
        }
        
        if (!fabricaciones || fabricaciones.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-industry"></i>
                    <p>No hay producción en curso</p>

                </div>
            `;
            
            const btn = document.getElementById('iniciar-fabricacion-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.irAlTaller();
                });
            }
            
            return;
        }
        
        let html = `
            <div class="produccion-header">
                <h3><i class="fas fa-industry"></i> Fabricaciones en curso</h3>
                <span class="badge">${fabricaciones.length} activas</span>
            </div>
            <div class="fabricaciones-lista">
        `;
        
        fabricaciones.forEach((fab, index) => {
            const ahora = new Date();
            const tiempoInicio = new Date(fab.tiempo_inicio);
            const tiempoFin = new Date(fab.tiempo_fin);
            
            const tiempoTotal = tiempoFin - tiempoInicio;
            const tiempoTranscurrido = ahora - tiempoInicio;
            const progreso = Math.min(100, (tiempoTranscurrido / tiempoTotal) * 100);
            const tiempoRestante = tiempoFin - ahora;
            const lista = ahora >= tiempoFin;
            
            html += `
                <div class="fabricacion-item ${lista ? 'lista' : ''}">
                    <div class="fabricacion-info">
                        <div class="fab-area">
                            <i class="fas fa-cog"></i>
                            <span>${fab.area} Nivel ${fab.nivel}</span>
                        </div>
                        <div class="fab-estado">
                            <span class="estado-badge ${lista ? 'lista' : 'fabricando'}">
                                ${lista ? '✅ LISTA' : '🔄 FABRICANDO'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="fab-progreso">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${progreso}%"></div>
                        </div>
                        <div class="fab-tiempo">
                            <i class="far fa-clock"></i>
                            <span>${lista ? '¡Lista para recoger!' : `Tiempo restante: ${this.formatTime(tiempoRestante)}`}</span>
                        </div>
                    </div>
                    
                    <div class="fab-acciones">
                        <button class="btn-small btn-success" ${!lista ? 'disabled' : ''} 
                                onclick="window.fabricacionManager.recogerPieza('${fab.id}')">
                            <i class="fas fa-box-open"></i> ${lista ? 'Recoger' : 'Esperar'}
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>

        `;
        
        container.innerHTML = html;
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
}
// Iniciar aplicación
console.log('🚀 Iniciando aplicación desde el final del archivo...');
iniciarAplicacion();
