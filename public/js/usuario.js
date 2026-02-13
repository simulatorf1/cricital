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
            const { data: estrategas, error: errorEstrategas } = await supabase
                .from('pilotos_contratados')
                .select(`
                    id,
                    nombre,
                    especialidad,
                    salario,
                    bonificacion_valor
                `)
                .eq('escuderia_id', escuderiaId)
                .eq('activo', true);

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
                fechaCreacion: escuderia.created_at
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
                        ${esMiPerfil ? `
                            <button class="perfil-btn-editar" onclick="window.perfilManager.editarDescripcion()">
                                <i class="fas fa-pen"></i>
                            </button>
                        ` : ''}
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
                        
                        <div class="perfil-stat-card" style="border-left-color: #00d2be;">
                            <div class="stat-icon"><i class="fas fa-star"></i></div>
                            <div class="stat-content">
                                <span class="stat-label">Puntos Totales</span>
                                <span class="stat-valor">${datos.escuderia.puntos || 0}</span>
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
                        
                        <div class="perfil-stat-card" style="border-left-color: #2196F3;">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-content">
                                <span class="stat-label">Estrategas</span>
                                <span class="stat-valor">${datos.estrategas.length}/4</span>
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
                        <div class="perfil-acciones">
                            <button class="btn-enviar-mensaje" onclick="window.perfilManager.enviarMensaje('${datos.escuderia.id}')">
                                <i class="fas fa-envelope"></i>
                                Enviar mensaje
                            </button>
                            <button class="btn-agregar-amigo" onclick="window.perfilManager.agregarAmigo('${datos.escuderia.id}')">
                                <i class="fas fa-user-plus"></i>
                                Agregar amigo
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
    // MÉTODOS PENDIENTES (para implementar después)
    // ========================
    enviarMensaje(escuderiaId) {
        if (window.f1Manager?.showNotification) {
            window.f1Manager.showNotification('📨 Sistema de mensajes en desarrollo', 'info');
        }
    }

    agregarAmigo(escuderiaId) {
        if (window.f1Manager?.showNotification) {
            window.f1Manager.showNotification('👥 Sistema de amigos en desarrollo', 'info');
        }
    }
}

// ========================
// ESTILOS DEL PERFIL
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
