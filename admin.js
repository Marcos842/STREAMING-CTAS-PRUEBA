// ========================================
// 🔌 CONFIGURACIÓN SUPABASE
// ========================================
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_KEY = CONFIG.SUPABASE_KEY;


const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// 🔐 PROTECCIÓN DE ACCESO AL ADMIN
// ========================================
(function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    const currentTime = Date.now();
    
    // Sesión expira en 24 horas (86400000 ms)
    const SESSION_DURATION = 86400000;
    
    // Si NO está logueado, redirigir al login
    if (!isLoggedIn || isLoggedIn !== 'true') {
        console.log('❌ Acceso denegado: No hay sesión activa');
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar si la sesión expiró
    if (loginTime && (currentTime - parseInt(loginTime)) > SESSION_DURATION) {
        console.log('⏰ Sesión expirada');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('adminUsername');
        alert('⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ Acceso autorizado - Sesión válida');
})();

// ========================================
// FUNCIÓN DE CERRAR SESIÓN
// ========================================
function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        console.log('🚪 Cerrando sesión...');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}

// ========================================
// AGREGAR PRODUCTO A SUPABASE
// ========================================
async function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const oldPrice = parseFloat(document.getElementById('productOldPrice').value);
    const stock = document.getElementById('productStock').value;
    const description = document.getElementById('productDescription').value.trim();
    const logo = document.getElementById('productLogo').value.trim();

    // Validación (logo es OPCIONAL)
    if (!name || !category || isNaN(price) || !stock || !description) {
        alert('⚠️ Por favor completa todos los campos obligatorios');
        return;
    }

    try {
        console.log('➕ Agregando producto a Supabase...');

        // Mapear stock a número para Supabase
        let stockNumber = 1; // Por defecto disponible
        if (stock === 'agotado') stockNumber = 0;
        if (stock === 'a-pedido') stockNumber = 99; // Valor especial para "a pedido"

        const { data, error } = await supabaseClient
            .from('productos')
            .insert([{
                nombre: name,
                categoria: category,
                precio: price,
                descripcion: description,
                stock: stockNumber,
                imagen_url: logo || 'https://via.placeholder.com/150?text=Sin+Logo'
            }])
            .select();

        if (error) throw error;

        clearForm();
        await loadProducts();
        showNotification('✅ Producto agregado correctamente');
        
        console.log(`✅ Producto agregado: ${name}`);
    } catch (error) {
        console.error('❌ Error al agregar producto:', error);
        alert('❌ Error al agregar producto: ' + error.message);
    }
}

