export default <TValue>(value: TValue | null | undefined): value is TValue => {
  return value !== null && value !== undefined;
};
