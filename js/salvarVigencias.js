$('.update-btn').on('click', function () {
    console.log('clicou em publicar')
    const dataAtualizacao = document.querySelector('.data-atualizacao-input').value;
    const dataProximaAtualizacao = document.querySelector('.data-proxima-atualizacao-input').value;

    // Verifique se os campos estão preenchidos antes de prosseguir
    if (!dataAtualizacao || !dataProximaAtualizacao) {
        showMessageError('Por favor, preencha o campo de próxima data de atualização antes de publicar.');
        return; // Impede o envio da solicitação se algum campo estiver vazio
    }

    console.log(dataAtualizacao, dataProximaAtualizacao)

    fetch('/copiar-dados', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dataAtualizacao, dataProximaAtualizacao })
    }).then((response) => {
        if (response.ok) {
            return response.json(); // Parse a resposta JSON
        } else {
            alert('Erro ao atualizar valores. Por favor, tente novamente.');
            throw new Error('Erro na requisição'); // Lança um erro para cair no bloco catch
        }
    }).then((data) => {
        console.log('Sucesso:', data.message); // Aqui você pode acessar a mensagem
        showMessage(data.message)// Exibe a mensagem para o usuário
    }).catch((error) => {
        console.log('Erro ao enviar os dados:', error);
        alert('Erro ao enviar os dados. Por favor, tente novamente.' + error);
    });
})



// Verifica se o cookie de deleteMessage existe
if (document.cookie.includes('alertSucess')) {
    // Obtém o valor do cookie
    const alertSucess = getCookieValue('alertSucess');

    // Renderiza a mensagem na tela
    showMessage(alertSucess);

    // Remove o cookie
    document.cookie = 'alertSucess=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

if (document.cookie.includes('alertError')) {
    // Obtém o valor do cookie
    const alertError = getCookieValue('alertError');

    // Renderiza a mensagem na tela
    showMessageError(alertError);

    // Remove o cookie
    document.cookie = 'alertError=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Função para obter o valor de um cookie pelo seu nome
function getCookieValue(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName)) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
}

function showMessage(message) {
    const Mensagem = document.getElementById('Message')
    Mensagem.innerHTML = `${decodeURIComponent(message)} 
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`
    Mensagem.style.display = 'block';
}

function showMessageError(message) {
    const Mensagem = document.getElementById('MessageError')
    Mensagem.innerHTML = `ALERTA: ${decodeURIComponent(message)} 
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`
    Mensagem.style.display = 'block';
}