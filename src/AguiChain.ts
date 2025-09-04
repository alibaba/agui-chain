import { EventType } from '@ag-ui/core';

export interface AguiEvent {
  type: string;
  timestamp?: number;
  rawEvent?: unknown;
  [key: string]: unknown;
}

export interface RunOptions {
  threadId?: string;
  runId?: string;
}

export interface EventCallback {
  (event: AguiEvent): void;
}

export interface ToolCallData {
  toolCallId: string;
  toolCallName: string;
  parentMessageId?: string;
  args?: string;
}

export interface ToolCallResultData {
  messageId: string;
  toolCallId: string;
  content: string;
  role?: string;
}

export class AguiChain {
  private currentMode: 'text' | 'thinking' | 'tool_call' | null = null;
  private currentMessageId: string | null = null;
  private currentToolCallId: string | null = null;
  private subscribers: EventCallback[] = [];
  private runOptions: RunOptions = {};
  private hasStarted = false;
  private hasFinished = false;

  constructor(options: RunOptions = {}) {
    this.runOptions = options;
  }

  /**
   * Set or update run options (threadId, runId)
   */
  setRunOptions(options: RunOptions): this {
    this.runOptions = { ...this.runOptions, ...options };
    return this;
  }

  /**
   * Subscribe to events
   */
  subscribe(callback: EventCallback): this {
    this.subscribers.push(callback);
    return this;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(callback: EventCallback): this {
    const index = this.subscribers.indexOf(callback);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
    return this;
  }

  /**
   * Create a properly formatted event with base properties
   */
  private createEvent(type: string, data: Record<string, unknown> = {}): AguiEvent {
    return {
      type,
      timestamp: Date.now(),
      ...data,
    };
  }

  /**
   * Emit event to all subscribers
   */
  public emit(event: AguiEvent): void {
    // Auto-send RUN_STARTED on first event
    if (!this.hasStarted) {
      this.hasStarted = true;
      const runStarted = this.createEvent(EventType.RUN_STARTED, {
        threadId: this.runOptions.threadId,
        runId: this.runOptions.runId,
      });
      this.subscribers.forEach((callback) => callback(runStarted));
    }

    this.subscribers.forEach((callback) => callback(event));
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique tool call ID
   */
  private generateToolCallId(): string {
    return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * End current mode and reset state
   */
  private endCurrentMode(): void {
    if (this.currentMode === 'text') {
      this.emit(
        this.createEvent(EventType.TEXT_MESSAGE_END, {
          messageId: this.currentMessageId,
        }),
      );
    } else if (this.currentMode === 'thinking') {
      this.emit(
        this.createEvent(EventType.THINKING_END, {
          parentMessageId: this.currentMessageId,
        }),
      );
    } else if (this.currentMode === 'tool_call') {
      this.emit(
        this.createEvent(EventType.TOOL_CALL_END, {
          toolCallId: this.currentToolCallId,
        }),
      );
    }

    this.currentMode = null;
    this.currentMessageId = null;
    this.currentToolCallId = null;
  }

  /**
   * Start text mode
   */
  private startTextMode(role: string = 'assistant'): void {
    this.currentMode = 'text';
    this.currentMessageId = this.generateMessageId();
    this.emit(
      this.createEvent(EventType.TEXT_MESSAGE_START, {
        role,
        messageId: this.currentMessageId,
      }),
    );
  }

  /**
   * Start thinking mode
   */
  private startThinkingMode(): void {
    this.currentMode = 'thinking';
    this.currentMessageId = this.generateMessageId();
    this.emit(
      this.createEvent(EventType.THINKING_START, {
        parentMessageId: this.currentMessageId,
      }),
    );
  }

  /**
   * Start tool call mode
   */
  private startToolCallMode(data: ToolCallData): void {
    this.currentMode = 'tool_call';
    this.currentToolCallId = data.toolCallId || this.generateToolCallId();
    this.emit(
      this.createEvent(EventType.TOOL_CALL_START, {
        toolCallId: this.currentToolCallId,
        toolCallName: data.toolCallName,
        parentMessageId: data.parentMessageId,
      }),
    );
  }

  /**
   * Add text content
   */
  text(content: string, role: string = 'assistant'): this {
    if (this.currentMode !== 'text') {
      this.endCurrentMode();
      this.startTextMode(role);
    }

    this.emit(
      this.createEvent(EventType.TEXT_MESSAGE_CONTENT, {
        messageId: this.currentMessageId,
        delta: content,
      }),
    );

    return this;
  }

  /**
   * Add thinking content (custom event type for internal processing)
   */
  think(content: string): this {
    if (this.currentMode !== 'thinking') {
      this.endCurrentMode();
      this.startThinkingMode();
    }

    this.emit(
      this.createEvent(EventType.THINKING_TEXT_MESSAGE_CONTENT, {
        parentMessageId: this.currentMessageId,
        delta: content,
      }),
    );

    return this;
  }

  /**
   * Start tool call
   */
  tool_call_start(data: ToolCallData): this {
    this.endCurrentMode();
    this.startToolCallMode(data);
    return this;
  }

  /**
   * Add tool call arguments
   */
  tool_call_args(args: string): this {
    if (this.currentMode === 'tool_call' && this.currentToolCallId) {
      this.emit(
        this.createEvent(EventType.TOOL_CALL_ARGS, {
          toolCallId: this.currentToolCallId,
          delta: args,
        }),
      );
    }
    return this;
  }

  /**
   * End tool call
   */
  tool_call_end(): this {
    if (this.currentMode === 'tool_call' && this.currentToolCallId) {
      this.emit(
        this.createEvent(EventType.TOOL_CALL_END, {
          toolCallId: this.currentToolCallId,
        }),
      );
      this.currentMode = null;
      this.currentToolCallId = null;
    }
    return this;
  }

  /**
   * Add tool call result
   */
  tool_call_result(data: ToolCallResultData): this {
    this.emit(
      this.createEvent(EventType.TOOL_CALL_RESULT, {
        messageId: data.messageId,
        toolCallId: data.toolCallId,
        content: data.content,
        role: data.role || 'tool',
      }),
    );
    return this;
  }

  /**
   * Add custom event
   */
  custom(name: string, value: unknown, payload: Record<string, unknown> = {}): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.CUSTOM, {
        name,
        value,
        ...payload,
      }),
    );
    return this;
  }

