import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, StatusBar, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";


const minutesToHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const parseScheduleToTimePeriods = (schedule, duration) => {
  const startHour = 8;
  let current = startHour * 60;
  return schedule.map(() => {
    const start = minutesToHHMM(current);
    current += duration / 60;
    const end = minutesToHHMM(current);
    return { start, end };
  });
};

const EditTimeTable = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { index } = route.params;

  const [timePeriods, setTimePeriods] = useState([]);
  const [tone, setTone] = useState("");
  const [duration, setDuration] = useState(1800);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    const fetchTimeTable = async () => {
      const storedTimeTables = await AsyncStorage.getItem("timeTables");
      const timeTables = storedTimeTables ? JSON.parse(storedTimeTables) : [];
      const timeTable = timeTables[index];
      if (timeTable) {
        setSelectedDays(Array.isArray(timeTable.days) ? timeTable.days : [timeTable.days]);
        setTone(timeTable.tone || "");
        setDuration(timeTable.duration || 1800);
        const schedule = timeTable.schedule || [];
        const periods = parseScheduleToTimePeriods(schedule, timeTable.duration || 1800);
        setTimePeriods(periods);
      }
    };
    fetchTimeTable();
  }, [index]);

  const handleSave = async () => {
    const updatedSchedule = timePeriods.map((_, i) => ({
      name: `Period ${i + 1}`,
      duration: duration,
    }));

    const storedTimeTables = await AsyncStorage.getItem("timeTables");
    const timeTables = storedTimeTables ? JSON.parse(storedTimeTables) : [];
    timeTables[index] = { days: selectedDays, schedule: updatedSchedule, tone, duration };
    await AsyncStorage.setItem("timeTables", JSON.stringify(timeTables));
    Alert.alert("Success", "Time table updated successfully", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const handleTimeChange = (index, type, value) => {
    const newTimePeriods = [...timePeriods];
    newTimePeriods[index][type] = value;
    setTimePeriods(newTimePeriods);
  };

  const addTimePeriod = () => {
    const lastEnd = timePeriods.length > 0 ? timePeriods[timePeriods.length - 1].end : "08:00";
    const [h, m] = lastEnd.split(":").map(Number);
    const totalMins = h * 60 + m + duration / 60;
    const endHour = Math.floor(totalMins / 60);
    const endMin = totalMins % 60;
    const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    setTimePeriods([...timePeriods, { start: lastEnd, end }]);
  };

  const allDays = [
    { label: "Mon", value: "MON" },
    { label: "Tue", value: "TUE" },
    { label: "Wed", value: "WED" },
    { label: "Thu", value: "THU" },
    { label: "Fri", value: "FRI" },
    { label: "Sat", value: "SAT" },
    { label: "Sun", value: "SUN" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>EDIT TIME TABLE</Text>

      <View style={[styles.row, { flexDirection: "column", alignItems: "flex-start" }]}>
        <Text style={styles.label}>SELECT DAYS</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}>
          {allDays.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={{
                backgroundColor: selectedDays.includes(day.value) ? "#167573" : "#ccc",
                margin: 5,
                padding: 10,
                borderRadius: 6,
              }}
              onPress={() => {
                if (selectedDays.includes(day.value)) {
                  setSelectedDays(selectedDays.filter((d) => d !== day.value));
                } else {
                  setSelectedDays([...selectedDays, day.value]);
                }
              }}
            >
              <Text style={{ color: "#fff" }}>{day.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>TONE</Text>
        <TextInput
          style={styles.input}
          value={tone}
          onChangeText={setTone}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>DURATION (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(duration / 60)}
          onChangeText={(text) => setDuration(parseInt(text) * 60)}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>SCHEDULE</Text>
        {timePeriods.map((period, index) => (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <TextInput
              style={styles.input}
              value={period.start}
              onChangeText={(text) => handleTimeChange(index, "start", text)}
            />
            <Text>-</Text>
            <TextInput
              style={styles.input}
              value={period.end}
              onChangeText={(text) => handleTimeChange(index, "end", text)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={addTimePeriod}>
          <Text style={styles.buttonText}>Add Period</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

export default EditTimeTable;
