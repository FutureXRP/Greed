import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/** Share text via the native share sheet, falling back to clipboard copy. */
export async function shareText(message: string): Promise<'shared' | 'copied' | 'dismissed'> {
  try {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(message);
      return 'copied';
    }
    const res = await Share.share({ message });
    if (res.action === Share.dismissedAction) return 'dismissed';
    return 'shared';
  } catch {
    try {
      await Clipboard.setStringAsync(message);
      return 'copied';
    } catch {
      return 'dismissed';
    }
  }
}

export async function copyText(message: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(message);
    return true;
  } catch {
    return false;
  }
}
