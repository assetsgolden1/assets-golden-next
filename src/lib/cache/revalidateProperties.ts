import { revalidatePath } from 'next/cache'

export function revalidatePropertyPaths() {
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath('/destinos')
  revalidatePath('/destinos/espana')
}
