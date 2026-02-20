
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, orderBy } from "firebase/firestore";

import { app } from "./firebase";

import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Article, Photo, PRSM } from "../constants";

// Cache configuration
const CACHE_KEY = 'prsm_cache';
const CACHE_TIMESTAMP_KEY = 'prsm_cache_timestamp';
const ARTICLES_CACHE_KEY = 'articles_cache';
const ARTICLES_CACHE_TIMESTAMP_KEY = 'articles_cache_timestamp';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes for public pages

// Get cached PRSM data from localStorage
function getCachedPRSM(): PRSM | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        
        if (cached && timestamp) {
            const parsedData = JSON.parse(cached);
            return PRSM.fromMap(parsedData);
        }
    } catch (error) {
        console.warn('Error reading cache:', error);
        clearCache();
    }
    return null;
}

// Check if cache is still valid (not expired)
function isCacheValid(): boolean {
    try {
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!timestamp) return false;
        
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        return cacheAge < CACHE_DURATION_MS;
    } catch {
        return false;
    }
}

// Save PRSM data to cache
function setCachePRSM(prsm: PRSM): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(prsm.toMap()));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.warn('Error writing cache:', error);
    }
}

// Clear all caches
export function clearCache(): void {
    try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        localStorage.removeItem(ARTICLES_CACHE_KEY);
        localStorage.removeItem(ARTICLES_CACHE_TIMESTAMP_KEY);
    } catch (error) {
        console.warn('Error clearing cache:', error);
    }
}

const db = getFirestore(app);
const storage = getStorage(app);

export async function checkAccessCode(accessCode: string): Promise<boolean> {
    const accessCodeDoc = await getDoc(doc(db, "accessCodes", accessCode));
    return accessCodeDoc.exists();
}

// Fetch fresh PRSM data from Firestore (bypasses cache)
async function fetchPRSMFromFirestore(): Promise<PRSM | null> {
    const prsmDoc = await getDoc(doc(db, "info", "prsm"));
    if (prsmDoc.exists()) {
        const prsm = PRSM.fromMap(prsmDoc.data());
        setCachePRSM(prsm); // Update cache with fresh data
        return prsm;
    }
    return null;
}

// Get PRSM with caching (stale-while-revalidate strategy)
// Returns cached data immediately if available, then refreshes in background
export async function getPRSM(options?: { forceRefresh?: boolean }): Promise<PRSM | null> {
    const forceRefresh = options?.forceRefresh ?? false;
    
    // If force refresh, bypass cache entirely
    if (forceRefresh) {
        return fetchPRSMFromFirestore();
    }
    
    const cachedData = getCachedPRSM();
    const cacheValid = isCacheValid();
    
    // If we have valid cached data, return it immediately
    if (cachedData && cacheValid) {
        return cachedData;
    }
    
    // If we have stale cached data, return it and refresh in background
    if (cachedData && !cacheValid) {
        // Refresh cache in background (fire and forget)
        fetchPRSMFromFirestore().catch(err => 
            console.warn('Background cache refresh failed:', err)
        );
        return cachedData;
    }
    
    // No cache available, fetch fresh data
    return fetchPRSMFromFirestore();
}

// Get PRSM with required fresh data (for dashboard/admin pages)
export async function getPRSMFresh(): Promise<PRSM | null> {
    return getPRSM({ forceRefresh: true });
}

export async function updatePRSM(prsm: PRSM): Promise<void> {
    console.log("Updating PRSM in Firestore...");
    console.log(prsm.toMap());
    await updateDoc(doc(db, "info", "prsm"), prsm.toMap());
    // Update cache with the new data
    setCachePRSM(prsm);
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

// Articles cache
function getCachedArticles(): Article[] | null {
    try {
        const cached = localStorage.getItem(ARTICLES_CACHE_KEY);
        const timestamp = localStorage.getItem(ARTICLES_CACHE_TIMESTAMP_KEY);
        if (cached && timestamp) {
            const parsed = JSON.parse(cached);
            return parsed.map((a: { id: string; data: Record<string, unknown> }) => Article.fromMap(a.data, a.id));
        }
    } catch (error) {
        console.warn('Error reading articles cache:', error);
        clearArticlesCache();
    }
    return null;
}

function isArticlesCacheValid(): boolean {
    try {
        const timestamp = localStorage.getItem(ARTICLES_CACHE_TIMESTAMP_KEY);
        if (!timestamp) return false;
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        return cacheAge < CACHE_DURATION_MS;
    } catch {
        return false;
    }
}

function setCacheArticles(articles: Article[]): void {
    try {
        const serialized = articles.map(a => ({ id: a.id, data: a.toMap() }));
        localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(serialized));
        localStorage.setItem(ARTICLES_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.warn('Error writing articles cache:', error);
    }
}

function clearArticlesCache(): void {
    try {
        localStorage.removeItem(ARTICLES_CACHE_KEY);
        localStorage.removeItem(ARTICLES_CACHE_TIMESTAMP_KEY);
    } catch (error) {
        console.warn('Error clearing articles cache:', error);
    }
}

// Fetch fresh articles from Firestore
async function fetchArticlesFromFirestore(): Promise<Article[]> {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(d => Article.fromMap(d.data(), d.id));
    setCacheArticles(articles);
    return articles;
}

// Articles CRUD (separate Firestore collection)
export async function getArticles(options?: { forceRefresh?: boolean }): Promise<Article[]> {
    const forceRefresh = options?.forceRefresh ?? false;

    if (forceRefresh) {
        return fetchArticlesFromFirestore();
    }

    const cachedData = getCachedArticles();
    const cacheValid = isArticlesCacheValid();

    if (cachedData && cacheValid) {
        return cachedData;
    }

    if (cachedData && !cacheValid) {
        fetchArticlesFromFirestore().catch(err =>
            console.warn('Background articles cache refresh failed:', err)
        );
        return cachedData;
    }

    return fetchArticlesFromFirestore();
}

export async function getArticlesFresh(): Promise<Article[]> {
    return getArticles({ forceRefresh: true });
}

export async function getArticle(id: string): Promise<Article | null> {
    const articleDoc = await getDoc(doc(db, "articles", id));
    if (articleDoc.exists()) {
        return Article.fromMap(articleDoc.data(), articleDoc.id);
    }
    return null;
}

export async function createArticle(article: Article): Promise<string> {
    const docRef = await addDoc(collection(db, "articles"), article.toMap());
    clearArticlesCache();
    return docRef.id;
}

export async function updateArticle(id: string, article: Article): Promise<void> {
    await updateDoc(doc(db, "articles", id), article.toMap());
    clearArticlesCache();
}

export async function deleteArticle(id: string): Promise<void> {
    await deleteDoc(doc(db, "articles", id));
    clearArticlesCache();
}

// Newsletter subscribers
export async function subscribeNewsletter(email: string): Promise<void> {
    await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: new Date().toISOString(),
    });
}

export async function getSubscribers(): Promise<string[]> {
    const snapshot = await getDocs(collection(db, "subscribers"));
    return snapshot.docs.map(d => d.data().email as string);
}