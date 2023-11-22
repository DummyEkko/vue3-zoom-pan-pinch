import { ShallowRef, ref, watch, shallowRef, Ref } from 'vue'

export function useImage(file: ShallowRef<File | undefined>):  [Ref<HTMLImageElement>, Ref<boolean>] {

  const isLoaded = ref(false)
  const image = ref(new Image())

  watch(file, () => {
    if (file.value) {
      image.value.onload = null
      image.value.onload = () => {
        isLoaded.value = true
      }
      isLoaded.value = false
      image.value.src = URL.createObjectURL(file.value)
    }
  })


  return [image, isLoaded]
}
