// F1 MANAGER - LÓGICA PRINCIPAL
console.log('🏎️ F1 Manager - Iniciando...');

// Clase principal
class F1Manager {
    constructor() {
        this.user = null;
        this.escuderia = null;
        this.isLoading = true;
        this.timers = {};
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Inicializando aplicación...');
        
        // 1. Configurar eventos
        this.setupEventListeners();
        
        // 2. Verificar autenticación
        await this.checkAuth();
        
        // 3. Cargar datos iniciales
        await this.loadInitialData();
        
        // 4. Ocultar loading y mostrar app
        this.hideLoading();
        
        console.log('✅ Aplicación lista');
    }
    
    setupEventListeners() {
        console.log('🔗 Configurando eventos...');
        
        // Botón iniciar fabricación
        const fabBtn = document.getElementById('btn-iniciar-fab');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => this.startFabrication());
        }
        
        // Botón apostar
        const betBtn = document.getElementById('btn-apostar');
        if (betBtn) {
            betBtn.addEventListener('click', () => this.placeBet());
        }
        
        // Botón recoger pieza
        const collectBtn = document.getElementById('btn-recoger-pieza');
        if (collectBtn) {
            collectBtn.addEventListener('click', () => this.collectPiece());
        }
        
        // Botón tutorial
        const tutorialBtn = document.getElementById('btn-tutorial');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => this.showTutorial());
        }
    }
    
    async checkAuth() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.warn('⚠️ No autenticado:', error.message);
                this.user = { id: 'demo-user', email: 'demo@f1manager.com' };
            } else if (user) {
                this.user = user;
                console.log('👤 Usuario:', user.email);
            } else {
                this.user = { id: 'demo-user', email: 'demo@f1manager.com' };
            }
            
        } catch (error) {
            console.error('❌ Error auth:', error);
            this.user = { id: 'demo-user', email: 'demo@f1manager.com' };
        }
    }
    
    async loadInitialData() {
        console.log('📥 Cargando datos iniciales...');
        
        // Intentar cargar escudería
        await this.loadEscuderia();
        
        // Actualizar UI
        this.updateUI();
        
        // Iniciar timers
        this.startTimers();
    }
    
    async loadEscuderia() {
        if (!this.user) return;
        
        try {
            // Buscar escudería existente
            const { data: escuderias, error } = await supabase
                .from('escuderias')
                .select('*')
                .eq('user_id', this.user.id)
                .limit(1);
            
            if (error) {
                console.warn('⚠️ Error cargando escudería:', error.message);
                this.createDemoEscuderia();
                return;
            }
            
            if (escuderias && escuderias.length > 0) {
                this.escuderia = escuderias[0];
                console.log('🏎️ Escudería cargada:', this.escuderia.nombre);
            } else {
                this.createDemoEscuderia();
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.createDemoEscuderia();
        }
    }
    
    createDemoEscuderia() {
        this.escuderia = {
            id: 'demo-' + Date.now(),
            nombre: 'Mi Escudería F1',
            dinero: CONFIG.INITIAL_MONEY,
            puntos: 0,
            ranking: 1,
            nivel_ingenieria: 1
        };
        console.log('🎮 Escudería demo creada');
    }
    
    updateUI() {
        if (!this.escuderia) return;
        
        // Actualizar header
        const nombreEl = document.getElementById('escuderia-nombre');
        const saldoEl = document.getElementById('saldo');
        const puntosEl = document.getElementById('puntos');
        const rankingEl = document.getElementById('ranking');
        
        if (nombreEl) nombreEl.textContent = this.escuderia.nombre;
        if (saldoEl) saldoEl.textContent = formatMoney(this.escuderia.dinero);
        if (puntosEl) puntosEl.textContent = this.escuderia.puntos;
        if (rankingEl) rankingEl.textContent = this.escuderia.ranking || '#1';
        
        // Actualizar countdown
        this.updateCountdown();
        
        // Actualizar fabricación
        this.updateFactoryStatus();
    }
    
    updateCountdown() {
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');
        
        if (!hoursEl || !minutesEl || !secondsEl) return;
        
        // Simular cuenta regresiva para jueves 23:59
        const update = () => {
            const now = new Date();
            const target = new Date();
            
            // Encontrar próximo jueves
            const daysUntilThursday = (4 - now.getDay() + 7) % 7;
            target.setDate(now.getDate() + (daysUntilThursday || 7));
            target.setHours(23, 59, 0, 0);
            
            const diff = target - now;
            
            if (diff <= 0) {
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            hoursEl.textContent = hours.toString().padStart(2, '0');
            minutesEl.textContent = minutes.toString().padStart(2, '0');
            secondsEl.textContent = seconds.toString().padStart(2, '0');
        };
        
        update();
        this.timers.countdown = setInterval(update, 1000);
    }
    
    updateFactoryStatus() {
        // Estado de ejemplo
        const statusEl = document.getElementById('factory-status');
        const progressEl = document.getElementById('production-progress');
        const timeEl = document.getElementById('time-left');
        
        if (statusEl) statusEl.innerHTML = '<p><i class="fas fa-industry"></i> Sistema de fabricación listo</p>';
        if (progressEl) progressEl.style.width = '0%';
        if (timeEl) timeEl.textContent = 'No hay producción activa';
    }
    
    hideLoading() {
        setTimeout(() => {
            const loading = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    
                    if (app) {
                        app.style.display = 'block';
                        setTimeout(() => {
                            app.style.opacity = '1';
                        }, 10);
                    }
                }, 500);
            }
            
            this.isLoading = false;
            console.log('🚀 Aplicación visible');
            
        }, 2000); // Mostrar loading por 2 segundos
    }
    
    startTimers() {
        // Actualizar datos cada 30 segundos
        this.timers.dataRefresh = setInterval(() => {
            this.updateUI();
        }, 30000);
    }
    
    // ===== ACCIONES =====
    
    startFabrication() {
        if (!this.escuderia || this.escuderia.dinero < CONFIG.PIECE_COST) {
            this.showAlert('❌ Fondos insuficientes', 'error');
            return;
        }
        
        this.showAlert('🏭 Iniciando fabricación...', 'info');
        
        // Simular fabricación
        setTimeout(() => {
            this.escuderia.dinero -= CONFIG.PIECE_COST;
            this.updateUI();
            this.showAlert('✅ Fabricación iniciada (4 horas)', 'success');
            
            // Habilitar botón de recoger después de 5 segundos (simulando)
            setTimeout(() => {
                const collectBtn = document.getElementById('btn-recoger-pieza');
                if (collectBtn) {
                    collectBtn.disabled = false;
                    this.showAlert('🎁 ¡Pieza lista para recoger!', 'success');
                }
            }, 5000);
        }, 1000);
    }
    
    placeBet() {
        this.showAlert('🎲 Apuesta registrada correctamente', 'success');
    }
    
    collectPiece() {
        this.escuderia.dinero += 15000; // Ganancias por pieza
        this.escuderia.puntos += CONFIG.POINTS_PER_PIECE;
        
        const collectBtn = document.getElementById('btn-recoger-pieza');
        if (collectBtn) collectBtn.disabled = true;
        
        this.updateUI();
        this.showAlert(`🎉 +${CONFIG.POINTS_PER_PIECE} puntos y €15,000`, 'success');
    }
    
    showTutorial() {
        const tutorial = `
            <strong>🏎️ TUTORIAL F1 MANAGER</strong><br><br>
            1. <strong>Fábrica piezas</strong> - Mejora tu coche (€10,000 c/u)<br>
            2. <strong>Recoge piezas</strong> - Gana puntos y dinero<br>
            3. <strong>Haz apuestas</strong> - Adivina el top 10<br>
            4. <strong>Sube en el ranking</strong> - Compite globalmente<br><br>
            <em>¡Buena suerte!</em>
        `;
        this.showAlert(tutorial, 'info', 5000);
    }
    
    showAlert(message, type = 'info', duration = 3000) {
        // Crear alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
        
        // Estilos
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00a35c' : type === 'error' ? '#e10600' : '#209cee'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        // Animación
        const style = document.createElement('style');
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
        
        document.body.appendChild(alert);
        
        // Eliminar
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, duration);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM listo - Iniciando F1 Manager');
    window.f1Manager = new F1Manager();
});
