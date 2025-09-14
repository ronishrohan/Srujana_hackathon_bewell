import { Button, TextField } from "@radix-ui/themes";
import React, { useState } from "react";
import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(""); // New state for welcome message
  const Navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state

  const handleAuth = async () => {
    try {
      setLoading(true); // Start loading
      if (isSignUp) {
        // Create a new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log(user)
        // Fix: use collection and doc from Firestore correctly
        await setDoc(
          doc(db, "users", user.uid),
          {
            firstName: firstName,
            lastName: lastName,
            email: email,
            contributions: Array(365).fill(0)
          }
        );
        setWelcomeMessage(`Welcome, ${firstName}!`); // Set welcome message
        Navigate("/home");
      } else {
        // Log in the user
        await signInWithEmailAndPassword(auth, email, password);
        setWelcomeMessage(`Welcome back, ${firstName}!`); // Set welcome message
        Navigate("/home");
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="p-2 flex flex-col gap-2 size-full items-center justify-center">
      <div className="w-[30vw] flex flex-col gap-2">
        {welcomeMessage && (
          <div className="text-xl font-bold">{welcomeMessage}</div>
        )}
        <div className="text-2xl font-[Cal_Sans]">
          {isSignUp ? "Sign Up" : "Login"}
        </div>
        {isSignUp && (
          <>
            <TextField.Root
              size="3"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField.Root
              size="3"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}
        <TextField.Root
          size="3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField.Root
          size="3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div
          className="text-md cursor-pointer text-grey-100"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </div>
        <Button
          variant="solid"
          size="3"
          color="ruby"
          className="!h !p-4"
          onClick={handleAuth}
          loading={loading}
        >
          {isSignUp ? "Sign Up" : "Login"}
        </Button>
      </div>
    </div>
  );
};

export default Login;
