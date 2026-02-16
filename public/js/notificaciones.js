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

        .chat-panel-mensajes {
            flex: 1 1 auto;
            overflow-y: auto !important;
            overflow-x: hidden;
            height: 100%;
            min-height: 0;
            max-height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .chat-panel-mensajes > :last-child {
            margin-bottom: 10px;
        }        
        .boton-header {
            background: none;
            border: none;
            color: white;
            font-size: 1.3rem;
            cursor: pointer;
            position: relative;
            padding: 8px;
        }
        
        .contador-notificaciones {
            position: absolute;
            top: 0;
            right: 0;
            background: #e10600;
            color: white;
            font-size: 0.7rem;
            padding: 2px 5px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
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
        
        /* ======================== */
        /* ESTILOS PARA SECCIÓN DE MENSAJES - CORREGIDO */
        /* ======================== */
        
        #seccion-mensajes.active {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 2147483646;
            padding: 20px;
            backdrop-filter: blur(5px);
            display: flex !important;
            flex-direction: column;
        }
        
        .mensajes-header {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto 15px auto;
            padding: 0 20px;
        }
        
        .mensajes-header .buscador-usuarios {
            position: relative;
            width: 100%;
            max-width: 400px;
        }
        
        .mensajes-header .buscador-usuarios i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #888;
            font-size: 0.9rem;
        }
        
        .mensajes-header .buscador-usuarios input {
            width: 100%;
            padding: 10px 10px 10px 40px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #00d2be;
            border-radius: 25px;
            color: white;
            font-size: 0.9rem;
        }
        
        .mensajes-header .buscador-usuarios input:focus {
            outline: none;
            box-shadow: 0 0 10px rgba(0, 210, 190, 0.3);
        }
        
        .mensajes-container {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 15px;
            width: 100%;
            max-width: 1100px;
            height: calc(80vh - 60px);
            max-height: 650px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #00d2be;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 210, 190, 0.3);
        }
        
        /* Panel izquierdo - Lista de conversaciones - MUY ESTRECHO */
        .mensajes-sidebar {
            background: rgba(0, 0, 0, 0.5);
            border-right: 1px solid rgba(0, 210, 190, 0.2);
            display: flex;
            flex-direction: column;
            width: 180px;
        }
        
        .lista-conversaciones {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }
        
        .conversacion-item {
            display: flex;
            align-items: center;
            justify-content: space-between;  /* <-- CAMBIA ESTO */
            gap: 4px;  /* <-- REDUCE EL GAP */
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 2px;
        }
        
        .conversacion-item:hover {
            background: rgba(0, 210, 190, 0.1);
        }
        
        .conversacion-item.activa {
            background: rgba(0, 210, 190, 0.15);
            border-left: 2px solid #00d2be;
        }
        
        /* SIN ICONO DE USUARIO */
        .conversacion-avatar {
            display: none;
        }
        
        .conversacion-info {
            flex: 1;
            overflow: hidden;
            min-width: 0;
            white-space: nowrap;
        }
        
        .conversacion-nombre {
            font-weight: bold;
            color: white;
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;  /* <-- AÑADE ESTO */
            max-width: calc(100% - 25px);  /* <-- RESERVA ESPACIO PARA EL NÚMERO */
        }
        
        /* OCULTAR "Sin mensajes" */
        .conversacion-ultimo {
            display: none;
        }
        
        .conversacion-no-leidos {
            background: #e10600;
            color: white;
            font-size: 0.55rem;
            font-weight: bold;
            min-width: 16px;
            height: 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            flex-shrink: 0;
            margin-left: auto;  /* <-- EMPUJA EL NÚMERO A LA DERECHA */
        }
        
        .sin-conversaciones {
            text-align: center;
            padding: 20px 10px;
            color: #888;
            font-size: 0.75rem;
        }
        
        /* Panel derecho - Chat - MÁS ESPACIO */
        .mensajes-chat {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: rgba(0, 0, 0, 0.2);
            min-width: 0;
        }
        
        .chat-placeholder {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #888;
            padding: 15px;
        }
        
        .chat-placeholder i {
            font-size: 2rem;
            color: #444;
            margin-bottom: 10px;
        }
        
        /* Chat activo */
        .chat-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.3);
        }
        
        .chat-panel-usuario {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #00d2be;
            font-weight: bold;
            font-size: 0.8rem;
        }
        
        .chat-panel-usuario i {
            font-size: 0.9rem;
        }
        
        .chat-panel-cerrar {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 0.8rem;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .chat-panel-mensajes {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            min-height: 0;  /* <-- IMPORTANTE PARA FLEXBOX */
            gap: 6px;
        }
        
        .chat-mensaje {
            display: flex;
            margin-bottom: 2px;
        }
        
        .chat-mensaje.propio {
            justify-content: flex-end;
        }
        
        .chat-mensaje.ajeno {
            justify-content: flex-start;
        }
        
        .chat-mensaje-contenido {
            max-width: 85%;
            padding: 6px 10px;
            border-radius: 10px;
            font-size: 0.8rem;
            word-wrap: break-word;
        }
        
        .propio .chat-mensaje-contenido {
            background: linear-gradient(135deg, #00d2be, #0066cc);
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .ajeno .chat-mensaje-contenido {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-bottom-left-radius: 4px;
        }
        
        .chat-mensaje-info {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 4px;
            font-size: 0.55rem;
            opacity: 0.7;
            margin-top: 2px;
        }
        
        .chat-mensaje-leido {
            color: #00d2be;
        }
        
        .chat-panel-input {
            padding: 10px 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 8px;
            background: rgba(0, 0, 0, 0.3);
        }
        
        .chat-panel-input textarea {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #00d2be;
            border-radius: 20px;
            color: white;
            padding: 8px 12px;
            resize: none;
            font-family: inherit;
            font-size: 0.8rem;
            max-height: 60px;
            min-height: 36px;
        }
        
        .chat-panel-input button {
            background: #00d2be;
            border: none;
            border-radius: 50%;
            color: #1a1a2e;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
        }
        
        .btn-cerrar-mensajes {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(225, 6, 0, 0.2);
            border: 2px solid #e10600;
            color: #e10600;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1rem;
            z-index: 2147483647;
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
            this.crearSeccionMensajes();
        }, 2000);
        
        // RESPALDO: Si después de 5 segundos no se ha creado, lo forzamos
        setTimeout(() => {
            if (!document.getElementById('seccion-mensajes')) {
                console.log('⚠️ Forzando creación de sección de mensajes');
                this.crearSeccionMensajes();
            }
        }, 5000);
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
            e.preventDefault();
            console.log('🔔 Click en notificaciones');
            this.abrirPanel(); // <-- ESTO ES LO CORRECTO
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
            e.preventDefault();
            console.log('💬 Click en mensajes');
            this.abrirSeccionMensajes(); // <-- ESTO ESTÁ BIEN
        };
    }
    // Crear sección de mensajes
    crearSeccionMensajes() {
        if (document.getElementById('seccion-mensajes')) return;
        
        const seccion = document.createElement('div');
        seccion.id = 'seccion-mensajes';
        seccion.className = 'seccion-juego';
        seccion.style.display = 'none';
        seccion.innerHTML = `
            <div class="mensajes-header">
                <div class="buscador-usuarios">
                    <i class="fas fa-search"></i>
                    <input type="text" id="buscador-usuarios" placeholder="Buscar usuario...">
                </div>
            </div>
            <div class="mensajes-container">
                <div class="mensajes-sidebar">
                    <div id="lista-conversaciones" class="lista-conversaciones"></div>
                </div>
                <div class="mensajes-chat" id="panel-chat">
                    <div class="chat-placeholder">
                        <i class="fas fa-comment-dots"></i>
                        <p>Selecciona una conversación</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(seccion);
    }
    

    
    // ========================
    // ABRIR SECCIÓN DE MENSAJES
    // ========================
    // ========================
    // ABRIR SECCIÓN DE MENSAJES
    // ========================
    abrirSeccionMensajes() {
        console.log('💬 Abriendo sección de mensajes - INICIO');
        
        // ELIMINAR CUALQUIER BOTÓN DE CIERRE EXISTENTE PRIMERO
        const btnExistente = document.getElementById('btn-cerrar-mensajes');
        if (btnExistente) {
            btnExistente.remove();
        }
        
        // Añadir clase active para el fondo oscuro
        const seccionMensajes = document.getElementById('seccion-mensajes');
        if (seccionMensajes) {
            seccionMensajes.classList.add('active');
            seccionMensajes.style.display = 'block';
            
            // Añadir botón de cierre si no existe
            if (!document.getElementById('btn-cerrar-mensajes')) {
                const btnCerrar = document.createElement('button');
                btnCerrar.id = 'btn-cerrar-mensajes';
                btnCerrar.className = 'btn-cerrar-mensajes';
                btnCerrar.innerHTML = '<i class="fas fa-times"></i>';
                btnCerrar.onclick = () => {
                    this.cerrarSeccionMensajes(); // USAR EL MÉTODO, NO FUNCIÓN ANÓNIMA
                };
                document.body.appendChild(btnCerrar);
            }
            
            // Cargar conversaciones
            if (typeof window.cargarConversaciones === 'function') {
                window.cargarConversaciones();
            }
        }
        
        // Cerrar panel de notificaciones si está abierto
        if (this.panelAbierto) {
            this.cerrarPanel();
        }
    }
    cerrarSeccionMensajes() {
        const seccion = document.getElementById('seccion-mensajes');
        const btnCerrar = document.getElementById('btn-cerrar-mensajes');
        
        if (seccion) {
            seccion.classList.remove('active');
            seccion.style.display = 'none';
        }
        
        if (btnCerrar) {
            btnCerrar.remove();
        }
        
        // También limpiar cualquier canal de suscripción si existe
        if (this.panelChannelRef) {
            supabase.removeChannel(this.panelChannelRef);
            this.panelChannelRef = null;
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
    // ========================
    // CREAR NOTIFICACIÓN (VERSIÓN CORREGIDA)
    // ========================
    async crearNotificacion(usuarioId, tipo, titulo, mensaje, solicitudId = null, tipoRelacion = null) {
        try {
            console.log(`🔔 Creando notificación para ${usuarioId}: ${titulo}`);
            
            // Preparar los datos - NO usamos relacion_id porque es integer
            const notificacionData = {
                usuario_id: usuarioId,
                tipo: tipo,
                titulo: titulo,
                mensaje: mensaje,
                tipo_relacion: solicitudId, // Guardamos el UUID aquí
                leida: false,
                fecha_creacion: new Date().toISOString()
            };
            
            const { error } = await supabase
                .from('notificaciones_usuarios')
                .insert([notificacionData]);
    
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
    // ========================
    // RENDERIZAR NOTIFICACIONES CON BOTONES PARA SOLICITUDES
    // ========================
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
        
        for (const notif of notificaciones) {
            const fecha = new Date(notif.fecha_creacion).toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
            });
    
            html += `
                <div class="notificacion-item ${!notif.leida ? 'no-leida' : ''}" data-id="${notif.id}" data-tipo="${notif.tipo}" data-relacion="${notif.relacion_id || ''}" data-tipo-relacion="${notif.tipo_relacion || ''}">
                    <div class="notificacion-icono">${this.getIcono(notif.tipo)}</div>
                    <div class="notificacion-contenido">
                        <div class="notificacion-titulo">${notif.titulo}</div>
                        <div class="notificacion-mensaje">${notif.mensaje}</div>
                        <div class="notificacion-fecha">${fecha}</div>
                        
                        <!-- BOTONES PARA SOLICITUDES DE GRUPO (solo si es tipo grupo_solicitud y no está leída) -->
                        ${notif.tipo === 'grupo_solicitud' && !notif.leida ? `
                            <div class="notificacion-acciones" style="display: flex; gap: 8px; margin-top: 10px;">
                                <button class="notificacion-btn notificacion-btn-aceptar" data-solicitud-id="${notif.tipo_relacion}" data-notif-id="${notif.id}" style="flex: 1; padding: 6px; background: #4CAF50; border: none; color: white; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                                    <i class="fas fa-check"></i> ACEPTAR
                                </button>
                                <button class="notificacion-btn notificacion-btn-rechazar" data-solicitud-id="${notif.tipo_relacion}" data-notif-id="${notif.id}" style="flex: 1; padding: 6px; background: #f44336; border: none; color: white; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                                    <i class="fas fa-times"></i> RECHAZAR
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    ${!notif.leida ? '<div class="notificacion-no-leida-punto"></div>' : ''}
                </div>
            `;
        }
    
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
    
        // Eventos para los botones de aceptar/rechazar
        document.querySelectorAll('.notificacion-btn-aceptar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const solicitudId = btn.dataset.solicitudId;
                const notifId = btn.dataset.notifId;
                
                // Validar que solicitudId existe y no es 'null' o 'undefined'
                if (!solicitudId || solicitudId === 'null' || solicitudId === 'undefined') {
                    console.error('❌ ID de solicitud inválido:', solicitudId);
                    if (window.f1Manager?.showNotification) {
                        window.f1Manager.showNotification('❌ Error: ID de solicitud inválido', 'error');
                    }
                    return;
                }
                
                if (window.perfilManager) {
                    await window.perfilManager.aceptarSolicitudGrupo(solicitudId);
                    // Marcar notificación como leída
                    await this.marcarComoLeida(notifId);
                    // Recargar notificaciones
                    this.cargarNotificaciones();
                }
            });
        });
        
        document.querySelectorAll('.notificacion-btn-rechazar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const solicitudId = btn.dataset.solicitudId;
                const notifId = btn.dataset.notifId;
                
                // Validar que solicitudId existe y no es 'null' o 'undefined'
                if (!solicitudId || solicitudId === 'null' || solicitudId === 'undefined') {
                    console.error('❌ ID de solicitud inválido:', solicitudId);
                    if (window.f1Manager?.showNotification) {
                        window.f1Manager.showNotification('❌ Error: ID de solicitud inválido', 'error');
                    }
                    return;
                }
                
                if (window.perfilManager) {
                    await window.perfilManager.rechazarSolicitudGrupo(solicitudId);
                    // Marcar notificación como leída
                    await this.marcarComoLeida(notifId);
                    // Recargar notificaciones
                    this.cargarNotificaciones();
                }
            });
        });
    
        document.querySelectorAll('.notificacion-btn-rechazar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const solicitudId = btn.dataset.solicitudId;
                const notifId = btn.dataset.notifId;
                
                if (window.perfilManager) {
                    await window.perfilManager.rechazarSolicitudGrupo(solicitudId);
                    // Marcar notificación como leída
                    await this.marcarComoLeida(notifId);
                    // Recargar notificaciones
                    this.cargarNotificaciones();
                }
            });
        });
    
        // Evento para abrir perfil (solo si no es grupo_solicitud o ya está leída)
        document.querySelectorAll('.notificacion-item').forEach(item => {
            if (item.dataset.tipo !== 'grupo_solicitud' || item.classList.contains('no-leida') === false) {
                item.onclick = async (e) => {
                    // No hacer nada si el click fue en un botón
                    if (e.target.closest('.notificacion-btn')) return;
                    
                    const id = item.dataset.id;
                    await this.marcarComoLeida(id);
                };
            }
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
// Inicializar cuando todo esté listo
window.NotificacionesManager = NotificacionesManager;

let inicializado = false;

function iniciarNotificaciones() {
    if (inicializado) return;
    
    if (!window.notificacionesManager) {
        window.notificacionesManager = new NotificacionesManager();
        window.notificacionesManager.inicializar();
        inicializado = true;
        console.log('✅ Sistema de notificaciones inicializado');
    }
}

// Solo UNA forma de inicialización
if (document.readyState === 'complete') {
    setTimeout(iniciarNotificaciones, 2000);
} else {
    window.addEventListener('load', () => setTimeout(iniciarNotificaciones, 2000));
}

// También intentar después de auth (solo actualizar datos, no reinicializar)
document.addEventListener('auth-completado', () => {
    if (window.notificacionesManager) {
        window.notificacionesManager.cargarContador();
    } else {
        setTimeout(iniciarNotificaciones, 1000);
    }
});

console.log('✅ Sistema de notificaciones listo');
