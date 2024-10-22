var operadoraId = 1;

/* function enableEdit(row, AdmDefault) {
    row.find('.edit-btn').hide();
    row.find('.cancel-btn').show();
    row.find('.save-btn').show();
    row.find('.edit-image-btn').show();
    console.log(AdmDefault);

    var linhaNome = row.find('.td-2');
    var spanNome = linhaNome.find('.nome-operadora');
    var valorNome = spanNome.text();

    var inputNome = $('<input>', {
        'type': 'text',
        'class': 'nome-operadora input form-control',
        'data-field': 'nome',
        'value': valorNome.trim()
    });

    linhaNome.empty().append(inputNome);

    var linhaAdm = row.find('.td-3');
    var spanAdm = linhaAdm.find('.nome-adm');
    var valorAdm = spanAdm.text();

    var selectAdm = $('<select>', {
        'class': 'nome-adm select form-control',
        'data-field': 'administradora',
    }).append(
        $('<option>', { value: 'Mount Hermon', text: 'Mount Hermon' }),
        $('<option>', { value: 'Classe Administradora', text: 'Classe Administradora' }),
        $('<option>', { value: 'Compar', text: 'Compar' })
    );

    linhaAdm.empty().append(selectAdm.val(AdmDefault));

    // Selecionar a opção correta no elemento select
    selectAdm.find('option').each(function () {
        if ($(this).text() === valorAdm) {
            $(this).prop('selected', true);
            return false; // Parar a iteração após encontrar a opção correta
        }
    });

    var linhaAbrangencia = row.find('.td-4');
    var spanAbrangencia = linhaAbrangencia.find('.abrangencia');
    var valorAbrangencia = spanAbrangencia.text();

    var inputAbrangencia = $('<textarea>', {
        'class': 'abrangencia textarea form-control',
        'data-field': 'abrangencia'
    }).text(valorAbrangencia.trim());

    linhaAbrangencia.empty().append(inputAbrangencia);

    var linhaAreaAtuacao = row.find('.td-5');
    var spanAreaAtuacao = linhaAreaAtuacao.find('.areadeatuacao');
    var valorAreaAtuacao = spanAreaAtuacao.text();

    var textareaAreaAtuacao = $('<textarea>', {
        'class': 'areadeatuacao textarea form-control',
        'data-field': 'areaAtuacao'
    }).text(valorAreaAtuacao.trim());

    linhaAreaAtuacao.empty().append(textareaAreaAtuacao);
}


// Função para desabilitar a edição dos campos
function disableEdit(row) {
    row.find('.save-btn').hide();
    row.find('.edit-btn').show();
    row.find('.cancel-btn').hide();
    row.find('.edit-image-btn').hide();

    var linhaNome = row.find('.td-2');
    var inputNome = linhaNome.find('.nome-operadora.input');
    var valorNome = inputNome.val();

    var spanNome = $('<span>', {
        'class': 'nome-operadora',
        'data-field': 'nome',
        'text': valorNome
    });

    linhaNome.empty().append(spanNome);

    var linhaAdm = row.find('.td-3');
    var selectAdm = linhaAdm.find('.nome-adm.select');
    var valorAdm = selectAdm.val();

    var spanAdm = $('<span>', {
        'class': 'nome-adm select',
        'data-field': 'administradora',
        'text': valorAdm
    });

    linhaAdm.empty().append(spanAdm);

    var linhaAbrangencia = row.find('.td-4');
    var inputAbrangencia = linhaAbrangencia.find('.abrangencia.textarea');
    var valorAbrangencia = inputAbrangencia.val();

    var spanAbrangencia = $('<span>', {
        'class': 'abrangencia textarea',
        'data-field': 'abrangencia',
        'text': valorAbrangencia
    });

    linhaAbrangencia.empty().append(spanAbrangencia);

    var linhaAreaAtuacao = row.find('.td-5');
    var textareaAreaAtuacao = linhaAreaAtuacao.find('.areadeatuacao.textarea');
    var valorAreaAtuacao = textareaAreaAtuacao.val();

    var spanAreaAtuacao = $('<span>', {
        'class': 'areadeatuacao textarea',
        'data-field': 'areaAtuacao',
        'text': valorAreaAtuacao
    });

    linhaAreaAtuacao.empty().append(spanAreaAtuacao);
}

// Função para atualizar as informações da operadora no servidor
function updateOperadora(row) {
    const id = row.data('id');
    const logo = row.find('.editable-image').attr('src')
    const nome = row.find('[data-field="nome"]').val();
    const administradora = row.find('[data-field="administradora"] option:selected').val();
    const abrangencia = row.find('[data-field="abrangencia"]').val();
    const areaAtuacao = row.find('[data-field="areaAtuacao"]').val();

    const data = {
        id: id,
        logo: logo,
        nome: nome,
        administradora: administradora, // Corrigido para enviar o valor selecionado do select
        abrangencia: abrangencia,
        areaAtuacao: areaAtuacao
    };

    $.ajax({
        type: 'POST',
        url: '/operadoras-update',
        data: JSON.stringify(data), // Adicionado JSON.stringify para enviar o corpo da requisição como JSON
        contentType: 'application/json', // Adicionado contentType para especificar o tipo de conteúdo como JSON
        success: function (response) {
            console.log('Resposta BackEnd', response);
            var mensagem = response.message
            showMessage(mensagem)
            disableEdit(row);
            location.reload();
        },
        error: function (error) {
            showMessageError(error)
            console.error('Erro ao atualizar operadora:', error);
        }
    });
} */

