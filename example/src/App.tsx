import { defineComponent, ref, shallowRef, watch, unref, reactive, onMounted } from 'vue'
import { TransformComponent } from 'vue3-zoom-pan-pinch'
import car from './assets/images/car.png';
import './App.scss'

export default defineComponent({
  name: 'App',
  setup() {
    const transformComponentRef = ref(null)
    onMounted(() => {
      console.log(transformComponentRef.value);
    })
    return () => (
      <TransformComponent ref={transformComponentRef} panningEnabled={true} initScale={1} zoomingEnabled={true}>
        <div class="content" >
          <img src={car} />
        </div>
    </TransformComponent>
    )
  },
})
