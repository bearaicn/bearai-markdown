interface SearchInput {
  focus(): void;
  select(): void;
}

export async function focusDocumentSearchPanel({
  showPanel,
  waitForPanel,
  findInput,
}: {
  showPanel: () => void;
  waitForPanel: () => Promise<void>;
  findInput: () => SearchInput | null;
}): Promise<boolean> {
  showPanel();
  await waitForPanel();
  const input = findInput();
  if (!input) return false;
  input.focus();
  input.select();
  return true;
}
