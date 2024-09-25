const express = require('express');
const pedidosRoutes = require('./routes/pedidosRoutes');
const produtosRoutes = require('./routes/produtosRoutes');

const app = express();
app.use(express.json());


app.use('/pedidos',pedidosRoutes);
app.use('/produtos',produtosRoutes);

const port = 3002; 

app.listen(port,()=>{
    console.log(`O seu servidor está rodando na porta ${port}`);
});

