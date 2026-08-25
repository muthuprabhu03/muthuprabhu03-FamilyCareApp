import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { FamilyMemberLocation } from '@/services/locationSharingService';

interface LeafletMapViewProps {
  locations: FamilyMemberLocation[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress?: (location: FamilyMemberLocation) => void;
  style?: any;
}

export function LeafletMapView({
  locations,
  userLocation,
  style,
}: LeafletMapViewProps) {
  const initialLat = userLocation?.latitude || (locations.length > 0 ? locations[0].latitude : 13.0827);
  const initialLng = userLocation?.longitude || (locations.length > 0 ? locations[0].longitude : 80.2707);

  const htmlContent = useMemo(() => {
    const markersJson = JSON.stringify(
      locations.map((loc) => ({
        id: loc.familyMemberId,
        name: loc.name,
        rel: loc.relationship,
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
        updatedAt: loc.updatedAt,
      }))
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
          .custom-pin {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 4px 8px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            text-align: center;
            white-space: nowrap;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: true }).setView([${initialLat}, ${initialLng}], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          var markers = ${markersJson};
          var markerGroup = L.featureGroup();

          markers.forEach(function(m) {
            var customIcon = L.divIcon({
              className: 'custom-pin',
              html: '📍 ' + m.name,
              iconSize: [80, 26],
              iconAnchor: [40, 26]
            });

            var marker = L.marker([m.lat, m.lng], { icon: customIcon })
              .bindPopup('<b>' + m.name + '</b><br>' + m.rel + '<br><small>Updated: ' + new Date(m.updatedAt).toLocaleTimeString() + '</small>');
            
            markerGroup.addLayer(marker);
          });

          markerGroup.addTo(map);

          if (markers.length > 1) {
            map.fitBounds(markerGroup.getBounds().pad(0.1));
          }
        </script>
      </body>
      </html>
    `;
  }, [locations, initialLat, initialLng]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
});
