import React from 'react'
import { Loading } from './Loading'
import Main from './Main'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      messagesStream: [],
      userFeelings: {}
    }
  }

  componentDidMount () {
    this.authStateSubscribe()
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  authStateSubscribe () {
    console.log('Listening onAuthStateChanged')
    firebase.auth().onAuthStateChanged((user) => {
      console.log('user: ', user ? user.uid : 'none')
      if (user) {
        let uid = user.uid;
        this.init(uid)
      } else {
        this.auth()
      }
    })
  }
  
  auth () {
    console.log('Sing in')
    return firebase.auth().signInAnonymously()
      .then(result => result.user.uid)
  }

  init (uid) {
    this.setState({ uid }, () => {
      this.subscribe()
        .then(_ => {
          this.setState({ loading: false })
        })
    })      
  }

  subscribe () {
    return new Promise((resolve, reject) => {
      const { uid } = this.state

      // Subcribe to users feeeligs
      this.unsubscribeUserFeelings = firebase
        .firestore()
        .collection('feelings')
        .where('uid', '==', uid)
        .orderBy('timestamp','asc')
        .limit(100)
        .onSnapshot(
          (querySnapshot) => {
          this.userFeelings = {}
          querySnapshot.forEach((doc) => {
            let data = doc.data()
            this.userFeelings[data.message_id] = data.state
          })
          console.log(this.userFeelings)
          this.setMessages(this.state.messagesStream, this.userFeelings)
        },
        (error) => {
          console.error(error)
          reject(error)
        }) 

      // Susbcribe to messages
      this.unsubscribeMessages = firebase
        .firestore()
        .collection('messages')
        .where('status', '==', 'NEW')
        .orderBy('timestamp','asc')
        .limit(100)
        .onSnapshot(
          (querySnapshot) => {
            const messagesStream = []
            querySnapshot.forEach((doc) => {
              let data = doc.data()
              data.id = doc.id
              messagesStream.push(data)
            })
            console.log(messagesStream)
            this.setMessages(messagesStream, this.userFeelings)
            
          },
          (error) => {
            console.error(error)
            reject(error)
          }
        )

      resolve()
    })
  }

  unsubscribe () {
    if (this.unsubscribeUserFeelings) {
      this.unsubscribeUserFeelings()
    }
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages()
    }
  }

  setMessages(messagesStream, userFeelings) {
    for(let i in messagesStream) {
      let message = messagesStream[i]
      if (message.id in userFeelings) {
        message.userFeeling = userFeelings[message.id]
      }
    }
    this.setState({ messagesStream })
  }

  render () {
    const { loading, uid, messagesStream } = this.state
    return (
      <div className='App'>
        {loading
          ? <Loading />
          : <Main uid={uid} messagesStream={messagesStream} />
        }
      </div>
    )
  }
}
export default App
