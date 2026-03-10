import { supabase } from '@/lib/supabase';

export type MoodBoardItem = {
  id: string;
  type: 'image' | 'color' | 'text' | 'post';
  content: string; // URL for image/post, hex for color, text for text
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  metadata?: Record<string, string>;
};

export type MoodBoard = {
  id: string;
  title: string;
  description: string;
  user_id: string;
  is_public: boolean;
  background_color: string;
  items: MoodBoardItem[];
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export async function createMoodBoard(
  userId: string,
  title: string,
  description: string = '',
  isPublic: boolean = true,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('mood_boards')
    .insert({
      title,
      description,
      user_id: userId,
      is_public: isPublic,
      background_color: '#FFFFFF',
    })
    .select('id')
    .single();

  return error ? null : data.id;
}

export async function fetchUserMoodBoards(userId: string): Promise<MoodBoard[]> {
  const { data } = await supabase
    .from('mood_boards')
    .select('*, items:mood_board_items(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return (data || []) as MoodBoard[];
}

export async function fetchPublicMoodBoards(): Promise<MoodBoard[]> {
  const { data } = await supabase
    .from('mood_boards')
    .select('*, items:mood_board_items(*), user:profiles(username, avatar_url)')
    .eq('is_public', true)
    .order('likes_count', { ascending: false })
    .limit(20);

  return (data || []) as MoodBoard[];
}

export async function addItemToBoard(
  boardId: string,
  item: Omit<MoodBoardItem, 'id'>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('mood_board_items')
    .insert({ board_id: boardId, ...item })
    .select('id')
    .single();

  return error ? null : data.id;
}

export async function updateBoardItem(
  itemId: string,
  updates: Partial<Pick<MoodBoardItem, 'x' | 'y' | 'width' | 'height' | 'rotation' | 'zIndex'>>,
): Promise<void> {
  await supabase.from('mood_board_items').update(updates).eq('id', itemId);
}

export async function removeBoardItem(itemId: string): Promise<void> {
  await supabase.from('mood_board_items').delete().eq('id', itemId);
}

export async function generateMoodBoardFromPrompt(
  userId: string,
  prompt: string,
): Promise<string | null> {
  // Create board from AI-suggested colors, styles, and reference images
  const boardId = await createMoodBoard(userId, `Mood: ${prompt}`, `AI-generated mood board for: ${prompt}`);
  if (!boardId) return null;

  // Add suggested color palette
  const palettes: Record<string, string[]> = {
    warm: ['#FF6B6B', '#FF8E53', '#FECA57', '#FF9FF3', '#F368E0'],
    cool: ['#0095F6', '#00D4FF', '#48DBFB', '#0ABDE3', '#10AC84'],
    dark: ['#2C3A47', '#1B1464', '#0C2461', '#6D214F', '#182C61'],
    nature: ['#27AE60', '#2ECC71', '#F1C40F', '#8B6914', '#1E8449'],
    pastel: ['#FFB8B8', '#B8E0FF', '#FFFBB8', '#D5B8FF', '#B8FFD5'],
  };

  const promptLower = prompt.toLowerCase();
  let selectedPalette = palettes.warm;
  if (promptLower.includes('cool') || promptLower.includes('ocean') || promptLower.includes('calm')) selectedPalette = palettes.cool;
  else if (promptLower.includes('dark') || promptLower.includes('moody') || promptLower.includes('noir')) selectedPalette = palettes.dark;
  else if (promptLower.includes('nature') || promptLower.includes('forest') || promptLower.includes('earth')) selectedPalette = palettes.nature;
  else if (promptLower.includes('soft') || promptLower.includes('pastel') || promptLower.includes('gentle')) selectedPalette = palettes.pastel;

  // Add color swatches
  for (let i = 0; i < selectedPalette.length; i++) {
    await addItemToBoard(boardId, {
      type: 'color',
      content: selectedPalette[i],
      x: 20 + (i % 3) * 110,
      y: 20 + Math.floor(i / 3) * 110,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: i,
    });
  }

  // Add text label
  await addItemToBoard(boardId, {
    type: 'text',
    content: prompt,
    x: 20,
    y: 260,
    width: 300,
    height: 40,
    rotation: 0,
    zIndex: 10,
  });

  return boardId;
}
