/**
 * agui-chain - A lightweight chain-based API for generating AG-UI protocol events
 *
 * This package provides a simple and intuitive way to generate AG-UI protocol events
 * using chain-based API calls. It supports automatic state management and event subscription.
 */

// Core chain-based API
export { AguiChain } from './AguiChain';
export type {
  AguiEvent,
  RunOptions,
  EventCallback,
  ToolCallData,
  ToolCallResultData,
} from './AguiChain';

// Re-export AG-UI core types for convenience
export { EventType } from '@ag-ui/core';
