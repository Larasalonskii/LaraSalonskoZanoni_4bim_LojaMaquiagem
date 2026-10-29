// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
let operacao = null;

// --- CONSTANTES DE CAMINHO DE IMAGEM ---
// Rota base para servir a imagem (do seu routerImagem.js)
const VIEW_IMAGE_BASE_URL = `${API_BASE_URL}/view-image`;
// Rota base para o upload/download da imagem (do seu routerImagem.js)
const UPLOAD_IMAGE_ROUTE = `${API_BASE_URL}/upload-image`;
// Fallback para quando a imagem não for encontrada
const FALLBACK_IMAGE_PATH = '/imagens/produtos/000.png';
// =====================================

// Elementos do DOM
const form = document.getElementById('produtoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const produtosTableBody = document.getElementById('produtosTableBody');
const messageContainer = document.getElementById('messageContainer');

// >>> ELEMENTOS DOM PARA IMAGEM <<<
const imgProdutoVisualizacao = document.getElementById('imgProdutoVisualizacao');
const imgProdutoInput = document.getElementById('imgProdutoInput');
const imgURL = document.getElementById('imgURL');
const btnCarregarImagem = document.getElementById('btnCarregarImagem');


// Carregar lista de produtos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    // Garante que a imagem inicial seja o fallback
    imgProdutoVisualizacao.src = FALLBACK_IMAGE_PATH;
    imgProdutoVisualizacao.alt = 'Imagem Padrão';
});

// Event Listeners
btnBuscar.addEventListener('click', buscarProduto);
btnIncluir.addEventListener('click', incluirProduto);
btnAlterar.addEventListener('click', alterarProduto);
btnExcluir.addEventListener('click', excluirProduto);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// >>> NOVO EVENT LISTENER PARA UPLOAD DA IMAGEM <<<
btnCarregarImagem.addEventListener('click', handleImageUpload);


mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false);//libera pk e bloqueia os demais campos

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input) => {
        // Se for o searchId (PK)
        if (input.id === 'searchId') {
            // Bloqueia searchId se 'bloquearPrimeiro' for TRUE, libera se for FALSE
            input.disabled = bloquearPrimeiro;
        } else {
            // Demais campos: Bloqueia se 'bloquearPrimeiro' for FALSE, libera se for TRUE
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    // Garante que a imagem volta para o padrão quando o formulário é limpo
    imgProdutoVisualizacao.src = FALLBACK_IMAGE_PATH;
    imgProdutoVisualizacao.alt = 'Imagem Padrão';
}


function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Funções de formatação (mantidas)
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}
function converterDataParaISO(dataString) {
    if (!dataString) return null;
    return new Date(dataString).toISOString();
}

