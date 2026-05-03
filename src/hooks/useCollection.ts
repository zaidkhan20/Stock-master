import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit, 
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function useCollection<T>(collectionName: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      setData(items);
      setLoading(false);
    }, (err) => {
      // Catching errors as required by instructions
      try {
        handleFirestoreError(err, OperationType.LIST, collectionName);
      } catch (formattedError) {
        if (formattedError instanceof Error) {
          console.error(`Error fetching ${collectionName}:`, formattedError.message);
          setError(formattedError);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [collectionName]);

  return { data, loading, error };
}
