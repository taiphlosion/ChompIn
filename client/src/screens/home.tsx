import React, { useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useUserContext } from "@/context/user";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import { ScrollView } from "react-native-gesture-handler";
import { SelectList } from "react-native-dropdown-select-list";
import Topbar from "@/components/topbar";
import ChompIn from "@/components/student/chomp-in";
import QRCreation from "@/components/professor/qr-creation";
import Navbar from "@/components/navbar";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:5000";

export default function Home() {
  const { user } = useUserContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [classes, setClasses] = React.useState<
    { class_name: string; id: number; professor_id: number }[]
  >([]);
  const [selectedClass, setSelectedClass] = React.useState<{
    class_name: string;
    id: number;
    professor_id: number;
  } | null>(null);

  const classList = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/classrooms`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const classOptions = classes.map((cls) => ({
    key: cls.id.toString(),
    value: cls.class_name,
  }));

  //TODO: Run a different function to get the API call for all classes involved with students.
  useEffect(() => {
    if (user?.role === "professor") {
      classList();
    }
  }, []);

  const handleQRCreation = async () => {
    if (!selectedClass?.id) { return; }

    const classId = selectedClass.id;

    try {
      const response = await fetch(`${API_URL}/api/user/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classroom_id: classId }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        navigation.navigate("scan", { qrCode: data.qrImage });
      }
    } catch (error) { console.log(error); }
  };

  const handleChompInPress = () => {
    navigation.navigate("scan", { qrCode: "" });
  };

  const renderProfessorView = () => {
    console.log("Rendering professor view");
    return (
      <View style={styles.container}>
        <Topbar />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>
            Welcome, {user?.first_name} {user?.last_name}
          </Text>

          <SelectList
            setSelected={(val: string) => {
              const selectedClass = classes.find(
                (cls) => cls.class_name === val
              );
              setSelectedClass(selectedClass || null);
            }}
            data={[
              {
                key: "0",
                value: "Select a class to generate a QR code",
                disabled: true,
              },
              ...classOptions,
            ]}
            save="value"
          />

          <Button title="Create QR Code" onPress={handleQRCreation} />
        </ScrollView>
        <Navbar navigation={navigation} />
      </View>
    );
  };

  const renderStudentView = () => {
    console.log("Rendering student view");
    return (
      <View style={styles.container}>
        <Topbar />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>
            Welcome, {user?.first_name} {user?.last_name}
          </Text>
          {/* Takes you to the scan screen */}
          <ChompIn title="Chomp-In?" onPress={handleChompInPress} />
        </ScrollView>
        <Navbar navigation={navigation} />
      </View>
    );
  };

  if (user?.role === "professor") {
    return renderProfessorView();
  }

  return renderStudentView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButton: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
});
