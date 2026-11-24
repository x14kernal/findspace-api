import z from 'zod';

export const roomIdParamSchema = z.object({ roomId: z.uuid() });

export const createRoomSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  code: z.string().trim().min(1).max(25),
  pricePerHour: z
    .string()
    .trim()
    .regex(/^\d{1,10}(\.\d{1,2})?$/)
    .refine((v) => Number(v) > 0),
  capacity: z.number().int().min(1).max(200),
  floorNumber: z.number().int().min(1).max(100),
  widthM: z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d{1,2})?$/)
    .refine((v) => Number(v) > 0),
  lengthM: z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d{1,2})?$/)
    .refine((v) => Number(v) > 0),
});
