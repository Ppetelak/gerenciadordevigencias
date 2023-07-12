function changeTab(tabIndex) {
    var tabs = document.getElementsByClassName('tabs')[0].getElementsByTagName('li');
    var tabContents = document.getElementsByClassName('tab-content');


    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
        tabContents[i].classList.remove('active');
    }

    tabs[tabIndex].classList.add('active');
    tabContents[tabIndex].classList.add('active');
}

function logoOperadoras(abaId) {
    const checkboxes = document.querySelectorAll(`#${abaId} input[type="checkbox"]`);

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            return true; // Retorna true se algum checkbox estiver selecionado
        }
    }
    return false; // Retorna false se nenhum checkbox estiver selecionado
}

function atualizalogoOperadoras() {
    if (logoOperadoras("tabMounthermon") === true) {
        document.querySelector('#logoMounthermon').style.display = 'block';
    } else {
        document.querySelector('#logoMounthermon').style.display = 'none';
    }
    if (logoOperadoras("tabCompar") === true) {
        document.querySelector('#logoCompar').style.display = 'block';
    } else {
        document.querySelector('#logoCompar').style.display = 'none';
    }
    if (logoOperadoras("tabClasse") === true) {
        document.querySelector('#logoClasse').style.display = 'block';
    } else {
        document.querySelector('#logoClasse').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var botaoAtualizar = document.querySelector('button#add');
    botaoAtualizar.addEventListener('click', function (e) {
        e.preventDefault();
        var checkboxesSelecionados = document.querySelectorAll('input[name="operadoras[]"]:checked');

        // Obtenha a tabela de vigências
        var tabelaVigencias = document.getElementById('tabelaVigencias');

        // Oculte todas as operadoras na tabela de vigências
        var operadorasNaTabela = tabelaVigencias.querySelectorAll('.operadora-table');
        for (var i = 0; i < operadorasNaTabela.length; i++) {
            operadorasNaTabela[i].style.display = 'none';
        }

        // Exiba apenas as operadoras selecionadas na tabela de vigências
        for (var j = 0; j < checkboxesSelecionados.length; j++) {
            var operadoraSelecionada = checkboxesSelecionados[j].value;
            var operadoraNaTabela = tabelaVigencias.querySelector('.operadora-table[data-operadora="' + operadoraSelecionada + '"]');
            if (operadoraNaTabela) {
                operadoraNaTabela.style.display = '';
            }
        }
        atualizalogoOperadoras()
    });

    var checkboxTodos = document.getElementById('checkboxTodos');
    var checkboxes = document.querySelectorAll('input[name="operadoras[]"]');

    checkboxTodos.addEventListener('change', function () {
        checkboxes.forEach(function (checkbox) {
            checkbox.checked = checkboxTodos.checked;
        });
    });

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            if (!this.checked) {
                checkboxTodos.checked = false;
            } else {
                // Verificar se todos os checkboxes estão marcados
                var todosMarcados = true;
                checkboxes.forEach(function (cb) {
                    if (!cb.checked) {
                        todosMarcados = false;
                    }
                });
                checkboxTodos.checked = todosMarcados;
            }
        });
    });
});


document.getElementById('btnGerarPdf').addEventListener('click', function () {
    var footer = document.querySelector('.footerImpresso')
    var date = new Date();
    var formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    footer.innerHTML = `
    Documento salvo em: ` + formattedDate + `
    `
    imprimirParteHTML();
});

function imprimirParteHTML() {
    window.print();
    location.reload();
}