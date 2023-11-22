import './App.scss'
import { defineComponent, ref, shallowRef, watch, unref, reactive } from 'vue'
import { useImage } from './hooks'
import TransformComponent from './components/TransformComponent'

interface Line {
  pts: { x: number; y: number }[]
}

interface Snapshot {
  pts: { x: number; y: number }[]
}

export default defineComponent({
  name: 'App',
  setup() {
    const canvasRef = ref<CanvasRenderingContext2D>()
    const file = shallowRef<File>()
    const [img, isLoaded] = useImage(file)
    // const scale = ref(1)
    const pointerDown = ref(false)
    const lines = ref<Line[]>([{ pts: [] }])
    const snapshot = shallowRef<Snapshot[]>([])
    const scale = ref(1)
    const isClip = ref(false)
    const startPos = reactive({
      startX: 0,
      startY: 0,
    })

    async function startWithDemoImage() {
      const imgBlob = await fetch(`/demo.jpg`).then(r => r.blob())
      file.value = new File([imgBlob], `demo.jpg`, { type: 'image/jpg' })
      console.log(file.value)
    }

    watch([isLoaded], val => {
      if (!canvasRef.value) return
      canvasRef.value.canvas.width = img.value.width
      canvasRef.value.canvas.height = img.value.height
      const rW = window.innerWidth / img.value.width
      const rH = window.innerHeight / img.value.height
      scale.value = Math.min(rH, rW)
      canvasRef.value.drawImage(img.value, 0, 0)
    })

    startWithDemoImage()

    function getRef(r: HTMLCanvasElement) {
      const ctx = r.getContext('2d')
      if (ctx) {
        canvasRef.value = ctx as CanvasRenderingContext2D
      }
    }

    function onPointerdown(e: PointerEvent) {
      console.log(e)
      pointerDown.value = true
      startPos.startX = e.offsetX
      startPos.startY = e.offsetY
    }

    function onPointermove(e: PointerEvent) {
      if (pointerDown.value) {
        const canvas = unref(canvasRef)?.canvas
        if (!canvas) return
        const px = e.offsetX - canvas.offsetLeft
        const py = e.offsetY - canvas.offsetTop
        onPaint(px, py)
      }
    }

    function onPointerup() {
      pointerDown.value = false
      const curLine = lines.value.at(-1)
      if (curLine) snapshot.value.push(curLine)
      lines.value.push({ pts: [] })
    }

    function drawLines(
      ctx: CanvasRenderingContext2D,
      lines: Line[],
      color = 'rgba(255, 0, 0, 0.5)'
    ) {
      ctx.strokeStyle = color
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      lines.forEach(line => {
        if (!line?.pts.length) {
          return
        }
        ctx.lineWidth = 20
        ctx.beginPath()
        ctx.moveTo(line.pts[0].x, line.pts[0].y)
        line.pts.forEach(pt => ctx.lineTo(pt.x, pt.y))
        ctx.stroke()
      })
    }

    function drawRect(currentX, currentY) {
      const ctx = unref(canvasRef)
      if (!ctx) {
        return
      }
      // 绘制当前矩形框
      const { startX, startY } = startPos
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.drawImage(img.value, 0, 0)
      const width = currentX - startX
      const height = currentY - startY
      ctx.beginPath()
      ctx.rect(startX, startY, width, height)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'blue'
      ctx.stroke()
      ctx.closePath()
    }

    function draw() {
      const context = unref(canvasRef)
      if (!context) {
        return
      }
      const currentLine = lines.value[lines.value.length - 1]
      drawLines(context, [currentLine])
    }

    const onPaint = (px: number, py: number) => {
      if (isClip.value) {
        drawRect(px, py)
        return
      }
      const currLine = lines.value[lines.value.length - 1]
      currLine.pts.push({ x: px, y: py })
      draw()
    }
    return () => (
      <div id="transform-wrapper">pi
        <TransformComponent>
          {({ zoomIn, zoomOut }) => {
            // console.log(p)
            return (
              <>
                <canvas
                  ref={getRef}
                  onPointerdown={onPointerdown}
                  onPointermove={onPointermove}
                  onPointerup={onPointerup}
                ></canvas>
              </>
            )
          }}
        </TransformComponent>
      </div>
    )
  },
})
