import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

// ── Types ────────────────────────────────────────────

export type WorkflowStepType = 'generate' | 'restyle' | 'inpaint' | 'upscale';

export type WorkflowStep = {
  type: WorkflowStepType;
  prompt?: string;
  model_id?: string;
  settings?: Record<string, string | number | boolean | null>;
  style_preset_id?: string;
  custom_prompt?: string;
  mask_prompt?: string;
  scale_factor?: number;
};

export type WorkflowStepResult = {
  step_index?: number;
  image_url?: string;
  output_url?: string;
  prompt_used?: string;
  error?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type WorkflowTemplate = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  is_public: boolean;
  use_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
};

export type WorkflowRun = {
  id: string;
  user_id: string;
  template_id: string | null;
  name: string;
  steps: WorkflowStep[];
  current_step: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  results: WorkflowStepResult[];
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type WorkflowSave = {
  id: string;
  user_id: string;
  template_id: string;
  created_at: string;
};

export type WorkflowTemplateWithUser = WorkflowTemplate & {
  user: { id: string; username: string; avatar_url: string | null };
};

// ── Templates ────────────────────────────────────────

export async function createTemplate(
  userId: string,
  name: string,
  description: string | undefined,
  steps: WorkflowStep[],
  isPublic = false,
) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .insert({
      user_id: userId,
      name,
      description: description || null,
      steps: steps as unknown as Record<string, unknown>[],
      is_public: isPublic,
    })
    .select()
    .single();

  return { data: data as unknown as WorkflowTemplate | null, error };
}

export async function updateTemplate(
  templateId: string,
  updates: Partial<Pick<WorkflowTemplate, 'name' | 'description' | 'steps' | 'is_public'>>,
) {
  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.steps !== undefined) payload.steps = JSON.stringify(updates.steps);
  if (updates.is_public !== undefined) payload.is_public = updates.is_public;

  const { data, error } = await supabase
    .from('workflow_templates')
    .update(payload)
    .eq('id', templateId)
    .select()
    .single();

  return { data: data as unknown as WorkflowTemplate | null, error };
}

export async function deleteTemplate(templateId: string) {
  const { error } = await supabase
    .from('workflow_templates')
    .delete()
    .eq('id', templateId);

  return { error };
}

export async function getTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('id', templateId)
    .single();

  return { data: data as unknown as WorkflowTemplateWithUser | null, error };
}

export async function getPublicTemplates(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('is_public', true)
    .order('use_count', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as WorkflowTemplateWithUser[], error };
}

export async function getMyTemplates(userId: string) {
  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*, user:profiles!user_id(id, username, avatar_url)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return { data: (data || []) as unknown as WorkflowTemplateWithUser[], error };
}

// ── Template Saves ───────────────────────────────────

export async function saveTemplate(userId: string, templateId: string) {
  const { error } = await supabase
    .from('workflow_saves')
    .insert({ user_id: userId, template_id: templateId });

  if (error) return { error };

  // Increment save_count
  const { data: template } = await supabase
    .from('workflow_templates')
    .select('save_count')
    .eq('id', templateId)
    .single();

  if (template) {
    await supabase
      .from('workflow_templates')
      .update({ save_count: (template.save_count || 0) + 1 } as any)
      .eq('id', templateId);
  }

  return { error: null };
}

export async function unsaveTemplate(userId: string, templateId: string) {
  const { error } = await supabase
    .from('workflow_saves')
    .delete()
    .eq('user_id', userId)
    .eq('template_id', templateId);

  if (error) return { error };

  // Decrement save_count
  const { data: template } = await supabase
    .from('workflow_templates')
    .select('save_count')
    .eq('id', templateId)
    .single();

  if (template) {
    await supabase
      .from('workflow_templates')
      .update({ save_count: Math.max(0, (template.save_count || 0) - 1) } as any)
      .eq('id', templateId);
  }

  return { error: null };
}

export async function getUserSavedTemplateIds(templateIds: string[], userId: string): Promise<Set<string>> {
  if (templateIds.length === 0) return new Set();

  const { data } = await supabase
    .from('workflow_saves')
    .select('template_id')
    .in('template_id', templateIds)
    .eq('user_id', userId);

  return new Set((data ?? []).map((s) => s.template_id as string));
}

// ── Runs ─────────────────────────────────────────────

export async function createRun(
  userId: string,
  name: string,
  steps: WorkflowStep[],
  templateId?: string,
) {
  const { data, error } = await supabase
    .from('workflow_runs')
    .insert({
      user_id: userId,
      template_id: templateId || null,
      name,
      steps: steps as unknown as Record<string, unknown>[],
      status: 'pending',
      current_step: 0,
    })
    .select()
    .single();

  // Increment use_count on template
  if (data && templateId) {
    const { data: template } = await supabase
      .from('workflow_templates')
      .select('use_count')
      .eq('id', templateId)
      .single();

    if (template) {
      await supabase
        .from('workflow_templates')
        .update({ use_count: (template.use_count || 0) + 1 } as any)
        .eq('id', templateId);
    }
  }

  return { data: data as unknown as WorkflowRun | null, error };
}

export async function updateRun(
  runId: string,
  updates: Partial<Pick<WorkflowRun, 'current_step' | 'status' | 'results' | 'error_message' | 'completed_at'>>,
) {
  const payload: Record<string, any> = {};
  if (updates.current_step !== undefined) payload.current_step = updates.current_step;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.results !== undefined) payload.results = JSON.stringify(updates.results);
  if (updates.error_message !== undefined) payload.error_message = updates.error_message;
  if (updates.completed_at !== undefined) payload.completed_at = updates.completed_at;

  const { data, error } = await supabase
    .from('workflow_runs')
    .update(payload)
    .eq('id', runId)
    .select()
    .single();

  return { data: data as unknown as WorkflowRun | null, error };
}

export async function getRun(runId: string) {
  const { data, error } = await supabase
    .from('workflow_runs')
    .select('*')
    .eq('id', runId)
    .single();

  return { data: data as unknown as WorkflowRun | null, error };
}

export async function getMyRuns(userId: string) {
  const { data, error } = await supabase
    .from('workflow_runs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as unknown as WorkflowRun[], error };
}