// ========================================
// CARGAR PRODUCTOS DESDE SUPABASE
// ========================================
async function loadProducts() {
    try {
        console.log('🔄 Cargando productos desde Supabase...');
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*, estado_stock')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('productsTableBody');
        const countElement = document.getElementById('countNumber');
        
        if (countElement) countElement.textContent = data.length;
        console.log('✅', data.length, 'productos cargados');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">No hay productos registrados</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(product => {
            let categoryBadge = '';
            switch(product.categoria) {
                case 'streaming': categoryBadge = '<span class="badge badge-streaming">STREAMING</span>'; break;
                case 'software': categoryBadge = '<span class="badge badge-software">SOFTWARE</span>'; break;
                default: categoryBadge = `<span class="badge">${product.categoria}</span>`;
            }
            
            let stockStatus = product.estado_stock || 'disponible';
            
            let stockBadge = '';
            if (stockStatus === 'disponible') {
                stockBadge = '<span style="background: linear-gradient(135deg, #00e5cc, #00c4a8); color: #0a0e1a; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block">✅ DISPONIBLE</span>';
            } else if (stockStatus === 'agotado') {
                stockBadge = '<span style="background: linear-gradient(135deg, #ff4757, #c44569); color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block">❌ AGOTADO</span>';
            } else {
                stockBadge = '<span style="background: linear-gradient(135deg, #ffa502, #ff6348); color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block">📦 A PEDIDO</span>';
            }
            
            return `
                <tr>
                    <td><img src="${product.imagen_url || 'https://via.placeholder.com/50?text=?'} " alt="${product.nombre}" class="product-logo" onerror="this.src='https://via.placeholder.com/50?text=?'"></td>
                    <td style="font-weight: 600">${product.nombre}</td>
                    <td>${categoryBadge}</td>
                    <td style="font-weight: 700; color: var(--primary)">S/. ${parseFloat(product.precio).toFixed(2)}</td>
                    <td>${stockBadge}</td>
                    <td>
                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #ff4757">❌ Error al cargar productos</td></tr>';
    }
}

// ========================================
// EDITAR PRODUCTO
// ========================================
async function editProduct(id) {
    try {
        console.log(`✏️ Cargando producto ${id} para editar...`);

        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Mapear stock de número a texto
        let stockStatus = 'disponible';
        if (data.stock === 0) stockStatus = 'agotado';
        if (data.stock === 99) stockStatus = 'a-pedido';

        document.getElementById('editId').value = data.id;
        document.getElementById('editName').value = data.nombre;
        document.getElementById('editCategory').value = data.categoria;
        document.getElementById('editPrice').value = data.precio;
        document.getElementById('editOldPrice').value = parseFloat(data.precio) * 2;
        document.getElementById('editStock').value = stockStatus;
        document.getElementById('editDescription').value = data.descripcion;
        document.getElementById('editLogo').value = ''; // Vacío por defecto

        document.getElementById('editModal').classList.add('active');
        
        console.log(`✅ Producto cargado: ${data.nombre} (Stock: ${stockStatus})`);
    } catch (error) {
        console.error('❌ Error al cargar producto:', error);
        alert('❌ Error al cargar producto: ' + error.message);
    }
}

async function updateProduct() {
    const id = parseInt(document.getElementById('editId').value);
    const name = document.getElementById('editName').value.trim();
    const category = document.getElementById('editCategory').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const oldPrice = parseFloat(document.getElementById('editOldPrice').value);
    const stock = document.getElementById('editStock').value;
    const description = document.getElementById('editDescription').value.trim();
    const logo = document.getElementById('editLogo').value.trim();

    // Validación (logo es OPCIONAL)
    if (!name || !category || isNaN(price) || !stock || !description) {
        alert('⚠️ Por favor completa todos los campos obligatorios (excepto Logo)');
        return;
    }

    try {
        console.log(`💾 Actualizando producto ${id}...`);

        // Mapear stock a número para Supabase
        let stockNumber = 1;
        if (stock === 'agotado') stockNumber = 0;
        if (stock === 'a-pedido') stockNumber = 99;

        // Primero obtener el logo actual si no se proporciona uno nuevo
        let finalLogo = logo;
        if (!logo) {
            const { data: currentProduct } = await supabaseClient
                .from('productos')
                .select('imagen_url')
                .eq('id', id)
                .single();
            
            finalLogo = currentProduct?.imagen_url || 'https://via.placeholder.com/150?text=Sin+Logo';
        }

        const { error } = await supabaseClient
            .from('productos')
            .update({
                nombre: name,
                categoria: category,
                precio: price,
                descripcion: description,
                stock: stockNumber,
                estado_stock: stock,
                imagen_url: finalLogo
            })
            .eq('id', id);

        if (error) throw error;

        closeEditModal();
        await loadProducts();
        showNotification('✅ Producto actualizado correctamente');
        
        console.log(`✅ Producto actualizado: ${name} (Stock: ${stock})`);
    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        alert('❌ Error al actualizar producto: ' + error.message);
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// ========================================
// ELIMINAR PRODUCTO
// ========================================
async function deleteProduct(id) {
    try {
        // Obtener el nombre del producto antes de eliminar
        const { data: product } = await supabaseClient
            .from('productos')
            .select('nombre')
            .eq('id', id)
            .single();
        
        if (!product) {
            alert('❌ Producto no encontrado');
            return;
        }

        if (confirm(`⚠️ ¿Estás seguro de eliminar "${product.nombre}"?`)) {
            console.log(`🗑️ Eliminando producto ${id}...`);

            const { error } = await supabaseClient
                .from('productos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await loadProducts();
            showNotification('🗑️ Producto eliminado correctamente');
            
            console.log(`✅ Producto eliminado: ${product.nombre}`);
        }
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        alert('❌ Error al eliminar producto: ' + error.message);
    }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================
function clearForm() {
    document.getElementById('productForm').reset();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========================================
// INICIALIZAR
// ========================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🔐 Panel de Administración Cargado');
    
    const username = localStorage.getItem('adminUsername') || 'Administrador';
    console.log(`👤 Usuario: ${username}`);
    console.log(`🔌 Conectado a Supabase`);
    
    await loadProducts();

    // Cerrar modal al hacer clic fuera
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });
});
