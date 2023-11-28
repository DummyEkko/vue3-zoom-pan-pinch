# vue3-zoom-pan-pinch

> Super fast and light vue3 npm package for zooming, panning and pinching html elements in easy way

pinch is under development 🤔️


### en

- [ ] zoom
- [ ] pan
- [ ] pinch


## Development

```bash
pnpm install

pnpm --filter example run dev

```

## Props of TransformComponent


| Props                  |           Type |
| :--------------------- | -------------: |
| initScale              |         Number |
| maxScale               | Number or null |
| minScale               | Number or null |
| disabled               |        Boolean |
| limitToBounds          |        Boolean |

| panningEnabled         |         Boolean|
| enableZoomedOutPanning |        Boolean |

| zoomingEnabled         |         Boolean|
| zoomInSensitivity      |         Number |
| zoomOutSensitivity     |         Number |
| dbClickSensitivity     |         Number |

| pinchEnabled           |         Boolean|
| pinchSensitivity       |         Number |

