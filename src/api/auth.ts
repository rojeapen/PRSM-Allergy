import { browserLocalPersistence, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./firebase";
import { checkAccessCode } from "./db";
import { ORIGIN } from "../constants";


const auth = getAuth(app);

export async function login(email: string, password: string): Promise<string> {
    return setPersistence(auth, browserLocalPersistence).then(async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log(auth.currentUser);
            localStorage.setItem("userId", auth.currentUser!.uid!);
            localStorage.setItem("isAdmin", "true");
            return "Success";
        } catch (e) {
            const errorCode = e.code;
            switch (errorCode) {
                case "auth/user-not-found":
                    return "User not found";
                case "auth/wrong-password":
                    return "Invalid Password";
                case "auth/invalid-credential":
                    return "Incorrect email or password";
                default:
                    return errorCode;
            }
        }
    });


}

export async function logout() {
    return signOut(auth);
}

export async function register(email: string, password: string, accessCode: string): Promise<string> {
    //Check if the access code is correct
    const exists = await checkAccessCode(accessCode);
    if (!exists) {
        return "Invalid Access Code";
    }
    return setPersistence(auth, browserLocalPersistence).then(async () => {

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            localStorage.setItem("userId", auth.currentUser!.uid!);
            localStorage.setItem("isAdmin", "true");


            return "Success";
        }
        catch (e) {
            // Parse the error message
            const errorCode = e.code;
            switch (errorCode) {
                case "auth/email-already-in-use":
                    return "Account already exists with that email";



                default:
                    return "Error signing up";
            }

            console.log(errorCode);

        }
    });
}

export async function isUserLoggedIn(setIsLoggedIn: (isLoggedIn: boolean) => void) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            //Set the url to the login page
            window.location.href = ORIGIN + "Auth/Login/";
        }
    });


}