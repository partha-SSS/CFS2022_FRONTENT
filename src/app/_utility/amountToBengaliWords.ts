export function AmountToBengaliWords(amount: number): string {
  const bengaliNumbers = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দো', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'ঊনিশ'];

  const units = [
    { value: 10000000, name: 'কোটি' },
    { value: 100000, name: 'লক্ষ' },
    { value: 1000, name: 'হাজার' },
    { value: 100, name: 'শত' }
  ];

  if (amount === 0) return 'শূন্য';

  let result = '';
  for (const unit of units) {
    const unitValue = Math.floor(amount / unit.value);
    if (unitValue > 0) {
      result += convertBelowThousand(unitValue) + ' ' + unit.name + ' ';
      amount = amount % unit.value;
    }
  }

  if (amount > 0) {
    result += convertBelowThousand(amount);
  }

  return result.trim();

  function convertBelowThousand(num: number): string {
    let word = '';
    if (num > 99) {
      word += bengaliNumbers[Math.floor(num / 100)] + ' শত ';
      num %= 100;
    }

    if (num > 19) {
      word += tens[Math.floor(num / 10)] + ' ';
      if (num % 10 > 0) {
        word += bengaliNumbers[num % 10];
      }
    } else if (num >= 10) {
      word += teens[num - 10];
    } else if (num > 0) {
      word += bengaliNumbers[num];
    }

    return word.trim();
  }
}
