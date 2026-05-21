export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

const STORAGE_KEY = 'dinoclass_newsletters';

export function getSubscribers(): Subscriber[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addSubscriber(subscriber: Omit<Subscriber, 'id' | 'createdAt'>): Subscriber {
  const subscribers = getSubscribers();
  const newSub: Subscriber = {
    ...subscriber,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  subscribers.push(newSub);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
  return newSub;
}

export function deleteSubscriber(id: string): void {
  const subscribers = getSubscribers().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
}
