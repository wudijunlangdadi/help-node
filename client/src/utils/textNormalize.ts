// Kangxi Radicals (2F00-2FD5) → CJK Unified Ideographs
// Verified against https://www.unicode.org/charts/nameslist/n_2F00.html
const CJK_RADICAL_MAP: Record<number, string> = {
  0x2F00: '一', 0x2F01: '丨', 0x2F02: '丶', 0x2F03: '丿',
  0x2F04: '乙', 0x2F05: '亅', 0x2F06: '二', 0x2F07: '亠',
  0x2F08: '人', 0x2F09: '儿', 0x2F0A: '入', 0x2F0B: '八',
  0x2F0C: '冂', 0x2F0D: '冖', 0x2F0E: '冫', 0x2F0F: '几',
  0x2F10: '凵', 0x2F11: '刀', 0x2F12: '力', 0x2F13: '勹',
  0x2F14: '匕', 0x2F15: '匚', 0x2F16: '匸', 0x2F17: '十',
  0x2F18: '卜', 0x2F19: '卩', 0x2F1A: '厂', 0x2F1B: '厶',
  0x2F1C: '又', 0x2F1D: '口', 0x2F1E: '囗', 0x2F1F: '土',
  0x2F20: '士', 0x2F21: '夂', 0x2F22: '夊', 0x2F23: '夕',
  0x2F24: '大', 0x2F25: '女', 0x2F26: '子', 0x2F27: '宀',
  0x2F28: '寸', 0x2F29: '小', 0x2F2A: '尢', 0x2F2B: '尸',
  0x2F2C: '屮', 0x2F2D: '山', 0x2F2E: '巛', 0x2F2F: '工',
  0x2F30: '己', 0x2F31: '巾', 0x2F32: '干', 0x2F33: '幺',
  0x2F34: '广', 0x2F35: '廴', 0x2F36: '廾', 0x2F37: '弋',
  0x2F38: '弓', 0x2F39: '彐', 0x2F3A: '彡', 0x2F3B: '彳',
  0x2F3C: '心', 0x2F3D: '戈', 0x2F3E: '戶', 0x2F3F: '手',
  0x2F40: '支', 0x2F41: '攴', 0x2F42: '文', 0x2F43: '斗',
  0x2F44: '斤', 0x2F45: '方', 0x2F46: '无', 0x2F47: '日',
  0x2F48: '曰', 0x2F49: '月', 0x2F4A: '木', 0x2F4B: '欠',
  0x2F4C: '止', 0x2F4D: '歹', 0x2F4E: '殳', 0x2F4F: '毋',
  0x2F50: '比', 0x2F51: '毛', 0x2F52: '氏', 0x2F53: '气',
  0x2F54: '水', 0x2F55: '火', 0x2F56: '爪', 0x2F57: '父',
  0x2F58: '爻', 0x2F59: '爿', 0x2F5A: '片', 0x2F5B: '牙',
  0x2F5C: '牛', 0x2F5D: '犬', 0x2F5E: '玄', 0x2F5F: '玉',
  0x2F60: '瓜', 0x2F61: '瓦', 0x2F62: '甘', 0x2F63: '生',
  0x2F64: '用', 0x2F65: '田', 0x2F66: '疋', 0x2F67: '疒',
  0x2F68: '癶', 0x2F69: '白', 0x2F6A: '皮', 0x2F6B: '皿',
  0x2F6C: '目', 0x2F6D: '矛', 0x2F6E: '矢', 0x2F6F: '石',
  0x2F70: '示', 0x2F71: '禸', 0x2F72: '禾', 0x2F73: '穴',
  0x2F74: '立', 0x2F75: '竹', 0x2F76: '米', 0x2F77: '糸',
  0x2F78: '缶', 0x2F79: '网', 0x2F7A: '羊', 0x2F7B: '羽',
  0x2F7C: '老', 0x2F7D: '而', 0x2F7E: '耒', 0x2F7F: '耳',
  0x2F80: '聿', 0x2F81: '肉', 0x2F82: '臣', 0x2F83: '自',
  0x2F84: '至', 0x2F85: '臼', 0x2F86: '舌', 0x2F87: '舛',
  0x2F88: '舟', 0x2F89: '艮', 0x2F8A: '色', 0x2F8B: '艸',
  0x2F8C: '虍', 0x2F8D: '虫', 0x2F8E: '血', 0x2F8F: '行',
  0x2F90: '衣', 0x2F91: '襾', 0x2F92: '見', 0x2F93: '角',
  0x2F94: '言', 0x2F95: '谷', 0x2F96: '豆', 0x2F97: '豕',
  0x2F98: '豸', 0x2F99: '貝', 0x2F9A: '赤', 0x2F9B: '走',
  0x2F9C: '足', 0x2F9D: '身', 0x2F9E: '車', 0x2F9F: '辛',
  0x2FA0: '辰', 0x2FA1: '邑', 0x2FA2: '酉', 0x2FA3: '釆',
  0x2FA4: '里', 0x2FA5: '金', 0x2FA6: '長', 0x2FA7: '門',
  0x2FA8: '阜', 0x2FA9: '隶', 0x2FAA: '隹', 0x2FAB: '雨',
  0x2FAC: '靑', 0x2FAD: '非', 0x2FAE: '面', 0x2FAF: '革',
  0x2FB0: '韋', 0x2FB1: '韭', 0x2FB2: '音', 0x2FB3: '頁',
  0x2FB4: '風', 0x2FB5: '飛', 0x2FB6: '食', 0x2FB7: '首',
  0x2FB8: '香', 0x2FB9: '馬', 0x2FBA: '骨', 0x2FBB: '高',
  0x2FBC: '髟', 0x2FBD: '鬥', 0x2FBE: '鬯', 0x2FBF: '鬲',
  0x2FC0: '鬼', 0x2FC1: '魚', 0x2FC2: '鳥', 0x2FC3: '鹵',
  0x2FC4: '鹿', 0x2FC5: '麥', 0x2FC6: '麻', 0x2FC7: '黃',
  0x2FC8: '黍', 0x2FC9: '黑', 0x2FCA: '黹', 0x2FCB: '黽',
  0x2FCC: '鼎', 0x2FCD: '鼓', 0x2FCE: '鼠', 0x2FCF: '鼻',
  0x2FD0: '齊', 0x2FD1: '齒', 0x2FD2: '龍', 0x2FD3: '龜',
  0x2FD4: '龠',
}

