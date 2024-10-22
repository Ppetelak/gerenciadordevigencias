// URL do Webhook do Discord (substitua pela sua URL de webhook)
const discordWebhookUrl = 'https://discord.com/api/webhooks/1296523170911879249/iiaZa4nUaKbcVLTsWW_eVfHqdrmov_1Insyo-jVAqw8A7e4adDpwfjun9mHkMt5XTS9W';

// Importar módulos necessários
const axios = require('axios');
const winston = require('winston');
const path = require('path');

// Transporte personalizado para enviar erros ao Discord
class DiscordTransport extends winston.transports.Console {
  log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    if (info.level === 'error') {
      // Montar mensagem para o Discord
      const discordMessage = {
        username: 'Error Gerenciador de Vigências', // Nome do bot no Discord
        content: `🚨 **ERRO DETECTADO**\n**Timestamp**: ${info.timestamp}\n**Mensagem**: ${info.message}\n${info.stack ? `**Stacktrace**: \u0060\u0060\u0060${info.stack}\u0060\u0060\u0060` : ''}`
      };

      // Enviar mensagem para o Discord
      axios.post(discordWebhookUrl, discordMessage).catch(error => {
        console.error('Erro ao enviar notificação para o Discord:', error);
      });
    }

    callback();
  }
}

// Criar o logger usando Winston
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Para incluir stacktrace no log
    winston.format.json()
  ),
  transports: [
    // Registrar o erro em um arquivo de log
    new winston.transports.File({
      filename: path.join('erros', 'error.log.json'),
    }),
    // Transporte personalizado para enviar notificações de erro ao Discord
    new DiscordTransport(),
  ],
});

// Exportar o logger para uso em outras partes da aplicação
module.exports = logger;

// Exemplo de uso do logger
//logger.error('Este é um teste de erro para o Discord!');
