import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateStaticParams() {
    try {
        const projectsCollection = collection(db, 'projects');
        const querySnapshot = await getDocs(projectsCollection);

        return querySnapshot.docs.map((doc) => ({
            slug: doc.data().slug || doc.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        // Return empty array if Firebase is not accessible at build time
        // The page will still work with client-side rendering
        return [];
    }
}
