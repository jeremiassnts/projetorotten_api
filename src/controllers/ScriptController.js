const { Client } = require('pg')

async function index(req, res) {
    return res.json(queries.map(e => ({ id: e.id, question: e.question })))
}

async function specific(req, res) {
    const queryId = parseInt(req.params.queryId);
    const filteredQueries = queries.filter(e => e.id === queryId);
    if (filteredQueries == null) {
        return res.json("Query não encontrada")
    } else {
        const query = filteredQueries[0];
        const { host, port, database, user, password } = req.body;
        const client = new Client({
            host,
            port,
            database,
            user,
            password,
            ssl: true
        })
        try {
            await client.connect();
            const { rows } = await client.query(query.sql);
            query.rows = rows;
            await client.end();
        } catch (err) {
            await client.end();
            return res.json(`Erro ao buscar informações => ${err}`);
        }
        return res.json(query)
    }
}

const queries = [
    {
        id: 1,
        question: "Quais filmes estão cadastrados?",
        sql: "select p.titulo, p.sinopse, p.classificacaoindicativa, f.orcamento, f.duracao from projetorotten.filme f join projetorotten.producao p on p.id = f.producaoid;"
    },
    {
        id: 2,
        question: "Quais séries e episódios cadastrados?",
        sql: `select p.titulo, p.sinopse, p.classificacaoindicativa, s.emissora, count(t.*) as numeroTemporadas, count(e.*) as numeroEpisodios from projetorotten.serie s
join projetorotten.producao p on p.id = s.producaoid
join projetorotten.temporada t on t.serieid = s.id
join projetorotten.episodio e on e.serieid = s.id
group by p.titulo, p.sinopse, p.classificacaoindicativa, s.emissora;`},
    {
        id: 3,
        question: "Quais são os usuários de imprensa validados?",
        sql: `select p.nome, extract(year from age(p.datanascimento)) as idade, p.email, p.senha, i.cargo, e.nome from projetorotten.imprensa i
join (select u.email, u.senha, u.id as usuarioid, p.nome, p.datanascimento from projetorotten.usuario u
	 join projetorotten.pessoa p on p.id = u.pessoaid) p using(usuarioid)
join projetorotten.entidade e on e.id = i.entidadeid
where i.validado;`},
    {
        id: 4,
        question: "Quais atores não são diretores?",
        sql: `select p.nome from projetorotten.artista a
join projetorotten.artistatrabalhoucomo atc on atc.artistaid = a.id
join projetorotten.ocupacao o on o.id = atc.ocupacaoid
join projetorotten.pessoa p on p.id = a.pessoaid
where o.nome = 'Ator/Atriz'
except
select p.nome from projetorotten.artista a
join projetorotten.artistatrabalhoucomo atc on atc.artistaid = a.id
join projetorotten.ocupacao o on o.id = atc.ocupacaoid
join projetorotten.pessoa p on p.id = a.pessoaid
where o.nome = 'Diretor(a)';`},
    {
        id: 5,
        question: "Quais artistas possuem mais de uma ocupação?",
        sql: `select p.nome from projetorotten.artista a
join projetorotten.pessoa p on p.id = a.pessoaid
join projetorotten.artistatrabalhoucomo atc on atc.artistaid = a.id
group by p.nome
having count(atc.*) > 1;`},
    {
        id: 6,
        question: "Quais artistas com seus respectivos prêmios, caso possuam, estão disponíveis?",
        sql: `select p.nome, string_agg(o.nome, ', '), string_agg(pr.nome||' '||ap.especificacao, ', ') from projetorotten.artista a
join projetorotten.pessoa p on p.id = a.pessoaid
left join projetorotten.artistatrabalhoucomo atc on atc.artistaid = a.id
left join projetorotten.ocupacao o on o.id = atc.ocupacaoid
left join projetorotten.ArtistaPremiacao ap on ap.artistaid = a.id
left join projetorotten.Premiacao pr on pr.id = ap.premiacaoid
group by p.nome;`},
    {
        id: 7,
        question: "Quais atores que possuem nome iniciado com 'A', foram premiados?",
        sql: `select p.nome from projetorotten.artista a
join projetorotten.pessoa p on p.id = a.pessoaid
left join projetorotten.ArtistaPremiacao ap on ap.artistaid = a.id
where ap.artistaid is null
and p.nome like 'A%';`},
    {
        id: 8,
        question: "Quais filmes, agrupados por estúdio, possuem orçamento maior que 50000000?",
        sql: `select e.nome, sum(f.orcamento) as orcamento from projetorotten.estudio e
join projetorotten.produzidopor pp on pp.estudioid = e.id
join projetorotten.filme f on f.producaoid = pp.producaoid
group by e.nome
having sum(f.orcamento) > 50000000;`},
    {
        id: 9,
        question: "Quais filmes, ordenados por lançamento, foram premiados?",
        sql: `select p.titulo, p.datalancamento, f.duracao from projetorotten.filme f
join projetorotten.producao p on p.id = f.producaoid
order by datalancamento desc;`},
    {
        id: 10,
        question: "Quais os usuários e artistas que estão cadastrados?",
        sql: `select s.nome from (select p.nome from projetorotten.usuario u
			   join projetorotten.pessoa p on p.id = u.pessoaid
			   union
			   select p.nome from projetorotten.artista a
			   join projetorotten.pessoa p on p.id = a.pessoaid) s
			   order by s.nome;`},
    {
        id: 11,
        question: "Quais são as notas feitas por usuários comuns em produções lançadas entre 1990 e 2015?",
        sql: `select uap.nota, p.datalancamento from projetorotten.usuarioavaliaproducao uap
join projetorotten.producao p on p.id = uap.producaoid
where p.datalancamento between '1990-01-01' and '2015-12-30';`},
    {
        id: 12,
        question: "Quais são as críticas feitas pela imprensa em produções que possuem algum artista cadastrado?",
        sql: `select icp.nota, icp.critica, p.titulo from projetorotten.imprensacriticaproducao icp
join projetorotten.producao p on p.id = icp.producaoid
where exists(select * from projetorotten.artistatrabalhoucomo where producaoid = p.id);`},
    {
        id: 13,
        question: "Quais são as maiores notas de usuários comuns?",
        sql: `select p.nome, max(icp.nota) as maiornota from projetorotten.usuarioavaliaproducao icp
join projetorotten.usuario u on u.id = icp.usuarioid
join projetorotten.pessoa p on p.id = u.pessoaid
group by p.nome
order by p.nome;`},
    {
        id: 14,
        question: "Quais filmes lançados no Brasil ou Estados Unidos, depois de 1980, que possuem orçamento maior que algum outro filme?",
        sql: `select * from projetorotten.filme f
join projetorotten.producao p on p.id = f.producaoid
join projetorotten.producaopremiacao pp on pp.producaoid = p.id
where p.pais in ('USA', 'BRA')
and p.datalancamento > '1980-01-01'
and f.orcamento > some(select orcamento from projetorotten.filme);`},
    {
        id: 15,
        question: "Quais atores nascidos antes de todas as produções com orçamento maior que 20000000?",
        sql: `with datas_producoes as
(select p.datalancamento from projetorotten.producao p
join projetorotten.filme f on f.producaoid = p.id
where f.orcamento > 20000000)
select p.nome from projetorotten.artista a
join projetorotten.pessoa p on p.id = a.pessoaid
where p.datanascimento < all(select * from datas_producoes);`}
]

module.exports = { index, specific }