// ========================
// notificaciones.js - Sistema de Notificaciones
// ========================
console.log('🔔 Cargando sistema de notificaciones...');

class NotificacionesManager {
    constructor() {
        this.intervalo = null;
        this.notificacionesNoLeidas = 0;
        this.panelAbierto = false;
    }

    // Inicializar el sistema
    inicializar() {
        this.crearIconoNotificaciones();
        this.cargarContadorNoLeidas();
        this.iniciarPolling();
        this.configurarEventos();
    }

    // Crear el icono en el header
    crearIconoNotificaciones() {
        // Buscar donde insertar el icono (al lado de las estrellas)
        const estrellasDisplay = document.querySelector('.estrellas-display-compacto');
        if (!estrellasDisplay) return;

        const contenedor = document.createElement('div');
        contenedor.id = 'notificaciones-icono';
        contenedor.style.cssText = `
            position: relative;
            margin-left: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
        `;
        contenedor.innerHTML = `
            <i class="fas fa-bell" style="color: #888; font-size: 1.2rem;"></i>
            <span id="notificaciones-contador" style="
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e10600;
                color: white;
                font-size: 0.65rem;
                font-weight: bold;
                min-width: 16px;
                height: 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 3px;
                display: none;
            ">0</span>
        `;

        // Insertar después de las estrellas
        estrellasDisplay.parentNode.insertBefore(contenedor, estrellasDisplay.nextSibling);
    }

    // Cargar contador de notificaciones no leídas
    async cargarContadorNoLeidas() {
        if (!window.f1Manager?.user?.id) return;

        try {
            const { count, error } = await supabase
                .from('notificaciones_usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', window.f1Manager.user.id)
                .eq('leida', false);

            if (!error) {
                this.notificacionesNoLeidas = count || 0;
                this.actualizarContadorUI();
            }
        } catch (error) {
            console.error('Error cargando contador:', error);
        }
    }

    // Actualizar el número en el icono
    actualizarContadorUI() {
        const contador = document.getElementById('notificaciones-contador');
        if (!contador) return;

        if (this.notificacionesNoLeidas > 0) {
            contador.textContent = this.notificacionesNoLeidas > 99 ? '99+' : this.notificacionesNoLeidas;
            contador.style.display = 'flex';
            
            // Animación si hay nuevas
            const icono = document.querySelector('#notificaciones-icono i');
            if (icono) {
                icono.style.color = '#00d2be';
                icono.style.animation = 'none';
                icono.offsetHeight;
                icono.style.animation = 'campana 0.5s ease';
            }
        } else {
            contador.style.display = 'none';
            const icono = document.querySelector('#notificaciones-icono i');
            if (icono) icono.style.color = '#888';
        }
    }

    // Iniciar polling cada 30 segundos
    iniciarPolling() {
        this.intervalo = setInterval(() => {
            this.cargarContadorNoLeidas();
        }, 30000);
    }

    // Configurar eventos
    configurarEventos() {
        document.addEventListener('click', (e) => {
            const icono = document.getElementById('notificaciones-icono');
            const panel = document.getElementById('panel-notificaciones');

            if (icono?.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                this.abrirPanel();
            } else if (panel && !panel.contains(e.target)) {
                this.cerrarPanel();
            }
        });
    }

    // Abrir panel de notificaciones
    async abrirPanel() {
        if (this.panelAbierto) {
            this.cerrarPanel();
            return;
        }

        let panel = document.getElementById('panel-notificaciones');
        if (panel) {
            panel.remove();
        }

        panel = document.createElement('div');
        panel.id = 'panel-notificaciones';
        panel.innerHTML = '<div class="notificaciones-loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
        
        document.body.appendChild(panel);
        this.posicionarPanel();
        this.panelAbierto = true;

        await this.cargarNotificaciones();
    }

    // Posicionar el panel debajo del icono
    posicionarPanel() {
        const icono = document.getElementById('notificaciones-icono');
        const panel = document.getElementById('panel-notificaciones');
        if (!icono || !panel) return;

        const rect = icono.getBoundingClientRect();
        panel.style.top = (rect.bottom + 10) + 'px';
        panel.style.right = (window.innerWidth - rect.right) + 'px';
    }

