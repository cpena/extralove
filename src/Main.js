import React from 'react'
import MapContainer from './components/MapContainer'
import Messages from './components/Messages'
import SendMessageForm from './components/SendMessageForm'

class Main extends React.Component {
  constructor (props) {
    super(props)

    this.currentDoc = null
    this.state = {
      messagesStream: props.messagesStream,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (JSON.stringify(props.messagesStream) !== JSON.stringify(state.messagesStream)) {
      return { messagesStream: props.messagesStream }
    }
    return null
  }

  render () {
    const { messagesStream } = this.state
    const { uid } = this.props

    return (
      <div className='Main'>
        <div className='Background'>
          <MapContainer markers={messagesStream}/>
        </div>

        <Messages uid={uid} messages={messagesStream}/>

        <SendMessageForm uid={uid}/>        
      </div>
    )
  }
}
export default Main
