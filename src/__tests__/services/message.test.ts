import { supabase } from '@/lib/supabase';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
} from '@/services/message.service';

// supabase is auto-mocked via moduleNameMapper

// Helper: build a chainable query builder that resolves to the given value
function mockQueryChain(resolvedValue: any) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'in', 'is', 'order', 'range', 'limit', 'filter',
  ];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn().mockResolvedValue(resolvedValue);
  chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);
  chain.then = jest.fn((resolve) => resolve(resolvedValue));
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getConversations', () => {
  it('returns empty array when user has no conversations', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getConversations('user-1');

    expect(result.data).toEqual([]);
  });

  it('returns empty array when participations query errors', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'DB error' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getConversations('user-1');

    expect(result.data).toEqual([]);
    expect(result.error).toEqual({ message: 'DB error' });
  });

  it('returns empty array when participations is null', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getConversations('user-1');

    expect(result.data).toEqual([]);
  });

  it('fetches conversations, participants, profiles, messages, and unread counts', async () => {
    const participationsChain = mockQueryChain({
      data: [{ conversation_id: 'conv-1', last_read_at: '2026-01-01T00:00:00Z' }],
      error: null,
    });
    const conversationsChain = mockQueryChain({
      data: [{ id: 'conv-1', is_group: false, updated_at: '2026-01-02T00:00:00Z' }],
      error: null,
    });
    const allParticipantsChain = mockQueryChain({
      data: [
        { conversation_id: 'conv-1', user_id: 'user-1' },
        { conversation_id: 'conv-1', user_id: 'user-2' },
      ],
      error: null,
    });
    const profilesChain = mockQueryChain({
      data: [
        { id: 'user-1', username: 'me' },
        { id: 'user-2', username: 'them' },
      ],
      error: null,
    });
    const recentMessagesChain = mockQueryChain({
      data: [
        { conversation_id: 'conv-1', content: 'hello', created_at: '2026-01-02T00:00:00Z', sender_id: 'user-2' },
      ],
      error: null,
    });
    const unreadMessagesChain = mockQueryChain({
      data: [
        { conversation_id: 'conv-1', created_at: '2026-01-02T00:00:00Z', sender_id: 'user-2' },
      ],
      error: null,
    });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      switch (callCount) {
        case 1: return participationsChain;     // conversation_participants (user's)
        case 2: return conversationsChain;       // conversations
        case 3: return allParticipantsChain;     // conversation_participants (all)
        case 4: return profilesChain;            // profiles
        case 5: return recentMessagesChain;      // messages (recent)
        case 6: return unreadMessagesChain;      // messages (unread)
        default: return mockQueryChain({ data: null, error: null });
      }
    });

    const result = await getConversations('user-1');

    expect(result.error).toBeNull();
    expect(result.data.length).toBe(1);
    expect(result.data[0].participants.length).toBe(2);
    expect(result.data[0].lastMessage).toBeTruthy();
    expect(result.data[0].unreadCount).toBe(1);
  });

  it('returns empty array when conversations query errors', async () => {
    const participationsChain = mockQueryChain({
      data: [{ conversation_id: 'conv-1', last_read_at: null }],
      error: null,
    });
    const conversationsChain = mockQueryChain({
      data: null,
      error: { message: 'Query error' },
    });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return participationsChain;
      return conversationsChain;
    });

    const result = await getConversations('user-1');

    expect(result.data).toEqual([]);
    expect(result.error).toEqual({ message: 'Query error' });
  });
});

describe('getOrCreateConversation', () => {
  it('returns existing conversation when both users share one', async () => {
    const myConvsChain = mockQueryChain({
      data: [{ conversation_id: 'conv-1' }],
      error: null,
    });
    const theirConvsChain = mockQueryChain({
      data: [{ conversation_id: 'conv-1' }],
      error: null,
    });
    const convChain = mockQueryChain({
      data: { id: 'conv-1', is_group: false },
      error: null,
    });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return myConvsChain;
      if (callCount === 2) return theirConvsChain;
      return convChain;
    });

    const result = await getOrCreateConversation('user-1', 'user-2');

    expect(result.data).toBeTruthy();
    expect(result.data!.id).toBe('conv-1');
    expect(result.error).toBeNull();
  });

  it('creates a new conversation when none exists', async () => {
    const myConvsChain = mockQueryChain({ data: [], error: null });
    const theirConvsChain = mockQueryChain({ data: [], error: null });
    const newConvChain = mockQueryChain({
      data: { id: 'conv-new', is_group: false },
      error: null,
    });
    // For the participant insert
    const participantChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return myConvsChain;
      if (callCount === 2) return theirConvsChain;
      if (callCount === 3) return newConvChain;
      return participantChain;
    });

    const result = await getOrCreateConversation('user-1', 'user-2');

    expect(result.data).toBeTruthy();
    expect(result.data!.id).toBe('conv-new');
    expect(result.error).toBeNull();
  });

  it('returns error when conversation creation fails', async () => {
    const myConvsChain = mockQueryChain({ data: [], error: null });
    const theirConvsChain = mockQueryChain({ data: [], error: null });
    const newConvChain = mockQueryChain({
      data: null,
      error: { message: 'Insert failed' },
    });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return myConvsChain;
      if (callCount === 2) return theirConvsChain;
      return newConvChain;
    });

    const result = await getOrCreateConversation('user-1', 'user-2');

    expect(result.data).toBeNull();
    expect(result.error).toEqual({ message: 'Insert failed' });
  });
});

