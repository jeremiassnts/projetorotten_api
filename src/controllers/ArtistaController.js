const { Pool } = require('pg');

async function index(req, res) {
    const { host, port, database, user, password } = req.body;
    const pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: true
    });
    try {
        const result = await pool.query(
            `select a.id, p.nome from projetorotten.artista a
             join projetorotten.pessoa p on p.id = a.pessoaid
             order by p.nome`);
        await pool.end();
        return res.json(result.rows);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao buscar informações => ${err}`);
    }
}

async function specific(req, res) {
    const { host, port, database, user, password } = req.body;
    const pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: true
    });
    const { artistaId } = req.params;
    try {
        const artista = (await pool.query(
            `select p.nome, p.datanascimento, p.pais from projetorotten.artista a
             join projetorotten.pessoa p on p.id = a.pessoaid
             where a.id = ${artistaId}`)).rows[0];
        artista.producoes = (await pool.query(
            `select p.id, p.titulo, o.nome from projetorotten.artistatrabalhoucomo at
             join projetorotten.producao p on p.id = at.producaoid
             join projetorotten.ocupacao o on o.id = at.ocupacaoid
             where at.artistaid = ${artistaId}`
        )).rows;
        await pool.end();
        return res.json(artista);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao buscar informações => ${err}`);
    }
}

module.exports = { index, specific }