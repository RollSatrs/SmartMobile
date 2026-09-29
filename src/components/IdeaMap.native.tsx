import { useRef, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { Pressable, StyleSheet, View } from "react-native"
import MapView, { Marker, type MapPressEvent } from "react-native-maps"
import { ActivityIndicator } from "react-native-paper"

import { colors } from "../theme"
import type { IdeaMapProps } from "./IdeaMap.types"

const SEMEY_REGION = {
  latitude: 50.4111,
  longitude: 80.2275,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
}

export function IdeaMap({ value, onChange, onError }: IdeaMapProps) {
  const mapRef = useRef<MapView>(null)
  const [isLocating, setIsLocating] = useState(false)

  const handleMapPress = (event: MapPressEvent) => {
    onChange(event.nativeEvent.coordinate)
  }

  const useCurrentLocation = async () => {
    setIsLocating(true)
    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) {
        onError("Доступ к геолокации не предоставлен. Поставьте точку вручную.")
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
      onChange(coordinates)
      mapRef.current?.animateToRegion(
        { ...coordinates, latitudeDelta: 0.025, longitudeDelta: 0.025 },
        450,
      )
    } catch {
      onError("Не удалось определить местоположение. Поставьте точку вручную.")
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={SEMEY_REGION}
        onPress={handleMapPress}
      >
        {value ? (
          <Marker
            coordinate={value}
            draggable
            pinColor={colors.primary}
            onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Использовать текущее местоположение"
        onPress={useCurrentLocation}
        style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
      >
        {isLocating ? (
          <ActivityIndicator size={22} color={colors.primary} />
        ) : (
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.primary} />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { height: 300, borderRadius: 20, overflow: "hidden" },
  map: { width: "100%", height: "100%" },
  locationButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#17332E",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  pressed: { opacity: 0.75 },
})