describe('getMessages', () => {
  it('returns messages array for a conversation', async () => {
    const mockMessages = [
      { id: 'msg-1', content: 'Hello', sender: { id: 'user-1', username: 'alice' } },
      { id: 'msg-2', content: 'Hi!', sender: { id: 'user-2', username: 'bob' } },
    ];
    const chain = mockQueryChain({ data: mockMessages, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getMessages('conv-1', 0);

    expect(supabase.from).toHaveBeenCalledWith('messages');
    expect(result.data.length).toBe(2);
    expect(result.error).toBeNull();
  });

  it('returns empty array when no messages exist', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getMessages('conv-1', 0);

    expect(result.data).toEqual([]);
  });

  it('returns empty array when data is null', async () => {
    const chain = mockQueryChain({ data: null, error: { message: 'Error' } });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const result = await getMessages('conv-1', 0);

    expect(result.data).toEqual([]);
    expect(result.error).toEqual({ message: 'Error' });
  });

  it('supports pagination via page parameter', async () => {
    const chain = mockQueryChain({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await getMessages('conv-1', 2);

    // Verify range was called (page 2 with MESSAGES_PAGE_SIZE=30 => from=60, to=89)
    expect(chain.range).toHaveBeenCalledWith(60, 89);
  });
});

describe('sendMessage', () => {
  it('inserts a text message and updates conversation timestamp', async () => {
    const insertChain = mockQueryChain({
      data: { id: 'msg-1', content: 'Hello', sender: { id: 'user-1' } },
      error: null,
    });
    const updateChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return insertChain;
      return updateChain;
    });

    const result = await sendMessage('conv-1', 'user-1', 'Hello', 'text');

    expect(supabase.from).toHaveBeenCalledWith('messages');
    expect(insertChain.insert).toHaveBeenCalledWith({
      conversation_id: 'conv-1',
      sender_id: 'user-1',
      content: 'Hello',
      message_type: 'text',
      media_url: null,
      shared_post_id: null,
    });
    expect(result.data).toBeTruthy();
    expect(result.error).toBeNull();
  });

  it('inserts a message with media url', async () => {
    const insertChain = mockQueryChain({
      data: { id: 'msg-2', content: null, media_url: 'https://example.com/image.jpg' },
      error: null,
    });
    const updateChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return insertChain;
      return updateChain;
    });

    await sendMessage('conv-1', 'user-1', null, 'image', 'https://example.com/image.jpg');

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        media_url: 'https://example.com/image.jpg',
        content: null,
        message_type: 'image',
      })
    );
  });

  it('does not update conversation when insert fails', async () => {
    const insertChain = mockQueryChain({
      data: null,
      error: { message: 'Insert failed' },
    });

    (supabase.from as jest.Mock).mockReturnValue(insertChain);

    const result = await sendMessage('conv-1', 'user-1', 'Hello');

    expect(result.error).toEqual({ message: 'Insert failed' });
    // from should only be called once (for messages insert, not for conversation update)
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('defaults message_type to text', async () => {
    const insertChain = mockQueryChain({ data: { id: 'msg-1' }, error: null });
    const updateChain = mockQueryChain({ data: null, error: null });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return insertChain;
      return updateChain;
    });

    await sendMessage('conv-1', 'user-1', 'Hi');

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ message_type: 'text' })
    );
  });
});

describe('markAsRead', () => {
  it('updates last_read_at for the user in the conversation', async () => {
    const chain = mockQueryChain({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const { error } = await markAsRead('conv-1', 'user-1');

    expect(supabase.from).toHaveBeenCalledWith('conversation_participants');
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ last_read_at: expect.any(String) })
    );
    expect(chain.eq).toHaveBeenCalledWith('conversation_id', 'conv-1');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(error).toBeNull();
  });
});
