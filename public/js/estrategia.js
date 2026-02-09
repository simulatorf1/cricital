// ========================
// F1 MANAGER - ESTRATEGIA.JS
// Sistema completo de 110 estrategas especializados
// ========================
console.log('🧠 Cargando sistema de estrategas...');

class EstrategiaManager {
    constructor(f1Manager) {
        this.f1Manager = f1Manager;
        this.supabase = f1Manager.supabase;
        this.escuderia = f1Manager.escuderia;
        this.estrategasContratados = [];
        this.catalogoEstrategas = [];
        this.timers = {};
        
        // 11 especialidades
        this.especialidades = [
            { id: 'meteorologia', nombre: 'Meteorología', icono: '🌧️', desc: 'Pronósticos clima/lluvia' },
            { id: 'fiabilidad', nombre: 'Fiabilidad', icono: '🔧', desc: 'Pronósticos abandonos/fallos técnicos' },
            { id: 'estrategia', nombre: 'Estrategia', icono: '📊', desc: 'Pronósticos paradas/táctica carrera' },
            { id: 'rendimiento', nombre: 'Rendimiento', icono: '⚡', desc: 'Pronósticos tiempos/diferencias' },
            { id: 'neumaticos', nombre: 'Neumáticos', icono: '🛞', desc: 'Pronósticos desgaste/compuestos' },
            { id: 'seguridad', nombre: 'Seguridad', icono: '🚨', desc: 'Pronósticos incidentes/banderas' },
            { id: 'clasificacion', nombre: 'Clasificación', icono: '🏁', desc: 'Pronósticos posición salida/qualy' },
            { id: 'carrera', nombre: 'Carrera', icono: '🏎️', desc: 'Pronósticos final/resultados' },
            { id: 'overtakes', nombre: 'Overtakes', icono: '💨', desc: 'Pronósticos adelantamientos' },
            { id: 'incidentes', nombre: 'Incidentes', icono: '⚠️', desc: 'Pronósticos accidentes/retiradas' },
            { id: 'tiempos', nombre: 'Tiempos', icono: '⏱️', desc: 'Pronósticos vueltas rápidas/récords' }
        ];
    }

    // ========================
    // INICIALIZACIÓN
    // ========================
    async inicializar() {
        console.log('🧠 Inicializando EstrategiaManager...');
        
        // 1. Verificar/Crear tablas en BD
        await this.verificarEstructuraBD();
        
        // 2. Cargar catálogo (110 estrategas)
        await this.cargarCatalogoEstrategas();
        
        // 3. Cargar estrategas contratados
        await this.cargarEstrategasContratados();
        
        // 4. Iniciar timers
        this.iniciarTimers();
        
        // 5. Actualizar UI
        this.actualizarUIEstrategas();
        
        console.log('✅ EstrategiaManager inicializado');
    }

    // ========================
    // VERIFICAR ESTRUCTURA BD
    // ========================
    async verificarEstructuraBD() {
        try {
            // Verificar si existe la tabla de catálogo
            const { data: exists, error } = await this.supabase
                .from('estrategas_catalogo')
                .select('count')
                .limit(1);
            
            if (error && error.code === '42P01') {
                // Tabla no existe - crearla con datos iniciales
                console.log('📋 Creando tablas de estrategas...');
                await this.crearTablasEstrategas();
            }
        } catch (error) {
            console.warn('⚠️ Error verificando BD estrategas:', error);
        }
    }

    // ========================
    // CREAR TABLAS Y DATOS INICIALES
    // ========================
    async crearTablasEstrategas() {
        // Tabla de catálogo (110 estrategas)
        const estrategasBase = this.generarCatalogo110Estrategas();
        
        // Insertar en BD (esto es solo simulación - en realidad necesitarías migración SQL)
        console.log(`📊 Generados ${estrategasBase.length} estrategas base`);
        
        // Guardar en localStorage temporalmente si no hay BD
        localStorage.setItem('f1_estrategas_catalogo', JSON.stringify(estrategasBase));
        
        // Tabla de contrataciones la manejará Supabase con migraciones
    }

    // ========================
    // GENERAR 110 ESTRATEGAS
    // ========================
    generarCatalogo110Estrategas() {
        const nombres = [
            'Luca', 'Marco', 'Giovanni', 'Francesco', 'Antonio', 'Andrea', 'Matteo', 'Stefano', 'Roberto', 'Alessandro',
            'James', 'John', 'Robert', 'Michael', 'David', 'Richard', 'Charles', 'Thomas', 'Christopher', 'Daniel',
            'Pierre', 'Jean', 'Claude', 'Louis', 'François', 'Henri', 'Jacques', 'Michel', 'Philippe', 'Alain',
            'Carlos', 'Fernando', 'Sergio', 'Miguel', 'Javier', 'Manuel', 'José', 'Juan', 'Antonio', 'Francisco',
            'Max', 'Sebastian', 'Lewis', 'Kimi', 'Valtteri', 'Nico', 'Jenson', 'Mika', 'Damon', 'Nigel'
        ];
        
        const apellidos = [
            'Rossi', 'Bianchi', 'Ferrari', 'Russo', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti', 'Esposito',
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
            'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres',
            'Verstappen', 'Hamilton', 'Vettel', 'Raikkonen', 'Bottas', 'Rosberg', 'Button', 'Hakkinen', 'Hill', 'Mansell'
        ];
        
        const nacionalidades = ['🇮🇹', '🇬🇧', '🇫🇷', '🇪🇸', '🇩🇪', '🇫🇮', '🇳🇱', '🇦🇺', '🇺🇸', '🇧🇷'];
        
        const estrategas = [];
        let idCounter = 1;
        
        // 10 estrategas por cada una de las 11 especialidades = 110
        this.especialidades.forEach((especialidad, espIndex) => {
            for (let i = 0; i < 10; i++) {
                const nombre = nombres[(espIndex * 10 + i) % nombres.length];
                const apellido = apellidos[(espIndex * 10 + i) % apellidos.length];
                const nacionalidad = nacionalidades[(espIndex + i) % nacionalidades.length];
                
                // Sueldo: 100.000€ - 2.000.000€ (progresivo por nivel)
                const nivel = i + 1; // 1 a 10
                const sueldoBase = 100000; // 100K
                const sueldoSemanal = sueldoBase * Math.pow(1.5, nivel - 1);
                
                // Bonificación: +10% a +200% (progresivo por nivel)
                const bonoBase = 10; // 10%
                const porcentajeBono = bonoBase * nivel * 2; // 10%, 20%, 30%... 200%
                
                estrategas.push({
                    id: idCounter++,
                    nombre: `${nombre} ${apellido}`,
                    nombre_corto: nombre,
                    apellidos: apellido,
                    nacionalidad: nacionalidad,
                    especialidad: especialidad.id,
                    especialidad_nombre: especialidad.nombre,
                    icono: especialidad.icono,
                    sueldo_semanal: Math.round(sueldoSemanal),
                    porcentaje_bono: porcentajeBono,
                    experiencia_años: 5 + nivel,
                    equipo_anterior: ['Ferrari', 'Mercedes', 'Red Bull', 'McLaren', 'Alpine'][(espIndex + i) % 5],
                    descripcion: `Experto en ${especialidad.desc.toLowerCase()}. ${nivel * 10}% de acierto histórico.`,
                    disponible: true
                });
            }
        });
        
        return estrategas;
    }

