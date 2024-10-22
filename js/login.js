document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login-verifica', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        const errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.id = 'error-message';
            errorMessageDiv.className = 'alert alert-danger mt-3';
            document.getElementById('login-form').appendChild(errorMessageDiv);
        }
        
        if (response.ok) {
            window.location.href = '/vigencias';
        } else {
            document.getElementById('error-message').innerText = result.error;
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        document.getElementById('error-message').innerText = 'Erro ao processar a solicitação.';
    }
});