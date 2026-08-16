/**
 * React hook for Gemini-powered security analysis
 */

import { useState, useCallback } from 'react';
import { geminiClient, AnalysisResult, AgentInfo } from '../lib/gemini-client';

interface UseGeminiAnalysisState {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  agents: AgentInfo[];
}

export function useGeminiAnalysis() {
  const [state, setState] = useState<UseGeminiAnalysisState>({
    loading: false,
    error: null,
    result: null,
    agents: [],
  });

  const analyze = useCallback(async (log: string) => {
    if (!log.trim()) {
      setState((prev) => ({
        ...prev,
        error: 'Log cannot be empty',
      }));
      return null;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      result: null,
    }));

    try {
      const result = await geminiClient.analyzeLog(log);
      setState((prev) => ({
        ...prev,
        loading: false,
        result,
        error: null,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const analyzeWithAgent = useCallback(async (agentId: string, log: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await geminiClient.analyzeWithAgent(agentId, log);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      const agents = await geminiClient.getAgents();
      setState((prev) => ({
        ...prev,
        agents,
      }));
      return agents;
    } catch (error) {
      console.error('Failed to load agents:', error);
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
      agents: state.agents,
    });
  }, [state.agents]);

  return {
    ...state,
    analyze,
    analyzeWithAgent,
    loadAgents,
    reset,
  };
}
