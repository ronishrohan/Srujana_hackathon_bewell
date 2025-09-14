import {
  AvatarIcon,
  ExitIcon,
  HeartFilledIcon,
  HomeIcon,
  PlusCircledIcon,
  RocketIcon,
  TargetIcon,
  MixerVerticalIcon,
  PlayIcon,
  CalendarIcon,
  CookieIcon,
} from "@radix-ui/react-icons";
import { Avatar, Button } from "@radix-ui/themes";
import React from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase"; // Import db for database operations
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { Calendar, Crown, HouseSimple, Play, PlusCircle, SignOut } from "@phosphor-icons/react";

// SidebarButton component
const SidebarButton = ({
  onClick,
  children,
  variant = "",
  size = "2",
  className = "",
}) => (
  <Button
    onClick={onClick}
    variant={"classic"}
    size={size}
    className={`text-left !text-lg !h-fit !p-2 !px-4 !gap-4 !w-full !justify-start !items-center ${className}`}
  >
    {children}
  </Button>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState(null); // State to store user data

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          console.log({ ...userDoc.data(), id: currentUser.uid })
          setUser({ ...userDoc.data(), id: currentUser.uid }); // Store user data in state
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="p-2 h-dvh">
      <div className="w-[15vw] h-full shrink-0  p-2 border flex flex-col gap-1 rounded-xl border-green-5  ">
      <div className="font-[Cal_Sans] text-3xl mb-2 flex gap-2 items-center "><HeartFilledIcon width={20} height={20} /> bewell</div>

      <SidebarButton onClick={() => navigate("/home")}>
        <HouseSimple weight="fill" /> Home
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/plans")}>
        <Calendar weight="fill" /> Plans
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/sessions")}>
        <Play weight="fill"/>Sessions
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/leaderboard")}>
        <Crown weight="fill" />Leaderboard
      </SidebarButton>


      <div className="mt-auto gap-1 flex-col flex">
        <SidebarButton variant="outline" onClick={() => navigate("/create")}>
          <PlusCircle weight="fill"/> New plan
        </SidebarButton>
        {isLoggedIn ? (
          <SidebarButton onClick={handleLogout}>
            <SignOut weight="fill" /> Log Out
          </SidebarButton>
        ) : (
          <SidebarButton onClick={() => navigate("/login")}>
            <ExitIcon /> Log In
          </SidebarButton>
        )}
        {isLoggedIn && <>
        <Button
          variant={"outline"}
          onClick={() => {
            console.log(user)
            navigate(`/profile/${user?.id || "guest"}`)
          }} // Navigate to profile/userId
          size="2"
          className="text-left !text-lg !h-fit !p-4 !w-full !justify-start !overflow-hidden relative !items-center"
        >
          <Avatar radius="full" fallback={user?.firstName.split("")[0] + "" + user?.lastName.split("")[0] } />
                    <div className="flex flex-col text-sm items-start">
                      <div>{user?.firstName + " " + user?.lastName || "Guest"}</div> {/* Display user's first name */}
                      <div className="text-xs overflow-ellipsis">
                        {user?.email || "No email available"} {/* Display user's email */}
                      </div>
                    </div>
        </Button></>}
      </div>
    </div>
    </div>
  );
};

export default Sidebar;
