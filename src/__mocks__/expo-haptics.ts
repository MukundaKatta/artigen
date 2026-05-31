// Jest mock for expo-haptics — every API resolves immediately, no native call.
export enum ImpactFeedbackStyle { Light = 'light', Medium = 'medium', Heavy = 'heavy', Soft = 'soft', Rigid = 'rigid' }
export enum NotificationFeedbackType { Success = 'success', Warning = 'warning', Error = 'error' }

export const impactAsync = jest.fn().mockResolvedValue(undefined);
export const selectionAsync = jest.fn().mockResolvedValue(undefined);
export const notificationAsync = jest.fn().mockResolvedValue(undefined);
