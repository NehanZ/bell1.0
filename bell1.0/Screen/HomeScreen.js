import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../Components/Header.js';
import Footer from '../Components/Footer.js';

const timeTables = [
  { id: '1', title: 'Time Table1' },
  { id: '2', title: 'Time Table2' },
  { id: '3', title: 'Time Table3' },
];

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />

      <FlatList
        data={timeTables}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
              {item.title}
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => navigation.navigate('EditTimeTable')}
              >
                <Ionicons name="create-outline" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity>
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