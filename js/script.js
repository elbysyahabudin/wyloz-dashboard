document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const burgerMenu = document.getElementById('burgerMenu');
    const notificationIcon = document.getElementById("notificationIcon");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const modal = document.getElementById("notificationModal");
    const closeModal = document.querySelector(".close-modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const notificationBadge = document.getElementById("notificationBadge");
    
    // Initialize sidebar toggle
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Initialize notification dropdown
    notificationIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        notificationDropdown.style.display = 
            notificationDropdown.style.display === "block" ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!notificationIcon.contains(event.target)) {
            notificationDropdown.style.display = "none";
        }
    });

    // Modal controls
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initialize notifications with top products
    initializeNotifications();
});

// Notification functions
async function initializeNotifications() {
    await updateNotifications();
    setInterval(updateNotifications, 30 * 60 * 1000); // Refresh every 30 minutes
}

// async function fetchTopSellingProducts() {
//     try {
//         const response = await fetch('http://localhost:5000/top-products');
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching top products:', error);
//         // Return mock data if there's an error
//         return [
//             {
//                 nama_produk: "Smartphone X",
//                 total_sold: 150,
//                 total_revenue: 75000000,
//                 kategori: "Electronics"
//             },
//             {
//                 nama_produk: "Designer T-Shirt",
//                 total_sold: 120,
//                 total_revenue: 3600000,
//                 kategori: "Fashion"
//             },
//             {
//                 nama_produk: "Organic Coffee",
//                 total_sold: 95,
//                 total_revenue: 2850000,
//                 kategori: "Food & Beverage"
//             }
//         ];
//     }
// }

async function fetchTopSellingProducts() {
    try {
        // Replace with your Supabase client initialization
        const supabaseUrl = 'https://trqvushwhkvchkgqhmge.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycXZ1c2h3aGt2Y2hrZ3FobWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDU1MjUsImV4cCI6MjA1MzQ4MTUyNX0.J-yggfqvHPQtP-Zk-bwOxTRqD64J6jgQ_DOLCCp-JxY';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
        // Query top selling products directly from Supabase
        const { data, error } = await supabaseClient
            .from('tabel_produk')
            .select(`
                nama_produk,
                kategori,
                kuantitas,
                harga
            `);
        
        if (error) throw error;
        
        // if (!data || data.length === 0) {
        //     // Return mock data if no products exist
        //     return [
        //         {
        //             nama_produk: "Smartphone X",
        //             total_sold: 150,
        //             total_revenue: 75000000,
        //             kategori: "Electronics"
        //         },
        //         {
        //             nama_produk: "Designer T-Shirt",
        //             total_sold: 120,
        //             total_revenue: 3600000,
        //             kategori: "Fashion"
        //         },
        //         {
        //             nama_produk: "Organic Coffee",
        //             total_sold: 95,
        //             total_revenue: 2850000,
        //             kategori: "Food & Beverage"
        //         }
        //     ];
        // }
        
        // Process the data to calculate totals
        const productMap = {};
        
        data.forEach(item => {
            if (!productMap[item.nama_produk]) {
                productMap[item.nama_produk] = {
                    nama_produk: item.nama_produk,
                    kategori: item.kategori,
                    total_sold: 0,
                    total_revenue: 0
                };
            }
            
            productMap[item.nama_produk].total_sold += item.kuantitas;
            productMap[item.nama_produk].total_revenue += (item.harga * item.kuantitas);
        });
        
        // Convert to array and sort
        const products = Object.values(productMap);
        products.sort((a, b) => {
            if (b.total_sold !== a.total_sold) {
                return b.total_sold - a.total_sold;
            }
            return b.total_revenue - a.total_revenue;
        });
        
        return products.slice(0, 3); // Return top 3 products
        
    } catch (error) {
        console.error('Error fetching top products:', error);
        // Return mock data if there's an error
        // return [
        //     {
        //         nama_produk: "Smartphone X",
        //         total_sold: 150,
        //         total_revenue: 75000000,
        //         kategori: "Electronics"
        //     },
        //     {
        //         nama_produk: "Designer T-Shirt",
        //         total_sold: 120,
        //         total_revenue: 3600000,
        //         kategori: "Fashion"
        //     },
        //     {
        //         nama_produk: "Organic Coffee",
        //         total_sold: 95,
        //         total_revenue: 2850000,
        //         kategori: "Food & Beverage"
        //     }
        // ];
    }
}

async function updateNotifications() {
    try {
        const topProducts = await fetchTopSellingProducts();
        const notificationDropdown = document.getElementById('notificationDropdown');
        const notificationBadge = document.getElementById('notificationBadge');
        
        // Clear existing notifications
        notificationDropdown.innerHTML = '';
        
        // Add top products to notifications (max 3)
        topProducts.slice(0, 3).forEach(product => {
            const notifItem = document.createElement('p');
            notifItem.className = 'notif-item';
            notifItem.innerHTML = `
                <strong>${product.nama_produk}</strong><br>
                Sold: ${product.total_sold} | Revenue: Rp${product.total_revenue.toLocaleString('id-ID')}
            `;
            notifItem.dataset.details = `
                Product: ${product.nama_produk}<br>
                Category: ${product.kategori}<br>
                Total Sold: ${product.total_sold} units<br>
                Total Revenue: Rp${product.total_revenue.toLocaleString('id-ID')}
            `;
            notificationDropdown.appendChild(notifItem);
        });
        
        // Update badge count and make sure it's visible
        if (notificationBadge) {
            const newCount = Math.min(topProducts.length, 3);
            notificationBadge.textContent = newCount.toString();
            notificationBadge.style.display = newCount > 0 ? 'flex' : 'none';
        }
        
        // Reattach click handlers
        attachNotificationClickHandlers();
    } catch (error) {
        console.error('Error updating notifications:', error);
    }
}

function attachNotificationClickHandlers() {
    document.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', function() {
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            const modal = document.getElementById('notificationModal');
            const notificationBadge = document.getElementById('notificationBadge');
            
            if (modalTitle && modalContent && modal) {
                modalTitle.textContent = 'Product Sales Details';
                modalContent.innerHTML = this.dataset.details;
                modal.style.display = 'flex';
            }
            
            // Decrement the notification badge count if it's greater than 0
            if (notificationBadge) {
                const currentCount = parseInt(notificationBadge.textContent);
                if (currentCount > 0) {
                    const newCount = currentCount - 1;
                    notificationBadge.textContent = newCount.toString();
                    
                    // Hide badge if count reaches 0
                    if (newCount === 0) {
                        notificationBadge.style.display = 'none';
                    }
                }
            }
            
            // Remove the clicked notification item
            this.remove();
            
            // Hide dropdown
            const notificationDropdown = document.getElementById('notificationDropdown');
            if (notificationDropdown) {
                notificationDropdown.style.display = 'none';
            }
        });
    });
}

// Profile dropdown functionality
const profileIcon = document.querySelector('.profile-icon');
const profileDropdown = document.getElementById('profileDropdown');

profileIcon.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from bubbling up
    profileDropdown.classList.toggle('show');
    
    // Close notification dropdown if open
    notificationDropdown.classList.remove('show');
});

// Close dropdowns when clicking outside
document.addEventListener('click', function() {
    profileDropdown.classList.remove('show');
    notificationDropdown.classList.remove('show');
});

// Prevent dropdown from closing when clicking inside it
profileDropdown.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    // Implement your logout logic here
    // For example, using your simple-auth.js:
    logout(); // Assuming you have a logout function in simple-auth.js
});