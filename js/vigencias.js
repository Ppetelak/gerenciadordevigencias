function adicionarCampoVigencia(event) {
    const tr = event.target.closest('.Linhaoperadora');
    const td = tr.querySelector('td:last-child');
    const table = document.createElement('table');
    table.innerHTML = `
    <tr>
        <td>
            <input type="text" class="vigencia-input form-control"
                value="">
        </td>
        <td>
            <input type="text" class="fechamento-input form-control"
                value="">
        </td>
        <td>
            <button class="excluir-btn btn btn-danger">Excluir</button>
        </td>
    </tr>
`;
    table.classList.add('table');
    td.insertBefore(table, event.target);

    excluirCampoVigencia()
}

// Função para excluir um campo de vigência e fechamento
function excluirCampoVigencia() {
    var buttons = document.querySelectorAll(".excluir-btn");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function (event) {
            var tabela = event.target.closest('table')
            tabela.remove()
        });
    };
}

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
        fetch('/update-vigencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operadoras, dataAtualizacao, dataProximaAtualizacao })
        })
            .then((response) => {
                if (response.ok) {
                    alert('Valores atualizados com sucesso!');
                } else {
                    alert('Erro ao atualizar valores. Por favor, tente novamente.');
                }
            })
            .catch((error) => {
                console.error('Erro ao enviar os dados:', error);
                alert('Erro ao enviar os dados. Por favor, tente novamente.');
            });
    } else {
        alert("Preencha todos os campos antes de prosseguir.");
    }
}


// Adiciona os event listeners aos botões
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('tbody');
    const updateBtn = document.querySelector('.update-btn');

    tableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-btn')) {
            adicionarCampoVigencia(event);
        }
    });

    updateBtn.addEventListener('click', atualizarValores);
    excluirCampoVigencia();
});
