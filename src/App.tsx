import './App.scss'
import { defineComponent, ref, shallowRef, watch, unref, reactive } from 'vue'
// import { useImage } from './hooks'
import TransformComponent from './components/TransformComponent'
// import zoom_in from "./assets/images/zoom-in.svg";
// import zoom_out from "./assets/images/zoom-out.svg";
// import zoom_reset from "./assets/images/zoom-reset.svg";
import car from './assets/images/car.png';


export default defineComponent({
  name: 'App',
  setup() {
    const transformComponentRef = ref(null)

    return () => (
      <>
        <TransformComponent ref={transformComponentRef}>
          <div class="content">
            <img src={car} />
          </div>
        </TransformComponent>
      </>
    )
  },
})
