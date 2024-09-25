// src/controllers/pedidosController.js
const axios = require('axios');
const listaPedidos = [];

// Funções de validação
function validarDados(dado, res) {
    if (dado == null) {
        return res.status(400).json({ mensagem: "Necessário preencher todos os campos." });
    }
}

function validarBoolean(dado, res) {
    if (typeof dado !== 'boolean') {
        return res.status(400).json({ mensagem: "Campo suporta apenas valores do tipo boolean." });
    }
}

function validarNumber(dado, res) {
    if (typeof dado !== 'number' || dado < 0) {
        return res.status(400).json({ mensagem: "O campo suporta apenas valores do tipo number maior ou igual a zero." });
    }
}

function validarFormaDePagamento(forma_pagamento, res) {
    if (!["cartao", "dinheiro", "pix"].includes(forma_pagamento)) {
        return res.status(400).json({ mensagem: "Forma de Pagamento Inválida." });
    }
}

function validarStatusPedido(status_pedido, res) {
    if (!["aceito", "pendente", "cancelado"].includes(status_pedido)) {
        return res.status(400).json({ mensagem: "Status do pedido inválido!" });
    }
}

exports.createPedido = async (req, res) => {
    const { nome_cliente, data_pedido, pedido_enviado, status_pedido, itens_pedido, total_pedido, forma_pagamento, endereco_entrega } = req.body;

    // Validações...
    validarDados(nome_cliente, res);
    validarDados(data_pedido, res);
    validarDados(pedido_enviado, res);
    validarDados(status_pedido, res);
    validarDados(itens_pedido, res);
    validarDados(total_pedido, res);
    validarDados(forma_pagamento, res);
    validarDados(endereco_entrega, res);

    // Verifica a disponibilidade dos produtos
    try {
        const produtosResponse = await axios.get('http://localhost:3002/produtos'); // URL da API de produtos
        const produtosDisponiveis = produtosResponse.data;

        for (const item of itens_pedido) {
            const produto = produtosDisponiveis.find(produto => produto.id === item.id);
            if (!produto || produto.quantidade_estoque < item.quantidade) {
                return res.status(400).json({ mensagem: "Produto não disponível ou estoque insuficiente.", item });
            }
        }
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao verificar produtos." });
    }

    // Cria um novo pedido
    const novoPedido = {
        id: listaPedidos.length + 1,
        nome_cliente,
        data_pedido,
        pedido_enviado,
        status_pedido,
        itens_pedido,
        total_pedido,
        forma_pagamento,
        endereco_entrega
    };

    listaPedidos.push(novoPedido);

    // Atualiza o estoque
    for (const item of itens_pedido) {
        await axios.put(`http://localhost:3002/produtos/${item.id}`, {
            quantidade_estoque: item.quantidade // Substitua ou ajuste conforme a lógica de estoque
        });
    }

    res.status(201).json({ mensagem: "Pedido feito com sucesso.", pedido: novoPedido });
};

exports.getPedidoById = (req, res) => {
    const idPedido = parseInt(req.params.id);
    const pedido = listaPedidos.find(pedido => pedido.id === idPedido);

    if (!pedido) {
        return res.status(404).json({ mensagem: "Pedido não existe!" });
    }

    res.json(pedido);
};

exports.getPedidos = (req, res) => {
    const status = req.query.status ? req.query.status.toLowerCase() : null;
    let pedidosFiltrados = listaPedidos;

    if (status) {
        pedidosFiltrados = listaPedidos.filter(pedido => pedido.status_pedido === status);
    }

    const resumoPedidos = pedidosFiltrados.map(pedido => ({
        id: pedido.id,
        nome_cliente: pedido.nome_cliente,
        data_pedido: pedido.data_pedido,
        status_pedido: pedido.status_pedido,
        total_pedido: pedido.total_pedido
    }));

    res.json(resumoPedidos);
};

exports.updatePedidoStatus = (req, res) => {
    const { id } = req.params;
    const { status_pedido } = req.body;

    const pedido = listaPedidos.find(p => p.id == id);

    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    validarStatusPedido(status_pedido, res);
    pedido.status_pedido = status_pedido;

    res.json({ message: 'Status atualizado com sucesso.', pedido });
};

exports.deletePedido = (req, res) => {
    const idPedido = parseInt(req.params.id);
    const index = listaPedidos.findIndex(pedido => pedido.id === idPedido);

    if (index < 0) {
        return res.json({ mensagem: "Pedido não existe." });
    } else {
        listaPedidos.splice(index, 1);
    }

    res.json({ mensagem: "Pedido deletado com sucesso." });
};
