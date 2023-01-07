import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screen/Home";
import Lists from "../screen/Lists";
import Detail from "../screen/Detail";
import WriteList from "../screen/WriteList";
import stylesList from "../styles/styled";
import { headerBackVisible } from "react-native-screens";
import { Text, Image, TouchableOpacity, View } from "react-native";

import mainIcon from "../assets/main3.png";

const NativeStack = createNativeStackNavigator();

const Header = () => {
  return (
    // <SafeAreaView>
    //   <View style={{ backgroundColor: "black", height: 60 }}>
    //     <Text>헤더</Text>
    //   </View>
    // </SafeAreaView>
    <>
      <Text>IWANTHIS</Text>
      <Image
        style={{ width: 40, height: 40 }}
        source={mainIcon}
        resizeMode="contain"
      />
    </>
  );
};

const Stacks = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerTitle: (props) => <Header {...props} />,
        headerLeft: () => <Text></Text>, // 물어보깅
        headerRight: () => {
          return (
            <TouchableOpacity>
              <View style={{ marginVertical: -5 }}>
                <Image
                  source={require("../../assets/defaultimage.png")}
                  style={{ height: 40, width: 40 }}
                />
                {/* <View style={{ height: 10 }}></View> */}
              </View>
            </TouchableOpacity>
          );
        },
      }}
    >
      <NativeStack.Screen name="Home" component={Home} />
      <NativeStack.Screen
        name="Lists"
        component={Lists}
        options={headerBackVisible}
      />
      {/* <NativeStack.Screen name="Detail" component={Detail} />
        <NativeStack.Screen name="WriteList" component={WriteList} />  */}
      {/* <NativeStack.Screen name="Mypage" /> */}
      {/* <NativeStack.Screen name="Login" /> */}
      {/* <NativeStack.Screen name="Register" />*/}
    </NativeStack.Navigator>
  );
};

export default Stacks;