  /**
   * Add error event
   */
  error(message: string, code = 500): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.RUN_ERROR, {
        message,
        code,
      }),
    );
    return this;
  }

  /**
   * Add step started event
   */
  stepStarted(stepName: string): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.STEP_STARTED, {
        stepName,
      }),
    );
    return this;
  }

  /**
   * Add step finished event
   */
  stepFinished(stepName: string): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.STEP_FINISHED, {
        stepName,
      }),
    );
    return this;
  }

  /**
   * Add state snapshot event
   */
  stateSnapshot(snapshot: object): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.STATE_SNAPSHOT, {
        snapshot,
      }),
    );
    return this;
  }

  /**
   * Add state delta event
   */
  stateDelta(delta: object[]): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.STATE_DELTA, {
        delta,
      }),
    );
    return this;
  }

  /**
   * Add messages snapshot event
   */
  messagesSnapshot(messages: object[]): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.MESSAGES_SNAPSHOT, {
        messages,
      }),
    );
    return this;
  }

  /**
   * Add raw event
   */
  raw(event: object, source?: string): this {
    this.endCurrentMode();
    this.emit(
      this.createEvent(EventType.RAW, {
        event,
        source,
      }),
    );
    return this;
  }

  /**
   * Add custom event object with rawEvent support
   */
  event(event: AguiEvent): this {
    this.endCurrentMode();
    // Preserve the original event as rawEvent if it's not already set
    if (!event.rawEvent) {
      event.rawEvent = { ...event };
    }
    this.emit(event);
    return this;
  }

  /**
   * End all current modes and finish the chain
   */
  end(): this {
    this.endCurrentMode();

    if (!this.hasFinished) {
      this.hasFinished = true;
      this.emit(
        this.createEvent(EventType.RUN_FINISHED, {
          threadId: this.runOptions.threadId,
          runId: this.runOptions.runId,
        }),
      );
    }

    return this;
  }

  /**
   * Manually send RUN_STARTED event
   */
  runStarted(): this {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.emit(
        this.createEvent(EventType.RUN_STARTED, {
          threadId: this.runOptions.threadId,
          runId: this.runOptions.runId,
        }),
      );
    }
    return this;
  }

  /**
   * Manually send RUN_FINISHED event
   */
  runFinished(): this {
    if (!this.hasFinished) {
      this.hasFinished = true;
      this.emit(
        this.createEvent(EventType.RUN_FINISHED, {
          threadId: this.runOptions.threadId,
          runId: this.runOptions.runId,
        }),
      );
    }
    return this;
  }
}
