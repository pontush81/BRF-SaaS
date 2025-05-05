/**
 * Type definitions for @testing-library/jest-dom
 * Detta åtgärdar TypeScript-fel med matchers som toBeInTheDocument(), toHaveTextContent(), osv.
 */

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveStyle(css: Record<string, any> | string): R;
      toHaveValue(value: string | string[] | number): R;
      toBeRequired(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toBeInTheDOM(): R;
    }
  }
}
