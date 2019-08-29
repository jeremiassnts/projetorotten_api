const { Client } = require('pg');

async function check(req, res) {
    const { host, port, database, user, password } = req.body;
    const client = new Client({
        host,
        port,
        database,
        user,
        password,
        ssl: true
    });
    let message = "";
    let error = false;
    try {
        await client.connect();
        await client.end();
        message = "Conectado com sucesso";
    } catch (err) {
        await client.end();
        error = true;
        message = `Não foi possível se conectar ao banco => ${err}`;
    }
    return res.json({
        error,
        message
    });
}

module.exports = { check }