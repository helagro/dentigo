declare module 'qrcode' {
    export function toCanvas(
        canvas: HTMLCanvasElement,
        text: string,
        options?: QRCodeOptions,
        callback?: (error: Error) => void,
    ): Promise<void>
}

interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    typeNumber?: number
    margin?: number
    scale?: number
    cells?: boolean
    shapeRendering?: 'crispEdges' | 'optimizeSpeed' | 'geometricPrecision'
    imageShape?: 'circle' | 'square' | 'heart' | 'diamond'
    hideEdges?: boolean
}
