const mysql = require('mysql2');
const express = require('express');
const app = new express();
const path = require('path')
const session = require('express-session');
const crypto = require('crypto');
const ejs = require('ejs');
const fs = require('fs');
const multer = require('multer');
const cookie = require('cookie-parser');
const port = 3000;

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
    saveUninitialized: false
  }));

/* Conexão com banco de dados */

const db = mysql.createConnection({
    host: 'localhost',
    user: 'midiaIdeal',
    password: 'midia@8444',
    database: 'vigencias_db',
	  port: '3306'
});
  
db.connect((error) => {
    if (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
    } else {
      console.log('Conexão bem-sucedida ao banco de dados');
    }
});


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
    const filePath = path.join(__dirname, 'src/index.html');
    res.sendFile(filePath);
})

/* rotas protegidas */

app.post('/login-verifica', (req, res) => {
    const { username, password } = req.body;
    console.log( username, password)
  
    const query = 'SELECT * FROM users WHERE nomedesusuario = ?';
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error('Erro ao consultar o banco de dados:', err);
        return res.status(500).json({ error: 'Erro ao processar a solicitação' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
  
      const user = results[0];
  
      if (user.senha !== password) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }
  
      // Autenticação bem-sucedida, enviar uma resposta de sucesso
      req.session.usuario = user;
      res.status(200).json({ message: 'Autenticação bem-sucedida' });
    });
});

app.get('/rotateste', verificaAutenticacao , (req, res) => {
    res.send('Teste de rota sem login')
})

