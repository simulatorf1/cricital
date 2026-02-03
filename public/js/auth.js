// ========================
// AUTH.JS - SISTEMA COMPLETO DE AUTENTICACIÓN
// ========================

console.log('🔐 Auth Manager cargado');

class AuthManager {
    constructor() {
        this.user = null;
        this.escuderia = null;
        this.supabase = null;
    }

    // ========================
    // 1. INICIALIZACIÓN SEGURA DE SUPABASE
    // ========================
    initSupabase() {
        console.log('🔧 Inicializando Supabase seguro...');
        
        // Opción 1: Ya existe window.supabase del index.html
        if (window.supabase && window.supabase.auth) {
            console.log('✅ Supabase YA inicializado desde index.html');
            return window.supabase;
        }
        
        // Opción 2: Crear desde CDN
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            console.log('⚠️ Creando cliente desde CDN');
            try {
                window.supabase = supabase.createClient(
                    'https://xbnbbmhcveyzrvvmdktg.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJibWhjdmV5enJ2dm1ka3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzY1NDgsImV4cCI6MjA4MTU1MjU0OH0.RaNk5B62P97WB93kKJMR1OLac68lDb9JTVthu8_m3Hg'
                );
                console.log('✅ Cliente creado como backup');
                return window.supabase;
            } catch (e) {
                console.error('❌ Error creando cliente:', e);
                return null;
            }
        }
        
