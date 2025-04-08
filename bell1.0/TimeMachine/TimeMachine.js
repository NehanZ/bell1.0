import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

export default function TimeMachine({ route, navigation }) {
    const { schedule = [], selectedMusic, days = [] } = route.params || {};
    
    const [sound, setSound] = useState(null);
    const [activeTimeTable, setActiveTimeTable] = useState(true);
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [nextPeriod, setNextPeriod] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeUntilNextBell, setTimeUntilNextBell] = useState(null);
    const [formattedSchedule, setFormattedSchedule] = useState([]);
    const [isBellRinging, setIsBellRinging] = useState(false);
    const [bellRingTimeout, setBellRingTimeout] = useState(null);

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
        Notifications.requestPermissionsAsync();
    }, []);

    useEffect(() => {
        if (!schedule || schedule.length === 0) return;

        const today = new Date();
        const formattedPeriods = schedule.map((period) => {
            const [startHour, startMinute] = period.start.split('.').map(Number);
            const [endHour, endMinute] = period.end.split('.').map(Number);
            
            const startTime = new Date(today);
            startTime.setHours(startHour, startMinute || 0, 0, 0);
            
            const endTime = new Date(today);
            endTime.setHours(endHour, endMinute || 0, 0, 0);

            return {
                name: period.name,
                startTime,
                endTime,
                duration: period.duration
            };
        });

        setFormattedSchedule(formattedPeriods.sort((a, b) => a.startTime - b.startTime));
    }, [schedule]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            if (activeTimeTable) checkSchedule(now);
        }, 1000);

        return () => clearInterval(interval);
    }, [formattedSchedule, activeTimeTable, isBellRinging]);

    useEffect(() => {
        if (!days || days.length === 0) return;
        
        const today = new Date().getDay();
        if (!days.includes(today)) {
            setActiveTimeTable(false);
            Alert.alert(
                'Not Scheduled Today', 
                'This timetable is not scheduled to run today.',
                [
                    { text: 'Run Anyway', onPress: () => setActiveTimeTable(true) },
                    { text: 'Cancel', onPress: () => navigation.goBack() }
                ]
            );
        }
    }, [days]);

    const checkSchedule = (now) => {
        if (!formattedSchedule || formattedSchedule.length === 0) return;
        
        let current = null;
        let next = null;
        const compareNow = new Date(now);

        for (let i = 0; i < formattedSchedule.length; i++) {
            const period = formattedSchedule[i];
            
            if (compareNow >= period.startTime && compareNow < period.endTime) {
                current = period;
                if (i < formattedSchedule.length - 1) next = formattedSchedule[i + 1];
                break;
            }
            
            if (!current && compareNow < period.startTime) {
                next = period;
                break;
            }
        }

        setCurrentPeriod(current);
        setNextPeriod(next);
        
        if (current) {
            setTimeUntilNextBell(Math.floor((current.endTime - compareNow) / 1000));
        } else if (next) {
            setTimeUntilNextBell(Math.floor((next.startTime - compareNow) / 1000));
        } else {
            setTimeUntilNextBell(null);
        }

        if (!isBellRinging) checkBellTriggers(now);
    };

    const checkBellTriggers = (now) => {
        if (!formattedSchedule || formattedSchedule.length === 0 || isBellRinging) return;

        const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        for (const period of formattedSchedule) {
            const startTime = period.startTime.getHours() * 3600 + 
                            period.startTime.getMinutes() * 60;
            const endTime = period.endTime.getHours() * 3600 + 
                          period.endTime.getMinutes() * 60;

            if (nowTime === startTime) {
                ringBellForDuration(`${period.name} Started`, period.duration);
                break;
            }
            
            if (nowTime === endTime) {
                ringBellForDuration(`${period.name} Ended`, period.duration);
                break;
            }
        }
    };

    const ringBellForDuration = async (title, durationSec) => {
        if (isBellRinging) return;
        setIsBellRinging(true);
        playBell();
        showNotification(title, `Bell ringing for ${durationSec} seconds`);

        const timeout = setTimeout(() => {
            stopBell();
            setIsBellRinging(false);
        }, durationSec * 1000);

        setBellRingTimeout(timeout);
    };

    const stopBell = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
            } catch (error) {
                console.error('Error stopping sound:', error);
            }
        }
        if (bellRingTimeout) {
            clearTimeout(bellRingTimeout);
            setBellRingTimeout(null);
        }
        setIsBellRinging(false);
    };

    const playBell = async () => {
        try {
            let soundFile;
            switch(selectedMusic || 'TONE1') {
                case 'TONE1': soundFile = require('../assets/Tones/Tone1.mp3'); break;
                case 'TONE2': soundFile = require('../assets/Tones/Tone2.mp3'); break;
                case 'TONE3': soundFile = require('../assets/Tones/Tone3.mp3'); break;
                default: soundFile = require('../assets/Tones/Tone1.mp3');
            }

            if (sound) await sound.unloadAsync();
            const { sound: newSound } = await Audio.Sound.createAsync(
                soundFile,
                { shouldPlay: true, isLooping: true }
            );
            setSound(newSound);
        } catch (error) {
            console.error('Error playing sound:', error);
            setIsBellRinging(false);
        }
    };

    const showNotification = async (title, body) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: { title, body },
                trigger: null,
            });
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return "--:--:--";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDateTime = (date) => {
        if (!date) return "--:--";
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const toggleTimeTable = () => {
        if (isBellRinging) stopBell();
        setActiveTimeTable(prev => !prev);
    };

    const ringBellManually = () => {
        ringBellForDuration('Manual Bell', 30);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>School Bell System</Text>
            
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Status: {activeTimeTable ? (isBellRinging ? 'Bell Ringing' : 'Active') : 'Inactive'}
                </Text>
                <Text style={styles.currentTimeText}>
                    Current Time: {currentTime.toLocaleTimeString()}
                </Text>
            </View>
            
            <View style={styles.periodInfoContainer}>
                <View style={styles.periodBox}>
                    <Text style={styles.periodLabel}>Current Period</Text>
                    <Text style={styles.periodName}>
                        {currentPeriod ? currentPeriod.name : 'None'}
                    </Text>
                    {currentPeriod && (
                        <Text style={styles.periodTime}>
                            {formatDateTime(currentPeriod.startTime)} - {formatDateTime(currentPeriod.endTime)}
                        </Text>
                    )}
                </View>
                
                <View style={styles.periodBox}>
                    <Text style={styles.periodLabel}>Next Period</Text>
                    <Text style={styles.periodName}>
                        {nextPeriod ? nextPeriod.name : 'None'}
                    </Text>
                    {nextPeriod && (
                        <Text style={styles.periodTime}>
                            {formatDateTime(nextPeriod.startTime)} - {formatDateTime(nextPeriod.endTime)}
                        </Text>
                    )}
                </View>
            </View>
            
            <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>Time Until Next Bell</Text>
                <Text style={styles.countdownTime}>
                    {timeUntilNextBell !== null ? formatTime(timeUntilNextBell) : '--:--:--'}
                </Text>
            </View>
            
            <View style={styles.controlsContainer}>
                <TouchableOpacity 
                    style={[styles.button, activeTimeTable ? styles.stopButton : styles.startButton]} 
                    onPress={toggleTimeTable}
                >
                    <Text style={styles.buttonText}>
                        {activeTimeTable ? 'Pause Timetable' : 'Activate Timetable'}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, isBellRinging ? styles.stopRingButton : styles.ringButton]} 
                    onPress={isBellRinging ? stopBell : ringBellManually}
                >
                    <Text style={styles.buttonText}>
                        {isBellRinging ? 'Stop Bell' : 'Ring Bell Now'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scheduleContainer}>
                <Text style={styles.scheduleTitle}>Today's Schedule</Text>
                {formattedSchedule.length > 0 ? (
                    formattedSchedule.map((period, index) => {
                        const now = new Date();
                        const isPeriodCurrent = now >= period.startTime && now < period.endTime;
                        
                        return (
                            <View key={index} style={[
                                styles.schedulePeriod,
                                isPeriodCurrent && styles.currentSchedulePeriod
                            ]}>
                                <Text style={styles.schedulePeriodName}>{period.name}</Text>
                                <Text style={styles.schedulePeriodTime}>
                                    {formatDateTime(period.startTime)} - {formatDateTime(period.endTime)}
                                </Text>
                                <Text style={styles.schedulePeriodDuration}>
                                    Duration: {period.duration / 60} mins
                                </Text>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.noScheduleText}>No periods scheduled for today</Text>
                )}
            </ScrollView>
            
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                    if (isBellRinging) stopBell();
                    navigation.goBack();
                }}
            >
                <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#167573',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
    },
    currentTimeText: {
        fontSize: 16,
    },
    periodInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    periodBox: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        width: '48%',
        elevation: 2,
    },
    periodLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    periodName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    periodTime: {
        fontSize: 14,
        color: '#444',
    },
    countdownContainer: {
        backgroundColor: '#4CA7A5',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
    },
    countdownLabel: {
        fontSize: 16,
        color: 'white',
        marginBottom: 5,
    },
    countdownTime: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        width: '48%',
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    stopButton: {
        backgroundColor: '#FF9800',
    },
    ringButton: {
        backgroundColor: '#2196F3',
    },
    stopRingButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    scheduleContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 60,
        flex: 1,
        elevation: 2,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    schedulePeriod: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    currentSchedulePeriod: {
        backgroundColor: '#e6f7ff',
        borderLeftWidth: 4,
        borderLeftColor: '#4CA7A5',
    },
    schedulePeriodName: {
        fontSize: 16,
        fontWeight: '500',
    },
    schedulePeriodTime: {
        fontSize: 14,
        color: '#666',
    },
    schedulePeriodDuration: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    noScheduleText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
    },
    backButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: '#167573',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 3,
    },
    backButtonText: {
        color: 'white',
        fontWeight: '500',
    }
});