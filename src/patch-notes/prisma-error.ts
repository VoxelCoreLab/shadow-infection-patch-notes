function prismaCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return undefined;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return prismaCode(error) === 'P2002';
}

export function isRecordNotFoundError(error: unknown): boolean {
  return prismaCode(error) === 'P2025';
}
