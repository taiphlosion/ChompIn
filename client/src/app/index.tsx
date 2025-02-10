import React from "react";
import Navigation from "@/navigation/navigation";
import { UserProvider } from "@/context/user";

export default function Index() {
  return(
    <UserProvider>
      <Navigation />
    </UserProvider>
  );
}
