import { describe, it, expect, vi } from 'vitest';
import { AguiChain, EventType } from '../src';

describe('AguiChain', () => {
  it('should create a new chain with options', () => {
    const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' });
    expect(chain).toBeInstanceOf(AguiChain);
  });

  it('should subscribe to events', () => {
    const chain = new AguiChain();
    const callback = vi.fn();
    
    chain.subscribe(callback);
    chain.text('Hello');
    
    expect(callback).toHaveBeenCalled();
  });

  it('should unsubscribe from events', () => {
    const chain = new AguiChain();
    const callback = vi.fn();
    
    chain.subscribe(callback);
    chain.unsubscribe(callback);
    chain.text('Hello');
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle text events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.text('Hello World');
    chain.end();
    
    expect(events).toHaveLength(5); // RUN_STARTED, TEXT_START, TEXT_CONTENT, TEXT_END, RUN_FINISHED
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[1].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(events[2].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(events[2].delta).toBe('Hello World');
    expect(events[3].type).toBe(EventType.TEXT_MESSAGE_END);
    expect(events[4].type).toBe(EventType.RUN_FINISHED);
  });

  it('should handle multiple text calls in sequence', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.text('Hello');
    chain.text(' ');
    chain.text('World');
    chain.end();
    
    // Should have: RUN_STARTED, TEXT_START, TEXT_CONTENT(x3), TEXT_END, RUN_FINISHED
    expect(events).toHaveLength(7);
    expect(events[2].delta).toBe('Hello');
    expect(events[3].delta).toBe(' ');
    expect(events[4].delta).toBe('World');
  });

  it('should handle thinking events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.think('Processing...');
    chain.end();
    
    expect(events).toHaveLength(5); // RUN_STARTED, THINKING_START, THINKING_CONTENT, THINKING_END, RUN_FINISHED
    expect(events[1].type).toBe(EventType.THINKING_START);
    expect(events[2].type).toBe(EventType.THINKING_TEXT_MESSAGE_CONTENT);
    expect(events[2].delta).toBe('Processing...');
    expect(events[3].type).toBe(EventType.THINKING_END);
  });

  it('should handle tool call events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.tool_call_start({
      toolCallId: 'tool_1',
      toolCallName: 'fetch_data'
    });
    chain.tool_call_args('{"url": "https://api.example.com"}');
    chain.tool_call_end();
    chain.tool_call_result({
      messageId: 'msg_1',
      toolCallId: 'tool_1',
      content: 'Data fetched'
    });
    chain.end();
    
    expect(events).toHaveLength(6); // RUN_STARTED, TOOL_CALL_START, TOOL_CALL_ARGS, TOOL_CALL_END, TOOL_CALL_RESULT, RUN_FINISHED
    expect(events[1].type).toBe(EventType.TOOL_CALL_START);
    expect(events[2].type).toBe(EventType.TOOL_CALL_ARGS);
    expect(events[3].type).toBe(EventType.TOOL_CALL_END);
    expect(events[4].type).toBe(EventType.TOOL_CALL_RESULT);
  });

  it('should handle custom events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.custom('status', 'success', { timestamp: Date.now() });
    chain.end();
    
    expect(events).toHaveLength(3); // RUN_STARTED, CUSTOM, RUN_FINISHED
    expect(events[1].type).toBe(EventType.CUSTOM);
    expect(events[1].name).toBe('status');
    expect(events[1].value).toBe('success');
  });

  it('should handle error events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.error('Something went wrong', 500);
    chain.end();
    
    expect(events).toHaveLength(3); // RUN_STARTED, RUN_ERROR, RUN_FINISHED
    expect(events[1].type).toBe(EventType.RUN_ERROR);
    expect(events[1].message).toBe('Something went wrong');
    expect(events[1].code).toBe(500);
  });

  it('should handle step events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.stepStarted('processing');
    chain.stepFinished('processing');
    chain.end();
    
    expect(events).toHaveLength(4); // RUN_STARTED, STEP_STARTED, STEP_FINISHED, RUN_FINISHED
    expect(events[1].type).toBe(EventType.STEP_STARTED);
    expect(events[1].stepName).toBe('processing');
    expect(events[2].type).toBe(EventType.STEP_FINISHED);
    expect(events[2].stepName).toBe('processing');
  });

  it('should handle state events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.stateSnapshot({ user: { id: '123' } });
    chain.stateDelta([{ op: 'add', path: '/user/name', value: 'John' }]);
    chain.messagesSnapshot([{ id: 'msg_1', role: 'user', content: 'Hello' }]);
    chain.end();
    
    expect(events).toHaveLength(5); // RUN_STARTED, STATE_SNAPSHOT, STATE_DELTA, MESSAGES_SNAPSHOT, RUN_FINISHED
    expect(events[1].type).toBe(EventType.STATE_SNAPSHOT);
    expect(events[2].type).toBe(EventType.STATE_DELTA);
    expect(events[3].type).toBe(EventType.MESSAGES_SNAPSHOT);
  });

  it('should handle raw events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.raw({ custom: 'data' }, 'external');
    chain.end();
    
    expect(events).toHaveLength(3); // RUN_STARTED, RAW, RUN_FINISHED
    expect(events[1].type).toBe(EventType.RAW);
    expect(events[1].event).toEqual({ custom: 'data' });
    expect(events[1].source).toBe('external');
  });

  it('should handle custom event objects', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.event({ type: 'CUSTOM_TYPE', data: 'custom' });
    chain.end();
    
    expect(events).toHaveLength(3); // RUN_STARTED, CUSTOM_TYPE, RUN_FINISHED
    expect(events[1].type).toBe('CUSTOM_TYPE');
    expect(events[1].data).toBe('custom');
  });

  it('should automatically end current mode when switching', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.text('Hello');
    chain.think('Processing');
    chain.text('World');
    chain.end();
    
    // Should have: RUN_STARTED, TEXT_START, TEXT_CONTENT, TEXT_END, THINKING_START, THINKING_CONTENT, THINKING_END, TEXT_START, TEXT_CONTENT, TEXT_END, RUN_FINISHED
    expect(events).toHaveLength(11);
    expect(events[3].type).toBe(EventType.TEXT_MESSAGE_END); // First text ends
    expect(events[4].type).toBe(EventType.THINKING_START); // Thinking starts
    expect(events[6].type).toBe(EventType.THINKING_END); // Thinking ends
    expect(events[7].type).toBe(EventType.TEXT_MESSAGE_START); // Second text starts
  });

  it('should handle multiple subscribers', () => {
    const chain = new AguiChain();
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    chain.subscribe(callback1);
    chain.subscribe(callback2);
    chain.text('Hello');
    chain.end();
    
    expect(callback1).toHaveBeenCalledTimes(5); // RUN_STARTED, TEXT_START, TEXT_CONTENT, TEXT_END, RUN_FINISHED
    expect(callback2).toHaveBeenCalledTimes(5);
  });

  it('should set run options', () => {
    const chain = new AguiChain({ threadId: 'thread_1' });
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.setRunOptions({ runId: 'run_1' });
    chain.text('Hello');
    chain.end();
    
    expect(events[0].threadId).toBe('thread_1');
    expect(events[0].runId).toBe('run_1');
  });

  it('should manually send run events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.runStarted();
    chain.runFinished();
    
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[1].type).toBe(EventType.RUN_FINISHED);
  });

  it('should not duplicate run events', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.runStarted();
    chain.runStarted(); // Should not duplicate
    chain.text('Hello');
    chain.end();
    chain.end(); // Should not duplicate
    
    const runStartedEvents = events.filter(e => e.type === EventType.RUN_STARTED);
    const runFinishedEvents = events.filter(e => e.type === EventType.RUN_FINISHED);
    
    expect(runStartedEvents).toHaveLength(1);
    expect(runFinishedEvents).toHaveLength(1);
  });

  it('should generate unique message IDs', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.text('Hello');
    chain.end();
    chain.text('World'); // This should create a new text event with new messageId
    chain.end();
    
    const textStartEvents = events.filter(e => e.type === EventType.TEXT_MESSAGE_START);
    expect(textStartEvents).toHaveLength(2);
    expect(textStartEvents[0].messageId).not.toBe(textStartEvents[1].messageId);
  });

  it('should handle tool call without explicit toolCallId', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.tool_call_start({
      toolCallName: 'fetch_data'
    });
    chain.tool_call_end();
    chain.end();
    
    const toolCallStartEvent = events.find(e => e.type === EventType.TOOL_CALL_START);
    const toolCallEndEvent = events.find(e => e.type === EventType.TOOL_CALL_END);
    
    expect(toolCallStartEvent.toolCallId).toBeDefined();
    expect(toolCallEndEvent.toolCallId).toBe(toolCallStartEvent.toolCallId);
  });

  it('should handle tool call result with default role', () => {
    const chain = new AguiChain();
    const events: any[] = [];
    
    chain.subscribe(event => events.push(event));
    chain.tool_call_result({
      messageId: 'msg_1',
      toolCallId: 'tool_1',
      content: 'Data fetched'
    });
    chain.end();
    
    const toolCallResultEvent = events.find(e => e.type === EventType.TOOL_CALL_RESULT);
    expect(toolCallResultEvent.role).toBe('tool');
  });
}); 