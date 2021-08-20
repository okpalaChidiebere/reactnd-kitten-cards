import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  Dimensions
} from 'react-native';
const { height } = Dimensions.get("window")

const intitalState = [
  {
      image: "https://d17h27t6h515a5.cloudfront.net/topher/2017/March/58c5be60_ebooks/ebooks.jpg",
      id: 1,
      text: "Sweet Cat",
    },
    {
      image: "https://d17h27t6h515a5.cloudfront.net/topher/2017/March/58c5be62_japanesefairytales/japanesefairytales.jpg",
      id: 2,
      text: "Sweeter Cat",
    },
    {
      image: "https://d17h27t6h515a5.cloudfront.net/topher/2017/March/58c5be62_scarlet-plague/scarlet-plague.jpg",
      id: 3,
      text: "Sweetest Cat",
    },
    {
      image: "https://d17h27t6h515a5.cloudfront.net/topher/2017/March/58c5be65_sonofthewolf/sonofthewolf.jpg",
      id: 4,
      text: "Aww",
    },
]

const SWIPE_THRESHOLD = 120

export default function App() {
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.top}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
