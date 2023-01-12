import { ScrollView } from "react-native";
import React, { useEffect } from "react";
import Category from "../components/Category";
import { auth } from "../common/firebase";
import { useDispatch, useSelector } from "react-redux";
import { isLogin, notLogin } from "../redux/modules/loginSlice";

const Home = ({ navigation: { navigate } }) => {
  return (
    <ScrollView>
      <Category navigation={navigate} />
    </ScrollView>
  );
};

export default Home;