        console.error('❌ CRÍTICO: No se puede encontrar Supabase');
        return null;
    }

    // ========================
    // 2. INICIALIZAR APLICACIÓN
    // ========================
    async iniciarAplicacion() {
        console.log('🚀 Iniciando aplicación desde AuthManager...');
        
        // Configurar viewport para móviles
        this.configurarViewportMobile();
        
        // Mostrar pantalla de carga simple
        document.body.innerHTML = '<div id="f1-loading-screen">Cargando...</div>';
        
        // Inicializar Supabase
        this.supabase = this.initSupabase();
        window.supabase = this.supabase;
        
        if (!this.supabase) {
            this.mostrarErrorCritico('No se pudo conectar con la base de datos');
            return null;
        }
        
        console.log('✅ Supabase inicializado correctamente');
        
        // Verificar sesión
        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session) {
            console.log('✅ Usuario autenticado:', session.user.email);
            await this.cargarDatosUsuario(session.user);
            // ✅ AÑADIR ESTA LÍNEA:
            if (this.user && this.escuderia) {
                this.notificarAutenticacionExitosa(this.user, this.escuderia);
            }
            return { user: this.user, escuderia: this.escuderia };
        } else {
            console.log('👤 No hay sesión, mostrar login');
            this.mostrarPantallaLogin();
            return null;
        }
    }

    // ========================
    // 3. CONFIGURACIÓN MÓVIL
    // ========================
    configurarViewportMobile() {
        if (!document.querySelector('meta[name="viewport"][content*="user-scalable=no"]')) {
            const viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(viewportMeta);
        }
        
        const preventZoomStyles = document.createElement('style');
        preventZoomStyles.id = 'prevent-zoom-styles';
        preventZoomStyles.textContent = `
            html, body {
                touch-action: manipulation;
                overscroll-behavior: none;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
                position: fixed;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            
            * {
                -webkit-tap-highlight-color: transparent;
            }
        `;
        if (!document.getElementById('prevent-zoom-styles')) {
            document.head.appendChild(preventZoomStyles);
        }
    }

    // ========================
    // 4. CARGAR DATOS DEL USUARIO
    // ========================
    async cargarDatosUsuario(user) {
        console.log('📥 Cargando datos del usuario:', user.email);
        
        try {
            // Buscar escudería del usuario
            const { data: escuderias, error } = await this.supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', user.id)
                .order('creada_en', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error cargando escudería:', error);
                return null;
            }
            
            if (escuderias) {
                this.escuderia = escuderias;
                this.user = user;
                console.log('✅ Escudería cargada:', escuderias.nombre);
                
                // Crear datos iniciales si faltan
                await this.crearDatosInicialesSiFaltan(user);
                
                return { user: this.user, escuderia: this.escuderia };
            } else {
                console.log('⚠️ Usuario sin escudería');
                return null;
            }
            
        } catch (error) {
            console.error('Error en cargarDatosUsuario:', error);
            return null;
        }
    }
    // ========================
    // NUEVO MÉTODO: Notificar a main.js cuando la autenticación es exitosa
    // ========================
    notificarAutenticacionExitosa(user, escuderia) {
        console.log('🔔 Notificando autenticación exitosa a main.js');
        
        // Crear un evento personalizado
        const evento = new CustomEvent('auth-completado', {
            detail: { 
                user: user, 
                escuderia: escuderia,
                supabase: this.supabase
            }
        });
        
        // Disparar el evento
        window.dispatchEvent(evento);
        
        // También almacenar en variable global por si acaso
        window.authData = { user, escuderia, supabase: this.supabase };
    }
    // ========================
    // 5. CREAR DATOS INICIALES SI FALTAN
    // ========================
    async crearDatosInicialesSiFaltan(user) {
        console.log('🔍 Verificando datos iniciales del usuario...');
        
        // Verificar si ya está en public.users
        const { data: usuarioPublico, error: userError } = await this.supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
        
        // Si NO existe en public.users, lo creamos
        if (!usuarioPublico && !userError) {
            console.log('👤 Creando usuario en tabla pública...');
            const { error: insertError } = await this.supabase
                .from('users')
                .insert([{
                    id: user.id,
                    username: user.user_metadata?.username || user.email?.split('@')[0],
                    email: user.email,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                }]);
            
            if (insertError) {
                console.error('❌ Error creando usuario público:', insertError);
            }
        }
        
        // Verificar si ya tiene escudería
        const { data: escuderia, error: escError } = await this.supabase
            .from('escuderias')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
        
        // Si NO tiene escudería, la creamos
        if (!escuderia && !escError) {
            console.log('🏎️ Creando escudería inicial...');
            const nombreEscuderia = user.user_metadata?.team_name || 
                                   `${user.user_metadata?.username || 'Mi'} Team`;
            
            const { error: escInsertError } = await this.supabase
                .from('escuderias')
                .insert([{
                    user_id: user.id,
                    nombre: nombreEscuderia,
                    dinero: 5000000,
                    puntos: 0,
                    ranking: 999,
                    nivel_ingenieria: 1,
                    color_principal: '#e10600',
                    color_secundario: '#ffffff',
                    creada_en: new Date().toISOString()
                }], { returning: 'minimal' });
            
            if (escInsertError) {
                console.error('❌ Error creando escudería:', escInsertError);
                return false;
            }
            
            // Crear stats del coche
            const { data: nuevaEscuderia } = await this.supabase
                .from('escuderias')
                .select('id')
                .eq('user_id', user.id)
                .single();
        
            if (nuevaEscuderia) {
                const { data: statsExistentes } = await this.supabase
                    .from('coches_stats')
                    .select('escuderia_id')
                    .eq('escuderia_id', nuevaEscuderia.id)
                    .maybeSingle();
            
                if (!statsExistentes) {
                    await this.supabase
                        .from('coches_stats')
                        .insert([{ escuderia_id: nuevaEscuderia.id }]);
                }
            }
            
            console.log('✅ Datos iniciales creados correctamente');
            return true;
        }
        
        return true;
    }

    // ========================
    // 6. PANTALLAS DE AUTENTICACIÓN
    // ========================
    mostrarErrorCritico(mensaje) {
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

    mostrarPantallaLogin() {
        document.body.innerHTML = `
            <div class="login-screen">
                <div class="login-container">
                    <div class="login-header">
                        <h1>CRITICAL LAP</h1>
                        <p>Strategy AND Design</p>
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
                        <p>Gestiona tu escudería MotorSports</p>
                        <p>v1.0.0</p>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar eventos
        document.getElementById('btn-login').addEventListener('click', () => this.manejarLogin());
        document.getElementById('btn-register').addEventListener('click', () => this.mostrarPantallaRegistro());
        
        // Permitir Enter para login
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.manejarLogin();
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

    mostrarPantallaRegistro() {
        document.body.innerHTML = `
            <div class="register-screen">
                <div class="register-container">
                    <button class="back-button" id="btn-back">
                        <i class="fas fa-arrow-left"></i>
                        Volver al login
                    </button>
                    
                    <div class="register-header">
                        <h1>CREAR ESCUDERIA</h1>
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
                            CREAR ESCUDERIA
                        </button>
                    </div>
                    

                </div>
            </div>
        `;
        
        // Configurar eventos
        document.getElementById('btn-back').addEventListener('click', () => this.mostrarPantallaLogin());
        document.getElementById('btn-validate').addEventListener('click', () => this.validarDisponibilidad());
        document.getElementById('btn-register-submit').addEventListener('click', () => this.manejarRegistro());
        
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

    // ========================
    // 7. VALIDACIÓN Y REGISTRO
    // ========================
    async validarDisponibilidad() {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        const successDiv = document.getElementById('register-success');
        const btnRegister = document.getElementById('btn-register-submit');
        const btnValidate = document.getElementById('btn-validate');
        
        // Limpiar mensajes anteriores
        this.mostrarMensaje('', errorDiv);
        this.mostrarMensaje('', successDiv);
        
        // Validaciones básicas
        if (!username || !email || !password) {
            this.mostrarMensaje('Por favor, completa todos los campos', errorDiv);
            btnRegister.disabled = true;
            return;
        }
        
        if (password.length < 6) {
            this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', errorDiv);
            btnRegister.disabled = true;
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.mostrarMensaje('Por favor, introduce un correo electrónico válido', errorDiv);
            btnRegister.disabled = true;
            return;
        }
        
        // Deshabilitar botón de validar mientras se verifica
        btnValidate.disabled = true;
        btnValidate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';
        
        try {
            console.log('🔍 Iniciando validación para:', { username, email });
            
            // 1. Verificar si el USERNAME ya existe en la tabla users
            const { data: usernameExistente, error: userError } = await this.supabase
                .from('users')
                .select('username, email')
                .eq('username', username)
                .maybeSingle();
            
            if (userError && userError.code !== 'PGRST116') {
                throw userError;
            }
            
            if (usernameExistente) {
                this.mostrarMensaje('❌ Ya existe un usuario con ese nombre de escudería', errorDiv);
                btnRegister.disabled = true;
                btnValidate.disabled = false;
                btnValidate.innerHTML = '<i class="fas fa-check-circle"></i> VALIDAR DISPONIBILIDAD';
                return;
            }
            
            // 2. Verificar si el EMAIL ya existe en la tabla users
            const { data: emailExistente, error: emailError } = await this.supabase
                .from('users')
                .select('username, email')
                .eq('email', email)
                .maybeSingle();
            
            if (emailError && emailError.code !== 'PGRST116') {
                throw emailError;
            }
            
            if (emailExistente) {
                this.mostrarMensaje('❌ Este correo electrónico ya está registrado', errorDiv);
                btnRegister.disabled = true;
                btnValidate.disabled = false;
                btnValidate.innerHTML = '<i class="fas fa-check-circle"></i> VALIDAR DISPONIBILIDAD';
                return;
            }
            
            // 3. Si pasa ambas validaciones
            console.log('✅ Validación exitosa - Datos disponibles');
            this.mostrarMensaje('✅ ¡Nombre y correo disponibles! Ahora puedes crear tu cuenta', successDiv);
            btnRegister.disabled = false;
            
            // Cambiar botón de validar
            btnValidate.disabled = false;
            btnValidate.innerHTML = '<i class="fas fa-check-double"></i> VALIDADO ✓';
            btnValidate.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
            
        } catch (error) {
            console.error('❌ Error completo en validación:', error);
            
            this.mostrarMensaje('❌ Error al verificar disponibilidad. Intenta de nuevo.', errorDiv);
            btnRegister.disabled = true;
            
            // Restaurar botón de validar
            btnValidate.disabled = false;
            btnValidate.innerHTML = '<i class="fas fa-check-circle"></i> VALIDAR DISPONIBILIDAD';
            btnValidate.style.background = 'linear-gradient(135deg, #ff9800, #ff5722)';
        }
    }

    async manejarRegistro() {
        const btnCrear = document.getElementById('btn-register-submit');
        const textoOriginal = btnCrear.innerHTML;
        btnCrear.disabled = true;
        btnCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
        
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        const successDiv = document.getElementById('register-success');
        
        if (!username || !email || !password) {
            this.mostrarMensaje('Por favor, completa todos los campos', errorDiv);
            btnCrear.disabled = false;
            btnCrear.innerHTML = textoOriginal;
            return;
        }
        
        if (password.length < 6) {
            this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', errorDiv);
            btnCrear.disabled = false;
            btnCrear.innerHTML = textoOriginal;
            return;
        }
        
        try {
            // ← PRIMERO verificar si YA existe usuario con ese email
            try {
                const { data: { session } } = await this.supabase.auth.getSession();
                if (session) {
                    this.mostrarMensaje('⚠️ Ya hay una sesión activa con otro usuario', errorDiv);
                    return;
                }
            } catch (e) {
                // Ignorar error de verificación
            }
            
            // ← SOLO SI pasa la verificación, registrar
            console.log('✅ Creando usuario:', email);
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
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
                    this.mostrarMensaje('Este correo ya está registrado', errorDiv);
                    return;
                }
                throw authError;
            }
            
            console.log('✅ Usuario creado en Auth:', authData.user?.id);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // ← AHORA crear la escudería
            console.log('🏎️ Creando escudería:', username);
            const { data: nuevaEscuderia, error: escError } = await this.supabase
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
                
                if (escError.message.includes('escuderias_nombre_key') || 
                    escError.message.includes('duplicate')) {
                    this.mostrarMensaje('❌ Ya existe una escudería con ese nombre (el usuario se creó)', errorDiv);
                }
                throw escError;
            }
            
            console.log('✅ Escudería creada:', nuevaEscuderia.id);
            
            // Crear stats del coche
            await this.supabase
                .from('coches_stats')
                .insert([{ escuderia_id: nuevaEscuderia.id }]);
            
            this.mostrarMensaje('✅ ¡Cuenta creada! Revisa tu correo para confirmarla.', successDiv);
            
            setTimeout(() => this.mostrarPantallaLogin(), 3000);
            
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
            
            this.mostrarMensaje(mensajeError, errorDiv);
            
        } finally {
            // ← SIEMPRE restaurar botón
            btnCrear.disabled = false;
            btnCrear.innerHTML = textoOriginal;
        }
    }

    async manejarLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const successDiv = document.getElementById('login-success');
        
        if (!email || !password) {
            this.mostrarMensaje('Por favor, completa todos los campos', errorDiv);
            return;
        }
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.mostrarMensaje('✅ Sesión iniciada correctamente', successDiv);
            
            // Recargar la aplicación
            setTimeout(() => location.reload(), 1000);
            
        } catch (error) {
            console.error('Error en login:', error);
            this.mostrarMensaje('Usuario o contraseña incorrectos', errorDiv);
        }
    }

    // ========================
    // 8. UTILIDADES
    // ========================
    mostrarMensaje(mensaje, elemento) {
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.classList.add('show');
            setTimeout(() => elemento.classList.remove('show'), 5000);
        }
    }

    async cerrarSesion() {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
                console.log('✅ Sesión cerrada');
            }
            window.location.href = window.location.origin;
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            window.location.href = window.location.origin;
        }
    }

    // ========================
    // 9. ESPERAR SUPABASE (para main.js)
    // ========================
    async esperarSupabase() {
        console.log('⏳ Esperando Supabase y sesión de autenticación...');
        let intentos = 0;
        const maxIntentos = 50;
    
        while (intentos < maxIntentos) {
            if (window.supabase && window.supabase.auth) {
                try {
                    const { data: { session } } = await window.supabase.auth.getSession();
                    if (session) {
                        console.log('✅ Supabase y sesión de auth listos después de ' + (intentos * 100) + 'ms');
                        return window.supabase;
                    } else {
                        console.log('⚠️ Cliente Supabase listo, pero no hay sesión de usuario activa aún.');
                    }
                } catch (authError) {
                    console.warn('⚠️ Error al verificar la sesión:', authError);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            intentos++;
        }
        console.error('❌ Supabase nunca se inicializó correctamente con una sesión de usuario.');
        return null;
    }
}

// ========================
// 10. CREAR INSTANCIA GLOBAL
// ========================
window.authManager = new AuthManager();

// ========================
// 11. INICIAR AUTOMÁTICAMENTE
// ========================
console.log('🔐 AuthManager listo. Iniciando autenticación...');

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager.iniciarAplicacion();
    });
} else {
    window.authManager.iniciarAplicacion();
}