/**
 * Normalize Unicode variants in imported text to standard keyboard characters.
 * Fixes: full-width chars, smart quotes, Unicode dashes, CJK radicals, math bold/italic, etc.
 */
export function normalizeText(text: string): string {
  const result: string[] = []
  let i = 0

  while (i < text.length) {
    const cp = text.codePointAt(i)!
    const isSupplementary = cp > 0xFFFF

    // Full-width ASCII (FF01-FF5E) → normal ASCII (0021-007E)
    if (cp >= 0xFF01 && cp <= 0xFF5E) {
      result.push(String.fromCharCode(cp - 0xFEE0))
      i++
      continue
    }

    // Full-width space → regular space
    if (cp === 0x3000) {
      result.push(' ')
      i++
      continue
    }

    // Non-breaking space and other Unicode space variants
    if (cp === 0x00A0 || (cp >= 0x2002 && cp <= 0x200A) || cp === 0x202F || cp === 0x205F) {
      result.push(' ')
      i++
      continue
    }

    // Smart/curly quotes → straight quotes
    if (cp === 0x201C || cp === 0x201D) {
      result.push('"')
      i++
      continue
    }
    if (cp === 0x2018 || cp === 0x2019) {
      result.push("'")
      i++
      continue
    }

    // Various dashes → hyphen-minus
    if (cp === 0x2013 || cp === 0x2014 || cp === 0x2212) {
      result.push('-')
      i++
      continue
    }

    // Mathematical bold/italic (supplementary plane) → ASCII
    if (isSupplementary) {
      // Bold uppercase A-Z (1D400-1D419)
      if (cp >= 0x1D400 && cp <= 0x1D419) {
        result.push(String.fromCharCode(0x41 + (cp - 0x1D400)))
        i += 2; continue
      }
      // Bold lowercase a-z (1D41A-1D433)
      if (cp >= 0x1D41A && cp <= 0x1D433) {
        result.push(String.fromCharCode(0x61 + (cp - 0x1D41A)))
        i += 2; continue
      }
      // Bold digits 0-9 (1D7CE-1D7D7)
      if (cp >= 0x1D7CE && cp <= 0x1D7D7) {
        result.push(String.fromCharCode(0x30 + (cp - 0x1D7CE)))
        i += 2; continue
      }
      // Italic uppercase A-Z (1D434-1D44D)
      if (cp >= 0x1D434 && cp <= 0x1D44D) {
        result.push(String.fromCharCode(0x41 + (cp - 0x1D434)))
        i += 2; continue
      }
      // Italic lowercase a-z (1D44E-1D467)
      if (cp >= 0x1D44E && cp <= 0x1D467) {
        result.push(String.fromCharCode(0x61 + (cp - 0x1D44E)))
        i += 2; continue
      }
    }

    // Kangxi Radicals (2F00-2FD5) → CJK Unified Ideographs
    if (cp >= 0x2F00 && cp <= 0x2FD5) {
      const mapped = CJK_RADICAL_MAP[cp]
      if (mapped) {
        result.push(mapped)
        i++
        continue
      }
    }

    result.push(text[i])
    i++
  }

  return result.join('')
}
