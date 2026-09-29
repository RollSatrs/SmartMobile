import { StyleSheet, View } from "react-native"
import MapView, { Marker } from "react-native-maps"

import { colors } from "../theme"

type Props = {
  latitude: number
  longitude: number
}

export function IdeaLocationMap({ latitude, longitude }: Props) {
  return (
    <View style={styles.wrapper}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        pointerEvents="none"
      >
        <Marker coordinate={{ latitude, longitude }} pinColor={colors.primary} />
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: 170,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
})
