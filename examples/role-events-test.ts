import { AguiChain } from '../src/AguiChain';

/**
 * 测试role参数在事件中的传递
 */
console.log('=== 测试role参数在事件中的传递 ===');

const chain = new AguiChain();

// 订阅事件来验证role参数
chain.subscribe((event) => {
  if (event.type === 'TEXT_MESSAGE_START') {
    console.log(`TEXT_MESSAGE_START - role: ${event.role}, messageId: ${event.messageId}`);
  } else if (event.type === 'TEXT_MESSAGE_CONTENT') {
    console.log(`TEXT_MESSAGE_CONTENT - messageId: ${event.messageId}, delta: ${event.delta}`);
  }
});

// 测试不同role的消息
console.log('\n1. 测试默认assistant角色:');
chain.text('这是默认assistant角色的消息');

console.log('\n2. 测试user角色:');
chain.text('这是user角色的消息', 'user');

console.log('\n3. 测试system角色:');
chain.text('这是system角色的消息', 'system');

console.log('\n4. 测试tool角色:');
chain.text('这是tool角色的消息', 'tool');

chain.end();

console.log('\nrole参数事件测试完成！');
