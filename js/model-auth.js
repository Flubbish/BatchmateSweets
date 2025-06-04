document.addEventListener('DOMContentLoaded', () => {
    const loginSignupModal = document.getElementById('loginSignupModal');
    const openModalButtons = document.querySelectorAll('#loginBtn, #loginSignupBtn');
    
    const closeModalButton = loginSignupModal ? loginSignupModal.querySelector('.close-btn') : null;
    const loginFormInModal = loginSignupModal ? document.getElementById('loginFormModal') : null;
    const modalLoginErrorMessage = loginSignupModal ? document.getElementById('modalLoginErrorMessage') : null;
    const signupFormInModal = loginSignupModal ? document.getElementById('signupFormModal') : null;
    const modalSignupErrorMessage = loginSignupModal ? document.getElementById('modalSignupErrorMessage') : null;

    function openModal() {
        if (loginSignupModal) {
            loginSignupModal.style.display = 'block';
        }
    }

    function closeModal() {
        if (loginSignupModal) {
            loginSignupModal.style.display = 'none';
            if (modalLoginErrorMessage) {
                modalLoginErrorMessage.style.display = 'none';
                modalLoginErrorMessage.textContent = '';
            }
            if (modalSignupErrorMessage) {
                modalSignupErrorMessage.style.display = 'none';
                modalSignupErrorMessage.textContent = '';
            }
        }
    }

    openModalButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                openModal();
            });
        }
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === loginSignupModal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && loginSignupModal && loginSignupModal.style.display === 'block') {
            closeModal();
        }
    });

    if (loginFormInModal) {
        loginFormInModal.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const usernameInput = document.getElementById('modalLoginUser');
            const passwordInput = document.getElementById('modalLoginPass');

            const username = usernameInput ? usernameInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            if (modalLoginErrorMessage) {
                modalLoginErrorMessage.style.display = 'none';
                modalLoginErrorMessage.textContent = '';
            }

            const ADMIN_USERNAME = 'admin';
            const ADMIN_PASSWORD = 'ThePassword';

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                alert('Login successful! Redirecting to admin panel...');
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'admin.html';
                closeModal();
            } else {
                if (modalLoginErrorMessage) {
                    modalLoginErrorMessage.textContent = 'Invalid username or password.';
                    modalLoginErrorMessage.style.display = 'block';
                }
            }
        });
    }

    if (signupFormInModal) {
        signupFormInModal.addEventListener('submit', function(event) {
            event.preventDefault();
            if (modalSignupErrorMessage) {
                modalSignupErrorMessage.style.display = 'none';
                modalSignupErrorMessage.textContent = '';
            }
            alert('Sign up form submitted (demo)! Feature not yet implemented.');
            // Example: closeModal(); 
        });
    }
});
