// ========================================
// 🔌 CONFIGURACIÓN SUPABASE
// ========================================
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_KEY = CONFIG.SUPABASE_KEY;


const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const WHATSAPP = '51925477024';

// ========================================
// 🎬 PRODUCTOS PREDETERMINADOS (FALLBACK)
// ========================================
const defaultProducts = [
    {
        id: 1,
        name: "Netflix 1 Mes",
        category: "streaming",
        price: 12.50,
        oldPrice: 25,
        stock: "disponible",
        description: "Cuenta Premium completa 1 mes, 5 perfiles HD/4K",
        logo: "logos/NETFLIX.png"
    },
    {
        id: 2,
        name: "Disney+ 1 Mes",
        category: "streaming",
        price: 8.00,
        oldPrice: 16,
        stock: "disponible",
        description: "Disney+, Pixar, Marvel, Star Wars 1 mes completo",
        logo: "logos/DISNEY.png"
    },
    {
        id: 3,
        name: "Prime Video 1 Mes",
        category: "streaming",
        price: 7.00,
        oldPrice: 14,
        stock: "disponible",
        description: "Amazon Prime Video + envíos gratis 1 mes",
        logo: "logos/PRIMEVIDEO.png"
    },
    {
        id: 4,
        name: "Crunchyroll 1 Mes",
        category: "streaming",
        price: 5.00,
        oldPrice: 10,
        stock: "disponible",
        description: "Anime sin anuncios, simulcasts nuevos 1 mes",
        logo: "logos/Crunchyroll.png"
    },
    {
        id: 5,
        name: "Canva 1 Año",
        category: "software",
        price: 11.00,
        oldPrice: 22,
        stock: "disponible",
        description: "Canva Pro completo 1 año, plantillas premium",
        logo: "logos/CANVA.png"
    },
    {
        id: 6,
        name: "Perplexity 1 Mes",
        category: "software",
        price: 8.00,
        oldPrice: 16,
        stock: "disponible",
        description: "IA avanzada Perplexity Pro 1 mes completo",
        logo: "logos/Perplexity.png"
    },
    {
        id: 7,
        name: "Apple TV+ 1 Mes",
        category: "streaming",
        price: 5.00,
        oldPrice: 10,
        stock: "disponible",
        description: "Apple TV+ Premium 1 mes, series exclusivas",
        logo: "logos/Apple TV.png"
    },
    {
        id: 8,
        name: "Paramount+ 1 Mes",
        category: "streaming",
        price: 5.00,
        oldPrice: 10,
        stock: "disponible",
        description: "Paramount+ Premium 1 mes, películas Hollywood",
        logo: "logos/Paramount.png"
    },
    {
        id: 9,
        name: "Canva Pro 3 Meses",
        category: "software",
        price: 7.50,
        oldPrice: 15,
        stock: "disponible",
        description: "Canva Pro económico 3 meses completos",
        logo: "logos/CANVA.png"
    },
    {
        id: 10,
        name: "ChatGPT Plus 1 Mes",
        category: "software",
        price: 12.00,
        oldPrice: 24,
        stock: "a-pedido",
        description: "GPT-4o, acceso prioritario, sin límites 1 mes",
        logo: "logos/ChatGPT.png"
    },
    {
        id: 11,
        name: "CapCut Pro 1 Mes",
        category: "software",
        price: 15.00,
        oldPrice: 30,
        stock: "disponible",
        description: "Editor video profesional sin marca de agua 1 mes",
        logo: "logos/CAPCUT.png"
    },
    {
        id: 12,
        name: "VIX Premium 1 Mes",
        category: "streaming",
        price: 4.00,
        oldPrice: 8,
        stock: "disponible",
        description: "Cine latino, series novelas 1 mes completo",
        logo: "logos/VIX.png"
    }
];

// Variables globales
let products = [];
let currentFilter = 'todos';
let currentSearch = '';
let loadingFromSupabase = false;

