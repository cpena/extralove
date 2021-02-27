const functions = require('firebase-functions')
const admin = require('firebase-admin')
const language = require('@google-cloud/language');

admin.initializeApp()

const MAX_TIME = 10000
const SCORE_THRESHOLD = 0.25

const analyzeMessage = async (message) => {
  const client = new language.LanguageServiceClient();
  const document = {
    content: message,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the document
  const [result] = await client.analyzeSentiment({document});
  const sentiment = result.documentSentiment;
  console.log(JSON.stringify(sentiment))
  return sentiment
}

const saveMessage = (data, headers) => {
  const dataToSave = {
    ...data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    country: headers['x-appengine-country'] || '',
    region: headers['x-appengine-region'] || '',
    city: headers['x-appengine-city'] || '',
    ip: headers['x-appengine-user-ip'] || '',
    status: 'NEW'
  }
  if (headers['x-appengine-citylatlong']) {
    let latlong = headers['x-appengine-citylatlong'].split(',')
    dataToSave['lat'] = parseFloat(latlong[0])
    dataToSave['lng'] = parseFloat(latlong[1])
  }
  console.log(JSON.stringify(dataToSave))
  return admin.firestore()
    .collection('messages')
    .add(dataToSave)
    .then((docRef) => {
      return { id: docRef.id }
    })
}

exports.addMessage = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Not authenticated.')
  }

  const headers = context.rawRequest.headers
  let sentiment = {}

  return analyzeMessage(data.message)
    .then((analisis) => {
      sentiment = analisis
      if (sentiment.score < SCORE_THRESHOLD) {
        return Promise.resolve({ id: null, sentiment})
      }
      return saveMessage({...data, sentiment }, headers)
    })
    .then((docRef) => {
      return { id: docRef.id, sentiment }
    })
})


exports.autoDeleteMessage = functions.firestore.document('messages/{messageID}').onCreate((snap, context) => {
  return new Promise(resolve => setTimeout(resolve, MAX_TIME))
    .then(() => snap.ref.update({ status: 'OLD' }))
})