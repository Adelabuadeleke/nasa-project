const express  = require('express');
const { httpGetAllLaunches, httpAddNewLauch, httpAbortLauch } = require('./launches.controller');
const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches)
launchesRouter.post('/', httpAddNewLauch)
launchesRouter.delete('/:id', httpAbortLauch)

module.exports= launchesRouter;