export type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
};

export type PublicReservationStatus =
  | 'UPCOMING'
  | 'ACTIVE'
  | 'CANCELLED'
  | 'PAST';
