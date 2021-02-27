import React, { Component } from 'react'
import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react';
// import MapMarker from './images/marcador-map.svg'

const mapStyles = [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}];
    

class MapContainer extends Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.markers === nextProps.markers) {
      return false;
    } else {
      return true;
    }
  }

  onMarkerClick = (props, marker) => {
    console.log('marker clicked', props, marker)
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    }, () => {
      // Por algún motivo no actualiza automáticamente
      this.forceUpdate()
    });
  }

  onInfoWindowClose = () => {
    this.setState({
      activeMarker: null,
      showingInfoWindow: false
    })
  }
 
  onMapClicked = (props) => {
    console.log('map clicked')
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      }, () => {
        // Por algún motivo no actualiza automáticamente
        this.forceUpdate()
      })
    }
  };

  render () {
    const center = {
      lat: 11.5,
      lng: -23.0
    }
    const zoom = 3
    const { activeMarker, showingInfoWindow, selectedPlace } = this.state
    console.log({ activeMarker, showingInfoWindow, selectedPlace })
    return (  
        <Map google={this.props.google} 
          zoom={zoom}
          initialCenter={center}
          styles={mapStyles}
          onClick={(props) => this.onMapClicked(props)}>
          {this.props.markers.map(m => {
            return <Marker
                  name={m.message}
                  key={m.id}
                  position={{ lat: m.lat, lng: m.lng}}
                  // icon={iconImg}
                  onClick={(props, marker) => this.onMarkerClick(props, marker)}
                />
          })
          }
          <InfoWindow
            marker={activeMarker}
            onClose={() => this.onInfoWindowClose()}
            visible={showingInfoWindow}>
              <div>
                <h1>{selectedPlace.name}</h1>
              </div>
          </InfoWindow>
        </Map>
    );
  }
}

export default GoogleApiWrapper({
 apiKey: ('AIzaSyD5zH02J4e_3_yLAUa01_Ulo3RZ2sVw1ho'),
 version: "3.43"
})(MapContainer);