function updateOperadora($row, operadoraId) {
    // Coleta os dados editados
    var nome = $row.find(".nome-operadora").text().trim().replace(/\s+/g, ' ');
    var administradora = $row.find(".admin-select").val().trim().replace(/\s+/g, ' ');
    var abrangencia = $row.find(".abrangencia").text().trim().replace(/\s+/g, ' ');
    var areaAtuacao = $row.find(".link-edit").val(); // Pega o valor editado do campo de link

    console.log({
        id: operadoraId,
        nome: nome,
        administradora: administradora,
        abrangencia: abrangencia,
        areaAtuacao: areaAtuacao
    })
    // Faz a requisição AJAX para atualizar os dados no servidor
    $.ajax({
        url: "/operadoras-update/",
        method: "POST",
        data: {
            id: operadoraId,
            nome: nome,
            administradora: administradora,
            abrangencia: abrangencia,
            areaAtuacao: areaAtuacao
        },
        success: function () {
            $("#Message").show().delay(3000).fadeOut();
            // Atualiza o link com o novo valor
            $row.find(".link-text").attr("href", areaAtuacao);
            $row.find(".link-text").text("Abrir Link");
        },
        error: function () {
            $("#MessageError").show().delay(3000).fadeOut();
        }
    });
}

function enableEdit($row) {
    // Tornar os campos editáveis
    $row.find(".input").attr("contenteditable", "true").addClass("editable");
    $row.find(".textarea").attr("contenteditable", "true").addClass("editable");

    // Exibe o botão de editar imagem
    $row.find(".edit-image-btn").show();

    // Exibe o input de link e oculta o botão "Abrir Link"
    $row.find(".link-text").hide();
    $row.find(".link-edit").show();

    // Exibe o select de administradora e oculta o span de texto
    $row.find(".nome-adm").hide();
    $row.find(".admin-select").show();
}

function disableEdit($row) {
    // Desabilitar os campos de edição
    $row.find(".input").attr("contenteditable", "false").removeClass("editable");
    $row.find(".textarea").attr("contenteditable", "false").removeClass("editable");

    // Ocultar o botão de editar imagem
    $row.find(".edit-image-btn").hide();

    // Voltar ao link "Abrir Link" e esconder o campo de input de link
    $row.find(".link-text").show();
    $row.find(".link-edit").hide();

    // Esconde o select de administradora e exibe o span de texto
    $row.find(".admin-select").hide();
    $row.find(".nome-adm").show();
}

// Evento de clique no botão de editar
$(document).on('click', '.edit-btn', function () {
    var $row = $(this).closest(".operadora");
    var operadoraId = $row.data("id");

    $row.addClass("edit-mode");

    // Chama a função enableEdit passando a linha da operadora
    enableEdit($row);

    // Mostra os botões de salvar e cancelar
    $row.find(".edit-btn").hide();
    $row.find(".save-btn").show();
    $row.find(".cancel-btn").show();
});

// Evento de clique do botão cancelar 
$(document).on('click', '.cancel-btn', function () {
    var $row = $(this).closest(".operadora");

    $row.removeClass("edit-mode");

    // Chama a função disableEdit passando a linha da operadora
    disableEdit($row);

    // Esconde os botões de salvar e cancelar, e mostra o de editar
    $row.find(".edit-btn").show();
    $row.find(".save-btn").hide();
    $row.find(".cancel-btn").hide();
});

