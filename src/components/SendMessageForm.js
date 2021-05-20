import { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/functions'

const TIMEOUT_ERROR = 5000

class SendMessageForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      status: 'idle',
      error: '',
      message: ''
    }
  }

  onMessageChange(event) {
    this.setState({message: event.target.value});
  }

  setError(error, timeout = TIMEOUT_ERROR) {
    this.setState({error}, () => {
      setTimeout(() => {
        this.setState({error: ''})
      }, timeout)
    })
  }

  sendMessage () {
    if (this.state.message === '') {
      return
    }

    this.setState({status: 'sending'})

    // Calling Cloud Function 
    const addMessage = firebase.functions().httpsCallable('addMessage')
    addMessage({ uid: this.props.uid, message: this.state.message })
      .then((result) => {
        console.log(result)
        
        if (result.data.id === null) {
          const score = result.data.sentiment.score.toFixed(2)
          this.setError('Vamos!, ánimo!, puedes enviar más amor (score: ' + score + ')')
        }

        this.setState({status: 'idle', message: ''})
      })
      .catch((e) => {
        console.log(e)
        this.setError(e.message)
      })
  }
  
  
  render () {
    const { message, status, error } = this.state
    return (
      <div className='MessageForm'>
        <div className='Text'>
          <textarea 
            disabled = { status === 'sending'}
            value={message} 
            onChange={(e) => this.onMessageChange(e)}/>    
        </div>
        <div
          className={'Button ' + status}
          onClick={() => this.sendMessage()}
        />
        {error 
        ?<div className='Error'>{error}</div>
        :null}
        
      </div>)
  }
}
export default SendMessageForm