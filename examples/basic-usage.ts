import { AguiChain } from '../src';

/**
 * Basic usage example - demonstrates simple event chain creation
 */
export function basicUsageExample() {
  console.log('=== Basic Usage Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Event:', event.type, event);
    });

  chain
    .text('Hello, this is a basic text message')
    .think('Processing the request...')
    .text('Operation completed successfully!')
    .end();

  console.log('Basic usage completed');
}

/**
 * Streaming from external source example - demonstrates handling external stream
 */
export function streamingFromExternalSourceExample() {
  console.log('=== Streaming from External Source Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('SSE Event:', event);
      // Here you would typically send the event via SSE
      // sseClient.send(event);
  });

  // Simulate external stream data
  const mockStreamData = [
    { type: 'text', content: 'Hello' },
    { type: 'text', content: ' ' },
    { type: 'text', content: 'World' },
    { type: 'thinking', content: 'Processing' },
    { type: 'thinking', content: '...' },
    { type: 'text', content: 'Done!' },
  ];

  // Process stream data
  mockStreamData.forEach(data => {
    if (data.type === 'text') {
      chain.text(data.content);
    } else if (data.type === 'thinking') {
      chain.think(data.content);
    }
  });

  chain.end();
  console.log('Streaming example completed');
}

/**
 * Tool call example - demonstrates tool call workflow
 */
export function toolCallExample() {
  console.log('=== Tool Call Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Tool Call Event:', event.type, event);
    });

  chain
    .text('I need to fetch some data')
    .tool_call_start({
      toolCallId: 'tool_1',
      toolCallName: 'fetch_data',
      parentMessageId: 'msg_1'
    })
    .tool_call_args('{"url": "https://api.example.com/data"}')
    .tool_call_end()
    .tool_call_result({
      messageId: 'msg_2',
      toolCallId: 'tool_1',
      content: 'Data fetched successfully',
      role: 'tool'
    })
    .text('Data has been retrieved')
    .end();

  console.log('Tool call example completed');
}

/**
 * Error handling example - demonstrates error event usage
 */
export function errorHandlingExample() {
  console.log('=== Error Handling Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Error Event:', event.type, event);
    });

  chain
    .text('Attempting to process request...')
    .stepStarted('validation')
    .error('Invalid input parameters', 400)
    .stepFinished('validation')
    .end();

  console.log('Error handling example completed');
}

/**
 * State management example - demonstrates state events
 */
export function stateManagementExample() {
  console.log('=== State Management Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('State Event:', event.type, event);
    });

  chain
    .stateSnapshot({
      user: { id: 'user_123', name: 'John' },
      session: { id: 'session_456', status: 'active' }
    })
    .text('Current state loaded')
    .stateDelta([
      { op: 'add', path: '/user/preferences', value: { theme: 'dark' } },
      { op: 'replace', path: '/session/status', value: 'processing' }
    ])
    .messagesSnapshot([
      { id: 'msg_1', role: 'user', content: 'Hello' },
      { id: 'msg_2', role: 'assistant', content: 'Hi there!' }
    ])
    .end();

  console.log('State management example completed');
}

/**
 * Custom events example - demonstrates custom event usage
 */
export function customEventsExample() {
  console.log('=== Custom Events Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Custom Event:', event.type, event);
    });

  chain
    .text('Processing with custom events')
    .custom('progress', 50, { stage: 'processing' })
    .custom('status', 'success', { timestamp: Date.now() })
    .text('Custom events processed')
    .end();

  console.log('Custom events example completed');
}

/**
 * Multiple subscribers example - demonstrates multiple event handlers
 */
export function multipleSubscribersExample() {
  console.log('=== Multiple Subscribers Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' });

  // SSE subscriber
  chain.subscribe(event => {
    console.log('SSE Subscriber:', event.type);
    // sseClient.send(event);
  });

  // Logger subscriber
  chain.subscribe(event => {
    console.log('Logger Subscriber:', JSON.stringify(event, null, 2));
  });

  // UI updater subscriber
  chain.subscribe(event => {
    console.log('UI Subscriber:', event.type);
    // updateUI(event);
  });

  chain
    .text('Hello from multiple subscribers')
    .think('Processing...')
    .text('All subscribers received the events')
    .end();

  console.log('Multiple subscribers example completed');
}

/**
 * Real-world streaming example - demonstrates actual fetch stream handling
 */
export function realWorldStreamingExample() {
  console.log('=== Real-world Streaming Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Real-world Event:', event.type, event);
    });

  // Simulate real-world stream processing
  const processStreamData = (data: any) => {
    // Handle different event types from external stream
    switch (data.type) {
      case 'text':
        chain.text(data.content);
        break;
      case 'thinking':
        chain.think(data.content);
        break;
      case 'tool_call_start':
        chain.tool_call_start({
          toolCallId: data.toolCallId,
          toolCallName: data.toolCallName,
          parentMessageId: data.parentMessageId
        });
        break;
      case 'tool_call_args':
        chain.tool_call_args(data.args);
        break;
      case 'tool_call_end':
        chain.tool_call_end();
        break;
      case 'tool_call_result':
        chain.tool_call_result({
          messageId: data.messageId,
          toolCallId: data.toolCallId,
          content: data.content,
          role: data.role
        });
        break;
      case 'error':
        chain.error(data.message, data.code);
        break;
      default:
        chain.custom(data.type, data.value, data.payload);
    }
  };

  // Simulate stream data
  const streamData = [
    { type: 'text', content: 'Starting process...' },
    { type: 'thinking', content: 'Analyzing' },
    { type: 'thinking', content: '...' },
    { type: 'text', content: 'Analysis complete' },
    { type: 'tool_call_start', toolCallId: 'tool_1', toolCallName: 'fetch_data' },
    { type: 'tool_call_args', args: '{"url": "https://api.example.com"}' },
    { type: 'tool_call_end' },
    { type: 'tool_call_result', messageId: 'msg_1', toolCallId: 'tool_1', content: 'Data fetched' },
    { type: 'text', content: 'Process completed successfully' }
  ];

  // Process each piece of stream data
  streamData.forEach(processStreamData);

  chain.end();
  console.log('Real-world streaming example completed');
}

