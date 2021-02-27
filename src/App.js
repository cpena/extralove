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
      messagesStream: []
    }
  }

  componentDidMount () {
    this.auth()
      .then(uid => {
        this.setState({ uid })
        return this.subscribe()
      })
      .then(_ => {
        this.setState({ loading: false })
      })
      .catch(console.error)
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  auth () {
    return firebase.auth().signInAnonymously()
      .then(result => result.user.uid)
  }

  subscribe () {
    return new Promise((resolve, reject) => {
      this.unsubscribeFn = firebase
        .firestore()
        .collection('messages')
        .where('status', '==', 'NEW')
        .onSnapshot(
          (querySnapshot) => {
            const messagesStream = []
            querySnapshot.forEach((doc) => {
              let data = doc.data()
              data.id = doc.id
              messagesStream.push(data)
            })
            console.log(messagesStream)
            this.setState({ messagesStream: messagesStream })
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
    if (this.unsubscribeFn) {
      this.unsubscribeFn()
    }
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
