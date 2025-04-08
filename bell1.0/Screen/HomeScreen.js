import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/Header.js';
import Footer from '../Components/Footer.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [timeTables, setTimeTables] = React.useState([]);

  // Add a focus listener to reload data when returning to this screen
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTimeTables();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTimeTables = async () => {
    try {
      const storedTimeTables = await AsyncStorage.getItem('timeTables');
      if (storedTimeTables) {
        setTimeTables(JSON.parse(storedTimeTables));
      }
    } catch (error) {
      console.error("Error loading time tables:", error);
    }
  };

  React.useEffect(() => {
    loadTimeTables();
  }, []);

  const handleEdit = (index) => {
    navigation.navigate('EditTimeTable', { index });
  };

  const handleRun = (index) => {
    const item = timeTables[index];
    
    // Get current date to set start times relative to now
    const now = new Date();
    const baseHour = 8; // Default start at 8 AM
    
    // Convert timePeriods to schedule format if needed
    let schedule;
    
    if (item.schedule && item.schedule.length > 0) {
      // Use existing schedule if available
      schedule = item.schedule;
    } else if (item.timePeriods && item.timePeriods.length > 0) {
      // Convert timePeriods to schedule format with proper period names
      schedule = item.timePeriods.map((period, idx) => {
        // Parse times from format like "8.30" to hours and minutes
        const [startHour, startMinute] = period.start.split('.').map(Number);
        const [endHour, endMinute] = period.end.split('.').map(Number);
        
        // Calculate duration in seconds
        const startTotalMinutes = startHour * 60 + (startMinute || 0);
        const endTotalMinutes = endHour * 60 + (endMinute || 0);
        const durationSeconds = (endTotalMinutes - startTotalMinutes) * 60;
        
        // Set period names based on typical school schedule
        let periodName;
        if (idx === 0) periodName = "Morning Bell";
        else if (idx === item.timePeriods.length - 1) periodName = "Dismissal";
        else periodName = `Period ${idx}`;
        
        return {
          name: periodName,
          duration: durationSeconds > 0 ? durationSeconds : 1800, // Default to 30 mins if calculation fails
        };
      });
    } else {
      Alert.alert("No schedule found for this time table.");
      return;
    }
    
    // Convert day format for TimeMachine component
    let dayNumbers = [];
    switch(item.days) {
      case 'DAY1': // MON - FRI
        dayNumbers = [1, 2, 3, 4, 5];
        break;
      case 'DAY2': // SAT - SUN
        dayNumbers = [6, 0];
        break;
      case 'DAY3': // MON - SAT
        dayNumbers = [1, 2, 3, 4, 5, 6];
        break;
      default:
        dayNumbers = [0, 1, 2, 3, 4, 5, 6]; // All days
    }

    navigation.navigate('TimeMachine', {
      schedule: schedule,
      selectedMusic: item.tone,
      days: dayNumbers,
    });
  };

  const handleCreateNew = () => {
    navigation.navigate('CreateTimeTable');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header screenName="Home" />

      <FlatList
        data={timeTables}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#43A5AF',
              margin: 10,
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
                Schedule {index + 1}
              </Text>
              {item.days && (
                <Text style={{ fontSize: 12, color: 'white', marginTop: 4 }}>
                  {item.days === 'DAY1' ? 'MON-FRI' : 
                   item.days === 'DAY2' ? 'SAT-SUN' : 'MON-SAT'}
                </Text>
              )}
              {item.timePeriods && item.timePeriods.length > 0 && (
                <Text style={{ fontSize: 12, color: 'white', marginTop: 2 }}>
                  {item.timePeriods.length} time period{item.timePeriods.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{ marginRight: 20, backgroundColor: 'white', padding: 8, borderRadius: 20 }}
                onPress={() => handleEdit(index)}
              >
                <Ionicons name="create-outline" size={22} color="#43A5AF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#167573', padding: 8, borderRadius: 20 }}
                onPress={() => handleRun(index)}
              >
                <Ionicons name="play-circle-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text>No time tables found. Create one to get started.</Text>
          </View>
        }
      />

      {/* Add a button to create new time table */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 70, // Position above Footer
          right: 20,
          backgroundColor: '#167573',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}
        onPress={handleCreateNew}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Footer />
    </SafeAreaView>
  );
};

export default HomeScreen;