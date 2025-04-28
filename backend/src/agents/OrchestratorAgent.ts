import { BaseAgent } from './BaseAgent';
import { AgentResponse } from './AgentInterface';
import { ThinkingAgent } from './ThinkingAgent';
import { DeveloperAgent } from './DeveloperAgent';
import { EditorAgent } from './EditorAgent';

/**
 * Agent responsible for coordinating between other agents
 */
export class OrchestratorAgent extends BaseAgent {
  private thinkingAgent: ThinkingAgent;
  private developerAgent: DeveloperAgent;
  private editorAgent: EditorAgent;
  
  constructor() {
    super(
      'Orchestrator Agent',
      'Coordinates between agents and manages workflow'
    );
    
    this.thinkingAgent = new ThinkingAgent();
    this.developerAgent = new DeveloperAgent();
    this.editorAgent = new EditorAgent();
  }
  
  /**
   * Process a user request through the agent system
   * @param message The user message
   * @param context Additional context
   * @returns The final response after processing through all necessary agents
   */
  async process(message: string, context?: any): Promise<AgentResponse[]> {
    try {
      const responses: AgentResponse[] = [];
      
      // Step 1: Analyze the request with the Thinking Agent
      const thinkingResponse = await this.thinkingAgent.process(message, context);
      responses.push(thinkingResponse);
      
      if (thinkingResponse.type === 'error') {
        return responses;
      }
      
      // Extract the plan from the thinking agent's response
      const plan = thinkingResponse.content as any;
      
      // Step 2: Execute each step in the plan
      for (const step of plan.steps) {
        let stepResponse: AgentResponse;
        
        switch (step.agent) {
          case 'DeveloperAgent':
            stepResponse = await this.developerAgent.process(message, step.params);
            break;
          case 'EditorAgent':
            // Find the most recent code response to edit
            const codeResponses = responses.filter(r => r.type === 'code');
            if (codeResponses.length > 0) {
              const latestCode = codeResponses[codeResponses.length - 1];
              stepResponse = await this.editorAgent.process(
                latestCode.content as string, 
                { 
                  type: 'code',
                  language: latestCode.metadata?.language
                }
              );
            } else {
              stepResponse = this.createErrorResponse('No code found to edit');
            }
            break;
          default:
            stepResponse = this.createErrorResponse(`Unknown agent: ${step.agent}`);
        }
        
        responses.push(stepResponse);
        
        if (stepResponse.type === 'error') {
          break;
        }
      }
      
      return responses;
    } catch (error) {
      console.error('Error in OrchestratorAgent:', error);
      return [this.createErrorResponse('Failed to orchestrate agents')];
    }
  }
}