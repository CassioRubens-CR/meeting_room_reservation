import { validate } from 'class-validator';
import { LoginDto } from './auth/dto/login.dto';
import { RegisterDto } from './auth/dto/register.dto';
import { CreateReservationDto } from './reservations/dto/create-reservation.dto';
import { UpdateReservationDto } from './reservations/dto/update-reservation.dto';
import { CreateRoomDto } from './rooms/dto/create-room.dto';

function getMessages(errors: Awaited<ReturnType<typeof validate>>) {
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('DTO validation messages', () => {
  it('returns a Portuguese message for an invalid login email', async () => {
    const errors = await validate(
      Object.assign(new LoginDto(), {
        email: 'invalid-email',
        password: 'password123',
      }),
    );

    expect(getMessages(errors)).toContain('Informe um e-mail válido');
  });

  it('returns Portuguese messages for missing registration fields', async () => {
    const errors = await validate(new RegisterDto());
    const messages = getMessages(errors);

    expect(messages).toEqual(
      expect.arrayContaining([
        'O nome é obrigatório',
        'O e-mail é obrigatório',
        'A senha é obrigatória',
      ]),
    );
  });

  it('returns a Portuguese message for invalid room capacity', async () => {
    const errors = await validate(
      Object.assign(new CreateRoomDto(), {
        name: 'Sala A',
        capacity: 0,
      }),
    );

    expect(getMessages(errors)).toContain(
      'A capacidade deve ser de pelo menos 1 pessoa',
    );
  });

  it('returns Portuguese messages for invalid reservation fields', async () => {
    const errors = await validate(
      Object.assign(new CreateReservationDto(), {
        roomId: '',
        date: 'invalid-date',
        startTime: '9:00',
        endTime: '25:00',
      }),
    );
    const messages = getMessages(errors);

    expect(messages).toEqual(
      expect.arrayContaining([
        'A sala é obrigatória',
        'Informe uma data válida',
        'O horário inicial deve estar no formato HH:mm',
        'O horário final deve estar no formato HH:mm',
      ]),
    );
  });

  it('rejects an empty reservation update payload', async () => {
    const errors = await validate(new UpdateReservationDto());

    expect(getMessages(errors)).toContain(
      'Informe pelo menos um campo para atualizar a reserva',
    );
  });

  it('accepts a reservation update with at least one field', async () => {
    const errors = await validate(
      Object.assign(new UpdateReservationDto(), { startTime: '10:00' }),
    );

    expect(errors).toHaveLength(0);
  });
});
