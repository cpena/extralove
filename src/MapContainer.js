import React, { Component } from 'react'
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';
import MapMarker from './images/marcador-map.svg'

class MapContainer extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.markers === nextProps.markers) {
      return false;
    } else {
      return true;
    }
  }

  render () {

    const mapStyles = [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}];
    const iconImg = {
      url: MapMarker,
      scaledSize: { width: 40, height: 50 }
    }
    const center = {
      lat: 6.5,
      lng: -23.0
    }
    const zoom = 2
    return (  
      <div>
        <Map google={this.props.google} 
          zoom={zoom}
          initialCenter={center}
          disableDefaultUI={false}
          styles={mapStyles}>
          {this.props.markers.map(m => {

            return <Marker
              key={m.id}
              position={{ lat: m.lat + Math.random() * 5, lng: m.lng + Math.random() * 5 }}
              icon={iconImg}
              animation={this.props.google.maps.Animation.BOUNCE}
            />
          })
          }
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
 apiKey: ('AIzaSyD5zH02J4e_3_yLAUa01_Ulo3RZ2sVw1ho')
})(MapContainer);