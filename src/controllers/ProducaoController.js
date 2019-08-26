const { Pool } = require('pg')

async function index(req, res) {
    const { host, port, database, user, password } = req.headers;
    const pool = new Pool({
        host,
        port,
        database,
        user,
        password
    });
    try {
        const result = await pool.query(`select id, titulo, datalancamento from rottentomatoes.producao order by titulo`);
        await pool.end();
        return res.json(result.rows);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao buscar informações => ${err}`);
    }
}
async function specific(req, res) {
    const { host, port, database, user, password } = req.headers;
    const pool = new Pool({
        host,
        port,
        database,
        user,
        password
    });
    const { producaoId } = req.params;
    try {
        const producao = (await pool.query(
            `select p.*, f.duracao, s.emissora, e.nome as estudio from rottentomatoes.producao p
             left join rottentomatoes.filme f on f.producaoid = p.id
             left join rottentomatoes.serie s on s.producaoid = p.id
             left join rottentomatoes.produzidopor pp on pp.producaoid = p.id
             left join rottentomatoes.estudio e on e.id = pp.estudioid
             where p.id = ${producaoId}`)).rows[0];
        producao.notas = (await pool.query(
            `select nota from rottentomatoes.usuarioavaliaproducao
             where producaoid = ${producaoId}`
        )).rows.map(e => e.nota);
        producao.criticas = (await pool.query(
            `select p.nome, e.nome as entidade, i.cargo, c.nota, c.critica from rottentomatoes.imprensacriticaproducao c
             join rottentomatoes.imprensa i on i.id = c.imprensaid
             join rottentomatoes.entidade e on e.id = i.entidadeid
             join rottentomatoes.usuario u on u.id = i.usuarioid
             join rottentomatoes.pessoa p on p.id = u.pessoaid
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