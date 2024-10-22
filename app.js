const {
  mysql,
  config
} = require("./database");
const logger = require('./logger');
const express = require('express');
const app = new express();
const axios = require('axios');
const path = require('path')
const session = require('express-session');
//const redis = require('connect-redis');
const crypto = require('crypto');
const ejs = require('ejs');
const fs = require('fs');
const multer = require('multer');
const cookie = require('cookie-parser');
const port = 3879;

/* Verificar se usuário está logado */
const verificaAutenticacao = (req, res, next) => {
    if (req.session && req.session.usuario) {
      next();
    } else {
      res.redirect('/login');
    }
};

/* Condições de uso */

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/src', express.static('src'));
app.use('/img', express.static('img'));
app.use('/img-privadas', express.static('img-privadas'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cookie());

const storage = multer.diskStorage({
  destination: 'img/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

/* Criptografia da sessão */

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();

/* Abertura de sessão */

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000 // 2 horas em milissegundos
    }
  }));

/* async function enviarErroDiscord(mensagem) {
  let enviar = `ERRO VIGÊNCIAS LINHA MASTER: \n
  ${mensagem}`
  try {
    await axios.post('https://bot.midiaideal.com/mensagem-erros', { enviar });
    console.log('Mensagem enviada com sucesso');
  } catch (error) {
      console.error('Erro ao enviar mensagem erro:', error);
  }
} */


/* Rota de logout do aplicativo */

app.get('/logout', (req, res) => {
    // Remover as informações de autenticação da sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao encerrar a sessão:', err);
      }
      // Redirecionar o usuário para a página de login ou para outra página desejada
      res.redirect('/login');
    });
});

/* rotas públicas */

app.get('/login', (req, res) => {
    //const filePath = path.join(__dirname, 'src/index.html');
    res.render('index');
})

/* rotas protegidas */

app.post('/login-verifica', async (req, res) => {
  const db = await mysql.createPool(config);
  const { username, password } = req.body;
  console.log(username, password);

  const query = 'SELECT * FROM users WHERE nomedesusuario = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      enviarErroDiscord(err);
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const user = results[0];

    if (user.senha !== password) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    // Autenticação bem-sucedida, enviar uma resposta de sucesso
    req.session.usuario = user;
    res.status(200).json({ message: 'Autenticação bem-sucedida' });
  });
});

app.get('/rotateste', verificaAutenticacao , (req, res) => {
    res.send('Teste de rota sem login')
})

