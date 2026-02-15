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
    // SISTEMA DE AMIGOS
    // ========================
    
    /**
     * Enviar solicitud de amistad
     */
    async agregarAmigo(escuderiaId) {
        if (!window.f1Manager?.escuderia?.id) {
            this.mostrarNotificacion('❌ No has iniciado sesión', 'error');
            return;
        }
    
        // No puedes agregarte a ti mismo
        if (escuderiaId === window.f1Manager.escuderia.id) {
            this.mostrarNotificacion('❌ No puedes agregarte a ti mismo', 'error');
            return;
        }
    
        try {
            // Verificar si ya existe una solicitud
            const { data: existing, error: checkError } = await supabase
                .from('friendships')
                .select('*')
                .or(`and(sender_id.eq.${window.f1Manager.escuderia.id},receiver_id.eq.${escuderiaId}),and(sender_id.eq.${escuderiaId},receiver_id.eq.${window.f1Manager.escuderia.id})`);
    
            if (checkError) throw checkError;
    
            if (existing && existing.length > 0) {
                const friendship = existing[0];
                if (friendship.status === 'pending') {
                    this.mostrarNotificacion('⏳ Ya tienes una solicitud pendiente con este usuario', 'info');
                } else if (friendship.status === 'accepted') {
                    this.mostrarNotificacion('👥 Ya sois amigos', 'info');
                }
                return;
            }
    
            // Crear nueva solicitud
            const { error } = await supabase
                .from('friendships')
                .insert([{
                    sender_id: window.f1Manager.escuderia.id,
                    receiver_id: escuderiaId,
                    status: 'pending'
                }]);
    
            if (error) throw error;
    
            // Obtener nombre del receptor para la notificación
            const { data: receptor } = await supabase
                .from('escuderias')
                .select('nombre, user_id')
                .eq('id', escuderiaId)
                .single();
    
            // Crear notificación para el receptor
            if (receptor?.user_id && window.notificacionesManager) {
                await window.notificacionesManager.crearNotificacion(
                    receptor.user_id,
                    'amistad',
                    '👋 Solicitud de amistad',
                    `${window.f1Manager.escuderia.nombre} quiere ser tu amigo`,
                    null,
                    'friendship_request'
                );
            }
    
            this.mostrarNotificacion('✅ Solicitud de amistad enviada', 'success');
    
            // Opcional: recargar perfil para mostrar cambio
            setTimeout(() => this.recargarPerfil(), 1000);
    
        } catch (error) {
            console.error('❌ Error enviando solicitud:', error);
            this.mostrarNotificacion('❌ Error al enviar solicitud', 'error');
        }
    }
    
    /**
     * Aceptar solicitud de amistad
     */
    async aceptarAmistad(friendshipId) {
        try {
            const { error } = await supabase
                .from('friendships')
                .update({ 
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                })
                .eq('id', friendshipId);
    
            if (error) throw error;
    
            this.mostrarNotificacion('✅ Amistad aceptada', 'success');
            
            // Recargar perfil si está abierto
            if (this.modalAbierto) {
                this.recargarPerfil();
            }
    
        } catch (error) {
            console.error('❌ Error aceptando amistad:', error);
            this.mostrarNotificacion('❌ Error al aceptar', 'error');
        }
    }
    
    /**
     * Rechazar o eliminar amistad
     */
    async eliminarAmistad(friendshipId) {
        if (!confirm('¿Eliminar esta amistad?')) return;
    
        try {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('id', friendshipId);
    
            if (error) throw error;
    
            this.mostrarNotificacion('✅ Amistad eliminada', 'success');
            
            if (this.modalAbierto) {
                this.recargarPerfil();
            }
    
        } catch (error) {
            console.error('❌ Error eliminando amistad:', error);
            this.mostrarNotificacion('❌ Error al eliminar', 'error');
        }
    }
    
    /**
     * Obtener lista de amigos
     */
    async obtenerAmigos(escuderiaId = null) {
        const id = escuderiaId || window.f1Manager?.escuderia?.id;
        if (!id) return [];
    
        try {
            // Buscar amistades aceptadas donde la escudería es sender o receiver
            const { data, error } = await supabase
                .from('friendships')
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    status,
                    created_at,
                    sender:escuderias!friendships_sender_id_fkey (
                        id, nombre, puntos, dinero
                    ),
                    receiver:escuderias!friendships_receiver_id_fkey (
                        id, nombre, puntos, dinero
                    )
                `)
                .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
                .eq('status', 'accepted');
    
            if (error) throw error;
    
            // Transformar para obtener siempre el "otro" usuario
            return data.map(f => ({
                friendshipId: f.id,
                amigo: f.sender_id === id ? f.receiver : f.sender,
                desde: f.created_at
            }));
    
        } catch (error) {
            console.error('❌ Error obteniendo amigos:', error);
            return [];
        }
    }
    
    /**
     * Verificar estado de amistad con otra escudería
     */
    async verificarAmistad(otraEscuderiaId) {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId || !otraEscuderiaId) return null;
    
        try {
            const { data, error } = await supabase
                .from('friendships')
                .select('*')
                .or(`and(sender_id.eq.${miId},receiver_id.eq.${otraEscuderiaId}),and(sender_id.eq.${otraEscuderiaId},receiver_id.eq.${miId})`)
                .maybeSingle();
    
            if (error) throw error;
            return data;
    
        } catch (error) {
            console.error('❌ Error verificando amistad:', error);
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
                // Consulta que une contrataciones con el catálogo de estrategas
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

            // 5. POSICIÓN GLOBAL (usando el mismo sistema que tabs.js)
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

            // 6. GRUPO DE AMIGOS
            let grupo = null;
            if (escuderia.grupo_id) {
                const { data: grupoData, error: errorGrupo } = await supabase
                    .from('grupos_amigos')
                    .select(`
                        id,
                        nombre,
                        codigo_invitacion,
                        creador_id,
                        created_at
                    `)
                    .eq('id', escuderia.grupo_id)
                    .single();
                
                if (!errorGrupo && grupoData) {
                    // Contar miembros del grupo
                    const { count } = await supabase
                        .from('escuderias')
                        .select('id', { count: 'exact', head: true })
                        .eq('grupo_id', grupoData.id);
                    
                    grupo = {
                        ...grupoData,
                        miembros_count: count || 1
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
                        
                        ${datos.grupo ? `
                            <div class="grupo-info">
                                <div class="grupo-nombre">
                                    <i class="fas fa-users" style="color: #00d2be;"></i>
                                    <span>${datos.grupo.nombre}</span>
                                </div>
                                <div class="grupo-detalles">
                                    <div class="grupo-miembros">
                                        <i class="fas fa-user"></i>
                                        <span>${datos.grupo.miembros_count} miembros</span>
                                    </div>
                                    ${datos.grupo.codigo_invitacion ? `
                                        <div class="grupo-codigo" onclick="window.perfilManager.copiarCodigo('${datos.grupo.codigo_invitacion}')">
                                            <i class="fas fa-link"></i>
                                            <span>${datos.grupo.codigo_invitacion}</span>
                                            <small>(click para copiar)</small>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : `
                            <div class="grupo-vacio">
                                <i class="fas fa-user-friends"></i>
                                <p>${datos.escuderia.nombre} no pertenece a ningún grupo</p>
                                ${esMiPerfil ? `
                                    <button class="btn-crear-grupo" onclick="window.perfilManager.mostrarOpcionesGrupo()">
                                        <i class="fas fa-plus-circle"></i>
                                        CREAR GRUPO
                                    </button>
                                    <button class="btn-unirse-grupo" onclick="window.perfilManager.mostrarUnirseGrupo()">
                                        <i class="fas fa-sign-in-alt"></i>
                                        UNIRSE A GRUPO
                                    </button>
                                ` : ''}
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
                        <div class="perfil-acciones" id="perfil-acciones-${datos.escuderia.id}">
                            <div class="acciones-loading">
                                <i class="fas fa-spinner fa-spin"></i> Cargando...
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    
        document.body.appendChild(modal);
        
        if (!esMiPerfil) {
            console.log('🔄 Cargando botones de acción para:', datos.escuderia.id);
            this.cargarEstadoAmistad(datos.escuderia.id);
        }
        
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
    // OPCIONES DE GRUPO (CREAR O UNIRSE)
    // ========================
    mostrarOpcionesGrupo() {
        const modal = document.createElement('div');
        modal.id = 'modal-crear-grupo';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 400px;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-crear-grupo').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="color: #00d2be; margin-bottom: 20px;">
                        <i class="fas fa-users"></i>
                        CREAR GRUPO DE AMIGOS
                    </h3>
                    
                    <input type="text" id="nombre-grupo" 
                        placeholder="Nombre del grupo (ej: Los Velocistas)"
                        style="
                            width: 100%;
                            padding: 12px;
                            background: rgba(0,0,0,0.5);
                            border: 2px solid #00d2be;
                            border-radius: 6px;
                            color: white;
                            margin-bottom: 20px;
                            font-size: 0.9rem;
                        ">
                    
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
                        <button onclick="window.perfilManager.crearGrupo()"
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
    
    async cargarEstadoAmistad(otraEscuderiaId) {
        const contenedor = document.getElementById(`perfil-acciones-${otraEscuderiaId}`);
        if (!contenedor) return;
    
        // MOSTRAR BOTONES BÁSICOS INMEDIATAMENTE
        const miId = window.f1Manager.escuderia.id;
        contenedor.innerHTML = `
            <button class="btn-agregar-amigo" onclick="window.perfilManager.agregarAmigo('${otraEscuderiaId}')">
                <i class="fas fa-user-plus"></i>
                Agregar amigo
            </button>
            <button class="btn-enviar-mensaje" onclick="window.perfilManager.abrirChat('${otraEscuderiaId}')">
                <i class="fas fa-envelope"></i>
                Mensaje
            </button>
        `;
    
        // LUEGO, en segundo plano, verificar el estado real
        try {
            const amistad = await this.verificarAmistad(otraEscuderiaId);
            
            if (amistad) {
                let html = '';
                if (amistad.status === 'pending') {
                    if (amistad.sender_id === miId) {
                        html = `
                            <button class="btn-pendiente" disabled>
                                <i class="fas fa-clock"></i>
                                Solicitud enviada
                            </button>
                            <button class="btn-cancelar" onclick="window.perfilManager.eliminarAmistad('${amistad.id}')">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                        `;
                    } else {
                        html = `
                            <button class="btn-aceptar" onclick="window.perfilManager.aceptarAmistad('${amistad.id}')">
                                <i class="fas fa-check"></i>
                                Aceptar
                            </button>
                            <button class="btn-rechazar" onclick="window.perfilManager.eliminarAmistad('${amistad.id}')">
                                <i class="fas fa-times"></i>
                                Rechazar
                            </button>
                        `;
                    }
                } else if (amistad.status === 'accepted') {
                    html = `
                        <button class="btn-amigo" disabled>
                            <i class="fas fa-check-circle"></i>
                            Amigos
                        </button>
                        <button class="btn-enviar-mensaje" onclick="window.perfilManager.abrirChat('${otraEscuderiaId}')">
                            <i class="fas fa-envelope"></i>
                            Mensaje
                        </button>
                    `;
                }
                
                if (html) {
                    contenedor.innerHTML = html;
                }
            }
        } catch (error) {
            console.error('Error verificando amistad:', error);
            // Si hay error, ya tenemos los botones básicos
        }
    }
    
    // ========================
    // CREAR GRUPO
    // ========================
    async crearGrupo() {
        const nombreInput = document.getElementById('nombre-grupo');
        if (!nombreInput) return;
        
        const nombre = nombreInput.value.trim();
        if (!nombre) {
            alert('Por favor, introduce un nombre para el grupo');
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
                    codigo_invitacion: codigoInvitacion,
                    creador_id: this.perfilActual?.escuderia?.id,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (errorGrupo) throw errorGrupo;
            
            // Asignar grupo a la escudería
            const { error: errorUpdate } = await window.supabase
                .from('escuderias')
                .update({ grupo_id: grupo.id })
                .eq('id', this.perfilActual?.escuderia?.id);
            
            if (errorUpdate) throw errorUpdate;
            
            // Cerrar modal
            document.getElementById('modal-crear-grupo')?.remove();
            
            // Recargar perfil
            await this.recargarPerfil();
            
            // Mostrar código de invitación
            alert(`✅ Grupo "${nombre}" creado con éxito!\n\nCódigo de invitación: ${codigoInvitacion}\n\nComparte este código con tus amigos para que se unan.`);
            
        } catch (error) {
            console.error('❌ Error creando grupo:', error);
            alert('Error al crear el grupo: ' + error.message);
        }
    }

    // ========================
    // MOSTRAR FORMULARIO PARA UNIRSE A GRUPO
    // ========================
    mostrarUnirseGrupo() {
        const modal = document.createElement('div');
        modal.id = 'modal-unirse-grupo';
        modal.innerHTML = `
            <div class="modal-perfil-overlay" onclick="if(event.target === this) this.parentElement.remove()">
                <div class="modal-perfil-contenedor" style="max-width: 400px;">
                    <button class="modal-perfil-cerrar" onclick="this.closest('#modal-unirse-grupo').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="color: #00d2be; margin-bottom: 20px;">
                        <i class="fas fa-sign-in-alt"></i>
                        UNIRSE A UN GRUPO
                    </h3>
                    
                    <p style="color: #aaa; margin-bottom: 15px; font-size: 0.9rem;">
                        Introduce el código de invitación que te ha dado el creador del grupo:
                    </p>
                    
                    <input type="text" id="codigo-grupo" 
                        placeholder="Ej: ABC123"
                        style="
                            width: 100%;
                            padding: 12px;
                            background: rgba(0,0,0,0.5);
                            border: 2px solid #00d2be;
                            border-radius: 6px;
                            color: white;
                            margin-bottom: 20px;
                            font-size: 0.9rem;
                            text-transform: uppercase;
                        ">
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="this.closest('#modal-unirse-grupo').remove()"
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
                        <button onclick="window.perfilManager.unirseAGrupo()"
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
                            UNIRSE
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // ========================
    // SISTEMA DE MENSAJES
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
            // SIMPLIFICADO - Marcar TODOS los mensajes no leídos de la conversación
            const { error } = await supabase
                .from('mensajes')
                .update({ leido: true })
                .eq('conversacion_id', conversacionId)
                .eq('leido', false);  // ❌ QUITAMOS el .neq('sender_id', miId)
            
            if (error) throw error;
            
            console.log('✅ Mensajes marcados correctamente');
            
            // Actualizar contadores
            await window.actualizarContadorMensajes();
            await window.cargarConversaciones();
            
            // Actualizar icono
            const contadorIcono = document.getElementById('mensajes-contador');
            if (contadorIcono) {
                const totalRestante = await this.verificarNoLeidos();
                if (totalRestante > 0) {
                    contadorIcono.textContent = totalRestante;
                    contadorIcono.style.display = 'flex';
                } else {
                    contadorIcono.style.display = 'none';
                }
            }
            
        } catch (error) {
            console.error('❌ Error marcando mensajes:', error);
        }
    }
    
    // Añade este método auxiliar
    async verificarNoLeidos() {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) return 0;
        
        const { count } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('leido', false);
        
        return count || 0;
    }
    
    // AÑADE ESTE MÉTODO NUEVO justo después de marcarMensajesLeidos
    async verificarSiHayMasNoLeidos() {
        const miId = window.f1Manager?.escuderia?.id;
        if (!miId) return 0;
        
        const { data: conversaciones } = await supabase
            .from('conversaciones')
            .select('id')
            .or(`escuderia1_id.eq.${miId},escuderia2_id.eq.${miId}`);
        
        let total = 0;
        for (const conv of conversaciones || []) {
            const { count } = await supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('conversacion_id', conv.id)
                .eq('leido', false)
                .neq('sender_id', miId);
            total += count;
        }
        return total;
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
    // UNIRSE A GRUPO
    // ========================
    async unirseAGrupo() {
        const codigoInput = document.getElementById('codigo-grupo');
        if (!codigoInput) return;
        
        const codigo = codigoInput.value.trim().toUpperCase();
        if (!codigo) {
            alert('Por favor, introduce un código de invitación');
            return;
        }
        
        try {
            // Buscar grupo por código
            const { data: grupo, error: errorBusqueda } = await window.supabase
                .from('grupos_amigos')
                .select('*')
                .eq('codigo_invitacion', codigo)
                .single();
            
            if (errorBusqueda || !grupo) {
                alert('❌ Código de invitación no válido');
                return;
            }
            
            // Asignar grupo a la escudería
            const { error: errorUpdate } = await window.supabase
                .from('escuderias')
                .update({ grupo_id: grupo.id })
                .eq('id', this.perfilActual?.escuderia?.id);
            
            if (errorUpdate) throw errorUpdate;
            
            // Cerrar modal
            document.getElementById('modal-unirse-grupo')?.remove();
            
            // Recargar perfil
            await this.recargarPerfil();
            
            alert(`✅ Te has unido al grupo "${grupo.nombre}" con éxito!`);
            
        } catch (error) {
            console.error('❌ Error al unirse al grupo:', error);
            alert('Error al unirse al grupo: ' + error.message);
        }
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
    mostrarChatEnPanel(conversacionId, otroUsuarioId) {
        const panel = document.getElementById('panel-chat');
        if (!panel) return;
        
        // Marcar conversación como activa
        document.querySelectorAll('.conversacion-item').forEach(el => {
            el.classList.remove('activa');
        });
        
        // Marcar este item como activo
        const itemActivo = document.querySelector(`[onclick*="${conversacionId}"]`);
        if (itemActivo) itemActivo.classList.add('activa');
        
        panel.innerHTML = `
            <div class="chat-panel-header">
                <div class="chat-panel-usuario">
                    <i class="fas fa-flag-checkered"></i>
                    <span>Cargando...</span>
                </div>
                <button class="chat-panel-cerrar" onclick="document.getElementById('panel-chat').innerHTML = '<div class=\\'chat-placeholder\\'><i class=\\'fas fa-comment-dots\\'></i><p>Selecciona una conversación</p></div>'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chat-panel-mensajes" id="chat-panel-mensajes-${conversacionId}" style="flex: 1; overflow-y: auto; min-height: 0; max-height: 100%; display: flex; flex-direction: column;"></div>
            <div class="chat-panel-input" style="flex-shrink: 0;">
                <textarea id="chat-panel-input-${conversacionId}" 
                    placeholder="Escribe un mensaje..."
                    rows="1"
                    style="flex: 1; resize: none;"></textarea>
                <button onclick="window.perfilManager.enviarMensajePanel('${conversacionId}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        // Obtener nombre y cargar mensajes
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
// ESTILOS DEL PERFIL (INCLUYE LOS NUEVOS ESTILOS DE MENSAJES)
// ========================
const perfilStyles = `
    #modal-perfil, #modal-editar-descripcion, #modal-crear-grupo, #modal-unirse-grupo {
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
    
    #modal-perfil.visible, #modal-editar-descripcion, #modal-crear-grupo, #modal-unirse-grupo {
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
    
    .btn-pendiente, .btn-amigo {
        padding: 10px 20px;
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid #FF9800;
        color: #FF9800;
        border-radius: 4px;
        cursor: default;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-aceptar {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid #4CAF50;
        color: #4CAF50;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-rechazar, .btn-cancelar {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid #F44336;
        color: #F44336;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-aceptar:hover {
        background: #4CAF50;
        color: white;
    }
    
    .btn-rechazar:hover, .btn-cancelar:hover {
        background: #F44336;
        color: white;
    }
    
    .acciones-loading {
        padding: 10px;
        color: #888;
        text-align: center;
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
    
    .grupo-detalles {
        display: flex;
        gap: 20px;
        color: #aaa;
        font-size: 0.9rem;
        flex-wrap: wrap;
    }
    
    .grupo-miembros, .grupo-codigo {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .grupo-codigo {
        cursor: pointer;
        color: #00d2be;
        transition: opacity 0.2s;
    }
    
    .grupo-codigo:hover {
        opacity: 0.8;
    }
    
    .grupo-codigo small {
        font-size: 0.65rem;
        color: #888;
        margin-left: 5px;
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
    
    .btn-crear-grupo, .btn-unirse-grupo {
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
    
    .btn-crear-grupo:hover, .btn-unirse-grupo:hover {
        transform: translateY(-2px);
    }
    
    .btn-unirse-grupo {
        background: linear-gradient(135deg, #666, #333);
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
    }
    
    .btn-enviar-mensaje, .btn-agregar-amigo {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-enviar-mensaje {
        background: rgba(0, 210, 190, 0.1);
        border: 1px solid #00d2be;
        color: #00d2be;
    }
    
    .btn-agregar-amigo {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid #4CAF50;
        color: #4CAF50;
    }
    
    .btn-enviar-mensaje:hover, .btn-agregar-amigo:hover {
        transform: translateY(-2px);
    }
    
    /* ======================== */
    /* ESTILOS PARA SECCIÓN DE MENSAJES */
    /* ======================== */
    
    #seccion-mensajes {
        padding: 20px;
        height: calc(100vh - 200px);
    }
    
    .mensajes-container {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 20px;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        border: 1px solid #00d2be;
        overflow: hidden;
    }
    
    .mensajes-sidebar {
        background: rgba(0, 0, 0, 0.5);
        border-right: 1px solid rgba(0, 210, 190, 0.3);
        display: flex;
        flex-direction: column;
    }
    
    .buscador-usuarios {
        padding: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
    }
    
    .buscador-usuarios i {
        position: absolute;
        left: 25px;
        top: 25px;
        color: #888;
    }
    
    .buscador-usuarios input {
        width: 100%;
        padding: 10px 10px 10px 35px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #00d2be;
        border-radius: 5px;
        color: white;
        font-size: 0.9rem;
    }
    
    .buscador-usuarios input:focus {
        outline: none;
        box-shadow: 0 0 10px rgba(0, 210, 190, 0.3);
    }
    
    .lista-conversaciones {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
    }
    
    .conversacion-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 5px;
        position: relative;
    }
    
    .conversacion-item:hover {
        background: rgba(0, 210, 190, 0.1);
    }
    
    .conversacion-item.activa {
        background: rgba(0, 210, 190, 0.2);
        border-left: 3px solid #00d2be;
    }
    
    .conversacion-avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #00d2be, #0066cc);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
    }
    
    .conversacion-info {
        flex: 1;
        overflow: hidden;
    }
    
    .conversacion-nombre {
        font-weight: bold;
        color: white;
        margin-bottom: 3px;
        font-size: 0.9rem;
    }
    
    .conversacion-ultimo {
        color: #888;
        font-size: 0.75rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .conversacion-no-leidos {
        background: #e10600;
        color: white;
        font-size: 0.65rem;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        margin-left: 5px;
    }
    
    .sin-conversaciones {
        text-align: center;
        padding: 40px 20px;
        color: #888;
        font-style: italic;
    }
    
    .mensajes-chat {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.3);
    }
    
    .chat-placeholder {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #888;
    }
    
    .chat-placeholder i {
        font-size: 3rem;
        color: #444;
        margin-bottom: 15px;
    }
    
    /* Estilos para chat en panel */
    .chat-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.3);
    }
    
    .chat-panel-usuario {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #00d2be;
        font-weight: bold;
    }
    
    .chat-panel-usuario i {
        font-size: 1.2rem;
    }
    
    .chat-panel-cerrar {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 1rem;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .chat-panel-cerrar:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .chat-panel-mensajes {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .chat-panel-input {
        padding: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 10px;
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
    }
    
    .chat-panel-input button {
        background: #00d2be;
        border: none;
        border-radius: 5px;
        color: #1a1a2e;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }
    
    .chat-panel-input button:hover {
        background: #00fff0;
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
        
        .mensajes-container {
            grid-template-columns: 1fr;
        }
        
        .mensajes-sidebar {
            display: none;
        }
        
        .mensajes-sidebar.visible {
            display: flex;
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 10;
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
    let html = '';
    
    for (const conv of conversaciones) {
        const otro = conv.escuderia1_id === miId ? conv.escuderia2 : conv.escuderia1;
        const noLeidos = await contarNoLeidos(conv.id, miId);

        html += `
            <div class="conversacion-item" onclick="window.perfilManager.abrirChatDesdeLista('${conv.id}', '${otro.id}')">
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

// Contar mensajes no leídos
async function contarNoLeidos(conversacionId, miId) {
    const { count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('conversacion_id', conversacionId)
        .eq('leido', false)
        .neq('sender_id', miId);
    
    return count;
}

// Actualizar contador global de mensajes
async function actualizarContadorMensajes() {
    const miId = window.f1Manager?.escuderia?.id;
    if (!miId) return;
    
    const { data: conversaciones } = await supabase
        .from('conversaciones')
        .select('id')
        .or(`escuderia1_id.eq.${miId},escuderia2_id.eq.${miId}`);
    
    let total = 0;
    for (const conv of conversaciones || []) {
        const { count } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('conversacion_id', conv.id)
            .eq('leido', false)
            .neq('sender_id', miId);
        total += count;
    }
    
    const contador = document.getElementById('mensajes-contador');
    if (contador) {
        if (total > 0) {
            contador.textContent = total;
            contador.style.display = 'flex';
        } else {
            contador.style.display = 'none';
        }
    }
}

// Iniciar polling de mensajes no leídos
setInterval(actualizarContadorMensajes, 30000);
setTimeout(actualizarContadorMensajes, 2000);

// Buscador de usuarios en tiempo real
document.addEventListener('input', function(e) {
    if (e.target.id === 'buscador-usuarios') {
        const busqueda = e.target.value.trim();
        if (busqueda.length < 2) return;
        
        supabase
            .from('escuderias')
            .select('id, nombre')
            .ilike('nombre', `%${busqueda}%`)
            .limit(10)
            .then(({ data }) => {
                // Mostrar resultados (pendiente de implementar)
                console.log('Resultados:', data);
            });
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
// Crear instancia inmediatamente y exponerla
window.perfilManager = new PerfilManager();

// ========================
// EXPONER FUNCIONES GLOBALES PARA MENSAJES
// ========================
window.cargarConversaciones = cargarConversaciones;
window.actualizarContadorMensajes = actualizarContadorMensajes;

console.log('✅ PerfilManager instanciado globalmente');

// También asegurar que se pueda acceder después de carga completa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.perfilManager) {
            window.perfilManager = new PerfilManager();
        }
        console.log('👤 PerfilManager listo (DOMContentLoaded)');
    });
} else {
    // Ya está cargado, asegurar instancia
    if (!window.perfilManager) {
        window.perfilManager = new PerfilManager();
    }
    console.log('👤 PerfilManager listo inmediatamente');
}
