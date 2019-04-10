export const del = () => (doc, db) => db.deleteOne({_id: doc._id})

export const delSub = fragment => (doc, db) => db.updateOne({_id: doc.trunkId}, {$pull: {[fragment]: {_id: doc._id}}})

export const upsert = type => (doc, db) => {
    doc.searchType = type
    return db.updateOne(
        {_id: doc._id},
        {$set: doc},
        {upsert: true}
    )
}

export const upsertSub = fragment => {
    const fragmentId = `${fragment}._id`
    const fragment$ = `${fragment}.$`
    return async (doc, db) => {
        const updateResult = await db.updateOne({_id: doc.trunkId, [fragmentId]: doc._id}, {$set: {[fragment$]: doc}})
        const nothingUpdated = updateResult.matchedCount === 0
        if (nothingUpdated) {
            return db.updateOne({_id: doc.trunkId}, {$push: {[fragment]: doc}})
        }
        return updateResult
    }
}