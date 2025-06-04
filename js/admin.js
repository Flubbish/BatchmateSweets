const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
if (isAdminLoggedIn !== 'true') {
    alert('You are not authorized to view this page. Redirecting to login.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const orderListContainer = document.querySelector('.order-list');
    const statusFilter = document.getElementById('statusFilter');
    const loadOrdersBtn = document.getElementById('loadOrdersBtn');
    const noOrdersMessage = document.querySelector('.no-orders-message');
    const CURRENCY_SYMBOL = '₱';

    function getSubmittedOrders() {
        return JSON.parse(localStorage.getItem('submittedOrders')) || [];
    }

    function saveSubmittedOrders(orders) {
        localStorage.setItem('submittedOrders', JSON.stringify(orders));
    }

    function renderOrderItem(order) {
        const orderItemDiv = document.createElement('div');
        orderItemDiv.classList.add('order-item');
        orderItemDiv.setAttribute('data-order-id', order.orderId);

        let statusClass = 'status-unknown';
        if (order.status) {
            statusClass = `status-${order.status.toLowerCase().replace(/\s+/g, '-')}`;
        }

        let itemsHTML = '<ul>';
        if (order.cartItems && Array.isArray(order.cartItems)) {
            order.cartItems.forEach(item => {
                const price = parseFloat(item.currentPrice || item.price || 0).toFixed(2);
                itemsHTML += `<li>${item.name} (Qty: ${item.quantity}, Size: ${item.size || 'N/A'}) - ${CURRENCY_SYMBOL}${price} each</li>`;
            });
        } else {
            itemsHTML += '<li>No item details available.</li>';
        }
        itemsHTML += '</ul>';

        let commentsHTML = '<p>No comments yet.</p>';
        if (order.adminComments && Array.isArray(order.adminComments) && order.adminComments.length > 0) {
            commentsHTML = order.adminComments.map(comment =>
                `<div class="comment">${comment.text} <small>(${new Date(comment.timestamp).toLocaleString()})</small></div>`
            ).join('');
        }

        let customerDetailsHTML = '<p><em>Customer details not provided.</em></p>';
        if (order.customerDetails) {
            customerDetailsHTML = `
                <p><strong>Name:</strong> ${order.customerDetails.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customerDetails.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.customerDetails.phone || 'N/A'}</p>
                <p><strong>Address (Place):</strong> ${order.customerDetails.address || 'N/A'}</p>
            `;
        }

        let removeButtonHTML = '';
        if (order.status === 'Denied') {
            removeButtonHTML = `<button class="remove-order-btn" data-order-id="${order.orderId}">Remove Denied Order</button>`;
        }

        orderItemDiv.innerHTML = `
            <h3>Order ID: ${order.orderId} (Status: <span class="${statusClass}">${order.status || 'N/A'}</span>)</h3>
            <div class="order-summary">
                <p><strong>Date Submitted:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                <p><strong>Preferred Delivery Date:</strong> ${order.deliveryDate || 'Not specified'}</p>
                <p><strong>Total Amount:</strong> ${order.totalAmount || 'N/A'}</p>
                <h4>Customer Delivery Details:</h4>
                ${customerDetailsHTML}
            </div>
            <div class="order-details">
                <h4>Items:</h4>
                ${itemsHTML}
            </div>
            <div class="order-actions">
                <button class="approve-btn" data-order-id="${order.orderId}" ${order.status === 'Approved' ? 'disabled' : ''}>Approve</button>
                <button class="deny-btn" data-order-id="${order.orderId}" ${order.status === 'Denied' ? 'disabled' : ''}>Deny</button>
                ${removeButtonHTML}
            </div>
            <div class="order-comments">
                <h4>Admin Comments:</h4>
                <div class="existing-comments">${commentsHTML}</div>
                <textarea class="admin-comment-text" placeholder="Add a comment for this order..."></textarea>
                <button class="comment-btn" data-order-id="${order.orderId}">Add Comment</button>
            </div>
        `;

        orderItemDiv.querySelector('.approve-btn').addEventListener('click', () => updateOrderStatus(order.orderId, 'Approved'));
        orderItemDiv.querySelector('.deny-btn').addEventListener('click', () => updateOrderStatus(order.orderId, 'Denied'));
        orderItemDiv.querySelector('.comment-btn').addEventListener('click', () => {
            const commentTextarea = orderItemDiv.querySelector('.admin-comment-text');
            const commentText = commentTextarea.value.trim();
            if (commentText) {
                addOrderComment(order.orderId, commentText);
                commentTextarea.value = '';
            } else {
                alert('Please enter a comment.');
            }
        });

        const removeBtn = orderItemDiv.querySelector('.remove-order-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to permanently remove denied order #${order.orderId}? This action cannot be undone.`)) {
                    removeOrder(order.orderId);
                }
            });
        }

        return orderItemDiv;
    }

    function displayOrders() {
        if (!orderListContainer || !statusFilter || !noOrdersMessage) {
            console.error('Admin page critical elements are missing from the DOM.');
            return;
        }
        const allOrders = getSubmittedOrders();
        const filterValue = statusFilter.value;

        orderListContainer.innerHTML = '';

        const filteredOrders = allOrders.filter(order => {
            if (filterValue === 'all') return true;
            return order.status && order.status.toLowerCase() === filterValue.toLowerCase();
        });

        if (filteredOrders.length === 0) {
            noOrdersMessage.style.display = 'block';
        } else {
            noOrdersMessage.style.display = 'none';
            filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            filteredOrders.forEach(order => {
                orderListContainer.appendChild(renderOrderItem(order));
            });
        }
    }

    function updateOrderStatus(orderId, newStatus) {
        let allOrders = getSubmittedOrders();
        const orderIndex = allOrders.findIndex(order => order.orderId === orderId);
        if (orderIndex > -1) {
            allOrders[orderIndex].status = newStatus;
            saveSubmittedOrders(allOrders);
            displayOrders();
        }
    }

    function addOrderComment(orderId, commentText) {
        let allOrders = getSubmittedOrders();
        const orderIndex = allOrders.findIndex(order => order.orderId === orderId);
        if (orderIndex > -1) {
            if (!allOrders[orderIndex].adminComments) {
                allOrders[orderIndex].adminComments = [];
            }
            allOrders[orderIndex].adminComments.push({
                text: commentText,
                timestamp: new Date().toISOString()
            });
            saveSubmittedOrders(allOrders);
            displayOrders();
        }
    }

    function removeOrder(orderId) {
        let allOrders = getSubmittedOrders();
        allOrders = allOrders.filter(order => order.orderId !== orderId);
        saveSubmittedOrders(allOrders);
        displayOrders();
        alert(`Order #${orderId} has been removed.`);
    }

    if (loadOrdersBtn) {
        loadOrdersBtn.addEventListener('click', displayOrders);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', displayOrders);
    }

    const adminLogoutLink = document.querySelector('.admin-header-nav a[href="index.html"]');
    if (adminLogoutLink && adminLogoutLink.textContent.toLowerCase().includes('logout')) {
        adminLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            alert('You have been logged out.');
            window.location.href = 'index.html';
        });
    }

    displayOrders();
});