// ========================================
// 🔄 CARGAR PRODUCTOS DESDE SUPABASE
// ========================================
async function loadProductsFromSupabase() {
    if (loadingFromSupabase) return;
    loadingFromSupabase = true;

    try {
        console.log('🔄 Cargando productos desde Supabase...');
        
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Si hay productos en Supabase, mapearlos
        if (data && data.length > 0) {
            products = data.map(p => ({
                id: p.id,
                name: p.nombre,
                category: p.categoria || 'otros',
                price: parseFloat(p.precio),
                oldPrice: parseFloat(p.precio) * 2,
                // ✅ CORRECTO:
                stock: p.estado_stock, 

                description: p.descripcion || '',
                logo: p.imagen_url || 'https://via.placeholder.com/150?text=Sin+Logo'
            }));

            console.log(`✅ ${products.length} productos cargados desde Supabase`);
        } else {
            // Si no hay productos en Supabase, usar los predeterminados
            products = defaultProducts;
            console.log('📦 Usando productos predeterminados');
        }

        displayProducts(products);
        
    } catch (error) {
        console.error('❌ Error al cargar desde Supabase:', error);
        // En caso de error, usar productos predeterminados
        products = defaultProducts;
        displayProducts(products);
        console.log('📦 Usando productos predeterminados por error');
    } finally {
        loadingFromSupabase = false;
    }
}

// ========================================
// 🎨 MOSTRAR PRODUCTOS EN LA PÁGINA
// ========================================
function displayProducts(productList) {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (!grid) {
        console.error('❌ No se encontró #productsGrid en el HTML');
        return;
    }
    
    grid.innerHTML = '';
    
    if (productList.length === 0) {
        if (noResults) noResults.style.display = 'block';
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #a0aec0;">
                <i class="fas fa-inbox" style="font-size: 60px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3 style="color: #fff; margin-bottom: 10px;">No se encontraron productos</h3>
                <p>Intenta con otro filtro o búsqueda</p>
            </div>
        `;
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    console.log(`📦 Mostrando ${productList.length} productos`);
    
    productList.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.setProperty('--index', index);
        card.setAttribute('data-category', product.category);
        
        // 🔥 DETERMINAR ESTADO DE STOCK (prioridad: estado_stock > stock numérico)
let stockStatus;
if (product.estado_stock) {
    stockStatus = product.estado_stock; // Desde base de datos
} else if (product.stock === 'disponible' || product.stock === 'agotado' || product.stock === 'a-pedido') {
    stockStatus = product.stock; // Desde defaultProducts
} else if (typeof product.stock === 'number') {
    stockStatus = product.stock > 0 ? 'disponible' : 'agotado';
} else {
    stockStatus = 'disponible'; // Por defecto
}

        // Determinar clase y texto del badge
        let stockClass, stockText;
        switch(stockStatus) {
            case 'disponible':
                stockClass = 'disponible';
                stockText = 'EN STOCK';
                break;
            case 'agotado':
                stockClass = 'agotado';
                stockText = 'AGOTADO';
                break;
            case 'a-pedido':
                stockClass = 'a-pedido'; // ✅ CORREGIDO
                stockText = 'A PEDIDO';
                break;
            default:
                stockClass = 'disponible';
                stockText = 'EN STOCK';
        }

        
        card.innerHTML = `
            <div class="stock-badge ${stockClass}">${stockText}</div>
            <div class="product-logo">
                <img src="${product.logo || product.imagen_url}" 
                     alt="${product.name || product.nombre}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/150?text=Sin+Logo'">
            </div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">
                <span class="price-current">S/${product.price.toFixed(2)}</span>
                ${product.oldPrice && product.oldPrice > product.price ? 
                    `<span class="price-old">S/${product.oldPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="product-btn" ${stockStatus === 'agotado' ? 'disabled' : ''} 
            onclick="contactWhatsApp('${(product.name || product.nombre).replace(/'/g, '')}', ${product.price || product.precio})">
            <i class="fas fa-${stockStatus === 'agotado' ? 'times' : 'shopping-cart'}"></i>
            ${stockStatus === 'agotado' ? 'Agotado' : 'Comprar Ahora'}
            </button>

        `;
        
        grid.appendChild(card);
    });
}

