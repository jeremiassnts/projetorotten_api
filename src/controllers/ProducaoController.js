const { Pool } = require('pg')

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
        const result = await pool.query(`select id, titulo, datalancamento from projetorotten.producao order by titulo`);
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
    const { producaoId } = req.params;
    try {
        const producao = (await pool.query(
            `select p.*, f.duracao, s.emissora, e.nome as estudio from projetorotten.producao p
             left join projetorotten.filme f on f.producaoid = p.id
             left join projetorotten.serie s on s.producaoid = p.id
             left join projetorotten.produzidopor pp on pp.producaoid = p.id
             left join projetorotten.estudio e on e.id = pp.estudioid
             where p.id = ${producaoId}`)).rows[0];
        producao.notas = (await pool.query(
            `select nota from projetorotten.usuarioavaliaproducao
             where producaoid = ${producaoId}`
        )).rows.map(e => e.nota);
        producao.criticas = (await pool.query(
            `select cast(concat(c.imprensaid, c.producaoid) as integer) as id, p.nome, e.nome as entidade, i.cargo, c.nota, c.critica from projetorotten.imprensacriticaproducao c
             join projetorotten.imprensa i on i.id = c.imprensaid
             join projetorotten.entidade e on e.id = i.entidadeid
             join projetorotten.usuario u on u.id = i.usuarioid
             join projetorotten.pessoa p on p.id = u.pessoaid
             where c.producaoid = ${producaoId}
             order by c.critica`
        )).rows;
        producao.notas = producao.notas.concat(producao.criticas.map(e => e.nota));
        await pool.end();
        return res.json(producao);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao buscar informações => ${err}`);
    }
}

module.exports = { index, specific }