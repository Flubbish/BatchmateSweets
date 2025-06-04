document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const minQuantity = 20;

    
    function getCart() {
        return JSON.parse(localStorage.getItem('shoppingCart')) || [];
    }

   
    function saveCart(cart) {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }


    function addItemToCart(itemData) { 
        let cart = getCart();
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === itemData.id);


        const isDrinkItem = itemData.name.toLowerCase().includes('milktea') ||
                            itemData.name.toLowerCase().includes('soda') ||
                            itemData.name.toLowerCase().includes('frappe') ||
                            itemData.name.toLowerCase().includes('latte') ||
                            itemData.name.toLowerCase().includes('coffee'); 

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 0) + minQuantity; 
            alert(`${itemData.name} quantity updated in cart. Total: ${cart[existingItemIndex].quantity}`);
        } else {
            
            const newItem = {
                id: itemData.id,
                name: itemData.name,
                price: itemData.price, 
                originalPrice: itemData.price, 
                currentPrice: itemData.price,  
                quantity: minQuantity,
                isDrink: isDrinkItem,
                size: isDrinkItem ? '16oz' : null 
            };
            cart.push(newItem);
            alert(`${minQuantity} of ${itemData.name} added to cart.`);
        }
        saveCart(cart);
        updateCartDisplayCount(); 
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemElement = event.target.closest('.image'); 
            if (!itemElement) {
                console.error('Could not find parent .image element for item data.');
                alert('Error: Could not retrieve product information.');
                return;
            }
            const itemId = itemElement.dataset.id;
            const itemName = itemElement.dataset.name;
            const itemPrice = parseFloat(itemElement.dataset.price);

            if (!itemId || !itemName || isNaN(itemPrice)) {
                alert('Error: Product data is missing or invalid.');
                return;
            }

            const item = { 
                id: itemId,
                name: itemName,
                price: itemPrice
            };

            addItemToCart(item);
        });
    });

    function updateCartDisplayCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
        console.log('Cart updated:', cart); 
    }

   
    updateCartDisplayCount();
});