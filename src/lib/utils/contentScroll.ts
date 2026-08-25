export function getContentScrollElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".content-main");
}

export function getContentScrollTop(): number {
  return getContentScrollElement()?.scrollTop ?? 0;
}

export function getContentScrollHeight(): number {
  return getContentScrollElement()?.scrollHeight ?? 0;
}

export function getContentClientHeight(): number {
  return getContentScrollElement()?.clientHeight ?? 0;
}

export function scrollContentTo(options: ScrollToOptions | number): void {
  const scroller = getContentScrollElement();
  if (!scroller) return;
  if (typeof options === "number") scroller.scrollTo(0, options);
  else scroller.scrollTo(options);
}

export function scrollContentBy(options: ScrollToOptions | number): void {
  const scroller = getContentScrollElement();
  if (!scroller) return;
  if (typeof options === "number") scroller.scrollBy(0, options);
  else scroller.scrollBy(options);
}
