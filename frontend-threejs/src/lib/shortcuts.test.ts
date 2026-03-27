import { describe, expect, it } from 'vitest';
import { SHORTCUTS, isEditableElement, resolveShortcutAction } from './shortcuts';

describe('resolveShortcutAction', () => {
  it('maps configured keys to actions', () => {
    expect(resolveShortcutAction({ key: ' ', ctrlKey: false })).toBe('toggle-play');
    expect(resolveShortcutAction({ key: 'ArrowRight', ctrlKey: false })).toBe('step-forward');
    expect(resolveShortcutAction({ key: 'ArrowLeft', ctrlKey: false })).toBe('step-back');
    expect(resolveShortcutAction({ key: 'r', ctrlKey: false })).toBe('restart');
    expect(resolveShortcutAction({ key: 'R', ctrlKey: false })).toBe('restart');
    expect(resolveShortcutAction({ key: 'c', ctrlKey: false })).toBe('open-config');
    expect(resolveShortcutAction({ key: 'Escape', ctrlKey: false })).toBe('close-config');
  });

  it('returns null for unsupported keys without Ctrl', () => {
    expect(resolveShortcutAction({ key: 'Enter', ctrlKey: false })).toBeNull();
  });

  it('maps Ctrl combinations to dialog actions', () => {
    expect(resolveShortcutAction({ key: '1', ctrlKey: true })).toBe('tab-generator');
    expect(resolveShortcutAction({ key: '2', ctrlKey: true })).toBe('tab-compare');
    expect(resolveShortcutAction({ key: '3', ctrlKey: true })).toBe('tab-simulation');
    expect(resolveShortcutAction({ key: '4', ctrlKey: true })).toBe('tab-equations');
    expect(resolveShortcutAction({ key: '5', ctrlKey: true })).toBe('tab-shortcuts');
    expect(resolveShortcutAction({ key: 'e', ctrlKey: true })).toBe('toggle-expand');
    expect(resolveShortcutAction({ key: 'E', ctrlKey: true })).toBe('toggle-expand');
    expect(resolveShortcutAction({ key: 'g', ctrlKey: true })).toBe('generate');
    expect(resolveShortcutAction({ key: 't', ctrlKey: true })).toBe('run-tests');
    expect(resolveShortcutAction({ key: 'Enter', ctrlKey: true })).toBe('run-simulation');
  });

  it('maps ? to open-shortcuts-tab without Ctrl', () => {
    expect(resolveShortcutAction({ key: '?', ctrlKey: false })).toBe('open-shortcuts-tab');
  });

  it('returns null for unsupported Ctrl combinations', () => {
    expect(resolveShortcutAction({ key: 'z', ctrlKey: true })).toBeNull();
  });
});

describe('isEditableElement', () => {
  it('detects form controls as editable elements', () => {
    expect(isEditableElement(document.createElement('input'))).toBe(true);
    expect(isEditableElement(document.createElement('textarea'))).toBe(true);
    expect(isEditableElement(document.createElement('select'))).toBe(true);
  });

  it('detects content editable elements', () => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('contenteditable', 'true');
    const child = document.createElement('span');
    wrapper.appendChild(child);

    expect(isEditableElement(child)).toBe(true);
  });

  it('returns false for non-editable elements', () => {
    expect(isEditableElement(document.createElement('button'))).toBe(false);
    expect(isEditableElement(null)).toBe(false);
  });
});

describe('SHORTCUTS', () => {
  it('includes the simulation shortcuts', () => {
    expect(SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'toggle-play', keys: ['Space'], category: 'simulation' }),
        expect.objectContaining({ action: 'step-forward', keys: ['ArrowRight'], category: 'simulation' }),
        expect.objectContaining({ action: 'step-back', keys: ['ArrowLeft'], category: 'simulation' }),
        expect.objectContaining({ action: 'restart', keys: ['R'], category: 'simulation' }),
        expect.objectContaining({ action: 'open-config', keys: ['C'], category: 'simulation' }),
        expect.objectContaining({ action: 'close-config', keys: ['Escape'], category: 'simulation' }),
      ]),
    );
  });

  it('includes the dialog navigation shortcuts', () => {
    expect(SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'open-shortcuts-tab', keys: ['?'] }),
        expect.objectContaining({ action: 'tab-generator', keys: ['1'], requiresCtrl: true }),
        expect.objectContaining({ action: 'tab-compare', keys: ['2'], requiresCtrl: true }),
        expect.objectContaining({ action: 'tab-simulation', keys: ['3'], requiresCtrl: true }),
        expect.objectContaining({ action: 'tab-equations', keys: ['4'], requiresCtrl: true }),
        expect.objectContaining({ action: 'tab-shortcuts', keys: ['5'], requiresCtrl: true }),
        expect.objectContaining({ action: 'toggle-expand', keys: ['E'], requiresCtrl: true }),
      ]),
    );
  });

  it('includes the dialog action shortcuts', () => {
    expect(SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'generate', keys: ['G'], requiresCtrl: true }),
        expect.objectContaining({ action: 'run-tests', keys: ['T'], requiresCtrl: true }),
        expect.objectContaining({ action: 'run-simulation', keys: ['Enter'], requiresCtrl: true }),
      ]),
    );
  });
});