app.get('/vigencias', verificaAutenticacao, (req, res) => {
  const query = 'SELECT * FROM operadoras';
  db.query(query, (err, operadoras) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      res.status(500).send('Erro ao processar a solicitação');
      return;
    }

    // Consulta para obter as informações de vigência e fechamento relacionadas a cada operadora
    const query2 = 'SELECT * FROM vigencias WHERE operadora_id = ?';
    const promises = operadoras.map((operadora) => {
      return new Promise((resolve, reject) => {
        db.query(query2, [operadora.id], (err, resultados) => {
          if (err) {
            console.error('Erro ao consultar o banco de dados:', err);
            reject(err);
          } else {
            // Atribuir os valores de vigência e fechamento à operadora correspondente
            operadora.vigencias = resultados.map((resultado) => resultado.vigencia);
            operadora.fechamentos = resultados.map((resultado) => resultado.fechamento);
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
        console.error('Erro ao consultar o banco de dados:', error);
        res.status(500).send('Erro ao processar a solicitação');
      });
  });
});

app.get('/operadoras', verificaAutenticacao, (req, res) => {
  const query = 'SELECT * FROM operadoras';
  const files = fs.readdirSync('img/');
  db.query(query, (err, operadoras) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      res.status(500).send('Erro ao processar a solicitação');
      return;
    }
    res.render('operadoras', {operadoras, files:files});
  });
})

app.post('/update-vigencias', (req, res) => {
  const { operadoras, dataAtualizacao, dataProximaAtualizacao } = req.body;

  // Converte a dataAtualizacao e dataProximaAtualizacao para o formato adequado
  const [diaAtualizacao, mesAtualizacao, anoAtualizacao] = dataAtualizacao.split('/');
  const dataAtualizacaoFormatada = `${anoAtualizacao}-${mesAtualizacao}-${diaAtualizacao}`;

  const [diaProxima, mesProxima, anoProxima] = dataProximaAtualizacao.split('/');
  const dataProximaAtualizacaoFormatada = `${anoProxima}-${mesProxima}-${diaProxima}`;

  // Iniciar uma transação
  db.beginTransaction((err) => {
    if (err) {
      console.error('Erro ao iniciar a transação:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    // Limpar as vigências e fechamentos existentes no banco de dados
    db.query('TRUNCATE TABLE vigencias', (err, result) => {
      if (err) {
        console.error('Erro ao limpar a tabela de vigências:', err);
        db.rollback(() => {
          console.error('Transação revertida.');
          return res.status(500).json({ message: 'Erro interno do servidor' });
        });
      } else {
        // Inserir as novas vigências e fechamentos no array 'values'
        const values = [];
        operadoras.forEach((operadora) => {
          const { id, vigencias, fechamentos } = operadora;

          vigencias.forEach((vigencia, index) => {
            const fechamento = fechamentos[index];
            values.push([id, vigencia, fechamento]); // Inclui o operadora_id no array de valores
          });
        });

        // Inserir todos os valores no banco de dados de uma vez
        const query = 'INSERT INTO vigencias (operadora_id, vigencia, fechamento) VALUES ?';
        db.query(query, [values], (err, result) => {
          if (err) {
            console.error('Erro ao inserir as vigências e fechamentos:', err);
            db.rollback(() => {
              console.error('Transação revertida.');
              return res.status(500).json({ message: 'Erro interno do servidor' });
            });
          } else {
            // Inserir a data de atualização e data da próxima atualização no banco de dados
            const dataQuery = 'INSERT INTO informacoes_gerais (data_atualizacao, data_proxima_atualizacao) VALUES (?, ?)';
            db.query(dataQuery, [dataAtualizacaoFormatada, dataProximaAtualizacaoFormatada], (err, result) => {
              if (err) {
                console.error('Erro ao inserir as datas de atualização:', err);
                db.rollback(() => {
                  console.error('Transação revertida.');
                  return res.status(500).json({ message: 'Erro interno do servidor' });
                });
              } else {
                // Confirmar a transação
                db.commit((err) => {
                  if (err) {
                    console.error('Erro ao confirmar a transação:', err);
                    db.rollback(() => {
                      console.error('Transação revertida.');
                      return res.status(500).json({ message: 'Erro interno do servidor' });
                    });
                  } else {
                    // Transação bem-sucedida
                    res.cookie('alertSucess', 'Vigências atualizadas com sucesso!', { maxAge: 3000 });
                    res.status(200).json({ message: 'Valores atualizados com sucesso' });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});


app.post('/operadoras-update', (req, res) => {
  const { id, nome, administradora, abrangencia, areaAtuacao } = req.body;

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

app.post('/excluir-operadora', (req, res) => {
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
});

/* rota pública */

app.get('/', (req, res) => {
  const query = 'SELECT o.id, o.logo, o.abrangencia, o.areadeatuacao, o.nome, o.administradora, v.vigencia, v.fechamento FROM operadoras o LEFT JOIN vigencias v ON o.id = v.operadora_id';
  db.query(query, (err, resultados) => {
    if (err) {
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
          fechamentos: []
        };
        operadorasMap.set(operadoraId, operadora);
        operadoras.push(operadora);
      }

      // Adicionar vigência e fechamento à operadora correspondente
      const operadora = operadorasMap.get(operadoraId);
      operadora.vigencias.push(resultado.vigencia);
      operadora.fechamentos.push(resultado.fechamento);
    });

    const queryInformacoesGerais = 'SELECT data_atualizacao, data_proxima_atualizacao FROM informacoes_gerais ORDER BY id DESC LIMIT 1';
    db.query(queryInformacoesGerais, (err, resultadoInformacoesGerais) => {
      if (err) {
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


app.post('/salvarLogo', (req, res) => {
  const logo = req.body.logoUrl
  const operadoraId = req.body.operadoraId
  const query = 'UPDATE operadoras SET logo = ? WHERE id = ?';
  db.query(query, [logo, operadoraId], (err, result) => {
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

      res.cookie('alerta', '✅ Logo da operadora atualizado com SUCESSO', { maxAge: 3000 });
      res.status(200).json({ message: 'Operadora atualizada com sucesso' });
    });
  });
});

/* Inicializando o servidor */

app.listen(process.env.PORT || 3000);


