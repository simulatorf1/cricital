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
                    <h1>MOTORSPORT Dennis</h1>
                    <p>Gestiona tu escudería de MotorSport</p>
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
                        <div class="password-input-container">
                            <input type="password" id="login-password" placeholder="••••••••">
                            <button type="button" class="toggle-password" id="toggle-login-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
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
            
            .password-input-container {
                position: relative;
            }
            
            .password-input-container input {
                padding-right: 45px;
            }
            
            .toggle-password {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                color: #aaa;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toggle-password:hover {
                color: #00d2be;
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
    
    // Configurar botón para mostrar/ocultar contraseña
    document.getElementById('toggle-login-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('login-password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
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
                    <p>Comienza tu aventura en MotorSport</p>
                </div>
                
                <div id="register-error" class="error-message"></div>
                <div id="register-success" class="success-message"></div>
                
                <div class="register-form">
                    <div class="form-group">
                        <label for="register-username">Nombre de tu escudería</label>
                        <input type="text" id="register-username" placeholder="Ej: RedBullManager" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label for="register-email">Correo electrónico</label>
                        <input type="email" id="register-email" placeholder="tu@email.com">
                    </div>
                    <div class="form-group">
                        <label for="register-password">Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" id="register-password" placeholder="•••••••• (mínimo 6 caracteres)">
                            <button type="button" class="toggle-password" id="toggle-register-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="register-buttons">
                    <button class="btn-validate" id="btn-validate">
                        <i class="fas fa-check-circle"></i>
                        VALIDAR DISPONIBILIDAD
                    </button>
                    <button class="register-button" id="btn-register-submit" disabled>
                        <i class="fas fa-user-plus"></i>
                        CREAR CUENTA
                    </button>
                </div>
                
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
            
            .password-input-container {
                position: relative;
            }
            
            .password-input-container input {
                padding-right: 45px;
            }
            
            .toggle-password {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                color: #aaa;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toggle-password:hover {
                color: #00d2be;
            }
            
            .register-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 20px;
            }
            
            .btn-validate {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #ff9800, #ff5722);
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
            }
            
            .btn-validate:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 152, 0, 0.4);
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
            }
            
            .register-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 210, 190, 0.4);
            }
            
            .register-button:disabled {
                background: linear-gradient(135deg, #666, #888);
                cursor: not-allowed;
                opacity: 0.6;
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
    document.getElementById('btn-validate').addEventListener('click', validarDisponibilidad);
    document.getElementById('btn-register-submit').addEventListener('click', manejarRegistro);
    
    // Configurar botón para mostrar/ocultar contraseña en registro
    document.getElementById('toggle-register-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('register-password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
}

async function validarDisponibilidad() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    const btnRegister = document.getElementById('btn-register-submit');
    const btnValidate = document.getElementById('btn-validate');
    
    // Limpiar mensajes anteriores
    mostrarMensaje('', errorDiv);
    mostrarMensaje('', successDiv);
    
    // Validaciones básicas
    if (!username || !email || !password) {
        mostrarMensaje('Por favor, completa todos los campos', errorDiv);
        btnRegister.disabled = true;
        return;
    }
    
    if (password.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', errorDiv);
        btnRegister.disabled = true;
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensaje('Por favor, introduce un correo electrónico válido', errorDiv);
        btnRegister.disabled = true;
        return;
    }
    
    // Deshabilitar botón de validar mientras se verifica
    btnValidate.disabled = true;
    btnValidate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';
    
    try {
        console.log('🔍 Iniciando validación para:', { username, email });
        
        // 1. Verificar si el USERNAME ya existe en la tabla users
        console.log('📊 Buscando username en users:', username);
        const { data: usernameExistente, error: userError } = await supabase
            .from('users')
            .select('username, email')
            .eq('username', username)
            .maybeSingle();
        
        console.log('Resultado búsqueda username:', usernameExistente, 'Error:', userError);
        
        if (userError && userError.code !== 'PGRST116') {
            console.error('Error en consulta username:', userError);
            throw userError;
        }
        
        if (usernameExistente) {
            mostrarMensaje('❌ Ya existe un usuario con ese nombre de escudería', errorDiv);
            btnRegister.disabled = true;
            btnValidate.disabled = false;
            btnValidate.innerHTML = '<i class="fas fa-check-circle"></i> VALIDAR DISPONIBILIDAD';
            return;
        }
        
        // 2. Verificar si el EMAIL ya existe en la tabla users
        console.log('📧 Buscando email en users:', email);
        const { data: emailExistente, error: emailError } = await supabase
            .from('users')
            .select('username, email')
            .eq('email', email)
            .maybeSingle();
        
        console.log('Resultado búsqueda email:', emailExistente, 'Error:', emailError);
        
        if (emailError && emailError.code !== 'PGRST116') {
            console.error('Error en consulta email:', emailError);
            throw emailError;
        }
        
        if (emailExistente) {
            mostrarMensaje('❌ Este correo electrónico ya está registrado', errorDiv);
            btnRegister.disabled = true;
            btnValidate.disabled = false;
            btnValidate.innerHTML = '<i class="fas fa-check-circle"></i> VALIDAR DISPONIBILIDAD';
            return;
        }
        
        // 3. Si pasa ambas validaciones
        console.log('✅ Validación exitosa - Datos disponibles');
        mostrarMensaje('✅ ¡Nombre y correo disponibles! Ahora puedes crear tu cuenta', successDiv);
        btnRegister.disabled = false;
        
        // Cambiar botón de validar
        btnValidate.disabled = false;
        btnValidate.innerHTML = '<i class="fas fa-check-double"></i> VALIDADO ✓';
        btnValidate.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
        
    } catch (error) {
        console.error('❌ Error completo en validación:', error);
        
        mostrarMensaje('❌ Error al verificar disponibilidad. Intenta de nuevo.', errorDiv);
        btnRegister.disabled = true;
        
        // Restaurar botón de validar
        btnValidate.disabled = false;
        btnValidate.innerHTML = '<i class="fas fa-check-circle"></i> VALIDAR DISPONIBILIDAD';
        btnValidate.style.background = 'linear-gradient(135deg, #ff9800, #ff5722)';
    }
}

async function manejarRegistro() {
    // ← DESHABILITAR BOTÓN INMEDIATAMENTE
    const btnCrear = document.getElementById('btn-register-submit');
    const textoOriginal = btnCrear.innerHTML;
    btnCrear.disabled = true;
    btnCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
    
    const supabase = window.supabase;
    if (!supabase) {
        mostrarErrorCritico('No se pudo conectar con la base de datos');
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
        return;
    }
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    if (!username || !email || !password) {
        mostrarMensaje('Por favor, completa todos los campos', errorDiv);
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
        return;
    }
    
    if (password.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', errorDiv);
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
        return;
    }
    
    try {
        console.log('📝 Verificando disponibilidad...');
        
        // ← PRIMERO verificar si YA existe usuario con ese email
        try {
            // Intento verificar si hay sesión (usuario ya logeado con ese email)
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                mostrarMensaje('⚠️ Ya hay una sesión activa con otro usuario', errorDiv);
                return;
            }
        } catch (e) {
            // Ignorar error de verificación
        }
        
        // ← SOLO SI pasa la verificación, registrar
        console.log('✅ Creando usuario:', email);
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
            
            // ← SI el error es "email ya registrado", mostramos mensaje y SALIMOS
            if (authError.message.includes('already registered') || 
                authError.message.includes('User already registered')) {
                mostrarMensaje('Este correo ya está registrado', errorDiv);
                return;
            }
            throw authError;
        }
        
        console.log('✅ Usuario creado en Auth:', authData.user?.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ← AHORA crear la escudería (la BD ya valida nombre único)
        console.log('🏎️ Creando escudería:', username);
        const { data: nuevaEscuderia, error: escError } = await supabase
            .from('escuderias')
            .insert([{
                user_id: authData.user.id,
                nombre: username,
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
            console.error('❌ Error creando escudería:', escError);
            
            // ← SI la escudería ya existe, mostramos error PERO el usuario YA está creado
            // Esto es lo que queremos evitar, pero si pasa, al menos informamos
            if (escError.message.includes('escuderias_nombre_key') || 
                escError.message.includes('duplicate')) {
                mostrarMensaje('❌ Ya existe una escudería con ese nombre (el usuario se creó)', errorDiv);
            }
            throw escError;
        }
        
        console.log('✅ Escudería creada:', nuevaEscuderia.id);
        
        await supabase
            .from('coches_stats')
            .insert([{ escuderia_id: nuevaEscuderia.id }]);
        
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
        } else if (error.message.includes('escuderias_nombre_key') || error.message.includes('duplicate key')) {
            mensajeError = '❌ Ya existe una escudería con ese nombre. Por favor, elige otro nombre.';
        }
        
        mostrarMensaje(mensajeError, errorDiv);
        
    } finally {
        // ← SIEMPRE restaurar botón
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
    }
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
    // ← DESHABILITAR BOTÓN INMEDIATAMENTE
    const btnCrear = document.getElementById('btn-register-submit');
    const textoOriginal = btnCrear.innerHTML;
    btnCrear.disabled = true;
    btnCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
    
    const supabase = window.supabase;
    if (!supabase) {
        mostrarErrorCritico('No se pudo conectar a la base de datos');
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
        return;
    }
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    if (!username || !email || !password) {
        mostrarMensaje('Por favor, completa todos los campos', errorDiv);
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
        return;
    }
    
    if (password.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', errorDiv);
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
        return;
    }
    
    try {
        console.log('📝 Verificando disponibilidad...');
        
        // ← VERIFICACIÓN FINAL (doble chequeo en tabla users)
        // 1. Verificar username en tabla users
        const { data: usernameExistente, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle();
        
        if (!userCheckError && usernameExistente) {
            mostrarMensaje('❌ Ya existe un usuario con ese nombre de escudería. Por favor, elige otro.', errorDiv);
            return;
        }
        
        // 2. Verificar email en tabla users
        const { data: emailExistente, error: emailCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();
        
        if (!emailCheckError && emailExistente) {
            mostrarMensaje('❌ Este correo electrónico ya está registrado.', errorDiv);
            return;
        }
        
        // ← SOLO SI pasa la verificación, registrar
        console.log('✅ Creando usuario:', email);
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
            
            // ← SI el error es "email ya registrado", mostramos mensaje y SALIMOS
            if (authError.message.includes('already registered') || 
                authError.message.includes('User already registered')) {
                mostrarMensaje('Este correo ya está registrado', errorDiv);
                return;
            }
            throw authError;
        }
        
        console.log('✅ Usuario creado en Auth:', authData.user?.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ← AHORA crear la escudería (la BD ya valida nombre único)
        console.log('🏎️ Creando escudería:', username);
        const { data: nuevaEscuderia, error: escError } = await supabase
            .from('escuderias')
            .insert([{
                user_id: authData.user.id,
                nombre: username,
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
            console.error('❌ Error creando escudería:', escError);
            
            // ← SI la escudería ya existe, mostramos error PERO el usuario YA está creado
            // Esto es lo que queremos evitar, pero si pasa, al menos informamos
            if (escError.message.includes('escuderias_nombre_key') || 
                escError.message.includes('duplicate')) {
                mostrarMensaje('❌ Ya existe una escudería con ese nombre (el usuario se creó)', errorDiv);
            }
            throw escError;
        }
        
        console.log('✅ Escudería creada:', nuevaEscuderia.id);
        
        await supabase
            .from('coches_stats')
            .insert([{ escuderia_id: nuevaEscuderia.id }]);
        
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
        } else if (error.message.includes('escuderias_nombre_key') || error.message.includes('duplicate key')) {
            mensajeError = '❌ Ya existe una escudería con ese nombre. Por favor, elige otro nombre.';
        }
        
        mostrarMensaje(mensajeError, errorDiv);
        
    } finally {
        // ← SIEMPRE restaurar botón
        btnCrear.disabled = false;
        btnCrear.innerHTML = textoOriginal;
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
// ESTILOS CSS PARA PRODUCCIÓN (NUEVO DISEÑO)
// ========================
const produccionStyles = `
    /* Grid de producción como estrategas */
    .produccion-slots {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 8px;
        height: 100%;
        padding: 2px;
    }
    
    .produccion-slot {
        background: rgba(255, 255, 255, 0.03);
        border: 1.5px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        padding: 8px 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        height: 85px;
        min-height: 85px;
    }
    
    .produccion-slot:hover {
        border-color: rgba(0, 210, 190, 0.4);
        background: rgba(0, 210, 190, 0.05);
        transform: translateY(-1px);
    }
    
    .slot-content {
        text-align: center;
        width: 100%;
    }
    
    .slot-content i {
        font-size: 1.1rem;
        color: #00d2be;
        margin-bottom: 5px;
    }
    
    .slot-content span {
        display: block;
        font-size: 0.75rem;
        color: #888;
        line-height: 1.1;
    }
    
    /* Estilo cuando hay producción activa */
    .produccion-activa {
        border-color: rgba(0, 210, 190, 0.25);
        background: rgba(0, 210, 190, 0.04);
    }
    
    .produccion-lista {
        border-color: #4CAF50 !important;
        background: rgba(76, 175, 80, 0.15) !important;
        animation: pulse-green 2s infinite;
    }
    
    @keyframes pulse-green {
        0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
        100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }
    
    .produccion-info {
        width: 100%;
        text-align: center;
    }
    
    .produccion-nombre {
        display: block;
        font-weight: bold;
        font-size: 0.75rem;
        color: white;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .produccion-tiempo {
        display: block;
        font-size: 0.65rem;
        color: #00d2be;
        margin-bottom: 1px;
        line-height: 1;
    }
    
    .produccion-lista-text {
        color: #4CAF50;
        font-weight: bold;
        animation: blink 1s infinite;
    }
    
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .produccion-icon {
        font-size: 1.1rem;
        margin-bottom: 5px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

// ========================
// ESTILOS PARA PESTAÑA FABRICACIÓN (TALLER)
// ========================
const tallerStyles = `
    /* Grid de fabricación con 8 áreas */
    .grid-8-fabricacion {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 15px;
        margin: 20px 0;
    }
    
    .area-fabricacion {
        background: rgba(42, 42, 56, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 20px;
        transition: all 0.3s ease;
        height: 220px;
        display: flex;
        flex-direction: column;
    }
    
    .area-fabricacion:hover {
        border-color: #00d2be;
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 210, 190, 0.2);
    }
    
    .area-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
    }
    
    .area-icon {
        font-size: 2rem;
        margin-right: 15px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(0, 210, 190, 0.1);
    }
    
    .area-info {
        flex: 1;
    }
    
    .area-nombre {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.2rem;
        color: white;
        margin-bottom: 5px;
    }
    
    .area-nivel {
        color: #00d2be;
        font-size: 0.9rem;
    }
    
    /* Grid de calidad 1x5 */
    .calidad-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        margin: 15px 0;
        flex: 1;
    }
    
    .calidad-slot {
        background: rgba(255, 255, 255, 0.03);
        border: 2px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 70px;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .calidad-slot.vacio:hover {
        border-color: rgba(0, 210, 190, 0.4);
        background: rgba(0, 210, 190, 0.05);
    }
    
    .calidad-slot.ocupado {
        border-color: rgba(76, 175, 80, 0.3);
        background: rgba(76, 175, 80, 0.1);
    }
    
    .calidad-slot.ocupado:hover {
        border-color: rgba(76, 175, 80, 0.6);
        background: rgba(76, 175, 80, 0.15);
    }
    
    .calidad-numero {
        font-size: 0.8rem;
        color: #888;
        margin-bottom: 5px;
    }
    
    .calidad-vacia {
        color: #666;
        font-size: 0.9rem;
        margin-top: 5px;
    }
    
    .calidad-pieza {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .pieza-icon {
        font-size: 1.2rem;
        margin-bottom: 5px;
        color: #4CAF50;
    }
    
    .pieza-nivel {
        font-size: 0.9rem;
        color: white;
        font-weight: bold;
        margin-bottom: 2px;
    }
    
    .pieza-puntos {
        font-size: 0.7rem;
        color: #FFD700;
    }
    
    .pieza-fabricando {
        border-color: #FF9800 !important;
        background: rgba(255, 152, 0, 0.1) !important;
        animation: pulse-orange 2s infinite;
    }
    
    @keyframes pulse-orange {
        0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
    }
    
    .btn-fabricar-area {
        margin-top: auto;
        padding: 10px 15px;
        background: linear-gradient(135deg, #00d2be, #009688);
        border: none;
        border-radius: 8px;
        color: white;
        font-family: 'Orbitron', sans-serif;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
    }
    
    .btn-fabricar-area:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 210, 190, 0.4);
    }
    
    .btn-fabricar-area:disabled {
        background: linear-gradient(135deg, #666, #888);
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    .btn-fabricar-area.fabricando {
        background: linear-gradient(135deg, #FF9800, #FF5722);
        animation: pulse-btn 2s infinite;
    }
    
    @keyframes pulse-btn {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
        .grid-8-fabricacion {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    
    @media (max-width: 900px) {
        .grid-8-fabricacion {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (max-width: 600px) {
        .grid-8-fabricacion {
            grid-template-columns: 1fr;
        }
        
        .area-fabricacion {
            height: auto;
            min-height: 220px;
        }
    }
`;

// Añadir los estilos al DOM cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('estilos-taller')) {
        const style = document.createElement('style');
        style.id = 'estilos-taller';
        style.innerHTML = tallerStyles;
        document.head.appendChild(style);
    }
});

// Añadir los estilos al DOM cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('estilos-produccion')) {
        const style = document.createElement('style');
        style.id = 'estilos-produccion';
        style.innerHTML = produccionStyles;
        document.head.appendChild(style);
    }
});

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
        await this.loadPilotosContratados(); // ← FALTA ESTO
        
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
        
        // DECISIÓN: ¿Mostrar tutorial o dashboard?
        // 1. Primero verificamos si el tutorial ya fue completado (en localStorage)
        const tutorialCompletado = localStorage.getItem('f1_tutorial_completado');
        console.log('🔍 [TUTORIAL] Estado:', {
            tieneEscuderia: !!this.escuderia,
            tutorialCompletado: tutorialCompletado,
            userId: this.user?.id
        });
        
        // 2. Mostrar tutorial si:
        //    - El usuario tiene escudería (se creó en registro)
        //    - PERO no ha completado el tutorial
        if (this.escuderia && !tutorialCompletado) {
            console.log('🎯 MOSTRANDO TUTORIAL (tiene escudería pero no completó tutorial)');
            this.mostrarTutorialInicial();
        } 
        // 3. Si no tiene escudería (caso raro, pero por seguridad)
        else if (!this.escuderia) {
            console.log('🎯 MOSTRANDO TUTORIAL (no tiene escudería)');
            this.mostrarTutorialInicial();
        }
        // 4. Ya completó el tutorial, ir directo al dashboard
        else {
            console.log('📊 CARGANDO DASHBOARD (tutorial ya completado)');
            await this.cargarDashboardCompleto();
            await this.inicializarSistemasIntegrados();
        }
    }
    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER
    // ========================
    // ========================
    // MÉTODO PARA CARGAR PESTAÑA TALLER (VERSIÓN MINIMALISTA)
    // ========================
    async cargarTabTaller() {
        console.log('🔧 Cargando pestaña taller minimalista...');
        
        const container = document.getElementById('tab-taller');
        if (!container) {
            console.error('❌ No se encontró #tab-taller');
            return;
        }
        
        if (!this.escuderia || !this.escuderia.id) {
            container.innerHTML = '<p class="error">❌ No se encontró tu escudería</p>';
            return;
        }
        
        try {
            // 1. Cargar stats del coche desde coches_stats
            await this.cargarCarStats();
            
            // 2. Cargar piezas fabricadas desde almacen_piezas
            const { data: piezasFabricadas, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('area, nivel, calidad')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', false);
            
            if (errorPiezas) {
                console.error('Error cargando piezas:', errorPiezas);
                throw errorPiezas;
            }
            
            // 3. Cargar fabricaciones activas desde fabricacion_actual
            const { data: fabricacionesActivas, error: errorFabricaciones } = await this.supabase
                .from('fabricacion_actual')
                .select('area, nivel, tiempo_fin, completada')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorFabricaciones) {
                console.error('Error cargando fabricaciones:', errorFabricaciones);
                throw errorFabricaciones;
            }
            
            // 4. Definir las 11 áreas del coche (basado en tu tabla coches_stats)
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            // 5. Contar fabricaciones activas
            const fabricacionesCount = fabricacionesActivas?.length || 0;
            
            // 6. Generar HTML simple: solo botones
            let html = `
                <div class="taller-minimalista">
                    <div class="taller-header-mini">
                        <h2><i class="fas fa-tools"></i> TALLER DE FABRICACIÓN</h2>
                        <div class="fabricaciones-activas-mini">
                            <span class="badge-fabricacion">${fabricacionesCount}/4 fabricando</span>
                        </div>
                    </div>
                    
                    <div class="taller-botones-grid">
            `;
            
            // 7. Para cada área, crear fila con 5 botones horizontales
            areas.forEach(area => {
                // Obtener nivel actual del coche desde coches_stats
                const nivelActual = this.carStats ? 
                    this.carStats[`${area.id}_nivel`] || 0 : 0;
                
                // Contar cuántas piezas tenemos ya fabricadas de este nivel actual + 1
                const nivelAFabricar = nivelActual + 1;
                
                // Filtrar piezas de esta área del nivel que estamos fabricando
                const piezasAreaNivel = piezasFabricadas?.filter(p => {
                    // Verificar si el área coincide
                    const areaCoincide = p.area === area.id || p.area === area.nombre;
                    // Verificar si es del nivel que estamos fabricando
                    const nivelCoincide = (p.nivel || 1) === nivelAFabricar;
                    return areaCoincide && nivelCoincide;
                }) || [];
                
                // Verificar si tenemos fabricación activa para esta área y nivel
                const fabricacionActiva = fabricacionesActivas?.find(f => {
                    const areaCoincide = f.area === area.id || f.area === area.nombre;
                    const nivelCoincide = f.nivel === nivelAFabricar;
                    return areaCoincide && nivelCoincide && !f.completada;
                });
                
                // Añadir nombre del área como título
                html += `
                    <div class="area-fila-mini">
                        <div class="area-titulo-mini">
                            <span class="area-icono-mini">${area.icono}</span>
                            <span class="area-nombre-mini">${area.nombre}</span>
                            <span class="area-nivel-mini">Nivel ${nivelAFabricar}</span>
                        </div>
                        <div class="botones-calidad-mini">
                `;
                
                // Crear 5 botones para esta área (siempre 5 por nivel)
                for (let piezaNum = 1; piezaNum <= 5; piezaNum++) {
                    // Verificar si esta pieza específica ya está fabricada
                    // (en tu sistema, no distinguimos pieza 1, 2, 3... solo contamos total)
                    const piezaFabricada = piezasAreaNivel.length >= piezaNum;
                    
                    if (piezaFabricada) {
                        // Botón LLENO (ya fabricado)
                        html += `
                            <button class="btn-pieza-mini lleno" disabled title="${area.nombre} - Pieza ${piezaNum} fabricada">
                                <i class="fas fa-check"></i>
                                <span class="pieza-num">${piezaNum}</span>
                            </button>
                        `;
                    } else if (fabricacionActiva && piezaNum === piezasAreaNivel.length + 1) {
                        // Botón en FABRICACIÓN (la siguiente pieza a fabricar está en proceso)
                        const tiempoRestante = new Date(fabricacionActiva.tiempo_fin) - new Date();
                        const minutos = Math.ceil(tiempoRestante / (1000 * 60));
                        
                        html += `
                            <button class="btn-pieza-mini fabricando" disabled title="${area.nombre} - Pieza ${piezaNum} en fabricación (${minutos} min)">
                                <i class="fas fa-spinner fa-spin"></i>
                                <span class="pieza-num">${piezaNum}</span>
                            </button>
                        `;
                    } else {
                        // Botón VACÍO (se puede fabricar)
                        const puedeFabricar = fabricacionesCount < 4 && 
                                            this.escuderia.dinero >= 10000 &&
                                            piezaNum === piezasAreaNivel.length + 1;
                        
                        html += `
                            <button class="btn-pieza-mini vacio" 
                                    onclick="iniciarFabricacionTallerDesdeBoton('${area.id}', ${nivelAFabricar})"
                                    ${!puedeFabricar ? 'disabled' : ''}
                                    title="${area.nombre} - Pieza ${piezaNum} (Click para fabricar)">
                                <i class="fas fa-plus"></i>
                                <span class="pieza-num">${piezaNum}</span>
                            </button>
                        `;
                    }
                }
                
                // Botón "SUBIR DE NIVEL" solo cuando tengamos las 5 piezas
                if (piezasAreaNivel.length >= 5) {
                    html += `
                        <button class="btn-subir-nivel" onclick="f1Manager.subirNivelArea('${area.id}')" title="Subir ${area.nombre} al nivel ${nivelAFabricar + 1}">
                            <i class="fas fa-level-up-alt"></i>
                            SUBIR NIVEL
                        </button>
                    `;
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    
                    <div class="taller-info-mini">
                        <p><i class="fas fa-info-circle"></i> Fabricaciones activas: <strong>${fabricacionesCount}/4</strong></p>
                        <p><i class="fas fa-info-circle"></i> Necesitas 5 piezas del mismo nivel para subir de nivel</p>
                        <p><i class="fas fa-info-circle"></i> Cada pieza cuesta €10,000 y tarda 30 minutos</p>
                    </div>
                </div>
                
                <style>
                    .taller-minimalista {
                        padding: 20px;
                    }
                    
                    .taller-header-mini {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 25px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid rgba(0, 210, 190, 0.3);
                    }
                    
                    .taller-header-mini h2 {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 1.5rem;
                        color: white;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .badge-fabricacion {
                        background: rgba(0, 210, 190, 0.2);
                        color: #00d2be;
                        padding: 8px 15px;
                        border-radius: 20px;
                        font-weight: bold;
                        font-size: 0.9rem;
                        border: 1px solid rgba(0, 210, 190, 0.4);
                    }
                    
                    .area-fila-mini {
                        margin-bottom: 25px;
                        background: rgba(255, 255, 255, 0.03);
                        border-radius: 10px;
                        padding: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                    }
                    
                    .area-titulo-mini {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .area-icono-mini {
                        font-size: 1.5rem;
                    }
                    
                    .area-nombre-mini {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 1.1rem;
                        color: white;
                        font-weight: bold;
                        flex: 1;
                    }
                    
                    .area-nivel-mini {
                        background: rgba(0, 210, 190, 0.15);
                        color: #00d2be;
                        padding: 5px 12px;
                        border-radius: 15px;
                        font-size: 0.9rem;
                        font-weight: bold;
                    }
                    
                    .botones-calidad-mini {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    
                    .btn-pieza-mini {
                        width: 60px;
                        height: 60px;
                        border-radius: 10px;
                        border: 2px solid;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        background: rgba(255, 255, 255, 0.05);
                    }
                    
                    .btn-pieza-mini.vacio {
                        border-color: rgba(255, 255, 255, 0.2);
                        color: #aaa;
                    }
                    
                    .btn-pieza-mini.vacio:not(:disabled):hover {
                        border-color: #00d2be;
                        color: #00d2be;
                        background: rgba(0, 210, 190, 0.1);
                        transform: translateY(-3px);
                    }
                    
                    .btn-pieza-mini.vacio:disabled {
                        border-color: rgba(255, 255, 255, 0.1);
                        color: #666;
                        cursor: not-allowed;
                        opacity: 0.5;
                    }
                    
                    .btn-pieza-mini.lleno {
                        border-color: rgba(76, 175, 80, 0.4);
                        color: #4CAF50;
                        background: rgba(76, 175, 80, 0.1);
                    }
                    
                    .btn-pieza-mini.fabricando {
                        border-color: rgba(255, 152, 0, 0.4);
                        color: #FF9800;
                        background: rgba(255, 152, 0, 0.1);
                        animation: pulse-naranja 2s infinite;
                    }
                    
                    @keyframes pulse-naranja {
                        0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
                    }
                    
                    .pieza-num {
                        font-size: 0.7rem;
                        margin-top: 5px;
                        font-weight: bold;
                    }
                    
                    .btn-subir-nivel {
                        margin-left: 20px;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, #4CAF50, #388E3C);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-family: 'Orbitron', sans-serif;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.3s;
                    }
                    
                    .btn-subir-nivel:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
                    }
                    
                    .taller-info-mini {
                        margin-top: 30px;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border-left: 4px solid #00d2be;
                    }
                    
                    .taller-info-mini p {
                        color: #ccc;
                        margin: 8px 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .error {
                        color: #ff4444;
                        text-align: center;
                        padding: 40px;
                    }
                    
                    /* Responsive */
                    @media (max-width: 1200px) {
                        .botones-calidad-mini {
                            flex-wrap: wrap;
                        }
                        
                        .btn-pieza-mini {
                            width: 50px;
                            height: 50px;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .area-fila-mini {
                            padding: 10px;
                        }
                        
                        .botones-calidad-mini {
                            gap: 8px;
                        }
                        
                        .btn-pieza-mini {
                            width: 45px;
                            height: 45px;
                            font-size: 0.9rem;
                        }
                        
                        .btn-subir-nivel {
                            margin-left: 10px;
                            padding: 8px 15px;
                            font-size: 0.8rem;
                        }
                    }
                </style>
            `;
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error cargando taller minimalista:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>❌ Error cargando el taller</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
        }
    }
    
    // ========================
    // MÉTODO PARA INICIAR FABRICACIÓN DESDE TALLER MINIMALISTA
    // ========================
    // ========================
    // MÉTODO CORREGIDO PARA INICIAR FABRICACIÓN
    // ========================
    async iniciarFabricacionTaller(areaId, nivel) {
        console.log('🔧 Iniciando fabricación:', { areaId, nivel });
        
        if (!this.escuderia || !this.escuderia.id) {
            this.showNotification('❌ Error: No tienes escudería', 'error');
            return false;
        }
        
        try {
            // 1. Verificar límite de 4 fabricaciones simultáneas
            const { data: fabricacionesActivas, error: errorLimite } = await this.supabase
                .from('fabricacion_actual')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (errorLimite) throw errorLimite;
            
            if (fabricacionesActivas && fabricacionesActivas.length >= 4) {
                this.showNotification('❌ Límite alcanzado (máximo 4 fabricaciones simultáneas)', 'error');
                return false;
            }
            
            // 2. Contar cuántas piezas ya has fabricado de esta área y nivel
            const { data: piezasExistentes, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivel);
            
            if (errorPiezas) throw errorPiezas;
            
            const numeroPieza = (piezasExistentes?.length || 0) + 1;
            console.log(`📊 Fabricando pieza ${numeroPieza} para ${areaId} nivel ${nivel}`);
            
            // 3. Calcular tiempo progresivo EN MINUTOS y convertirlo a milisegundos
            const tiempoMinutos = this.calcularTiempoProgresivo(numeroPieza);
            const tiempoMilisegundos = tiempoMinutos * 60 * 1000; // Convertir minutos a milisegundos
            console.log(`⏱️ Tiempo: ${tiempoMinutos} minutos (${tiempoMilisegundos}ms)`);
            
            // 4. Verificar dinero (costo fijo)
            const costo = 10000;
            if (this.escuderia.dinero < costo) {
                this.showNotification(`❌ Fondos insuficientes. Necesitas €${costo.toLocaleString()}`, 'error');
                return false;
            }
            
            // 5. Crear fabricación con tiempo futuro REAL
            const ahora = new Date();
            const tiempoFin = new Date(ahora.getTime() + tiempoMilisegundos); // Añadir tiempo real en milisegundos
            
            console.log('📅 Tiempos:', {
                inicio: ahora.toISOString(),
                fin: tiempoFin.toISOString(),
                diferenciaMinutos: tiempoMinutos
            });
            
            const { data: fabricacion, error: errorCrear } = await this.supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: this.escuderia.id,
                    area: areaId,
                    nivel: nivel,
                    tiempo_inicio: ahora.toISOString(),
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: costo,
                    creada_en: ahora.toISOString()
                }])
                .select()
                .single();
            
            if (errorCrear) throw errorCrear;
            
            // 6. Descontar dinero
            this.escuderia.dinero -= costo;
            await this.updateEscuderiaMoney();
            
            // 7. Mostrar notificación con tiempo REAL
            const nombreArea = this.getNombreArea(areaId);
            this.showNotification(
                `✅ ${nombreArea} (Pieza ${numeroPieza}) en fabricación - ${tiempoMinutos} minutos`, 
                'success'
            );
            
            // 8. Actualizar UI inmediatamente
            setTimeout(() => {
                this.updateProductionMonitor();
            }, 500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando fabricación:', error);
            this.showNotification(`❌ Error: ${error.message}`, 'error');
            return false;
        }
    }
    
    // ========================
    // MÉTODO AUXILIAR: Calcular tiempo progresivo
    // ========================
    calcularTiempoProgresivo(numeroPieza) {
        // Sistema progresivo según especificaste:
        // Pieza 1: 2 minutos
        // Pieza 2: 4 minutos  
        // Pieza 3: 15 minutos
        // Pieza 4: 30 minutos
        // Pieza 5: 60 minutos
        // Pieza 6+: +50 minutos cada una
        
        const tiemposEspeciales = {
            1: 2,   // Primera pieza
            2: 4,   // Segunda pieza
            3: 15,  // Tercera pieza
            4: 30,  // Cuarta pieza
            5: 60   // Quinta pieza
        };
        
        if (tiemposEspeciales[numeroPieza]) {
            return tiemposEspeciales[numeroPieza];
        }
        
        // Para pieza 6 en adelante: 60 + (numeroPieza - 5) * 50
        return 60 + ((numeroPieza - 5) * 50);
    }
    
    // ========================
    // MÉTODO AUXILIAR: Obtener nombre de área
    // ========================
    getNombreArea(areaId) {
        const areas = {
            'suelo': 'Suelo',
            'motor': 'Motor',
            'aleron_delantero': 'Alerón Delantero',
            'caja_cambios': 'Caja Cambios',
            'pontones': 'Pontones',
            'suspension': 'Suspensión',
            'aleron_trasero': 'Alerón Trasero',
            'chasis': 'Chasis',
            'frenos': 'Frenos',
            'volante': 'Volante',
            'electronica': 'Electrónica'
        };
        return areas[areaId] || areaId;
    }
    
    // ========================
    // MÉTODO PARA CALCULAR TIEMPOS PROGRESIVOS
    // ========================
    calcularTiempoFabricacion(piezaNumero) {
        // Sistema progresivo según tu especificación:
        // Pieza 1: 2 minutos
        // Pieza 2: 4 minutos
        // Pieza 3: 15 minutos
        // Pieza 4: 30 minutos
        // Pieza 5: 60 minutos
        // Pieza 6-...: +50 minutos cada una
        
        const tiemposEspeciales = {
            1: 2,    // Primera pieza: 2 minutos
            2: 4,    // Segunda pieza: 4 minutos
            3: 15,   // Tercera pieza: 15 minutos
            4: 30,   // Cuarta pieza: 30 minutos
            5: 60    // Quinta pieza: 60 minutos
        };
        
        if (tiemposEspeciales[piezaNumero]) {
            return tiemposEspeciales[piezaNumero];
        }
        
        // Para piezas 6 en adelante: 60 + (piezaNumero - 5) * 50
        // Ejemplo: 
        // Pieza 6: 60 + (6-5)*50 = 110 minutos
        // Pieza 7: 60 + (7-5)*50 = 160 minutos
        // etc.
        return 60 + ((piezaNumero - 5) * 50);
    }
    
    // ========================
    // MÉTODO PARA SUBIR DE NIVEL UN ÁREA
    // ========================
    async subirNivelArea(areaId) {
        console.log('⬆️ Subiendo nivel del área:', areaId);
        
        if (!this.escuderia || !this.escuderia.id || !this.carStats) {
            this.showNotification('❌ Error: No se encontraron datos del coche', 'error');
            return;
        }
        
        try {
            // 1. Verificar que tenemos 5 piezas del nivel actual
            const nivelActual = this.carStats[`${areaId}_nivel`] || 0;
            const nivelSiguiente = nivelActual + 1;
            
            const { data: piezasArea, error: errorPiezas } = await this.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', this.escuderia.id)
                .eq('area', areaId)
                .eq('nivel', nivelSiguiente)
                .eq('equipada', false);
            
            if (errorPiezas) throw errorPiezas;
            
            if (!piezasArea || piezasArea.length < 5) {
                this.showNotification(`❌ Necesitas 5 piezas de nivel ${nivelSiguiente} para subir de nivel`, 'error');
                return;
            }
            
            // 2. Actualizar nivel en coches_stats
            const campoNivel = `${areaId}_nivel`;
            const campoProgreso = `${areaId}_progreso`;
            
            const nuevosStats = {
                [campoNivel]: nivelSiguiente,
                [campoProgreso]: 0, // Resetear progreso para el nuevo nivel
                actualizado_en: new Date().toISOString()
            };
            
            const { error: errorStats } = await this.supabase
                .from('coches_stats')
                .update(nuevosStats)
                .eq('escuderia_id', this.escuderia.id);
            
            if (errorStats) throw errorStats;
            
            // 3. Marcar las 5 piezas como equipadas
            const idsPiezas = piezasArea.slice(0, 5).map(p => p.id);
            
            const { error: errorEquipar } = await this.supabase
                .from('almacen_piezas')
                .update({ equipada: true })
                .in('id', idsPiezas);
            
            if (errorEquipar) throw errorEquipar;
            
            // 4. Actualizar datos locales
            this.carStats[campoNivel] = nivelSiguiente;
            this.carStats[campoProgreso] = 0;
            
            // 5. Mostrar notificación y recargar
            const areasNombres = {
                'suelo': 'Suelo',
                'motor': 'Motor',
                'aleron_delantero': 'Alerón Delantero',
                'caja_cambios': 'Caja de Cambios',
                'pontones': 'Pontones',
                'suspension': 'Suspensión',
                'aleron_trasero': 'Alerón Trasero',
                'chasis': 'Chasis',
                'frenos': 'Frenos',
                'volante': 'Volante',
                'electronica': 'Electrónica'
            };
            
            const nombreArea = areasNombres[areaId] || areaId;
            this.showNotification(`✅ ${nombreArea} subido a nivel ${nivelSiguiente}!`, 'success');
            
            // 6. Recargar la pestaña taller después de 1 segundo
            setTimeout(() => {
                this.cargarTabTaller();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error subiendo nivel:', error);
            this.showNotification(`❌ Error subiendo nivel: ${error.message}`, 'error');
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
        
        // 2. Crear almacenManager - VERSIÓN A PRUEBA DE FALLOS
        console.log('🔧 FORZANDO creación de almacenManager...');
        
        // SI la clase NO existe, créala AHORA MISMO
        if (!window.AlmacenManager) {
            console.log('⚠️ Clase AlmacenManager no existe, creando básica...');
            window.AlmacenManager = class AlmacenManagerBasico {
                constructor() {
                    this.escuderiaId = null;
                    this.piezas = [];
                }
                
                async inicializar(escuderiaId) {
                    this.escuderiaId = escuderiaId;
                    console.log(`✅ almacenManager inicializado para escudería: ${escuderiaId}`);
                    return true;
                }
                
                async cargarPiezas() {
                    if (!this.escuderiaId) return [];
                    try {
                        const { data, error } = await supabase
                            .from('almacen_piezas')
                            .select('*')
                            .eq('escuderia_id', this.escuderiaId)
                            .order('fabricada_en', { ascending: false });
                        
                        if (error) throw error;
                        this.piezas = data || [];
                        return this.piezas;
                    } catch (error) {
                        console.error('Error cargando piezas:', error);
                        return [];
                    }
                }
            };
        }
        
        // CREAR la instancia SI O SÍ
        if (!window.almacenManager) {
            window.almacenManager = new window.AlmacenManager();
            console.log('✅ Instancia de almacenManager creada');
        }
        
        // INICIALIZAR SI O SÍ
        if (window.almacenManager && this.escuderia && this.escuderia.id) {
            await window.almacenManager.inicializar(this.escuderia.id);
            console.log('✅ Sistema de almacén inicializado (GARANTIZADO)');
        } else {
            console.error('❌ IMPOSIBLE inicializar almacén - falta escudería');
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
    };

    async cargarPiezasMontadas() {
        console.log('🎯 Cargando piezas montadas...');
        
        const contenedor = document.getElementById('grid-piezas-montadas');
        if (!contenedor) return;
        
        try {
            // 1. Obtener piezas montadas
            const { data: piezasMontadas } = await supabase
                .from('almacen_piezas')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('equipada', true);
            
            // 2. MAPEO de nombres de la BD a IDs del código
            const mapeoAreas = {
                'Suelo y Difusor': 'suelo',
                'Motor': 'motor',
                'Aerodinámica': 'aerodinamica',
                'Chasis': 'chasis',
                'Suspensión': 'suspension',
                'Frenos': 'frenos',
                'Transmisión': 'transmision',
                'Electrónica': 'electronica',
                'Volante': 'volante',
                'Pontones': 'pontones',
                'Alerón Delantero': 'aleron_delantero',
                'Alerón Trasero': 'aleron_trasero',
                'Caja de Cambios': 'caja_cambios'
            };
            
            // 3. Crear mapeo área -> pieza montada
            const piezasPorArea = {};
            piezasMontadas?.forEach(p => {
                // Convertir nombre de BD a ID del código
                const areaId = mapeoAreas[p.area] || p.area.toLowerCase().replace(/ /g, '_');
                piezasPorArea[areaId] = p;
            });
            
            // 4. Generar 11 botones (usando los IDs que espera tu código)
            const areas = [
                { id: 'suelo', nombre: 'Suelo', icono: '🏎️' },
                { id: 'motor', nombre: 'Motor', icono: '⚙️' },
                { id: 'aleron_delantero', nombre: 'Alerón Del.', icono: '🪽' },
                { id: 'caja_cambios', nombre: 'Caja Cambios', icono: '🔄' },
                { id: 'pontones', nombre: 'Pontones', icono: '📦' },
                { id: 'suspension', nombre: 'Suspensión', icono: '⚖️' },
                { id: 'aleron_trasero', nombre: 'Alerón Tras.', icono: '🌪️' },
                { id: 'chasis', nombre: 'Chasis', icono: '📊' },
                { id: 'frenos', nombre: 'Frenos', icono: '🛑' },
                { id: 'volante', nombre: 'Volante', icono: '🎮' },
                { id: 'electronica', nombre: 'Electrónica', icono: '💡' }
            ];
            
            let puntosTotales = 0;
            let html = '';
            
            areas.forEach(area => {
                const pieza = piezasPorArea[area.id];
                
                if (pieza) {
                    // Botón con pieza montada
                    puntosTotales += pieza.puntos_base || 0;
                    html += `
                        <div class="boton-area-montada" onclick="irAlAlmacenDesdePiezas()" 
                             title="${pieza.area} - Nivel ${pieza.nivel} - ${pieza.calidad}">
                            <div class="icono-area">${area.icono}</div>
                            <div class="nombre-area">${area.nombre}</div>
                            <div class="nivel-pieza">Nivel ${pieza.nivel}</div>
                            <div class="puntos-pieza">+${pieza.puntos_base}</div>
                            <div class="calidad-pieza" style="font-size:0.6rem;color:#aaa">${pieza.calidad}</div>
                        </div>
                    `;
                } else {
                    // Botón vacío
                    html += `
                        <div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()" 
                             title="Sin pieza - Click para equipar">
                            <div class="icono-area">+</div>
                            <div class="nombre-area">${area.nombre}</div>
                            <div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>
                        </div>
                    `;
                }
            });
            
            contenedor.innerHTML = html;
            
            // Actualizar total de puntos
            const puntosElement = document.getElementById('puntos-totales-montadas');
            if (puntosElement) {
                puntosElement.textContent = puntosTotales;
            }
            
            console.log(`✅ Piezas montadas cargadas: ${Object.keys(piezasPorArea).length} áreas equipadas`);
            console.log(`📊 Puntos totales: ${puntosTotales}`);
            
        } catch (error) {
            console.error('❌ Error cargando piezas montadas:', error);
            // Mostrar botones vacíos como fallback
            this.mostrarBotonesVacios(contenedor);
        }
    }
    
    // Función auxiliar para mostrar botones vacíos
    mostrarBotonesVacios(contenedor) {
        const areas = ['Suelo', 'Motor', 'Alerón Del.', 'Caja Cambios', 'Pontones', 
                       'Suspensión', 'Alerón Tras.', 'Chasis', 'Frenos', 'Volante', 'Electrónica'];
        
        let html = '';
        areas.forEach(area => {
            html += `
                <div class="boton-area-vacia" onclick="irAlAlmacenDesdePiezas()">
                    <div class="icono-area">+</div>
                    <div class="nombre-area">${area}</div>
                    <div style="font-size:0.7rem; color:#888; margin-top:5px;">Vacío</div>
                </div>
            `;
        });
        
        contenedor.innerHTML = html;
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
            // PASO 1: Bienvenida
            {
                title: "🏆 ¡BIENVENIDO A RACE STRATEGY MANAGER!",
                content: `
                    <p>Eres el nuevo director de la escudería <span class="escuderia-destacada">${this.escuderia.nombre || "TU EQUIPO"}</span>.</p>
                    
                    <p>Estás a punto de unirte a <strong class="online">una comunidad global</strong> de miles de directores de escuderías que compiten por ser los mejores estrategas del mundo.</p>
                    
                    <div class="highlight-box">
                        <p>💰 <strong>¡Gran noticia!</strong></p>
                        <p>Tus patrocinadores confían en tu visión y han depositado <strong class="money">5,000,000€</strong> en la cuenta del equipo para relanzar esta nueva etapa.</p>
                    </div>
                    
                    <p class="main-mission">🎯 <strong>Tu misión será:</strong></p>
                    <ul>
                        <li>Gestionar y desarrollar tu escudería en <strong>11 áreas técnicas clave</strong></li>
                        <li>Anticiparte a lo que ocurra en carreras reales mediante <strong>estrategas especializados</strong></li>
                        <li>Tomar decisiones que conviertan tus aciertos en puntos y dinero</li>
                        <li>Competir contra miles de jugadores para convertirte en <strong>el mejor estratega del mundo</strong></li>
                    </ul>
                `,
                action: 'siguientePaso'
            },
            
            // PASO 2: Secciones en GRID
            {
                title: "📊 SECCIONES DE GESTIÓN",
                content: `
                    <p>Tu escudería se gestiona a través de estas <strong>6 secciones principales</strong>:</p>
                    
                    <div class="grid-6-columns">
                        <div class="grid-btn-big" onclick="tutorialIrSeccion('principal')">
                            <div class="grid-icon">🏠</div>
                            <div class="grid-title">PRINCIPAL</div>
                            <div class="grid-desc">Vista general de tu equipo, puntos y estado del coche</div>
                        </div>
                        
                        <div class="grid-btn-big" onclick="tutorialIrSeccion('taller')">
                            <div class="grid-icon">🔧</div>
                            <div class="grid-title">TALLER</div>
                            <div class="grid-desc">Fabrica piezas que mejoran tu coche para la carrera</div>
                        </div>
                        
                        <div class="grid-btn-big" onclick="tutorialIrSeccion('equipo')">
                            <div class="grid-icon">👥</div>
                            <div class="grid-title">EQUIPO</div>
                            <div class="grid-desc">Contrata estrategas que aumentan tus puntos en apuestas</div>
                        </div>
                        
                        <div class="grid-btn-big" onclick="tutorialIrSeccion('almacen')">
                            <div class="grid-icon">📦</div>
                            <div class="grid-title">ALMACÉN</div>
                            <div class="grid-desc">Equipa o vende las piezas fabricadas para tu coche</div>
                        </div>
                        
                        <div class="grid-btn-big" onclick="tutorialIrSeccion('pronosticos')">
                            <div class="grid-icon">🎯</div>
                            <div class="grid-title">PRONÓSTICOS</div>
                            <div class="grid-desc">Antes del viernes, apuesta sobre lo que sucederá en la carrera</div>
                        </div>
                        
                        <div class="grid-btn-big" onclick="tutorialIrSeccion('ranking')">
                            <div class="grid-icon">🏆</div>
                            <div class="grid-title">RANKING</div>
                            <div class="grid-desc">Consulta diferentes clasificaciones y compite globalmente</div>
                        </div>
                    </div>
                `,
                action: 'siguientePaso'
            },
            
            // PASO 3: Áreas técnicas en GRID
            {
                title: "🔧 11 ÁREAS TÉCNICAS",
                content: `
                    <p>Desarrolla estas <strong>11 áreas técnicas</strong> fabricando piezas. Cada nivel da más puntos:</p>
                    
                    <div class="grid-4-columns">
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🏎️</div>
                            <div class="area-grid-name">MOTOR</div>
                            <div class="area-grid-desc">Potencia y eficiencia</div>
                            <div class="area-grid-stats">⭐ +15 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">📊</div>
                            <div class="area-grid-name">CHASIS</div>
                            <div class="area-grid-desc">Estructura principal</div>
                            <div class="area-grid-stats">⭐ +12 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🌀</div>
                            <div class="area-grid-name">AERODINÁMICA</div>
                            <div class="area-grid-desc">Flujo de aire y downforce</div>
                            <div class="area-grid-stats">⭐ +10 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">⚙️</div>
                            <div class="area-grid-name">SUSPENSIÓN</div>
                            <div class="area-grid-desc">Control y estabilidad</div>
                            <div class="area-grid-stats">⭐ +9 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🔄</div>
                            <div class="area-grid-name">TRANSMISIÓN</div>
                            <div class="area-grid-desc">Cambio de marchas</div>
                            <div class="area-grid-stats">⭐ +11 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🛑</div>
                            <div class="area-grid-name">FRENOS</div>
                            <div class="area-grid-desc">Poder de detención</div>
                            <div class="area-grid-stats">⭐ +8 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">💡</div>
                            <div class="area-grid-name">ELECTRÓNICA</div>
                            <div class="area-grid-desc">Sistemas digitales</div>
                            <div class="area-grid-stats">⭐ +14 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🎮</div>
                            <div class="area-grid-name">CONTROL</div>
                            <div class="area-grid-desc">Manejo y respuesta</div>
                            <div class="area-grid-stats">⭐ +9 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🌪️</div>
                            <div class="area-grid-name">DIFUSOR</div>
                            <div class="area-grid-desc">Downforce trasero</div>
                            <div class="area-grid-stats">⭐ +12 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">🪽</div>
                            <div class="area-grid-name">ALERONES</div>
                            <div class="area-grid-desc">Carga aerodinámica</div>
                            <div class="area-grid-stats">⭐ +13 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                        
                        <div class="area-grid-card">
                            <div class="area-grid-icon">📦</div>
                            <div class="area-grid-name">PONTONES</div>
                            <div class="area-grid-desc">Refrigeración y flujo</div>
                            <div class="area-grid-stats">⭐ +10 pts/nivel</div>
                            <div class="area-grid-sub">5 subniveles de calidad</div>
                        </div>
                    </div>
                `,
                action: 'siguientePaso'
            },
            
            // PASO 4: Contratación de estrategas en GRID
            {
                title: "👥 CONTRATA ESTRATEGAS",
                content: `
                    <p>Selecciona y contrata estrategas para potenciar tus pronósticos:</p>
                    
                    <div id="grid-estrategas-tutorial" class="grid-3-columns">
                        <!-- Se cargarán dinámicamente -->
                        <div class="loading">Cargando estrategas...</div>
                    </div>
                `,
                action: 'siguientePaso',
                onLoad: function() {
                    setTimeout(() => {
                        cargarEstrategasTutorial();
                    }, 100);
                }
            },
            

            
            // PASO 5: DÍA 1 - Contratación (Tutorial práctico)
            {
                title: "🎮 VAMOS A SIMULAR TU PRIMERA SEMANA",
                content: `
                    <div class="simulacion-intro">
                        <div class="intro-icon">🔄</div>
                        <h3>¡Comienza tu aventura en MotorSports!</h3>
                        <p>Vamos a simular una semana completa para que entiendas el funcionamiento:</p>
                        <ul class="simulacion-pasos">
                            <li>✅ <strong>Día 1:</strong> Contratarás tu primer estratega</li>
                            <li>✅ <strong>Día 2:</strong> Fabricarás tu primera pieza</li>
                            <li>✅ <strong>Día 3:</strong> Harás pronósticos para la carrera</li>
                            <li>✅ <strong>Fin de semana:</strong> Se simulará la carrera</li>
                            <li>✅ <strong>Lunes:</strong> Verás tus resultados y ganancias</li>
                        </ul>
                        <p class="simulacion-nota">En el juego real, cada paso tiene su tiempo real. ¡Esta es solo una simulación rápida!</p>
                    </div>
                    
                    <div class="simulacion-dia">
                        <div class="dia-numero-simulacion">DÍA 1</div>
                        <div class="dia-titulo-simulacion">CONTRATAR ESTRATEGA</div>
                        <p class="dia-descripcion">Por ser tu primer día en la escudería, debes contratar a un estratega. Más adelante podrás contratar más.</p>
                    </div>
                    
                    <p>Selecciona tu primer estratega. Cada uno te dará bonificaciones diferentes:</p>
                    
                    <div class="grid-3-columns">
                        <div class="estratega-tutorial-card seleccionable" onclick="tutorialSeleccionarEstrategaPractico(1)">
                            <div class="estratega-icon-tut">⏱️</div>
                            <div class="estratega-nombre-tut">ANALISTA DE TIEMPOS</div>
                            <div class="estratega-especialidad">Diferencias de tiempo entre pilotos</div>
                            <div class="estratega-bono">Bono: <span class="bono-valor">+15% puntos</span></div>
                            <div class="estratega-sueldo">Sueldo: <span class="sueldo-valor">50,000€/mes</span></div>
                            <div class="estratega-ejemplo">Ej: "Diferencia 1º-2º < 1s"</div>
                        </div>
                        
                        <div class="estratega-tutorial-card seleccionable" onclick="tutorialSeleccionarEstrategaPractico(2)">
                            <div class="estratega-icon-tut">🌧️</div>
                            <div class="estratega-nombre-tut">METEORÓLOGO</div>
                            <div class="estratega-especialidad">Condiciones climáticas de carrera</div>
                            <div class="estratega-bono">Bono: <span class="bono-valor">+20% puntos</span></div>
                            <div class="estratega-sueldo">Sueldo: <span class="sueldo-valor">60,000€/mes</span></div>
                            <div class="estratega-ejemplo">Ej: "Lluvia afectará la carrera"</div>
                        </div>
                        
                        <div class="estratega-tutorial-card seleccionable" onclick="tutorialSeleccionarEstrategaPractico(3)">
                            <div class="estratega-icon-tut">🔧</div>
                            <div class="estratega-nombre-tut">EXPERTO EN FIABILIDAD</div>
                            <div class="estratega-especialidad">Abandonos y fallos técnicos</div>
                            <div class="estratega-bono">Bono: <span class="bono-valor">+18% puntos</span></div>
                            <div class="estratega-sueldo">Sueldo: <span class="sueldo-valor">55,000€/mes</span></div>
                            <div class="estratega-ejemplo">Ej: "Más de 5 abandonos"</div>
                        </div>
                    </div>
                    
                    <div class="tutorial-accion-practica" id="accion-contratar-tut" style="display: none;">
                        <button class="btn-tutorial-accion-grande" onclick="tutorialEjecutarContratacion()">
                            <i class="fas fa-file-contract"></i> CONTRATAR ESTRATEGA SELECCIONADO
                        </button>
                    </div>
                `,
                action: null  // ← CAMBIA esto de 'siguientePaso' a null
            },
            
             // PASO 6: DÍA 2 - Fabricación
            {
                title: "🔧 DÍA 2: FABRICAR PIEZA",
                content: `
                    <div class="simulacion-dia">
                        <div class="dia-numero-simulacion">DÍA 2</div>
                        <div class="dia-titulo-simulacion">PRODUCCIÓN</div>
                        <p class="dia-descripcion">Ahora vamos a fabricar una pieza para equipar más tarde al coche. Elige una:</p>
                    </div>
                    
                    <div class="grid-3-columns">
                        <div class="fabricacion-tutorial-card seleccionable" onclick="tutorialSeleccionarFabricacionPractica('motor')">
                            <div class="fab-icon-tut">🏎️</div>
                            <div class="fab-nombre-tut">PIEZA DE MOTOR</div>
                            <div class="fab-desc-tut">Aumenta potencia y eficiencia</div>
                            <div class="fab-puntos-tut">⭐ +15 puntos base</div>
                            <div class="fab-calidad-tut">Calidad: Nivel 1 (5 subniveles)</div>
                            <div class="fab-accion-tut">HACER CLIC PARA SELECCIONAR</div>
                        </div>
                        
                        <div class="fabricacion-tutorial-card seleccionable" onclick="tutorialSeleccionarFabricacionPractica('chasis')">
                            <div class="fab-icon-tut">📊</div>
                            <div class="fab-nombre-tut">PIEZA DE CHASIS</div>
                            <div class="fab-desc-tut">Mejora estructura y rigidez</div>
                            <div class="fab-puntos-tut">⭐ +12 puntos base</div>
                            <div class="fab-calidad-tut">Calidad: Nivel 1 (5 subniveles)</div>
                            <div class="fab-accion-tut">HACER CLIC PARA SELECCIONAR</div>
                        </div>
                        
                        <div class="fabricacion-tutorial-card seleccionable" onclick="tutorialSeleccionarFabricacionPractica('aerodinamica')">
                            <div class="fab-icon-tut">🌀</div>
                            <div class="fab-nombre-tut">PIEZA AERODINÁMICA</div>
                            <div class="fab-desc-tut">Optimiza flujo de aire</div>
                            <div class="fab-puntos-tut">⭐ +10 puntos base</div>
                            <div class="fab-calidad-tut">Calidad: Nivel 1 (5 subniveles)</div>
                            <div class="fab-accion-tut">HACER CLIC PARA SELECCIONAR</div>
                        </div>
                    </div>
                    
                    <div class="tutorial-accion-practica" id="accion-fabricar-tut" style="display: none;">
                        <button class="btn-tutorial-accion-grande" onclick="tutorialEjecutarFabricacion()">
                            <i class="fas fa-hammer"></i> INICIAR FABRICACIÓN DE PIEZA
                        </button>
                    </div>
                `,
                action: null  // ← CAMBIA esto de 'siguientePaso' a null
            },
            
            // PASO 7: DÍA 3-4 - Pronósticos
            {
                title: "🎯 HACER PRONÓSTICOS",
                content: `
                    <div class="simulacion-dia">
                        <div class="dia-numero-simulacion">ANTES DEL VIERNES</div>
                        <div class="dia-titulo-simulacion">PRONÓSTICOS DE CARRERA</div>
                        <p class="dia-descripcion">Debes hacer tu pronóstico antes del viernes de la semana de carrera. Este es un ejemplo, en la realidad habrá más de 10 pronósticos para elegir.</p>
                    </div>
                    
                    <p>Selecciona tus predicciones para la carrera (puedes marcar una opción en cada categoría):</p>
                    
                    <div class="grid-3-columns">
                        <div class="pronostico-tutorial-card">
                            <div class="pronostico-icon-tut">🚩</div>
                            <div class="pronostico-nombre-tut">BANDERA AMARILLA</div>
                            <div class="pronostico-pregunta">¿Habrá neutralización en carrera?</div>
                            <div class="pronostico-opciones">
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="bandera" data-valor="si" onclick="tutorialSeleccionarOpcionPronostico('bandera', 'si', this)">SÍ</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="bandera" data-valor="no" onclick="tutorialSeleccionarOpcionPronostico('bandera', 'no', this)">NO</div>
                            </div>
                            <div class="pronostico-puntos">⭐ +150 pts base</div>
                        </div>
                        
                        <div class="pronostico-tutorial-card">
                            <div class="pronostico-icon-tut">🚗</div>
                            <div class="pronostico-nombre-tut">ABANDONOS</div>
                            <div class="pronostico-pregunta">¿Cuántos coches no terminarán?</div>
                            <div class="pronostico-opciones">
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="abandonos" data-valor="0-2" onclick="tutorialSeleccionarOpcionPronostico('abandonos', '0-2', this)">0-2</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="abandonos" data-valor="3-5" onclick="tutorialSeleccionarOpcionPronostico('abandonos', '3-5', this)">3-5</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="abandonos" data-valor="mas5" onclick="tutorialSeleccionarOpcionPronostico('abandonos', 'mas5', this)">>5</div>
                            </div>
                            <div class="pronostico-puntos">⭐ +180 pts base</div>
                        </div>
                        
                        <div class="pronostico-tutorial-card">
                            <div class="pronostico-icon-tut">⏱️</div>
                            <div class="pronostico-nombre-tut">DIFERENCIA 1º-2º</div>
                            <div class="pronostico-pregunta">Tiempo entre primero y segundo</div>
                            <div class="pronostico-opciones">
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="diferencia" data-valor="<1s" onclick="tutorialSeleccionarOpcionPronostico('diferencia', '<1s', this)"><1s</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="diferencia" data-valor="1-5s" onclick="tutorialSeleccionarOpcionPronostico('diferencia', '1-5s', this)">1-5s</div>
                                <div class="opcion-tut seleccionable-pronostico" data-tipo="diferencia" data-valor=">5s" onclick="tutorialSeleccionarOpcionPronostico('diferencia', '>5s', this)">>5s</div>
                            </div>
                            <div class="pronostico-puntos">⭐ +200 pts base</div>
                        </div>
                    </div>
                    
                    <div class="tutorial-accion-practica" id="accion-pronostico-tut" style="display: none;">
                        <button class="btn-tutorial-accion-grande" onclick="tutorialEjecutarPronostico()">
                            <i class="fas fa-paper-plane"></i> ENVIAR PRONÓSTICOS SELECCIONADOS
                        </button>
                    </div>
                `,
                action: null  // ← CAMBIA esto de 'siguientePaso' a null
            },
            
            // PASO 9: FIN DE SEMANA - Simulación carrera
            {
                title: "📅 FIN DE SEMANA: CARRERA",
                content: `
                    <div class="dia-info">
                        <div class="dia-numero">FIN DE SEMANA</div>
                        <div class="dia-titulo">SÁBADO-DOMINGO - COMPETICIÓN</div>
                    </div>
                    
                    <p>La carrera se desarrolla y se verifican tus pronósticos con datos reales:</p>
                    
                    <div class="simulacion-carrera">
                        <div class="carrera-paso">
                            <div class="paso-icon">🏁</div>
                            <div class="paso-text">
                                <strong>GRAN PREMIO EN CURSO</strong><br>
                                Los pilotos compiten en pista
                            </div>
                        </div>
                        
                        <div class="carrera-paso">
                            <div class="paso-icon">📊</div>
                            <div class="paso-text">
                                <strong>DATOS EN TIEMPO REAL</strong><br>
                                Se registran estadísticas
                            </div>
                        </div>
                        
                        <div class="carrera-paso">
                            <div class="paso-icon">✅</div>
                            <div class="paso-text">
                                <strong>VERIFICACIÓN DE PRONÓSTICOS</strong><br>
                                Se contrastan con datos objetivos
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn-simular-carrera" onclick="tutorialSimularCarrera()">
                        <i class="fas fa-play-circle"></i> SIMULAR DESARROLLO DE CARRERA
                    </button>
                    
                    <div id="resultado-simulacion" style="display: none;">
                        <!-- Resultados aparecerán aquí -->
                    </div>
                `,
                action: 'siguientePaso'
            },
            
            // PASO 10: LUNES - Resultados
            {
                title: "📅 LUNES: RESULTADOS Y GANANCIAS",
                content: `
                    <div class="dia-info">
                        <div class="dia-numero">LUNES</div>
                        <div class="dia-titulo">RESULTADOS Y PAGOS</div>
                    </div>
                    
                    <p>Resultados de tu primera semana simulada:</p>
                    
                    <div class="resultados-grid">
                        <div class="resultado-card ${(window.tutorialData?.aciertosPronosticos || 0) > 0 ? 'ganancia' : 'error'}">
                            <div class="resultado-icon">${(window.tutorialData?.aciertosPronosticos || 0) > 0 ? '✅' : '❌'}</div>
                            <div class="resultado-titulo">PRONÓSTICOS</div>
                            <div class="resultado-detalle">
                                ${(() => {
                                    const aciertos = window.tutorialData?.aciertosPronosticos || 0;
                                    const total = 3; // Siempre 3 pronósticos en el tutorial
                                    
                                    if (aciertos > 0) {
                                        return `${aciertos} de ${total} pronósticos acertados`;
                                    } else {
                                        return 'Sin aciertos esta semana';
                                    }
                                })()}
                            </div>
                            <div class="resultado-puntos">+${window.tutorialData?.puntosBaseCalculados || 0} pts</div>
                        </div>
                        
                        ${window.tutorialData?.estrategaContratado ? `
                        <div class="resultado-card bono">
                            <div class="resultado-icon">👥</div>
                            <div class="resultado-titulo">BONO ESTRATEGA</div>
                            <div class="resultado-detalle">${window.tutorialData.nombreEstratega || 'Estratega'} (+${window.tutorialData.bonoEstratega || 15}%)</div>
                            <div class="resultado-puntos">+${(() => {
                                const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                return Math.round(puntosBase * (bono / 100));
                            })()} pts extra</div>
                        </div>
                        ` : ''}
                        
                        ${window.tutorialData?.piezaFabricando ? `
                        <div class="resultado-card pieza">
                            <div class="resultado-icon">🔧</div>
                            <div class="resultado-titulo">PIEZA FABRICADA</div>
                            <div class="resultado-detalle">${window.tutorialData.nombrePieza || 'Pieza'}</div>
                            <div class="resultado-puntos">+${window.tutorialData?.puntosPieza || 15} pts técnicos</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="total-ganancias">
                        <div class="total-titulo">TOTAL SEMANAL:</div>
                        <div class="total-puntos">${(() => {
                            // Calcular puntos totales dinámicamente
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? 
                                (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            const total = puntosBase + puntosBono + puntosPieza;
                            return total.toFixed(1);
                        })()} PUNTOS</div>
                        <div class="total-dinero">= ${(() => {
                            // Calcular dinero (1 punto = 100€)
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? 
                                (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            const totalPuntos = puntosBase + puntosBono + puntosPieza;
                            const dinero = totalPuntos * 100; // 1 punto = 100€
                            return dinero.toLocaleString() + '€';
                        })()}</div>
                        <div class="total-conversion">(1 punto = 100€)</div>
                    </div>
                    
                    <div class="nuevo-presupuesto">
                        <div class="presupuesto-inicial">Presupuesto inicial: 5,000,000€</div>
                        <div class="presupuesto-ganancia">+ Ganancias: ${(() => {
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? 
                                (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            const totalPuntos = puntosBase + puntosBono + puntosPieza;
                            return (totalPuntos * 100).toLocaleString() + '€';
                        })()}</div>
                        <div class="presupuesto-gastos">- Gastos: ${(() => {
                            // Gastos dinámicos
                            let gastos = 0;
                            if (window.tutorialData?.estrategaContratado) {
                                gastos += 150000; // Salario estratega
                            }
                            if (window.tutorialData?.piezaFabricando) {
                                gastos += 50000; // Costo fabricación
                            }
                            return gastos.toLocaleString() + '€';
                        })()}</div>
                        <div class="presupuesto-final">Nuevo presupuesto: <strong>${(() => {
                            // Presupuesto final dinámico
                            const inicial = 5000000;
                            
                            // Calcular ganancias
                            const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                            let puntosBono = 0;
                            
                            if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                const bono = window.tutorialData?.bonoEstratega || 15;
                                puntosBono = Math.round(puntosBase * (bono / 100));
                            }
                            
                            const puntosPieza = window.tutorialData?.piezaFabricando ? 
                                (window.tutorialData?.puntosPieza || 15) : 0;
                            
                            const totalPuntos = puntosBase + puntosBono + puntosPieza;
                            const ganancias = totalPuntos * 100;
                            
                            // Calcular gastos
                            let gastos = 0;
                            if (window.tutorialData?.estrategaContratado) {
                                gastos += 150000;
                            }
                            if (window.tutorialData?.piezaFabricando) {
                                gastos += 50000;
                            }
                            
                            const final = inicial + ganancias - gastos;
                            return final.toLocaleString() + '€';
                        })()}</strong></div>
                    </div>
                `,
                action: 'siguientePaso'
            },
            
            // PASO 11: Tutorial completado
            {
                title: "🏁 ¡TUTORIAL COMPLETADO!",
                content: `
                    <div class="completado-celebracion">
                        <div class="celebracion-icon">🎉</div>
                        <h3>¡FELICIDADES DIRECTOR!</h3>
                        <p class="celebracion-sub">Has completado el tutorial con éxito</p>
                    </div>
                    
                    <div class="resumen-final">
                        ${window.tutorialData?.estrategaContratado ? `
                        <div class="resumen-item">
                            <div class="resumen-icon">👥</div>
                            <div class="resumen-text">
                                <strong>Estratega contratado</strong><br>
                                ${window.tutorialData.nombreEstratega || 'Analista de Tiempos'}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${window.tutorialData?.piezaFabricando ? `
                        <div class="resumen-item">
                            <div class="resumen-icon">🔧</div>
                            <div class="resumen-text">
                                <strong>Pieza en producción</strong><br>
                                ${window.tutorialData.nombrePieza || 'Motor'} (+${window.tutorialData.puntosPieza || '15'} pts)
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="resumen-item">
                            <div class="resumen-icon">💰</div>
                            <div class="resumen-text">
                                <strong>Ganancias obtenidas</strong><br>
                                ${(() => {
                                    // Calcular ganancias reales
                                    const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                                    let puntosBono = 0;
                                    
                                    if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                        const bono = window.tutorialData?.bonoEstratega || 15;
                                        puntosBono = Math.round(puntosBase * (bono / 100));
                                    }
                                    
                                    const puntosPieza = window.tutorialData?.piezaFabricando ? 
                                        (window.tutorialData?.puntosPieza || 15) : 0;
                                    
                                    const totalPuntos = puntosBase + puntosBono + puntosPieza;
                                    const ganancias = totalPuntos * 100;
                                    return ganancias.toLocaleString() + '€ primera semana';
                                })()}
                            </div>
                        </div>
                        
                        <div class="resumen-item">
                            <div class="resumen-icon">🏆</div>
                            <div class="resumen-text">
                                <strong>Posición inicial estimada</strong><br>
                                ${(() => {
                                    // Estimar ranking basado en puntos
                                    const puntosBase = window.tutorialData?.puntosBaseCalculados || 0;
                                    let puntosBono = 0;
                                    
                                    if (window.tutorialData?.estrategaContratado && puntosBase > 0) {
                                        const bono = window.tutorialData?.bonoEstratega || 15;
                                        puntosBono = Math.round(puntosBase * (bono / 100));
                                    }
                                    
                                    const puntosPieza = window.tutorialData?.piezaFabricando ? 
                                        (window.tutorialData?.puntosPieza || 15) : 0;
                                    
                                    const totalPuntos = puntosBase + puntosBono + puntosPieza;
                                    
                                    // Estimación de ranking (menos puntos = mejor ranking)
                                    let rankingEstimado;
                                    if (totalPuntos >= 500) rankingEstimado = "#800-1,000";
                                    else if (totalPuntos >= 300) rankingEstimado = "#1,000-1,500";
                                    else if (totalPuntos >= 200) rankingEstimado = "#1,500-2,000";
                                    else if (totalPuntos >= 100) rankingEstimado = "#2,000-2,500";
                                    else rankingEstimado = "#2,500-3,000";
                                    
                                    return `Ranking ${rankingEstimado} global`;
                                })()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="primeros-pasos-reales">
                        <h4>🚀 AHORA COMENZARÁS A COMPETIR DE VERDAD:</h4>
                        <div class="pasos-reales-grid">
                            <div class="paso-real">1. Ve a <strong>EQUIPO</strong> para contratar más estrategas</div>
                            <div class="paso-real">2. Visita <strong>TALLER</strong> para fabricar piezas reales</div>
                            <div class="paso-real">3. Revisa <strong>PRONÓSTICOS</strong> para la próxima carrera real</div>
                            <div class="paso-real">4. Consulta <strong>RANKING</strong> y compite globalmente</div>
                        </div>
                    </div>
                    
                    <div class="despedida-final">
                        <p>El mundo del motorsport estratégico te espera.</p>
                        <p class="equipo-nombre-final">¡Buena suerte al mando de <strong>${this.escuderia?.nombre || "tu escudería"}!</strong></p>
                    </div>
                `,
                action: 'comenzarJuegoReal'
            }
        ];
        
        const step = steps[this.tutorialStep - 1];
        if (!step) return;
        
        // Asegurar que tutorialManager está disponible
        if (!window.tutorialManager) {
            window.tutorialManager = this;
        }
        
        document.body.innerHTML = `
            
            <div class="tutorial-screen">
                <div class="tutorial-container">
                    <!-- Progreso horizontal (FIJO ARRIBA) -->
                    <div class="tutorial-progress-horizontal">
                        ${steps.map((s, i) => `
                            <div class="progress-step-horizontal ${i + 1 === this.tutorialStep ? 'active' : ''} 
                                 ${i + 1 < this.tutorialStep ? 'completed' : ''}">
                                <div class="step-number-horizontal">${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Header (FIJO) -->
                    <div class="tutorial-header">
                        <h1>${step.title}</h1>
                    </div>
                    
                    <!-- CONTENIDO CON SCROLL INTERNO -->
                    <div class="tutorial-content-wrapper">
                        <div class="tutorial-content-grid">
                            ${step.content}
                        </div>
                    </div>
                    
                    <!-- Botones (FIJO ABAJO) -->
                    <div class="tutorial-actions-bottom">
                        ${this.tutorialStep > 1 ? `
                            <button class="btn-tutorial-prev" id="btn-tutorial-prev">
                                <i class="fas fa-arrow-left"></i> ANTERIOR
                            </button>
                        ` : '<div class="spacer"></div>'}
                        
                        ${step.action ? `
                            <button class="btn-tutorial-next-large" id="btn-tutorial-next-large">
                                ${step.action === 'comenzarJuegoReal' ? '¡EMPEZAR A COMPETIR!' : 'SIGUIENTE'}
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <style>
            .tutorial-screen {
                min-height: 100vh;
                background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                overflow: hidden;
                font-family: 'Roboto', sans-serif;
            }
            
            .area-grid-sub {
                color: #aaa;
                font-size: 0.8rem;
                margin-top: 5px;
                font-style: italic;
            }
            
            .tutorial-container {
                background: rgba(21, 21, 30, 0.98);
                border-radius: 20px;
                padding: 20px;
                width: 100%;
                max-width: 1000px;
                max-height: 90vh;
                border: 3px solid #00d2be;
                box-shadow: 0 25px 60px rgba(0, 210, 190, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .tutorial-content-wrapper {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px 5px;
                margin: 5px 0;
                -webkit-overflow-scrolling: touch;
            }
            
            .tutorial-content-grid {
                max-width: 100%;
                overflow: visible;
            }
            
            .tutorial-actions-bottom {
                flex-shrink: 0;
                padding-top: 15px;
                border-top: 2px solid rgba(255, 255, 255, 0.1);
                margin-top: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                bottom: 0;
                background: rgba(21, 21, 30, 0.95);
                z-index: 10;
                padding: 10px 0;
            }
            
            .tutorial-progress-horizontal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding: 10px 5px;
                flex-shrink: 0;
                position: sticky;
                top: 0;
                background: rgba(21, 21, 30, 0.95);
                z-index: 10;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .progress-step-horizontal {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                flex: 1;
            }
            
            .step-number-horizontal {
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
                font-size: 1.1rem;
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            
            .progress-step-horizontal.active .step-number-horizontal {
                background: linear-gradient(135deg, #00d2be, #009688);
                color: white;
                transform: scale(1.2);
                box-shadow: 0 0 20px rgba(0, 210, 190, 0.7);
                border: 2px solid white;
            }
            
            .progress-step-horizontal.completed .step-number-horizontal {
                background: linear-gradient(135deg, #4CAF50, #388E3C);
                color: white;
            }
            
            .grid-6-columns, .grid-4-columns, .grid-3-columns {
                display: grid;
                gap: 12px;
                margin: 15px 0;
            }
            
            .grid-6-columns { grid-template-columns: repeat(3, 1fr); }
            .grid-4-columns { grid-template-columns: repeat(4, 1fr); }
            .grid-3-columns { grid-template-columns: repeat(3, 1fr); }
            .grid-11-columns {
                display: grid;
                grid-template-columns: repeat(11, 1fr);
                gap: 8px !important; /* Menor espacio entre botones */
                margin-top: 10px !important;
                height: 100px; /* Altura fija para la fila */
                align-items: stretch;
            }
            
            .boton-area-montada, .boton-area-vacia {
                background: rgba(255, 255, 255, 0.03) !important;
                border: 1.5px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 6px !important;
                padding: 8px 6px !important;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                height: 85px; /* Igual que estrategas y producción */
                min-height: 85px !important;
            }
            
            .boton-area-montada {
                border-color: rgba(0, 210, 190, 0.25) !important;
                background: rgba(0, 210, 190, 0.04) !important;
            }
            
            .boton-area-montada:hover {
                border-color: rgba(0, 210, 190, 0.5) !important;
                background: rgba(0, 210, 190, 0.08) !important;
                transform: translateY(-1px);
            }
            
            .boton-area-vacia {
                border-style: dashed !important;
                border-color: rgba(255, 255, 255, 0.1) !important;
                background: rgba(255, 255, 255, 0.015) !important;
            }
            
            .boton-area-vacia:hover {
                border-color: rgba(0, 210, 190, 0.4) !important;
                background: rgba(0, 210, 190, 0.05) !important;
            }
            
            .icono-area {
                font-size: 1.1rem !important;
                margin-bottom: 5px !important;
                color: #00d2be;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .boton-area-vacia .icono-area {
                color: #666;
                font-size: 1rem !important;
            }
            
            .nombre-area {
                display: block;
                font-weight: bold;
                font-size: 0.75rem !important;
                color: white;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.1;
                text-align: center;
                width: 100%;
            }
            
            .nivel-pieza {
                display: block;
                font-size: 0.65rem !important;
                color: #4CAF50;
                margin-bottom: 1px;
                line-height: 1;
                font-weight: bold;
            }
            
            .puntos-pieza {
                display: block;
                font-size: 0.6rem !important;
                color: #FFD700;
                font-weight: bold;
                line-height: 1;
            }
            
            .total-puntos-montadas {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid #FFD700;
                border-radius: 20px;
                padding: 5px 15px;
                color: #FFD700;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .grid-btn-big {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 15px 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 120px;
            }
            
            .grid-btn-big:hover {
                border-color: #00d2be;
                background: rgba(0, 210, 190, 0.1);
                transform: translateY(-5px);
            }
            
            .grid-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .grid-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.2rem;
                font-weight: bold;
                color: white;
                margin-bottom: 5px;
            }
            
            .grid-desc {
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .area-grid-card {
                background: rgba(42, 42, 56, 0.8);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                transition: all 0.3s;
            }
            
            .area-grid-card:hover {
                border-color: #00d2be;
                transform: translateY(-3px);
            }
            
            .area-grid-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .area-grid-name {
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                color: white;
                font-size: 1.1rem;
                margin-bottom: 5px;
            }
            
            .area-grid-desc {
                color: #aaa;
                font-size: 0.9rem;
                margin-bottom: 10px;
                min-height: 40px;
            }
            
            .area-grid-stats {
                background: rgba(0, 210, 190, 0.1);
                color: #00d2be;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            
            .fabricacion-card {
                background: linear-gradient(135deg, rgba(225, 6, 0, 0.1), rgba(0, 210, 190, 0.1));
                border: 2px solid rgba(225, 6, 0, 0.3);
                border-radius: 15px;
                padding: 20px 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .fabricacion-card:hover {
                border-color: #00d2be;
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0, 210, 190, 0.2);
            }
            
            .fab-icon {
                font-size: 2.5rem;
                margin-bottom: 15px;
            }
            
            .fab-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.3rem;
                font-weight: bold;
                color: white;
                margin-bottom: 15px;
            }
            
            .fab-details {
                display: flex;
                justify-content: space-around;
                margin: 15px 0;
            }
            
            .fab-time, .fab-cost, .fab-points {
                font-size: 0.9rem;
                color: #aaa;
            }
            
            .fab-action {
                background: rgba(0, 210, 190, 0.2);
                color: #00d2be;
                padding: 10px;
                border-radius: 10px;
                font-weight: bold;
                margin-top: 15px;
                border: 1px solid #00d2be;
            }
            
            .dia-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
                background: rgba(0, 0, 0, 0.3);
                padding: 12px;
                border-radius: 10px;
                border-left: 5px solid #00d2be;
            }
            
            .dia-numero {
                background: #00d2be;
                color: white;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 1.1rem;
            }
            
            .dia-titulo {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.2rem;
                color: white;
                flex: 1;
            }
            
            .seleccionable {
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .seleccionable:hover {
                transform: translateY(-5px);
            }
            
            .seleccionable.seleccionado {
                border-color: #00d2be !important;
                background: rgba(0, 210, 190, 0.15) !important;
                box-shadow: 0 0 20px rgba(0, 210, 190, 0.3);
            }
            
            .btn-tutorial-accion-grande {
                background: linear-gradient(135deg, #00d2be, #009688);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 12px;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                display: block;
                width: 100%;
                margin-top: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .btn-tutorial-accion-grande:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(0, 210, 190, 0.4);
            }
            
            .tutorial-header {
                margin-bottom: 15px;
                text-align: center;
                flex-shrink: 0;
            }
            
            .tutorial-header h1 {
                font-size: 1.5rem;
                margin: 0;
                padding: 0 10px;
                word-wrap: break-word;
                line-height: 1.3;
            }
            
            @media (max-width: 1024px) {
                .grid-6-columns {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .grid-4-columns {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .grid-3-columns {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 1200px) {
                .grid-6-columns {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .grid-4-columns {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .grid-3-columns {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 900px) {
                .grid-6-columns, .grid-4-columns, .grid-3-columns {
                    grid-template-columns: 1fr;
                }
                
                .area-grid-card {
                    min-height: auto;
                    padding: 12px;
                }
                
                .area-grid-name {
                    font-size: 1rem;
                }
                
                .area-grid-desc {
                    font-size: 0.85rem;
                    min-height: 35px;
                }
                
                .area-grid-stats, .area-grid-sub {
                    font-size: 0.85rem;
                }
            }
            
            @media (max-width: 768px) {
                .tutorial-container {
                    padding: 15px;
                    max-height: 85vh;
                    margin: 10px;
                }
                
                .grid-btn-big {
                    min-height: 110px;
                    padding: 12px 8px;
                }
                
                .grid-icon {
                    font-size: 1.8rem;
                }
                
                .grid-title {
                    font-size: 0.9rem;
                }
                
                .grid-desc {
                    font-size: 0.75rem;
                }
                
                .estratega-tutorial-card, .fabricacion-tutorial-card, .pronostico-tutorial-card {
                    min-height: 180px;
                    padding: 12px;
                }
                
                .estratega-icon-tut, .fab-icon-tut, .pronostico-icon-tut {
                    font-size: 1.8rem;
                }
                
                .estratega-nombre-tut, .fab-nombre-tut, .pronostico-nombre-tut {
                    font-size: 0.9rem;
                }
                
                .tutorial-header h1 {
                    font-size: 1.3rem;
                }
                
                .grid-6-columns, .grid-4-columns, .grid-3-columns {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                
                .btn-tutorial-next-large, .btn-tutorial-prev {
                    padding: 10px 20px;
                    font-size: 1rem;
                    min-height: 45px;
                }
                
                .step-number-horizontal {
                    width: 32px;
                    height: 32px;
                    font-size: 0.9rem;
                }
                
                .tutorial-content-wrapper {
                    padding: 5px 2px;
                }
                
                .area-grid-name, .estratega-nombre-tut, .fab-nombre-tut, .pronostico-nombre-tut {
                    font-size: 0.9rem;
                }
                
                .area-grid-desc, .estratega-especialidad, .fab-desc-tut, .pronostico-pregunta {
                    font-size: 0.8rem;
                    margin-bottom: 10px;
                }
            }
            
            .estratega-tutorial-card, .fabricacion-tutorial-card, .pronostico-tutorial-card {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 15px;
                text-align: center;
                min-height: 200px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .estratega-icon-tut, .fab-icon-tut, .pronostico-icon-tut {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .estratega-nombre-tut, .fab-nombre-tut, .pronostico-nombre-tut {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.1rem;
                font-weight: bold;
                color: white;
                margin-bottom: 10px;
            }
            
            .estratega-especialidad, .fab-desc-tut, .pronostico-pregunta {
                color: #aaa;
                font-size: 0.9rem;
                margin-bottom: 15px;
                flex: 1;
            }
            
            .estratega-bono, .estratega-sueldo, .fab-tiempo-tut, .fab-costo-tut, .fab-puntos-tut, .pronostico-puntos {
                font-size: 0.9rem;
                margin: 5px 0;
            }
            
            .bono-valor, .sueldo-valor {
                color: #00d2be;
                font-weight: bold;
            }
            
            .estratega-ejemplo {
                font-size: 0.8rem;
                color: #888;
                font-style: italic;
                margin-top: 10px;
            }
            
            .fab-accion-tut {
                background: rgba(0, 210, 190, 0.2);
                color: #00d2be;
                padding: 8px;
                border-radius: 8px;
                font-size: 0.9rem;
                margin-top: 15px;
                border: 1px solid rgba(0, 210, 190, 0.5);
            }
            
            .pronostico-opciones {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 15px 0;
            }
            
            .opcion-tut {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.9rem;
            }
            
            .opcion-tut:hover {
                background: rgba(0, 210, 190, 0.3);
                color: white;
            }
            
            .opcion-tut.seleccionado {
                background: #00d2be;
                color: white;
                font-weight: bold;
            }
            
            .simulacion-carrera {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 20px 0;
            }
            
            .carrera-paso {
                display: flex;
                align-items: center;
                gap: 15px;
                background: rgba(255, 255, 255, 0.05);
                padding: 12px;
                border-radius: 10px;
                border-left: 4px solid #00d2be;
            }
            
            .paso-icon {
                font-size: 1.8rem;
            }
            
            .btn-simular-carrera {
                background: linear-gradient(135deg, #e10600, #ff4444);
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 10px;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                margin: 15px 0;
                font-size: 1.1rem;
                transition: all 0.3s;
            }
            
            .btn-simular-carrera:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(225, 6, 0, 0.3);
            }
            
            .resultados-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin: 20px 0;
            }
            
            .resultado-card {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 15px;
                text-align: center;
            }
            
            .resultado-card.ganancia { border-top: 4px solid #4CAF50; }
            .resultado-card.bono { border-top: 4px solid #00d2be; }
            .resultado-card.pieza { border-top: 4px solid #ff9800; }
            
            .resultado-icon {
                font-size: 1.8rem;
                margin-bottom: 12px;
            }
            
            .resultado-titulo {
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .resultado-detalle {
                color: #aaa;
                font-size: 0.9rem;
                margin-bottom: 12px;
            }
            
            .resultado-puntos {
                font-size: 1.2rem;
                font-weight: bold;
                color: #ffd700;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1a1a2e;
                border-left: 4px solid #00d2be;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left-color: #4CAF50;
            }
            
            .notification.error {
                border-left-color: #f44336;
            }
            
            .notification.warning {
                border-left-color: #ff9800;
            }
            
            .notification.info {
                border-left-color: #2196F3;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification i {
                font-size: 1.2rem;
            }
            
            .total-ganancias {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 210, 190, 0.1));
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
                border: 2px solid #ffd700;
            }
            
            .total-titulo {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.1rem;
                color: #aaa;
                margin-bottom: 10px;
            }
            
            .total-puntos {
                font-size: 2rem;
                font-weight: bold;
                color: #ffd700;
                margin: 10px 0;
                font-family: 'Orbitron', sans-serif;
            }
            
            .total-dinero {
                font-size: 1.3rem;
                color: #4CAF50;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .total-conversion {
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .nuevo-presupuesto {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 15px;
                margin: 20px 0;
            }

            .presupuesto-inicial, .presupuesto-ganancia, .presupuesto-gastos {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .presupuesto-final {
                display: flex;
                justify-content: space-between;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 1.1rem;
                color: white;
                font-weight: bold;
            }
            
            .completado-celebracion {
                text-align: center;
                margin: 20px 0;
            }
            
            .celebracion-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                animation: bounce 1s infinite;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .celebracion-sub {
                color: #00d2be;
                font-size: 1.1rem;
                margin-top: 10px;
            }
            
            .resumen-final {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin: 20px 0;
            }
            
            .resumen-item {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(255, 255, 255, 0.05);
                padding: 12px;
                border-radius: 10px;
            }
            
            .escuderia-destacada {
                color: #00d2be;
                font-size: 1.5rem;
                font-weight: bold;
                font-family: 'Orbitron', sans-serif;
                text-shadow: 0 0 10px rgba(0, 210, 190, 0.7);
                display: inline-block;
                margin: 0 5px;
                animation: glow 2s infinite alternate;
            }
            
            @keyframes glow {
                from { text-shadow: 0 0 10px rgba(0, 210, 190, 0.7); }
                to { text-shadow: 0 0 20px rgba(0, 210, 190, 1), 0 0 30px rgba(0, 210, 190, 0.5); }
            }
            
            .resumen-icon {
                font-size: 1.5rem;
                width: 45px;
                height: 45px;
                background: rgba(0, 210, 190, 0.2);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .primeros-pasos-reales {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .pasos-reales-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-top: 15px;
            }
            
            .paso-real {
                background: rgba(255, 255, 255, 0.05);
                padding: 12px;
                border-radius: 8px;
                border-left: 4px solid #00d2be;
                font-size: 0.9rem;
            }
            
            .despedida-final {
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, rgba(225, 6, 0, 0.1), rgba(0, 210, 190, 0.1));
                border-radius: 15px;
                margin-top: 20px;
            }
            
            .equipo-nombre-final {
                font-size: 1.1rem;
                color: #00d2be;
                margin-top: 12px;
                font-family: 'Orbitron', sans-serif;
            }
            
            .btn-tutorial-prev {
                background: transparent;
                border: 2px solid #888;
                color: #888;
                padding: 12px 25px;
                border-radius: 10px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 10px;
                min-height: 50px;
            }
            
            .btn-tutorial-prev:hover {
                border-color: #00d2be;
                color: #00d2be;
                transform: translateY(-3px);
            }
            
            .btn-tutorial-next-large {
                background: linear-gradient(135deg, #00d2be, #009688);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 12px;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 10px;
                min-height: 55px;
                box-shadow: 0 10px 25px rgba(0, 210, 190, 0.4);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .btn-tutorial-next-large:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 15px 35px rgba(0, 210, 190, 0.6);
                background: linear-gradient(135deg, #00e6cc, #00a895);
            }
            
            .spacer {
                width: 100px;
            }
            
            @media (max-width: 480px) {
                .tutorial-container {
                    max-height: 80vh;
                    padding: 10px;
                }
                
                .tutorial-header h1 {
                    font-size: 1.1rem;
                }
                
                .btn-tutorial-next-large, .btn-tutorial-prev {
                    padding: 8px 15px;
                    font-size: 0.9rem;
                    min-height: 40px;
                }
                
                .step-number-horizontal {
                    width: 28px;
                    height: 28px;
                    font-size: 0.8rem;
                }
                
                .grid-icon, .estratega-icon-tut, .fab-icon-tut, .pronostico-icon-tut {
                    font-size: 1.5rem;
                    margin-bottom: 8px;
                }
                
                .spacer {
                    width: 80px;
                }
                
                .grid-btn-big {
                    min-height: 100px;
                    padding: 10px 8px;
                }
                
                .estratega-tutorial-card, .fabricacion-tutorial-card, .pronostico-tutorial-card {
                    min-height: 170px;
                    padding: 10px;
                }
                
                .resultados-grid {
                    grid-template-columns: 1fr;
                }
                
                .resumen-final {
                    grid-template-columns: 1fr;
                }
                
                .pasos-reales-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            .tutorial-content-wrapper {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            html, body {
                overflow-x: hidden;
                position: relative;
            }
            </style>
        `;
        
        // Ejecutar onLoad si existe
        if (step.onLoad && typeof step.onLoad === 'function') {
            setTimeout(() => step.onLoad(), 100);
        }
        
        // Eventos de navegación
        setTimeout(() => {
            const nextBtn = document.getElementById('btn-tutorial-next-large');
            const prevBtn = document.getElementById('btn-tutorial-prev');
            
            if (nextBtn) {
                nextBtn.onclick = async () => {
                    if (step.action === 'comenzarJuegoReal') {
                        // Finalizar tutorial y cargar dashboard
                        document.body.innerHTML = '';
                        await this.cargarDashboardCompleto();
                        await this.inicializarSistemasIntegrados();
                        
                        // Marcar tutorial como completado
                        localStorage.setItem('f1_tutorial_completado', 'true');
                        
                        if (this.escuderia && this.supabase) {
                            this.supabase
                                .from('escuderias')
                                .update({ tutorial_completado: true })
                                .eq('id', this.escuderia.id)
                                .catch(error => console.warn('No se pudo actualizar tutorial en BD:', error));
                        }
                    } else {
                        // Avanzar paso
                        if (this.tutorialStep < steps.length) {
                            this.tutorialStep++;
                            this.mostrarTutorialStep();
                        }
                    }
                };
            }
            
            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (this.tutorialStep > 1) {
                        this.tutorialStep--;
                        this.mostrarTutorialStep();
                    }
                };
            }
        }, 50);
    }
    

    
    // Añade esta función al objeto principal
    async ejecutarAccionTutorial(accion) {
        switch(accion) {
            case 'siguientePaso':
                if (this.tutorialStep < 7) {
                    this.tutorialStep++;
                    this.mostrarTutorialStep();
                }
                break;
                
            case 'comenzarJuegoReal':
                // Finalizar tutorial y cargar dashboard
                document.body.innerHTML = '';
                await this.cargarDashboardCompleto();
                await this.inicializarSistemasIntegrados();
                break;
                
            case 'contratarEstratega':
                // Redirigir a la sección de contratación
                this.tutorialStep++;
                this.mostrarTutorialStep();
                break;
                
            default:
                // Por defecto, siguiente paso
                if (this.tutorialStep < 7) {
                    this.tutorialStep++;
                    this.mostrarTutorialStep();
                }
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
        // Cargar ingenieros disponibles desde la base de datos
        try {
            const getBonusText = (tipo, valor) => {
                switch(tipo) {
                    case 'tiempo_reduccion': return `-${valor}% tiempo fabricación`;
                    case 'calidad_extra': return `+${valor}% calidad piezas`;
                    case 'coste_reduccion': return `-${valor}% coste fabricación`;
                    case 'puntos_extra': return `+${valor} puntos base`;
                    default: return `Bonus: ${tipo}`;
                }
            };



            
            const { data: ingenieros, error } = await supabase
                .from('ingenieros_catalogo')  // ← Tabla correcta
                .select('id, nombre, nacionalidad, experiencia, nivel_habilidad, salario_base, especialidad, bonificacion_tipo, bonificacion_valor')
                .eq('disponible', true)
                .order('nivel_habilidad', { ascending: false })  // ← Columna correcta
                .limit(10);
            
            if (error) throw error;
            
            // Actualizar el contenido del tutorial
            document.querySelector('.tutorial-content').innerHTML = `
                <div class="pilotos-tutorial">
                    <h3>👨‍🔧 SELECCIONA 2 INGENIEROS</h3>
                    <p class="warning">⚠️ Debes seleccionar exactamente 2 ingenieros para continuar</p>
                    <p class="success">💰 Los ingenieros te otorgan bonificaciones especiales:</p>
                    <ul>
                        <li><strong>Reducción de tiempo</strong>: Fabrican más rápido</li>
                        <li><strong>Bonificación de calidad</strong>: Piezas con mejores stats</li>
                        <li><strong>Coste reducido</strong>: Ahorras dinero en fabricación</li>
                    </ul>
                    
                    <div class="pilotos-grid">
                        ${ingenieros.map(ingeniero => `
                            <div class="piloto-card ${this.tutorialData.pilotosContratados.includes(ingeniero.id) ? 'selected' : ''}" 
                                 data-piloto-id="${ingeniero.id}">
                                <div class="piloto-header">
                                    <h4>${ingeniero.nombre}</h4>
                                    <span class="piloto-nacionalidad">${ingeniero.nacionalidad || 'Internacional'}</span>
                                </div>
                                <div class="piloto-stats">
                                    <div class="stat">
                                        <i class="fas fa-graduation-cap"></i>
                                        <span>Experiencia: ${ingeniero.experiencia || 5}/10</span>
                                    </div>
                                    <div class="stat">
                                        <i class="fas fa-star"></i>
                                        <span>Habilidad: ${ingeniero.nivel_habilidad || 5}/10</span>
                                    </div>
                                    <div class="stat">
                                        <i class="fas fa-cogs"></i>
                                        <span>Especialidad: ${ingeniero.especialidad || 'General'}</span>
                                    </div>
                                    <div class="stat">
                                        <i class="fas fa-coins"></i>
                                        <span>Salario: €${(parseFloat(ingeniero.salario_base) || 250000).toLocaleString()}/mes</span>
                                    </div>
                                    ${ingeniero.bonificacion_tipo ? `
                                    <div class="stat bonus">
                                        <i class="fas fa-gift"></i>
                                        <span>Bonus: ${getBonusText(ingeniero.bonificacion_tipo, ingeniero.bonificacion_valor)}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <button class="btn-seleccionar" data-piloto-id="${ingeniero.id}">
                                    ${this.tutorialData.pilotosContratados.includes(ingeniero.id) ? '✓ Seleccionado' : 'Seleccionar'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="pilotos-selected">
                        <h4>Ingenieros seleccionados: <span id="contador-pilotos">${this.tutorialData.pilotosContratados.length}</span>/2</h4>
                        <div id="selected-pilotos-list">
                            ${this.tutorialData.pilotosContratados.map(ingenieroId => {
                                const ingeniero = ingenieros.find(p => p.id === ingenieroId);
                                return ingeniero ? `<div class="selected-piloto">✓ ${ingeniero.nombre}</div>` : '';
                            }).join('')}
                        </div>
                        <button class="btn-confirmar" id="btn-confirmar-pilotos" 
                                ${this.tutorialData.pilotosContratados.length !== 2 ? 'disabled' : ''}>
                            CONFIRMAR SELECCIÓN (€${((ingenieros.find(p => this.tutorialData.pilotosContratados.includes(p.id))?.salario_base || 0) * 2).toLocaleString()}/mes)
                        </button>
                    </div>
                </div>
                
                <style>
                    .pilotos-tutorial {
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    
                    .pilotos-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
                    
                    .piloto-stats .stat.bonus {
                        color: #4CAF50;
                        font-weight: bold;
                    }
                    
                    .piloto-stats .stat i {
                        width: 20px;
                        text-align: center;
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
                    
                    .success {
                        color: #4CAF50;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                </style>
            `;
            

            
            // Eventos de selección
            document.querySelectorAll('.btn-seleccionar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ingenieroId = parseInt(e.target.dataset.pilotoId);
                    this.seleccionarPilotoTutorial(ingenieroId, ingenieros);
                });
            });
            
            document.getElementById('btn-confirmar-pilotos').addEventListener('click', async () => {
                await this.confirmarIngenierosTutorial(ingenieros);  // ← Cambia el nombre
            });
            
        } catch (error) {
            console.error('Error cargando ingenieros:', error);
            document.querySelector('.tutorial-content').innerHTML = `
                <p class="error">❌ Error cargando ingenieros: ${error.message}</p>
                <button onclick="location.reload()">Recargar</button>
            `;
        }
    }
    
    seleccionarPilotoTutorial(ingenieroId, ingenieros) {
        // Cambiar nombre de variable para claridad (opcional)
        const index = this.tutorialData.pilotosContratados.indexOf(ingenieroId);
        
        if (index > -1) {
            // Deseleccionar
            this.tutorialData.pilotosContratados.splice(index, 1);
        } else {
            // Seleccionar (máximo 2)
            if (this.tutorialData.pilotosContratados.length < 2) {
                this.tutorialData.pilotosContratados.push(ingenieroId);
            } else {
                alert('Solo puedes seleccionar 4 estrategas');  // ← Texto actualizado
                return;
            }
        }
        
        // Actualizar UI
        document.querySelectorAll('.piloto-card').forEach(card => {
            if (this.tutorialData.pilotosContratados.includes(parseInt(card.dataset.pilotoId))) {
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
                const ingeniero = ingenieros.find(p => p.id === id);
                return ingeniero ? `<div class="selected-piloto">✓ ${ingeniero.nombre}</div>` : '';
            }).join('');
        }
        
        // Actualizar botón de confirmar
        const confirmBtn = document.getElementById('btn-confirmar-pilotos');
        if (confirmBtn) {
            confirmBtn.disabled = this.tutorialData.pilotosContratados.length !== 2;
            
            // Actualizar costo total
            if (this.tutorialData.pilotosContratados.length === 2) {
                const totalSueldo = this.tutorialData.pilotosContratados.reduce((total, id) => {
                    const ingeniero = ingenieros.find(p => p.id === id);
                    return total + (parseFloat(ingeniero?.salario_base) || 250000);
                }, 0);
                confirmBtn.innerHTML = `CONFIRMAR SELECCIÓN (€${totalSueldo.toLocaleString()}/mes)`;
            } else {
                confirmBtn.innerHTML = `CONFIRMAR SELECCIÓN`;
            }
        }
    }
    
    async confirmarIngenierosTutorial(ingenierosCatalogo) {
        if (!this.escuderia) {
            alert('Primero debes crear tu escudería');
            return;
        }
        
        if (this.tutorialData.pilotosContratados.length !== 2) {
            alert('Debes seleccionar exactamente 2 ingenieros');
            return;
        }
        
        try {
            // 1. Obtener los ingenieros seleccionados
            const ingenierosSeleccionados = ingenierosCatalogo.filter(
                ing => this.tutorialData.pilotosContratados.includes(ing.id)
            );
            
            // 2. Contratar CADA ingeniero en la tabla ingenieros_contratados
            for (const ingeniero of ingenierosSeleccionados) {
                const { error: contratoError } = await supabase
                    .from('ingenieros_contratados')  // ← Tabla correcta
                    .insert([{
                        escuderia_id: this.escuderia.id,
                        ingeniero_id: ingeniero.id,
                        nombre: ingeniero.nombre,
                        salario: ingeniero.salario_base || 250000,
                        especialidad: ingeniero.especialidad,
                        bonificacion_tipo: ingeniero.bonificacion_tipo,
                        bonificacion_valor: ingeniero.bonificacion_valor,
                        activo: true,
                        contratado_en: new Date().toISOString()
                    }]);
                
                if (contratoError) throw contratoError;
            }
            
            // 3. Descontar el dinero de los salarios
            const totalSalarios = ingenierosSeleccionados.reduce(
                (sum, ing) => sum + (parseFloat(ing.salario_base) || 250000), 0
            );
            this.escuderia.dinero -= totalSalarios;
            await this.updateEscuderiaMoney();
            
            // 4. Avanzar tutorial
            this.tutorialStep++;
            this.mostrarTutorialStep();
            
            const nombres = ingenierosSeleccionados.map(ing => ing.nombre).join(' y ');
            alert(`✅ Ingenieros contratados: ${nombres}\n💰 Coste mensual: €${totalSalarios.toLocaleString()}`);
            
        } catch (error) {
            console.error('Error contratando ingenieros:', error);
            alert('❌ Error contratando ingenieros: ' + error.message);
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
                .simulacion-intro {
                    background: rgba(0, 210, 190, 0.1);
                    border-radius: 15px;
                    padding: 20px;
                    margin-bottom: 25px;
                    border: 2px solid #00d2be;
                }
                
                .intro-icon {
                    font-size: 3rem;
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .simulacion-pasos {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .simulacion-pasos li {
                    margin: 10px 0;
                    color: #ddd;
                }
                
                .simulacion-nota {
                    font-style: italic;
                    color: #aaa;
                    margin-top: 15px;
                    font-size: 0.9rem;
                }
                
                .simulacion-dia {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-left: 5px solid #e10600;
                }
                
                .dia-numero-simulacion {
                    background: #e10600;
                    color: white;
                    display: inline-block;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-family: 'Orbitron', sans-serif;
                }
                
                .dia-titulo-simulacion {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.3rem;
                    color: white;
                    margin: 10px 0 5px 0;
                }
                
                .dia-descripcion {
                    color: #ccc;
                    font-size: 0.95rem;
                }
                
                .fab-calidad-tut {
                    color: #aaa;
                    font-size: 0.9rem;
                    margin: 5px 0;
                    font-style: italic;
                }
                
                .seleccionable-pronostico {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.9rem;
                }
                
                .seleccionable-pronostico:hover {
                    background: rgba(0, 210, 190, 0.3);
                    color: white;
                }
                
                .seleccionable-pronostico.seleccionado {
                    background: #00d2be;
                    color: white;
                    font-weight: bold;
                }
                .apuestas-ejemplo h4 {
                    color: #00d2be;
                    margin-top: 0;
                }
                
                .apuestas-ejemplo p {
                    color: #ddd;
                    margin: 10px 0;
                }
                .resultado-item.acertado {
                    color: #4CAF50;
                    font-weight: bold;
                }
                
                .resultado-item.fallado {
                    color: #f44336;
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
        // 1. Guardar en localStorage que el tutorial está completado
        localStorage.setItem('f1_tutorial_completado', 'true');
        console.log('💾 Tutorial marcado como completado en localStorage');
        
        // 2. Cargar dashboard completo
        this.cargarDashboardCompleto();
        
        // 3. Opcional: Marcar también en la base de datos
        if (this.escuderia && this.supabase) {
            this.supabase
                .from('escuderias')
                .update({ tutorial_completado: true })
                .eq('id', this.escuderia.id)
                .then(() => {
                    console.log('✅ Tutorial marcado como completado en BD');
                })
                .catch(error => {
                    console.warn('⚠️ No se pudo actualizar tutorial en BD:', error);
                });
        }
        
        // 4. Mostrar notificación de bienvenida
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
        if (!this.escuderia || !this.escuderia.id || !this.supabase) {
            console.log('❌ No hay escudería o supabase');
            return;
        }
    
        try {
            console.log('👥 Cargando ingenieros contratados...');
            const { data: ingenieros, error } = await this.supabase
                .from('ingenieros_contratados')  // ← TABLA CORRECTA
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('activo', true)
                .order('contratado_en', { ascending: false });
    
            if (error) throw error;
    
            this.pilotos = ingenieros || [];
            console.log(`✅ ${this.pilotos.length} ingeniero(s) cargado(s)`);
            
            this.updatePilotosUI(); // Esta función debe usar this.pilotos
            
        } catch (error) {
            this.pilotos = [];
            console.error('❌ Error cargando ingenieros:', error);
            this.updatePilotosUI();
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
        
        // PRIMERO: Inyectar estilos en el HEAD si no existen
        if (!document.getElementById('dashboard-styles')) {
            const style = document.createElement('style');
            style.id = 'dashboard-styles';
            style.innerHTML = `
                /* ==================== */
                /* ESTILOS PARA PIEZAS MONTADAS */
                /* ==================== */
                .grid-11-columns {
                    display: grid !important;
                    grid-template-columns: repeat(11, 1fr) !important;
                    gap: 8px !important;
                    margin-top: 10px !important;
                    height: 100px !important;
                    align-items: stretch !important;
                    width: 100% !important;
                }
                
                .boton-area-montada, .boton-area-vacia {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1.5px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 6px !important;
                    padding: 8px 6px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    height: 85px !important;
                    min-height: 85px !important;
                }
                
                .boton-area-montada {
                    border-color: rgba(0, 210, 190, 0.25) !important;
                    background: rgba(0, 210, 190, 0.04) !important;
                }
                
                .boton-area-montada:hover {
                    border-color: rgba(0, 210, 190, 0.5) !important;
                    background: rgba(0, 210, 190, 0.08) !important;
                    transform: translateY(-1px) !important;
                }
                
                .boton-area-vacia {
                    border-style: dashed !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    background: rgba(255, 255, 255, 0.015) !important;
                }
                
                .boton-area-vacia:hover {
                    border-color: rgba(0, 210, 190, 0.4) !important;
                    background: rgba(0, 210, 190, 0.05) !important;
                }
                
                .icono-area {
                    font-size: 1.1rem !important;
                    margin-bottom: 5px !important;
                    color: #00d2be;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .boton-area-vacia .icono-area {
                    color: #666;
                    font-size: 1rem !important;
                }
                
                .nombre-area {
                    display: block;
                    font-weight: bold;
                    font-size: 0.75rem !important;
                    color: white;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.1;
                    text-align: center;
                    width: 100%;
                }
                
                .nivel-pieza {
                    display: block;
                    font-size: 0.65rem !important;
                    color: #4CAF50;
                    margin-bottom: 1px;
                    line-height: 1;
                    font-weight: bold;
                }
                
                .puntos-pieza {
                    display: block;
                    font-size: 0.6rem !important;
                    color: #FFD700;
                    font-weight: bold;
                    line-height: 1;
                }
                
                .total-puntos-montadas {
                    background: rgba(255, 215, 0, 0.1);
                    border: 1px solid #FFD700;
                    border-radius: 20px;
                    padding: 5px 15px;
                    color: #FFD700;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // 1. Crear el HTML COMPLETO
        document.body.innerHTML = `
            <div id="app">
                <!-- Loading Screen -->
                <div id="loading-screen">
                    <div class="loading-content">
                        <div class="f1-logo">
                            <i class="fas fa-flag-checkered"></i>
                        </div>
                        <h1>MOTORSPORT MANAGER E-STRATEGY</h1>
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
                        <!-- Three Columns Layout -->
                        <div class="three-columns-layout" style="display: flex; flex-direction: row; gap: 20px; margin: 20px 0; width: 100%; height: 380px; align-items: stretch;">
                            
                            <!-- Columna 1: Estrategas Compactos -->
                            <div class="col-estrategas" style="flex: 0 0 320px; height: 100%; background: rgba(30,30,40,0.8); border-radius: 10px; border: 1px solid rgba(0,210,190,0.3); padding: 10px;">
                                <section class="panel-pilotos compacto" style="height: 100%; display: flex; flex-direction: column;">
                                    <div class="section-header" style="padding-bottom: 8px;">
                                        <h2 style="margin: 0; font-size: 1.1rem;"><i class="fas fa-users"></i> ESTRATEGAS</h2>
                                        <span class="badge" id="contador-estrategas">0/4</span>
                                    </div>
                                    <div id="pilotos-container" class="pilotos-container" style="flex: 1; overflow: hidden;">
                                        <!-- Contenido dinámico -->
                                    </div>
                                    <button class="btn-contratar-todos" onclick="gestionarEstrategas()" style="
                                        margin-top: 8px;
                                        padding: 6px 10px;
                                        background: rgba(0,210,190,0.1);
                                        border: 1px solid rgba(0,210,190,0.4);
                                        color: #00d2be;
                                        border-radius: 5px;
                                        font-size: 0.75rem;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 5px;
                                    ">
                                        <i class="fas fa-plus"></i> GESTIONAR ESTRATEGAS
                                    </button>
                                </section>
                            </div>
                            
                            <!-- Columna 2: Countdown y GP -->
                            <div class="col-countdown" style="flex: 1; min-width: 0; height: 100%; background: rgba(30,30,40,0.8); border-radius: 10px; border: 1px solid rgba(0,210,190,0.3); padding: 15px;">
                                <div class="countdown-section" style="height: 100%; display: flex; flex-direction: column;">
                                    <div class="section-header">
                                        <h2><i class="fas fa-clock"></i> PRÓXIMA CARRERA</h2>
                                        <span class="tag upcoming">EN VIVO</span>
                                    </div>
                                    <div id="countdown-container" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
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
                            </div>
                            
                            <!-- Columna 3: Monitor de Fábrica -->
                            <div class="col-fabrica" style="flex: 1; min-width: 0; height: 100%; background: rgba(30,30,40,0.8); border-radius: 10px; border: 1px solid rgba(0,210,190,0.3); padding: 15px;">
                                <div class="monitor-fabrica" style="height: 100%; display: flex; flex-direction: column;">
                                    <div class="section-header">
                                        <h2><i class="fas fa-industry"></i> PRODUCCIÓN</h2>
                                        <div id="alerta-almacen" class="alerta-almacen" style="display: none;">
                                            <i class="fas fa-bell"></i>
                                            <span>¡Piezas nuevas en almacén!</span>
                                        </div>
                                    </div>
                                    <div id="produccion-actual" class="produccion-actual" style="flex: 1; overflow-y: auto; padding-right: 5px;">
                                        <!-- Grid de 4 slots como estrategas -->
                                        <div id="produccion-slots" class="produccion-slots">
                                            <div class="produccion-slot" data-slot="0" onclick="irAlTallerDesdeProduccion()">
                                                <div class="slot-content">
                                                    <i class="fas fa-plus"></i>
                                                    <span>Slot 1</span>
                                                </div>
                                            </div>
                                            <div class="produccion-slot" data-slot="1" onclick="irAlTallerDesdeProduccion()">
                                                <div class="slot-content">
                                                    <i class="fas fa-plus"></i>
                                                    <span>Slot 2</span>
                                                </div>
                                            </div>
                                            <div class="produccion-slot" data-slot="2" onclick="irAlTallerDesdeProduccion()">
                                                <div class="slot-content">
                                                    <i class="fas fa-plus"></i>
                                                    <span>Slot 3</span>
                                                </div>
                                            </div>
                                            <div class="produccion-slot" data-slot="3" onclick="irAlTallerDesdeProduccion()">
                                                <div class="slot-content">
                                                    <i class="fas fa-plus"></i>
                                                    <span>Slot 4</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Piezas Montadas en el Coche -->
                        <section class="piezas-montadas">
                            <div class="section-header">
                                <h2><i class="fas fa-car"></i> PIEZAS MONTADAS EN EL COCHE</h2>
                                <div class="total-puntos-montadas">
                                    <i class="fas fa-star"></i>
                                    <span>Puntos totales: <strong id="puntos-totales-montadas">0</strong></span>
                                </div>
                            </div>
                            
                            <div id="grid-piezas-montadas" class="grid-11-columns">
                                <!-- Se generarán dinámicamente 11 botones -->
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
                            <span>Structural Solidworks</span>
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
                
                // =============================================
                // ¡¡IMPORTANTE!! Esta función se debe llamar al cambiar a la pestaña principal
                // =============================================
                window.cargarContenidoPrincipal = async function() {
                    if (window.f1Manager) {
                        // Cargar piezas montadas
                        if (window.f1Manager.cargarPiezasMontadas) {
                            await window.f1Manager.cargarPiezasMontadas();
                        }
                        // Cargar estrategas
                        if (window.f1Manager.loadPilotosContratados) {
                            await window.f1Manager.loadPilotosContratados();
                        }
                        // Cargar producción
                        if (window.f1Manager.updateProductionMonitor) {
                            window.f1Manager.updateProductionMonitor();
                        }
                    }
                };
                
                // Ejecutar al cargar por primera vez
                setTimeout(() => {
                    if (window.cargarContenidoPrincipal) {
                        window.cargarContenidoPrincipal();
                    }
                }, 1500);
            </script>
        `;
        
        // 2. INICIALIZAR SISTEMAS CRÍTICOS INMEDIATAMENTE
        setTimeout(async () => {
            console.log('🔧 Inicializando sistemas críticos del dashboard...');
            
            // A. Asegurar que fabricacionManager existe
            if (!window.fabricacionManager && window.FabricacionManager) {
                window.fabricacionManager = new window.FabricacionManager();
                if (this.escuderia) {
                    await window.fabricacionManager.inicializar(this.escuderia.id);
                }
            }
            
            // B. Configurar sistema de pestañas CON LA FUNCIÓN DE RECARGA
            setTimeout(() => {
                if (window.tabManager && window.tabManager.setup) {
                    // Guardar el switchTab original
                    const originalSwitchTab = window.tabManager.switchTab;
                    
                    // Sobrescribir para que recargue contenido al volver a principal
                    window.tabManager.switchTab = function(tabId) {
                        // Llamar al original
                        originalSwitchTab.call(this, tabId);
                        
                        // Si es la pestaña principal, recargar contenido
                        if (tabId === 'principal') {
                            setTimeout(() => {
                                if (window.cargarContenidoPrincipal) {
                                    window.cargarContenidoPrincipal();
                                }
                            }, 100);
                        }
                    };
                    
                    window.tabManager.setup();
                }
            }, 400);
            
            // 3. Cargar datos iniciales
            const supabase = await this.esperarSupabase();
            if (supabase) {
                await this.loadCarStatus();
                await this.loadPilotosContratados();
                await this.loadProximoGP();
                
                // 4. Cargar piezas montadas INMEDIATAMENTE
                setTimeout(async () => {
                    await this.cargarPiezasMontadas();
                }, 500);
            }
            
            console.log('✅ Dashboard cargado correctamente con CSS');
        }, 1000);
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
        const container = document.getElementById('pilotos-container');
        if (!container) {
            console.error('❌ No se encontró #pilotos-container');
            return;
        }
        
        const estrategasContratados = this.pilotos || [];
        
        // Actualizar contador
        const contadorElement = document.getElementById('contador-estrategas');
        if (contadorElement) {
            contadorElement.textContent = `${estrategasContratados.length}/4`;
        }
        
        // HTML de la cuadrícula 2x2 minimalista
        let html = `
            <div class="estrategas-grid-minimal">
        `;
        
        // Mostrar 4 huecos (2 filas x 2 columnas)
        for (let i = 0; i < 4; i++) {
            const estratega = estrategasContratados[i];
            
            if (estratega) {
                // Botón con estratega contratado
                html += `
                    <div class="estratega-btn contratado" onclick="mostrarInfoEstratega(${i})">
                        <div class="estratega-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="estratega-info">
                            <span class="estratega-nombre">${estratega.nombre || 'Estratega'}</span>
                            <span class="estratega-salario">€${(estratega.salario || 0).toLocaleString()}/mes</span>
                            <span class="estratega-funcion">${estratega.especialidad || 'General'}</span>
                        </div>
                        <div class="estratega-bono">+${estratega.bonificacion_valor || 0}%</div>
                    </div>
                `;
            } else {
                // Botón vacío para contratar
                html += `
                    <div class="estratega-btn vacio" onclick="contratarNuevoEstratega(${i})">
                        <div class="estratega-icon">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="estratega-info">
                            <span class="estratega-nombre">Vacío</span>
                            <span class="estratega-funcion">Click para contratar</span>
                        </div>
                    </div>
                `;
            }
        }
        
        html += `</div>`;
        
        container.innerHTML = html;
        
        // Añadir estilos CSS
        const styles = document.createElement('style');
        styles.innerHTML = `
            .estrategas-grid-minimal {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 8px !important; /* Menor espacio */
                height: 100%;
                padding: 2px;
            }
            
            .estratega-btn {
                background: rgba(255, 255, 255, 0.03) !important;
                border: 1.5px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 6px !important;
                padding: 8px 6px !important; /* Más compacto */
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                height: 85px !important; /* Altura reducida */
                min-height: 85px !important;
            }
            
            .estratega-btn.contratado {
                border-color: rgba(0, 210, 190, 0.25) !important;
                background: rgba(0, 210, 190, 0.04) !important;
            }
            
            .estratega-btn.contratado:hover {
                border-color: rgba(0, 210, 190, 0.5) !important;
                background: rgba(0, 210, 190, 0.08) !important;
                transform: translateY(-1px);
            }
            
            .estratega-btn.vacio {
                border-style: dashed !important;
                border-color: rgba(255, 255, 255, 0.1) !important;
                background: rgba(255, 255, 255, 0.015) !important;
            }
            
            .estratega-btn.vacio:hover {
                border-color: rgba(0, 210, 190, 0.4) !important;
                background: rgba(0, 210, 190, 0.05) !important;
            }
            
            .estratega-icon {
                font-size: 1.1rem !important; /* Más pequeño */
                margin-bottom: 5px !important;
                color: #00d2be;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .estratega-btn.vacio .estratega-icon {
                color: #666;
                font-size: 1rem !important;
            }
            
            .estratega-info {
                text-align: center;
                width: 100%;
                overflow: hidden;
            }
            
            .estratega-nombre {
                display: block;
                font-weight: bold;
                font-size: 0.75rem !important; /* Más pequeño */
                color: white;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.1;
            }
            
            .estratega-salario {
                display: block;
                font-size: 0.65rem !important; /* Más pequeño */
                color: #4CAF50;
                margin-bottom: 1px;
                line-height: 1;
            }
            
            .estratega-funcion {
                display: block;
                font-size: 0.6rem !important; /* Más pequeño */
                color: #888;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1;
            }
            
            .estratega-bono {
                position: absolute;
                top: 4px;
                right: 4px;
                background: rgba(0, 210, 190, 0.15);
                color: #00d2be;
                font-size: 0.6rem !important; /* Más pequeño */
                padding: 1px 4px;
                border-radius: 8px;
                font-weight: bold;
                line-height: 1;
            }
            
            /* Ajustar section header */
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px !important;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            
            .section-header h2 {
                margin: 0 !important;
                font-size: 1.1rem !important;
                font-weight: 600;
            }
            
            .section-header .badge {
                background: rgba(0, 210, 190, 0.15);
                color: #00d2be;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            /* Ajustar las otras columnas para más equilibrio */
            .col-countdown, .col-fabrica {
                padding: 10px !important; /* Reducir padding general */
            }
            
            /* Mejorar scroll en producción */
            .produccion-actual {
                max-height: 220px;
                overflow-y: auto;
                padding-right: 3px;
            }
            
            .produccion-actual::-webkit-scrollbar {
                width: 4px;
            }
            
            .produccion-actual::-webkit-scrollbar-thumb {
                background: rgba(0, 210, 190, 0.3);
                border-radius: 2px;
            }
        `;
        
        // Añadir estilos solo si no existen
        if (!document.getElementById('estilos-estrategas')) {
            styles.id = 'estilos-estrategas';
            document.head.appendChild(styles);
        }
    }
    
    // Añade este método auxiliar para obtener iniciales
    getIniciales(nombre) {
        if (!nombre) return "??";
        return nombre.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 3);
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
    
    // En el método updateProductionMonitor() de la clase F1Manager
    async updateProductionMonitor() {
        if (!this.escuderia || !this.escuderia.id || !this.supabase) {
            console.log('❌ No hay escudería para monitor de producción');
            return;
        }
        
        const container = document.getElementById('produccion-actual');
        if (!container) {
            console.log('❌ No se encontró #produccion-actual');
            return;
        }
        
        try {
            // Cargar fabricaciones activas
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false)
                .order('tiempo_inicio', { ascending: true });
            
            if (error) throw error;
            
            console.log('📊 Fabricaciones activas encontradas:', fabricaciones?.length || 0);
            
            // Verificar tiempos REALES de cada fabricación
            const ahora = new Date();
            const fabricacionesConEstado = (fabricaciones || []).map(f => {
                const tiempoFin = new Date(f.tiempo_fin);
                const tiempoRestante = tiempoFin - ahora;
                const lista = tiempoRestante <= 0; // SOLO lista si el tiempo restante es <= 0
                
                return {
                    ...f,
                    tiempoRestante,
                    lista
                };
            });
            
            console.log('⏱️ Estado fabricaciones:', fabricacionesConEstado.map(f => ({
                area: f.area,
                tiempoFin: f.tiempo_fin,
                tiempoRestante: f.tiempoRestante,
                lista: f.lista
            })));
            
            // Para cada fabricación, calcular su número de pieza
            const fabricacionesConNumero = [];
            for (const fabricacion of fabricacionesConEstado) {
                // Calcular número de pieza basado en cuántas ya hay fabricadas
                const { data: piezasExistentes } = await this.supabase
                    .from('almacen_piezas')
                    .select('id')
                    .eq('escuderia_id', this.escuderia.id)
                    .eq('area', fabricacion.area)
                    .eq('nivel', fabricacion.nivel);
                
                const numeroPieza = (piezasExistentes?.length || 0) + 1;
                fabricacionesConNumero.push({
                    ...fabricacion,
                    numero_pieza: numeroPieza
                });
            }
            
            // Asegurar estilos
            this.cargarEstilosProduccion();
            
            let html = `
                <div class="produccion-slots">
            `;
            
            // Crear 4 slots
            for (let i = 0; i < 4; i++) {
                const fabricacion = fabricacionesConNumero[i];
                
                if (fabricacion) {
                    const tiempoRestante = fabricacion.tiempoRestante;
                    const lista = fabricacion.lista;
                    
                    const nombreArea = this.getNombreArea(fabricacion.area);
                    const tiempoFormateado = this.formatTime(tiempoRestante);
                    const numeroPieza = fabricacion.numero_pieza || 1;
                    
                    html += `
                        <div class="produccion-slot ${lista ? 'produccion-lista' : 'produccion-activa'}" 
                             onclick="recogerPiezaSiLista('${fabricacion.id}', ${lista}, ${i})"
                             title="${nombreArea} - Pieza ${numeroPieza} de nivel ${fabricacion.nivel}">
                            <div class="produccion-icon">
                                ${lista ? '✅' : '🔄'}
                            </div>
                            <div class="produccion-info">
                                <span class="produccion-nombre">${nombreArea}</span>
                                <span class="produccion-pieza-num">Pieza ${numeroPieza}</span>
                                ${lista ? 
                                    `<span class="produccion-lista-text">¡LISTA!</span>` :
                                    `<span class="produccion-tiempo">${tiempoFormateado}</span>`
                                }
                            </div>
                        </div>
                    `;
                } else {
                    // Slot vacío
                    html += `
                        <div class="produccion-slot" data-slot="${i}" onclick="irAlTallerDesdeProduccion()">
                            <div class="slot-content">
                                <i class="fas fa-plus"></i>
                                <span>Slot ${i + 1}</span>
                                <span class="slot-disponible">Disponible</span>
                            </div>
                        </div>
                    `;
                }
            }
            
            html += `</div>`;
            container.innerHTML = html;
            
            // Iniciar timer para actualización en tiempo real
            this.iniciarTimerProduccion();
            
        } catch (error) {
            console.error("Error en updateProductionMonitor:", error);
            container.innerHTML = `
                <div class="produccion-error">
                    <p>❌ Error cargando producción</p>
                    <button onclick="window.f1Manager.updateProductionMonitor()">Reintentar</button>
                </div>
            `;
        }
    }
    
    // ========================
    // TIMER PARA ACTUALIZACIÓN EN TIEMPO REAL
    // ========================
    iniciarTimerProduccion() {
        // Limpiar timer anterior si existe
        if (this.productionUpdateTimer) {
            clearInterval(this.productionUpdateTimer);
        }
        
        // Actualizar cada segundo para tiempos en vivo
        this.productionUpdateTimer = setInterval(() => {
            this.actualizarTiemposEnVivo();
        }, 1000);
    }
    
    // ========================
    // ACTUALIZAR TIEMPOS EN VIVO SIN RECARGAR TODO
    // ========================
    async actualizarTiemposEnVivo() {
        const slots = document.querySelectorAll('.produccion-slot.produccion-activa');
        if (slots.length === 0) return;
        
        try {
            const { data: fabricaciones, error } = await this.supabase
                .from('fabricacion_actual')
                .select('id, tiempo_fin, area, pieza_numero')
                .eq('escuderia_id', this.escuderia.id)
                .eq('completada', false);
            
            if (error || !fabricaciones) return;
            
            // Actualizar cada slot activo
            slots.forEach(slot => {
                const fabricacionId = slot.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (!fabricacionId) return;
                
                const fabricacion = fabricaciones.find(f => f.id === fabricacionId);
                if (!fabricacion) return;
                
                const ahora = new Date();
                const tiempoFin = new Date(fabricacion.tiempo_fin);
                const tiempoRestante = tiempoFin - ahora;
                
                if (tiempoRestante <= 0) {
                    // ¡LISTA!
                    slot.classList.remove('produccion-activa');
                    slot.classList.add('produccion-lista');
                    slot.innerHTML = `
                        <div class="produccion-icon">✅</div>
                        <div class="produccion-info">
                            <span class="produccion-nombre">${this.getNombreArea(fabricacion.area)}</span>
                            <span class="produccion-pieza-num">Pieza ${fabricacion.pieza_numero || 1}</span>
                            <span class="produccion-lista-text">¡LISTA!</span>
                        </div>
                    `;
                } else {
                    // Actualizar tiempo
                    const tiempoElement = slot.querySelector('.produccion-tiempo');
                    if (tiempoElement) {
                        tiempoElement.textContent = this.formatTime(tiempoRestante);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error actualizando tiempos en vivo:', error);
        }
    }
    
    // Añadir este método auxiliar
    cargarEstilosProduccion() {
        if (!document.getElementById('estilos-produccion')) {
            const style = document.createElement('style');
            style.id = 'estilos-produccion';
            style.innerHTML = produccionStyles; // Usa los estilos definidos arriba
            document.head.appendChild(style);
        }
    }
    
    getNombreArea(areaId) {
        const areas = {
            'motor': 'Motor',
            'chasis': 'Chasis',
            'aerodinamica': 'Aerodinámica',
            'suspension': 'Suspensión',
            'transmision': 'Transmisión',
            'frenos': 'Frenos',
            'electronica': 'Electrónica',
            'control': 'Control',
            'difusor': 'Difusor',
            'alerones': 'Alerones',
            'pontones': 'Pontones'
        };
        return areas[areaId] || areaId;
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
        if (milliseconds <= 0) return "00:00:00";
        
        const totalSegundos = Math.floor(milliseconds / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos}m ${segundos}s`;
        } else if (minutos > 0) {
            return `${minutos}m ${segundos}s`;
        } else {
            return `${segundos}s`;
        }
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

    // FUNCIONES GLOBALES PARA EL TUTORIAL
    window.tutorialManager = null;
    window.tutorialData = {
        estrategaSeleccionado: null,
        areaSeleccionada: null,
        pronosticosSeleccionados: {},
        piezaFabricando: false
    };
    // Al final del archivo, con las otras funciones globales
    window.irAlTallerDesdeProduccion = function() {
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('taller');
        } else {
            alert('Redirigiendo al taller para fabricar...');
            // Aquí deberías implementar la navegación al taller
        }
    };
    
    window.recogerPiezaSiLista = async function(fabricacionId, lista, slotIndex) {
        console.log("🔧 Recogiendo pieza:", { fabricacionId, lista });
        
        if (!lista) {
            // Mostrar información de la pieza en fabricación
            try {
                const { data: fabricacion } = await window.supabase
                    .from('fabricacion_actual')
                    .select('*')
                    .eq('id', fabricacionId)
                    .single();
                    
                if (fabricacion) {
                    const ahora = new Date();
                    const tiempoFin = new Date(fabricacion.tiempo_fin);
                    const tiempoRestante = tiempoFin - ahora;
                    const tiempoFormateado = tiempoRestante > 0 ? 
                        window.f1Manager?.formatTime(tiempoRestante) : "Finalizando...";
                    
                    // Calcular número de pieza
                    const { data: piezasExistentes } = await window.supabase
                        .from('almacen_piezas')
                        .select('id')
                        .eq('escuderia_id', fabricacion.escuderia_id)
                        .eq('area', fabricacion.area)
                        .eq('nivel', fabricacion.nivel);
                    
                    const numeroPieza = (piezasExistentes?.length || 0) + 1;
                    const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
                    
                    alert(`🔄 ${nombreArea}\nPieza ${numeroPieza} de nivel ${fabricacion.nivel}\nTiempo restante: ${tiempoFormateado}`);
                }
            } catch (error) {
                console.error("Error obteniendo info:", error);
            }
            return;
        }
        
        // SI está lista, recoger
        try {
            // 1. Obtener fabricación
            const { data: fabricacion, error: fetchError } = await window.supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // 2. Calcular número de pieza y puntos
            const { data: piezasExistentes } = await window.supabase
                .from('almacen_piezas')
                .select('id')
                .eq('escuderia_id', fabricacion.escuderia_id)
                .eq('area', fabricacion.area)
                .eq('nivel', fabricacion.nivel);
            
            const numeroPieza = (piezasExistentes?.length || 0) + 1;
            
            // Calcular puntos basados en área, nivel y número de pieza
            const puntosBase = calcularPuntosBase(fabricacion.area, fabricacion.nivel);
            const puntosExtra = numeroPieza * 2; // Bonus por dificultad
            const puntosTotales = puntosBase + puntosExtra;
            
            // 3. Crear pieza en almacen_piezas (COLUMNAS EXISTENTES SOLO)
            const { error: insertError } = await window.supabase
                .from('almacen_piezas')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: fabricacion.area,
                    nivel: fabricacion.nivel || 1,
                    puntos_base: puntosTotales,
                    calidad: 'Normal',
                    equipada: false,
                    fabricada_en: new Date().toISOString(),
                    creada_en: new Date().toISOString()
                    // NO incluir 'pieza_numero' porque no existe en la tabla
                }]);
            
            if (insertError) {
                console.error("Error insertando pieza:", insertError);
                throw insertError;
            }
            
            console.log("✅ Pieza añadida a almacen_piezas");
            
            // 4. Marcar fabricación como completada
            const { error: updateError } = await window.supabase
                .from('fabricacion_actual')
                .update({ 
                    completada: true,
                    // Opcional: asignar pieza_id si quieres relacionarlas
                    // pieza_id: resultado.id
                })
                .eq('id', fabricacionId);
            
            if (updateError) throw updateError;
            
            console.log("✅ Fabricación marcada como completada");
            
            // 5. Mostrar notificación
            const nombreArea = window.f1Manager?.getNombreArea(fabricacion.area) || fabricacion.area;
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(
                    `✅ ${nombreArea} (Pieza ${numeroPieza}) recogida\n+${puntosTotales} puntos técnicos`, 
                    'success'
                );
            }
            
            // 6. Actualizar UI
            if (window.f1Manager) {
                // Parar timer de actualización
                if (window.f1Manager.productionUpdateTimer) {
                    clearInterval(window.f1Manager.productionUpdateTimer);
                }
                
                // Actualizar producción
                setTimeout(() => {
                    window.f1Manager.updateProductionMonitor();
                }, 500);
                
                // Actualizar almacén si está abierto
                if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                    setTimeout(() => {
                        if (window.tabManager.loadAlmacenPiezas) {
                            window.tabManager.loadAlmacenPiezas();
                        }
                    }, 1000);
                }
                
                // Actualizar piezas montadas
                setTimeout(() => {
                    if (window.f1Manager.cargarPiezasMontadas) {
                        window.f1Manager.cargarPiezasMontadas();
                    }
                }, 1500);
            }
            
        } catch (error) {
            console.error('❌ Error recogiendo pieza:', error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`❌ Error: ${error.message}`, 'error');
            }
        }
    };
    
    // ========================
    // FUNCIONES AUXILIARES
    // ========================
    function calcularPuntosBase(area, nivel) {
        const puntosPorArea = {
            'motor': 15,
            'chasis': 12,
            'suelo': 10,
            'electronica': 14,
            'aleron_delantero': 8,
            'aleron_trasero': 8,
            'caja_cambios': 9,
            'suspension': 7,
            'frenos': 6,
            'volante': 5,
            'pontones': 7
        };
        
        const puntosArea = puntosPorArea[area] || 10;
        return puntosArea * (nivel || 1);
    }
    
    function formatTime(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        
        const totalSegundos = Math.floor(milliseconds / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        } else if (minutos > 0) {
            return `${minutos}m ${segundos}s`;
        } else {
            return `${segundos}s`;
        }
    };
    
    // Función auxiliar para calcular puntos
    function calcularPuntosPorArea(area, nivel) {
        const puntosBase = {
            'motor': 15,
            'chasis': 12,
            'suelo': 10,
            'aleron_delantero': 8,
            'aleron_trasero': 8,
            'caja_cambios': 9,
            'suspension': 7,
            'frenos': 6,
            'electronica': 14,
            'volante': 5,
            'pontones': 7
        };
        return (puntosBase[area] || 10) * (nivel || 1);
    }
    
    // Función auxiliar para formatear tiempo
    function formatTime(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    window.cargarEstrategasTutorial = function() {
        const container = document.getElementById('grid-estrategas-tutorial');
        if (!container) return;
        
        const estrategas = [
            { id: 1, nombre: "Analista de Tiempos", icono: "⏱️", especialidad: "Diferencias de tiempo", bono: "+15%", sueldo: "50,000€", ejemplo: "Diferencia 1º-2º" },
            { id: 2, nombre: "Meteorólogo", icono: "🌧️", especialidad: "Condiciones climáticas", bono: "+20%", sueldo: "60,000€", ejemplo: "Lluvia/Sequía" },
            { id: 3, nombre: "Experto en Fiabilidad", icono: "🔧", especialidad: "Abandonos y fallos", bono: "+18%", sueldo: "55,000€", ejemplo: "Número de abandonos" },
            { id: 4, nombre: "Estratega de Carrera", icono: "🏁", especialidad: "Estrategias de parada", bono: "+22%", sueldo: "75,000€", ejemplo: "Número de paradas" },
            { id: 5, nombre: "Analista de Neumáticos", icono: "🛞", especialidad: "Degradación de neumáticos", bono: "+16%", sueldo: "52,000€", ejemplo: "Compuesto predominante" },
            { id: 6, nombre: "Especialista en Overtakes", icono: "💨", especialidad: "Adelantamientos", bono: "+19%", sueldo: "58,000€", ejemplo: "Adelantamientos entre compañeros" }
        ];
        
        container.innerHTML = estrategas.map(e => `
            <div class="estratega-tutorial-card seleccionable" onclick="tutorialSeleccionarEstrategaPractico(${e.id})">
                <div class="estratega-icon-tut">${e.icono}</div>
                <div class="estratega-nombre-tut">${e.nombre}</div>
                <div class="estratega-especialidad">${e.especialidad}</div>
                <div class="estratega-bono">Bono: <span class="bono-valor">${e.bono}</span></div>
                <div class="estratega-sueldo">Sueldo: <span class="sueldo-valor">${e.sueldo}/mes</span></div>
                <div class="estratega-ejemplo">Ej: "${e.ejemplo}"</div>
            </div>
        `).join('');
    };
    
    window.tutorialSeleccionarEstrategaPractico = function(id) {
        const cards = document.querySelectorAll('.estratega-tutorial-card');
        cards.forEach(card => card.classList.remove('seleccionado'));
        cards[id-1].classList.add('seleccionado');
        
        const accionBtn = document.getElementById('accion-contratar-tut');
        if (accionBtn) accionBtn.style.display = 'block';
        
        window.tutorialData.estrategaSeleccionado = id;
    };
    // Función global para fabricar desde los botones del taller
    // Función global CORREGIDA
    window.iniciarFabricacionTallerDesdeBoton = async function(areaId, nivel) {
        console.log('🔧 Botón presionado para:', areaId, nivel);
        
        if (!window.f1Manager || !window.f1Manager.iniciarFabricacionTaller) {
            alert('Error: Sistema de fabricación no disponible');
            return false;
        }
        
        // Verificar dinero primero
        if (!window.f1Manager.escuderia || window.f1Manager.escuderia.dinero < 10000) {
            window.f1Manager.showNotification('❌ Fondos insuficientes (necesitas €10,000)', 'error');
            return false;
        }
        
        // Ejecutar fabricación
        const resultado = await window.f1Manager.iniciarFabricacionTaller(areaId, nivel);
        
        // Si se inició, actualizar UI
        if (resultado) {
            // Actualizar taller
            setTimeout(() => {
                if (window.f1Manager.cargarTabTaller) {
                    window.f1Manager.cargarTabTaller();
                }
            }, 1000);
            
            // Ir a principal para ver la producción
            setTimeout(() => {
                if (window.tabManager && window.tabManager.switchTab) {
                    window.tabManager.switchTab('principal');
                }
            }, 1500);
        }
        
        return resultado;
    };
    window.tutorialEjecutarContratacion = async function() {
        const estrategaId = window.tutorialData.estrategaSeleccionado;
        if (!estrategaId && window.tutorialManager && window.tutorialManager.showNotification) {
            window.tutorialManager.showNotification("Primero selecciona un estratega", 'warning');
            return;
        }
        
        if (!window.tutorialManager || !window.tutorialManager.escuderia) {
            alert("Error: No se pudo encontrar tu escudería");
            return;
        }
        
        try {
            console.log("Buscando estratega en catálogo ID:", estrategaId);
            
            // 1. PRIMERO buscar el estratega en el catálogo
            const { data: estrategaCatalogo, error: errorCatalogo } = await window.supabase
                .from('ingenieros_catalogo')
                .select('*')
                .eq('id', estrategaId)
                .single();
            
            if (errorCatalogo || !estrategaCatalogo) {
                console.error("Error buscando en catálogo:", errorCatalogo);
                throw new Error("No se encontró el estratega en el catálogo");
            }
            
            console.log("Estratega encontrado:", estrategaCatalogo.nombre);
            
            // 2. LUEGO contratarlo (insertar en ingenieros_contratados)
            const { error: errorContrato } = await window.supabase
                .from('ingenieros_contratados')
                .insert([{
                    escuderia_id: window.tutorialManager.escuderia.id,
                    ingeniero_id: estrategaCatalogo.id,
                    nombre: estrategaCatalogo.nombre,
                    salario: estrategaCatalogo.salario_base || 50000,
                    especialidad: estrategaCatalogo.especialidad || 'General',
                    bonificacion_tipo: estrategaCatalogo.bonificacion_tipo || 'puntos_extra',
                    bonificacion_valor: estrategaCatalogo.bonificacion_valor || 15,
                    activo: true,
                    contratado_en: new Date().toISOString()
                }]);
            
            if (errorContrato) {
                console.error("Error insertando en contratados:", errorContrato);
                throw errorContrato;
            }
            
            // 3. OPCIONAL: Marcar como no disponible en catálogo
            try {
                await window.supabase
                    .from('ingenieros_catalogo')
                    .update({ disponible: false })
                    .eq('id', estrategaId);
            } catch (updateError) {
                console.warn("No se pudo actualizar catálogo:", updateError);
                // No es crítico, continuamos
            }
            
            // 4. Actualizar datos locales
            window.tutorialData.estrategaContratado = true;
            window.tutorialData.nombreEstratega = estrategaCatalogo.nombre;
            window.tutorialData.sueldoEstratega = parseInt(estrategaCatalogo.salario_base) || 50000;
            window.tutorialData.bonoEstratega = parseInt(estrategaCatalogo.bonificacion_valor) || 15;
            window.tutorialData.sueldoFormateado = (estrategaCatalogo.salario_base || 50000).toLocaleString();
            window.tutorialData.bonoTipo = estrategaCatalogo.bonificacion_tipo || 'puntos_extra';
            
            // 5. Descontar dinero de la escudería
            if (window.tutorialManager.escuderia) {
                const costo = parseInt(estrategaCatalogo.salario_base) || 50000;
                window.tutorialManager.escuderia.dinero -= costo;
                
                // Actualizar en la base de datos
                await window.supabase
                    .from('escuderias')
                    .update({ dinero: window.tutorialManager.escuderia.dinero })
                    .eq('id', window.tutorialManager.escuderia.id);
                
                // Actualizar UI
                const moneyElement = document.getElementById('money-value');
                if (moneyElement) {
                    moneyElement.textContent = `€${window.tutorialManager.escuderia.dinero.toLocaleString()}`;
                }
            }
            
            if (window.tutorialManager && window.tutorialManager.showNotification) {
                window.tutorialManager.showNotification(`✅ ${estrategaCatalogo.nombre} contratado`, 'success');
            }
            
            // Avanzar automáticamente
            setTimeout(() => {
                if (window.tutorialManager) {
                    window.tutorialManager.tutorialStep++;
                    window.tutorialManager.mostrarTutorialStep();
                }
            }, 1500);
            
        } catch (error) {
            console.error("Error completo contratando estratega:", error);
            alert("Error contratando estratega: " + (error.message || "Verifica la consola para más detalles"));
        }
    };
    
    function getEstrategaInfo(id) {
        const estrategas = {
            1: { nombre: "Analista de Tiempos", sueldo: "50000", bono: "15%", especialidad: "Análisis de tiempos" },
            2: { nombre: "Meteorólogo", sueldo: "60000", bono: "20%", especialidad: "Condiciones climáticas" },
            3: { nombre: "Experto en Fiabilidad", sueldo: "55000", bono: "18%", especialidad: "Fiabilidad técnica" }
        };
        return estrategas[id] || { nombre: "Estratega", sueldo: "50000", bono: "15%", especialidad: "General" };
    };
    
    function getNombreEstratega(id) {
        const nombres = {
            1: "Analista de Tiempos",
            2: "Meteorólogo", 
            3: "Experto en Fiabilidad"
        };
        return nombres[id] || "Estratega";
    }
    
    function getSueldoEstratega(id) {
        const sueldos = {
            1: "50,000",
            2: "60,000",
            3: "55,000"
        };
        return sueldos[id] || "50,000";
    }
    
    window.tutorialSeleccionarFabricacionPractica = function(area) {
        const cards = document.querySelectorAll('.fabricacion-tutorial-card');
        cards.forEach(card => card.classList.remove('seleccionado'));
        
        cards.forEach(card => {
            if (card.getAttribute('onclick') && card.getAttribute('onclick').includes(area)) {
                card.classList.add('seleccionado');
            }
        });
        
        const accionBtn = document.getElementById('accion-fabricar-tut');
        if (accionBtn) accionBtn.style.display = 'block';
        
        window.tutorialData.areaSeleccionada = area;
    };
    
    window.tutorialEjecutarFabricacion = async function() {
        const area = window.tutorialData.areaSeleccionada;
        if (!area) {
            alert("Primero selecciona un área para fabricar");
            return;
        }
        
        if (!window.tutorialManager || !window.tutorialManager.escuderia) {
            alert("Error: No se pudo encontrar tu escudería");
            return;
        }
        
        try {
            console.log("Iniciando fabricación REAL para área:", area);
            
            // 1. MAPPING de IDs a nombres completos
            const areaMapping = {
                'motor': { nombre: 'Motor', costo: 10000, puntos: 15 },
                'chasis': { nombre: 'Chasis', costo: 10000, puntos: 12 },
                'aerodinamica': { nombre: 'Aerodinámica', costo: 10000, puntos: 10 }
            };
            
            const infoPieza = areaMapping[area] || { 
                nombre: area, 
                costo: 10000, 
                puntos: 15 
            };
            
            // 2. Crear fabricación REAL (120 segundos = 2 minutos)
            const tiempoInicio = new Date();
            const tiempoFin = new Date(tiempoInicio.getTime() + (120 * 1000)); // 120 segundos
            
            const { data: fabricacion, error: errorFabricacion } = await window.supabase
                .from('fabricacion_actual')
                .insert([{
                    escuderia_id: window.tutorialManager.escuderia.id,
                    area: infoPieza.nombre, // ¡IMPORTANTE! Usar nombre completo
                    nivel: 1,
                    tiempo_inicio: tiempoInicio.toISOString(),
                    tiempo_fin: tiempoFin.toISOString(),
                    completada: false,
                    costo: infoPieza.costo,
                    creada_en: tiempoInicio.toISOString()
                }])
                .select()
                .single();
            
            if (errorFabricacion) {
                console.error("Error creando fabricación REAL:", errorFabricacion);
                throw errorFabricacion;
            }
            
            console.log("✅ Fabricación REAL creada:", fabricacion.id);
            
            // 3. DESCONTAR DINERO REAL
            if (window.tutorialManager.escuderia) {
                const nuevoDinero = window.tutorialManager.escuderia.dinero - infoPieza.costo;
                
                const { error: errorUpdate } = await window.supabase
                    .from('escuderias')
                    .update({ dinero: nuevoDinero })
                    .eq('id', window.tutorialManager.escuderia.id);
                
                if (errorUpdate) throw errorUpdate;
                
                // Actualizar en memoria
                window.tutorialManager.escuderia.dinero = nuevoDinero;
            }
            
            // 4. Guardar datos del tutorial
            window.tutorialData.piezaFabricando = true;
            window.tutorialData.nombrePieza = infoPieza.nombre;
            window.tutorialData.costoPieza = infoPieza.costo;
            window.tutorialData.puntosPieza = infoPieza.puntos;
            window.tutorialData.fabricacionId = fabricacion.id;
            window.tutorialData.tiempoFin = tiempoFin;
            
            // 5. ¡IMPORTANTE! CREAR fabricacionManager si no existe
            if (!window.fabricacionManager && window.FabricacionManager) {
                console.log("🔧 Creando fabricacionManager para el tutorial...");
                window.fabricacionManager = new window.FabricacionManager();
                await window.fabricacionManager.inicializar(window.tutorialManager.escuderia.id);
                
                // Añadir esta fabricación a la lista del manager
                window.fabricacionManager.produccionesActivas.push(fabricacion);
            }
            
            // 6. Mostrar mensaje
            if (window.tutorialManager && window.tutorialManager.showNotification) {
                window.tutorialManager.showNotification(`✅ ${infoPieza.nombre} en fabricación (2 minutos)`, 'success');
            }
            
            // 7. Avanzar tutorial
            setTimeout(() => {
                if (window.tutorialManager) {
                    window.tutorialManager.tutorialStep++;
                    window.tutorialManager.mostrarTutorialStep();
                }
            }, 1000);
            
        } catch (error) {
            console.error("Error en fabricación REAL:", error);
            if (window.tutorialManager && window.tutorialManager.showNotification) {
                window.tutorialManager.showNotification("❌ Error en fabricación", 'error');
            }
        }
    };
    
    function getNombrePieza(area) {
        const nombres = {
            'motor': "Motor",
            'chasis': "Chasis",
            'aerodinamica': "Aerodinámica"
        };
        return nombres[area] || area;
    }
    
    function getCostoPieza(area) {
        const costos = {
            'motor': "100,000",
            'chasis': "90,000",
            'aerodinamica': "85,000"
        };
        return costos[area] || "100,000";
    }
    
    function getPuntosPieza(area) {
        const puntos = {
            'motor': "15",
            'chasis': "12",
            'aerodinamica': "10"
        };
        return puntos[area] || "15";
    }
    
    window.tutorialSeleccionarPronosticoPractico = function(tipo) {
        const cards = document.querySelectorAll('.pronostico-tutorial-card');
        cards.forEach(card => card.classList.remove('seleccionado'));
        
        cards.forEach(card => {
            if (card.getAttribute('onclick') && card.getAttribute('onclick').includes(tipo)) {
                card.classList.add('seleccionado');
            }
        });
        
        const accionBtn = document.getElementById('accion-pronostico-tut');
        if (accionBtn) accionBtn.style.display = 'block';
    };
    
    window.tutorialSeleccionarOpcion = function(tipo, opcion) {
        const opciones = document.querySelectorAll('.opcion-tut');
        opciones.forEach(op => op.classList.remove('seleccionado'));
        
        event.target.classList.add('seleccionado');
        window.tutorialData.pronosticosSeleccionados[tipo] = opcion;
    };
    window.irAlAlmacenDesdePiezas = function() {
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('almacen');
        } else {
            console.log('Redirigiendo al almacén...');
            // Aquí puedes añadir más lógica
        }
    };
    window.tutorialEjecutarPronostico = function() {
        // Obtener las selecciones actuales
        const selecciones = window.tutorialData.pronosticosSeleccionados || {};
        const count = Object.keys(selecciones).length;
        
        if (count < 3) {
            if (window.tutorialManager && window.tutorialManager.showNotification) {
                window.tutorialManager.showNotification(`⚠️ Has seleccionado ${count} de 3 pronósticos`, 'warning');
            }
            return;
        }
        
        // Mostrar resultados BASADOS EN LAS ELECCIONES REALES
        const resultados = document.getElementById('resultado-simulacion');
        if (resultados) {
            // Determinar qué acertaste y qué no (esto es simulación, siempre aciertas 2/3)
            const acertados = {
                bandera: selecciones.bandera === 'si',
                abandonos: selecciones.abandonos === '3-5',
                diferencia: selecciones.diferencia !== '>5s' // Simulación: >5s es incorrecto
            };
            
            const aciertos = Object.values(acertados).filter(v => v).length;
            const errores = 3 - aciertos;
            
            resultados.innerHTML = `
                <div class="resultado-simulado">
                    <h4>📊 TUS RESULTADOS:</h4>
                    <div class="resultado-item ${acertados.bandera ? 'acertado' : 'fallado'}">
                        ${acertados.bandera ? '✅' : '❌'} Bandera amarilla: ${selecciones.bandera || 'No seleccionado'}
                    </div>
                    <div class="resultado-item ${acertados.abandonos ? 'acertado' : 'fallado'}">
                        ${acertados.abandonos ? '✅' : '❌'} Abandonos: ${selecciones.abandonos || 'No seleccionado'}
                    </div>
                    <div class="resultado-item ${acertados.diferencia ? 'acertado' : 'fallado'}">
                        ${acertados.diferencia ? '✅' : '❌'} Diferencia 1º-2º: ${selecciones.diferencia || 'No seleccionado'}
                    </div>
                    <div class="resumen-simulacion">
                        <strong>${aciertos} de 3 pronósticos acertados (${Math.round((aciertos/3)*100)}%)</strong>
                    </div>
                </div>
            `;
            resultados.style.display = 'block';
        }
        
        // Mostrar notificación en lugar de alert
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-trophy"></i>
                <span>✅ ${aciertos} de 3 pronósticos acertados</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Animación
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
        
        // Avanzar automáticamente al siguiente paso
        setTimeout(() => {
            if (window.tutorialManager) {
                window.tutorialManager.tutorialStep++;
                window.tutorialManager.mostrarTutorialStep();
            }
        }, 2000);
    };
    
    window.tutorialSimularCarrera = function() {
        // 1. Obtener las selecciones del usuario
        const tutorialData = window.tutorialData || {};
        const pronosticosSeleccionados = tutorialData.pronosticosSeleccionados || {};
        
        // 2. Definir resultados REALES de la simulación (puedes cambiarlos)
        const resultadosReales = {
            bandera: 'si',        // Sí hubo bandera amarilla
            abandonos: '3-5',     // Hubo 3-5 abandonos
            diferencia: '1-5s'    // Diferencia fue de 2.3s (1-5s)
        };
        
        // 3. Calcular aciertos
        let aciertos = 0;
        let detalles = [];
        
        // Bandera amarilla
        const banderaCorrecto = pronosticosSeleccionados.bandera === resultadosReales.bandera;
        detalles.push(`<div class="resultado-item ${banderaCorrecto ? 'correcto' : 'incorrecto'}">
            ${banderaCorrecto ? '✅' : '❌'} Bandera amarilla: ${pronosticosSeleccionados.bandera === 'si' ? 'SÍ' : 'NO'} 
            (${banderaCorrecto ? 'correcto' : 'incorrecto, fue ' + (resultadosReales.bandera === 'si' ? 'SÍ' : 'NO')})
        </div>`);
        if (banderaCorrecto) aciertos++;
        
        // Abandonos
        const abandonosCorrecto = pronosticosSeleccionados.abandonos === resultadosReales.abandonos;
        detalles.push(`<div class="resultado-item ${abandonosCorrecto ? 'correcto' : 'incorrecto'}">
            ${abandonosCorrecto ? '✅' : '❌'} Abandonos: ${pronosticosSeleccionados.abandonos} 
            (${abandonosCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.abandonos})
        </div>`);
        if (abandonosCorrecto) aciertos++;
        
        // Diferencia
        const diferenciaCorrecto = pronosticosSeleccionados.diferencia === resultadosReales.diferencia;
        detalles.push(`<div class="resultado-item ${diferenciaCorrecto ? 'correcto' : 'incorrecto'}">
            ${diferenciaCorrecto ? '✅' : '❌'} Diferencia 1º-2º: ${pronosticosSeleccionados.diferencia} 
            (${diferenciaCorrecto ? 'correcto' : 'incorrecto, fue ' + resultadosReales.diferencia})
        </div>`);
        if (diferenciaCorrecto) aciertos++;
        
        // 4. Guardar resultados para el PASO 10
        tutorialData.aciertosPronosticos = aciertos;
        tutorialData.totalPronosticos = 3;
        tutorialData.resultadosReales = resultadosReales;
        tutorialData.puntosBaseCalculados = (banderaCorrecto ? 150 : 0) + 
                                            (abandonosCorrecto ? 180 : 0) + 
                                            (diferenciaCorrecto ? 200 : 0);
        
        // 5. Mostrar resultados
        const resultados = document.getElementById('resultado-simulacion');
        if (resultados) {
            resultados.innerHTML = `
                <div class="resultado-simulado">
                    <h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>
                    ${detalles.join('')}
                    <div class="resumen-simulacion">
                        <strong>${aciertos} de 3 pronósticos acertados (${Math.round(aciertos/3*100)}%)</strong>
                    </div>
                    <div class="puntos-simulacion">
                        Puntos base obtenidos: <strong>${tutorialData.puntosBaseCalculados} pts</strong>
                    </div>
                </div>
            `;
            resultados.style.display = 'block';
        }
        
        // 6. Notificación
        const notifCarrera = document.createElement('div');
        notifCarrera.className = 'notification info';
        notifCarrera.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-flag-checkered"></i>
                <span>🏁 Carrera simulada - ${aciertos} de 3 aciertos (${Math.round(aciertos/3*100)}%)</span>
            </div>
        `;
        document.body.appendChild(notifCarrera);
        
        setTimeout(() => notifCarrera.classList.add('show'), 10);
        setTimeout(() => {
            notifCarrera.classList.remove('show');
            setTimeout(() => {
                if (notifCarrera.parentNode) {
                    notifCarrera.parentNode.removeChild(notifCarrera);
                }
            }, 300);
        }, 2000);
    };
    window.tutorialIrSeccion = function(seccion) {
        alert(`Esta función te llevaría a la sección: ${seccion.toUpperCase()}\n\nEn el juego real, puedes navegar entre secciones usando el menú superior.`);
    };
    // Función para seleccionar opciones de pronóstico
    window.tutorialSeleccionarOpcionPronostico = function(tipo, valor, elemento) {
        // Evitar propagación
        if (event) event.stopPropagation();
        
        // Inicializar datos si no existen
        if (!window.tutorialData) {
            window.tutorialData = {};
        }
        if (!window.tutorialData.pronosticosSeleccionados) {
            window.tutorialData.pronosticosSeleccionados = {};
        }
        
        // Quitar selección de otros elementos del mismo tipo
        const elementosMismoTipo = document.querySelectorAll(`[data-tipo="${tipo}"]`);
        elementosMismoTipo.forEach(el => el.classList.remove('seleccionado'));
        
        // Marcar este como seleccionado
        elemento.classList.add('seleccionado');
        
        // Guardar la selección
        window.tutorialData.pronosticosSeleccionados[tipo] = valor;
        
        // Mostrar botón de enviar si hay al menos una selección
        const selecciones = Object.keys(window.tutorialData.pronosticosSeleccionados).length;
        const accionBtn = document.getElementById('accion-pronostico-tut');
        if (accionBtn && selecciones > 0) {
            accionBtn.style.display = 'block';
        }
        
        console.log('Pronóstico seleccionado:', tipo, '=', valor);
        console.log('Todos los pronósticos:', window.tutorialData.pronosticosSeleccionados);
    };
    
    // Función para ejecutar pronóstico
    window.tutorialEjecutarPronostico = function() {
        // Verificar que los datos existen
        if (!window.tutorialData || !window.tutorialData.pronosticosSeleccionados) {
            alert("No has seleccionado ningún pronóstico");
            return;
        }
        
        const selecciones = window.tutorialData.pronosticosSeleccionados;
        const count = Object.keys(selecciones).length;
        
        if (count < 3) {
            alert(`Has seleccionado ${count} de 3 pronósticos. Necesitas seleccionar uno de cada categoría.`);
            return;
        }
        
        // SIMULAR RESULTADOS REALES (esto sería aleatorio en el juego real)
        const resultadosReales = {
            bandera: 'si',      // En la simulación siempre hay bandera amarilla
            abandonos: '3-5',   // En la simulación siempre hay 3-5 abandonos
            diferencia: '1-5s'  // En la simulación siempre es 1-5s
        };
        
        // Calcular aciertos REALES
        let aciertos = 0;
        const detalles = [];
        
        if (selecciones.bandera === resultadosReales.bandera) {
            aciertos++;
            detalles.push('✅ Bandera amarilla: SÍ (acertaste)');
        } else {
            detalles.push(`❌ Bandera amarilla: ${selecciones.bandera === 'si' ? 'SÍ' : 'NO'} (era ${resultadosReales.bandera === 'si' ? 'SÍ' : 'NO'})`);
        }
        
        if (selecciones.abandonos === resultadosReales.abandonos) {
            aciertos++;
            detalles.push('✅ Abandonos: 3-5 (acertaste)');
        } else {
            detalles.push(`❌ Abandonos: ${selecciones.abandonos} (era ${resultadosReales.abandonos})`);
        }
        
        if (selecciones.diferencia === resultadosReales.diferencia) {
            aciertos++;
            detalles.push('✅ Diferencia: 1-5s (acertaste)');
        } else {
            detalles.push(`❌ Diferencia: ${selecciones.diferencia} (era ${resultadosReales.diferencia})`);
        }
        
        // Mostrar resultados
        const resultados = document.getElementById('resultado-simulacion');
        if (resultados) {
            resultados.innerHTML = `
                <div class="resultado-simulado">
                    <h4>📊 RESULTADOS DE LA SIMULACIÓN:</h4>
                    ${detalles.map(d => `<div class="resultado-item">${d}</div>`).join('')}
                    <div class="resumen-simulacion">
                        <strong>${aciertos} de 3 pronósticos acertados (${Math.round((aciertos/3)*100)}%)</strong>
                    </div>
                </div>
            `;
            resultados.style.display = 'block';
        }
        
        // Guardar resultados para el paso final
        window.tutorialData.aciertosPronosticos = aciertos;
        window.tutorialData.totalPronosticos = 3;
        
        // Notificación basada en aciertos reales
        const notificacion = document.createElement('div');
        notificacion.className = aciertos >= 2 ? 'notification success' : 'notification warning';
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${aciertos >= 2 ? 'trophy' : 'chart-line'}"></i>
                <span>${aciertos} de 3 pronósticos acertados</span>
            </div>
        `;
        document.body.appendChild(notificacion);
        
        setTimeout(() => notificacion.classList.add('show'), 10);
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 2000);
        
        // Avanzar automáticamente después de 2 segundos
        setTimeout(() => {
            if (window.tutorialManager) {
                window.tutorialManager.tutorialStep++;
                window.tutorialManager.mostrarTutorialStep();
            }
        }, 2000);
    };
    // Añade esto al final de tu archivo, con las otras funciones globales
    window.mostrarInfoEstratega = function(index) {
        const estratega = window.f1Manager.pilotos[index];
        if (estratega) {
            alert(`📊 Estratega: ${estratega.nombre}\n💰 Salario: €${estratega.salario}/mes\n🎯 Función: ${estratega.especialidad}\n✨ Bono: +${estratega.bonificacion_valor}% puntos`);
        }
    };
    
    window.contratarNuevoEstratega = function(hueco) {
        // Esto abriría tu sistema de contratación
        if (window.tabManager) {
            window.tabManager.switchTab('equipo'); // Asume que tienes pestaña "equipo"
        } else {
            // Fallback simple
            alert(`Contratar nuevo estratega para hueco ${hueco + 1}\nRedirigiendo al mercado...`);
            // Aquí implementarías tu lógica de contratación
        }
    };
    // Al final del archivo, con las otras funciones globales
    window.recogerPiezaTutorial = async function(fabricacionId, area) {
        try {
            // 1. Marcar como completada
            await window.supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);
            
            // 2. Crear pieza en almacen
            const { error: errorAlmacen } = await window.supabase
                .from('almacen_piezas')
                .insert([{
                    escuderia_id: window.f1Manager.escuderia.id,
                    area: area,
                    nivel: 1,
                    puntos_base: 15, // Ajusta según área
                    calidad: 'Básica',
                    equipada: false,
                    fabricada_en: new Date().toISOString(),
                    creada_en: new Date().toISOString()
                }]);
            
            if (errorAlmacen) throw errorAlmacen;
            
            // Notificación en lugar de alert
            const notificacion = document.createElement('div');
            notificacion.className = 'notification success';
            notificacion.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-box-open"></i>
                    <span>✅ Pieza añadida al almacén</span>
                </div>
            `;
            document.body.appendChild(notificacion);
            
            setTimeout(() => notificacion.classList.add('show'), 10);
            setTimeout(() => {
                notificacion.classList.remove('show');
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        notificacion.parentNode.removeChild(notificacion);
                    }
                }, 300);
            }, 2000);
            
            // 3. Actualizar UI
            if (window.f1Manager) {
                window.f1Manager.updateProductionMonitor();
            }
            
        } catch (error) {
            console.error("Error recogiendo pieza:", error);
            alert("Error recogiendo pieza: " + error.message);
        }
    };


// Iniciar aplicación
console.log('🚀 Iniciando aplicación desde el final del archivo...');
iniciarAplicacion();
// AL FINAL DE TU ARCHIVO JS, FUERA DE CUALQUIER CLASE/FUNCIÓN
(function() {
    // Variable global para los datos del tutorial
    window.tutorialData = {
        estrategaSeleccionado: null,
        estrategaContratado: false,
        areaSeleccionada: null,
        piezaFabricando: false,
        pronosticoSeleccionado: null
    };
    
    // Funciones globales que llaman a los métodos del objeto
    window.tutorialSeleccionarEstratega = function(id) {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialSeleccionarEstratega === 'function') {
            window.tutorialManager.tutorialSeleccionarEstratega(id);
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialContratarEstratega = function() {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialContratarEstratega === 'function') {
            window.tutorialManager.tutorialContratarEstratega();
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialSeleccionarArea = function(area) {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialSeleccionarArea === 'function') {
            window.tutorialManager.tutorialSeleccionarArea(area);
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    
    window.tutorialIniciarFabricacion = function() {
        if (window.tutorialManager && typeof window.tutorialManager.tutorialIniciarFabricacion === 'function') {
            window.tutorialManager.tutorialIniciarFabricacion();
        } else {
            console.error("tutorialManager no está disponible");
        }
    };
    // Funciones para gestionar estrategas
    window.mostrarModalContratacion = function(huecoNumero) {
        alert(`Mostrar modal para contratar estratega en hueco ${huecoNumero}`);
        // Aquí implementarías la lógica para mostrar un modal de contratación
    };
    
    window.despedirEstratega = function(estrategaId) {
        if (confirm('¿Estás seguro de despedir a este estratega?')) {
            // Aquí implementarías la lógica para despedir estratega
            console.log('Despedir estratega ID:', estrategaId);
            alert('Estratega despedido. Hueco disponible para nuevo contrato.');
            
            // Recargar UI
            if (window.f1Manager) {
                setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
            }
        }
    };
    window.gestionarEstrategas = function() {
        alert('Mostrar pantalla completa de gestión de estrategas');
        // Aquí puedes redirigir a una pestaña específica o mostrar un modal grande
        if (window.tabManager && window.tabManager.switchTab) {
            window.tabManager.switchTab('equipo');
        }
    };
    // Función global para acceder desde los botones
    window.iniciarFabricacionTaller = function(areaId, nivel) {
        if (window.f1Manager && window.f1Manager.iniciarFabricacionTaller) {
            window.f1Manager.iniciarFabricacionTaller(areaId, nivel);
        } else {
            alert('Error: Sistema de fabricación no disponible');
        }
    };    
    window.mostrarModalContratacion = function(huecoNumero) {
        // Modal simple para contratar
        const modalHTML = `
            <div id="modal-contratacion" style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1a1a2e;
                    padding: 20px;
                    border-radius: 10px;
                    border: 2px solid #00d2be;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h3 style="color: #00d2be; margin-top: 0;">Contratar Estratega</h3>
                    <p>Selecciona un estratega para el hueco ${huecoNumero}:</p>
                    
                    <div style="margin: 20px 0;">
                        <button onclick="contratarEstrategaFicticio(1, ${huecoNumero})" style="
                            width: 100%;
                            padding: 10px;
                            margin: 5px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            🕐 Analista de Tiempos (+15%)
                        </button>
                        
                        <button onclick="contratarEstrategaFicticio(2, ${huecoNumero})" style="
                            width: 100%;
                            padding: 10px;
                            margin: 5px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            🌧️ Meteorólogo (+20%)
                        </button>
                        
                        <button onclick="contratarEstrategaFicticio(3, ${huecoNumero})" style="
                            width: 100%;
                            padding: 10px;
                            margin: 5px 0;
                            background: rgba(0,210,190,0.1);
                            border: 1px solid #00d2be;
                            color: white;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            🔧 Experto en Fiabilidad (+18%)
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="document.getElementById('modal-contratacion').remove()" style="
                            flex: 1;
                            padding: 10px;
                            background: transparent;
                            border: 1px solid #666;
                            color: #aaa;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };
    
    window.contratarEstrategaFicticio = function(tipo, hueco) {
        const estrategas = {
            1: { nombre: "Analista Tiempos", especialidad: "Análisis", bono: 15 },
            2: { nombre: "Meteorólogo", especialidad: "Clima", bono: 20 },
            3: { nombre: "Experto Fiabilidad", especialidad: "Técnica", bono: 18 }
        };
        
        alert(`Contratado: ${estrategas[tipo].nombre} en hueco ${hueco}`);
        document.getElementById('modal-contratacion').remove();
        
        // Actualizar UI
        if (window.f1Manager) {
            setTimeout(() => window.f1Manager.updatePilotosUI(), 500);
        }
    };
    
    // Función para contratar estratega desde tutorial
    window.contratarEstrategaDesdeTutorial = function() {
        // Redirigir al sistema de contratación
        if (window.tabManager) {
            window.tabManager.switchTab('equipo'); // Asumiendo que tienes una pestaña "equipo"
        } else {
            window.mostrarModalContratacion(1);
        }
    };
    // Función para recoger piezas y actualizar almacén
    window.recogerPiezaYActualizarAlmacen = async function(fabricacionId) {
        try {
            console.log("Recogiendo pieza:", fabricacionId);
            
            // 1. Obtener fabricación
            const { data: fabricacion, error: fetchError } = await supabase
                .from('fabricacion_actual')
                .select('*')
                .eq('id', fabricacionId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // 2. Convertir nombre a ID (ej: "Motor" → "motor")
            const areaId = fabricacion.area.toLowerCase().replace(/ /g, '_');
            
            // 3. Crear pieza en piezas_almacen (tabla correcta)
            const { error: insertError } = await supabase
                .from('piezas_almacen')
                .insert([{
                    escuderia_id: fabricacion.escuderia_id,
                    area: areaId,
                    nivel: fabricacion.nivel || 1,
                    puntos_base: 10,
                    estado: 'disponible',
                    fabricada_en: new Date().toISOString()
                }]);
            
            if (insertError) throw insertError;
            
            // 4. Marcar como completada
            const { error: updateError } = await supabase
                .from('fabricacion_actual')
                .update({ completada: true })
                .eq('id', fabricacionId);
            
            if (updateError) throw updateError;
            
            // 5. Notificación
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification(`✅ ${fabricacion.area} añadida al almacén`, 'success');
            }
            
            // 6. Actualizar producción
            if (window.f1Manager && window.f1Manager.updateProductionMonitor) {
                setTimeout(() => window.f1Manager.updateProductionMonitor(), 500);
            }
            
            // 7. Si estamos en almacén, actualizar
            if (window.tabManager && window.tabManager.currentTab === 'almacen') {
                if (window.tabManager.loadAlmacenPiezas) {
                    setTimeout(() => window.tabManager.loadAlmacenPiezas(), 1000);
                }
            } else {
                // Forzar recarga del almacén la próxima vez que se abra
                window.almacenNecesitaActualizar = true;
            }
            
        } catch (error) {
            console.error("Error recogiendo pieza:", error);
            if (window.f1Manager && window.f1Manager.showNotification) {
                window.f1Manager.showNotification("❌ Error al recoger pieza", 'error');
            }
        }
    };
    
})();