    // ========================
    // CARGAR CATÁLOGO DESDE BD
    // ========================
    async cargarCatalogoEstrategas() {
        try {
            // Intentar cargar desde BD
            const { data, error } = await this.supabase
                .from('estrategas_catalogo')
                .select('*')
                .eq('disponible', true)
                .order('especialidad', { ascending: true });
            
            if (error || !data || data.length === 0) {
                // Usar datos locales
                const localData = localStorage.getItem('f1_estrategas_catalogo');
                if (localData) {
                    this.catalogoEstrategas = JSON.parse(localData);
                } else {
                    // Generar por primera vez
                    this.catalogoEstrategas = this.generarCatalogo110Estrategas();
                    localStorage.setItem('f1_estrategas_catalogo', JSON.stringify(this.catalogoEstrategas));
                }
            } else {
                this.catalogoEstrategas = data;
            }
            
            console.log(`📚 Catálogo cargado: ${this.catalogoEstrategas.length} estrategas disponibles`);
            
        } catch (error) {
            console.error('❌ Error cargando catálogo:', error);
            this.catalogoEstrategas = this.generarCatalogo110Estrategas();
        }
    }

    // ========================
    // CARGAR ESTRATEGAS CONTRATADOS
    // ========================
    async cargarEstrategasContratados() {
        try {
            const { data, error } = await this.supabase
                .from('estrategas_contrataciones')
                .select(`
                    *,
                    estratega:estrategas_catalogo(*)
                `)
                .eq('escuderia_id', this.escuderia.id)
                .eq('estado', 'activo')
                .order('fecha_inicio_contrato', { ascending: true });
            
            if (error) throw error;
            
            this.estrategasContratados = data || [];
            console.log(`👥 ${this.estrategasContratados.length} estrategas contratados`);
            
        } catch (error) {
            console.error('❌ Error cargando estrategas contratados:', error);
            this.estrategasContratados = [];
        }
    }

    // ========================
    // CALCULAR TIEMPO RESTANTE
    // ========================
    calcularTiempoRestante(fechaInicio) {
        const unaSemanaMs = 7 * 24 * 60 * 60 * 1000; // 168 horas
        const ahora = new Date().getTime();
        const inicio = new Date(fechaInicio).getTime();
        const tiempoTranscurrido = ahora - inicio;
        const tiempoRestante = unaSemanaMs - tiempoTranscurrido;
        
        if (tiempoRestante <= 0) return { dias: 0, horas: 0, minutos: 0, porcentaje: 100 };
        
        const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
        const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const porcentaje = (tiempoTranscurrido / unaSemanaMs) * 100;
        
        return { dias, horas, minutos, porcentaje };
    }

    // ========================
    // OBTENER COLOR BARRA DESGASTE
    // ========================
    getColorBarraDesgaste(porcentaje) {
        if (porcentaje < 60) return '#4CAF50';     // Verde (días 1-4)
        if (porcentaje < 85) return '#FF9800';     // Amarillo (días 5-6)
        return '#e10600';                          // Rojo (día 7)
    }

