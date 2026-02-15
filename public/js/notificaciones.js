// ========================
// notificaciones.js - Sistema de Notificaciones
// ========================
console.log('🔔 Cargando sistema de notificaciones...');

// Estilos
if (!document.getElementById('estilos-notificaciones')) {
    const style = document.createElement('style');
    style.id = 'estilos-notificaciones';
    style.textContent = `
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
    `;
    document.head.appendChild(style);
}

// Clase principal
class NotificacionesManager {
    constructor() {
        this.notificacionesNoLeidas = 0;
        this.panelAbierto = false;
    }

    // Inicializar
    inicializar() {
        console.log('🔔 Inicializando notificaciones...');
        setTimeout(() => {
            this.crearIcono();
            this.cargarContador();
            this.iniciarPolling();
            this.crearIconoMensajes();
        }, 2000); // Esperar a que cargue el dashboard
    }

    // Crear icono
    crearIcono() {
        const estrellas = document.querySelector('.estrellas-display-compacto');
        if (!estrellas) {
            console.log('❌ No se encontraron las estrellas, reintentando...');
            setTimeout(() => this.crearIcono(), 1000);
            return;
        }

        console.log('✅ Estrellas encontradas, insertando icono');

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

        estrellas.parentNode.insertBefore(contenedor, estrellas.nextSibling);

        // Evento click
        contenedor.onclick = (e) => {
            e.stopPropagation();
            this.abrirPanel();
        };

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.panelAbierto && 
                !e.target.closest('#notificaciones-icono') && 
                !e.target.closest('#panel-notificaciones')) {
                this.cerrarPanel();
            }
        });
    }
    // ========================
    // CREAR ICONO DE MENSAJES
    // ========================
    crearIconoMensajes() {
        const iconoNotis = document.getElementById('notificaciones-icono');
        if (!iconoNotis) {
            console.log('❌ No se encontró icono de notis, reintentando...');
            setTimeout(() => this.crearIconoMensajes(), 1000);
            return;
        }
    
        console.log('✅ Insertando icono de mensajes');
    
        const contenedor = document.createElement('div');
        contenedor.id = 'mensajes-icono';
        contenedor.style.cssText = `
            position: relative;
            margin-left: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
        `;
        contenedor.innerHTML = `
            <i class="fas fa-comment" style="color: #888; font-size: 1.2rem;"></i>
            <span id="mensajes-contador" style="
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
    
        // Insertar DESPUÉS del icono de notificaciones
        iconoNotis.parentNode.insertBefore(contenedor, iconoNotis.nextSibling);
    
        // Evento click
        contenedor.onclick = (e) => {
            e.stopPropagation();
            this.abrirSeccionMensajes();
        };
    }
    
    // ========================
    // ABRIR SECCIÓN DE MENSAJES
    // ========================
    abrirSeccionMensajes() {
        console.log('💬 Abriendo sección de mensajes');
        
        // Ocultar todas las secciones
        document.querySelectorAll('.seccion-juego').forEach(s => s.style.display = 'none');
        
        // Mostrar sección de mensajes (la crearás en el HTML)
        const seccionMensajes = document.getElementById('seccion-mensajes');
        if (seccionMensajes) {
            seccionMensajes.style.display = 'block';
        }
        
        // Cerrar panel de notificaciones si está abierto
        if (this.panelAbierto) {
            this.cerrarPanel();
        }
    }
    // Cargar contador
    async cargarContador() {
        if (!window.f1Manager?.user?.id) return;

        try {
            const { count } = await supabase
                .from('notificaciones_usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', window.f1Manager.user.id)
                .eq('leida', false);

            this.notificacionesNoLeidas = count || 0;
            this.actualizarContadorUI();
        } catch (error) {
            console.error('Error cargando contador:', error);
        }
    }

    // Actualizar UI del contador
    actualizarContadorUI() {
        const contador = document.getElementById('notificaciones-contador');
        if (!contador) return;

        if (this.notificacionesNoLeidas > 0) {
            contador.textContent = this.notificacionesNoLeidas > 99 ? '99+' : this.notificacionesNoLeidas;
            contador.style.display = 'flex';
            
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

    // Iniciar polling
    iniciarPolling() {
        setInterval(() => {
            this.cargarContador();
        }, 30000);
    }

    // Abrir panel
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

    // Posicionar panel
    posicionarPanel() {
        const icono = document.getElementById('notificaciones-icono');
        const panel = document.getElementById('panel-notificaciones');
        if (!icono || !panel) return;

        const rect = icono.getBoundingClientRect();
        panel.style.top = (rect.bottom + 10) + 'px';
        panel.style.right = (window.innerWidth - rect.right) + 'px';
    }
    // ============================================
    // MÉTODO PARA CREAR NOTIFICACIONES NUEVAS
    // ============================================
    async crearNotificacion(usuarioId, tipo, titulo, mensaje, relacionId = null, tipoRelacion = null) {
        try {
            console.log(`🔔 Creando notificación para ${usuarioId}: ${titulo}`);
            
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
    
            if (error) {
                console.error('❌ Error creando notificación:', error);
                return false;
            }
    
            // Si la notificación es para el usuario actual, actualizar el contador
            if (usuarioId === window.f1Manager?.user?.id) {
                this.notificacionesNoLeidas++;
                this.actualizarContadorUI();
                
                // Animar campana
                const icono = document.querySelector('#notificaciones-icono i');
                if (icono) {
                    icono.style.color = '#00d2be';
                    icono.style.animation = 'none';
                    icono.offsetHeight;
                    icono.style.animation = 'campana 0.5s ease';
                }
            }
    
            console.log('✅ Notificación creada correctamente');
            return true;
    
        } catch (error) {
            console.error('❌ Error en crearNotificacion:', error);
            return false;
        }
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

    // Renderizar
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
                <div class="notificacion-item ${!notif.leida ? 'no-leida' : ''}" data-id="${notif.id}">
                    <div class="notificacion-icono">${this.getIcono(notif.tipo)}</div>
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

        // Eventos
        document.querySelectorAll('.notificacion-item').forEach(item => {
            item.onclick = async (e) => {
                const id = item.dataset.id;
                const notificacion = notificaciones.find(n => n.id === id);
                
                // Marcar como leída primero
                await this.marcarComoLeida(id);
                
                // Si la notificación es de tipo que tiene usuario origen, abrir perfil
                if (notificacion && (notificacion.tipo === 'venta' || notificacion.tipo === 'compra' || notificacion.tipo === 'mensaje')) {
                    
                    // Necesitamos obtener el ID del usuario relacionado
                    // Esto depende de cómo tengas estructurada tu BD
                    // Opción 1: Si la notificación guarda el ID del usuario origen
                    if (notificacion.usuario_origen_id) {
                        if (window.perfilManager) {
                            window.perfilManager.abrirPerfilUsuario(
                                notificacion.usuario_origen_id, 
                                null, 
                                e
                            );
                        }
                    } 
                    // Opción 2: Si necesitas buscar quién es el vendedor/comprador
                    else if (notificacion.tipo_relacion === 'pieza' && notificacion.relacion_id) {
                        // Aquí podrías hacer una consulta para obtener el vendedor/comprador
                        console.log('🔍 Notificación de pieza, ID:', notificacion.relacion_id);
                        // Por ahora solo mostramos la notificación marcada
                    }
                }
            };
        });
    }

    getIcono(tipo) {
        const iconos = {
            'pronostico': '📊',
            'venta': '💰',
            'compra': '🛒',
            'grupo_invitacion': '👥',
            'grupo_aceptada': '✅',
            'mensaje': '💬',
            'desgaste': '⚠️',
            'presupuesto': '📅'
        };
        return iconos[tipo] || '📌';
    }

    async marcarComoLeida(id) {
        try {
            await supabase
                .from('notificaciones_usuarios')
                .update({ leida: true, fecha_leida: new Date().toISOString() })
                .eq('id', id);

            this.notificacionesNoLeidas = Math.max(0, this.notificacionesNoLeidas - 1);
            this.actualizarContadorUI();

            const item = document.querySelector(`.notificacion-item[data-id="${id}"]`);
            if (item) {
                item.classList.remove('no-leida');
                const punto = item.querySelector('.notificacion-no-leida-punto');
                if (punto) punto.remove();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async marcarTodasLeidas() {
        if (!window.f1Manager?.user?.id) return;

        try {
            await supabase
                .from('notificaciones_usuarios')
                .update({ leida: true, fecha_leida: new Date().toISOString() })
                .eq('usuario_id', window.f1Manager.user.id)
                .eq('leida', false);

            this.notificacionesNoLeidas = 0;
            this.actualizarContadorUI();
            
            document.querySelectorAll('.notificacion-item').forEach(item => {
                item.classList.remove('no-leida');
                const punto = item.querySelector('.notificacion-no-leida-punto');
                if (punto) punto.remove();
            });

            const footer = document.querySelector('.notificaciones-footer');
            if (footer) footer.remove();

        } catch (error) {
            console.error('Error:', error);
        }
    }

    cerrarPanel() {
        const panel = document.getElementById('panel-notificaciones');
        if (panel) panel.remove();
        this.panelAbierto = false;
    }

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
}

// Inicializar cuando todo esté listo
window.NotificacionesManager = NotificacionesManager;

function iniciarNotificaciones() {
    if (!window.notificacionesManager) {
        window.notificacionesManager = new NotificacionesManager();
        window.notificacionesManager.inicializar();
    }
}

// Intentar varias veces
if (document.readyState === 'complete') {
    setTimeout(iniciarNotificaciones, 2000);
} else {
    window.addEventListener('load', () => setTimeout(iniciarNotificaciones, 2000));
}

// También intentar después de auth
document.addEventListener('auth-completado', () => {
    setTimeout(iniciarNotificaciones, 2000);
});

console.log('✅ Sistema de notificaciones listo');
