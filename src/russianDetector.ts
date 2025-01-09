export function isRussianWord(word: string): boolean {
  const russianChars = /[а-яА-ЯёЁ]/;
  return russianChars.test(word);
}
