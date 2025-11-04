/**
 * TailwindCSS 兼容的主题检测工具
 *
 * 检测 HTML 元素的 class 是否包含 dark 或以 dark 结尾的 class（如 theme-dark）
 * 用于自动确定当前应用的主题模式
 */

/**
 * 检测当前是否为 dark 模式
 * @returns {boolean} 是否为 dark 模式
 */
export function isDarkMode(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const htmlElement = document.documentElement;
  const htmlClass = htmlElement.className || '';

  // 检测是否有 dark class 或以 dark 结尾的 class
  const classes = htmlClass.split(/\s+/);

  return classes.some((cls) => cls === 'dark' || cls.endsWith('-dark'));
}

/**
 * 获取当前主题模式
 * @returns {'light' | 'dark'} 当前主题模式
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return isDarkMode() ? 'dark' : 'light';
}