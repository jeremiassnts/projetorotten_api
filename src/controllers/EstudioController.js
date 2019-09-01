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
            `select id, nome, sede from projetorotten.estudio
             order by nome`);
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
    const { estudioId } = req.params;
    try {
        const estudio = (await pool.query(
            `select * from projetorotten.estudio e
             where e.id = ${estudioId}`)).rows[0];
        estudio.producoes = (await pool.query(
            `select p.id, p.titulo, p.datalancamento from projetorotten.produzidopor pp
             join projetorotten.producao p on p.id = pp.producaoid
             where pp.estudioid = ${estudioId}
             order by p.titulo`
        )).rows;
        await pool.end();
        return res.json(estudio);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao buscar informações => ${err}`);
    }
}

module.exports = { index, specific }