    // ========================
    // ACTUALIZAR UI ESTRATEGAS
    // ========================
    actualizarUIEstrategas() {
        const container = document.getElementById('pilotos-container');
        const contador = document.getElementById('contador-estrategas');
        
        if (!container) {
            console.warn('⚠️ No se encontró #pilotos-container');
            return;
        }
        
        // Actualizar contador
        if (contador) {
            contador.textContent = `${this.estrategasContratados.length}/4`;
        }
        
        // Generar HTML para los 4 slots
        let html = '<div class="produccion-slots">';
        
        for (let i = 0; i < 4; i++) {
            const contratacion = this.estrategasContratados[i];
            
            if (contratacion && contratacion.estratega) {
                const estratega = contratacion.estratega;
                const tiempo = this.calcularTiempoRestante(contratacion.fecha_inicio_contrato);
                const colorBarra = this.getColorBarraDesgaste(tiempo.porcentaje);
                
                html += `
                    <div class="produccion-slot estratega-slot" onclick="window.estrategiaManager.mostrarDetallesEstratega(${i})">
                        <div class="slot-content">
                            <div class="estratega-icon" style="font-size: 1.5rem; margin-bottom: 5px;">
                                ${estratega.icono || '👨‍🔧'}
                            </div>
                            
                            <div style="display: block; font-size: 0.75rem; color: white; font-weight: bold; 
                                 margin-bottom: 3px; line-height: 1.1; text-align: center;">
                                ${estratega.nombre_corto || estratega.nombre.split(' ')[0]}
                            </div>
                            
                            <div style="display: block; font-size: 0.65rem; color: #00d2be; 
                                 margin-bottom: 2px; font-weight: 500;">
                                ${estratega.especialidad_nombre || estratega.especialidad}
                            </div>
                            
                            <div style="display: block; font-size: 0.6rem; color: #FFD700; 
                                 margin-bottom: 5px;">
                                +${estratega.porcentaje_bono}% bono
                            </div>
                            
                            <!-- Barra de desgaste -->
                            <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); 
                                 border-radius: 2px; margin-top: 3px; overflow: hidden;">
                                <div style="width: ${tiempo.porcentaje}%; height: 100%; 
                                     background: ${colorBarra}; border-radius: 2px; 
                                     transition: width 0.3s ease;">
                                </div>
                            </div>
                            
                            <div style="font-size: 0.55rem; color: #aaa; margin-top: 3px;">
                                ${tiempo.dias > 0 ? `${tiempo.dias}d` : `${tiempo.horas}h`} restante
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="produccion-slot estratega-vacio" 
                         onclick="window.estrategiaManager.mostrarModalContratacion(${i})">
                        <div class="slot-content">
                            <i class="fas fa-plus" style="font-size: 1.2rem; color: #666; margin-bottom: 5px;"></i>
                            <span style="display: block; font-size: 0.75rem; color: #888;">Slot ${i + 1}</span>
                            <span style="display: block; font-size: 0.65rem; color: #aaa; margin-top: 2px;">Vacío</span>
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    // ========================
    // MOSTRAR MODAL CONTRATACIÓN
    // ========================
    async mostrarModalContratacion(slotIndex) {
        // Verificar límite
        if (this.estrategasContratados.length >= 4) {
            this.f1Manager.showNotification('❌ Límite de 4 estrategas alcanzado', 'error');
            return;
        }
        
        // Cargar catálogo si no está cargado
        if (this.catalogoEstrategas.length === 0) {
            await this.cargarCatalogoEstrategas();
        }
        
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'modal-contratacion-estrategas';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            overflow-y: auto;
            padding: 20px;
        `;
        
        // Header
        const header = `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #00d2be;
            ">
                <h2 style="color: #00d2be; margin: 0;">
                    <i class="fas fa-user-tie"></i> CONTRATAR ESTRATEGA
                </h2>
                <button onclick="document.getElementById('modal-contratacion-estrategas').remove()" 
                        style="background: #e10600; color: white; border: none; width: 32px; height: 32px; 
                               border-radius: 50%; cursor: pointer; font-size: 1rem; font-weight: bold;">
                    ✕
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button class="filtro-especialidad active" data-especialidad="todas" 
                            onclick="window.estrategiaManager.filtrarCatalogo('todas')"
                            style="padding: 8px 15px; background: #00d2be; color: black; border: none; 
                                   border-radius: 20px; font-size: 0.8rem; cursor: pointer;">
                        Todas
                    </button>
                    ${this.especialidades.map(esp => `
                        <button class="filtro-especialidad" data-especialidad="${esp.id}"
                                onclick="window.estrategiaManager.filtrarCatalogo('${esp.id}')"
                                style="padding: 8px 15px; background: rgba(0,210,190,0.1); color: #00d2be; 
                                       border: 1px solid #00d2be; border-radius: 20px; font-size: 0.8rem; cursor: pointer;">
                            ${esp.icono} ${esp.nombre}
                        </button>
                    `).join('')}
                </div>
                
                <div style="color: #aaa; font-size: 0.9rem;">
                    ${this.catalogoEstrategas.length} estrategas disponibles • Slot ${slotIndex + 1}
                </div>
            </div>
        `;
        
        // Grid de estrategas
        let estrategasHTML = '<div id="grid-estrategas-catalogo" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 30px;">';
        
        this.catalogoEstrategas.slice(0, 20).forEach(estratega => {
            estrategasHTML += `
                <div class="estratega-card" data-id="${estratega.id}" data-especialidad="${estratega.especialidad}"
                     onclick="window.estrategiaManager.seleccionarEstratega(${estratega.id}, ${slotIndex})"
                     style="background: rgba(26, 26, 46, 0.8); border: 1px solid #333; border-radius: 8px; 
                            padding: 15px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 1.8rem;">${estratega.icono}</div>
                            <div style="font-weight: bold; color: white; font-size: 1rem; margin-top: 5px;">
                                ${estratega.nombre}
                            </div>
                            <div style="color: #00d2be; font-size: 0.9rem; margin-top: 2px;">
                                ${estratega.especialidad_nombre}
                            </div>
                        </div>
                        <div style="font-size: 1.5rem;">${estratega.nacionalidad}</div>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                            <span style="color: #aaa;">Sueldo semanal:</span>
                            <span style="color: #FFD700; font-weight: bold;">
                                €${estratega.sueldo_semanal.toLocaleString()}
                            </span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                            <span style="color: #aaa;">Bonificación:</span>
                            <span style="color: #4CAF50; font-weight: bold;">
                                +${estratega.porcentaje_bono}%
                            </span>
                        </div>
                        
                        <div style="font-size: 0.8rem; color: #888; margin-top: 8px;">
                            ${estratega.descripcion}
                        </div>
                    </div>
                </div>
            `;
        });
        
        estrategasHTML += '</div>';
        
        // Footer
        const footer = `
            <div style="text-align: center; color: #aaa; font-size: 0.9rem; padding-top: 20px; border-top: 1px solid #333;">
                <div style="margin-bottom: 10px;">
                    <i class="fas fa-info-circle"></i> Los pagos se realizan automáticamente cada domingo a las 23:59
                </div>
                <button onclick="document.getElementById('modal-contratacion-estrategas').remove()"
                        style="padding: 10px 30px; background: #333; color: white; border: none; 
                               border-radius: 5px; cursor: pointer;">
                    Cancelar
                </button>
            </div>
        `;
        
        modal.innerHTML = header + estrategasHTML + footer;
        document.body.appendChild(modal);
        
        // Añadir estilos
        this.añadirEstilosModal();
    }

    // ========================
    // FILTRAR CATÁLOGO
    // ========================
    filtrarCatalogo(especialidadId) {
        const cards = document.querySelectorAll('.estratega-card');
        const filtros = document.querySelectorAll('.filtro-especialidad');
        
        // Actualizar botones activos
        filtros.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filtro-especialidad[data-especialidad="${especialidadId}"]`).classList.add('active');
        
        // Filtrar cards
        cards.forEach(card => {
            if (especialidadId === 'todas' || card.dataset.especialidad === especialidadId) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ========================
    // SELECCIONAR ESTRATEGA PARA CONTRATAR
    // ========================
    async seleccionarEstratega(estrategaId, slotIndex) {
        const estratega = this.catalogoEstrategas.find(e => e.id === estrategaId);
        
        if (!estratega) {
            this.f1Manager.showNotification('❌ Estratega no encontrado', 'error');
            return;
        }
        
        // Verificar dinero
        if (this.escuderia.dinero < estratega.sueldo_semanal) {
            this.f1Manager.showNotification(`❌ Dinero insuficiente. Necesitas €${estratega.sueldo_semanal.toLocaleString()}`, 'error');
            return;
        }
        
        // Confirmación
        if (!confirm(`¿Contratar a ${estratega.nombre} por €${estratega.sueldo_semanal.toLocaleString()}/semana?\n\n• Bono: +${estratega.porcentaje_bono}% en ${estratega.especialidad_nombre}\n• Pago automático cada domingo\n• Despido anticipado: Penalización 3× sueldo`)) {
            return;
        }
        
        try {
            const fechaInicio = new Date().toISOString();
            
            // Insertar en BD
            const { data, error } = await this.supabase
                .from('estrategas_contrataciones')
                .insert([{
                    escuderia_id: this.escuderia.id,
                    estratega_id: estratega.id,
                    fecha_inicio_contrato: fechaInicio,
                    fecha_proximo_pago: this.calcularProximoPago(),
                    estado: 'activo',
                    slot_asignado: slotIndex,
                    total_pagado: 0,
                    penalizaciones_pagadas: 0
                }])
                .select();
            
            if (error) throw error;
            
            // Restar dinero (primer pago inmediato)
            this.escuderia.dinero -= estratega.sueldo_semanal;
            await this.f1Manager.updateEscuderiaMoney();
            
            // Registrar transacción de presupuesto
            if (window.presupuestoManager && window.presupuestoManager.registrarTransaccion) {
                await window.presupuestoManager.registrarTransaccion(
                    'gasto',
                    estratega.sueldo_semanal,
                    `Sueldo semanal ${estratega.nombre}`,
                    'estrategas',
                    { estratega_id: estratega.id, especialidad: estratega.especialidad }
                );
            }
            
            // Recargar lista
            await this.cargarEstrategasContratados();
            
            // Actualizar UI
            this.actualizarUIEstrategas();
            
            // Cerrar modal
            const modal = document.getElementById('modal-contratacion-estrategas');
            if (modal) modal.remove();
            
            // Notificación
            this.f1Manager.showNotification(
                `✅ ${estratega.nombre} contratado\n💰 -€${estratega.sueldo_semanal.toLocaleString()}/semana\n✨ +${estratega.porcentaje_bono}% bono`,
                'success'
            );
            
        } catch (error) {
            console.error('❌ Error contratando estratega:', error);
            this.f1Manager.showNotification('❌ Error al contratar estratega', 'error');
        }
    }

    // ========================
    // CALCULAR PRÓXIMO PAGO (DOMINGO 23:59)
    // ========================
    calcularProximoPago() {
        const ahora = new Date();
        const domingo = new Date(ahora);
        
        // Ir al próximo domingo
        const diasHastaDomingo = 7 - ahora.getDay(); // 0=Domingo, 1=Lunes...
        domingo.setDate(ahora.getDate() + (diasHastaDomingo === 0 ? 7 : diasHastaDomingo));
        
        // Establecer a las 23:59:59
        domingo.setHours(23, 59, 59, 999);
        
        return domingo.toISOString();
    }

    // ========================
    // MOSTRAR DETALLES ESTRATEGA
    // ========================
    async mostrarDetallesEstratega(index) {
        const contratacion = this.estrategasContratados[index];
        if (!contratacion) return;
        
        const estratega = contratacion.estratega;
        const tiempo = this.calcularTiempoRestante(contratacion.fecha_inicio_contrato);
        const proximoPago = new Date(contratacion.fecha_proximo_pago || this.calcularProximoPago());
        
        // Calcular costo de despido (3x sueldo)
        const costoDespido = estratega.sueldo_semanal * 3;
        
        const modal = document.createElement('div');
        modal.id = 'modal-detalles-estratega';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a1a2e; border: 3px solid #00d2be; border-radius: 10px; 
                        max-width: 400px; width: 100%; padding: 25px; position: relative;">
                
                <button onclick="document.getElementById('modal-detalles-estratega').remove()"
                        style="position: absolute; top: 15px; right: 15px; background: #e10600; 
                               color: white; border: none; width: 30px; height: 30px; 
                               border-radius: 50%; cursor: pointer; font-weight: bold;">
                    ✕
                </button>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">
                        ${estratega.icono}
                    </div>
                    <h3 style="color: #00d2be; margin: 0 0 5px 0;">${estratega.nombre}</h3>
                    <div style="color: #aaa; font-size: 1.1rem; margin-bottom: 15px;">
                        ${estratega.nacionalidad} • ${estratega.especialidad_nombre}
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #aaa;">Sueldo semanal:</span>
                        <span style="color: #FFD700; font-weight: bold;">
                            €${estratega.sueldo_semanal.toLocaleString()}
                        </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #aaa;">Bonificación:</span>
                        <span style="color: #4CAF50; font-weight: bold;">
                            +${estratega.porcentaje_bono}%
                        </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #aaa;">Experiencia:</span>
                        <span style="color: white; font-weight: bold;">
                            ${estratega.experiencia_años} años
                        </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #aaa;">Equipo anterior:</span>
                        <span style="color: white;">${estratega.equipo_anterior}</span>
                    </div>
                    
                    <!-- Barra de desgaste -->
                    <div style="margin: 15px 0;">
                        <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 5px;">
                            Tiempo restante del contrato:
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); 
                             border-radius: 3px; overflow: hidden; margin-bottom: 5px;">
                            <div style="width: ${tiempo.porcentaje}%; height: 100%; 
                                 background: ${this.getColorBarraDesgaste(tiempo.porcentaje)};
                                 border-radius: 3px; transition: width 0.3s ease;">
                            </div>
                        </div>
                        <div style="color: ${tiempo.dias > 2 ? '#4CAF50' : tiempo.dias > 0 ? '#FF9800' : '#e10600'}; 
                             font-size: 0.9rem; font-weight: bold;">
                            ${tiempo.dias > 0 ? `${tiempo.dias} días ${tiempo.horas}h` : `${tiempo.horas}h ${tiempo.minutos}m`}
                        </div>
                    </div>
                    
                    <div style="background: rgba(0,210,190,0.1); padding: 12px; border-radius: 6px; 
                         border: 1px solid rgba(0,210,190,0.3); margin: 15px 0;">
                        <div style="color: #00d2be; font-weight: bold; font-size: 0.9rem;">
                            <i class="fas fa-calendar-alt"></i> Próximo pago:
                        </div>
                        <div style="color: white; font-size: 1rem; margin-top: 5px;">
                            Domingo ${proximoPago.getDate()}/${proximoPago.getMonth() + 1} • 23:59
                        </div>
                        <div style="color: #aaa; font-size: 0.8rem; margin-top: 5px;">
                            Se cobrará automáticamente si hay fondos
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.estrategiaManager.despedirEstratega(${contratacion.id}, ${index})"
                            style="flex: 1; padding: 12px; background: rgba(225,6,0,0.2); 
                                   border: 2px solid #e10600; color: #e10600; border-radius: 6px; 
                                   cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                        <i class="fas fa-user-slash"></i> DESPEDIR
                        <div style="font-size: 0.7rem; color: #ff4444; margin-top: 3px;">
                            Penalización: €${costoDespido.toLocaleString()}
                        </div>
                    </button>
                    
                    <button onclick="document.getElementById('modal-detalles-estratega').remove()"
                            style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); 
                                   border: 2px solid #666; color: white; border-radius: 6px; 
                                   cursor: pointer; font-weight: bold;">
                        Cerrar
                    </button>
                </div>
                
                <div style="color: #666; font-size: 0.8rem; text-align: center; margin-top: 15px;">
                    <i class="fas fa-info-circle"></i> Si no hay dinero el domingo, se irá sin penalización
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // ========================
    // DESPEDIR ESTRATEGA
    // ========================
    async despedirEstratega(contratacionId, index) {
        const contratacion = this.estrategasContratados[index];
        if (!contratacion) return;
        
        const estratega = contratacion.estratega;
        const costoDespido = estratega.sueldo_semanal * 3;
        
        // Verificar si es domingo (sin penalización)
        const hoy = new Date();
        const esDomingo = hoy.getDay() === 0;
        const horaActual = hoy.getHours();
        const esAntesDePago = !(esDomingo && horaActual === 23);
        
        let mensaje = `¿Despedir a ${estratega.nombre}?`;
        
        if (esAntesDePago) {
            mensaje += `\n\n⚠️ PENALIZACIÓN: €${costoDespido.toLocaleString()} (3× sueldo semanal)`;
            
            if (this.escuderia.dinero < costoDespido) {
                this.f1Manager.showNotification(`❌ No tienes €${costoDespido.toLocaleString()} para la penalización`, 'error');
                return;
            }
        } else {
            mensaje += `\n\n✅ Sin penalización (es domingo, próximo pago a las 23:59)`;
        }
        
        if (!confirm(mensaje)) return;
        
        try {
            // Si hay penalización, restar dinero
            if (esAntesDePago) {
                this.escuderia.dinero -= costoDespido;
                await this.f1Manager.updateEscuderiaMoney();
                
                // Registrar transacción
                if (window.presupuestoManager) {
                    await window.presupuestoManager.registrarTransaccion(
                        'gasto',
                        costoDespido,
                        `Penalización despido ${estratega.nombre}`,
                        'estrategas',
                        { estratega_id: estratega.id, tipo: 'penalizacion' }
                    );
                }
            }
            
            // Actualizar BD
            const { error } = await this.supabase
                .from('estrategas_contrataciones')
                .update({
                    estado: 'despedido',
                    fecha_fin_contrato: new Date().toISOString(),
                    penalizaciones_pagadas: esAntesDePago ? costoDespido : 0
                })
                .eq('id', contratacionId);
            
            if (error) throw error;
            
            // Recargar
            await this.cargarEstrategasContratados();
            this.actualizarUIEstrategas();
            
            // Cerrar modales
            ['modal-detalles-estratega', 'modal-gestion-estrategas'].forEach(id => {
                const modal = document.getElementById(id);
                if (modal) modal.remove();
            });
            
            // Notificación
            this.f1Manager.showNotification(
                `👋 ${estratega.nombre} despedido${esAntesDePago ? ` • -€${costoDespido.toLocaleString()}` : ''}`,
                esAntesDePago ? 'warning' : 'info'
            );
            
        } catch (error) {
            console.error('❌ Error despidiendo estratega:', error);
            this.f1Manager.showNotification('❌ Error al despedir', 'error');
        }
    }

    // ========================
    // PROCESAR PAGOS AUTOMÁTICOS (DOMINGO 23:59)
    // ========================
    async procesarPagosAutomaticos() {
        const ahora = new Date();
        const esDomingo = ahora.getDay() === 0;
        const esHoraPago = ahora.getHours() === 23 && ahora.getMinutes() === 59;
        
        if (!esDomingo || !esHoraPago) return;
        
        console.log('💰 Procesando pagos automáticos de estrategas...');
        
        try {
            // Obtener estrategas activos
            const { data: contrataciones, error } = await this.supabase
                .from('estrategas_contrataciones')
                .select(`
                    *,
                    estratega:estrategas_catalogo(*)
                `)
                .eq('escuderia_id', this.escuderia.id)
                .eq('estado', 'activo');
            
            if (error) throw error;
            
            if (!contrataciones || contrataciones.length === 0) return;
            
            let totalCobrado = 0;
            let estrategasRenovados = 0;
            let estrategasIdos = 0;
            
            for (const contratacion of contrataciones) {
                const estratega = contratacion.estratega;
                const sueldo = estratega.sueldo_semanal;
                
                // Verificar si hay dinero
                if (this.escuderia.dinero >= sueldo) {
                    // COBRAR y RENOVAR
                    this.escuderia.dinero -= sueldo;
                    totalCobrado += sueldo;
                    estrategasRenovados++;
                    
                    // Actualizar contrato
                    await this.supabase
                        .from('estrategas_contrataciones')
                        .update({
                            fecha_inicio_contrato: new Date().toISOString(),
                            fecha_proximo_pago: this.calcularProximoPago(),
                            total_pagado: (contratacion.total_pagado || 0) + sueldo
                        })
                        .eq('id', contratacion.id);
                    
                    // Registrar transacción
                    if (window.presupuestoManager) {
                        await window.presupuestoManager.registrarTransaccion(
                            'gasto',
                            sueldo,
                            `Renovación ${estratega.nombre}`,
                            'estrategas',
                            { estratega_id: estratega.id, tipo: 'renovacion' }
                        );
                    }
                    
                } else {
                    // NO HAY DINERO → Estratega se va
                    estrategasIdos++;
                    
                    await this.supabase
                        .from('estrategas_contrataciones')
                        .update({
                            estado: 'finalizado',
                            fecha_fin_contrato: new Date().toISOString(),
                            motivo_fin: 'falta_pago'
                        })
                        .eq('id', contratacion.id);
                }
            }
            
            // Actualizar dinero en BD
            if (totalCobrado > 0) {
                await this.f1Manager.updateEscuderiaMoney();
            }
            
            // Recargar datos
            await this.cargarEstrategasContratados();
            this.actualizarUIEstrategas();
            
            // Notificación resumen
            let mensaje = '';
            if (estrategasRenovados > 0) {
                mensaje += `✅ ${estrategasRenovados} estratega(s) renovado(s)\n💰 -€${totalCobrado.toLocaleString()}`;
            }
            if (estrategasIdos > 0) {
                if (mensaje) mensaje += '\n\n';
                mensaje += `👋 ${estrategasIdos} estratega(s) se fueron por falta de pago`;
            }
            
            if (mensaje) {
                this.f1Manager.showNotification(mensaje, estrategasIdos > 0 ? 'warning' : 'info');
            }
            
            console.log(`💰 Pagos procesados: ${estrategasRenovados} renovados, ${estrategasIdos} idos`);
            
        } catch (error) {
            console.error('❌ Error procesando pagos automáticos:', error);
        }
    }

    // ========================
    // MOSTRAR GESTIÓN COMPLETA
    // ========================
    async mostrarGestionCompleta() {
        const modal = document.createElement('div');
        modal.id = 'modal-gestion-estrategas';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            overflow-y: auto;
            padding: 20px;
        `;
        
        // Pestañas
        const tabs = `
            <div style="display: flex; gap: 5px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                <button class="tab-gestion active" data-tab="contratados"
                        onclick="window.estrategiaManager.cambiarTabGestion('contratados')"
                        style="padding: 10px 20px; background: #00d2be; color: black; border: none; 
                               border-radius: 5px 5px 0 0; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-users"></i> Contratados (${this.estrategasContratados.length}/4)
                </button>
                <button class="tab-gestion" data-tab="catalogo"
                        onclick="window.estrategiaManager.cambiarTabGestion('catalogo')"
                        style="padding: 10px 20px; background: rgba(0,210,190,0.1); color: #00d2be; 
                               border: 1px solid #00d2be; border-radius: 5px 5px 0 0; cursor: pointer;">
                    <i class="fas fa-book"></i> Catálogo (${this.catalogoEstrategas.length})
                </button>
                <button class="tab-gestion" data-tab="historial"
                        onclick="window.estrategiaManager.cambiarTabGestion('historial')"
                        style="padding: 10px 20px; background: rgba(0,210,190,0.1); color: #00d2be; 
                               border: 1px solid #00d2be; border-radius: 5px 5px 0 0; cursor: pointer;">
                    <i class="fas fa-history"></i> Historial
                </button>
            </div>
        `;
        
        // Header
        const header = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #00d2be; margin: 0;">
                    <i class="fas fa-user-tie"></i> GESTIÓN DE ESTRATEGAS
                </h2>
                <button onclick="document.getElementById('modal-gestion-estrategas').remove()"
                        style="background: #e10600; color: white; border: none; width: 32px; height: 32px; 
                               border-radius: 50%; cursor: pointer; font-size: 1rem; font-weight: bold;">
                    ✕
                </button>
            </div>
        `;
        
        // Contenido inicial (pestaña contratados)
        const contenidoContratados = await this.generarHTMLContratados();
        
        modal.innerHTML = header + tabs + contenidoContratados;
        document.body.appendChild(modal);
    }

    // ========================
    // GENERAR HTML CONTRATADOS
    // ========================
    async generarHTMLContratados() {
        if (this.estrategasContratados.length === 0) {
            return `
                <div id="contenido-contratados" class="contenido-tab">
                    <div style="text-align: center; padding: 50px; color: #666;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">👥</div>
                        <h3 style="color: #aaa; margin-bottom: 10px;">No hay estrategas contratados</h3>
                        <p style="color: #888; margin-bottom: 30px;">
                            Contrata estrategas para obtener bonificaciones en tus pronósticos
                        </p>
                        <button onclick="window.estrategiaManager.cambiarTabGestion('catalogo')"
                                style="padding: 12px 30px; background: #00d2be; color: black; 
                                       border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-plus"></i> Ver catálogo de estrategas
                        </button>
                    </div>
                </div>
            `;
        }
        
        let html = `
            <div id="contenido-contratados" class="contenido-tab">
                <div style="color: #aaa; margin-bottom: 15px;">
                    <i class="fas fa-info-circle"></i> Los pagos se realizan automáticamente cada domingo a las 23:59
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-top: 20px;">
        `;
        
        for (const contratacion of this.estrategasContratados) {
            const estratega = contratacion.estratega;
            const tiempo = this.calcularTiempoRestante(contratacion.fecha_inicio_contrato);
            const colorBarra = this.getColorBarraDesgaste(tiempo.porcentaje);
            
            html += `
                <div style="background: rgba(26, 26, 46, 0.8); border: 1px solid #333; border-radius: 8px; padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <div style="font-size: 1.8rem;">${estratega.icono}</div>
                                <div>
                                    <div style="font-weight: bold; color: white; font-size: 1rem;">
                                        ${estratega.nombre}
                                    </div>
                                    <div style="color: #00d2be; font-size: 0.9rem;">
                                        ${estratega.nacionalidad} • ${estratega.especialidad_nombre}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #FFD700; font-weight: bold; font-size: 1rem;">
                                €${estratega.sueldo_semanal.toLocaleString()}
                            </div>
                            <div style="color: #4CAF50; font-size: 0.9rem;">
                                +${estratega.porcentaje_bono}%
                            </div>
                        </div>
                    </div>
                    
                    <!-- Barra de desgaste -->
                    <div style="margin: 15px 0;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px;">
                            <span style="color: #aaa;">Contrato:</span>
                            <span style="color: ${tiempo.dias > 2 ? '#4CAF50' : '#FF9800'}; font-weight: bold;">
                                ${tiempo.dias > 0 ? `${tiempo.dias}d ${tiempo.horas}h` : `${tiempo.horas}h ${tiempo.minutos}m`}
                            </span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); 
                             border-radius: 3px; overflow: hidden;">
                            <div style="width: ${tiempo.porcentaje}%; height: 100%; 
                                 background: ${colorBarra}; border-radius: 3px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="font-size: 0.85rem; color: #aaa; margin-bottom: 15px;">
                        Próximo pago: Domingo • 23:59
                    </div>
                    
                    <button onclick="window.estrategiaManager.despedirEstratega(${contratacion.id})"
                            style="width: 100%; padding: 10px; background: rgba(225,6,0,0.1); 
                                   border: 1px solid #e10600; color: #e10600; border-radius: 5px; 
                                   cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                        <i class="fas fa-user-slash"></i> DESPEDIR
                        <div style="font-size: 0.7rem; color: #ff4444; margin-top: 3px;">
                            Penalización: €${(estratega.sueldo_semanal * 3).toLocaleString()}
                        </div>
                    </button>
                </div>
            `;
        }
        
        html += `
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                    <div style="color: #aaa; font-size: 0.9rem;">
                        <i class="fas fa-lightbulb"></i> Consejo: Despide el domingo antes de las 23:59 para evitar penalización
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    // ========================
    // CAMBIAR PESTAÑA GESTIÓN
    // ========================
    async cambiarTabGestion(tabId) {
        // Actualizar botones
        document.querySelectorAll('.tab-gestion').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) btn.classList.add('active');
        });
        