app.get('/vigencias', verificaAutenticacao, async (req, res) => {
  const db = await mysql.createPool(config);
  try {
    const query = 'SELECT * FROM operadoras';
    db.query(query, (err, operadoras) => {
    if (err) {
      enviarErroDiscord(err)
      console.error('Erro ao consultar o banco de dados:', err);
      res.status(500).send('Erro ao processar a solicitação');
      return;
    }

    // Consulta para obter as informações de vigência e fechamento relacionadas a cada operadora
    const query2 = 'SELECT * FROM vigencias_temp WHERE idOperadora = ?';
    const promises = operadoras.map((operadora) => {
      return new Promise((resolve, reject) => {
        db.query(query2, [operadora.id], (err, resultados) => {
          if (err) {
            console.error('Erro ao consultar o banco de dados:', err);
            reject(err);
          } else {
            // Atribuir os valores de vigência e fechamento à operadora correspondente
            operadora.vigencias = resultados.map((resultado) => resultado.dataVigencia);
            operadora.fechamentos = resultados.map((resultado) => resultado.dataFechamento);
            operadora.movimentacao = resultados.map((resultado) => resultado.dataMovimentacao);
            resolve();
          }
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        // Renderizar o template com as operadoras e as novas colunas de vigência e fechamento
        res.render('vigencias', { operadoras });
      })
      .catch((error) => {
        enviarErroDiscord(err)
        console.error('Erro ao consultar o banco de dados:', error);
        res.status(500).send('Erro ao processar a solicitação');
      });
  });
  } catch (error) {
    enviarErroDiscord(error)
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }  
});

app.get('/operadoras', verificaAutenticacao, async (req, res) => {
  const db = await mysql.createPool(config);
  try {
    const query = 'SELECT * FROM operadoras';
    const files = fs.readdirSync('img/');
    db.query(query, (err, operadoras) => {
      if (err) {
        enviarErroDiscord(err)
        console.error('Erro ao consultar o banco de dados:', err);
        res.status(500).send('Erro ao processar a solicitação');
        return;
      }
      res.render('operadoras', 
        {
          operadoras, 
          files: files, 
          administradoras: [
            "Mount Hermon",
            "Classe Administradora",
            "Compar"
          ]
        });
    });
  } catch (error) {
    enviarErroDiscord(error)
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }    
})

app.post('/salvar-infos', async (req, res) => {
  const db = await mysql.createPool(config);
  try {
    const { vigencias } = req.body;
    console.log(vigencias);
  
  
    const sqlExcluirVigencias = 'TRUNCATE TABLE vigencias_temp';
    const sqlSalvarVigencias = 'INSERT INTO vigencias_temp (idOperadora, dataVigencia, dataMovimentacao, dataFechamento) VALUES (?, ?, ?, ?)';
  
  
    db.query(sqlExcluirVigencias, (err, resultExc) => {
      if(err){
        console.error('Erro na exclusão das vigencias já cadastradas')
        res.cookie('alertError', 'Erro ao SALVAR vigências, verifique e tente novamente', { maxAge: 3000 });
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
      if(Array.isArray(vigencias)) {
        vigencias.forEach((vigencia) => {
          db.query(sqlSalvarVigencias, [vigencia.idOperadora, vigencia.dataVigencia,vigencia.dataMovimentacao, vigencia.dataFechamento],(err, result) => {
            if(err){
              console.error('Erro ao cadastrar as vigências na tela temporária', err) 
            }
          })
        })
      }
      res.cookie('alertSucess', 'Dados de Vigências SALVOS com sucesso!', { maxAge: 3000 })
      res.status(200).json({ message: 'Dados de Vigências SALVOS com sucesso!' });
      //console.log('Dados salvos:', vigencias)
    });
  } catch (error) {
    enviarErroDiscord(error)
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }  
})

app.get('/visualizar', async (req,res) => {
  const db = await mysql.createPool(config);
  try {
    const query = 'SELECT o.id, o.logo, o.abrangencia, o.areadeatuacao, o.nome, o.administradora, v.dataVigencia, v.dataMovimentacao, v.dataFechamento FROM operadoras o LEFT JOIN vigencias_temp v ON o.id = v.idOperadora';
    db.query(query, (err, resultados) => {
      if (err) {
        enviarErroDiscord(err)
        console.error('Erro ao consultar o banco de dados:', err);
        res.status(500).send('Erro ao processar a solicitação');
        return;
      }
  
      const operadoras = [];
  
      // Agrupar os resultados por ID da operadora
      const operadorasMap = new Map();
      resultados.forEach((resultado) => {
        const operadoraId = resultado.id;
        if (!operadorasMap.has(operadoraId)) {
          // Criar um novo objeto de operadora
          const operadora = {
            id: operadoraId,
            logo: resultado.logo,
            abrangencia: resultado.abrangencia,
            areaAtuacao: resultado.areadeatuacao,
            nome: resultado.nome,
            administradora: resultado.administradora,
            vigencias: [],
            movimentacoes: [],
            fechamentos: []
          };
          operadorasMap.set(operadoraId, operadora);
          operadoras.push(operadora);
        }
  
        // Adicionar vigência e fechamento à operadora correspondente
        const operadora = operadorasMap.get(operadoraId);
        operadora.vigencias.push(resultado.dataVigencia);
        operadora.movimentacoes.push(resultado.dataMovimentacao);
        operadora.fechamentos.push(resultado.dataFechamento);
      });
  
      const queryInformacoesGerais = 'SELECT data_atualizacao, data_proxima_atualizacao FROM informacoes_gerais ORDER BY id DESC LIMIT 1';
      db.query(queryInformacoesGerais, (err, resultadoInformacoesGerais) => {
        if (err) {
          enviarErroDiscord(err)
          console.error('Erro ao consultar as informações gerais:', err);
          res.status(500).send('Erro ao processar a solicitação');
          return;
        }
  
        // Verificar se há resultados
        if (resultadoInformacoesGerais.length === 0) {
          res.status(404).send('Nenhuma informação encontrada');
          return;
        }
  
        const informacoesGerais = resultadoInformacoesGerais[0];
  
        res.render('visualizacaocalendario', { operadoras, informacoesGerais });
        //console.log(operadoras)
      });
    });
  } catch (error) {
    enviarErroDiscord(error)
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }  
})

app.post('/copiar-dados', async (req, res) => {
  const db = await mysql.createPool(config);
  try {
    const { dataAtualizacao, dataProximaAtualizacao } = req.body;
  
    const [diaAtualizacao, mesAtualizacao, anoAtualizacao] = dataAtualizacao.split('/');
    const dataAtualizacaoFormatada = `${anoAtualizacao}-${mesAtualizacao}-${diaAtualizacao}`;
  
    const [diaProxima, mesProxima, anoProxima] = dataProximaAtualizacao.split('/');
    const dataProximaAtualizacaoFormatada = `${anoProxima}-${mesProxima}-${diaProxima}`;
  
    const queryDelete = 'TRUNCATE TABLE vigencias';
    const query = 'INSERT INTO vigencias SELECT * FROM vigencias_temp';
    const queryInfos = 'INSERT INTO informacoes_gerais (data_atualizacao, data_proxima_atualizacao) VALUES (?, ?)'
    
    db.query(queryDelete, (err, result) => {
      if (err) {
        enviarErroDiscord(err)
        console.error('Erro ao excluir dados da tabela de vigências', err);
        res.status(500).json({ error: 'Erro ao excluir dados da tabela de vigências' });
      } else {
        db.query(query, (err, result) => {
          if (err) {
            enviarErroDiscord(err)
            console.error('Erro ao salvar Publicar as informações', err);
            res.status(500).json({ error: 'Erro ao salvar Publicar as informações' });
          } else {
            db.query(queryInfos, [dataAtualizacaoFormatada, dataProximaAtualizacaoFormatada], (err, result) => {
              if (err) {
                enviarErroDiscord(err)
                console.error('Erro ao copiar as informações para a tabela de vigências', err);
                res.status(500).json({ error: 'Erro ao copiar as informações para a tabela de vigências' });
              } else {
                res.cookie('alertSucess', 'Dados de Vigências PUBLICADOS com sucesso!', { maxAge: 3000 });
                res.status(200).json({ message: 'Vigências PUBLICADAS com sucesso!' });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }  
});

app.post('/operadoras-update',  async (req, res) => {
  const pool = await mysql.createPool(config);
  try {
    const { id, nome, administradora, abrangencia, areaAtuacao } = req.body;
    

      pool.getConnection((err, db) => {
        if (err) {
          console.error('Erro ao pegar conexão:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
      // Consultar o banco de dados para verificar se o ID já existe
      const query = 'SELECT * FROM operadoras WHERE id = ?';
      db.query(query, [id], (err, rows) => {
        if (err) {
          console.error('Erro ao consultar operadora:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    
        if (rows.length > 0) {
          // O ID existe, realizar a atualização
          // Iniciar uma transação
          db.beginTransaction((err) => {
            if (err) {
              console.error('Erro ao iniciar a transação:', err);
              return res.status(500).json({ message: 'Erro interno do servidor' });
            }

            console.log({
              id: id,
              nomeOpweradora: nome,
              administradora: administradora,
              abrangencia: abrangencia,
              areaAtuacao: areaAtuacao
            })
    
            const updateQuery = 'UPDATE operadoras SET nome = ?, administradora = ?, abrangencia = ?, areadeatuacao = ? WHERE id = ?';
            db.query(updateQuery, [nome, administradora, abrangencia, areaAtuacao, id], (err, result) => {
              if (err) {
                console.error('Erro ao atualizar operadora:', err);
    
                // Reverter a transação em caso de erro
                db.rollback(() => {
                  console.error('Transação revertida.');
                  return res.status(500).json({ message: 'Erro interno do servidor' });
                });
              }
    
              // Confirmar a transação
              db.commit((err) => {
                if (err) {
                  console.error('Erro ao confirmar a transação:', err);
    
                  // Reverter a transação em caso de erro
                  db.rollback(() => {
                    console.error('Transação revertida.');
                    return res.status(500).json({ message: 'Erro interno do servidor' });
                  });
                }
    
                // Transação bem-sucedida
                res.status(200).json({ message: 'Operadora atualizada com sucesso' });
              });
            });
          });
        } else {
          // O ID não existe, criar uma nova operadora
          const createQuery = 'INSERT INTO operadoras (nome, administradora, abrangencia, areadeatuacao) VALUES (?, ?, ?, ?)';
          db.query(createQuery, [nome, administradora, abrangencia, areaAtuacao], (err, result) => {
            if (err) {
              console.error('Erro ao criar operadora:', err);
              return res.status(500).json({ message: 'Erro interno do servidor' });
            }
            res.cookie('alertSucess', 'Operadora criada com Sucesso', { maxAge: 3000 });
            res.status(200).json({ message: 'Nova operadora criada com sucesso' });
          });
        }
      });
  });
  } catch (error) {
    enviarErroDiscord(error)
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }  
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json('Enviado com sucesso');
});

app.post('/deleteImage', (req, res) => {
  const file = path.join(__dirname, req.body.img)
  if (fs.existsSync(file)) {
    try {
      // Exclui o arquivo
      fs.unlinkSync(file);
      res.json({ success: true, message: 'Imagem excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir a imagem:', error);
      res.json({ success: false, message: 'Erro ao excluir a imagem.' });
    }
  } else {
    res.json({ success: false, message: 'Arquivo não encontrado em: ' + file });
  }
});

app.post('/excluir-operadora', async (req, res) => {
  const db = await mysql.createPool(config);
  try {
    const { id, senha } = req.body;
  
    // Verifique a senha digitada
    if (senha === 'MountHermonDir') { // Substitua 'senha_correta' pela senha correta que você deseja verificar
      // Realize a exclusão da operadora no banco de dados
      db.query('DELETE FROM operadoras WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error('Erro ao excluir operadora:', err);
          return res.status(500).json({ message: 'Erro interno do servidor ao excluir operadora' });
        }
  
        // Verifique se a operadora foi excluída com sucesso
        if (result.affectedRows > 0) {
          // A operadora foi excluída com sucesso
          res.cookie('alertSucess', 'Operadora excluída com sucesso', { maxAge: 3000 });
          res.redirect('/operadoras');
        } else {
          // A operadora com o ID especificado não foi encontrada
          res.cookie('alertError', '❌❌❌ Operadora não encontrada ❌❌❌', { maxAge: 3000 });
          return res.status(404).json({ message: 'Operadora não encontrada' });
        }
      });
    } else {
      // Envie uma resposta de erro
      res.status(401).json({ message: 'Senha incorreta. Operação de exclusão não autorizada.' });
    }
  } catch (error) {
    enviarErroDiscord(error)
    console.error(error);
    res.status(500).send('Erro ao carregar os dados.');
  }  
});

/* rota pública */

app.get('/', async (req, res) => {
  const db = await mysql.createPool(config);
  const query = 'SELECT o.id, o.logo, o.abrangencia, o.areadeatuacao, o.nome, o.administradora, v.dataVigencia, v.dataMovimentacao, v.dataFechamento FROM operadoras o LEFT JOIN vigencias v ON o.id = v.idOperadora';
  db.query(query, (err, resultados) => {
    if (err) {
      enviarErroDiscord(err)
      console.error('Erro ao consultar o banco de dados:', err);
      res.status(500).send('Erro ao processar a solicitação');
      return;
    }

    const operadoras = [];

    // Agrupar os resultados por ID da operadora
    const operadorasMap = new Map();
    resultados.forEach((resultado) => {
      const operadoraId = resultado.id;
      if (!operadorasMap.has(operadoraId)) {
        // Criar um novo objeto de operadora
        const operadora = {
          id: operadoraId,
          logo: resultado.logo,
          abrangencia: resultado.abrangencia,
          areaAtuacao: resultado.areadeatuacao,
          nome: resultado.nome,
          administradora: resultado.administradora,
          vigencias: [],
          movimentacoes: [],
          fechamentos: []
        };
        operadorasMap.set(operadoraId, operadora);
        operadoras.push(operadora);
      }

      // Adicionar vigência e fechamento à operadora correspondente
      const operadora = operadorasMap.get(operadoraId);
      operadora.vigencias.push(resultado.dataVigencia);
      operadora.movimentacoes.push(resultado.dataMovimentacao);
      operadora.fechamentos.push(resultado.dataFechamento);
    });

    const queryInformacoesGerais = 'SELECT data_atualizacao, data_proxima_atualizacao FROM informacoes_gerais ORDER BY id DESC LIMIT 1';
    db.query(queryInformacoesGerais, (err, resultadoInformacoesGerais) => {
      if (err) {
        enviarErroDiscord(err)
        console.error('Erro ao consultar as informações gerais:', err);
        res.status(500).send('Erro ao processar a solicitação');
        return;
      }

      // Verificar se há resultados
      if (resultadoInformacoesGerais.length === 0) {
        res.status(404).send('Nenhuma informação encontrada');
        return;
      }

      const informacoesGerais = resultadoInformacoesGerais[0];

      res.render('calendariodevigencias', { operadoras, informacoesGerais });
    });
  });
});

app.get('/test-error', (req, res) => {
  throw new Error('Este é um erro de teste para verificar o envio ao Discord.');
});

app.post('/salvarLogo', async (req, res) => {
  const db = await mysql.createPool(config);
  const connection = await db.getConnection(); // Obtendo uma conexão

  try {
    await connection.beginTransaction(); // Iniciando uma transação

    const logo = req.body.logoUrl;
    const operadoraId = req.body.operadoraId;
    
    if (!logo || !operadoraId) {
      throw new Error('Dados incompletos: logoUrl ou operadoraId ausente');
    }

    const query = 'UPDATE operadoras SET logo = ? WHERE id = ?';
    const result = await connection.query(query, [logo, operadoraId]); // Removendo destructuring para evitar erro de iterabilidade

    await connection.commit(); // Confirmar a transação

    res.cookie('alerta', '✅ Logo da operadora atualizado com SUCESSO', { maxAge: 3000 });
    res.status(200).json({ message: 'Operadora atualizada com sucesso' });

  } catch (error) {
    console.error('Erro durante a atualização:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  } finally {
    connection.release(); // Liberar a conexão
  }
});




/* Inicializando o servidor */

app.listen(process.env.PORT || port, (req, res) =>{
  console.log(`Servidor rodando com sucesso na porta: ${port}`)
});

// Capturar rejeições não tratadas de promessas
/* process.on('unhandledRejection', (reason, promise) => {
  logger.error({
      message: 'Unhandled Rejection at Promise',
      reason: reason,
      stack: reason.stack || reason,
  });
});

// Capturar exceções não tratadas
process.on('uncaughtException', (error) => {
  logger.error({
      message: 'Uncaught Exception',
      stack: error.stack,
  });

  // Opcional: terminar o processo para evitar um estado inconsistente
  process.exit(1);
}); */


