import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

interface FlameParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

export default function StreakCelebration() {
  const { showStreakCelebration, setShowStreakCelebration, streak, colors } = useApp();
  const [canDismiss, setCanDismiss] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const [particles, setParticles] = useState<FlameParticle[]>([]);

  useEffect(() => {
    if (showStreakCelebration) {
      setCanDismiss(false);
      
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Flame pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create flame particles
      createParticles();

      // Allow dismiss after 2 seconds
      const timer = setTimeout(() => {
        setCanDismiss(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
    }
  }, [showStreakCelebration]);

  const createParticles = () => {
    const newParticles: FlameParticle[] = [];
    
    for (let i = 0; i < 12; i++) {
      const particle: FlameParticle = {
        id: i,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(0),
      };
      newParticles.push(particle);
      
      // Animate each particle
      const delay = i * 150;
      const duration = 2000 + Math.random() * 1000;
      const xOffset = (Math.random() - 0.5) * 100;
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: -150 - Math.random() * 100,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: xOffset,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0.3,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: (Math.random() - 0.5) * 2,
            duration,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    }
    
    setParticles(newParticles);
  };

  const handleDismiss = () => {
    if (!canDismiss) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowStreakCelebration(false);
    });
  };

  if (!showStreakCelebration) return null;

  const getStreakMessage = () => {
    if (streak.current >= 365) return "A FULL YEAR! 👑";
    if (streak.current >= 180) return "HALF YEAR HERO! 🎖️";
    if (streak.current >= 100) return "CENTURY STREAK! 💯";
    if (streak.current >= 30) return "MONTHLY MASTER! ⭐";
    if (streak.current >= 14) return "TWO WEEKS STRONG! 🏆";
    if (streak.current >= 7) return "WEEK WARRIOR! 🔥";
    return "STREAK EXTENDED! 🔥";
  };

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { 
          opacity: fadeAnim,
          backgroundColor: 'rgba(0,0,0,0.85)',
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.touchArea} 
        activeOpacity={1}
        onPress={handleDismiss}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Glow effect */}
          <Animated.View 
            style={[
              styles.glow,
              {
                opacity: glowAnim,
                transform: [{ scale: flameScale }],
              }
            ]} 
          />
          
          {/* Flame particles */}
          <View style={styles.particleContainer}>
            {particles.map((particle) => (
              <Animated.Text
                key={particle.id}
                style={[
                  styles.particle,
                  {
                    opacity: particle.opacity,
                    transform: [
                      { translateX: particle.x },
                      { translateY: particle.y },
                      { scale: particle.scale },
                      { rotate: particle.rotation.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ['-30deg', '30deg'],
                      })},
                    ],
                  },
                ]}
              >
                🔥
              </Animated.Text>
            ))}
          </View>

          {/* Main flame */}
          <Animated.Text 
            style={[
              styles.flameEmoji,
              {
                transform: [{ scale: flameScale }],
              }
            ]}
          >
            🔥
          </Animated.Text>

          {/* Streak count */}
          <Text style={styles.streakCount}>{streak.current}</Text>
          <Text style={styles.streakLabel}>DAY STREAK</Text>
          
          {/* Message */}
          <Text style={styles.message}>{getStreakMessage()}</Text>

          {/* Dismiss hint */}
          <Animated.Text 
            style={[
              styles.dismissHint,
              { opacity: canDismiss ? 1 : 0.3 }
            ]}
          >
            {canDismiss ? 'Tap anywhere to continue' : 'Keep it up!'}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ff6b35',
    opacity: 0.3,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  particleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 28,
  },
  flameEmoji: {
    fontSize: 100,
    marginBottom: 10,
  },
  streakCount: {
    fontSize: 72,
    fontFamily: 'Satoshi-Black',
    color: '#ffffff',
    textShadowColor: '#ff6b35',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  streakLabel: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#ff9500',
    letterSpacing: 4,
    marginTop: -5,
  },
  message: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  dismissHint: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#ffffff',
    marginTop: 40,
  },
});