import React from 'react'
import MapContainer from './MapContainer'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'

const TIMEOUT_ERROR = 5000

class Main extends React.Component {
  constructor (props) {
    super(props)

    this.currentDoc = null
    this.state = {
      status: 'idle',
      messagesStream: props.messagesStream,
      messagesSendingCount: 0,
      sendingTime: 0,
      message: ''
    }
  }

  componentWillReceiveProps (nextProps) {
    if (JSON.stringify(nextProps.messagesStream) !== JSON.stringify(this.state.messagesStream)) {
      this.setState({ messagesStream: nextProps.messagesStream })
    }
  }

  onMessageChange(event) {
    this.setState({message: event.target.value});
  }

  sendMessage = () => {
    if (this.state.message === '') {
      return
    }

    const startDate = new Date()
    this.setState({messagesSendingCount: this.state.messagesSendingCount + 1}, () => {
      const addMessage = firebase.functions().httpsCallable('addMessage')
      
      addMessage({ uid: this.props.uid, message: this.state.message })
        .then((result) => {
          console.log(result)

          const endDate   = new Date()
          const sendingTime = (endDate.getTime() - startDate.getTime())
          this.setState({messagesSendingCount: this.state.messagesSendingCount - 1, sendingTime, message: ''})

          if (result.data.id === null) {
            this.setState({error: 'Vamos!, dale, puedes enviar más amor (score: ' + result.data.sentiment.score.toFixed(2) + ')'}, () => {
              setTimeout(() => {
                this.setState({error: ''})
              }, TIMEOUT_ERROR)
            })
          }
          
        })
        .catch((e) => {
          console.log(e)
          
        })
    })

    
  }

  render () {
    const { messagesStream, status, messagesSendingCount, sendingTime, error } = this.state

    console.log(status, messagesStream)
    return (
      <div className='Main'>
        <div className='Background'>
          <MapContainer markers={messagesStream}/>
        </div>
        <div
          className={'Text ' + status}>
          <textarea value={this.state.message} onChange={(e) => this.onMessageChange(e)}/>    
        </div>
        <div
          className={'Button ' + status}
          /*
          onMouseDown={() => this.startSendingLove()}
          onMouseUp={() => this.stopSendingLove()}
          onMouseLeave={() => this.stopSendingLove()}
          onTouchStart={() => this.startSendingLove()}
          onTouchEnd={() => this.stopSendingLove()}
          */
          onClick={() => this.sendMessage()}
        />
        <div className='Count'>SENDING: {messagesSendingCount}<br></br>{sendingTime}ms</div>
        {status==='starting'
        ? <div className='Status'>CONECTANDO</div>
        : <div className='Status'>{error}</div>
        }
      </div>
    )
  }
}
export default Main
