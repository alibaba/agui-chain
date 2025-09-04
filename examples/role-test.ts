import { AguiChain } from '../src/AguiChain';

/**
 * 测试role参数功能
 */
console.log('=== 测试role参数功能 ===');

const chain = new AguiChain();

// 测试默认role
chain.text('这是默认assistant角色的消息');

// 测试自定义role
chain.text('这是user角色的消息', 'user');

// 测试其他role
chain.text('这是system角色的消息', 'system');

// 测试tool role
chain.text('这是tool角色的消息', 'tool');

chain.end();

console.log('role参数测试完成！');
