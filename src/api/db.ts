
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

import { app } from "./firebase";

import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Photo, PRSM } from "../constants";




const db = getFirestore(app);
const storage = getStorage(app);

export async function checkAccessCode(accessCode: string): Promise<boolean> {
    const accessCodeDoc = await getDoc(doc(db, "accessCodes", accessCode));
    return accessCodeDoc.exists();
}

export async function getPRSM(): Promise<PRSM | null> {
    const prsmDoc = await getDoc(doc(db, "info", "prsm"));
    if (prsmDoc.exists()) {
        return PRSM.fromMap(prsmDoc.data());
    } else {
        return null;
    }
}

export async function updatePRSM(prsm: PRSM): Promise<void> {
    console.log("Updating PRSM in Firestore...");
    console.log(prsm.toMap());
    await updateDoc(doc(db, "info", "prsm"), prsm.toMap());
}

export async function uploadPhoto(image: File, name: string): Promise<Photo> {
    const storageRef = ref(storage, `Photos/${name.replace(" ", "_")}.${image.name.split(".")[1]}`);
    const snapshot = await uploadBytes(storageRef, image);
    const url = await getDownloadURL(snapshot.ref);
    return new Photo({ url, id: snapshot.ref.fullPath });

}

export async function deletePhoto(photo: Photo): Promise<void> {
    try {
        const photoRef = ref(storage, photo.id);

        await deleteObject(photoRef);
    } catch (error) {
        console.error("Error deleting photo:", error);
    }
}