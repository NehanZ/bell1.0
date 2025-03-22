import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header.js";
import Footer from "./Footer.js";
import RNPickerSelect from "react-native-picker-select";

const CreateTimeTable = ({ navigation }) => {
    const [days, setDays] = useState("MON - FRI");
    const [time, setTime] = useState("P1 8.00-8.30");
    const [tone, setTone] = useState("TONE 1");
    const [duration, setDuration] = useState("30s");

    const daysOptions = [
        { label: "MON - FRI", value: "MON - FRI" },
        { label: "SAT - SUN", value: "SAT - SUN" },
        { label: "MON - SAT", value: "MON - SAT" },
    ];

    const timeOptions = [
        { label: "P1 8.00-8.30", value: "P1 8.00-8.30" },
        { label: "P2 9.00-9.30", value: "P2 9.00-9.30" },
        { label: "P3 10.00-10.30", value: "P3 10.00-10.30" },
    ];

    const toneOptions = [
        { label: "TONE 1", value: "TONE 1" },
        { label: "TONE 2", value: "TONE 2" },
        { label: "TONE 3", value: "TONE 3" },
    ];

    const durationOptions = [
        { label: "30s", value: "30s" },
        { label: "60s", value: "60s" },
        { label: "90s", value: "90s" },
    ];

    const saveNewTimeTable = async () => {
        try {
            const newTimeTable = {
                days,
                time,
                tone,
                duration,
            };

            const savedTimeTables = await AsyncStorage.getItem("timeTables");
            let timeTables = savedTimeTables ? JSON.parse(savedTimeTables) : [];

            timeTables.push(newTimeTable);

            await AsyncStorage.setItem("timeTables", JSON.stringify(timeTables));

            navigation.goBack(); // Navigate back to the previous screen (Home screen)
        } catch (error) {
            console.error("Error saving new timetable:", error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header screenName="CreateTimeTable" />
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.label}>DAYS</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setDays(value)}
                        items={daysOptions}
                        value={days}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>TIME</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setTime(value)}
                        items={timeOptions}
                        value={time}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>TONE</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setTone(value)}
                        items={toneOptions}
                        value={tone}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>DURATION</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setDuration(value)}
                        items={durationOptions}
                        value={duration}
                        style={pickerSelectStyles}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                            console.log("Delete button pressed");
                            // Add delete functionality here if needed
                        }}
                    >
                        <Text style={styles.buttonText}>DELETE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveNewTimeTable}>
                        <Text style={styles.buttonText}>SAVE NEW TIMETABLE</Text>
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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    deleteButton: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 6,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 6,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CreateTimeTable;
