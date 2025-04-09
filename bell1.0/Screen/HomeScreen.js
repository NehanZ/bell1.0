import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/Header.js';
import Footer from '../Components/Footer.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [timeTables, setTimeTables] = React.useState([]);

  //focus listener to reload data when returning to this screen
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTimeTables();
    });

    return unsubscribe; // cleanup function to remove the listener
  }, [navigation]);

  //Load time tables from AsyncStorage
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

  //To Edit the Time Table)
  const handleEdit = (index) => {
    navigation.navigate('EditTimeTable', { index });
  };

  //To Run the Time Table
  const handleRun = (index) => {
    const item = timeTables[index];
    
    const now = new Date();
    const baseHour = 8; // Default start at 8 AM

    let schedule;
    
    if (item.schedule && item.schedule.length > 0) {
      schedule = item.schedule;
    } else if (item.timePeriods && item.timePeriods.length > 0) {
      schedule = item.timePeriods.map((period, idx) => {
        const [startHour, startMinute] = period.start.split('.').map(Number);
        const [endHour, endMinute] = period.end.split('.').map(Number);
        
        // Calculate duration in seconds
        const startTotalMinutes = startHour * 60 + (startMinute || 0);
        const endTotalMinutes = endHour * 60 + (endMinute || 0);
        const durationSeconds = (endTotalMinutes - startTotalMinutes) * 60;
        
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
      case '1':
        dayNumbers = [1, 2, 3, 4, 5];
        break;
      case '2':
        dayNumbers = [6, 0];
        break;
      case '3':
        dayNumbers = [1, 2, 3, 4, 5, 6];
        break;
      default:
        dayNumbers = [0, 1, 2, 3, 4, 5, 6];
    }

    navigation.navigate('TimeMachine', {
      schedule: schedule,
      selectedMusic: item.tone,
      days: dayNumbers,
      bellduration: item.duration || 5,
    });
    console.log(timeTables[index].duration);
  };
  

  // const handleCreateNew = () => {
  //   navigation.navigate('CreateTimeTable');
  // };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header screenName="Home" />

      <FlatList
        data={timeTables}
        keyExtractor={(item, index) => index.toString()} // key should be a string
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

              {/* if item.days true text part will be rendered*/}
              {item.days && (
                <Text style={{ fontSize: 12, color: 'white', marginTop: 4 }}>
                  {item.days === '1' ? 'MON-FRI' : 
                   item.days === '2' ? 'SAT-SUN' :
                   item.days === '3' ? 'MON-SAT': 'ALL DAYS'}
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

      <Footer />
    </SafeAreaView>
  );
};

export default HomeScreen;