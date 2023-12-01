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
    // const n = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    return () => (
      <div>
        <TransformComponent
          ref={transformComponentRef}
          defaultScale={1.2}
          defaultPositionX={10}
          defaultPositionY={20}
          wheel={{
            step: 1,
          }}
        >
          <div class="content">
            <img src={car} />
          </div>
          {/* <div class="wrp">
          <span>not nested element</span>
          <div class="test-container">
            {n.value.map((item) => (
              <div class="test-item">Nested flex item { item }</div>
            ))}
          </div>
        </div> */}
        </TransformComponent>
        <footer>
          <button onClick={transformComponentRef.value?.resetTransform}>reset</button>
        </footer>
      </div>
    );
  },
});
