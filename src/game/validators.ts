/** 氏名：姓と名の間に全角スペース必須 */
export function validateName(v: string, label = '氏名'): string | null {
  if (!v.trim()) return `${label}を入力してください。`;
  if (v.includes(' ')) return `${label}のスペースは全角で入力してください。`;
  if (!/^\S+　\S+$/.test(v)) return `${label}は姓と名の間に全角スペースを入れて入力してください。`;
  return null;
}

/** フリガナ：全角カタカナ＋全角スペース */
export function validateKana(v: string): string | null {
  if (!v.trim()) return 'フリガナを入力してください。';
  if (/[ぁ-ゖ]/.test(v)) return 'フリガナは全角カタカナで入力してください。';
  if (/[ｦ-ﾟ]/.test(v)) return 'フリガナに半角カタカナは使用できません。全角カタカナで入力してください。';
  if (v.includes(' ')) return 'フリガナのスペースは全角で入力してください。';
  if (!/^[ァ-ヶー]+　[ァ-ヶー]+$/.test(v)) return 'フリガナはセイとメイの間に全角スペースを入れ、全角カタカナで入力してください。';
  return null;
}
