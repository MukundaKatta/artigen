import { useState, useCallback, useEffect, useRef } from 'react';
import { createRun, createTemplate as createTemplateApi, getRun, getTemplate, updateRun } from '@/services/workflow.service';
import type { WorkflowTemplateWithUser, WorkflowRun, WorkflowStep } from '@/services/workflow.service';

export function useWorkflow(userId?: string) {
  const [template, setTemplate] = useState<WorkflowTemplateWithUser | null>(null);
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // ── Load a template ───────────────────────────────

  const loadTemplate = useCallback(async (templateId: string) => {
    setLoading(true);
    const { data } = await getTemplate(templateId);
    setTemplate(data);
    setLoading(false);
    return data;
  }, []);

  // ── Load a run ────────────────────────────────────

  const loadRun = useCallback(async (runId: string) => {
    setLoading(true);
    const { data } = await getRun(runId);
    if (data) {
      setRun(data);
      setCurrentStep(data.current_step);
    }
    setLoading(false);
    return data;
  }, []);

  // ── Create a template ─────────────────────────────

  const createTemplate = useCallback(
    async (name: string, description: string | undefined, steps: WorkflowStep[], isPublic = false) => {
      if (!userId) return { data: null, error: 'Not authenticated' };
      setLoading(true);
      const result = await createTemplateApi(userId, name, description, steps, isPublic);
      setLoading(false);
      return result;
    },
    [userId],
  );

  // ── Start a run ───────────────────────────────────

  const startRun = useCallback(
    async (name: string, steps: WorkflowStep[], templateId?: string) => {
      if (!userId) return { data: null, error: 'Not authenticated' };
      setLoading(true);

      const { data, error } = await createRun(userId, name, steps, templateId);
      if (data) {
        setRun(data);
        setCurrentStep(0);

        // Start polling for progress (3s interval)
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          const { data: updated } = await getRun(data.id);
          if (updated) {
            setRun(updated);
            setCurrentStep(updated.current_step);
            if (updated.status === 'completed' || updated.status === 'failed') {
              clearInterval(pollRef.current);
              setLoading(false);
            }
          }
        }, 3000);
      } else {
        setLoading(false);
      }

      return { data, error };
    },
    [userId],
  );

  // ── Pause a run ───────────────────────────────────

  const pauseRun = useCallback(async () => {
    if (!run) return;
    const { data } = await updateRun(run.id, { status: 'paused' });
    if (data) {
      setRun(data);
      if (pollRef.current) clearInterval(pollRef.current);
      setLoading(false);
    }
  }, [run]);

  // ── Resume a run ──────────────────────────────────

  const resumeRun = useCallback(async () => {
    if (!run) return;
    setLoading(true);
    const { data } = await updateRun(run.id, { status: 'running' });
    if (data) {
      setRun(data);

      // Resume polling
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const { data: updated } = await getRun(run.id);
        if (updated) {
          setRun(updated);
          setCurrentStep(updated.current_step);
          if (updated.status === 'completed' || updated.status === 'failed') {
            clearInterval(pollRef.current);
            setLoading(false);
          }
        }
      }, 3000);
    }
  }, [run]);

  // ── Clean up polling on unmount ───────────────────

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    template,
    run,
    loading,
    currentStep,
    loadTemplate,
    loadRun,
    createTemplate,
    startRun,
    pauseRun,
    resumeRun,
  };
}
