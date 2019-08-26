const express = require('express');
const { Pool } = require('pg');

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
        const result = await pool.query(
            `select id, nome, sede from rottentomatoes.estudio
             order by nome`);
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
    const { estudioId } = req.params;
    try {
        const estudio = (await pool.query(
            `select * from rottentomatoes.estudio e
             where e.id = ${estudioId}`)).rows[0];
        estudio.producoes = (await pool.query(
            `select p.titulo, p.datalancamento from rottentomatoes.produzidopor pp
             join rottentomatoes.producao p on p.id = pp.producaoid
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