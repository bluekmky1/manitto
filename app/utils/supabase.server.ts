import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface Room {
  id: string;
  room_code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  room_id: string;
  user_code: string;
  nickname?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManittoPair {
  id: string;
  room_id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  original_content: string;
  created_at: string;
}

// User authentication function
export async function authenticateUser(userCode: string): Promise<{
  isValid: boolean;
  userInfo?: {
    userId: string;
    roomId: string;
    roomCode: string;
    userCode: string;
    nickname?: string;
  };
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        room_id,
        user_code,
        nickname,
        rooms!inner (
          id,
          room_code,
          name,
          is_active
        )
      `)
      .eq('user_code', userCode)
      .eq('is_active', true)
      .eq('rooms.is_active', true)
      .single();

    if (error || !data) {
      return { isValid: false };
    }

    return {
      isValid: true,
      userInfo: {
        userId: data.id,
        roomId: data.room_id,
        roomCode: (data.rooms as any).room_code,
        userCode: data.user_code,
        nickname: data.nickname || data.user_code // fallback to userCode if no nickname
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { isValid: false };
  }
}

// Get manitto target for a user
export async function getManittoCTarget(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('manitto_pairs')
      .select(`
        receiver:users!manitto_pairs_receiver_id_fkey (
          id,
          user_code,
          nickname,
          room_id
        )
      `)
      .eq('giver_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return (data.receiver as any) as User;
  } catch (error) {
    console.error('Error getting manitto target:', error);
    return null;
  }
}

// Get messages for a user
export async function getMessagesForUser(userId: string): Promise<{
  sent: Array<Message & { receiver: Pick<User, 'nickname'> }>;
  received: Array<Message & { sender: Pick<User, 'nickname'> }>;
}> {
  try {
    // Get sent messages
    const { data: sentData, error: sentError } = await supabase
      .from('messages')
      .select(`
        *,
        receiver:users!messages_receiver_id_fkey (nickname)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    // Get received messages
    const { data: receivedData, error: receivedError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (nickname)
      `)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });

    if (sentError || receivedError) {
      throw new Error('Error fetching messages');
    }

    return {
      sent: (sentData || []) as any,
      received: (receivedData || []) as any
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    return { sent: [], received: [] };
  }
}

// Get current user information
export async function getCurrentUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Transform message using GPT
async function transformMessage(originalMessage: string): Promise<{ success: boolean; transformedMessage?: string; error?: string }> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'AI 변환 서비스가 설정되지 않았습니다.' };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/transform-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        message: originalMessage.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to transform message:', response.statusText, errorData);
      return { success: false, error: 'AI 변환에 실패했습니다. 다시 시도해주세요.' };
    }

    const data = await response.json();
    const transformedMessage = data.transformedMessage;
    
    if (!transformedMessage) {
      return { success: false, error: 'AI 변환 결과를 받을 수 없습니다.' };
    }

    return { success: true, transformedMessage };
  } catch (error) {
    console.error('Error transforming message:', error);
    return { success: false, error: 'AI 변환 중 오류가 발생했습니다.' };
  }
}

// Send a message
export async function sendMessage(
  senderId: string,
  receiverId: string,
  roomId: string,
  content: string
): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    // Get the actual room ID from the sender's user record
    const { data: senderData, error: senderError } = await supabase
      .from('users')
      .select('room_id')
      .eq('id', senderId)
      .single();
      
    if (senderError || !senderData) {
      return { success: false, error: 'Sender not found' };
    }

    const originalContent = content.trim();
    
    // Transform the message using GPT
    const transformResult = await transformMessage(originalContent);
    
    if (!transformResult.success) {
      return { success: false, error: transformResult.error };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        room_id: senderData.room_id,
        content: transformResult.transformedMessage,
        original_content: originalContent
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}