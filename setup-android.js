const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Configurando Android...');

// 1. Crear strings.xml con el nombre de la app
const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Critical LAP</string>
</resources>`;

fs.mkdirSync('android/app/src/main/res/values', { recursive: true });
fs.writeFileSync('android/app/src/main/res/values/strings.xml', stringsXml);
console.log('✅ strings.xml creado');

// 2. Actualizar AndroidManifest.xml
try {
    if (fs.existsSync('android/app/src/main/AndroidManifest.xml')) {
        let manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
        manifest = manifest.replace(/android:label="[^"]*"/g, 'android:label="@string/app_name"');
        fs.writeFileSync('android/app/src/main/AndroidManifest.xml', manifest);
        console.log('✅ AndroidManifest.xml actualizado');
    }
} catch (e) {
    console.log('⚠️  No se pudo actualizar AndroidManifest');
}

// 3. Descargar icono
console.log('📥 Descargando icono...');
try {
    execSync('curl -s -o /tmp/icon.png https://raw.githubusercontent.com/simulatorf1/f1-manager-game/main/public/IMG_20260202_194732.PNG');
    
    if (fs.existsSync('/tmp/icon.png')) {
        console.log('✅ Icono descargado');
        
        // Crear iconos para diferentes resoluciones
        const sizes = [
            ['mipmap-mdpi', 48],
            ['mipmap-hdpi', 72],
            ['mipmap-xhdpi', 96],
            ['mipmap-xxhdpi', 144],
            ['mipmap-xxxhdpi', 192]
        ];
        
        for (const [folder, size] of sizes) {
            const dir = `android/app/src/main/res/${folder}`;
            fs.mkdirSync(dir, { recursive: true });
            try {
                execSync(`convert /tmp/icon.png -resize ${size}x${size} ${dir}/ic_launcher.png`);
                console.log(`✅ Icono ${folder} creado`);
            } catch (e) {
                console.log(`⚠️  Usando icono base para ${folder}`);
                execSync(`cp /tmp/icon.png ${dir}/ic_launcher.png`);
            }
        }
    }
} catch (e) {
    console.log('⚠️  Error con icono, usando defaults');
}

console.log('🎉 ¡Configuración completada!');
