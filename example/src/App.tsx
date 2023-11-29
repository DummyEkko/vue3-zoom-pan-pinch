import {
  defineComponent,
  ref,
  shallowRef,
  watch,
  unref,
  reactive,
  onMounted,
} from "vue";
import { TransformComponent } from "vue3-zoom-pan-pinch";
import car from "./assets/images/car.png";
import "./App.scss";

export default defineComponent({
  name: "App",
  setup() {
    const transformComponentRef = ref(null);
    const n = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    onMounted(() => {
      console.log(transformComponentRef.value);
    });
    return () => (
      <TransformComponent
        ref={transformComponentRef}
        panningEnabled={true}
        initScale={1}
        zoomingEnabled={true}
        limitToBounds={false}
      >
        {/* <div class="content" >
          <img src={car} />
        </div> */}
        <div class="wrp">
          <span>not nested element</span>
          <div class="test-container">
            {/* <img src={car}  /> */}
            {n.value.map((item) => (
              <div class="test-item">Nested flex item { item }</div>
            ))}
          </div>
        </div>
      </TransformComponent>
    );
  },
});
