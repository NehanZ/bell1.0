import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header";
import Footer from "./Footer";
import RNPickerSelect from "react-native-picker-select";

const CreateTimeTable = ({ navigation }) => {
    const [days, setDays] = useState([]);
    const [startTime, setStartTime] = useState("8.00");
    const [periodDurations, setPeriodDurations] = useState(["30"]);
    const [tone, setTone] = useState("TONE1");
    const [duration, setDuration] = useState("30s");

    const daysOptions = [
        { label: "Monday", value: 1 },
        { label: "Tuesday", value: 2 },
        { label: "Wednesday", value: 3 },
        { label: "Thursday", value: 4 },
        { label: "Friday", value: 5 },
        { label: "Saturday", value: 6 },
        { label: "Sunday", value: 0 }
    ];

    const toneOptions = [
        { label: "TONE 1", value: "TONE1" },
        { label: "TONE 2", value: "TONE2" },
        { label: "TONE 3", value: "TONE3" },
    ];

    const durationOptions = [
        { label: "30s", value: "30s" },
        { label: "60s", value: "60s" },
        { label: "90s", value: "90s" },
    ];

    const addPeriod = () => {
        setPeriodDurations([...periodDurations, "30"]);
    };

    const removePeriod = (index) => {
        const newDurations = [...periodDurations];
        newDurations.splice(index, 1);
        setPeriodDurations(newDurations);
    };

    const handleDurationChange = (index, value) => {
        const newDurations = [...periodDurations];
        newDurations[index] = value;
        setPeriodDurations(newDurations);
    };

    const calculateSchedule = () => {
        const [startHour, startMinute] = startTime.split('.').map(Number);
        let currentHour = startHour;
        let currentMinute = startMinute || 0;
        const schedule = [];

        periodDurations.forEach((dur, index) => {
            const duration = parseInt(dur) || 30;
            const startTime = new Date();
            startTime.setHours(currentHour, currentMinute, 0, 0);

            // Calculate end time
            currentMinute += duration;
            while (currentMinute >= 60) {
                currentHour += 1;
                currentMinute -= 60;
            }

            const endTime = new Date();
            endTime.setHours(currentHour, currentMinute, 0, 0);

            schedule.push({
                name: index === 0 ? "Morning Bell" : 
                      index === periodDurations.length - 1 ? "Dismissal" : 
                      `Period ${index}`,
                start: `${startTime.getHours()}.${startTime.getMinutes().toString().padStart(2, '0')}`,
                end: `${endTime.getHours()}.${endTime.getMinutes().toString().padStart(2, '0')}`,
                duration: duration * 60
            });
        });

        return schedule;
    };

    const saveNewTimeTable = async () => {
        try {
            if (days.length === 0) {
                Alert.alert("Error", "Please select at least one day");
                return;
            }

            const schedule = calculateSchedule();
            const newTimeTable = {
                days,
                schedule,
                tone,
                duration
            };

            const savedTimeTables = await AsyncStorage.getItem("timeTables");
            let timeTables = savedTimeTables ? JSON.parse(savedTimeTables) : [];
            timeTables.push(newTimeTable);
            await AsyncStorage.setItem("timeTables", JSON.stringify(timeTables));
            
            navigation.goBack();
        } catch (error) {
            console.error("Error saving new timetable:", error);
            Alert.alert("Error", "Failed to save timetable. Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header screenName="Create Time Table" />
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.label}>DAYS</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setDays(value)}
                        items={daysOptions}
                        value={days}
                        style={pickerSelectStyles}
                        placeholder={{ label: "Select days...", value: null }}
                        multiple={true}
                    />
                </View>

                <View style={styles.timebox}>
                    <View style={styles.row}>
                        <Text style={styles.label}>START TIME</Text>
                        <TextInput
                            style={styles.timeInput}
                            value={startTime}
                            placeholder="8.00"
                            onChangeText={setStartTime}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>PERIOD DURATIONS (minutes)</Text>
                    {periodDurations.map((duration, index) => (
                        <View key={index} style={styles.durationRow}>
                            <Text style={styles.durationLabel}>Period {index + 1}:</Text>
                            <TextInput
                                style={styles.durationInput}
                                value={duration}
                                keyboardType="numeric"
                                onChangeText={(value) => handleDurationChange(index, value)}
                            />
                            {periodDurations.length > 1 && (
                                <TouchableOpacity onPress={() => removePeriod(index)}>
                                    <Text style={styles.deleteText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={addPeriod}>
                        <Text style={styles.buttonText}>+ ADD PERIOD</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>TONE</Text>
                    <RNPickerSelect
                        onValueChange={setTone}
                        items={toneOptions}
                        value={tone}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>DURATION</Text>
                    <RNPickerSelect
                        onValueChange={setDuration}
                        items={durationOptions}
                        value={duration}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={saveNewTimeTable}>
                        <Text style={styles.buttonText}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Footer />
        </SafeAreaView>
    );
};

const pickerSelectStyles = StyleSheet.create({
    inputAndroid: {
        backgroundColor: "#C4C4C4",
        borderRadius: 6,
        minWidth: 200,
        textAlign: "center",
    },
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "#4CA7A5",
        padding: 10,
        borderRadius: 8,
    },
    label: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    timeInput: {
        backgroundColor: "#C4C4C4",
        borderRadius: 6,
        width: 100,
        textAlign: "center",
        padding: 8,
    },
    timebox: {
        backgroundColor: "#becccc",
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 10,
        color: "#333",
    },
    durationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        padding: 8,
        backgroundColor: "#e6e6e6",
        borderRadius: 6,
    },
    durationLabel: {
        flex: 1,
        fontSize: 14,
    },
    durationInput: {
        backgroundColor: "#fff",
        borderRadius: 4,
        width: 60,
        textAlign: "center",
        padding: 6,
        marginRight: 10,
    },
    deleteText: {
        color: "red",
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: "#167573",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 10,
    },
    buttonContainer: {
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: "green",
        padding: 12,
        borderRadius: 6,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CreateTimeTable;