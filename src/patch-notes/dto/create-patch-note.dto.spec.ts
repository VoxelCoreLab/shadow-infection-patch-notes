import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePatchNoteDto } from './create-patch-note.dto.js';

describe('CreatePatchNoteDto', () => {
  async function errorsFor(plain: Record<string, unknown>) {
    const dto = plainToInstance(CreatePatchNoteDto, plain);
    return validate(dto);
  }

  it('accepts Major.Minor.Patch', async () => {
    const errors = await errorsFor({
      version: '1.2.3',
      title: 'Balance',
      content: 'Damage down.',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects version outside Major.Minor.Patch', async () => {
    const errors = await errorsFor({
      version: 'v1.2',
      title: 'Balance',
      content: 'Damage down.',
    });
    expect(errors.some((error) => error.property === 'version')).toBe(true);
  });

  it('rejects empty title or content', async () => {
    const errors = await errorsFor({
      version: '1.2.3',
      title: '',
      content: '',
    });
    expect(errors.map((error) => error.property).sort()).toEqual([
      'content',
      'title',
    ]);
  });
});
