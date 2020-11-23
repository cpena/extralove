import React from 'react'
import MapContainer from './MapContainer'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'

const TIMEOUT_SEND = 30000

class Main extends React.Component {
  constructor (props) {
    super(props)

    this.currentDoc = null
    this.state = {
      status: 'idle',
      loveStream: props.loveStream,
      loveSendingCount: 0,
      sendingTime: 0
    }
  }

  componentWillReceiveProps (nextProps) {
    if (JSON.stringify(nextProps.loveStream) !== JSON.stringify(this.state.loveStream)) {
      this.setState({ loveStream: nextProps.loveStream })
    }
  }

  startSendingLove = (uid) => {
    this.setState({status: 'starting'})

    const addLove = firebase.functions().httpsCallable('addLove')
    addLove({ uid })
      .then((result) => {
        this.currentDoc = result.data.id

        this.setState({status: 'sending'})

        this.timeoutSending = setTimeout(() => {
          this.stopSendingLove()
        }, TIMEOUT_SEND)
      })
  }
  
  stopSendingLove = () => {
    if (this.currentDoc) {
      firebase
        .firestore()
        .collection('love')
        .doc(this.currentDoc)
        .delete()
        .catch(console.error)
      this.currentDoc = null
      if (this.timeoutSending) {
        clearTimeout(this.timeoutSending)
        this.timeoutSending = null
      }
      this.setState({status: 'idle'})
    }
  }

  sendLove = (uid) => {
    const startDate = new Date()
    this.setState({loveSendingCount: this.state.loveSendingCount + 1}, () => {

      const addLove = firebase.functions().httpsCallable('addLove')
      addLove({ uid })
        .then((result) => {
          
          const endDate   = new Date()
          const sendingTime = (endDate.getTime() - startDate.getTime())
          this.setState({loveSendingCount: this.state.loveSendingCount - 1, sendingTime})
        })
    })

    
  }

  render () {
    const { uid } = this.props
    const { loveStream, status, loveSendingCount, sendingTime } = this.state

    console.log(status, loveStream)
    return (
      <div className='Main'>
        <div className='Background'>
          <MapContainer markers={loveStream}/>
        </div>
        <div
          className={'Button ' + status}
          /*
          onMouseDown={() => this.startSendingLove(uid)}
          onMouseUp={() => this.stopSendingLove()}
          onMouseLeave={() => this.stopSendingLove()}
          onTouchStart={() => this.startSendingLove(uid)}
          onTouchEnd={() => this.stopSendingLove()}
          */
          onClick={() => this.sendLove(uid)}
        />
        <div className='Count'>SENDING: {loveSendingCount}<br></br>{sendingTime}ms</div>
        {status==='starting'
        ? <div className='Status'>CONECTANDO</div>
        :null
        }
      </div>
    )
  }
}
export default Main