        // Cargar contenido
        let contenido = '';
        
        switch(tabId) {
            case 'contratados':
                contenido = await this.generarHTMLContratados();
                break;
                
            case 'catalogo':
                contenido = await this.generarHTMLCatalogo();
                break;
                
            case 'historial':
                contenido = await this.generarHTMLHistorial();
                break;
        }
        
        const contenedor = document.getElementById('contenido-contratados');
        if (contenedor) {
            contenedor.outerHTML = contenido;
        }
    }

    // ========================
    // GENERAR HTML CATÁLOGO
    // ========================
    async generarHTMLCatalogo() {
        // Filtrar solo estrategas no contratados
        const estrategasContratadosIds = this.estrategasContratados.map(c => c.estratega_id);
        const estrategasDisponibles = this.catalogoEstrategas.filter(
            e => !estrategasContratadosIds.includes(e.id)
        );
        
        // Agrupar por especialidad
        const agrupados = {};
        estrategasDisponibles.forEach(estratega => {
            if (!agrupados[estratega.especialidad]) {
                agrupados[estratega.especialidad] = [];
            }
            agrupados[estratega.especialidad].push(estratega);
        });
        
        let html = `
            <div id="contenido-contratados" class="contenido-tab">
                <div style="color: #aaa; margin-bottom: 20px;">
                    <i class="fas fa-filter"></i> ${estrategasDisponibles.length} estrategas disponibles
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                        <button class="filtro-catalogo active" data-especialidad="todas"
                                onclick="window.estrategiaManager.filtrarCatalogoGestion('todas')"
                                style="padding: 8px 15px; background: #00d2be; color: black; border: none; 
                                       border-radius: 20px; font-size: 0.8rem; cursor: pointer;">
                            Todas (${estrategasDisponibles.length})
                        </button>
                        ${this.especialidades.map(esp => {
                            const count = agrupados[esp.id]?.length || 0;
                            if (count === 0) return '';
                            return `
                                <button class="filtro-catalogo" data-especialidad="${esp.id}"
                                        onclick="window.estrategiaManager.filtrarCatalogoGestion('${esp.id}')"
                                        style="padding: 8px 15px; background: rgba(0,210,190,0.1); 
                                               color: #00d2be; border: 1px solid #00d2be; 
                                               border-radius: 20px; font-size: 0.8rem; cursor: pointer;">
                                    ${esp.icono} ${esp.nombre} (${count})
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div id="grid-catalogo-completo" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
        `;
        
        // Mostrar todos inicialmente
        estrategasDisponibles.forEach(estratega => {
            const especialidadInfo = this.especialidades.find(e => e.id === estratega.especialidad);
            
            html += `
                <div class="estratega-card-completo" data-especialidad="${estratega.especialidad}"
                     onclick="window.estrategiaManager.contratarDesdeCatalogo(${estratega.id})"
                     style="background: rgba(26, 26, 46, 0.8); border: 1px solid #333; border-radius: 8px; 
                            padding: 15px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 1.8rem;">${estratega.icono || especialidadInfo?.icono || '👨‍🔧'}</div>
                            <div style="font-weight: bold; color: white; font-size: 1rem; margin-top: 5px;">
                                ${estratega.nombre}
                            </div>
                            <div style="color: #00d2be; font-size: 0.9rem; margin-top: 2px;">
                                ${estratega.especialidad_nombre} • ${estratega.nacionalidad}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #FFD700; font-weight: bold; font-size: 1rem;">
                                €${estratega.sueldo_semanal.toLocaleString()}<span style="font-size: 0.8rem; color: #aaa;">/sem</span>
                            </div>
                            <div style="color: #4CAF50; font-size: 0.9rem; font-weight: bold;">
                                +${estratega.porcentaje_bono}%
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <div style="font-size: 0.85rem; color: #aaa; margin-bottom: 8px;">
                            ${estratega.equipo_anterior} • ${estratega.experiencia_años} años exp.
                        </div>
                        
                        <div style="font-size: 0.8rem; color: #888; line-height: 1.4;">
                            ${estratega.descripcion}
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; text-align: center;">
                        <button style="width: 100%; padding: 8px; background: rgba(0,210,190,0.2); 
                                color: #00d2be; border: 1px solid #00d2be; border-radius: 5px; 
                                cursor: pointer; font-weight: bold;">
                            CONTRATAR
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: rgba(0,210,190,0.05); 
                     border-radius: 8px; border: 1px solid rgba(0,210,190,0.2);">
                    <div style="color: #00d2be; font-weight: bold; margin-bottom: 10px;">
                        <i class="fas fa-lightbulb"></i> ¿Cómo funcionan los bonos?
                    </div>
                    <div style="color: #aaa; font-size: 0.9rem; line-height: 1.5;">
                        Cada estratega te da un <strong style="color: #4CAF50;">bono del +X%</strong> en 
                        pronósticos de su especialidad. Ejemplo: Si aciertas un pronóstico de Meteorología 
                        (100 puntos base) con un Meteorólogo +120%, ganas <strong>220 puntos</strong> 
                        (100 + 120%).
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    // ========================
    // FILTRAR CATÁLOGO GESTIÓN
    // ========================
    filtrarCatalogoGestion(especialidadId) {
        const cards = document.querySelectorAll('.estratega-card-completo');
        const filtros = document.querySelectorAll('.filtro-catalogo');
        
        // Actualizar botones activos
        filtros.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filtro-catalogo[data-especialidad="${especialidadId}"]`).classList.add('active');
        
        // Filtrar cards
        cards.forEach(card => {
            if (especialidadId === 'todas' || card.dataset.especialidad === especialidadId) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ========================
    // CONTRATAR DESDE CATÁLOGO
    // ========================
    async contratarDesdeCatalogo(estrategaId) {
        // Encontrar slot vacío
        let slotIndex = -1;
        for (let i = 0; i < 4; i++) {
            if (!this.estrategasContratados[i]) {
                slotIndex = i;
                break;
            }
        }
        
        if (slotIndex === -1) {
            this.f1Manager.showNotification('❌ No hay slots vacíos. Despide a un estratega primero.', 'error');
            return;
        }
        
        // Llamar a la función de selección
        await this.seleccionarEstratega(estrategaId, slotIndex);
        
        // Si se contrató, actualizar la vista
        if (this.estrategasContratados.length > 0) {
            await this.cambiarTabGestion('contratados');
        }
    }

    // ========================
    // GENERAR HTML HISTORIAL
    // ========================
    async generarHTMLHistorial() {
        try {
            const { data: historial, error } = await this.supabase
                .from('estrategas_contrataciones')
                .select(`
                    *,
                    estratega:estrategas_catalogo(*)
                `)
                .eq('escuderia_id', this.escuderia.id)
                .neq('estado', 'activo')
                .order('fecha_fin_contrato', { ascending: false });
            
            if (error) throw error;
            
            let html = `
                <div id="contenido-contratados" class="contenido-tab">
                    <div style="color: #aaa; margin-bottom: 20px;">
                        <i class="fas fa-history"></i> Historial de estrategas
                    </div>
            `;
            
            if (!historial || historial.length === 0) {
                html += `
                    <div style="text-align: center; padding: 50px; color: #666;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">📜</div>
                        <h3 style="color: #aaa; margin-bottom: 10px;">Sin historial</h3>
                        <p style="color: #888;">
                            Aquí aparecerán los estrategas que hayan finalizado su contrato
                        </p>
                    </div>
                `;
            } else {
                // Calcular totales
                let totalPagado = 0;
                let totalPenalizaciones = 0;
                let totalEstrategas = historial.length;
                
                historial.forEach(item => {
                    totalPagado += item.total_pagado || 0;
                    totalPenalizaciones += item.penalizaciones_pagadas || 0;
                });
                
                html += `
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
                        <div style="background: rgba(0,210,190,0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="color: #00d2be; font-size: 0.9rem; margin-bottom: 5px;">Total estrategas</div>
                            <div style="color: white; font-size: 1.5rem; font-weight: bold;">${totalEstrategas}</div>
                        </div>
                        
                        <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="color: #FFD700; font-size: 0.9rem; margin-bottom: 5px;">Total pagado</div>
                            <div style="color: white; font-size: 1.5rem; font-weight: bold;">€${totalPagado.toLocaleString()}</div>
                        </div>
                        
                        <div style="background: rgba(225,6,0,0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="color: #e10600; font-size: 0.9rem; margin-bottom: 5px;">Penalizaciones</div>
                            <div style="color: white; font-size: 1.5rem; font-weight: bold;">€${totalPenalizaciones.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse; color: white;">
                            <thead style="background: rgba(0,210,190,0.2);">
                                <tr>
                                    <th style="padding: 10px; text-align: left;">Estratega</th>
                                    <th style="padding: 10px; text-align: left;">Duración</th>
                                    <th style="padding: 10px; text-align: left;">Total</th>
                                    <th style="padding: 10px; text-align: left;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                historial.forEach(item => {
                    const estratega = item.estratega;
                    const inicio = new Date(item.fecha_inicio_contrato);
                    const fin = new Date(item.fecha_fin_contrato || new Date());
                    const duracionMs = fin - inicio;
                    const duracionSemanas = Math.floor(duracionMs / (7 * 24 * 60 * 60 * 1000));
                    
                    html += `
                        <tr style="border-bottom: 1px solid #333;">
                            <td style="padding: 10px;">
                                <div style="font-weight: bold;">${estratega?.nombre || 'Desconocido'}</div>
                                <div style="color: #aaa; font-size: 0.8rem;">${estratega?.especialidad_nombre || ''}</div>
                            </td>
                            <td style="padding: 10px;">
                                ${duracionSemanas} semana${duracionSemanas !== 1 ? 's' : ''}
                            </td>
                            <td style="padding: 10px; color: #FFD700; font-weight: bold;">
                                €${(item.total_pagado || 0).toLocaleString()}
                            </td>
                            <td style="padding: 10px;">
                                <span style="color: ${item.estado === 'despedido' ? '#e10600' : '#888'}; 
                                      font-weight: bold;">
                                    ${item.estado === 'despedido' ? 'DESPEDIDO' : 'FINALIZADO'}
                                </span>
                            </td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
            return `
                <div id="contenido-contratados" class="contenido-tab">
                    <div style="text-align: center; padding: 50px; color: #e10600;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                        <p>Error cargando el historial</p>
                    </div>
                </div>
            `;
        }
    }

    // ========================
    // APLICAR BONO A PUNTOS
    // ========================
    aplicarBonoPuntos(puntosBase, especialidadPronostico) {
        // Buscar estratega especializado en esta área
        const estrategaEspecializado = this.estrategasContratados.find(
            c => c.estratega?.especialidad === especialidadPronostico
        );
        
        if (!estrategaEspecializado) {
            return puntosBase; // Sin bono
        }
        
        const bonoPorcentaje = estrategaEspecializado.estratega.porcentaje_bono;
        const puntosExtra = Math.floor(puntosBase * (bonoPorcentaje / 100));
        const puntosTotales = puntosBase + puntosExtra;
        
        console.log(`✨ Bono aplicado: ${puntosBase} + ${bonoPorcentaje}% = ${puntosTotales} puntos`);
        
        return puntosTotales;
    }

    // ========================
    // INICIAR TIMERS
    // ========================
    iniciarTimers() {
        // Timer para actualizar barras cada minuto
        this.timers.barras = setInterval(() => {
            if (document.querySelector('.estratega-slot')) {
                this.actualizarUIEstrategas();
            }
        }, 60000); // 1 minuto
        
        // Timer para procesar pagos cada hora (verifica si es domingo 23:59)
        this.timers.pagos = setInterval(() => {
            this.procesarPagosAutomaticos();
        }, 3600000); // 1 hora
        
        // Timer para notificaciones de próximo pago (cada 6 horas)
        this.timers.notificaciones = setInterval(() => {
            this.verificarProximosPagos();
        }, 21600000); // 6 horas
        
        console.log('⏱️ Timers de estrategas iniciados');
    }

    // ========================
    // VERIFICAR PRÓXIMOS PAGOS
    // ========================
    async verificarProximosPagos() {
        if (this.estrategasContratados.length === 0) return;
        
        const ahora = new Date();
        const esDomingo = ahora.getDay() === 0;
        const horasHastaPago = esDomingo ? 23 - ahora.getHours() : null;
        
        // Si es domingo y faltan menos de 12 horas para el pago
        if (esDomingo && horasHastaPago <= 12 && horasHastaPago > 0) {
            const totalPagos = this.estrategasContratados.reduce((sum, c) => {
                return sum + (c.estratega?.sueldo_semanal || 0);
            }, 0);
            
            const dineroSuficiente = this.escuderia.dinero >= totalPagos;
            
            if (!dineroSuficiente) {
                this.f1Manager.showNotification(
                    `⚠️ Pago de estrategas en ${horasHastaPago}h\n💰 Necesitas €${totalPagos.toLocaleString()}\n💸 Dinero actual: €${this.escuderia.dinero.toLocaleString()}`,
                    'warning'
                );
            }
        }
    }

    // ========================
    // AÑADIR ESTILOS MODAL
    // ========================
    añadirEstilosModal() {
        if (document.getElementById('estilos-estrategas')) return;
        
        const style = document.createElement('style');
        style.id = 'estilos-estrategas';
        style.innerHTML = `
            .estratega-card:hover {
                border-color: #00d2be !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,210,190,0.3);
            }
            
            .estratega-card-completo:hover {
                border-color: #00d2be !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,210,190,0.3);
            }
            
            .filtro-especialidad.active {
                background: #00d2be !important;
                color: black !important;
                font-weight: bold !important;
            }
            
            .filtro-catalogo.active {
                background: #00d2be !important;
                color: black !important;
                font-weight: bold !important;
            }
            
            .tab-gestion.active {
                background: #00d2be !important;
                color: black !important;
                border-color: #00d2be !important;
            }
            
            .contenido-tab {
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            /* Scroll personalizado */
            #modal-gestion-estrategas::-webkit-scrollbar {
                width: 8px;
            }
            
            #modal-gestion-estrategas::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
                border-radius: 4px;
            }
            
            #modal-gestion-estrategas::-webkit-scrollbar-thumb {
                background: #00d2be;
                border-radius: 4px;
            }
        `;
        
        document.head.appendChild(style);
    }

    // ========================
    // DESTRUIR TIMERS
    // ========================
    destruir() {
        Object.values(this.timers).forEach(timer => {
            clearInterval(timer);
        });
        console.log('🧠 Timers de estrategas destruidos');
    }
}

// Exportar al global
window.EstrategiaManager = EstrategiaManager;
