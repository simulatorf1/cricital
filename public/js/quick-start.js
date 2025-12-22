// SCRIPT DE INICIO RÁPIDO - Ejecutar en consola para probar
async function quickStart() {
    console.log('🚀 Inicio rápido del juego');
    
    // 1. Crear usuario demo
    const { data: user, error: signUpError } = await supabase.auth.signUp({
        email: 'demo@f1manager.com',
        password: 'demo123',
        options: {
            data: { username: 'Demo Manager' }
        }
    });
    
    if (signUpError) {
        // Si ya existe, iniciar sesión
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'demo@f1manager.com',
            password: 'demo123'
        });
        
        if (signInError) {
            console.error('Error login:', signInError);
            return;
        }
    }
    
    // 2. Crear escudería si no existe
    const { data: escuderias } = await supabase
        .from('escuderias')
        .select('*')
        .eq('user_id', user.id || signInData.user.id)
        .single();
    
    if (!escuderias) {
        const { data: nuevaEscuderia } = await supabase
            .from('escuderias')
            .insert([{
                user_id: user.id || signInData.user.id,
                nombre: 'Equipo Demo',
                dinero: 5000000,
                puntos: 0,
                nivel_ingenieria: 1
            }])
            .select()
            .single();
        
        console.log('✅ Escudería creada:', nuevaEscuderia);
        
        // Crear stats del coche
        await supabase
            .from('coches_stats')
            .insert([{ escuderia_id: nuevaEscuderia.id }]);
    }
    
    console.log('✅ Juego listo. Recarga la página.');
    location.reload();
}

// Ejecutar si hay Supabase
if (window.supabase) {
    quickStart();
} else {
    console.log('⏳ Esperando Supabase...');
    setTimeout(() => {
        if (window.supabase) quickStart();
    }, 2000);
}
