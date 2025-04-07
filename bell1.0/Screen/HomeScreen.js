import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../Components/Header.js';
import Footer from '../Components/Footer.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [timeTables, setTimeTables] = React.useState([]);

  React.useEffect(() => {
    const loadTimeTables = async () => {
      const storedTimeTables = await AsyncStorage.getItem('timeTables');
      if (storedTimeTables) {
        setTimeTables(JSON.parse(storedTimeTables));
      }
    };

    loadTimeTables();
  }, []);

  const handleEdit = (index) => {
    navigation.navigate('EditTimeTable', { index });
  };

  const handleRun = (index) => {
    const item = timeTables[index];
    if (!item.schedule || item.schedule.length === 0) {
        Alert.alert("No schedule found for this time table.");
        return;
    }

    navigation.navigate('TimeMachine', {
        schedule: item.schedule,
        selectedMusic: item.tone,
        days: item.days,
    });
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
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>
              Table {index + 1}
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => handleEdit(index)}
              >
                <Ionicons name="create-outline" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => handleRun(index)}
              >
                <Ionicons name="play-circle-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Footer />
    </SafeAreaView>
  );
};

export default HomeScreen;
