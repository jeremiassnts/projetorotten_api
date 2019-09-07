const express = require('express');
const BDController = require('./controllers/BDController');
const ProducaoController = require('./controllers/ProducaoController');
const ArtistaController = require('./controllers/ArtistaController');
const EstudioController = require('./controllers/EstudioController');
const ScriptController = require('./controllers/ScriptController');

const routes = express.Router();

routes.post('/producoes', ProducaoController.index);
routes.post('/producoes/:producaoId', ProducaoController.specific);
routes.delete('/producoes/:producaoId', ProducaoController.remove);
routes.put('/producoes', ProducaoController.update);
routes.post('/insert', ProducaoController.insert);
routes.post('/artistas', ArtistaController.index);
routes.post('/artistas/:artistaId', ArtistaController.specific);
routes.post('/estudios', EstudioController.index);
routes.post('/estudios/:estudioId', EstudioController.specific);
routes.post('/scripts', ScriptController.index);
routes.post('/scripts/:queryId', ScriptController.specific);
routes.post('/check', BDController.check);

module.exports = routes;