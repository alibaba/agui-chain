# agui-chain

English | [简体中文](README.zh-CN.md)

A lightweight chain-based API for generating AG-UI protocol events with automatic state management and event subscription. **Fully compliant with the [AG-UI Protocol specification](https://docs.ag-ui.com/concepts/events).**

## Features

- 🚀 **Simple API**: Easy-to-use chain-based interface
- 🔄 **Automatic State Management**: Automatically handles event start/end states
- 📡 **Event Subscription**: Subscribe to events for real-time processing
- 🛠️ **Tool Call Support**: Full support for tool call workflows
- 🎯 **TypeScript Support**: Full TypeScript support with type safety
- 📦 **Lightweight**: Minimal dependencies and bundle size
- ✅ **AG-UI Compliant**: Complete implementation of the AG-UI Protocol specification
- ⏰ **Timestamp Support**: Automatic timestamp generation for all events
- 🔗 **Raw Event Support**: Integration with external systems via raw events

## AG-UI Protocol Compliance

This library implements the complete [AG-UI Protocol specification](https://docs.ag-ui.com/concepts/events), including:

### ✅ Supported Event Types

| Category | Events | Status |
|----------|--------|--------|
| **Lifecycle Events** | `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED` | ✅ Complete |
| **Text Message Events** | `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END` | ✅ Complete |
| **Tool Call Events** | `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT` | ✅ Complete |
| **State Management Events** | `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT` | ✅ Complete |
| **Special Events** | `RAW`, `CUSTOM` | ✅ Complete |

### ✅ Base Event Properties

All events automatically include:
- `type`: Event type identifier
- `timestamp`: Automatic timestamp generation
- `rawEvent`: Support for preserving original event data

### ✅ Event Flow Patterns

Supports all AG-UI event flow patterns:
- **Start-Content-End Pattern**: For streaming content (text messages, tool calls)
- **Snapshot-Delta Pattern**: For state synchronization
- **Lifecycle Pattern**: For monitoring agent runs

## Installation

```bash
npm install agui-chain
```

## Quick Start

### Basic Usage

```typescript
import { AguiChain } from 'agui-chain';

const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
  .subscribe(event => {
    console.log('Event:', event.type, event);
  });

chain
  .text('Hello, World!')
  .think('Processing...')
  .text('Operation completed!')
  .end();
```

### Streaming from External Source

```typescript
const chain = new AguiChain()
  .subscribe(event => {
    // Send event via SSE
    sseClient.send(event);
  });

// Handle external stream data
res.on('data', data => {
  if (data.type === 'text') {
    chain.text(data.content);
  } else if (data.type === 'thinking') {
    chain.think(data.content);
  }
});

res.on('end', () => {
  chain.end();
});
```

## API Reference

### Constructor

```typescript
new AguiChain(options?: RunOptions)
```

**Options:**
- `threadId?: string` - Thread identifier
- `runId?: string` - Run identifier

### Core Methods

#### Event Subscription

```typescript
// Subscribe to events
chain.subscribe(callback: (event: AguiEvent) => void)

// Unsubscribe from events
chain.unsubscribe(callback: (event: AguiEvent) => void)
```

#### Text Events

```typescript
// Add text content with default role (assistant)
chain.text(content: string)

// Add text content with custom role
chain.text(content: string, role: string)
```

**Parameters:**
- `content: string` - The text content to add
- `role?: string` - The role of the message (optional, defaults to 'assistant')

**Supported Roles:**
- `'assistant'` - Assistant role (default)
- `'user'` - User role  
- `'system'` - System role
- `'tool'` - Tool role
- Any custom role string

**Example:**
```typescript
chain
  .text('User input message', 'user')
  .text('System processing...', 'system')
  .text('Assistant response', 'assistant')
  .text('Tool execution result', 'tool');
```

#### Thinking Events

```typescript
// Add thinking content (automatically handles start/content/end)
chain.think(content: string)
```

#### Tool Call Events

```typescript
// Start tool call
chain.tool_call_start(data: ToolCallData)

// Add tool call arguments
chain.tool_call_args(args: string)

// End tool call
chain.tool_call_end()

// Add tool call result
chain.tool_call_result(data: ToolCallResultData)
```

#### Custom Events

```typescript
// Add custom event
chain.custom(name: string, value: any, payload?: Record<string, unknown>)

// Add raw event object
chain.event(event: AguiEvent)
```

#### Error Events

```typescript
// Add error event
chain.error(message: string, code?: number)
```

#### Step Events

```typescript
// Start step
chain.stepStarted(stepName: string)

// Finish step
chain.stepFinished(stepName: string)
```

#### State Events

```typescript
// Add state snapshot
chain.stateSnapshot(snapshot: object)

// Add state delta
chain.stateDelta(delta: object[])

// Add messages snapshot
chain.messagesSnapshot(messages: object[])
```

#### Raw Events

```typescript
// Add raw event
chain.raw(event: object, source?: string)
```

#### Control Methods

```typescript
// End all current modes and finish chain
chain.end()

// Manually send RUN_STARTED event
chain.runStarted()

// Manually send RUN_FINISHED event
chain.runFinished()

// Set or update run options
chain.setRunOptions(options: RunOptions)
```

## Examples

### Basic Text and Thinking

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log(event));

chain
  .text('Hello')
  .text(' ')
  .text('World')
  .think('Processing...')
  .text('Done!')
  .end();
```

### Role-Based Text Messages

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log(event));

chain
  .text('User question: How do I implement authentication?', 'user')
  .text('System: Processing authentication request...', 'system')
  .think('Analyzing authentication requirements...')
  .text('Here are the steps to implement authentication:', 'assistant')
  .text('1. Set up JWT tokens', 'assistant')
  .text('2. Implement middleware', 'assistant')
  .text('3. Add route protection', 'assistant')
  .end();
```

### Tool Call Workflow

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log(event));

