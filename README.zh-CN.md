# agui-chain

[English](README.md) | 简体中文

一个轻量级的链式 API，用于生成 AG-UI 协议事件，具备自动状态管理和事件订阅功能。**完全符合 [AG-UI 协议规范](https://docs.ag-ui.com/concepts/events)。**

## 特性

- 🚀 **简单易用的 API**：易于使用的链式调用接口
- 🔄 **自动状态管理**：自动处理事件开始/结束状态
- 📡 **事件订阅**：订阅事件进行实时处理
- 🛠️ **工具调用支持**：完整支持工具调用工作流
- 🎯 **TypeScript 支持**：完整的 TypeScript 支持和类型安全
- 📦 **轻量级**：最小的依赖和打包体积
- ✅ **AG-UI 协议兼容**：完整实现 AG-UI 协议规范
- ⏰ **时间戳支持**：为所有事件自动生成时间戳
- 🔗 **原始事件支持**：通过原始事件与外部系统集成

## AG-UI 协议兼容性

本库实现了完整的 [AG-UI 协议规范](https://docs.ag-ui.com/concepts/events)，包括：

### ✅ 支持的事件类型

| 类别 | 事件 | 状态 |
|------|------|------|
| **生命周期事件** | `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED` | ✅ 完整支持 |
| **文本消息事件** | `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END` | ✅ 完整支持 |
| **工具调用事件** | `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT` | ✅ 完整支持 |
| **状态管理事件** | `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT` | ✅ 完整支持 |
| **特殊事件** | `RAW`, `CUSTOM` | ✅ 完整支持 |

### ✅ 基础事件属性

所有事件自动包含：
- `type`：事件类型标识符
- `timestamp`：自动时间戳生成
- `rawEvent`：支持保留原始事件数据

### ✅ 事件流模式

支持所有 AG-UI 事件流模式：
- **开始-内容-结束模式**：用于流式内容（文本消息、工具调用）
- **快照-增量模式**：用于状态同步
- **生命周期模式**：用于监控代理运行

## 安装

```bash
npm install agui-chain
```

## 快速开始

### 基础用法

```typescript
import { AguiChain } from 'agui-chain';

const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
  .subscribe(event => {
    console.log('Event:', event.type, event);
  });

chain
  .text('你好，世界！')
  .think('处理中...')
  .text('操作完成！')
  .end();
```

### 从外部源流式传输

```typescript
const chain = new AguiChain()
  .subscribe(event => {
    // 通过 SSE 发送事件
    sseClient.send(event);
  });

// 处理外部流数据
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

## API 参考

### 构造函数

```typescript
new AguiChain(options?: RunOptions)
```

**选项：**
- `threadId?: string` - 线程标识符
- `runId?: string` - 运行标识符

### 核心方法

#### 事件订阅

```typescript
// 订阅事件
chain.subscribe(callback: (event: AguiEvent) => void)

// 取消订阅事件
chain.unsubscribe(callback: (event: AguiEvent) => void)
```

#### 文本事件

```typescript
// 添加默认角色（assistant）的文本内容
chain.text(content: string)

// 添加自定义角色的文本内容
chain.text(content: string, role: string)
```

**参数：**
- `content: string` - 要添加的文本内容
- `role?: string` - 消息角色（可选，默认为 'assistant'）

**支持的角色：**
- `'assistant'` - 助手角色（默认）
- `'user'` - 用户角色
- `'system'` - 系统角色
- `'tool'` - 工具角色
- 任何自定义角色字符串

**示例：**
```typescript
chain
  .text('用户输入消息', 'user')
  .text('系统处理中...', 'system')
  .text('助手回复', 'assistant')
  .text('工具执行结果', 'tool');
```

#### 思考事件

```typescript
// 添加思考内容（自动处理开始/内容/结束）
chain.think(content: string)
```

#### 工具调用事件

```typescript
// 开始工具调用
chain.tool_call_start(data: ToolCallData)

// 添加工具调用参数
chain.tool_call_args(args: string)

// 结束工具调用
chain.tool_call_end()

// 添加工具调用结果
chain.tool_call_result(data: ToolCallResultData)
```

#### 自定义事件

```typescript
// 添加自定义事件
chain.custom(name: string, value: any, payload?: Record<string, unknown>)

// 添加原始事件对象
chain.event(event: AguiEvent)
```

#### 错误事件

```typescript
// 添加错误事件
chain.error(message: string, code?: number)
```

#### 步骤事件

```typescript
// 开始步骤
chain.stepStarted(stepName: string)

// 完成步骤
chain.stepFinished(stepName: string)
```

#### 状态事件

```typescript
// 添加状态快照
chain.stateSnapshot(snapshot: object)

// 添加状态增量
chain.stateDelta(delta: object[])

// 添加消息快照
chain.messagesSnapshot(messages: object[])
```

#### 原始事件

```typescript
// 添加原始事件
chain.raw(event: object, source?: string)
```

#### 控制方法

```typescript
// 结束所有当前模式并完成链
chain.end()

// 手动发送 RUN_STARTED 事件
chain.runStarted()

// 手动发送 RUN_FINISHED 事件
chain.runFinished()

// 设置或更新运行选项
chain.setRunOptions(options: RunOptions)
```

## 示例

### 基础文本和思考

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log(event));

chain
  .text('你好')
  .text(' ')
  .text('世界')
  .think('处理中...')
  .text('完成！')
  .end();
```

### 基于角色的文本消息

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log(event));

chain
  .text('用户问题：如何实现身份验证？', 'user')
  .text('系统：正在处理身份验证请求...', 'system')
  .think('分析身份验证需求...')
  .text('以下是实现身份验证的步骤：', 'assistant')
  .text('1. 设置 JWT 令牌', 'assistant')
  .text('2. 实现中间件', 'assistant')
  .text('3. 添加路由保护', 'assistant')
  .end();
```

### 工具调用工作流

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log(event));

chain
  .text('我需要获取数据')
  .tool_call_start({
    toolCallId: 'tool_1',
    toolCallName: 'fetch_data'
  })
  .tool_call_args('{"url": "https://api.example.com"}')
  .tool_call_end()
  .tool_call_result({
    messageId: 'msg_1',
    toolCallId: 'tool_1',
    content: '数据获取成功'
  })
  .text('数据已检索')
  .end();
```

### AG-UI 协议兼容性

```typescript
const chain = new AguiChain({ threadId: 'thread_123', runId: 'run_456' })
  .subscribe(event => {
    console.log('协议事件：', {
      type: event.type,
      timestamp: event.timestamp,
      ...event
    });
  });

// 完整的 AG-UI 协议流程
chain
  .runStarted()
  .stepStarted('initialization')
  .stateSnapshot({ user: { id: 'user_123' } })
  .stepFinished('initialization')
  .text('你好，我是一个符合 AG-UI 协议的代理')
  .tool_call_start({
    toolCallId: 'tool_1',
    toolCallName: 'fetch_data'
  })
  .tool_call_args('{"param": "value"}')
  .tool_call_end()
  .tool_call_result({
    messageId: 'msg_1',
    toolCallId: 'tool_1',
    content: '数据已检索'
  })
  .runFinished();
```

### 事件流模式

```typescript
const chain = new AguiChain()
  .subscribe(event => console.log('流模式：', event.type));

// 1. 开始-内容-结束模式（文本消息）
chain.text('流式文本内容');

// 2. 开始-内容-结束模式（工具调用）
chain.tool_call_start({ toolCallId: 'tool_1', toolCallName: 'example' });
chain.tool_call_args('{"param": "value"}');
chain.tool_call_end();

// 3. 快照-增量模式（状态管理）
chain.stateSnapshot({ counter: 0 });
chain.stateDelta([{ op: 'replace', path: '/counter', value: 1 }]);

// 4. 生命周期模式
chain.stepStarted('processing');
chain.stepFinished('processing');
```

### 外部集成的原始事件

```typescript
const chain = new AguiChain()
  .subscribe(event => {
    if (event.type === 'RAW') {
      console.log('外部事件：', event.source, event.event);
    }
  });

// 与外部系统集成
chain.raw({ type: 'EXTERNAL_LOG', level: 'info' }, 'monitoring_system');
chain.raw({ type: 'EXTERNAL_METRIC', value: 75.5 }, 'metrics_system');
```

### 多订阅者

```typescript
const chain = new AguiChain();

// SSE 订阅者
chain.subscribe(event => sseClient.send(event));

// 日志订阅者
chain.subscribe(event => console.log(JSON.stringify(event, null, 2)));

// UI 更新订阅者
chain.subscribe(event => updateUI(event));

chain
  .text('来自多个订阅者的问候')
  .end();
```

### 真实世界的流式处理

```typescript
const chain = new AguiChain()
  .subscribe(event => sseClient.send(event));

// 处理外部流数据
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

// 处理流数据
res.on('data', processStreamData);
res.on('end', () => chain.end());
```

## TypeScript 类型

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

## 事件类型

本库根据 [AG-UI 协议规范](https://docs.ag-ui.com/concepts/events) 生成事件：

### 生命周期事件
- `RUN_STARTED` - 运行开始事件
- `RUN_FINISHED` - 运行完成事件
- `RUN_ERROR` - 运行错误事件
- `STEP_STARTED` - 步骤开始
- `STEP_FINISHED` - 步骤完成

### 文本消息事件
- `TEXT_MESSAGE_START` - 文本消息开始
- `TEXT_MESSAGE_CONTENT` - 文本消息内容
- `TEXT_MESSAGE_END` - 文本消息结束

### 工具调用事件
- `TOOL_CALL_START` - 工具调用开始
- `TOOL_CALL_ARGS` - 工具调用参数
- `TOOL_CALL_END` - 工具调用结束
- `TOOL_CALL_RESULT` - 工具调用结果

### 状态管理事件
- `STATE_SNAPSHOT` - 状态快照
- `STATE_DELTA` - 状态增量
- `MESSAGES_SNAPSHOT` - 消息快照

### 特殊事件
- `RAW` - 原始事件
- `CUSTOM` - 自定义事件

## 贡献

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
