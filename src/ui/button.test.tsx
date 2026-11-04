import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Lock } from 'lucide-react';
import Button from './button';
import IconButton from './icon_button';

describe('native button behavior', () => {
  test('ordinary buttons never submit a parent form implicitly', () => {
    expect(renderToStaticMarkup(<Button>Open dialog</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<Button as="button">Next</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<IconButton icon={Lock} aria-label="Lock" />)).toContain('type="button"');
  });

  test('form actions submit only when explicitly requested', () => {
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"');
    expect(renderToStaticMarkup(<IconButton icon={Lock} aria-label="Apply" type="submit" />)).toContain('type="submit"');
  });
});
