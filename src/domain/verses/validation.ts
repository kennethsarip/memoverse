import type { CustomVerseInput, CustomVerseValidation } from './types';

const MAX_REFERENCE_LENGTH = 80;
const MAX_TEXT_LENGTH = 2000;

/**
 * Validate the free-text "add a custom verse" form (Section 7, Phase 1.6).
 * Both fields are required and whitespace-only input does not count, so a
 * user cannot add a blank placeholder verse. Errors are short and user-safe
 * (Section 10: never surface raw internals to users).
 */
export function validateCustomVerseInput(input: CustomVerseInput): CustomVerseValidation {
  const reference = input.reference.trim();
  const text = input.text.trim();
  const errors: CustomVerseValidation['errors'] = {};

  if (!reference) {
    errors.reference = 'Add a reference, like "John 3:16".';
  } else if (reference.length > MAX_REFERENCE_LENGTH) {
    errors.reference = `Keep the reference under ${MAX_REFERENCE_LENGTH} characters.`;
  }

  if (!text) {
    errors.text = 'Paste or type the verse text.';
  } else if (text.length > MAX_TEXT_LENGTH) {
    errors.text = `Keep the verse under ${MAX_TEXT_LENGTH} characters.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
