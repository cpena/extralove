const functions = require('firebase-functions')
const admin = require('firebase-admin')
const language = require('@google-cloud/language');

admin.initializeApp()

const MAX_TIME_SECONDS = 60 // 1 minuto
const SCORE_THRESHOLD = 0.25
const MAX_WRITES = 500

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

exports.updateLikesUnlikesMessages = functions.firestore.document('feelings/{feelingID}').onWrite((change, context) => {
  const document = change.after.exists ? change.after.data() : null
  const oldDocument = change.before.data()
  const messageId = document ? document.message_id : oldDocument.message_id

  return admin.firestore()
    .collection('feelings')
    .where('message_id', '==', messageId)
    .get()
    .then((querySnapshot) => {
      let likes = 0
      let unlikes = 0
      querySnapshot.forEach((doc) => {
        let data = doc.data()
        if (data.state === 1) {
          likes++
        } else if (data.state === -1) {
          unlikes++
        }
      })

      return admin.firestore()
        .collection('messages')
        .doc(messageId)
        .update({likes, unlikes})
    })
   
})


exports.autoDeleteMessage = functions.pubsub.topic('auto-delete-messages').onPublish((message) => {
  const db = admin.firestore()
  const minDate = new Date( Date.now() - 1000 * MAX_TIME_SECONDS )

  return db
    .collection('messages')
    .where('timestamp', '<', minDate)
    .get()
    .then((querySnapshot) => {
      let batch = db.batch()
      querySnapshot.forEach((doc) => {
        batch.update(db.collection('messages').doc(doc.id), {"status": 'OLD'})
      })
      return batch.commit()
    })
})