/**
 * AG-UI Protocol compliance example - demonstrates full protocol support
 */
export function aguiProtocolComplianceExample() {
  console.log('=== AG-UI Protocol Compliance Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Protocol Event:', {
        type: event.type,
        timestamp: event.timestamp,
        ...event
      });
    });

  // Demonstrate complete AG-UI protocol flow
  chain
    .runStarted() // Manual RUN_STARTED
    .stepStarted('initialization')
    .stateSnapshot({
        user: { id: 'user_123', name: 'John' },
      session: { id: 'session_456', status: 'active' }
    })
    .stepFinished('initialization')
    .text('Hello, I am an AG-UI compliant agent')
    .stepStarted('data_processing')
    .think('Analyzing user request...')
    .tool_call_start({
      toolCallId: 'tool_1',
      toolCallName: 'fetch_user_data',
      parentMessageId: 'msg_1'
    })
    .tool_call_args('{"userId": "user_123"}')
    .tool_call_end()
    .tool_call_result({
      messageId: 'msg_2',
      toolCallId: 'tool_1',
      content: 'User data retrieved successfully',
      role: 'tool'
    })
    .stateDelta([
      { op: 'add', path: '/user/data', value: { lastLogin: Date.now() } }
    ])
    .stepFinished('data_processing')
    .text('Processing completed successfully')
    .messagesSnapshot([
        { id: 'msg_1', role: 'user', content: 'Hello' },
      { id: 'msg_2', role: 'assistant', content: 'Hello, I am an AG-UI compliant agent' },
      { id: 'msg_3', role: 'tool', content: 'User data retrieved successfully' }
    ])
    .custom('completion_status', 'success', { 
      processingTime: 1500,
      stepsCompleted: 2 
    })
    .runFinished(); // Manual RUN_FINISHED with result

  console.log('AG-UI Protocol compliance example completed');
}

/**
 * Event flow patterns example - demonstrates AG-UI event patterns
 */
export function eventFlowPatternsExample() {
  console.log('=== Event Flow Patterns Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      console.log('Flow Pattern Event:', event.type);
    });

  // 1. Start-Content-End Pattern (Text Messages)
  console.log('\n1. Start-Content-End Pattern (Text Messages):');
  chain.text('This demonstrates the start-content-end pattern');
  chain.text(' for streaming text content.');

  // 2. Start-Content-End Pattern (Tool Calls)
  console.log('\n2. Start-Content-End Pattern (Tool Calls):');
  chain.tool_call_start({
    toolCallId: 'tool_1',
    toolCallName: 'example_tool'
  });
  chain.tool_call_args('{"param1": "value1"}');
  chain.tool_call_args(', "param2": "value2"}');
  chain.tool_call_end();
  chain.tool_call_result({
    messageId: 'msg_1',
    toolCallId: 'tool_1',
    content: 'Tool execution completed'
  });

  // 3. Snapshot-Delta Pattern (State Management)
  console.log('\n3. Snapshot-Delta Pattern (State Management):');
  chain.stateSnapshot({
    counter: 0,
    status: 'initial'
  });
  chain.stateDelta([
    { op: 'replace', path: '/counter', value: 1 },
    { op: 'replace', path: '/status', value: 'processing' }
  ]);
  chain.stateDelta([
    { op: 'replace', path: '/counter', value: 2 },
    { op: 'replace', path: '/status', value: 'completed' }
  ]);

  // 4. Lifecycle Pattern
  console.log('\n4. Lifecycle Pattern:');
  chain.stepStarted('step_1');
  chain.stepFinished('step_1');
  chain.stepStarted('step_2');
  chain.stepFinished('step_2');

  chain.end();
  console.log('Event flow patterns example completed');
}

/**
 * Raw event example - demonstrates external system integration
 */
export function rawEventExample() {
  console.log('=== Raw Event Example ===');

  const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
    .subscribe(event => {
      if (event.type === 'RAW') {
        console.log('Raw Event from external system:', {
          source: event.source,
          originalEvent: event.event
        });
      } else {
        console.log('Standard Event:', event.type);
      }
    });

  // Simulate external system events
  const externalEvents = [
    { type: 'EXTERNAL_LOG', level: 'info', message: 'External system started' },
    { type: 'EXTERNAL_METRIC', name: 'cpu_usage', value: 75.5 },
    { type: 'EXTERNAL_ALERT', severity: 'warning', message: 'High memory usage' }
  ];

  externalEvents.forEach((extEvent, index) => {
    chain.raw(extEvent, `external_system_${index + 1}`);
  });

  chain.end();
  console.log('Raw event example completed');
}

// Export all examples for easy access
export const examples = {
  basicUsageExample,
  streamingFromExternalSourceExample,
  toolCallExample,
  errorHandlingExample,
  stateManagementExample,
  customEventsExample,
  multipleSubscribersExample,
  realWorldStreamingExample,
  aguiProtocolComplianceExample,
  eventFlowPatternsExample,
  rawEventExample,
};
