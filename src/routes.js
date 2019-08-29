const express = require('express');
const BDController = require('./controllers/BDController');
const ProducaoController = require('./controllers/ProducaoController');
const ArtistaController = require('./controllers/ArtistaController');
const EstudioController = require('./controllers/EstudioController');
const ScriptController = require('./controllers/ScriptController');

const routes = express.Router();

routes.get('/producoes', ProducaoController.index);
routes.get('/producoes/:producaoId', ProducaoController.specific);
routes.get('/artistas', ArtistaController.index);
routes.get('/artistas/:artistaId', ArtistaController.specific);
routes.get('/estudios', EstudioController.index);
routes.get('/estudios/:estudioId', EstudioController.specific);
routes.get('/scripts', ScriptController.index);
routes.get('/scripts/:queryId', ScriptController.specific);
routes.post('/check', BDController.check);

module.exports = routes;