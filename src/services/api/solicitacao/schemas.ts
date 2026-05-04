import { z } from 'zod'

export const updateUnidadeConsumidoraSchema = z.object({
  unidade_consumidora: z
    .string()
    .min(1, { message: 'Digite a unidade consumidora!' })
    .transform(value => {
      let newValue = value
      if (newValue.startsWith('10/')) {
        newValue = newValue.slice(3)
      }
      return newValue.replace(/\D/g, '')
    }),
})
