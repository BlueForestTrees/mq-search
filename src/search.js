import ENV from "./env"
import {dbInit, col} from "mongo-registry"
import {initRabbit, createReceiver} from "simple-rbmq"
import {del, upsert} from "./work"

const upsertJob = name => ({work: upsert(name), routingKey: `${name}-upsert`, queue: {...ENV.QUEUE, name: `${name}-upsert-search`}})
const delJob = name => ({work: del(name), routingKey: `${name}-delete`, queue: {...ENV.QUEUE, name: `${name}-delete-search`}})

dbInit(ENV)
    .then(() => initRabbit(ENV.RB))
    .then(() => col(ENV.DB_COLLECTION))
    .then(db => Promise.all(ENV.JOBS.map(upsertJob).concat(ENV.JOBS.map(delJob))
        .map(({routingKey, queue, work}) => createReceiver(ENV.RB.exchange, routingKey, queue, msg => work(msg, db)))))
    .catch(console.error)