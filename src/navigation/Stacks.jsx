import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screen/Home";
import Lists from "../screen/Lists";
import Detail from "../screen/Detail";
import WriteList from "../screen/WriteList";
import Login from "../screen/Login";
import Header from "../components/Header";
import { imagePath, listImagePath } from "../assets/imgPath";
import { Text, Image, TouchableOpacity, View, Alert } from "react-native";
import { useEffect, useState } from "react";
import MyPage from "../screen/MyPage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../common/firebase";
import { SimpleLineIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth/react-native";
import EditList from "../screen/EditList";
import { isLogin, notLogin } from "../redux/modules/loginSlice";
import { useDispatch, useSelector } from "react-redux";

const NativeStack = createNativeStackNavigator();

const Stacks = () => {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);
  useEffect(() => {
    // 유저 로그인 여부 가져오기
    auth.onAuthStateChanged((user) => setUser(user));
  });

  //로그아웃 누르면 로그아웃되는 코드
  const logOut = () => {
    return Alert.alert("LOGOUT", "로그아웃하시겠습니까?", [
      {
        text: "YES",
        onPress: () => {
          signOut(auth)
            .then(() => {
              alert("로그아웃 성공");
              navigate("Home");
            })
            .catch((err) => {
              alert(err);
            });
        },
      },
      {
        text: "NO",
        onPress: () => {
          console.log("로그아웃 취소");
        },
      },
    ]);
  };

  return (
    <NativeStack.Navigator
      screenOptions={{
        headerTitleAlign: "center", // 안드로이드
        headerTitle: (props) => <Header {...props} />,
        headerLeft: () => <Text></Text>, // 물어보깅
        headerRight: () => {
          return (
            <>
              <TouchableOpacity style={{ marginRight: 2 }}>
                {!!user ? ( // 로그아웃 및 프로필 사진 아이콘
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <SimpleLineIcons
                      name="logout"
                      size={24}
                      color="black"
                      onPress={logOut}
                      style={{ marginTop: 7 }}
                    />

                    <TouchableOpacity
                      onPress={() => navigate("MyPage")}
                      style={{ flexDirection: "row" }}
                    >
                      <View style={{ marginLeft: 10 }}>
                        <Image
                          source={
                            user.photoURL === ""
                              ? { uri: user.photoURL } // 로그인 했는데 프로필사진 없을때
                              : listImagePath["defaultimage"]
                          }
                          style={{ height: 40, width: 40, borderRadius: 40 }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // 로그인 아이콘
                  <SimpleLineIcons
                    name="login"
                    size={24}
                    color="black"
                    onPress={() => {
                      navigate("Login");
                    }}
                  />
                )}
              </TouchableOpacity>
            </>
          );
        },
      }}
    >
      <NativeStack.Screen name="Home" component={Home} />
      <NativeStack.Screen name="Lists" component={Lists} />
      <NativeStack.Screen name="WriteList" component={WriteList} />
      <NativeStack.Screen name="Detail" component={Detail} />
      <NativeStack.Screen name="EditList" component={EditList} />
      <NativeStack.Screen name="MyPage" component={MyPage} />
      <NativeStack.Screen name="Login" component={Login} />
    </NativeStack.Navigator>
  );
};

export default Stacks;
