import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bugün",
          tabBarIcon: ({ color }) => <MaterialIcons name="today" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: "Hikâyeler",
          tabBarIcon: ({ color }) => <MaterialIcons name="menu-book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: "Hafıza",
          tabBarIcon: ({ color }) => <MaterialIcons name="psychology" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <MaterialIcons name="person-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Kaynaklar",
          tabBarIcon: ({ color }) => <MaterialIcons name="open-in-new" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
