import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler } from "react-native-gesture-handler"
import Animated, { 
  useSharedValue,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
  useAnimatedStyle,
  withSpring,
  withDecay,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import { clamp } from "react-native-redash"

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

const CardView = ({ 
  isLastItem, 
  cardStyle, 
  imageStyle, 
  item, 
  translateX, 
  translateY, 
  nextCardStyle, 
  transitionNext, 
  animatedNopeStyle, 
  animatedYupStyle, 
}) => {

  const cardGestureHandler = useAnimatedGestureHandler({
    onStart(_, context){
      context.translateX = translateX.value
      context.translateY = translateY.value
    },
    onActive(event, context){
      translateX.value = event.translationX + context.translateX
      translateY.value = event.translationY + context.translateY
    },
    onEnd({ velocityX, velocityY, translationX }){
      let velocity
      //we check for the velocity to help us do a decay animation for a card when its being swiped away either to the left or right
      /**
       * NOTE: using clamps helps us to define a velocity that will not throw the card away off the page. If we do not do this,
       * the card wil be thrown away off the screen because there is no clamp. 
       * But we want to clamp the velocityX between two points (3 and 5) so the card will not be throw off screen completely as we decay the clampValue.
       * 
       * We now achieved the illusion of decaying the card velocity as its being the card is being swiped off screen
       */
      if(velocityX >= 0){ //decay right
        velocity = clamp(velocityX, 3, 5)
      } else if(velocityX < 0){ //we are going in a negative direction(decay left)
        velocity = clamp(Math.abs(velocityX), 3, 5) * -1 //we multiplied by -1 so that we get a negative value
      }

      /**
       * check for how far the card has been dragged in either negative or positive direction
       * Math.abs() helps gives us the absolute value direction so that we can easily
       * compare our set threshold
       */
      if(Math.abs(translationX) > SWIPE_THRESHOLD){
        //we throw the card away
        translateX.value = withDecay({
          velocity: velocity,
          deceleration: .98,
        }, transitionNext)
        translateY.value = withDecay({
          velocity: velocityY,
          deceleration: .98,
        })
      }else{
        //we spring back to the middle
        //SIDE NOTE: this is how you run animations in parallel with reanimated2 :)
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    }
  })

  return (
    isLastItem
    ? (
      <Animated.View style={[styles.card, nextCardStyle]}>
        <Animated.Image 
          source={{uri: item.image}}
          style={[styles.image]}
          resizeMode="cover"
        />
        <View style={styles.lowerText}>
            <Text>{item.text}</Text>
        </View>
      </Animated.View>
    )
    : (
      <PanGestureHandler onGestureEvent={cardGestureHandler}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.Image 
            source={{uri: item.image}}
            style={[styles.image, imageStyle]}
            resizeMode="cover"
          />
          <View style={styles.lowerText}>
              <Text>{item.text}</Text>
          </View>

          {/** `yup` text */}
          <Animated.View style={[styles.nope, animatedNopeStyle]}>
              <Text style={styles.nopeText}>Nope!</Text>
          </Animated.View>

          {/** `nope` text */}
          <Animated.View style={[styles.yup, animatedYupStyle]}>
              <Text style={styles.yupText}>Yup!</Text>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    )
  )
}

export default function App() {
  const [items, setItems] = React.useState(intitalState)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const cardOpacity = useSharedValue(1) //will drive fading out all of the card item itself
  const nextCardScale = useSharedValue(.9) //this for the next card. we want it to appear small when there is still a card in front of it

  const animatedCardStyles = useAnimatedStyle(() => {
    const rotateInterpolate = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-30, 0, 30],
      Extrapolate.CLAMP
    )

    return {
      opacity: cardOpacity.value,
      transform: [
        { rotate: `${rotateInterpolate}deg` },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }
  })

  const animatedImageStyles = useAnimatedStyle(() => {
    //we want to fade the cardImage to be able to display the `yup` or `nope` text
    const opacity = interpolate(
      translateX.value,
      [-200, 0, 200],
      [.5, 1, .5],
      Extrapolate.CLAMP
    )
    return {
      opacity
    }
  })

  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: nextCardScale.value }
      ]
    }
  })

  const animatedNopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-150, 0],
      [1, 0],
      Extrapolate.CLAMP
    )

    const scale = interpolate(
      translateX.value,
      [-150, 0],
      [1, 0.5],
      Extrapolate.CLAMP
    )

    return {
      opacity,
      transform: [
        { scale },
        { rotate: "30deg" }
      ]
    }
  })

  const animatedYupStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 150],
      [0, 1],
      Extrapolate.CLAMP
    )

    const scale = interpolate(
      translateX.value,
      [0, 150],
      [0.5, 1],
      Extrapolate.CLAMP
    )

    return {
      opacity,
      transform: [
        { scale },
        { rotate: "-30deg" }
      ]
    }
  })

  const updateFlatlist = () => {
    setItems(currState => currState.slice(1))

    /**
     * reset our animations
     * 
     * when you run code on js, its always asynchronous. So it makes to rest the 
     * animation here and not in the AnimatedCallback itself
     */
    translateX.value = 0
    translateY.value = 0
    cardOpacity.value = 1
    nextCardScale.value = .9
  }

  const handleTransitionNext = () => {
    "worklet"

    cardOpacity.value = withTiming(0, { duration: 300 }) //fade the current card out
    nextCardScale.value = withSpring(1, {}, () => { //scale the next card in
      runOnJS(updateFlatlist)()
    })
  }

  const handleNo = () => {
    /**
     * Remember that before this button was pressed, translateX was a zero position, the means the 
     * user dont want to swipe and prefers to use the buttons. So we simulate or trigger the swipe 
     * ourself by increasing translateX to the just to the SWIPE_THRESHOLD. The code for the onGestureEvent
     * in the PanGuestureHandler will still run because the card is moving!
     *  */
    translateX.value = withTiming(-SWIPE_THRESHOLD, {}, handleTransitionNext)
  }

  const handleYes = () => {
    translateX.value = withTiming(SWIPE_THRESHOLD, {}, handleTransitionNext)
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.top}>
        {/** we only render two images at a time */}
        <FlatList 
          data={items.slice(0, 2)}
          extraData={items}
          horizontal
          CellRendererComponent={({ item, index, children, style, ...props }) => {
            const newStyle = [
              style,
              { zIndex: 2 - index }
            ]
            return (
              <View style={newStyle} index={index} {...props}>
                {children}
              </View>
            )
          }}
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            padding: 20,
          }}
          scrollEnabled={false}
          removeClippedSubviews={false} /**not necessary */
          keyExtractor={(item, _) => String(item.id)}
          renderItem={({ item, index }) => {

            const isLastItem = index === 2 - 1
            //const isSecondToLast = index === 2 - 2
            return (
              <CardView 
                key={item.id} 
                item={item}
                isLastItem={isLastItem}
                translateX={translateX}
                translateY={translateY}
                cardStyle={animatedCardStyles}
                imageStyle={animatedImageStyles}
                nextCardStyle={nextCardAnimatedStyle}
                animatedNopeStyle={animatedNopeStyle}
                animatedYupStyle={animatedYupStyle}
                transitionNext={handleTransitionNext}
              />
            )
          }}
        />
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleNo}
          style={[styles.button, styles.nopeButton]}
        >
          <Text style={styles.nopeText}>NO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleYes}
          style={[styles.button, styles.yupButton]}
        >
          <Text style={styles.yupText}>YES</Text>
        </TouchableOpacity>
      </View>

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
  card: {
    width: 300,
    height: 300,
    left: -300 / 2,
    top: 300,
    position: "absolute",
    borderRadius: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { x: 0, y: 0 },
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  lowerText: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 5,
  },
  image: {
    width: null, //null means we an apply a flex property to the view to ahere to fhe flex height
    height: null, //null means we an apply a flex property to the view to ahere to fhe flex width
    borderRadius: 2,
    flex: 3,
  },
  bottomBar: {
    flexDirection:"row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  button: {
    marginHorizontal: 10,
    padding: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.3,
    shadowOffset: { x: 0, y: 0 },
    shadowRadius: 5,
    elevation: 5,
  },
  yupButton: {
    shadowColor: "green",
  },
  nopeButton: {
    shadowColor: "red",
  },
  yup: {
    borderColor: "green",
    borderWidth: 2,
    position: "absolute",
    padding: 20,
    borderRadius: 5,
    top: 20, 
    left: 20, //we want the yup text to appear on the left as you swipe the card to the right
    backgroundColor: "#FFF",
  },
  yupText: {
    fontSize: 16,
    color: "green",
  },
  nope: {
    borderColor: "red",
    borderWidth: 2,
    position: "absolute",
    padding: 20,
    borderRadius: 5,
    right: 20, //we want the yup text to appear on the right as you swipe the card to the left
    top: 20,
    backgroundColor: "#FFF",
  },
  nopeText: {
    fontSize: 16,
    color: "red",
  },
});
