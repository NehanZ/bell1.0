import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const Header = ({screenName}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#0F6466',
      }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', paddingTop: 5 }}>
            {screenName}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("CreateTimeTable")}>
          <Ionicons name="add-circle-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;