    // Cargar notificaciones
    async cargarNotificaciones() {
        if (!window.f1Manager?.user?.id) return;

        try {
            const { data, error } = await supabase
                .from('notificaciones_usuarios')
                .select('*')
                .eq('usuario_id', window.f1Manager.user.id)
                .order('fecha_creacion', { ascending: false })
                .limit(20);

            if (error) throw error;

            this.renderizarNotificaciones(data || []);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            this.renderizarError();
        }
    }

    // Renderizar lista de notificaciones
    renderizarNotificaciones(notificaciones) {
        const panel = document.getElementById('panel-notificaciones');
        if (!panel) return;

        if (notificaciones.length === 0) {
            panel.innerHTML = `
                <div class="notificaciones-vacio">
                    <i class="fas fa-bell-slash"></i>
                    <p>No tienes notificaciones</p>
                </div>
            `;
            return;
        }

        let html = '<div class="notificaciones-lista">';
        
        notificaciones.forEach(notif => {
            const fecha = new Date(notif.fecha_creacion).toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
            });

            html += `
                <div class="notificacion-item ${!notif.leida ? 'no-leida' : ''}" 
                     data-id="${notif.id}"
                     data-tipo="${notif.tipo}"
                     data-relacion="${notif.relacion_id || ''}"
                     data-tipo-relacion="${notif.tipo_relacion || ''}">
                    <div class="notificacion-icono">${this.getIconoPorTipo(notif.tipo)}</div>
                    <div class="notificacion-contenido">
                        <div class="notificacion-titulo">${notif.titulo}</div>
                        <div class="notificacion-mensaje">${notif.mensaje}</div>
                        <div class="notificacion-fecha">${fecha}</div>
                    </div>
                    ${!notif.leida ? '<div class="notificacion-no-leida-punto"></div>' : ''}
                </div>
            `;
        });

        html += '</div>';
        
        // Botón de marcar todas como leídas
        if (this.notificacionesNoLeidas > 0) {
            html += `
                <div class="notificaciones-footer">
                    <button class="btn-marcar-todas" onclick="window.notificacionesManager.marcarTodasLeidas()">
                        <i class="fas fa-check-double"></i> Marcar todas como leídas
                    </button>
                </div>
            `;
        }

        panel.innerHTML = html;

        // Añadir eventos a cada notificación
        document.querySelectorAll('.notificacion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const tipo = item.dataset.tipo;
                const relacionId = item.dataset.relacion;
                const tipoRelacion = item.dataset.tipoRelacion;
                
                this.marcarComoLeida(id);
                this.accionPorTipo(tipo, relacionId, tipoRelacion);
            });
        });
    }

    // Obtener icono según tipo
    getIconoPorTipo(tipo) {
        const iconos = {
            'pronostico': '📊',
            'venta': '💰',
            'grupo_invitacion': '👥',
            'grupo_aceptada': '✅',
            'mensaje': '💬',
            'desgaste': '⚠️',
            'presupuesto': '📅',
            'default': '📌'
        };
        return iconos[tipo] || iconos.default;
    }

    // Acción al hacer clic según tipo
    accionPorTipo(tipo, relacionId, tipoRelacion) {
        switch(tipo) {
            case 'pronostico':
                if (window.tabManager) window.tabManager.switchTab('pronosticos');
                break;
            case 'venta':
                if (window.tabManager) window.tabManager.switchTab('mercado');
                break;
            case 'grupo_invitacion':
            case 'grupo_aceptada':
                if (window.perfilManager) window.perfilManager.mostrarPerfil();
                break;
            case 'mensaje':
                if (window.perfilManager) window.perfilManager.mostrarPerfil();
                break;
            case 'desgaste':
                if (window.tabManager) window.tabManager.switchTab('almacen');
                break;
            case 'presupuesto':
                if (window.tabManager) window.tabManager.switchTab('presupuesto');
                break;
        }
    }

    // Marcar como leída
    async marcarComoLeida(notificacionId) {
        try {
            await supabase
                .from('notificaciones_usuarios')
                .update({ 
                    leida: true,
                    fecha_leida: new Date().toISOString()
                })
                .eq('id', notificacionId);

            this.notificacionesNoLeidas = Math.max(0, this.notificacionesNoLeidas - 1);
            this.actualizarContadorUI();

            // Actualizar UI del item
            const item = document.querySelector(`.notificacion-item[data-id="${notificacionId}"]`);
            if (item) {
                item.classList.remove('no-leida');
                const punto = item.querySelector('.notificacion-no-leida-punto');
                if (punto) punto.remove();
            }
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    }

    // Marcar todas como leídas
    async marcarTodasLeidas() {
        if (!window.f1Manager?.user?.id) return;

        try {
            await supabase
                .from('notificaciones_usuarios')
                .update({ 
                    leida: true,
                    fecha_leida: new Date().toISOString()
                })
                .eq('usuario_id', window.f1Manager.user.id)
                .eq('leida', false);

            this.notificacionesNoLeidas = 0;
            this.actualizarContadorUI();

            // Actualizar UI
            document.querySelectorAll('.notificacion-item').forEach(item => {
                item.classList.remove('no-leida');
                const punto = item.querySelector('.notificacion-no-leida-punto');
                if (punto) punto.remove();
            });

            // Quitar botón
            const footer = document.querySelector('.notificaciones-footer');
            if (footer) footer.remove();

        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    }

    // Cerrar panel
    cerrarPanel() {
        const panel = document.getElementById('panel-notificaciones');
        if (panel) {
            panel.remove();
        }
        this.panelAbierto = false;
    }

    // Renderizar error
    renderizarError() {
        const panel = document.getElementById('panel-notificaciones');
        if (panel) {
            panel.innerHTML = `
                <div class="notificaciones-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar notificaciones</p>
                    <button onclick="window.notificacionesManager.cargarNotificaciones()">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    // ============================================
    // FUNCIONES PARA CREAR NOTIFICACIONES
    // ============================================

    async crearNotificacion(usuarioId, tipo, titulo, mensaje, relacionId = null, tipoRelacion = null) {
        try {
            const { error } = await supabase
                .from('notificaciones_usuarios')
                .insert([{
                    usuario_id: usuarioId,
                    tipo: tipo,
                    titulo: titulo,
                    mensaje: mensaje,
                    relacion_id: relacionId,
                    tipo_relacion: tipoRelacion,
                    leida: false,
                    fecha_creacion: new Date().toISOString()
                }]);

            if (!error && usuarioId === window.f1Manager?.user?.id) {
                this.notificacionesNoLeidas++;
                this.actualizarContadorUI();
            }

            return !error;
        } catch (error) {
            console.error('Error creando notificación:', error);
            return false;
        }
    }

    // Notificación de pronóstico acertado
    async notificarPronosticoAcertado(usuarioId, gpNombre, puntos) {
        return this.crearNotificacion(
            usuarioId,
            'pronostico',
            '🎯 Pronóstico acertado',
            `Acertaste en ${gpNombre} y ganaste ${puntos} puntos`,
            null,
            null
        );
    }

    // Notificación de venta en mercado
    async notificarVentaRealizada(usuarioId, piezaNombre, precio, compradorNombre) {
        return this.crearNotificacion(
            usuarioId,
            'venta',
            '💰 Pieza vendida',
            `${piezaNombre} vendida a ${compradorNombre} por €${precio.toLocaleString()}`,
            null,
            'mercado'
        );
    }

    // Notificación de compra en mercado
    async notificarCompraRealizada(usuarioId, piezaNombre, precio, vendedorNombre) {
        return this.crearNotificacion(
            usuarioId,
            'compra',
            '🛒 Pieza comprada',
            `Compraste ${piezaNombre} a ${vendedorNombre} por €${precio.toLocaleString()}`,
            null,
            'mercado'
        );
    }

    // Notificación de invitación a grupo
    async notificarInvitacionGrupo(usuarioId, grupoNombre, invitadorNombre, grupoId) {
        return this.crearNotificacion(
            usuarioId,
            'grupo_invitacion',
            '👥 Invitación a grupo',
            `${invitadorNombre} te ha invitado a unirte a "${grupoNombre}"`,
            grupoId,
            'grupo'
        );
    }

    // Notificación de aceptación de invitación
    async notificarAceptacionGrupo(usuarioId, grupoNombre, nuevoMiembroNombre, grupoId) {
        return this.crearNotificacion(
            usuarioId,
            'grupo_aceptada',
            '✅ Nuevo miembro en el grupo',
            `${nuevoMiembroNombre} se ha unido a "${grupoNombre}"`,
            grupoId,
            'grupo'
        );
    }

    // Notificación de mensaje de chat
    async notificarMensaje(usuarioId, remitenteNombre, mensajePreview, chatId) {
        return this.crearNotificacion(
            usuarioId,
            'mensaje',
            `💬 Mensaje de ${remitenteNombre}`,
            mensajePreview,
            chatId,
            'chat'
        );
    }

    // Notificación de pieza destruida
    async notificarPiezaDestruida(usuarioId, piezaNombre, areaNombre) {
        return this.crearNotificacion(
            usuarioId,
            'desgaste',
            '⚠️ Pieza destruida',
            `Tu ${piezaNombre} (${areaNombre}) ha llegado al 0% de desgaste y se ha destruido`,
            null,
            'almacen'
        );
    }

    // Notificación de presupuesto semanal
    async notificarPresupuestoSemanal(usuarioId, estrellas, dineroGanado) {
        return this.crearNotificacion(
            usuarioId,
            'presupuesto',
            '📅 Pago semanal recibido',
            `Tus ${estrellas}🌟 se convirtieron en €${dineroGanado.toLocaleString()}`,
            null,
            'presupuesto'
        );
    }
}

// ============================================
// ESTILOS CSS
// ============================================
const notificacionesStyles = `
    @keyframes campana {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(15deg); }
        50% { transform: rotate(-15deg); }
        75% { transform: rotate(7deg); }
        100% { transform: rotate(0deg); }
    }

    #panel-notificaciones {
        position: fixed;
        width: 350px;
        max-width: calc(100vw - 30px);
        max-height: 500px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #00d2be;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        z-index: 2147483646;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .notificaciones-loading, .notificaciones-vacio, .notificaciones-error {
        padding: 40px 20px;
        text-align: center;
        color: #888;
    }

    .notificaciones-loading i, .notificaciones-vacio i, .notificaciones-error i {
        font-size: 2rem;
        margin-bottom: 10px;
        color: #00d2be;
    }

    .notificaciones-lista {
        overflow-y: auto;
        max-height: 450px;
    }

    .notificacion-item {
        padding: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        display: flex;
        gap: 12px;
        transition: background 0.2s;
        position: relative;
    }

    .notificacion-item:hover {
        background: rgba(0, 210, 190, 0.1);
    }

    .notificacion-item.no-leida {
        background: rgba(0, 210, 190, 0.05);
    }

    .notificacion-icono {
        width: 35px;
        height: 35px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }

    .notificacion-contenido {
        flex: 1;
    }

    .notificacion-titulo {
        font-weight: bold;
        color: #00d2be;
        font-size: 0.9rem;
        margin-bottom: 3px;
    }

    .notificacion-mensaje {
        color: white;
        font-size: 0.8rem;
        margin-bottom: 5px;
        line-height: 1.3;
    }

    .notificacion-fecha {
        color: #888;
        font-size: 0.65rem;
    }

    .notificacion-no-leida-punto {
        width: 8px;
        height: 8px;
        background: #00d2be;
        border-radius: 50%;
        position: absolute;
        top: 15px;
        right: 15px;
    }

    .notificaciones-footer {
        padding: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
    }

    .btn-marcar-todas {
        background: transparent;
        border: 1px solid #00d2be;
        color: #00d2be;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
        width: 100%;
    }

    .btn-marcar-todas:hover {
        background: #00d2be;
        color: black;
    }

    .notificaciones-error button {
        margin-top: 10px;
        padding: 5px 15px;
        background: #00d2be;
        border: none;
        color: black;
        border-radius: 4px;
        cursor: pointer;
    }

    @media (max-width: 768px) {
        #panel-notificaciones {
            width: 300px;
            right: 10px !important;
        }
    }
`;

// Añadir estilos al head
// Añadir estilos al head (con nombre único)
if (!document.getElementById('estilos-notificaciones')) {
    const styleNotif = document.createElement('style');
    styleNotif.id = 'estilos-notificaciones';
    styleNotif.textContent = notificacionesStyles;
    document.head.appendChild(styleNotif);
}

// ============================================
// EXPORTAR E INICIALIZAR
// ============================================
window.NotificacionesManager = NotificacionesManager;

// Inicializar cuando el f1Manager esté listo
document.addEventListener('auth-completado', () => {
    setTimeout(() => {
        if (!window.notificacionesManager) {
            window.notificacionesManager = new NotificacionesManager();
            window.notificacionesManager.inicializar();
            console.log('✅ Sistema de notificaciones inicializado');
        }
    }, 3000);
});
