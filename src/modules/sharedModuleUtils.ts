import type { UiNode } from '../types/uiNodes';

export function hasWebGameNode(node: UiNode): boolean {
  if (node.type === 'webGame') return true;
  if (node.type === 'navigator') return Object.values(node.screens).some((s) => s.components.some(hasWebGameNode));
  if ('components' in node && Array.isArray(node.components)) return node.components.some(hasWebGameNode);
  return false;
}

export function collectButtonActions(node: UiNode): string[] {
  if (node.type === 'button') return node.action && !node.navigate ? [node.action] : [];
  if (node.type === 'navigator') {
    return Object.values(node.screens).flatMap((s) => {
      const childActions = s.components.flatMap(collectButtonActions);
      return s.onFocus ? [s.onFocus, ...childActions] : childActions;
    });
  }
  if (node.type === 'gamepad') {
    return node.buttons.map((b) => b.action).filter(Boolean);
  }
  if (node.type === 'timer') {
    return node.tickAction ? [node.tickAction] : [];
  }
  if (node.type === 'gameView') {
    const acts: string[] = [];
    if (node.tickAction) acts.push(node.tickAction);
    if (node.onTapAction) acts.push(node.onTapAction);
    if (node.onCollideAction) acts.push(node.onCollideAction);
    if (node.onOutOfBoundsAction) acts.push(node.onOutOfBoundsAction);
    return acts;
  }
  if ('components' in node && Array.isArray(node.components)) {
    return node.components.flatMap(collectButtonActions);
  }
  return [];
}

/**
 * Checks if generated JavaScript code uses browser/DOM APIs
 * (canvas, requestAnimationFrame, etc.) indicating it should run
 * inside a WebView rather than the Hermes sandbox.
 */
export function looksLikeWebGameCode(code: string): boolean {
  return /requestAnimationFrame\s*\(|canvas\.addEventListener\s*\(|document\.getElementById\s*\(|ctx\s*\.\s*(fillRect|drawImage|clearRect|beginPath|arc|stroke)\s*\(/.test(code);
}

export function looksLikeWebGameNetworkCode(code: string): boolean {
  return /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b|\bnavigator\s*\.\s*sendBeacon\b|\bimportScripts\s*\(/.test(code);
}