// Função para buscar produto por ID
async function buscarProduto() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/produto/${id}`);
        // console.log(JSON.stringify(response));

        if (response.ok) {
            const produto = await response.json();
            preencherFormulario(produto);

            mostrarBotoes(true, false, true, true, false, true);// Mostrar Alterar/Excluir, Cancelar
            bloquearCampos(false); // Libera PK (Search ID) e Bloqueia os demais.
            mostrarMensagem('Produto encontrado!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); // Mostrar Buscar/Incluir
            bloquearCampos(false); // Libera PK (Search ID) e Bloqueia os demais.
            mostrarMensagem('Produto não encontrado. Você pode incluir um novo produto.', 'info');
        } else {
            throw new Error('Erro ao buscar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar produto', 'error');
    }
}

// Função para preencher formulário com dados da produto
function preencherFormulario(produto) {

    // Assumindo que o backend retorna 'idproduto', 'nomeproduto', etc.,
    // e o seu HTML usa 'id_produto', 'nome_produto', etc.
    // Usaremos a coerência do backend onde possível, mas o HTML é o padrão:

    const produtoId = produto.idproduto || produto.id_produto;
    currentPersonId = produtoId;
    searchId.value = produtoId;

    // >>> USANDO OS NOVOS IDs DO HTML: nome_produto, quantidade_estoque_produto, preco_unitario_produto <<<
    document.getElementById('nome_produto').value = produto.nomeproduto || produto.nome_produto || '';
    document.getElementById('quantidade_estoque_produto').value = produto.quantidadeemestoque || produto.quantidade_estoque_produto || 0;
    document.getElementById('preco_unitario_produto').value = produto.precounitario || produto.preco_unitario_produto || 0;

    // Lógica para carregamento dinâmico da imagem com fallback
    const imgElement = document.getElementById('imgProdutoVisualizacao');

    if (imgElement) {
        imgElement.style.width = '200px';
        imgElement.style.height = '200px';
    }

    // Limpa erro anterior e define o handler de erro para o fallback
    imgElement.onerror = function() {
        // Se a imagem com o ID não for encontrada via /view-image, carrega o fallback.
        imgElement.src = FALLBACK_IMAGE_PATH;
        imgElement.alt = 'Imagem Padrão não encontrada';
        imgElement.onerror = null; // Evita loop
    };

    if (imgElement && produtoId) {
        // Tenta carregar a imagem usando a rota /view-image/:produtoId
        // Adiciona um timestamp para forçar o navegador a recarregar (burlar o cache)
        const imagePath = `${VIEW_IMAGE_BASE_URL}/${produtoId}?t=${new Date().getTime()}`;
        imgElement.src = imagePath;
        imgElement.alt = `Imagem do Produto ID ${produtoId}`;

    } else if (imgElement) {
        // Se não houver ID do produto, mostra o fallback imediatamente
        imgElement.src = FALLBACK_IMAGE_PATH;
        imgElement.alt = 'Imagem Padrão';
        imgElement.onerror = null;
    }
}


async function handleImageUpload() {
    const id = searchId.value.trim();

    // A imagem só pode ser salva/renomeada se houver um ID conhecido
    if (!id || (operacao !== 'alterar' && operacao !== 'incluir')) {
        mostrarMensagem('Busque ou inclua o produto e esteja no modo de Alteração/Inclusão para carregar a imagem.', 'warning');
        return;
    }

    const file = imgProdutoInput.files[0];
    const url = imgURL.value.trim();

    if (!file && !url) {
        mostrarMensagem('Selecione um arquivo local OU cole uma URL para carregar.', 'warning');
        return;
    }

    // 1. Prepara os dados para envio
    let formData = new FormData();
    formData.append('produtoId', id); // O ID será o novo nome do arquivo, como esperado pelo backend

    if (file) {
        // Opção 1: Upload de arquivo local
        formData.append('imageSource', 'local');
        formData.append('imageFile', file);
    } else if (url) {
        // Opção 2: Download de URL
        formData.append('imageSource', 'url');
        formData.append('imageUrl', url);
    } else {
        return; // Caso nenhum dado válido
    }

    mostrarMensagem('Enviando imagem para o servidor...', 'info');

    try {
        // 2. Envia para o endpoint de upload (/upload-image)
        const response = await fetch(UPLOAD_IMAGE_ROUTE, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // 3. Sucesso: Recarrega a imagem na tela para bustar o cache
            const imagePath = `${VIEW_IMAGE_BASE_URL}/${id}?t=${new Date().getTime()}`;
            imgProdutoVisualizacao.src = imagePath;
            mostrarMensagem('Imagem carregada e salva com sucesso!', 'success');

            // 4. Limpa os campos após sucesso
            imgProdutoInput.value = '';
            imgURL.value = '';
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao salvar a imagem no servidor.');
        }

    } catch (error) {
        console.error('Erro no upload da imagem:', error);
        mostrarMensagem(`Erro no upload: ${error.message}`, 'error');
    }
}


// Função para incluir produto
async function incluirProduto() {
    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    limparFormulario();
    searchId.value = currentPersonId;
    bloquearCampos(true); // Bloqueia PK (Search ID) e Libera os demais.

    mostrarBotoes(false, false, false, false, true, true); // Mostrar Salvar/Cancelar
    // >>> FOCA NO PRIMEIRO CAMPO DE DADOS <<<
    document.getElementById('nome_produto').focus();
    operacao = 'incluir';
}

// Função para alterar produto
async function alterarProduto() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true); // Bloqueia PK (Search ID) e Libera os demais.
    mostrarBotoes(false, false, false, false, true, true);// Mostrar Salvar/Cancelar
    // >>> FOCA NO PRIMEIRO CAMPO DE DADOS <<<
    document.getElementById('nome_produto').focus();
    operacao = 'alterar';
}

// Função para excluir produto
async function excluirProduto() {
    mostrarMensagem('Confirmar exclusão? Clique em Salvar!', 'info');
    currentPersonId = searchId.value;
    searchId.disabled = true; // Bloqueia searchId para exclusão
    bloquearCampos(false); // Mantém os campos bloqueados
    mostrarBotoes(false, false, false, false, true, true);// Mostrar Salvar/Cancelar
    operacao = 'excluir';
}

async function salvarOperacao() {
    console.log('Operação:', operacao + ' - currentPersonId: ' + currentPersonId + ' - searchId: ' + searchId.value);

    // >>> USANDO OS NOVOS IDs DO HTML PARA PEGAR OS VALORES <<<
    const produto = {
        id_produto: searchId.value,
        nome_produto: document.getElementById('nome_produto').value,
        quantidade_estoque_produto: document.getElementById('quantidade_estoque_produto').value,
        preco_unitario_produto: document.getElementById('preco_unitario_produto').value,
    };

   // alert(JSON.stringify(produto));

    let response = null;
    try {
        let url = `${API_BASE_URL}/produto`;

        let method = 'POST';
        let body = JSON.stringify(produto);
        let headers = { 'Content-Type': 'application/json' };

        if (operacao === 'alterar') {
            url = `${API_BASE_URL}/produto/${currentPersonId}`;
            method = 'PUT';
        } else if (operacao === 'excluir') {
            url = `${API_BASE_URL}/produto/${currentPersonId}`;
            method = 'DELETE';
            body = undefined;
            headers = {};
        }

        response = await fetch(url, { method, headers, body });

        if (response.ok) {
            if (operacao === 'excluir') {
                mostrarMensagem('Produto excluído com sucesso!', 'success');
            } else {
                mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
            }
            limparFormulario();
            carregarProdutos();
        } else {
            const error = await response.json();
            mostrarMensagem(error.error || `Erro ao ${operacao} produto`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao comunicar com o servidor', 'error');
    }

    mostrarBotoes(true, false, false, false, false, false);// Mostrar Buscar
    bloquearCampos(false);// Libera PK e Bloqueia os demais.
    document.getElementById('searchId').focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);// Mostrar Buscar
    bloquearCampos(false);// Libera PK e Bloqueia os demais.
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de produtos
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/produto`);

        if (response.ok) {
            const produtos = await response.json();
            renderizarTabelaProdutos(produtos);
        } else {
            throw new Error('Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de produtos', 'error');
    }
}

// Função para renderizar tabela de produtos
function renderizarTabelaProdutos(produtos) {
    produtosTableBody.innerHTML = '';

    produtos.forEach(produto => {
        // Tenta usar os nomes mais comuns do backend/JSON
        const id = produto.idproduto || produto.id_produto;
        const nome = produto.nomeproduto || produto.nome_produto;
        const estoque = produto.quantidadeemestoque || produto.quantidade_estoque_produto;
        const preco = produto.precounitario || produto.preco_unitario_produto;

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <button class="btn-id" onclick="selecionarProduto(${id})">
                            ${id}
                        </button>
                    </td>
                    <td>${nome}</td>
                    <td>${estoque}</td>
                    <td>${preco}</td>

                `;
        produtosTableBody.appendChild(row);
    });
}

// Função para selecionar produto da tabela
async function selecionarProduto(id) {
    searchId.value = id;
    await buscarProduto();
}