// ========================
// MAIN.JS - SISTEMA COMPLETO
// ========================
console.log('🏎️ F1 Manager - Sistema principal cargado');

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
            this.showAuthModal();
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
        
        // 6. Ocultar loading
        this.hideLoading();
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
    
    showAuthModal() {
        // Ocultar loading
        this.hideLoading();
        
        // Mostrar modal de autenticación
        const authHTML = `
            <div class="auth-modal">
                <div class="auth-content">
                    <h2>🏎️ F1 MANAGER E-STRATEGY</h2>
                    <p>¡Bienvenido al juego de gestión de F1!</p>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Iniciar Sesión</button>
                        <button class="auth-tab" data-tab="register">Registrarse</button>
                    </div>
                    
                    <div class="auth-form" id="login-form">
                        <input type="email" id="login-email" placeholder="Correo electrónico">
                        <input type="password" id="login-password" placeholder="Contraseña">
                        <button class="btn-primary" id="btn-login">Entrar</button>
                    </div>
                    
                    <div class="auth-form hidden" id="register-form">
                        <input type="text" id="register-username" placeholder="Nombre de usuario">
                        <input type="email" id="register-email" placeholder="Correo electrónico">
                        <input type="password" id="register-password" placeholder="Contraseña">
                        <button class="btn-primary" id="btn-register">Crear Cuenta</button>
                    </div>
                    
                    <p class="auth-note">O inicia en modo demo:</p>
                    <button class="btn-secondary" id="btn-demo">🎮 Modo Demo</button>
                </div>
            </div>
        `;
        
        document.body.innerHTML += authHTML;
        this.setupAuthEvents();
    }
    
    setupAuthEvents() {
        // Tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
                
                e.target.classList.add('active');
                const tabId = e.target.dataset.tab;
                document.getElementById(`${tabId}-form`).classList.remove('hidden');
            });
        });
        
        // Login
        document.getElementById('btn-login')?.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            await this.login(email, password);
        });
        
        // Registro
        document.getElementById('btn-register')?.addEventListener('click', async () => {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
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
            document.querySelector('.auth-modal').remove();
            this.init();
            
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
                    data: { username }
                }
            });
            
            if (authError) throw authError;
            
            // 2. Crear perfil en la tabla users
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
            
            this.user = authData.user;
            this.showNotification('✅ ¡Cuenta creada! Inicia el tutorial.', 'success');
            document.querySelector('.auth-modal').remove();
            this.startTutorial();
            
        } catch (error) {
            this.showNotification(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    startDemoMode() {
        this.user = {
            id: 'demo-user-' + Date.now(),
            email: 'demo@f1manager.com',
            username: 'DemoPlayer'
        };
        
        this.showNotification('🎮 Modo demo activado', 'info');
        document.querySelector('.auth-modal')?.remove();
        this.startTutorial();
    }
    
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
        
        this.showTutorialStep(tutorialSteps[0]);
        this.setupTutorialEvents(tutorialSteps);
    }
    
    showTutorialStep(step) {
        const tutorialHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-content">
                    <div class="tutorial-header">
                        <h2>${step.title}</h2>
                        <span class="tutorial-step">${this.currentStep + 1}/5</span>
                    </div>
                    
                    <div class="tutorial-body">
                        ${step.content}
                        
                        ${step.input ? `
                            <div class="tutorial-inputs">
                                <input type="text" id="escuderia-nombre-input" placeholder="Nombre de tu escudería" maxlength="20">
                                
                                <div class="color-picker">
                                    <label>Color principal:</label>
                                    <input type="color" id="color-principal" value="#e10600">
                                </div>
                                
                                <div class="color-picker">
                                    <label>Color secundario:</label>
                                    <input type="color" id="color-secundario" value="#ffffff">
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="tutorial-footer">
                        ${this.currentStep > 0 ? `
                            <button class="btn-secondary" id="tutorial-prev">← Anterior</button>
                        ` : ''}
                        
                        <button class="btn-primary" id="tutorial-next">
                            ${step.action} →
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover tutorial anterior
        document.querySelector('.tutorial-modal')?.remove();
        document.body.innerHTML += tutorialHTML;
    }
    
    setupTutorialEvents(steps) {
        // Botón siguiente
        document.getElementById('tutorial-next')?.addEventListener('click', () => {
            this.currentStep++;
            
            if (this.currentStep < steps.length) {
                this.showTutorialStep(steps[this.currentStep]);
            } else {
                this.completeTutorial();
            }
        });
        
        // Botón anterior
        document.getElementById('tutorial-prev')?.addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.showTutorialStep(steps[this.currentStep]);
            }
        });
    }
    
    async completeTutorial() {
        // 1. Crear escudería en base de datos
        const escuderiaNombre = document.getElementById('escuderia-nombre-input')?.value || 'Mi Escudería';
        const colorPrincipal = document.getElementById('color-principal')?.value || '#e10600';
        const colorSecundario = document.getElementById('color-secundario')?.value || '#ffffff';
        
        try {
            const { data: escuderia, error } = await supabase
                .from('escuderias')
                .insert([
                    {
                        user_id: this.user.id,
                        nombre: escuderiaNombre,
                        dinero: CONFIG.INITIAL_MONEY,
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
            
            // Remover tutorial
            document.querySelector('.tutorial-modal')?.remove();
            
            // Mostrar dashboard
            await this.loadDashboard();
            this.hideLoading();
            
            this.showNotification('🎉 ¡Escudería creada con éxito!', 'success');
            
        } catch (error) {
            console.error('Error creando escudería:', error);
            this.showNotification('❌ Error creando escudería', 'error');
        }
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
    
    async loadDashboard() {
        if (!this.escuderia) return;
        
        // Aquí cargarías todos los datos del dashboard
        console.log('📊 Cargando dashboard para:', this.escuderia.nombre);
        
        // Actualizar UI
        this.updateDashboardUI();
        
        // Cargar pilotos
        await this.loadPilotos();
        
        // Cargar estado del coche
        await this.loadCarStatus();
        
        // Cargar fabricación actual
        await this.loadCurrentProduction();
        
        // Cargar calendario
        await this.loadCalendar();
    }
    
    updateDashboardUI() {
        // Actualizar header
        const nombreEl = document.getElementById('escuderia-nombre');
        const saldoEl = document.getElementById('saldo');
        const puntosEl = document.getElementById('puntos');
        const rankingEl = document.getElementById('ranking');
        
        if (nombreEl) nombreEl.textContent = this.escuderia.nombre;
        if (saldoEl) saldoEl.textContent = this.formatMoney(this.escuderia.dinero);
        if (puntosEl) puntosEl.textContent = this.escuderia.puntos;
        if (rankingEl) rankingEl.textContent = this.escuderia.ranking ? `#${this.escuderia.ranking}` : '#-';
        
        // Aplicar colores
        if (this.escuderia.color_principal) {
            document.documentElement.style.setProperty('--f1-red', this.escuderia.color_principal);
        }
    }
    
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
                    <button class="btn-small" onclick="f1Manager.renovarContrato('${piloto.id}')">
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
        const container = document.getElementById('areas-coche');
        if (!container) return;
        
        let mejorArea = { nombre: 'Ninguna', nivel: -1 };
        let peorArea = { nombre: 'Ninguna', nivel: 11 };
        
        container.innerHTML = CAR_AREAS.map(area => {
            const nivel = stats[`${area.id}_nivel`] || 0;
            const progreso = stats[`${area.id}_progreso`] || 0;
            const porcentaje = (progreso / CONFIG.PIECES_PER_LEVEL) * 100;
            
            // Actualizar mejor/peor área
            if (nivel > mejorArea.nivel) {
                mejorArea = { nombre: area.name, nivel };
            }
            if (nivel < peorArea.nivel) {
                peorArea = { nombre: area.name, nivel };
            }
            
            return `
                <div class="area-item" data-area="${area.id}">
                    <div class="area-icon">
                        <i class="${area.icon}" style="color: ${area.color}"></i>
                    </div>
                    <span class="area-nombre">${area.name}</span>
                    <div class="area-nivel">
                        <span>Nivel</span>
                        <span class="nivel-valor">${nivel}</span>
                    </div>
                    <div class="area-progreso">
                        <span>${progreso}/${CONFIG.PIECES_PER_LEVEL}</span>
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
        const statusEl = document.getElementById('factory-status');
        const progressEl = document.getElementById('production-progress');
        const timeEl = document.getElementById('time-left');
        const collectBtn = document.getElementById('btn-recoger-pieza');
        
        if (!production) {
            if (statusEl) statusEl.innerHTML = '<p><i class="fas fa-industry"></i> No hay producción en curso</p>';
            if (progressEl) progressEl.style.width = '0%';
            if (timeEl) timeEl.textContent = '';
            if (collectBtn) collectBtn.disabled = true;
            return;
        }
        
        const area = CAR_AREAS.find(a => a.id === production.area);
        const areaName = area ? area.name : production.area;
        
        if (statusEl) {
            statusEl.innerHTML = `<p><i class="fas fa-industry"></i> Fabricando: <strong>${areaName} Nivel ${production.nivel}</strong></p>`;
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
                timeEl.textContent = '¡Listo para recoger!';
                if (collectBtn) collectBtn.disabled = false;
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                timeEl.textContent = `Tiempo restante: ${hours}h ${minutes}m`;
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
            container.innerHTML = '<p>No hay carreras programadas</p>';
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
    
    // ===== ACCIONES =====
    
    async iniciarFabricacion(areaId) {
        if (!this.escuderia || this.escuderia.dinero < CONFIG.PIECE_COST) {
            this.showNotification('❌ Fondos insuficientes', 'error');
            return;
        }
        
        try {
            const inicio = new Date();
            const fin = new Date(inicio.getTime() + CONFIG.FABRICATION_TIME);
            
            const { data: production, error } = await supabase
                .from('fabricacion_actual')
                .insert([
                    {
                        escuderia_id: this.escuderia.id,
                        area: areaId,
                        nivel: 1,
                        inicio_fabricacion: inicio.toISOString(),
                        fin_fabricacion: fin.toISOString(),
                        completada: false,
                        costo: CONFIG.PIECE_COST
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
            
            // Descontar dinero
            this.escuderia.dinero -= CONFIG.PIECE_COST;
            await this.updateEscuderiaMoney();
            
            this.showNotification(`🏭 Fabricación de ${CAR_AREAS.find(a => a.id === areaId)?.name || areaId} iniciada`, 'success');
            this.updateFactoryUI(production);
            
        } catch (error) {
            console.error('Error iniciando fabricación:', error);
            this.showNotification('❌ Error al iniciar fabricación', 'error');
        }
    }
    
    async updateEscuderiaMoney() {
        try {
            const { error } = await supabase
                .from('escuderias')
                .update({ dinero: this.escuderia.dinero })
                .eq('id', this.escuderia.id);
            
            if (error) throw error;
            
            this.updateDashboardUI();
            
        } catch (error) {
            console.error('Error actualizando dinero:', error);
        }
    }
    
    // ===== UTILIDADES =====
    
    formatMoney(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
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
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);
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
        }, 1000);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.f1Manager = new F1Manager();
});
