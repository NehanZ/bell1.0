import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";
import Header from "./Header.js";
import Footer from "./Footer.js";

const EditTimeTable = ({ navigation }) => {
    const [days, setDays] = useState("MON - FRI");
    const [time, setTime] = useState("P1 8.00-8.30");
    const [tone, setTone] = useState("TONE 1");
    const [duration, setDuration] = useState("30s");

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.label}>DAYS</Text>
                    <TextInput style={styles.input} value={days} onChangeText={setDays} />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>TIME</Text>
                    <TextInput style={styles.input} value={time} onChangeText={setTime} />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>TONE</Text>
                    <TextInput style={styles.input} value={tone} onChangeText={setTone} />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>DURATION</Text>
                    <TextInput style={styles.input} value={duration} onChangeText={setDuration} />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.deleteButton}>
                        <Text style={styles.buttonText}>DELETE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton}>
                        <Text style={styles.buttonText}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Footer />
        </SafeAreaView>
    );
};

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
    input: {
        backgroundColor: "#C4C4C4",
        padding: 8,
        borderRadius: 6,
        minWidth: 100,
        textAlign: "center",
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

export default EditTimeTable;