// Evento de clique no botão de salvar
$(document).on('click', '.save-btn', function () {
    var $row = $(this).closest(".operadora");
    var operadoraId = $row.data("id");

    $row.removeClass("edit-mode");

    // Chama a função updateOperadora que envia os dados atualizados para o servidor
    updateOperadora($row, operadoraId);

    // Desabilita a edição dos campos e altera a exibição dos botões
    disableEdit($row);
    $row.find(".edit-btn").show();
    $row.find(".save-btn").hide();
    $row.find(".cancel-btn").hide();
});

$(document).on('click', '.edit-image-btn', function () {
    const row = $(this).closest(".operadora")
    const id = row.data('id');
    $('#selectedOperadoraId').val(id);
    openModal();
});

// Obtém uma referência para a modal
const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));

// Mantém uma referência para a imagem selecionada
let selectedImage = null;

// Selecione uma imagem existente
const existingImages = document.querySelectorAll('.existing-image');
existingImages.forEach((image) => {
    image.addEventListener('click', () => {
        if (selectedImage) {
            selectedImage.classList.remove('selected');
        }
        image.classList.add('selected');
        selectedImage = image;
        console.log(selectedImage)
        document.getElementById('deleteBtn').style.display = 'block';
    });
});

// Excluir imagem selecionada
document.getElementById('deleteBtn').addEventListener('click', () => {
    if (selectedImage) {
        const imageSrc = selectedImage.src.replace(window.location.origin, '');
        $.ajax({
            url: '/deleteImage',
            type: 'POST',
            data: { img: imageSrc },
            success: function (response) {
                if (response.success) {
                    showMessage(response.message)
                    console.log(response.message);
                } else {
                    showMessageError(response.message)
                    console.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                showMessageError(error)
                console.error('Erro ao excluir a imagem:', error);
            }
        });
        selectedImage.parentNode.remove();
        selectedImage = null;
        document.getElementById('deleteBtn').style.display = 'none';
    }
});

// Upload de nova imagem
document.getElementById('uploadForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            showMessage(response)
            console.log('Upload concluído:', response);
            location.reload();
        },
        error: function (xhr, status, error) {
            showMessageError(error)
            console.error('Erro ao fazer upload:', error);
        }
    });

    // Adicione a nova imagem à interface
    const newImageItem = document.createElement('div');
    newImageItem.classList.add('image-item');
    const newImage = document.createElement('img');
    newImage.src = URL.createObjectURL(formData.get('file'));
    newImage.alt = 'Imagem';
    newImage.classList.add('existing-image');
    newImageItem.appendChild(newImage);
    document.querySelector('.existing-images').appendChild(newImageItem);

    // Limpa o formulário
    event.target.reset();
});

function openModal() {
    uploadModal.show();
}

function closeModal() {
    uploadModal.hide();
}

document.getElementById('salvar-img-operadora').addEventListener('click', () => {
    if (selectedImage) {
        const selectedImageSrc = selectedImage.src.replace(window.location.origin, '');
        const operadoraId = document.getElementById('selectedOperadoraId').value;
        closeModal();
        console.log(selectedImageSrc, operadoraId)
        $.ajax({
            url: '/salvarLogo',
            type: 'POST',
            data: { operadoraId: operadoraId, logoUrl: selectedImageSrc },
            success: function (response) {
                showMessage(response)
                console.log('Logo salva com sucesso:', response);
                location.reload();
            },
            error: function (xhr, status, error) {
                showMessageError(error)
                console.error('Erro ao salvar a logo:', error);
            }
        });
    }
});

