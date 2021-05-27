import express from 'express'
import cors from 'cors'
import config from 'config'

const app = express()
export default app

app.use(cors())

app.use(express.json())

// routes setup
const routes = express.Router()

import AccountController from './controllers/AccountController.mjs'
AccountController(routes)

import PetController from './controllers/PetController.mjs'
PetController(routes)

import OwnerController from './controllers/OwnerController.mjs'
OwnerController(routes)

import DiseaseController from './controllers/DiseaseController.mjs'
DiseaseController(routes)

import VaccineController from './controllers/VaccineController.mjs'
VaccineController(routes)

import FinanceController from './controllers/FinanceController.mjs'
FinanceController(routes)

import LogController from './controllers/LogController.mjs'
LogController(routes)

import HealthCheckController from './controllers/HealthCheckController.mjs'
HealthCheckController(routes)

app.use(routes)

const http_port = config.get('http_port')

if (process.env.NODE_ENV !== 'test') {
  app.listen(http_port, () => {
    console.info(`HTTP backend server listening on port ${http_port}`)
  })
}
