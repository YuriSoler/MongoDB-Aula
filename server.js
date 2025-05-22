const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const uri =
  "mongodb+srv://YuriRibeiro:mongodb110204@auladb.ewfhf74.mongodb.net/";
const nomeBanco = "aula";
const nomeColecao = "dadosCadastro";

let db;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    db = client.db(nomeBanco);
    console.log("Conectado ao MongoDB com sucesso!");
  } catch (erro) {
    console.error("Erro ao conectar ao MongoDB:", erro);
  }
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Middleware de verificação de conexão
const verificarConexao = (req, res, next) => {
  if (!db) {
    return res
      .status(503)
      .json({ message: "Serviço indisponível (sem conexão com o banco)" });
  }
  next();
};

// CREATE - Adicionar item
app.post("/api/items", verificarConexao, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
    }

    const novoItem = {
      nome,
      descricao: descricao || "",
      createdAt: new Date(),
    };

    const resultado = await db.collection(nomeColecao).insertOne(novoItem);
    const itemInserido = await db
      .collection(nomeColecao)
      .findOne({ _id: resultado.insertedId });

    res.status(201).json(itemInserido);
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    res.status(500).json({ message: "Erro interno ao adicionar dados." });
  }
});

// READ - Obter todos os itens
app.get("/api/items", verificarConexao, async (req, res) => {
  try {
    const items = await db
      .collection(nomeColecao)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(items);
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    res.status(500).json({ message: "Erro interno ao buscar dados." });
  }
});

// UPDATE - Atualizar item por ID
app.put("/api/items/:id", verificarConexao, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
    }

    const atualizacao = {
      $set: {
        nome,
        descricao: descricao || "",
        updatedAt: new Date(),
      },
    };

    const resultado = await db
      .collection(nomeColecao)
      .findOneAndUpdate({ _id: new ObjectId(id) }, atualizacao, {
        returnDocument: "after",
      });

    if (!resultado.value) {
      return res
        .status(404)
        .json({ message: "Item não encontrado para atualização." });
    }

    res.status(200).json(resultado.value);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    res.status(500).json({ message: "Erro interno ao atualizar dados." });
  }
});

// DELETE - Remover item por ID
app.delete("/api/items/:id", verificarConexao, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const resultado = await db
      .collection(nomeColecao)
      .deleteOne({ _id: new ObjectId(id) });

    if (resultado.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Item não encontrado para exclusão." });
    }

    res.status(200).json({ message: "Item excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    res.status(500).json({ message: "Erro interno ao deletar dados." });
  }
});

// Inicializa servidor e conecta ao banco
async function iniciarServidor() {
  await run();
  app.listen(port, () => {
    console.log(`Servidor rodando em: http://localhost:${port}`);
  });
}

iniciarServidor();
