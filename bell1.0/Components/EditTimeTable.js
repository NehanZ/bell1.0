import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, TextInput } from "react-native";
import Header from "./Header.js";
import Footer from "./Footer.js";
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditTimeTable = ({ route, navigation }) => {
    const { index } = route.params;

    const [days, setDays] = useState("DAY1");
    const [timePeriods, setTimePeriods] = useState([{ start: "", end: "" }]);
    const [tone, setTone] = useState("TONE1");
    const [duration, setDuration] = useState("30s");

    const daysOptions = [
        { label: "MON - FRI", value: "DAY1" },
        { label: "SAT - SUN", value: "DAY2" },
        { label: "MON - SAT", value: "DAY3" },
    ];

    const toneOptions = [
        { label: "TONE 1", value: "TONE1" },
        { label: "TONE 2", value: "TONE2" },
        { label: "TONE 3", value: "TONE3" },
    ];

    const durationOptions = [
        { label: '30s', value: '30s' },
        { label: '60s', value: '60s' },
        { label: '90s', value: '90s' },
    ];

    const addTimePeriod = () => {
        setTimePeriods([...timePeriods, { start: "", end: "" }]);
    };

    const removeTimePeriod = (index) => {
        const newTimePeriods = timePeriods.filter((_, i) => i !== index);
        setTimePeriods(newTimePeriods);
    };

    const handleTimeChange = (index, field, value) => {
        const newTimePeriods = [...timePeriods];
        newTimePeriods[index][field] = value;
        setTimePeriods(newTimePeriods);
    };

    useEffect(() => {
        const loadTimeTable = async () => {
            const storedTimeTables = await AsyncStorage.getItem('timeTables');
            if (storedTimeTables) {
                const timeTables = JSON.parse(storedTimeTables);
                const timeTable = timeTables[index];
                if (timeTable) {
                    setDays(timeTable.days);
                    setTimePeriods(timeTable.timePeriods);
                    setTone(timeTable.tone);
                    setDuration(timeTable.duration);
                }
            }
        };
        loadTimeTable();
    }, [index]);

    const handleSave = async () => {
        const storedTimeTables = await AsyncStorage.getItem('timeTables');
        const schedule = timePeriods.map((period, index) => ({
            name: `Period ${index + 1}`,
            duration: calculateDuration(period.start, period.end),
        }));
    
        if (storedTimeTables) {
            const timeTables = JSON.parse(storedTimeTables);
            timeTables[index] = { days, schedule, tone, duration };
            await AsyncStorage.setItem('timeTables', JSON.stringify(timeTables));
            navigation.goBack();
        }
    };
    
    const handleDelete = async () => {
        const storedTimeTables = await AsyncStorage.getItem('timeTables');
        if (storedTimeTables) {
            const timeTables = JSON.parse(storedTimeTables);
            timeTables.splice(index, 1);
            await AsyncStorage.setItem('timeTables', JSON.stringify(timeTables));
            navigation.goBack();
        }
    };

    const calculateDuration = (start, end) => {
        const [startHour, startMinute] = start.split('.').map(Number);
        const [endHour, endMinute] = end.split('.').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        return (endTime - startTime) * 60;
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <Header screenName="EditTimeTable" />
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

                <View style={styles.timebox}>
                {timePeriods?.map((timePeriod, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.label}>TIME</Text>
                            <View style={styles.timePeriodRow}>
                                <TextInput
                                    style={styles.timeInput}
                                    value={timePeriod.start}
                                    placeholder="Start Time"
                                    onChangeText={(value) => handleTimeChange(index, "start", value)}
                                />
                                <Text style={styles.label}>-</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={timePeriod.end}
                                    placeholder="End Time"
                                    onChangeText={(value) => handleTimeChange(index, "end", value)}
                                />
                                {timePeriods.length > 1 && (
                                    <TouchableOpacity onPress={() => removeTimePeriod(index)}>
                                        <Text style={styles.deletePeriodText}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={addTimePeriod}>
                        <Text style={styles.buttonText}>+ ADD TIME PERIOD</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.buttonText}>DELETE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    timePeriodRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "space-between",
    },
    timeInput: {
        backgroundColor: "#C4C4C4",
        borderRadius: 6,
        minWidth: 80,
        textAlign: "center",
        marginHorizontal: 5,
    },
    addButton: {
        backgroundColor: "#167573",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
        margin: 10,
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
    deletePeriodText: {
        color: "red",
        fontWeight: "bold",
        marginLeft: 10,
    },
    timebox: {
        backgroundColor: "#becccc",
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
    }
});

export default EditTimeTable;
