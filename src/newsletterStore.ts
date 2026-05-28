import { supabase } from './lib/supabaseClient';

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}

export async function addSubscriber(subscriber: Omit<Subscriber, 'id' | 'createdAt'>): Promise<Subscriber | null> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        name: subscriber.name,
        phone: subscriber.phone,
        email: subscriber.email
      }])
      .select()
      .single();

    if (error) throw error;

    const newSub = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      createdAt: data.created_at
    };

    // 구글 시트 웹훅 연동 전송
    try {
      const webhookUrl = localStorage.getItem('google_sheet_webhook_url');
      if (webhookUrl && webhookUrl.trim()) {
        fetch(webhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSub)
        }).catch(err => console.error('Webhook send failed:', err));
      }
    } catch (e) {
      console.error('Webhook error:', e);
    }

    return newSub;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return null;
  }
}

export async function deleteSubscriber(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting subscriber:', error);
  }
}
