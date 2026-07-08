import { BIBLE_BOOKS, findBook } from '@/domain/bible';

describe('BIBLE_BOOKS', () => {
  it('has the full 66-book Protestant canon, 39 Old + 27 New, in order', () => {
    expect(BIBLE_BOOKS).toHaveLength(66);
    expect(BIBLE_BOOKS.filter((book) => book.testament === 'old')).toHaveLength(39);
    expect(BIBLE_BOOKS.filter((book) => book.testament === 'new')).toHaveLength(27);
    expect(BIBLE_BOOKS[0].name).toBe('Genesis');
    expect(BIBLE_BOOKS[38].name).toBe('Malachi');
    expect(BIBLE_BOOKS[39].name).toBe('Matthew');
    expect(BIBLE_BOOKS[65].name).toBe('Revelation');
  });

  it('every book has a positive chapter count', () => {
    for (const book of BIBLE_BOOKS) {
      expect(book.chapterCount).toBeGreaterThan(0);
    }
  });

  it('matches the book names used by seeded scripture_refs', () => {
    for (const name of ['Genesis', 'Psalm', 'Philippians', 'John']) {
      expect(BIBLE_BOOKS.some((book) => book.name === name)).toBe(true);
    }
  });
});

describe('findBook', () => {
  it('finds a book by exact name', () => {
    expect(findBook('John')?.chapterCount).toBe(21);
  });

  it('returns undefined for an unknown name', () => {
    expect(findBook('Not A Book')).toBeUndefined();
  });
});
