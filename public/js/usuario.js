// ========================
// usuario.js - Perfil de Escudería Público
// ========================
console.log('👤 Cargando sistema de perfiles de usuario...');

class PerfilManager {
    constructor() {
        this.modalAbierto = false;
        this.perfilActual = null;
    }

    // ========================
    // MOSTRAR PERFIL (público - cualquier usuario puede ver el perfil de otro)
    // ========================
    async mostrarPerfil(escuderiaId = null, escuderiaNombre = null) {
        console.log('👤 Mostrando perfil para:', escuderiaId || 'usuario actual');
        
        // Si no se especifica ID, usar el del usuario actual
        const idPerfil = escuderiaId || (window.f1Manager?.escuderia?.id);
        
        if (!idPerfil) {
            console.error('❌ No se puede mostrar perfil: sin ID');
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error cargando perfil', 'error');
            }
            return;
        }

        try {
            // Cargar datos del perfil
            const datosPerfil = await this.cargarDatosPerfil(idPerfil);
            
            if (!datosPerfil) {
                throw new Error('No se pudieron cargar los datos del perfil');
            }

            // Guardar perfil actual
            this.perfilActual = datosPerfil;

            // Crear y mostrar modal
            this.crearModalPerfil(datosPerfil, idPerfil === window.f1Manager?.escuderia?.id);

        } catch (error) {
            console.error('❌ Error mostrando perfil:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error cargando perfil', 'error');
            }
        }
    }
    
    // ========================
    // ABRIR PERFIL DE USUARIO (desde cualquier parte)
    // ========================
    abrirPerfilUsuario(escuderiaId, escuderiaNombre = null, evento = null) {
        // Prevenir propagación si viene de un evento
        if (evento) {
            evento.preventDefault();
            evento.stopPropagation();
        }
        
        console.log('👤 Abriendo perfil de usuario:', escuderiaId, escuderiaNombre);
        
        if (!escuderiaId) {
            console.error('❌ No se puede abrir perfil: sin ID de usuario');
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error: Usuario no identificado', 'error');
            }
            return;
        }
        
        // Llamar al método existente mostrarPerfil con el ID
        this.mostrarPerfil(escuderiaId, escuderiaNombre);
    }
    
    // ========================
    // SISTEMA DE GRUPOS
    // ========================
    
    /**
     * Crear un nuevo grupo
     */
    async crearGrupo() {
        const modal = document.createElement('div');
        modal.id = 'modal-crear-grupo';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 500px;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-crear-grupo').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="color: #00d2be; margin-bottom: 20px;">
                        <i class="fas fa-users"></i>
                        CREAR NUEVO GRUPO
                    </h3>
                    
                    <input type="text" id="nombre-grupo" 
                        placeholder="Nombre del grupo"
                        style="
                            width: 100%;
                            padding: 12px;
                            background: rgba(0,0,0,0.5);
                            border: 2px solid #00d2be;
                            border-radius: 6px;
                            color: white;
                            margin-bottom: 15px;
                            font-size: 0.9rem;
                        ">
                    
                    <textarea id="descripcion-grupo" 
                        placeholder="Descripción del grupo (opcional)"
                        rows="3"
                        style="
                            width: 100%;
                            padding: 12px;
                            background: rgba(0,0,0,0.5);
                            border: 2px solid #00d2be;
                            border-radius: 6px;
                            color: white;
                            margin-bottom: 20px;
                            font-size: 0.9rem;
                            resize: vertical;
                        "></textarea>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="this.closest('#modal-crear-grupo').remove()"
                            style="
                                padding: 10px 20px;
                                background: transparent;
                                border: 1px solid #666;
                                color: #aaa;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                            Cancelar
                        </button>
                        <button onclick="window.perfilManager.procesarCrearGrupo()"
                            style="
                                padding: 10px 20px;
                                background: linear-gradient(135deg, #00d2be, #0066cc);
                                border: none;
                                color: white;
                                border-radius: 4px;
                                cursor: pointer;
                                font-weight: bold;
                            ">
                            <i class="fas fa-check"></i>
                            CREAR GRUPO
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Procesar la creación del grupo
     */
    /**
     * Procesar la creación del grupo
     */
    async procesarCrearGrupo() {
        const nombreInput = document.getElementById('nombre-grupo');
        const descripcionInput = document.getElementById('descripcion-grupo');
        
        if (!nombreInput) return;
        
        const nombre = nombreInput.value.trim();
        if (!nombre) {
            this.mostrarNotificacion('❌ El nombre del grupo es obligatorio', 'error');
            return;
        }
        
        const descripcion = descripcionInput?.value.trim() || '';
        const miId = window.f1Manager?.escuderia?.id;
        
        if (!miId) {
            this.mostrarNotificacion('❌ No has iniciado sesión', 'error');
            return;
        }
        
        try {
            // 1. Crear el grupo - SIN el campo 'configuracion' que no existe
            const { data: grupo, error: errorGrupo } = await supabase
                .from('grupos_amigos')
                .insert([{
                    nombre: nombre,
                    descripcion: descripcion,
                    creador_id: miId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                    // 👇 ELIMINADO: configuracion: { publico: true } - esta columna no existe
                }])
                .select()
                .single();
            
            if (errorGrupo) throw errorGrupo;
            
            // 2. Añadir al creador como miembro (admin)
            const { error: errorMiembro } = await supabase
                .from('grupo_miembros')
                .insert([{
                    grupo_id: grupo.id,
                    escuderia_id: miId,
                    es_admin: true,
                    fecha_ingreso: new Date().toISOString()
                }]);
            
            if (errorMiembro) throw errorMiembro;
            
            // Cerrar modal
            document.getElementById('modal-crear-grupo')?.remove();
            
            this.mostrarNotificacion(`✅ Grupo "${nombre}" creado con éxito`, 'success');
            

            
            // Recargar perfil si está abierto
            if (this.modalAbierto) {
                await this.recargarPerfil();
            }
            
        } catch (error) {
            console.error('❌ Error creando grupo:', error);
            this.mostrarNotificacion('❌ Error al crear el grupo', 'error');
        }
    }

    /**
     * Solicitar unirse a un grupo
     */
    async solicitarUnirseAGrupo(grupoId, grupoNombre) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) {
            this.mostrarNotificacion('❌ No has iniciado sesión', 'error');
            return;
        }
        
        try {
            // Verificar si ya es miembro
            const { data: miembroExistente, error: errorCheck } = await supabase
                .from('grupo_miembros')
                .select('id')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .maybeSingle();
            
            if (miembroExistente) {
                this.mostrarNotificacion('❌ Ya eres miembro de este grupo', 'error');
                return;
            }
            
            // Verificar si ya tiene una solicitud pendiente
            const { data: solicitudExistente, error: errorSolicitud } = await supabase
                .from('grupo_solicitudes')
                .select('id, estado')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .eq('estado', 'pendiente')
                .maybeSingle();
            
            if (solicitudExistente) {
                this.mostrarNotificacion('⏳ Ya tienes una solicitud pendiente para este grupo', 'info');
                return;
            }
            
            // Crear solicitud
            const { data: solicitud, error: errorInsert } = await supabase
                .from('grupo_solicitudes')
                .insert([{
                    grupo_id: grupoId,
                    escuderia_id: miId,
                    estado: 'pendiente',
                    fecha_solicitud: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (errorInsert) throw errorInsert;
            
            // Obtener información del creador del grupo para notificación
            const { data: grupo } = await supabase
                .from('grupos_amigos')
                .select('creador_id, nombre')
                .eq('id', grupoId)
                .single();
            
            // Obtener user_id del creador
            const { data: creador } = await supabase
                .from('escuderias')
                .select('user_id')
                .eq('id', grupo.creador_id)
                .single();
            
            // Notificar al creador
            if (creador?.user_id && window.notificacionesManager) {
                await window.notificacionesManager.crearNotificacion(
                    creador.user_id,
                    'grupo_solicitud', 
                    '👥 Solicitud para unirse al grupo',
                    `${window.f1Manager.escuderia.nombre} quiere unirse a "${grupo.nombre}"`,
                    null,
                    solicitud.id,
                    {
                        solicitud_id: solicitud.id,
                        grupo_id: grupoId,
                        grupo_nombre: grupo.nombre,
                        solicitante_id: miId,
                        solicitante_nombre: window.f1Manager.escuderia.nombre
                    }
                );
            }
            
            this.mostrarNotificacion('✅ Solicitud enviada al administrador del grupo', 'success');
            
        } catch (error) {
            console.error('❌ Error enviando solicitud:', error);
            this.mostrarNotificacion('❌ Error al enviar la solicitud', 'error');
        }
    }

    /**
     * Procesar solicitud de grupo (aceptar/rechazar)
     */
    async procesarSolicitudGrupo(solicitudId, accion) {
        try {
            // Obtener datos de la solicitud
            const { data: solicitud, error: errorGet } = await supabase
                .from('grupo_solicitudes')
                .select(`
                    *,
                    grupo:grupos_amigos(*),
                    solicitante:escuderias!grupo_solicitudes_escuderia_id_fkey(*)
                `)
                .eq('id', solicitudId)
                .single();
            
            if (errorGet) throw errorGet;
            
            if (accion === 'aceptar') {
                // Aceptar solicitud
                const { error: errorUpdate } = await supabase
                    .from('grupo_solicitudes')
                    .update({ 
                        estado: 'aceptada',
                        fecha_respuesta: new Date().toISOString()
                    })
                    .eq('id', solicitudId);
                
                if (errorUpdate) throw errorUpdate;
                
                // Añadir como miembro
                const { error: errorMiembro } = await supabase
                    .from('grupo_miembros')
                    .insert([{
                        grupo_id: solicitud.grupo_id,
                        escuderia_id: solicitud.escuderia_id,
                        es_admin: false,
                        fecha_ingreso: new Date().toISOString()
                    }]);
                
                if (errorMiembro) throw errorMiembro;
                
                // Notificar al solicitante
                if (solicitud.solicitante?.user_id && window.notificacionesManager) {
                    await window.notificacionesManager.crearNotificacion(
                        solicitud.solicitante.user_id,
                        'exito',
                        '✅ Solicitud aceptada',
                        `Tu solicitud para unirte a "${solicitud.grupo.nombre}" ha sido aceptada`,
                        null,
                        'sistema'
                    );
                }
                
                this.mostrarNotificacion('✅ Solicitud aceptada', 'success');
                
            } else {
                // Rechazar solicitud
                const { error: errorUpdate } = await supabase
                    .from('grupo_solicitudes')
                    .update({ 
                        estado: 'rechazada',
                        fecha_respuesta: new Date().toISOString()
                    })
                    .eq('id', solicitudId);
                
                if (errorUpdate) throw errorUpdate;
                
                // Notificar al solicitante
                if (solicitud.solicitante?.user_id && window.notificacionesManager) {
                    await window.notificacionesManager.crearNotificacion(
                        solicitud.solicitante.user_id,
                        'error',
                        '❌ Solicitud rechazada',
                        `Tu solicitud para unirte a "${solicitud.grupo.nombre}" ha sido rechazada`,
                        null,
                        'sistema'
                    );
                }
                
                this.mostrarNotificacion('❌ Solicitud rechazada', 'info');
            }
            
            // Recargar perfil si está abierto
            if (this.modalAbierto) {
                await this.recargarPerfil();
            }
            
        } catch (error) {
            console.error('❌ Error procesando solicitud:', error);
            this.mostrarNotificacion('❌ Error al procesar la solicitud', 'error');
        }
    }
    // ========================
    // ACEPTAR SOLICITUD (wrapper para procesarSolicitudGrupo)
    // ========================
    async aceptarSolicitudGrupo(solicitudId) {
        await this.procesarSolicitudGrupo(solicitudId, 'aceptar');
    }
    
    // ========================
    // RECHAZAR SOLICITUD (wrapper para procesarSolicitudGrupo)
    // ========================
    async rechazarSolicitudGrupo(solicitudId) {
        await this.procesarSolicitudGrupo(solicitudId, 'rechazar');
    }

    
    /**
     * Aceptar solicitud de grupo (wrapper para procesarSolicitudGrupo)
     */
    async aceptarSolicitudGrupo(solicitudId) {
        await this.procesarSolicitudGrupo(solicitudId, 'aceptar');
    }
    
    /**
     * Rechazar solicitud de grupo (wrapper para procesarSolicitudGrupo)
     */
    async rechazarSolicitudGrupo(solicitudId) {
        await this.procesarSolicitudGrupo(solicitudId, 'rechazar');
    }
    /**
     * Editar grupo (solo admin)
     */
    async editarGrupo(grupoId) {
        try {
            // Obtener datos actuales del grupo
            const { data: grupo, error } = await supabase
                .from('grupos_amigos')
                .select('nombre, descripcion')
                .eq('id', grupoId)
                .single();
            
            if (error) throw error;
            
            const modal = document.createElement('div');
            modal.id = 'modal-editar-grupo';
            modal.innerHTML = `
                <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                    <div class="modal-perfil-contenedor" style="max-width: 500px;">
                        <button class="modal-perfil-cerrar" onclick="this.closest('#modal-editar-grupo').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <h3 style="color: #00d2be; margin-bottom: 20px;">
                            <i class="fas fa-pen"></i>
                            EDITAR GRUPO
                        </h3>
                        
                        <input type="text" id="editar-nombre-grupo" 
                            value="${grupo.nombre}"
                            placeholder="Nombre del grupo"
                            style="
                                width: 100%;
                                padding: 12px;
                                background: rgba(0,0,0,0.5);
                                border: 2px solid #00d2be;
                                border-radius: 6px;
                                color: white;
                                margin-bottom: 15px;
                                font-size: 0.9rem;
                            ">
                        
                        <textarea id="editar-descripcion-grupo" 
                            placeholder="Descripción del grupo (opcional)"
                            rows="3"
                            style="
                                width: 100%;
                                padding: 12px;
                                background: rgba(0,0,0,0.5);
                                border: 2px solid #00d2be;
                                border-radius: 6px;
                                color: white;
                                margin-bottom: 20px;
                                font-size: 0.9rem;
                                resize: vertical;
                            ">${grupo.descripcion || ''}</textarea>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button onclick="this.closest('#modal-editar-grupo').remove()"
                                style="
                                    padding: 10px 20px;
                                    background: transparent;
                                    border: 1px solid #666;
                                    color: #aaa;
                                    border-radius: 4px;
                                    cursor: pointer;
                                ">
                                Cancelar
                            </button>
                            <button onclick="window.perfilManager.guardarEdicionGrupo('${grupoId}')"
                                style="
                                    padding: 10px 20px;
                                    background: linear-gradient(135deg, #00d2be, #0066cc);
                                    border: none;
                                    color: white;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-weight: bold;
                                ">
                                <i class="fas fa-save"></i>
                                GUARDAR
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Error cargando grupo:', error);
            this.mostrarNotificacion('❌ Error al cargar grupo', 'error');
        }
    }
    
    /**
     * Guardar edición del grupo
     */
    async guardarEdicionGrupo(grupoId) {
        const nombreInput = document.getElementById('editar-nombre-grupo');
        const descripcionInput = document.getElementById('editar-descripcion-grupo');
        
        if (!nombreInput) return;
        
        const nombre = nombreInput.value.trim();
        if (!nombre) {
            this.mostrarNotificacion('❌ El nombre del grupo es obligatorio', 'error');
            return;
        }
        
        const descripcion = descripcionInput?.value.trim() || '';
        
        try {
            const { error } = await supabase
                .from('grupos_amigos')
                .update({
                    nombre: nombre,
                    descripcion: descripcion,
                    updated_at: new Date().toISOString()
                })
                .eq('id', grupoId);
            
            if (error) throw error;
            
            document.getElementById('modal-editar-grupo')?.remove();
            
            this.mostrarNotificacion('✅ Grupo actualizado correctamente', 'success');
            
            // Recargar perfil
            if (this.modalAbierto) {
                await this.recargarPerfil();
            }
            
        } catch (error) {
            console.error('❌ Error actualizando grupo:', error);
            this.mostrarNotificacion('❌ Error al actualizar grupo', 'error');
        }
    }
    
    /**
     * Ver miembros de un grupo
     */
    async verMiembrosGrupo(grupoId) {
        try {
            const { data: miembros, error } = await supabase
                .from('grupo_miembros')
                .select(`
                    *,
                    escuderia:escuderias!grupo_miembros_escuderia_id_fkey (
                        id,
                        nombre,
                        puntos,
                        dinero,
                        user_id
                    )
                `)
                .eq('grupo_id', grupoId)
                .order('es_admin', { ascending: false })
                .order('fecha_ingreso', { ascending: true });
            
            if (error) throw error;
            
            this.mostrarModalMiembros(grupoId, miembros);
            
        } catch (error) {
            console.error('❌ Error cargando miembros:', error);
            this.mostrarNotificacion('❌ Error al cargar miembros', 'error');
        }
    }
    /**
     * Cargar miembros de un grupo y mostrarlos en el perfil
     */
    async cargarMiembrosGrupoEnPerfil(grupoId, contenedorId) {
        try {
            const { data: miembros, error } = await supabase
                .from('grupo_miembros')
                .select(`
                    *,
                    escuderia:escuderias!grupo_miembros_escuderia_id_fkey (
                        id,
                        nombre
                    )
                `)
                .eq('grupo_id', grupoId)
                .limit(3);
            
            if (error) throw error;
            
            const contenedor = document.getElementById(contenedorId);
            if (!contenedor) return;
            
            if (!miembros || miembros.length === 0) {
                contenedor.innerHTML = '<div style="color: #888; font-size: 0.8rem;">Sin miembros</div>';
                return;
            }
            
            let html = '<div style="display: flex; flex-direction: column; gap: 5px;">';
            
            miembros.forEach((m, index) => {
                html += `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="
                            width: 24px;
                            height: 24px;
                            background: rgba(0,210,190,0.2);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.7rem;
                            color: #00d2be;
                        ">
                            <i class="fas fa-user"></i>
                        </div>
                        <span style="color: white; font-size: 0.85rem; flex: 1;">
                            ${m.escuderia.nombre}
                        </span>
                        ${m.es_admin ? '<span style="color: #FFD700; font-size: 0.7rem;">👑</span>' : ''}
                    </div>
                `;
            });
            
            if (miembros.length === 3) {
                html += `
                    <div style="text-align: right; margin-top: 5px;">
                        <button onclick="window.perfilManager.verMiembrosGrupo('${grupoId}')" style="
                            background: none;
                            border: none;
                            color: #00d2be;
                            font-size: 0.7rem;
                            cursor: pointer;
                            text-decoration: underline;
                        ">
                            Ver todos →
                        </button>
                    </div>
                `;
            }
            
            html += '</div>';
            contenedor.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Error cargando miembros:', error);
        }
    }
    /**
     * Abrir selector de grupos para solicitar unirse
     */
    async abrirSelectorGrupos(escuderiaId) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) {
            this.mostrarNotificacion('❌ No has iniciado sesión', 'error');
            return;
        }
        
        try {
            // Obtener grupos del usuario actual
            const misGrupos = await this.obtenerGruposEscuderia(miId);
            
            if (misGrupos.length === 0) {
                this.mostrarNotificacion('❌ No perteneces a ningún grupo', 'error');
                return;
            }
            
            // Crear modal para seleccionar grupo
            const modal = document.createElement('div');
            modal.id = 'modal-selector-grupo';
            modal.innerHTML = `
                <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                    <div class="modal-perfil-contenedor" style="max-width: 400px;">
                        <button class="modal-perfil-cerrar" onclick="this.closest('#modal-selector-grupo').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <h3 style="color: #00d2be; margin-bottom: 20px;">
                            <i class="fas fa-users"></i>
                            SELECCIONAR GRUPO
                        </h3>
                        
                        <p style="color: #aaa; margin-bottom: 15px; font-size: 0.9rem;">
                            ¿A qué grupo quieres invitar a ${this.perfilActual?.escuderia?.nombre}?
                        </p>
                        
                        <div style="max-height: 300px; overflow-y: auto;">
                            ${misGrupos.map(grupo => `
                                <div onclick="window.perfilManager.solicitarUnirseAGrupo('${grupo.id}', '${grupo.nombre}')"
                                    style="
                                        padding: 12px;
                                        background: rgba(0,0,0,0.3);
                                        border: 1px solid #00d2be;
                                        border-radius: 6px;
                                        margin-bottom: 8px;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                    "
                                    onmouseover="this.style.background='rgba(0,210,190,0.1)'"
                                    onmouseout="this.style.background='rgba(0,0,0,0.3)'">
                                    <div style="font-weight: bold; color: white;">${grupo.nombre}</div>
                                    ${grupo.descripcion ? `<div style="color: #aaa; font-size: 0.8rem; margin-top: 3px;">${grupo.descripcion}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top: 20px; text-align: center;">
                            <button onclick="this.closest('#modal-selector-grupo').remove()" style="
                                background: transparent;
                                border: 1px solid #666;
                                color: #aaa;
                                padding: 8px 20px;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Error abriendo selector:', error);
            this.mostrarNotificacion('❌ Error al cargar grupos', 'error');
        }
    }

    
    /**
     * Mostrar modal con lista de miembros
     */
    mostrarModalMiembros(grupoId, miembros) {
        const esAdmin = miembros.some(m => 
            m.escuderia.id === window.f1Manager?.escuderia?.id && m.es_admin
        );
        
        const modal = document.createElement('div');
        modal.id = 'modal-miembros-grupo';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 500px;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-miembros-grupo').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="color: #00d2be; margin-bottom: 20px;">
                        <i class="fas fa-users"></i>
                        MIEMBROS DEL GRUPO (${miembros.length})
                    </h3>
                    
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${miembros.map(m => `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 15px;
                                padding: 12px;
                                background: rgba(0,0,0,0.3);
                                border-radius: 8px;
                                margin-bottom: 8px;
                                border-left: 4px solid ${m.es_admin ? '#FFD700' : '#00d2be'};
                            ">
                                <div style="
                                    width: 40px;
                                    height: 40px;
                                    background: linear-gradient(135deg, #00d2be, #0066cc);
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                ">
                                    <i class="fas fa-flag-checkered"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: bold; color: white; margin-bottom: 3px;">
                                        ${m.escuderia.nombre}
                                        ${m.es_admin ? '<span style="color: #FFD700; margin-left: 8px; font-size: 0.7rem;">👑 ADMIN</span>' : ''}
                                    </div>
                                    <div style="color: #aaa; font-size: 0.8rem;">
                                        Miembro desde ${new Date(m.fecha_ingreso).toLocaleDateString()}
                                    </div>
                                </div>
                                ${esAdmin && !m.es_admin && m.escuderia.id !== window.f1Manager?.escuderia?.id ? `
                                    <button onclick="window.perfilManager.expulsarMiembro('${grupoId}', '${m.escuderia.id}')"
                                        style="
                                            background: rgba(225, 6, 0, 0.1);
                                            border: 1px solid #e10600;
                                            color: #e10600;
                                            padding: 5px 10px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 0.8rem;
                                        ">
                                        <i class="fas fa-user-minus"></i>
                                        Expulsar
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Expulsar miembro del grupo (solo admin)
     */
    async expulsarMiembro(grupoId, escuderiaId) {
        if (!confirm('¿Estás seguro de que quieres expulsar a este miembro?')) return;
        
        try {
            // Eliminar del grupo
            const { error } = await supabase
                .from('grupo_miembros')
                .delete()
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', escuderiaId);
            
            if (error) throw error;
            
            // Obtener información para notificación
            const { data: grupo } = await supabase
                .from('grupos_amigos')
                .select('nombre')
                .eq('id', grupoId)
                .single();
            
            const { data: miembro } = await supabase
                .from('escuderias')
                .select('user_id')
                .eq('id', escuderiaId)
                .single();
            
            // Notificar al expulsado
            if (miembro?.user_id && window.notificacionesManager) {
                await window.notificacionesManager.crearNotificacion(
                    miembro.user_id,
                    'sistema',
                    '👋 Has sido expulsado',
                    `Has sido expulsado del grupo "${grupo.nombre}"`,
                    null,
                    'sistema'
                );
            }
            
            this.mostrarNotificacion('✅ Miembro expulsado', 'success');
            
            // Recargar lista de miembros
            document.getElementById('modal-miembros-grupo')?.remove();
            this.verMiembrosGrupo(grupoId);
            
        } catch (error) {
            console.error('❌ Error expulsando miembro:', error);
            this.mostrarNotificacion('❌ Error al expulsar', 'error');
        }
    }

    /**
     * Abandonar grupo
     */
    async abandonarGrupo(grupoId) {
        if (!confirm('¿Estás seguro de que quieres abandonar el grupo?')) return;
        
        const miId = window.f1Manager?.escuderia?.id;
        
        try {
            const { error } = await supabase
                .from('grupo_miembros')
                .delete()
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId);
            
            if (error) throw error;
            
            this.mostrarNotificacion('✅ Has abandonado el grupo', 'success');
            
            if (this.modalAbierto) {
                await this.recargarPerfil();
            }
            
        } catch (error) {
            console.error('❌ Error abandonando grupo:', error);
            this.mostrarNotificacion('❌ Error al abandonar', 'error');
        }
    }

    /**
     * Obtener grupos de una escudería
     */
    async obtenerGruposEscuderia(escuderiaId) {
        try {
            const { data, error } = await supabase
                .from('grupo_miembros')
                .select(`
                    *,
                    grupo:grupos_amigos!grupo_miembros_grupo_id_fkey (
                        id,
                        nombre,
                        descripcion,
                        creador_id,
                        created_at,
                        avatar_url
                    )
                `)
                .eq('escuderia_id', escuderiaId);
            
            if (error) throw error;
            
            return data.map(m => ({
                ...m.grupo,
                es_admin: m.es_admin,
                fecha_ingreso: m.fecha_ingreso
            }));
            
        } catch (error) {
            console.error('❌ Error obteniendo grupos:', error);
            return [];
        }
    }

    /**
     * Verificar si puede solicitar unirse a un grupo
     */
    async puedeSolicitarUnirse(grupoId, escuderiaId) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId || miId === escuderiaId) return false;
        
        try {
            // Verificar si ya es miembro
            const { data: miembro } = await supabase
                .from('grupo_miembros')
                .select('id')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .maybeSingle();
            
            if (miembro) return false;
            
            // Verificar si ya tiene solicitud pendiente
            const { data: solicitud } = await supabase
                .from('grupo_solicitudes')
                .select('id')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .eq('estado', 'pendiente')
                .maybeSingle();
            
            return !solicitud;
            
        } catch (error) {
            console.error('❌ Error verificando solicitud:', error);
            return false;
        }
    }

    // ========================
    // CARGAR TODOS LOS DATOS DEL PERFIL
    // ========================
    async cargarDatosPerfil(escuderiaId) {
        try {
            const supabase = window.supabase;
            if (!supabase) throw new Error('Supabase no disponible');

            // 1. DATOS BÁSICOS DE LA ESCUDERÍA
            const { data: escuderia, error: errorEscuderia } = await supabase
                .from('escuderias')
                .select(`
                    id,
                    nombre,
                    dinero,
                    puntos,
                    estrellas_semana,
                    creada_en,
                    ultimo_login_dia,
                    descripcion,
                    grupo_id
                `)
                .eq('id', escuderiaId)
                .single();

            if (errorEscuderia) throw errorEscuderia;

            // 2. ESTRATEGAS CONTRATADOS
            let estrategas = [];
            try {
                const { data, error } = await supabase
                    .from('estrategas_contrataciones')
                    .select(`
                        id,
                        slot_asignado,
                        fecha_inicio_contrato,
                        estratega_id,
                        estrategas_catalogo!inner (
                            nombre,
                            especialidad_nombre,
                            sueldo_semanal,
                            porcentaje_bono,
                            icono
                        )
                    `)
                    .eq('escuderia_id', escuderiaId)
                    .eq('estado', 'activo');
            
                if (!error && data) {
                    estrategas = data.map(c => ({
                        id: c.id,
                        nombre: c.estrategas_catalogo.nombre,
                        especialidad: c.estrategas_catalogo.especialidad_nombre,
                        salario: c.estrategas_catalogo.sueldo_semanal,
                        bonificacion_valor: c.estrategas_catalogo.porcentaje_bono,
                        icono: c.estrategas_catalogo.icono,
                        slot: c.slot_asignado
                    }));
                }
            } catch (e) {
                console.log('ℹ️ No se pudieron cargar los estrategas');
            }

            // 3. PRONÓSTICOS ACERTADOS
            const { data: pronosticos, error: errorPronosticos } = await supabase
                .from('pronosticos')
                .select('id, acierto, gp_id')
                .eq('escuderia_id', escuderiaId);

            const pronosticosAcertados = pronosticos?.filter(p => p.acierto === true).length || 0;
            const totalPronosticos = pronosticos?.length || 0;

            // 4. MEJOR VUELTA
            const { data: mejorVuelta, error: errorVuelta } = await supabase
                .from('pruebas_pista')
                .select('tiempo_formateado, fecha_prueba')
                .eq('escuderia_id', escuderiaId)
                .order('fecha_prueba', { ascending: false })
                .limit(1)
                .maybeSingle();

            // 5. POSICIÓN GLOBAL
            const { data: ranking, error: errorRanking } = await supabase
                .from('escuderias')
                .select('id, puntos, dinero')
                .order('puntos', { ascending: false });

            let posicionGlobal = 0;
            let totalEscuderias = 0;
            if (ranking) {
                totalEscuderias = ranking.length;
                posicionGlobal = ranking.findIndex(e => e.id === escuderiaId) + 1;
            }

            // 6. GRUPOS DEL USUARIO (ahora puede tener múltiples)
            const grupos = await this.obtenerGruposEscuderia(escuderiaId);
            // Cargar miembros de cada grupo (para mostrarlos después)
            if (grupos.length > 0) {
                // Esto se cargará asíncronamente después de renderizar el perfil
                setTimeout(() => {
                    grupos.forEach(grupo => {
                        this.cargarMiembrosGrupoEnPerfil(grupo.id, `miembros-grupo-${grupo.id}`);
                    });
                }, 100);
            }
            // 7. TROFEOS
            const trofeos = [];

            return {
                escuderia,
                estrategas: estrategas || [],
                pronosticos: {
                    acertados: pronosticosAcertados,
                    total: totalPronosticos,
                    porcentaje: totalPronosticos > 0 ? Math.round((pronosticosAcertados / totalPronosticos) * 100) : 0
                },
                mejorVuelta: mejorVuelta?.tiempo_formateado || 'Sin tiempo',
                fechaVuelta: mejorVuelta?.fecha_prueba,
                posicionGlobal,
                totalEscuderias,
                grupos, // Ahora es un array
                trofeos,
                fechaCreacion: escuderia.creada_en
            };

        } catch (error) {
            console.error('❌ Error cargando datos del perfil:', error);
            return null;
        }
    }

    // ========================
    // CREAR MODAL DEL PERFIL
    // ========================
    crearModalPerfil(datos, esMiPerfil = false) {
        // Eliminar modal existente
        const modalExistente = document.getElementById('modal-perfil');
        if (modalExistente) {
            modalExistente.remove();
        }
    
        const fechaCreacion = datos.fechaCreacion ? new Date(datos.fechaCreacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }) : 'Fecha desconocida';
    
        // Calcular medalla según posición
        let medalla = '';
        let colorPosicion = '#888';
        if (datos.posicionGlobal === 1) {
            medalla = '🥇';
            colorPosicion = '#FFD700';
        } else if (datos.posicionGlobal === 2) {
            medalla = '🥈';
            colorPosicion = '#C0C0C0';
        } else if (datos.posicionGlobal === 3) {
            medalla = '🥉';
            colorPosicion = '#CD7F32';
        }
    
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'modal-perfil';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) window.perfilManager.cerrarModal()">
                <div class="modal-perfil-contenedor">
                    <button class="modal-perfil-cerrar" onclick="window.perfilManager.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
    
                    <div class="perfil-header">
                        <div class="perfil-avatar">
                            <i class="fas fa-flag-checkered"></i>
                        </div>
                        <div class="perfil-titulo">
                            <h2>${datos.escuderia.nombre}</h2>
                            <div class="perfil-fecha-creacion">
                                <i class="far fa-calendar-alt"></i>
                                <span>Miembro desde ${fechaCreacion}</span>
                            </div>
                        </div>
                        
                        ${esMiPerfil ? `
                            <button class="perfil-btn-editar" onclick="window.perfilManager.editarDescripcion()">
                                <i class="fas fa-pen"></i>
                            </button>
                        ` : `
                            <div class="perfil-publico-badge">
                                <i class="fas fa-eye"></i> Perfil público
                            </div>
                        `}
                    </div>
                    
                    <div class="perfil-descripcion" id="perfil-descripcion">
                        ${datos.escuderia.descripcion ? 
                            `<p>${datos.escuderia.descripcion}</p>` : 
                            `<p class="perfil-descripcion-vacia">${esMiPerfil ? '✏️ Haz clic en el lápiz para añadir una descripción' : 'Este equipo no tiene descripción'}</p>`
                        }
                    </div>
                    
                    <div class="perfil-estadisticas">
                        <div class="perfil-stat-card" style="border-left-color: #4CAF50;">
                            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                            <div class="stat-content">
                                <span class="stat-label">Posición Global</span>
                                <span class="stat-valor" style="color: ${colorPosicion};">
                                    ${medalla} #${datos.posicionGlobal} de ${datos.totalEscuderias}
                                </span>
                            </div>
                        </div>
                        
                        <div class="perfil-stat-card" style="border-left-color: #FFD700;">
                            <div class="stat-icon"><i class="fas fa-coins"></i></div>
                            <div class="stat-content">
                                <span class="stat-label">Dinero</span>
                                <span class="stat-valor">€${datos.escuderia.dinero?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                                             
                        <div class="perfil-stat-card" style="border-left-color: #FF9800;">
                            <div class="stat-icon"><i class="fas fa-stopwatch"></i></div>
                            <div class="stat-content">
                                <span class="stat-label">Mejor Vuelta</span>
                                <span class="stat-valor">${datos.mejorVuelta}</span>
                            </div>
                        </div>
                        
                        <div class="perfil-stat-card" style="border-left-color: #9C27B0;">
                            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                            <div class="stat-content">
                                <span class="stat-label">Pronósticos</span>
                                <span class="stat-valor">${datos.pronosticos.acertados}/${datos.pronosticos.total} (${datos.pronosticos.porcentaje}%)</span>
                            </div>
                        </div>
                    </div>

                    <div class="perfil-grupos">
                        <h3>
                            <i class="fas fa-users"></i>
                            GRUPOS
                        </h3>
                        
                        <!-- SIEMPRE mostrar el botón de crear grupo para el dueño del perfil -->
                        ${esMiPerfil ? `
                            <div style="margin-bottom: 20px;">
                                <button class="btn-crear-grupo" onclick="window.perfilManager.crearGrupo()" style="width: 100%;">
                                    <i class="fas fa-plus-circle"></i>
                                    CREAR NUEVO GRUPO
                                </button>
                            </div>
                        ` : ''}
                        
                        <!-- Lista de grupos (si tiene) -->
                        ${datos.grupos.length > 0 ? `
                            <div class="grupos-lista">
                                ${datos.grupos.map(grupo => `
                                    <div class="grupo-item" style="
                                        background: rgba(0,0,0,0.3);
                                        border: 1px solid #00d2be;
                                        border-radius: 8px;
                                        padding: 15px;
                                        margin-bottom: 15px;
                                    ">
                                        <!-- Cabecera del grupo -->
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                            <div style="
                                                width: 40px;
                                                height: 40px;
                                                background: linear-gradient(135deg, #00d2be, #0066cc);
                                                border-radius: 8px;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                color: white;
                                            ">
                                                <i class="fas fa-users"></i>
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: bold; color: #00d2be; font-size: 1.1rem;">
                                                    ${grupo.nombre}
                                                    ${grupo.es_admin ? '<span style="color: #FFD700; margin-left: 8px; font-size: 0.8rem;">(ADMIN)</span>' : ''}
                                                </div>
                                                ${grupo.descripcion ? `<div style="color: #aaa; font-size: 0.85rem; margin-top: 3px;">${grupo.descripcion}</div>` : ''}
                                            </div>
                                        </div>
                                        
                                        <!-- SOLO EL ADMIN DEL GRUPO ve los botones de editar/miembros -->
                                        ${esMiPerfil && grupo.es_admin ? `
                                            <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                                                <button onclick="window.perfilManager.editarGrupo('${grupo.id}')"
                                                    style="
                                                        flex: 1;
                                                        padding: 6px;
                                                        background: rgba(0, 210, 190, 0.1);
                                                        border: 1px solid #00d2be;
                                                        color: #00d2be;
                                                        border-radius: 4px;
                                                        cursor: pointer;
                                                        font-size: 0.75rem;
                                                    ">
                                                    <i class="fas fa-pen"></i> EDITAR
                                                </button>
                                                <button onclick="window.perfilManager.verMiembrosGrupo('${grupo.id}')"
                                                    style="
                                                        flex: 1;
                                                        padding: 6px;
                                                        background: rgba(255, 255, 255, 0.1);
                                                        border: 1px solid #666;
                                                        color: white;
                                                        border-radius: 4px;
                                                        cursor: pointer;
                                                        font-size: 0.75rem;
                                                    ">
                                                    <i class="fas fa-list"></i> MIEMBROS
                                                </button>
                                            </div>
                                        ` : ''}
                                        
                                        <!-- Miembros del grupo (primeros 3) - visible para todos -->
                                        <div style="margin-top: 10px;">
                                            <div style="color: #888; font-size: 0.7rem; margin-bottom: 8px; text-transform: uppercase;">
                                                <i class="fas fa-user-friends"></i> MIEMBROS
                                            </div>
                                            <div id="miembros-grupo-${grupo.id}" style="min-height: 30px;">
                                                <i class="fas fa-spinner fa-spin" style="color: #00d2be;"></i>
                                            </div>
                                        </div>
                                        
                                        <!-- BOTÓN DE SOLICITAR UNIRSE - SOLO para visitantes que NO son miembros -->
                                        ${!esMiPerfil ? `
                                            <div style="margin-top: 15px;">
                                                <button onclick="window.perfilManager.solicitarUnirseAGrupo('${grupo.id}', '${grupo.nombre}')"
                                                    style="
                                                        width: 100%;
                                                        padding: 10px;
                                                        background: rgba(0, 210, 190, 0.1);
                                                        border: 1px solid #00d2be;
                                                        color: #00d2be;
                                                        border-radius: 4px;
                                                        cursor: pointer;
                                                        font-weight: bold;
                                                        transition: all 0.2s;
                                                    "
                                                    onmouseover="this.style.background='#00d2be'; this.style.color='#1a1a2e'"
                                                    onmouseout="this.style.background='rgba(0,210,190,0.1)'; this.style.color='#00d2be'">
                                                    <i class="fas fa-user-plus"></i>
                                                    SOLICITAR UNIRSE A ESTE GRUPO
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="grupos-vacio" style="
                                text-align: center;
                                padding: 30px;
                                background: rgba(0,0,0,0.3);
                                border-radius: 8px;
                                color: #888;
                            ">
                                <i class="fas fa-users" style="font-size: 2rem; color: #444; margin-bottom: 10px;"></i>
                                <p>${datos.escuderia.nombre} no pertenece a ningún grupo</p>
                            </div>
                        `}
                    </div>
                    
                    <div class="perfil-trofeos">
                        <h3>
                            <i class="fas fa-medal"></i>
                            TROFEOS
                        </h3>
                        
                        ${datos.trofeos.length > 0 ? `
                            <div class="trofeos-grid">
                                ${datos.trofeos.map(trofeo => `
                                    <div class="trofeo-item" title="${trofeo.descripcion}">
                                        <i class="fas ${trofeo.icono}" style="color: ${trofeo.color};"></i>
                                        <span>${trofeo.nombre}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="trofeos-vacio">
                                <i class="fas fa-medal"></i>
                                <p>Sin trofeos todavía</p>
                                <small>Los trofeos se desbloquearán con logros</small>
                            </div>
                        `}
                    </div>
                    
                    ${!esMiPerfil ? `
                        <div class="perfil-acciones" id="perfil-acciones-${datos.escuderia.id}" style="
                            display: flex;
                            gap: 10px;
                            justify-content: flex-end;
                            margin-top: 20px;
                        ">
                            <button class="btn-enviar-mensaje" onclick="window.perfilManager.abrirChat('${datos.escuderia.id}')">
                                <i class="fas fa-envelope"></i>
                                Mensaje
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    
        document.body.appendChild(modal);
        
        // Animar entrada
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
    
    // ========================
    // EDITAR DESCRIPCIÓN
    // ========================
    editarDescripcion() {
        const descripcionActual = this.perfilActual?.escuderia?.descripcion || '';
        
        const modalEditar = document.createElement('div');
        modalEditar.id = 'modal-editar-descripcion';
        modalEditar.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 500px;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-editar-descripcion').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="color: #00d2be; margin-bottom: 20px; font-size: 1.2rem;">
                        <i class="fas fa-pen"></i>
                        EDITAR DESCRIPCIÓN DEL EQUIPO
                    </h3>
                    
                    <textarea id="descripcion-input" 
                        style="
                            width: 100%;
                            height: 120px;
                            background: rgba(0,0,0,0.5);
                            border: 2px solid #00d2be;
                            border-radius: 6px;
                            color: white;
                            padding: 12px;
                            font-family: inherit;
                            font-size: 0.9rem;
                            margin-bottom: 15px;
                            resize: vertical;
                        ">${descripcionActual}</textarea>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="this.closest('#modal-editar-descripcion').remove()"
                            style="
                                padding: 10px 20px;
                                background: transparent;
                                border: 1px solid #666;
                                color: #aaa;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                            Cancelar
                        </button>
                        <button onclick="window.perfilManager.guardarDescripcion()"
                            style="
                                padding: 10px 20px;
                                background: linear-gradient(135deg, #00d2be, #0066cc);
                                border: none;
                                color: white;
                                border-radius: 4px;
                                cursor: pointer;
                                font-weight: bold;
                            ">
                            <i class="fas fa-save"></i>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalEditar);
    }

    // ========================
    // GUARDAR DESCRIPCIÓN
    // ========================
    async guardarDescripcion() {
        const input = document.getElementById('descripcion-input');
        if (!input) return;
        
        const nuevaDescripcion = input.value.trim();
        
        try {
            const { error } = await window.supabase
                .from('escuderias')
                .update({ descripcion: nuevaDescripcion })
                .eq('id', this.perfilActual?.escuderia?.id);
            
            if (error) throw error;
            
            if (this.perfilActual) {
                this.perfilActual.escuderia.descripcion = nuevaDescripcion;
            }
            
            document.getElementById('modal-editar-descripcion')?.remove();
            
            const descripcionElement = document.getElementById('perfil-descripcion');
            if (descripcionElement) {
                descripcionElement.innerHTML = nuevaDescripcion ? 
                    `<p>${nuevaDescripcion}</p>` : 
                    `<p class="perfil-descripcion-vacia">✏️ Haz clic en el lápiz para añadir una descripción</p>`;
            }
            
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('✅ Descripción actualizada', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error guardando descripción:', error);
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('❌ Error al guardar la descripción', 'error');
            }
        }
    }

    // ========================
    // SISTEMA DE MENSAJES (TODO IGUAL)
    // ========================
    
    async abrirChat(otraEscuderiaId) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) return;
    
        try {
            let conversacion = await this.obtenerConversacion(miId, otraEscuderiaId);
            
            if (!conversacion) {
                conversacion = await this.crearConversacion(miId, otraEscuderiaId);
            }
    
            this.mostrarModalChat(conversacion);
    
        } catch (error) {
            console.error('❌ Error abriendo chat:', error);
            this.mostrarNotificacion('❌ Error al abrir chat', 'error');
        }
    }
    
    async obtenerConversacion(esc1, esc2) {
        const { data, error } = await supabase
            .from('conversaciones')
            .select('*')
            .or(`and(escuderia1_id.eq.${esc1},escuderia2_id.eq.${esc2}),and(escuderia1_id.eq.${esc2},escuderia2_id.eq.${esc1})`)
            .maybeSingle();
    
        if (error) throw error;
        return data;
    }
    
    async crearConversacion(esc1, esc2) {
        const { data, error } = await supabase
            .from('conversaciones')
            .insert([{
                escuderia1_id: esc1,
                escuderia2_id: esc2
            }])
            .select()
            .single();
    
        if (error) throw error;
        return data;
    }
    
    mostrarModalChat(conversacion) {
        document.getElementById('modal-chat')?.remove();
    
        const otroUsuarioId = conversacion.escuderia1_id === window.f1Manager.escuderia.id 
            ? conversacion.escuderia2_id 
            : conversacion.escuderia1_id;
    
        const modal = document.createElement('div');
        modal.id = 'modal-chat';
        modal.innerHTML = `
            <div class="modal-chat-overlay" onclick="if(event.target === this) document.getElementById('modal-chat').remove()">
                <div class="modal-chat-contenedor">
                    <div class="modal-chat-header">
                        <h3><i class="fas fa-comment"></i> Chat</h3>
                        <button class="modal-chat-cerrar" onclick="document.getElementById('modal-chat').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-chat-mensajes" id="chat-mensajes-${conversacion.id}">
                        <div class="chat-loading">
                            <i class="fas fa-spinner fa-spin"></i> Cargando mensajes...
                        </div>
                    </div>
                    
                    <div class="modal-chat-input">
                        <textarea id="chat-input-${conversacion.id}" 
                            placeholder="Escribe un mensaje..."
                            rows="2"></textarea>
                        <button onclick="window.perfilManager.enviarMensaje('${conversacion.id}')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    
        document.body.appendChild(modal);
        this.cargarMensajes(conversacion.id);
        this.escucharMensajes(conversacion.id);
    }
    
    async cargarMensajes(conversacionId) {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select(`
                    *,
                    sender:escuderias!sender_id (
                        nombre
                    )
                `)
                .eq('conversacion_id', conversacionId)
                .order('created_at', { ascending: true });
    
            if (error) throw error;
    
            this.renderizarMensajes(conversacionId, data);
            await this.marcarMensajesLeidos(conversacionId);
    
        } catch (error) {
            console.error('❌ Error cargando mensajes:', error);
        }
    }
    
    renderizarMensajes(conversacionId, mensajes) {
        const contenedor = document.getElementById(`chat-mensajes-${conversacionId}`);
        if (!contenedor) return;
    
        if (mensajes.length === 0) {
            contenedor.innerHTML = `
                <div class="chat-vacio">
                    <i class="fas fa-comment-dots"></i>
                    <p>No hay mensajes todavía</p>
                    <small>Escribe el primer mensaje</small>
                </div>
            `;
            return;
        }
    
        const miId = window.f1Manager.escuderia.id;
        let html = '';
    
        mensajes.forEach(msg => {
            const esMio = msg.sender_id === miId;
            html += `
                <div class="chat-mensaje ${esMio ? 'propio' : 'ajeno'}">
                    <div class="chat-mensaje-contenido">
                        <div class="chat-mensaje-texto">${this.escapeHTML(msg.contenido)}</div>
                        <div class="chat-mensaje-info">
                            <span class="chat-mensaje-hora">
                                ${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                            ${esMio && msg.leido ? '<span class="chat-mensaje-leido">✓✓</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    
        contenedor.innerHTML = html;
        contenedor.scrollTop = contenedor.scrollHeight;
    }
    
    escucharMensajes(conversacionId) {
        const channel = supabase
            .channel(`mensajes:${conversacionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'mensajes',
                filter: `conversacion_id=eq.${conversacionId}`
            }, (payload) => {
                this.agregarMensajeNuevo(conversacionId, payload.new);
            })
            .subscribe();
    
        if (this.channelRef) {
            supabase.removeChannel(this.channelRef);
        }
        this.channelRef = channel;
    }
    
    async enviarMensaje(conversacionId) {
        const input = document.getElementById(`chat-input-${conversacionId}`);
        const contenido = input.value.trim();
        
        if (!contenido) return;
    
        try {
            const { error } = await supabase
                .from('mensajes')
                .insert([{
                    conversacion_id: conversacionId,
                    sender_id: window.f1Manager.escuderia.id,
                    contenido: contenido
                }]);
    
            if (error) throw error;
    
            input.value = '';
    
            await supabase
                .from('conversaciones')
                .update({
                    ultimo_mensaje: contenido,
                    ultimo_mensaje_time: new Date().toISOString()
                })
                .eq('id', conversacionId);
    
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            this.mostrarNotificacion('❌ Error al enviar mensaje', 'error');
        }
    }
    
    async marcarMensajesLeidos(conversacionId) {
        try {
            const { data: mensajes, error: selectError } = await supabase
                .from('mensajes')
                .select('id')
                .eq('conversacion_id', conversacionId)
                .eq('leido', false);
            
            if (selectError) throw selectError;
            
            if (!mensajes || mensajes.length === 0) return;
            
            for (const msg of mensajes) {
                const { error: updateError } = await supabase
                    .from('mensajes')
                    .update({ leido: true })
                    .eq('id', msg.id);
                
                if (updateError) console.error(`❌ Error con mensaje ${msg.id}:`, updateError);
            }
            
            if (typeof window.actualizarContadorMensajes === 'function') {
                await window.actualizarContadorMensajes();
            }
            
            if (typeof window.cargarConversaciones === 'function') {
                await window.cargarConversaciones();
            }
            
        } catch (error) {
            console.error('❌ Error general:', error);
        }
    }
    
    async contarMensajesNoLeidos() {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) return 0;
        
        const { count } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('leido', false)
            .neq('sender_id', miId);
        
        return count || 0;
    }
    
    agregarMensajeNuevo(conversacionId, mensaje) {
        const contenedor = document.getElementById(`chat-mensajes-${conversacionId}`);
        if (!contenedor) return;
    
        const vacio = contenedor.querySelector('.chat-vacio');
        if (vacio) vacio.remove();
    
        const esMio = mensaje.sender_id === window.f1Manager.escuderia.id;
        const msgHTML = `
            <div class="chat-mensaje ${esMio ? 'propio' : 'ajeno'}">
                <div class="chat-mensaje-contenido">
                    <div class="chat-mensaje-texto">${this.escapeHTML(mensaje.contenido)}</div>
                    <div class="chat-mensaje-info">
                        <span class="chat-mensaje-hora">
                            ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            </div>
        `;
    
        contenedor.insertAdjacentHTML('beforeend', msgHTML);
        contenedor.scrollTop = contenedor.scrollHeight;
    }
    
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        if (window.f1Manager?.showNotification) {
            window.f1Manager.showNotification(mensaje, tipo);
        } else {
            alert(mensaje);
        }
    }

    // ========================
    // RECARGAR PERFIL
    // ========================
    async recargarPerfil() {
        const idPerfil = this.perfilActual?.escuderia?.id;
        if (!idPerfil) return;
        
        const nuevosDatos = await this.cargarDatosPerfil(idPerfil);
        if (nuevosDatos) {
            this.perfilActual = nuevosDatos;
            this.crearModalPerfil(nuevosDatos, idPerfil === window.f1Manager?.escuderia?.id);
        }
    }

    // ========================
    // CERRAR MODAL
    // ========================
    cerrarModal() {
        const modal = document.getElementById('modal-perfil');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.remove();
                this.modalAbierto = false;
            }, 300);
        }
    }

    // ========================
    // MÉTODOS PARA CHAT EN PANEL (IGUAL)
    // ========================
    
    abrirChatDesdeLista(conversacionId, otroUsuarioId) {
        this.mostrarChatEnPanel(conversacionId, otroUsuarioId);
    }
    
    mostrarChatEnPanel(conversacionId, otroUsuarioId) {
        const panel = document.getElementById('panel-chat');
        if (!panel) return;
        
        document.querySelectorAll('.conversacion-item').forEach(el => {
            el.classList.remove('activa');
        });
        
        const itemActivo = document.querySelector(`[onclick*="${conversacionId}"]`);
        if (itemActivo) itemActivo.classList.add('activa');
        
        panel.innerHTML = `
            <div class="chat-panel-container" style="display: flex; flex-direction: column; height: 100%;">
                <div class="chat-panel-header" style="flex-shrink: 0;">
                    <div class="chat-panel-usuario">
                        <i class="fas fa-flag-checkered"></i>
                        <span>Cargando...</span>
                    </div>
                    <button class="chat-panel-cerrar" onclick="document.getElementById('panel-chat').innerHTML = '<div class=\\'chat-placeholder\\'><i class=\\'fas fa-comment-dots\\'></i><p>Selecciona una conversación</p></div>'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="chat-panel-mensajes" id="chat-panel-mensajes-${conversacionId}" 
                     style="flex: 1; overflow-y: auto; min-height: 0; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <div class="chat-loading">
                        <i class="fas fa-spinner fa-spin"></i> Cargando mensajes...
                    </div>
                </div>
                
                <div class="chat-panel-input" style="flex-shrink: 0; padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px; background: rgba(0,0,0,0.3);">
                    <textarea id="chat-panel-input-${conversacionId}" 
                        placeholder="Escribe un mensaje..."
                        rows="1"
                        style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #00d2be; border-radius: 5px; color: white; padding: 8px 12px; resize: none; font-family: inherit;"></textarea>
                    <button onclick="window.perfilManager.enviarMensajePanel('${conversacionId}')"
                        style="background: #00d2be; border: none; border-radius: 5px; color: #1a1a2e; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        supabase
            .from('escuderias')
            .select('nombre')
            .eq('id', otroUsuarioId)
            .single()
            .then(({ data }) => {
                const header = panel.querySelector('.chat-panel-usuario span');
                if (header) header.textContent = data?.nombre || 'Usuario';
            });
        
        this.cargarMensajesPanel(conversacionId);
        this.escucharMensajesPanel(conversacionId);
    }
    
    async cargarMensajesPanel(conversacionId) {
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select(`
                    *,
                    sender:escuderias!sender_id (
                        nombre
                    )
                `)
                .eq('conversacion_id', conversacionId)
                .order('created_at', { ascending: true });
    
            if (error) throw error;
    
            this.renderizarMensajesPanel(conversacionId, data);
            await this.marcarMensajesLeidos(conversacionId);
            
            if (typeof window.cargarConversaciones === 'function') {
                setTimeout(window.cargarConversaciones, 500);
            }
    
        } catch (error) {
            console.error('❌ Error cargando mensajes:', error);
        }
    }
    
    renderizarMensajesPanel(conversacionId, mensajes) {
        const contenedor = document.getElementById(`chat-panel-mensajes-${conversacionId}`);
        if (!contenedor) return;
    
        if (mensajes.length === 0) {
            contenedor.innerHTML = `
                <div class="chat-vacio">
                    <i class="fas fa-comment-dots"></i>
                    <p>No hay mensajes todavía</p>
                    <small>Escribe el primer mensaje</small>
                </div>
            `;
            return;
        }
    
        const miId = window.f1Manager.escuderia.id;
        let html = '';
    
        mensajes.forEach(msg => {
            const esMio = msg.sender_id === miId;
            html += `
                <div class="chat-mensaje ${esMio ? 'propio' : 'ajeno'}">
                    <div class="chat-mensaje-contenido">
                        <div class="chat-mensaje-texto">${this.escapeHTML(msg.contenido)}</div>
                        <div class="chat-mensaje-info">
                            <span class="chat-mensaje-hora">
                                ${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                            ${esMio && msg.leido ? '<span class="chat-mensaje-leido">✓✓</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    
        contenedor.innerHTML = html;
        contenedor.scrollTop = contenedor.scrollHeight;
    }
    
    escucharMensajesPanel(conversacionId) {
        if (this.panelChannelRef) {
            supabase.removeChannel(this.panelChannelRef);
        }
        
        const channel = supabase
            .channel(`panel-mensajes:${conversacionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'mensajes',
                filter: `conversacion_id=eq.${conversacionId}`
            }, (payload) => {
                this.agregarMensajeNuevoPanel(conversacionId, payload.new);
            })
            .subscribe();
    
        this.panelChannelRef = channel;
    }
    
    agregarMensajeNuevoPanel(conversacionId, mensaje) {
        const contenedor = document.getElementById(`chat-panel-mensajes-${conversacionId}`);
        if (!contenedor) return;
    
        const vacio = contenedor.querySelector('.chat-vacio');
        if (vacio) vacio.remove();
    
        const esMio = mensaje.sender_id === window.f1Manager.escuderia.id;
        const msgHTML = `
            <div class="chat-mensaje ${esMio ? 'propio' : 'ajeno'}">
                <div class="chat-mensaje-contenido">
                    <div class="chat-mensaje-texto">${this.escapeHTML(mensaje.contenido)}</div>
                    <div class="chat-mensaje-info">
                        <span class="chat-mensaje-hora">
                            ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            </div>
        `;
    
        contenedor.insertAdjacentHTML('beforeend', msgHTML);
        
        setTimeout(() => {
            contenedor.scrollTop = contenedor.scrollHeight;
        }, 50);
    }
    
    async enviarMensajePanel(conversacionId) {
        const input = document.getElementById(`chat-panel-input-${conversacionId}`);
        const contenido = input.value.trim();
        
        if (!contenido) return;
    
        try {
            const { error } = await supabase
                .from('mensajes')
                .insert([{
                    conversacion_id: conversacionId,
                    sender_id: window.f1Manager.escuderia.id,
                    contenido: contenido
                }]);
    
            if (error) throw error;
    
            input.value = '';
            
            setTimeout(() => {
                const contenedor = document.getElementById(`chat-panel-mensajes-${conversacionId}`);
                if (contenedor) {
                    contenedor.scrollTop = contenedor.scrollHeight;
                }
            }, 100);
    
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
        }
    }
}

// ========================
// ESTILOS DEL PERFIL
// ========================
const perfilStyles = `
    #modal-perfil, #modal-editar-descripcion, #modal-crear-grupo, #modal-miembros-grupo {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }
    
    #modal-perfil.visible, #modal-editar-descripcion, #modal-crear-grupo, #modal-miembros-grupo {
        opacity: 1;
        pointer-events: auto;
    }
    
    .modal-perfil-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 15px;
        overflow-y: auto;
    }
    
    .modal-perfil-contenedor {
        position: relative;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #00d2be;
        border-radius: 15px;
        padding: 30px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        color: white;
        box-shadow: 0 0 30px rgba(0, 210, 190, 0.3);
        transform: translateY(20px);
        transition: transform 0.3s ease;
    }
    
    #modal-perfil.visible .modal-perfil-contenedor {
        transform: translateY(0);
    }
    
    .modal-perfil-cerrar {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(225, 6, 0, 0.2);
        border: 2px solid #e10600;
        color: #e10600;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
        z-index: 10;
    }
    
    .modal-perfil-cerrar:hover {
        background: #e10600;
        color: white;
        transform: scale(1.1);
    }
    
    .perfil-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 2px solid rgba(0, 210, 190, 0.3);
    }
    
    .perfil-avatar {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #00d2be, #0066cc);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: white;
        box-shadow: 0 0 20px rgba(0, 210, 190, 0.5);
    }
    
    .perfil-titulo {
        flex: 1;
    }
    
    .perfil-titulo h2 {
        margin: 0 0 5px 0;
        font-size: 1.8rem;
        color: #00d2be;
        font-family: 'Orbitron', sans-serif;
    }
    
    .perfil-fecha-creacion {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #aaa;
        font-size: 0.85rem;
    }
    
    .perfil-btn-editar {
        background: rgba(0, 210, 190, 0.1);
        border: 2px solid #00d2be;
        color: #00d2be;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
    }
    
    .perfil-btn-editar:hover {
        background: #00d2be;
        color: black;
        transform: scale(1.1);
    }
    
    .perfil-publico-badge {
        background: rgba(0, 210, 190, 0.1);
        border: 1px solid #00d2be;
        color: #00d2be;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .perfil-descripcion {
        background: rgba(0, 0, 0, 0.3);
        border-left: 4px solid #00d2be;
        padding: 15px;
        margin-bottom: 25px;
        border-radius: 8px;
        font-style: italic;
        line-height: 1.5;
        color: #ddd;
    }
    
    .perfil-descripcion-vacia {
        color: #888;
        text-align: center;
        font-style: normal;
        margin: 0;
    }
    
    .perfil-estadisticas {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
    }
    
    .perfil-stat-card {
        background: rgba(0, 0, 0, 0.3);
        border-left: 4px solid;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        transition: transform 0.2s;
    }
    
    .perfil-stat-card:hover {
        transform: translateY(-2px);
    }
    
    .stat-icon {
        width: 45px;
        height: 45px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        color: #00d2be;
    }
    
    .stat-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .stat-label {
        font-size: 0.7rem;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .stat-valor {
        font-size: 1.1rem;
        font-weight: bold;
        color: white;
        margin-top: 2px;
    }
    
    .perfil-grupos {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
    }
    
    .perfil-grupos h3 {
        color: #00d2be;
        margin: 0 0 15px 0;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .grupo-item {
        transition: all 0.2s;
    }
    
    .grupo-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 210, 190, 0.3);
    }
    
    .btn-crear-grupo {
        margin-top: 15px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #00d2be, #0066cc);
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s;
    }
    
    .btn-crear-grupo:hover {
        transform: translateY(-2px);
    }
    
    .btn-unirse-grupo {
        margin-top: 15px;
        padding: 10px 20px;
        background: rgba(0, 210, 190, 0.1);
        border: 1px solid #00d2be;
        color: #00d2be;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
    }
    
    .btn-unirse-grupo:hover {
        background: #00d2be;
        color: #1a1a2e;
    }
    
    .perfil-trofeos {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
    }
    
    .perfil-trofeos h3 {
        color: #FFD700;
        margin: 0 0 15px 0;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .trofeos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }
    
    .trofeo-item {
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 6px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        text-align: center;
        font-size: 0.8rem;
    }
    
    .trofeo-item i {
        font-size: 1.5rem;
    }
    
    .trofeos-vacio {
        text-align: center;
        padding: 20px;
        color: #888;
    }
    
    .trofeos-vacio i {
        font-size: 2rem;
        color: #444;
        margin-bottom: 10px;
    }
    
    .perfil-acciones {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .btn-enviar-mensaje {
        padding: 10px 20px;
        background: rgba(0, 210, 190, 0.1);
        border: 1px solid #00d2be;
        color: #00d2be;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-enviar-mensaje:hover {
        background: #00d2be;
        color: #1a1a2e;
        transform: translateY(-2px);
    }
    
    /* Modal de chat (sin cambios) */
    .modal-chat-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2147483647;
    }
    
    .modal-chat-contenedor {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #00d2be;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        height: 600px;
        display: flex;
        flex-direction: column;
        color: white;
    }
    
    .modal-chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .modal-chat-header h3 {
        margin: 0;
        color: #00d2be;
        font-family: 'Orbitron', sans-serif;
    }
    
    .modal-chat-cerrar {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-chat-cerrar:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .modal-chat-mensajes {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .chat-loading, .chat-vacio {
        text-align: center;
        padding: 40px 20px;
        color: #888;
    }
    
    .chat-vacio i {
        font-size: 2rem;
        color: #444;
        margin-bottom: 10px;
    }
    
    .chat-mensaje {
        display: flex;
        margin-bottom: 10px;
    }
    
    .chat-mensaje.propio {
        justify-content: flex-end;
    }
    
    .chat-mensaje.ajeno {
        justify-content: flex-start;
    }
    
    .chat-mensaje-contenido {
        max-width: 70%;
        padding: 8px 12px;
        border-radius: 12px;
        position: relative;
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
    
    .chat-mensaje-texto {
        word-wrap: break-word;
        margin-bottom: 4px;
    }
    
    .chat-mensaje-info {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 5px;
        font-size: 0.65rem;
        opacity: 0.7;
    }
    
    .chat-mensaje-leido {
        color: #00d2be;
    }
    
    .modal-chat-input {
        padding: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 10px;
    }
    
    .modal-chat-input textarea {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #00d2be;
        border-radius: 8px;
        color: white;
        padding: 8px 12px;
        resize: none;
        font-family: inherit;
    }
    
    .modal-chat-input button {
        background: #00d2be;
        border: none;
        border-radius: 8px;
        color: #1a1a2e;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }
    
    .modal-chat-input button:hover {
        background: #00fff0;
    }
    
    #panel-chat {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }
    
    .chat-panel-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }
    
    .chat-panel-mensajes {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .chat-panel-input {
        flex-shrink: 0;
        padding: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.3);
    }
    
    .chat-panel-input textarea {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #00d2be;
        border-radius: 5px;
        color: white;
        padding: 8px 12px;
        resize: none;
        font-family: inherit;
        max-height: 80px;
    }
    
    .chat-panel-input button {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: #00d2be;
        border: none;
        border-radius: 5px;
        color: #1a1a2e;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }
    
    .chat-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #888;
    }
    
    @media (max-width: 768px) {
        .modal-perfil-contenedor {
            padding: 20px;
        }
        
        .perfil-header {
            flex-direction: column;
            text-align: center;
        }
        
        .perfil-titulo h2 {
            font-size: 1.4rem;
        }
        
        .perfil-estadisticas {
            grid-template-columns: 1fr;
        }
        
        .perfil-acciones {
            flex-direction: column;
        }
    }
`;

// Añadir estilos al head
const styleElement = document.createElement('style');
styleElement.textContent = perfilStyles;
document.head.appendChild(styleElement);

// ========================
// FUNCIONES GLOBALES PARA MENSAJES
// ========================

// Cargar lista de conversaciones
async function cargarConversaciones() {
    const miId = window.f1Manager?.escuderia?.id;
    if (!miId) return;
    
    const { data } = await supabase
        .from('conversaciones')
        .select(`
            *,
            escuderia1:escuderias!conversaciones_escuderia1_id_fkey (id, nombre),
            escuderia2:escuderias!conversaciones_escuderia2_id_fkey (id, nombre),
            ultimo_mensaje,
            ultimo_mensaje_time
        `)
        .or(`escuderia1_id.eq.${miId},escuderia2_id.eq.${miId}`)
        .order('ultimo_mensaje_time', { ascending: false });
    
    renderizarConversaciones(data);
}

// Renderizar conversaciones
async function renderizarConversaciones(conversaciones) {
    const contenedor = document.getElementById('lista-conversaciones');
    if (!contenedor) return;
    
    if (!conversaciones?.length) {
        contenedor.innerHTML = '<div class="sin-conversaciones">No tienes conversaciones</div>';
        return;
    }
    
    const miId = window.f1Manager.escuderia.id;
    
    const promesasContadores = conversaciones.map(async (conv) => {
        const { count } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('conversacion_id', conv.id)
            .eq('leido', false)
            .neq('sender_id', miId);
        
        return { conversacionId: conv.id, noLeidos: count || 0 };
    });
    
    const contadores = await Promise.all(promesasContadores);
    const mapaContadores = Object.fromEntries(
        contadores.map(c => [c.conversacionId, c.noLeidos])
    );
    
    let html = '';
    
    for (const conv of conversaciones) {
        const otro = conv.escuderia1_id === miId ? conv.escuderia2 : conv.escuderia1;
        const noLeidos = mapaContadores[conv.id] || 0;

        html += `
            <div class="conversacion-item ${noLeidos > 0 ? 'tiene-no-leidos' : ''}" 
                 onclick="window.perfilManager.abrirChatDesdeLista('${conv.id}', '${otro.id}')"
                 data-conversacion-id="${conv.id}">
                <div class="conversacion-avatar">
                    <i class="fas fa-flag-checkered"></i>
                </div>
                <div class="conversacion-info">
                    <div class="conversacion-nombre">${otro.nombre}</div>
                    <div class="conversacion-ultimo">${conv.ultimo_mensaje || 'Sin mensajes'}</div>
                </div>
                ${noLeidos > 0 ? `<span class="conversacion-no-leidos">${noLeidos}</span>` : ''}
            </div>
        `;
    }
    
    contenedor.innerHTML = html;
}

// Actualizar contador global de mensajes
async function actualizarContadorMensajes() {
    const miId = window.f1Manager?.escuderia?.id;
    if (!miId) return;
    
    try {
        const { data: conversaciones, error: convError } = await supabase
            .from('conversaciones')
            .select('id')
            .or(`escuderia1_id.eq.${miId},escuderia2_id.eq.${miId}`);
        
        if (convError || !conversaciones) return;
        
        if (conversaciones.length === 0) {
            const contador = document.getElementById('mensajes-contador');
            if (contador) contador.style.display = 'none';
            return;
        }
        
        let totalNoLeidos = 0;
        
        for (const conv of conversaciones) {
            const { count, error: msgError } = await supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('conversacion_id', conv.id)
                .eq('leido', false)
                .neq('sender_id', miId);
            
            if (msgError) continue;
            
            totalNoLeidos += count || 0;
        }
        
        const contador = document.getElementById('mensajes-contador');
        if (contador) {
            if (totalNoLeidos > 0) {
                contador.textContent = totalNoLeidos > 99 ? '99+' : totalNoLeidos;
                contador.style.display = 'flex';
            } else {
                contador.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('❌ Error en actualizarContadorMensajes:', error);
    }
}

// Iniciar polling de mensajes no leídos
setInterval(actualizarContadorMensajes, 30000);
setTimeout(actualizarContadorMensajes, 2000);

// Función para iniciar chat con cualquier usuario
window.iniciarChatConUsuario = async function(otroUsuarioId, otroUsuarioNombre) {
    const miId = window.f1Manager?.escuderia?.id;
    if (!miId) return;
    
    if (miId === otroUsuarioId) {
        alert('No puedes chatear contigo mismo');
        return;
    }
    
    try {
        let conversacion = await window.perfilManager.obtenerConversacion(miId, otroUsuarioId);
        
        if (!conversacion) {
            conversacion = await window.perfilManager.crearConversacion(miId, otroUsuarioId);
        }
        
        window.perfilManager.abrirChatDesdeLista(conversacion.id, otroUsuarioId);
        
        document.getElementById('buscador-usuarios').value = '';
        cargarConversaciones();
        
    } catch (error) {
        console.error('Error iniciando chat:', error);
        alert('Error al iniciar chat');
    }
};

// Buscador de usuarios
document.addEventListener('input', async function(e) {
    if (e.target.id === 'buscador-usuarios') {
        const busqueda = e.target.value.trim();
        const contenedor = document.getElementById('lista-conversaciones');
        
        if (busqueda.length < 2) {
            cargarConversaciones();
            return;
        }
        
        contenedor.innerHTML = '<div class="sin-conversaciones"><i class="fas fa-spinner fa-spin"></i> Buscando...</div>';
        
        try {
            const { data: usuarios, error } = await supabase
                .from('escuderias')
                .select('id, nombre')
                .ilike('nombre', `%${busqueda}%`)
                .limit(20);
            
            if (error) throw error;
            
            if (!usuarios || usuarios.length === 0) {
                contenedor.innerHTML = '<div class="sin-conversaciones">No se encontraron usuarios</div>';
                return;
            }
            
            let html = '<div class="resultados-busqueda">';
            
            usuarios.forEach(usuario => {
                html += `
                    <div class="conversacion-item resultado-busqueda-item" 
                         onclick="window.iniciarChatConUsuario('${usuario.id}', '${usuario.nombre}')">
                        <div class="conversacion-avatar">
                            <i class="fas fa-flag-checkered"></i>
                        </div>
                        <div class="conversacion-info">
                            <div class="conversacion-nombre">${usuario.nombre}</div>
                            <div class="conversacion-ultimo">👤 Click para chatear</div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            contenedor.innerHTML = html;
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            contenedor.innerHTML = '<div class="sin-conversaciones">Error al buscar usuarios</div>';
        }
    }
});

// ========================
// INICIALIZACIÓN
// ========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Inicializando PerfilManager...');
    
    if (!window.perfilManager) {
        window.perfilManager = new PerfilManager();
    }
    
    // Configurar evento para abrir perfil al hacer clic en el nombre
    setTimeout(() => {
        const nombreEscuderia = document.getElementById('escuderia-nombre');
        if (nombreEscuderia) {
            nombreEscuderia.style.cursor = 'pointer';
            nombreEscuderia.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.perfilManager) {
                    window.perfilManager.mostrarPerfil();
                }
            });
        }
    }, 2000);
});

console.log('✅ Sistema de perfiles listo');

// ========================
// EXPONER PERFIL MANAGER GLOBALMENTE
// ========================
window.perfilManager = new PerfilManager();

// ========================
// EXPONER FUNCIONES GLOBALES
// ========================
window.cargarConversaciones = cargarConversaciones;
window.actualizarContadorMensajes = actualizarContadorMensajes;

console.log('✅ PerfilManager instanciado globalmente');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.perfilManager) {
            window.perfilManager = new PerfilManager();
        }
        console.log('👤 PerfilManager listo (DOMContentLoaded)');
    });
} else {
    if (!window.perfilManager) {
        window.perfilManager = new PerfilManager();
    }
    console.log('👤 PerfilManager listo inmediatamente');
}
