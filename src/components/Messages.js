import { Component } from 'react'
import Message from './Message'

class Messages extends Component {
  constructor (props) {
    super(props)
    this.lastMessageElement = null
    this.state = {
      messages: props.messages,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (JSON.stringify(props.messages) !== JSON.stringify(state.messages)) {
      return { messages: props.messages }
    }
    return null
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom () {
    if (this.lastMessageElement) {
      this.lastMessageElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  render () {
    const { messages } = this.state
    const { uid } = this.props
    
    return (
      <div className='Messages'>
        <div className='MessagesContainer'>
          {messages.map((m) => {
            return <Message uid={uid} message={m} key={m.id}/>
          })}
          <div ref={(el) => { this.lastMessageElement = el; }}></div>
        </div>
      </div>
    )
  }
}
export default Messages