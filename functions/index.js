const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

exports.addLove = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Not authenticated.')
  }

  const headers = context.rawRequest.headers
  const dataToSave = {
    ...data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    country: headers['x-appengine-country'] || '',
    region: headers['x-appengine-region'] || '',
    city: headers['x-appengine-city'] || '',
    ip: headers['x-appengine-user-ip'] || ''
  }
  if (headers['x-appengine-citylatlong']) {
    let latlong = headers['x-appengine-citylatlong'].split(',')
    dataToSave['lat'] = parseFloat(latlong[0])
    dataToSave['lng'] = parseFloat(latlong[1])
  }
  console.log(dataToSave)
  return admin.firestore()
    .collection('love')
    .add(dataToSave)
    .then((docRef) => {
      // TODO: bigquery
      return { id: docRef.id }
    })
    .catch(console.error)
})

const { BigQuery } = require('@google-cloud/bigquery')

exports.leaveLove = functions.firestore.document('love/{loveID}').onDelete((snap, context) => {
  const data = snap.data()
  const bigqueryClient = new BigQuery()

  data['timestamp'] = data.timestamp.toDate()
  data['duration'] = (new Date() - data.timestamp) / 1000

  return bigqueryClient
    .dataset('extralove')
    .table('love_shares')
    .insert([data])
    .catch(error => console.log(JSON.stringify(error)))
})
