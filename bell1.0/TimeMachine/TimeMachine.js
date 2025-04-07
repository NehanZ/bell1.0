import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

export default function TimeMachine({ schedule = [], selectedMusic, days = [] }) {
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [sound, setSound] = useState(null);

    useEffect(() => {
        if (timerRunning && currentPeriod) {
            const timer = setTimeout(async () => {
                await handlePeriodEnd();
            }, currentPeriod.duration * 1000);

            return () => clearTimeout(timer);
        }
    }, [timerRunning, currentPeriod]);

    const startTimer = () => {
        const today = new Date().getDay();
        if (!days.includes(today)) {
            Alert.alert('Timer not scheduled for today');
            return;
        }

        if (schedule && schedule.length > 0) {
            setCurrentPeriod(schedule[0]);
            setTimerRunning(true);
        } else {
            Alert.alert('No periods scheduled');
        }
    };

    const handlePeriodEnd = async () => {
        if (selectedMusic) {
            try {
                const { sound } = await Audio.Sound.createAsync(selectedMusic);
                setSound(sound);
                await sound.playAsync();
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        } else {
            console.warn('No music selected');
        }

        if (currentPeriod) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Time Period Ended',
                    body: `The period "${currentPeriod.name}" has ended.`,
                    data: { period: currentPeriod },
                },
                trigger: null,
            });
        }

        const nextIndex = schedule.indexOf(currentPeriod) + 1;
        if (nextIndex < schedule.length) {
            setCurrentPeriod(schedule[nextIndex]);
        } else {
            setTimerRunning(false);
            Alert.alert('All periods completed for today');
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    return (
        <View style={{ padding: 20 }}>
            <Text>Time Machine</Text>
            {currentPeriod ? (
                <Text>
                    Current Period: {currentPeriod.name} - {currentPeriod.duration} seconds
                </Text>
            ) : (
                <Text>No period is currently running</Text>
            )}
        </View>
    );
}