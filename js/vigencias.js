$('.vigencias').on('click', '.excluir-btn', function () {
    $(this).closest('.vigencia').remove();
})

function verificarInputsVazios() {
    var inputs = document.querySelectorAll('input'); // Seleciona todos os inputs do formulário
  
    // Percorre os inputs e verifica se algum está vazio
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].value === '') {
        return false; // Retorna falso se algum input estiver vazio
      }
    }
  
    return true; // Retorna verdadeiro se todos os inputs estiverem preenchidos
  }

$('.salvar-btn').on('click', function () {
    let vigencias =[]
    $('.operadora').each(function () { 
        var linhaOperadora = $(this)
        var idOperadora = $(this).find('[name="idOperadora"]').val(); // Acessa diretamente o valor do campo oculto
        linhaOperadora.find('.vigencia').each(function () {
            const vigenciaData = {
                idOperadora: idOperadora,
                dataVigencia: $(this).find('[name="dataVigencia"]').val(),
                dataMovimentacao: $(this).find('[name="dataMovimentacao"]').val(),
                dataFechamento: $(this).find('[name="dataFechamento"]').val(),
            }
            vigencias.push(vigenciaData);
        });
    });
 /*    const dataAtualizacao = document.querySelector('.data-atualizacao-input').value;
    const dataProximaAtualizacao = document.querySelector('.data-proxima-atualizacao-input').value;
 */
    console.log(vigencias)

    fetch('/salvar-infos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vigencias })
    }).then((response) => {
            if (response.ok) {
                showMessage(response.message)
                //location.reload();
                //alert('Valores atualizados com sucesso!');
            } else {
                alert('Erro ao atualizar valores. Por favor, tente novamente.');
            }
        })
        .catch((error) => {
            console.error('Erro ao enviar os dados:', error);
            alert('Erro ao enviar os dados. Por favor, tente novamente.');
        });
    
})

// Função para obter os dados atualizados e enviar para o servidor
function atualizarValores() {
    if (verificarInputsVazios()) {
        const operadoras = [];

        // Percorre cada linha da tabela
        const rows = document.querySelectorAll('tbody > tr');
        rows.forEach((row) => {
            const operadora = {};
            const inputs = row.querySelectorAll('.vigencia-input, .fechamento-input');
            operadora.id = row.dataset.id; // Obtém o ID da operadora da linha
            operadora.vigencias = [];
            operadora.fechamentos = [];

            inputs.forEach((input) => {
                if (input.classList.contains('vigencia-input')) {
                    operadora.vigencias.push(input.value);
                } else if (input.classList.contains('fechamento-input')) {
                    operadora.fechamentos.push(input.value);
                }
            });

            operadoras.push(operadora);
        });

        // Obtém os valores dos campos de data
        const dataAtualizacao = document.querySelector('.data-atualizacao-input').value;
        const dataProximaAtualizacao = document.querySelector('.data-proxima-atualizacao-input').value;

        // Envia os dados para o servidor
        fetch('/salvar-infos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vigencias, dataAtualizacao, dataProximaAtualizacao })
        })
            .then((response) => {
                if (response.ok) {
                    showMessage(response.message)
                    location.reload();
                    //alert('Valores atualizados com sucesso!');
                } else {
                    alert('Erro ao atualizar valores. Por favor, tente novamente.');
                }
            })
            .catch((error) => {
                console.error('Erro ao enviar os dados:', error);
                alert('Erro ao enviar os dados. Por favor, tente novamente.');
            });
    } else {
        showMessageError('Existem campos vazios, preencha todos e tente novamente')
    }
}

$('.adicionarvigencia').click(function () {
    const $button = $(this)

    const novavigencia = `
    <div class="row vigencia">
        <div class="col-4">
            <input 
                type="date" 
                class="vigencia-input form-control" value="" 
                name="dataVigencia"
            />
        </div>
        <div class="col-4">
            <input 
                type="datetime-local" class="movimentacao-input form-control"
                value=""
                name="dataMovimentacao"
            />
        </div>
        <div class="col-4">
            <input 
                type="datetime-local" class="fechamento-input form-control"
                value=""
                name="dataFechamento"
            />
        </div>
        <button 
                class="excluir-btn btn btn-danger" title="Excluir vigência">
                <i
                    class="bi bi-x-circle">
                </i>
        </button>
    </div>
    `;

    $(novavigencia).insertBefore($button)
    //excluirCampoVigencia()
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