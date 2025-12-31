// ========================================
// CREDENCIALES DE ADMINISTRADOR
// ========================================


// ⚠️ CAMBIA ESTAS CREDENCIALES POR LAS TUYAS
const ADMIN_USER = CONFIG.ADMIN_USER;
const ADMIN_PASSWORD = CONFIG.ADMIN_PASS;



// ========================================
// FUNCIÓN DE LOGIN
// ========================================


function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');


    // Validar credenciales
    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
        // Login exitoso
        console.log('✅ Login exitoso');
        
        // Guardar sesión en localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', Date.now());
        localStorage.setItem('adminUsername', username);
        
        // Redirigir al panel admin
        window.location.href = 'admin.html';
    } else {
        // Login fallido
        console.log('❌ Credenciales incorrectas');
        
        // Mostrar mensaje de error
        errorMessage.classList.add('show');
        
        // Limpiar campo de contraseña
        document.getElementById('password').value = '';
        
        // Enfocar el campo de usuario
        document.getElementById('username').focus();
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
}


// ========================================
// VERIFICAR SI YA ESTÁ LOGUEADO
// ========================================


window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    const currentTime = Date.now();
    
    // Sesión válida por 24 horas (86400000 ms)
    const SESSION_DURATION = 86400000;
    
    // Si ya está logueado y la sesión no ha expirado, redirigir al admin
    if (isLoggedIn === 'true' && loginTime) {
        if ((currentTime - parseInt(loginTime)) < SESSION_DURATION) {
            console.log('✅ Sesión activa detectada. Redirigiendo...');
            window.location.href = 'admin.html';
        } else {
            // Sesión expirada, limpiar localStorage
            console.log('⏰ Sesión expirada. Limpiar datos...');
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
            localStorage.removeItem('adminUsername');
        }
    }
    
    // Enfocar el campo de usuario al cargar
    document.getElementById('username').focus();
});


// ========================================
// PREVENIR ENVÍO DEL FORMULARIO CON ENTER
// ========================================


document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    login();
});


// ========================================
// DETECCIÓN DE TECLA ENTER
// ========================================


document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});
