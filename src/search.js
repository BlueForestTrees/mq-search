import ENV from "./env"
import {dbInit, col} from "mongo-registry"
import {initRabbit, createReceiver} from "simple-rbmq"

dbInit(ENV)
    .then(() => initRabbit(ENV.RB))
    .then(() => col(ENV.DB_COLLECTION))
    .then(db => Promise.all([
        initRobot("upsert-trunk", db, upsert),
        initRobot("delete-trunk", db, del)
    ]))

const initRobot = (routingKey, queueName, db, work) =>
    createReceiver(
        ENV.RB.exchange,
        routingKey,
        {...ENV.QUEUE, name: queueName},
        msg => work(msg, db)
    )

const upsert = (doc, db) => db.updateOne(
    {_id: doc._id},
    {$set: doc},
    {upsert: true}
)

const del = (doc, db) => db.deleteOne(
    {_id: doc._id}
)
