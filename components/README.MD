# vue3-zoom-pan-pinch

> Super fast and light vue3 npm package for zooming, panning and pinching html elements in easy way


## Install

```bash
npm install --save vue3-zoom-pan-pinch
```

or

```bash
yarn add vue3-zoom-pan-pinch
```


## Usage

```jsx
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
        </TransformComponent>
        <footer>
          <button onClick={transformComponentRef.value?.resetTransform}>reset</button>
        </footer>
      </div>
    );
  },
});

```


## Props of TransformComponent

| Props            | Default |     Type |
| :--------------- | :-----: | -------: |
| defaultPositionX |  0      |   number |
| defaultPositionY |  0      |   number |
| defaultScale     |  1      |   number |
| options          |  {...}  |   object |
| wheel            |  {...}  |   object |
| pan              |  {...}  |   object |
| pinch            |  {...}  |   object |


#### Options prop elements

| Props            | Default |         Type |
| :--------------- | :-----: | -----------: |
| disabled         |  false  |      boolean |
| minPositionX     |  null   | null, number |
| maxPositionX     |  null   | null, number |
| minPositionY     |  null   | null, number |
| maxPositionY     |  null   | null, number |
| minScale         |    1    |       number |
| maxScale         |    8    |       number |
| limitToBounds    |  true   |      boolean |
| centerContent    |  true   |      boolean |

#### Wheel prop elements

| Props                | Default |    Type |
| :------------------- | :-----: | ------: |
| disabled             |  false  | boolean |
| step                 |   6.5   |  number |
| wheelEnabled         |  true   | boolean |
| touchPadEnabled      |  true   | boolean |
| disableLimitsOnWheel |  true   | boolean |

#### Pan prop elements

| Props                | Default |    Type |
| :------------------- | :-----: | ------: |
| disabled             |  false  | boolean |
| lockAxisX            |  false  | boolean |
| lockAxisY            |  false  | boolean |
| limitToWrapperBounds |  false  | boolean |

#### Pinch prop elements

| Props    | Default |    Type |
| :------- | :-----: | ------: |
| disabled |  false  | boolean |
| step     |    1    |  number |



