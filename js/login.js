console.log('rodou script')

const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    console.log(username, password); // Verifique se os valores estão corretos

    const response = await fetch('/login-verifica', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    console.log(data); // Verifique a resposta do servidor

    if (response.status === 200) {
        // Autenticação bem-sucedida, redirecionar para a página de dashboard
        console.log('Usuário autenticado com sucesso');
        window.location.href = '/vigencias';
    } else {
        // Exibir mensagem de erro
        console.error(data.error);
    }
});