document.getElementById('adicionar-operadora').addEventListener('click', () => {
    const tbodyOperadoras = document.querySelector('.tbody-operadoras');
    const ultimaOperadora = tbodyOperadoras.lastElementChild;
    const idUltimaOperadora = ultimaOperadora.dataset.id
    const idNovaOperadora = Number(idUltimaOperadora) + 1;
    const novaTrOperadora = document.createElement('tr')
    novaTrOperadora.dataset.id = idNovaOperadora
    novaTrOperadora.id = `operadora-${idNovaOperadora}`
    novaTrOperadora.innerHTML = `
    <th scope="row">${idNovaOperadora}</th>
                    <td class="td-1"><img src="./img-privadas/LOGO-OPERADORA-MODELO.png" class="editable-image" width="50%"><button class="edit-image-btn btn btn-info" style="display: none;" title="Editar logo da Operadora"><i class="bi bi-images"></i></button>
                    </td>
                    <td class="td-2"><input type="text" class="nome-operadora input form-control"
                            placeholder="Insira o Nome da Operadora" data-field="nome">
                        </span></td>
                    <td class="td-3">
                        <select class="nome-adm select form-control" data-field="administradora">
                            <option value="Mount Hermon">Mount Hermon</option>
                            <option value="Classe Administradora">Classe Administradora</option>
                            <option value="Compar">Compar</option>
                        </select>
                    </td>
                    <td class="td-4"><textarea class="abrangencia textarea form-control" data-field="abrangencia" placeholder="Insira a área de abrengência da operadora"></textarea>
                        </td>
                    <td class="td-5"><textarea class="areadeatuacao textarea form-control" data-field="areaAtuacao" placeholder="Insira a área de Atuação"></textarea></td>
                    <td>
                        <button class="edit-btn btn btn-primary" style="display:none"><i class="bi bi-pencil-square" title="Editar informações da operadora"></i></button>

                        <button class="cancel-btn btn btn-danger" title="Voltar sem salvar"><i
                                class="bi bi-arrow-counterclockwise"></i></button>
                        <button class="save-btn btn btn-success" title="Salvar alterações"><i
                                class="bi bi-sd-card"></i></button>
                    </td>
    `;
    tbodyOperadoras.appendChild(novaTrOperadora);
    console.log(novaTrOperadora)
})

document.getElementById('excluir-operadora').addEventListener('click', () => {
    console.log("Clicou em excluir operadora");
    const divExclusao = document.querySelector('#exclusao')
    divExclusao.style.display = "block"
    divExclusao.scrollIntoView({ behavior: 'smooth' });

});

const confirmarExclusaoBtn = document.getElementById('confirmar-exclusao');

confirmarExclusaoBtn.addEventListener('click', () => {
    confirmarExclusaoOperadora();
})

function confirmarExclusaoOperadora() {
    const operadoraSelect = document.getElementById('operadoraSelect');
    const passwordInput = document.getElementById('password');
    const idOperadora = operadoraSelect.value;
    const senha = passwordInput.value;

    // Verificar se os campos estão preenchidos
    if (idOperadora && senha) {
        // Criar objeto de dados a ser enviado na solicitação
        const data = {
            id: idOperadora,
            senha: senha
        };

        // Enviar solicitação AJAX para a rota de exclusão de operadora no Node.js
        fetch('/excluir-operadora', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    console.log('Operadora excluída com Sucesso!')
                    location.reload();
                    showMessage('Operadora exclída com Sucesso!')
                } else if (response.status === 401) {
                    var mensagem = response.message;
                    showMessageError('Senha incorreta. Operação de exclusão não autorizada.')
                    console.log('Senha incorreta. Operação de exclusão não autorizada.');
                } else if (response.status === 404) {
                    showMessageError('Operadora não encontrada')
                    console.log('Operadora não encontrada.');
                } else {
                    showMessageError('Erro ao excluir operadora. Ela possui vigências vinculadas a ela! Por favor exclua as vigências e tente novamente.')
                    console.log('Erro ao excluir operadora. Ela possui vigências vinculadas a ela! Por favor exclua as vigências e tente novamente.');
                }
            })
            .catch((error) => {
                console.error('Erro ao enviar solicitação de exclusão:', error);
                showMessageError('Erro ao excluir operadora. Por favor, tente novamente.');
            });
    } else {
        showMessageError('Preencha todos os campos antes de prosseguir.')
    }
}

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
    const Mensagem = document.getElementById('Message');
    if (Mensagem) {
        Mensagem.innerHTML = `${decodeURIComponent(message)} 
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`;
        Mensagem.style.display = 'block';
    } else {
        console.error('Elemento de mensagem não encontrado. Certifique-se de que o elemento com o ID "Message" está presente no DOM.');
    }
}

function showMessageError(message) {
    const Mensagem = document.getElementById('MessageError')
    Mensagem.innerHTML = `ALERTA: ${decodeURIComponent(message)} 
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`
    Mensagem.style.display = 'block';
}


