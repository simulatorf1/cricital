// ========================
// AUTH.JS - Sistema de Autenticación
// ========================
console.log('🔐 Sistema de autenticación cargado');

class AuthManager {
    constructor() {
        this.user = null;
        this.escuderia = null;
        this.init();
    }
    
    async init() {
        console.log('🔧 Inicializando autenticación...');
        
        // Verificar si hay sesión activa
        await this.checkSession();
        
        // Configurar eventos
        this.setupAuthEvents();
    }
    
    async checkSession() {
        try {
            // Verificar en localStorage
            const userData = localStorage.getItem('f1_user');
            const escuderiaData = localStorage.getItem('f1_escuderia');
            
            if (userData && escuderiaData) {
                this.user = JSON.parse(userData);
                this.escuderia = JSON.parse(escuderiaData);
                
                console.log('✅ Sesión encontrada:', this.user.username);
                
                // Actualizar UI
                this.updateUserUI();
                
                // Notificar a otros módulos
                if (window.f1Manager) {
                    window.f1Manager.user = this.user;
                    window.f1Manager.escuderia = this.escuderia;
                }
                
                // Ocultar modal de login si existe
                const authModal = document.getElementById('auth-modal');
                if (authModal) authModal.style.display = 'none';
                
                return true;
            }
            
            // Mostrar modal de login
            this.showAuthModal();
            return false;
            
        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            this.showAuthModal();
            return false;
        }
    }
    
    showAuthModal() {
        // Crear modal si no existe
        if (!document.getElementById('auth-modal')) {
            const modalHTML = `
                <div class="auth-modal" id="auth-modal">
                    <div class="auth-content">
                        <h2><i class="fas fa-flag-checkered"></i> F1 Manager</h2>
                        <p>Inicia sesión para comenzar</p>
                        
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-tab="login">Iniciar Sesión</button>
                            <button class="auth-tab" data-tab="register">Registrarse</button>
                        </div>
                        
                        <!-- Formulario Login -->
                        <div class="auth-form" id="login-form">
                            <input type="text" id="login-username" placeholder="Usuario" required>
                            <input type="password" id="login-password" placeholder="Contraseña" required>
                            <button class="btn-primary" id="btn-login">
                                <i class="fas fa-sign-in-alt"></i> Ingresar
                            </button>
                        </div>
                        
                        <!-- Formulario Registro -->
                        <div class="auth-form hidden" id="register-form">
                            <input type="text" id="register-username" placeholder="Nombre de usuario" required>
                            <input type="email" id="register-email" placeholder="Email" required>
                            <input type="password" id="register-password" placeholder="Contraseña" required>
                            <input type="text" id="register-teamname" placeholder="Nombre de tu escudería" required>
                            <button class="btn-primary" id="btn-register">
                                <i class="fas fa-user-plus"></i> Crear Cuenta
                            </button>
                        </div>
                        
                        <p class="auth-note">Usa "demo / demo123" para probar</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }
    
    setupAuthEvents() {
        // Tabs de login/registro
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-tab')) {
                const tab = e.target.dataset.tab;
                this.switchAuthTab(tab);
            }
        });
        
        // Botón login
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-login' || e.target.closest('#btn-login')) {
                this.handleLogin();
            }
        });
        
        // Botón registro
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-register' || e.target.closest('#btn-register')) {
                this.handleRegister();
            }
        });
    }
    
    switchAuthTab(tab) {
        // Actualizar tabs
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        // Mostrar formulario correspondiente
        document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
    }
    
    async handleLogin() {
        const username = document.getElementById('login-username')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (!username || !password) {
            this.showNotification('❌ Completa todos los campos', 'error');
            return;
        }
        
        try {
            // SIMULACIÓN - En producción usarías Supabase Auth
            // Por ahora usaremos un usuario demo
            if (username === 'demo' && password === 'demo123') {
                this.user = {
                    id: 'demo-user-id',
                    username: 'Demo User',
                    email: 'demo@f1manager.com',
                    avatar_url: null
                };
                
                this.escuderia = {
                    id: 'demo-escuderia-id',
                    nombre: 'Escudería Demo',
                    user_id: 'demo-user-id',
                    dinero: 5000000,
                    puntos: 0,
                    ranking: 999,
                    nivel_ingenieria: 1
                };
                
                // Guardar en localStorage
                localStorage.setItem('f1_user', JSON.stringify(this.user));
                localStorage.setItem('f1_escuderia', JSON.stringify(this.escuderia));
                
                // Ocultar modal
                document.getElementById('auth-modal').style.display = 'none';
                
                // Actualizar UI
                this.updateUserUI();
                
                // Notificar a f1Manager
                if (window.f1Manager) {
                    window.f1Manager.user = this.user;
                    window.f1Manager.escuderia = this.escuderia;
                    window.f1Manager.initGame();
                }
                
                this.showNotification('✅ ¡Bienvenido a F1 Manager!', 'success');
                
            } else {
                this.showNotification('❌ Usuario o contraseña incorrectos', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification('❌ Error al iniciar sesión', 'error');
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('register-username')?.value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password')?.value;
        const teamname = document.getElementById('register-teamname')?.value;
        
        if (!username || !email || !password || !teamname) {
            this.showNotification('❌ Completa todos los campos', 'error');
            return;
        }
        
        this.showNotification('⚠️ Registro temporalmente deshabilitado. Usa "demo / demo123"', 'warning');
    }
    
    updateUserUI() {
        // Actualizar nombre en header
        const escuderiaNombre = document.getElementById('escuderia-nombre');
        const usernameSpan = document.getElementById('username-display');
        
        if (escuderiaNombre && this.escuderia) {
            escuderiaNombre.textContent = this.escuderia.nombre;
        }
        
        if (usernameSpan && this.user) {
            usernameSpan.textContent = this.user.username;
        }
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    logout() {
        localStorage.removeItem('f1_user');
        localStorage.removeItem('f1_escuderia');
        this.user = null;
        this.escuderia = null;
        
        // Recargar página
        location.reload();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

console.log('✅ Sistema de autenticación listo');
