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
    // SOLICITUDES DE GRUPO
    // ========================
    
    /**
     * Enviar solicitud para unirse a un grupo
     */
    // ========================
    // SOLICITAR UNIRSE A GRUPO (versión corregida)
    // ========================
    async solicitarUnirseAGrupo(grupoId, grupoNombre) {
        const miId = window.f1Manager?.escuderia?.id;
        const miNombre = window.f1Manager?.escuderia?.nombre;
        
        if (!miId) {
            this.mostrarNotificacion('❌ No has iniciado sesión', 'error');
            return;
        }
        
        try {
            // Verificar si ya es miembro del grupo
            const { data: miembro } = await supabase
                .from('grupo_miembros')
                .select('*')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .maybeSingle();
            
            if (miembro) {
                this.mostrarNotificacion('❌ Ya eres miembro de este grupo', 'error');
                return;
            }
            
            // Verificar si ya tiene una solicitud pendiente
            const { data: solicitudExistente } = await supabase
                .from('grupo_solicitudes')
                .select('*')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .maybeSingle();
            
            if (solicitudExistente) {
                if (solicitudExistente.estado === 'pendiente') {
                    this.mostrarNotificacion('⏳ Ya tienes una solicitud pendiente para este grupo', 'info');
                } else if (solicitudExistente.estado === 'aceptada') {
                    this.mostrarNotificacion('❌ Ya eres miembro de este grupo', 'error');
                } else if (solicitudExistente.estado === 'rechazada') {
                    // Si fue rechazada, permitir enviar nueva
                    this.mostrarNotificacion('❌ Tu solicitud anterior fue rechazada. Puedes intentar de nuevo.', 'error');
                }
                return;
            }
            
            // Crear nueva solicitud
            const { data: nuevaSolicitud, error } = await supabase
                .from('grupo_solicitudes')
                .insert([{
                    grupo_id: grupoId,
                    escuderia_id: miId,
                    estado: 'pendiente',
                    fecha_solicitud: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Obtener los administradores del grupo para notificarles
            const { data: admins } = await supabase
                .from('grupo_miembros')
                .select('escuderia_id')
                .eq('grupo_id', grupoId)
                .eq('es_admin', true);
            
            // Notificar a cada administrador (guardando el ID de la solicitud en tipo_relacion)
            for (const admin of admins || []) {
                const { data: adminUser } = await supabase
                    .from('escuderias')
                    .select('user_id')
                    .eq('id', admin.escuderia_id)
                    .single();
                
                if (adminUser?.user_id && window.notificacionesManager) {
                    await window.notificacionesManager.crearNotificacion(
                        adminUser.user_id,
                        'grupo_solicitud',
                        '👥 Solicitud para unirse al grupo',
                        `${miNombre} quiere unirse a "${grupoNombre}"`,
                        nuevaSolicitud.id, // Pasamos el ID de la solicitud (UUID)
                        'grupo_solicitud'
                    );
                }
            }
            
            this.mostrarNotificacion('✅ Solicitud enviada al administrador del grupo', 'success');
            
            // Recargar perfil para actualizar el botón
            setTimeout(() => this.recargarPerfil(), 1000);
            
        } catch (error) {
            console.error('❌ Error enviando solicitud:', error);
            this.mostrarNotificacion('❌ Error al enviar la solicitud', 'error');
        }
    }
    
    /**
     * Aceptar solicitud de unión a grupo (desde notificación)
     */
    // ========================
    // ACEPTAR SOLICITUD DE GRUPO (mejorado con notificación al solicitante)
    // ========================
    async aceptarSolicitudGrupo(solicitudId) {
        try {
            // Obtener datos de la solicitud
            const { data: solicitud, error: errorSolicitud } = await supabase
                .from('grupo_solicitudes')
                .select('*, grupo:grupos_amigos(*), escuderia:escuderias(*)')
                .eq('id', solicitudId)
                .single();
            
            if (errorSolicitud || !solicitud) throw errorSolicitud;
            
            // Verificar que el grupo no esté lleno
            const { data: miembros, count } = await supabase
                .from('grupo_miembros')
                .select('*', { count: 'exact' })
                .eq('grupo_id', solicitud.grupo_id);
            
            if (count >= solicitud.grupo.max_miembros) {
                this.mostrarNotificacion('❌ El grupo ha alcanzado el máximo de miembros', 'error');
                
                // Rechazar automáticamente la solicitud
                await supabase
                    .from('grupo_solicitudes')
                    .update({ estado: 'rechazada', fecha_respuesta: new Date().toISOString() })
                    .eq('id', solicitudId);
                
                return;
            }
            
            // Añadir al usuario como miembro del grupo
            const { error: errorMiembro } = await supabase
                .from('grupo_miembros')
                .insert([{
                    grupo_id: solicitud.grupo_id,
                    escuderia_id: solicitud.escuderia_id,
                    es_admin: false,
                    fecha_ingreso: new Date().toISOString()
                }]);
            
            if (errorMiembro) throw errorMiembro;
            
            // Actualizar la solicitud como aceptada
            const { error: errorUpdate } = await supabase
                .from('grupo_solicitudes')
                .update({ estado: 'aceptada', fecha_respuesta: new Date().toISOString() })
                .eq('id', solicitudId);
            
            if (errorUpdate) throw errorUpdate;
            
            // Actualizar la escudería del usuario
            await supabase
                .from('escuderias')
                .update({ grupo_id: solicitud.grupo_id })
                .eq('id', solicitud.escuderia_id);
            
            // NOTIFICAR AL SOLICITANTE que fue aceptado
            const { data: usuario } = await supabase
                .from('escuderias')
                .select('user_id')
                .eq('id', solicitud.escuderia_id)
                .single();
            
            if (usuario?.user_id && window.notificacionesManager) {
                await window.notificacionesManager.crearNotificacion(
                    usuario.user_id,
                    'grupo_aceptada',
                    '✅ Solicitud aceptada',
                    `¡Has sido aceptado en el grupo "${solicitud.grupo.nombre}"!`,
                    null, // No necesitamos ID aquí
                    'grupo_aceptada'
                );
            }
            
            this.mostrarNotificacion('✅ Solicitud aceptada. El usuario ha sido añadido al grupo.', 'success');
            
            // Recargar perfil si está abierto
            if (this.modalAbierto) {
                this.recargarPerfil();
            }
            
        } catch (error) {
            console.error('❌ Error aceptando solicitud:', error);
            this.mostrarNotificacion('❌ Error al aceptar la solicitud', 'error');
        }
    }
    
    /**
     * Rechazar solicitud de unión a grupo (desde notificación)
     */
    // ========================
    // RECHAZAR SOLICITUD DE GRUPO (mejorado con notificación al solicitante)
    // ========================
    async rechazarSolicitudGrupo(solicitudId) {
        try {
            // Obtener datos de la solicitud para la notificación
            const { data: solicitud, error: errorSolicitud } = await supabase
                .from('grupo_solicitudes')
                .select('*, grupo:grupos_amigos(*), escuderia:escuderias(*)')
                .eq('id', solicitudId)
                .single();
            
            if (errorSolicitud || !solicitud) throw errorSolicitud;
            
            // Actualizar la solicitud como rechazada
            const { error } = await supabase
                .from('grupo_solicitudes')
                .update({ estado: 'rechazada', fecha_respuesta: new Date().toISOString() })
                .eq('id', solicitudId);
            
            if (error) throw error;
            
            // NOTIFICAR AL SOLICITANTE que fue rechazado
            const { data: usuario } = await supabase
                .from('escuderias')
                .select('user_id')
                .eq('id', solicitud.escuderia_id)
                .single();
            
            if (usuario?.user_id && window.notificacionesManager) {
                await window.notificacionesManager.crearNotificacion(
                    usuario.user_id,
                    'grupo_rechazada',
                    '❌ Solicitud rechazada',
                    `Tu solicitud para unirte al grupo "${solicitud.grupo.nombre}" ha sido rechazada`,
                    null,
                    'grupo_rechazada'
                );
            }
            
            this.mostrarNotificacion('✅ Solicitud rechazada', 'success');
            
        } catch (error) {
            console.error('❌ Error rechazando solicitud:', error);
            this.mostrarNotificacion('❌ Error al rechazar la solicitud', 'error');
        }
    }
    
    /**
     * Verificar si el usuario actual tiene solicitud pendiente para un grupo
     */
    async verificarSolicitudGrupo(grupoId) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId || !grupoId) return null;
        
        try {
            const { data, error } = await supabase
                .from('grupo_solicitudes')
                .select('*')
                .eq('grupo_id', grupoId)
                .eq('escuderia_id', miId)
                .maybeSingle();
            
            if (error) throw error;
            return data;
            
        } catch (error) {
            console.error('❌ Error verificando solicitud:', error);
            return null;
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

            // 4. MEJOR VUELTA (último tiempo registrado)
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

            // 6. GRUPO DE AMIGOS CON MIEMBROS
            let grupo = null;
            if (escuderia.grupo_id) {
                const { data: grupoData, error: errorGrupo } = await supabase
                    .from('grupos_amigos')
                    .select(`
                        id,
                        nombre,
                        descripcion,
                        codigo_invitacion,
                        creador_id,
                        max_miembros,
                        es_publico,
                        fecha_creacion
                    `)
                    .eq('id', escuderia.grupo_id)
                    .single();
                
                if (!errorGrupo && grupoData) {
                    // Obtener miembros del grupo
                    const miembros = await this.obtenerMiembrosGrupo(grupoData.id);
                    
                    grupo = {
                        ...grupoData,
                        miembros: miembros,
                        miembros_count: miembros.length,
                        esCreador: grupoData.creador_id === escuderiaId
                    };
                }
            }

            // 7. TROFEOS (para implementar después)
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
                grupo,
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
        // Eliminar modal existente si hay
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
                        
                        <!-- 🔴 BOTÓN DE EDITAR (solo para el propietario) -->
                        ${esMiPerfil ? `
                            <button class="perfil-btn-editar" onclick="window.perfilManager.editarDescripcion()">
                                <i class="fas fa-pen"></i>
                            </button>
                        ` : `
                            <!-- Badge de perfil público (solo para visitantes) -->
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
                    
                    <div class="perfil-grupo">
                        <h3>
                            <i class="fas fa-user-friends"></i>
                            GRUPO DE AMIGOS
                        </h3>
                        
                        <!-- Mostrar información del grupo actual SI existe -->
                        ${datos.grupo ? `
                            <div class="grupo-info" style="margin-bottom: 20px;">
                                <div class="grupo-nombre">
                                    <i class="fas fa-users" style="color: #00d2be;"></i>
                                    <span>${datos.grupo.nombre}</span>
                                    ${datos.grupo.esCreador ? '<span class="grupo-creador-badge">👑 CREADOR</span>' : ''}
                                </div>
                                
                                ${datos.grupo.descripcion ? `
                                    <div class="grupo-descripcion">
                                        <p>${datos.grupo.descripcion}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="grupo-miembros-lista">
                                    <div class="grupo-miembros-header">
                                        <span><i class="fas fa-users"></i> MIEMBROS (${datos.grupo.miembros_count}/${datos.grupo.max_miembros})</span>
                                    </div>
                                    
                                    <div class="grupo-miembros-grid">
                                        ${datos.grupo.miembros.map(m => `
                                            <div class="grupo-miembro-item" onclick="window.perfilManager.abrirPerfilUsuario('${m.escuderia.id}')">
                                                <div class="miembro-avatar">
                                                    <i class="fas fa-flag-checkered"></i>
                                                    ${m.es_admin ? '<span class="miembro-admin" title="Administrador">👑</span>' : ''}
                                                </div>
                                                <div class="miembro-info">
                                                    <div class="miembro-nombre">${m.escuderia.nombre}</div>
                                                    <div class="miembro-desde">
                                                        ${new Date(m.fecha_ingreso).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                ${datos.grupo.codigo_invitacion && datos.grupo.esCreador ? `
                                    <div class="grupo-codigo-admin" onclick="window.perfilManager.copiarCodigo('${datos.grupo.codigo_invitacion}')">
                                        <i class="fas fa-link"></i>
                                        <span>Código: ${datos.grupo.codigo_invitacion}</span>
                                        <small>(click para copiar - solo visible para ti)</small>
                                    </div>
                                ` : ''}
                                
                                <!-- 🔴 BOTÓN DE SOLICITUD PARA USUARIOS NO MIEMBROS (si no es mi perfil) -->
                                ${!esMiPerfil ? `
                                    <div id="boton-solicitud-grupo-${datos.grupo.id}" class="grupo-solicitud-container" style="margin-top: 15px;">
                                        <div class="solicitud-loading">
                                            <i class="fas fa-spinner fa-spin"></i> Cargando...
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <!-- Mensaje cuando NO tiene grupo -->
                            <div class="grupo-vacio" style="margin-bottom: 20px;">
                                <i class="fas fa-user-friends"></i>
                                <p>${datos.escuderia.nombre} no pertenece a ningún grupo</p>
                            </div>
                        `}
                        
                        <!-- SOLO PARA EL PROPIETARIO: opciones de crear grupo -->
                        ${esMiPerfil ? `
                            <div class="grupo-acciones" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                                <p style="color: #aaa; font-size: 0.8rem; margin-bottom: 10px;">
                                    <i class="fas fa-cog"></i> GESTIÓN DE GRUPOS:
                                </p>
                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <button class="btn-crear-grupo" onclick="window.perfilManager.mostrarOpcionesGrupo()" style="flex: 1;">
                                        <i class="fas fa-plus-circle"></i>
                                        CREAR NUEVO GRUPO
                                    </button>
                                </div>
                                <p style="color: #888; font-size: 0.7rem; margin-top: 10px; text-align: center;">
                                    <i class="fas fa-info-circle"></i>
                                    Como creador del grupo, recibirás notificaciones cuando alguien quiera unirse
                                </p>
                            </div>
                        ` : ''}
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
                </div>
            </div>
        `;
    
        document.body.appendChild(modal);
        
        // Si hay un grupo y no es mi perfil, cargar el estado de la solicitud
        if (!esMiPerfil && datos.grupo) {
            console.log('🔄 Cargando estado de solicitud para grupo:', datos.grupo.id);
            this.cargarEstadoSolicitud(datos.grupo.id);
        }
        
        // Animar entrada
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
    
    // ========================
    // CARGAR ESTADO DE SOLICITUD PARA MOSTRAR BOTÓN CORRECTO
    // ========================
    async cargarEstadoSolicitud(grupoId) {
        const contenedor = document.getElementById(`boton-solicitud-grupo-${grupoId}`);
        if (!contenedor) return;
        
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) {
            contenedor.innerHTML = `
                <button class="btn-solicitud-grupo" disabled style="opacity: 0.5;">
                    <i class="fas fa-lock"></i>
                    Inicia sesión para solicitar
                </button>
            `;
            return;
        }
        
        // Verificar si ya es miembro
        const { data: miembro } = await supabase
            .from('grupo_miembros')
            .select('*')
            .eq('grupo_id', grupoId)
            .eq('escuderia_id', miId)
            .maybeSingle();
        
        if (miembro) {
            contenedor.innerHTML = `
                <button class="btn-solicitud-grupo" disabled style="background: rgba(76, 175, 80, 0.2); border-color: #4CAF50; color: #4CAF50;">
                    <i class="fas fa-check-circle"></i>
                    Ya eres miembro
                </button>
            `;
            return;
        }
        
        // Verificar solicitud existente
        const solicitud = await this.verificarSolicitudGrupo(grupoId);
        
        if (solicitud) {
            if (solicitud.estado === 'pendiente') {
                contenedor.innerHTML = `
                    <button class="btn-solicitud-grupo" disabled style="background: rgba(255, 152, 0, 0.2); border-color: #FF9800; color: #FF9800;">
                        <i class="fas fa-clock"></i>
                        Solicitud pendiente
                    </button>
                `;
            } else if (solicitud.estado === 'aceptada') {
                contenedor.innerHTML = `
                    <button class="btn-solicitud-grupo" disabled style="background: rgba(76, 175, 80, 0.2); border-color: #4CAF50; color: #4CAF50;">
                        <i class="fas fa-check-circle"></i>
                        Ya eres miembro
                    </button>
                `;
            } else if (solicitud.estado === 'rechazada') {
                contenedor.innerHTML = `
                    <button class="btn-solicitud-grupo" onclick="window.perfilManager.solicitarUnirseAGrupo('${grupoId}', '${this.perfilActual?.grupo?.nombre}')">
                        <i class="fas fa-user-plus"></i>
                        Solicitar unirse al grupo
                    </button>
                `;
            }
        } else {
            // No hay solicitud, mostrar botón para solicitar
            contenedor.innerHTML = `
                <button class="btn-solicitud-grupo" onclick="window.perfilManager.solicitarUnirseAGrupo('${grupoId}', '${this.perfilActual?.grupo?.nombre}')">
                    <i class="fas fa-user-plus"></i>
                    Solicitar unirse al grupo
                </button>
            `;
        }
    }

    // ========================
    // EDITAR DESCRIPCIÓN
    // ========================
    editarDescripcion() {
        const descripcionActual = this.perfilActual?.escuderia?.descripcion || '';
        
        // Crear modal de edición
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
            
            // Actualizar perfil actual
            if (this.perfilActual) {
                this.perfilActual.escuderia.descripcion = nuevaDescripcion;
            }
            
            // Cerrar modal de edición
            document.getElementById('modal-editar-descripcion')?.remove();
            
            // Actualizar descripción en el perfil
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
    // OBTENER MIEMBROS DEL GRUPO
    // ========================
    async obtenerMiembrosGrupo(grupoId) {
        try {
            const { data, error } = await supabase
                .from('grupo_miembros')
                .select(`
                    id,
                    es_admin,
                    fecha_ingreso,
                    escuderia:escuderias!grupo_miembros_escuderia_id_fkey (
                        id,
                        nombre,
                        puntos,
                        dinero,
                        ultimo_login_dia
                    )
                `)
                .eq('grupo_id', grupoId)
                .order('es_admin', { ascending: false })
                .order('fecha_ingreso', { ascending: true });
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Error obteniendo miembros:', error);
            return [];
        }
    }
    
    // ========================
    // MOSTRAR FORMULARIO CREAR GRUPO
    // ========================
    mostrarOpcionesGrupo() {
        const modal = document.createElement('div');
        modal.id = 'modal-crear-grupo';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 500px;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-crear-grupo').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="color: #00d2be; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-users"></i>
                        CREAR GRUPO DE AMIGOS
                    </h3>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">
                            <i class="fas fa-tag"></i> NOMBRE DEL GRUPO *
                        </label>
                        <input type="text" id="nombre-grupo" 
                            placeholder="Ej: Los Velocistas"
                            style="
                                width: 100%;
                                padding: 12px;
                                background: rgba(0,0,0,0.5);
                                border: 2px solid #00d2be;
                                border-radius: 6px;
                                color: white;
                                font-size: 0.9rem;
                            ">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">
                            <i class="fas fa-align-left"></i> DESCRIPCIÓN
                        </label>
                        <textarea id="descripcion-grupo" 
                            placeholder="Describe el propósito del grupo..."
                            rows="3"
                            style="
                                width: 100%;
                                padding: 12px;
                                background: rgba(0,0,0,0.5);
                                border: 2px solid #00d2be;
                                border-radius: 6px;
                                color: white;
                                font-size: 0.9rem;
                                resize: vertical;
                            "></textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">
                                <i class="fas fa-users"></i> MÁX. MIEMBROS
                            </label>
                            <select id="max-miembros-grupo" style="
                                width: 100%;
                                padding: 12px;
                                background: rgba(0,0,0,0.5);
                                border: 2px solid #00d2be;
                                border-radius: 6px;
                                color: white;
                            ">
                                <option value="5">5 miembros</option>
                                <option value="10" selected>10 miembros</option>
                                <option value="15">15 miembros</option>
                                <option value="20">20 miembros</option>
                                <option value="30">30 miembros</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">
                                <i class="fas fa-globe"></i> VISIBILIDAD
                            </label>
                            <div style="
                                padding: 12px;
                                background: rgba(0,0,0,0.5);
                                border: 2px solid #00d2be;
                                border-radius: 6px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <input type="checkbox" id="grupo-publico">
                                <label for="grupo-publico" style="color: white;">Grupo público</label>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(0,210,190,0.1); padding: 12px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="color: #aaa; font-size: 0.8rem; margin: 0;">
                            <i class="fas fa-info-circle" style="color: #00d2be;"></i>
                            Al crear el grupo, recibirás un código de invitación que podrás compartir con tus amigos.
                            Solo tú verás este código.
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="this.closest('#modal-crear-grupo').remove()"
                            style="
                                padding: 12px 25px;
                                background: transparent;
                                border: 1px solid #666;
                                color: #aaa;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: bold;
                            ">
                            CANCELAR
                        </button>
                        <button onclick="window.perfilManager.crearGrupo()"
                            style="
                                padding: 12px 25px;
                                background: linear-gradient(135deg, #00d2be, #0066cc);
                                border: none;
                                color: white;
                                border-radius: 6px;
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
    
    // ========================
    // CREAR GRUPO
    // ========================
    async crearGrupo() {
        const nombreInput = document.getElementById('nombre-grupo');
        const descripcionInput = document.getElementById('descripcion-grupo');
        const maxMiembrosInput = document.getElementById('max-miembros-grupo');
        const esPublicoCheck = document.getElementById('grupo-publico');
        
        if (!nombreInput) return;
        
        const nombre = nombreInput.value.trim();
        const descripcion = descripcionInput ? descripcionInput.value.trim() : '';
        const maxMiembros = maxMiembrosInput ? parseInt(maxMiembrosInput.value) || 10 : 10;
        const esPublico = esPublicoCheck ? esPublicoCheck.checked : false;
        
        if (!nombre) {
            this.mostrarNotificacion('Por favor, introduce un nombre para el grupo', 'error');
            return;
        }
        
        try {
            // Generar código de invitación único
            const codigoInvitacion = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Crear grupo
            const { data: grupo, error: errorGrupo } = await window.supabase
                .from('grupos_amigos')
                .insert([{
                    nombre: nombre,
                    descripcion: descripcion,
                    codigo_invitacion: codigoInvitacion,
                    creador_id: this.perfilActual?.escuderia?.id,
                    max_miembros: maxMiembros,
                    es_publico: esPublico,
                    fecha_creacion: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (errorGrupo) throw errorGrupo;
            
            // Añadir al creador como admin en grupo_miembros
            const { error: errorMiembro } = await window.supabase
                .from('grupo_miembros')
                .insert([{
                    grupo_id: grupo.id,
                    escuderia_id: this.perfilActual?.escuderia?.id,
                    es_admin: true
                }]);
            
            if (errorMiembro) throw errorMiembro;
            
            // Actualizar escudería
            await window.supabase
                .from('escuderias')
                .update({ grupo_id: grupo.id })
                .eq('id', this.perfilActual?.escuderia?.id);
            
            // Cerrar modal
            document.getElementById('modal-crear-grupo')?.remove();
            
            // Recargar perfil
            await this.recargarPerfil();
            
            // Mostrar código SOLO al creador
            this.mostrarModalCodigoGrupo(grupo);
            
        } catch (error) {
            console.error('❌ Error creando grupo:', error);
            this.mostrarNotificacion('Error al crear el grupo: ' + error.message, 'error');
        }
    }
    
    // ========================
    // MOSTRAR CÓDIGO DEL GRUPO (SOLO PARA EL CREADOR)
    // ========================
    mostrarModalCodigoGrupo(grupo) {
        const modal = document.createElement('div');
        modal.id = 'modal-codigo-grupo';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 450px; text-align: center;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-codigo-grupo').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div style="margin: 20px 0;">
                        <i class="fas fa-users" style="font-size: 3rem; color: #00d2be; margin-bottom: 15px;"></i>
                        <h3 style="color: #00d2be; margin-bottom: 10px;">¡GRUPO CREADO!</h3>
                        <p style="color: #aaa; margin-bottom: 20px;">Comparte este código con tus amigos para que se unan:</p>
                        
                        <div style="
                            background: rgba(0, 210, 190, 0.1);
                            border: 2px dashed #00d2be;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 20px 0;
                            font-size: 2rem;
                            font-weight: bold;
                            color: #00d2be;
                            letter-spacing: 5px;
                            font-family: monospace;
                        ">${grupo.codigo_invitacion}</div>
                        
                        <button onclick="navigator.clipboard.writeText('${grupo.codigo_invitacion}'); this.innerHTML = '✓ COPIADO'; setTimeout(() => this.innerHTML = '📋 COPIAR CÓDIGO', 2000);"
                            style="
                                background: linear-gradient(135deg, #00d2be, #0066cc);
                                border: none;
                                color: white;
                                padding: 12px 30px;
                                border-radius: 25px;
                                font-weight: bold;
                                cursor: pointer;
                                margin-bottom: 10px;
                            ">
                            📋 COPIAR CÓDIGO
                        </button>
                        
                        <p style="color: #888; font-size: 0.8rem; margin-top: 15px;">
                            <i class="fas fa-info-circle"></i>
                            Este código solo es visible para ti, el creador del grupo
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // ========================
    // COPIAR CÓDIGO DE INVITACIÓN
    // ========================
    copiarCodigo(codigo) {
        navigator.clipboard.writeText(codigo).then(() => {
            if (window.f1Manager?.showNotification) {
                window.f1Manager.showNotification('📋 Código copiado al portapapeles', 'info');
            }
        }).catch(() => {
            alert(`Código: ${codigo}`);
        });
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
    // SISTEMA DE MENSAJES (MANTENIDO DEL ORIGINAL)
    // ========================
    
    /**
     * Abrir chat con otro usuario
     */
    async abrirChat(otraEscuderiaId) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) return;
    
        try {
            // Buscar o crear conversación
            let conversacion = await this.obtenerConversacion(miId, otraEscuderiaId);
            
            if (!conversacion) {
                conversacion = await this.crearConversacion(miId, otraEscuderiaId);
            }
    
            // Abrir modal de chat
            this.mostrarModalChat(conversacion);
    
        } catch (error) {
            console.error('❌ Error abriendo chat:', error);
            this.mostrarNotificacion('❌ Error al abrir chat', 'error');
        }
    }
    
    /**
     * Obtener conversación existente
     */
    async obtenerConversacion(esc1, esc2) {
        const { data, error } = await supabase
            .from('conversaciones')
            .select('*')
            .or(`and(escuderia1_id.eq.${esc1},escuderia2_id.eq.${esc2}),and(escuderia1_id.eq.${esc2},escuderia2_id.eq.${esc1})`)
            .maybeSingle();
    
        if (error) throw error;
        return data;
    }
    
    /**
     * Crear nueva conversación
     */
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
    
    /**
     * Mostrar modal de chat
     */
    mostrarModalChat(conversacion) {
        // Eliminar modal existente
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
    
        // Cargar mensajes
        this.cargarMensajes(conversacion.id);
    
        // Configurar Realtime
        this.escucharMensajes(conversacion.id);
    }
    
    /**
     * Cargar mensajes de una conversación
     */
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
    
            // Marcar como leídos
            await this.marcarMensajesLeidos(conversacionId);
    
        } catch (error) {
            console.error('❌ Error cargando mensajes:', error);
        }
    }
    
    /**
     * Renderizar mensajes en el chat
     */
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
    
    /**
     * Escuchar mensajes nuevos en tiempo real
     */
    escucharMensajes(conversacionId) {
        const channel = supabase
            .channel(`mensajes:${conversacionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'mensajes',
                filter: `conversacion_id=eq.${conversacionId}`
            }, (payload) => {
                // Añadir nuevo mensaje al chat
                this.agregarMensajeNuevo(conversacionId, payload.new);
            })
            .subscribe();
    
        // Guardar referencia para limpiar después
        if (this.channelRef) {
            supabase.removeChannel(this.channelRef);
        }
        this.channelRef = channel;
    }
    
    /**
     * Enviar un mensaje
     */
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
    
            // Limpiar input
            input.value = '';
    
            // Actualizar último mensaje en conversación
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
    
    /**
     * Marcar mensajes como leídos
     */
    async marcarMensajesLeidos(conversacionId) {
        try {
            console.log(`🔵 Intentando marcar conversación: ${conversacionId}`);
            
            const { data: mensajes, error: selectError } = await supabase
                .from('mensajes')
                .select('id')
                .eq('conversacion_id', conversacionId)
                .eq('leido', false);
            
            if (selectError) throw selectError;
            
            if (!mensajes || mensajes.length === 0) {
                console.log('✅ No hay mensajes para marcar');
                return;
            }
            
            console.log(`📊 Intentando marcar ${mensajes.length} mensajes INDIVIDUALMENTE`);
            
            // Marcar UNO POR UNO
            let exitosos = 0;
            for (const msg of mensajes) {
                const { error: updateError } = await supabase
                    .from('mensajes')
                    .update({ leido: true })
                    .eq('id', msg.id);
                
                if (updateError) {
                    console.error(`❌ Error con mensaje ${msg.id}:`, updateError);
                } else {
                    exitosos++;
                }
            }
            
            console.log(`✅ Marcados ${exitosos} de ${mensajes.length} mensajes`);
            
            // Verificar resultado final
            const { count } = await supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('conversacion_id', conversacionId)
                .eq('leido', false);
            
            console.log(`📌 Quedan pendientes: ${count}`);
            
            if (count === 0) {
                // Actualizar UI
                if (typeof window.actualizarContadorMensajes === 'function') {
                    await window.actualizarContadorMensajes();
                }
                
                if (typeof window.cargarConversaciones === 'function') {
                    await window.cargarConversaciones();
                }
            }
            
        } catch (error) {
            console.error('❌ Error general:', error);
        }
    }
    
    /**
     * Añadir mensaje nuevo al chat (tiempo real)
     */
    agregarMensajeNuevo(conversacionId, mensaje) {
        const contenedor = document.getElementById(`chat-mensajes-${conversacionId}`);
        if (!contenedor) return;
    
        // Eliminar mensaje de "chat vacío" si existe
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
    
    /**
     * Escapar HTML para evitar inyección
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Mostrar notificaciones (método auxiliar)
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        if (window.f1Manager?.showNotification) {
            window.f1Manager.showNotification(mensaje, tipo);
        } else {
            alert(mensaje);
        }
    }
    
    // ========================
    // NUEVOS MÉTODOS PARA CHAT EN PANEL
    // ========================
    
    /**
     * Abrir chat desde la lista de conversaciones
     */
    abrirChatDesdeLista(conversacionId, otroUsuarioId) {
        this.mostrarChatEnPanel(conversacionId, otroUsuarioId);
    }
    
    /**
     * Mostrar chat en el panel principal
     */
    // ========================
    // ACTUALIZAR MÉTODO mostrarChatEnPanel (reemplazar el existente)
    // ========================
    
    /**
     * Mostrar chat en el panel principal (VERSIÓN CORREGIDA)
     */
    mostrarChatEnPanel(conversacionId, otroUsuarioId) {
        const panel = document.getElementById('panel-chat');
        if (!panel) return;
        
        // Marcar conversación como activa
        document.querySelectorAll('.conversacion-item').forEach(el => {
            el.classList.remove('activa');
        });
        
        // Marcar este item como activo
        const itemActivo = document.querySelector(`[data-conversacion-id="${conversacionId}"]`);
        if (itemActivo) itemActivo.classList.add('activa');
        
        // Estructura CORREGIDA con flexbox para mantener input fijo
        panel.innerHTML = `
            <div style="display: flex; height: 100%; width: 100%; overflow: hidden;">
                <!-- Columna izquierda: Lista de conversaciones (más estrecha) -->
                <div style="width: 25%; min-width: 200px; border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; background: rgba(0,0,0,0.3);">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <input type="text" 
                               id="buscador-usuarios" 
                               placeholder="🔍 Buscar usuario..." 
                               style="width: 100%; padding: 8px; background: rgba(255,255,255,0.05); border: 2px solid #00d2be; border-radius: 4px; color: white;">
                    </div>
                    <div id="lista-conversaciones" style="flex: 1; overflow-y: auto; padding: 10px;">
                        <!-- Las conversaciones se cargarán aquí -->
                    </div>
                </div>
                
                <!-- Columna derecha: Chat activo -->
                <div style="width: 75%; display: flex; flex-direction: column; height: 100%; overflow: hidden;">
                    <div class="chat-panel-header" style="flex-shrink: 0;">
                        <div class="chat-panel-usuario">
                            <i class="fas fa-flag-checkered"></i>
                            <span id="chat-nombre-usuario">Cargando...</span>
                        </div>
                        <button class="chat-panel-cerrar" onclick="document.getElementById('panel-chat').innerHTML = '<div class=\\'chat-placeholder\\'><i class=\\'fas fa-comment-dots\\'></i><p>Selecciona una conversación</p></div>'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Contenedor de mensajes (scrollable) -->
                    <div class="chat-panel-mensajes" 
                         id="chat-panel-mensajes-${conversacionId}" 
                         style="flex: 1; overflow-y: auto; min-height: 0; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                        <!-- Los mensajes se insertarán aquí -->
                    </div>
                    
                    <!-- Input fijo en la parte inferior -->
                    <div style="flex-shrink: 0; padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px; background: rgba(0,0,0,0.3);">
                        <textarea id="chat-panel-input-${conversacionId}" 
                            placeholder="Escribe un mensaje..."
                            rows="1"
                            style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #00d2be; border-radius: 5px; color: white; padding: 8px 12px; resize: none; font-family: inherit; max-height: 60px;"
                            onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.perfilManager.enviarMensajePanel('${conversacionId}'); }"></textarea>
                        <button onclick="window.perfilManager.enviarMensajePanel('${conversacionId}')"
                            style="flex-shrink: 0; background: #00d2be; border: none; border-radius: 5px; color: #1a1a2e; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Obtener nombre del usuario
        supabase
            .from('escuderias')
            .select('nombre')
            .eq('id', otroUsuarioId)
            .single()
            .then(({ data }) => {
                const nombreSpan = document.getElementById('chat-nombre-usuario');
                if (nombreSpan) nombreSpan.textContent = data?.nombre || 'Usuario';
            });
        
        this.cargarMensajesPanel(conversacionId);
        this.escucharMensajesPanel(conversacionId);
    }
    
    /**
     * Cargar mensajes en el panel
     */
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
    
            // Marcar como leídos y esperar a que termine
            await this.marcarMensajesLeidos(conversacionId);
            
            console.log('✅ Mensajes marcados como leídos');
            
            // Recargar lista de conversaciones para quitar números
            if (typeof window.cargarConversaciones === 'function') {
                setTimeout(window.cargarConversaciones, 500);
            }
    
        } catch (error) {
            console.error('❌ Error cargando mensajes:', error);
        }
    }
    
    /**
     * Renderizar mensajes en el panel
     */
    renderizarMensajesPanel(conversacionId, mensajes) {
        const contenedor = document.getElementById(`chat-panel-mensajes-${conversacionId}`);
        if (!contenedor) return;
    
        if (mensajes.length === 0) {
            contenedor.innerHTML = `
                <div class="chat-vacio" style="text-align: center; padding: 40px 20px; color: #888;">
                    <i class="fas fa-comment-dots" style="font-size: 2rem; color: #444; margin-bottom: 10px;"></i>
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
                <div class="chat-mensaje ${esMio ? 'propio' : 'ajeno'}" style="display: flex; margin-bottom: 5px; ${esMio ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
                    <div class="chat-mensaje-contenido" style="max-width: 70%; padding: 8px 12px; border-radius: 12px; ${esMio ? 'background: linear-gradient(135deg, #00d2be, #0066cc); border-bottom-right-radius: 4px;' : 'background: rgba(255,255,255,0.1); border-bottom-left-radius: 4px;'} color: white;">
                        <div class="chat-mensaje-texto" style="word-wrap: break-word; margin-bottom: 4px;">${this.escapeHTML(msg.contenido)}</div>
                        <div class="chat-mensaje-info" style="display: flex; justify-content: flex-end; align-items: center; gap: 5px; font-size: 0.65rem; opacity: 0.7;">
                            <span class="chat-mensaje-hora">
                                ${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                            ${esMio && msg.leido ? '<span class="chat-mensaje-leido" style="color: #00d2be;">✓✓</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    
        contenedor.innerHTML = html;
        
        // Scroll al último mensaje
        setTimeout(() => {
            contenedor.scrollTop = contenedor.scrollHeight;
        }, 100);
    }
    
    /**
     * Escuchar mensajes nuevos en el panel
     */
    escucharMensajesPanel(conversacionId) {
        // Limpiar canal anterior si existe
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
                // Añadir nuevo mensaje al panel
                this.agregarMensajeNuevoPanel(conversacionId, payload.new);
            })
            .subscribe();
    
        this.panelChannelRef = channel;
    }
    
    /**
     * Añadir mensaje nuevo al panel
     */
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
        
        // Scroll automático al nuevo mensaje
        setTimeout(() => {
            contenedor.scrollTop = contenedor.scrollHeight;
        }, 50);
    }
    
    /**
     * Enviar mensaje desde el panel
     */
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
            
            // Scroll automático después de enviar
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
// ESTILOS DEL PERFIL (ACTUALIZADOS)
// ========================
const perfilStyles = `
    #modal-perfil, #modal-editar-descripcion, #modal-crear-grupo {
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
    
    #modal-perfil.visible, #modal-editar-descripcion, #modal-crear-grupo {
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
    
    .perfil-publico-badge {
        background: rgba(0, 210, 190, 0.1);
        border: 1px solid #00d2be;
        color: #00d2be;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        gap: 5px;
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
    
    .perfil-grupo {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
    }
    
    .perfil-grupo h3 {
        color: #00d2be;
        margin: 0 0 15px 0;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .grupo-info {
        background: rgba(0, 210, 190, 0.1);
        border: 1px solid rgba(0, 210, 190, 0.3);
        border-radius: 6px;
        padding: 15px;
    }
    
    .grupo-nombre {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: bold;
        color: white;
        margin-bottom: 10px;
        font-size: 1.1rem;
    }
    
    .grupo-creador-badge {
        background: gold;
        color: black;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.65rem;
        font-weight: bold;
        margin-left: 10px;
    }
    
    .grupo-descripcion {
        background: rgba(0,0,0,0.2);
        padding: 12px;
        border-radius: 6px;
        margin: 10px 0;
        color: #ddd;
        font-style: italic;
        font-size: 0.9rem;
    }
    
    .grupo-miembros-lista {
        margin-top: 15px;
        border-top: 1px solid rgba(255,255,255,0.1);
        padding-top: 15px;
    }
    
    .grupo-miembros-header {
        color: #00d2be;
        font-size: 0.8rem;
        margin-bottom: 10px;
        font-weight: bold;
    }
    
    .grupo-miembros-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
        max-height: 300px;
        overflow-y: auto;
        padding: 5px;
    }
    
    .grupo-miembro-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(0,0,0,0.3);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
    }
    
    .grupo-miembro-item:hover {
        background: rgba(0,210,190,0.1);
        border-color: #00d2be;
        transform: translateY(-2px);
    }
    
    .miembro-avatar {
        position: relative;
        width: 35px;
        height: 35px;
        background: linear-gradient(135deg, #00d2be, #0066cc);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1rem;
    }
    
    .miembro-admin {
        position: absolute;
        top: -5px;
        right: -5px;
        background: gold;
        color: black;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .miembro-info {
        flex: 1;
        overflow: hidden;
    }
    
    .miembro-nombre {
        color: white;
        font-size: 0.8rem;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .miembro-desde {
        color: #888;
        font-size: 0.6rem;
    }
    
    .grupo-codigo-admin {
        margin-top: 15px;
        padding: 10px;
        background: rgba(0,210,190,0.1);
        border: 1px dashed #00d2be;
        border-radius: 6px;
        color: #00d2be;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
    }
    
    .grupo-codigo-admin small {
        color: #888;
        font-size: 0.65rem;
        margin-left: auto;
    }
    
    /* Estilo para el botón de solicitud de grupo */
    .btn-solicitud-grupo {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #00d2be, #0066cc);
        border: none;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform 0.2s;
        font-size: 0.9rem;
    }
    
    .btn-solicitud-grupo:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 210, 190, 0.3);
    }
    
    .btn-solicitud-grupo:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .solicitud-loading {
        text-align: center;
        padding: 10px;
        color: #888;
    }
    
    .grupo-vacio {
        text-align: center;
        padding: 20px;
        color: #888;
    }
    
    .grupo-vacio i {
        font-size: 2rem;
        color: #444;
        margin-bottom: 10px;
    }
    
    .btn-crear-grupo {
        margin: 10px 5px 0;
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
    
    /* Modal de chat */
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
`;

// Añadir estilos al head
const styleElement = document.createElement('style');
styleElement.textContent = perfilStyles;
document.head.appendChild(styleElement);

// ========================
// FUNCIONES GLOBALES PARA MENSAJES (MANTENIDAS)
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
    
    // Obtener contadores
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
    
    // Generar HTML
    let html = '';
    
    for (const conv of conversaciones) {
        const otro = conv.escuderia1_id === miId ? conv.escuderia2 : conv.escuderia1;
        const noLeidos = mapaContadores[conv.id] || 0;

        html += `
            <div class="conversacion-item ${noLeidos > 0 ? 'tiene-no-leidos' : ''}" 
                 onclick="window.perfilManager.abrirChatDesdeLista('${conv.id}', '${otro.id}')"
                 data-conversacion-id="${conv.id}">  <!-- AÑADE ESTA LÍNEA -->
                <div class="conversacion-info">
                    <div class="conversacion-nombre">${otro.nombre}</div>
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
    if (!miId) {
        console.log('No hay sesión activa');
        return;
    }
    
    try {
        const { data: conversaciones, error: convError } = await supabase
            .from('conversaciones')
            .select('id')
            .or(`escuderia1_id.eq.${miId},escuderia2_id.eq.${miId}`);
        
        if (convError || !conversaciones) {
            console.error('Error obteniendo conversaciones:', convError);
            return;
        }
        
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
            
            if (msgError) {
                console.error('Error contando mensajes:', msgError);
                continue;
            }
            
            totalNoLeidos += count || 0;
        }
        
        const contador = document.getElementById('mensajes-contador');
        if (contador) {
            if (totalNoLeidos > 0) {
                contador.textContent = totalNoLeidos > 99 ? '99+' : totalNoLeidos;
                contador.style.display = 'flex';
                console.log(`📬 ${totalNoLeidos} mensajes no leídos de otros usuarios`);
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
    if (!miId) {
        console.error('No hay sesión activa');
        return;
    }
    
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

// Buscador de usuarios en tiempo real
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
                        <div class="conversacion-info">
                            <div class="conversacion-nombre">${usuario.nombre}</div>
                        </div>
                        <div class="conversacion-no-leidos" style="background: #00d2be;">
                            <i class="fas fa-comment"></i>
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
// EXPONER FUNCIONES GLOBALES PARA MENSAJES
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