chain
  .text('I need to fetch data')
  .tool_call_start({
    toolCallId: 'tool_1',
    toolCallName: 'fetch_data'
  })
  .tool_call_args('{"url": "https://api.example.com"}')
  .tool_call_end()
  .tool_call_result({
    messageId: 'msg_1',
    toolCallId: 'tool_1',
    content: 'Data fetched successfully'
  })
  .text('Data retrieved')
  .end();
```

### AG-UI Protocol Compliance

```typescript
const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
  .subscribe(event => {
    console.log('Protocol Event:', {
      type: event.type,
      timestamp: event.timestamp,
      ...event
    });
  });

// Complete AG-UI protocol flow
chain
  .runStarted()
  .stepStarted('initialization')
  .stateSnapshot({ user: { id: 'user_123' } })
  .stepFinished('initialization')
  .text('Hello, I am an AG-UI compliant agent')
  .tool_call_start({
    toolCallId: 'tool_1',
    toolCallName: 'fetch_data'
  })
  .tool_call_args('{"param": "value"}')
  .tool_call_end()
  .tool_call_result({
    messageId: 'msg_1',
    toolCallId: 'tool_1',
    content: 'Data retrieved'
  })
  .runFinished();
```

### Event Flow Patterns

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log('Flow Pattern:', event.type));

// 1. Start-Content-End Pattern (Text Messages)
chain.text('Streaming text content');

// 2. Start-Content-End Pattern (Tool Calls)
chain.tool_call_start({ toolCallId: 'tool_1', toolCallName: 'example' });
chain.tool_call_args('{"param": "value"}');
chain.tool_call_end();

// 3. Snapshot-Delta Pattern (State Management)
chain.stateSnapshot({ counter: 0 });
chain.stateDelta([{ op: 'replace', path: '/counter', value: 1 }]);

// 4. Lifecycle Pattern
chain.stepStarted('processing');
chain.stepFinished('processing');
```

### Raw Events for External Integration

```typescript
const chain = new AguiChain()
  .subscribe(event => {
    if (event.type === 'RAW') {
      console.log('External Event:', event.source, event.event);
    }
  });

// Integrate with external systems
chain.raw({ type: 'EXTERNAL_LOG', level: 'info' }, 'monitoring_system');
chain.raw({ type: 'EXTERNAL_METRIC', value: 75.5 }, 'metrics_system');
```

### Multiple Subscribers

```typescript
const chain = new AguiChain();

// SSE subscriber
chain.subscribe(event => sseClient.send(event));

// Logger subscriber
chain.subscribe(event => console.log(JSON.stringify(event, null, 2)));

// UI updater subscriber
chain.subscribe(event => updateUI(event));

chain
  .text('Hello from multiple subscribers')
  .end();
```

### Real-world Streaming

```typescript
const chain = new AguiChain()
  .subscribe(event => sseClient.send(event));

// Process external stream data
const processStreamData = (data: any) => {
  switch (data.type) {
    case 'text':
      chain.text(data.content);
      break;
    case 'thinking':
      chain.think(data.content);
      break;
    case 'tool_call_start':
      chain.tool_call_start(data);
      break;
    case 'tool_call_args':
      chain.tool_call_args(data.args);
      break;
    case 'tool_call_end':
      chain.tool_call_end();
      break;
    case 'tool_call_result':
      chain.tool_call_result(data);
      break;
    case 'error':
      chain.error(data.message, data.code);
      break;
    default:
      chain.custom(data.type, data.value, data.payload);
  }
};

// Handle stream data
res.on('data', processStreamData);
res.on('end', () => chain.end());
```

## TypeScript Types

```typescript
interface AguiEvent {
  type: string;
  timestamp?: number;
  rawEvent?: any;
  [key: string]: any;
}

interface RunOptions {
  threadId?: string;
  runId?: string;
}

interface EventCallback {
  (event: AguiEvent): void;
}

interface ToolCallData {
  toolCallId: string;
  toolCallName: string;
  parentMessageId?: string;
  args?: string;
}

interface ToolCallResultData {
  messageId: string;
  toolCallId: string;
  content: string;
  role?: string;
}
```

## Event Types

The library generates events according to the [AG-UI Protocol specification](https://docs.ag-ui.com/concepts/events):

### Lifecycle Events
- `RUN_STARTED` - Run started event
- `RUN_FINISHED` - Run finished event
- `RUN_ERROR` - Run error event
- `STEP_STARTED` - Step started
- `STEP_FINISHED` - Step finished

### Text Message Events
- `TEXT_MESSAGE_START` - Text message started
- `TEXT_MESSAGE_CONTENT` - Text message content
- `TEXT_MESSAGE_END` - Text message ended

### Tool Call Events
- `TOOL_CALL_START` - Tool call started
- `TOOL_CALL_ARGS` - Tool call arguments
- `TOOL_CALL_END` - Tool call ended
- `TOOL_CALL_RESULT` - Tool call result

### State Management Events
- `STATE_SNAPSHOT` - State snapshot
- `STATE_DELTA` - State delta
- `MESSAGES_SNAPSHOT` - Messages snapshot

### Special Events
- `RAW` - Raw event
- `CUSTOM` - Custom event

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 