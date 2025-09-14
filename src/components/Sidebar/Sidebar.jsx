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
    variant={variant}
    size={size}
    className={`text-left !text-lg !h-fit !p-2 !w-full !justify-start !items-center ${className}`}
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
    <div className="w-[15vw] shrink-0 h-dvh p-2 border-r flex flex-col gap-1 border-ruby-3">
      <div className="font-[Cal_Sans] text-3xl mb-2 flex gap-2 items-center "><HeartFilledIcon width={20} height={20} /> Peekfit</div>

      <SidebarButton onClick={() => navigate("/home")}>
        <TargetIcon /> Home
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/plans")}>
        <CalendarIcon /> Plans
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/sessions")}>
        <PlayIcon />Sessions
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/leaderboard")}>
        <RocketIcon /> Leaderboard
      </SidebarButton>
      <SidebarButton onClick={() => navigate("/nutri")}>
        <CookieIcon/> Nutrition
      </SidebarButton>


      <div className="mt-auto gap-1 flex-col flex">
        <SidebarButton variant="outline" onClick={() => navigate("/create")}>
          <PlusCircledIcon /> New plan
        </SidebarButton>
        {isLoggedIn ? (
          <SidebarButton onClick={handleLogout}>
            <ExitIcon /> Log Out
          </SidebarButton>
        ) : (
          <SidebarButton onClick={() => navigate("/login")}>
            <ExitIcon /> Log In
          </SidebarButton>
        )}
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
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
