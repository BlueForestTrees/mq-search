import ENV from "./env"
import {dbInit, col} from "mongo-registry"
import {initRabbit, createReceiver} from "simple-rbmq"
import {del, delSub, upsert, upsertSub} from "./work"

const toUpsertJob = name => ({work: upsert(name), routingKey: `${name}-upsert`, queue: {...ENV.QUEUE, name: `${name}-upsert-search`}})
const toDelJob = name => ({work: del(name), routingKey: `${name}-delete`, queue: {...ENV.QUEUE, name: `${name}-delete-search`}})

const toUpsertSubJob = name => ({work: upsertSub(name), routingKey: `${name}-upsert`, queue: {...ENV.QUEUE, name: `${name}-upsert-search`}})
const toDelSubJob = name => ({work: delSub(name), routingKey: `${name}-delete`, queue: {...ENV.QUEUE, name: `${name}-delete-search`}})

dbInit(ENV)
    .then(() => initRabbit(ENV.RB))
    .then(() => col(ENV.DB_COLLECTION))
    .then(db => Promise.all(
        ENV.JOBS.map(toUpsertJob)
            .concat(ENV.JOBS.map(toDelJob))
            .concat(ENV.SUBJOBS.map(toUpsertSubJob))
            .concat(ENV.SUBJOBS.map(toDelSubJob))
            .map(({routingKey, queue, work}) => createReceiver(ENV.RB.exchange, routingKey, queue, msg => work(msg, db)))
    ))
    .catch(console.error)