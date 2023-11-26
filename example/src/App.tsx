import { defineComponent, ref, shallowRef, watch, unref, reactive } from 'vue'
import { TransformComponent } from 'vue3-zoom-pan-pinch'
import car from './assets/images/car.png';
import './App.scss'

export default defineComponent({
  name: 'App',
  setup() {
    const transformComponentRef = ref(null)

    return () => (
      <TransformComponent ref={transformComponentRef}>
      <div class="content">
        <img src={car} />
      </div>
    </TransformComponent>
    )
  },
})
