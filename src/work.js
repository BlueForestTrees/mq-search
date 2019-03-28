export const upsert = type => (doc, db) => {
    doc.searchType = type
    return db.updateOne(
        {_id: doc._id},
        {$set: doc},
        {upsert: true}
    )
}

export const del = type => (doc, db) => db.deleteOne(
    {_id: doc._id}
)