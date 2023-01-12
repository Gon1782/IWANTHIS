import { View, Pressable, Image, Animated, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import styled from "@emotion/native";
import { auth, storage } from "../common/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth/react-native";
import * as ImagePicker from "expo-image-picker";

import { v4 as uuidv4 } from "uuid";
import { emailRegex, height, pwRegex, width } from "../common/util";
import { FontAwesome5, AntDesign, Entypo, Feather } from "@expo/vector-icons";
import Swiper from "react-native-swiper";

/* 리팩토링 예정 ㅠㅠㅠㅠㅠ*/
export default function Login({ navigation: { goBack, setOptions } }) {
  const logEmailRef = useRef(null);
  const logPwRef = useRef(null);
  const joinEmailRef = useRef(null);
  const joinPwRef = useRef(null);
  const joinPwCheckRef = useRef(null);
  const joinNickNameRef = useRef(null);

  const [logEmail, setLogEmail] = useState("");
  const [logPw, setLogPw] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinNickName, setJoinNickName] = useState("");
  const [joinPw, setJoinPw] = useState("");
  const [joinPwCheck, setJoinPwCheck] = useState("");

  const [showPw, setShowPw] = useState(true);
  const [showPwCh, setShowPwCh] = useState(true);
  const [pickedImg, setPickedImg] = useState("");
  const [opacity, setOpacity] = useState(1);
  const [nextPage, setNextPage] = useState(false);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const validateInputs = (kind) => {
    const info = {
      log: {
        email: logEmail,
        pw: logPw,
        emailRef: logEmailRef,
        pwRef: logPwRef,
      },
      join: {
        email: joinEmail,
        pw: joinPw,
        check: joinPwCheck,
        nickName: joinNickName,
        nickNameRef: joinNickNameRef,
        emailRef: joinEmailRef,
        pwRef: joinPwRef,
        pwCheckRef: joinPwCheckRef,
      },
    };
    if (!info[kind].nickName && kind === "join") {
      alert("닉네임을 입력해주세요.");
      info[kind].nickNameRef.current.focus();
      return true;
    }

    if (!info[kind].email) {
      alert("email을 입력해주세요.");
      info[kind].emailRef.current.focus();
      return true;
    }
    if (!info[kind].pw) {
      alert("password를 입력해주세요.");
      info[kind].pwRef.current.focus();
      return true;
    }

    // 이메일 형식으로 쓰지 않으면 파이어베이스 에러 뱉음
    const matchedEmail = info[kind].email.match(emailRegex);
    if (matchedEmail === null) {
      alert("이메일 형식에 맞게 입력해 주세요.");
      info[kind].emailRef.current.focus();
      return true;
    }

    if (kind === "join") {
      const matchedPw = info[kind].pw.match(pwRegex);

      if (matchedPw === null) {
        alert(
          "비밀번호는 8자리 이상 영문자, 숫자, 특수문자 조합이어야 합니다."
        );
        info[kind].pwRef.current.focus();
        return true;
      }

      if (!info[kind].check) {
        alert("재확인 password를 입력해주세요.");
        info[kind].pwCheckRef.current.focus();
        return true;
      }
      if (info[kind].check !== info[kind].pw) {
        alert("password가 일치하지 않습니다.");
        info[kind].pwCheckRef.current.focus();
        return true;
      }
    }
  };

  const handleLogin = (kind) => {
    // 유효성 검사
    if (validateInputs(kind)) {
      return;
    }
    setOpacity(0.5);
    // 로그인 요청
    signInWithEmailAndPassword(auth, logEmail, logPw)
      .then(() => {
        goBack();
        setOpacity(1);
        setLogEmail("");
        setLogPw("");

        // 로그인 화면 이전 화면으로 돌아가기
      })
      .catch((err) => {
        setOpacity(1);
        if (err.message.includes("user-not-found")) {
          return Alert.alert(
            "Join",
            "회원이 아닙니다. 회원 가입 창으로 이동 하시겠습니까?",
            [
              {
                text: "아니요",
                onPress: () => null,
              },
              {
                text: "네",
                onPress: () => setNextPage(true),
              },
            ]
          );
        }
        if (err.message.includes("wrong-password")) {
          alert("비밀번호가 틀렸습니다.");
        }
      });
  };

  const handleRegister = (kind) => {
    // 유효성 검사
    if (validateInputs(kind)) {
      return;
    }
    setOpacity(0.5);

    // 회원가입 요청
    createUserWithEmailAndPassword(auth, joinEmail, joinPw)
      .then(async (response) => {
        const photo = await uploadImage();
        await updateProfile(auth.currentUser, {
          photoURL: photo,
          displayName: joinNickName,
        });
        goBack();
        setJoinEmail("");
        setJoinPw("");
        setOpacity(1);
        setJoinNickName("");
        setPickedImg("");
      })
      .catch((err) => {
        console.log("err.message:", err.message);
        if (err.message.includes("already-in-use")) {
          alert("이미 사용중인 아이디입니다.");
        }
        setOpacity(1);
      });
  };

  useEffect(() => {
    setOptions({ headerRight: () => null });
  }, []);

  const pickImage = async () => {
    if (!status?.granted) {
      const permissions = await requestPermission();
      if (!permissions.granted) {
        return null;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    const [{ uri }] = result.assets;
    setPickedImg(uri);
  };

  const uploadImage = async () => {
    if (pickedImg) {
      const response = await fetch(pickedImg);
      const blobFile = await response.blob();
      const imageRef = ref(storage, `image/${uuidv4()}`);
      if (blobFile) {
        const imageResponse = await uploadBytes(imageRef, blobFile);
        const downloadUrl = await getDownloadURL(imageResponse.ref);

        return downloadUrl;
      }
    } else {
      return "";
    }
  };
  const component = [
    { innerColor: "#fa5a5a", backColor: "#BCE29E" },
    { innerColor: "#0d2a60", backColor: "#FBB9AB" },
  ];

  return (
    <>
      <Swiper
        showsPagination={false}
        slidesPerView={2}
        width={width}
        height={500}
        loop={nextPage}
      >
        {component.map((item, index) => {
          return (
            <Page color={item["backColor"]} key={index} opacity={opacity}>
              <BackCircle style={{ backgroundColor: item["innerColor"] }} />

              {index === 0 ? ( // 로그인 페이지
                <Around>
                  <FontAwesome5
                    style={{
                      marginBottom: height * 0.1,
                      marginLeft: height / 28,
                    }}
                    name="user-tag"
                    size={height / 12}
                    color={item["innerColor"]}
                  />
                  {/* <Image
                    source={listImagePath["shopping"]}
                    style={{
                      width: 100,
                      height: 100,
                      marginBottom: height * 0.09,
                      marginLeft: width * 0.0001,
                    }}
                  /> */}

                  <IdInput>
                    <AntDesign
                      name="tag"
                      size={24}
                      style={{ marginTop: "4%", marginRight: "3%" }}
                      color={logEmail.length > 0 ? item["innerColor"] : "grey"}
                    />
                    <LoginBox
                      ref={logEmailRef}
                      value={logEmail}
                      onChangeText={(text) => setLogEmail(text)}
                      placeholderTextColor={"grey"}
                      textContentType="emailAddress"
                      placeholder="Enter your email id"
                      color={item["backColor"]}
                    />
                  </IdInput>
                  <PasswordInput style={{ marginBottom: "20%" }}>
                    <Entypo
                      name="fingerprint"
                      style={{ marginTop: "4%", marginRight: "3%" }}
                      size={24}
                      color={logPw.length > 0 ? item["innerColor"] : "grey"}
                      onLongPress={() => setShowPw(false)}
                      onPressOut={() => setShowPw(true)}
                    />
                    <LoginBox
                      ref={logPwRef}
                      value={logPw}
                      onChangeText={(text) => setLogPw(text)}
                      placeholderTextColor={"grey"}
                      textContentType="password"
                      returnKeyType="send"
                      secureTextEntry={showPw}
                      placeholder="Enter your password"
                      color={item["backColor"]}
                    />
                  </PasswordInput>
                  <FontAwesome5
                    name="door-open"
                    size={height / 25}
                    color={
                      (logPw && logEmail).length > 0
                        ? item["innerColor"]
                        : "grey"
                    }
                    onPress={() => handleLogin("log")}
                  />
                </Around>
              ) : (
                <Around
                  style={{ height: height / 1.4, marginTop: height / 11 }}
                >
                  <Animated.Image
                    style={{
                      width: width / 3,
                      height: height / 7,
                      marginTop: height * 0.001,
                      backgroundColor: item["innerColor"],
                      borderRadius: 100,
                      display: !!pickedImg ? "flex" : "none",
                    }}
                    source={!!pickedImg ? { uri: pickedImg } : null}
                  />
                  <FontAwesome5
                    style={{
                      //marginTop: height * 0.01,
                      marginBottom: height * 0.01,
                      marginLeft: height / 28,
                      display: !!pickedImg ? "none" : "flex",
                    }}
                    name="user-tag"
                    size={height / 10}
                    color={item["innerColor"]}
                  />

                  <Feather
                    name="camera"
                    size={24}
                    onPress={() => pickImage()}
                    style={{
                      color: item["innerColor"],
                      marginBottom: 33,
                    }}
                  />
                  <IdInput>
                    <FontAwesome5
                      name="user-alt"
                      size={24}
                      style={{ marginTop: "4%", marginRight: "3%" }}
                      color={
                        joinNickName.length > 0 ? item["innerColor"] : "grey"
                      }
                    />
                    <LoginBox
                      ref={joinNickNameRef}
                      value={joinNickName}
                      onChangeText={(text) => setJoinNickName(text)}
                      placeholderTextColor={"grey"}
                      textContentType="Nick-name"
                      placeholder="Enter your nick name"
                      secureTextEntry={false}
                      color={item["backColor"]}
                    />
                  </IdInput>

                  <IdInput>
                    <AntDesign
                      name="tag"
                      size={24}
                      style={{ marginTop: "4%", marginRight: "3%" }}
                      color={joinEmail.length > 0 ? item["innerColor"] : "grey"}
                    />
                    <LoginBox
                      ref={joinEmailRef}
                      value={joinEmail}
                      onChangeText={(text) => setJoinEmail(text)}
                      placeholderTextColor={"grey"}
                      textContentType="emailAddress"
                      placeholder="Enter your email id"
                      secureTextEntry={false}
                      color={item["backColor"]}
                    />
                  </IdInput>
                  <PasswordInput>
                    <Entypo
                      name="fingerprint"
                      style={{ marginTop: "4%", marginRight: "3%" }}
                      size={24}
                      color={joinPw.length > 0 ? item["innerColor"] : "grey"}
                      onLongPress={() => setShowPw(false)}
                      onPressOut={() => setShowPw(true)}
                    />
                    <LoginBox
                      ref={joinPwRef}
                      value={joinPw}
                      onChangeText={(text) => setJoinPw(text)}
                      placeholderTextColor={"grey"}
                      textContentType="password"
                      returnKeyType="send"
                      secureTextEntry={showPw}
                      placeholder="Enter your password"
                      color={item["backColor"]}
                    />
                  </PasswordInput>
                  <PasswordInput style={{ marginBottom: "6%" }}>
                    <Entypo
                      name="fingerprint"
                      style={{ marginTop: "4%", marginRight: "3%" }}
                      size={24}
                      color={
                        joinPwCheck.length > 0 ? item["innerColor"] : "grey"
                      }
                      onLongPress={() => setShowPwCh(false)}
                      onPressOut={() => setShowPwCh(true)}
                    />

                    <LoginBox
                      ref={joinPwCheckRef}
                      value={joinPwCheck}
                      onChangeText={(text) => setJoinPwCheck(text)}
                      placeholderTextColor={"grey"}
                      textContentType="password"
                      returnKeyType="send"
                      secureTextEntry={showPwCh}
                      placeholder="password again"
                      color={item["backColor"]}
                    />
                  </PasswordInput>
                  <FontAwesome5
                    name="door-open"
                    style={{ marginBottom: "5%" }}
                    size={height / 25}
                    color={
                      (joinNickName && joinPw && joinEmail && joinPwCheck)
                        .length > 0
                        ? item["innerColor"]
                        : "grey"
                    }
                    onPress={() => handleRegister("join")}
                  />
                </Around>
              )}
            </Page>
          );
        })}
      </Swiper>
    </>
  );
}

const Page = styled.View`
  height: ${height + "px"};
  width: ${width + "px"};
  position: relative;
  background-color: ${({ color }) => color};
  opacity: ${({ opacity }) => opacity};
`;

const Around = styled.View`
  background-color: white;
  height: ${height / 1.5 + "px"};
  width: ${width / 1.34 + "px"};
  margin-left: ${width / 8 + "px"};
  margin-top: ${height / 8.7 + "px"};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  border-radius: 40px;
`;

const IdInput = styled.View`
  flex-direction: row;
  height: 12%;
  width: 85%;
`;

const PasswordInput = styled.View`
  flex-direction: row;
  height: 12%;
  width: 85%;
`;

const BackCircle = styled.View`
  background-color: #fa5a5a;
  width: 100%;
  height: ${height / 3.4 + "px"};
  margin-top: ${height / 3.2 + "px"};
  border: 0px solid black;
  border-radius: ${width / 6 + "px"};
  display: flex;
  justify-content: center;
`;

const LoginBox = styled.TextInput`
  background-color: #e6f4f1;
  color: black;
  width: 85%;
  height: 40px;
  text-align: center;
  border-radius: 100px;
  margin-bottom: 30px;
  font-size: ${height * 0.02 + "px"};
  background-color: ${({ color }) => color};
`;