// ========================================
// 🔍 FILTRAR POR CATEGORÍA
// ========================================
function filterCategory(category) {
    currentFilter = category;
    
    // Actualizar botones activos
    const buttons = document.querySelectorAll('.category-btn, .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Marcar botón activo por data-filter
    const activeBtn = document.querySelector(`[data-filter="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    console.log(`🔍 Filtro aplicado: ${category}`);
    applyFilters();
}

// ========================================
// 🔎 BUSCAR PRODUCTOS
// ========================================
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    currentSearch = searchInput.value.toLowerCase().trim();
    console.log(`🔎 Búsqueda: "${currentSearch}"`);
    
    // Mostrar/ocultar botón de limpiar
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        clearBtn.style.display = currentSearch ? 'block' : 'none';
    }
    
    applyFilters();
}

// ========================================
// 🧹 LIMPIAR BÚSQUEDA
// ========================================
function clearSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (input) {
        input.value = '';
        currentSearch = '';
        applyFilters();
        input.focus();
    }
    
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    
    console.log('🧹 Búsqueda limpiada');
}

// ========================================
// 🔄 RESETEAR FILTROS
// ========================================
function resetFilters() {
    currentFilter = 'todos';
    currentSearch = '';
    
    // Limpiar input de búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Ocultar botón de limpiar
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    
    // Marcar "Todos" como activo
    const buttons = document.querySelectorAll('.category-btn, .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const todosBtn = document.querySelector('[data-filter="todos"]');
    if (todosBtn) todosBtn.classList.add('active');
    
    // Mostrar todos los productos
    displayProducts(products);
    
    console.log('🔄 Filtros reseteados');
}

// ========================================
// ⚙️ APLICAR FILTROS COMBINADOS
// ========================================
function applyFilters() {
    let filtered = products;
    
    // Filtrar por categoría
    if (currentFilter !== 'todos') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    
    // Filtrar por búsqueda
    if (currentSearch) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(currentSearch) ||
            p.description.toLowerCase().includes(currentSearch) ||
            p.category.toLowerCase().includes(currentSearch)
        );
    }
    
    displayProducts(filtered);
}

// ========================================
// 💬 CONTACTAR POR WHATSAPP
// ========================================
function contactWhatsApp(productName, price) {
    const message = `🎬 ¡Hola! Quiero comprar:\n\n📦 *${productName}*\n💰 Precio: *S/${price.toFixed(2)}*\n\n✅ Listo para realizar el pago`;
    const whatsappURL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    
    console.log(`📱 Abriendo WhatsApp para: ${productName}`);
    window.open(whatsappURL, '_blank');
}

// ========================================
// ⬆️ SCROLL TO TOP
// ========================================
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========================================
// 🚀 INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 Tienda de Cuentas Streaming cargada');
    
    // CARGAR PRODUCTOS DESDE SUPABASE
    await loadProductsFromSupabase();
    
    console.log(`📦 Total de productos: ${products.length}`);
    
    // ==========================================
    // CONFIGURAR BUSCADOR
    // ==========================================
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        
        // Limpiar búsqueda con ESC
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }
    
    // ==========================================
    // BOTÓN LIMPIAR BÚSQUEDA
    // ==========================================
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
    
    // ==========================================
    // CONFIGURAR BOTONES DE FILTRO
    // ==========================================
    const filterButtons = document.querySelectorAll('.category-btn, .filter-btn');
    filterButtons.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                filterCategory(filter);
            });
        }
    });
    
    // ==========================================
    // BOTÓN RESET FILTROS
    // ==========================================
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // ==========================================
    // SCROLL TO TOP
    // ==========================================
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
        
        // Mostrar/ocultar según scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
    }
    
    // ==========================================
    // MARCAR "TODOS" COMO ACTIVO POR DEFECTO
    // ==========================================
    const todosBtn = document.querySelector('[data-filter="todos"]');
    if (todosBtn) {
        todosBtn.classList.add('active');
    }
    
    console.log('✅ Tienda inicializada correctamente');
});

// ========================================
// 👁️ ACTUALIZAR AL VOLVER AL TAB
// ========================================
window.addEventListener('focus', async function() {
    console.log('🔄 Tab enfocado - recargando productos...');
    await loadProductsFromSupabase();
    applyFilters();
});

// ========================================
// 🎯 SMOOTH SCROLL PARA ANCLAS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// 🔄 RECARGAR CADA 30 SEGUNDOS (OPCIONAL)
// ========================================
setInterval(async function() {
    console.log('🔄 Recarga automática de productos');
    await loadProductsFromSupabase();
    applyFilters();
}, 30000); // 30 segundos
