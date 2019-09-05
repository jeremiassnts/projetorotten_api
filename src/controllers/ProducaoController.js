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
        if (!producao) throw "Produção não encontrada";
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
async function remove(req, res) {
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
        const result = await pool.query(`delete from projetorotten.producao where id = ${producaoId}`)
        await pool.end();
        return res.json(result);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao excluir produção => ${err}`);
    }
}
async function update(req, res) {
    const { host, port, database, user, password, producao } = req.body;
    const pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: true
    });
    try {
        let result = await pool.query(`
        update projetorotten.producao 
        set titulo = '${producao.titulo}', 
        datalancamento = '${producao.datalancamento}', 
        idioma = '${producao.idioma}', 
        pais = '${producao.pais}', 
        sinopse = '${producao.sinopse}', 
        classificacaoindicativa = ${producao.classificacaoindicativa} 
        where id = ${producao.id}
        `)
        result = await pool.query(producao.filme
            ? `update projetorotten.filme 
               set duracao = ${producao.duracao} 
               where producaoId = ${producao.id}`
            : `update projetorotten.serie 
               set emissora = '${producao.emissora}' 
               where producaoId = ${producao.id}`
        )
        await pool.end();
        return res.json(result);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao atualizar produção => ${err}`);
    }
}
async function insert(req, res) {
    const { host, port, database, user, password, producao } = req.body;
    const pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: true
    });
    try {
        let result = await pool.query(`
        insert into projetorotten.producao 
        (id, titulo, datalancamento, idioma, pais, sinopse, classificacaoindicativa) 
        values 
        (${producao.id}, '${producao.titulo}', '${producao.datalancamento}', '${producao.idioma}', '${producao.pais}', '${producao.sinopse}', ${producao.classificacaoindicativa})
        `)
        result = await pool.query(producao.filme
            ? `insert into projetorotten.filme 
               (id, orcamento, duracao, producaoId) 
               values (${producao.filme.id}, ${producao.filme.orcamento}, ${producao.filme.duracao}, ${producao.id})`
            : `insert into projetorotten.serie 
               (id, emissora, producaoId) 
               values (${producao.serie.id}, '${producao.serie.emissora}', ${producao.id})`
        )
        await pool.end();
        return res.json(result);
    } catch (err) {
        await pool.end();
        return res.json(`Erro ao inserir produção => ${err}`);
    }
}

module.exports = { index, specific, remove, update, insert }