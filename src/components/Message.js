import { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import TimeAgo from 'react-timeago'
import thumb_down_filled from '../images/thumb_down_filled.png'
import thumb_down_outlined from '../images/thumb_down_outlined.png'
import thumb_up_filled from '../images/thumb_up_filled.png'
import thumb_up_outlined from '../images/thumb_up_outlined.png'

class Message extends Component {
  constructor (props) {
    super(props)
    this.state = {
      message: props.message,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (JSON.stringify(props.message) !== JSON.stringify(state.message)) {
      return { message: props.message }
    }
    return null
  }

  toogleLike () {
    const { message } = this.state
    if (message.userFeeling === 1) {
      message.userFeeling = null
      message.likes = message.likes ? message.likes - 1 : 0
    } else {
      if (message.userFeeling === -1) {
        message.unlikes = message.unlikes ? message.unlikes - 1 : 0
      }
      message.userFeeling = 1
      message.likes = message.likes ? message.likes + 1 : 1
    }
    this.setState({message}, () => {
      this.updateUserFeeling()
    })
  }

  toogleUnlike () {
    const { message } = this.state
    if (message.userFeeling === -1) {
      message.userFeeling = null
      message.unlikes = message.unlikes ? message.unlikes - 1 : 0
    } else {
      if (message.userFeeling === 1) {
        message.likes = message.likes ? message.likes - 1 : 0
      }

      message.userFeeling = -1
      message.unlikes = message.unlikes ? message.unlikes + 1 : 1
    }
    this.setState({message}, () => {
      this.updateUserFeeling()
    })
  }

  updateUserFeeling () {
    const { message } = this.state
    const { uid } = this.props

    console.log({state: message.userFeeling, uid, message_id: message.id})
    if (message.userFeeling === undefined) {
      return
    }

    if (message.userFeeling === null) {
      firebase
      .firestore()
      .collection('feelings')
      .doc(message.id + ':' + uid)
      .delete()
    } else {
      firebase
      .firestore()
      .collection('feelings')
      .doc(message.id + ':' + uid)
      .set({state: message.userFeeling, uid, message_id: message.id, timestamp: firebase.firestore.FieldValue.serverTimestamp()})
    }
  }

  render () {
    const { message } = this.state
    return (
      <div className='MessageContainer'>
        <div className='Metadata'>
          <div className='Location'>{message.city}, {message.country}</div>
          <div className='Date'><TimeAgo date={message.timestamp.toDate()}/></div>
        </div>
    
        <div className='Message'>{message.message}</div>
        
        <div className='Likes'>
          <div className='LikeCount'>{message.likes ? message.likes : 0}</div>
          <div className='LikeButton'
            onClick={() => this.toogleLike()}>
            <img 
              src={message.userFeeling === 1 ? thumb_up_filled : thumb_up_outlined} 
              alt={message.userFeeling === 1 ? 'thumb_up_filled' : 'thumb_up_outlined'}/>
          </div>
          <div className='LikeCount'>{message.unlikes ? message.unlikes : 0}</div>
          <div className='LikeButton'
            onClick={() => this.toogleUnlike()}>
            <img 
              src={message.userFeeling === -1 ? thumb_down_filled : thumb_down_outlined} 
              alt={message.userFeeling === -1 ? 'thumb_down_filled' : 'thumb_down_outlined'}/>
          </div>
        </div>
      </div>
    )
  }
}
export default Message