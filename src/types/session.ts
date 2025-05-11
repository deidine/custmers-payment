export type Session = {
  id: number;
  uuid: string;
  userUuid: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionCreateDTO = Omit<Session, "id" | "createdAt" | "updatedAt">;

export type SessionUpdateDTO = Partial<Session>;
